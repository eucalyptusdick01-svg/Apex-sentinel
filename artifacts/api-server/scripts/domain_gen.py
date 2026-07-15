"""Domain Gen — Module 171. Domain generation algorithm (DGA) + lookalike generation."""
import sys, hashlib, random, re
from datetime import datetime

# Common TLDs for permutations
TLDS = [".com",".net",".org",".io",".co",".biz",".info",".xyz",".online",".site",".tech",".app"]
LEGIT_BRANDS = ["google","microsoft","amazon","facebook","apple","netflix","paypal",
                "dropbox","github","twitter","linkedin","instagram","youtube","twitch"]

def dga_seed_based(seed_str, count=20, length=12):
    """Deterministic DGA using SHA-based PRNG (mimics common real-world DGAs)."""
    domains = []
    for i in range(count):
        h = hashlib.md5(f"{seed_str}{i}".encode()).hexdigest()
        # Take 8-16 chars from hash, filter to consonant-heavy pattern
        domain = ""
        vowels = "aeiou"
        for j, c in enumerate(h):
            if len(domain) >= length: break
            if c.isdigit(): continue
            domain += c
        # add vowels for pronounceability
        result = ""
        for i, c in enumerate(domain):
            result += c
            if i % 3 == 2 and len(result) < length:
                result += random.choice(vowels)
        tld = TLDS[int(h[-2:],16) % len(TLDS)]
        domains.append(result[:length] + tld)
    return domains

def date_dga(date_str, count=10):
    """Date-seeded DGA (common pattern in Conficker, Torpig-style malware)."""
    try:
        if date_str == "today":
            seed = datetime.utcnow().strftime("%Y%m%d")
        else:
            seed = re.sub(r'[^0-9]', '', date_str)[:8]
    except:
        seed = datetime.utcnow().strftime("%Y%m%d")
    return dga_seed_based(seed, count, 12)

def lookalike_domains(domain):
    """Generate typosquatting + homoglyph lookalikes."""
    name, _, tld = domain.rpartition(".")
    if not name:
        name = domain; tld = "com"
    results = []

    # Missing char
    for i in range(len(name)):
        results.append(name[:i] + name[i+1:] + "." + tld)
    # Doubled char
    for i in range(len(name)):
        results.append(name[:i] + name[i]*2 + name[i+1:] + "." + tld)
    # Adjacent swap
    for i in range(len(name)-1):
        s = list(name); s[i], s[i+1] = s[i+1], s[i]
        results.append("".join(s) + "." + tld)
    # Homoglyphs
    glyph_map = {"o":"0","i":"1","l":"1","e":"3","a":"@","s":"5","t":"7"}
    glyph = name
    for k,v in glyph_map.items():
        glyph = glyph.replace(k, v)
    if glyph != name:
        results.append(glyph + "." + tld)
    # Common prefix/suffix brands
    for brand in ["secure","login","account","update","verify","support","help"]:
        results.append(f"{brand}-{name}.{tld}")
        results.append(f"{name}-{brand}.{tld}")
    # TLD swaps
    for alt_tld in [".net",".org",".co",".io",".biz",".xyz"]:
        if f".{tld}" != alt_tld:
            results.append(name + alt_tld)
    # Subdomain abuse
    results.append(f"{name}.{name}.{tld}")
    results.append(f"login.{name}.{tld}")

    return list(dict.fromkeys(results))[:30]

def main():
    print("[MODULE 171] DOMAIN GENERATOR")
    print("[SOURCE]     Local DGA algorithm — no external calls")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  dga:SEED[:COUNT]        — generate DGA domains from seed")
        print("         date:YYYYMMDD           — date-seeded DGA (like Conficker)")
        print("         date:today              — today's DGA seed")
        print("         lookalike:DOMAIN        — typosquat/lookalike domains")
        print("[EXAMPLE] dga:botnet_c2:20")
        print("[EXAMPLE] lookalike:google.com")
        sys.exit(0)

    if raw.startswith("dga:"):
        parts = raw[4:].split(":")
        seed = parts[0]
        count = int(parts[1]) if len(parts) > 1 else 20
        print(f"[SEED]      {seed}")
        print(f"[COUNT]     {count}")
        print()
        print("[DGA DOMAINS]")
        for d in dga_seed_based(seed, count):
            print(f"  {d}")
        print()
        print("[INFO] These are algorithmically generated — none are real")
        print("[INFO] Real DGAs register a subset; defenders must sinkhole all variants")

    elif raw.startswith("date:"):
        date_str = raw[5:].strip()
        print(f"[DATE SEED]  {date_str}")
        print()
        print("[DATE-SEEDED DGA DOMAINS]")
        for d in date_dga(date_str):
            print(f"  {d}")
        print()
        print("[INFO] Date-based DGAs change daily — C2 operators register 1-2 per day")
        print("[INFO] Pattern used by: Conficker, Torpig, Kraken, Murofet families")

    elif raw.startswith("lookalike:"):
        domain = raw[10:].strip()
        print(f"[TARGET DOMAIN]  {domain}")
        print()
        domains = lookalike_domains(domain)
        print(f"[LOOKALIKE DOMAINS]  ({len(domains)} generated)")
        for d in domains:
            print(f"  {d}")
        print()
        print("[INFO] These variants are used in phishing, brand abuse, typosquatting")
        print("[INFO] Register the most dangerous ones to prevent abuse (defensive registration)")
    else:
        # Treat as seed for DGA
        print(f"[SEED]  {raw}")
        print()
        print("[DGA DOMAINS]")
        for d in dga_seed_based(raw, 20):
            print(f"  {d}")

    print()
    print("[DONE] Domain generation complete.")

if __name__ == "__main__":
    main()
