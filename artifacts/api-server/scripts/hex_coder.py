"""Hex Coder — Module 105. Usage: hex_coder.py "enc:Hello" or "dec:48656c6c6f" or "dump:text" """
import sys, binascii

def hexdump(data: bytes, width: int = 16) -> str:
    lines = []
    for i in range(0, len(data), width):
        chunk = data[i:i+width]
        hex_part = " ".join(f"{b:02x}" for b in chunk)
        ascii_part = "".join(chr(b) if 32 <= b < 127 else "." for b in chunk)
        lines.append(f"  {i:08x}  {hex_part:<{width*3}}  |{ascii_part}|")
    return "\n".join(lines)

def main():
    print("[MODULE 105] HEX CODER")
    print("[SOURCE]     Python stdlib binascii — hex encode/decode/dump")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw or raw == "help":
        print("[MODES]")
        print("  enc:TEXT      → encode text to hex")
        print("  dec:HEXSTR    → decode hex to text")
        print("  dump:TEXT     → hexdump of text (Wireshark-style)")
        print("  b64:HEXSTR    → convert hex to base64")
        print("  rev:HEXSTR    → reverse byte order of hex string")
        print("  xor:KEY:HEX   → XOR hex bytes with key")
        sys.exit(0)

    if ":" in raw:
        mode, _, data = raw.partition(":")
        mode = mode.strip().lower()
    else:
        mode = "enc"
        data = raw

    print(f"[MODE]   {mode}")
    print()

    try:
        if mode == "enc":
            encoded = data.encode().hex()
            print(f"[HEX]    {encoded}")
            print(f"[UPPER]  {encoded.upper()}")
            print(f"[SPACED] {' '.join(encoded[i:i+2] for i in range(0, len(encoded), 2))}")
            print(f"[BYTES]  {len(data)} bytes  →  {len(encoded)} hex chars")
        elif mode == "dec":
            clean = data.replace(" ","").replace("0x","").replace("\\x","")
            raw_bytes = bytes.fromhex(clean)
            decoded = raw_bytes.decode("utf-8", errors="replace")
            print(f"[DECODED]  {decoded}")
            print(f"[BYTES]    {len(raw_bytes)}")
        elif mode == "dump":
            raw_bytes = data.encode()
            print(f"[INPUT]  {len(raw_bytes)} bytes")
            print()
            print(hexdump(raw_bytes))
        elif mode == "b64":
            import base64
            clean = data.replace(" ","").replace("0x","")
            raw_bytes = bytes.fromhex(clean)
            print(f"[BASE64]  {base64.b64encode(raw_bytes).decode()}")
        elif mode == "rev":
            clean = data.replace(" ","").replace("0x","")
            raw_bytes = bytes.fromhex(clean)
            rev = raw_bytes[::-1]
            print(f"[REVERSED HEX]  {rev.hex()}")
            print(f"[AS TEXT]       {rev.decode('utf-8', errors='replace')}")
        elif mode == "xor":
            # xor:KEY:HEXDATA
            parts = data.split(":", 1)
            if len(parts) < 2:
                print("[ERROR] Format: xor:KEY:HEXDATA")
                sys.exit(1)
            key_raw, hex_data = parts[0], parts[1]
            key_bytes = key_raw.encode()
            data_bytes = bytes.fromhex(hex_data.replace(" ",""))
            result = bytes(b ^ key_bytes[i % len(key_bytes)] for i, b in enumerate(data_bytes))
            print(f"[KEY]     {key_raw!r}  ({len(key_bytes)} bytes)")
            print(f"[XOR HEX] {result.hex()}")
            print(f"[XOR TXT] {result.decode('utf-8', errors='replace')}")
        else:
            print(f"[ERROR] Unknown mode '{mode}'")
            sys.exit(1)
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

    print()
    print("[DONE] Hex operation complete.")

if __name__ == "__main__":
    main()
