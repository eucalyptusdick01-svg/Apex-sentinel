"""Reddit User — Module 31. Usage: reddit_user.py "username" """
import sys, json, urllib.request, urllib.error

def fetch(url):
    r = urllib.request.Request(url, headers={"User-Agent": "SentinelOSINT/1.0"})
    with urllib.request.urlopen(r, timeout=8) as resp:
        return json.load(resp)

def main():
    print("[MODULE 031] REDDIT USER")
    print("[SOURCE]     reddit.com public JSON API")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No username supplied.")
        sys.exit(1)

    username = raw.lstrip("u/").lstrip("@")
    print(f"[TARGET]  u/{username}")
    print()
    try:
        data = fetch(f"https://www.reddit.com/user/{username}/about.json")["data"]
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print("[RESULT] User not found (account deleted or never existed)")
        else:
            print(f"[ERROR] HTTP {e.code}")
        sys.exit(0)
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

    created = __import__("datetime").datetime.utcfromtimestamp(data.get("created_utc", 0)).strftime("%Y-%m-%d")
    print(f"[USERNAME]      u/{data.get('name','?')}")
    print(f"[ID]            t2_{data.get('id','?')}")
    print(f"[CREATED]       {created} UTC")
    print(f"[KARMA LINK]    {data.get('link_karma', 0):,}")
    print(f"[KARMA COMMENT] {data.get('comment_karma', 0):,}")
    print(f"[TOTAL KARMA]   {data.get('total_karma', 0):,}")
    print(f"[GOLD]          {data.get('is_gold', False)}")
    print(f"[VERIFIED]      {data.get('verified', False)}")
    print(f"[MODERATOR]     {data.get('is_mod', False)}")
    print(f"[EMPLOYEE]      {data.get('is_employee', False)}")
    print(f"[SUBREDDIT]     r/{data.get('subreddit', {}).get('display_name', 'N/A')}")
    desc = data.get("subreddit", {}).get("public_description", "")
    if desc:
        print(f"[BIO]           {desc[:200]}")
    icon = data.get("icon_img", "")
    if icon:
        print(f"[AVATAR]        {icon.split('?')[0]}")
    print()

    try:
        posts = fetch(f"https://www.reddit.com/user/{username}/submitted.json?limit=5")
        items = posts["data"]["children"]
        if items:
            print("[RECENT POSTS]")
            for p in items[:5]:
                d = p["data"]
                print(f"  r/{d.get('subreddit','?')}  |  {d.get('score',0):,} pts  |  {d.get('title','?')[:80]}")
    except Exception:
        pass

    print()
    print("[DONE] Reddit user lookup complete.")

if __name__ == "__main__":
    main()
