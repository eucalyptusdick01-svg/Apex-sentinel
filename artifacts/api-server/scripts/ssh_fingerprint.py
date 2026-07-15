"""SSH Fingerprint — Module 121. Banner grab, key exchange, and algorithm enumeration."""
import sys, socket, struct, re, hashlib, base64, time

def ssh_banner_and_kex(host, port=22, timeout=8):
    res = {"banner": None, "server_version": None, "kex_algos": [], "host_key_algos": [],
           "encryption_algos": [], "mac_algos": [], "compression": [], "error": None}
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        sock.connect((host, port))

        # Read banner
        banner = b""
        while True:
            c = sock.recv(1)
            if not c: break
            banner += c
            if banner.endswith(b"\n"): break
        res["banner"] = banner.decode("utf-8","replace").strip()

        # Parse version
        m = re.match(r'SSH-(\d+\.\d+)-(.+)', res["banner"])
        if m:
            res["ssh_version"] = m.group(1)
            res["server_software"] = m.group(2)

        # Send our banner
        sock.sendall(b"SSH-2.0-SweptSentinel_Probe\r\n")
        time.sleep(0.2)

        # Read SSH_MSG_KEXINIT (start with 4-byte length + 1-byte pad + type byte)
        data = b""
        try:
            while len(data) < 4:
                chunk = sock.recv(4096)
                if not chunk: break
                data += chunk
            if len(data) >= 4:
                pkt_len = struct.unpack(">I", data[:4])[0]
                # Read full packet
                while len(data) < 4 + pkt_len:
                    chunk = sock.recv(4096)
                    if not chunk: break
                    data += chunk

                if len(data) >= 6:
                    pad_len = data[4]
                    payload = data[5:4+pkt_len-pad_len]
                    if payload and payload[0] == 20:  # SSH_MSG_KEXINIT
                        offset = 1 + 16  # skip type + cookie
                        def read_name_list(payload, offset):
                            if offset + 4 > len(payload): return [], offset
                            list_len = struct.unpack(">I", payload[offset:offset+4])[0]
                            offset += 4
                            names_str = payload[offset:offset+list_len].decode("utf-8","replace")
                            offset += list_len
                            return [n.strip() for n in names_str.split(",") if n.strip()], offset

                        res["kex_algos"], offset = read_name_list(payload, offset)
                        res["host_key_algos"], offset = read_name_list(payload, offset)
                        res["encryption_algos"], offset = read_name_list(payload, offset)  # c2s
                        _, offset = read_name_list(payload, offset)  # encryption s2c
                        res["mac_algos"], offset = read_name_list(payload, offset)  # mac c2s
                        _, offset = read_name_list(payload, offset)  # mac s2c
                        res["compression"], offset = read_name_list(payload, offset)
        except Exception:
            pass

        sock.close()
    except ConnectionRefusedError:
        res["error"] = "Connection refused"
    except socket.timeout:
        res["error"] = "Timeout"
    except Exception as e:
        res["error"] = str(e)
    return res

WEAK_KEX = {"diffie-hellman-group1-sha1","diffie-hellman-group14-sha1","gss-group1-sha1-*"}
WEAK_ENC = {"3des-cbc","des-cbc","arcfour","arcfour128","arcfour256","blowfish-cbc","cast128-cbc"}
WEAK_MAC = {"hmac-md5","hmac-md5-96","hmac-sha1-96","hmac-ripemd160"}
WEAK_HOST = {"ssh-dss"}

def main():
    print("[MODULE 121] SSH FINGERPRINT")
    print("[SOURCE]     Raw TCP SSH handshake probe — no API key needed")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  ssh.example.com       — probe SSH on port 22")
        print("[USAGE]  10.0.0.1:2222         — custom port")
        sys.exit(0)

    if ":" in raw:
        host, p = raw.rsplit(":",1)
        try: port = int(p)
        except: host, port = raw, 22
    else:
        host, port = raw, 22

    print(f"[TARGET]   {host}:{port}")
    print()

    r = ssh_banner_and_kex(host, port)

    if r["error"] and not r["banner"]:
        print(f"[STATUS]  CLOSED / UNREACHABLE")
        print(f"[ERROR]   {r['error']}")
        sys.exit(0)

    print(f"[STATUS]   OPEN")
    print(f"[BANNER]   {r['banner']}")
    if r.get("ssh_version"): print(f"[VERSION]  SSH-{r['ssh_version']}")
    if r.get("server_software"): print(f"[SOFTWARE] {r['server_software']}")
    print()

    if r["kex_algos"]:
        print(f"[KEX ALGORITHMS]     {', '.join(r['kex_algos'][:6])}")
    if r["host_key_algos"]:
        print(f"[HOST KEY ALGOS]     {', '.join(r['host_key_algos'])}")
    if r["encryption_algos"]:
        print(f"[ENCRYPTION]         {', '.join(r['encryption_algos'][:6])}")
    if r["mac_algos"]:
        print(f"[MAC ALGORITHMS]     {', '.join(r['mac_algos'][:6])}")
    if r["compression"]:
        print(f"[COMPRESSION]        {', '.join(r['compression'])}")
    print()

    # Security audit
    weak = []
    for algo in r.get("kex_algos",[]):
        if algo in WEAK_KEX or any(w.replace("*","") in algo for w in WEAK_KEX if "*" in w):
            weak.append(f"Weak KEX: {algo}")
    for algo in r.get("encryption_algos",[]):
        if algo in WEAK_ENC:
            weak.append(f"Weak cipher: {algo}")
    for algo in r.get("mac_algos",[]):
        if algo in WEAK_MAC:
            weak.append(f"Weak MAC: {algo}")
    for algo in r.get("host_key_algos",[]):
        if algo in WEAK_HOST:
            weak.append(f"Weak host key: {algo} (DSA, broken)")

    if weak:
        print("[WEAK ALGORITHMS DETECTED]")
        for w in weak: print(f"  ⚠  {w}")
        print()
        print("[FIX]  Disable weak algorithms in /etc/ssh/sshd_config")
        print("[FIX]  Use ed25519/ecdsa-sha2-nistp256, chacha20-poly1305, hmac-sha2-256")
    else:
        print("[SECURITY]  ✓  No weak algorithms detected")

    print()
    print("[DONE] SSH fingerprint complete.")

if __name__ == "__main__":
    main()
