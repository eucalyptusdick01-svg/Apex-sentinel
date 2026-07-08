"""IP Convert — Module 163. Usage: ip_convert.py "1.2.3.4" or ip_convert.py "int:16909060" or ip_convert.py "hex:0x01020304" """
import sys, ipaddress, struct, socket

def main():
    print("[MODULE 163] IP CONVERTER")
    print("[SOURCE]     Python ipaddress + struct stdlib — all IP representations")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  ip_convert.py \"192.168.1.1\"")
        print("         ip_convert.py \"int:3232235777\"")
        print("         ip_convert.py \"hex:0xC0A80101\"")
        print("         ip_convert.py \"bin:11000000.10101000.00000001.00000001\"")
        sys.exit(0)

    # Parse input
    raw_lower = raw.lower()
    try:
        if raw_lower.startswith("int:"):
            n = int(raw[4:].strip())
            addr = ipaddress.ip_address(n)
        elif raw_lower.startswith("hex:"):
            n = int(raw[4:].strip(), 16)
            addr = ipaddress.ip_address(n)
        elif raw_lower.startswith("bin:"):
            binary = raw[4:].strip().replace(".", "").replace(" ","")
            n = int(binary, 2)
            addr = ipaddress.ip_address(n)
        else:
            addr = ipaddress.ip_address(raw)
    except Exception as e:
        print(f"[ERROR]  {e}")
        sys.exit(1)

    is_v6 = isinstance(addr, ipaddress.IPv6Address)
    print(f"[INPUT]     {raw}")
    print(f"[VERSION]   IPv{6 if is_v6 else 4}")
    print()

    if not is_v6:
        packed = addr.packed
        n      = int(addr)
        octets = packed

        print(f"[DOTTED DECIMAL]  {addr}")
        print(f"[INTEGER]         {n}")
        print(f"[HEX]             0x{n:08X}  ({n:#010x})")
        print(f"[BINARY]          {'  '.join(f'{b:08b}' for b in octets)}")
        print(f"[BINARY COMPACT]  {''.join(f'{b:08b}' for b in octets)}")
        print(f"[OCTAL]           {'  '.join(oct(b) for b in octets)}")
        print(f"[NETWORK ORDER]   {'.'.join(str(b) for b in octets)}")
        print(f"[LITTLE ENDIAN]   {n & 0xFF}.{(n>>8)&0xFF}.{(n>>16)&0xFF}.{(n>>24)&0xFF}")
        print()
        print(f"[CLASS A]         {octets[0]}.0.0.0/8")
        print(f"[CLASS B]         {octets[0]}.{octets[1]}.0.0/16")
        print(f"[CLASS C]         {octets[0]}.{octets[1]}.{octets[2]}.0/24")
        print()
        print(f"[ARPA]            {'.'.join(reversed([str(b) for b in octets]))}.in-addr.arpa")
        print()
        print(f"[IPv4-MAPPED IPv6]  ::ffff:{addr}")
        print(f"[IPv6 FULL]         0000:0000:0000:0000:0000:ffff:{octets[0]:02x}{octets[1]:02x}:{octets[2]:02x}{octets[3]:02x}")

    else:
        n      = int(addr)
        print(f"[FULL]            {addr.exploded}")
        print(f"[COMPRESSED]      {addr.compressed}")
        print(f"[INTEGER]         {n}")
        print(f"[HEX]             0x{n:032X}")
        print(f"[ARPA]            {addr.reverse_pointer}")
        if addr.ipv4_mapped:
            print(f"[IPv4-MAPPED]     {addr.ipv4_mapped}")

    # Properties
    print()
    print(f"[PROPERTIES]")
    print(f"  Private:    {addr.is_private}")
    print(f"  Loopback:   {addr.is_loopback}")
    print(f"  Multicast:  {addr.is_multicast}")
    print(f"  Reserved:   {addr.is_reserved}")
    if not is_v6:
        print(f"  Link-local: {addr.is_link_local}")

    print()
    print("[DONE] IP conversion complete.")

if __name__ == "__main__":
    main()
