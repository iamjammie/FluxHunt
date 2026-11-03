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

### Off-thread parsing
Parsing, decoding, and analysis run in a **Web Worker**, so the interface stays responsive (with a
live progress line) even on a large capture. It falls back to the main thread automatically where
Web Workers aren't available. Nothing about this touches the network — it's still one self-contained
file.

---

## 2. The views (tabs)

The tabs follow an analyst's flow — **orientation → briefing → report → detail** — and a freshly
analysed capture opens on **Overview**:

**Overview · Expert · IR Report · Findings · Attack Map · Hosts · Sessions · Indicators · Objects · Packets**

Switch views with the tab bar, by pressing `g` then a letter (see shortcuts), or from the search
palette. The current view is stored in the URL hash (e.g. `#expert`) so it can be bookmarked.

### Overview
- **Timeline analysis** — a packets-over-time strip you can **drag** to select a time window. Then
  **Filter packets** scopes the Packets tab to that window, or **Analyze window** re-runs *every
  detector* on just that slice (a banner shows the active window with **Return to full capture**).
  **Zoom to selection** rescales the strip for fine selection.
- **Packets over time** and **Throughput (bytes/s)** charts.
- **Statistics** — a packet-length distribution and a DNS **service-response-time** table (per
  resolver: responses, average and max latency).
- **Expert info · TCP health** — totals for retransmissions, out-of-order, duplicate ACKs,
  zero-window, resets, and median handshake RTT, plus the 20 worst flows.
- **Protocol hierarchy** tree, plus protocols, destination ports, top talkers, top conversations,
  DNS domains, and TLS server names.

### Expert
An at-a-glance incident briefing aimed at an IR manager or CISO:
- An **overall risk verdict** (Critical / High / Elevated / Low / Clean) with the headline.
- **Answer cards** — confirmed incident? affected internal hosts, external infrastructure,
  credentials exposed? data exfiltration? malware delivered? active C2/beaconing? lateral movement?
  reconnaissance? — each colour-coded and clickable through to the relevant findings.
- **ATT&CK tactics observed**, **prioritised immediate actions**, and a Wireshark-style **network
  expert-info** panel (retransmissions, zero-window, out-of-order, duplicate ACKs, resets, RTT) with
  coloured severity dots.

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
- A **force-directed network/attack graph**: hosts **labelled** and sized by traffic, coloured by
  role (red = external C2/exfil/malware, orange = internal host in a finding, amber = other flagged
  external, teal = internal, grey = external); a red ring marks high severity. Conversation edges are
  weighted by volume and carry a **direction arrow** for the dominant flow; malicious edges are
  highlighted. **Drag** nodes, **scroll** to zoom, **hover** for detail, **click** a host for its
  host view. Controls: **Fit** (frame all), **Freeze** (pause layout), **Labels** (auto/all/off),
  **Save PNG**. Click a legend role to hide it; a stats bar reports shown/total hosts, links,
  flagged and C2 counts (and any truncation), and a **"mapped hosts as a table"** view lists them.
- **Attack chain** — a full-width horizontal **progressive timeline** of the reconstructed
  kill-chain: numbered, phase-coloured stage markers joined by a progress bar, each with its phase,
  time and title. Hover for a rich tooltip (severity, category, hosts, ATT&CK); click to filter to
  that finding.
- **Findings by category** — a donut beside ranked per-category bars (count + share, click to filter)
  with a severity-breakdown chip row.

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

### Objects
Files **reconstructed from the traffic** — cleartext **HTTP, FTP and TFTP** transfers. Each row shows
the filename, the transfer method (**Via**), type, size, endpoints, source URL, and SHA-256.
**Download** any object, or **Download all (ZIP)** with a CSV manifest. Executables and archives are
flagged and gated behind a confirmation. (Encrypted TLS and SMB transfers are not extracted.)

### Packets
A filterable packet list with full decode and hex on click.

- **Filter grammar:** `ip: src: dst: port:(N or LO-HI) proto: n:1,2,3 after: before: contains:
  matches:(regex)`, combined with space / `&&` (AND), `||` / `or` (OR), and `!` (NOT) — e.g.
  `ip:10.0.0.5 && port:443 || proto:icmp`, `matches:\.exe$`, `port:1-1024 !proto:udp`.
- **Analyst notes:** click a packet to expand its decode and hex, and add a note. Noted packets show
  a 💬 marker; notes are exported as `packet-notes.csv` in the case package.
- **Colour rules:** define filter-expression → colour highlight rules in **⚙ Settings**; matching
  packets are tinted (first match wins).
- **Exports:** **Save as .pcap** / **Save anonymized .pcap** (of the current filter), **Copy CSV**.

---

## 3. Host view

Clicking any host IP opens a consolidated panel: zone, hostname(s) and OS (if recovered), network /
region enrichment, packet and byte totals, active window, its **findings**, and its **sessions**.
**All packets** jumps to the packet list filtered to that host. The IP is click-to-copy.

## 4. Follow Stream

In **Sessions**, click **Stream** on any TCP row. The modal has three tabs:
- **Conversation** — the reassembled transcript (by sequence number; overlaps trimmed, gaps
  skipped), **client → server in blue**, **server → client in red**. Toggle **Hex** for a byte view.
  This is how you read cleartext protocols (HTTP, FTP, SMTP, …) end to end.
- **Flow graph** — a Wireshark-style **vertical ladder** of every TCP segment between client and
  server (time flows down): SYN / SYN-ACK / ACK, data segments with lengths, FIN / RST, colour-coded
  (teal = SYN, red = RST, grey = data/ACK).
- **Stream graphs** — **sequence number over time (Stevens)**, **advertised receive window**, and
  **round-trip time** (ACK latency for client→server data), plotted per direction.

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
  - **Import feed file:** load a feed (CSV / STIX / MISP / OpenIOC / plain list); IPs, domains and
    SHA-256 hashes are extracted (defanged forms handled) and merged into the watchlist — **offline,
    no network lookups**.
  - **Allowlist:** IPs, domains, or JA3 hashes to treat as known-good; findings involving them are
    suppressed.
- **Detection** — default sensitivity (Low / Normal / High) and per-category **detector toggles**
  that re-filter the capture instantly. **Decode-as** forces a port to a protocol
  (`8443=tls`, `9001=http`, `5353=dns`).
- **Packet colouring rules** — filter-expression → colour rules that highlight matching packets in
  the Packets tab (first match wins).
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
| **Case package** | IR Report tab | ZIP: report (HTML+MD), IOC CSV + STIX, Zeek logs, ATT&CK Navigator, findings JSON, `packet-notes.csv` (if any), anonymized `.pcap`, attack-map PNG, README |
| **Objects** | Objects tab | Individual carved files, or all as a ZIP with a CSV manifest |
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
| `g` then `o` / `e` / `r` / `f` / `a` / `h` / `s` / `i` / `b` / `p` | Jump to Overview / Expert / Report / Findings / Attack map / Hosts / Sessions / Indicators / Objects / Packets |
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
