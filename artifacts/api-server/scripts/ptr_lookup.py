"""PTR Lookup — Module 64. Usage: ptr_lookup.py "1.2.3.4" or ptr_lookup.py "domain.com" """
import sys, json, urllib.request, socket

def doh(name: str, rtype: str):
    url = f"https://cloudflare-dns.com/dns-query?name={name}&type={rtype}"
    r = urllib.request.Request(url, headers={"Accept": "application/dns-json", "User-Agent": "SentinelOSINT/1.0"})
    with urllib.request.urlopen(r, timeout=8) as resp:
        return json.load(resp)

def ip_to_arpa(ip: str) -> str:
    parts = ip.split(".")
    if len(parts) == 4:
        return ".".join(reversed(parts)) + ".in-addr.arpa"
    return ""

def ip6_to_arpa(ip6: str) -> str:
    try:
        import ipaddress
        addr = ipaddress.IPv6Address(ip6)
        expanded = addr.exploded.replace(":", "")
        return ".".join(reversed(expanded)) + ".ip6.arpa"
    except Exception:
        return ""

def main():
    print("[MODULE 064] PTR LOOKUP")
    print("[SOURCE]     Cloudflare DNS-over-HTTPS — reverse DNS (PTR) lookup")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No IP or domain supplied.")
        sys.exit(1)

    import re
    is_ip4  = bool(re.match(r"^\d+\.\d+\.\d+\.\d+$", raw))
    is_ip6  = ":" in raw
    is_domain = not is_ip4 and not is_ip6

    if is_domain:
        domain = raw.lower().lstrip("https://").lstrip("http://").split("/")[0]
        print(f"[TARGET]  {domain}  (domain → resolve A → PTR)")
        print()
        try:
            a_data = doh(domain, "A")
            ips = [a.get("data","") for a in a_data.get("Answer",[]) if a.get("type")==1]
            if not ips:
                print("[ERROR] Domain has no A records")
                sys.exit(0)
            print(f"[RESOLVED IPs]  {', '.join(ips)}")
            print()
            for ip in ips:
                raw = ip
                arpa = ip_to_arpa(ip)
                if arpa:
                    ptr_data = doh(arpa, "PTR")
                    ptrs = [a.get("data","").rstrip(".") for a in ptr_data.get("Answer",[]) if a.get("type")==12]
                    print(f"  {ip}  →  {', '.join(ptrs) if ptrs else '(no PTR)'}")
        except Exception as e:
            print(f"[ERROR] {e}")
        sys.exit(0)

    # Direct IP lookup
    print(f"[TARGET]  {raw}")
    print()

    if is_ip4:
        arpa = ip_to_arpa(raw)
        rtype_label = "IPv4"
    else:
        arpa = ip6_to_arpa(raw)
        rtype_label = "IPv6"

    if not arpa:
        print("[ERROR] Could not construct ARPA address")
        sys.exit(1)

    print(f"[ARPA]    {arpa}")
    print()

    try:
        data = doh(arpa, "PTR")
        answers = data.get("Answer", [])
        ptrs = [a.get("data","").rstrip(".") for a in answers if a.get("type") == 12]
        ttls = [a.get("TTL", 0) for a in answers if a.get("type") == 12]
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

    if ptrs:
        print(f"[PTR RECORDS]  {len(ptrs)}")
        for ptr, ttl in zip(ptrs, ttls):
            print(f"  {raw}  →  {ptr}  (TTL={ttl})")
            # Forward-confirm PTR
            try:
                a_data = doh(ptr, "A")
                fwd_ips = [a.get("data","") for a in a_data.get("Answer",[]) if a.get("type")==1]
                match = raw in fwd_ips
                print(f"         Forward confirmed: {'✓' if match else '✗ MISMATCH'}")
                print(f"         Forward IPs: {', '.join(fwd_ips) if fwd_ips else 'none'}")
            except Exception:
                pass
    else:
        print(f"[RESULT]  No PTR record for {raw}")
        print("[INFO]    This IP has no reverse DNS — common for dynamic IPs, less common for servers")

    print()
    print("[DONE] PTR lookup complete.")

if __name__ == "__main__":
    main()
