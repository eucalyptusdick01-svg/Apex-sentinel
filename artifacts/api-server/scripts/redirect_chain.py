"""Redirect Chain — Module 65. Usage: redirect_chain.py "https://example.com" """
import sys, urllib.request, urllib.error, urllib.parse, http.client, ssl, time

def follow_redirects(url: str, max_hops: int = 15):
    chain = []
    current = url
    ssl_ctx = ssl.create_default_context()
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE

    for hop in range(max_hops):
        parsed = urllib.parse.urlparse(current)
        scheme = parsed.scheme.lower()
        host   = parsed.netloc
        path   = parsed.path or "/"
        if parsed.query:
            path += "?" + parsed.query

        try:
            start = time.monotonic()
            if scheme == "https":
                conn = http.client.HTTPSConnection(host, timeout=6, context=ssl_ctx)
            else:
                conn = http.client.HTTPConnection(host, timeout=6)
            conn.request("GET", path, headers={
                "User-Agent": "Mozilla/5.0 (SentinelOSINT) AppleWebKit/537.36",
                "Accept": "*/*",
            })
            resp = conn.getresponse()
            elapsed = int((time.monotonic() - start) * 1000)
            status = resp.status
            reason = resp.reason
            loc = resp.getheader("Location", "")
            server = resp.getheader("Server", "")
            ct = resp.getheader("Content-Type", "")
            hsts = resp.getheader("Strict-Transport-Security", "")
            conn.close()

            chain.append({
                "hop": hop + 1,
                "url": current,
                "status": status,
                "reason": reason,
                "location": loc,
                "server": server,
                "content_type": ct,
                "hsts": hsts,
                "ms": elapsed,
                "scheme": scheme,
            })

            if status in (301, 302, 303, 307, 308) and loc:
                next_url = urllib.parse.urljoin(current, loc)
                current = next_url
            else:
                break
        except Exception as e:
            chain.append({"hop": hop + 1, "url": current, "error": str(e)})
            break

    return chain

def main():
    print("[MODULE 065] REDIRECT CHAIN")
    print("[SOURCE]     Direct HTTP/HTTPS connection — follow redirects step by step")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No URL supplied.")
        sys.exit(1)

    if not raw.startswith(("http://", "https://")):
        raw = "https://" + raw

    print(f"[TARGET]  {raw}")
    print()

    chain = follow_redirects(raw)

    STATUS_LABELS = {
        200: "OK", 201: "Created", 301: "Moved Permanently", 302: "Found",
        303: "See Other", 307: "Temporary Redirect", 308: "Permanent Redirect",
        400: "Bad Request", 401: "Unauthorized", 403: "Forbidden",
        404: "Not Found", 429: "Too Many Requests", 500: "Internal Server Error",
    }

    for entry in chain:
        hop = entry.get("hop")
        url = entry.get("url","")
        err = entry.get("error")
        if err:
            print(f"  HOP {hop:2d}  ERROR  {url}")
            print(f"          {err}")
        else:
            status = entry.get("status")
            reason = entry.get("reason") or STATUS_LABELS.get(status,"")
            ms     = entry.get("ms", 0)
            server = entry.get("server","")
            loc    = entry.get("location","")
            scheme = entry.get("scheme","")
            print(f"  HOP {hop:2d}  HTTP {status} {reason}  [{ms}ms]  {'🔒' if scheme=='https' else '⚠ HTTP'}")
            print(f"          {url}")
            if server:
                print(f"          Server: {server}")
            if loc:
                print(f"          → {loc}")
            if entry.get("hsts"):
                print(f"          HSTS: {entry['hsts'][:60]}")
        print()

    if len(chain) > 1:
        total_ms = sum(e.get("ms",0) for e in chain)
        print(f"[SUMMARY]  {len(chain)} hops  |  total ~{total_ms}ms")
        first = chain[0]
        last  = chain[-1]
        print(f"  Start:  {first.get('url','')}")
        print(f"  End:    {last.get('url','')}")

        # Security notes
        has_http  = any(e.get("scheme") == "http" for e in chain)
        has_https = any(e.get("scheme") == "https" for e in chain)
        if has_http and has_https:
            print()
            print("[SECURITY]  ⚠ Mixed HTTP→HTTPS redirect (sensitive data may leak on first hop)")
        http_only = all(e.get("scheme") == "http" for e in chain if not e.get("error"))
        if http_only:
            print()
            print("[SECURITY]  ✗ No HTTPS at any hop")

        redirect_types = [e.get("status") for e in chain[:-1] if e.get("status")]
        has_301 = 301 in redirect_types
        has_302 = 302 in redirect_types
        if has_302:
            print("[INFO]  302 (temporary) redirect in chain — check if 301 (permanent) is intended")
    else:
        print("[SUMMARY]  No redirects — direct response")

    print()
    print("[DONE] Redirect chain analysis complete.")

if __name__ == "__main__":
    main()
