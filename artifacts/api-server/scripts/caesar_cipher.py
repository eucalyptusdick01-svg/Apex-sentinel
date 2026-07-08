"""Caesar Cipher — Module 109. Usage: caesar_cipher.py "enc:3:Hello" or caesar_cipher.py "brute:KHOOR" """
import sys, string

ALPHA_U = string.ascii_uppercase
ALPHA_L = string.ascii_lowercase

def shift(text: str, n: int) -> str:
    result = []
    for ch in text:
        if ch.isupper():
            result.append(ALPHA_U[(ALPHA_U.index(ch) + n) % 26])
        elif ch.islower():
            result.append(ALPHA_L[(ALPHA_L.index(ch) + n) % 26])
        else:
            result.append(ch)
    return "".join(result)

# English letter frequency for scoring
FREQ = {c: f for c, f in zip("etaoinshrdlcumwfgypbvkjxqz",
        [13.0,9.1,8.2,7.5,7.0,6.7,6.3,6.1,6.0,4.3,4.0,2.8,2.4,2.4,2.4,
         2.2,2.0,1.9,1.5,1.5,1.0,0.8,0.2,0.2,0.1,0.1])}

def score(text: str) -> float:
    return sum(FREQ.get(ch.lower(), 0) for ch in text if ch.isalpha())

def main():
    print("[MODULE 109] CAESAR CIPHER")
    print("[SOURCE]     Pure Python — shift cipher encode/decode/brute-force")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  caesar_cipher.py \"enc:3:Hello World\"")
        print("         caesar_cipher.py \"dec:13:Uryyb\"")
        print("         caesar_cipher.py \"brute:Khoor Zruog\"")
        print("         caesar_cipher.py \"Hello\"   (brute-forces if no mode prefix)")
        sys.exit(0)

    parts = raw.split(":", 2)

    if parts[0].lower() == "enc" and len(parts) >= 3:
        shift_n = int(parts[1]) % 26
        text    = parts[2]
        print(f"[MODE]    Encrypt  shift={shift_n}")
        print(f"[INPUT]   {text}")
        print()
        encrypted = shift(text, shift_n)
        print(f"[ENCRYPTED]  {encrypted}")
        print(f"[DECRYPT]    caesar_cipher.py \"dec:{shift_n}:{encrypted}\"")

    elif parts[0].lower() == "dec" and len(parts) >= 3:
        shift_n = int(parts[1]) % 26
        text    = parts[2]
        print(f"[MODE]    Decrypt  shift={shift_n}")
        print(f"[INPUT]   {text}")
        print()
        decrypted = shift(text, -shift_n)
        print(f"[DECRYPTED]  {decrypted}")

    else:
        text = raw if parts[0].lower() not in ("brute", "enc", "dec") else parts[-1]
        print(f"[MODE]    Brute-force all 25 shifts")
        print(f"[INPUT]   {text}")
        print()
        candidates = []
        for n in range(26):
            decoded = shift(text, -n)
            s = score(decoded)
            candidates.append((s, n, decoded))
        candidates.sort(reverse=True)

        print(f"[TOP 5 CANDIDATES] (scored by English letter frequency)")
        for s, n, decoded in candidates[:5]:
            print(f"  shift=-{n:2d}  score={s:6.1f}  {decoded[:60]}")

        print()
        best_n, best_text = candidates[0][1], candidates[0][2]
        print(f"[BEST MATCH]  shift=-{best_n} (encoded with +{best_n})")
        print(f"  {best_text}")

    print()
    print("[DONE] Caesar cipher operation complete.")

if __name__ == "__main__":
    main()
