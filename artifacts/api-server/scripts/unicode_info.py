"""Unicode Info — Module 227. Usage: unicode_info.py "A" or unicode_info.py "U+1F600" or unicode_info.py "hello" """
import sys, unicodedata, re

def codepoint_info(ch: str) -> None:
    cp = ord(ch)
    try:
        name = unicodedata.name(ch)
    except ValueError:
        name = "<control>"
    cat  = unicodedata.category(ch)
    bidi = unicodedata.bidirectional(ch)
    comb = unicodedata.combining(ch)
    norm_nfc  = unicodedata.normalize("NFC", ch)
    norm_nfd  = unicodedata.normalize("NFD", ch)
    norm_nfkc = unicodedata.normalize("NFKC", ch)
    norm_nfkd = unicodedata.normalize("NFKD", ch)

    CAT_NAMES = {
        "Lu":"Letter, Uppercase","Ll":"Letter, Lowercase","Lt":"Letter, Titlecase",
        "Lm":"Letter, Modifier","Lo":"Letter, Other","Mn":"Mark, Nonspacing",
        "Mc":"Mark, Spacing Combining","Me":"Mark, Enclosing","Nd":"Number, Decimal Digit",
        "Nl":"Number, Letter","No":"Number, Other","Pc":"Punctuation, Connector",
        "Pd":"Punctuation, Dash","Ps":"Punctuation, Open","Pe":"Punctuation, Close",
        "Pi":"Punctuation, Initial","Pf":"Punctuation, Final","Po":"Punctuation, Other",
        "Sm":"Symbol, Math","Sc":"Symbol, Currency","Sk":"Symbol, Modifier","So":"Symbol, Other",
        "Zs":"Separator, Space","Zl":"Separator, Line","Zp":"Separator, Paragraph",
        "Cc":"Other, Control","Cf":"Other, Format","Cs":"Other, Surrogate",
        "Co":"Other, Private Use","Cn":"Other, Not Assigned",
    }
    print(f"  Char:    {ch!r}  {ch if cp >= 32 else ''}")
    print(f"  U+{cp:04X}   {name}")
    print(f"  Category: {cat}  ({CAT_NAMES.get(cat, '?')})")
    if bidi:
        print(f"  Bidi:    {bidi}")
    if comb:
        print(f"  Comb:    {comb}")

    # Encodings
    utf8  = ch.encode("utf-8")
    try:
        utf16 = ch.encode("utf-16-be")
    except Exception:
        utf16 = b""
    try:
        latin1 = ch.encode("latin-1")
    except Exception:
        latin1 = None

    print(f"  UTF-8:   {' '.join(f'0x{b:02X}' for b in utf8)}  ({len(utf8)} byte{'s' if len(utf8)>1 else ''})")
    if utf16:
        print(f"  UTF-16:  {' '.join(f'0x{b:02X}' for b in utf16)}")
    if latin1 is not None:
        print(f"  Latin-1: 0x{latin1[0]:02X}")

    # HTML entity
    if cp < 128:
        print(f"  HTML:    &#{cp};  or  &#{cp:X};  or  &#x{cp:x};")
    elif cp <= 0xFFFF:
        print(f"  HTML:    &#{cp};  &#x{cp:X};")

    # Normalizations
    if len(norm_nfd) > 1:
        decomp = " + ".join(f"U+{ord(c):04X} {unicodedata.name(c,'?')}" for c in norm_nfd)
        print(f"  NFD:     {decomp}")
    if norm_nfkc != ch:
        print(f"  NFKC:    {norm_nfkc!r}  U+{ord(norm_nfkc[0]):04X}" if norm_nfkc else "")

    # Script detection
    if 0x0400 <= cp <= 0x04FF:
        print(f"  Script:  Cyrillic")
    elif 0x0600 <= cp <= 0x06FF:
        print(f"  Script:  Arabic")
    elif 0x4E00 <= cp <= 0x9FFF:
        print(f"  Script:  CJK Unified Ideograph")
    elif 0x3040 <= cp <= 0x30FF:
        print(f"  Script:  Japanese (Hiragana/Katakana)")
    elif 0x0900 <= cp <= 0x097F:
        print(f"  Script:  Devanagari")
    elif 0x1F300 <= cp <= 0x1FAFF:
        print(f"  Script:  Emoji / Symbols")
    elif cp < 0x0080:
        print(f"  Script:  ASCII / Basic Latin")
    elif cp < 0x0100:
        print(f"  Script:  Latin Extended")

def main():
    print("[MODULE 227] UNICODE INFO")
    print("[SOURCE]     Python unicodedata stdlib — codepoint analysis and encoding")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  unicode_info.py \"A\"          (single char)")
        print("         unicode_info.py \"hello\"       (string)")
        print("         unicode_info.py \"U+1F600\"     (codepoint)")
        print("         unicode_info.py \"search:copyright\"  (name search)")
        sys.exit(0)

    raw_upper = raw.upper()

    # Codepoint U+XXXX
    if raw_upper.startswith("U+") or re.match(r'^[0-9A-Fa-f]{4,6}$', raw):
        hex_part = raw_upper.lstrip("U+")
        try:
            cp = int(hex_part, 16)
            ch = chr(cp)
            print(f"[CODEPOINT]  U+{cp:04X}")
            print()
            codepoint_info(ch)
            sys.exit(0)
        except Exception as e:
            print(f"[ERROR] {e}")
            sys.exit(1)

    # Name search
    if raw.lower().startswith("search:"):
        query = raw[7:].strip().upper()
        print(f"[SEARCH]  '{query}'")
        print()
        found = 0
        for cp in range(0x110000):
            try:
                ch = chr(cp)
                name = unicodedata.name(ch, "")
                if query in name:
                    cat = unicodedata.category(ch)
                    print(f"  U+{cp:04X}  {ch!r}  {name}  [{cat}]")
                    found += 1
                    if found >= 30:
                        print(f"  ... (limited to 30 results)")
                        break
            except Exception:
                pass
        if found == 0:
            print("  No characters found")
        sys.exit(0)

    # String
    print(f"[STRING]   {raw!r}")
    print(f"[LENGTH]   {len(raw)} characters  {len(raw.encode('utf-8'))} bytes (UTF-8)")
    print()

    if len(raw) > 20:
        print(f"[SHOWING FIRST 20 CHARS]")
        chars = raw[:20]
    else:
        chars = raw

    for ch in chars:
        codepoint_info(ch)
        print()

    # String-level analysis
    cats = {}
    for ch in raw:
        c = unicodedata.category(ch)
        cats[c] = cats.get(c, 0) + 1

    is_ascii = all(ord(c) < 128 for c in raw)
    is_bmp   = all(ord(c) < 0x10000 for c in raw)
    print(f"[STRING ANALYSIS]")
    print(f"  All ASCII:  {is_ascii}")
    print(f"  All BMP:    {is_bmp}")
    nfc  = unicodedata.normalize("NFC", raw)
    nfkc = unicodedata.normalize("NFKC", raw)
    print(f"  NFC form:   {nfc!r}  ({len(nfc)} chars)")
    if nfkc != raw:
        print(f"  NFKC form:  {nfkc!r}  ({len(nfkc)} chars)")

    print()
    print("[DONE] Unicode info complete.")

if __name__ == "__main__":
    main()
