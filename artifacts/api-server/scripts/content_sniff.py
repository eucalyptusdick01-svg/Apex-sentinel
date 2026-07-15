"""Content Sniff — Module 75. Analyze content-type headers and MIME sniffing risks."""
import sys, urllib.request, urllib.error, urllib.parse, re

SNIFF_RISKS = {
    "text/plain": "Browser may execute as HTML/JS if content looks like it",
    "text/html": "Should always be served with nosniff + CSP",
    "application/octet-stream": "Browser may sniff and render as HTML",
    "image/jpeg": "Can contain embedded HTML (polyglot) — check nosniff",
    "image/svg+xml": "SVG can contain scripts — high XSS risk",
    "application/json": "Some browsers may execute without nosniff",
}

def analyze_content_type(ct_header):
    if not ct_header:
        return "MISSING", None, "HIGH RISK — browser will sniff content type"
    ct = ct_header.split(";")[0].strip().lower()
    charset_m = re.search(r'charset=([^\s;]+)', ct_header, re.I)
    charset = charset_m.group(1) if charset_m else None
    risk = SNIFF_RISKS.get(ct, None)
    return ct, charset, risk

def main():
    print("[MODULE 75] CONTENT SNIFF ANALYZER")
    print("[SOURCE]    HTTP response header analysis — no API key needed")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  https://example.com  — analyze content-type + MIME sniffing")
        sys.exit(0)

    targets = []
    base = raw if raw.startswith("http") else "https://" + raw
    parsed = urllib.parse.urlparse(base)
    domain = parsed.netloc

    # Test main page + common sub-paths
    paths = ["", "/api/", "/static/test.js", "/favicon.ico", "/robots.txt"]
    targets = [base.rstrip("/") + p for p in paths]

    print(f"[TARGET]  {base}")
    print()

    for url in targets:
        try:
            req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
            resp = urllib.request.urlopen(req, timeout=6)
            headers = dict(resp.headers)
            status = resp.status
        except urllib.error.HTTPError as e:
            headers = dict(e.headers); status = e.code
        except Exception as e:
            print(f"  [{url.replace(base,''  or '/')}]  Error: {str(e)[:60]}")
            continue

        ct_raw = headers.get("content-type","")
        nosniff = headers.get("x-content-type-options","").lower()
        csp = headers.get("content-security-policy","")

        ct, charset, ct_risk = analyze_content_type(ct_raw)
        path_label = url.replace(base,"") or "/"

        print(f"  [{path_label}]  HTTP {status}")
        print(f"    Content-Type:         {ct_raw or 'MISSING'}")
        print(f"    X-Content-Type-Opts:  {nosniff or 'MISSING'}")

        risks = []
        if not ct_raw:
            risks.append("MISSING Content-Type — browser will sniff")
        if nosniff != "nosniff":
            risks.append("X-Content-Type-Options: nosniff is MISSING")
            if ct_risk:
                risks.append(f"MIME risk: {ct_risk}")
        if ct == "image/svg+xml" and not csp:
            risks.append("SVG without CSP — script execution possible")
        if charset is None and ct in ("text/html","text/plain"):
            risks.append("No charset declared — charset sniffing possible (UTF-7 attacks)")

        if risks:
            for r in risks: print(f"    ⚠  {r}")
        else:
            print(f"    ✓  Content-Type and nosniff properly configured")
        print()

    print("[DONE] Content sniff analysis complete.")

if __name__ == "__main__":
    main()
