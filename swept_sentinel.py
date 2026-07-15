#!/usr/bin/env python3
"""
swept_sentinel.py — CLI for the Swept Sentinel recon dashboard

Usage:
  python swept_sentinel.py list                          # list all 230 modules
  python swept_sentinel.py list network                  # list a category
  python swept_sentinel.py run <module_id> <target>      # run a module
  python swept_sentinel.py search <keyword>              # search modules by name

Examples:
  python swept_sentinel.py run 1 8.8.8.8
  python swept_sentinel.py run 3 google.com
  python swept_sentinel.py run 11 torvalds
  python swept_sentinel.py list recon
  python swept_sentinel.py search cert
"""

import sys
import json
import urllib.request
import urllib.error

BASE = "http://localhost:80/api/sentinel"

# ── colours ──────────────────────────────────────────────────────────────────
R      = "\033[0m"
BOLD   = "\033[1m"
CYAN   = "\033[96m"
GREEN  = "\033[92m"
YELLOW = "\033[93m"
RED    = "\033[91m"
PURPLE = "\033[95m"
DIM    = "\033[2m"

CAT_COLOUR = {
    "NETWORK":  "\033[94m",
    "SOCIAL":   "\033[92m",
    "RECON":    "\033[93m",
    "EXPLOIT":  "\033[91m",
    "INTEL":    "\033[95m",
    "ADVANCED": "\033[96m",
}

def cat_colour(cat):
    return CAT_COLOUR.get(cat.upper(), CYAN)

# ── helpers ───────────────────────────────────────────────────────────────────
def get(path):
    try:
        with urllib.request.urlopen(BASE + path, timeout=10) as r:
            return json.loads(r.read())
    except urllib.error.URLError:
        print(f"{RED}ERROR: Cannot reach the API server at {BASE}{R}")
        print(f"{DIM}Make sure the API workflow is running (pnpm --filter @workspace/api-server run dev){R}")
        sys.exit(1)

def post(path, body):
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        BASE + path,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            return json.loads(r.read())
    except urllib.error.URLError as e:
        print(f"{RED}ERROR: {e}{R}")
        sys.exit(1)

def stream_sse(path):
    """Read an SSE stream and yield data lines, stopping on [DONE]."""
    try:
        req = urllib.request.Request(BASE + path)
        req.add_header("Accept", "text/event-stream")
        with urllib.request.urlopen(req, timeout=120) as r:
            buf = b""
            while True:
                chunk = r.read(1)
                if not chunk:
                    break
                buf += chunk
                if buf.endswith(b"\n\n"):
                    done = False
                    for raw in buf.split(b"\n"):
                        line = raw.decode("utf-8", errors="replace").strip()
                        if line.startswith("data:"):
                            value = line[5:].strip()
                            try:
                                value = json.loads(value)
                            except (json.JSONDecodeError, ValueError):
                                pass
                            yield value
                            if value.startswith("[DONE]") or value == "DONE":
                                done = True
                    buf = b""
                    if done:
                        break
    except urllib.error.URLError as e:
        print(f"{RED}Stream error: {e}{R}")

def header():
    print(f"\n{CYAN}{BOLD}  S W E P T - S E N T I N E L{R}  {DIM}CLI{R}")
    print(f"{DIM}  {'─' * 38}{R}\n")

# ── commands ──────────────────────────────────────────────────────────────────
def cmd_list(args):
    modules = get("/modules")
    cat_filter = args[0].upper() if args else None

    if cat_filter and cat_filter not in ("NETWORK", "SOCIAL", "RECON", "EXPLOIT", "INTEL", "ADVANCED", "ALL"):
        print(f"{RED}Unknown category '{cat_filter}'. Choose: network social recon exploit intel advanced{R}")
        sys.exit(1)

    header()
    current_cat = None
    shown = 0

    for m in modules:
        cat = m["category"]
        if cat_filter and cat_filter != "ALL" and cat != cat_filter:
            continue
        if cat != current_cat:
            current_cat = cat
            print(f"  {cat_colour(cat)}{BOLD}{cat}{R}")
        print(f"  {DIM}[{m['id']:03d}]{R}  {m['name']}")
        shown += 1

    print(f"\n  {DIM}{shown} modules{R}\n")


def cmd_search(args):
    if not args:
        print(f"{RED}Usage: python swept_sentinel.py search <keyword>{R}")
        sys.exit(1)

    kw = " ".join(args).lower()
    modules = get("/modules")
    header()
    results = [m for m in modules if kw in m["name"].lower() or kw in str(m["id"])]

    if not results:
        print(f"  {DIM}No modules match '{kw}'{R}\n")
        return

    for m in results:
        cat = m["category"]
        print(f"  {cat_colour(cat)}[{m['id']:03d}]{R}  {BOLD}{m['name']}{R}  {DIM}{cat}{R}")

    print(f"\n  {DIM}{len(results)} result(s){R}\n")


def cmd_run(args):
    if len(args) < 2:
        print(f"{RED}Usage: python swept_sentinel.py run <module_id> <target>{R}")
        print(f"{DIM}Example: python swept_sentinel.py run 3 google.com{R}")
        sys.exit(1)

    try:
        module_id = int(args[0])
    except ValueError:
        print(f"{RED}Module ID must be a number (1–230){R}")
        sys.exit(1)

    target = args[1]
    header()

    modules = get("/modules")
    mod = next((m for m in modules if m["id"] == module_id), None)
    if not mod:
        print(f"{RED}Module {module_id} not found{R}")
        sys.exit(1)

    cat = mod["category"]
    print(f"  {DIM}Target :{R}  {BOLD}{target}{R}")
    print(f"  {DIM}Module :{R}  {cat_colour(cat)}[{module_id:03d}] {mod['name']}{R}  {DIM}{cat}{R}")
    print(f"  {DIM}{'─' * 38}{R}\n")

    resp = post("/execute", {"moduleId": module_id, "target": target})
    run_id = resp.get("runId")
    if not run_id:
        print(f"{RED}Server did not return a run ID{R}")
        sys.exit(1)

    empty = True
    for line in stream_sse(f"/stream/{run_id}"):
        if not line:
            continue
        empty = False
        if line.startswith("[ERROR]") or "ERROR" in line[:20]:
            print(f"  {RED}{line}{R}")
        elif line.startswith("[DONE]") or line == "DONE":
            print(f"\n  {GREEN}{BOLD}{line}{R}")
        elif line.startswith("[INFO]") or line.startswith("[MODULE"):
            print(f"  {DIM}{line}{R}")
        else:
            print(f"  {GREEN}{line}{R}")

    if empty:
        print(f"  {DIM}(no output){R}")

    print()


def cmd_help():
    print(__doc__)


# ── main ──────────────────────────────────────────────────────────────────────
def main():
    args = sys.argv[1:]

    if not args or args[0] in ("-h", "--help", "help"):
        cmd_help()
        return

    cmd = args[0].lower()
    rest = args[1:]

    if cmd == "list":
        cmd_list(rest)
    elif cmd == "search":
        cmd_search(rest)
    elif cmd == "run":
        cmd_run(rest)
    else:
        print(f"{RED}Unknown command '{cmd}'. Run with --help for usage.{R}")
        sys.exit(1)


if __name__ == "__main__":
    main()
