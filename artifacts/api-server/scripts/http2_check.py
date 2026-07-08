"""HTTP/2 Check — Module 70. Usage: http2_check.py "domain.com" """
import sys, ssl, socket, json, urllib.request

def check_alpn(domain: str, port: int = 443) -> dict:
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    ctx.set_alpn_protocols(["h2", "http/1.1"])
    result = {}
    try:
        with socket.create_connection((domain, port), timeout=6) as raw_sock:
            with ctx.wrap_socket(raw_sock, server_hostname=domain) as sock:
                result["negotiated"] = sock.selected_alpn_protocol()
                result["tls_version"] = sock.version()
                result["cipher"]      = sock.cipher()
                cert = sock.getpeercert()
                result["cert_cn"] = cert.get("subject",((("","),),))[0][0][1] if cert else ""
    except Exception as e:
        result["error"] = str(e)
    return result

def check_http3(domain: str) -> str:
    """Check Alt-Svc header for HTTP/3 (QUIC) support"""
    try:
        req = urllib.request.Request(
            f"https://{domain}/",
            headers={"User-Agent": "SentinelOSINT/1.0"}
        )
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE
        import urllib.request as ur
        handler = ur.HTTPSHandler(context=ssl_ctx)
        opener  = ur.build_opener(handler)
        with opener.open(req, timeout=6) as resp:
            return resp.getheader("Alt-Svc",""), resp.getheader("Server",""), resp.status
    except Exception:
        return "", "", 0

def main():
    print("[MODULE 070] HTTP/2 CHECK")
    print("[SOURCE]     TLS ALPN negotiation + Alt-Svc header inspection")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip().lower()
    if not raw:
        print("[ERROR] No domain supplied.")
        sys.exit(1)

    domain = raw.lstrip("https://").lstrip("http://").split("/")[0].split(":")[0]
    port = 443
    if ":" in raw.split("/")[-1]:
        try:
            port = int(raw.split(":")[-1])
        except Exception:
            pass

    print(f"[TARGET]  {domain}:{port}")
    print()

    print("[STEP 1] TLS ALPN negotiation...")
    result = check_alpn(domain, port)
    if result.get("error"):
        print(f"  Error: {result['error']}")
        negotiated = None
    else:
        negotiated = result.get("negotiated")
        tls_ver    = result.get("tls_version","?")
        cipher     = result.get("cipher",())
        print(f"  TLS version:      {tls_ver}")
        if cipher:
            print(f"  Cipher suite:     {cipher[0]}")
            print(f"  Cipher strength:  {cipher[2]} bits")
        print(f"  ALPN negotiated:  {negotiated or 'none (HTTP/1.1)'}")

    print()
    print("[STEP 2] HTTP/2 support assessment...")
    if negotiated == "h2":
        print("  ✓ HTTP/2 (h2) — TLS ALPN negotiation confirmed")
        print("  Multiplexing:     ✓")
        print("  Header compress:  ✓ (HPACK)")
        print("  Server push:      possible")
        print("  Binary framing:   ✓")
    elif negotiated == "http/1.1":
        print("  ✗ HTTP/1.1 only — server does not support HTTP/2 via ALPN")
    else:
        print(f"  ? Protocol: {negotiated or 'unknown'}")

    print()
    print("[STEP 3] HTTP/3 (QUIC) via Alt-Svc...")
    try:
        alt_svc, server, status = check_http3(domain)
        if server:
            print(f"  Server header:  {server}")
        if alt_svc:
            print(f"  Alt-Svc:        {alt_svc}")
            if "h3" in alt_svc.lower():
                print("  ✓ HTTP/3 (QUIC) advertised in Alt-Svc")
                import re
                h3_versions = re.findall(r'h3[\-=][^,;"\s]+', alt_svc)
                if h3_versions:
                    print(f"    Versions:  {', '.join(h3_versions)}")
            else:
                print("  ✗ No HTTP/3 in Alt-Svc")
        else:
            print("  ✗ No Alt-Svc header — HTTP/3 not advertised")
    except Exception as e:
        print(f"  Alt-Svc check failed: {e}")

    print()
    print("[SUMMARY]")
    h2 = negotiated == "h2"
    print(f"  HTTP/1.1:  ✓ (baseline)")
    print(f"  HTTP/2:    {'✓ supported' if h2 else '✗ not supported'}")
    print(f"  HTTP/3:    check Alt-Svc output above")
    if not h2:
        print()
        print("  [REC]  Enable HTTP/2 for better performance (multiplexing, header compression)")

    print()
    print("[DONE] HTTP/2 check complete.")

if __name__ == "__main__":
    main()
