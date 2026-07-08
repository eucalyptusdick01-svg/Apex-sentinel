"""DEV.TO User — Module 36. Usage: devto_user.py "username" """
import sys, json, urllib.request, urllib.error

def fetch(url):
    r = urllib.request.Request(url, headers={"User-Agent": "SentinelOSINT/1.0"})
    with urllib.request.urlopen(r, timeout=8) as resp:
        return json.load(resp)

def main():
    print("[MODULE 036] DEV.TO USER")
    print("[SOURCE]     dev.to public API — no auth required")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip().lstrip("@")
    if not raw:
        print("[ERROR] No username supplied.")
        sys.exit(1)

    username = raw
    print(f"[TARGET]  {username}")
    print()

    try:
        data = fetch(f"https://dev.to/api/users/by_username?url={username}")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print("[RESULT] User not found")
        else:
            print(f"[ERROR] HTTP {e.code}")
        sys.exit(0)
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

    uid = data.get("id")
    print(f"[NAME]          {data.get('name','?')}")
    print(f"[USERNAME]      {data.get('username','?')}")
    print(f"[ID]            {uid}")
    print(f"[JOINED]        {data.get('joined_at','?')[:10]}")
    if data.get("summary"):
        print(f"[BIO]           {data['summary'][:200]}")
    if data.get("location"):
        print(f"[LOCATION]      {data['location']}")
    if data.get("github_username"):
        print(f"[GITHUB]        {data['github_username']}")
    if data.get("twitter_username"):
        print(f"[TWITTER]       {data['twitter_username']}")
    if data.get("website_url"):
        print(f"[WEBSITE]       {data['website_url']}")
    print()

    if uid:
        try:
            articles = fetch(f"https://dev.to/api/articles?username={username}&per_page=5")
            if articles:
                print(f"[RECENT ARTICLES] {len(articles)} shown")
                for a in articles:
                    print(f"  ♡{a.get('positive_reactions_count',0):4d}  💬{a.get('comments_count',0):3d}  {a.get('title','?')[:70]}")
                    tags = a.get("tag_list", [])
                    if tags:
                        print(f"         tags: {', '.join(tags[:5])}")
        except Exception:
            pass

    print()
    print(f"[PROFILE]  https://dev.to/{username}")
    print("[DONE] dev.to user lookup complete.")

if __name__ == "__main__":
    main()
