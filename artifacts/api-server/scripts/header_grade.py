"""Security Header Grade — Module 67. Usage: header_grade.py "https://example.com" """
import sys, urllib.request, urllib.error

GRADED_HEADERS = {
    "strict-transport-security": {
        "weight": 20, "label": "HSTS",
        "desc": "Forces HTTPS for future visits",
        "required_contains": []
    },
    "content-security-policy": {
        "weight": 25, "label": "CSP",
        "desc": "Restricts resource origins (XSS defence)",
        "required_contains": []
    },
    "x-frame-options": {
        "weight": 10, "label": "X-Frame-Options",
        "desc": "Clickjacking protection (older browsers)",
        "required_contains": []
    },
    "x-content-type-options": {
        "weight": 10, "label": "X-Content-Type-Options",
        "desc": "Prevents MIME sniffing",
        "required_contains": ["nosniff"]
    },
    "referrer-policy": {
        "weight": 10, "label": "Referrer-Policy",
        "desc": "Controls referrer leakage",
        "required_contains": []
    },
    "permissions-policy": {
        "weight": 10, "label": "Permissions-Policy",
        "desc": "Restricts browser feature access",
        "required_contains": []
    },
    "x-xss-protection": {
        "weight": 5, "label": "X-XSS-Protection",
        "desc": "Legacy XSS filter (deprecated but harmless)",
        "required_contains": []
    },
    "cross-origin-resource-policy": {
        "weight": 5, "label": "CORP",
        "desc": "Prevents cross-origin resource reads",
        "required_contains": []
    },
    "cross-origin-opener-policy": {
        "weight": 5, "label": "COOP",
        "desc": "Isolates browsing context",
        "required_contains": []
    },
}

def grade(score: int) -> str:
    if score >= 90: return "A+"
    if score >= 80: return "A"
    if score >= 70: return "B"
    if score >= 60: return "C"
    if score >= 50: return "D"
    return "F"

def main():
    print("[MODULE 067] SECURITY HEADER GRADE")
    print("[SOURCE]     Direct HTTP — checks and scores security response headers")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No URL supplied.")
        sys.exit(1)

    url = raw if raw.startswith("http") else "https://" + raw
    print(f"[TARGET]  {url}")
    print()

    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (SentinelOSINT/1.0)",
        })
        with urllib.request.urlopen(req, timeout=8) as resp:
            headers = {k.lower(): v for k, v in resp.headers.items()}
            status  = resp.status
    except urllib.error.HTTPError as e:
        headers = {k.lower(): v for k, v in e.headers.items()} if e.headers else {}
        status  = e.code
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

    print(f"[HTTP STATUS]  {status}")
    print()

    total_weight = sum(v["weight"] for v in GRADED_HEADERS.values())
    earned = 0
    present = []
    missing = []

    for hdr, cfg in GRADED_HEADERS.items():
        val = headers.get(hdr, "")
        if val:
            ok = True
            for req_str in cfg.get("required_contains", []):
                if req_str.lower() not in val.lower():
                    ok = False
            if ok:
                earned += cfg["weight"]
                present.append((cfg["label"], cfg["weight"], val))
            else:
                missing.append((cfg["label"], cfg["weight"], cfg["desc"], f"Present but invalid: {val[:60]}"))
        else:
            missing.append((cfg["label"], cfg["weight"], cfg["desc"], "Missing"))

    score = int((earned / total_weight) * 100)
    letter = grade(score)

    print(f"[GRADE]   {letter}  ({score}/100)")
    print()

    print(f"[✓ PRESENT]  {len(present)} header(s)")
    for label, weight, val in present:
        print(f"  +{weight:2d}  {label:35s}  {val[:70]}")
    print()

    print(f"[✗ MISSING]  {len(missing)} header(s)")
    for label, weight, desc, reason in missing:
        print(f"  -{weight:2d}  {label:35s}  {reason}")
        print(f"       → {desc}")
    print()

    # Extra info headers
    info_headers = ["server", "x-powered-by", "via", "x-aspnet-version", "x-aspnetmvc-version"]
    found_info = [(h, headers[h]) for h in info_headers if h in headers]
    if found_info:
        print("[INFORMATION DISCLOSURE]")
        for h, v in found_info:
            print(f"  [WARN]  {h}: {v}")
        print()

    print("[DONE] Header grade complete.")

if __name__ == "__main__":
    main()
