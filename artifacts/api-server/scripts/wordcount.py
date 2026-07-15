"""Wordcount — Module 223. Text statistics, frequency analysis, readability."""
import sys, re, collections, math

STOPWORDS = {"the","a","an","and","or","but","in","on","at","to","for","of","with",
             "by","from","is","was","are","were","be","been","being","have","has",
             "had","do","does","did","will","would","could","should","may","might",
             "i","you","he","she","it","we","they","this","that","these","those",
             "what","which","who","whom","not","no","nor","so","yet","both","either"}

def syllables(word):
    word = word.lower()
    count = 0
    vowels = "aeiouy"
    prev_vowel = False
    for c in word:
        v = c in vowels
        if v and not prev_vowel:
            count += 1
        prev_vowel = v
    if word.endswith("e"): count -= 1
    return max(1, count)

def main():
    print("[MODULE 223] WORDCOUNT & TEXT ANALYSIS")
    print("[SOURCE]     Python stdlib — no external calls")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  Paste any text as the target")
        print("[USAGE]  freq:TEXT     — word frequency analysis")
        print("[USAGE]  read:TEXT     — readability scores")
        sys.exit(0)

    mode = "full"
    text = raw
    if raw.startswith("freq:"):
        mode = "freq"; text = raw[5:]
    elif raw.startswith("read:"):
        mode = "read"; text = raw[5:]

    text = text.replace("\\n", "\n")

    # Basic counts
    chars = len(text)
    chars_no_space = len(text.replace(" ", "").replace("\n",""))
    words_raw = re.findall(r'\b\w+\b', text.lower())
    words = [w for w in words_raw if w.isalpha()]
    sentences = [s for s in re.split(r'[.!?]+', text) if s.strip()]
    paragraphs = [p for p in text.split('\n\n') if p.strip()]
    lines = text.split('\n')

    print(f"[CHARACTERS]        {chars:,}")
    print(f"[CHARS (no spaces)] {chars_no_space:,}")
    print(f"[WORDS]             {len(words):,}")
    print(f"[SENTENCES]         {len(sentences):,}")
    print(f"[PARAGRAPHS]        {len(paragraphs):,}")
    print(f"[LINES]             {len(lines):,}")
    print(f"[UNIQUE WORDS]      {len(set(words)):,}")
    if len(sentences) > 0 and len(words) > 0:
        print(f"[AVG WORDS/SENT]    {len(words)/len(sentences):.1f}")
    print()

    if mode in ("full", "read") and words:
        avg_syl = sum(syllables(w) for w in words) / len(words)
        avg_word_len = sum(len(w) for w in words) / len(words)
        print(f"[AVG WORD LENGTH]   {avg_word_len:.1f} chars")
        print(f"[AVG SYLLABLES]     {avg_syl:.2f}/word")

        # Flesch Reading Ease
        if len(sentences) > 0:
            fre = 206.835 - 1.015*(len(words)/len(sentences)) - 84.6*avg_syl
            if fre >= 90: level = "Very Easy (5th grade)"
            elif fre >= 70: level = "Easy (6th grade)"
            elif fre >= 60: level = "Standard (7th-8th grade)"
            elif fre >= 50: level = "Fairly Difficult (10th-12th grade)"
            elif fre >= 30: level = "Difficult (College)"
            else: level = "Very Difficult (Professional)"
            print(f"[FLESCH SCORE]      {fre:.1f} — {level}")
        print()

    if mode in ("full", "freq") and words:
        # Top words (excluding stopwords)
        content_words = [w for w in words if w not in STOPWORDS and len(w) > 2]
        freq = collections.Counter(content_words)
        print(f"[TOP 20 WORDS]  (stopwords excluded)")
        for word, count in freq.most_common(20):
            bar = "█" * min(20, count)
            print(f"  {word:<20} {count:4}  {bar}")
        print()

        # Character frequency
        char_freq = collections.Counter(c.lower() for c in text if c.isalpha())
        print(f"[LETTER FREQUENCY]")
        for c, n in sorted(char_freq.items()):
            pct = n / chars_no_space * 100 if chars_no_space else 0
            print(f"  {c}: {n:5} ({pct:.1f}%)")

    print()
    print("[DONE] Wordcount analysis complete.")

if __name__ == "__main__":
    main()
