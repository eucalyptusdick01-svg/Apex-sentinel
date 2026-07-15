"""NVD Search — Module 147. Full-text CVE search via NVD API v2."""
import sys, urllib.request, urllib.error, json, urllib.parse, re

NVD_API = "https://services.nvd.nist.gov/rest/json/cves/2.0"

def nvd_search(keyword=None, cve_id=None, cpeName=None, severity=None, max_results=10):
    params = {"resultsPerPage": max_results, "startIndex": 0}
    if cve_id:
        params["cveId"] = cve_id
    elif keyword:
        params["keywordSearch"] = keyword
    elif cpeName:
        params["cpeName"] = cpeName
    if severity:
        params["cvssV3Severity"] = severity.upper()

    url = NVD_API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={
        "User-Agent": "swept-sentinel/1.0",
        "Accept": "application/json"
    })
    resp = urllib.request.urlopen(req, timeout=15)
    return json.loads(resp.read())

def format_cve(vuln):
    cve = vuln.get("cve", {})
    cve_id = cve.get("id","?")
    published = cve.get("published","?")[:10]
    modified = cve.get("lastModified","?")[:10]

    descs = cve.get("descriptions",[])
    desc = next((d["value"] for d in descs if d.get("lang") == "en"), "No description")[:300]

    # CVSS score
    metrics = cve.get("metrics",{})
    score = "?"
    severity = "?"
    vector = ""
    for key in ("cvssMetricV31","cvssMetricV30","cvssMetricV2"):
        if key in metrics and metrics[key]:
            m = metrics[key][0]
            cvss_data = m.get("cvssData",{})
            score = cvss_data.get("baseScore","?")
            severity = m.get("baseSeverity", cvss_data.get("baseSeverity","?"))
            vector = cvss_data.get("vectorString","")
            break

    # References
    refs = cve.get("references",[])

    # CWE
    weaknesses = cve.get("weaknesses",[])
    cwes = []
    for w in weaknesses:
        for d in w.get("description",[]):
            if d.get("value","").startswith("CWE-"):
                cwes.append(d["value"])

    return {
        "id": cve_id,
        "published": published,
        "modified": modified,
        "description": desc,
        "score": score,
        "severity": severity,
        "vector": vector,
        "refs": [r.get("url","") for r in refs[:3]],
        "cwes": cwes,
    }

def main():
    print("[MODULE 147] NVD SEARCH")
    print("[SOURCE]     NVD API v2 — services.nvd.nist.gov (free, no key required)")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  apache log4j             — keyword search")
        print("[USAGE]  CVE-2021-44228           — direct CVE lookup")
        print("[USAGE]  nginx critical           — keyword + severity filter")
        print("[USAGE]  cpe:apache:httpd:2.4.51  — CPE-based search")
        sys.exit(0)

    # Parse input
    cve_id = None
    keyword = None
    cpeName = None
    severity = None

    if re.match(r'^CVE-\d{4}-\d+$', raw, re.I):
        cve_id = raw.upper()
    elif raw.lower().startswith("cpe:"):
        cpeName = "cpe:2.3:a:" + raw[4:]
    else:
        # Extract severity modifier
        for sev in ("critical","high","medium","low"):
            if raw.lower().endswith(sev):
                severity = sev
                keyword = raw[:-(len(sev)+1)].strip()
                break
        if not keyword:
            keyword = raw

    if cve_id:
        print(f"[LOOKUP]   {cve_id}")
    elif keyword:
        print(f"[SEARCH]   '{keyword}'" + (f"  severity={severity.upper()}" if severity else ""))
    print()

    try:
        data = nvd_search(keyword=keyword, cve_id=cve_id, cpeName=cpeName,
                          severity=severity, max_results=10)
    except urllib.error.HTTPError as e:
        print(f"[ERROR]  NVD API HTTP {e.code}: {e.reason}")
        if e.code == 403:
            print("[INFO]  NVD rate limits unauthenticated requests — wait 30s and retry")
            print("[INFO]  For heavy usage, get a free API key at nvd.nist.gov/developers")
        sys.exit(1)
    except Exception as e:
        print(f"[ERROR]  {e}")
        sys.exit(1)

    total = data.get("totalResults", 0)
    vulns = data.get("vulnerabilities", [])

    print(f"[TOTAL RESULTS]  {total:,}")
    print(f"[SHOWING]        {len(vulns)}")
    print()

    for v in vulns:
        c = format_cve(v)
        score_fmt = f"{c['score']}" if c['score'] != "?" else "N/A"
        sev_fmt = c["severity"].upper() if c["severity"] != "?" else ""
        sev_color = {"CRITICAL":"✗✗","HIGH":"✗","MEDIUM":"⚠","LOW":"ℹ"}.get(sev_fmt,"•")

        print(f"{sev_color} [{c['id']}]  Score: {score_fmt}/10  {sev_fmt}")
        print(f"  Published: {c['published']}  Modified: {c['modified']}")
        if c["cwes"]: print(f"  CWEs: {', '.join(c['cwes'])}")
        if c["vector"]: print(f"  Vector: {c['vector']}")
        print(f"  {c['description'][:250]}")
        for ref in c["refs"][:2]:
            print(f"  → {ref}")
        print()

    if not vulns:
        print("[NO RESULTS]  No CVEs found matching your query")

    print("[DONE] NVD search complete.")

if __name__ == "__main__":
    main()
