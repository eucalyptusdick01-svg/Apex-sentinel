"""HackerNews User — Module 32. Usage: hn_user.py "username" """
import sys, json, urllib.request, urllib.error

BASE = "https://hacker-news.firebaseio.com/v0"

def fetch(url):
    with urllib.request.urlopen(url, timeout=8) as r:
        return json.load(r)

def main():
    print("[MODULE 032] HACKER NEWS USER")
    print("[SOURCE]     hacker-news.firebaseio.com — official Firebase API")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No username supplied.")
        sys.exit(1)

    username = raw.lstrip("@")
    print(f"[TARGET]  {username}")
    print()

    try:
        data = fetch(f"{BASE}/user/{username}.json")
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

    if not data:
        print("[RESULT] User not found")
        sys.exit(0)

    created = __import__("datetime").datetime.utcfromtimestamp(data.get("created", 0)).strftime("%Y-%m-%d")
    print(f"[USERNAME]   {data.get('id','?')}")
    print(f"[CREATED]    {created} UTC")
    print(f"[KARMA]      {data.get('karma', 0):,}")
    about = data.get("about", "")
    if about:
        import html, re
        about_clean = re.sub(r'<[^>]+>', ' ', html.unescape(about)).strip()
        print(f"[ABOUT]      {about_clean[:300]}")

    submitted = data.get("submitted", [])
    print(f"[SUBMISSIONS] {len(submitted):,} total")

    if submitted:
        print()
        print("[RECENT 5 SUBMISSIONS]")
        for item_id in submitted[:5]:
            try:
                item = fetch(f"{BASE}/item/{item_id}.json")
                if not item:
                    continue
                itype = item.get("type", "?")
                score = item.get("score", 0)
                title = item.get("title") or item.get("text", "")[:60] or "?"
                url = item.get("url", "")
                print(f"  [{itype:8s}] score={score:4d}  {title[:70]}")
                if url:
                    print(f"            {url[:80]}")
            except Exception:
                pass

    print()
    print(f"[PROFILE]    https://news.ycombinator.com/user?id={username}")
    print("[DONE] HackerNews user lookup complete.")

if __name__ == "__main__":
    main()
