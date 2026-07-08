"""SPF Check — Module 57. Usage: spf_check.py "domain.com" """
import sys, json, urllib.request, re

def doh(name: str, rtype: str):
    url = f"https://cloudflare-dns.com/dns-query?name={name}&type={rtype}"
    r = urllib.request.Request(url, headers={"Accept": "application/dns-json", "User-Agent": "SentinelOSINT/1.0"})
    with urllib.request.urlopen(r, timeout=8) as resp:
        return json.load(resp)

def get_txt(domain: str):
    data = doh(domain, "TXT")
    txts = []
    for rec in data.get("Answer", []):
        val = rec.get("data", "").strip('"')
        txts.append(val)
    return txts

MECHANISMS = {
    "all":      "catch-all (must be last)",
    "include":  "delegate to another domain's SPF",
    "a":        "domain A record",
    "mx":       "domain MX record",
    "ptr":      "reverse DNS (deprecated)",
    "ip4":      "IPv4 address/range",
    "ip6":      "IPv6 address/range",
    "exists":   "macro-based exists check",
    "redirect": "replace SPF with another domain's",
    "exp":      "explanation (human-readable failure msg)",
}

def parse_spf(spf: str):
    tokens = spf.split()
    version = tokens[0] if tokens else ""
    mechanisms = []
    for tok in tokens[1:]:
        qualifier = "+"
        if tok[0] in "+-~?":
            qualifier = tok[0]
            tok = tok[1:]
        name = tok.split(":")[0].split("/")[0].lower()
        val  = tok[len(name)+1:] if ":" in tok else ""
        mechanisms.append((qualifier, name, val, tok))
    return mechanisms

QUAL_DESC = {"+": "PASS", "-": "FAIL", "~": "SOFTFAIL", "?": "NEUTRAL"}

def main():
    print("[MODULE 057] SPF CHECK")
    print("[SOURCE]     Cloudflare DNS-over-HTTPS — RFC 7208 Sender Policy Framework")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip().lower()
    if not raw:
        print("[ERROR] No domain supplied.")
        sys.exit(1)

    domain = raw.lstrip("https://").lstrip("http://").split("/")[0]
    print(f"[TARGET]  {domain}")
    print()

    try:
        txts = get_txt(domain)
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

    spf_records = [t for t in txts if t.startswith("v=spf1")]

    if not spf_records:
        print("[RESULT]  No SPF record found")
        print("[RISK]    Without SPF, anyone can send email claiming to be from this domain")
        print()
        print("[RECOMMENDED]  Add a TXT record:")
        print(f'  {domain}.  300  IN  TXT  "v=spf1 -all"   (blocks all senders — use if domain sends no email)')
        sys.exit(0)

    if len(spf_records) > 1:
        print(f"[WARN]  Multiple SPF records found ({len(spf_records)}) — this is INVALID per RFC 7208!")
        print()

    for spf in spf_records:
        print(f"[SPF RECORD]")
        print(f"  {spf}")
        print()
        mechanisms = parse_spf(spf)
        print(f"[MECHANISMS]  {len(mechanisms)} tokens")
        dns_lookups = 0
        for qual, name, val, full in mechanisms:
            desc = MECHANISMS.get(name, "unknown")
            q_label = QUAL_DESC.get(qual, qual)
            print(f"  {qual}{name:12s}  [{q_label:8s}]  {desc}")
            if val:
                print(f"               value: {val}")
            if name in ("include", "a", "mx", "ptr", "exists", "redirect"):
                dns_lookups += 1

        print()
        print(f"[DNS LOOKUPS]  {dns_lookups} / 10 max (RFC 7208 §4.6.4)")
        if dns_lookups > 10:
            print("  [WARN] Exceeds 10 DNS lookup limit — SPF will PERMERROR for some verifiers!")

        # Check if -all is present
        all_mechs = [(q, n) for q, n, v, f in mechanisms if n == "all"]
        if all_mechs:
            q, _ = all_mechs[-1]
            label = QUAL_DESC.get(q, q)
            if q == "-":
                print(f"  [VERDICT]  Strict  (-all) — unauthorized senders REJECTED")
            elif q == "~":
                print(f"  [VERDICT]  Soft    (~all) — unauthorized senders SOFTFAIL (may reach inbox)")
            elif q == "?":
                print(f"  [VERDICT]  Neutral (?all) — no assertion (equivalent to no SPF)")
            elif q == "+":
                print(f"  [VERDICT]  [WARN] +all means ANYONE can pass SPF — very dangerous!")
        else:
            print("  [WARN] No 'all' mechanism — record is incomplete")

        # Resolve include: targets
        includes = [(val, full) for _, name, val, full in mechanisms if name == "include" and val]
        if includes:
            print()
            print(f"[INCLUDE TARGETS]  {len(includes)}")
            for inc_domain, _ in includes[:5]:
                try:
                    inc_txts = get_txt(inc_domain)
                    inc_spf = [t for t in inc_txts if t.startswith("v=spf1")]
                    if inc_spf:
                        print(f"  {inc_domain:40s}  ✓  {inc_spf[0][:60]}")
                    else:
                        print(f"  {inc_domain:40s}  ✗  No SPF at include target!")
                except Exception:
                    print(f"  {inc_domain:40s}  ?  lookup failed")
    print()
    print("[DONE] SPF check complete.")

if __name__ == "__main__":
    main()
