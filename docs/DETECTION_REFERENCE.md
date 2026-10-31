# FluxHunt — Detection Reference

Every detector in FluxHunt (version 2.1): what triggers it, its default severity, the MITRE ATT&CK
technique it maps to, and guidance on false positives. Thresholds shown are for **Normal**
sensitivity; **High** roughly halves them and **Low** roughly doubles them. All detectors can be
toggled off in **⚙ Settings → Detection**.

> **Read every finding as a lead, not a verdict.** These are heuristics demonstrated on synthetic
> traffic. Validate against known-good baselines and correlate with host evidence before acting.
> Use the **allowlist** to suppress trusted infrastructure.

---

## Reconnaissance

| Detector | Trigger (Normal) | Severity | ATT&CK | False-positive notes |
|---|---|---|---|---|
| Port scan | One source probes ≥ 15 distinct ports on one host | medium / high if open ports found | T1046 | Authorised vulnerability scanners and monitoring tools. |
| Network / host sweep | One source hits one port on ≥ 10 hosts | medium / high | T1046 | Asset discovery, patch scanners, load balancers' health checks. |
| Ping sweep | ≥ 10 distinct ICMP echo targets from one source | medium | T1018 | Network monitoring, `fping`-style availability checks. |
| Stealth-flag probes | ≥ 5 packets with NULL / XMAS / SYN+FIN / FIN-only flag sets | medium | T1046 | Broken NICs/middleboxes occasionally emit odd flags; rare. |
| ARP scan | One MAC requests ≥ 50 distinct target IPs | medium | T1046 | Network management/discovery tools (`arp-scan`, nmap `-PR`). |

## Denial of service

| Detector | Trigger | Severity | ATT&CK | Notes |
|---|---|---|---|---|
| SYN flood | ≥ 100 SYNs to one `host:port` from ≥ 20 sources, or < 20% completing handshakes | medium / high | T1498 | Flash crowds and benign load spikes; distinguish by handshake-completion ratio. |

## Spoofing / man-in-the-middle

| Detector | Trigger | Severity | ATT&CK | Notes |
|---|---|---|---|---|
| ARP spoofing | One IP announced by ≥ 2 MAC addresses | high | T1557.002 | NIC failover, bonding, VRRP/HSRP; confirm against the switch CAM table. |
| Unsolicited ARP replies | ≥ 10 ARP replies with no matching request | high | T1557.002 | Some stacks send periodic unsolicited ARP; a stream is the concern. |
| Gratuitous ARP burst | ≥ 20 gratuitous ARPs for one IP | medium | T1557.002 | Normal after boot/failover; a stream can also mean an IP conflict. |
| ICMP redirects | Any ICMP redirect observed | medium | T1557 | Legitimate only from real routers; most hosts should ignore them. |
| Rogue IPv6 RA | Router advertisements from ≥ 2 sources | medium | T1557 | Multiple legitimate routers; otherwise mitm6-style attacks. |
| Rogue DHCP | DHCP responses from ≥ 2 servers | high | T1557 | Redundant DHCP servers; confirm which are authorised. |
| TTL inconsistency | One source's packets span ≥ 32 in initial TTL | low | T1557 | NAT, load balancers, and VPNs; otherwise spoofing. |

## Covert channels

| Detector | Trigger | Severity | ATT&CK | Notes |
|---|---|---|---|---|
| DNS tunnelling | ≥ 10 long/high-entropy subdomain queries under one base domain | high | T1071.004 | Some CDNs and anti-bot services use long encoded labels. |
| ICMP tunnelling | ≥ 5 echo packets carrying ≥ 256 B of data | medium | T1095 | Large pings for MTU testing; inspect the payload. |
| DNS-over-HTTPS | ≥ 3 TLS connections to a known public DoH resolver | low | T1572 | Legitimate privacy use; a concern only if DoH is against policy. |

## Command & control

| Detector | Trigger | Severity | ATT&CK | Notes |
|---|---|---|---|---|
| Beaconing (fixed / jittered / rotating) | ≥ 8 connections to a peer with a narrow, uniform inter-arrival band (robust skew + MAD + band-width test); rotating = one server name across several IPs | high (external) / medium | T1071 | Update pollers, telemetry, SaaS keep-alives, NTP, monitoring agents all beacon legitimately. The single most false-positive-prone detector — baseline first. |
| DGA / high NXDOMAIN | ≥ 20 NXDOMAIN answers to one host and ≥ 30% of its answers failing, across many distinct names | medium | T1568.002 | Typo storms, dead CDNs, misconfigured clients. |
| Known-malicious JA3 | Client TLS fingerprint matches a built-in known-bad list (e.g. Cobalt Strike default) | high | T1071 | JA3 collisions exist; corroborate with destination and behaviour. |
| Reverse-shell / inbound C2 | External host connects *in* to an internal host on a non-service port with data exchanged | medium | T1571 | Legitimate inbound services on odd ports; confirm the listener is intended. |

## Malware delivery

| Detector | Trigger | Severity | ATT&CK | Notes |
|---|---|---|---|---|
| Executable / script download | Carved HTTP object has an executable magic (MZ/ELF/Mach-O/MSI/…) or executable URL extension; or the declared Content-Type contradicts the real type | high (external) / medium | T1105 | Legitimate software downloads and updates. Pivot the SHA-256 in VirusTotal. |

## Lateral movement

| Detector | Trigger | Severity | ATT&CK | Notes |
|---|---|---|---|---|
| SMB administrative access | DCE/RPC pipes (svcctl/atsvc/winreg/drsuapi/…) or admin shares (ADMIN$/C$) over SMB | high (admin pipes) / medium | T1021.002, T1569.002 | Legitimate for management/admin hosts; suspicious from workstations. |

## Credential access & exposure

| Detector | Trigger | Severity | ATT&CK | Notes |
|---|---|---|---|---|
| NTLM authentication captured | NTLMSSP type-3 (authenticate) message over SMB/HTTP/LDAP/MSSQL | high | T1557.001 | Expected during normal Windows auth; the finding records that a crackable/relayable hash traversed the wire. |
| Kerberoasting | ≥ 10 TGS requests with ≥ 5 using RC4 encryption | medium | T1558.003 | Legacy apps that still request RC4 tickets. |
| High Kerberos AS-REQ volume | ≥ 20 AS-REQ with no TGS | low | T1558.004 | Batch logons; correlate with KDC logs (4768/4771). |
| Brute force | ≥ 20 separate auth-service connections from one source | medium / high | T1110 | Health checks, reconnecting clients, scanners. |
| Cleartext credentials | USER/PASS or HTTP Basic over an unencrypted service | medium | T1040 | None — this is a real exposure; rotate the credential. |
| Secrets / PII in cleartext | AWS keys, tokens, JWTs, private keys, passwords, or Luhn-valid card numbers in cleartext payloads | high (keys/cards) / medium | T1040 | Pattern matches can false-positive on random strings; verify the sample. |
| SNMP community string | SNMP v1/v2c community other than default `public` | medium | T1040 | Monitoring tools; still an exposure (move to SNMPv3). |

## Suspicious TLS

| Detector | Trigger | Severity | ATT&CK | Notes |
|---|---|---|---|---|
| Suspicious certificate | Self-signed, expired, or SNI↔subject-CN mismatch | medium (self-signed, external) / low | T1573 | Internal services, dev environments, and captive portals use self-signed certs. |
| Obsolete TLS version | ServerHello selects a version below TLS 1.2 | low | T1573 | Legacy devices; a hygiene issue more than an attack. |

## Suspicious connection

| Detector | Trigger | Severity | ATT&CK | Notes |
|---|---|---|---|---|
| Suspicious port | Established connection on a known backdoor/C2 port (4444, 1337, 31337, 6667, Tor ports, …) | medium (external) / low | T1571 | Legitimate use of these ports is rare but possible. |

## Data exfiltration

| Detector | Trigger | Severity | ATT&CK | Notes |
|---|---|---|---|---|
| Large outbound transfer | Internal→external upload ≥ 5 MB, or ≥ 1 MB with a ≥ 10:1 out:in ratio | high / medium | T1048 | Backups, cloud sync, uploads, CI/CD, video calls. Confirm the destination is sanctioned. |

## Infrastructure

| Detector | Trigger | Severity | ATT&CK | Notes |
|---|---|---|---|---|
| Fast-flux DNS | One domain resolves to ≥ 5 IPs with TTL ≤ 300 s | medium | T1568.001 | Large CDNs behave identically; check whether the IPs are one provider or scattered. |
| DNS rebinding | A public-looking domain resolves to a private address | low | T1583.001 | Split-horizon DNS produces this legitimately. |
| Look-alike domain | Punycode (`xn--`) or mixed-script/homoglyph domain queried | low | T1583.001 | Legitimate internationalised domains exist; render to Unicode and compare. |
| Multiple resolvers | One host queries ≥ 4 different DNS resolvers | low | — | VPNs, DoH probing, or misconfiguration. |

## Evasion

| Detector | Trigger | Severity | ATT&CK | Notes |
|---|---|---|---|---|
| HTTP CONNECT tunnel | HTTP CONNECT requests through a proxy | low | T1090 | Legitimate forward proxies; confirm the proxy and targets are sanctioned. |
| Protocol on non-standard port | HTTP/TLS/SSH detected on an unexpected port | low / medium (SSH) | T1571 | Internal services on custom ports; use **decode-as** to confirm. |
| Heavy fragmentation | ≥ 50 fragmented IP packets from one source | low | T1205 | MTU/MSS issues; compare path MTU before suspecting evasion. |

## Network health (expert info)

| Detector | Trigger | Severity | Notes |
|---|---|---|---|
| High TCP retransmissions | ≥ 15% of a flow's ≥ 20 data segments retransmitted | low | A performance/path issue, not necessarily security. |
| TCP zero-window | ≥ 3 zero-window events on a flow | info | The receiving application/host could not keep up. |

## Traffic anomaly & integrity

| Detector | Trigger | Severity | Notes |
|---|---|---|---|
| Traffic burst | Packet rate spikes well above the capture median | low | Only meaningful when it lines up with another finding. |
| Malformed packets | Headers that could not be parsed | low | Usually capture truncation; occasionally crafted. |
| Unsupported link type | Packets on a link type FluxHunt does not decode | info | Counted but not analysed. |

## Threat-intel match

| Detector | Trigger | Severity | Notes |
|---|---|---|---|
| Watchlist hit | A user-supplied IP, domain, or SHA-256 appears in the capture | high | A confirmed match against your own indicators — never suppressed by the allowlist. |

---

## MITRE ATT&CK coverage

Every actionable finding is tagged with a technique, and the report includes a tactic → technique
coverage matrix you can export as an **ATT&CK Navigator layer** (Indicators → export → ATT&CK
Navigator). The mapping is a best-effort association between each detector and the most
representative technique — it is reporting structure and triage guidance, not attribution.
