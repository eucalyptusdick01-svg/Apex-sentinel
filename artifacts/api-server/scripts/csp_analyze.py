"""
CSP Analyzer — Module 52
Fetches and parses Content-Security-Policy from a URL.
Usage: csp_analyze.py "https://example.com"
"""
import sys
import urllib.request
import urllib.error

CSP_DESC = {
    "default-src": "Default fallback for all fetch directives",
    "script-src": "JavaScript sources",
    "style-src": "CSS sources",
    "img-src": "Image sources",
    "connect-src": "XHR / fetch / WebSocket / EventSource targets",
    "font-src": "Font file sources",
    "object-src": "Plugin sources (<object>, <embed>)",
    "media-src": "Audio / video sources",
    "frame-src": "Frame and iframe sources",
    "child-src": "Workers and embedded frames (deprecated, use worker-src/frame-src)",
    "worker-src": "Web Worker sources",
    "frame-ancestors": "Who may embed this page in a frame",
    "form-action": "Allowed form submission destinations",
    "base-uri": "Restricts <base> element URIs",
    "manifest-src": "Web app manifest sources",
    "report-uri": "CSP violation report endpoint (deprecated)",
    "report-to": "CSP violation report endpoint (Reporting API)",
    "upgrade-insecure-requests": "Auto-upgrade HTTP subresources to HTTPS",
    "block-all-mixed-content": "Block all mixed (HTTP) content",
    "sandbox": "Applies sandbox restrictions",
    "require-trusted-types-for": "Forces Trusted Types for DOM sinks",
    "trusted-types": "Trusted Types policy allowlist",
}

RISKY = ["'unsafe-inline'", "'unsafe-eval'", "*", "data:", "http:", "'unsafe-hashes'"]

def fetch_headers(url: str) -> tuple:
    try:
        r = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(r, timeout=8) as resp:
            return resp.status, dict(resp.headers), None
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers) if e.headers else {}, None
    except Exception as e:
        return None, {}, str(e)

def parse_csp(raw: str) -> dict:
    d: dict = {}
    for part in raw.split(";"):
        part = part.strip()
        if not part:
            continue
        tokens = part.split()
        if tokens:
            d[tokens[0].lower()] = tokens[1:]
    return d

def main() -> None:
    print("[MODULE 052] CSP ANALYZER")
    print("[SOURCE]     Content-Security-Policy header parser")
    print()

    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No URL supplied.")
        sys.exit(1)

    url = raw if raw.startswith("http") else "https://" + raw
    print(f"[TARGET]  {url}")
    print()

    status, headers, err = fetch_headers(url)
    if err:
        print(f"[ERROR]   {err}")
        sys.exit(1)

    print(f"[HTTP]    {status}")
    print()

    csp_val = None
    csp_key = None
    for k, v in headers.items():
        kl = k.lower()
        if kl in ("content-security-policy", "x-content-security-policy", "x-webkit-csp"):
            csp_val = v
            csp_key = k
            break

    if not csp_val:
        print("[RESULT]  No Content-Security-Policy header found")
        print("[RISK]    MISSING — XSS and injection attacks are unrestricted")
        sys.exit(0)

    print(f"[HEADER]  {csp_key}")
    print()

    directives = parse_csp(csp_val)
    print(f"[DIRECTIVES] {len(directives)} directive(s) found:")
    print()

    risks = []
    for name, vals in directives.items():
        val_str = " ".join(vals) if vals else "(flag only)"
        desc = CSP_DESC.get(name, "")
        print(f"  ┌ {name.upper()}")
        print(f"  │ Value   : {val_str}")
        if desc:
            print(f"  │ Purpose : {desc}")
        for rv in RISKY:
            if rv in vals:
                risks.append(f"{name}: contains {rv!r}")
                print(f"  │ [WARN]  : {rv!r} weakens this directive")
        print(f"  └")
        print()

    print("[RISK SUMMARY]")
    if risks:
        for r in risks:
            print(f"  [WARN] {r}")
    else:
        print("  [OK] No obviously risky values detected")

    critical = ["default-src", "script-src", "object-src", "base-uri"]
    missing = [c for c in critical if c not in directives]
    if missing:
        print()
        print("[MISSING CRITICAL DIRECTIVES]")
        for m in missing:
            print(f"  [WARN] {m} — {CSP_DESC.get(m, '')}")

    print()
    print("[DONE] CSP analysis complete.")

if __name__ == "__main__":
    main()
