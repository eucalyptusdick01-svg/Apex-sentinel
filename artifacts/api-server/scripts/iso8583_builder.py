import sys
import json
import binascii

# ISO 8583 field definitions (ASCII spec, de=Data Element)
# (max_len, type, description)
# type: F=fixed, LLVAR=2-digit length prefix, LLLVAR=3-digit length prefix
FIELD_DEFS = {
    1:  (16,  "F",      "Secondary Bitmap"),
    2:  (19,  "LLVAR",  "Primary Account Number (PAN)"),
    3:  (6,   "F",      "Processing Code"),
    4:  (12,  "F",      "Transaction Amount"),
    5:  (12,  "F",      "Settlement Amount"),
    6:  (12,  "F",      "Cardholder Billing Amount"),
    7:  (10,  "F",      "Transmission Date & Time (MMDDHHmmss)"),
    8:  (8,   "F",      "Cardholder Billing Fee Amount"),
    9:  (8,   "F",      "Settlement Conversion Rate"),
    10: (8,   "F",      "Cardholder Billing Conversion Rate"),
    11: (6,   "F",      "Systems Trace Audit Number (STAN)"),
    12: (6,   "F",      "Local Transaction Time (HHmmss)"),
    13: (4,   "F",      "Local Transaction Date (MMDD)"),
    14: (4,   "F",      "Expiration Date (YYMM)"),
    15: (4,   "F",      "Settlement Date (MMDD)"),
    16: (4,   "F",      "Currency Conversion Date"),
    17: (4,   "F",      "Capture Date"),
    18: (4,   "F",      "Merchant Type (MCC)"),
    19: (3,   "F",      "Acquiring Institution Country Code"),
    20: (3,   "F",      "PAN Extended Country Code"),
    22: (3,   "F",      "Point of Service Entry Mode"),
    23: (3,   "F",      "Application PAN Sequence Number"),
    24: (3,   "F",      "Network International ID (NII)"),
    25: (2,   "F",      "Point of Service Condition Code"),
    26: (2,   "F",      "POS PIN Capture Code"),
    32: (11,  "LLVAR",  "Acquiring Institution ID Code"),
    35: (37,  "LLVAR",  "Track 2 Data"),
    37: (12,  "F",      "Retrieval Reference Number"),
    38: (6,   "F",      "Authorization ID Response"),
    39: (2,   "F",      "Response Code"),
    41: (8,   "F",      "Card Acceptor Terminal ID"),
    42: (15,  "F",      "Card Acceptor ID Code"),
    43: (40,  "LLVAR",  "Card Acceptor Name/Location"),
    49: (3,   "F",      "Transaction Currency Code"),
    51: (3,   "F",      "Cardholder Billing Currency Code"),
    52: (8,   "F",      "PIN Data (hex)"),
    54: (120, "LLLVAR", "Additional Amounts"),
    55: (999, "LLLVAR", "ICC Data (EMV)"),
    60: (999, "LLLVAR", "Reserved Private 1"),
    63: (999, "LLLVAR", "Reserved Private 4"),
}

CURRENCY_CODES = {
    "840": "USD (US Dollar)",
    "978": "EUR (Euro)",
    "826": "GBP (British Pound)",
    "392": "JPY (Japanese Yen)",
    "124": "CAD (Canadian Dollar)",
    "036": "AUD (Australian Dollar)",
    "756": "CHF (Swiss Franc)",
    "156": "CNY (Chinese Yuan)",
    "356": "INR (Indian Rupee)",
    "458": "MYR (Malaysian Ringgit)",
    "702": "SGD (Singapore Dollar)",
    "784": "AED (UAE Dirham)",
}

MTI_DESCRIPTIONS = {
    "0100": "Authorization Request",
    "0110": "Authorization Response",
    "0200": "Financial Transaction Request",
    "0210": "Financial Transaction Response",
    "0220": "Financial Transaction Advice",
    "0230": "Financial Transaction Advice Response",
    "0400": "Reversal Request",
    "0410": "Reversal Response",
    "0420": "Reversal Advice",
    "0800": "Network Management Request",
    "0810": "Network Management Response",
}

def build_bitmap(fields):
    """Build primary (and secondary if needed) 64/128-bit bitmap."""
    field_nums = sorted(n for n in fields if isinstance(n, int) and n != 1)
    has_secondary = any(n > 64 for n in field_nums)
    bitmap = [0] * (128 if has_secondary else 64)
    if has_secondary:
        bitmap[0] = 1  # bit 1 = secondary bitmap present
    for n in field_nums:
        bitmap[n - 1] = 1
    # pack bits into hex
    result = ""
    for i in range(0, len(bitmap), 4):
        nibble = bitmap[i]*8 + bitmap[i+1]*4 + bitmap[i+2]*2 + bitmap[i+3]
        result += f"{nibble:X}"
    return result

def encode_field(num, value, fdef):
    max_len, ftype, desc = fdef
    val = str(value)
    if ftype == "F":
        if len(val) > max_len:
            val = val[:max_len]
        return val.ljust(max_len)[:max_len], val
    elif ftype == "LLVAR":
        length_prefix = f"{len(val):02d}"
        return f"{length_prefix}{val}", val
    elif ftype == "LLLVAR":
        length_prefix = f"{len(val):03d}"
        return f"{length_prefix}{val}", val
    return val, val

def explain_field(num, value):
    desc = FIELD_DEFS.get(num, (0, "F", f"Field {num}"))[2]
    extras = ""
    if num == 49 or num == 51:
        extras = f" → {CURRENCY_CODES.get(str(value), 'unknown currency')}"
    if num == 4:
        try:
            amt = int(value) / 100
            extras = f" → ${amt:,.2f}"
        except Exception:
            pass
    if num == 2:
        pan = str(value)
        masked = pan[:6] + "*" * (len(pan) - 10) + pan[-4:] if len(pan) > 10 else pan
        extras = f" (masked: {masked})"
    return f"  DE-{num:03d} {desc}: {value}{extras}"

def main():
    print("[MODULE 027] ISO 8583 BUILDER — encoding payment message")

    # Parse input: JSON string or use default
    raw_input = sys.argv[1].strip() if len(sys.argv) > 1 else "{}"
    
    if raw_input.lower() in ("", "default", "example"):
        msg = {
            "t": "0100",
            2: "4111111111111111",
            3: "000000",
            4: "000000010000",
            7: "0709123456",
            11: "123456",
            41: "TERMID01",
            49: "840",
        }
        print("[INFO] using default example message (pass JSON to customize)")
    else:
        try:
            raw_parsed = json.loads(raw_input)
            msg = {}
            for k, v in raw_parsed.items():
                try:
                    msg[int(k)] = v
                except ValueError:
                    msg[k] = v
        except json.JSONDecodeError as e:
            print(f"[ERROR] invalid JSON input: {e}")
            print('[INFO] format: {"t":"0100","2":"4111111111111111","3":"000000","4":"000000010000","49":"840"}')
            sys.exit(1)

    mti = str(msg.get("t", msg.get("0", "0100")))
    mti_desc = MTI_DESCRIPTIONS.get(mti, "Unknown Message Type")

    print()
    print(f"[MTI] {mti} — {mti_desc}")
    print()

    # Collect integer-keyed fields
    int_fields = {k: v for k, v in msg.items() if isinstance(k, int)}
    
    # Build bitmap
    bitmap_hex = build_bitmap(int_fields)
    bitmap_bits = bin(int(bitmap_hex, 16))[2:].zfill(len(bitmap_hex) * 4)
    
    print(f"[BITMAP] {bitmap_hex}")
    print(f"  binary: {' '.join(bitmap_bits[i:i+8] for i in range(0, len(bitmap_bits), 8))}")
    print()

    # Encode data elements
    print("[DATA ELEMENTS]")
    encoded_data = ""
    for num in sorted(int_fields.keys()):
        value = int_fields[num]
        fdef = FIELD_DEFS.get(num)
        if fdef:
            encoded, raw_val = encode_field(num, value, fdef)
            encoded_data += encoded
            print(explain_field(num, value))
        else:
            print(f"  DE-{num:03d} (unknown field): {value}")
            encoded_data += str(value)
    
    # Assemble full message
    full_ascii = f"{mti}{bitmap_hex}{encoded_data}"
    full_hex = binascii.hexlify(full_ascii.encode("ascii")).decode()
    
    print()
    print(f"[RESULT] ASCII message:")
    print(f"  {full_ascii}")
    print()
    print(f"[RESULT] hex-encoded:")
    print(f"  {full_hex}")
    print()
    print(f"[RESULT] message length: {len(full_ascii)} bytes")
    print("[DONE] ISO 8583 message built successfully.")

if __name__ == "__main__":
    main()
