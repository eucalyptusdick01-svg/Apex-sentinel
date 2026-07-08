"""Docker Hub — Module 40. Usage: docker_hub.py "username" or docker_hub.py "image:nginx" """
import sys, json, urllib.request, urllib.error

def fetch(url):
    r = urllib.request.Request(url, headers={"User-Agent": "SentinelOSINT/1.0"})
    with urllib.request.urlopen(r, timeout=8) as resp:
        return json.load(resp)

def lookup_user(username: str):
    try:
        data = fetch(f"https://hub.docker.com/v2/users/{username}/")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print("[RESULT] User not found")
        else:
            print(f"[ERROR] HTTP {e.code}")
        sys.exit(0)

    print(f"[USERNAME]   {data.get('username','?')}")
    print(f"[NAME]       {data.get('full_name','?')}")
    print(f"[COMPANY]    {data.get('company','?')}")
    print(f"[LOCATION]   {data.get('location','?')}")
    if data.get("bio"):
        print(f"[BIO]        {data['bio'][:200]}")
    print(f"[JOINED]     {data.get('date_joined','?')[:10]}")
    print(f"[TYPE]       {data.get('type','?')}")
    print()

    try:
        repos = fetch(f"https://hub.docker.com/v2/repositories/{username}/?page_size=10&ordering=last_updated")
        total = repos.get("count", 0)
        results = repos.get("results", [])
        print(f"[REPOSITORIES]  {total} public")
        for r in results:
            pulls = r.get("pull_count", 0)
            stars = r.get("star_count", 0)
            print(f"  ↓{pulls:8,}  ★{stars:4,}  {r.get('name','?'):30s}  {r.get('description','?')[:50]}")
    except Exception:
        pass

    print()
    print(f"[PROFILE]  https://hub.docker.com/u/{username}")

def lookup_image(image: str):
    namespace = "library"
    name = image
    if "/" in image:
        namespace, name = image.split("/", 1)

    try:
        data = fetch(f"https://hub.docker.com/v2/repositories/{namespace}/{name}/")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print("[RESULT] Image not found")
        else:
            print(f"[ERROR] HTTP {e.code}")
        sys.exit(0)

    print(f"[IMAGE]         {namespace}/{name}")
    print(f"[FULL NAME]     {data.get('full_size','?')}")
    print(f"[DESCRIPTION]   {data.get('description','?')[:200]}")
    print(f"[STARS]         {data.get('star_count', 0):,}")
    print(f"[PULLS]         {data.get('pull_count', 0):,}")
    print(f"[LAST UPDATED]  {data.get('last_updated','?')[:10]}")
    print(f"[IS AUTOMATED]  {data.get('is_automated', False)}")
    print(f"[IS OFFICIAL]   {data.get('is_official', False)}")
    print(f"[AFFILIATION]   {data.get('affiliation','?')}")
    print()
    try:
        tags = fetch(f"https://hub.docker.com/v2/repositories/{namespace}/{name}/tags/?page_size=10&ordering=last_updated")
        tag_list = tags.get("results", [])
        print(f"[TAGS]  {tags.get('count',0)} total, showing {len(tag_list)} most recent")
        for t in tag_list:
            size = sum(img.get("size",0) for img in t.get("images",[])) // 1024 // 1024
            print(f"  {t.get('name','?'):20s}  {size} MB  {t.get('last_updated','?')[:10]}")
    except Exception:
        pass
    print()
    print(f"[URL]  https://hub.docker.com/r/{namespace}/{name}")

def main():
    print("[MODULE 040] DOCKER HUB")
    print("[SOURCE]     hub.docker.com v2 API — public, no auth required")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No username or image supplied.")
        print("[USAGE] docker_hub.py \"username\"   or   docker_hub.py \"image:nginx\"")
        sys.exit(1)

    if raw.lower().startswith("image:"):
        print(f"[MODE]  Image lookup  →  {raw[6:]}")
        print()
        lookup_image(raw[6:])
    else:
        print(f"[MODE]  User lookup  →  {raw}")
        print()
        lookup_user(raw)

    print()
    print("[DONE] Docker Hub lookup complete.")

if __name__ == "__main__":
    main()
