"""Morse Code — Module 111. Usage: morse_code.py "text" or morse_code.py "dec:... --- ..." """
import sys

MORSE = {
    'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---',
    'K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-',
    'U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..',
    '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...',
    '8':'---..','9':'----.',
    '.':'.-.-.-',',':'--..--','?':'..--..','!':'-.-.--',"'":'----.','"':'.-..-.',
    '/':'-..-.','(':'-.--.',')':'-.--.-','&':'.-...',':':'---...',';':'-.-.-.','=':'-...-',
    '+':'.-.-.', '-':'-....-','_':'..--.-','$':'...-..-','@':'.--.-.',
    ' ': '/'
}
REVERSE = {v: k for k, v in MORSE.items()}
REVERSE['/'] = ' '

def encode(text: str) -> str:
    result = []
    for ch in text.upper():
        if ch in MORSE:
            result.append(MORSE[ch])
        elif ch == ' ':
            result.append('/')
        else:
            result.append(f'[?{ch}]')
    return ' '.join(result)

def decode(morse: str) -> str:
    words = morse.strip().split(' / ')
    result = []
    for word in words:
        chars = word.strip().split()
        for c in chars:
            result.append(REVERSE.get(c, f'[?{c}]'))
        result.append(' ')
    return ''.join(result).strip()

def to_phonetic(text: str) -> str:
    NATO = {'A':'Alpha','B':'Bravo','C':'Charlie','D':'Delta','E':'Echo','F':'Foxtrot',
            'G':'Golf','H':'Hotel','I':'India','J':'Juliet','K':'Kilo','L':'Lima',
            'M':'Mike','N':'November','O':'Oscar','P':'Papa','Q':'Quebec','R':'Romeo',
            'S':'Sierra','T':'Tango','U':'Uniform','V':'Victor','W':'Whiskey',
            'X':'X-Ray','Y':'Yankee','Z':'Zulu',
            '0':'Zero','1':'One','2':'Two','3':'Three','4':'Four',
            '5':'Five','6':'Six','7':'Seven','8':'Eight','9':'Nine'}
    return ' '.join(NATO.get(ch.upper(), ch) for ch in text if ch.strip())

def main():
    print("[MODULE 111] MORSE CODE")
    print("[SOURCE]     Pure Python — International Morse Code + NATO phonetic")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  morse_code.py \"Hello World\"")
        print("         morse_code.py \"dec:.... . .-.. .-.. --- / .-- --- .-. .-.. -..\"")
        sys.exit(0)

    if raw.lower().startswith("dec:"):
        morse_str = raw[4:]
        print(f"[MODE]    Decode Morse")
        print(f"[INPUT]   {morse_str}")
        print()
        decoded = decode(morse_str)
        print(f"[DECODED]  {decoded}")
        print()
        print(f"[NATO PHONETIC]  {to_phonetic(decoded)}")
    else:
        text = raw
        print(f"[MODE]    Encode to Morse")
        print(f"[INPUT]   {text}")
        print()
        encoded = encode(text)
        print(f"[MORSE]")
        # Print with character alignment
        for ch in text.upper():
            m = MORSE.get(ch, MORSE.get(' ', '/') if ch == ' ' else f'?')
            print(f"  {ch:4s}  {m}")
        print()
        print(f"[FULL STRING]")
        print(f"  {encoded}")
        print()
        print(f"[NATO PHONETIC]")
        print(f"  {to_phonetic(text)}")
        print()
        print(f"[AUDIO HINT]  dit=·  dah=—  (each dit=1 unit, dah=3 units, space=7 units)")

    print()
    print("[DONE] Morse code operation complete.")

if __name__ == "__main__":
    main()
