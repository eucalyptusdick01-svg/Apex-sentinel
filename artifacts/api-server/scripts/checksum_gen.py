"""
Checksum Generator — Module 30
Adapted from user's tkinter checksum tool.
Computes a 3-digit checksum from PAN + Expiry (MMYY) + Service Code.

Usage:
  Single:  checksum_gen.py "4111111111111111,1225,101"
  Bulk:    checksum_gen.py "bulk:PAN1,EXP1,SVC1|PAN2,EXP2,SVC2|..."
  Help:    checksum_gen.py help
"""
import sys
import hashlib

# ── CORE ALGORITHM ────────────────────────────────────────────────────────────

def calculate_checksum(pan: str, expiry: str, service: str) -> str:
    pan_clean    = ''.join(ch for ch in pan if ch.isdigit())
    expiry_clean = str(expiry).zfill(4)
    service_clean = str(service).zfill(3)

    data   = pan_clean + expiry_clean + service_clean
    data32 = (data + "0" * 32)[:32]

    first_half  = data32[:16]
    second_half = data32[16:]

    def des_sim(block: str, key: str) -> str:
        return hashlib.sha256((block + key).encode()).hexdigest()

    key    = "EDUCATIONKEY1234"
    step7  = des_sim(first_half, key)
    step8  = ''.join(
        str((int(a, 16) ^ int(b, 16)) % 16)
        for a, b in zip(step7[:16], second_half[:16])
    )
    step9  = des_sim(step8, key)
    step10 = des_sim(step9, key)
    step11 = des_sim(step10, key)

    digits = ''.join(c for c in step11 if c.isdigit())
    if len(digits) < 3:
        digits = (digits + "000")[:3]
    return digits[:3]

# ── CLI ───────────────────────────────────────────────────────────────────────

USAGE = """
Format (single):  PAN,Expiry(MMYY),ServiceCode
Format (bulk):    bulk:PAN1,EXP1,SVC1|PAN2,EXP2,SVC2|...

Examples:
  4111111111111111,1225,101
  bulk:4111111111111111,1225,101|5500005555555559,0926,201
"""

def print_single(pan: str, expiry: str, service: str, idx: int = 0) -> None:
    try:
        checksum = calculate_checksum(pan, expiry, service)
        if idx:
            print(f"[RECORD {idx:03d}] PAN={pan}  Expiry={expiry}  Service={service}  Checksum={checksum}")
        else:
            print(f"[INPUT]  PAN     : {pan}")
            print(f"[INPUT]  Expiry  : {expiry}")
            print(f"[INPUT]  Service : {service}")
            print()
            print(f"[RESULT] Checksum: {checksum}")
    except Exception as e:
        if idx:
            print(f"[RECORD {idx:03d}] ERROR — {e}")
        else:
            print(f"[ERROR] {e}")

def main() -> None:
    print("[MODULE 030] CHECKSUM GENERATOR")
    print("[SOURCE] PAN + Expiry + Service Code → 3-digit checksum")
    print()

    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()

    if not raw or raw in ("help", "--help"):
        print("[INFO] Usage:" + USAGE)
        sys.exit(0)

    # ── BULK MODE ─────────────────────────────────────────────────────────────
    if raw.lower().startswith("bulk:"):
        payload = raw[5:].strip()
        records = [r.strip() for r in payload.split("|") if r.strip()]
        if not records:
            print("[ERROR] No records found after 'bulk:'. Separate records with |")
            sys.exit(1)

        print(f"[BATCH] Processing {len(records)} record(s)")
        print()
        ok = 0
        for i, record in enumerate(records, 1):
            parts = [p.strip() for p in record.split(",")]
            if len(parts) < 3:
                print(f"[RECORD {i:03d}] ERROR — need PAN,Expiry,ServiceCode  got: {record}")
                continue
            print_single(parts[0], parts[1], parts[2], idx=i)
            ok += 1

        print()
        print(f"[DONE] Processed {ok}/{len(records)} records.")
        sys.exit(0)

    # ── SINGLE MODE ───────────────────────────────────────────────────────────
    parts = [p.strip() for p in raw.split(",")]
    if len(parts) < 3:
        print(f"[ERROR] Expected PAN,Expiry,ServiceCode — got {len(parts)} field(s)")
        print("[INFO] Usage:" + USAGE)
        sys.exit(1)

    print_single(parts[0], parts[1], parts[2])
    print()
    print("[DONE] Checksum generation complete.")

if __name__ == "__main__":
    main()
