"""Bin Convert — Module 219. Binary/hex/octal/text multi-format converter."""
import sys, binascii, struct

def try_all(data):
    """Try all conversions for raw input."""
    results = {}

    # If it looks like binary string (0/1 only with spaces)
    clean = data.replace(" ", "").replace("\n", "")
    if re.match(r'^[01]+$', clean) if len(clean) > 0 else False:
        try:
            # Binary to text
            chunks = [clean[i:i+8] for i in range(0, len(clean), 8)]
            text = "".join(chr(int(c, 2)) for c in chunks if len(c) == 8)
            results["binary→text"] = repr(text)
            results["binary→decimal"] = str(int(clean, 2))
            results["binary→hex"] = hex(int(clean, 2))
        except: pass

    # If it looks like hex
    if re.match(r'^(0x)?[0-9a-fA-F\s]+$', data):
        hex_clean = re.sub(r'[^0-9a-fA-F]', '', data)
        if len(hex_clean) % 2 == 0:
            try:
                text = bytes.fromhex(hex_clean).decode('utf-8', errors='replace')
                results["hex→text"] = repr(text)
                results["hex→decimal"] = str(int(hex_clean, 16))
                results["hex→binary"] = bin(int(hex_clean, 16))[2:]
            except: pass

    return results

import re

def to_binary(text):
    return " ".join(format(ord(c), "08b") for c in text)

def to_hex_dump(text):
    lines = []
    data = text.encode("utf-8", errors="replace")
    for i in range(0, len(data), 16):
        chunk = data[i:i+16]
        hex_part = " ".join(f"{b:02x}" for b in chunk)
        ascii_part = "".join(chr(b) if 32 <= b < 127 else "." for b in chunk)
        lines.append(f"  {i:04x}  {hex_part:<47}  |{ascii_part}|")
    return "\n".join(lines)

def main():
    print("[MODULE 219] BINARY CONVERTER")
    print("[SOURCE]     Python struct/binascii stdlib — no external calls")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  bin:TEXT            — text to binary")
        print("         hex:TEXT            — text to hex dump")
        print("         oct:TEXT            — text to octal")
        print("         dec:TEXT            — char codes (decimal)")
        print("         from_bin:BINSTRING  — binary to text")
        print("         from_hex:HEXSTRING  — hex to text")
        print("         from_oct:OCTSTRING  — octal to text")
        print("[EXAMPLE] bin:Hello World")
        sys.exit(0)

    if raw.startswith("bin:"):
        text = raw[4:]
        binary = to_binary(text)
        print(f"[INPUT]   {text}")
        print(f"[BINARY]  {binary}")
        print(f"[HEX]     {text.encode().hex()}")
        print(f"[OCTAL]   {' '.join(format(ord(c), 'o') for c in text)}")

    elif raw.startswith("hex:"):
        text = raw[4:]
        print(f"[INPUT]   {text}")
        print(f"[HEX]     {text.encode('utf-8').hex()}")
        print(f"[HEX SPACED]  {' '.join(f'{b:02x}' for b in text.encode('utf-8'))}")
        print()
        print("[HEX DUMP]")
        print(to_hex_dump(text))

    elif raw.startswith("oct:"):
        text = raw[4:]
        print(f"[INPUT]   {text}")
        print(f"[OCTAL]   {' '.join(format(ord(c), 'o') for c in text)}")
        print(f"[OCTAL (no space)]  {''.join(format(ord(c), 'o') for c in text)}")

    elif raw.startswith("dec:"):
        text = raw[4:]
        print(f"[INPUT]    {text}")
        print(f"[DECIMAL]  {' '.join(str(ord(c)) for c in text)}")

    elif raw.startswith("from_bin:"):
        bits = raw[9:].replace(" ","")
        try:
            chunks = [bits[i:i+8] for i in range(0, len(bits), 8)]
            text = "".join(chr(int(c,2)) for c in chunks if len(c)==8)
            print(f"[BINARY]  {raw[9:].strip()}")
            print(f"[TEXT]    {text}")
            print(f"[HEX]     {text.encode().hex()}")
        except Exception as e:
            print(f"[ERROR] {e}")

    elif raw.startswith("from_hex:"):
        hex_str = re.sub(r'[^0-9a-fA-F]', '', raw[9:])
        try:
            data = bytes.fromhex(hex_str)
            text = data.decode("utf-8", errors="replace")
            print(f"[HEX]     {hex_str}")
            print(f"[TEXT]    {text}")
            print(f"[BINARY]  {' '.join(format(b,'08b') for b in data[:8])}{'...' if len(data)>8 else ''}")
            print(f"[DECIMAL] {int(hex_str,16)}")
        except Exception as e:
            print(f"[ERROR] {e}")

    elif raw.startswith("from_oct:"):
        oct_parts = raw[9:].split()
        try:
            text = "".join(chr(int(o,8)) for o in oct_parts)
            print(f"[OCTAL]   {raw[9:].strip()}")
            print(f"[TEXT]    {text}")
        except Exception as e:
            print(f"[ERROR] {e}")

    else:
        # Auto-detect and show all representations
        print(f"[INPUT]    {raw}")
        print()
        print(f"[BINARY]   {to_binary(raw)}")
        print(f"[HEX]      {raw.encode('utf-8').hex()}")
        print(f"[OCTAL]    {' '.join(format(ord(c),'o') for c in raw)}")
        print(f"[DECIMAL]  {' '.join(str(ord(c)) for c in raw)}")
        print()
        print("[HEX DUMP]")
        print(to_hex_dump(raw))

    print()
    print("[DONE] Binary conversion complete.")

if __name__ == "__main__":
    main()
