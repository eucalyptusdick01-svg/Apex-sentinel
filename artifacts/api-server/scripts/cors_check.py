"""
CORS Check — Module 51
Probes a URL with OPTIONS preflight + GET to inspect CORS posture.
Usage: cors_check.py "https://api.example.com"
       cors_check.py "https://api.example.com origin:https://evil.com"
"""
import sys
import urllib.request
import urllib.error

CORS_HEADERS = [
    "Access-Control-Allow-Origin",
    "Access-Control-Allow-Methods",
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Credentials",
    "Access-Control-Max-Age",
    "Access-Control-Expose-Headers",
    "Vary",
]

def req_headers(url: str, method: str, extra: dict) -> tuple:
    try:
        r = urllib.request.Request(url, method=method, headers=extra)
        with urllib.request.urlopen(r, timeout=8) as resp:
            return resp.status, dict(resp.headers)
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers) if e.headers else {}
    except Exception as e:
        return None, {"_error": str(e)}

def main() -> None:
    print("[MODULE 051] CORS CHECKER")
    print("[SOURCE]     OPTIONS preflight + GET with Origin probe")
    print()

    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No URL supplied.")
        print("[USAGE] cors_check.py \"https://api.example.com\" [origin:https://test.com]")
        sys.exit(1)

    parts = raw.split()
    url = parts[0] if parts[0].startswith("http") else "https://" + parts[0]
    origin = "https://evil.example.com"
    for p in parts[1:]:
        if p.startswith("origin:"):
            origin = p[7:]

    print(f"[TARGET]  {url}")
    print(f"[ORIGIN]  {origin}")
    print()

    pflight_hdrs = {
        "Origin": origin,
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "Content-Type,Authorization",
    }

    print("[STEP 1] OPTIONS preflight...")
    pf_status, pf_h = req_headers(url, "OPTIONS", pflight_hdrs)
    if "_error" in pf_h:
        print(f"         ERROR — {pf_h['_error']}")
    else:
        print(f"         HTTP {pf_status}")
        for h in CORS_HEADERS:
            val = pf_h.get(h) or pf_h.get(h.lower())
            if val:
                print(f"         {h}: {val}")

    print()
    print("[STEP 2] GET with Origin header...")
    get_status, get_h = req_headers(url, "GET", {"Origin": origin, "User-Agent": "Mozilla/5.0"})
    if "_error" in get_h:
        print(f"         ERROR — {get_h['_error']}")
    else:
        print(f"         HTTP {get_status}")
        for h in CORS_HEADERS:
            val = get_h.get(h) or get_h.get(h.lower())
            if val:
                print(f"         {h}: {val}")

    all_h: dict = {}
    all_h.update(pf_h)
    all_h.update(get_h)
    acao = all_h.get("Access-Control-Allow-Origin") or all_h.get("access-control-allow-origin", "")
    acac = all_h.get("Access-Control-Allow-Credentials") or all_h.get("access-control-allow-credentials", "")

    print()
    print("[ANALYSIS]")
    if not acao:
        print("  [OK]       No CORS headers — likely same-origin only")
    elif acao == "*":
        print("  [WARN]     Wildcard ACAO (*) — any origin may read non-credentialed responses")
    elif acao == origin:
        if acac and acac.lower() == "true":
            print("  [CRITICAL] ACAO reflects test origin AND ACAC=true — credentialed XS requests ALLOWED")
        else:
            print(f"  [INFO]     ACAO reflects origin ({acao}) — but ACAC not true, credentials blocked")
    else:
        print(f"  [INFO]     ACAO = {acao}")

    print()
    print("[DONE] CORS check complete.")

if __name__ == "__main__":
    main()
