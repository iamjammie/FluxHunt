<div align="center">

# FluxHunt

**Hunting threats through traffic patterns.**

A single-file, fully offline PCAP threat-hunting and incident-response workbench.

`Version 2.1` · Runtime: any modern browser · Dependencies: **none** · Network calls: **zero**

**[▶ Launch the live demo](https://iamjammie.github.io/FluxHunt/)** · [Documentation](docs/) · [Download `FluxHunt.html`](https://github.com/iamjammie/FluxHunt/releases/latest)

</div>

---

FluxHunt loads one or more packet captures (`.pcap` / `.pcapng`), analyses them **entirely in your
browser**, and turns them into findings, extracted artifacts, indicators of compromise, a visual
attack map, and a shareable incident-response report. Nothing is ever uploaded — the capture is
parsed locally and the application makes **no network requests of any kind**.

The whole tool is one HTML file. Save `FluxHunt.html`, double-click it, and work — no install, no
server, no internet connection. That makes it safe for sensitive evidence and usable in air-gapped
environments.

## What it does

- **Analyses malware traffic.** 35+ detectors across the intrusion kill-chain: reconnaissance,
  C2/beaconing, lateral movement, credential theft, exfiltration, covert channels, and more — each
  mapped to MITRE ATT&CK.
- **Extracts artifacts.** Carves transferred files (with SHA-256), TLS certificates, captured
  credentials, JA3/JA4/JA3S fingerprints, and an asset inventory out of the capture.
- **Visualises the attack.** A force-directed network/attack map, a reconstructed kill-chain, a
  throughput graph, a protocol hierarchy, and expert-info / TCP-health panels.
- **Generates IR reports.** Executive summary, probable attack narrative, timeline, affected-asset
  breakdown, ATT&CK coverage, IOC appendix, and chain-of-custody — exportable to PDF, HTML,
  Markdown, STIX, MISP, Zeek, Suricata, YARA, Sigma, OpenIOC, CEF, and ATT&CK Navigator.
- **Follows streams.** Reassembles any TCP conversation by sequence number into a readable
  client/server transcript.

## Quick start

1. Open `FluxHunt.html` in a browser — download it from the
   [latest release](https://github.com/iamjammie/FluxHunt/releases/latest), or try the
   [live demo](https://iamjammie.github.io/FluxHunt/).
2. It auto-loads a **synthetic demo capture** so you can explore immediately — a yellow banner marks
   it as demo data.
3. Click **Open capture(s)…** or drag one or more `.pcap` / `.pcapng` files onto the window.
4. Review **Findings**, explore the **Attack Map**, and open the **IR Report** tab.
5. Set your analyst name, case ID, and classification under **⚙ Settings** — they appear on every
   report.

Press `?` in the app at any time for the built-in help and keyboard shortcuts.

See the [**User Guide**](docs/USER_GUIDE.md) for a full walkthrough.

## Documentation

| Document | Purpose |
|---|---|
| [README.md](README.md) | This overview and entry point. |
| [USER_GUIDE.md](docs/USER_GUIDE.md) | Step-by-step guide to every view, setting, and export. |
| [FEATURES.md](docs/FEATURES.md) | Complete catalogue of capabilities. |
| [DETECTION_REFERENCE.md](docs/DETECTION_REFERENCE.md) | Every detector: trigger, severity, ATT&CK mapping, false-positive notes. |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | How the tool is built and how to extend it. |
| [CHANGELOG.md](docs/CHANGELOG.md) | Version history. |

## Supported inputs

- **Formats:** `pcap` (both byte orders, microsecond and nanosecond timestamps), `pcapng`
  (multiple interfaces, enhanced/simple packet blocks).
- **Link types:** Ethernet, 802.1Q / QinQ VLAN, Linux cooked (SLL / SLL2), raw IPv4 / IPv6,
  BSD / null loopback.
- **Tunnels decapsulated:** GRE, VXLAN, GTP-U (inner endpoints surfaced).
- **Multiple files** are merged by timestamp and analysed as one incident.

## Privacy and honest limitations

- **Offline and local.** No data leaves the browser. Suitable for sensitive or air-gapped work.
- **Heuristic detection.** Findings are heuristics demonstrated against synthetic traffic.
  Legitimate software (telemetry, update pollers, SaaS keep-alives, CDNs, backups) can resemble
  beaconing, exfiltration, or fast-flux. **Validate against known-good baselines before acting.**
- **Network evidence only.** FluxHunt observes traffic, not endpoint state. Correlate with host
  logs, EDR, and authentication records before concluding.
- **Approximate enrichment.** IP "region" is the responsible RIR from IANA allocations, not
  geolocation; "network owner" is matched against a small built-in list. ATT&CK IDs are a
  best-effort mapping, not attribution.
- **Not included (needs a backend):** live capture, real multi-user authentication / RBAC, live
  threat-intelligence feed lookups, multi-gigabyte scale, continuous monitoring, and Web-Worker
  off-thread parsing.

## Responsible use

FluxHunt is a **defensive** analysis tool for incident responders, SOC analysts, network
engineers, and educators. Use it only on captures you are authorised to analyse.

## Building from source

The repository ships the readable sources and a tiny build step that inlines them into the
single-file app. See [ARCHITECTURE.md](docs/ARCHITECTURE.md#build).

```
# analyzer.js  — the engine (parsing, detection, reporting, exports)
# page.html    — the UI shell with an /*__ANALYZER__*/ placeholder
# index.html   — the GitHub Pages landing page (hand-written, committed)

node build.mjs   # inlines analyzer.js into page.html, producing:
                 #   FluxHunt.html  — the portable single-file app (committed)
                 #   app.html       — the hosted build with web fonts (gitignored)
```

## License

Released under the **MIT License** — see [`LICENSE`](LICENSE).
