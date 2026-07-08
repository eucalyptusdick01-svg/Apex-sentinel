"""Gravatar — Module 33. Usage: gravatar.py "email@example.com" or gravatar.py "hash:MD5HASH" """
import sys, json, hashlib, urllib.request, urllib.error

def main():
    print("[MODULE 033] GRAVATAR")
    print("[SOURCE]     gravatar.com — global avatar service by Automattic")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[ERROR] No email or hash supplied.")
        sys.exit(1)

    if raw.lower().startswith("hash:"):
        md5 = raw[5:].lower().strip()
    else:
        email = raw.lower().strip()
        md5 = hashlib.md5(email.encode()).hexdigest()
        print(f"[EMAIL]   {email}")

    print(f"[MD5]     {md5}")
    print(f"[AVATAR]  https://www.gravatar.com/avatar/{md5}?s=200")
    print()

    try:
        url = f"https://www.gravatar.com/{md5}.json"
        req = urllib.request.Request(url, headers={"User-Agent": "SentinelOSINT/1.0"})
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.load(resp)
        entry = data.get("entry", [{}])[0]
        name_info = entry.get("name", {})
        display = entry.get("displayName", "?")
        real = name_info.get("formatted", "")
        print(f"[DISPLAY NAME]  {display}")
        if real:
            print(f"[REAL NAME]     {real}")
        about = entry.get("aboutMe", "")
        if about:
            print(f"[ABOUT]         {about[:200]}")
        location = entry.get("currentLocation", "")
        if location:
            print(f"[LOCATION]      {location}")
        urls = entry.get("urls", [])
        if urls:
            print("[LINKED URLS]")
            for u in urls:
                print(f"  {u.get('title','?'):20s}  {u.get('value','?')}")
        accounts = entry.get("accounts", [])
        if accounts:
            print("[LINKED ACCOUNTS]")
            for a in accounts:
                print(f"  {a.get('shortname','?'):15s}  {a.get('url','?')}")
        photos = entry.get("photos", [])
        if photos:
            print("[PHOTOS]")
            for p in photos:
                print(f"  {p.get('type','?'):10s}  {p.get('value','?')}")
        print()
        print(f"[PROFILE URL]  https://www.gravatar.com/{md5}")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print("[RESULT] No Gravatar profile found for this hash")
            print("[INFO]   Avatar URL still works with default identicon")
        else:
            print(f"[ERROR]  HTTP {e.code}")
    except Exception as e:
        print(f"[ERROR] {e}")

    print()
    print("[DONE] Gravatar lookup complete.")

if __name__ == "__main__":
    main()
