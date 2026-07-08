"""npm User / Package — Module 39. Usage: npm_user.py "username" or npm_user.py "pkg:package-name" """
import sys, json, urllib.request, urllib.error

def fetch(url):
    r = urllib.request.Request(url, headers={"User-Agent": "SentinelOSINT/1.0"})
    with urllib.request.urlopen(r, timeout=8) as resp:
        return json.load(resp)

def lookup_package(pkg: str):
    try:
        data = fetch(f"https://registry.npmjs.org/{pkg}")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print("[RESULT] Package not found")
        else:
            print(f"[ERROR] HTTP {e.code}")
        sys.exit(0)

    latest_ver = data.get("dist-tags", {}).get("latest", "")
    latest = data.get("versions", {}).get(latest_ver, {})
    print(f"[PACKAGE]       {data.get('name','?')}")
    print(f"[VERSION]       {latest_ver}")
    print(f"[DESCRIPTION]   {data.get('description','?')}")
    print(f"[LICENSE]       {latest.get('license','?')}")
    author = latest.get("author", {})
    if isinstance(author, dict):
        print(f"[AUTHOR]        {author.get('name','?')}  <{author.get('email','?')}>")
    else:
        print(f"[AUTHOR]        {author}")
    maintainers = data.get("maintainers", [])
    print(f"[MAINTAINERS]   {len(maintainers)}")
    for m in maintainers[:5]:
        print(f"  {m.get('name','?')}  <{m.get('email','?')}>")
    keywords = data.get("keywords", [])
    if keywords:
        print(f"[KEYWORDS]      {', '.join(keywords[:10])}")
    versions = list(data.get("versions", {}).keys())
    print(f"[VERSIONS]      {len(versions)} total  (latest: {latest_ver})")
    deps = latest.get("dependencies", {})
    print(f"[DEPENDENCIES]  {len(deps)}")
    for d, v in list(deps.items())[:8]:
        print(f"  {d}: {v}")
    repo = latest.get("repository", {})
    if isinstance(repo, dict):
        print(f"[REPO]          {repo.get('url','?')}")
    print(f"[NPM URL]       https://www.npmjs.com/package/{data.get('name','')}")

def lookup_user(username: str):
    try:
        results = fetch(f"https://registry.npmjs.org/-/v1/search?text=maintainer:{username}&size=10")
        total = results.get("total", 0)
        objects = results.get("objects", [])
        print(f"[NPM USER]      {username}")
        print(f"[PACKAGES]      {total} maintained packages")
        print()
        if objects:
            print("[RECENT PACKAGES]")
            for obj in objects:
                p = obj.get("package", {})
                print(f"  {p.get('name','?'):30s}  v{p.get('version','?'):10s}  {p.get('description','?')[:50]}")
        print(f"[PROFILE]  https://www.npmjs.com/~{username}")
    except Exception as e:
        print(f"[ERROR] {e}")

def main():
    print("[MODULE 039] NPM USER / PACKAGE")
    print("[SOURCE]     registry.npmjs.org — public API, no auth required")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No username or package supplied.")
        print("[USAGE] npm_user.py \"username\"  or  npm_user.py \"pkg:package-name\"")
        sys.exit(1)

    if raw.lower().startswith("pkg:"):
        print(f"[MODE]   Package lookup  →  {raw[4:]}")
        print()
        lookup_package(raw[4:])
    else:
        print(f"[MODE]   User lookup  →  {raw}")
        print()
        lookup_user(raw)

    print()
    print("[DONE] npm lookup complete.")

if __name__ == "__main__":
    main()
