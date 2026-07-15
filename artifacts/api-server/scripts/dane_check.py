"""DANE Check — Module 176. DNS-based Authentication of Named Entities (TLSA records)."""
import sys, socket, struct, re

def dns_query(name, qtype, server="8.8.8.8", timeout=5):
    """Simple raw DNS UDP query."""
    import random
    txid = random.randint(0, 65535)
    flags = 0x0100
    header = struct.pack(">HHHHHH", txid, flags, 1, 0, 0, 0)
    question = b""
    for label in name.rstrip(".").split("."):
        enc = label.encode("ascii","ignore")
        question += struct.pack("B", len(enc)) + enc
    question += b"\x00" + struct.pack(">HH", qtype, 1)
    packet = header + question
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.settimeout(timeout)
        sock.sendto(packet, (server, 53))
        data, _ = sock.recvfrom(4096)
        sock.close()
        return data, txid
    except:
        return None, txid

def parse_dns_rr_name(data, offset):
    """Parse DNS name with pointer compression."""
    labels = []
    visited = set()
    while offset < len(data):
        if offset in visited: break
        visited.add(offset)
        length = data[offset]
        if length == 0:
            offset += 1
            break
        elif length & 0xC0 == 0xC0:
            if offset + 1 >= len(data): break
            ptr = ((length & 0x3F) << 8) | data[offset+1]
            name, _ = parse_dns_rr_name(data, ptr)
            labels.append(name)
            offset += 2
            break
        else:
            offset += 1
            labels.append(data[offset:offset+length].decode("ascii","ignore"))
            offset += length
    return ".".join(labels), offset

def parse_tlsa(rdata):
    """Parse TLSA RDATA: usage(1) selector(1) matching(1) cert_assoc(rest)."""
    if len(rdata) < 3:
        return {}
    usage = rdata[0]
    selector = rdata[1]
    matching = rdata[2]
    cert_assoc = rdata[3:].hex()
    usage_names = {0:"PKIX-TA",1:"PKIX-EE",2:"DANE-TA",3:"DANE-EE"}
    selector_names = {0:"Full cert",1:"SubjectPublicKeyInfo"}
    matching_names = {0:"Full data",1:"SHA-256",2:"SHA-512"}
    return {
        "usage": f"{usage} ({usage_names.get(usage,'?')})",
        "selector": f"{selector} ({selector_names.get(selector,'?')})",
        "matching": f"{matching} ({matching_names.get(matching,'?')})",
        "cert_assoc": cert_assoc[:64] + ("..." if len(cert_assoc) > 64 else ""),
    }

QTYPE_TLSA = 52

def check_tlsa(domain, port=443, proto="tcp"):
    """Look up TLSA record for _port._proto.domain"""
    tlsa_name = f"_{port}._{proto}.{domain}"
    data, txid = dns_query(tlsa_name, QTYPE_TLSA)
    if not data: return tlsa_name, []

    records = []
    # Parse response header
    if len(data) < 12: return tlsa_name, []
    _, flags, qdcount, ancount, _, _ = struct.unpack(">HHHHHH", data[:12])
    offset = 12

    # Skip question section
    for _ in range(qdcount):
        _, offset = parse_dns_rr_name(data, offset)
        offset += 4  # type + class

    # Parse answers
    for _ in range(ancount):
        _, offset = parse_dns_rr_name(data, offset)
        if offset + 10 > len(data): break
        rtype, rclass, ttl, rdlen = struct.unpack(">HHIH", data[offset:offset+10])
        offset += 10
        rdata = data[offset:offset+rdlen]
        offset += rdlen
        if rtype == QTYPE_TLSA:
            records.append(parse_tlsa(rdata))
    return tlsa_name, records

def main():
    print("[MODULE 176] DANE CHECK")
    print("[SOURCE]     Raw DNS UDP query — no API key needed")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  example.com              — check DANE TLSA for port 443")
        print("[USAGE]  mail.example.com:25       — check SMTP TLSA")
        print("[USAGE]  example.com:443,25,587    — check multiple ports")
        sys.exit(0)

    if ":" in raw:
        domain, ports_str = raw.split(":",1)
        ports = [int(p) for p in ports_str.split(",") if p.isdigit()]
    else:
        domain = raw
        ports = [443, 25]

    print(f"[DOMAIN]  {domain}")
    print()

    any_found = False
    for port in ports:
        proto = "tcp"
        tlsa_name, records = check_tlsa(domain, port, proto)
        print(f"[TLSA QUERY]  {tlsa_name}")
        if records:
            any_found = True
            for i, r in enumerate(records, 1):
                print(f"  [RECORD {i}]")
                print(f"    Usage:    {r['usage']}")
                print(f"    Selector: {r['selector']}")
                print(f"    Matching: {r['matching']}")
                print(f"    Cert Hash:{r['cert_assoc']}")
        else:
            print(f"  NO TLSA RECORD")
        print()

    if any_found:
        print("[DANE STATUS]  CONFIGURED — TLSA records present")
        print("[INFO]  MTA-STS or DANE-enabled mail clients will validate the TLS certificate")
        print("[INFO]  DANE provides pinning without CA dependency")
    else:
        print("[DANE STATUS]  NOT CONFIGURED — no TLSA records found")
        print("[INFO]  DANE is optional; TLS verification falls back to CA trust store")
        print("[INFO]  To enable DANE: sign your zone with DNSSEC + add TLSA records")

    print()
    print("[DONE] DANE check complete.")

if __name__ == "__main__":
    main()
