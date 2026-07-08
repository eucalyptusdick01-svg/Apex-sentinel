"""
Evidence Hasher — Module 213
Generates a chain-of-custody hash log for digital forensics.
Computes MD5, SHA1, SHA256, SHA512 + timestamp + evidence record.
Usage:
  evidence_hash.py "Hello World"
  evidence_hash.py "file:/path/to/evidence"
  evidence_hash.py "hex:DEADBEEF0102"
  evidence_hash.py "case:Case-2024-001:analyst:John Smith:file:/path/to/file"
"""
import sys
import hashlib
import os
import zlib
from datetime import datetime, timezone

def hash_data(data: bytes) -> dict:
    return {
        "md5":    hashlib.md5(data).hexdigest(),
        "sha1":   hashlib.sha1(data).hexdigest(),
        "sha256": hashlib.sha256(data).hexdigest(),
        "sha512": hashlib.sha512(data).hexdigest(),
        "crc32":  format(zlib.crc32(data) & 0xFFFFFFFF, "08x"),
        "size":   len(data),
    }

def chain_signature(case_id: str, analyst: str, hashes: dict, ts: str) -> str:
    chain_input = f"{case_id}|{analyst}|{ts}|{hashes['sha256']}"
    return hashlib.sha256(chain_input.encode()).hexdigest()

def main() -> None:
    print("[MODULE 213] EVIDENCE HASHER")
    print("[SOURCE]     MD5/SHA1/SHA256/SHA512/CRC32 + chain-of-custody record")
    print()

    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE] evidence_hash.py \"Hello World\"")
        print("        evidence_hash.py \"file:/path/to/file\"")
        print("        evidence_hash.py \"hex:DEADBEEF\"")
        print("        evidence_hash.py \"case:CaseID:analyst:Name:file:/path\"")
        sys.exit(1)

    case_id  = "UNSET"
    analyst  = "UNSET"
    evidence_label = ""

    if raw.lower().startswith("case:"):
        parts = raw.split(":")
        if len(parts) >= 4:
            case_id = parts[1]
            if parts[2].lower() == "analyst":
                analyst = parts[3]
                raw = ":".join(parts[4:])
            else:
                raw = ":".join(parts[2:])

    data: bytes

    if raw.lower().startswith("file:"):
        path = raw[5:]
        if not os.path.isfile(path):
            print(f"[ERROR] File not found: {path}")
            sys.exit(1)
        with open(path, "rb") as f:
            data = f.read()
        evidence_label = f"FILE: {os.path.abspath(path)}"
    elif raw.lower().startswith("hex:"):
        try:
            data = bytes.fromhex(raw[4:].replace(" ", ""))
            evidence_label = f"HEX INPUT ({len(data)} bytes)"
        except ValueError as e:
            print(f"[ERROR] Invalid hex: {e}")
            sys.exit(1)
    else:
        data = raw.encode("utf-8")
        evidence_label = f"STRING INPUT ({len(data)} bytes)"

    ts_utc = datetime.now(timezone.utc)
    ts_str = ts_utc.strftime("%Y-%m-%dT%H:%M:%SZ")
    hashes = hash_data(data)
    chain_sig = chain_signature(case_id, analyst, hashes, ts_str)

    print("=" * 72)
    print("  DIGITAL EVIDENCE HASH RECORD")
    print("=" * 72)
    print(f"  Timestamp (UTC)  : {ts_str}")
    print(f"  Case ID          : {case_id}")
    print(f"  Analyst          : {analyst}")
    print(f"  Evidence         : {evidence_label}")
    print(f"  Size             : {hashes['size']:,} bytes")
    print("=" * 72)
    print()
    print("[HASH VALUES]")
    print(f"  CRC32    : {hashes['crc32'].upper()}")
    print(f"  MD5      : {hashes['md5']}")
    print(f"  SHA-1    : {hashes['sha1']}")
    print(f"  SHA-256  : {hashes['sha256']}")
    print(f"  SHA-512  : {hashes['sha512']}")
    print()
    print("[CHAIN OF CUSTODY]")
    print(f"  Signature : {chain_sig}")
    print(f"  Generated : HMAC-free chain — SHA256(case|analyst|ts|sha256hash)")
    print()
    print("[VERIFICATION COMMAND]")
    print(f"  To verify later, re-run with same input and compare SHA-256:")
    print(f"  Expected: {hashes['sha256']}")
    print()

    if case_id != "UNSET":
        print("[REPORT BLOCK — copy for incident report]")
        print(f"  Evidence Item: {evidence_label}")
        print(f"  Collected By : {analyst}")
        print(f"  Date/Time    : {ts_str}")
        print(f"  SHA-256      : {hashes['sha256']}")
        print(f"  Chain Sig    : {chain_sig}")
        print()

    print("[DONE] Evidence hashing complete.")

if __name__ == "__main__":
    main()
