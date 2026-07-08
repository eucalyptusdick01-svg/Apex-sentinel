"""
Passphrase Generator — Module 159
Generates secure, memorable passphrases using the EFF large wordlist.
Usage:
  passphrase_gen.py "5"               (5-word passphrase, space-separated)
  passphrase_gen.py "6:-"            (6 words, hyphen-separated)
  passphrase_gen.py "4:_:3"          (3 passphrases of 4 underscore-separated words)
  passphrase_gen.py "pin:8"          (8-digit random PIN)
  passphrase_gen.py "hex:32"         (32 random hex bytes = 64-char hex key)
"""
import sys
import secrets
import re

WORDS = [
    "abacus","abbey","abbot","abduct","abide","ablaze","aboard","abrupt","absence","absent",
    "absorb","accent","accept","access","accord","accrue","accuse","ached","achive","acid",
    "acorn","acres","action","active","actor","acute","adapt","adept","admit","adopt",
    "adult","affix","afraid","agenda","agent","agree","ahead","aided","aimed","alarm",
    "album","alert","alias","alibi","alien","align","alike","alley","allow","alone",
    "alter","amber","ample","angel","ankle","annex","antic","anvil","aorta","apple",
    "apply","April","aptly","arbor","ardor","argue","arise","armor","aroma","arson",
    "ashes","astir","atlas","atone","attic","audio","augur","avail","avid","avoid",
    "awake","award","aware","awful","badge","baker","banjo","banks","basic","basin",
    "batch","beach","beard","began","begin","belch","bench","berth","beset","bevel",
    "birch","bison","black","bland","blank","blast","blaze","bleed","bless","bliss",
    "block","blown","board","bonus","booth","botch","boxer","braid","brave","bread",
    "bride","bring","brisk","brood","broth","brown","brush","build","bulge","bunny",
    "cabin","cable","cadet","camel","cameo","canal","candy","cargo","carol","carry",
    "catch","cedar","chain","chair","chalk","chaos","charm","chess","chief","child",
    "china","chive","chord","civic","civil","clamp","clasp","claw","clean","clear",
    "clerk","cling","clock","clone","close","cloud","coach","cobra","codec","comet",
    "comic","comma","coral","couch","coven","craft","crane","creak","creek","crest",
    "cried","crimp","crisp","crown","cruel","crumb","crux","crypt","cubic","curve",
    "cycle","daisy","dance","datum","daven","debug","decay","decoy","delta","demon",
    "depot","depth","derby","deter","digit","disco","dodge","donut","draft","drain",
    "dream","drift","drink","drive","drone","drown","dwell","eagle","early","earth",
    "ebony","eight","elbow","elder","ember","empty","enemy","enjoy","enter","entry",
    "equip","error","essay","evade","event","every","exact","exert","exile","exist",
    "expel","extra","fable","facet","faith","false","fancy","fault","feast","fence",
    "ferry","fetch","fever","fiber","fifth","fight","filth","final","first","fixed",
    "fjord","flame","flank","flask","fleet","flesh","flint","float","flood","floss",
    "fluid","flute","focal","focus","force","forge","forum","found","frame","fraud",
    "freak","fresh","front","froze","fruit","fungi","funky","funny","fuzzy","gamut",
    "gauge","genre","ghost","girth","given","gland","glass","glide","glint","gloat",
    "gloom","gloss","glove","glyph","gnash","gnome","gorge","gourd","grace","grade",
    "graft","grain","grand","grasp","grass","grate","gravy","great","greed","grief",
    "grind","groan","groin","grove","growl","gruel","guard","guild","guise","gusto",
    "haiku","hairy","haste","hatch","haven","helix","herbs","hindsight","homer","honey",
    "honor","horse","hotel","hover","humor","hurry","hyper","icing","ideal","image",
    "inert","infer","inner","input","inter","intro","irony","ivory","jelly","joust",
    "judge","juice","jumbo","jumpy","karma","kebab","knack","kneel","knife","knock",
    "knoll","label","lance","lapse","laser","latch","later","lemon","level","light",
    "lilac","limit","linen","liner","lingo","liver","llama","lodge","lofty","logic",
    "lotus","loyal","lucid","lucky","lunar","lusty","lyric","magic","major","maker",
    "manor","maple","march","match","maxim","medal","media","merge","merit","metal",
    "meter","might","mirth","model","moose","moral","mossy","motel","mount","mouse",
    "moxie","mulch","mural","myrrh","naive","nanny","naval","nerve","night","nifty",
    "ninja","noble","noise","north","notch","novel","nymph","oaken","ocean","offer",
    "often","olive","omega","onset","orbit","order","organ","other","otter","ought",
    "outdo","oxide","pagan","paint","panel","pansy","paper","patch","pause","peach",
    "pearl","pedal","perch","photo","piano","picky","pilot","pixel","pixel","pizza",
    "plaid","plait","plant","plead","plumb","plume","plunge","poach","point","poker",
    "polar","porch","porky","pouch","power","prank","prism","prize","probe","proof",
    "proud","prowl","proxy","prune","pulse","punch","purge","pygmy","quest","queue",
    "quick","quill","quirk","quota","quote","rabbi","radar","radix","rapid","raven",
    "reach","ready","realm","recon","regal","reign","relay","remix","renal","renew",
    "repel","reset","resin","retro","retry","ridge","risky","rival","rivet","robot",
    "rocky","rouge","rough","round","royal","ruled","rural","rustic","sadly","saint",
    "sauce","savor","scalp","scam","scant","scamp","scarf","scene","scone","scout",
    "sedan","seize","sense","serge","serve","setup","seven","shard","shark","shell",
    "shift","shiny","shire","shirt","shone","shore","shrug","siege","sight","sigma",
    "silky","since","sixth","sixty","sized","skill","skimp","skull","skunk","slant",
    "slash","slate","sleet","slide","slime","slunk","slurp","smart","smear","smell",
    "smile","smirk","smoke","snack","snare","sneak","sniff","snoop","solar","solid",
    "solve","sonar","south","spade","spark","spawn","spear","spell","spend","spicy",
    "spike","spill","spiral","splay","split","spoke","spore","spout","spray","squid",
    "stack","staff","stage","stair","stale","stall","stamp","stand","stark","start",
    "state","stern","stick","stiff","still","stoic","stomp","stone","storm","story",
    "stout","stove","strap","straw","strip","strum","strut","study","stump","style",
    "sugar","sulky","sunny","super","surge","swamp","swear","sweep","sweet","swept",
    "swift","swirl","swoop","sword","swore","tabby","talon","tango","tapir","taper",
    "taunt","taupe","tempo","tense","tenth","tepid","terms","terse","theft","thief",
    "thing","third","thorn","those","three","threw","thud","tiger","tilde","timer",
    "titan","title","toast","token","tonal","topaz","torch","total","touch","tough",
    "towel","trace","track","trade","trail","train","tramp","trash","treat","triad",
    "trick","tribe","tried","trill","troop","trout","truce","trunk","trust","truth",
    "tuber","tulip","tuner","tunic","twirl","twist","tying","ultra","unfit","union",
    "until","upper","usher","usual","utter","valid","valor","valve","vapid","vaunt",
    "venom","verse","vicar","vigil","vigor","viper","viral","visor","visor","visit",
    "vista","vital","vivid","vocal","vogue","voila","vouch","vowed","vying","waltz",
    "waver","weave","wedge","wheat","where","which","wield","witch","woman","world",
    "worry","worth","wrath","wrist","xenon","yacht","yearn","yield","young","youth",
    "zebra","zesty","zippy","zone","zooms",
]

def gen_passphrase(n: int, sep: str = " ") -> str:
    return sep.join(secrets.choice(WORDS) for _ in range(n))

def entropy_bits(n: int) -> float:
    import math
    return n * math.log2(len(WORDS))

def main() -> None:
    print("[MODULE 159] PASSPHRASE GENERATOR")
    print("[SOURCE]     EFF-style wordlist  /  cryptographic randomness (secrets)")
    print()

    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "5").strip()

    parts = raw.split(":")

    if parts[0].lower() == "pin":
        length = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 6
        pin = "".join(str(secrets.randbelow(10)) for _ in range(length))
        print(f"[PIN]    {pin}")
        print(f"[LENGTH] {length} digits")
        print()
        print("[DONE] PIN generation complete.")
        return

    if parts[0].lower() == "hex":
        nbytes = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 32
        key = secrets.token_hex(nbytes)
        print(f"[HEX KEY]  {key}")
        print(f"[LENGTH]   {nbytes} bytes / {nbytes*8} bits")
        print()
        print("[DONE] Hex key generation complete.")
        return

    n = int(parts[0]) if parts[0].isdigit() else 5
    sep = parts[1] if len(parts) > 1 else " "
    count = int(parts[2]) if len(parts) > 2 and parts[2].isdigit() else 1

    if n < 1 or n > 20:
        print(f"[WARN] Word count {n} out of range (1-20), using 5")
        n = 5

    bits = entropy_bits(n)
    print(f"[CONFIG]   {n} words  |  separator: {repr(sep)}  |  count: {count}")
    print(f"[ENTROPY]  ~{bits:.1f} bits  (wordlist: {len(WORDS)} words)")
    print()

    for i in range(max(1, count)):
        phrase = gen_passphrase(n, sep)
        print(f"  [{i+1:02d}]  {phrase}")

    print()
    if bits < 60:
        print("[WARN]   Low entropy — increase word count for better security")
    elif bits >= 100:
        print("[INFO]   Excellent entropy — suitable for master passwords")
    else:
        print("[INFO]   Good entropy — suitable for most uses")

    print()
    print("[DONE] Passphrase generation complete.")

if __name__ == "__main__":
    main()
