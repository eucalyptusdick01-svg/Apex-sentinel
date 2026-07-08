"""
String Extractor — Module 102
Extracts printable ASCII / Unicode strings from binary or hex data.
Equivalent to the Unix `strings` command.
Usage:
  string_extract.py "hex:4d5a9000..."
  string_extract.py "base64:TVoJAAA..."
  string_extract.py "Hello\x00World\x00binary\x00data"
  string_extract.py "min:6:hex:deadbeef4865..."   (min length 6)
"""
import sys
import base64
import re
import os

DEFAULT_MIN = 4

def extract_strings(data: bytes, min_len: int = DEFAULT_MIN) -> list[tuple[int, str]]:
    results = []
    pattern = re.compile(rb'[ -~]{' + str(min_len).encode() + rb',}')
    for m in pattern.finditer(data):
        results.append((m.start(), m.group().decode("ascii")))
    return results

def extract_unicode(data: bytes, min_len: int = DEFAULT_MIN) -> list[tuple[int, str]]:
    results = []
    pattern = re.compile(rb'(?:[ -~]\x00){' + str(min_len).encode() + rb',}')
    for m in pattern.finditer(data):
        s = m.group().decode("utf-16-le", errors="replace").rstrip("\x00")
        if len(s) >= min_len:
            results.append((m.start(), s))
    return results

def classify(s: str) -> str:
    if s.startswith("http://") or s.startswith("https://"):
        return "URL"
    if re.match(r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$", s):
        return "EMAIL"
    if re.match(r"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", s):
        return "IP"
    if re.search(r"(?i)(password|passwd|secret|key|token|auth|apikey|api_key)", s):
        return "CREDENTIAL-LIKE"
    if re.match(r"^[A-Fa-f0-9]{32,}$", s):
        return "HEX/HASH"
    if re.match(r"^[A-Za-z0-9+/]{20,}={0,2}$", s):
        return "BASE64-LIKE"
    if re.search(r"[/\\][A-Za-z0-9_.\-]+[/\\]", s):
        return "PATH"
    if re.match(r"^[A-Z][a-z]+(Exception|Error|Warning)$", s):
        return "EXCEPTION"
    return ""

def main() -> None:
    print("[MODULE 102] STRING EXTRACTOR")
    print("[SOURCE]     Printable ASCII / UTF-16 string extraction (strings equivalent)")
    print()

    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No input supplied.")
        print("[USAGE] string_extract.py \"hex:4d5a9000...\"")
        print("        string_extract.py \"base64:TVo...\"")
        sys.exit(1)

    min_len = DEFAULT_MIN
    data: bytes

    if raw.lower().startswith("min:"):
        rest = raw[4:]
        colon = rest.find(":")
        try:
            min_len = int(rest[:colon])
            raw = rest[colon + 1:]
        except Exception:
            pass

    if raw.lower().startswith("hex:"):
        hex_str = raw[4:].replace(" ", "")
        try:
            data = bytes.fromhex(hex_str)
        except ValueError as e:
            print(f"[ERROR] Invalid hex: {e}")
            sys.exit(1)
    elif raw.lower().startswith("base64:"):
        try:
            data = base64.b64decode(raw[7:])
        except Exception as e:
            print(f"[ERROR] Invalid base64: {e}")
            sys.exit(1)
    elif raw.lower().startswith("file:"):
        path = raw[5:]
        if not os.path.isfile(path):
            print(f"[ERROR] File not found: {path}")
            sys.exit(1)
        with open(path, "rb") as f:
            data = f.read()
    else:
        data = raw.encode("utf-8")

    print(f"[INPUT]   {len(data)} bytes  |  min string length: {min_len}")
    print()

    ascii_strs = extract_strings(data, min_len)
    utf16_strs = extract_unicode(data, min_len)

    total = len(ascii_strs) + len(utf16_strs)
    print(f"[FOUND]   {len(ascii_strs)} ASCII string(s)  |  {len(utf16_strs)} UTF-16 string(s)  |  {total} total")
    print()

    interesting = []
    print("[ASCII STRINGS]")
    for offset, s in ascii_strs[:200]:
        tag = classify(s)
        tag_str = f"  [{tag}]" if tag else ""
        print(f"  {offset:08x}  {s[:120]}{tag_str}")
        if tag:
            interesting.append((tag, s))

    if len(ascii_strs) > 200:
        print(f"  ... ({len(ascii_strs) - 200} more — increase min length to filter)")

    if utf16_strs:
        print()
        print("[UTF-16 STRINGS]")
        for offset, s in utf16_strs[:50]:
            tag = classify(s)
            tag_str = f"  [{tag}]" if tag else ""
            print(f"  {offset:08x}  {s[:120]}{tag_str}")
            if tag:
                interesting.append((tag, s))

    if interesting:
        print()
        print("[NOTABLE STRINGS]")
        for tag, s in interesting[:30]:
            print(f"  [{tag:16s}] {s[:100]}")

    print()
    print("[DONE] String extraction complete.")

if __name__ == "__main__":
    main()
