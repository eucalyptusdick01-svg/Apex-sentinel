"""NS Lookup — Module 61. Usage: ns_lookup.py "domain.com" """
import sys, json, urllib.request, socket

def doh(name: str, rtype: str):
    url = f"https://cloudflare-dns.com/dns-query?name={name}&type={rtype}"
    r = urllib.request.Request(url, headers={"Accept": "application/dns-json", "User-Agent": "SentinelOSINT/1.0"})
    with urllib.request.urlopen(r, timeout=8) as resp:
        return json.load(resp)

DNS_PROVIDERS = {
    "cloudflare.com": "Cloudflare",
    "ns.cloudflare.com": "Cloudflare",
    "awsdns": "Amazon Route 53",
    "azure-dns.com": "Azure DNS",
    "azure-dns.net": "Azure DNS",
    "azure-dns.org": "Azure DNS",
    "azure-dns.info": "Azure DNS",
    "googledomains.com": "Google Domains DNS",
    "domaincontrol.com": "GoDaddy",
    "secureserver.net": "GoDaddy",
    "dnsmadeeasy.com": "DNS Made Easy",
    "nsone.net": "NS1",
    "dnsimple.com": "DNSimple",
    "dnsimple.net": "DNSimple",
    "dreamhost.com": "DreamHost",
    "porkbun.com": "Porkbun",
    "namebrightdns.com": "NameBright",
    "registrar-servers.com": "Namecheap",
    "name.com": "Name.com",
    "dynect.net": "DynDNS / Oracle",
    "ultradns.net": "Neustar UltraDNS",
    "verisigndns.com": "VeriSign",
    "networksolutions.com": "Network Solutions",
    "bluehost.com": "Bluehost",
    "hostgator.com": "HostGator",
    "pair.com": "pair Networks",
}

def identify_dns_provider(ns: str) -> str:
    ns_lower = ns.lower()
    for pattern, name in DNS_PROVIDERS.items():
        if pattern in ns_lower:
            return name
    return ""

def main():
    print("[MODULE 061] NS LOOKUP")
    print("[SOURCE]     Cloudflare DNS-over-HTTPS — nameserver enumeration + analysis")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip().lower()
    if not raw:
        print("[ERROR] No domain supplied.")
        sys.exit(1)

    domain = raw.lstrip("https://").lstrip("http://").split("/")[0]
    print(f"[TARGET]  {domain}")
    print()

    try:
        data = doh(domain, "NS")
        answers = data.get("Answer", [])
        authority = data.get("Authority", [])
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

    ns_entries = [(a.get("data","").rstrip("."), a.get("TTL",0)) for a in (answers or authority)
                   if a.get("type") == 2 or not answers]
    if not ns_entries:
        ns_entries = [(a.get("data","").rstrip("."), a.get("TTL",0)) for a in (answers + authority)]

    # Filter actual NS entries
    all_recs = answers + authority
    ns_recs = [a for a in all_recs if a.get("type") == 2]
    if not ns_recs:
        # try parsing raw
        ns_recs = all_recs

    ns_names = []
    for r in ns_recs:
        name = r.get("data","").rstrip(".")
        if name and "." in name:
            ns_names.append((name, r.get("TTL",0)))

    if not ns_names:
        print("[RESULT]  No NS records found")
        sys.exit(0)

    print(f"[NAMESERVERS]  {len(ns_names)} found")
    print()

    providers_seen = set()
    for ns, ttl in ns_names:
        provider = identify_dns_provider(ns)
        if provider:
            providers_seen.add(provider)
        print(f"  {ns}")
        print(f"    TTL:      {ttl}s")
        if provider:
            print(f"    Provider: {provider}")
        try:
            a_data = doh(ns, "A")
            ips = [a.get("data","") for a in a_data.get("Answer", []) if a.get("type") == 1]
            if ips:
                print(f"    IPv4:     {', '.join(ips)}")
        except Exception:
            pass
        try:
            aaaa_data = doh(ns, "AAAA")
            ipv6s = [a.get("data","") for a in aaaa_data.get("Answer", []) if a.get("type") == 28]
            if ipv6s:
                print(f"    IPv6:     {', '.join(ipv6s[:2])}")
        except Exception:
            pass
        print()

    if providers_seen:
        print(f"[DNS PROVIDER]  {', '.join(providers_seen)}")

    # Diversity check
    tlds_of_ns = set()
    for ns, _ in ns_names:
        parts = ns.split(".")
        if len(parts) >= 2:
            tlds_of_ns.add(".".join(parts[-2:]))
    if len(tlds_of_ns) == 1:
        print("[WARN]  All nameservers share the same TLD — single point of failure")
    else:
        print(f"[INFO]  Nameservers span {len(tlds_of_ns)} different domains — good redundancy")

    print()
    print("[DONE] NS lookup complete.")

if __name__ == "__main__":
    main()
