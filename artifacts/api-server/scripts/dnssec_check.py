"""DNSSEC Check — Module 55. Usage: dnssec_check.py "domain.com" """
import sys, json, urllib.request, urllib.error

def fetch_doh(name: str, rtype: str):
    url = f"https://cloudflare-dns.com/dns-query?name={name}&type={rtype}&do=1&cd=0"
    r = urllib.request.Request(url, headers={"Accept": "application/dns-json", "User-Agent": "SentinelOSINT/1.0"})
    with urllib.request.urlopen(r, timeout=8) as resp:
        return json.load(resp)

def check_record(domain: str, rtype: str):
    try:
        data = fetch_doh(domain, rtype)
        answers = data.get("Answer", [])
        auth    = data.get("Authority", [])
        status  = data.get("Status", -1)
        ad_flag = data.get("AD", False)
        return answers, auth, status, ad_flag
    except Exception as e:
        return [], [], -1, False

def main():
    print("[MODULE 055] DNSSEC CHECK")
    print("[SOURCE]     Cloudflare DNS-over-HTTPS  (1.1.1.1) — DNSSEC validation")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip().lower()
    if not raw:
        print("[ERROR] No domain supplied.")
        sys.exit(1)

    domain = raw.lstrip("https://").lstrip("http://").split("/")[0]
    print(f"[TARGET]  {domain}")
    print()

    # DS record at parent
    print("[STEP 1] DS record (delegation signer at parent)...")
    ans, auth, status, ad = check_record(domain, "DS")
    if ans:
        for a in ans:
            print(f"  DS  TTL={a.get('TTL',0)}  {a.get('data','?')}")
        print(f"  AD flag (authenticated): {ad}")
    else:
        print("  No DS record — DNSSEC not configured at parent zone")

    print()

    # DNSKEY at zone apex
    print("[STEP 2] DNSKEY (zone signing keys)...")
    ans2, _, _, ad2 = check_record(domain, "DNSKEY")
    if ans2:
        for a in ans2:
            d = a.get("data","")
            flags = d.split()[0] if d else "?"
            algo  = d.split()[2] if len(d.split()) > 2 else "?"
            key_short = d.split()[-1][:24] + "…" if d.split() else "?"
            print(f"  DNSKEY flags={flags} algo={algo}  key_prefix={key_short}")
        print(f"  AD flag: {ad2}")
    else:
        print("  No DNSKEY records found")

    print()

    # RRSIG on A record
    print("[STEP 3] RRSIG on A record (signature check)...")
    ans3, _, _, ad3 = check_record(domain, "A")
    has_rrsig = False
    try:
        rrsig_data = fetch_doh(domain, "RRSIG")
        rsigs = rrsig_data.get("Answer", [])
        if rsigs:
            has_rrsig = True
            for s in rsigs[:3]:
                print(f"  RRSIG  {s.get('data','?')[:80]}")
    except Exception:
        pass
    if not has_rrsig:
        print("  No RRSIG found for A records")

    print()

    # NSEC/NSEC3
    print("[STEP 4] NSEC3 (authenticated denial of existence)...")
    try:
        nsec3_data = fetch_doh(domain, "NSEC3")
        nsec3 = nsec3_data.get("Answer", [])
        if nsec3:
            print(f"  NSEC3 present — {len(nsec3)} record(s)")
        else:
            nsec_data = fetch_doh(domain, "NSEC")
            nsec = nsec_data.get("Answer", [])
            if nsec:
                print(f"  NSEC (v1) present — {len(nsec)} record(s)")
            else:
                print("  No NSEC/NSEC3 records")
    except Exception:
        print("  NSEC check skipped")

    print()
    # Summary
    dnssec_ok = bool(ans) and bool(ans2)
    print("[SUMMARY]")
    print(f"  DS record:     {'✓' if ans else '✗'}")
    print(f"  DNSKEY:        {'✓' if ans2 else '✗'}")
    print(f"  RRSIG on A:    {'✓' if has_rrsig else '✗'}")
    print(f"  AD flag:       {'✓ Authenticated' if ad or ad2 or ad3 else '✗ Not authenticated'}")
    if dnssec_ok:
        print(f"  [VERDICT]  DNSSEC ENABLED — chain of trust present")
    else:
        print(f"  [VERDICT]  DNSSEC NOT CONFIGURED")
    print()
    print("[DONE] DNSSEC check complete.")

if __name__ == "__main__":
    main()
