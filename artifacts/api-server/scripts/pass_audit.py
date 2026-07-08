"""
Password Auditor — Module 206
Analyzes password strength: entropy, patterns, crackability.
Usage:
  pass_audit.py "MyP@ssw0rd!"
  pass_audit.py "batch:password1|hunter2|correct-horse-battery"
"""
import sys
import re
import math
import string

COMMON = {
    "password","123456","12345678","qwerty","abc123","monkey","1234567",
    "letmein","trustno1","dragon","baseball","iloveyou","master","sunshine",
    "princess","welcome","shadow","superman","michael","football","password1",
    "pass","test","admin","root","login","hello","qwerty123","1q2w3e4r",
    "111111","000000","123123","654321","666666","password123","admin123",
}

KEYBOARD_WALKS = ["qwerty","asdfgh","zxcvbn","qweasd","1234567890","0987654321"]

def charset_size(pw: str) -> int:
    size = 0
    if any(c.islower() for c in pw): size += 26
    if any(c.isupper() for c in pw): size += 26
    if any(c.isdigit() for c in pw): size += 10
    specials = set(string.punctuation)
    sp_used = set(c for c in pw if c in specials)
    size += len(sp_used) or (32 if any(c in specials for c in pw) else 0)
    return max(size, 1)

def entropy(pw: str) -> float:
    cs = charset_size(pw)
    return len(pw) * math.log2(cs)

def crack_time(entropy_bits: float) -> str:
    guesses_per_sec = 1e10
    seconds = (2 ** entropy_bits) / guesses_per_sec / 2
    if seconds < 1:
        return "instantly"
    if seconds < 60:
        return f"{seconds:.0f} seconds"
    if seconds < 3600:
        return f"{seconds/60:.0f} minutes"
    if seconds < 86400:
        return f"{seconds/3600:.1f} hours"
    if seconds < 31536000:
        return f"{seconds/86400:.0f} days"
    if seconds < 31536000 * 1000:
        return f"{seconds/31536000:.0f} years"
    if seconds < 31536000 * 1e9:
        return f"{seconds/31536000/1e6:.0f} million years"
    return "longer than the age of the universe"

def score(pw: str) -> tuple[int, list]:
    issues = []
    pts = 0

    if len(pw) >= 8:  pts += 1
    else: issues.append("Too short (< 8 chars)")

    if len(pw) >= 12: pts += 1
    else: issues.append("Short — 12+ chars recommended")

    if len(pw) >= 16: pts += 1

    if any(c.isupper() for c in pw) and any(c.islower() for c in pw):
        pts += 1
    else:
        issues.append("Missing mixed case")

    if any(c.isdigit() for c in pw):
        pts += 1
    else:
        issues.append("No digits")

    if any(c in string.punctuation for c in pw):
        pts += 1
    else:
        issues.append("No special characters")

    if pw.lower() in COMMON or pw in COMMON:
        pts = 0
        issues.append("COMMON PASSWORD — in breach databases")

    for walk in KEYBOARD_WALKS:
        if walk in pw.lower():
            pts = max(pts - 1, 0)
            issues.append(f"Keyboard walk detected: '{walk}'")
            break

    if re.search(r'(.)\1{2,}', pw):
        pts = max(pts - 1, 0)
        issues.append("Repeated characters (aaa, 111, etc.)")

    if re.search(r'(012|123|234|345|456|567|678|789|987|876|765|654|543|432|321|210)', pw):
        pts = max(pts - 1, 0)
        issues.append("Sequential number run")

    if re.search(r'(?i)(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)', pw):
        pts = max(pts - 1, 0)
        issues.append("Sequential letter run")

    year_match = re.search(r'(19|20)\d{2}', pw)
    if year_match:
        issues.append(f"Year detected: {year_match.group()} — easily guessed")

    return min(pts, 6), issues

def grade(pts: int) -> str:
    grades = ["F (Very Weak)", "F (Very Weak)", "D (Weak)", "C (Fair)", "B (Good)", "A (Strong)", "A+ (Very Strong)"]
    return grades[pts]

def audit(pw: str) -> None:
    print(f"[PASSWORD]  {'*' * min(len(pw), 6) + pw[6:] if len(pw) > 6 else '*' * len(pw)}  ({len(pw)} chars)")
    e = entropy(pw)
    pts, issues = score(pw)
    cs = charset_size(pw)

    print()
    print(f"[ENTROPY]    {e:.1f} bits  (charset size: {cs})")
    print(f"[STRENGTH]   {grade(pts)}")
    print(f"[CRACK TIME] {crack_time(e)}  (@ 10B guesses/sec GPU)")
    print()

    if issues:
        print("[ISSUES]")
        for iss in issues:
            print(f"  [WARN] {iss}")
    else:
        print("[ISSUES]  None — password looks solid")

    print()
    print("[CHAR ANALYSIS]")
    lowers  = sum(1 for c in pw if c.islower())
    uppers  = sum(1 for c in pw if c.isupper())
    digits  = sum(1 for c in pw if c.isdigit())
    specials= sum(1 for c in pw if c in string.punctuation)
    spaces  = sum(1 for c in pw if c == " ")
    unique  = len(set(pw))
    print(f"  Lowercase : {lowers:3d}   Uppercase: {uppers:3d}   Digits: {digits:3d}   Special: {specials:3d}   Space: {spaces}")
    print(f"  Unique chars: {unique} / {len(pw)}")

def main() -> None:
    print("[MODULE 206] PASSWORD AUDITOR")
    print("[SOURCE]     Entropy model + pattern heuristics — local analysis only")
    print()

    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE] pass_audit.py \"MyPassword123!\"")
        print("        pass_audit.py \"batch:pass1|pass2|pass3\"")
        sys.exit(1)

    if raw.lower().startswith("batch:"):
        pws = raw[6:].split("|")
        for i, pw in enumerate(pws, 1):
            print(f"─── PASSWORD {i} ───────────────────────────────────────")
            audit(pw.strip())
    else:
        audit(raw)

    print("[DONE] Password audit complete.")

if __name__ == "__main__":
    main()
