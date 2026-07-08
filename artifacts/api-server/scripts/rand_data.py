"""
Random Data Generator — Module 205
Generates realistic fake data for testing, seeding, and OSINT drills.
Usage:
  rand_data.py "uuid"
  rand_data.py "uuid:10"          (10 UUIDs)
  rand_data.py "ip"               (random IPv4)
  rand_data.py "ip:10"
  rand_data.py "ipv6:5"
  rand_data.py "email:5"
  rand_data.py "name:10"
  rand_data.py "phone:5"
  rand_data.py "mac:5"
  rand_data.py "hash:sha256:5"
  rand_data.py "url:5"
  rand_data.py "card:5"           (fake card numbers — Luhn-valid)
  rand_data.py "password:5"
  rand_data.py "ssn:5"            (US SSN format — fake)
  rand_data.py "hex:32"           (32 random hex bytes)
  rand_data.py "jwt"              (fake JWT structure)
  rand_data.py "useragent:5"
  rand_data.py "all"              (one of each type)
"""
import sys
import secrets
import string
import hashlib
import uuid as _uuid
import random

FIRST = ["Alice","Bob","Carol","David","Eve","Frank","Grace","Hank","Iris","Jack",
         "Karen","Leo","Mia","Nate","Olivia","Pete","Quinn","Rachel","Sam","Tina",
         "Uma","Victor","Wendy","Xander","Yara","Zoe","Aaron","Bella","Carlos","Diana"]
LAST  = ["Smith","Jones","Williams","Brown","Taylor","Davies","Evans","Wilson","Thomas",
         "Roberts","Johnson","White","Harris","Martin","Garcia","Martinez","Robinson",
         "Clark","Rodriguez","Lewis","Lee","Walker","Hall","Allen","Young","King","Scott"]
DOMAINS = ["gmail.com","yahoo.com","outlook.com","protonmail.com","icloud.com",
           "example.com","mail.com","fastmail.com","tutanota.com","zoho.com"]
TLDS    = ["com","net","org","io","co","app","dev","info","xyz","online"]
UAS     = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 Version/17.1 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36",
    "python-requests/2.31.0",
    "curl/8.4.0",
    "Googlebot/2.1 (+http://www.google.com/bot.html)",
]

rng = random.SystemRandom()

def gen_uuid() -> str:
    return str(_uuid.uuid4())

def gen_ip() -> str:
    parts = [rng.randint(1, 254) if i == 0 else rng.randint(0, 255) for i in range(4)]
    return ".".join(map(str, parts))

def gen_ipv6() -> str:
    return ":".join(f"{secrets.randbelow(65536):04x}" for _ in range(8))

def gen_mac() -> str:
    mac = [secrets.randbelow(256) for _ in range(6)]
    mac[0] &= 0xFC
    return ":".join(f"{b:02x}" for b in mac)

def gen_name() -> str:
    return f"{rng.choice(FIRST)} {rng.choice(LAST)}"

def gen_email() -> str:
    f = rng.choice(FIRST).lower()
    l = rng.choice(LAST).lower()
    sep = rng.choice([".", "_", ""])
    num = str(rng.randint(1, 999)) if rng.random() > 0.5 else ""
    return f"{f}{sep}{l}{num}@{rng.choice(DOMAINS)}"

def gen_phone() -> str:
    area = rng.randint(200, 999)
    prefix = rng.randint(200, 999)
    line = rng.randint(1000, 9999)
    return f"+1-{area}-{prefix}-{line}"

def gen_hash(algo: str = "sha256") -> str:
    data = secrets.token_bytes(32)
    return hashlib.new(algo, data).hexdigest()

def gen_url() -> str:
    words = ["api","app","user","admin","data","secure","portal","cloud","dev","test"]
    path_parts = [rng.choice(words) for _ in range(rng.randint(1, 3))]
    domain = rng.choice(LAST).lower() + "." + rng.choice(TLDS)
    proto = rng.choice(["https","https","https","http"])
    path = "/".join(path_parts)
    return f"{proto}://{domain}/{path}"

def luhn_digit(number: str) -> int:
    total = 0
    reverse = number[::-1]
    for i, ch in enumerate(reverse):
        n = int(ch)
        if i % 2 == 1:
            n *= 2
            if n > 9:
                n -= 9
        total += n
    return (10 - (total % 10)) % 10

def gen_card() -> str:
    prefixes = ["4","51","52","53","54","55","37","6011"]
    prefix = rng.choice(prefixes)
    length = 16 if prefix != "37" else 15
    body = prefix + "".join(str(rng.randint(0,9)) for _ in range(length - len(prefix) - 1))
    check = luhn_digit(body)
    return body + str(check)

def gen_password(length: int = 16) -> str:
    chars = string.ascii_letters + string.digits + "!@#$%^&*-_"
    while True:
        pw = "".join(secrets.choice(chars) for _ in range(length))
        if (any(c.isupper() for c in pw) and any(c.islower() for c in pw)
                and any(c.isdigit() for c in pw) and any(c in "!@#$%^&*-_" for c in pw)):
            return pw

def gen_ssn() -> str:
    return f"{rng.randint(100,899):03d}-{rng.randint(10,99):02d}-{rng.randint(1000,9999):04d}"

def gen_jwt() -> str:
    import base64
    import json
    header  = base64.urlsafe_b64encode(json.dumps({"alg":"HS256","typ":"JWT"}).encode()).decode().rstrip("=")
    payload = base64.urlsafe_b64encode(json.dumps({
        "sub": gen_uuid(), "name": gen_name(), "iat": 1700000000, "exp": 1800000000
    }).encode()).decode().rstrip("=")
    sig = secrets.token_urlsafe(32)
    return f"{header}.{payload}.{sig}"

GENERATORS: dict = {
    "uuid":      gen_uuid,
    "ip":        gen_ip,
    "ipv4":      gen_ip,
    "ipv6":      gen_ipv6,
    "mac":       gen_mac,
    "name":      gen_name,
    "email":     gen_email,
    "phone":     gen_phone,
    "hash":      lambda: gen_hash("sha256"),
    "url":       gen_url,
    "card":      gen_card,
    "password":  gen_password,
    "ssn":       gen_ssn,
    "jwt":       gen_jwt,
    "useragent": lambda: rng.choice(UAS),
}

def main() -> None:
    print("[MODULE 205] RANDOM DATA GENERATOR")
    print("[SOURCE]     Python secrets / SystemRandom — cryptographic randomness")
    print()

    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "uuid").strip().lower()

    if raw == "all":
        print("[ALL TYPES — 1 of each]")
        print()
        for dtype, fn in GENERATORS.items():
            try:
                val = fn()
                print(f"  {dtype.upper():12s}  {val}")
            except Exception as e:
                print(f"  {dtype.upper():12s}  ERROR: {e}")
        print()
        print("[DONE] Random data generation complete.")
        return

    parts = raw.split(":")
    dtype = parts[0]
    extra = parts[1] if len(parts) > 1 else ""
    count_str = parts[-1] if len(parts) > 1 and parts[-1].isdigit() else "1"
    count = int(count_str)

    if dtype == "hex":
        nbytes = int(extra) if extra.isdigit() else 32
        print(f"[TYPE]   hex ({nbytes} random bytes = {nbytes*2} hex chars)")
        print()
        for i in range(count if count > 1 else 1):
            print(f"  {secrets.token_hex(nbytes)}")
        print()
        print("[DONE] Random data generation complete.")
        return

    if dtype == "hash":
        algo = extra if extra and not extra.isdigit() else "sha256"
        print(f"[TYPE]   hash ({algo.upper()})")
        print()
        for _ in range(max(1, count)):
            print(f"  {gen_hash(algo)}")
        print()
        print("[DONE] Random data generation complete.")
        return

    fn = GENERATORS.get(dtype)
    if not fn:
        print(f"[ERROR] Unknown type '{dtype}'")
        print(f"[TYPES] {', '.join(GENERATORS.keys())}, hex, hash")
        sys.exit(1)

    print(f"[TYPE]   {dtype.upper()}  |  count: {count}")
    print()
    for _ in range(max(1, count)):
        try:
            print(f"  {fn()}")
        except Exception as e:
            print(f"  ERROR: {e}")

    print()
    print("[DONE] Random data generation complete.")

if __name__ == "__main__":
    main()
