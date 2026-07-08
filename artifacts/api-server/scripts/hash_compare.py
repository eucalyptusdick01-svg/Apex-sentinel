"""
Hash Compare — Module 161
Hash a value with multiple algorithms and optionally compare against a known hash.
Usage:
  hash_compare.py "Hello World"
  hash_compare.py "file:/path/to/file"
  hash_compare.py "verify:5eb63bbbe01eeed093cb22bb8f5acdc3:Hello World"
  hash_compare.py "hex:DEADBEEF0102"
"""
import sys
import hashlib
import base64
import os

ALGOS = ["md5", "sha1", "sha224", "sha256", "sha384", "sha512",
         "sha3_256", "sha3_512", "blake2s", "blake2b"]

def hash_all(data: bytes) -> dict:
    results = {}
    for a in ALGOS:
        try:
            h = hashlib.new(a, data)
            results[a] = h.hexdigest()
        except Exception:
            pass
    results["crc32"] = format(__import__("zlib").crc32(data) & 0xFFFFFFFF, "08x")
    return results

def main() -> None:
    print("[MODULE 161] HASH COMPARE")
    print("[SOURCE]     MD5 / SHA family / BLAKE2 / CRC32 — Python hashlib")
    print()

    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE] hash_compare.py \"Hello World\"")
        print("        hash_compare.py \"file:/path/to/file\"")
        print("        hash_compare.py \"verify:EXPECTED_HEX:Hello World\"")
        print("        hash_compare.py \"hex:DEADBEEF\"")
        sys.exit(1)

    verify_mode = False
    expected = ""

    if raw.lower().startswith("verify:"):
        verify_mode = True
        rest = raw[7:]
        colon = rest.find(":")
        if colon == -1:
            print("[ERROR] Format: verify:EXPECTED_HASH:value")
            sys.exit(1)
        expected = rest[:colon].lower()
        raw = rest[colon + 1:]

    data: bytes
    label = ""

    if raw.lower().startswith("file:"):
        path = raw[5:]
        if not os.path.isfile(path):
            print(f"[ERROR] File not found: {path}")
            sys.exit(1)
        with open(path, "rb") as f:
            data = f.read()
        size = os.path.getsize(path)
        label = f"file '{os.path.basename(path)}' ({size:,} bytes)"
    elif raw.lower().startswith("hex:"):
        try:
            data = bytes.fromhex(raw[4:].replace(" ", ""))
            label = f"hex input ({len(data)} bytes)"
        except ValueError as e:
            print(f"[ERROR] Invalid hex: {e}")
            sys.exit(1)
    else:
        data = raw.encode("utf-8")
        label = f"string ({len(data)} bytes)"

    print(f"[INPUT]   {label}")
    if not label.startswith("file"):
        preview = data[:60].decode("utf-8", errors="replace")
        print(f"[VALUE]   {preview}{'...' if len(data) > 60 else ''}")
    print()

    hashes = hash_all(data)

    print("[HASHES]")
    for algo, hexdigest in hashes.items():
        b64digest = base64.b64encode(bytes.fromhex(hexdigest) if len(hexdigest) % 2 == 0 else b"").decode() if len(hexdigest) > 8 else ""
        b64_str = f"  (base64: {b64digest})" if b64digest else ""
        print(f"  {algo.upper():12s}  {hexdigest}{b64_str}")

    if verify_mode:
        print()
        print(f"[VERIFY]  Expected: {expected}")
        matched_algo = None
        for algo, hexdigest in hashes.items():
            if hexdigest.lower() == expected.lower():
                matched_algo = algo.upper()
                break

        if matched_algo:
            print(f"[RESULT]  ✓ MATCH — {matched_algo} hash matches expected value")
        else:
            print(f"[RESULT]  ✗ NO MATCH — expected hash not found in any algorithm")
            print(f"          Hash length {len(expected)} chars → "
                  f"{'MD5' if len(expected)==32 else 'SHA1' if len(expected)==40 else 'SHA256' if len(expected)==64 else 'SHA512' if len(expected)==128 else 'unknown'} format")

    print()
    print("[DONE] Hash comparison complete.")

if __name__ == "__main__":
    main()
