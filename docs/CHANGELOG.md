# FluxHunt — Changelog

All notable changes to FluxHunt. The project is a single-file, fully offline PCAP analyser;
versions track the engine (`analyzer.js`) and UI (`page.html`) together.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/).

---

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
