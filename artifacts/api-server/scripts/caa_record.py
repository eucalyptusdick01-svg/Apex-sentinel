"""CAA Record — Module 56. Usage: caa_record.py "domain.com" """
import sys, json, urllib.request

def doh(name: str, rtype: str):
    url = f"https://cloudflare-dns.com/dns-query?name={name}&type={rtype}"
    r = urllib.request.Request(url, headers={"Accept": "application/dns-json", "User-Agent": "SentinelOSINT/1.0"})
    with urllib.request.urlopen(r, timeout=8) as resp:
        return json.load(resp)

KNOWN_CA = {
    "letsencrypt.org": "Let's Encrypt (free)",
    "pki.goog": "Google Trust Services",
    "digicert.com": "DigiCert",
    "sectigo.com": "Sectigo / Comodo",
    "comodoca.com": "Comodo",
    "usertrust.com": "USERTrust (Sectigo)",
    "globalsign.com": "GlobalSign",
    "amazon.com": "Amazon / AWS",
    "amazontrust.com": "Amazon Trust Services",
    "entrust.net": "Entrust",
    "godaddy.com": "GoDaddy",
    "ssl.com": "SSL.com",
    "certigna.fr": "Certigna",
    "quovadis.com": "QuoVadis",
}

def main():
    print("[MODULE 056] CAA RECORD")
    print("[SOURCE]     Cloudflare DNS-over-HTTPS  — RFC 8659 Certificate Authority Authorization")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip().lower()
    if not raw:
        print("[ERROR] No domain supplied.")
        sys.exit(1)

    domain = raw.lstrip("https://").lstrip("http://").split("/")[0]
    print(f"[TARGET]  {domain}")
    print()

    # Walk up the tree
    labels = domain.split(".")
    checked = []
    for i in range(len(labels)):
        d = ".".join(labels[i:])
        if len(d) < 3:
            break
        checked.append(d)

    found_records = []
    found_at = None
    for d in checked:
        try:
            data = doh(d, "CAA")
            ans  = data.get("Answer", [])
            if ans:
                found_at = d
                found_records = ans
                break
        except Exception:
            continue

    if found_records:
        print(f"[FOUND AT]  {found_at}")
        print(f"[RECORDS]   {len(found_records)}")
        print()
        issue_tags   = []
        issuewild    = []
        iodef_tags   = []
        for rec in found_records:
            rdata = rec.get("data", "")
            print(f"  {rdata}")
            parts = rdata.split(None, 2)
            if len(parts) >= 3:
                flag, tag, val = parts[0], parts[1].strip('"'), parts[2].strip('"')
                if tag == "issue":
                    issue_tags.append(val)
                elif tag == "issuewild":
                    issuewild.append(val)
                elif tag == "iodef":
                    iodef_tags.append(val)
        print()
        print("[ANALYSIS]")
        if issue_tags:
            print(f"  ISSUE (non-wildcard certs allowed from):")
            for v in issue_tags:
                known = KNOWN_CA.get(v.strip(";"), "")
                print(f"    {v}  {'← ' + known if known else ''}")
            if ";" in "".join(issue_tags) or any(v == ";" for v in issue_tags):
                print("    [NOTE] semicolon-only value means NO CA may issue non-wildcard certs")
        if issuewild:
            print(f"  ISSUEWILD (wildcard certs):")
            for v in issuewild:
                print(f"    {v}")
        if iodef_tags:
            print(f"  IODEF (violation reports sent to):")
            for v in iodef_tags:
                print(f"    {v}")
        if not issue_tags and not issuewild:
            print("  [WARN] No issue/issuewild tags — any CA can issue certificates")
    else:
        print("[RESULT] No CAA records found")
        print("[INFO]   Without CAA, any Certificate Authority can issue certificates for this domain")
        print("[REC]    Add CAA records to restrict which CAs may issue certs")
        print()
        print("[RECOMMENDED CAA RECORDS]")
        print('  domain.com.  300  IN  CAA  0 issue "letsencrypt.org"')
        print('  domain.com.  300  IN  CAA  0 issuewild ";"')
        print('  domain.com.  300  IN  CAA  0 iodef "mailto:security@domain.com"')

    print()
    print("[DONE] CAA record lookup complete.")

if __name__ == "__main__":
    main()
