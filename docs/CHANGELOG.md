# FluxHunt — Changelog

All notable changes to FluxHunt. The project is a single-file, fully offline PCAP analyser;
versions track the engine (`analyzer.js`) and UI (`page.html`) together.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/).

---

## Unreleased

### Added
- **Statistics panel** on Overview: a packet-length distribution (bucketed) and a DNS
  service-response-time table (per resolver: responses, average and max latency), scoped to the
  current window when windowed analysis is active.
- **Flow sequence graph & TCP stream graphs.** Follow Stream now has three tabs: **Conversation**
  (the existing transcript/hex), **Flow graph** — a Wireshark-style vertical ladder of every TCP
  segment between client and server (SYN/SYN-ACK/ACK, data with lengths, FIN/RST, colour-coded) —
  and **Stream graphs** — sequence-number-over-time (Stevens), advertised receive window, and
  best-effort round-trip time (ACK latency) plotted per direction.
- **Richer packet filters.** The packet-filter grammar gained `contains:`, `matches:`/`regex:`
  (regular expressions), port ranges (`port:1-1024`), and boolean `||` / `or` (OR across groups,
  with space / `&&` as AND and `!` as NOT).
- **Custom colouring rules.** Define filter-expression → colour rules in Settings; matching packets
  are highlighted in the Packets tab (first match wins).
- **Packet comments.** Click a packet to add an analyst note; a 💬 marker shows on commented
  packets and the notes are exported as `packet-notes.csv` in the case package.
- **Expert tab (IR / CISO briefing).** A dedicated tab that answers the questions an incident
  responder or CISO asks first: an overall risk verdict (Critical/High/Elevated/Low/Clean) and
  colour-coded answer cards — confirmed incident, affected internal hosts, external infrastructure,
  credentials exposed, data exfiltration, malware delivered, active C2/beaconing, lateral movement,
  reconnaissance — plus the ATT&CK tactics observed, prioritised immediate actions, and a
  Wireshark-style network expert-info panel (retransmissions, zero windows, out-of-order, resets,
  RTT). Cards link straight to the relevant findings.
- **Objects tab (export objects).** Files reconstructed from the captured traffic (cleartext HTTP
  transfers) can now be downloaded individually or all at once as a ZIP with a CSV manifest;
  executables and archives are flagged and gated behind a confirmation. The engine now retains the
  carved bytes (up to 1 MB per object), not just the hash.
- **Timeline analysis (brushable window).** The Overview tab has a packets-over-time strip you can
  drag to select a time window. **Filter packets** scopes the Packets tab to the window live;
  **Analyze window** re-runs every detector on only that slice, scoping findings, hosts, sessions,
  the attack map and the report (a banner shows the active window with **Return to full capture**).
  **Zoom to selection** rescales the strip for fine selection. The packet filter also learned
  `after:` / `before:` tokens (seconds from capture start).

### Changed
- **Tabs reordered into an analyst flow:** Overview → Expert → IR Report → Findings → Attack Map →
  Hosts → Sessions → Indicators → Objects → Packets (orientation → briefing → report → detail). A
  loaded capture now opens on Overview, and `g` shortcuts gained `e` (Expert) and `b` (Objects).
- **Attack chain redesigned as a horizontal timeline.** The kill-chain is now a full-width
  progressive bar: numbered, phase-coloured stage markers joined by a progress line, each with its
  phase, time offset and a short title, laid out left-to-right (scrolls when long). Hovering a stage
  shows a rich tooltip (title, severity, category, hosts, ATT&CK technique); clicking filters to that
  finding. Fixes a layout bug where stage text could collapse to one character per line in the old
  cramped half-width panel.
- **Findings-by-category enriched.** The panel is now full-width with the donut beside a ranked set
  of per-category bars (count + share of all findings, click a bar to filter the Findings view), a
  severity-breakdown chip row (high/medium/low/info), and an "Other" slice/row so the donut and the
  counts always reconcile to the true total.
- **Attack map overhaul.** Host nodes are now labelled on-canvas (auto / all / off, legible at any
  zoom); conversation edges are weighted by byte volume and carry a direction arrow showing the
  dominant flow; hovering a host dims everything but its own links. Added **Fit** (auto-frame all
  hosts), **Freeze/Resume** (pause the layout), and a **Labels** toggle.
- **Legend rewritten** into three grouped, self-explanatory sections — Hosts (click a role to
  show/hide it), Encoding (size = volume, red ring = high severity), and Links (normal vs.
  between-flagged, arrow = direction, thickness = bytes).
- **Display validation.** A live stats bar reports shown/total hosts, links, flagged and C2 counts,
  and now surfaces the previously-hidden truncation notice ("top N talkers shown; M more omitted")
  and any hidden host types. Added empty-states for a capture with no mappable hosts and for a
  findings donut with nothing to chart, a zero-width-canvas guard, and an accessible
  **"mapped hosts as a table"** view (click a row to filter that host). Donut legend now shows
  percentages.

## 2.1 — Engine depth, interoperability, and UX

### Added
- **Expert info / TCP health.** Per-connection sequence tracking detects retransmissions,
  out-of-order segments, duplicate ACKs, zero-window events, and resets, and measures handshake RTT.
  New Overview panel and Sessions columns; health findings for heavy retransmission and zero-window.
- **Follow Stream.** Reassembles any TCP conversation by sequence number into a colour-coded
  client/server transcript, with a hex view.
- **Decapsulation.** GRE, VXLAN (with VNI), and GTP-U tunnels are decoded and their inner endpoints
  surfaced.
- **Decode-as.** Force a port to `http`, `tls`, or `dns`.
- **MITRE ATT&CK mapping** on every finding, an ATT&CK coverage matrix in the report, and an
  ATT&CK Navigator layer export.
- **Offline IP enrichment** — RIR region (IANA /8 allocations) and best-effort known-network owner.
- **Threat intelligence** — IOC watchlist (confirmed-hit findings) and allowlists (suppress
  known-good IPs/domains/JA3).
- **Evidence & PCAP ops** — input-file SHA-256 + chain-of-custody section; sub-pcap export of a
  filter; anonymized-pcap export (IPs/MACs rewritten, payloads scrubbed).
- **Interoperability exports** — Zeek logs, ATT&CK Navigator, Sigma, OpenIOC, CEF, packet CSV.
- **Detection depth** — JA3S server fingerprints; cleartext secret/PII scanning; SNMP community
  strings; rogue DHCP; obsolete-TLS-version detection.
- **Visualisation** — protocol-hierarchy tree, throughput (bytes/s) graph, attack-map PNG export,
  colourblind-safe (Okabe-Ito) palette.
- **UX & flow** — global search palette, host drill-down view, sortable tables, click-to-copy
  indicators, active-filter banner, demo-data banner, findings category filter, light/dark/system
  theme and density toggles, keyboard shortcuts, URL-hash deep-linking, built-in help/glossary, and
  a one-click **Case Package (ZIP)** export.

### Changed
- **Rebranded to FluxHunt** ("Hunting threats through traffic patterns") with a new logo and
  tagline.

### Fixed
- Findings cards could be hidden because their wrapper shared the `.view` class that the tab system
  toggles; moved to a dedicated class.
- Changing a setting no longer jumps the user back to the Findings tab (the current view is
  preserved on re-analysis).

## 2.0 — IR reporting, multi-file, and artifact extraction

### Added
- **Multi-file import** merged by timestamp into one incident.
- **IR report** — executive summary, probable attack narrative, timeline, affected assets,
  technical findings, IOC appendix, methodology; export to PDF/HTML/Markdown.
- **Artifact & IOC extraction** — carved files with SHA-256, TLS certificates (DER/X.509 parser),
  captured credentials (NTLM/cleartext), JA3/JA4 fingerprints, asset inventory.
- **Detectors** — malware file downloads, suspicious TLS certificates, NTLM capture, Kerberoasting,
  SMB/DCE-RPC lateral movement, reverse-shell/inbound C2, DoH, HTTP CONNECT, homoglyph domains,
  fast-flux, DNS rebinding.
- **Attack map** — force-directed topology, kill-chain strip, findings donut.
- **IOC exports** — STIX 2.1, MISP, CSV, defanged, Suricata/Snort, YARA.
- **Settings/admin** — analyst identity and TLP, detector toggles, sensitivity, optional local
  workspace lock.

## 1.0 — Core analyser

### Added
- Pure-JavaScript pcap / pcapng parser (all byte orders, µs/ns timestamps; Ethernet, VLAN, SLL,
  raw IP, loopback).
- Protocol decoders for ARP, IPv4/IPv6, TCP/UDP/ICMP, DNS, HTTP, TLS (SNI), and common text
  protocols.
- Baseline detectors — port scans, host/ping sweeps, SYN floods, stealth-flag probes, ARP spoofing,
  DNS tunnelling, DGA/NXDOMAIN, ICMP tunnelling, beaconing (fixed interval), brute force,
  exfiltration, cleartext credentials, protocol-on-odd-port, fragmentation, traffic bursts.
- Overview, Hosts, Sessions, Indicators, and Packets views; drag-and-drop loading; a built-in
  synthetic demo capture; JSON/text export.
- **Jittered and rotating-destination beaconing** detection via robust interval statistics
  (added across the 1.x line).

---

## Roadmap (not yet implemented)

- **Web-Worker parsing** for large captures without blocking the UI (staged — needs a main-thread
  data-flow refactor).
- **TLS payload decryption** via `SSLKEYLOGFILE` (a large, separate crypto module).
- **Server deployment** for live capture, real authentication/RBAC, live threat-intel lookups,
  SIEM push, and multi-gigabyte scale.
