"""ROT13 — Module 108. Usage: rot13.py "text" or rot13.py "rot47:text" or rot13.py "rot5:text" """
import sys, codecs, string

def rot_n(text: str, n: int, alphabet: str) -> str:
    size = len(alphabet)
    result = []
    for ch in text:
        if ch in alphabet:
            idx = alphabet.index(ch)
            result.append(alphabet[(idx + n) % size])
        else:
            result.append(ch)
    return "".join(result)

def rot47(text: str) -> str:
    result = []
    for ch in text:
        o = ord(ch)
        if 33 <= o <= 126:
            result.append(chr(33 + (o - 33 + 47) % 94))
        else:
            result.append(ch)
    return "".join(result)

def rot18(text: str) -> str:
    return rot_n(rot_n(text, 13, string.ascii_uppercase + string.ascii_lowercase), 5, string.digits)

def xor_cipher(text: str, key: int) -> str:
    return "".join(chr(ord(ch) ^ key) for ch in text)

def main():
    print("[MODULE 108] ROT13 / CAESAR VARIANTS")
    print("[SOURCE]     Python codecs + pure-python ROT variants")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  rot13.py \"Hello, World!\"")
        print("         rot13.py \"rot47:Some !text\"")
        print("         rot13.py \"rot5:12345\"")
        print("         rot13.py \"xor13:text\"")
        sys.exit(0)

    if raw.lower().startswith("rot47:"):
        text = raw[6:]
        print(f"[MODE]    ROT-47 (all printable ASCII chars)")
        print(f"[INPUT]   {text}")
        print()
        result = rot47(text)
        print(f"[ROT-47]  {result}")
        print(f"[NOTE]    ROT-47 is symmetric — apply again to decode")

    elif raw.lower().startswith("rot5:"):
        text = raw[5:]
        print(f"[MODE]    ROT-5 (digits only)")
        print(f"[INPUT]   {text}")
        print()
        result = rot_n(text, 5, string.digits)
        print(f"[ROT-5]   {result}")

    elif raw.lower().startswith("rot18:"):
        text = raw[6:]
        print(f"[MODE]    ROT-18 (ROT-13 + ROT-5 combined)")
        print(f"[INPUT]   {text}")
        print()
        result = rot18(text)
        print(f"[ROT-18]  {result}")

    elif raw.lower().startswith("xor"):
        # xor13:text or xorNN:text
        rest = raw[3:]
        try:
            parts = rest.split(":", 1)
            key = int(parts[0]) if parts[0] else 13
            text = parts[1] if len(parts) > 1 else ""
        except Exception:
            key, text = 13, rest
        print(f"[MODE]    XOR-{key}")
        print(f"[INPUT]   {text}")
        print()
        result = xor_cipher(text, key)
        result_hex = result.encode().hex()
        print(f"[XOR-{key}]   {result!r}")
        print(f"[HEX]        {result_hex}")

    else:
        text = raw
        print(f"[MODE]    ROT-13 (symmetric — encode = decode)")
        print(f"[INPUT]   {text}")
        print()
        r13 = codecs.encode(text, "rot_13")
        r18 = rot18(text)
        r47 = rot47(text)
        r5  = rot_n(text, 5, string.digits)
        print(f"[ROT-13]  {r13}")
        print(f"[ROT-18]  {r18}")
        print(f"[ROT-47]  {r47}")
        if any(c.isdigit() for c in text):
            print(f"[ROT-5]   {r5}")
        print()
        print(f"[ALPHABET  A→N  B→O  C→P  ...  M→Z  N→A  ...  Z→M]")
        print(f"[NOTE]     ROT-13 is symmetric — applying it twice gives back the original")

    print()
    print("[DONE] ROT13 operation complete.")

if __name__ == "__main__":
    main()
