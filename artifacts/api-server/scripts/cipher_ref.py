"""Cipher Ref — Module 228. Cipher/algorithm reference guide."""
import sys, re

CIPHERS = {
    "aes": {
        "full": "Advanced Encryption Standard (AES)",
        "type": "Symmetric block cipher",
        "key_sizes": "128, 192, 256 bits",
        "block_size": "128 bits (16 bytes)",
        "modes": "ECB, CBC, CFB, OFB, CTR, GCM (authenticated)",
        "recommended": "AES-256-GCM or AES-256-CBC with HMAC",
        "avoid": "ECB mode (deterministic, leaks patterns)",
        "security": "Current standard — approved for TOP SECRET (NSA Suite B)",
        "use_case": "Symmetric encryption, file/disk/TLS data encryption",
    },
    "rsa": {
        "full": "Rivest–Shamir–Adleman (RSA)",
        "type": "Asymmetric (public-key) cipher",
        "key_sizes": "2048-bit minimum; 3072/4096 recommended",
        "block_size": "Depends on key size",
        "padding": "OAEP (encrypt), PSS (sign) — never use PKCS#1v1.5",
        "security": "2048-bit: ~112 bits security. 3072-bit: ~128 bits",
        "avoid": "Keys < 2048 bits, PKCS#1v1.5 padding (ROBOT attack)",
        "use_case": "Key exchange, digital signatures, certificate authorities",
    },
    "ecc": {
        "full": "Elliptic Curve Cryptography (ECC)",
        "type": "Asymmetric cipher",
        "key_sizes": "256-bit (P-256) ≈ 3072-bit RSA strength",
        "curves": "P-256, P-384, P-521, Curve25519 (recommended), secp256k1",
        "recommended": "Curve25519/Ed25519 for modern systems",
        "avoid": "NIST P-curves (potential NSA backdoor concerns), binary curves",
        "use_case": "TLS, SSH keys, cryptocurrency, mobile TLS",
    },
    "chacha20": {
        "full": "ChaCha20-Poly1305",
        "type": "Symmetric stream cipher (AEAD)",
        "key_size": "256 bits",
        "nonce": "96 bits",
        "security": "Resistant to timing attacks — preferred over AES on CPUs without AES-NI",
        "use_case": "TLS 1.3, mobile TLS, VPNs (WireGuard), SSH",
    },
    "des": {
        "full": "Data Encryption Standard (DES / 3DES)",
        "type": "Symmetric block cipher",
        "key_sizes": "56-bit (DES), 112/168-bit (3DES)",
        "block_size": "64 bits",
        "status": "BROKEN — DES cracked in <24h; 3DES deprecated (Sweet32 attack)",
        "avoid": "Both DES and 3DES in new systems",
        "replaced_by": "AES-256",
    },
    "md5": {
        "full": "MD5 Message Digest",
        "type": "Hash function (128-bit output)",
        "status": "BROKEN — collision attacks demonstrated (2004), not collision-resistant",
        "avoid": "Password storage, certificate signing, digital signatures",
        "safe_for": "Checksums (non-security), file deduplication only",
        "replaced_by": "SHA-256, SHA-3, BLAKE2b",
    },
    "sha1": {
        "full": "SHA-1 (Secure Hash Algorithm 1)",
        "type": "Hash function (160-bit output)",
        "status": "BROKEN — SHAttered collision attack (2017) demonstrated",
        "avoid": "TLS certificates (deprecated 2017), code signing, password storage",
        "safe_for": "Git object hashes (collision impact limited by design), legacy verification",
        "replaced_by": "SHA-256, SHA-384, SHA-512",
    },
    "sha256": {
        "full": "SHA-256 / SHA-2 family",
        "type": "Hash function (256-bit output)",
        "status": "CURRENT — no known weaknesses",
        "key_sizes": "SHA-224, SHA-256, SHA-384, SHA-512",
        "use_case": "Digital signatures, certificates, HMAC, password hashing (with salt)",
        "note": "Use bcrypt/Argon2 for passwords, not raw SHA-256",
    },
    "bcrypt": {
        "full": "bcrypt (Blowfish-based password hash)",
        "type": "Password key derivation function",
        "rounds": "Work factor: 10-12 (adaptive, tunable)",
        "output": "60-char string including salt + hash",
        "status": "CURRENT — recommended for password storage",
        "avoid": "Salting manually (bcrypt includes salt), work factor < 10",
        "note": "Limited to 72 bytes of input — use SHA-256 pre-hash for longer passwords",
    },
    "argon2": {
        "full": "Argon2 (Password Hashing Competition winner, 2015)",
        "type": "Password KDF",
        "variants": "Argon2d (GPU hardness), Argon2i (side-channel), Argon2id (recommended)",
        "status": "CURRENT — best password hashing as of 2024",
        "params": "time_cost, memory_cost (RAM), parallelism",
        "use_case": "Password storage, key derivation from passwords",
    },
    "hmac": {
        "full": "HMAC (Hash-based Message Authentication Code)",
        "type": "Message authentication code",
        "algorithms": "HMAC-SHA256, HMAC-SHA512 (recommended)",
        "status": "CURRENT — secure if key kept secret",
        "use_case": "API authentication, JWT signatures, webhook verification",
        "avoid": "HMAC-MD5, HMAC-SHA1 in new systems",
    },
    "tls": {
        "full": "Transport Layer Security (TLS)",
        "type": "Cryptographic protocol",
        "versions": "1.0, 1.1 (deprecated), 1.2, 1.3 (current)",
        "recommended": "TLS 1.3 (fastest handshake, forward secrecy by default)",
        "avoid": "SSL 2.0/3.0 (POODLE), TLS 1.0/1.1 (BEAST, deprecated per RFC 8996)",
        "cipher_suites": "TLS_AES_256_GCM_SHA384, TLS_CHACHA20_POLY1305_SHA256 (TLS 1.3)",
    },
}

def main():
    print("[MODULE 228] CIPHER REFERENCE")
    print("[SOURCE]     Local reference guide — no external calls")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip().lower()

    if not raw or raw == "all":
        print(f"[AVAILABLE CIPHERS/ALGORITHMS]  ({len(CIPHERS)} entries)")
        print()
        for key, info in CIPHERS.items():
            status = info.get("status", "See details")
            broken = "⚠ " if "BROKEN" in status else ("✓ " if "CURRENT" in status else "  ")
            print(f"  {broken}{key.upper():<12}  {info['full']}")
        print()
        print("[USAGE]  cipher_ref.py aes      — AES details")
        print("[USAGE]  cipher_ref.py broken    — list broken algorithms")
        sys.exit(0)

    if raw == "broken":
        print("[BROKEN / DEPRECATED ALGORITHMS]")
        print()
        for key, info in CIPHERS.items():
            status = info.get("status","")
            if "BROKEN" in status or "deprecated" in status.lower():
                print(f"  ✗  {key.upper()} — {info['full']}")
                print(f"       {status}")
                rep = info.get("replaced_by",""); avoid = info.get("avoid","")
                if rep: print(f"       Replaced by: {rep}")
                if avoid: print(f"       Avoid: {avoid}")
                print()
        sys.exit(0)

    # Fuzzy match
    matches = [(k,v) for k,v in CIPHERS.items() if raw in k.lower() or raw in v.get("full","").lower()]
    if not matches:
        print(f"[NOT FOUND]  '{raw}' — available: {', '.join(CIPHERS.keys())}")
        sys.exit(0)

    for key, info in matches:
        print(f"[{key.upper()}]  {info['full']}")
        print()
        for k,v in info.items():
            if k == "full": continue
            print(f"  {k.upper().replace('_',' '):<16} {v}")
        print()

    print("[DONE] Cipher reference complete.")

if __name__ == "__main__":
    main()
