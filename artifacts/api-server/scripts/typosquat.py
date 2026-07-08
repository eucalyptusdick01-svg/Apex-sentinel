"""Typosquat — Module 170. Usage: typosquat.py "google.com" """
import sys, itertools, urllib.request, urllib.error, json, re

def doh_exists(domain: str) -> bool:
    try:
        url = f"https://cloudflare-dns.com/dns-query?name={domain}&type=A"
        r = urllib.request.Request(url, headers={"Accept": "application/dns-json", "User-Agent": "SentinelOSINT/1.0"})
        with urllib.request.urlopen(r, timeout=4) as resp:
            data = json.load(resp)
            return bool(data.get("Answer"))
    except Exception:
        return False

QWERTY_ADJACENT = {
    'q':'wa','w':'qesa','e':'wsdr','r':'edft','t':'rfgy','y':'tghu','u':'yhji','i':'ujko',
    'o':'iklp','p':'ol','a':'qwsz','s':'awedxz','d':'serfcx','f':'drtgvc','g':'ftyhbv',
    'h':'gyujnb','j':'huikmn','k':'jiolm','l':'kop','z':'asx','x':'zsdc','c':'xdfv',
    'v':'cfgb','b':'vghn','n':'bhjm','m':'njk',
}

def generate_typos(domain: str) -> list:
    if "." not in domain:
        return []
    dot_idx = domain.rindex(".")
    name = domain[:dot_idx]
    tld  = domain[dot_idx:]
    typos = set()

    # Adjacent keys
    for i, ch in enumerate(name):
        for adj in QWERTY_ADJACENT.get(ch.lower(), ""):
            typo = name[:i] + adj + name[i+1:]
            typos.add(typo + tld)

    # Missing char
    for i in range(len(name)):
        typos.add(name[:i] + name[i+1:] + tld)

    # Double char
    for i, ch in enumerate(name):
        typos.add(name[:i] + ch + ch + name[i+1:] + tld)

    # Inserted char
    for i in range(len(name)+1):
        for ch in "abcdefghijklmnopqrstuvwxyz0123456789-":
            typos.add(name[:i] + ch + name[i:] + tld)

    # Swapped adjacent chars
    for i in range(len(name)-1):
        typo = name[:i] + name[i+1] + name[i] + name[i+2:] + tld
        typos.add(typo)

    # Common TLD swaps
    COMMON_TLDS = [".com", ".net", ".org", ".io", ".co", ".info", ".biz", ".us", ".co.uk"]
    for t in COMMON_TLDS:
        if t != tld:
            typos.add(name + t)

    # Homoglyph substitutions
    HOMOGLYPHS = {'o':'0','l':'1','i':'l','e':'3','a':'@','s':'5'}
    for i, ch in enumerate(name.lower()):
        if ch in HOMOGLYPHS:
            typo = name[:i] + HOMOGLYPHS[ch] + name[i+1:] + tld
            typos.add(typo)

    # Subdomain style typos
    typos.add("www" + name + tld)
    typos.add(name + "-" + "secure" + tld)
    typos.add(name + "-" + "login" + tld)
    typos.add("login" + "." + name.lstrip("www.") + tld if name != "www" else name + tld)
    typos.add(name + "s" + tld)
    typos.add(name + "app" + tld)

    typos.discard(domain)
    return sorted(typos)

def main():
    print("[MODULE 170] TYPOSQUAT GENERATOR")
    print("[SOURCE]     Pure Python typo engine + Cloudflare DoH DNS check")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip().lower()
    if not raw:
        print("[ERROR] No domain supplied.")
        sys.exit(1)

    domain = raw.lstrip("https://").lstrip("http://").split("/")[0]
    print(f"[TARGET]  {domain}")
    print()

    typos = generate_typos(domain)
    print(f"[GENERATED]  {len(typos)} typosquat candidates")
    print()

    # DNS check top candidates (limit for speed)
    CHECK_LIMIT = 30
    check_set = typos[:CHECK_LIMIT]
    print(f"[DNS CHECK]  Checking {len(check_set)} candidates...")
    print()

    registered = []
    for typo in check_set:
        exists = doh_exists(typo)
        mark = "✓ REGISTERED" if exists else "  (not found)"
        print(f"  {typo:40s}  {mark}")
        if exists:
            registered.append(typo)

    print()
    print(f"[SUMMARY]")
    print(f"  Typo candidates: {len(typos)}")
    print(f"  DNS checked:     {len(check_set)}")
    print(f"  Registered:      {len(registered)}")
    if registered:
        print(f"  [WARN] Potential squatters:")
        for d in registered:
            print(f"    {d}")

    print()
    print("[DONE] Typosquatting analysis complete.")

if __name__ == "__main__":
    main()
