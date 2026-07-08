"""
AES Cipher — Module 157
AES-256-CBC encrypt/decrypt with PBKDF2 key derivation.
Usage:
  aes_cipher.py "enc:mypassword:Hello World"
  aes_cipher.py "dec:mypassword:BASE64_CIPHERTEXT"
  aes_cipher.py "keygen:256"
"""
import sys
import base64
import os

try:
    from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
    from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
    from cryptography.hazmat.primitives import hashes, padding
    CRYPTO_OK = True
except ImportError:
    CRYPTO_OK = False

SALT_SIZE = 16
IV_SIZE   = 16
ITERATIONS = 100_000
KEY_SIZE   = 32

def derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=KEY_SIZE, salt=salt, iterations=ITERATIONS)
    return kdf.derive(password.encode("utf-8"))

def encrypt(password: str, plaintext: str) -> str:
    salt = os.urandom(SALT_SIZE)
    iv   = os.urandom(IV_SIZE)
    key  = derive_key(password, salt)

    padder = padding.PKCS7(128).padder()
    pt_bytes = plaintext.encode("utf-8")
    padded = padder.update(pt_bytes) + padder.finalize()

    cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
    enc = cipher.encryptor()
    ct = enc.update(padded) + enc.finalize()

    blob = salt + iv + ct
    return base64.b64encode(blob).decode("ascii")

def decrypt(password: str, ciphertext_b64: str) -> str:
    try:
        blob = base64.b64decode(ciphertext_b64)
    except Exception:
        raise ValueError("Invalid base64 ciphertext")

    if len(blob) < SALT_SIZE + IV_SIZE + 16:
        raise ValueError("Ciphertext too short — may be corrupt or wrong format")

    salt = blob[:SALT_SIZE]
    iv   = blob[SALT_SIZE:SALT_SIZE + IV_SIZE]
    ct   = blob[SALT_SIZE + IV_SIZE:]
    key  = derive_key(password, salt)

    cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
    dec = cipher.decryptor()
    padded = dec.update(ct) + dec.finalize()

    unpadder = padding.PKCS7(128).unpadder()
    pt = unpadder.update(padded) + unpadder.finalize()
    return pt.decode("utf-8")

def main() -> None:
    print("[MODULE 157] AES CIPHER")
    print("[SOURCE]     AES-256-CBC / PBKDF2-SHA256 key derivation")
    print()

    if not CRYPTO_OK:
        print("[ERROR] cryptography library not installed.")
        print("[FIX]   pip install cryptography")
        sys.exit(1)

    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE] aes_cipher.py \"enc:password:plaintext\"")
        print("        aes_cipher.py \"dec:password:BASE64_CIPHERTEXT\"")
        print("        aes_cipher.py \"keygen:256\"")
        sys.exit(1)

    parts = raw.split(":", 2)
    mode = parts[0].lower()

    if mode == "keygen":
        size = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 256
        size_bytes = size // 8
        key = os.urandom(size_bytes)
        print(f"[KEYGEN]  AES-{size} random key")
        print()
        print(f"[HEX]     {key.hex().upper()}")
        print(f"[BASE64]  {base64.b64encode(key).decode()}")
        print(f"[LENGTH]  {size_bytes} bytes / {size} bits")
        print()
        print("[DONE] Key generation complete.")
        return

    if len(parts) < 3:
        print("[ERROR] Expected format: mode:password:data")
        sys.exit(1)

    password, data = parts[1], parts[2]

    if mode == "enc":
        print(f"[MODE]      ENCRYPT")
        print(f"[ALGORITHM] AES-256-CBC + PKCS7 padding")
        print(f"[KDF]       PBKDF2-SHA256  {ITERATIONS:,} iterations  {SALT_SIZE}-byte random salt")
        print(f"[PLAINTEXT] {data[:80]}{'...' if len(data) > 80 else ''}")
        print()
        try:
            ct = encrypt(password, data)
            print(f"[CIPHERTEXT (base64)]")
            for i in range(0, len(ct), 76):
                print(f"  {ct[i:i+76]}")
            print()
            print(f"[DECODE CMD] aes_cipher.py \"dec:{password}:{ct}\"")
        except Exception as e:
            print(f"[ERROR] {e}")
            sys.exit(1)

    elif mode == "dec":
        print(f"[MODE]      DECRYPT")
        print(f"[ALGORITHM] AES-256-CBC + PKCS7 padding")
        print()
        try:
            pt = decrypt(password, data)
            print(f"[PLAINTEXT]")
            print(f"  {pt}")
        except Exception as e:
            print(f"[ERROR] Decryption failed — wrong password or corrupt data: {e}")
            sys.exit(1)

    else:
        print(f"[ERROR] Unknown mode '{mode}'. Use enc, dec, or keygen.")
        sys.exit(1)

    print()
    print("[DONE] AES operation complete.")

if __name__ == "__main__":
    main()
