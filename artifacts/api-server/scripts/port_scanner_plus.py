"""Port Scanner+ — Module 229. Enhanced TCP scan with service detection and banner grab."""
import sys, socket, concurrent.futures, time, re

WELL_KNOWN = {
    20:"FTP-DATA",21:"FTP",22:"SSH",23:"TELNET",25:"SMTP",53:"DNS",
    67:"DHCP",68:"DHCP",69:"TFTP",80:"HTTP",110:"POP3",111:"RPCBIND",
    119:"NNTP",123:"NTP",135:"MSRPC",137:"NETBIOS-NS",138:"NETBIOS-DGM",
    139:"NETBIOS-SSN",143:"IMAP",161:"SNMP",162:"SNMPTRAP",
    179:"BGP",194:"IRC",389:"LDAP",443:"HTTPS",445:"SMB",
    465:"SMTPS",514:"SYSLOG",515:"LPD",587:"SUBMISSION",
    631:"IPP",636:"LDAPS",993:"IMAPS",995:"POP3S",
    1080:"SOCKS5",1194:"OpenVPN",1433:"MSSQL",1521:"Oracle",
    2049:"NFS",2181:"Zookeeper",2375:"Docker",2376:"Docker-TLS",
    3306:"MySQL",3389:"RDP",5432:"PostgreSQL",5672:"AMQP",
    5900:"VNC",5984:"CouchDB",6379:"Redis",6443:"Kubernetes",
    8080:"HTTP-ALT",8443:"HTTPS-ALT",8888:"HTTP-ALT",
    9200:"Elasticsearch",9300:"Elasticsearch",27017:"MongoDB",
}

BANNER_PROBES = {
    21: b"",  # FTP sends banner first
    22: b"",  # SSH sends banner first
    25: b"",  # SMTP sends banner first
    80: b"HEAD / HTTP/1.0\r\n\r\n",
    110: b"",
    143: b"",
    443: None,  # TLS
    8080: b"HEAD / HTTP/1.0\r\n\r\n",
    8443: None,
}

def scan_port(host, port, timeout=2):
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((host, port))
        if result == 0:
            # Try banner grab
            banner = ""
            probe = BANNER_PROBES.get(port, b"")
            if probe is not None:
                try:
                    if probe:
                        sock.sendall(probe)
                    time.sleep(0.3)
                    data = sock.recv(256)
                    banner = data.decode("utf-8","replace").strip().split("\n")[0][:80]
                except: pass
            sock.close()
            return port, True, banner
        sock.close()
        return port, False, ""
    except:
        return port, False, ""

def main():
    print("[MODULE 229] PORT SCANNER+")
    print("[SOURCE]     TCP connect scan + banner grab — no external API key needed")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  192.168.1.1              — scan top 100 ports")
        print("[USAGE]  192.168.1.1:1-1024       — range scan")
        print("[USAGE]  192.168.1.1:22,80,443    — specific ports")
        print("[USAGE]  example.com:top1000       — top 1000 ports")
        sys.exit(0)

    # Parse target
    if ":" in raw and not raw.startswith("["):
        host, port_spec = raw.rsplit(":",1)
    else:
        host, port_spec = raw, "top100"

    # Resolve
    try:
        ip = socket.gethostbyname(host)
        if ip != host:
            print(f"[RESOLVED]   {host} → {ip}")
    except Exception as e:
        print(f"[ERROR] Cannot resolve {host}: {e}")
        sys.exit(1)

    # Build port list
    TOP_100 = [21,22,23,25,53,80,110,111,135,139,143,179,443,445,465,514,587,
               631,636,993,995,1080,1433,1521,2049,2181,2375,3306,3389,5432,
               5672,5900,5984,6379,8080,8443,8888,9200,27017,
               20,69,119,123,137,138,161,194,515,1194,2376,6443,9300]
    TOP_100 = list(dict.fromkeys(TOP_100 + list(range(1,22))))[:100]

    if port_spec == "top100":
        ports = TOP_100
    elif port_spec == "top1000":
        ports = TOP_100 + list(range(1000,2000,10)) + [3000,4000,4200,4300,5000,5001,7000,7001,8000,8008,9000,9090,10000]
        ports = list(dict.fromkeys(ports))[:1000]
    elif "-" in port_spec:
        start, end = port_spec.split("-",1)
        ports = list(range(int(start), min(int(end)+1, 65536)))
        if len(ports) > 1000:
            print(f"[WARN] Range capped at 1000 ports (was {len(ports)})")
            ports = ports[:1000]
    elif "," in port_spec:
        ports = [int(p) for p in port_spec.split(",") if p.isdigit()]
    else:
        try:
            ports = [int(port_spec)]
        except:
            ports = TOP_100

    print(f"[TARGET]     {host} ({ip})")
    print(f"[PORTS]      {len(ports)} ({min(ports)}-{max(ports)})")
    print(f"[METHOD]     TCP connect + banner grab")
    print()

    open_ports = []
    t0 = time.time()

    with concurrent.futures.ThreadPoolExecutor(max_workers=50) as ex:
        futures = {ex.submit(scan_port, ip, port): port for port in ports}
        for fut in concurrent.futures.as_completed(futures):
            port, is_open, banner = fut.result()
            if is_open:
                open_ports.append((port, banner))

    elapsed = time.time() - t0
    open_ports.sort(key=lambda x: x[0])

    print(f"[OPEN PORTS]  {len(open_ports)} found in {elapsed:.1f}s")
    print()

    if open_ports:
        print(f"  {'PORT':<8} {'SERVICE':<16} BANNER")
        print("  " + "-"*60)
        for port, banner in open_ports:
            svc = WELL_KNOWN.get(port, "?")
            banner_display = banner[:50] if banner else ""
            flag = ""
            if port in (23,): flag = "⚠ INSECURE"
            elif port in (21,) and not banner: flag = ""
            elif port in (3306,5432,27017,6379,9200) : flag = "⚠ DB EXPOSED"
            elif port in (2375,): flag = "⚠ DOCKER API"
            elif port in (445,): flag = "⚠ SMB"
            print(f"  {port:<8} {svc:<16} {banner_display} {flag}")
    else:
        print("[RESULT]  All scanned ports are CLOSED or filtered")

    print()
    print(f"[SCAN TIME]  {elapsed:.1f}s  ({len(ports)/elapsed:.0f} ports/sec)")

    # Risk summary
    risks = []
    open_port_nums = [p for p,_ in open_ports]
    if 23 in open_port_nums: risks.append("Telnet (23) — cleartext protocol, high risk")
    if 2375 in open_port_nums: risks.append("Docker API (2375) — unauthenticated, critical")
    if 6379 in open_port_nums: risks.append("Redis (6379) — often unauthenticated")
    if 9200 in open_port_nums: risks.append("Elasticsearch (9200) — check auth")
    if 27017 in open_port_nums: risks.append("MongoDB (27017) — check auth")
    if 5900 in open_port_nums: risks.append("VNC (5900) — check password/encryption")

    if risks:
        print()
        print("[RISK FLAGS]")
        for r in risks: print(f"  ⚠  {r}")

    print()
    print("[DONE] Port scan complete.")

if __name__ == "__main__":
    main()
