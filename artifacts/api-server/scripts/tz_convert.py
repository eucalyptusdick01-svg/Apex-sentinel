"""
Timezone Converter — Module 204
Converts a time between timezones, or shows current time in multiple zones.
Usage:
  tz_convert.py "now"                          → current time in common zones
  tz_convert.py "now:US/Eastern"               → current time in one zone
  tz_convert.py "2024-06-15 14:30:US/Eastern:UTC"
  tz_convert.py "2024-06-15T09:00:00:America/New_York:Europe/London"
  tz_convert.py "list"                         → common zone names
  tz_convert.py "1718445000:UTC"               → unix timestamp → zone
"""
import sys
from datetime import datetime
from zoneinfo import ZoneInfo, available_timezones

COMMON_ZONES = [
    "UTC",
    "US/Eastern", "US/Central", "US/Mountain", "US/Pacific", "US/Alaska", "US/Hawaii",
    "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
    "America/Toronto", "America/Vancouver", "America/Mexico_City",
    "America/Sao_Paulo", "America/Buenos_Aires",
    "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
    "Europe/Istanbul", "Europe/Amsterdam", "Europe/Madrid", "Europe/Rome",
    "Europe/Zurich", "Europe/Warsaw", "Europe/Kiev",
    "Asia/Dubai", "Asia/Kolkata", "Asia/Shanghai", "Asia/Tokyo",
    "Asia/Singapore", "Asia/Seoul", "Asia/Bangkok", "Asia/Karachi",
    "Asia/Dhaka", "Asia/Jakarta", "Asia/Taipei", "Asia/Hong_Kong",
    "Australia/Sydney", "Australia/Melbourne", "Australia/Brisbane", "Australia/Perth",
    "Pacific/Auckland", "Pacific/Auckland", "Africa/Cairo", "Africa/Lagos",
    "Africa/Johannesburg", "Africa/Nairobi",
]

def parse_datetime(dt_str: str, tz: ZoneInfo) -> datetime:
    fmts = [
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M",
        "%Y-%m-%d %H:%M",
        "%Y-%m-%d",
    ]
    for fmt in fmts:
        try:
            return datetime.strptime(dt_str, fmt).replace(tzinfo=tz)
        except ValueError:
            pass
    raise ValueError(f"Cannot parse datetime: {dt_str!r}")

def abbr(tz: ZoneInfo, dt: datetime) -> str:
    return dt.strftime("%Z")

def main() -> None:
    print("[MODULE 204] TIMEZONE CONVERTER")
    print("[SOURCE]     Python zoneinfo (IANA tz database)")
    print()

    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "now").strip()

    if raw.lower() == "list":
        print("[COMMON TIMEZONES]")
        for z in COMMON_ZONES:
            try:
                zi = ZoneInfo(z)
                now = datetime.now(zi)
                offset = now.strftime("%z")
                print(f"  {z:35s}  UTC{offset[:3]}:{offset[3:]}  (now: {now.strftime('%H:%M')})")
            except Exception:
                print(f"  {z}  (error)")
        print()
        print(f"[INFO] {len(available_timezones())} total IANA timezones available")
        print("[DONE] Timezone list complete.")
        return

    if raw.lower().startswith("now"):
        target_tz = None
        if ":" in raw:
            tz_name = raw.split(":", 1)[1]
            try:
                target_tz = ZoneInfo(tz_name)
            except Exception:
                print(f"[ERROR] Unknown timezone: {tz_name}")
                sys.exit(1)

        utc_now = datetime.now(ZoneInfo("UTC"))
        print(f"[UTC NOW]  {utc_now.strftime('%Y-%m-%d %H:%M:%S %Z')}")
        print(f"[UNIX]     {int(utc_now.timestamp())}")
        print()

        if target_tz:
            local = utc_now.astimezone(target_tz)
            offset = local.strftime("%z")
            print(f"[{tz_name}]")
            print(f"  {local.strftime('%Y-%m-%d %H:%M:%S')}  (UTC{offset[:3]}:{offset[3:]})")
        else:
            print("[CURRENT TIME IN COMMON ZONES]")
            for z in COMMON_ZONES[:20]:
                try:
                    zi = ZoneInfo(z)
                    local = utc_now.astimezone(zi)
                    offset = local.strftime("%z")
                    print(f"  {z:35s}  {local.strftime('%Y-%m-%d %H:%M')}  UTC{offset[:3]}:{offset[3:]}")
                except Exception:
                    pass

        print()
        print("[DONE] Timezone conversion complete.")
        return

    if raw.isdigit() or (raw.replace(".", "").isdigit() and ":" not in raw):
        ts = float(raw)
        utc_dt = datetime.fromtimestamp(ts, ZoneInfo("UTC"))
        print(f"[UNIX TIMESTAMP]  {ts}")
        print(f"[UTC]             {utc_dt.strftime('%Y-%m-%d %H:%M:%S %Z')}")
        print()
        for z in COMMON_ZONES[:10]:
            try:
                zi = ZoneInfo(z)
                local = utc_dt.astimezone(zi)
                offset = local.strftime("%z")
                print(f"  {z:35s}  {local.strftime('%Y-%m-%d %H:%M:%S')}  UTC{offset[:3]}:{offset[3:]}")
            except Exception:
                pass
        print()
        print("[DONE] Timestamp conversion complete.")
        return

    parts = raw.rsplit(":", 1)
    if len(parts) == 2:
        dt_and_from, to_zone = parts
        dfparts = dt_and_from.rsplit(":", 1)
        if len(dfparts) == 2:
            dt_str, from_zone = dfparts
        else:
            dt_str = dt_and_from
            from_zone = "UTC"
    else:
        print("[ERROR] Format: 'DATETIME:FROM_ZONE:TO_ZONE'  or  'now:ZONE'")
        print("        Example: '2024-06-15 14:30:US/Eastern:UTC'")
        sys.exit(1)

    try:
        from_zi = ZoneInfo(from_zone)
    except Exception:
        print(f"[ERROR] Unknown source timezone: {from_zone}")
        sys.exit(1)
    try:
        to_zi = ZoneInfo(to_zone)
    except Exception:
        print(f"[ERROR] Unknown target timezone: {to_zone}")
        sys.exit(1)

    try:
        source_dt = parse_datetime(dt_str, from_zi)
    except ValueError as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

    target_dt = source_dt.astimezone(to_zi)

    from_off = source_dt.strftime("%z")
    to_off   = target_dt.strftime("%z")

    print(f"[SOURCE]  {source_dt.strftime('%Y-%m-%d %H:%M:%S')}  {from_zone}  (UTC{from_off[:3]}:{from_off[3:]})")
    print(f"[TARGET]  {target_dt.strftime('%Y-%m-%d %H:%M:%S')}  {to_zone}  (UTC{to_off[:3]}:{to_off[3:]})")
    print()

    diff_h = (source_dt.utcoffset() - target_dt.utcoffset()).total_seconds() / 3600
    print(f"[OFFSET DIFF]  {from_zone} is {'ahead of' if diff_h > 0 else 'behind'} {to_zone} by {abs(diff_h):.1f} hours")
    print(f"[UNIX]         {int(source_dt.timestamp())}")
    print()
    print("[DONE] Timezone conversion complete.")

if __name__ == "__main__":
    main()
