"""Email Validate — Module 86. Usage: email_validate.py "user@example.com" """
import sys, re, socket, json, urllib.request, urllib.error

def doh(name: str, rtype: str):
    url = f"https://cloudflare-dns.com/dns-query?name={name}&type={rtype}"
    r = urllib.request.Request(url, headers={"Accept": "application/dns-json", "User-Agent": "SentinelOSINT/1.0"})
    with urllib.request.urlopen(r, timeout=8) as resp:
        return json.load(resp)

DISPOSABLE_DOMAINS = {
    "mailinator.com", "guerrillamail.com", "10minutemail.com", "tempmail.com",
    "throwaway.email", "yopmail.com", "sharklasers.com", "guerrillamailblock.com",
    "grr.la", "guerrillamail.info", "guerrillamail.biz", "guerrillamail.de",
    "guerrillamail.net", "guerrillamail.org", "spam4.me", "trashmail.com",
    "trashmail.me", "trashmail.net", "dispostable.com", "fakeinbox.com",
    "getnada.com", "mailnull.com", "maildrop.cc", "mailnesia.com",
    "tempr.email", "discard.email", "mytemp.email", "tempinbox.com",
    "throwam.com", "mailsac.com", "spamgourmet.com", "trashmail.at",
    "wegwerfmail.de", "spamex.com", "tempail.com",
}

ROLE_ACCOUNTS = {"admin", "administrator", "info", "support", "contact", "sales",
                 "marketing", "noreply", "no-reply", "postmaster", "webmaster",
                 "hostmaster", "abuse", "security", "privacy", "legal", "billing",
                 "help", "feedback", "newsletter"}

EMAIL_RE = re.compile(
    r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+"
    r"@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?"
    r"(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$"
)

def smtp_verify(mx_host: str, email: str, timeout: float = 5.0) -> str:
    try:
        s = socket.create_connection((mx_host, 25), timeout=timeout)
        def readline():
            buf = b""
            while True:
                c = s.recv(1)
                if not c or c == b"\n": break
                buf += c
            return buf.decode(errors="ignore").strip()

        banner = readline()
        if not banner.startswith("2"):
            s.close(); return f"banner_fail:{banner[:40]}"

        s.sendall(b"EHLO sentinel-osint.example.com\r\n")
        for _ in range(10):
            line = readline()
            if line.startswith("2") and not line[3:4] == b"-": break

        s.sendall(b"MAIL FROM:<probe@sentinel-osint.example.com>\r\n")
        resp = readline()
        if not resp.startswith("2"):
            s.close(); return f"mail_from_fail:{resp[:40]}"

        s.sendall(f"RCPT TO:<{email}>\r\n".encode())
        resp = readline()
        s.sendall(b"QUIT\r\n")
        s.close()

        if resp.startswith("2"):   return "deliverable"
        if resp.startswith("5"):   return f"undeliverable:{resp[:60]}"
        if resp.startswith("4"):   return f"greylisted:{resp[:60]}"
        return f"unknown:{resp[:40]}"
    except Exception as e:
        return f"error:{str(e)[:50]}"

def main():
    print("[MODULE 086] EMAIL VALIDATE")
    print("[SOURCE]     RFC 5321 syntax + DNS MX check + SMTP RCPT probe")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No email supplied.")
        sys.exit(1)

    email = raw.lower()
    print(f"[TARGET]  {email}")
    print()

    # Syntax
    print("[STEP 1] Syntax check...")
    if "@" not in email:
        print("  ✗ Invalid — no @ symbol")
        sys.exit(0)
    local, _, domain = email.rpartition("@")
    if not EMAIL_RE.match(email):
        print("  ✗ Invalid RFC 5321 syntax")
        sys.exit(0)
    else:
        print(f"  ✓ Syntax valid")
        print(f"  Local part:  {local}")
        print(f"  Domain:      {domain}")
    print()

    # Role/disposable
    is_role        = local in ROLE_ACCOUNTS
    is_disposable  = domain in DISPOSABLE_DOMAINS
    print("[STEP 2] Address type...")
    if is_disposable:
        print(f"  ✗ DISPOSABLE domain — temporary/throwaway email service")
    elif is_role:
        print(f"  ⚠ ROLE account — not a personal mailbox")
    else:
        print(f"  ✓ Regular address")
    print()

    # MX records
    print("[STEP 3] MX record check...")
    try:
        data = doh(domain, "MX")
        mx_records = []
        for a in data.get("Answer", []):
            parts = a.get("data","").split(None, 1)
            if len(parts) == 2:
                try:
                    mx_records.append((int(parts[0]), parts[1].rstrip(".")))
                except ValueError:
                    pass
        mx_records.sort()
    except Exception as e:
        print(f"  ✗ MX lookup failed: {e}")
        mx_records = []

    if mx_records:
        print(f"  ✓ {len(mx_records)} MX record(s)")
        for prio, host in mx_records[:3]:
            print(f"    Priority {prio:3d}  {host}")
    else:
        print("  ✗ No MX records — domain cannot receive email")
        sys.exit(0)
    print()

    # SMTP probe
    print("[STEP 4] SMTP RCPT probe (best MX)...")
    mx_host = mx_records[0][1]
    result = smtp_verify(mx_host, email, timeout=5)
    print(f"  MX host: {mx_host}")

    if result == "deliverable":
        print("  ✓ SMTP ACCEPTED — mailbox appears to exist")
    elif result.startswith("undeliverable"):
        code = result.split(":", 1)[1]
        print(f"  ✗ SMTP REJECTED — {code}")
    elif result.startswith("greylisted"):
        print(f"  ⚠ Greylisted or temporarily deferred — inconclusive")
    elif result.startswith("catch_all") or "catch" in result.lower():
        print("  ⚠ Catch-all domain — accepts all addresses (inconclusive)")
    else:
        print(f"  ? {result}")
    print()

    # SPF
    print("[STEP 5] SPF record...")
    try:
        txt_data = doh(domain, "TXT")
        spf = next((a.get("data","").strip('"') for a in txt_data.get("Answer",[])
                    if "v=spf1" in a.get("data","")), None)
        if spf:
            print(f"  ✓ SPF: {spf[:80]}")
        else:
            print("  ✗ No SPF record")
    except Exception:
        pass

    print()
    print("[DONE] Email validation complete.")

if __name__ == "__main__":
    main()
