# FluxHunt — Architecture

This document explains how FluxHunt is built, how data flows through it, and how to extend it.
It is aimed at contributors.

---

## Design principles

1. **Single file, zero dependencies, zero network.** The shipped app is one self-contained HTML
   file with no external scripts, stylesheets, fonts, or runtime fetches. This is a hard constraint:
   it is what makes the tool safe for sensitive evidence and usable offline / air-gapped.
2. **Everything client-side.** Parsing, decoding, detection, reporting, and exports all run in the
   browser. The capture never leaves the machine.
3. **Engine separate from UI.** All analysis lives in a framework-free engine (`analyzer.js`) with no
   DOM access, so it is testable in Node and reusable. The UI (`page.html`) is a thin presentation
   layer over the engine's plain-data output.

## Repository layout

```
analyzer.js   The engine: capture parsing, protocol decoding, detection, reporting, exports.
              Pure JavaScript, no DOM. Exposes a single global `PacketSentinel`/`FluxHunt` object
              and also `module.exports` for Node tests.
page.html     The UI shell: markup, CSS (token-based theming), and the presentation JavaScript.
              Contains a single `/*__ANALYZER__*/` placeholder, inside a `<script id="fh-engine">`
              whose text the Web Worker reuses (see below).
index.html    The hand-written GitHub Pages landing page (committed; not a build output).
app.html      Build output: page.html with analyzer.js inlined, web fonts kept (hosted; gitignored).
FluxHunt.html Build output: the portable standalone file (full HTML document, web fonts dropped
              so it makes no network requests; committed).
test/         Node test harness and synthetic edge-case captures.
docs/         This documentation.
```

## Build

The build is a trivial inline step (no bundler):

1. Read `analyzer.js`, strip its `module.exports` line.
2. Replace the `/*__ANALYZER__*/` placeholder in `page.html` with the engine source → `app.html`
   (hosted build, web fonts kept).
3. For the portable file, additionally wrap it in a full `<!doctype html>` document and remove the
   Google-Fonts `<link>` (the CSS already declares system-font fallbacks) so the result makes **no**
   network requests → `FluxHunt.html`.

`node build.mjs` does both. `index.html` is **not** generated — it is the hand-written landing page
served by GitHub Pages, which links to `FluxHunt.html`. The engine and UI are kept as separate
readable sources precisely so the engine can be unit-tested without a browser.

## Data flow

```
File(s) ──▶ parseCapture()         framing only: split records, read headers
         ──▶ decodePacket() × N    full per-packet decode (L2→L7), tunnel decap, app parsing
         ──▶ (merge by timestamp, renumber if multiple files)
         ──▶ analyze(pkts, cap, opts)
                 ├─ single streaming pass: per-host / per-flow / per-connection state,
                 │  TCP health (seq tracking), DNS/TLS/HTTP/SMB/Kerberos collectors,
                 │  bounded file carving + certificate reassembly
                 ├─ detectors run over the accumulated state → findings
                 ├─ ATT&CK mapping, timestamps, severity counts
                 └─ builds result: summary, findings, sessions, iocs, artifacts, graph,
                    tcpHealth, protoTree, categories
         ──▶ UI renders the result; interactive views (packet detail, Follow Stream,
             pcap export) use the retained decoded packets + raw capture on the main thread
         (parse→decode→analyze runs in a Web Worker off the main thread; see below)
         ──▶ buildReport(result, meta)  → report object → Markdown/HTML/PDF
         ──▶ exportIoCs(result, format) → STIX/MISP/CSV/Suricata/YARA/Sigma/OpenIOC/CEF/Zeek/Navigator
         ──▶ exportPcap(capture, filter, {anonymize})  → sub-/anonymized .pcap
         ──▶ makeZip(files) → case package
```

The result object is **plain serializable data** (no functions, no DOM nodes), which is what keeps
the engine reusable and the UI decoupled.

## Engine internals (`analyzer.js`)

- **Parsing** — `parseCapture` handles pcap (both byte orders, µs/ns) and pcapng (SHB/IDB/EPB/SPB,
  per-interface timestamp resolution). It only frames packets; it does not decode them.
- **Decoding** — `decodePacket` walks L2 (Ethernet/VLAN/SLL/raw/loopback) → L3 (IPv4/IPv6, options,
  fragments) → L4 (TCP/UDP/ICMP) → L7. Tunnel decapsulation (GRE/VXLAN/GTP-U) and application
  parsing (DNS, HTTP, TLS incl. JA3/JA4/cert DER, SMB, Kerberos/NTLM heuristics, etc.) happen here.
  `setDecodeAs` injects port→protocol overrides.
- **Crypto/format helpers** — small self-contained implementations of MD5 (JA3/JA3S), SHA-1
  (cert thumbprints), SHA-256 (file hashes, JA4), CRC-32 (ZIP), a minimal DER/X.509 parser, a ZIP
  writer, and a pcap writer/anonymiser. No external crypto libraries.
- **Analysis** — `analyze` runs one pass to build per-host, per-conversation, and per-connection
  state (including TCP sequence tracking for expert info and bounded reassembly for file carving and
  certificate extraction), then runs the detectors. Thresholds come from `thresholdsFor(sensitivity)`
  and can be filtered by `options.disabled` (toggles), `options.allow` (allowlist), and
  `options.ioc` (watchlist).
- **Reporting & exports** — `buildReport` / `reportMarkdown`, `exportIoCs`, `exportPcap`, `makeZip`.
- **Demo** — `buildDemoPcap` synthesises a capture exercising every detector; it is also the basis
  of the test harness.

## UI (`page.html`)

- **Theming** — every colour is a CSS custom property defined on `:root`, redefined for dark mode
  (both via `prefers-color-scheme` and an explicit `data-theme`) and for the colourblind-safe
  palette (`data-cb`). Density is `data-density`.
- **Off-thread parsing** — `analyzeInputs` runs the heavy `parseCapture → decodePacket → analyze`
  pipeline in a **Web Worker** (`runInWorker`) so the UI never freezes. The worker is built at
  runtime from a Blob of the inlined engine's **own** source — read from the `<script id="fh-engine">`
  element's `textContent` — plus a small harness, so there is **no code duplication** and the file
  stays self-contained. It posts progress messages and returns the plain-data result (structured
  clone). `analyzeInline` is the identical main-thread fallback used when Workers are unavailable or
  construction is blocked (e.g. a strict CSP).
- **State** — a single `state` object holds the capture, decoded packets, analysis result, the active
  time window, per-packet comments, and view state. `render()` repaints all views from the result;
  `reanalyze()` re-runs the engine when a setting changes while preserving the current view. A
  brushed **time window** re-runs `analyze` on a time-sliced packet subset (`state.fullResult` stashes
  the whole-capture result for "Return to full capture").
- **Views** — each tab is a `.view` element toggled by `showView`, which also routes the URL hash.
  Interactive features (packet detail, Follow Stream, sub-pcap export) read the retained decoded
  packets and raw capture directly.
- **Persistence** — analyst details, settings, theme, and watchlists are stored in `localStorage`
  (wrapped in try/catch; the tool works without it).

## Testing

`test/run_demo.js` parses, decodes, and analyses either the synthetic demo or a supplied capture in
Node and prints findings and summary. Synthetic edge-case captures (`test/edge.pcapng`,
`test/edge_be.pcap`) exercise pcapng/SLL, big-endian nanosecond pcap, VLAN, IPv6, fragments, and
truncation. Because the engine is DOM-free, detector logic is unit-tested without a browser; the UI
is validated with headless-browser runs (including fully offline, to prove the no-network
guarantee).

## Extending it

- **Add a detector:** collect any extra per-packet/flow state in `analyze`'s single pass, then
  `add({...})` a finding in the detector section. Give it a `category` (add to `PHASE`, `ATT`, and
  the UI category list if new) and it automatically flows into Findings, the report, the attack map,
  ATT&CK coverage, and exports.
- **Add a protocol:** extend `decodeApp` (or `decodeL4` for a transport/tunnel). Keep it defensive —
  every parser must tolerate truncated/malformed input without throwing.
- **Add an export:** add a branch to `exportIoCs` (IOC/rule formats) or a new function, and a
  `<select>` option in the Indicators export dropdown.

## What is intentionally not here

- **Live packet capture, continuous monitoring, multi-user authentication/RBAC, live threat-intel
  lookups, SIEM push, multi-GB scale** — these require a server (the browser has no raw-socket
  access and a tab is memory-bound) and are out of scope for a single offline file. Threat intel is
  supported *offline* via feed-file import instead of live lookups.
- **SMB object export** — the Objects tab carves HTTP/FTP/TFTP; SMB2 file reassembly is a planned
  follow-up.
- **TLS payload decryption** (`SSLKEYLOGFILE`) — a large, separate cryptographic module.
