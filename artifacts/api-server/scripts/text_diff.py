"""Text Diff — Module 224. Side-by-side text comparison using difflib."""
import sys, difflib, re

def main():
    print("[MODULE 224] TEXT DIFF")
    print("[SOURCE]     Python difflib stdlib — no external calls")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  TEXT_A|||TEXT_B           — diff two texts (||| separator)")
        print("[USAGE]  unified:TEXT_A|||TEXT_B   — unified diff format")
        print("[USAGE]  ratio:TEXT_A|||TEXT_B     — similarity ratio only")
        print("[EXAMPLE] hello world|||hello there world")
        sys.exit(0)

    mode = "context"
    if raw.startswith("unified:"):
        mode = "unified"; raw = raw[8:]
    elif raw.startswith("ratio:"):
        mode = "ratio"; raw = raw[6:]
    elif raw.startswith("diff:"):
        raw = raw[5:]

    if "|||" not in raw:
        # single text — show stats
        text = raw.replace("\\n", "\n")
        lines = text.split("\n")
        print(f"[INPUT]   {len(lines)} lines, {len(text)} chars")
        print("[INFO]    Provide two texts separated by |||")
        print("[EXAMPLE] before text|||after text")
        sys.exit(0)

    parts = raw.split("|||", 1)
    a_text = parts[0].replace("\\n","\n")
    b_text = parts[1].replace("\\n","\n")
    a_lines = a_text.splitlines(keepends=True)
    b_lines = b_text.splitlines(keepends=True)

    matcher = difflib.SequenceMatcher(None, a_text, b_text)
    ratio = matcher.ratio()

    print(f"[TEXT A]          {len(a_lines)} lines, {len(a_text)} chars")
    print(f"[TEXT B]          {len(b_lines)} lines, {len(b_text)} chars")
    print(f"[SIMILARITY]      {ratio*100:.1f}%")
    print(f"[DISTANCE]        {(1-ratio)*100:.1f}% different")
    print()

    if mode == "ratio":
        if ratio == 1.0:
            print("[RESULT]  IDENTICAL — texts are exactly the same")
        elif ratio > 0.9:
            print("[RESULT]  VERY SIMILAR — minor differences")
        elif ratio > 0.5:
            print("[RESULT]  MODERATELY DIFFERENT")
        else:
            print("[RESULT]  VERY DIFFERENT")
        sys.exit(0)

    if mode == "unified":
        diff = list(difflib.unified_diff(a_lines, b_lines, fromfile="text_a", tofile="text_b", lineterm=""))
        if not diff:
            print("[DIFF]  Texts are identical")
        else:
            print("[UNIFIED DIFF]")
            for line in diff:
                prefix = "  "
                if line.startswith("+"): prefix = "+ "
                elif line.startswith("-"): prefix = "- "
                elif line.startswith("@"): prefix = "@ "
                print(f"  {prefix}{line.rstrip()}")
        sys.exit(0)

    # Context diff (default)
    diff = list(difflib.ndiff(a_lines, b_lines))
    adds = sum(1 for l in diff if l.startswith("+ "))
    removes = sum(1 for l in diff if l.startswith("- "))
    changes = sum(1 for l in diff if l.startswith("? "))

    print(f"[ADDITIONS]       +{adds} lines")
    print(f"[REMOVALS]        -{removes} lines")
    print(f"[CHANGED LINES]   ~{changes//2}")
    print()

    if not [l for l in diff if not l.startswith("  ")]:
        print("[DIFF]  Texts are identical")
    else:
        print("[DIFF OUTPUT]  (+ added, - removed, ? changed chars)")
        for line in diff:
            if not line.startswith("  "):
                print(f"  {line.rstrip()}")

    print()
    print("[DONE] Text diff complete.")

if __name__ == "__main__":
    main()
