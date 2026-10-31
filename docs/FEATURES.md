# FluxHunt — Feature Catalogue

A complete list of what FluxHunt can do (version 2.1). For how to use each feature see
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

## Artifact & IOC extraction

- **Files** — carved from HTTP responses, typed by magic bytes, hashed (SHA-256), with content-type
  mismatch detection.
- **TLS certificates** — subject/issuer CN, validity, SHA-1 thumbprint, self-signed flag.
- **Fingerprints** — JA3 and JA4 (client), JA3S (server).
- **Credentials** — Net-NTLMv2, cleartext logins, SNMP community strings.
- **Asset inventory** — hostnames and OS hints from DHCP (and mDNS/NBNS hooks).
- **External IP enrichment** — responsible RIR region (IANA /8 allocations) and best-effort
  known-network owner (Google, Cloudflare, AWS, Azure, Akamai, Fastly, GitHub, Wikimedia, Quad9,
  OpenDNS, Meta, …).

## Visualisation

- **Network / attack map** — force-directed graph, role-coloured, malicious edges highlighted,
  draggable, zoomable, with PNG export.
- **Attack chain** — reconstructed kill-chain in phase order.
- **Findings donut** by category.
- **Timeline** (packets/s) and **throughput** (bytes/s) charts.
- **Protocol hierarchy** tree.
- **Expert info / TCP health** panel (retransmissions, OOO, dup-ACKs, zero-window, resets, RTT).
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

- **Follow Stream** — TCP reassembly by sequence number into a colour-coded client/server
  transcript, with a hex view.
- **Packet list** — filter DSL, full per-packet decode, hex dump, ATT&CK tags on involved packets.

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
- **Allowlist** — suppress findings involving known-good IPs/domains/JA3.
- **Detector toggles** — enable/disable any detector category.
- **Sensitivity** — Low / Normal / High, rescaling thresholds.

## Workflow & UX

- Global **search** command palette.
- **Host view** drill-down (findings + sessions + enrichment).
- **Sortable** tables, **click-to-copy** indicators, **active-filter** banner.
- **URL-hash deep-linking** of views; remembered last view and settings.
- **Keyboard shortcuts** and built-in help/glossary.
- **Demo-data banner** distinguishing synthetic from real captures.

## Privacy & deployment

- 100% client-side; **zero network calls**; nothing uploaded.
- Single self-contained HTML file; runs offline and in air-gapped environments.
- Optional local workspace passphrase (a privacy screen, not authentication).

## Known limitations

See [README.md](README.md#privacy-and-honest-limitations). In short: heuristic detection,
network-only evidence, approximate enrichment, and no live capture / real auth / live TI /
multi-GB scale / Web-Worker parsing (those need a backend or are a staged follow-up).
