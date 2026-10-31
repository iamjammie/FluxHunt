# Contributing to FluxHunt

Thanks for your interest in improving FluxHunt. It is a single-file, fully offline PCAP
threat-hunting tool, and a few constraints keep it that way — please read these before opening a PR.

## Golden rules

1. **Zero network, zero dependencies.** The shipped app must make no network requests and load no
   external scripts, stylesheets, fonts, or data. Everything is inlined. A PR that adds a CDN script
   or a runtime fetch will not be merged.
2. **Keep the engine DOM-free.** All analysis lives in `analyzer.js` with no DOM access, so it can
   be unit-tested in Node. UI code lives in `page.html`.
3. **Parsers must be defensive.** Any decoder must tolerate truncated or malformed input without
   throwing. Captures are untrusted.
4. **Privacy first.** Never add anything that transmits, phones home, or persists the capture
   outside the user's browser.

## Project layout

```
analyzer.js   engine: parsing, decoding, detection, reporting, exports (pure JS, no DOM)
page.html     UI shell: markup, CSS, presentation JS, with a /*__ANALYZER__*/ placeholder
build.mjs     inlines analyzer.js into page.html -> index.html and FluxHunt.html
test/         Node test harness + synthetic edge-case captures
docs/         documentation
```

## Build & test

```
node build.mjs                      # produce index.html and FluxHunt.html
node test/run_demo.js               # analyse the synthetic demo, print findings
node test/run_demo.js path.pcap     # analyse a specific capture
node test/run_demo.js test/edge.pcapng   # edge-case regression
```

Open `FluxHunt.html` in a browser to test the UI. For the no-network guarantee, test with the
browser forced offline.

## Adding things

- **A detector:** gather any extra per-packet/flow state in `analyze`'s single pass, then
  `add({ category, severity, title, summary, hosts, evidence, advice, packets })`. New categories
  also need an entry in `PHASE`, `ATT` (ATT&CK mapping), and the UI category list. Add a row to
  `docs/DETECTION_REFERENCE.md`.
- **A protocol:** extend `decodeApp` (application) or `decodeL4` (transport/tunnel). Document it in
  `docs/FEATURES.md`.
- **An export:** add a branch to `exportIoCs` and a `<select>` option in the Indicators export
  dropdown.

See `docs/ARCHITECTURE.md` for the full picture.

## Style

Match the surrounding code: no framework, no build tooling beyond `build.mjs`, small focused helpers,
and clear comments explaining *why* a detector fires, not just how.

## Licensing

By contributing you agree your work is released under the project's MIT License.
