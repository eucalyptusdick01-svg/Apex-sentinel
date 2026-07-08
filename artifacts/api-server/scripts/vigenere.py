"""Vigenère Cipher — Module 110. Usage: vigenere.py "enc:key:text" or vigenere.py "dec:key:text" or vigenere.py "crack:ciphertext" """
import sys, string
from collections import Counter
import math

ALPHA = string.ascii_uppercase
FREQ_EN = {c: f for c, f in zip("ETAOINSHRDLCUMWFGYPBVKJXQZ",
    [13.0,9.1,8.2,7.5,7.0,6.7,6.3,6.1,6.0,4.3,4.0,2.8,2.4,2.4,2.4,
     2.2,2.0,1.9,1.5,1.5,1.0,0.8,0.2,0.2,0.1,0.1])}

def vigenere(text: str, key: str, decrypt: bool = False) -> str:
    key = key.upper()
    result = []
    ki = 0
    for ch in text:
        if ch.upper() in ALPHA:
            shift = ALPHA.index(key[ki % len(key)])
            if ch.isupper():
                base = ALPHA.index(ch)
            else:
                base = ALPHA.index(ch.upper())
            if decrypt:
                enc = (base - shift) % 26
            else:
                enc = (base + shift) % 26
            out = ALPHA[enc] if ch.isupper() else ALPHA[enc].lower()
            result.append(out)
            ki += 1
        else:
            result.append(ch)
    return "".join(result)

def ic(text: str) -> float:
    text = [c for c in text.upper() if c in ALPHA]
    n = len(text)
    if n < 2: return 0
    counts = Counter(text)
    return sum(v * (v - 1) for v in counts.values()) / (n * (n - 1))

def find_key_length(cipher: str, max_len: int = 15) -> int:
    stripped = [c for c in cipher.upper() if c in ALPHA]
    best_len, best_ic = 1, 0
    for kl in range(1, min(max_len + 1, len(stripped) // 2)):
        groups = ["".join(stripped[i::kl]) for i in range(kl)]
        avg_ic = sum(ic(g) for g in groups) / kl
        if avg_ic > best_ic:
            best_ic = avg_ic
            best_len = kl
    return best_len

def recover_key(cipher: str, key_len: int) -> str:
    stripped = [c for c in cipher.upper() if c in ALPHA]
    key = []
    for i in range(key_len):
        group = stripped[i::key_len]
        best_shift, best_score = 0, -1
        for s in range(26):
            decoded = [ALPHA[(ALPHA.index(c) - s) % 26] for c in group]
            score = sum(FREQ_EN.get(c, 0) for c in decoded)
            if score > best_score:
                best_score = score
                best_shift = s
        key.append(ALPHA[best_shift])
    return "".join(key)

def main():
    print("[MODULE 110] VIGENÈRE CIPHER")
    print("[SOURCE]     Pure Python — polyalphabetic cipher + frequency analysis crack")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  vigenere.py \"enc:KEY:Hello World\"")
        print("         vigenere.py \"dec:KEY:Rijvs Uyvjn\"")
        print("         vigenere.py \"crack:Rijvs Uyvjn\"   (Kasiski + IC analysis)")
        sys.exit(0)

    parts = raw.split(":", 2)
    mode = parts[0].lower()

    if mode == "enc" and len(parts) == 3:
        key, text = parts[1], parts[2]
        print(f"[MODE]      Encrypt")
        print(f"[KEY]       {key.upper()}")
        print(f"[PLAINTEXT] {text}")
        print()
        encrypted = vigenere(text, key, decrypt=False)
        print(f"[CIPHERTEXT]  {encrypted}")
        print(f"[DECRYPT]     vigenere.py \"dec:{key.upper()}:{encrypted}\"")

    elif mode == "dec" and len(parts) == 3:
        key, text = parts[1], parts[2]
        print(f"[MODE]       Decrypt")
        print(f"[KEY]        {key.upper()}")
        print(f"[CIPHERTEXT] {text}")
        print()
        decrypted = vigenere(text, key, decrypt=True)
        print(f"[PLAINTEXT]  {decrypted}")

    elif mode == "crack" and len(parts) >= 2:
        cipher = parts[1] if len(parts) == 2 else raw[6:]
        print(f"[MODE]       Crack (Kasiski + IC + frequency)")
        print(f"[INPUT]      {cipher}")
        print()
        stripped = [c for c in cipher.upper() if c in ALPHA]
        if len(stripped) < 20:
            print("[WARN]  Very short ciphertext — crack results unreliable")
        key_len = find_key_length(cipher, max_len=12)
        key     = recover_key(cipher, key_len)
        plaintext = vigenere(cipher, key, decrypt=True)
        print(f"[ESTIMATED KEY LENGTH]  {key_len}")
        print(f"[RECOVERED KEY]         {key}")
        print(f"[DECRYPTED]             {plaintext}")
        print()
        print(f"[IC]  {ic(cipher):.4f}  (English ≈0.065, random ≈0.038)")

    else:
        text = raw
        print(f"[MODE]  Auto-detect / show usage")
        print(f"[INFO]  Pass enc:KEY:text, dec:KEY:text, or crack:ciphertext")
        print(f"[RAW]   {text}")

    print()
    print("[DONE] Vigenère cipher operation complete.")

if __name__ == "__main__":
    main()
