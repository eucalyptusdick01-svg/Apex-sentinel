"""Discord Snowflake Decoder — Module 37. Usage: discord_id.py "123456789012345678" """
import sys
from datetime import datetime, timezone

DISCORD_EPOCH = 1420070400000

def decode_snowflake(snowflake: int) -> dict:
    timestamp_ms = (snowflake >> 22) + DISCORD_EPOCH
    worker_id    = (snowflake & 0x3E0000) >> 17
    process_id   = (snowflake & 0x1F000) >> 12
    increment    = snowflake & 0xFFF
    timestamp    = datetime.fromtimestamp(timestamp_ms / 1000, tz=timezone.utc)
    return {
        "snowflake":   snowflake,
        "timestamp_ms": timestamp_ms,
        "timestamp":   timestamp,
        "worker_id":   worker_id,
        "process_id":  process_id,
        "increment":   increment,
    }

def main():
    print("[MODULE 037] DISCORD ID / SNOWFLAKE DECODER")
    print("[SOURCE]     Discord snowflake specification — no network required")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No snowflake ID supplied.")
        print("[USAGE] discord_id.py \"123456789012345678\"")
        sys.exit(1)

    ids = raw.replace(",", " ").split()
    for sid in ids:
        sid = sid.strip()
        if not sid.isdigit():
            print(f"[SKIP] {sid!r} — not a valid snowflake (must be numeric)")
            continue
        sf = int(sid)
        if sf < 0 or sf > (1 << 63):
            print(f"[SKIP] {sid} — out of range")
            continue

        d = decode_snowflake(sf)
        ts = d["timestamp"]
        print(f"[SNOWFLAKE]    {sf}")
        print(f"[BINARY]       {sf:064b}")
        print(f"[HEX]          0x{sf:016X}")
        print()
        print(f"[CREATED UTC]  {ts.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]} UTC")
        print(f"[UNIX MS]      {d['timestamp_ms']}")
        print(f"[UNIX S]       {d['timestamp_ms'] // 1000}")
        print(f"[WORKER ID]    {d['worker_id']}")
        print(f"[PROCESS ID]   {d['process_id']}")
        print(f"[INCREMENT]    {d['increment']}")
        print()
        print(f"[DIRECT LINKS]")
        print(f"  User invite lookup:  https://discord.com/users/{sf}")
        print(f"  API (bot token req): https://discord.com/api/v10/users/{sf}")
        print()

    print("[DONE] Discord snowflake decode complete.")

if __name__ == "__main__":
    main()
