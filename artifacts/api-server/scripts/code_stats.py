"""
Code Statistics — Module 215
Analyzes code: counts lines, detects language, measures complexity.
Usage:
  code_stats.py "file:/path/to/file.py"
  code_stats.py "ext:.py:def foo():\n    pass\n    return 1"
  code_stats.py "python:def foo():\n    if x:\n        return 1"
  code_stats.py "dir:/path/to/project"   (directory summary)
"""
import sys
import re
import os

LANG_PATTERNS: dict = {
    "python":     (r"\.pyi?$",      r"#",     r'"""',  r'"""', r"\bdef \b|\bclass \b|\bimport \b"),
    "javascript": (r"\.(js|mjs)$",  r"//",    r"/\*",  r"\*/", r"\bfunction \b|\bconst \b|\blet \b|\bclass \b"),
    "typescript": (r"\.tsx?$",      r"//",    r"/\*",  r"\*/", r"\binterface \b|\btype \b|\bfunction \b|\bconst \b"),
    "java":       (r"\.java$",      r"//",    r"/\*",  r"\*/", r"\bclass \b|\bpublic \b|\bprivate \b|\bimport \b"),
    "c":          (r"\.[ch]$",      r"//",    r"/\*",  r"\*/", r"\bvoid \b|\bint \b|\bchar \b|\bstruct \b"),
    "cpp":        (r"\.(cpp|hpp|cc)$",r"//",  r"/\*",  r"\*/", r"\bclass \b|\bnamespace \b|\btemplate \b"),
    "rust":       (r"\.rs$",        r"//",    r"/\*",  r"\*/", r"\bfn \b|\blet \b|\bstruct \b|\benum \b"),
    "go":         (r"\.go$",        r"//",    r"/\*",  r"\*/", r"\bfunc \b|\bpackage \b|\bimport \b"),
    "ruby":       (r"\.rb$",        r"#",     r"=begin",r"=end",r"\bdef \b|\bclass \b|\bmodule \b"),
    "php":        (r"\.php$",       r"//",    r"/\*",  r"\*/", r"\bfunction \b|\bclass \b|\b\$"),
    "shell":      (r"\.(sh|bash)$", r"#",     None,    None,   r"\becho \b|\bif \b|\bfi\b|\bfunction \b"),
    "sql":        (r"\.sql$",       r"--",    r"/\*",  r"\*/", r"(?i)\bSELECT \b|\bCREATE \b|\bINSERT \b"),
    "html":       (r"\.html?$",     None,     r"<!--",r"-->",  r"<html|<body|<div|<script"),
    "css":        (r"\.css$",       None,     r"/\*",  r"\*/", r"\{|\}|:"),
    "yaml":       (r"\.ya?ml$",     r"#",     None,    None,   r"^\s*\w+:"),
    "json":       (r"\.json$",      None,     None,    None,   r'^\s*[\{\[]'),
    "markdown":   (r"\.md$",        None,     None,    None,   r"^#{1,6} |\*\*|__"),
}

def detect_language(code: str, ext: str = "") -> str:
    for lang, (pat, *_) in LANG_PATTERNS.items():
        if ext and re.search(pat, ext, re.IGNORECASE):
            return lang
    for lang, (pat, _, _, _, kw) in LANG_PATTERNS.items():
        if re.search(kw, code[:2000], re.MULTILINE):
            return lang
    return "unknown"

def count_lines(code: str, lang: str) -> dict:
    lines = code.split("\n")
    total = len(lines)
    blank = sum(1 for l in lines if not l.strip())
    
    comment_pat, block_start, block_end, _ = list(LANG_PATTERNS.get(lang, (None, None, None, None, None)))[1:5]
    
    comment = 0
    in_block = False
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        if block_start and block_end:
            if block_start in stripped:
                in_block = True
            if in_block:
                comment += 1
                if block_end in stripped:
                    in_block = False
                continue
        if comment_pat and stripped.startswith(comment_pat):
            comment += 1

    code_lines = total - blank - comment
    return {"total": total, "code": max(0, code_lines), "blank": blank, "comment": comment}

def complexity(code: str, lang: str) -> dict:
    branches = len(re.findall(r'\b(if|else|elif|for|while|case|switch|catch|except|and|or|\|\||&&)\b', code))
    if lang in ("python",):
        fns      = len(re.findall(r'^\s*def ', code, re.MULTILINE))
        classes  = len(re.findall(r'^\s*class ', code, re.MULTILINE))
        imports  = len(re.findall(r'^\s*(import|from)\s', code, re.MULTILINE))
    elif lang in ("javascript", "typescript"):
        fns      = len(re.findall(r'\bfunction\s|\b=>\s*\{|\bconst\s+\w+\s*=\s*\(', code))
        classes  = len(re.findall(r'\bclass\s', code))
        imports  = len(re.findall(r'\b(import|require)\s', code))
    else:
        fns      = len(re.findall(r'\b(def|func|function|fn|sub|method)\b', code))
        classes  = len(re.findall(r'\bclass\b', code))
        imports  = len(re.findall(r'\b(import|include|require|use)\b', code))
    
    return {"functions": fns, "classes": classes, "imports": imports, "branches": branches}

def analyze(code: str, filename: str = "", ext: str = "") -> None:
    lang = detect_language(code, ext)
    counts = count_lines(code, lang)
    cplx   = complexity(code, lang)
    chars  = len(code)
    avg_line_len = chars / max(1, counts["total"])
    comment_ratio = counts["comment"] / max(1, counts["total"] - counts["blank"]) * 100

    if filename:
        print(f"[FILE]       {filename}")
    print(f"[LANGUAGE]   {lang.upper()}")
    print()
    print("[LINE COUNTS]")
    print(f"  Total lines    : {counts['total']:6,}")
    print(f"  Code lines     : {counts['code']:6,}  ({counts['code']/max(1,counts['total'])*100:.1f}%)")
    print(f"  Comment lines  : {counts['comment']:6,}  ({comment_ratio:.1f}%)")
    print(f"  Blank lines    : {counts['blank']:6,}")
    print(f"  Total chars    : {chars:6,}")
    print(f"  Avg line length: {avg_line_len:6.1f} chars")
    print()
    print("[CODE STRUCTURE]")
    print(f"  Functions / methods : {cplx['functions']}")
    print(f"  Classes             : {cplx['classes']}")
    print(f"  Import statements   : {cplx['imports']}")
    print(f"  Branch points       : {cplx['branches']}")
    print()
    if cplx["branches"] > 50:
        print("[COMPLEXITY]  High — many branches, consider refactoring")
    elif cplx["branches"] > 20:
        print("[COMPLEXITY]  Medium")
    else:
        print("[COMPLEXITY]  Low — readable control flow")

def scan_dir(dirpath: str) -> None:
    ext_counts: dict = {}
    totals = {"total": 0, "code": 0, "blank": 0, "comment": 0, "files": 0}
    for root, _, files in os.walk(dirpath):
        if any(skip in root for skip in ["node_modules", ".git", "__pycache__", ".venv", "dist", "build"]):
            continue
        for fname in files:
            ext = os.path.splitext(fname)[1].lower()
            if not ext or ext in (".lock", ".log", ".svg", ".png", ".jpg", ".ico"):
                continue
            fpath = os.path.join(root, fname)
            try:
                with open(fpath, "r", errors="replace") as f:
                    code = f.read()
                lang = detect_language(code, ext)
                c = count_lines(code, lang)
                for k in ("total", "code", "blank", "comment"):
                    totals[k] += c[k]
                totals["files"] += 1
                ext_counts[ext] = ext_counts.get(ext, 0) + 1
            except Exception:
                pass

    print(f"[DIRECTORY]  {dirpath}")
    print(f"[FILES]      {totals['files']:,}")
    print()
    print("[TOTALS]")
    print(f"  Total lines   : {totals['total']:8,}")
    print(f"  Code lines    : {totals['code']:8,}")
    print(f"  Comment lines : {totals['comment']:8,}")
    print(f"  Blank lines   : {totals['blank']:8,}")
    print()
    print("[BY EXTENSION]")
    for ext, count in sorted(ext_counts.items(), key=lambda x: -x[1])[:20]:
        print(f"  {ext:10s}  {count} file(s)")

def main() -> None:
    print("[MODULE 215] CODE STATISTICS")
    print("[SOURCE]     Syntax-aware line counter + complexity estimator")
    print()

    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE] code_stats.py \"file:/path/to/file.py\"")
        print("        code_stats.py \"dir:/path/to/project\"")
        print("        code_stats.py \"python:def foo():\\n    pass\"")
        sys.exit(1)

    if raw.lower().startswith("dir:"):
        dirpath = raw[4:]
        if not os.path.isdir(dirpath):
            print(f"[ERROR] Directory not found: {dirpath}")
            sys.exit(1)
        scan_dir(dirpath)
        print()
        print("[DONE] Directory scan complete.")
        return

    if raw.lower().startswith("file:"):
        path = raw[5:]
        if not os.path.isfile(path):
            print(f"[ERROR] File not found: {path}")
            sys.exit(1)
        with open(path, "r", errors="replace") as f:
            code = f.read()
        ext = os.path.splitext(path)[1]
        analyze(code, filename=os.path.basename(path), ext=ext)
        print()
        print("[DONE] Code statistics complete.")
        return

    ext = ""
    for lang_key in LANG_PATTERNS:
        if raw.lower().startswith(lang_key + ":"):
            ext = "." + lang_key.replace("javascript", "js").replace("typescript", "ts")
            raw = raw[len(lang_key) + 1:]
            break

    code = raw.replace("\\n", "\n").replace("\\t", "\t")
    analyze(code, ext=ext)
    print()
    print("[DONE] Code statistics complete.")

if __name__ == "__main__":
    main()
