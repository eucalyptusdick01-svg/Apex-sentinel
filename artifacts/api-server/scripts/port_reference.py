"""Port Reference — Module 165. Usage: port_reference.py "80" or port_reference.py "ssh" or port_reference.py "all" """
import sys

PORTS = {
    20: ("FTP Data", "tcp", "File Transfer (data channel)"),
    21: ("FTP", "tcp", "File Transfer Protocol control"),
    22: ("SSH", "tcp", "Secure Shell — encrypted remote access"),
    23: ("Telnet", "tcp", "Unencrypted remote shell — deprecated"),
    25: ("SMTP", "tcp", "Email sending (server-to-server)"),
    53: ("DNS", "tcp/udp", "Domain Name System"),
    67: ("DHCP Server", "udp", "Dynamic Host Configuration Protocol"),
    68: ("DHCP Client", "udp", "DHCP client port"),
    69: ("TFTP", "udp", "Trivial FTP — firmware/config transfer"),
    80: ("HTTP", "tcp", "HyperText Transfer Protocol"),
    88: ("Kerberos", "tcp/udp", "Authentication protocol"),
    110: ("POP3", "tcp", "Post Office Protocol v3 — email retrieval"),
    111: ("RPC", "tcp/udp", "Remote Procedure Call / portmapper"),
    119: ("NNTP", "tcp", "Network News Transfer Protocol"),
    123: ("NTP", "udp", "Network Time Protocol"),
    135: ("RPC/EPMAP", "tcp", "Windows RPC endpoint mapper"),
    137: ("NetBIOS-NS", "udp", "NetBIOS Name Service"),
    138: ("NetBIOS-DGM", "udp", "NetBIOS Datagram Service"),
    139: ("NetBIOS", "tcp", "NetBIOS Session Service"),
    143: ("IMAP", "tcp", "Internet Message Access Protocol"),
    161: ("SNMP", "udp", "Simple Network Management Protocol"),
    162: ("SNMP Trap", "udp", "SNMP trap receiver"),
    179: ("BGP", "tcp", "Border Gateway Protocol"),
    194: ("IRC", "tcp", "Internet Relay Chat"),
    389: ("LDAP", "tcp", "Lightweight Directory Access Protocol"),
    443: ("HTTPS", "tcp", "HTTP Secure (TLS)"),
    445: ("SMB", "tcp", "Server Message Block / Windows file shares"),
    465: ("SMTPS", "tcp", "SMTP over TLS (legacy)"),
    500: ("IKE/ISAKMP", "udp", "VPN key exchange"),
    514: ("Syslog", "udp", "System logging"),
    515: ("LPD", "tcp", "Line Printer Daemon"),
    587: ("SMTP Submission", "tcp", "Email client submission (STARTTLS)"),
    631: ("IPP", "tcp", "Internet Printing Protocol / CUPS"),
    636: ("LDAPS", "tcp", "LDAP over TLS"),
    993: ("IMAPS", "tcp", "IMAP over TLS"),
    995: ("POP3S", "tcp", "POP3 over TLS"),
    1080: ("SOCKS", "tcp", "SOCKS proxy"),
    1194: ("OpenVPN", "udp", "OpenVPN"),
    1433: ("MSSQL", "tcp", "Microsoft SQL Server"),
    1521: ("Oracle DB", "tcp", "Oracle Database"),
    1723: ("PPTP", "tcp", "Point-to-Point Tunneling Protocol VPN"),
    2049: ("NFS", "tcp/udp", "Network File System"),
    2375: ("Docker", "tcp", "Docker daemon (INSECURE — no auth!)"),
    2376: ("Docker TLS", "tcp", "Docker daemon over TLS"),
    3306: ("MySQL", "tcp", "MySQL / MariaDB"),
    3389: ("RDP", "tcp", "Remote Desktop Protocol (Windows)"),
    4444: ("Metasploit", "tcp", "Default Metasploit listener — suspicious!"),
    5432: ("PostgreSQL", "tcp", "PostgreSQL database"),
    5900: ("VNC", "tcp", "Virtual Network Computing"),
    6379: ("Redis", "tcp", "Redis in-memory data store (often exposed!)"),
    6443: ("Kubernetes", "tcp", "Kubernetes API server"),
    8080: ("HTTP-Alt", "tcp", "Alternate HTTP / development servers"),
    8443: ("HTTPS-Alt", "tcp", "Alternate HTTPS"),
    8888: ("Jupyter", "tcp", "Jupyter Notebook (often exposed!)"),
    9000: ("PHP-FPM", "tcp", "PHP FastCGI Process Manager"),
    9200: ("Elasticsearch", "tcp", "Elasticsearch REST API (often exposed!)"),
    9300: ("Elasticsearch", "tcp", "Elasticsearch cluster communication"),
    11211: ("Memcached", "tcp/udp", "Memcached — often exposed without auth!"),
    27017: ("MongoDB", "tcp", "MongoDB database (often exposed!)"),
    27018: ("MongoDB", "tcp", "MongoDB shard server"),
    50000: ("SAP", "tcp", "SAP application server"),
    50070: ("HDFS", "tcp", "Hadoop NameNode web UI"),
}

HIGH_RISK = {6379, 9200, 27017, 11211, 2375, 4444, 8888, 5900}

def search(query: str):
    q = query.lower().strip()
    results = []

    # Try numeric
    try:
        port_num = int(q)
        if port_num in PORTS:
            name, proto, desc = PORTS[port_num]
            results.append((port_num, name, proto, desc))
            return results
        # Nearby ports
        for p in sorted(PORTS):
            if abs(p - port_num) <= 5:
                results.append((p, *PORTS[p]))
        return results
    except ValueError:
        pass

    # Text search
    for port, (name, proto, desc) in sorted(PORTS.items()):
        if q in name.lower() or q in desc.lower() or q in proto.lower():
            results.append((port, name, proto, desc))
    return results

def main():
    print("[MODULE 165] PORT REFERENCE")
    print("[SOURCE]     Built-in IANA port database — 70+ common service ports")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw or raw.lower() == "all":
        print(f"[DATABASE]  {len(PORTS)} port definitions")
        print()
        print(f"  {'PORT':7s}  {'PROTO':8s}  {'SERVICE':20s}  {'DESCRIPTION'}")
        print(f"  {'-'*7}  {'-'*8}  {'-'*20}  {'-'*40}")
        for port in sorted(PORTS):
            name, proto, desc = PORTS[port]
            risk = " [HIGH RISK]" if port in HIGH_RISK else ""
            print(f"  {port:7d}  {proto:8s}  {name:20s}  {desc}{risk}")
        sys.exit(0)

    print(f"[QUERY]  {raw}")
    print()
    results = search(raw)

    if not results:
        print(f"[RESULT]  No matching ports found for '{raw}'")
        sys.exit(0)

    print(f"[MATCHES]  {len(results)}")
    print()
    for port, name, proto, desc in results:
        risk_tag = "  [HIGH RISK — often exploited/exposed]" if port in HIGH_RISK else ""
        print(f"[PORT {port}]  {name}  ({proto}){risk_tag}")
        print(f"  {desc}")
        # Extra context
        if port == 22:
            print("  [TIP]  Brute-force target — use key auth and disable root login")
        elif port == 3389:
            print("  [TIP]  Common ransomware vector — restrict with firewall/VPN")
        elif port == 6379:
            print("  [WARN] Redis often exposed without password — leads to RCE!")
        elif port == 27017:
            print("  [WARN] MongoDB historically open by default — major data leaks")
        elif port == 2375:
            print("  [CRITICAL] Docker daemon without TLS = full host compromise!")
        elif port == 4444:
            print("  [SUSPICIOUS] Metasploit default — likely a C2 listener if seen open")
        print()

    print("[DONE] Port reference lookup complete.")

if __name__ == "__main__":
    main()
