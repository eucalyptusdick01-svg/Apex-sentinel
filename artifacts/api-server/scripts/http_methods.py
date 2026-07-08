"""HTTP Methods — Module 69. Usage: http_methods.py "https://example.com" """
import sys, urllib.request, urllib.error, socket

METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS", "TRACE",
           "CONNECT", "PROPFIND", "PROPPATCH", "MKCOL", "COPY", "MOVE",
           "LOCK", "UNLOCK", "SEARCH"]

DANGEROUS = {"TRACE", "CONNECT", "PROPFIND", "PROPPATCH", "MKCOL", "COPY",
             "MOVE", "LOCK", "UNLOCK", "SEARCH", "DELETE", "PUT"}

def probe_method(url: str, method: str, timeout: float = 5.0):
    try:
        req = urllib.request.Request(url, method=method, headers={
            "User-Agent": "SentinelOSINT/1.0",
            "Content-Length": "0",
        })
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status, resp.headers.get("Allow",""), resp.headers.get("Server","")
    except urllib.error.HTTPError as e:
        return e.code, e.headers.get("Allow","") if e.headers else "", \
               e.headers.get("Server","") if e.headers else ""
    except Exception as e:
        return 0, "", str(e)[:40]

def main():
    print("[MODULE 069] HTTP METHODS")
    print("[SOURCE]     Direct HTTP probe — checks allowed methods on the target")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No URL supplied.")
        sys.exit(1)

    url = raw if raw.startswith("http") else "https://" + raw
    print(f"[TARGET]  {url}")
    print()

    # First try OPTIONS to get Allow header
    print("[STEP 1] OPTIONS request (server-declared allowed methods)...")
    code, allow_hdr, server = probe_method(url, "OPTIONS")
    print(f"  HTTP {code}  Server: {server}")
    if allow_hdr:
        declared = [m.strip().upper() for m in allow_hdr.split(",")]
        print(f"  Allow: {allow_hdr}")
    else:
        declared = []
        print("  No Allow header returned")
    print()

    # Probe each method
    print("[STEP 2] Probing methods individually...")
    print(f"  {'METHOD':12s}  {'CODE':6s}  {'RISK':8s}  {'NOTES'}")
    print(f"  {'-'*12}  {'-'*6}  {'-'*8}  {'-'*30}")

    results = {}
    for method in METHODS:
        code, allow, _ = probe_method(url, method, timeout=4)
        allowed = code not in (405, 501, 0)
        risk = "HIGH" if method in DANGEROUS and allowed else ("MED" if method in DANGEROUS else "OK")
        note = ""
        if code == 200 and method == "TRACE":
            note = "XST attack possible!"
        if code in (401, 403):
            note = "Auth required"
        results[method] = (code, allowed, risk)
        marker = "✓" if allowed else "✗"
        print(f"  {marker} {method:10s}  {code or 'ERR':6}  {risk:8s}  {note}")

    print()

    # Summary
    allowed_methods = [m for m, (c, a, r) in results.items() if a]
    dangerous_allowed = [m for m in allowed_methods if m in DANGEROUS]

    print("[SUMMARY]")
    print(f"  Allowed methods:   {', '.join(allowed_methods)}")
    if declared:
        print(f"  Server-declared:   {', '.join(declared)}")
    if dangerous_allowed:
        print(f"  [WARN] Dangerous methods enabled: {', '.join(dangerous_allowed)}")
        if "TRACE" in dangerous_allowed:
            print("  [CRITICAL] TRACE enabled — Cross-Site Tracing (XST) vulnerability!")
        if "DELETE" in dangerous_allowed:
            print("  [HIGH] DELETE enabled — may allow resource deletion!")
        if "PUT" in dangerous_allowed:
            print("  [HIGH] PUT enabled — may allow file upload!")
    else:
        print("  [OK] No dangerous methods detected")

    print()
    print("[DONE] HTTP methods probe complete.")

if __name__ == "__main__":
    main()
