"""
REST Probe — Module 54
Makes HTTP requests and shows detailed response analysis.
Usage:
  rest_probe.py "https://api.example.com/users"
  rest_probe.py "POST:https://api.example.com/users:{\"name\":\"Alice\"}"
  rest_probe.py "headers:https://api.example.com"
"""
import sys
import json
import urllib.request
import urllib.error
import urllib.parse
import time

MAX_BODY = 2000

def parse_target(raw: str) -> tuple:
    if ":" not in raw:
        return "GET", raw if raw.startswith("http") else "https://" + raw, None
    
    for method in ("GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS", "headers"):
        prefix = method + ":"
        if raw.upper().startswith(prefix.upper()):
            rest = raw[len(prefix):]
            body = None
            if method.upper() in ("POST", "PUT", "PATCH"):
                parts = rest.split(":", 1)
                url = parts[0] if parts[0].startswith("http") else "https://" + parts[0]
                body = parts[1] if len(parts) > 1 else None
            else:
                url = rest if rest.startswith("http") else "https://" + rest
            return method.upper(), url, body
    
    url = raw if raw.startswith("http") else "https://" + raw
    return "GET", url, None

def do_request(method: str, url: str, body: str | None) -> dict:
    data = None
    req_headers: dict = {
        "User-Agent": "SentinelRestProbe/1.0",
        "Accept": "application/json, text/plain, */*",
    }

    if body:
        try:
            json.loads(body)
            req_headers["Content-Type"] = "application/json"
        except Exception:
            req_headers["Content-Type"] = "application/x-www-form-urlencoded"
        data = body.encode()

    req = urllib.request.Request(url, method=method, headers=req_headers, data=data)
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            elapsed = int((time.time() - t0) * 1000)
            raw_body = resp.read(MAX_BODY + 1)
            return {
                "status": resp.status,
                "reason": resp.reason,
                "headers": dict(resp.headers),
                "body": raw_body[:MAX_BODY],
                "truncated": len(raw_body) > MAX_BODY,
                "elapsed_ms": elapsed,
                "error": None,
            }
    except urllib.error.HTTPError as e:
        elapsed = int((time.time() - t0) * 1000)
        raw_body = e.read(MAX_BODY + 1) if e.fp else b""
        return {
            "status": e.code,
            "reason": e.reason,
            "headers": dict(e.headers) if e.headers else {},
            "body": raw_body[:MAX_BODY],
            "truncated": len(raw_body) > MAX_BODY,
            "elapsed_ms": elapsed,
            "error": None,
        }
    except Exception as e:
        return {"status": None, "reason": None, "headers": {}, "body": b"", "truncated": False, "elapsed_ms": 0, "error": str(e)}

def main() -> None:
    print("[MODULE 054] REST PROBE")
    print("[SOURCE]     HTTP request / response inspector")
    print()

    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No target supplied.")
        print("[USAGE] rest_probe.py \"https://api.example.com\"")
        print("        rest_probe.py \"POST:https://api.example.com:{\\\"key\\\":\\\"val\\\"}\"")
        sys.exit(1)

    method, url, body = parse_target(raw)
    only_headers = method == "HEADERS"
    if only_headers:
        method = "HEAD"

    print(f"[METHOD]  {method}")
    print(f"[URL]     {url}")
    if body:
        print(f"[BODY]    {body[:120]}{'...' if len(body) > 120 else ''}")
    print()

    r = do_request(method, url, body)

    if r["error"]:
        print(f"[ERROR]   {r['error']}")
        sys.exit(1)

    status = r["status"]
    reason = r["reason"]
    elapsed = r["elapsed_ms"]
    status_class = "✓" if status and status < 400 else "✗"

    print(f"[STATUS]  {status_class} HTTP {status} {reason}  ({elapsed}ms)")
    print()

    print("[RESPONSE HEADERS]")
    important = ["content-type", "content-length", "server", "x-powered-by",
                 "cache-control", "set-cookie", "location", "x-request-id",
                 "x-ratelimit-limit", "x-ratelimit-remaining", "www-authenticate",
                 "strict-transport-security", "x-frame-options", "x-xss-protection",
                 "x-content-type-options"]
    others = []
    for k, v in r["headers"].items():
        kl = k.lower()
        if kl in important:
            print(f"  {k}: {v}")
        else:
            others.append(f"  {k}: {v}")
    if others:
        print(f"  ... ({len(others)} more headers)")

    if not only_headers and r["body"]:
        print()
        print("[RESPONSE BODY]" + (" [truncated]" if r["truncated"] else ""))
        try:
            ct = r["headers"].get("Content-Type", r["headers"].get("content-type", ""))
            if "json" in ct:
                parsed = json.loads(r["body"])
                pretty = json.dumps(parsed, indent=2)
                lines = pretty.split("\n")
                for line in lines[:40]:
                    print(f"  {line}")
                if len(lines) > 40:
                    print(f"  ... ({len(lines)-40} more lines)")
            else:
                text = r["body"].decode("utf-8", errors="replace")
                for line in text.split("\n")[:30]:
                    print(f"  {line}")
        except Exception:
            print(f"  {r['body'][:500]}")

    print()
    print("[DONE] REST probe complete.")

if __name__ == "__main__":
    main()
