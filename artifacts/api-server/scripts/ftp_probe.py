"""FTP Probe — Module 119. Banner grab, auth test, and anonymous login check."""
import sys, socket, re, time

def ftp_connect(host, port=21, timeout=8):
    """Connect to FTP and grab banner + test anonymous login."""
    results = {"banner": None, "anon_login": None, "features": [], "error": None, "port": port}
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        sock.connect((host, port))

        # Read banner
        banner = b""
        try:
            while True:
                chunk = sock.recv(1024)
                if not chunk: break
                banner += chunk
                if b"\r\n" in chunk and banner.endswith(b"\r\n"):
                    break
        except socket.timeout:
            pass
        results["banner"] = banner.decode("utf-8","replace").strip()

        # Parse banner code
        banner_str = results["banner"]
        code_m = re.match(r'^(\d{3})', banner_str)
        if code_m:
            code = int(code_m.group(1))
            results["banner_code"] = code
            if code != 220:
                results["error"] = f"Unexpected banner code {code}"

        # Try anonymous login
        sock.sendall(b"USER anonymous\r\n")
        time.sleep(0.3)
        resp = sock.recv(1024).decode("utf-8","replace").strip()
        results["user_resp"] = resp

        if resp.startswith("331"):
            sock.sendall(b"PASS anonymous@example.com\r\n")
            time.sleep(0.3)
            pass_resp = sock.recv(1024).decode("utf-8","replace").strip()
            results["pass_resp"] = pass_resp
            if pass_resp.startswith("230"):
                results["anon_login"] = True
                # Get features
                sock.sendall(b"FEAT\r\n")
                time.sleep(0.3)
                try:
                    feat = sock.recv(4096).decode("utf-8","replace")
                    results["features"] = [l.strip() for l in feat.split("\n") if l.strip() and not l.startswith("211")]
                except: pass
                # Get system type
                sock.sendall(b"SYST\r\n")
                time.sleep(0.3)
                try:
                    syst = sock.recv(256).decode("utf-8","replace").strip()
                    results["syst"] = syst
                except: pass
            else:
                results["anon_login"] = False
        elif resp.startswith("530"):
            results["anon_login"] = False
            results["user_resp"] = resp
        else:
            results["anon_login"] = None

        sock.sendall(b"QUIT\r\n")
        sock.close()
    except ConnectionRefusedError:
        results["error"] = "Connection refused — port closed"
    except socket.timeout:
        results["error"] = "Connection timed out"
    except Exception as e:
        results["error"] = str(e)
    return results

def main():
    print("[MODULE 119] FTP PROBE")
    print("[SOURCE]     Raw TCP socket — no external API key needed")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  ftp.example.com       — probe FTP on port 21")
        print("[USAGE]  example.com:2121      — custom port")
        sys.exit(0)

    if ":" in raw and not raw.startswith("["):
        host, port_str = raw.rsplit(":", 1)
        try: port = int(port_str)
        except: host, port = raw, 21
    else:
        host, port = raw, 21

    print(f"[TARGET]   {host}:{port}")
    print()

    r = ftp_connect(host, port)

    if r["error"] and not r["banner"]:
        print(f"[STATUS]   CLOSED / UNREACHABLE")
        print(f"[ERROR]    {r['error']}")
        sys.exit(0)

    print(f"[STATUS]   OPEN")
    print(f"[BANNER]   {r['banner'][:200] if r['banner'] else 'None'}")
    if r.get("syst"): print(f"[SYSTEM]   {r['syst']}")
    print()

    # Server software fingerprint
    banner = r.get("banner","") or ""
    if "vsftpd" in banner.lower():
        software = "vsftpd (Very Secure FTP Daemon)"
    elif "proftpd" in banner.lower():
        software = "ProFTPD"
    elif "filezilla" in banner.lower():
        software = "FileZilla Server"
    elif "microsoft ftp" in banner.lower():
        software = "Microsoft IIS FTP"
    elif "pure-ftpd" in banner.lower():
        software = "Pure-FTPd"
    elif "wu-ftpd" in banner.lower():
        software = "WU-FTPD (legacy, vulnerable)"
    else:
        software = "Unknown FTP server"
    print(f"[SOFTWARE] {software}")

    # Version extraction
    ver_m = re.search(r'(\d+\.\d+[\.\d]*)', banner)
    if ver_m: print(f"[VERSION]  {ver_m.group(1)}")

    print()
    # Anonymous login result
    if r["anon_login"] is True:
        print(f"[ANON LOGIN]  ✗  ENABLED — anonymous access allowed")
        print(f"[RISK]        HIGH — unauthenticated read (and possibly write) access")
        print(f"[FIX]         Disable anonymous FTP; use SFTP/FTPS instead")
    elif r["anon_login"] is False:
        print(f"[ANON LOGIN]  ✓  DISABLED — authentication required")
    else:
        print(f"[ANON LOGIN]  ?  Could not test")

    # Features
    if r.get("features"):
        print()
        print(f"[FEATURES]  {', '.join(r['features'][:10])}")

    # Security checks
    print()
    print("[SECURITY CHECKS]")
    if "tls" not in " ".join(r.get("features","")).lower() and "ssl" not in banner.lower():
        print("  ⚠  No TLS/SSL detected — credentials sent in cleartext")
    else:
        print("  ✓  TLS/FTPS supported")
    if r["anon_login"]:
        print("  ⚠  Anonymous login enabled — potential data exposure")
    if "wu-ftpd" in software.lower():
        print("  ⚠  WU-FTPD is legacy and has known critical vulnerabilities")

    print()
    print("[DONE] FTP probe complete.")

if __name__ == "__main__":
    main()
