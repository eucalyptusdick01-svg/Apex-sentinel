"""Hash Crack — Module 114. Dictionary + rule-based hash cracking."""
import sys, hashlib, itertools, time

COMMON_PASSWORDS = [
    "password","123456","password1","admin","letmein","welcome","monkey","dragon",
    "master","abc123","qwerty","111111","baseball","iloveyou","trustno1","sunshine",
    "princess","shadow","superman","michael","football","jesus","pass","test",
    "secret","pass123","hello","root","toor","alpine","changeme","default","admin123",
    "password123","1234567890","qwerty123","p@ssw0rd","P@ssw0rd","Password1","Pass@123",
    "hunter2","correct horse battery staple","letmein1","welcome1","access","login",
    "pass1","pass12","pa55word","passw0rd","pa$$word","p455w0rd","admin1","root123",
    "test123","guest","guest123","user","user123","demo","demo123","sample","temp",
    "temp123","service","backdoor","123qwe","1q2w3e","1q2w3e4r","zxcvbn","asdfgh",
]

LEET = {"a":"@","e":"3","i":"1","o":"0","s":"$","t":"7"}

def get_hash(val, alg):
    h = hashlib.new(alg)
    h.update(val.encode('utf-8','replace'))
    return h.hexdigest()

def detect_alg(h):
    l = len(h)
    if l == 32: return ["md5"]
    if l == 40: return ["sha1"]
    if l == 56: return ["sha224"]
    if l == 64: return ["sha256"]
    if l == 96: return ["sha384"]
    if l == 128: return ["sha512"]
    return ["md5","sha1","sha256"]

def crack(target_hash, wordlist, algs):
    for word in wordlist:
        variants = [word, word.upper(), word.capitalize(), word.title()]
        for sfx in ["","1","!","123","2024","2023","@","#","$"]:
            variants.append(word + sfx)
        leet = word
        for k,v in LEET.items(): leet = leet.replace(k, v)
        variants.append(leet)
        for v in variants:
            for alg in algs:
                try:
                    if get_hash(v, alg) == target_hash.lower():
                        return v, alg
                except: pass
    return None, None

def main():
    print("[MODULE 114] HASH CRACK")
    print("[SOURCE]     Local dictionary + rule engine — no external calls")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  HASH_VALUE                    — auto-detect + crack")
        print("         md5:HASH                       — force MD5")
        print("         sha256:HASH                    — force SHA-256")
        print("         sha1:HASH                      — force SHA-1")
        print("[EXAMPLE] 5f4dcc3b5aa765d61d8327deb882cf99  (MD5 of 'password')")
        sys.exit(0)

    forced_alg = None
    for alg in ("md5","sha1","sha224","sha256","sha384","sha512"):
        if raw.lower().startswith(alg + ":"):
            forced_alg = alg
            raw = raw[len(alg)+1:]
            break

    target = raw.strip()
    algs = [forced_alg] if forced_alg else detect_alg(target)

    print(f"[TARGET HASH]  {target}")
    print(f"[DETECTED ALG] {', '.join(algs)}")
    print(f"[WORDLIST]     {len(COMMON_PASSWORDS)} base words + leet/suffix mutations")
    print()

    t0 = time.time()
    cracked, found_alg = crack(target, COMMON_PASSWORDS, algs)
    elapsed = time.time() - t0

    if cracked:
        print(f"[CRACKED]      YES")
        print(f"[PLAINTEXT]    {cracked}")
        print(f"[ALGORITHM]    {found_alg}")
        print(f"[TIME]         {elapsed:.3f}s")
        print()
        print(f"[RISK]         This password is in common wordlists — extremely weak")
    else:
        print(f"[CRACKED]      NO — not in common wordlist")
        print(f"[TIME]         {elapsed:.3f}s")
        print()
        print("[INFO] Hash not cracked with built-in wordlist.")
        print("[INFO] Likely a stronger password or salted hash.")
        print("[TIP]  For production cracking, use hashcat or john with rockyou.txt")
        print("[TIP]  Salted hashes (bcrypt, scrypt, argon2) require the salt")
        hashes_per_sec = (len(COMMON_PASSWORDS) * 10) / max(elapsed, 0.001)
        print(f"[PERF]  ~{int(hashes_per_sec):,} hash/s estimated")

    print()
    print("[DONE] Hash crack complete.")

if __name__ == "__main__":
    main()
