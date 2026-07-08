"""Cookie Audit — Module 66. Usage: cookie_audit.py "https://example.com" """
import sys, urllib.request, urllib.error, urllib.parse, http.cookiejar, re

def main():
    print("[MODULE 066] COOKIE AUDIT")
    print("[SOURCE]     Direct HTTP — cookie attribute security analysis")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No URL supplied.")
        sys.exit(1)

    url = raw if raw.startswith("http") else "https://" + raw
    print(f"[TARGET]  {url}")
    print()

    jar = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))

    try:
        req = urllib.request.Request(url, headers={
            "User-Agent": "Mozilla/5.0 (SentinelOSINT/1.0)",
            "Accept": "text/html,application/xhtml+xml,*/*"
        })
        with opener.open(req, timeout=8) as resp:
            set_cookie_headers = resp.headers.get_all("Set-Cookie") or []
            status = resp.status
    except urllib.error.HTTPError as e:
        set_cookie_headers = e.headers.get_all("Set-Cookie") if e.headers else []
        status = e.code
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

    print(f"[HTTP STATUS]  {status}")
    print(f"[COOKIES]      {len(set_cookie_headers)} Set-Cookie header(s)")
    print()

    if not set_cookie_headers:
        print("[RESULT]  No cookies set on this page")
        sys.exit(0)

    issues = []
    for i, cookie_str in enumerate(set_cookie_headers, 1):
        parts = [p.strip() for p in cookie_str.split(";")]
        name_val = parts[0]
        name = name_val.split("=")[0].strip()
        attrs = {p.split("=")[0].strip().lower(): p.split("=",1)[1].strip() if "=" in p else True
                 for p in parts[1:]}

        has_secure   = "secure"   in attrs
        has_httponly = "httponly" in attrs
        has_samesite = "samesite" in attrs
        samesite_val = attrs.get("samesite", "") if isinstance(attrs.get("samesite",""), str) else ""
        path         = attrs.get("path", "/")
        domain_attr  = attrs.get("domain", "")
        expires      = attrs.get("expires", "")
        max_age      = attrs.get("max-age", "")
        is_session   = not expires and not max_age

        # Check prefix security
        is_secure_prefix = name.startswith("__Secure-")
        is_host_prefix   = name.startswith("__Host-")

        print(f"  [{i:2d}] {name}")
        print(f"       Secure:    {'✓' if has_secure else '✗'}")
        print(f"       HttpOnly:  {'✓' if has_httponly else '✗'}")
        print(f"       SameSite:  {'✓ ' + samesite_val if has_samesite else '✗'}")
        print(f"       Path:      {path}")
        if domain_attr:
            print(f"       Domain:    {domain_attr}")
        if expires:
            print(f"       Expires:   {expires[:29]}")
        if max_age:
            print(f"       Max-Age:   {max_age}s")
        if is_session:
            print(f"       Type:      Session cookie (no persistence)")
        if is_secure_prefix:
            print(f"       Prefix:    __Secure- (must be HTTPS + Secure)")
        if is_host_prefix:
            print(f"       Prefix:    __Host- (must be HTTPS + Secure + Path=/ + no Domain)")

        cookie_issues = []
        if not has_secure:
            cookie_issues.append("Missing Secure flag — cookie sent over HTTP")
        if not has_httponly:
            cookie_issues.append("Missing HttpOnly — accessible via JavaScript (XSS risk)")
        if not has_samesite:
            cookie_issues.append("Missing SameSite — CSRF risk")
        elif samesite_val.lower() == "none" and not has_secure:
            cookie_issues.append("SameSite=None requires Secure flag")
        if domain_attr and domain_attr.startswith("."):
            cookie_issues.append(f"Wildcard domain scope: {domain_attr}")

        if cookie_issues:
            print(f"       [ISSUES]")
            for issue in cookie_issues:
                print(f"         ✗ {issue}")
            issues.extend(cookie_issues)
        else:
            print(f"       [OK]  All security flags set")
        print()

    print("[SUMMARY]")
    print(f"  Total cookies:  {len(set_cookie_headers)}")
    print(f"  Issues found:   {len(issues)}")
    if issues:
        print("  Top issues:")
        for issue in issues[:5]:
            print(f"    ✗ {issue}")
    else:
        print("  All cookies have proper security attributes")

    print()
    print("[DONE] Cookie audit complete.")

if __name__ == "__main__":
    main()
