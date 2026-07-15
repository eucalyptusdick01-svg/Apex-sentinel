"""XSS Headers — Module 76. Analyze HTTP security headers for XSS protections."""
import sys, urllib.request, urllib.error, urllib.parse, re

def grade_csp(csp):
    """Grade a CSP header for XSS protection strength."""
    if not csp:
        return "F", ["No Content-Security-Policy header"]
    issues = []
    notes = []
    score = 100

    if "'unsafe-inline'" in csp:
        issues.append("'unsafe-inline' allows inline scripts — XSS protection bypassed")
        score -= 40
    if "'unsafe-eval'" in csp:
        issues.append("'unsafe-eval' allows eval() — reduces XSS protection")
        score -= 20
    if "script-src *" in csp or "default-src *" in csp:
        issues.append("Wildcard (*) in script/default-src — any script allowed")
        score -= 50
    if "script-src" not in csp and "default-src" not in csp:
        issues.append("No script-src or default-src directive")
        score -= 30
    if "nonce-" in csp or "sha256-" in csp:
        notes.append("Nonce/hash-based CSP — strong inline protection")
        score += 10
    if "strict-dynamic" in csp:
        notes.append("'strict-dynamic' detected — modern CSP approach")

    score = max(0, min(100, score))
    if score >= 80: grade = "A"
    elif score >= 60: grade = "B"
    elif score >= 40: grade = "C"
    elif score >= 20: grade = "D"
    else: grade = "F"
    return grade, issues + notes

def main():
    print("[MODULE 76] XSS HEADER ANALYZER")
    print("[SOURCE]    HTTP response header security analysis — no API key needed")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  https://example.com  — analyze XSS protection headers")
        sys.exit(0)

    target = raw if raw.startswith("http") else "https://" + raw

    try:
        req = urllib.request.Request(target, headers={"User-Agent":"Mozilla/5.0"})
        resp = urllib.request.urlopen(req, timeout=8)
        headers = dict(resp.headers)
        status = resp.status
    except urllib.error.HTTPError as e:
        headers = dict(e.headers); status = e.code
    except Exception as e:
        print(f"[ERROR]  {e}")
        sys.exit(1)

    print(f"[TARGET]  {target}  (HTTP {status})")
    print()

    csp = headers.get("content-security-policy","")
    xfo = headers.get("x-frame-options","")
    xxp = headers.get("x-xss-protection","")
    nosniff = headers.get("x-content-type-options","")
    rp = headers.get("referrer-policy","")
    coep = headers.get("cross-origin-embedder-policy","")
    coop = headers.get("cross-origin-opener-policy","")

    print("[HEADERS PRESENT]")
    def hdr(name, val):
        present = "✓" if val else "✗"
        print(f"  {present}  {name:<40} {val[:80] if val else 'MISSING'}")

    hdr("Content-Security-Policy", csp)
    hdr("X-Frame-Options", xfo)
    hdr("X-XSS-Protection", xxp)
    hdr("X-Content-Type-Options", nosniff)
    hdr("Referrer-Policy", rp)
    hdr("Cross-Origin-Embedder-Policy", coep)
    hdr("Cross-Origin-Opener-Policy", coop)
    print()

    # CSP grade
    grade, csp_notes = grade_csp(csp)
    print(f"[CSP GRADE]  {grade}")
    for n in csp_notes:
        flag = "⚠" if "allows" in n or "bypass" in n or "No " in n or "Wildcard" in n else "✓"
        print(f"  {flag}  {n}")
    print()

    # X-XSS-Protection analysis
    if xxp:
        if xxp.startswith("0"):
            print("[X-XSS-PROTECTION]  Explicitly disabled (0) — acceptable if strong CSP present")
        elif "mode=block" in xxp:
            print("[X-XSS-PROTECTION]  Enabled with block mode (1; mode=block) — legacy browsers")
        else:
            print("[X-XSS-PROTECTION]  Enabled without block mode — can cause information leaks")
    else:
        print("[X-XSS-PROTECTION]  MISSING — legacy browsers unprotected")

    # X-Frame-Options
    print()
    if not xfo and "frame-ancestors" not in csp:
        print("[CLICKJACKING]  ⚠  No X-Frame-Options or CSP frame-ancestors — clickjacking risk")
    elif xfo.upper() in ("DENY","SAMEORIGIN"):
        print(f"[CLICKJACKING]  ✓  {xfo}")

    # Referrer policy
    print()
    safe_rp = {"no-referrer","no-referrer-when-downgrade","strict-origin","strict-origin-when-cross-origin"}
    if not rp:
        print("[REFERRER]  ⚠  No Referrer-Policy — URLs may leak in Referer header")
    elif rp.lower() in safe_rp:
        print(f"[REFERRER]  ✓  {rp}")
    else:
        print(f"[REFERRER]  ⚠  '{rp}' may leak sensitive URL parameters")

    print()
    print("[DONE] XSS header analysis complete.")

if __name__ == "__main__":
    main()
