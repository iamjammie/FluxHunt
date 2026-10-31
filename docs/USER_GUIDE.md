# FluxHunt — User Guide

This guide walks through everything FluxHunt does, from loading a capture to generating a report
and exporting evidence. For a one-line description of each capability see [FEATURES.md](FEATURES.md);
for what each finding means see [DETECTION_REFERENCE.md](DETECTION_REFERENCE.md).

---

## 1. Getting started

### Opening the tool
Open `FluxHunt.html` in any modern browser (Chrome, Firefox, Edge, Safari). It runs entirely
locally — there is no server and no internet connection is used.

On first open, FluxHunt loads a **synthetic demo capture** so you can explore every feature. A
yellow **"Demo data"** banner marks it; it is not real traffic. Click **Open a capture** in the
banner, the **Open capture(s)…** button, or drag files onto the window to replace it.

### Loading your own captures
- **Open capture(s)…** or drag-and-drop one or more `.pcap` / `.pcapng` files.
- **Multiple files are merged by timestamp** and analysed together — useful for correlating several
  sensors or time windows into one incident. The capture strip shows a per-file packet breakdown.
- A SHA-256 hash of every input file is computed and recorded in the report's chain-of-custody
  section.

### The capture strip
After analysis, the strip at the top shows the file name(s), format, link type, start time, bytes
on the wire, and tiles for packets, throughput, hosts, sessions, and a findings severity breakdown.

---

## 2. The views (tabs)

Switch views with the tab bar, by pressing `g` then a letter (see shortcuts), or from the search
palette. The current view is stored in the URL hash (e.g. `#findings`) so it can be bookmarked or
shared.

### IR Report
A complete incident-response write-up built from the findings:
- **Executive summary** — posture assessment, headline, severity counts, affected-host count,
  endpoints tied to findings, capture window, and ranked recommended actions.
- **Probable attack narrative** — the most-affected host's findings in phase-and-time order
  (heuristic).
- **Incident timeline**, **affected assets**, **MITRE ATT&CK coverage matrix**, **technical
  findings** (with evidence and ATT&CK IDs), **IOC appendix**, **methodology & caveats**, and
  **evidence / chain of custody**.
- **Exports:** Print / Save as PDF, Copy as Markdown, Copy as HTML, Download HTML, and the one-click
  **Case Package (ZIP)**.

> Set your analyst name, organisation, case ID, and TLP classification in **⚙ Settings** first —
> they appear in the report header and a TLP banner.

### Findings
Every detection as a severity-striped card with a plain-language summary, an evidence table, the
mapped ATT&CK technique, and recommended action. Filter by **severity** (chips) and by **category**
(dropdown). Each card links to **Show packets** and **All traffic for host**.

### Attack Map
- A **force-directed network/attack graph**: hosts sized by traffic, coloured by role (red =
  external C2/exfil/malware, orange = internal host in a finding, amber = other flagged external,
  teal = internal, grey = external). Malicious conversation edges are highlighted. **Drag** nodes,
  **scroll** to zoom, **hover** for detail, **click** a host for its host view. **Save PNG** exports
  the map.
- An **Attack chain** strip — the reconstructed kill-chain in phase order.
- A **Findings by category** donut.

### Overview
- **Packets over time** and **Throughput (bytes/s)** charts.
- **Expert info · TCP health** — totals for retransmissions, out-of-order, duplicate ACKs,
  zero-window, resets, and median handshake RTT, plus the 20 worst flows.
- **Protocol hierarchy** tree.
- **Protocols**, **Destination ports**, **Top talkers**, **Top conversations**, **DNS domains**,
  and **TLS server names**.

### Hosts
Every host with zone, packet/byte counts, DNS query count, finding count, and first/last seen.
Columns are **sortable** (click a header). Click a host to open its **host view**.

### Sessions
One row per TCP connection or UDP exchange, client → server: bytes each way, server name (SNI/Host),
**RTT**, **retransmission** count, duration. Filter with the mini-DSL (`host: src: dst: port:
proto: name: external internal partial`). Each TCP row has a **Stream** button (see Follow Stream).
**Export CSV** dumps the session list.

### Indicators
Extracted artifacts and IOCs across sub-tabs: **IPs** (with network/region enrichment), **Domains**,
**TLS names**, **Files** (carved, with SHA-256 and type), **Certs** (subject/issuer/validity/SHA-1),
**Credentials** (NTLM / cleartext / SNMP), **Fingerprints** (JA3 / JA4 / JA3S), and **Assets**
(hostnames / OS). Click any IP, hash, domain, or fingerprint to **copy** it. Use the **export
dropdown** for STIX / MISP / CSV / defanged / Suricata / YARA / Sigma / OpenIOC / CEF / Zeek /
ATT&CK Navigator.

### Packets
A filterable packet list with full decode and hex on click. Use the filter DSL
(`ip: src: dst: port: proto: n:1,2,3`, `!term` to exclude, or plain text). Buttons: **Save as
.pcap** and **Save anonymized .pcap** (of the current filter), and **Copy CSV**.

---

## 3. Host view

Clicking any host IP opens a consolidated panel: zone, hostname(s) and OS (if recovered), network /
region enrichment, packet and byte totals, active window, its **findings**, and its **sessions**.
**All packets** jumps to the packet list filtered to that host. The IP is click-to-copy.

## 4. Follow Stream

In **Sessions**, click **Stream** on any TCP row. FluxHunt reassembles the conversation by sequence
number (overlaps trimmed, gaps skipped) and shows it as a transcript — **client → server in blue**,
**server → client in red**. Toggle **Hex** for a byte-level view. This is how you read cleartext
protocols (HTTP, FTP, SMTP, etc.) end to end.

## 5. Search (command palette)

Press `/` or click **🔍 Search** to open the palette. Type to search across hosts, domains,
findings, and file hashes. Use `↑`/`↓` and `Enter` to jump straight to a host view, the Indicators
tab, or a highlighted finding.

## 6. Settings & admin (⚙)

- **Analyst & case details** — name, organisation, case/incident ID, and TLP classification. These
  appear on every report.
- **Threat intelligence** —
  - **IOC watchlist:** paste IPs, domains, or SHA-256 hashes (any separator; defanged indicators
    accepted). Matches are flagged as high-severity confirmed hits.
  - **Allowlist:** IPs, domains, or JA3 hashes to treat as known-good; findings involving them are
    suppressed.
- **Detection** — default sensitivity (Low / Normal / High) and per-category **detector toggles**
  that re-filter the capture instantly. **Decode-as** forces a port to a protocol
  (`8443=tls`, `9001=http`, `5353=dns`).
- **Display** — theme (system / light / dark), density (comfortable / compact), and a
  **colourblind-safe palette**.
- **Workspace lock** — an optional passphrase that hides the workspace on this device. **This is a
  privacy screen, not authentication** — the capture is processed locally and a determined local
  user can bypass it. Real multi-user sign-in needs the server deployment.

Settings persist in your browser (localStorage) and never leave it.

## 7. Exports

| What | Where | Formats |
|---|---|---|
| **Report** | IR Report tab | PDF (print), HTML (copy/download), Markdown |
| **Case package** | IR Report tab | ZIP: report (HTML+MD), IOC CSV + STIX, Zeek logs, ATT&CK Navigator, findings JSON, anonymized `.pcap`, attack-map PNG, README |
| **Indicators** | Indicators tab | STIX 2.1, MISP, CSV, defanged, Suricata/Snort, YARA, Sigma, OpenIOC, CEF, Zeek, ATT&CK Navigator |
| **Sub-capture** | Packets tab | `.pcap` of the current filter; anonymized `.pcap` (IPs/MACs rewritten, payloads scrubbed) |
| **Tables** | Sessions / Packets | CSV |
| **Attack map** | Attack Map tab | PNG |

> **Where exports work:** In the downloaded `FluxHunt.html`, Print/PDF and all downloads work. In
> the hosted artifact sandbox, downloads and the print dialog are blocked by the browser — use the
> **Copy** buttons there. For files and PDFs, use the downloaded standalone file.

## 8. Keyboard shortcuts

| Key | Action |
|---|---|
| `/` | Open search |
| `?` | Help & shortcuts |
| `g` then `f` / `o` / `a` / `r` / `h` / `s` / `i` / `p` | Jump to Findings / Overview / Attack map / Report / Hosts / Sessions / Indicators / Packets |
| `Esc` | Close any dialog |
| `↑` / `↓`, `Enter` | Navigate and open search results |

## 9. Reading findings responsibly

FluxHunt's detectors are **heuristics** demonstrated on synthetic traffic. Before acting:
- Validate against your **known-good baselines** — legitimate telemetry, updates, CDNs, and backups
  can look like beaconing, exfiltration, or fast-flux. Use the **allowlist** to suppress known-good
  infrastructure and cut false positives.
- **Correlate with host evidence** (EDR, auth logs). Network data shows behaviour, not endpoint
  state.
- Treat **enrichment and ATT&CK mappings as hints**, not ground truth — RIR region is not
  geolocation, and ATT&CK IDs are a best-effort mapping.
