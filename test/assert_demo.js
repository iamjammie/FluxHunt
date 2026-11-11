// Assertion-based check of the analyzer on the built-in demo capture.
// The demo generator is not byte-for-byte deterministic, so this checks ranges, detection
// categories and internal consistency, not exact counts.
//   node test/assert_demo.js
'use strict';
const assert = require('assert');
const A = require('../analyzer.js');

const u = A.buildDemoPcap();
const buf = Buffer.from(u.buffer, u.byteOffset, u.byteLength);
const cap = A.parseCapture(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const pkts = cap.packets.map((p, i) => A.decodePacket(p, i));
const res = A.analyze(pkts, cap, { sensitivity: 'normal' });

// Parsing
assert.ok(pkts.length > 5000, `expected a substantial demo capture, got ${pkts.length} packets`);
assert.strictEqual(pkts.filter(p => p.malformed).length, 0, 'demo capture should decode with no malformed packets');
assert.strictEqual(res.summary.packets, pkts.length, 'summary packet count must match decoded packets');

// Findings shape
const SEVS = new Set(['high', 'medium', 'low', 'info']);
for (const f of res.findings) {
  assert.ok(SEVS.has(f.severity), `unknown severity '${f.severity}' in finding "${f.title}"`);
  assert.ok(f.category && f.title && f.summary, 'every finding needs category, title and summary');
  assert.ok(Array.isArray(f.packets), 'finding.packets must be an array');
}
const sumSev = Object.values(res.severity).reduce((a, b) => a + b, 0);
assert.strictEqual(sumSev, res.findings.length, 'severity counts must add up to the findings list');

// Detection coverage: the demo deliberately contains these behaviours.
const cats = new Set(res.findings.map(f => f.category));
for (const want of ['Reconnaissance', 'Spoofing', 'Command and control', 'Lateral movement',
                    'Credential access', 'Cleartext credentials', 'Denial of service', 'Covert channel',
                    'Malware delivery']) {
  assert.ok(cats.has(want), `expected a "${want}" finding in the demo capture`);
}

console.log(`ok: ${pkts.length} packets, ${res.findings.length} findings, ${cats.size} categories`);
