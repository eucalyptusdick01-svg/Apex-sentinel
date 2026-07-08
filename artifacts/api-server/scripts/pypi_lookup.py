"""PyPI Lookup — Module 38. Usage: pypi_lookup.py "package_name" or pypi_lookup.py "user:username" """
import sys, json, urllib.request, urllib.error

def fetch(url):
    r = urllib.request.Request(url, headers={"User-Agent": "SentinelOSINT/1.0"})
    with urllib.request.urlopen(r, timeout=8) as resp:
        return json.load(resp)

def lookup_package(pkg: str):
    try:
        data = fetch(f"https://pypi.org/pypi/{pkg}/json")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print("[RESULT] Package not found")
        else:
            print(f"[ERROR] HTTP {e.code}")
        sys.exit(0)

    info = data.get("info", {})
    print(f"[PACKAGE]       {info.get('name','?')}")
    print(f"[VERSION]       {info.get('version','?')}")
    print(f"[SUMMARY]       {info.get('summary','?')}")
    print(f"[AUTHOR]        {info.get('author','?')}")
    print(f"[AUTHOR EMAIL]  {info.get('author_email','?')}")
    print(f"[LICENSE]       {info.get('license','?')}")
    print(f"[HOMEPAGE]      {info.get('home_page','?')}")
    print(f"[REQUIRES PY]   {info.get('requires_python','?')}")
    classifiers = info.get("classifiers", [])
    print(f"[CLASSIFIERS]   {len(classifiers)}")
    for c in classifiers[:8]:
        print(f"  {c}")
    requires = info.get("requires_dist") or []
    print(f"[DEPENDENCIES]  {len(requires)}")
    for dep in requires[:10]:
        print(f"  {dep}")
    releases = data.get("releases", {})
    print(f"[RELEASES]      {len(releases)} versions")
    urls = data.get("urls", [])
    for u in urls[:3]:
        print(f"[DIST]  {u.get('filename','?')}  ({u.get('size',0)//1024} KB)  {u.get('upload_time','?')[:10]}")
    print(f"[PYPI URL]  https://pypi.org/project/{info.get('name','')}")

def lookup_user(username: str):
    try:
        data = fetch(f"https://pypi.org/user/{username}/")
    except Exception:
        pass
    try:
        results = fetch(f"https://pypi.org/search/?q=&o=&c=Programming+Language+%3A%3A+Python&author={username}&format=json")
    except Exception:
        pass
    print(f"[INFO] PyPI does not expose a public user profile API.")
    print(f"       Browse manually: https://pypi.org/user/{username}/")

def main():
    print("[MODULE 038] PYPI LOOKUP")
    print("[SOURCE]     pypi.org JSON API — public, no auth required")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No package or user supplied.")
        print("[USAGE] pypi_lookup.py \"requests\"  (package)")
        sys.exit(1)

    if raw.lower().startswith("user:"):
        username = raw[5:].strip()
        print(f"[MODE]   User lookup  →  {username}")
        print()
        lookup_user(username)
    else:
        print(f"[MODE]   Package lookup  →  {raw}")
        print()
        lookup_package(raw)

    print()
    print("[DONE] PyPI lookup complete.")

if __name__ == "__main__":
    main()
