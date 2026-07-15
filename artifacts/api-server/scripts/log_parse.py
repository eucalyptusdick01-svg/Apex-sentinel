"""Log Parse — Module 195. Parse and analyze common log formats."""
import sys, re, collections, json
from datetime import datetime

# Common log patterns
PATTERNS = {
    "apache_combined": re.compile(
        r'(?P<ip>\S+) \S+ \S+ \[(?P<time>[^\]]+)\] "(?P<method>\S+) (?P<path>\S+) \S+" (?P<status>\d+) (?P<size>\S+) "(?P<referer>[^"]*)" "(?P<ua>[^"]*)"'
    ),
    "apache_common": re.compile(
        r'(?P<ip>\S+) \S+ \S+ \[(?P<time>[^\]]+)\] "(?P<method>\S+) (?P<path>\S+) \S+" (?P<status>\d+) (?P<size>\S+)'
    ),
    "nginx": re.compile(
        r'(?P<ip>\S+) - \S+ \[(?P<time>[^\]]+)\] "(?P<method>\S+) (?P<path>\S+) \S+" (?P<status>\d+) (?P<size>\d+)'
    ),
    "syslog": re.compile(
        r'(?P<month>\w+)\s+(?P<day>\d+) (?P<time>\d+:\d+:\d+) (?P<host>\S+) (?P<process>\S+)\[?(?P<pid>\d*)\]?: (?P<message>.+)'
    ),
    "windows_event": re.compile(
        r'(?P<datetime>\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (?P<level>\w+) (?P<source>[^\s]+) (?P<event_id>\d+) (?P<message>.+)'
    ),
    "auth_log": re.compile(
        r'(?P<month>\w+)\s+(?P<day>\d+) (?P<time>\d+:\d+:\d+) (?P<host>\S+) (?P<service>\S+): (?P<message>.+)'
    ),
    "json": re.compile(r'^\s*\{'),
}

ATTACK_PATTERNS = [
    (re.compile(r'(?:union|select|insert|update|delete|drop|create|alter)', re.I), "SQL Injection"),
    (re.compile(r'<script|javascript:|onerror=|onload=', re.I), "XSS"),
    (re.compile(r'\.\./|\.\.\\|%2e%2e', re.I), "Path Traversal"),
    (re.compile(r'/etc/passwd|/etc/shadow|/proc/self', re.I), "LFI"),
    (re.compile(r'cmd\.exe|powershell|/bin/sh|/bin/bash', re.I), "RCE Attempt"),
    (re.compile(r'nikto|sqlmap|nmap|masscan|dirbuster|gobuster|nuclei', re.I), "Scanner"),
    (re.compile(r'(?:wget|curl)\s+http', re.I), "Download Attempt"),
    (re.compile(r'\bping\b|\bnetcat\b|\bnc\b\s+-', re.I), "Network Tool"),
]

def detect_format(lines):
    for fmt, pattern in PATTERNS.items():
        if fmt == "json":
            try:
                json.loads(lines[0])
                return "json"
            except: pass
        else:
            if pattern.match(lines[0]):
                return fmt
    return "unknown"

def parse_web_log(lines, pattern):
    entries = []
    for line in lines:
        m = pattern.match(line)
        if m:
            entries.append(m.groupdict())
    return entries

def main():
    print("[MODULE 195] LOG PARSER & ANALYZER")
    print("[SOURCE]     Local regex parser — no external calls")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print('[USAGE]  Paste log lines as target (Apache, Nginx, syslog, auth.log, JSON)')
        print('[USAGE]  attack:LOG_CONTENT    — focus on attack pattern detection')
        sys.exit(0)

    mode = "full"
    if raw.startswith("attack:"):
        mode = "attack"; raw = raw[7:]

    log_text = raw.replace("\\n", "\n").replace("\\t", "\t")
    lines = [l for l in log_text.split("\n") if l.strip()]

    if not lines:
        print("[ERROR] No log content provided")
        sys.exit(0)

    print(f"[LINES]      {len(lines)}")
    fmt = detect_format(lines)
    print(f"[FORMAT]     {fmt}")
    print()

    # Try to parse as web log
    entries = []
    pattern = PATTERNS.get(fmt)
    if pattern and fmt not in ("syslog","json","unknown","auth_log","windows_event"):
        entries = parse_web_log(lines, pattern)
        print(f"[PARSED]     {len(entries)}/{len(lines)} lines ({len(lines)-len(entries)} unparsed)")

    if entries:
        # Status code breakdown
        status_counts = collections.Counter(e.get("status","?") for e in entries)
        ip_counts = collections.Counter(e.get("ip","?") for e in entries)
        path_counts = collections.Counter(e.get("path","?") for e in entries)
        method_counts = collections.Counter(e.get("method","?") for e in entries)

        print()
        print("[STATUS CODES]")
        for code, count in sorted(status_counts.items(), key=lambda x:-x[1])[:10]:
            category = "2xx OK" if code.startswith("2") else ("3xx REDIR" if code.startswith("3") else ("4xx CLIENT ERR" if code.startswith("4") else "5xx SERVER ERR"))
            print(f"  HTTP {code}  {count:5}  ({category})")

        print()
        print("[TOP IPs]")
        for ip, count in ip_counts.most_common(10):
            print(f"  {ip:<20} {count:5} requests")

        print()
        print("[TOP PATHS]")
        for path, count in path_counts.most_common(10):
            print(f"  {path:<50} {count:4}")

        print()
        print("[HTTP METHODS]")
        for method, count in method_counts.most_common():
            print(f"  {method:<10} {count}")

    # Attack pattern detection
    print()
    print("[ATTACK PATTERN SCAN]")
    attacks_found = []
    for i, line in enumerate(lines, 1):
        for pattern, attack_type in ATTACK_PATTERNS:
            if pattern.search(line):
                attacks_found.append((i, attack_type, line[:100]))
                break

    if attacks_found:
        attack_types = collections.Counter(t for _,t,_ in attacks_found)
        print(f"  ⚠  {len(attacks_found)} suspicious lines detected:")
        for atype, count in attack_types.most_common():
            print(f"    {atype:<20} {count} occurrences")
        print()
        print("[ATTACK DETAILS]  (first 5)")
        for lineno, atype, line in attacks_found[:5]:
            print(f"  Line {lineno}: [{atype}] {line}")
    else:
        print(f"  ✓  No attack patterns detected in {len(lines)} lines")

    # Syslog / auth.log
    if fmt in ("syslog","auth_log") or "failed" in log_text.lower():
        print()
        print("[AUTH EVENTS]")
        failures = [l for l in lines if re.search(r'failed|invalid|authentication failure|refused', l, re.I)]
        successes = [l for l in lines if re.search(r'accepted|success|logged in', l, re.I)]
        print(f"  Failed attempts:   {len(failures)}")
        print(f"  Successful logins: {len(successes)}")
        if failures:
            print("  [FAILURES (first 3)]")
            for f in failures[:3]: print(f"    {f[:120]}")

    print()
    print("[DONE] Log parse complete.")

if __name__ == "__main__":
    main()
