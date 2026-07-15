"""SMTP Probe — Module 120. Banner + EHLO + STARTTLS + relay test."""
import sys, socket, ssl, re, time

def smtp_probe(host, port=25, timeout=8):
    res = {"port": port, "banner": None, "ehlo_caps": [], "starttls": False,
           "auth_methods": [], "open_relay": None, "error": None, "tls_cert": None}
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        sock.connect((host, port))

        # Banner
        banner = sock.recv(1024).decode("utf-8","replace").strip()
        res["banner"] = banner

        # EHLO
        sock.sendall(f"EHLO probe.swept-sentinel.local\r\n".encode())
        time.sleep(0.3)
        ehlo_resp = b""
        while True:
            chunk = sock.recv(4096)
            ehlo_resp += chunk
            if b"\r\n" in chunk: break
        ehlo_text = ehlo_resp.decode("utf-8","replace")
        for line in ehlo_text.split("\n"):
            line = line.strip()
            if line.startswith("250-") or line.startswith("250 "):
                cap = line[4:].strip()
                if cap: res["ehlo_caps"].append(cap)

        # Check capabilities
        caps_upper = [c.upper() for c in res["ehlo_caps"]]
        res["starttls"] = any("STARTTLS" in c for c in caps_upper)
        for cap in res["ehlo_caps"]:
            if cap.upper().startswith("AUTH"):
                res["auth_methods"] = cap.split()[1:]

        # STARTTLS
        if res["starttls"]:
            sock.sendall(b"STARTTLS\r\n")
            time.sleep(0.3)
            tls_resp = sock.recv(512).decode("utf-8","replace").strip()
            if tls_resp.startswith("220"):
                try:
                    ctx = ssl.create_default_context()
                    ctx.check_hostname = False
                    ctx.verify_mode = ssl.CERT_NONE
                    ssl_sock = ctx.wrap_socket(sock, server_hostname=host)
                    cert = ssl_sock.getpeercert()
                    cipher = ssl_sock.cipher()
                    res["tls_version"] = ssl_sock.version()
                    res["tls_cipher"] = f"{cipher[0]}/{cipher[2]}" if cipher else None
                    sock = ssl_sock
                except Exception as e:
                    res["tls_error"] = str(e)

        # Open relay test
        sock.sendall(b"MAIL FROM:<test@attacker-relay-test.com>\r\n")
        time.sleep(0.2)
        mail_resp = sock.recv(512).decode("utf-8","replace").strip()
        if mail_resp.startswith("250"):
            sock.sendall(b"RCPT TO:<victim@external-relay-test.com>\r\n")
            time.sleep(0.2)
            rcpt_resp = sock.recv(512).decode("utf-8","replace").strip()
            res["open_relay"] = rcpt_resp.startswith("250")
            res["relay_resp"] = rcpt_resp
        else:
            res["open_relay"] = False
            res["relay_resp"] = mail_resp

        sock.sendall(b"QUIT\r\n")
        sock.close()
    except ConnectionRefusedError:
        res["error"] = "Connection refused"
    except socket.timeout:
        res["error"] = "Timeout"
    except Exception as e:
        res["error"] = str(e)
    return res

def main():
    print("[MODULE 120] SMTP PROBE")
    print("[SOURCE]     Raw TCP/SMTP socket — no external API key needed")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  mail.example.com        — probe SMTP on port 25")
        print("[USAGE]  mail.example.com:587     — submission port")
        print("[USAGE]  mail.example.com:465     — SMTPS")
        sys.exit(0)

    if ":" in raw:
        host, port_s = raw.rsplit(":",1)
        try: port = int(port_s)
        except: host, port = raw, 25
    else:
        host, port = raw, 25

    print(f"[TARGET]   {host}:{port}")
    print()

    # Try multiple ports
    ports_to_try = [port] if port != 25 else [25, 587, 465]
    for p in ports_to_try:
        print(f"[PORT {p}]")
        r = smtp_probe(host, p)

        if r["error"] and not r["banner"]:
            print(f"  CLOSED — {r['error']}")
            print()
            continue

        print(f"  OPEN")
        print(f"  [BANNER]      {r['banner'][:150] if r['banner'] else 'None'}")
        if r["ehlo_caps"]:
            print(f"  [CAPS]        {', '.join(r['ehlo_caps'][:8])}")
        if r["auth_methods"]:
            print(f"  [AUTH]        {', '.join(r['auth_methods'])}")
        print(f"  [STARTTLS]    {'YES' if r['starttls'] else 'NO'}")
        if r.get("tls_version"): print(f"  [TLS VERSION] {r['tls_version']}")
        if r.get("tls_cipher"): print(f"  [TLS CIPHER]  {r['tls_cipher']}")
        print()

        # Open relay
        if r["open_relay"] is True:
            print(f"  [OPEN RELAY]  ✗  VULNERABLE — server accepts mail for external domains")
            print(f"  [RISK]        CRITICAL — server can be used for spam/phishing campaigns")
            print(f"  [FIX]         Require authentication for all non-local delivery")
        elif r["open_relay"] is False:
            print(f"  [OPEN RELAY]  ✓  CLOSED — relay properly restricted")

        if not r["starttls"] and p != 465:
            print(f"  ⚠  STARTTLS not offered — credentials/mail sent in plaintext")
        if r.get("auth_methods") and "PLAIN" in r["auth_methods"] and not r["starttls"]:
            print(f"  ⚠  AUTH PLAIN offered without STARTTLS — credentials exposed")
        print()

        if port != 25:
            break

    print("[DONE] SMTP probe complete.")

if __name__ == "__main__":
    main()
