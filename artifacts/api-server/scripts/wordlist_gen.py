"""Wordlist Gen — Module 115. Usage: wordlist_gen.py "word" or wordlist_gen.py "rules:word" """
import sys, string, itertools

def leet(word: str) -> list:
    LEET = {"a":"@4","e":"3","i":"!1","o":"0","s":"$5","t":"+7","l":"1","g":"9"}
    variants = {""}
    for ch in word.lower():
        new = set()
        for v in variants:
            new.add(v + ch)
            for r in LEET.get(ch, ""):
                new.add(v + r)
        variants = new
    return sorted(variants)

def case_variants(word: str) -> list:
    variants = set()
    variants.add(word.lower())
    variants.add(word.upper())
    variants.add(word.capitalize())
    variants.add(word[0].upper() + word[1:].lower() if word else word)
    # Toggle case
    variants.add("".join(c.upper() if i%2==0 else c.lower() for i,c in enumerate(word)))
    return sorted(variants)

def append_common(word: str) -> list:
    SUFFIXES = ["1","2","123","1234","12345","!","!1","@","#","2024","2025","2023",
                "admin","pass","password","pwd","login","01","99","00","007","*"]
    PREFIXES = ["!","admin","pass","login","@"]
    results = []
    base = word.lower()
    for s in SUFFIXES:
        results.append(base + s)
        results.append(word.capitalize() + s)
    for p in PREFIXES:
        results.append(p + base)
    return results

def main():
    print("[MODULE 115] WORDLIST GENERATOR")
    print("[SOURCE]     Pure Python — mutation-based wordlist generation")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  wordlist_gen.py \"password\"")
        print("         wordlist_gen.py \"rules:admin\"   (all mutations)")
        print("         wordlist_gen.py \"leet:hello\"    (leet speak only)")
        print("         wordlist_gen.py \"pin:4\"         (4-digit PINs)")
        print("         wordlist_gen.py \"combo:admin,2024,!\"  (combine words)")
        sys.exit(0)

    if raw.lower().startswith("pin:"):
        n = int(raw[4:].strip()) if raw[4:].strip().isdigit() else 4
        n = min(n, 6)
        print(f"[MODE]   PIN generator — {n}-digit combinations")
        print(f"[COUNT]  {10**n} PINs")
        print()
        for i in range(min(50, 10**n)):
            print(f"  {i:0{n}d}")
        if 10**n > 50:
            print(f"  ... ({10**n - 50} more)")

    elif raw.lower().startswith("combo:"):
        parts = raw[6:].split(",")
        parts = [p.strip() for p in parts if p.strip()]
        print(f"[MODE]   Combination — {len(parts)} elements")
        print()
        combos = []
        for r in range(1, len(parts)+1):
            for perm in itertools.permutations(parts, r):
                combos.append("".join(perm))
                combos.append("-".join(perm))
                combos.append("_".join(perm))
                combos.append(".".join(perm))
        seen = set()
        unique = []
        for c in combos:
            if c not in seen:
                seen.add(c)
                unique.append(c)
        print(f"[COMBINATIONS]  {len(unique)}")
        for c in unique[:100]:
            print(f"  {c}")
        if len(unique) > 100:
            print(f"  ... ({len(unique)-100} more)")

    elif raw.lower().startswith("leet:"):
        word = raw[5:]
        print(f"[MODE]   Leet speak mutations")
        print(f"[INPUT]  {word}")
        print()
        variants = leet(word)
        print(f"[VARIANTS]  {len(variants)}")
        for v in variants[:50]:
            print(f"  {v}")
        if len(variants) > 50:
            print(f"  ... ({len(variants)-50} more)")

    else:
        word = raw[6:] if raw.lower().startswith("rules:") else raw
        print(f"[MODE]   Full mutation rules")
        print(f"[INPUT]  {word}")
        print()

        all_words = set()
        all_words.update(case_variants(word))
        all_words.update(append_common(word))
        leet_v = leet(word)
        all_words.update(leet_v[:20])  # top 20 leet variants

        # Number appended
        for n in range(0, 101):
            all_words.add(word.lower() + str(n))
        for yr in range(1980, 2026):
            all_words.add(word.lower() + str(yr))

        all_words_sorted = sorted(all_words)
        print(f"[WORDLIST]  {len(all_words_sorted)} words generated")
        print()
        for w in all_words_sorted[:80]:
            print(f"  {w}")
        if len(all_words_sorted) > 80:
            print(f"  ... ({len(all_words_sorted)-80} more)")

    print()
    print("[DONE] Wordlist generation complete.")

if __name__ == "__main__":
    main()
