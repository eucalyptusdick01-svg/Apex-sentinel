"""Open Resolver — Module 89. Test if a host is an open DNS resolver."""
import sys, socket, struct, os, time, random

def build_dns_query(domain, qtype=1):
    """Build a raw DNS query packet."""
    txid = random.randint(0, 65535)
    flags = 0x0100  # standard query, recursion desired
    qdcount = 1
    header = struct.pack(">HHHHHH", txid, flags, qdcount, 0, 0, 0)
    question = b""
    for label in domain.rstrip(".").split("."):
        encoded = label.encode("ascii")
        question += struct.pack("B", len(encoded)) + encoded
    question += b"\x00"
    question += struct.pack(">HH", qtype, 1)  # type A, class IN
    return txid, header + question

def send_dns_query(server_ip, domain, port=53, timeout=3):
    """Send DNS query to a specific server and return response."""
    txid, packet = build_dns_query(domain)
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.settimeout(timeout)
        sock.sendto(packet, (server_ip, port))
        data, addr = sock.recvfrom(4096)
        sock.close()
        # Parse response
        if len(data) < 12:
            return None, "Response too short"
        resp_txid, flags, qdcount, ancount, nscount, arcount = struct.unpack(">HHHHHH", data[:12])
        rcode = flags & 0x000F
        if resp_txid != txid:
            return None, "Transaction ID mismatch"
        return {"flags": flags, "rcode": rcode, "ancount": ancount,
                "is_response": bool(flags & 0x8000),
                "recursion_available": bool(flags & 0x0080),
                "raw_len": len(data)}, None
    except socket.timeout:
        return None, "TIMEOUT"
    except Exception as e:
        return None, str(e)

TEST_DOMAINS = ["google.com", "cloudflare.com", "github.com"]

def main():
    print("[MODULE 89] OPEN RESOLVER CHECK")
    print("[SOURCE]    Raw DNS UDP probe — no external API key needed")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  8.8.8.8         — test if IP is an open resolver")
        print("[USAGE]  192.168.1.1     — test local/router DNS resolver")
        print("[USAGE]  example.com     — resolve domain then test IP")
        sys.exit(0)

    target = raw.strip()

    # Resolve domain to IP if needed
    if not target.replace(".","").isdigit():
        try:
            ip = socket.gethostbyname(target)
            print(f"[RESOLVED]   {target} → {ip}")
        except:
            print(f"[ERROR] Cannot resolve {target}")
            sys.exit(1)
    else:
        ip = target

    print(f"[TARGET IP]  {ip}")
    print(f"[PORT]       53/UDP")
    print()

    # Test with multiple domains
    results = []
    print(f"[DNS RESOLUTION TESTS]")
    for domain in TEST_DOMAINS:
        resp, err = send_dns_query(ip, domain)
        if err:
            print(f"  {domain:<25} → ERROR: {err}")
            results.append(("error", domain))
        elif resp:
            is_resolver = resp["is_response"] and resp["recursion_available"] and resp["ancount"] > 0
            ra = "RA=yes" if resp["recursion_available"] else "RA=no"
            rcode_map = {0:"NOERROR",1:"FORMERR",2:"SERVFAIL",3:"NXDOMAIN",5:"REFUSED"}
            rc = rcode_map.get(resp["rcode"], f"RCODE={resp['rcode']}")
            print(f"  {domain:<25} → {rc}  {ra}  answers={resp['ancount']}")
            results.append(("open" if is_resolver else "closed", domain))

    open_count = sum(1 for r,_ in results if r == "open")
    error_count = sum(1 for r,_ in results if r == "error")

    print()
    if open_count >= 2:
        print(f"[RESULT]   OPEN RESOLVER — {open_count}/{len(TEST_DOMAINS)} queries resolved successfully")
        print("[RISK]     HIGH — this server resolves queries for arbitrary external domains")
        print("[ATTACK]   DNS amplification: spoofed-source queries can flood victims with large responses")
        print("[ATTACK]   Cache poisoning: resolver caches can be poisoned with malicious records")
        print("[FIX]      Restrict recursive queries to authorized clients only (ACL)")
        print("[FIX]      Enable Response Rate Limiting (RRL) to mitigate amplification")
        print("[FIX]      Rate-limit or block queries from external IPs")
    elif open_count == 0 and error_count < len(TEST_DOMAINS):
        print(f"[RESULT]   CLOSED — DNS queries refused or not answered from external IP")
        print("[STATUS]   Resolver properly restricted to authorized clients")
    elif error_count == len(TEST_DOMAINS):
        print(f"[RESULT]   NO RESPONSE — port 53 may be closed or filtered")
    else:
        print(f"[RESULT]   PARTIAL — {open_count} of {len(TEST_DOMAINS)} queries answered")

    print()
    print("[DONE] Open resolver check complete.")

if __name__ == "__main__":
    main()
