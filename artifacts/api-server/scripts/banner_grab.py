"""Banner Grab — Module 118. Usage: banner_grab.py "host:port" or banner_grab.py "host" (common ports) """
import sys, socket, ssl, time

COMMON_PORTS = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 3306, 3389, 5432, 6379, 8080, 8443, 9200, 27017]

PROBES = {
    21:    b"",
    22:    b"",
    23:    b"",
    25:    b"EHLO sentinel\r\n",
    53:    None,  # skip
    80:    b"HEAD / HTTP/1.0\r\nHost: {host}\r\n\r\n",
    110:   b"",
    143:   b"",
    443:   b"HEAD / HTTP/1.0\r\nHost: {host}\r\n\r\n",
    445:   None,
    3306:  b"",
    3389:  None,
    5432:  b"",
    6379:  b"*1\r\n$4\r\nPING\r\n",
    8080:  b"HEAD / HTTP/1.0\r\nHost: {host}\r\n\r\n",
    8443:  b"HEAD / HTTP/1.0\r\nHost: {host}\r\n\r\n",
    9200:  b"GET / HTTP/1.0\r\nHost: {host}\r\n\r\n",
    27017: b"\x3a\x00\x00\x00\x01\x00\x00\x00\x00\x00\x00\x00\xd4\x07\x00\x00\x00\x00\x00\x00admin.$cmd\x00\x00\x00\x00\x00\xff\xff\xff\xff\x13\x00\x00\x00\x10serverStatus\x00\x01\x00\x00\x00\x00",
}

def grab(host: str, port: int, timeout: float = 3.0, use_tls: bool = False) -> str:
    try:
        probe = PROBES.get(port, b"")
        if probe is None:
            return ""
        if isinstance(probe, bytes) and b"{host}" in probe:
            probe = probe.replace(b"{host}", host.encode())

        s = socket.create_connection((host, port), timeout=timeout)
        if use_tls or port in (443, 8443, 465, 587, 993, 995):
            ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            s = ctx.wrap_socket(s, server_hostname=host)

        if probe:
            s.sendall(probe)

        s.settimeout(timeout)
        try:
            data = s.recv(1024)
            banner = data.decode("utf-8", errors="replace").strip()
        except socket.timeout:
            banner = ""
        finally:
            s.close()
        return banner[:200]
    except ConnectionRefusedError:
        return "(closed)"
    except socket.timeout:
        return "(timeout)"
    except Exception as e:
        return f"({e.__class__.__name__})"

def port_name(port: int) -> str:
    NAMES = {21:"FTP",22:"SSH",23:"Telnet",25:"SMTP",53:"DNS",80:"HTTP",110:"POP3",
             143:"IMAP",443:"HTTPS",445:"SMB",3306:"MySQL",3389:"RDP",5432:"PostgreSQL",
             6379:"Redis",8080:"HTTP-Alt",8443:"HTTPS-Alt",9200:"Elasticsearch",27017:"MongoDB"}
    return NAMES.get(port, "?")

def main():
    print("[MODULE 118] BANNER GRAB")
    print("[SOURCE]     Raw TCP sockets — service banner retrieval")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No host supplied.")
        print("[USAGE] banner_grab.py \"host:port\"  or  banner_grab.py \"host\" (scans common ports)")
        sys.exit(1)

    specific_port = None
    if ":" in raw and not raw.startswith("["):
        parts = raw.rsplit(":", 1)
        if parts[1].isdigit():
            host = parts[0]
            specific_port = int(parts[1])
        else:
            host = raw
    else:
        host = raw

    host = host.lstrip("https://").lstrip("http://").split("/")[0]
    print(f"[TARGET]  {host}")
    print()

    ports = [specific_port] if specific_port else COMMON_PORTS

    print(f"[PORTS]  {len(ports)}")
    print()
    print(f"  {'PORT':6s}  {'SERVICE':15s}  {'BANNER'}")
    print(f"  {'-'*6}  {'-'*15}  {'-'*50}")

    for port in ports:
        banner = grab(host, port)
        if not banner or banner in ("(closed)", "(timeout)"):
            if specific_port:
                print(f"  {port:6d}  {port_name(port):15s}  {banner}")
            continue
        name = port_name(port)
        # Truncate multiline
        first_line = banner.split("\n")[0].strip()[:80]
        print(f"  {port:6d}  {name:15s}  {first_line}")
        if "\n" in banner and specific_port:
            # Show full banner for specific port
            print(f"  {'':6s}  {'':15s}  --- full banner ---")
            for line in banner.split("\n")[1:]:
                if line.strip():
                    print(f"  {'':6s}  {'':15s}  {line.strip()[:80]}")

    print()
    print("[DONE] Banner grab complete.")

if __name__ == "__main__":
    main()
