const A = require('../analyzer.js');
const fs = require('fs');
const file = process.argv[2];
let buf;
if (file) buf = fs.readFileSync(file);
else { const u = A.buildDemoPcap(); buf = Buffer.from(u.buffer, u.byteOffset, u.byteLength); fs.writeFileSync(__dirname + '/demo.pcap', buf); }
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const t0 = Date.now();
const cap = A.parseCapture(ab);
const pkts = cap.packets.map((p, i) => A.decodePacket(p, i));
const res = A.analyze(pkts, cap, { sensitivity: process.argv[3] || 'normal' });
console.log('format', cap.format, 'linktype', cap.linktype, 'packets', pkts.length, 'ms', Date.now() - t0);
console.log('summary', JSON.stringify(res.summary));
console.log('protocols', res.protocols);
console.log('malformed', pkts.filter(p => p.malformed).length);
console.log('--- findings', res.severity);
for (const f of res.findings) console.log(`[${f.severity}] ${f.category}: ${f.title} (${f.packets.length} pkts)\n    ${f.summary}`);
console.log('sample packets:');
for (const p of pkts.slice(0, 8)) console.log(p.n, p.ts.toFixed(3), p.proto, p.src, '->', p.dst, p.info);
