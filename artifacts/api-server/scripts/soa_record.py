"""SOA Record — Module 62. Usage: soa_record.py "domain.com" """
import sys, json, urllib.request
from datetime import datetime

def doh(name: str, rtype: str):
    url = f"https://cloudflare-dns.com/dns-query?name={name}&type={rtype}"
    r = urllib.request.Request(url, headers={"Accept": "application/dns-json", "User-Agent": "SentinelOSINT/1.0"})
    with urllib.request.urlopen(r, timeout=8) as resp:
        return json.load(resp)

def format_time(seconds: int) -> str:
    if seconds < 60:
        return f"{seconds}s"
    if seconds < 3600:
        return f"{seconds//60}m {seconds%60}s"
    if seconds < 86400:
        return f"{seconds//3600}h {(seconds%3600)//60}m"
    return f"{seconds//86400}d {(seconds%86400)//3600}h"

def main():
    print("[MODULE 062] SOA RECORD")
    print("[SOURCE]     Cloudflare DNS-over-HTTPS — Start of Authority record analysis")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip().lower()
    if not raw:
        print("[ERROR] No domain supplied.")
        sys.exit(1)

    domain = raw.lstrip("https://").lstrip("http://").split("/")[0]
    print(f"[TARGET]  {domain}")
    print()

    try:
        data = doh(domain, "SOA")
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

    answers = data.get("Answer", []) + data.get("Authority", [])
    soa_recs = [a for a in answers if a.get("type") == 6]

    if not soa_recs:
        print("[RESULT]  No SOA record found")
        sys.exit(0)

    for rec in soa_recs:
        rdata = rec.get("data", "")
        ttl   = rec.get("TTL", 0)
        parts = rdata.split()
        if len(parts) < 7:
            print(f"[RECORD]  {rdata}")
            continue

        mname   = parts[0].rstrip(".")
        rname   = parts[1].rstrip(".").replace(".", "@", 1)
        serial  = parts[2]
        refresh = int(parts[3])
        retry   = int(parts[4])
        expire  = int(parts[5])
        minttl  = int(parts[6])

        print(f"[PRIMARY NS]   {mname}")
        print(f"[HOSTMASTER]   {rname}  (admin email)")
        print(f"[SERIAL]       {serial}")
        if len(serial) == 10 and serial.isdigit():
            try:
                dt = datetime.strptime(serial[:8], "%Y%m%d")
                print(f"               (date-based: {dt.strftime('%Y-%m-%d')} rev={serial[8:]})")
            except Exception:
                pass
        print(f"[RECORD TTL]   {ttl}s  ({format_time(ttl)})")
        print()
        print(f"[TIMING PARAMETERS]")
        print(f"  Refresh:     {refresh}s  ({format_time(refresh)})  — how often secondary NS polls primary")
        print(f"  Retry:       {retry}s  ({format_time(retry)})    — retry interval after failed refresh")
        print(f"  Expire:      {expire}s  ({format_time(expire)})  — secondary NS gives up after this")
        print(f"  Min TTL:     {minttl}s  ({format_time(minttl)})  — negative cache TTL (RFC 2308)")
        print()

        # Analysis
        print("[ANALYSIS]")
        if refresh < 3600:
            print("  [WARN] Very short refresh interval — high DNS traffic")
        elif refresh > 86400:
            print("  [WARN] Long refresh interval — zone changes may take >1 day to propagate")
        else:
            print(f"  [OK]   Refresh interval reasonable")

        if expire < 604800:
            print("  [WARN] Expire < 7 days — zone may expire quickly if primary unreachable")
        else:
            print(f"  [OK]   Expire interval reasonable")

        if minttl > 3600:
            print("  [INFO] High negative TTL — negative cache entries persist long")
        elif minttl < 60:
            print("  [INFO] Very low negative TTL — faster updates but more traffic")

    print()
    print("[DONE] SOA record lookup complete.")

if __name__ == "__main__":
    main()
