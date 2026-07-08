"""
Cron Expression Parser — Module 203
Parses and explains cron expressions, shows next N fire times.
Usage:
  cron_parser.py "*/5 * * * *"
  cron_parser.py "0 9 * * MON-FRI"
  cron_parser.py "30 2 1 * *"
  cron_parser.py "next:10:0 8 * * *"   (next 10 fire times)
"""
import sys
import re
from datetime import datetime, timedelta

FIELDS = ["minute", "hour", "day", "month", "weekday"]

MONTH_NAMES = {"JAN":1,"FEB":2,"MAR":3,"APR":4,"MAY":5,"JUN":6,
               "JUL":7,"AUG":8,"SEP":9,"OCT":10,"NOV":11,"DEC":12}
DOW_NAMES   = {"SUN":0,"MON":1,"TUE":2,"WED":3,"THU":4,"FRI":5,"SAT":6}

RANGES = {"minute":(0,59),"hour":(0,23),"day":(1,31),"month":(1,12),"weekday":(0,6)}

PRESETS = {
    "@yearly":  "0 0 1 1 *",
    "@annually":"0 0 1 1 *",
    "@monthly": "0 0 1 * *",
    "@weekly":  "0 0 * * 0",
    "@daily":   "0 0 * * *",
    "@midnight":"0 0 * * *",
    "@hourly":  "0 * * * *",
}

def resolve_names(token: str, mapping: dict) -> str:
    for name, num in mapping.items():
        token = re.sub(r'\b' + name + r'\b', str(num), token, flags=re.IGNORECASE)
    return token

def expand_field(token: str, field: str) -> list:
    lo, hi = RANGES[field]
    mapping = MONTH_NAMES if field == "month" else DOW_NAMES if field == "weekday" else {}
    token = resolve_names(token, mapping)

    if token == "*":
        return list(range(lo, hi + 1))

    result = set()
    for part in token.split(","):
        if "/" in part:
            range_part, step_str = part.rsplit("/", 1)
            step = int(step_str)
            if range_part == "*":
                start, end = lo, hi
            elif "-" in range_part:
                s, e = range_part.split("-")
                start, end = int(s), int(e)
            else:
                start, end = int(range_part), hi
            for v in range(start, end + 1, step):
                result.add(v)
        elif "-" in part:
            s, e = part.split("-")
            for v in range(int(s), int(e) + 1):
                result.add(v)
        else:
            result.add(int(part))
    return sorted(result)

def describe_field(token: str, field: str, values: list) -> str:
    lo, hi = RANGES[field]
    if token == "*":
        return f"every {field}"
    if len(values) == 1:
        return f"{field} = {values[0]}"
    if "/" in token and "-" not in token.split("/")[0] and token.split("/")[0] == "*":
        step = token.split("/")[1]
        return f"every {step} {field}s"
    if len(values) == hi - lo + 1:
        return f"every {field}"
    if len(values) <= 5:
        return f"{field}s {', '.join(map(str, values))}"
    return f"{len(values)} {field} values"

def next_fires(fields: dict, n: int = 5, start: datetime | None = None) -> list:
    now = start or datetime.now().replace(second=0, microsecond=0) + timedelta(minutes=1)
    results = []
    current = now
    limit = now + timedelta(days=400)

    while len(results) < n and current < limit:
        if current.month not in fields["month"]:
            current = current.replace(day=1, hour=0, minute=0) + timedelta(days=32)
            current = current.replace(day=1)
            continue
        if current.day not in fields["day"]:
            current = current.replace(hour=0, minute=0) + timedelta(days=1)
            continue
        dow = current.weekday()
        dow_cron = (dow + 1) % 7
        if dow_cron not in fields["weekday"]:
            current = current.replace(hour=0, minute=0) + timedelta(days=1)
            continue
        if current.hour not in fields["hour"]:
            current = current.replace(minute=0) + timedelta(hours=1)
            continue
        if current.minute not in fields["minute"]:
            current += timedelta(minutes=1)
            continue
        results.append(current)
        current += timedelta(minutes=1)

    return results

def main() -> None:
    print("[MODULE 203] CRON PARSER")
    print("[SOURCE]     Cron expression parser — no external deps")
    print()

    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE] cron_parser.py \"*/5 * * * *\"")
        print("        cron_parser.py \"0 9 * * MON-FRI\"")
        print("        cron_parser.py \"next:10:0 8 * * *\"")
        sys.exit(1)

    n_next = 5
    if raw.lower().startswith("next:"):
        parts = raw[5:].split(":", 1)
        try:
            n_next = int(parts[0])
            raw = parts[1]
        except Exception:
            raw = raw[5:]

    expr = PRESETS.get(raw.lower(), raw)
    if raw.lower() in PRESETS:
        print(f"[PRESET]  {raw}  →  {expr}")
        print()

    tokens = expr.strip().split()
    if len(tokens) not in (5, 6):
        print(f"[ERROR] Expected 5 fields (min hr day mon dow), got {len(tokens)}")
        sys.exit(1)

    if len(tokens) == 6:
        tokens = tokens[1:]

    print(f"[EXPRESSION]  {expr}")
    print()

    fields: dict = {}
    for field, token in zip(FIELDS, tokens):
        try:
            values = expand_field(token, field)
            fields[field] = values
            desc = describe_field(token, field, values)
            print(f"  {field.upper():8s}  [{token:15s}]  {desc}")
        except Exception as e:
            print(f"  {field.upper():8s}  [{token:15s}]  ERROR: {e}")
            sys.exit(1)

    print()
    fires = next_fires(fields, n=n_next)
    print(f"[NEXT {n_next} FIRE TIMES]")
    if fires:
        for dt in fires:
            print(f"  {dt.strftime('%Y-%m-%d %H:%M')}  ({dt.strftime('%A')})")
    else:
        print("  [WARN] Could not compute — check expression validity")

    print()
    print("[DONE] Cron expression parsed.")

if __name__ == "__main__":
    main()
