"""Header Grade — Module 67. Usage: header_grade.py "https://example.com" """
import sys, http.client, ssl, urllib.parse, re

SECURITY_HEADERS = {
    "strict-transport-security":       ("A", "HSTS — forces HTTPS"),
    "content-security-policy":         ("A", "CSP — prevents XSS/injection"),
    "x-content-type-options":          ("B", "nosniff — prevents MIME sniffing"),
    "x-frame-options":                 ("B", "Clickjacking protection (use CSP frame-ancestors instead)"),
    "x-xss-protection":                ("C", "Legacy XSS filter (deprecated — use CSP)"),
    "referrer-policy":                 ("B", "Controls referrer info leakage"),
    "permissions-policy":              ("B", "Restrict browser features (camera, mic, geolocation…)"),
    "feature-policy":                  ("C", "Deprecated — use Permissions-Policy"),
    "cross-origin-embedder-policy":    ("A", "COEP — isolation for SharedArrayBuffer"),
    "cross-origin-opener-policy":      ("A", "COOP — process isolation"),
    "cross-origin-resource-policy":    ("A", "CORP — prevent cross-origin reads"),
    "cache-control":                   ("B", "Cache directives (check for sensitive data caching)"),
    "x-powered-by":                    ("F", "⚠ Leaks tech stack — should be REMOVED"),
    "server":                          ("C", "Leaks server version — consider obfuscating"),
    "x-aspnet-version":                ("F", "⚠ Leaks ASP.NET version — REMOVE this header"),
    "x-aspnetmvc-version":             ("F", "⚠ Leaks ASP.NET MVC version — REMOVE"),
    "expect-ct":                       ("C", "Deprecated (Chrome 107+) — Certificate Transparency"),
}

GRADE_ORDER = ["A", "B", "C", "D", "F"]

def fetch_headers(url: str):
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE
    parsed = urllib.parse.urlparse(url)
    scheme = parsed.scheme.lower()
    host   = parsed.netloc
    path   = parsed.path or "/"

    if scheme == "https":
        conn = http.client.HTTPSConnection(host, timeout=8, context=ssl_ctx)
    else:
        conn = http.client.HTTPConnection(host, timeout=8)
    conn.request("HEAD", path, headers={"User-Agent": "Mozilla/5.0 (SentinelOSINT)"})
    resp = conn.getresponse()
    status = resp.status
    headers = {k.lower(): v for k, v in resp.getheaders()}
    conn.close()
    return status, headers, scheme

def main():
    print("[MODULE 067] SECURITY HEADER GRADE")
    print("[SOURCE]     Direct HTTP HEAD request — security header scoring")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No URL supplied.")
        sys.exit(1)

    if not raw.startswith(("http://", "https://")):
        raw = "https://" + raw

    print(f"[TARGET]  {raw}")
    print()

    try:
        status, headers, scheme = fetch_headers(raw)
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

    print(f"[HTTP]     {status}  via {'HTTPS ✓' if scheme == 'https' else 'HTTP ✗'}")
    print()

    score = 100
    grade_hits = {"A": 0, "B": 0, "C": 0, "D": 0, "F": 0}
    present = []
    missing = []
    leaking = []

    for header, (grade, desc) in SECURITY_HEADERS.items():
        val = headers.get(header, "")
        present_flag = header in headers

        if grade == "F":  # Leaking headers — penalize if present
            if present_flag:
                leaking.append((header, val, desc))
                score -= 10
        elif header == "x-xss-protection" or header == "feature-policy" or header == "expect-ct":
            # Deprecated — minor note
            if present_flag:
                present.append((header, val, grade, desc, True))
            else:
                pass
        else:
            if present_flag:
                present.append((header, val, grade, desc, False))
                grade_hits[grade] += 1
            else:
                missing.append((header, grade, desc))
                deduct = {"A": 15, "B": 10, "C": 5}.get(grade, 5)
                score -= deduct

    # HTTPS bonus/penalty
    if scheme == "https":
        score = min(score + 5, 100)
    else:
        score -= 20

    score = max(0, min(100, score))
    letter = "A+" if score >= 95 else "A" if score >= 85 else "B" if score >= 75 else "C" if score >= 60 else "D" if score >= 45 else "F"

    print(f"[SCORE]  {score}/100  →  Grade: {letter}")
    print()

    if present:
        print(f"[PRESENT HEADERS]  {len(present)}")
        for header, val, grade, desc, deprecated in present:
            dep_tag = " (deprecated)" if deprecated else ""
            print(f"  ✓  {header}")
            print(f"       {val[:100]}")
        print()

    if leaking:
        print(f"[LEAKING HEADERS — REMOVE THESE]  {len(leaking)}")
        for header, val, desc in leaking:
            print(f"  ✗  {header}: {val[:80]}")
            print(f"       {desc}")
        print()

    if missing:
        print(f"[MISSING HEADERS — ADD THESE]  {len(missing)}")
        for header, grade, desc in sorted(missing, key=lambda x: GRADE_ORDER.index(x[1])):
            print(f"  ✗  [{grade}] {header}")
            print(f"       {desc}")
        print()

    print("[RECOMMENDATIONS]")
    if "strict-transport-security" not in headers and scheme == "https":
        print("  Add:  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload")
    if "content-security-policy" not in headers:
        print("  Add:  Content-Security-Policy: default-src 'self'; ...")
    if "x-content-type-options" not in headers:
        print("  Add:  X-Content-Type-Options: nosniff")
    if "referrer-policy" not in headers:
        print("  Add:  Referrer-Policy: strict-origin-when-cross-origin")
    if "permissions-policy" not in headers:
        print("  Add:  Permissions-Policy: geolocation=(), microphone=(), camera=()")

    print()
    print("[DONE] Security header grade complete.")

if __name__ == "__main__":
    main()
