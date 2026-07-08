"""
Regex Tester — Module 202
Tests a regex pattern against one or more strings.
Usage:
  regex_test.py "PATTERN::TEST_STRING"
  regex_test.py "PATTERN::line1|line2|line3"
  regex_test.py "flags:i:PATTERN::TEST_STRING"   (case-insensitive)
  regex_test.py "sub:PATTERN:REPLACEMENT:INPUT"  (substitution mode)
  regex_test.py "split:PATTERN:INPUT"            (split mode)

Separator between pattern and input is ::  (double colon)
"""
import sys
import re

COMMON = {
    "email":    r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}",
    "url":      r"https?://[^\s/$.?#].[^\s]*",
    "ipv4":     r"\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b",
    "ipv6":     r"(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}",
    "mac":      r"(?:[0-9a-fA-F]{2}[:\-]){5}[0-9a-fA-F]{2}",
    "md5":      r"\b[a-fA-F0-9]{32}\b",
    "sha256":   r"\b[a-fA-F0-9]{64}\b",
    "date_iso": r"\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])",
    "phone_us": r"\+?1?\s*[-.\(]?\d{3}[-.\)]?\s*\d{3}[-.]?\d{4}",
    "ssn":      r"\d{3}-\d{2}-\d{4}",
    "jwt":      r"eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+",
    "base64":   r"(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?",
    "hex_block":r"\b[0-9a-fA-F]{8,}\b",
    "cve":      r"CVE-\d{4}-\d{4,7}",
}

def describe_pattern(pattern: str) -> None:
    notes = []
    if "^" in pattern or "$" in pattern:
        notes.append("anchored pattern (^ or $)")
    if "(?P<" in pattern:
        names = re.findall(r"\(\?P<(\w+)>", pattern)
        notes.append(f"named groups: {', '.join(names)}")
    if "(?i)" in pattern or "(?m)" in pattern or "(?s)" in pattern:
        notes.append("inline flags")
    if pattern in COMMON.values():
        for name, pat in COMMON.items():
            if pat == pattern:
                notes.append(f"matches built-in: {name}")
    if notes:
        print(f"  [INFO] {'; '.join(notes)}")

def main() -> None:
    print("[MODULE 202] REGEX TESTER")
    print("[SOURCE]     Python re module — full regex engine")
    print()

    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()

    if not raw or raw in ("help", "list"):
        print("[USAGE] regex_test.py \"PATTERN::TEST_STRING\"")
        print("        regex_test.py \"flags:im:PATTERN::input1|input2\"")
        print("        regex_test.py \"sub:PATTERN:REPLACEMENT:INPUT\"")
        print("        regex_test.py \"split:PATTERN:INPUT\"")
        print()
        print("[BUILT-IN PATTERNS]")
        for name, pat in COMMON.items():
            print(f"  {name:10s}  {pat[:60]}{'...' if len(pat)>60 else ''}")
        sys.exit(0)

    flags = 0
    if raw.lower().startswith("flags:"):
        rest = raw[6:]
        colon = rest.find(":")
        flag_str = rest[:colon].lower()
        raw = rest[colon + 1:]
        if "i" in flag_str:
            flags |= re.IGNORECASE
        if "m" in flag_str:
            flags |= re.MULTILINE
        if "s" in flag_str:
            flags |= re.DOTALL
        if "x" in flag_str:
            flags |= re.VERBOSE
        print(f"[FLAGS]   {'IGNORECASE ' if flags & re.IGNORECASE else ''}{'MULTILINE ' if flags & re.MULTILINE else ''}{'DOTALL ' if flags & re.DOTALL else ''}")

    if raw.lower().startswith("sub:"):
        parts = raw[4:].split(":", 2)
        if len(parts) < 3:
            print("[ERROR] sub: needs PATTERN:REPLACEMENT:INPUT")
            sys.exit(1)
        pattern, repl, text = parts
        try:
            compiled = re.compile(pattern, flags)
            result = compiled.sub(repl, text)
            count = len(compiled.findall(text))
            print(f"[PATTERN]     {pattern}")
            print(f"[REPLACEMENT] {repl}")
            print(f"[INPUT]       {text}")
            print(f"[RESULT]      {result}")
            print(f"[REPLACED]    {count} occurrence(s)")
        except re.error as e:
            print(f"[ERROR] Regex error: {e}")
            sys.exit(1)
        print()
        print("[DONE] Regex substitution complete.")
        return

    if raw.lower().startswith("split:"):
        parts = raw[6:].split(":", 1)
        if len(parts) < 2:
            print("[ERROR] split: needs PATTERN:INPUT")
            sys.exit(1)
        pattern, text = parts
        try:
            parts_out = re.split(pattern, text, flags=flags)
            print(f"[PATTERN] {pattern}")
            print(f"[INPUT]   {text}")
            print(f"[PARTS]   {len(parts_out)}")
            for i, p in enumerate(parts_out):
                print(f"  [{i:02d}]  {repr(p)}")
        except re.error as e:
            print(f"[ERROR] Regex error: {e}")
            sys.exit(1)
        print()
        print("[DONE] Regex split complete.")
        return

    if "::" not in raw:
        print("[ERROR] Pattern and input must be separated by  ::  (double colon)")
        print("        Example: \\d+::abc123def456")
        sys.exit(1)

    sep_idx = raw.index("::")
    pattern = raw[:sep_idx]
    inputs_raw = raw[sep_idx + 2:]
    inputs = inputs_raw.split("|")

    if pattern in COMMON:
        pattern = COMMON[pattern]
        print(f"[PATTERN] [built-in] {pattern}")
    else:
        print(f"[PATTERN] {pattern}")

    describe_pattern(pattern)

    try:
        compiled = re.compile(pattern, flags)
    except re.error as e:
        print(f"[ERROR] Invalid regex: {e}")
        sys.exit(1)

    print()
    for idx, inp in enumerate(inputs):
        print(f"[INPUT {idx+1:02d}] {inp[:100]}")
        matches = list(compiled.finditer(inp))
        if not matches:
            print("  [NO MATCH]")
        else:
            for i, m in enumerate(matches[:20]):
                print(f"  Match {i+1}: '{m.group()}'  at [{m.start()}:{m.end()}]")
                if m.groupdict():
                    for name, val in m.groupdict().items():
                        print(f"    group '{name}': {val}")
                elif m.groups():
                    for j, g in enumerate(m.groups()):
                        print(f"    group {j+1}: {g}")
        if len(matches) > 20:
            print(f"  ... ({len(matches)-20} more matches)")
        print()

    print("[DONE] Regex test complete.")

if __name__ == "__main__":
    main()
