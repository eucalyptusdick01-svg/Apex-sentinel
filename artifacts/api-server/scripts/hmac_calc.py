"""
HMAC Calculator — Module 160
Computes HMAC using various hash algorithms.
Usage:
  hmac_calc.py "mykey:Hello World"
  hmac_calc.py "sha512:mykey:Hello World"
  hmac_calc.py "hex-key:DEADBEEF:Hello World"
  hmac_calc.py "verify:mykey:Hello World:EXPECTED_HEX"
"""
import sys
import hmac
import hashlib

ALGORITHMS = {
    "sha256":  hashlib.sha256,
    "sha512":  hashlib.sha512,
    "sha1":    hashlib.sha1,
    "sha384":  hashlib.sha384,
    "sha224":  hashlib.sha224,
    "md5":     hashlib.md5,
    "sha3_256":hashlib.sha3_256,
    "sha3_512":hashlib.sha3_512,
    "blake2b": hashlib.blake2b,
    "blake2s": hashlib.blake2s,
}

def compute_hmac(key: bytes, message: bytes, algo_name: str) -> str:
    algo = ALGORITHMS.get(algo_name.lower().replace("-", "_"))
    if algo is None:
        raise ValueError(f"Unknown algorithm: {algo_name}")
    h = hmac.new(key, message, algo)
    return h.hexdigest()

def main() -> None:
    print("[MODULE 160] HMAC CALCULATOR")
    print("[SOURCE]     HMAC-SHA256/512/SHA1/MD5/BLAKE2 / Python hmac stdlib")
    print()

    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE] hmac_calc.py \"key:message\"")
        print("        hmac_calc.py \"sha512:key:message\"")
        print("        hmac_calc.py \"hex-key:DEADBEEF:message\"")
        print("        hmac_calc.py \"verify:key:message:expected_hex\"")
        sys.exit(1)

    parts = raw.split(":", 3)
    algo = "sha256"
    hex_key = False

    if parts[0].lower() in ALGORITHMS:
        algo = parts[0].lower()
        parts = parts[1:]

    if parts[0].lower() == "hex-key":
        hex_key = True
        parts = parts[1:]

    verify_mode = False
    expected_hex = ""
    if parts[0].lower() == "verify":
        verify_mode = True
        parts = parts[1:]
        if len(parts) >= 3:
            expected_hex = parts[2]
            parts = parts[:2]

    if len(parts) < 2:
        print("[ERROR] Need at least key:message")
        sys.exit(1)

    raw_key     = parts[0]
    raw_message = parts[1] if len(parts) > 1 else ""

    key_bytes = bytes.fromhex(raw_key) if hex_key else raw_key.encode("utf-8")
    msg_bytes = raw_message.encode("utf-8")

    print(f"[ALGORITHM]  HMAC-{algo.upper()}")
    print(f"[KEY]        {raw_key[:40]}{'...' if len(raw_key) > 40 else ''}  ({len(key_bytes)} bytes)")
    print(f"[MESSAGE]    {raw_message[:80]}{'...' if len(raw_message) > 80 else ''}  ({len(msg_bytes)} bytes)")
    print()

    if verify_mode:
        try:
            result = compute_hmac(key_bytes, msg_bytes, algo)
            match = hmac.compare_digest(result.lower(), expected_hex.lower())
            print(f"[COMPUTED]   {result}")
            print(f"[EXPECTED]   {expected_hex}")
            print()
            if match:
                print("[RESULT]  ✓ MATCH — HMAC verified successfully")
            else:
                print("[RESULT]  ✗ MISMATCH — HMAC does not match")
        except Exception as e:
            print(f"[ERROR] {e}")
            sys.exit(1)
    else:
        print("[RESULTS]")
        for name in ALGORITHMS:
            try:
                result = compute_hmac(key_bytes, msg_bytes, name)
                print(f"  HMAC-{name.upper():10s}  {result}")
            except Exception:
                pass

    print()
    print("[DONE] HMAC calculation complete.")

if __name__ == "__main__":
    main()
