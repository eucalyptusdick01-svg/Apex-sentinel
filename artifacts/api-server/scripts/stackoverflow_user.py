"""Stack Overflow User — Module 42. Usage: stackoverflow_user.py "username" or stackoverflow_user.py "id:12345" """
import sys, json, urllib.request, urllib.error, urllib.parse

def fetch(url):
    r = urllib.request.Request(url, headers={"User-Agent": "SentinelOSINT/1.0", "Accept-Encoding": "gzip"})
    with urllib.request.urlopen(r, timeout=8) as resp:
        import gzip, io
        raw = resp.read()
        try:
            return json.loads(gzip.decompress(raw))
        except Exception:
            return json.loads(raw)

def main():
    print("[MODULE 042] STACK OVERFLOW / STACK EXCHANGE")
    print("[SOURCE]     api.stackexchange.com — free tier, no API key required")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No username or user ID supplied.")
        print("[USAGE] stackoverflow_user.py \"username\"  or  stackoverflow_user.py \"id:12345\"")
        sys.exit(1)

    site = "stackoverflow"
    if raw.lower().startswith("id:"):
        user_id = raw[3:].strip()
        print(f"[MODE]   User ID lookup  →  {user_id}")
        print()
        try:
            data = fetch(f"https://api.stackexchange.com/2.3/users/{user_id}?site={site}&filter=!-nt6H_7HUhng")
            items = data.get("items", [])
        except Exception as e:
            print(f"[ERROR] {e}")
            sys.exit(1)
    else:
        print(f"[MODE]   Username search  →  {raw}")
        print()
        try:
            enc = urllib.parse.quote(raw)
            data = fetch(f"https://api.stackexchange.com/2.3/users?inname={enc}&site={site}&pagesize=5&order=desc&sort=reputation")
            items = data.get("items", [])
        except Exception as e:
            print(f"[ERROR] {e}")
            sys.exit(1)

    if not items:
        print("[RESULT] No users found")
        sys.exit(0)

    for u in items[:3]:
        uid = u.get("user_id")
        print(f"[DISPLAY NAME]   {u.get('display_name','?')}")
        print(f"[USER ID]        {uid}")
        print(f"[REPUTATION]     {u.get('reputation', 0):,}")
        print(f"[BADGES]         Gold: {u.get('badge_counts',{}).get('gold',0)}  Silver: {u.get('badge_counts',{}).get('silver',0)}  Bronze: {u.get('badge_counts',{}).get('bronze',0)}")
        print(f"[MEMBER SINCE]   {__import__('datetime').datetime.utcfromtimestamp(u.get('creation_date',0)).strftime('%Y-%m-%d')}")
        print(f"[LAST SEEN]      {__import__('datetime').datetime.utcfromtimestamp(u.get('last_access_date',0)).strftime('%Y-%m-%d')}")
        print(f"[LAST MODIFIED]  {__import__('datetime').datetime.utcfromtimestamp(u.get('last_modified_date',0)).strftime('%Y-%m-%d')}")
        if u.get("location"):
            print(f"[LOCATION]       {u['location']}")
        if u.get("website_url"):
            print(f"[WEBSITE]        {u['website_url']}")
        print(f"[QUESTION COUNT] {u.get('question_count', 0)}")
        print(f"[ANSWER COUNT]   {u.get('answer_count', 0)}")
        print(f"[VIEW COUNT]     {u.get('view_count', 0):,}")
        print(f"[ACCEPT RATE]    {u.get('accept_rate', 'N/A')}%")
        if u.get("about_me"):
            import re, html as _html
            bio = re.sub(r'<[^>]+>', ' ', _html.unescape(u['about_me'])).strip()
            bio = ' '.join(bio.split())[:300]
            if bio:
                print(f"[ABOUT]          {bio}")
        print()
        if uid:
            try:
                tags_data = fetch(f"https://api.stackexchange.com/2.3/users/{uid}/tags?site={site}&pagesize=10&order=desc&sort=activity")
                tags = [t.get("name","") for t in tags_data.get("items", [])]
                if tags:
                    print(f"[TOP TAGS]  {', '.join(tags)}")
            except Exception:
                pass
        print(f"[PROFILE]  https://stackoverflow.com/users/{uid}")
        print()

    print("[DONE] Stack Overflow lookup complete.")

if __name__ == "__main__":
    main()
