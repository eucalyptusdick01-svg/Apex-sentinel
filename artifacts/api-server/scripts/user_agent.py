"""User Agent — Module 168. Parse and analyze user agent strings."""
import sys, re

def parse_ua(ua):
    result = {"raw": ua, "browser": None, "version": None, "os": None,
              "device": "desktop", "engine": None, "bot": False, "bot_name": None}

    # Bot detection
    bot_patterns = [
        (r'Googlebot', "Googlebot"), (r'bingbot', "Bingbot"), (r'Slurp', "Yahoo Slurp"),
        (r'DuckDuckBot', "DuckDuckBot"), (r'Baiduspider', "Baiduspider"),
        (r'YandexBot', "YandexBot"), (r'Sogou', "Sogou"), (r'Exabot', "Exabot"),
        (r'facebot|facebookexternalhit', "Facebook Crawler"), (r'Twitterbot', "Twitterbot"),
        (r'LinkedInBot', "LinkedIn Bot"), (r'Slackbot', "Slackbot"),
        (r'curl/', "curl"), (r'wget/', "Wget"), (r'python-requests', "Python Requests"),
        (r'Go-http-client', "Go HTTP"), (r'Java/', "Java HTTP"), (r'scrapy', "Scrapy"),
        (r'HeadlessChrome', "Headless Chrome"), (r'PhantomJS', "PhantomJS"),
        (r'Selenium', "Selenium"), (r'puppet', "Puppeteer"),
    ]
    for pattern, name in bot_patterns:
        if re.search(pattern, ua, re.IGNORECASE):
            result["bot"] = True
            result["bot_name"] = name
            break

    # OS detection
    if re.search(r'Windows NT (\d+\.\d+)', ua):
        m = re.search(r'Windows NT (\d+\.\d+)', ua)
        nt_versions = {"10.0":"Windows 10/11","6.3":"Windows 8.1","6.2":"Windows 8","6.1":"Windows 7","6.0":"Windows Vista","5.2":"Windows Server 2003","5.1":"Windows XP"}
        result["os"] = nt_versions.get(m.group(1), f"Windows NT {m.group(1)}")
    elif re.search(r'Mac OS X ([\d_]+)', ua):
        m = re.search(r'Mac OS X ([\d_]+)', ua)
        result["os"] = "macOS " + m.group(1).replace("_",".")
    elif re.search(r'Android (\d+)', ua):
        m = re.search(r'Android (\d+\.?\d*)', ua)
        result["os"] = f"Android {m.group(1)}"
        result["device"] = "mobile"
    elif re.search(r'iPhone OS ([\d_]+)', ua):
        m = re.search(r'iPhone OS ([\d_]+)', ua)
        result["os"] = "iOS " + m.group(1).replace("_",".")
        result["device"] = "mobile"
    elif re.search(r'iPad', ua):
        result["os"] = "iPadOS"; result["device"] = "tablet"
    elif re.search(r'Linux', ua):
        result["os"] = "Linux"

    # Device type
    if re.search(r'Mobile|Android|iPhone|BlackBerry|IEMobile|Opera Mini', ua, re.I):
        result["device"] = "mobile"
    elif re.search(r'iPad|Tablet|Kindle|PlayBook', ua, re.I):
        result["device"] = "tablet"

    # Engine
    if re.search(r'Gecko/', ua) and not re.search(r'like Gecko', ua):
        m = re.search(r'rv:([\d.]+)', ua)
        result["engine"] = f"Gecko {m.group(1) if m else ''}"
    elif re.search(r'AppleWebKit/([\d.]+)', ua):
        m = re.search(r'AppleWebKit/([\d.]+)', ua)
        result["engine"] = f"WebKit {m.group(1)}"
    elif re.search(r'Trident/([\d.]+)', ua):
        m = re.search(r'Trident/([\d.]+)', ua)
        result["engine"] = f"Trident {m.group(1)}"

    # Browser
    if re.search(r'Edg/|Edge/', ua):
        m = re.search(r'Edg[e]?/([\d.]+)', ua)
        result["browser"] = "Microsoft Edge"; result["version"] = m.group(1) if m else None
    elif re.search(r'OPR/|Opera/', ua):
        m = re.search(r'(?:OPR|Opera)[/ ]([\d.]+)', ua)
        result["browser"] = "Opera"; result["version"] = m.group(1) if m else None
    elif re.search(r'Chrome/([\d.]+)', ua) and not re.search(r'Chromium', ua):
        m = re.search(r'Chrome/([\d.]+)', ua)
        result["browser"] = "Google Chrome"; result["version"] = m.group(1) if m else None
    elif re.search(r'Chromium/([\d.]+)', ua):
        m = re.search(r'Chromium/([\d.]+)', ua)
        result["browser"] = "Chromium"; result["version"] = m.group(1) if m else None
    elif re.search(r'Firefox/([\d.]+)', ua):
        m = re.search(r'Firefox/([\d.]+)', ua)
        result["browser"] = "Mozilla Firefox"; result["version"] = m.group(1) if m else None
    elif re.search(r'Safari/([\d.]+)', ua):
        m = re.search(r'Version/([\d.]+)', ua)
        result["browser"] = "Safari"; result["version"] = m.group(1) if m else None
    elif re.search(r'MSIE ([\d.]+)', ua):
        m = re.search(r'MSIE ([\d.]+)', ua)
        result["browser"] = "Internet Explorer"; result["version"] = m.group(1)
    elif re.search(r'Trident.*rv:([\d.]+)', ua):
        m = re.search(r'rv:([\d.]+)', ua)
        result["browser"] = "Internet Explorer 11"; result["version"] = m.group(1) if m else None

    return result

def main():
    print("[MODULE 168] USER AGENT ANALYZER")
    print("[SOURCE]     Local regex parser — no external calls")
    print()
    ua = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not ua:
        print("[USAGE]  Paste a User-Agent string")
        print('[EXAMPLE] Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36')
        sys.exit(0)

    r = parse_ua(ua)
    print(f"[RAW UA]         {ua[:120]}{'...' if len(ua)>120 else ''}")
    print()
    if r["bot"]:
        print(f"[BOT DETECTED]   YES — {r['bot_name']}")
    else:
        print(f"[BOT]            No")
    print(f"[BROWSER]        {r['browser'] or 'Unknown'}")
    print(f"[VERSION]        {r['version'] or 'Unknown'}")
    print(f"[ENGINE]         {r['engine'] or 'Unknown'}")
    print(f"[OS]             {r['os'] or 'Unknown'}")
    print(f"[DEVICE TYPE]    {r['device'].upper()}")
    print()

    # Security flags
    flags = []
    if r["bot"] and r["bot_name"] in ("Headless Chrome","PhantomJS","Selenium","Puppeteer"):
        flags.append("AUTOMATED BROWSER — headless/scraping tool detected")
    if "MSIE" in ua or ("Trident" in ua and "rv:11" not in ua):
        flags.append("LEGACY IE — very old browser, likely spoofed UA")
    if re.search(r'(sqlmap|nikto|nmap|masscan|zgrab|dirbuster|gobuster)', ua, re.I):
        flags.append("SCANNER SIGNATURE DETECTED in UA string")
    if len(ua) > 300:
        flags.append("UNUSUALLY LONG UA — possible injection attempt")
    if re.search(r'[<>"\']', ua):
        flags.append("SPECIAL CHARS in UA — possible XSS/injection attempt")

    if flags:
        print("[SECURITY FLAGS]")
        for f in flags: print(f"  ⚠  {f}")
    else:
        print("[SECURITY FLAGS]  None")

    print()
    print("[DONE] User agent analysis complete.")

if __name__ == "__main__":
    main()
