"""HTML Coder — Module 107. Usage: html_coder.py "text" or html_coder.py "dec:HTML" """
import sys, html, re

HTML_ENTITIES = {
    "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#x27;",
    "/": "&#x2F;", "\n": "&#10;", "\r": "&#13;",
}

NAMED_ENTITIES = {
    "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'",
    "&nbsp;": "\u00a0", "&copy;": "©", "&reg;": "®", "&trade;": "™",
    "&euro;": "€", "&pound;": "£", "&yen;": "¥", "&cent;": "¢",
    "&mdash;": "—", "&ndash;": "–", "&laquo;": "«", "&raquo;": "»",
    "&hellip;": "…", "&bull;": "•", "&rarr;": "→", "&larr;": "←",
    "&uarr;": "↑", "&darr;": "↓",
}

def xss_encode(text: str) -> str:
    out = []
    for ch in text:
        o = ord(ch)
        if o < 128 and ch not in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789":
            out.append(f"&#{o};")
        else:
            out.append(ch)
    return "".join(out)

def main():
    print("[MODULE 107] HTML CODER")
    print("[SOURCE]     Python html stdlib — HTML entity encode/decode")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  html_coder.py \"<script>alert(1)</script>\"")
        print("         html_coder.py \"dec:&lt;b&gt;hello&lt;/b&gt;\"")
        sys.exit(0)

    if raw.lower().startswith("dec:"):
        encoded = raw[4:]
        print(f"[MODE]    HTML decode")
        print(f"[INPUT]   {encoded[:120]}")
        print()
        decoded = html.unescape(encoded)
        print(f"[DECODED]  {decoded}")
        # Show what was decoded
        entities = re.findall(r"&[#a-zA-Z0-9]+;", encoded)
        if entities:
            print()
            print("[ENTITIES FOUND]")
            for ent in sorted(set(entities)):
                decoded_char = html.unescape(ent)
                print(f"  {ent:15s}  →  {decoded_char!r}")
    else:
        text = raw
        print(f"[MODE]    HTML encode")
        print(f"[INPUT]   {text[:120]}")
        print()
        # Standard escape
        std = html.escape(text, quote=True)
        # Full numeric encoding
        numeric = "".join(f"&#{ord(ch)};" for ch in text)
        # Hex numeric
        hex_enc = "".join(f"&#x{ord(ch):x};" for ch in text)
        # XSS-context encoding (all non-alnum → &#N;)
        xss = xss_encode(text)

        print(f"[STANDARD ESCAPE]   {std}")
        print(f"[NUMERIC DECIMAL]   {numeric[:120]}{'...' if len(numeric)>120 else ''}")
        print(f"[NUMERIC HEX]       {hex_enc[:120]}{'...' if len(hex_enc)>120 else ''}")
        print(f"[XSS SAFE]          {xss[:120]}{'...' if len(xss)>120 else ''}")

        # Named entity replacements shown
        named = text
        for ch, ent in HTML_ENTITIES.items():
            named = named.replace(ch, ent)
        if named != text:
            print(f"[NAMED ENTITIES]    {named[:120]}")

        # Tag detection
        tags = re.findall(r"<[^>]+>", text)
        if tags:
            print()
            print(f"[HTML TAGS DETECTED]  {len(tags)} tag(s)")
            for t in tags[:8]:
                print(f"  {t}")

        # Script injection detection
        if re.search(r"<script|javascript:|on\w+=|eval\(|alert\(", text, re.I):
            print()
            print("[WARN]  Potential XSS payload detected in input!")

    print()
    print("[DONE] HTML coder operation complete.")

if __name__ == "__main__":
    main()
