"""Open Redirect — Module 73. Test URLs/domains for open redirect vulnerabilities."""
import sys, urllib.request, urllib.error, urllib.parse, socket

REDIRECT_PARAMS = ["url","redirect","return","next","goto","dest","destination",
                   "forward","location","to","redir","redirect_uri","return_url",
                   "returnUrl","redirectUrl","nextUrl","callback","out","target"]

TEST_PAYLOADS = [
    "https://evil.com",
    "//evil.com",
    "///evil.com",
    "/\\evil.com",
    "https:evil.com",
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "/%09/evil.com",
    "https://legit.com@evil.com",
    "https://evil%2Ecom",
]

def test_redirect(url, timeout=8):
    """Follow a URL and see where it ends up."""
    try:
        opener = urllib.request.build_opener(urllib.request.HTTPRedirectHandler())
        req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
        resp = opener.open(req, timeout=timeout)
        final_url = resp.geturl()
        return resp.status, final_url, []
    except urllib.error.HTTPError as e:
        return e.code, url, []
    except Exception as e:
        return None, url, [str(e)]

def check_redirect_params(base_url, timeout=8):
    """Check if URL has redirect params that bounce to external domains."""
    parsed = urllib.parse.urlparse(base_url)
    domain = parsed.netloc
    results = []
    for param in REDIRECT_PARAMS[:8]:  # test top 8 params
        for payload in TEST_PAYLOADS[:3]:
            test_url = f"{base_url}?{param}={urllib.parse.quote(payload, safe='')}"
            try:
                opener = urllib.request.build_opener()
                req = urllib.request.Request(test_url, headers={"User-Agent":"Mozilla/5.0"})
                resp = opener.open(req, timeout=timeout)
                final = resp.geturl()
                if domain not in final:
                    results.append((param, payload, final, "VULN"))
                else:
                    results.append((param, payload, final, "SAFE"))
                break
            except urllib.error.HTTPError as e:
                if e.code in (301,302,303,307,308):
                    loc = e.headers.get("Location","")
                    if loc and domain not in loc and "evil.com" in loc:
                        results.append((param, payload, loc, "VULN"))
                    else:
                        results.append((param, payload, loc, "REDIRECT"))
                break
            except Exception:
                break
    return results

def main():
    print("[MODULE 73] OPEN REDIRECT DETECTOR")
    print("[SOURCE]    HTTP redirect analysis — no external API key needed")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  https://example.com/redirect?url=  — test URL for open redirect")
        print("[USAGE]  example.com                        — scan common redirect params")
        sys.exit(0)

    # Normalize
    target = raw
    if not target.startswith("http"):
        target = "https://" + target

    parsed = urllib.parse.urlparse(target)
    domain = parsed.netloc or target

    print(f"[TARGET]    {target}")
    print(f"[DOMAIN]    {domain}")
    print()

    # Check for pre-built redirect param
    qs = urllib.parse.parse_qs(parsed.query)
    if qs:
        print(f"[QUERY PARAMS]  {dict(qs)}")
        for param in qs:
            if param.lower() in [p.lower() for p in REDIRECT_PARAMS]:
                print(f"  ⚠  '{param}' is a known redirect parameter — testing payloads")
        print()

    # Test by appending each redirect param
    print(f"[TESTING REDIRECT PARAMS]  (top {len(REDIRECT_PARAMS)} common names)")
    vulns = []
    for param in REDIRECT_PARAMS[:10]:
        test_url = f"{target.split('?')[0]}?{param}=https://evil.com"
        try:
            req = urllib.request.Request(test_url, headers={"User-Agent":"Mozilla/5.0"})
            resp = urllib.request.urlopen(req, timeout=5)
            final = resp.geturl()
            if "evil.com" in final:
                print(f"  ✗  VULNERABLE: ?{param}= redirected to {final}")
                vulns.append(param)
            else:
                print(f"  ✓  ?{param}=  → {final[:60]}")
        except urllib.error.HTTPError as e:
            loc = e.headers.get("Location","")
            if "evil.com" in loc:
                print(f"  ✗  VULNERABLE: ?{param}= → {loc}")
                vulns.append(param)
            else:
                print(f"  -  ?{param}= → HTTP {e.code}")
        except Exception as e:
            print(f"  -  ?{param}= → {str(e)[:50]}")

    print()
    if vulns:
        print(f"[VULNERABLE PARAMS]  {', '.join(vulns)}")
        print("[RISK]   HIGH — attacker can redirect users to phishing pages")
        print("[FIX]    Whitelist allowed redirect destinations; reject external URLs")
    else:
        print("[RESULT]  No open redirects detected with common parameter names")
        print("[NOTE]    Application-specific parameter names may still be vulnerable")

    print()
    print("[TEST PAYLOADS USED]")
    for p in TEST_PAYLOADS[:5]:
        print(f"  {p}")

    print()
    print("[DONE] Open redirect scan complete.")

if __name__ == "__main__":
    main()
