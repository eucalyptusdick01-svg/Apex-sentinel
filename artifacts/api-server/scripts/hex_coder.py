"""Hex Coder — Module 105. Usage: hex_coder.py "text" or hex_coder.py "dec:HEXSTRING" """
import sys, binascii

def main():
    print("[MODULE 105] HEX CODER")
    print("[SOURCE]     Python binascii stdlib — hex encode/decode + formatting")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  hex_coder.py \"text to encode\"")
        print("         hex_coder.py \"dec:48656c6c6f\"")
        sys.exit(0)

    if raw.lower().startswith("dec:"):
        hex_str = raw[4:].replace(" ", "").replace("0x", "").replace(":", "").replace("-","")
        print(f"[MODE]   Hex decode")
        print(f"[INPUT]  {hex_str[:80]}")
        print()
        if len(hex_str) % 2 != 0:
            hex_str = "0" + hex_str
        try:
            decoded = bytes.fromhex(hex_str)
            print(f"[BYTES]  {len(decoded)}")
            try:
                text = decoded.decode("utf-8")
                print(f"[UTF-8]  {text}")
            except Exception:
                print(f"[NOTE]   Not valid UTF-8")
            print(f"[DECIMAL] {list(decoded[:20])}")
        except Exception as e:
            print(f"[ERROR]  {e}")
    else:
        text = raw
        data = text.encode("utf-8")
        print(f"[MODE]   Hex encode")
        print(f"[INPUT]  {text[:80]}")
        print(f"[BYTES]  {len(data)}")
        print()
        hex_plain   = data.hex()
        hex_upper   = data.hex().upper()
        hex_spaced  = " ".join(f"{b:02x}" for b in data)
        hex_0x      = " ".join(f"0x{b:02x}" for b in data)
        hex_cformat = ", ".join(f"0x{b:02X}" for b in data)
        print(f"[LOWERCASE]  {hex_plain}")
        print(f"[UPPERCASE]  {hex_upper}")
        print(f"[SPACED]     {hex_spaced}")
        print(f"[0x PREFIX]  {hex_0x[:80]}{'...' if len(hex_0x)>80 else ''}")
        print(f"[C FORMAT]   {hex_cformat[:80]}{'...' if len(hex_cformat)>80 else ''}")
        print()
        print(f"[DECIMAL VALUES]  {list(data[:20])}{'...' if len(data)>20 else ''}")
        print(f"[OCTAL]           {''.join(f'{b:03o} ' for b in data[:20]).strip()}{'...' if len(data)>20 else ''}")
        print(f"[BINARY (first8)] {'  '.join(f'{b:08b}' for b in data[:8])}{'...' if len(data)>8 else ''}")
        print()
        print(f"[DECODE CMD]  hex_coder.py \"dec:{hex_plain}\"")

    print()
    print("[DONE] Hex operation complete.")

if __name__ == "__main__":
    main()
