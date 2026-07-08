"""Num Base — Module 225. Usage: num_base.py "255" or num_base.py "hex:FF" or num_base.py "bin:11111111" """
import sys, re

def to_all_bases(n: int) -> None:
    print(f"[DECIMAL]     {n}")
    print(f"[HEXADECIMAL] {hex(n)}  ({hex(n).upper()})")
    print(f"[OCTAL]       {oct(n)}")
    print(f"[BINARY]      {bin(n)}")
    print(f"[BASE 36]     {int_to_base(n, 36)}")
    print(f"[BASE 32]     {int_to_base(n, 32)}")
    print(f"[BASE 8]      {oct(n)[2:]}")
    print(f"[BASE 2]      {bin(n)[2:]}")
    print()
    print(f"[BYTE SIZE]")
    print(f"  Bits required:  {n.bit_length()}")
    print(f"  Bytes required: {(n.bit_length()+7)//8}")
    if n <= 0xFFFF:
        print(f"  Fits in:  16-bit word")
    if n <= 0xFFFFFFFF:
        print(f"  Fits in:  32-bit int")
    if n <= 0xFFFFFFFFFFFFFFFF:
        print(f"  Fits in:  64-bit int")
    print()
    print(f"[BIT GROUPS]")
    b = f"{n:0{max(8,(n.bit_length()+7)//8*8)}b}"
    grouped = " ".join(b[i:i+8] for i in range(0, len(b), 8))
    print(f"  {grouped}")
    hex_g = f"{n:0{max(2,(n.bit_length()+7)//8*2)}X}"
    hex_grouped = " ".join(hex_g[i:i+2] for i in range(0, len(hex_g), 2))
    print(f"  {hex_grouped}")

def int_to_base(n: int, base: int) -> str:
    if n == 0: return "0"
    digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    result = []
    negative = n < 0
    n = abs(n)
    while n:
        result.append(digits[n % base])
        n //= base
    if negative: result.append("-")
    return "".join(reversed(result))

def main():
    print("[MODULE 225] NUMBER BASE CONVERTER")
    print("[SOURCE]     Pure Python — convert between decimal/hex/octal/binary/base-N")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  num_base.py \"255\"           (decimal → all bases)")
        print("         num_base.py \"hex:FF\"        (hex input)")
        print("         num_base.py \"bin:11111111\"  (binary input)")
        print("         num_base.py \"oct:377\"       (octal input)")
        print("         num_base.py \"b36:ZZ\"        (base-36 input)")
        print("         num_base.py \"fromto:16:10:FF\"  (from base 16 to base 10)")
        sys.exit(0)

    raw_lower = raw.lower().strip()

    try:
        if raw_lower.startswith("hex:") or raw_lower.startswith("0x"):
            hex_val = raw.split(":", 1)[-1].strip().lstrip("0x").lstrip("0X")
            n = int(hex_val, 16)
            print(f"[INPUT]   {raw}  (hexadecimal)")
        elif raw_lower.startswith("bin:") or raw_lower.startswith("0b"):
            bin_val = raw.split(":", 1)[-1].strip().lstrip("0b").lstrip("0B")
            n = int(bin_val, 2)
            print(f"[INPUT]   {raw}  (binary)")
        elif raw_lower.startswith("oct:") or raw_lower.startswith("0o"):
            oct_val = raw.split(":", 1)[-1].strip().lstrip("0o").lstrip("0O")
            n = int(oct_val, 8)
            print(f"[INPUT]   {raw}  (octal)")
        elif raw_lower.startswith("b36:"):
            n = int(raw[4:].strip(), 36)
            print(f"[INPUT]   {raw}  (base 36)")
        elif raw_lower.startswith("fromto:"):
            parts = raw[7:].split(":", 2)
            from_base = int(parts[0])
            to_base   = int(parts[1])
            value_str = parts[2]
            n = int(value_str, from_base)
            result = int_to_base(n, to_base) if to_base not in (10, 16, 8, 2) else None
            print(f"[INPUT]   {value_str}  (base {from_base})")
            print(f"[DECIMAL] {n}")
            if to_base == 16:
                print(f"[BASE 16] {hex(n).upper()}")
            elif to_base == 10:
                print(f"[BASE 10] {n}")
            elif to_base == 8:
                print(f"[BASE 8]  {oct(n)}")
            elif to_base == 2:
                print(f"[BASE 2]  {bin(n)}")
            else:
                print(f"[BASE {to_base}]  {result}")
            sys.exit(0)
        else:
            n = int(raw)
            print(f"[INPUT]   {raw}  (decimal)")
    except ValueError as e:
        print(f"[ERROR]  {e}")
        sys.exit(1)

    print()
    to_all_bases(n)

    print("[DONE] Number base conversion complete.")

if __name__ == "__main__":
    main()
