"""IPInfo Full — Module 87. Usage: ipinfo_full.py "1.2.3.4" or ipinfo_full.py "domain.com" """
import sys, json, urllib.request, urllib.error, socket

def fetch(url):
    r = urllib.request.Request(url, headers={"User-Agent": "SentinelOSINT/1.0", "Accept": "application/json"})
    with urllib.request.urlopen(r, timeout=8) as resp:
        return json.load(resp)

def resolve_domain(domain: str) -> str:
    try:
        return socket.gethostbyname(domain)
    except Exception:
        return ""

def main():
    print("[MODULE 087] IPINFO FULL")
    print("[SOURCE]     ipinfo.io — free tier: geolocation, ASN, org, routing data")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No IP or domain supplied.")
        sys.exit(1)

    import re
    is_ip = bool(re.match(r"^\d+\.\d+\.\d+\.\d+$", raw))
    if is_ip:
        ip = raw
        domain = ""
    else:
        domain = raw.lower().lstrip("https://").lstrip("http://").split("/")[0]
        ip = resolve_domain(domain)
        if not ip:
            print(f"[ERROR] Could not resolve {domain}")
            sys.exit(1)
        print(f"[DOMAIN]  {domain}")

    print(f"[TARGET]  {ip}")
    print()

    try:
        data = fetch(f"https://ipinfo.io/{ip}/json")
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

    print(f"[IP]          {data.get('ip','?')}")
    if data.get("hostname"):
        print(f"[HOSTNAME]    {data['hostname']}")
    print(f"[CITY]        {data.get('city','?')}")
    print(f"[REGION]      {data.get('region','?')}")
    print(f"[COUNTRY]     {data.get('country','?')}")
    print(f"[POSTAL]      {data.get('postal','?')}")
    loc = data.get("loc", "")
    if loc:
        lat, lon = loc.split(",")
        print(f"[COORDINATES] {lat}°N  {lon}°E")
        print(f"[MAP]         https://maps.google.com/maps?q={loc}")
    print(f"[TIMEZONE]    {data.get('timezone','?')}")
    print()

    org  = data.get("org", "")
    asn  = ""
    name = ""
    if org and org.startswith("AS"):
        parts = org.split(" ", 1)
        asn  = parts[0]
        name = parts[1] if len(parts) > 1 else ""
    print(f"[ORG]         {org}")
    if asn:
        print(f"[ASN]         {asn}")
        print(f"[ASN NAME]    {name}")

    # Additional: company, abuse, privacy data from ipinfo
    for extra_key, label in [("company", "COMPANY"), ("abuse", "ABUSE"), ("privacy", "PRIVACY")]:
        extra = data.get(extra_key, {})
        if isinstance(extra, dict) and extra:
            print(f"[{label}]")
            for k, v in extra.items():
                print(f"  {k:15s}  {v}")

    # Privacy flags
    print()
    bogon = data.get("bogon", False)
    if bogon:
        print("[TYPE]  BOGON — private/reserved address space")
    else:
        print("[TYPE]  Public IP")

    # Reverse DNS
    try:
        hostname = socket.gethostbyaddr(ip)
        print(f"[REVERSE DNS] {hostname[0]}")
    except Exception:
        pass

    print()
    print("[DONE] IPInfo lookup complete.")

if __name__ == "__main__":
    main()
