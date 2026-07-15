"""MITRE ATT&CK — Module 148. Query MITRE ATT&CK techniques via free TAXII API."""
import sys, urllib.request, urllib.error, json, re

TAXII_BASE = "https://cti-taxii.mitre.org"
ATT_COLLECTION = "95ecc380-afe9-11e4-9b6c-751b66dd541e"

# Fallback local data for most common techniques
LOCAL_TECHNIQUES = {
    "T1059": {"name":"Command and Scripting Interpreter","tactic":"Execution","subtechs":["T1059.001 PowerShell","T1059.003 Windows Command Shell","T1059.004 Unix Shell"]},
    "T1055": {"name":"Process Injection","tactic":"Defense Evasion / Privilege Escalation","subtechs":["T1055.001 DLL Injection","T1055.003 Thread Execution Hijacking","T1055.012 Process Hollowing"]},
    "T1078": {"name":"Valid Accounts","tactic":"Initial Access / Persistence","subtechs":["T1078.001 Default Accounts","T1078.002 Domain Accounts","T1078.003 Local Accounts"]},
    "T1027": {"name":"Obfuscated Files or Information","tactic":"Defense Evasion","subtechs":["T1027.001 Binary Padding","T1027.002 Software Packing","T1027.004 Compile After Delivery"]},
    "T1053": {"name":"Scheduled Task/Job","tactic":"Execution / Persistence","subtechs":["T1053.002 At","T1053.003 Cron","T1053.005 Scheduled Task"]},
    "T1021": {"name":"Remote Services","tactic":"Lateral Movement","subtechs":["T1021.001 Remote Desktop Protocol","T1021.002 SMB/Windows Admin Shares","T1021.004 SSH"]},
    "T1190": {"name":"Exploit Public-Facing Application","tactic":"Initial Access","subtechs":[]},
    "T1566": {"name":"Phishing","tactic":"Initial Access","subtechs":["T1566.001 Spearphishing Attachment","T1566.002 Spearphishing Link","T1566.003 Spearphishing via Service"]},
    "T1046": {"name":"Network Service Discovery","tactic":"Discovery","subtechs":[]},
    "T1082": {"name":"System Information Discovery","tactic":"Discovery","subtechs":[]},
    "T1083": {"name":"File and Directory Discovery","tactic":"Discovery","subtechs":[]},
    "T1087": {"name":"Account Discovery","tactic":"Discovery","subtechs":["T1087.001 Local Account","T1087.002 Domain Account"]},
    "T1110": {"name":"Brute Force","tactic":"Credential Access","subtechs":["T1110.001 Password Guessing","T1110.002 Password Cracking","T1110.003 Password Spraying"]},
    "T1003": {"name":"OS Credential Dumping","tactic":"Credential Access","subtechs":["T1003.001 LSASS Memory","T1003.002 Security Account Manager","T1003.003 NTDS"]},
    "T1071": {"name":"Application Layer Protocol","tactic":"Command and Control","subtechs":["T1071.001 Web Protocols","T1071.002 File Transfer Protocols","T1071.003 Mail Protocols","T1071.004 DNS"]},
    "T1041": {"name":"Exfiltration Over C2 Channel","tactic":"Exfiltration","subtechs":[]},
    "T1486": {"name":"Data Encrypted for Impact","tactic":"Impact","subtechs":[]},
    "T1490": {"name":"Inhibit System Recovery","tactic":"Impact","subtechs":[]},
}

def fetch_technique(technique_id):
    """Try to fetch from MITRE TAXII, fall back to local data."""
    tech_id = technique_id.upper()

    # Try local first (faster, always available)
    if tech_id in LOCAL_TECHNIQUES:
        return LOCAL_TECHNIQUES[tech_id], "local"

    # Try MITRE STIX API
    try:
        url = f"https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/attack-pattern/attack-pattern--{tech_id.lower().replace('.','-')}.json"
        req = urllib.request.Request(url, headers={"User-Agent":"swept-sentinel/1.0"})
        resp = urllib.request.urlopen(req, timeout=8)
        data = json.loads(resp.read())
        return data, "mitre-cti"
    except:
        pass

    return None, None

def search_by_name(query):
    """Search local techniques by name/tactic."""
    results = []
    for tid, t in LOCAL_TECHNIQUES.items():
        if (query.lower() in t["name"].lower() or
            query.lower() in t["tactic"].lower() or
            any(query.lower() in s.lower() for s in t.get("subtechs",[]))):
            results.append((tid, t))
    return results

def main():
    print("[MODULE 148] MITRE ATT&CK")
    print("[SOURCE]     Local ATT&CK knowledge base + MITRE CTI GitHub (free)")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  T1059              — look up technique by ID")
        print("[USAGE]  phishing           — search by name/keyword")
        print("[USAGE]  initial access     — search by tactic")
        print("[USAGE]  list               — show all local techniques")
        sys.exit(0)

    # Check if it's a technique ID
    tech_match = re.match(r'^(T\d{4}(?:\.\d{3})?)$', raw.upper())

    if raw.lower() == "list":
        print(f"[LOCAL TECHNIQUE DATABASE]  ({len(LOCAL_TECHNIQUES)} techniques)")
        print()
        tactics = {}
        for tid, t in LOCAL_TECHNIQUES.items():
            tac = t["tactic"].split(" / ")[0]
            tactics.setdefault(tac, []).append((tid, t["name"]))
        for tac in sorted(tactics):
            print(f"[{tac.upper()}]")
            for tid, name in sorted(tactics[tac]):
                print(f"  {tid}  {name}")
            print()

    elif tech_match:
        tech_id = tech_match.group(1)
        data, source = fetch_technique(tech_id)

        if not data:
            print(f"[NOT FOUND]  {tech_id} not in local database")
            print(f"[HINT]  See https://attack.mitre.org/techniques/{tech_id}/")
            sys.exit(0)

        print(f"[TECHNIQUE]  {tech_id}")
        print(f"[NAME]       {data['name']}")
        print(f"[TACTIC]     {data['tactic']}")
        print(f"[SOURCE]     {source}")
        print()

        if data.get("subtechs"):
            print(f"[SUB-TECHNIQUES]")
            for s in data["subtechs"]:
                print(f"  {s}")
            print()

        # Defensive suggestions
        print(f"[DETECTION TIPS]")
        detections = {
            "T1059": ["Monitor process creation for interpreters (cmd.exe, powershell.exe, bash)","Log script execution events","Use application whitelisting"],
            "T1055": ["Monitor for unusual process parent/child relationships","Use EDR behavioral detection","Enable Windows Defender Credential Guard"],
            "T1078": ["Enable MFA on all accounts","Monitor logins from unusual IPs/times","Audit service accounts"],
            "T1190": ["Patch internet-facing applications promptly","WAF in front of web apps","Vulnerability scanning"],
            "T1566": ["Email security gateway + sandboxing","User security awareness training","DMARC/SPF/DKIM enforcement"],
            "T1110": ["Account lockout policies","MFA","Monitor authentication logs for spraying patterns"],
        }
        tips = detections.get(tech_id, ["Monitor behavior associated with this technique","Review MITRE ATT&CK mitigations at attack.mitre.org"])
        for tip in tips:
            print(f"  • {tip}")

        print()
        print(f"[REFERENCE]  https://attack.mitre.org/techniques/{tech_id}/")

    else:
        # Search
        results = search_by_name(raw)
        if results:
            print(f"[SEARCH]  '{raw}' — {len(results)} matches")
            print()
            for tid, t in results:
                print(f"  {tid}  {t['name']}")
                print(f"        Tactic: {t['tactic']}")
                if t.get("subtechs"):
                    print(f"        Sub-techniques: {', '.join(s.split()[0] for s in t['subtechs'])}")
                print()
        else:
            print(f"[NO RESULTS]  '{raw}' not found in local database")
            print(f"[TIP]  Try: T1059, T1566, T1110, T1190, list")

    print()
    print("[DONE] MITRE ATT&CK lookup complete.")

if __name__ == "__main__":
    main()
