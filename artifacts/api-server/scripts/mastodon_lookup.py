"""Mastodon User — Module 35. Usage: mastodon_lookup.py "user@instance.social" or "username" (checks mastodon.social) """
import sys, json, urllib.request, urllib.error

def fetch(url):
    r = urllib.request.Request(url, headers={"User-Agent": "SentinelOSINT/1.0"})
    with urllib.request.urlopen(r, timeout=8) as resp:
        return json.load(resp)

def main():
    print("[MODULE 035] MASTODON USER")
    print("[SOURCE]     Mastodon REST API — public (no auth required for public accounts)")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip().lstrip("@")
    if not raw:
        print("[ERROR] No username supplied.")
        print("[USAGE] mastodon_lookup.py \"user@instance.social\" or \"username\" (defaults to mastodon.social)")
        sys.exit(1)

    if "@" in raw:
        parts = raw.split("@", 1)
        username = parts[0]
        instance = parts[1]
    else:
        username = raw
        instance = "mastodon.social"

    print(f"[TARGET]    @{username}@{instance}")
    print(f"[INSTANCE]  https://{instance}")
    print()

    try:
        data = fetch(f"https://{instance}/api/v1/accounts/lookup?acct={username}")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print("[RESULT] Account not found on this instance")
        else:
            print(f"[ERROR] HTTP {e.code}")
        sys.exit(0)
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

    print(f"[USERNAME]      @{data.get('username','?')}@{instance}")
    print(f"[DISPLAY NAME]  {data.get('display_name','?')}")
    print(f"[ID]            {data.get('id','?')}")
    print(f"[CREATED]       {data.get('created_at','?')[:10]}")
    print(f"[FOLLOWERS]     {data.get('followers_count', 0):,}")
    print(f"[FOLLOWING]     {data.get('following_count', 0):,}")
    print(f"[POSTS]         {data.get('statuses_count', 0):,}")
    print(f"[BOT]           {data.get('bot', False)}")
    print(f"[LOCKED]        {data.get('locked', False)}")
    print(f"[INDEXABLE]     {data.get('indexable', '?')}")

    note = data.get("note", "")
    if note:
        import re, html
        note_clean = re.sub(r'<[^>]+>', ' ', html.unescape(note)).strip()
        note_clean = ' '.join(note_clean.split())
        if note_clean:
            print(f"[BIO]           {note_clean[:300]}")

    fields = data.get("fields", [])
    if fields:
        print("[PROFILE FIELDS]")
        for f in fields:
            import re, html
            val = re.sub(r'<[^>]+>', '', html.unescape(f.get("value", ""))).strip()
            print(f"  {f.get('name','?'):20s}  {val[:80]}")

    print()
    print(f"[PROFILE URL]   {data.get('url','?')}")
    print(f"[AVATAR]        {data.get('avatar','?')}")
    print("[DONE] Mastodon user lookup complete.")

if __name__ == "__main__":
    main()
