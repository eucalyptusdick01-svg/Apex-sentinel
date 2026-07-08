"""HTTP/2 Check — Module 70. Usage: http2_check.py "domain.com" """
import sys, socket, ssl, struct

def main():
    print("[MODULE 070] HTTP/2 CHECK")
    print("[SOURCE]     Direct TLS negotiation — ALPN protocol detection")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No domain supplied.")
        sys.exit(1)

    domain = raw.lower().lstrip("https://").lstrip("http://").split("/")[0]
    port = 443
    print(f"[TARGET]  {domain}:{port}")
    print()

    results = {}

    # TLS/ALPN negotiation
    print("[STEP 1] TLS ALPN negotiation (h2 + http/1.1)...")
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    ctx.set_alpn_protocols(["h2", "http/1.1"])
    ctx.check_hostname = True
    ctx.verify_mode = ssl.CERT_REQUIRED
    try:
        with socket.create_connection((domain, port), timeout=6) as sock:
            with ctx.wrap_socket(sock, server_hostname=domain) as tls:
                alpn = tls.selected_alpn_protocol()
                tls_ver = tls.version()
                cipher = tls.cipher()
                results["alpn"] = alpn
                results["tls_version"] = tls_ver
                results["cipher"] = cipher[0] if cipher else "?"
                results["cipher_bits"] = cipher[2] if cipher and len(cipher) > 2 else 0
        print(f"  ALPN protocol:   {alpn or 'none'}")
        print(f"  TLS version:     {tls_ver}")
        print(f"  Cipher:          {results['cipher']}  ({results['cipher_bits']} bits)")
        h2_via_alpn = alpn == "h2"
        print(f"  HTTP/2 via ALPN: {'✓' if h2_via_alpn else '✗'}")
    except ssl.SSLError as e:
        print(f"  TLS Error: {e}")
        h2_via_alpn = False
    except Exception as e:
        print(f"  Error: {e}")
        h2_via_alpn = False

    print()

    # Plain HTTP upgrade (h2c)
    print("[STEP 2] HTTP/1.1 Upgrade: h2c (cleartext HTTP/2)...")
    try:
        with socket.create_connection((domain, 80), timeout=5) as sock:
            request = (
                f"GET / HTTP/1.1\r\n"
                f"Host: {domain}\r\n"
                f"Connection: Upgrade, HTTP2-Settings\r\n"
                f"Upgrade: h2c\r\n"
                f"HTTP2-Settings: AAMAAABkAAQAAP__\r\n"
                f"\r\n"
            )
            sock.sendall(request.encode())
            response = sock.recv(512).decode(errors="ignore")
            if "101" in response and "h2c" in response.lower():
                print("  ✓ h2c upgrade supported (HTTP/2 cleartext)")
                results["h2c"] = True
            elif "200" in response or "301" in response or "302" in response:
                status_line = response.split("\r\n")[0]
                print(f"  ✗ No h2c upgrade ({status_line})")
                results["h2c"] = False
            else:
                print(f"  ✗ No h2c upgrade")
                results["h2c"] = False
    except ConnectionRefusedError:
        print("  Port 80 not open")
        results["h2c"] = False
    except Exception as e:
        print(f"  Error: {e}")
        results["h2c"] = False

    print()

    # Upgrade-Insecure-Requests check via HTTP headers
    print("[STEP 3] HTTP headers check...")
    import urllib.request, urllib.error
    try:
        req = urllib.request.Request(f"https://{domain}", headers={"User-Agent": "SentinelOSINT/1.0"})
        with urllib.request.urlopen(req, timeout=6) as resp:
            hdrs = {k.lower(): v for k, v in resp.headers.items()}
            alt_svc = hdrs.get("alt-svc", "")
            upgrade = hdrs.get("upgrade", "")
            connection = hdrs.get("connection", "")
            print(f"  Alt-Svc:    {alt_svc[:80] or 'none'}")
            print(f"  Upgrade:    {upgrade or 'none'}")
            if "h3" in alt_svc.lower() or "h3-" in alt_svc.lower():
                print("  HTTP/3 (QUIC) advertised via Alt-Svc!")
                results["h3"] = True
            else:
                results["h3"] = False
    except Exception as e:
        print(f"  Headers error: {e}")
        results["h3"] = False

    print()
    print("[SUMMARY]")
    print(f"  HTTP/1.1:          ✓ (baseline)")
    print(f"  HTTP/2 (TLS/ALPN): {'✓' if h2_via_alpn else '✗'}")
    print(f"  HTTP/2 (h2c):      {'✓' if results.get('h2c') else '✗'}")
    print(f"  HTTP/3 (QUIC):     {'✓' if results.get('h3') else '?'}")
    if results.get("tls_version"):
        print(f"  TLS version:       {results['tls_version']}")
    if h2_via_alpn:
        print()
        print("  [OK] HTTP/2 is enabled — benefits: multiplexing, header compression, server push")
    else:
        print()
        print("  [INFO] HTTP/2 not detected — still using HTTP/1.1")
        print("         HTTP/2 can improve performance significantly for web traffic")

    print()
    print("[DONE] HTTP/2 check complete.")

if __name__ == "__main__":
    main()
