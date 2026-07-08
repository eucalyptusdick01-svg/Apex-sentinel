"""Redirect Chain — Module 65. Usage: redirect_chain.py "https://example.com" """
import sys, urllib.request, urllib.error, urllib.parse, socket

def main():
    print("[MODULE 065] REDIRECT CHAIN")
    print("[SOURCE]     Direct HTTP — follows all redirects and logs each hop")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No URL supplied.")
        sys.exit(1)

    url = raw if raw.startswith("http") else "http://" + raw
    print(f"[TARGET]  {url}")
    print()

    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None

    opener = urllib.request.build_opener(NoRedirect)
    chain = []
    current = url
    seen = set()
    MAX_HOPS = 20

    for hop in range(MAX_HOPS):
        if current in seen:
            chain.append((hop+1, current, 0, "", "LOOP DETECTED"))
            break
        seen.add(current)
        try:
            req = urllib.request.Request(current, headers={
                "User-Agent": "Mozilla/5.0 (SentinelOSINT/1.0)"
            })
            with opener.open(req, timeout=6) as resp:
                code = resp.status
                loc  = resp.headers.get("Location", "")
                server = resp.headers.get("Server", "")
                chain.append((hop+1, current, code, server, "FINAL"))
                break
        except urllib.error.HTTPError as e:
            code = e.code
            loc  = e.headers.get("Location", "") if e.headers else ""
            server = e.headers.get("Server", "") if e.headers else ""
            if loc:
                if not loc.startswith("http"):
                    parsed = urllib.parse.urlparse(current)
                    loc = f"{parsed.scheme}://{parsed.netloc}{loc}"
                chain.append((hop+1, current, code, server, loc))
                current = loc
            else:
                chain.append((hop+1, current, code, server, "FINAL"))
                break
        except Exception as e:
            chain.append((hop+1, current, 0, "", f"ERROR: {e}"))
            break

    print(f"[HOPS]  {len(chain)}")
    print()
    for hop, url_hop, code, server, dest in chain:
        status_label = {301:"Moved Permanently", 302:"Found", 303:"See Other",
                        307:"Temp Redirect", 308:"Perm Redirect", 200:"OK",
                        404:"Not Found", 403:"Forbidden", 500:"Server Error"}.get(code, "")
        print(f"  [{hop:2d}] HTTP {code}  {status_label}")
        print(f"       URL:    {url_hop}")
        if server:
            print(f"       Server: {server}")
        if dest not in ("FINAL", "LOOP DETECTED") and not dest.startswith("ERROR"):
            print(f"       → {dest}")
        elif dest == "LOOP DETECTED":
            print("       [LOOP DETECTED]")
        elif dest.startswith("ERROR"):
            print(f"       {dest}")
        print()

    # Analysis
    first_url = chain[0][1] if chain else url
    last_url  = chain[-1][1] if chain else url
    http_to_https = first_url.startswith("http://") and last_url.startswith("https://")

    print("[ANALYSIS]")
    print(f"  Start:  {first_url}")
    print(f"  End:    {last_url}")
    print(f"  Hops:   {len(chain)}")
    print(f"  HTTP→HTTPS upgrade: {'✓' if http_to_https else '✗'}")
    if len(chain) > 3:
        print("  [WARN]  Long redirect chain (>3 hops) — SEO/performance impact")
    if "LOOP DETECTED" in str(chain):
        print("  [WARN]  Redirect loop detected!")

    print()
    print("[DONE] Redirect chain analysis complete.")

if __name__ == "__main__":
    main()
