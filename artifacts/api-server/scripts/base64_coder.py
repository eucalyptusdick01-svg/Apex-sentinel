"""Base64 Coder — Module 104. Usage: base64_coder.py "enc:Hello World" or "dec:SGVsbG8gV29ybGQ=" or "urlenc:text" """
import sys, base64

MODES = {
    "enc":    "Standard Base64 encode",
    "dec":    "Standard Base64 decode",
    "urlenc": "URL-safe Base64 encode",
    "urldec": "URL-safe Base64 decode",
    "hexenc": "Hex → Base64",
    "b32enc": "Base32 encode",
    "b32dec": "Base32 decode",
    "b85enc": "Base85 encode",
    "b85dec": "Base85 decode",
    "detect": "Auto-detect and decode",
}

def pad(s: str) -> str:
    return s + "=" * (-len(s) % 4)

def try_decode(data: str):
    results = []
    for fn, label in [
        (lambda d: base64.b64decode(pad(d)).decode("utf-8", errors="replace"), "Standard Base64"),
        (lambda d: base64.urlsafe_b64decode(pad(d)).decode("utf-8", errors="replace"), "URL-safe Base64"),
        (lambda d: base64.b32decode(d.upper() + "=" * (-len(d) % 8)).decode("utf-8", errors="replace"), "Base32"),
        (lambda d: base64.b85decode(d).decode("utf-8", errors="replace"), "Base85"),
        (lambda d: bytes.fromhex(d).decode("utf-8", errors="replace"), "Hex"),
    ]:
        try:
            decoded = fn(data)
            results.append((label, decoded))
        except Exception:
            pass
    return results

def main():
    print("[MODULE 104] BASE64 CODER")
    print("[SOURCE]     Python stdlib base64 — encode/decode/detect")
    print()

    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw or raw == "help":
        print("[MODES]")
        for mode, desc in MODES.items():
            print(f"  {mode:8s}  {desc}")
        print()
        print("[USAGE]")
        print('  base64_coder.py "enc:Hello World"')
        print('  base64_coder.py "dec:SGVsbG8gV29ybGQ="')
        print('  base64_coder.py "urlenc:data+with/special=chars"')
        print('  base64_coder.py "detect:SGVsbG8gV29ybGQ="')
        sys.exit(0)

    if ":" in raw:
        mode, _, data = raw.partition(":")
        mode = mode.strip().lower()
    else:
        mode = "detect"
        data = raw

    print(f"[MODE]   {mode}")
    print(f"[INPUT]  {data[:80]}{'...' if len(data)>80 else ''}")
    print()

    try:
        if mode == "enc":
            result = base64.b64encode(data.encode()).decode()
            print(f"[STANDARD B64]   {result}")
            print(f"[URL-SAFE B64]   {base64.urlsafe_b64encode(data.encode()).decode()}")
        elif mode == "dec":
            decoded = base64.b64decode(pad(data))
            print(f"[DECODED]  {decoded.decode('utf-8', errors='replace')}")
            print(f"[BYTES]    {len(decoded)} bytes")
            print(f"[HEX]      {decoded.hex()}")
        elif mode == "urlenc":
            result = base64.urlsafe_b64encode(data.encode()).decode()
            print(f"[URL-SAFE B64]  {result}")
        elif mode == "urldec":
            decoded = base64.urlsafe_b64decode(pad(data))
            print(f"[DECODED]  {decoded.decode('utf-8', errors='replace')}")
        elif mode == "hexenc":
            raw_bytes = bytes.fromhex(data.strip())
            print(f"[B64]      {base64.b64encode(raw_bytes).decode()}")
            print(f"[B64URL]   {base64.urlsafe_b64encode(raw_bytes).decode()}")
        elif mode == "b32enc":
            print(f"[BASE32]  {base64.b32encode(data.encode()).decode()}")
        elif mode == "b32dec":
            decoded = base64.b32decode(data.upper() + "=" * (-len(data) % 8))
            print(f"[DECODED]  {decoded.decode('utf-8', errors='replace')}")
        elif mode == "b85enc":
            print(f"[BASE85]  {base64.b85encode(data.encode()).decode()}")
        elif mode == "b85dec":
            decoded = base64.b85decode(data)
            print(f"[DECODED]  {decoded.decode('utf-8', errors='replace')}")
        elif mode == "detect":
            print(f"[AUTO-DETECT]")
            results = try_decode(data)
            if results:
                for label, decoded in results:
                    print(f"  [{label:20s}]  {decoded[:120]}")
            else:
                print("  Could not decode with any common encoding")
                enc = base64.b64encode(data.encode()).decode()
                print(f"  (treating as plaintext → B64: {enc})")
        else:
            print(f"[ERROR] Unknown mode '{mode}'")
            sys.exit(1)
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

    print()
    print("[DONE] Base64 operation complete.")

if __name__ == "__main__":
    main()
