"""IOC Extract — Module 169. Usage: ioc_extract.py "raw text with IPs, domains, hashes..." """
import sys, re

# Patterns
IPV4_RE   = re.compile(r'\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b')
IPV6_RE   = re.compile(r'\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b|(?:[0-9a-fA-F]{1,4}:){1,7}:(?:[0-9a-fA-F]{1,4}:){1,6}[0-9a-fA-F]{1,4}')
DOMAIN_RE = re.compile(r'\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+(?:com|net|org|gov|edu|io|co|uk|de|fr|ru|cn|jp|br|au|ca|nl|se|ch|it|es|pl|in|kr|mx|ar|za|nz|tk|ml|ga|cf|gq|xyz|top|club|online|site|info|biz|mobi|name|pro|tel|travel|museum|coop|aero|int|mil)\b', re.I)
MD5_RE    = re.compile(r'\b[0-9a-fA-F]{32}\b')
SHA1_RE   = re.compile(r'\b[0-9a-fA-F]{40}\b')
SHA256_RE = re.compile(r'\b[0-9a-fA-F]{64}\b')
SHA512_RE = re.compile(r'\b[0-9a-fA-F]{128}\b')
URL_RE    = re.compile(r'https?://[^\s\'"<>]+', re.I)
EMAIL_RE  = re.compile(r'\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b')
CVE_RE    = re.compile(r'\bCVE-\d{4}-\d{4,}\b', re.I)
BTС_RE    = re.compile(r'\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b')
REGISTRYKEY_RE = re.compile(r'(?:HKEY_[A-Z_]+|HKLM|HKCU|HKU|HKCR|HKCC)[\\\w]+', re.I)
FILE_PATH_RE   = re.compile(r'(?:[A-Za-z]:\\[\\\w\s.\-]+|/(?:etc|var|usr|home|tmp|opt|proc|sys|dev)/[\w/.\-]+)')
MITRE_RE  = re.compile(r'\bT\d{4}(?:\.\d{3})?\b')

PRIVATE_RANGES = [
    re.compile(r'^10\.'),
    re.compile(r'^172\.(1[6-9]|2\d|3[01])\.'),
    re.compile(r'^192\.168\.'),
    re.compile(r'^127\.'),
    re.compile(r'^169\.254\.'),
]

def is_private_ip(ip: str) -> bool:
    return any(r.match(ip) for r in PRIVATE_RANGES)

def defang(ioc: str) -> str:
    return ioc.replace(".", "[.]").replace("http", "hXXp")

def main():
    print("[MODULE 169] IOC EXTRACTOR")
    print("[SOURCE]     Regex-based — extract IPs, domains, hashes, URLs, CVEs, ATT&CK IDs from text")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  ioc_extract.py \"Suspicious traffic from 192.168.1.1 to evil.com (CVE-2024-1234)\"")
        sys.exit(0)

    text = raw
    print(f"[INPUT]  {len(text)} characters")
    print()

    results = {}

    # SHA-512 first (most specific)
    sha512 = set(SHA512_RE.findall(text))
    if sha512:
        remaining = SHA512_RE.sub("X"*128, text)
    else:
        remaining = text

    sha256 = set(SHA256_RE.findall(remaining))
    remaining2 = SHA256_RE.sub("X"*64, remaining)

    sha1 = set(SHA1_RE.findall(remaining2))
    remaining3 = SHA1_RE.sub("X"*40, remaining2)

    md5 = set(MD5_RE.findall(remaining3))

    # IPs
    ips = set(IPV4_RE.findall(text))
    public_ips  = {ip for ip in ips if not is_private_ip(ip)}
    private_ips = {ip for ip in ips if is_private_ip(ip)}

    ipv6 = set(IPV6_RE.findall(text))

    # Others
    urls    = set(URL_RE.findall(text))
    emails  = set(EMAIL_RE.findall(text))
    domains = set(DOMAIN_RE.findall(text)) - {e.split("@")[1] for e in emails}
    # Remove domains that appear as part of URLs
    url_hosts = {re.sub(r'^https?://([^/]+).*', r'\1', u) for u in urls}
    domains -= url_hosts

    cves     = set(CVE_RE.findall(text))
    mitre    = set(MITRE_RE.findall(text))
    btc      = set(BTС_RE.findall(text))
    reg_keys = set(REGISTRYKEY_RE.findall(text))
    paths    = set(FILE_PATH_RE.findall(text))

    total = sum([len(public_ips), len(private_ips), len(ipv6), len(domains),
                 len(urls), len(emails), len(md5), len(sha1), len(sha256),
                 len(sha512), len(cves), len(mitre), len(btc), len(reg_keys), len(paths)])

    print(f"[TOTAL IOCs]  {total} found")
    print()

    def show(label, items, defang_it=False):
        if not items:
            return
        print(f"[{label}]  {len(items)}")
        for item in sorted(items)[:20]:
            defanged = defang(item) if defang_it else item
            print(f"  {defanged}")
        if len(items) > 20:
            print(f"  ... ({len(items)-20} more)")
        print()

    show("PUBLIC IPs", public_ips, defang_it=True)
    show("PRIVATE IPs", private_ips)
    show("IPv6", ipv6)
    show("DOMAINS", domains, defang_it=True)
    show("URLs", urls, defang_it=True)
    show("EMAILS", emails)
    show("MD5 HASHES", md5)
    show("SHA-1 HASHES", sha1)
    show("SHA-256 HASHES", sha256)
    show("SHA-512 HASHES", sha512)
    show("CVEs", cves)
    show("MITRE ATT&CK", mitre)
    show("BITCOIN ADDRESSES", btc)
    show("REGISTRY KEYS", reg_keys)
    show("FILE PATHS", paths)

    if total == 0:
        print("[RESULT]  No IOCs found in input text")

    print("[DONE] IOC extraction complete.")

if __name__ == "__main__":
    main()
