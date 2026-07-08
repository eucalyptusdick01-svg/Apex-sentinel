"""Base64 Coder — Module 104. Usage: base64_coder.py "text" or base64_coder.py "dec:BASE64" or base64_coder.py "url:text" """
import sys, base64, binascii

def main():
    print("[MODULE 104] BASE64 CODER")
    print("[SOURCE]     Python base64 stdlib — encode/decode/variants")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  base64_coder.py \"text to encode\"")
        print("         base64_coder.py \"dec:BASE64STRING\"")
        print("         base64_coder.py \"url:text to url-safe encode\"")
        print("         base64_coder.py \"urldec:BASE64URLSTRING\"")
        sys.exit(0)

    if raw.lower().startswith("dec:"):
        data = raw[4:]
        print(f"[MODE]    Decode standard Base64")
        print(f"[INPUT]   {data[:80]}")
        print()
        padding = (4 - len(data) % 4) % 4
        data_padded = data + "=" * padding
        try:
            decoded = base64.b64decode(data_padded)
            print(f"[DECODED BYTES]  {len(decoded)} bytes")
            try:
                text = decoded.decode("utf-8")
                print(f"[AS UTF-8]")
                print(f"  {text}")
            except Exception:
                print(f"[AS HEX]  {decoded.hex()}")
                print(f"[NOTE]    Not valid UTF-8 — binary data")
        except Exception as e:
            print(f"[ERROR]  {e}")

    elif raw.lower().startswith("urldec:"):
        data = raw[7:]
        print(f"[MODE]    Decode URL-safe Base64")
        print(f"[INPUT]   {data[:80]}")
        print()
        try:
            decoded = base64.urlsafe_b64decode(data + "==")
            try:
                text = decoded.decode("utf-8")
                print(f"[DECODED]  {text}")
            except Exception:
                print(f"[HEX]  {decoded.hex()}")
        except Exception as e:
            print(f"[ERROR]  {e}")

    elif raw.lower().startswith("url:"):
        text = raw[4:]
        print(f"[MODE]    URL-safe Base64 encode")
        print(f"[INPUT]   {text}")
        print()
        encoded = base64.urlsafe_b64encode(text.encode("utf-8")).decode()
        print(f"[ENCODED (URL-safe)]")
        print(f"  {encoded}")

    else:
        text = raw
        print(f"[MODE]    Standard Base64 encode")
        print(f"[INPUT]   {text}")
        print(f"[BYTES]   {len(text.encode('utf-8'))}")
        print()
        encoded     = base64.b64encode(text.encode("utf-8")).decode()
        encoded_url = base64.urlsafe_b64encode(text.encode("utf-8")).decode()
        encoded_32  = base64.b32encode(text.encode("utf-8")).decode()
        encoded_16  = base64.b16encode(text.encode("utf-8")).decode()
        print(f"[BASE64 STANDARD]   {encoded}")
        print(f"[BASE64 URL-SAFE]   {encoded_url}")
        print(f"[BASE32]            {encoded_32}")
        print(f"[BASE16 / HEX]      {encoded_16.lower()}")
        print()
        print(f"[DECODE CMD]  base64_coder.py \"dec:{encoded}\"")

    print()
    print("[DONE] Base64 operation complete.")

if __name__ == "__main__":
    main()
