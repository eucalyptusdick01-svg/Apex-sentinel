"""SMTP TLS — Module 177. Full STARTTLS probe + TLS certificate + cipher analysis."""
import sys, socket, ssl, re, time, hashlib, struct

def smtp_tls_probe(host, port=25, timeout=10):
    res = {"host": host, "port": port, "starttls": False, "tls_version": None,
           "cipher": None, "cert": None, "error": None, "mta_sts": False}
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        sock.connect((host, port))

        # Read banner
        banner = sock.recv(1024).decode("utf-8","replace").strip()
        res["banner"] = banner

        if port == 465:
            # Implicit TLS
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            ssl_sock = ctx.wrap_socket(sock, server_hostname=host)
        else:
            # EHLO + STARTTLS
            sock.sendall(f"EHLO probe.swept-sentinel.local\r\n".encode())
            time.sleep(0.3)
            ehlo = sock.recv(4096).decode("utf-8","replace")
            res["ehlo"] = ehlo[:200]

            if "STARTTLS" not in ehlo.upper():
                res["error"] = "STARTTLS not advertised"
                sock.close()
                return res

            sock.sendall(b"STARTTLS\r\n")
            time.sleep(0.3)
            tls_resp = sock.recv(256).decode("utf-8","replace").strip()
            if not tls_resp.startswith("220"):
                res["error"] = f"STARTTLS rejected: {tls_resp}"
                sock.close()
                return res

            res["starttls"] = True
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            ssl_sock = ctx.wrap_socket(sock, server_hostname=host)

        # TLS info
        res["tls_version"] = ssl_sock.version()
        cipher = ssl_sock.cipher()
        res["cipher"] = cipher[0] if cipher else None
        res["cipher_bits"] = cipher[2] if cipher else None
        res["cipher_proto"] = cipher[1] if cipher else None

        # Certificate
        cert = ssl_sock.getpeercert()
        if cert:
            res["cert_subject"] = dict(x[0] for x in cert.get("subject",[]))
            res["cert_issuer"] = dict(x[0] for x in cert.get("issuer",[]))
            res["cert_expiry"] = cert.get("notAfter","")
            res["cert_sans"] = cert.get("subjectAltName",[])

        # Get DER cert for fingerprint
        der = ssl_sock.getpeercert(binary_form=True)
        if der:
            res["sha256"] = hashlib.sha256(der).hexdigest()
            res["sha1"] = hashlib.sha1(der).hexdigest()

        ssl_sock.close()
    except ConnectionRefusedError:
        res["error"] = "Connection refused"
    except socket.timeout:
        res["error"] = "Timeout"
    except Exception as e:
        res["error"] = str(e)
    return res

def main():
    print("[MODULE 177] SMTP TLS PROBE")
    print("[SOURCE]     SMTP + TLS socket probe — no API key needed")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  mail.example.com        — probe port 25 STARTTLS")
        print("[USAGE]  mail.example.com:587     — submission with STARTTLS")
        print("[USAGE]  mail.example.com:465     — implicit TLS (SMTPS)")
        sys.exit(0)

    if ":" in raw:
        host, p = raw.rsplit(":",1)
        try: port = int(p)
        except: host, port = raw, 25
    else:
        host, port = raw, 25

    print(f"[TARGET]  {host}:{port}")
    print()

    ports = [port] if port != 25 else [25, 587, 465]
    for p in ports:
        print(f"[PORT {p}]")
        r = smtp_tls_probe(host, p)

        if r.get("error") and not r.get("banner") and not r.get("starttls"):
            print(f"  CLOSED/ERROR — {r['error']}")
            print()
            continue

        if r.get("banner"):
            print(f"  [BANNER]       {r['banner'][:100]}")

        if r.get("error") and not r.get("tls_version"):
            print(f"  [TLS]          FAILED — {r['error']}")
            print()
            continue

        print(f"  [STARTTLS]     {'YES' if r['starttls'] or p == 465 else 'NO'}")
        print(f"  [TLS VERSION]  {r.get('tls_version','?')}")
        print(f"  [CIPHER]       {r.get('cipher','?')} ({r.get('cipher_bits','?')} bits)")

        # Cert details
        if r.get("cert_subject"):
            cn = r["cert_subject"].get("commonName","?")
            print(f"  [CERT CN]      {cn}")
        if r.get("cert_expiry"):
            print(f"  [CERT EXPIRY]  {r['cert_expiry']}")
        if r.get("sha256"):
            print(f"  [SHA256]       {r['sha256'][:32]}...")
        print()

        # Security analysis
        tls_ver = r.get("tls_version","")
        cipher = r.get("cipher","")
        issues = []
        if tls_ver in ("SSLv2","SSLv3","TLSv1","TLSv1.1"):
            issues.append(f"Deprecated TLS version: {tls_ver}")
        if "RC4" in cipher or "DES" in cipher or "MD5" in cipher:
            issues.append(f"Weak cipher: {cipher}")
        if not r.get("starttls") and p != 465:
            issues.append("STARTTLS not negotiated — mail may travel in plaintext")

        if issues:
            for i in issues: print(f"  ⚠  {i}")
        else:
            print(f"  ✓  TLS configuration looks secure")
        print()

        if port != 25: break

    print("[DONE] SMTP TLS probe complete.")

if __name__ == "__main__":
    main()
