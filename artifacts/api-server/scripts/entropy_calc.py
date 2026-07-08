"""
Entropy Calculator — Module 101
Computes Shannon entropy of a string, hex blob, or file path.
Usage:
  entropy_calc.py "Hello World"
  entropy_calc.py "hex:deadbeef0102030405"
  entropy_calc.py "base64:SGVsbG8gV29ybGQ="
  entropy_calc.py "file:/path/to/file.bin"
"""
import sys
import math
import base64
import collections
import os

def shannon_entropy(data: bytes) -> float:
    if not data:
        return 0.0
    freq = collections.Counter(data)
    length = len(data)
    return -sum((c / length) * math.log2(c / length) for c in freq.values())

def entropy_label(e: float) -> str:
    if e < 1.0:
        return "VERY LOW (highly repetitive / almost no variation)"
    if e < 3.0:
        return "LOW (limited character set or highly structured)"
    if e < 5.0:
        return "MEDIUM (natural language or structured data)"
    if e < 6.5:
        return "HIGH (compressed or encrypted-like data)"
    if e < 7.5:
        return "VERY HIGH (likely compressed, encrypted, or packed)"
    return "NEAR-MAX (almost certainly encrypted, compressed, or random)"

def chi_square(data: bytes) -> float:
    freq = collections.Counter(data)
    n = len(data)
    expected = n / 256.0
    return sum((freq.get(i, 0) - expected) ** 2 / expected for i in range(256))

def byte_distribution(data: bytes) -> dict:
    freq = collections.Counter(data)
    total = len(data)
    printable = sum(freq.get(b, 0) for b in range(32, 127))
    null_bytes = freq.get(0, 0)
    high_bytes = sum(freq.get(b, 0) for b in range(128, 256))
    return {
        "printable_pct": printable / total * 100,
        "null_pct": null_bytes / total * 100,
        "high_byte_pct": high_bytes / total * 100,
        "unique_bytes": len(freq),
    }

def main() -> None:
    print("[MODULE 101] ENTROPY CALCULATOR")
    print("[SOURCE]     Shannon entropy + byte distribution analysis")
    print()

    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No input supplied.")
        print("[USAGE] entropy_calc.py \"Hello World\"")
        print("        entropy_calc.py \"hex:deadbeef\"")
        print("        entropy_calc.py \"base64:SGVsbG8=\"")
        sys.exit(1)

    label = "string"
    data: bytes

    if raw.lower().startswith("hex:"):
        hex_str = raw[4:].replace(" ", "").replace("\n", "")
        try:
            data = bytes.fromhex(hex_str)
            label = f"hex ({len(data)} bytes)"
        except ValueError as e:
            print(f"[ERROR] Invalid hex: {e}")
            sys.exit(1)

    elif raw.lower().startswith("base64:"):
        try:
            data = base64.b64decode(raw[7:])
            label = f"base64 ({len(data)} bytes)"
        except Exception as e:
            print(f"[ERROR] Invalid base64: {e}")
            sys.exit(1)

    elif raw.lower().startswith("file:"):
        path = raw[5:]
        if not os.path.isfile(path):
            print(f"[ERROR] File not found: {path}")
            sys.exit(1)
        with open(path, "rb") as f:
            data = f.read()
        label = f"file '{os.path.basename(path)}' ({len(data)} bytes)"

    else:
        data = raw.encode("utf-8")
        label = f"string ({len(data)} bytes)"

    print(f"[INPUT]   {label}")
    print()

    if len(data) == 0:
        print("[ERROR] Empty input — cannot compute entropy.")
        sys.exit(1)

    ent = shannon_entropy(data)
    chi = chi_square(data)
    dist = byte_distribution(data)

    print(f"[ENTROPY]     {ent:.4f} bits/byte  (max = 8.0)")
    print(f"[ASSESSMENT]  {entropy_label(ent)}")
    print()
    print(f"[CHI-SQUARE]  {chi:.2f}  (lower = more uniform distribution)")
    print()
    print("[BYTE DISTRIBUTION]")
    print(f"  Printable ASCII  : {dist['printable_pct']:5.1f}%")
    print(f"  High bytes (>127): {dist['high_byte_pct']:5.1f}%")
    print(f"  Null bytes       : {dist['null_pct']:5.1f}%")
    print(f"  Unique byte vals : {dist['unique_bytes']} / 256")
    print()

    if ent > 7.0:
        print("[FLAG] High entropy detected — possible encrypted/compressed/obfuscated content")
    elif dist["null_pct"] > 30:
        print("[FLAG] High null-byte ratio — sparse binary format (debug symbols, padding)")
    elif dist["printable_pct"] > 90 and ent < 4.5:
        print("[FLAG] Mostly printable ASCII with low entropy — plain text or structured config")

    print()
    print("[DONE] Entropy calculation complete.")

if __name__ == "__main__":
    main()
