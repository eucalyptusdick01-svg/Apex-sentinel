"""DKIM Check — Module 58. Usage: dkim_check.py "domain.com" or dkim_check.py "selector:google:domain.com" """
import sys, json, urllib.request, re, base64

def doh(name: str, rtype: str):
    url = f"https://cloudflare-dns.com/dns-query?name={name}&type={rtype}"
    r = urllib.request.Request(url, headers={"Accept": "application/dns-json", "User-Agent": "SentinelOSINT/1.0"})
    with urllib.request.urlopen(r, timeout=8) as resp:
        return json.load(resp)

COMMON_SELECTORS = [
    "default", "google", "mail", "dkim", "k1", "k2", "selector1", "selector2",
    "mandrill", "sendgrid", "mailchimp", "mailgun", "smtp", "email", "amazonses",
    "s1", "s2", "key1", "key2", "dkim1", "dkim2", "mx", "protonmail",
]

def lookup_dkim(selector: str, domain: str):
    host = f"{selector}._domainkey.{domain}"
    try:
        data = doh(host, "TXT")
        answers = data.get("Answer", [])
        txts = [a.get("data","").replace('" "', '').strip('"') for a in answers]
        dkim_txts = [t for t in txts if "v=DKIM1" in t or "k=rsa" in t or "p=" in t]
        return dkim_txts, host
    except Exception:
        return [], host

def parse_dkim(record: str):
    tags = {}
    for part in re.split(r";\s*", record):
        if "=" in part:
            k, _, v = part.partition("=")
            tags[k.strip()] = v.strip()
    return tags

def main():
    print("[MODULE 058] DKIM CHECK")
    print("[SOURCE]     Cloudflare DNS-over-HTTPS — RFC 6376 DomainKeys Identified Mail")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip().lower()
    if not raw:
        print("[ERROR] No domain supplied.")
        print("[USAGE] dkim_check.py \"domain.com\"  or  dkim_check.py \"selector:google:domain.com\"")
        sys.exit(1)

    domain = raw.lstrip("https://").lstrip("http://").split("/")[0]

    if raw.startswith("selector:"):
        parts = raw.split(":")
        if len(parts) >= 3:
            selectors = [parts[1]]
            domain = parts[2]
        else:
            selectors = COMMON_SELECTORS
    else:
        domain = raw
        selectors = COMMON_SELECTORS

    print(f"[TARGET]     {domain}")
    print(f"[SELECTORS]  checking {len(selectors)}: {', '.join(selectors[:8])}{'...' if len(selectors) > 8 else ''}")
    print()

    found = []
    for sel in selectors:
        records, host = lookup_dkim(sel, domain)
        if records:
            found.append((sel, host, records))

    if not found:
        print("[RESULT]  No DKIM records found for common selectors")
        print("[INFO]    Try: dkim_check.py \"selector:YOURSEL:domain.com\"")
        print("[RISK]    Without DKIM, email authenticity cannot be verified cryptographically")
        sys.exit(0)

    print(f"[FOUND]  {len(found)} DKIM selector(s)")
    print()
    for sel, host, records in found:
        print(f"[SELECTOR]  {sel}")
        print(f"[HOST]      {host}")
        for rec in records:
            print(f"[RECORD]    {rec[:120]}{'...' if len(rec) > 120 else ''}")
            tags = parse_dkim(rec)
            version = tags.get("v", "?")
            key_type = tags.get("k", "rsa")
            hash_algs = tags.get("h", "all")
            service   = tags.get("s", "*")
            flags     = tags.get("t", "")
            pubkey_b64 = tags.get("p", "")
            print(f"  Version:      {version}")
            print(f"  Key type:     {key_type}")
            print(f"  Hash algs:    {hash_algs}")
            print(f"  Service:      {service}")
            if flags:
                print(f"  Flags:        {flags}  {'(testing mode)' if 'y' in flags else ''}")
            if pubkey_b64:
                try:
                    key_bytes = base64.b64decode(pubkey_b64 + "==")
                    key_bits = (len(key_bytes) - 38) * 8 if len(key_bytes) > 38 else len(key_bytes) * 8
                    print(f"  Key length:   ~{key_bits} bits")
                    if key_bits < 1024:
                        print("  [WARN] Key is too short — vulnerable to factorization!")
                    elif key_bits < 2048:
                        print("  [WARN] 1024-bit key — upgrade to 2048+ recommended")
                    else:
                        print("  [OK]   Key length adequate")
                    print(f"  Key prefix:   {pubkey_b64[:40]}…")
                except Exception:
                    print(f"  Key:          [parse error]")
            elif not pubkey_b64:
                print("  [WARN] Empty public key (p=) — key revoked!")
        print()

    print("[DONE] DKIM check complete.")

if __name__ == "__main__":
    main()
