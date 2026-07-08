"""Keybase Lookup — Module 41. Usage: keybase_lookup.py "username" """
import sys, json, urllib.request, urllib.error

def fetch(url):
    r = urllib.request.Request(url, headers={"User-Agent": "SentinelOSINT/1.0"})
    with urllib.request.urlopen(r, timeout=8) as resp:
        return json.load(resp)

def main():
    print("[MODULE 041] KEYBASE")
    print("[SOURCE]     keybase.io public API — no auth required")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip().lstrip("@")
    if not raw:
        print("[ERROR] No username supplied.")
        sys.exit(1)

    print(f"[TARGET]  {raw}")
    print()

    try:
        data = fetch(f"https://keybase.io/{raw}/lookup.json")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print("[RESULT] User not found")
        else:
            print(f"[ERROR] HTTP {e.code}")
        sys.exit(0)
    except Exception as e:
        print(f"[ERROR] {e}")
        sys.exit(1)

    them = data.get("them", [{}])
    if not them:
        print("[RESULT] User not found")
        sys.exit(0)
    u = them[0] if isinstance(them, list) else them

    basics = u.get("basics", {})
    profile = u.get("profile", {})
    proofs = u.get("proofs_summary", {})

    print(f"[USERNAME]    {basics.get('username','?')}")
    print(f"[UID]         {basics.get('uid','?')}")
    print(f"[CREATED]     {basics.get('ctime','?')}")
    if profile.get("full_name"):
        print(f"[NAME]        {profile['full_name']}")
    if profile.get("location"):
        print(f"[LOCATION]    {profile['location']}")
    if profile.get("bio"):
        print(f"[BIO]         {profile['bio'][:200]}")

    all_proofs = proofs.get("all", [])
    if all_proofs:
        print()
        print(f"[LINKED IDENTITIES]  {len(all_proofs)} verified")
        for p in all_proofs:
            service = p.get("proof_type","?")
            handle  = p.get("nametag","?")
            url     = p.get("service_url","")
            print(f"  {service:15s}  {handle:20s}  {url[:60]}")

    devices = u.get("devices", {})
    if devices:
        print()
        print(f"[DEVICES]  {len(devices)}")
        for did, dev in devices.items():
            print(f"  {dev.get('description','?'):25s}  type={dev.get('type','?')}  status={dev.get('status','?')}")

    public_keys = u.get("public_keys", {})
    pgp_keys = public_keys.get("pgp_public_keys", [])
    if pgp_keys:
        print()
        print(f"[PGP KEYS]  {len(pgp_keys)}")
        for k in pgp_keys:
            fp = k.get("key_fingerprint","?")
            print(f"  Fingerprint: {fp}")

    print()
    print(f"[PROFILE]  https://keybase.io/{basics.get('username','')}")
    print("[DONE] Keybase lookup complete.")

if __name__ == "__main__":
    main()
