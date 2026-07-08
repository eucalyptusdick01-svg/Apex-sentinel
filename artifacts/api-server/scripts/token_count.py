"""
Token Counter — Module 212
Estimates token counts for LLM context windows + text statistics.
Usage:
  token_count.py "Hello, world!"
  token_count.py "long block of text here..."
  token_count.py "model:gpt-4:Your prompt text here"
  token_count.py "cost:0.03:Your prompt text"   ($/1K tokens → estimated cost)
"""
import sys
import re
import math
import collections

MODEL_LIMITS = {
    "gpt-3.5-turbo":        16_385,
    "gpt-4":                 8_192,
    "gpt-4-turbo":         128_000,
    "gpt-4o":              128_000,
    "claude-3-haiku":      200_000,
    "claude-3-sonnet":     200_000,
    "claude-3-opus":       200_000,
    "claude-3-5-sonnet":   200_000,
    "gemini-1.5-pro":    1_048_576,
    "gemini-1.5-flash":  1_048_576,
    "llama-3-70b":         131_072,
    "mistral-large":       131_072,
    "phi-3-medium":        128_000,
}

def estimate_tokens(text: str) -> dict:
    chars = len(text)
    words = len(text.split())
    rough_tokens = max(1, round(chars / 4))
    word_tokens  = max(1, round(words / 0.75))
    avg_tokens   = (rough_tokens + word_tokens) // 2
    return {
        "chars":        chars,
        "words":        words,
        "lines":        text.count("\n") + 1,
        "rough":        rough_tokens,
        "word_based":   word_tokens,
        "estimated":    avg_tokens,
    }

def word_frequency(text: str, top: int = 10) -> list:
    words = re.findall(r"\b[a-zA-Z]{3,}\b", text.lower())
    counter = collections.Counter(words)
    stops = {"the","and","for","that","this","with","are","have","from","they","will",
             "not","but","you","can","all","was","had","has","been","were","its",
             "than","then","when","what","who","how","our","your","their","about"}
    filtered = [(w, c) for w, c in counter.most_common(100) if w not in stops]
    return filtered[:top]

def readability(text: str) -> dict:
    sentences = max(1, len(re.split(r'[.!?]+', text)))
    words = text.split()
    avg_word_len = sum(len(w) for w in words) / max(1, len(words))
    avg_sent_len = len(words) / sentences
    flesch = 206.835 - 1.015 * avg_sent_len - 84.6 * (avg_word_len / 5.1)
    if flesch > 90:   level = "Very Easy (5th grade)"
    elif flesch > 70: level = "Easy (6th grade)"
    elif flesch > 60: level = "Standard (7-8th grade)"
    elif flesch > 50: level = "Fairly Difficult (10th grade)"
    elif flesch > 30: level = "Difficult (College)"
    else:             level = "Very Difficult (Professional)"
    return {
        "sentences": sentences,
        "avg_word_len": avg_word_len,
        "avg_sent_len": avg_sent_len,
        "flesch": max(0, min(100, flesch)),
        "level": level,
    }

def main() -> None:
    print("[MODULE 212] TOKEN COUNTER")
    print("[SOURCE]     GPT-4 token estimator + readability analysis")
    print()

    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE] token_count.py \"Your text here\"")
        print("        token_count.py \"model:gpt-4:Your text here\"")
        print("        token_count.py \"cost:0.03:Your text here\"")
        sys.exit(1)

    model = None
    cost_per_1k = None

    if raw.lower().startswith("model:"):
        rest = raw[6:]
        colon = rest.find(":")
        if colon != -1:
            model = rest[:colon]
            raw = rest[colon + 1:]
        else:
            model = rest
            raw = ""

    if raw.lower().startswith("cost:"):
        rest = raw[5:]
        colon = rest.find(":")
        if colon != -1:
            try:
                cost_per_1k = float(rest[:colon])
                raw = rest[colon + 1:]
            except ValueError:
                raw = rest

    if not raw:
        print("[ERROR] No text to analyze.")
        sys.exit(1)

    stats = estimate_tokens(raw)
    read  = readability(raw)
    freq  = word_frequency(raw)

    print(f"[TEXT PREVIEW]  {raw[:80]}{'...' if len(raw)>80 else ''}")
    print()
    print("[TOKEN ESTIMATES]")
    print(f"  Characters      : {stats['chars']:,}")
    print(f"  Words           : {stats['words']:,}")
    print(f"  Lines           : {stats['lines']:,}")
    print(f"  ≈ Tokens (chars/4)    : {stats['rough']:,}")
    print(f"  ≈ Tokens (words×1.33) : {stats['word_based']:,}")
    print(f"  ≈ Tokens (avg)        : {stats['estimated']:,}  ← best estimate")
    print()

    if model:
        limit = MODEL_LIMITS.get(model.lower())
        if limit:
            pct = stats["estimated"] / limit * 100
            remaining = limit - stats["estimated"]
            print(f"[MODEL: {model.upper()}]")
            print(f"  Context limit : {limit:,} tokens")
            print(f"  Used          : {stats['estimated']:,} tokens ({pct:.1f}%)")
            print(f"  Remaining     : {remaining:,} tokens")
            bar_filled = int(pct / 5)
            bar = "█" * bar_filled + "░" * (20 - bar_filled)
            print(f"  [{bar}] {pct:.0f}%")
            if pct > 80:
                print(f"  [WARN] Using >{80}% of context window")
        else:
            print(f"[MODEL: {model}]")
            print(f"  (Unknown model — no limit data)")
        print()
    else:
        print("[COMMON MODEL LIMITS]")
        for m, lim in list(MODEL_LIMITS.items())[:8]:
            pct = stats["estimated"] / lim * 100
            fits = "✓" if stats["estimated"] <= lim else "✗"
            print(f"  {fits} {m:25s} {lim:>10,} tokens  ({pct:.1f}% used)")
        print()

    if cost_per_1k is not None:
        cost = stats["estimated"] / 1000 * cost_per_1k
        print(f"[COST ESTIMATE @ ${cost_per_1k}/1K tokens]  ${cost:.6f}")
        print()

    print("[READABILITY]")
    print(f"  Avg word length  : {read['avg_word_len']:.1f} chars")
    print(f"  Avg sentence len : {read['avg_sent_len']:.1f} words")
    print(f"  Flesch score     : {read['flesch']:.1f} / 100")
    print(f"  Level            : {read['level']}")
    print()

    if freq:
        print("[TOP KEYWORDS]")
        for word, count in freq:
            print(f"  {word:20s}  {count}×")
        print()

    print("[DONE] Token count complete.")

if __name__ == "__main__":
    main()
