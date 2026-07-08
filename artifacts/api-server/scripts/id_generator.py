import sys
import hashlib
import random

states = [
    "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
    "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
    "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
    "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
    "New Hampshire","New Jersey","New Mexico","New York","North Carolina",
    "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
    "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
    "Virginia","Washington","West Virginia","Wisconsin","Wyoming"
]

def generate_id(first, last, age, birth, state):
    raw_data = f"{first}{last}{age}{birth}{state}{random.randint(1,9999)}"
    hashed = hashlib.sha256(raw_data.encode()).hexdigest()
    number = str(int(hashed, 16))[:9]
    return number

def main():
    if len(sys.argv) < 2:
        print("Usage: id_generator.py <FirstName,LastName,Age,Birthdate,State>")
        print("Example: id_generator.py John,Doe,30,01/15/1994,California")
        sys.exit(1)

    raw = sys.argv[1].strip()
    parts = [p.strip() for p in raw.split(",")]

    if len(parts) != 5:
        print(f"[ERROR] expected 5 comma-separated fields, got {len(parts)}")
        print("Format: FirstName,LastName,Age,Birthdate(MM/DD/YYYY),State")
        sys.exit(1)

    first, last, age, birth, state = parts

    if not first or not last:
        print("[ERROR] first and last name are required")
        sys.exit(1)

    if state not in states:
        close = [s for s in states if s.lower().startswith(state.lower()[:3])]
        if close:
            print(f"[WARN] state '{state}' not recognized — did you mean: {', '.join(close[:3])}?")
        else:
            print(f"[WARN] state '{state}' not in list — using as-is")

    print(f"[INPUT] first name  : {first}")
    print(f"[INPUT] last name   : {last}")
    print(f"[INPUT] age         : {age}")
    print(f"[INPUT] birthdate   : {birth}")
    print(f"[INPUT] state       : {state}")
    print(f"[METHOD] SHA-256 hash of combined fields + random salt → first 9 digits")

    generated = generate_id(first, last, age, birth, state)

    print(f"[RESULT] generated 9-digit ID: {generated}")
    print(f"[NOTE] ID is non-deterministic (random salt) — each run produces a unique value")

if __name__ == "__main__":
    main()
