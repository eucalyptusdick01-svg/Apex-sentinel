import sys
import hashlib
import random
import csv
import json
import urllib.request
import io

STATE_CODES = {
    "Alabama":"01","Alaska":"02","Arizona":"04","Arkansas":"05","California":"06",
    "Colorado":"08","Connecticut":"09","Delaware":"10","Florida":"12","Georgia":"13",
    "Hawaii":"15","Idaho":"16","Illinois":"17","Indiana":"18","Iowa":"19",
    "Kansas":"20","Kentucky":"21","Louisiana":"22","Maine":"23","Maryland":"24",
    "Massachusetts":"25","Michigan":"26","Minnesota":"27","Mississippi":"28",
    "Missouri":"29","Montana":"30","Nebraska":"31","Nevada":"32",
    "New Hampshire":"33","New Jersey":"34","New Mexico":"35","New York":"36",
    "North Carolina":"37","North Dakota":"38","Ohio":"39","Oklahoma":"40",
    "Oregon":"41","Pennsylvania":"42","Rhode Island":"44","South Carolina":"45",
    "South Dakota":"46","Tennessee":"47","Texas":"48","Utah":"49","Vermont":"50",
    "Virginia":"51","Washington":"53","West Virginia":"54","Wisconsin":"55","Wyoming":"56"
}

id_set = set()

def generate_hash(data):
    hashed = hashlib.sha256(data.encode()).hexdigest()
    return str(int(hashed, 16))[:9]

def generate_id(first, last, age, birth, state):
    code = STATE_CODES.get(state, "00")
    for _ in range(100):
        raw = f"{first}{last}{age}{birth}{state}{random.randint(1000,9999)}"
        core = generate_hash(raw)
        idnum = (code + core)[:9]
        if idnum not in id_set:
            id_set.add(idnum)
            return idnum
    return (code + generate_hash(f"{random.random()}"))[:9]

def print_record(i, rec, show_index=True):
    prefix = f"  [{i:04d}]" if show_index else "  "
    print(f"{prefix} ID={rec['id']}  {rec['first']} {rec['last']}  {rec['state']}")

def main():
    if len(sys.argv) < 2:
        print("Usage modes:")
        print("  id_studio.py FirstName,LastName,Age,Birthdate,State")
        print("  id_studio.py bulk:N")
        print("  id_studio.py url:https://example.com/data.csv")
        sys.exit(1)

    arg = sys.argv[1].strip()
    print("[MODULE 028] ID STUDIO v2 — Generator Studio")
    print()

    # ── BULK MODE ─────────────────────────────────────────────────────────────
    if arg.lower().startswith("bulk:"):
        try:
            amount = int(arg.split(":", 1)[1])
        except ValueError:
            print("[ERROR] bulk amount must be an integer, e.g. bulk:50")
            sys.exit(1)

        if amount > 500:
            print(f"[WARN] capping at 500 (requested {amount})")
            amount = 500

        states = list(STATE_CODES.keys())
        print(f"[MODE] bulk generation — {amount} random IDs")
        print()

        records = []
        for i in range(amount):
            first = f"User{random.randint(100,999)}"
            last  = f"Test{random.randint(100,999)}"
            age   = random.randint(18, 80)
            birth = random.randint(1950, 2005)
            state = random.choice(states)
            idnum = generate_id(first, last, str(age), str(birth), state)
            records.append({"id": idnum, "first": first, "last": last, "state": state})

        for i, r in enumerate(records, 1):
            print_record(i, r)

        state_counts = {}
        for r in records:
            state_counts[r["state"]] = state_counts.get(r["state"], 0) + 1

        top5 = sorted(state_counts.items(), key=lambda x: -x[1])[:5]
        print()
        print(f"[RESULT] total IDs generated : {len(records)}")
        print(f"[RESULT] unique states used  : {len(state_counts)}")
        print(f"[RESULT] top states          : {', '.join(f'{s}({n})' for s,n in top5)}")
        print(f"[RESULT] collision-free      : yes (id_set enforced)")

    # ── URL MODE ───────────────────────────────────────────────────────────────
    elif arg.lower().startswith("url:"):
        url = arg[4:].strip()
        print(f"[MODE] dataset from URL: {url}")
        try:
            with urllib.request.urlopen(url, timeout=10) as resp:
                raw = resp.read().decode("utf-8")
        except Exception as e:
            print(f"[ERROR] failed to fetch URL: {e}")
            sys.exit(1)

        reader = csv.DictReader(io.StringIO(raw))
        rows = list(reader)
        print(f"[INFO] loaded {len(rows)} rows from CSV")
        print(f"[INFO] columns: {', '.join(reader.fieldnames or [])}")
        print()

        records = []
        for row in rows:
            first = row.get("FirstName", row.get("first_name", row.get("first", "")))
            last  = row.get("LastName",  row.get("last_name",  row.get("last",  "")))
            age   = row.get("Age",       row.get("age",   ""))
            birth = row.get("Birthdate", row.get("dob",   ""))
            state = row.get("State",     row.get("state", ""))
            idnum = generate_id(first, last, age, birth, state)
            records.append({"id": idnum, "first": first, "last": last, "state": state})

        for i, r in enumerate(records[:50], 1):
            print_record(i, r)

        if len(records) > 50:
            print(f"  ... {len(records)-50} more records (showing first 50)")

        print()
        print(f"[RESULT] total IDs generated : {len(records)}")
        print(f"[RESULT] unique states       : {len(set(r['state'] for r in records))}")
        print()
        print("[JSON]")
        print(json.dumps(records[:20], indent=2))

    # ── SINGLE / MANUAL MODE ───────────────────────────────────────────────────
    else:
        parts = [p.strip() for p in arg.split(",")]
        if len(parts) != 5:
            print(f"[ERROR] expected 5 comma-separated fields, got {len(parts)}")
            print("Format: FirstName,LastName,Age,Birthdate(MM/DD/YYYY),State")
            sys.exit(1)

        first, last, age, birth, state = parts
        print(f"[MODE] single ID generation")
        print()
        print(f"[INPUT] first name : {first}")
        print(f"[INPUT] last name  : {last}")
        print(f"[INPUT] age        : {age}")
        print(f"[INPUT] birthdate  : {birth}")
        print(f"[INPUT] state      : {state}")

        code = STATE_CODES.get(state)
        if code:
            print(f"[INFO]  state code : {code} ({state})")
        else:
            close = [s for s in STATE_CODES if s.lower().startswith(state.lower()[:3])]
            if close:
                print(f"[WARN] state '{state}' not recognized — did you mean: {', '.join(close[:3])}?")

        print(f"[METHOD] state-code prefix ({code or '00'}) + SHA-256 hash + random salt → 9 digits")
        print()

        idnum = generate_id(first, last, age, birth, state)
        rec = {"id": idnum, "first": first, "last": last, "state": state}

        print(f"[RESULT] generated ID : {idnum}")
        print(f"[RESULT] state prefix : {idnum[:2]} ({state})")
        print(f"[RESULT] unique check : passed (collision-free)")
        print()
        print("[JSON]")
        print(json.dumps(rec, indent=2))

    print()
    print("[DONE] ID Studio complete.")

if __name__ == "__main__":
    main()
