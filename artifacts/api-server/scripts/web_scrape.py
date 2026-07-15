#!/usr/bin/env python3
"""
web_scrape.py — Universal web scraper (clearnet + .onion via Tor)
Usage: web_scrape.py <url>  [--text | --links | --meta | --forms | --emails | --all]
"""
import sys, re, socket, time
from urllib.parse import urljoin, urlparse

def is_onion(url):
    return ".onion" in urlparse(url).netloc

def fetch_clearnet(url, timeout=15):
    import requests
    from requests.adapters import HTTPAdapter
    from urllib3.util.retry import Retry

    session = requests.Session()
    retry = Retry(total=2, backoff_factor=0.5)
    session.mount("http://", HTTPAdapter(max_retries=retry))
    session.mount("https://", HTTPAdapter(max_retries=retry))
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    }
    resp = session.get(url, headers=headers, timeout=timeout, allow_redirects=True)
    return resp.text, resp.status_code, resp.headers, resp.url

def fetch_onion(url, timeout=60):
    """Fetch a .onion URL via torpy (pure-Python Tor — no binary needed)."""
    try:
        from torpy.http.requests import TorRequests
        with TorRequests() as tr:
            with tr.get_session() as sess:
                resp = sess.get(url, timeout=timeout)
                return resp.text, resp.status_code, resp.headers, resp.url
    except ImportError:
        raise RuntimeError("torpy not installed")
    except Exception as e:
        raise RuntimeError(f"Tor connection failed: {e}")

def parse_page(html, base_url):
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, "html.parser")
    return soup, base_url

def extract_text(soup):
    for tag in soup(["script", "style", "noscript", "head"]):
        tag.decompose()
    text = soup.get_text(separator="\n")
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    return lines

def extract_links(soup, base_url):
    links = []
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if href.startswith(("http", "/", "#")):
            full = urljoin(base_url, href) if not href.startswith("http") else href
            text = a.get_text(strip=True)[:60]
            links.append((full, text))
    return links

def extract_meta(soup, resp_headers, final_url):
    meta = {}
    if soup.title:
        meta["title"] = soup.title.string
    for m in soup.find_all("meta"):
        name = m.get("name") or m.get("property") or ""
        content = m.get("content", "")
        if name and content:
            meta[name.lower()] = content[:120]
    meta["_server"] = resp_headers.get("Server", "—")
    meta["_content_type"] = resp_headers.get("Content-Type", "—")
    meta["_final_url"] = final_url
    return meta

def extract_forms(soup):
    forms = []
    for f in soup.find_all("form"):
        action = f.get("action", "")
        method = f.get("method", "GET").upper()
        inputs = []
        for inp in f.find_all(["input", "textarea", "select"]):
            itype = inp.get("type", inp.name)
            iname = inp.get("name", "")
            inputs.append(f"{itype}[{iname}]")
        forms.append({"action": action, "method": method, "inputs": inputs})
    return forms

def extract_emails_phones(text_lines):
    text = " ".join(text_lines)
    emails = list(set(re.findall(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", text)))
    phones = list(set(re.findall(r"\+?[\d\s\-\(\)]{7,15}\d", text)))
    phones = [p.strip() for p in phones if len(re.sub(r"\D","",p)) >= 7][:10]
    return emails[:20], phones

def main():
    if len(sys.argv) < 2:
        print("Usage: web_scrape.py <url>")
        sys.exit(1)

    raw = sys.argv[1].strip()
    mode = sys.argv[2].strip().lower() if len(sys.argv) > 2 else "all"

    if not raw.startswith(("http://","https://")):
        raw = "http://" + raw

    onion = is_onion(raw)
    parsed = urlparse(raw)

    print(f"[MODULE 172] WEB SCRAPER")
    print(f"[SOURCE]     requests + BeautifulSoup4" + (" + torpy (Tor circuit)" if onion else "") )
    print()
    print(f"[TARGET]     {raw}")
    print(f"[NETWORK]    {'TOR (.onion)' if onion else 'Clearnet'}")
    print()

    try:
        t0 = time.time()
        if onion:
            print(f"[TOR]        Building circuit... (this takes 10-30s)")
            sys.stdout.flush()
            html, status, headers, final_url = fetch_onion(raw)
        else:
            html, status, headers, final_url = fetch_clearnet(raw)
        elapsed = time.time() - t0

        print(f"[STATUS]     HTTP {status}")
        print(f"[FINAL URL]  {final_url}")
        print(f"[FETCH TIME] {elapsed:.2f}s")
        print(f"[SIZE]       {len(html):,} bytes")
        print()

        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, "html.parser")

        # ── META ──────────────────────────────────────────────────────────
        if mode in ("meta", "all"):
            meta = extract_meta(soup, headers, final_url)
            print(f"[META]")
            for k, v in meta.items():
                label = k.lstrip("_").upper().replace("-","_")
                if v:
                    print(f"  {label:<20} {v}")
            print()

        # ── TEXT ──────────────────────────────────────────────────────────
        if mode in ("text", "all"):
            lines = extract_text(BeautifulSoup(html, "html.parser"))
            limit = 60 if mode == "all" else 200
            print(f"[TEXT CONTENT]  ({len(lines)} lines total, showing first {min(limit, len(lines))})")
            for line in lines[:limit]:
                print(f"  {line[:120]}")
            if len(lines) > limit:
                print(f"  ... ({len(lines) - limit} more lines)")
            print()

        # ── EMAILS / PHONES ────────────────────────────────────────────────
        if mode in ("emails", "all"):
            lines = extract_text(BeautifulSoup(html, "html.parser"))
            emails, phones = extract_emails_phones(lines)
            print(f"[EMAILS FOUND]   {len(emails)}")
            for e in emails:
                print(f"  {e}")
            print(f"[PHONES FOUND]   {len(phones)}")
            for p in phones[:5]:
                print(f"  {p}")
            print()

        # ── LINKS ──────────────────────────────────────────────────────────
        if mode in ("links", "all"):
            links = extract_links(soup, final_url)
            limit = 30 if mode == "all" else 100
            print(f"[LINKS FOUND]  {len(links)} (showing first {min(limit, len(links))})")
            for href, text in links[:limit]:
                label = f" ({text})" if text else ""
                print(f"  {href}{label}")
            if len(links) > limit:
                print(f"  ... ({len(links) - limit} more links)")
            print()

        # ── FORMS ──────────────────────────────────────────────────────────
        if mode in ("forms", "all"):
            forms = extract_forms(soup)
            print(f"[FORMS FOUND]  {len(forms)}")
            for i, f in enumerate(forms, 1):
                print(f"  [{i}] {f['method']} → {f['action'] or '(this page)'}")
                for inp in f["inputs"]:
                    print(f"       field: {inp}")
            print()

        print(f"[DONE] Scrape complete.")

    except RuntimeError as e:
        print(f"[ERROR] {e}")
        if onion:
            print(f"[BLOCKED] Replit's sandbox network blocks outbound connections to Tor relay nodes.")
            print(f"[WORKAROUND] To scrape .onion sites, deploy this app to a VPS/dedicated server")
            print(f"             with Tor installed and the SOCKS5 proxy running on port 9050.")
            print(f"[NOTE]  Module 182 (PASTE INTEL via OTX) does index dark web/paste content.")
    except Exception as e:
        print(f"[ERROR] {type(e).__name__}: {e}")

if __name__ == "__main__":
    main()
