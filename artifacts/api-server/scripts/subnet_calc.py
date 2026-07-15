"""Subnet Calc — Module 164. Subnet splitting, wildcard masks, VLSM."""
import sys, ipaddress, math

def main():
    print("[MODULE 164] SUBNET CALCULATOR")
    print("[SOURCE]     Python ipaddress stdlib — subnet design & splitting")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  192.168.1.0/24 split:4    — split into 4 equal subnets")
        print("         192.168.1.0/24 hosts:50   — smallest subnet for 50 hosts")
        print("         10.0.0.0/8                — subnet summary")
        print("         vlsm:10.0.0.0:200,100,50  — VLSM allocation")
        sys.exit(0)

    if raw.startswith("vlsm:"):
        parts = raw[5:].split(":")
        if len(parts) < 2:
            print("[ERROR] format: vlsm:NETWORK:SIZE1,SIZE2,..."); sys.exit(1)
        try:
            base = ipaddress.ip_network(parts[0], strict=False)
            sizes = sorted([int(x) for x in parts[1].split(",")], reverse=True)
        except Exception as e:
            print(f"[ERROR] {e}"); sys.exit(1)
        print(f"[BASE NETWORK]  {base}")
        print(f"[REQUIREMENTS]  {sizes}")
        print()
        current = base.network_address
        allocs = []
        for size in sizes:
            needed = size + 2
            bits = math.ceil(math.log2(needed))
            pfx = 32 - bits
            try:
                subnet = ipaddress.ip_network(f"{current}/{pfx}", strict=False)
                if subnet.network_address < current:
                    subnet = list(base.subnets(new_prefix=pfx))
                    for s in subnet:
                        if s.network_address >= current:
                            subnet = s; break
                allocs.append((size, subnet))
                hosts = list(subnet.hosts())
                current = subnet.broadcast_address + 1
                print(f"[/{pfx:02d}]  {subnet}  — {size} hosts needed  (usable: {subnet.network_address+1} – {subnet.broadcast_address-1})")
            except Exception as e:
                print(f"[ERROR] Can't fit {size} hosts: {e}")
        print()
        used = sum(s.num_addresses for _,s in allocs)
        print(f"[TOTAL USED]  {used} addresses of {base.num_addresses} available")
        print("[DONE] VLSM allocation complete.")
        return

    # Regular subnet
    parts = raw.split()
    network_str = parts[0]
    modifier = parts[1].lower() if len(parts) > 1 else ""

    try:
        net = ipaddress.ip_network(network_str, strict=False)
    except Exception as e:
        print(f"[ERROR] {e}"); sys.exit(1)

    print(f"[NETWORK]        {net.network_address}/{net.prefixlen}")
    print(f"[BROADCAST]      {net.broadcast_address}")
    print(f"[NETMASK]        {net.netmask}")
    print(f"[WILDCARD]       {net.hostmask}  ← use in ACLs/firewalls")
    print(f"[TOTAL ADDRS]    {net.num_addresses:,}")
    usable = max(0, net.num_addresses - 2)
    print(f"[USABLE HOSTS]   {usable:,}")
    print()

    if modifier.startswith("split:"):
        try:
            n = int(modifier.split(":")[1])
        except:
            print("[ERROR] split: requires integer"); sys.exit(1)
        bits = math.ceil(math.log2(n))
        new_pfx = net.prefixlen + bits
        if new_pfx > 30:
            print(f"[ERROR] Can't split /{net.prefixlen} into {n} subnets — prefix too long"); sys.exit(1)
        print(f"[SPLIT]  /{net.prefixlen} → {2**bits} x /{new_pfx} subnets ({(net.num_addresses//(2**bits))-2} hosts each)")
        print()
        for i, sub in enumerate(net.subnets(prefixlen_diff=bits)):
            hosts = list(sub.hosts())
            first = str(hosts[0]) if hosts else "N/A"
            last  = str(hosts[-1]) if hosts else "N/A"
            print(f"  [SUBNET {i+1:02d}]  {sub}  ({first} – {last})")

    elif modifier.startswith("hosts:"):
        try:
            need = int(modifier.split(":")[1])
        except:
            print("[ERROR] hosts: requires integer"); sys.exit(1)
        bits = math.ceil(math.log2(need + 2))
        pfx = 32 - bits
        print(f"[HOSTS NEEDED]   {need}")
        print(f"[MIN SUBNET]     /{pfx} — {2**bits - 2} usable hosts")
        print(f"[SUBNETS AVAIL]  {2**(pfx - net.prefixlen)} of /{pfx} inside {net}")

    else:
        # Show common subnets of this network
        if net.prefixlen <= 24:
            print("[COMMON SPLITS]")
            for diff in range(1, min(5, 30 - net.prefixlen + 1)):
                npfx = net.prefixlen + diff
                count = 2**diff
                hosts_each = max(0, (net.num_addresses // count) - 2)
                print(f"  /{npfx}: {count:4} subnets, {hosts_each:,} hosts each")

    print()
    print("[DONE] Subnet calculation complete.")

if __name__ == "__main__":
    main()
