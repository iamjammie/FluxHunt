import struct, os, socket
here = os.path.dirname(__file__)

def eth(src, dst, etype, payload):
    return bytes.fromhex(dst.replace(':','')) + bytes.fromhex(src.replace(':','')) + struct.pack('>H', etype) + payload

def ipv4(src, dst, proto, payload, ttl=64, flags_frag=0x4000):
    h = struct.pack('>BBHHHBBH4s4s', 0x45, 0, 20+len(payload), 1, flags_frag, ttl, proto, 0, socket.inet_aton(src), socket.inet_aton(dst))
    return h + payload

def ipv6(src, dst, nh, payload):
    return struct.pack('>IHBB', 0x60000000, len(payload), nh, 64) + socket.inet_pton(socket.AF_INET6, src) + socket.inet_pton(socket.AF_INET6, dst) + payload

def tcp(sport, dport, flags, payload=b''):
    return struct.pack('>HHIIBBHHH', sport, dport, 1, 0, 0x50, flags, 65535, 0, 0) + payload

def udp(sport, dport, payload):
    return struct.pack('>HHHH', sport, dport, 8+len(payload), 0) + payload

def dnsq(name):
    q = b''.join(bytes([len(p)]) + p.encode() for p in name.split('.')) + b'\x00'
    return struct.pack('>HHHHHH', 0x1234, 0x0100, 1, 0, 0, 0) + q + struct.pack('>HH', 1, 1)

# --- big-endian nanosecond pcap, Ethernet, with a VLAN-tagged DNS query, an IPv6 TCP SYN, and a truncated trailing record
pkts = []
vlan = struct.pack('>HH', 0x0064, 0x0800)
pkts.append(eth('00:11:22:33:44:55', '66:77:88:99:aa:bb', 0x8100, vlan + ipv4('192.168.1.10', '192.168.1.1', 17, udp(5555, 53, dnsq('www.example.org')))))
pkts.append(eth('00:11:22:33:44:55', '66:77:88:99:aa:bb', 0x86dd, ipv6('2001:db8::10', '2001:db8::1', 6, tcp(40000, 443, 0x02))))
# IPv4 fragment (offset 185)
pkts.append(eth('00:11:22:33:44:55', '66:77:88:99:aa:bb', 0x0800, ipv4('192.168.1.10', '192.168.1.1', 17, b'x'*40, flags_frag=185)))
with open(os.path.join(here, 'edge_be.pcap'), 'wb') as f:
    f.write(struct.pack('>IHHiIII', 0xa1b23c4d, 2, 4, 0, 0, 65535, 1))
    for i, p in enumerate(pkts):
        f.write(struct.pack('>IIII', 1700000000 + i, 500000000, len(p), len(p)) + p)
    f.write(struct.pack('>IIII', 1700000010, 0, 60, 60) + b'\x00' * 10)  # truncated record

# --- pcapng with SLL interface (nanosecond resolution) and an Ethernet interface
def block(btype, body):
    pad = (-len(body)) % 4
    total = 12 + len(body) + pad
    return struct.pack('<II', btype, total) + body + b'\x00' * pad + struct.pack('<I', total)

shb = block(0x0a0d0d0a, struct.pack('<IHHq', 0x1a2b3c4d, 1, 0, -1))
# IDB 0: SLL with if_tsresol = 9 (ns)
idb0 = block(1, struct.pack('<HHI', 113, 0, 65535) + struct.pack('<HH', 9, 1) + b'\x09\x00\x00\x00' + struct.pack('<HH', 0, 0))
# IDB 1: Ethernet default resolution
idb1 = block(1, struct.pack('<HHI', 1, 0, 65535))
sll = struct.pack('>HHH', 0, 1, 6) + bytes.fromhex('001122334455') + b'\x00\x00' + struct.pack('>H', 0x0800) + ipv4('10.1.1.5', '10.1.1.9', 1, struct.pack('>BBHHH', 8, 0, 0, 1, 1) + b'abcdefgh' * 4)
ts_ns = 1700000000 * 10**9 + 123456789
epb0 = block(6, struct.pack('<IIIII', 0, ts_ns >> 32, ts_ns & 0xffffffff, len(sll), len(sll)) + sll)
e2 = eth('00:11:22:33:44:55', '66:77:88:99:aa:bb', 0x0800, ipv4('10.1.1.9', '10.1.1.5', 6, tcp(80, 50000, 0x12)))
ts_us = 1700000001 * 10**6 + 5
epb1 = block(6, struct.pack('<IIIII', 1, ts_us >> 32, ts_us & 0xffffffff, len(e2), len(e2)) + e2)
with open(os.path.join(here, 'edge.pcapng'), 'wb') as f:
    f.write(shb + idb0 + idb1 + epb0 + epb1)
print('wrote edge_be.pcap and edge.pcapng')
