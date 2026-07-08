"""
RSA Key Generator — Module 158
Generates RSA keypairs and can encrypt/decrypt small messages.
Usage:
  rsa_keygen.py "2048"                    (generate 2048-bit keypair)
  rsa_keygen.py "4096"                    (generate 4096-bit keypair)
  rsa_keygen.py "enc:PUBLIC_KEY_B64:msg"  (encrypt with public key)
  rsa_keygen.py "dec:PRIVATE_KEY_B64:ct"  (decrypt with private key)
"""
import sys
import base64

try:
    from cryptography.hazmat.primitives.asymmetric import rsa, padding as asym_padding
    from cryptography.hazmat.primitives import serialization, hashes
    CRYPTO_OK = True
except ImportError:
    CRYPTO_OK = False

def generate_keypair(bits: int) -> tuple[str, str]:
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=bits)
    pub_pem = private_key.public_key().public_bytes(
        serialization.Encoding.PEM,
        serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode()
    priv_pem = private_key.private_bytes(
        serialization.Encoding.PEM,
        serialization.PrivateFormat.TraditionalOpenSSL,
        serialization.NoEncryption(),
    ).decode()
    return pub_pem, priv_pem

def main() -> None:
    print("[MODULE 158] RSA KEY GENERATOR")
    print("[SOURCE]     PKCS#1 v1.5 / OAEP RSA keypair generation")
    print()

    if not CRYPTO_OK:
        print("[ERROR] cryptography library not installed.")
        print("[FIX]   pip install cryptography")
        sys.exit(1)

    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "2048").strip()

    bits = 2048
    if raw.isdigit():
        bits = int(raw)
        if bits not in (1024, 2048, 3072, 4096):
            print(f"[WARN]  Non-standard key size {bits} — using 2048")
            bits = 2048
    elif raw.startswith("enc:") or raw.startswith("dec:"):
        parts = raw.split(":", 2)
        if len(parts) < 3:
            print("[ERROR] Format: enc:PUBLIC_KEY_B64:message  or  dec:PRIVATE_KEY_B64:ciphertext_b64")
            sys.exit(1)
        mode = parts[0]
        key_b64 = parts[1]
        data = parts[2]

        try:
            key_pem = base64.b64decode(key_b64.encode())
        except Exception:
            print("[ERROR] Invalid base64 key")
            sys.exit(1)

        if mode == "enc":
            from cryptography.hazmat.primitives.serialization import load_pem_public_key
            try:
                pub = load_pem_public_key(key_pem)
                ct = pub.encrypt(data.encode(), asym_padding.OAEP(
                    mgf=asym_padding.MGF1(hashes.SHA256()), algorithm=hashes.SHA256(), label=None))
                ct_b64 = base64.b64encode(ct).decode()
                print(f"[ENCRYPT]   OAEP-SHA256")
                print(f"[PLAINTEXT] {data}")
                print()
                print(f"[CIPHERTEXT (base64)]")
                for i in range(0, len(ct_b64), 76):
                    print(f"  {ct_b64[i:i+76]}")
            except Exception as e:
                print(f"[ERROR] Encryption failed: {e}")
                sys.exit(1)

        elif mode == "dec":
            from cryptography.hazmat.primitives.serialization import load_pem_private_key
            try:
                priv = load_pem_private_key(key_pem, password=None)
                ct = base64.b64decode(data)
                pt = priv.decrypt(ct, asym_padding.OAEP(
                    mgf=asym_padding.MGF1(hashes.SHA256()), algorithm=hashes.SHA256(), label=None))
                print(f"[DECRYPT]   OAEP-SHA256")
                print(f"[PLAINTEXT] {pt.decode('utf-8', errors='replace')}")
            except Exception as e:
                print(f"[ERROR] Decryption failed: {e}")
                sys.exit(1)

        print()
        print("[DONE] RSA operation complete.")
        return

    print(f"[GENERATING] RSA-{bits} keypair  (this may take a moment)...")
    print()
    pub_pem, priv_pem = generate_keypair(bits)

    pub_b64  = base64.b64encode(pub_pem.encode()).decode()
    priv_b64 = base64.b64encode(priv_pem.encode()).decode()

    print("[PUBLIC KEY (PEM)]")
    for line in pub_pem.strip().split("\n"):
        print(f"  {line}")

    print()
    print("[PRIVATE KEY (PEM)] — keep secret!")
    for line in priv_pem.strip().split("\n"):
        print(f"  {line}")

    print()
    print("[PUBLIC KEY (base64, for enc: mode)]")
    for i in range(0, len(pub_b64), 76):
        print(f"  {pub_b64[i:i+76]}")

    print()
    print("[PRIVATE KEY (base64, for dec: mode)]")
    for i in range(0, len(priv_b64), 76):
        print(f"  {priv_b64[i:i+76]}")

    print()
    print(f"[INFO] Key size: {bits} bits")
    print(f"[INFO] To encrypt: rsa_keygen.py \"enc:<PUBLIC_KEY_B64>:<message>\"")
    print(f"[INFO] To decrypt: rsa_keygen.py \"dec:<PRIVATE_KEY_B64>:<ciphertext_b64>\"")
    print()
    print("[DONE] RSA key generation complete.")

if __name__ == "__main__":
    main()
