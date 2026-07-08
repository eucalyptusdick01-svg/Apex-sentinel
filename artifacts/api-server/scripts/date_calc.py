"""Date Calc — Module 220. Usage: date_calc.py "2024-06-15" or date_calc.py "diff:2020-01-01:2024-06-15" or date_calc.py "add:90:2024-01-01" """
import sys, re
from datetime import datetime, timedelta, timezone, date

WEEKDAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
MONTHS   = ["","January","February","March","April","May","June",
            "July","August","September","October","November","December"]

DATE_FORMATS = ["%Y-%m-%d","%d/%m/%Y","%m/%d/%Y","%d-%m-%Y",
                "%B %d %Y","%b %d %Y","%d %B %Y","%Y%m%d"]

def parse_date(s: str) -> date | None:
    s = s.strip()
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(s, fmt).date()
        except Exception:
            pass
    # Try unix timestamp
    if s.isdigit():
        try:
            return datetime.utcfromtimestamp(int(s)).date()
        except Exception:
            pass
    return None

def is_leap(year: int) -> bool:
    return (year % 4 == 0 and year % 100 != 0) or year % 400 == 0

def days_in_month(y: int, m: int) -> int:
    import calendar
    return calendar.monthrange(y, m)[1]

def date_info(d: date) -> None:
    now = date.today()
    ts  = int(datetime(d.year, d.month, d.day, tzinfo=timezone.utc).timestamp())
    day_of_year = d.timetuple().tm_yday
    week_of_year = d.isocalendar()[1]
    iso_year, iso_week, iso_day = d.isocalendar()
    diff_from_now = (d - now).days

    print(f"[DATE]         {d.strftime('%Y-%m-%d')}")
    print(f"[DAY]          {WEEKDAYS[d.weekday()]}")
    print(f"[LONG FORMAT]  {MONTHS[d.month]} {d.day}, {d.year}")
    print(f"[ISO 8601]     {d.isoformat()}")
    print(f"[UNIX TS]      {ts}")
    print(f"[DAY OF YEAR]  {day_of_year} / {366 if is_leap(d.year) else 365}")
    print(f"[WEEK NUMBER]  {week_of_year} (ISO week {iso_week}, year {iso_year})")
    print(f"[QUARTER]      Q{(d.month-1)//3+1} of {d.year}")
    print(f"[LEAP YEAR]    {'Yes' if is_leap(d.year) else 'No'}")
    print(f"[DAYS IN MONTH] {days_in_month(d.year, d.month)}")
    if d >= now:
        print(f"[FROM TODAY]   {diff_from_now} days in the future")
    elif diff_from_now == 0:
        print(f"[FROM TODAY]   Today!")
    else:
        print(f"[FROM TODAY]   {abs(diff_from_now)} days ago")
    print()
    print(f"[WORKDAYS THIS MONTH]  ", end="")
    from calendar import monthcalendar
    weeks = monthcalendar(d.year, d.month)
    workdays = sum(1 for w in weeks for wd in w[:5] if wd > 0)
    print(workdays)

def main():
    print("[MODULE 220] DATE CALCULATOR")
    print("[SOURCE]     Python datetime stdlib — date math, business days, format conversion")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  date_calc.py \"2024-06-15\"              (date info)")
        print("         date_calc.py \"diff:2020-01-01:2024-06-15\"  (date difference)")
        print("         date_calc.py \"add:90:2024-01-01\"       (add N days)")
        print("         date_calc.py \"sub:30:2024-06-01\"       (subtract N days)")
        print("         date_calc.py \"today\"                   (today's info)")
        sys.exit(0)

    now = date.today()

    if raw.lower() == "today" or raw.lower() == "now":
        print(f"[TODAY]  {now.isoformat()}")
        print()
        date_info(now)

    elif raw.lower().startswith("diff:"):
        parts = raw[5:].split(":")
        if len(parts) < 2:
            print("[ERROR] diff format: diff:DATE1:DATE2")
            sys.exit(1)
        d1 = parse_date(parts[0])
        d2 = parse_date(parts[1])
        if not d1 or not d2:
            print(f"[ERROR] Could not parse dates: {parts[0]!r} and {parts[1]!r}")
            sys.exit(1)
        delta = d2 - d1
        days = abs(delta.days)
        sign = "after" if delta.days >= 0 else "before"
        years  = days // 365
        months = (days % 365) // 30
        rem    = days % 30
        print(f"[DATE 1]   {d1.isoformat()}  ({WEEKDAYS[d1.weekday()]})")
        print(f"[DATE 2]   {d2.isoformat()}  ({WEEKDAYS[d2.weekday()]})")
        print()
        print(f"[DIFFERENCE]")
        print(f"  Days:    {days} ({sign})")
        print(f"  Approx:  {years}y {months}m {rem}d")
        print(f"  Weeks:   {days // 7} weeks {days % 7} days")
        print(f"  Hours:   {days * 24:,}")
        print(f"  Minutes: {days * 1440:,}")

        # Business days (Mon-Fri)
        start, end = (d1, d2) if d1 <= d2 else (d2, d1)
        bdays = sum(1 for i in range(days+1)
                    if (start + timedelta(days=i)).weekday() < 5)
        print(f"  Business days: {bdays}")

    elif raw.lower().startswith("add:") or raw.lower().startswith("sub:"):
        op = raw[:3].lower()
        parts = raw[4:].split(":")
        if len(parts) < 2:
            print(f"[ERROR] {op} format: add:DAYS:DATE  or  sub:DAYS:DATE")
            sys.exit(1)
        try:
            n = int(parts[0])
        except ValueError:
            print(f"[ERROR] Not a number: {parts[0]!r}")
            sys.exit(1)
        base = parse_date(parts[1])
        if not base:
            print(f"[ERROR] Could not parse date: {parts[1]!r}")
            sys.exit(1)
        result = base + timedelta(days=n if op == "add" else -n)
        print(f"[BASE DATE]    {base.isoformat()}  ({WEEKDAYS[base.weekday()]})")
        print(f"[OPERATION]    {'+' if op=='add' else '-'}{n} days")
        print(f"[RESULT DATE]  {result.isoformat()}  ({WEEKDAYS[result.weekday()]})")
        print()
        date_info(result)

    else:
        d = parse_date(raw)
        if not d:
            print(f"[ERROR] Could not parse date: {raw!r}")
            print("  Supported formats: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, Unix timestamp")
            sys.exit(1)
        date_info(d)

    print()
    print("[DONE] Date calculation complete.")

if __name__ == "__main__":
    main()
