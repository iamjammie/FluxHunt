# FluxHunt — Documentation

Detailed documentation for **FluxHunt**, the single-file, fully offline PCAP threat-hunting and
incident-response tool. For the project overview, quick start, and installation, see the
[main README](../README.md).

## Contents

| Document | What's in it |
|---|---|
| [USER_GUIDE.md](USER_GUIDE.md) | Step-by-step walkthrough of every view, setting, and export, plus keyboard shortcuts. Start here if you want to *use* the tool. |
| [FEATURES.md](FEATURES.md) | The complete catalogue of capabilities — parsing, decoding, detection, artifacts, visualisation, reporting, and exports. |
| [DETECTION_REFERENCE.md](DETECTION_REFERENCE.md) | Every detector: trigger condition, default severity, MITRE ATT&CK mapping, and false-positive guidance. Read this to understand what a finding means. |
| [ARCHITECTURE.md](ARCHITECTURE.md) | How the tool is built, how data flows, the build step, and how to add detectors/protocols/exports. For contributors. |
| [CHANGELOG.md](CHANGELOG.md) | Version history and roadmap. |

## Quick links

- **New here?** → [USER_GUIDE.md](USER_GUIDE.md)
- **"What does this finding mean?"** → [DETECTION_REFERENCE.md](DETECTION_REFERENCE.md)
- **Want to contribute?** → [ARCHITECTURE.md](ARCHITECTURE.md)
- **What can it do?** → [FEATURES.md](FEATURES.md)

## Honest limitations (always worth re-reading)

FluxHunt's detectors are **heuristics** demonstrated on synthetic traffic, it analyses **network
evidence only**, and its enrichment and ATT&CK mappings are **approximate hints, not ground truth**.
Validate findings against known-good baselines and correlate with host logs before acting. See the
[main README](../README.md#privacy-and-honest-limitations) for the full list.
