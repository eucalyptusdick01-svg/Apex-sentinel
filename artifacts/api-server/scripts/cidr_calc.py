"""CIDR Calc — Module 162. Usage: cidr_calc.py "192.168.1.0/24" or cidr_calc.py "192.168.1.5 255.255.255.0" """
import sys, ipaddress

def main():
    print("[MODULE 162] CIDR CALCULATOR")
    print("[SOURCE]     Python ipaddress stdlib — network/subnet calculation")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  cidr_calc.py \"192.168.1.0/24\"")
        print("         cidr_calc.py \"10.0.0.1/8\"")
        print("         cidr_calc.py \"172.16.5.10 255.255.240.0\"")
        sys.exit(0)

    # Support "ip mask" format
    input_str = raw.replace(" ", "/") if " " in raw and "/" not in raw else raw

    try:
        # Try strict first
        try:
            net = ipaddress.ip_network(input_str, strict=True)
        except ValueError:
            # Host bit set — use host address
            net = ipaddress.ip_network(input_str, strict=False)
            addr_in = ipaddress.ip_address(input_str.split("/")[0])
            print(f"[NOTE]    Host bits set — using network address (host: {addr_in})")
    except Exception as e:
        print(f"[ERROR]  {e}")
        sys.exit(1)

    is_v6 = isinstance(net, ipaddress.IPv6Network)
    print(f"[INPUT]          {raw}")
    print(f"[VERSION]        IPv{6 if is_v6 else 4}")
    print()
    print(f"[NETWORK]        {net.network_address}")
    print(f"[BROADCAST]      {net.broadcast_address}")
    print(f"[PREFIX LEN]     /{net.prefixlen}")
    print(f"[NETMASK]        {net.netmask}")
    print(f"[HOSTMASK]       {net.hostmask}")
    num_addr = net.num_addresses
    usable = max(0, num_addr - 2) if not is_v6 else num_addr
    print(f"[TOTAL ADDRS]    {num_addr:,}")
    print(f"[USABLE HOSTS]   {usable:,}")
    print()

    if not is_v6:
        # First/last usable
        hosts = list(net.hosts())
        if hosts:
            print(f"[FIRST HOST]     {hosts[0]}")
            print(f"[LAST HOST]      {hosts[-1]}")
        print()

        # Class
        first_octet = int(str(net.network_address).split(".")[0])
        if first_octet < 128:
            cls = "A (10.0.0.0/8)"
        elif first_octet < 192:
            cls = "B (172.16.0.0/12)"
        elif first_octet < 224:
            cls = "C (192.168.0.0/16)"
        elif first_octet < 240:
            cls = "D (Multicast)"
        else:
            cls = "E (Reserved)"
        print(f"[IP CLASS]       {cls}")
        print(f"[PRIVATE]        {'Yes' if net.is_private else 'No'}")
        print(f"[LOOPBACK]       {'Yes' if net.is_loopback else 'No'}")
        print(f"[MULTICAST]      {'Yes' if net.is_multicast else 'No'}")
        print()

        # Subnet splits
        if net.prefixlen < 30:
            print(f"[SUBNET SPLITS]")
            try:
                halves = list(net.subnets(prefixlen_diff=1))
                print(f"  /{ net.prefixlen+1} (halves, {halves[0].num_addresses:,} addrs each):")
                for h in halves[:2]:
                    print(f"    {h}  →  {h.network_address} – {h.broadcast_address}")
            except Exception:
                pass
            try:
                quarters = list(net.subnets(prefixlen_diff=2))
                print(f"  /{net.prefixlen+2} (quarters, {quarters[0].num_addresses:,} addrs each):")
                for q in quarters[:4]:
                    print(f"    {q}")
            except Exception:
                pass

        # Supernet
        if net.prefixlen > 0:
            print()
            print(f"[SUPERNET]")
            for diff in range(1, 4):
                try:
                    sup = net.supernet(prefixlen_diff=diff)
                    print(f"  /{net.prefixlen-diff}:  {sup}  ({sup.num_addresses:,} addresses)")
                except Exception:
                    break

    print()
    print("[DONE] CIDR calculation complete.")

if __name__ == "__main__":
    main()
