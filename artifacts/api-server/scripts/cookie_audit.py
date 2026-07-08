"""Cookie Audit — Module 66. Usage: cookie_audit.py "https://example.com" """
import sys, urllib.request, urllib.error, http.client, ssl, urllib.parse

def get_cookies(url: str):
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE
    parsed = urllib.parse.urlparse(url)
    scheme = parsed.scheme.lower()
    host   = parsed.netloc
    path   = parsed.path or "/"
    if parsed.query:
        path += "?" + parsed.query

    if scheme == "https":
        conn = http.client.HTTPSConnection(host, timeout=8, context=ssl_ctx)
    else:
        conn = http.client.HTTPConnection(host, timeout=8)
    conn.request("GET", path, headers={
        "User-Agent": "Mozilla/5.0 (SentinelOSINT) AppleWebKit/537.36",
        "Accept": "text/html,*/*",
    })
    resp = conn.getresponse()
    status = resp.status
    headers = [(k.lower(), v) for k, v in resp.getheaders()]
    conn.close()
    set_cookies = [v for k, v in headers if k == "set-cookie"]
    return status, set_cookies, scheme

def parse_cookie(raw: str) -> dict:
    parts = [p.strip() for p in raw.split(";")]
    name_val = parts[0] if parts else ""
    name = name_val.split("=")[0].strip()
    val  = "=".join(name_val.split("=")[1:]) if "=" in name_val else ""
    attrs = {}
    for p in parts[1:]:
        kv = p.split("=", 1)
        k = kv[0].strip().lower()
        v = kv[1].strip() if len(kv) > 1 else "true"
        attrs[k] = v
    return {"name": name, "value": val, "attrs": attrs, "raw": raw}

def main():
    print("[MODULE 066] COOKIE AUDIT")
    print("[SOURCE]     Direct HTTP request — Set-Cookie header analysis")
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
        status, set_cookies, scheme = get_cookies(raw)
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

    print(f"[HTTP STATUS]  {status}")
    print(f"[TRANSPORT]    {'HTTPS ✓' if scheme == 'https' else 'HTTP ✗ (insecure)'}")
    print(f"[COOKIES SET]  {len(set_cookies)}")
    print()

    if not set_cookies:
        print("[RESULT]  No cookies set on this response")
        sys.exit(0)

    issues = []
    for i, raw_cookie in enumerate(set_cookies, 1):
        c = parse_cookie(raw_cookie)
        attrs = c["attrs"]
        name = c["name"]
        print(f"[COOKIE {i:02d}]  {name}")

        is_session = not attrs.get("expires") and not attrs.get("max-age")
        print(f"  Type:       {'Session' if is_session else 'Persistent'}")
        if attrs.get("expires"):
            print(f"  Expires:    {attrs['expires']}")
        if attrs.get("max-age"):
            age = int(attrs['max-age']) if attrs['max-age'].lstrip('-').isdigit() else 0
            print(f"  Max-Age:    {attrs['max-age']}s {'(expired/delete)' if age <= 0 else ''}")
        if attrs.get("domain"):
            print(f"  Domain:     {attrs['domain']}")
        if attrs.get("path"):
            print(f"  Path:       {attrs['path']}")
        if attrs.get("samesite"):
            print(f"  SameSite:   {attrs['samesite']}")
        if attrs.get("priority"):
            print(f"  Priority:   {attrs['priority']}")

        has_http_only = "httponly" in attrs
        has_secure    = "secure" in attrs
        samesite_val  = attrs.get("samesite","").lower()

        print(f"  HttpOnly:   {'✓' if has_http_only else '✗'}")
        print(f"  Secure:     {'✓' if has_secure else '✗'}")
        print(f"  SameSite:   {samesite_val if samesite_val else '✗ (not set)'}")

        cookie_issues = []
        if not has_http_only:
            cookie_issues.append("Missing HttpOnly — JavaScript can read this cookie (XSS risk)")
        if not has_secure and scheme == "https":
            cookie_issues.append("Missing Secure flag — cookie may be sent over HTTP")
        if not samesite_val:
            cookie_issues.append("Missing SameSite — CSRF risk (default Lax in modern browsers)")
        if samesite_val == "none" and not has_secure:
            cookie_issues.append("SameSite=None requires Secure flag")
        name_lower = name.lower()
        if any(kw in name_lower for kw in ("session", "sess", "auth", "token", "user", "uid", "id", "jwt", "key")):
            if not has_http_only:
                cookie_issues.append(f"⚠ Sensitive-looking name '{name}' without HttpOnly — HIGH RISK")

        if cookie_issues:
            issues.extend(cookie_issues)
            print("  Issues:")
            for issue in cookie_issues:
                print(f"    ✗ {issue}")
        else:
            print("  Issues:     ✓ None")
        print()

    print("[SUMMARY]")
    print(f"  Total cookies:     {len(set_cookies)}")
    print(f"  Issues found:      {len(issues)}")
    if issues:
        print()
        print("[ALL ISSUES]")
        for issue in issues:
            print(f"  • {issue}")

    print()
    print("[DONE] Cookie audit complete.")

if __name__ == "__main__":
    main()
