"""MX Deep Dive — Module 59. Usage: mx_deepdive.py "domain.com" """
import sys, json, urllib.request, socket

def doh(name: str, rtype: str):
    url = f"https://cloudflare-dns.com/dns-query?name={name}&type={rtype}"
    r = urllib.request.Request(url, headers={"Accept": "application/dns-json", "User-Agent": "SentinelOSINT/1.0"})
    with urllib.request.urlopen(r, timeout=8) as resp:
        return json.load(resp)

MAIL_PROVIDERS = {
    "google.com": "Google Workspace / Gmail",
    "googlemail.com": "Google Workspace / Gmail",
    "outlook.com": "Microsoft 365 / Outlook",
    "hotmail.com": "Microsoft 365",
    "protection.outlook.com": "Microsoft 365 EOP",
    "mail.protection.outlook.com": "Microsoft 365",
    "pphosted.com": "Proofpoint",
    "messagelabs.com": "Symantec Email Security",
    "mimecast.com": "Mimecast",
    "mailgun.org": "Mailgun",
    "sendgrid.net": "SendGrid",
    "amazonses.com": "Amazon SES",
    "mail.ru": "Mail.ru",
    "yandex.ru": "Yandex Mail",
    "zoho.com": "Zoho Mail",
    "fastmail.com": "FastMail",
    "protonmail.ch": "ProtonMail",
    "tutanota.de": "Tutanota",
    "mailchannels.net": "MailChannels",
    "barracudanetworks.com": "Barracuda Networks",
    "spamexperts.com": "SpamExperts",
    "emailsrvr.com": "Rackspace Email",
}

def identify_provider(hostname: str) -> str:
    hostname = hostname.lower().rstrip(".")
    for pattern, name in MAIL_PROVIDERS.items():
        if hostname.endswith(pattern):
            return name
    return ""

def smtp_banner(host: str, port: int = 25, timeout: float = 3.0) -> str:
    try:
        s = socket.create_connection((host, port), timeout=timeout)
        banner = s.recv(256).decode(errors="ignore").strip()
        s.close()
        return banner
    except Exception:
        return ""

def main():
    print("[MODULE 059] MX DEEP DIVE")
    print("[SOURCE]     Cloudflare DoH + direct MX resolution + SMTP banner grab")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip().lower()
    if not raw:
        print("[ERROR] No domain supplied.")
        sys.exit(1)

    domain = raw.lstrip("https://").lstrip("http://").split("/")[0]
    print(f"[TARGET]  {domain}")
    print()

    try:
        data = doh(domain, "MX")
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

    answers = data.get("Answer", [])
    mx_records = []
    for a in answers:
        rdata = a.get("data", "")
        parts = rdata.split(None, 1)
        if len(parts) == 2:
            try:
                prio = int(parts[0])
                host = parts[1].rstrip(".")
                mx_records.append((prio, host, a.get("TTL", 0)))
            except ValueError:
                pass

    if not mx_records:
        print("[RESULT]  No MX records — domain may not receive email")
        print("[INFO]    Check if domain uses subdomain for mail (e.g. mail.domain.com)")
        sys.exit(0)

    mx_records.sort()
    print(f"[MX RECORDS]  {len(mx_records)} found (sorted by priority)")
    print()

    all_providers = []
    for prio, host, ttl in mx_records:
        provider = identify_provider(host)
        all_providers.append(provider)
        print(f"  Priority {prio:3d}  TTL={ttl:6d}  {host}")
        if provider:
            print(f"              Provider: {provider}")

        # A record for MX host
        try:
            a_data = doh(host, "A")
            a_answers = a_data.get("Answer", [])
            ips = [a.get("data", "") for a in a_answers]
            if ips:
                print(f"              IPs:      {', '.join(ips)}")
        except Exception:
            pass

        # Try SMTP banner on port 25
        banner = smtp_banner(host, 25, timeout=2)
        if banner:
            print(f"              BANNER:   {banner[:80]}")

        print()

    # Provider summary
    unique_providers = list(set(p for p in all_providers if p))
    if unique_providers:
        print(f"[MAIL PROVIDER]  {', '.join(unique_providers)}")

    # Check for backup MX
    if len(mx_records) > 1:
        print(f"[BACKUP MX]  Yes — {len(mx_records)-1} backup server(s) configured")
    else:
        print("[BACKUP MX]  No — single MX (no redundancy)")

    print()
    print("[DONE] MX deep dive complete.")

if __name__ == "__main__":
    main()
