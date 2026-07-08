"""GitLab User — Module 34. Usage: gitlab_user.py "username" """
import sys, json, urllib.request, urllib.error

def fetch(url):
    r = urllib.request.Request(url, headers={"User-Agent": "SentinelOSINT/1.0"})
    with urllib.request.urlopen(r, timeout=8) as resp:
        return json.load(resp)

def main():
    print("[MODULE 034] GITLAB USER")
    print("[SOURCE]     gitlab.com public REST API v4 — no auth required for public data")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No username supplied.")
        sys.exit(1)

    username = raw.lstrip("@")
    print(f"[TARGET]  {username}")
    print()

    try:
        results = fetch(f"https://gitlab.com/api/v4/users?username={username}")
        if not results:
            print("[RESULT] User not found")
            sys.exit(0)
        u = results[0]
    except urllib.error.HTTPError as e:
        print(f"[ERROR] HTTP {e.code}")
        sys.exit(1)
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

    uid = u.get("id")
    print(f"[USERNAME]   {u.get('username','?')}")
    print(f"[NAME]       {u.get('name','?')}")
    print(f"[ID]         {uid}")
    print(f"[STATE]      {u.get('state','?')}")
    print(f"[CREATED]    {u.get('created_at','?')[:10]}")
    if u.get("bio"):
        print(f"[BIO]        {u['bio'][:200]}")
    if u.get("location"):
        print(f"[LOCATION]   {u['location']}")
    if u.get("organization"):
        print(f"[ORG]        {u['organization']}")
    if u.get("website_url"):
        print(f"[WEBSITE]    {u['website_url']}")
    if u.get("twitter"):
        print(f"[TWITTER]    {u['twitter']}")
    if u.get("linkedin"):
        print(f"[LINKEDIN]   {u['linkedin']}")
    print(f"[AVATAR]     {u.get('avatar_url','N/A')}")
    print()

    if uid:
        try:
            projects = fetch(f"https://gitlab.com/api/v4/users/{uid}/projects?order_by=last_activity_at&per_page=5")
            if projects:
                print(f"[PUBLIC PROJECTS] {len(projects)} shown (most recent)")
                for p in projects:
                    stars = p.get("star_count", 0)
                    forks = p.get("forks_count", 0)
                    lang  = p.get("language") or "?"
                    print(f"  ★{stars:4d}  ⑂{forks:3d}  [{lang:15s}]  {p.get('name_with_namespace','?')}")
                    desc = p.get("description") or ""
                    if desc:
                        print(f"           {desc[:80]}")
        except Exception:
            pass

    print()
    print(f"[PROFILE]  https://gitlab.com/{username}")
    print("[DONE] GitLab user lookup complete.")

if __name__ == "__main__":
    main()
