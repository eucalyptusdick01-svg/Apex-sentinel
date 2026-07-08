"""HSTS Check — Module 68. Usage: hsts_check.py "domain.com" """
import sys, http.client, ssl, urllib.request, json, urllib.parse

def doh(name: str, rtype: str):
    url = f"https://cloudflare-dns.com/dns-query?name={name}&type={rtype}"
    r = urllib.request.Request(url, headers={"Accept": "application/dns-json", "User-Agent": "SentinelOSINT/1.0"})
    with urllib.request.urlopen(r, timeout=8) as resp:
        return json.load(resp)

def get_hsts(domain: str, port: int = 443):
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE
    conn = http.client.HTTPSConnection(domain, port=port, timeout=6, context=ssl_ctx)
    conn.request("HEAD", "/", headers={"User-Agent": "SentinelOSINT/1.0"})
    resp = conn.getresponse()
    hsts  = resp.getheader("Strict-Transport-Security", "")
    redir = resp.getheader("Location", "")
    status = resp.status
    conn.close()
    return status, hsts, redir

def parse_hsts(hsts: str) -> dict:
    result = {"max_age": None, "include_subdomains": False, "preload": False}
    for part in hsts.split(";"):
        part = part.strip().lower()
        if part.startswith("max-age="):
            try:
                result["max_age"] = int(part.split("=",1)[1].strip())
            except Exception:
                pass
        elif part == "includesubdomains":
            result["include_subdomains"] = True
        elif part == "preload":
            result["preload"] = True
    return result

def format_duration(seconds: int) -> str:
    if seconds >= 31536000:
        years = seconds / 31536000
        return f"{years:.1f} year(s)"
    if seconds >= 2592000:
        return f"{seconds // 2592000} month(s)"
    if seconds >= 86400:
        return f"{seconds // 86400} day(s)"
    return f"{seconds}s"

def main():
    print("[MODULE 068] HSTS CHECK")
    print("[SOURCE]     Direct HTTPS request + Cloudflare DoH — HSTS header + preload analysis")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip().lower()
    if not raw:
        print("[ERROR] No domain supplied.")
        sys.exit(1)

    domain = raw.lstrip("https://").lstrip("http://").split("/")[0]
    print(f"[TARGET]  {domain}")
    print()

    # Check HTTP redirect
    print("[STEP 1] HTTP → HTTPS redirect check...")
    try:
        conn = http.client.HTTPConnection(domain, timeout=5)
        conn.request("HEAD", "/", headers={"User-Agent": "SentinelOSINT/1.0"})
        resp = conn.getresponse()
        http_status = resp.status
        http_loc    = resp.getheader("Location", "")
        conn.close()
        if http_status in (301, 302, 307, 308) and "https" in http_loc.lower():
            print(f"  HTTP {http_status} → {http_loc[:60]}  ✓ redirects to HTTPS")
        elif http_status in (301, 302, 307, 308):
            print(f"  HTTP {http_status} → {http_loc[:60]}  ⚠ redirects but not to HTTPS!")
        else:
            print(f"  HTTP {http_status}  ✗ no HTTPS redirect")
    except Exception as e:
        print(f"  HTTP connection failed: {e}")

    # Check HTTPS HSTS header
    print()
    print("[STEP 2] HTTPS HSTS header...")
    try:
        status, hsts, redir = get_hsts(domain)
        print(f"  HTTPS status: {status}")
        if hsts:
            print(f"  HSTS header: {hsts}")
            parsed = parse_hsts(hsts)
            max_age = parsed["max_age"]
            print()
            print(f"  Max-Age:           {max_age}s  ({format_duration(max_age) if max_age else '?'})")
            print(f"  includeSubDomains: {'✓' if parsed['include_subdomains'] else '✗'}")
            print(f"  preload:           {'✓' if parsed['preload'] else '✗'}")

            # Grade
            print()
            if max_age is None:
                print("  [WARN] Could not parse max-age")
            elif max_age < 300:
                print("  [WARN] max-age too short — HSTS effectively disabled")
            elif max_age < 2592000:
                print("  [WARN] max-age < 30 days — recommend at least 31536000 (1 year)")
            elif max_age < 31536000:
                print("  [OK]   max-age acceptable but 1 year recommended for preload")
            else:
                print("  [OK]   max-age ≥ 1 year — good")

            if not parsed["include_subdomains"]:
                print("  [WARN] includeSubDomains missing — subdomains not protected by HSTS")
            if not parsed["preload"]:
                print("  [INFO] preload not set — domain cannot be added to HSTS preload list")
            elif max_age and max_age >= 31536000 and parsed["include_subdomains"]:
                print("  [OK]   Meets preload requirements")
        else:
            print("  ✗ No HSTS header — HTTPS-capable but not enforcing it!")
    except Exception as e:
        print(f"  HTTPS connection failed: {e}")

    # Preload status check
    print()
    print("[STEP 3] Preload list check...")
    try:
        data = urllib.request.urlopen(
            f"https://hstspreload.org/api/v2/status?domain={domain}", timeout=6
        ).read().decode()
        status_data = json.loads(data)
        state = status_data.get("status", "unknown")
        print(f"  Preload status: {state}")
        if state == "preloaded":
            print("  ✓ Domain is on the HSTS preload list")
        elif state == "pending":
            print("  ⌛ Pending inclusion in preload list")
        else:
            print("  ✗ Not on preload list")
            print(f"    Submit at: https://hstspreload.org/?domain={domain}")
    except Exception as e:
        print(f"  Preload check failed: {e}")

    print()
    print("[DONE] HSTS check complete.")

if __name__ == "__main__":
    main()
