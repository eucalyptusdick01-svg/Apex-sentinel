"""HTTP Methods — Module 69. Usage: http_methods.py "https://example.com" """
import sys, http.client, ssl, urllib.parse, threading, time

METHODS_TO_TEST = ["GET", "HEAD", "POST", "PUT", "DELETE", "PATCH", "OPTIONS",
                   "TRACE", "CONNECT", "PROPFIND", "PROPPATCH", "MKCOL",
                   "COPY", "MOVE", "LOCK", "UNLOCK", "SEARCH", "PURGE", "DEBUG"]

DANGEROUS = {"TRACE", "CONNECT", "PROPFIND", "PROPPATCH", "MKCOL", "COPY", "MOVE",
             "LOCK", "UNLOCK", "DELETE", "PUT", "DEBUG", "PURGE"}

def test_method(scheme, host, path, method, results, timeout=5):
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE
    try:
        start = time.monotonic()
        if scheme == "https":
            conn = http.client.HTTPSConnection(host, timeout=timeout, context=ssl_ctx)
        else:
            conn = http.client.HTTPConnection(host, timeout=timeout)
        conn.request(method, path, headers={
            "User-Agent": "SentinelOSINT/1.0",
            "Content-Length": "0",
        })
        resp = conn.getresponse()
        elapsed = int((time.monotonic() - start) * 1000)
        results[method] = {"status": resp.status, "reason": resp.reason, "ms": elapsed,
                           "allow": resp.getheader("Allow",""), "server": resp.getheader("Server","")}
        conn.close()
    except Exception as e:
        results[method] = {"error": str(e)[:60]}

def main():
    print("[MODULE 069] HTTP METHODS")
    print("[SOURCE]     Direct HTTP probe — test allowed methods on target server")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No URL supplied.")
        sys.exit(1)

    if not raw.startswith(("http://", "https://")):
        raw = "https://" + raw

    parsed = urllib.parse.urlparse(raw)
    scheme = parsed.scheme
    host   = parsed.netloc
    path   = parsed.path or "/"

    print(f"[TARGET]  {raw}")
    print(f"[TESTING] {len(METHODS_TO_TEST)} HTTP methods...")
    print()

    results = {}
    threads = []
    for method in METHODS_TO_TEST:
        t = threading.Thread(target=test_method, args=(scheme, host, path, method, results))
        t.start()
        threads.append(t)
    for t in threads:
        t.join(timeout=8)

    allowed_from_options = ""
    if "OPTIONS" in results and not results["OPTIONS"].get("error"):
        allowed_from_options = results["OPTIONS"].get("allow", "")

    print(f"{'METHOD':<12}  {'STATUS':<6}  {'RESPONSE':<30}  {'NOTES'}")
    print("-" * 75)

    issues = []
    for method in METHODS_TO_TEST:
        r = results.get(method, {"error": "timeout"})
        if r.get("error"):
            print(f"  {method:<10}  {'ERR':<6}  {r['error'][:30]}")
            continue
        status = r.get("status", 0)
        reason = r.get("reason","")[:25]
        ms     = r.get("ms", 0)
        notes  = []
        if method in DANGEROUS and status < 400:
            notes.append("⚠ DANGEROUS")
            issues.append(f"{method} ({status}) — potentially dangerous method allowed")
        if method == "TRACE" and status == 200:
            notes.append("⚠ XST risk")
        print(f"  {method:<10}  {status:<6}  {reason:<30}  {' '.join(notes)}")

    if allowed_from_options:
        print()
        print(f"[OPTIONS Allow header]  {allowed_from_options}")

    if issues:
        print()
        print(f"[ISSUES]  {len(issues)}")
        for issue in issues:
            print(f"  ✗ {issue}")
    else:
        print()
        print("[OK]  No dangerous methods appear to be enabled")

    print()
    print("[DONE] HTTP methods check complete.")

if __name__ == "__main__":
    main()
