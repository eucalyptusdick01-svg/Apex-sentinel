"""BGP Prefixes — Module 83. Full BGP prefix list via RIPE Stat API (free, no key)."""
import sys, urllib.request, urllib.error, json, socket, re

def fetch_json(url, timeout=10):
    req = urllib.request.Request(url, headers={"User-Agent":"swept-sentinel/1.0","Accept":"application/json"})
    resp = urllib.request.urlopen(req, timeout=timeout)
    return json.loads(resp.read().decode())

def resolve_to_ip(target):
    try:
        return socket.gethostbyname(target)
    except:
        return None

def get_prefixes(resource):
    """Get announced prefixes for an ASN or IP from RIPE Stat."""
    url = f"https://stat.ripe.net/data/announced-prefixes/data.json?resource={resource}&sourceapp=swept-sentinel"
    return fetch_json(url)

def get_asn_overview(asn):
    url = f"https://stat.ripe.net/data/as-overview/data.json?resource={asn}&sourceapp=swept-sentinel"
    return fetch_json(url)

def get_routing_status(resource):
    url = f"https://stat.ripe.net/data/routing-status/data.json?resource={resource}&sourceapp=swept-sentinel"
    return fetch_json(url)

def get_asn_for_ip(ip):
    url = f"https://stat.ripe.net/data/network-info/data.json?resource={ip}&sourceapp=swept-sentinel"
    return fetch_json(url)

def main():
    print("[MODULE 83] BGP PREFIXES")
    print("[SOURCE]    RIPE Stat API — stat.ripe.net (free, no key)")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  8.8.8.8         — IP address")
        print("[USAGE]  AS15169         — ASN")
        print("[USAGE]  google.com      — domain")
        sys.exit(0)

    target = raw.strip()

    # Resolve domain to IP
    ip = None
    asn = None
    if re.match(r'^AS\d+$', target, re.I):
        asn = target.upper()
    elif re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', target):
        ip = target
    else:
        ip = resolve_to_ip(target)
        if ip:
            print(f"[RESOLVED]   {target} → {ip}")
        else:
            print(f"[ERROR] Could not resolve {target}")
            sys.exit(1)

    # Get ASN from IP if needed
    if ip and not asn:
        try:
            net_info = get_asn_for_ip(ip)
            data = net_info.get("data", {})
            asn = data.get("asns", [None])[0] if data.get("asns") else None
            prefix = data.get("prefix","")
            if asn:
                asn = f"AS{asn}"
                print(f"[IP]         {ip}")
                print(f"[PREFIX]     {prefix}")
                print(f"[ASN]        {asn}")
        except Exception as e:
            print(f"[WARN]  Could not get ASN: {e}")

    if asn:
        # Get ASN overview
        try:
            overview = get_asn_overview(asn)
            od = overview.get("data",{})
            holder = od.get("holder","Unknown")
            announced = od.get("announced", False)
            print(f"[ASN HOLDER] {holder}")
            print(f"[ANNOUNCED]  {announced}")
        except Exception as e:
            print(f"[WARN]  ASN overview: {e}")

        # Get prefixes
        try:
            pdata = get_prefixes(asn)
            prefixes = pdata.get("data",{}).get("prefixes",[])
            v4 = [p for p in prefixes if ":" not in p.get("prefix","")]
            v6 = [p for p in prefixes if ":" in p.get("prefix","")]

            print()
            print(f"[IPv4 PREFIXES]  {len(v4)} announced")
            for p in sorted(v4, key=lambda x: x.get("prefix",""))[:30]:
                pfx = p.get("prefix",""); timings = p.get("timelines",[])
                print(f"  {pfx}")
            if len(v4) > 30:
                print(f"  ... and {len(v4)-30} more")

            print()
            print(f"[IPv6 PREFIXES]  {len(v6)} announced")
            for p in sorted(v6, key=lambda x: x.get("prefix",""))[:15]:
                pfx = p.get("prefix","")
                print(f"  {pfx}")
            if len(v6) > 15:
                print(f"  ... and {len(v6)-15} more")

        except Exception as e:
            print(f"[ERROR] Prefix fetch: {e}")
    else:
        print("[ERROR] Could not determine ASN for target")

    print()
    print("[DONE] BGP prefix enumeration complete.")

if __name__ == "__main__":
    main()
