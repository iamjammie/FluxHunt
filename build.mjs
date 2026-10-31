#!/usr/bin/env node
/*
 * FluxHunt build — inlines the engine into the UI shell to produce the single-file app.
 *
 *   node build.mjs
 *
 * Outputs:
 *   index.html      page.html with analyzer.js inlined (keeps the web-font <link>; used for hosting)
 *   FluxHunt.html   the portable standalone file: a full HTML document with NO network requests
 *                   (the Google-Fonts <link> is removed; CSS already declares system-font fallbacks)
 *
 * There is no bundler and there are no dependencies — the engine and UI are kept as separate
 * readable sources so the engine can be unit-tested in Node without a browser.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const PLACEHOLDER = '/*__ANALYZER__*/';

const ui = readFileSync('page.html', 'utf8');
let engine = readFileSync('analyzer.js', 'utf8');
// strip the Node-only export so it doesn't run in the browser
engine = engine.replace(/\nif \(typeof module !== 'undefined'\) module\.exports = FluxHunt;\s*$/, '\n');

if (!ui.includes(PLACEHOLDER)) {
  console.error('Build error: page.html is missing the ' + PLACEHOLDER + ' placeholder.');
  process.exit(1);
}

// 1) hosted build — keep as-is (web fonts allowed).
// NOTE: use a function replacement so `$` sequences in the engine source (e.g. $&, $', template
// literals) are inserted literally rather than interpreted as replacement patterns.
const hosted = ui.replace(PLACEHOLDER, () => engine);
writeFileSync('index.html', hosted);

// 2) portable build — full document, zero network
let body = hosted
  .replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>\n?/g, '')
  .replace('<title>FluxHunt</title>\n', '')
  .replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '');

const portable = '<!doctype html>\n<html lang="en">\n<head>\n'
  + '<meta charset="utf-8">\n'
  + '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
  + '<meta name="description" content="FluxHunt — offline single-file PCAP threat-hunting and incident-response tool.">\n'
  + '<title>FluxHunt</title>\n'
  + '<style>:root{color-scheme:light}html,body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n'
  + '</head>\n<body>\n' + body + '\n</body>\n</html>\n';
writeFileSync('FluxHunt.html', portable);

// sanity: the portable file must not reference any remote resource except the OpenIOC XML namespace (a string, never fetched)
const remote = [...portable.matchAll(/https?:\/\/[^\s"')]+/g)].map(m => m[0])
  .filter(u => !u.startsWith('http://schemas.mandiant.com'));
if (remote.length) { console.error('Build warning: portable file references remote resources:', [...new Set(remote)]); }

console.log('Built index.html (' + (hosted.length / 1024 | 0) + ' KB) and FluxHunt.html (' + (portable.length / 1024 | 0) + ' KB).');
