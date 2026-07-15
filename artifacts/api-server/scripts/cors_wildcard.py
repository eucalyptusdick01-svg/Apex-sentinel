"""CORS Wildcard — Module 74. Test CORS policy for dangerous wildcard/misconfiguration."""
import sys, urllib.request, urllib.error, urllib.parse, socket

def test_cors(url, origin, timeout=8):
    try:
        req = urllib.request.Request(url, headers={
            "Origin": origin,
            "User-Agent": "Mozilla/5.0",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "authorization,content-type",
        }, method="OPTIONS")
        resp = urllib.request.urlopen(req, timeout=timeout)
        headers = dict(resp.headers)
        return resp.status, headers
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers)
    except Exception as e:
        return None, {"error": str(e)}

def main():
    print("[MODULE 74] CORS WILDCARD CHECKER")
    print("[SOURCE]    HTTP OPTIONS probe — no external API key needed")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  https://api.example.com  — test CORS policy")
        sys.exit(0)

    target = raw if raw.startswith("http") else "https://" + raw
    parsed = urllib.parse.urlparse(target)
    domain = parsed.netloc

    TEST_ORIGINS = [
        "https://evil.com",
        f"https://{domain}.evil.com",
        f"https://evil{domain}",
        "null",
        "https://localhost",
        target,  # same-origin
    ]

    print(f"[TARGET]   {target}")
    print()

    findings = []
    for origin in TEST_ORIGINS:
        code, headers = test_cors(target, origin)
        acao = headers.get("access-control-allow-origin","")
        acac = headers.get("access-control-allow-credentials","")
        acam = headers.get("access-control-allow-methods","")

        vuln = False
        risk = "LOW"
        notes = []

        if acao == "*":
            notes.append("Wildcard (*) — allows any origin")
            risk = "MEDIUM"
        if acao == origin and origin not in (target,):
            notes.append(f"Reflects arbitrary origin: {origin}")
            risk = "HIGH"
            vuln = True
        if acac.lower() == "true" and acao == "*":
            notes.append("Wildcard + credentials=true — CRITICAL misconfiguration")
            risk = "CRITICAL"
            vuln = True
        if acac.lower() == "true" and acao == origin and origin == "null":
            notes.append("null origin + credentials=true — exploitable from sandboxed iframe")
            risk = "CRITICAL"
            vuln = True

        flag = "✗ VULN" if vuln else ("⚠ WARN" if risk in ("MEDIUM","HIGH") else "✓ SAFE")
        print(f"  {flag}  Origin={origin[:40]:<40}  ACAO={acao[:30]:<30}  ACAC={acac}")
        if notes:
            for n in notes: print(f"            → {n}")
        findings.append({"origin":origin,"acao":acao,"acac":acac,"risk":risk,"vuln":vuln,"methods":acam})

    print()
    highest = max(findings, key=lambda x: ["LOW","MEDIUM","HIGH","CRITICAL"].index(x["risk"]))
    print(f"[HIGHEST RISK]  {highest['risk']}")

    if any(f["vuln"] for f in findings):
        print()
        print("[VULNERABILITIES FOUND]")
        for f in [f for f in findings if f["vuln"]]:
            print(f"  Origin: {f['origin']}  →  ACAO: {f['acao']}  Credentials: {f['acac']}")
        print()
        print("[FIX]  Explicitly whitelist allowed origins; never reflect arbitrary Origin headers")
        print("[FIX]  Never combine Access-Control-Allow-Credentials: true with ACAO: *")

    print()
    print("[DONE] CORS wildcard check complete.")

if __name__ == "__main__":
    main()
