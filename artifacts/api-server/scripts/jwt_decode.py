"""JWT Decode — Module 112. Usage: jwt_decode.py "eyJ..." """
import sys, json, base64, hashlib, hmac

def b64decode_padded(s: str) -> bytes:
    s = s.replace("-", "+").replace("_", "/")
    pad = (4 - len(s) % 4) % 4
    return base64.b64decode(s + "=" * pad)

def try_parse_json(data: bytes) -> dict | None:
    try:
        return json.loads(data.decode("utf-8"))
    except Exception:
        return None

ALG_MAP = {
    "HS256": "HMAC-SHA256 (symmetric)",
    "HS384": "HMAC-SHA384 (symmetric)",
    "HS512": "HMAC-SHA512 (symmetric)",
    "RS256": "RSA-SHA256 (asymmetric)",
    "RS384": "RSA-SHA384 (asymmetric)",
    "RS512": "RSA-SHA512 (asymmetric)",
    "ES256": "ECDSA-SHA256 (asymmetric)",
    "ES384": "ECDSA-SHA384 (asymmetric)",
    "ES512": "ECDSA-SHA512 (asymmetric)",
    "PS256": "RSA-PSS-SHA256 (asymmetric)",
    "none":  "None (DANGEROUS — no signature!)",
}

def main():
    print("[MODULE 112] JWT DECODE")
    print("[SOURCE]     Pure Python — JWT header/payload decode + analysis")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  jwt_decode.py \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\"")
        print("         jwt_decode.py \"verify:SECRET:TOKEN\"")
        sys.exit(0)

    secret = None
    if raw.lower().startswith("verify:"):
        parts = raw.split(":", 2)
        if len(parts) == 3:
            secret = parts[1]
            raw    = parts[2]
        else:
            print("[ERROR] verify format: verify:SECRET:TOKEN")
            sys.exit(1)

    token = raw.strip()
    parts = token.split(".")
    if len(parts) < 2:
        print("[ERROR] Not a valid JWT — expected at least 2 dot-separated parts")
        sys.exit(1)

    # Decode header
    try:
        header_bytes = b64decode_padded(parts[0])
        header = try_parse_json(header_bytes)
    except Exception as e:
        print(f"[ERROR] Header decode failed: {e}")
        sys.exit(1)

    # Decode payload
    try:
        payload_bytes = b64decode_padded(parts[1])
        payload = try_parse_json(payload_bytes)
    except Exception as e:
        print(f"[ERROR] Payload decode failed: {e}")
        sys.exit(1)

    print(f"[TOKEN]  {token[:40]}{'...' if len(token)>40 else ''}")
    print(f"[PARTS]  {len(parts)} (header.payload{'.' + 'sig' if len(parts)>2 else ''})")
    print()

    # Header
    print("[HEADER]")
    if header:
        for k, v in header.items():
            alg_desc = ALG_MAP.get(str(v), "") if k == "alg" else ""
            print(f"  {k:10s}  {v}  {alg_desc}")
    else:
        print(f"  (raw)  {header_bytes.hex()}")
    print()

    # Payload
    print("[PAYLOAD]")
    import datetime, time
    NOW = int(time.time())
    if payload:
        for k, v in payload.items():
            extra = ""
            if k in ("exp", "iat", "nbf") and isinstance(v, (int, float)):
                try:
                    dt = datetime.datetime.utcfromtimestamp(v).strftime("%Y-%m-%d %H:%M:%S UTC")
                    if k == "exp":
                        rem = int(v) - NOW
                        if rem < 0:
                            extra = f" ← EXPIRED {abs(rem)//3600}h ago"
                        else:
                            extra = f" ← expires in {rem//3600}h {(rem%3600)//60}m"
                    extra = f"{dt}{extra}"
                except Exception:
                    pass
            print(f"  {k:15s}  {json.dumps(v)[:60]}  {extra}")
    else:
        print(f"  (raw)  {payload_bytes.hex()}")
    print()

    # Signature
    if len(parts) >= 3:
        sig_b64 = parts[2]
        sig_bytes = b64decode_padded(sig_b64)
        print(f"[SIGNATURE]")
        print(f"  Length:  {len(sig_bytes)} bytes")
        print(f"  Hex:     {sig_bytes.hex()[:64]}{'...' if len(sig_bytes)>32 else ''}")
    else:
        print(f"[SIGNATURE]  None (unsigned token!)")
    print()

    # Verify if secret provided
    if secret and header and payload and len(parts) == 3:
        alg = (header.get("alg") or "").upper()
        print(f"[VERIFY] Secret provided — testing HMAC...")
        signing_input = f"{parts[0]}.{parts[1]}".encode()
        if alg == "HS256":
            computed = hmac.new(secret.encode(), signing_input, hashlib.sha256).digest()
        elif alg == "HS384":
            computed = hmac.new(secret.encode(), signing_input, hashlib.sha384).digest()
        elif alg == "HS512":
            computed = hmac.new(secret.encode(), signing_input, hashlib.sha512).digest()
        else:
            computed = None
            print(f"  Cannot verify {alg} with a plain secret (requires public key)")
        if computed is not None:
            expected = b64decode_padded(parts[2])
            if hmac.compare_digest(computed, expected):
                print(f"  ✓ SIGNATURE VALID — secret matches!")
            else:
                print(f"  ✗ SIGNATURE INVALID — wrong secret or tampered token")
    elif header and header.get("alg") == "none":
        print("[SECURITY]  CRITICAL — alg=none token — accepted by vulnerable servers without verification!")

    # Claims analysis
    if payload:
        print("[SECURITY ANALYSIS]")
        if not payload.get("exp"):
            print("  [WARN]  No exp claim — token never expires!")
        elif int(payload.get("exp", 0)) < NOW:
            print("  [WARN]  Token is EXPIRED")
        if not payload.get("iat"):
            print("  [INFO]  No iat (issued-at) claim")
        if not payload.get("iss"):
            print("  [INFO]  No iss (issuer) claim")
        if not payload.get("sub"):
            print("  [INFO]  No sub (subject) claim")
        if not payload.get("aud"):
            print("  [INFO]  No aud (audience) claim — may accept cross-service replay")

    print()
    print("[DONE] JWT decode complete.")

if __name__ == "__main__":
    main()
