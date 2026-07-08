"""TXT Records — Module 63. Usage: txt_records.py "domain.com" """
import sys, json, urllib.request, re

def doh(name: str, rtype: str):
    url = f"https://cloudflare-dns.com/dns-query?name={name}&type={rtype}"
    r = urllib.request.Request(url, headers={"Accept": "application/dns-json", "User-Agent": "SentinelOSINT/1.0"})
    with urllib.request.urlopen(r, timeout=8) as resp:
        return json.load(resp)

def classify_txt(txt: str) -> str:
    t = txt.lower()
    if t.startswith("v=spf1"):                         return "SPF"
    if t.startswith("v=dkim1") or "k=rsa" in t:        return "DKIM"
    if t.startswith("v=dmarc1"):                        return "DMARC"
    if t.startswith("v=mtasts"):                        return "MTA-STS"
    if t.startswith("v=tlsrpt"):                        return "TLS-RPT"
    if t.startswith("v=spf") :                          return "SPF (old)"
    if "google-site-verification" in t:                 return "Google Verification"
    if "facebook-domain-verification" in t:             return "Facebook Verification"
    if "ms=" in t and len(t) < 40:                      return "Microsoft Verification"
    if t.startswith("adobe-idp-site-verification"):     return "Adobe Verification"
    if "atlassian-domain-verification" in t:            return "Atlassian Verification"
    if "apple-domain-verification" in t:                return "Apple Verification"
    if "docusign=" in t:                                return "DocuSign Verification"
    if "stripe-verification" in t:                      return "Stripe Verification"
    if "salesforce" in t and "verification" in t:       return "Salesforce Verification"
    if t.startswith("have-i-been-pwned-verification"):  return "HIBP Verification"
    if t.startswith("keybase-site-verification"):       return "Keybase Verification"
    if t.startswith("loaderio="):                       return "Loader.io Verification"
    if "postman-domain-verification" in t:              return "Postman Verification"
    if "miro-verification" in t:                        return "Miro Verification"
    if "globalsign-domain-verification" in t:           return "GlobalSign Verification"
    if "_dmarc" in t:                                   return "DMARC policy"
    if t.startswith("protonmail-verification"):         return "ProtonMail Verification"
    if t.startswith("_domainconnect"):                  return "Domain Connect"
    if t.startswith("ca3-"):                            return "Certificate Authority Record"
    return "Unknown"

def main():
    print("[MODULE 063] TXT RECORDS")
    print("[SOURCE]     Cloudflare DNS-over-HTTPS — all TXT records + classification")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip().lower()
    if not raw:
        print("[ERROR] No domain supplied.")
        sys.exit(1)

    domain = raw.lstrip("https://").lstrip("http://").split("/")[0]
    print(f"[TARGET]  {domain}")
    print()

    subdomains = ["", "_dmarc.", "_mta-sts.", "_domainkey."]
    all_records = []

    for sub in subdomains:
        check = sub + domain
        try:
            data = doh(check, "TXT")
            for a in data.get("Answer", []):
                txt_val = a.get("data","").replace('" "', '').strip('"')
                if txt_val:
                    all_records.append((check, a.get("TTL",0), txt_val))
        except Exception:
            pass

    if not all_records:
        print("[RESULT]  No TXT records found")
        sys.exit(0)

    print(f"[RECORDS]  {len(all_records)} found")
    print()

    by_type = {}
    for host, ttl, val in all_records:
        label = classify_txt(val)
        by_type.setdefault(label, []).append((host, ttl, val))

    for label in sorted(by_type):
        records = by_type[label]
        print(f"[{label}]  ({len(records)} record{'s' if len(records)>1 else ''})")
        for host, ttl, val in records:
            if host != domain:
                print(f"  @ {host}")
            truncated = val if len(val) <= 100 else val[:97] + "..."
            print(f"  TTL={ttl}  {truncated}")
        print()

    # OSINT summary
    verifiers = [label for label in by_type if "Verification" in label]
    if verifiers:
        print("[OSINT]  Domain verified with:")
        for v in verifiers:
            print(f"  {v.replace(' Verification','')}")

    has_spf   = "SPF" in by_type
    has_dmarc = "DMARC" in by_type
    has_dkim  = "DKIM" in by_type
    print()
    print("[EMAIL SECURITY]")
    print(f"  SPF:   {'✓' if has_spf else '✗'}")
    print(f"  DKIM:  {'✓' if has_dkim else '✗'}")
    print(f"  DMARC: {'✓' if has_dmarc else '✗'}")

    print()
    print("[DONE] TXT records lookup complete.")

if __name__ == "__main__":
    main()
