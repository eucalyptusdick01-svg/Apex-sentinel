"""URL Coder — Module 106. Usage: url_coder.py "enc:Hello World" or "dec:%48ello%20World" or "parse:https://..." """
import sys, urllib.parse

def main():
    print("[MODULE 106] URL CODER")
    print("[SOURCE]     Python urllib.parse — URL encode/decode/inspect")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw or raw == "help":
        print("[MODES]")
        print("  enc:TEXT        — percent-encode (query-safe)")
        print("  fullenc:TEXT    — percent-encode all chars")
        print("  dec:%TEXT       — percent-decode")
        print("  parse:URL       — parse URL into components")
        print("  build:...       — build URL from parts")
        print("  canonicalize:URL — normalize/canonicalize URL")
        sys.exit(0)

    if ":" in raw:
        mode, _, data = raw.partition(":")
        mode = mode.strip().lower()
    else:
        mode = "enc"
        data = raw

    print(f"[MODE]   {mode}")
    print()

    try:
        if mode == "enc":
            encoded_q = urllib.parse.quote(data, safe="")
            encoded_f = urllib.parse.quote_plus(data)
            print(f"[ENCODED (RFC 3986)]  {encoded_q}")
            print(f"[FORM ENCODED]        {encoded_f}")
            print(f"[DOUBLE ENCODED]      {urllib.parse.quote(encoded_q, safe='')}")

        elif mode == "fullenc":
            result = "".join(f"%{c.encode().hex().upper()}" if ord(c) > 0x1f else c for c in data)
            result2 = urllib.parse.quote(data, safe="")
            print(f"[FULL ENCODED]    {result2}")
            print(f"[ALL CHARS HEX]   {result}")

        elif mode == "dec":
            decoded = urllib.parse.unquote(data)
            decoded_plus = urllib.parse.unquote_plus(data)
            print(f"[DECODED]       {decoded}")
            if decoded_plus != decoded:
                print(f"[DECODED (+)]    {decoded_plus}")
            # double decode
            double = urllib.parse.unquote(urllib.parse.unquote(data))
            if double != decoded:
                print(f"[DOUBLE DEC]    {double}")

        elif mode == "parse":
            url = data if data.startswith(("http://","https://","ftp://")) else "https://" + data
            p = urllib.parse.urlparse(url)
            qs = urllib.parse.parse_qs(p.query)
            print(f"[SCHEME]    {p.scheme}")
            print(f"[NETLOC]    {p.netloc}")
            print(f"[HOST]      {p.hostname}")
            print(f"[PORT]      {p.port or '(default)'}")
            print(f"[PATH]      {p.path}")
            print(f"[QUERY]     {p.query}")
            print(f"[FRAGMENT]  {p.fragment}")
            if qs:
                print()
                print("[QUERY PARAMS]")
                for k, vs in qs.items():
                    print(f"  {k!r:20s}  {vs}")
            if p.username:
                print(f"[USERNAME]  {p.username}")
            if p.password:
                print(f"[PASSWORD]  (hidden)")

        elif mode == "canonicalize":
            url = data
            parsed = urllib.parse.urlparse(url)
            # lowercase scheme/host, remove default port, normalize path
            scheme = parsed.scheme.lower()
            host   = parsed.hostname.lower() if parsed.hostname else ""
            port   = parsed.port
            if (scheme == "http" and port == 80) or (scheme == "https" and port == 443):
                port = None
            netloc = host + (f":{port}" if port else "")
            # normalize path
            import posixpath
            path = posixpath.normpath(parsed.path or "/")
            canonical = urllib.parse.urlunparse((scheme, netloc, path, parsed.params, parsed.query, ""))
            print(f"[ORIGINAL]     {url}")
            print(f"[CANONICAL]    {canonical}")

        elif mode == "build":
            # build:scheme:host:path:key=val&key2=val2
            parts = data.split(":", 3)
            scheme = parts[0] if len(parts) > 0 else "https"
            host   = parts[1] if len(parts) > 1 else "example.com"
            path   = parts[2] if len(parts) > 2 else "/"
            query  = parts[3] if len(parts) > 3 else ""
            url = urllib.parse.urlunparse((scheme, host, path, "", query, ""))
            print(f"[BUILT URL]  {url}")

        else:
            print(f"[ERROR] Unknown mode '{mode}'")
            sys.exit(1)

    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

    print()
    print("[DONE] URL encode/decode complete.")

if __name__ == "__main__":
    main()
