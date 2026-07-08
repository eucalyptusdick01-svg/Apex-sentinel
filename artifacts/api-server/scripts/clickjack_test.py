"""Clickjacking Test — Module 72. Usage: clickjack_test.py "https://example.com" """
import sys, urllib.request, urllib.error

def main():
    print("[MODULE 072] CLICKJACKING TEST")
    print("[SOURCE]     Direct HTTP — X-Frame-Options + CSP frame-ancestors analysis")
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
            hdrs = {k.lower(): v for k, v in resp.headers.items()}
            status = resp.status
    except urllib.error.HTTPError as e:
        hdrs = {k.lower(): v for k, v in e.headers.items()} if e.headers else {}
        status = e.code
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

    print(f"[HTTP STATUS]  {status}")
    print()

    xfo = hdrs.get("x-frame-options", "")
    csp = hdrs.get("content-security-policy", "")

    # Check X-Frame-Options
    print("[X-FRAME-OPTIONS]")
    if xfo:
        xfo_upper = xfo.strip().upper()
        print(f"  Value:  {xfo}")
        if xfo_upper == "DENY":
            print("  ✓ DENY — page cannot be framed by anyone")
        elif xfo_upper == "SAMEORIGIN":
            print("  ✓ SAMEORIGIN — page can only be framed by same origin")
        elif xfo_upper.startswith("ALLOW-FROM"):
            origin = xfo_upper.replace("ALLOW-FROM", "").strip()
            print(f"  ⚠ ALLOW-FROM {origin} — only specific origin allowed")
            print("    Note: ALLOW-FROM is deprecated and not supported in modern browsers")
        else:
            print(f"  ? Unknown value: {xfo}")
    else:
        print("  ✗ Not present")
    print()

    # Check CSP frame-ancestors
    print("[CSP FRAME-ANCESTORS]")
    frame_ancestors = ""
    if csp:
        for directive in csp.split(";"):
            directive = directive.strip()
            if directive.lower().startswith("frame-ancestors"):
                frame_ancestors = directive
                break

    if frame_ancestors:
        print(f"  Value:  {frame_ancestors}")
        val = frame_ancestors.split(None, 1)[1].strip() if len(frame_ancestors.split()) > 1 else ""
        if "'none'" in val:
            print("  ✓ frame-ancestors 'none' — cannot be embedded anywhere")
        elif "'self'" in val:
            print("  ✓ frame-ancestors 'self' — only same-origin embedding")
        else:
            print(f"  ⚠ Allows specific origins: {val[:100]}")
    else:
        print("  ✗ No frame-ancestors directive in CSP")
    print()

    # Verdict
    print("[VERDICT]")
    protected = bool(xfo) or bool(frame_ancestors)
    if not protected:
        print("  ✗ VULNERABLE to Clickjacking")
        print("  Neither X-Frame-Options nor CSP frame-ancestors is set")
        print()
        print("[REMEDIATION]")
        print('  Option 1: X-Frame-Options: DENY')
        print('  Option 2: Content-Security-Policy: frame-ancestors \'none\'; ...')
        print("  (CSP frame-ancestors is preferred — supported by all modern browsers)")
    elif frame_ancestors and not xfo:
        print("  ✓ Protected via CSP frame-ancestors")
        print("  Note: Old browsers without CSP support may still be vulnerable — add X-Frame-Options too")
    elif xfo and not frame_ancestors:
        print("  ⚠ Protected via X-Frame-Options only")
        print("  Recommend adding CSP frame-ancestors for stronger, more flexible protection")
    else:
        print("  ✓ Protected by both X-Frame-Options AND CSP frame-ancestors (best practice)")

    print()
    print("[DONE] Clickjacking test complete.")

if __name__ == "__main__":
    main()
