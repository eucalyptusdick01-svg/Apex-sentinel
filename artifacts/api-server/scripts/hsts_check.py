"""HSTS Check — Module 68. Usage: hsts_check.py "domain.com" """
import sys, urllib.request, urllib.error, json

HSTS_PRELOAD_CHECK_URL = "https://hstspreload.org/api/v2/status?domain="

def main():
    print("[MODULE 068] HSTS CHECK")
    print("[SOURCE]     Direct HTTPS + hstspreload.org API — HTTP Strict Transport Security analysis")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No domain supplied.")
        sys.exit(1)

    domain = raw.lower().lstrip("https://").lstrip("http://").split("/")[0]
    url    = f"https://{domain}"
    print(f"[TARGET]  {domain}")
    print()

    # Fetch HTTPS response
    hsts_header = ""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "SentinelOSINT/1.0"})
        with urllib.request.urlopen(req, timeout=8) as resp:
            hsts_header = resp.headers.get("Strict-Transport-Security", "")
            status = resp.status
    except urllib.error.HTTPError as e:
        hsts_header = e.headers.get("Strict-Transport-Security", "") if e.headers else ""
        status = e.code
    except Exception as e:
        print(f"[ERROR fetching HTTPS] {e}")
        status = 0

    print(f"[HTTPS STATUS]  {status}")
    print()

    if hsts_header:
        print(f"[HSTS HEADER]  ✓  Present")
        print(f"  {hsts_header}")
        print()

        # Parse
        parts  = [p.strip().lower() for p in hsts_header.split(";")]
        max_age     = 0
        include_sub = False
        preload_directive = False
        for part in parts:
            if part.startswith("max-age"):
                try:
                    max_age = int(part.split("=")[1].strip())
                except Exception:
                    pass
            if "includesubdomains" in part:
                include_sub = True
            if "preload" in part:
                preload_directive = True

        days = max_age // 86400
        print(f"  max-age:           {max_age}s  ({days} days)")
        print(f"  includeSubDomains: {'✓' if include_sub else '✗'}")
        print(f"  preload directive: {'✓' if preload_directive else '✗'}")
        print()

        # Evaluation
        print("[ANALYSIS]")
        if max_age < 300:
            print("  [WARN]  Very short max-age — HSTS barely effective")
        elif max_age < 2592000:
            print("  [WARN]  max-age < 30 days — increase to ≥1 year recommended")
        elif max_age >= 31536000:
            print("  [OK]    max-age ≥ 1 year — good")
        else:
            print(f"  [OK]    max-age reasonable ({days} days)")

        if not include_sub:
            print("  [INFO]  No includeSubDomains — subdomains not protected")
        if not preload_directive:
            print("  [INFO]  No preload directive — not eligible for browser preload list")
        else:
            print("  [OK]    preload directive present — eligible for preload submission")

        # Check preload list status
        try:
            r = urllib.request.Request(HSTS_PRELOAD_CHECK_URL + domain,
                                       headers={"User-Agent": "SentinelOSINT/1.0"})
            with urllib.request.urlopen(r, timeout=6) as resp:
                pdata = json.load(resp)
            pstatus = pdata.get("status","?")
            print(f"  Preload list:  {pstatus}")
            if pdata.get("issues"):
                for issue in pdata["issues"][:3]:
                    print(f"    Issue: {issue.get('summary','?')}")
        except Exception:
            pass

        # Preload eligibility check
        eligible = max_age >= 31536000 and include_sub and preload_directive
        print()
        print(f"[PRELOAD ELIGIBLE]  {'✓ Yes' if eligible else '✗ No'}")
        if not eligible:
            reqs = []
            if max_age < 31536000: reqs.append("max-age must be ≥ 31536000 (1 year)")
            if not include_sub:    reqs.append("includeSubDomains required")
            if not preload_directive: reqs.append("preload directive required")
            for r in reqs:
                print(f"  Missing: {r}")

    else:
        print("[HSTS HEADER]  ✗  Not present")
        print()
        print("[RISK]  Without HSTS, browsers may connect over HTTP — MITM risk")
        print()
        print("[RECOMMENDED HEADER]")
        print('  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload')

    # Check HTTP → HTTPS redirect
    print()
    print("[HTTP REDIRECT CHECK]")
    http_url = f"http://{domain}"
    try:
        class NoRedirect(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, req, fp, code, msg, headers, newurl):
                return None
        opener = urllib.request.build_opener(NoRedirect)
        req = urllib.request.Request(http_url, headers={"User-Agent": "SentinelOSINT/1.0"})
        with opener.open(req, timeout=6) as resp:
            print(f"  HTTP returns {resp.status} — no redirect to HTTPS!")
    except urllib.error.HTTPError as e:
        loc = e.headers.get("Location", "") if e.headers else ""
        if loc.startswith("https://"):
            print(f"  ✓ HTTP {e.code} → {loc[:60]}")
        else:
            print(f"  HTTP {e.code} redirects to: {loc[:60]}")
    except Exception as e:
        print(f"  Could not check: {e}")

    print()
    print("[DONE] HSTS check complete.")

if __name__ == "__main__":
    main()
