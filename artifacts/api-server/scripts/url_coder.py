"""URL Coder — Module 106. Usage: url_coder.py "text" or url_coder.py "dec:URL%20ENCODED" """
import sys, urllib.parse, html

def main():
    print("[MODULE 106] URL CODER")
    print("[SOURCE]     Python urllib.parse — URL encoding/decoding + HTML entity analysis")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  url_coder.py \"hello world & more\"")
        print("         url_coder.py \"dec:hello%20world%20%26%20more\"")
        sys.exit(0)

    if raw.lower().startswith("dec:"):
        encoded = raw[4:]
        print(f"[MODE]    Decode")
        print(f"[INPUT]   {encoded[:120]}")
        print()
        decoded_pct   = urllib.parse.unquote(encoded)
        decoded_plus  = urllib.parse.unquote_plus(encoded)
        decoded_html  = html.unescape(encoded)
        print(f"[URL decoded]         {decoded_pct}")
        if decoded_plus != decoded_pct:
            print(f"[URL+ decoded]        {decoded_plus}")
        if decoded_html != encoded:
            print(f"[HTML entity decoded] {decoded_html}")
        # Double-decode attempt
        double = urllib.parse.unquote(urllib.parse.unquote(encoded))
        if double != decoded_pct:
            print(f"[Double URL decoded]  {double}")
    else:
        text = raw
        print(f"[MODE]    Encode")
        print(f"[INPUT]   {text[:120]}")
        print()
        enc_query     = urllib.parse.quote_plus(text)
        enc_path      = urllib.parse.quote(text, safe="/")
        enc_full      = urllib.parse.quote(text, safe="")
        enc_html_esc  = html.escape(text, quote=True)

        print(f"[URL encode (query/+)]  {enc_query}")
        print(f"[URL encode (path)]     {enc_path}")
        print(f"[URL encode (full)]     {enc_full}")
        print(f"[HTML escape]           {enc_html_esc}")

        # Show individual char codes for short inputs
        if len(text) <= 30:
            print()
            print(f"[CHARACTER MAP]")
            for ch in text:
                pct = urllib.parse.quote(ch, safe="")
                dec = ord(ch)
                print(f"  {ch!r:8s}  ord={dec:4d}  U+{dec:04X}  pct={pct}")

        # If it looks like a URL, parse it
        if "://" in text or text.startswith("//"):
            print()
            print("[URL PARSE]")
            parsed = urllib.parse.urlparse(text)
            print(f"  Scheme:   {parsed.scheme}")
            print(f"  Netloc:   {parsed.netloc}")
            print(f"  Path:     {parsed.path}")
            print(f"  Query:    {parsed.query}")
            print(f"  Fragment: {parsed.fragment}")
            if parsed.query:
                print("  Query params:")
                for k, v in urllib.parse.parse_qsl(parsed.query):
                    print(f"    {k} = {v}")

    print()
    print("[DONE] URL coder operation complete.")

if __name__ == "__main__":
    main()
