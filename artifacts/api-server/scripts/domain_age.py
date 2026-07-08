"""Domain Age — Module 82. Usage: domain_age.py "domain.com" """
import sys, json, urllib.request, urllib.error, re
from datetime import datetime, timezone

def fetch(url):
    r = urllib.request.Request(url, headers={"User-Agent": "SentinelOSINT/1.0", "Accept": "application/json"})
    with urllib.request.urlopen(r, timeout=10) as resp:
        return json.load(resp)

DATE_PATTERNS = [
    "%Y-%m-%dT%H:%M:%SZ",
    "%Y-%m-%dT%H:%M:%S",
    "%Y-%m-%dT%H:%M:%S.%fZ",
    "%Y-%m-%dT%H:%M:%S%z",
    "%Y-%m-%d",
    "%d-%b-%Y",
    "%Y.%m.%d",
]

def parse_date(val: str):
    val = val.strip()
    for fmt in DATE_PATTERNS:
        try:
            return datetime.strptime(val[:len(fmt)+5], fmt).replace(tzinfo=timezone.utc)
        except Exception:
            pass
    return None

def rdap_lookup(domain: str) -> dict:
    url = f"https://rdap.org/domain/{domain}"
    return fetch(url)

def extract_dates(data: dict) -> dict:
    dates = {}
    for event in data.get("events", []):
        action = event.get("eventAction", "").lower()
        date_str = event.get("eventDate", "")
        parsed = parse_date(date_str)
        if parsed:
            dates[action] = parsed
    return dates

def main():
    print("[MODULE 082] DOMAIN AGE")
    print("[SOURCE]     RDAP (rdap.org) — registration date from authoritative registry")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip().lower()
    if not raw:
        print("[ERROR] No domain supplied.")
        sys.exit(1)

    domain = raw.lstrip("https://").lstrip("http://").split("/")[0]
    print(f"[TARGET]  {domain}")
    print()

    try:
        data = rdap_lookup(domain)
    except urllib.error.HTTPError as e:
        print(f"[ERROR] RDAP HTTP {e.code} — domain may not exist or registry not supported")
        sys.exit(0)
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

    dates = extract_dates(data)
    now = datetime.now(timezone.utc)

    def age_str(dt: datetime) -> str:
        delta = now - dt
        days = delta.days
        if days < 30:   return f"{days} days"
        if days < 365:  return f"{days//30} months {days%30} days"
        years  = days // 365
        months = (days % 365) // 30
        return f"{years}y {months}m"

    # Registration
    registered = dates.get("registration")
    if registered:
        print(f"[REGISTERED]   {registered.strftime('%Y-%m-%d')}  ({age_str(registered)} ago)")
    else:
        print(f"[REGISTERED]   Unknown")

    # Last changed
    changed = dates.get("last changed")
    if changed:
        print(f"[LAST CHANGED] {changed.strftime('%Y-%m-%d')}  ({age_str(changed)} ago)")

    # Expiry
    expiry = dates.get("expiration")
    if expiry:
        remaining = expiry - now
        rem_days = remaining.days
        status = "EXPIRED" if rem_days < 0 else f"{rem_days} days remaining"
        print(f"[EXPIRES]      {expiry.strftime('%Y-%m-%d')}  ({status})")
        if 0 < rem_days < 30:
            print("               [WARN] Domain expires in < 30 days!")

    print()

    # Status codes
    statuses = data.get("status", [])
    if statuses:
        print(f"[STATUS]")
        for s in statuses:
            print(f"  {s}")
    print()

    # Registrar
    registrar_entity = None
    for entity in data.get("entities", []):
        roles = entity.get("roles", [])
        if "registrar" in roles:
            registrar_entity = entity
            break
    if registrar_entity:
        vcard = registrar_entity.get("vcardArray", [None, []])[1]
        fn = next((v[3] for v in vcard if v[0] == "fn"), "")
        url = next((v[3] for v in vcard if v[0] == "url"), "")
        if fn: print(f"[REGISTRAR]    {fn}")
        if url: print(f"[REG URL]      {url}")

    # Age-based risk
    print()
    print("[RISK ANALYSIS]")
    if registered:
        days_old = (now - registered).days
        if days_old < 30:
            print("  [HIGH]  Very new domain (<30 days) — higher phishing/fraud risk")
        elif days_old < 180:
            print("  [MED]   New domain (<6 months) — treat with caution")
        elif days_old < 365:
            print("  [LOW]   Domain is less than 1 year old")
        else:
            print(f"  [OK]    Established domain ({days_old//365}+ years old)")

    nameservers = data.get("nameservers", [])
    if nameservers:
        print()
        print(f"[NAMESERVERS]  {len(nameservers)}")
        for ns in nameservers[:4]:
            print(f"  {ns.get('ldhName','?').lower()}")

    print()
    print("[DONE] Domain age lookup complete.")

if __name__ == "__main__":
    main()
