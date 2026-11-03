# FluxHunt — Feature Catalogue

A complete list of what FluxHunt can do (version 2.2). For how to use each feature see
[USER_GUIDE.md](USER_GUIDE.md); for detector specifics see
[DETECTION_REFERENCE.md](DETECTION_REFERENCE.md).

---

## Capture parsing

- **Formats:** `pcap` (little- and big-endian; microsecond and nanosecond timestamps) and `pcapng`
  (section header, interface description, enhanced packet, simple packet blocks; multiple
  interfaces; per-interface timestamp resolution).
- **Link types:** Ethernet, 802.1Q and QinQ VLAN, Linux cooked capture SLL and SLL2, raw IPv4/IPv6,
  BSD/null loopback.
- **Resilience:** tolerates truncated files, snaplen-truncated packets, and malformed frames without
  crashing; counts and reports them.
- **Multi-file merge:** several captures are merged by absolute timestamp, renumbered, and analysed
  as a single incident, with a per-file breakdown.

## Protocol decoding

- **L2/L3:** Ethernet, ARP, IPv4 (options, fragmentation), IPv6 (extension headers, fragments).
- **L4:** TCP (flags, sequence/ack, window), UDP, ICMP, ICMPv6.
- **Tunnels (decapsulation):** GRE, VXLAN (with VNI), GTP-U — inner source/destination/protocol
  extracted.
- **Application:** DNS / mDNS / LLMNR, HTTP (request/response, headers, body entropy), TLS
  (SNI, JA3, JA4; ServerHello JA3S; X.509 certificate parsing via a built-in DER parser),
  FTP, POP3, IMAP, SMTP, Telnet, SSH, SMB/SMB2, DHCP, NTP, SNMP, SSDP, NBNS, QUIC (detection),
  Syslog, Kerberos (type/etype heuristics), NTLMSSP.
- **Decode-as:** force any port to `http`, `tls`, or `dns`.

## Detection engine

35+ detectors across these categories (full list and triggers in
[DETECTION_REFERENCE.md](DETECTION_REFERENCE.md)):

- **Reconnaissance** — TCP port scan, network/host sweep, ping sweep, stealth-flag probes
  (NULL/XMAS/FIN).
- **Denial of service** — SYN flood (incl. spoofed-source).
- **Spoofing / MitM** — ARP cache poisoning, unsolicited/gratuitous ARP, ARP scan, ICMP redirects,
  rogue IPv6 router advertisements, rogue DHCP servers, TTL inconsistencies.
- **Command & control** — beaconing (fixed interval, jittered sleep, and rotating-destination),
  DGA/NXDOMAIN storms, known-malicious JA3, reverse-shell / inbound C2.
- **Covert channels** — DNS tunnelling, ICMP tunnelling, DNS-over-HTTPS.
- **Malware delivery** — executable/script downloads (carved and SHA-256 hashed), content-type vs
  magic-byte mismatch.
- **Lateral movement** — SMB admin shares and DCE/RPC named pipes (svcctl/atsvc/winreg/drsuapi…).
- **Credential access** — NTLM/Net-NTLMv2 capture, Kerberoasting, AS-REP/brute-force patterns.
- **Credential exposure** — cleartext FTP/HTTP-Basic logins, secrets/PII in cleartext (AWS keys,
  tokens, JWTs, private keys, passwords, payment-card numbers), SNMP community strings.
- **Suspicious TLS** — self-signed/expired certs, SNI↔CN mismatch, obsolete TLS versions.
- **Data exfiltration** — large asymmetric outbound transfers.
- **Infrastructure** — fast-flux DNS, DNS rebinding, homoglyph/punycode look-alike domains,
  multi-resolver use.
- **Evasion** — HTTP CONNECT tunnels, protocols on non-standard ports, heavy fragmentation.
- **Network health (expert info)** — high retransmissions, zero-window stalls.
- **Threat-intel match** — user IOC watchlist hits.
- **Capture integrity** — malformed and unsupported-link-type packets.

Each finding carries a severity, evidence table, remediation advice, first/last timestamp, the
hosts involved, referenced packets, and a **MITRE ATT&CK** technique.

## Incident briefing (Expert tab)

- **Risk verdict** (Critical / High / Elevated / Low / Clean) with the headline.
- **Answer cards** for the first IR/CISO questions — confirmed incident, affected internal hosts,
  external infrastructure, credentials exposed, data exfiltration, malware delivered, active
  C2/beaconing, lateral movement, reconnaissance — each clickable to its findings.
- **ATT&CK tactics observed**, **prioritised immediate actions**, and a Wireshark-style **network
  expert-info** panel (retransmissions, zero-window, out-of-order, duplicate ACKs, resets, RTT).

## Artifact & object extraction

- **Exported objects** — files carved from cleartext **HTTP, FTP and TFTP** transfers, typed by magic
  bytes, hashed (SHA-256), **downloadable** individually or as a ZIP with a CSV manifest;
  executables/archives flagged; content-type vs magic mismatch detection.
- **TLS certificates** — subject/issuer CN, validity, SHA-1 thumbprint, self-signed flag.
- **Fingerprints** — JA3 and JA4 (client), JA3S (server).
- **Credentials** — Net-NTLMv2, cleartext logins, SNMP community strings.
- **Asset inventory** — hostnames and OS hints from DHCP (and mDNS/NBNS hooks).
- **External IP enrichment** — responsible RIR region (IANA /8 allocations) and best-effort
  known-network owner (Google, Cloudflare, AWS, Azure, Akamai, Fastly, GitHub, Wikimedia, Quad9,
  OpenDNS, Meta, …).

## Visualisation

- **Network / attack map** — force-directed graph with on-canvas host labels, role colouring,
  node size by volume, a high-severity ring; edges weighted by bytes with a **direction arrow**;
  hover isolation; Fit / Freeze / Labels controls; clickable legend roles; a stats/validation bar
  (shown/total hosts, links, flagged, C2, truncation); a mapped-hosts table; PNG export.
- **Attack chain** — a horizontal **progressive kill-chain timeline** with hover detail and
  click-to-filter.
- **Findings by category** — donut plus ranked, clickable per-category bars and a severity chip row.
- **Timeline analysis** — brushable packets-over-time strip to filter or **re-analyse** a time window.
- **Statistics** — packet-length distribution and DNS **service response time** (per resolver).
- **Flow sequence graph** and **TCP stream graphs** (sequence/Stevens, window, RTT) per conversation.
- **Throughput** (bytes/s) chart, **protocol hierarchy** tree, **expert info / TCP health** panel.
- Protocol/port breakdowns, top talkers, conversations, DNS domains, SNI.
- **Colourblind-safe (Okabe-Ito) palette** option; light/dark/system theming; compact density.

## Incident-response reporting

- Executive summary with posture assessment and ranked recommendations.
- Probable attack narrative (kill-chain ordered, per most-affected host).
- Incident timeline, affected-asset breakdown, ATT&CK coverage matrix.
- Technical findings with evidence and ATT&CK IDs.
- IOC appendix with enrichment.
- Methodology & caveats.
- Evidence / chain of custody (input-file SHA-256, tool version, configuration snapshot).
- Analyst identity and TLP classification in the header.

## Follow Stream & packet analysis

- **Follow Stream** — three tabs: **Conversation** (TCP reassembly into a colour-coded client/server
  transcript, with hex), **Flow graph** (Wireshark-style vertical segment ladder), and **Stream
  graphs** (sequence/Stevens, window, RTT).
- **Packet list** — a rich filter grammar (`ip: src: dst: port:(N or LO-HI) proto: n: after: before:
  contains: matches:(regex)` with `&&` / `||` / `!`), full per-packet decode, hex dump, ATT&CK tags.
- **Analyst comments** per packet, exported in the case package (`packet-notes.csv`).
- **Custom colouring rules** — filter → colour highlights in the packet list.

## Exports & interoperability

- **Report:** PDF (print), HTML, Markdown.
- **Case package (ZIP):** report (HTML+MD), IOC CSV + STIX, Zeek logs, ATT&CK Navigator layer,
  findings JSON, anonymized `.pcap`, attack-map PNG, README — all under the case ID.
- **IOCs / rules:** STIX 2.1 bundle, MISP event, CSV, defanged list, Suricata/Snort rules, YARA
  rule, Sigma rule, OpenIOC, CEF (SIEM), Zeek logs (conn/ssl/files), ATT&CK Navigator layer.
- **PCAP operations:** sub-capture export (current filter) and **anonymized** export (IPs/MACs
  rewritten consistently, payloads scrubbed, checksums fixed).
- **Tables:** session and packet CSV.

## Threat intelligence & tuning

- **IOC watchlist** — flag user-supplied IPs/domains/hashes as confirmed hits.
- **Offline feed import** — load a CSV / STIX / MISP / OpenIOC / plain-list feed; IPs, domains and
  SHA-256 hashes are extracted (defanged forms handled) and merged into the watchlist, with no
  outbound lookups.
- **Allowlist** — suppress findings involving known-good IPs/domains/JA3.
- **Detector toggles** — enable/disable any detector category.
- **Sensitivity** — Low / Normal / High, rescaling thresholds.

## Workflow & UX

- Analyst-flow **tab order** (Overview → Expert → Report → … → Packets); opens on Overview.
- **Timeline window** scoping (brush to filter or re-analyse a slice).
- Global **search** command palette.
- **Host view** drill-down (findings + sessions + enrichment).
- **Sortable** tables, **click-to-copy** indicators, **active-filter** banner.
- **URL-hash deep-linking** of views; remembered last view and settings.
- **Keyboard shortcuts** and built-in help/glossary.
- **Demo-data banner** distinguishing synthetic from real captures.

## Privacy & deployment

- 100% client-side; **zero network calls**; nothing uploaded.
- Single self-contained HTML file; runs offline and in air-gapped environments.
- **Off-thread parsing** — parse/decode/analyse run in a Web Worker so the UI stays responsive on
  large captures (with automatic main-thread fallback).
- Optional local workspace passphrase (a privacy screen, not authentication).

## Known limitations

See [README.md](README.md#privacy-and-honest-limitations). In short: heuristic detection,
network-only evidence, approximate enrichment, offline-only threat intel (feed import, not live
lookups), and no live capture / continuous monitoring / real multi-user auth/RBAC / multi-GB scale
(those need the server deployment). SMB object export and TLS payload decryption are not yet
implemented.
