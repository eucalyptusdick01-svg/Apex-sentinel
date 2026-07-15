"""Email Header — Module 167. Parse and analyze raw email headers."""
import sys, re

def parse_received(val):
    """Extract from/by/with/for from a Received: header."""
    parts = {}
    for key in ("from","by","with","for","via","id"):
        m = re.search(rf'\b{key}\s+(\S+)', val, re.IGNORECASE)
        if m:
            parts[key] = m.group(1)
    ts_m = re.search(r';\s*(.+)$', val)
    if ts_m:
        parts['timestamp'] = ts_m.group(1).strip()
    return parts

def auth_result_parse(val):
    results = []
    for check in re.finditer(r'(spf|dkim|dmarc|arc)\s*=\s*(\S+)', val, re.IGNORECASE):
        results.append(f"{check.group(1).upper()}={check.group(2)}")
    return results

def main():
    print("[MODULE 167] EMAIL HEADER ANALYZER")
    print("[SOURCE]     Local RFC 5321/5322 parser — no external calls")
    print()
    raw = (sys.argv[1].strip() if len(sys.argv) > 1 else "").strip()
    if not raw:
        print("[USAGE]  Paste raw email headers as the target")
        print("[USAGE]  OR provide key:value — e.g.  from:user@example.com")
        print("[EXAMPLE] From: Alice <alice@example.com>")
        sys.exit(0)

    lines = raw.replace("\\n", "\n").split("\n")
    headers = {}
    received_list = []
    current_key = None
    for line in lines:
        if re.match(r'^\s', line) and current_key:
            headers[current_key][-1] += " " + line.strip()
            continue
        m = re.match(r'^([\w-]+)\s*:\s*(.*)$', line)
        if m:
            key = m.group(1).lower()
            val = m.group(2).strip()
            if key == "received":
                received_list.append(val)
            else:
                headers.setdefault(key, []).append(val)
            current_key = key

    if not headers and not received_list:
        # single-field input
        print(f"[INPUT]  {raw}")
        print()
        print("[INFO] No structured headers detected.")
        print("[INFO] Paste full email headers (From: Subject: Received: etc.)")
        sys.exit(0)

    def h(k, default="N/A"):
        vals = headers.get(k, [])
        return vals[0] if vals else default

    print(f"[FROM]           {h('from')}")
    print(f"[TO]             {h('to')}")
    print(f"[SUBJECT]        {h('subject')}")
    print(f"[DATE]           {h('date')}")
    print(f"[REPLY-TO]       {h('reply-to')}")
    print(f"[RETURN-PATH]    {h('return-path')}")
    print(f"[MESSAGE-ID]     {h('message-id')}")
    print()

    # Auth results
    auth_raw = headers.get("authentication-results", [])
    if auth_raw:
        print("[AUTH RESULTS]")
        for ar in auth_raw:
            checks = auth_result_parse(ar)
            for c in checks:
                flag = "✓" if "=pass" in c.lower() else ("✗" if "=fail" in c.lower() else "?")
                print(f"  {flag}  {c}")
        print()

    dkim = h('dkim-signature')
    if dkim != "N/A":
        dom_m = re.search(r'd=([^;]+)', dkim)
        sel_m = re.search(r's=([^;]+)', dkim)
        alg_m = re.search(r'a=([^;]+)', dkim)
        print(f"[DKIM SIGNATURE]  domain={dom_m.group(1) if dom_m else '?'}  selector={sel_m.group(1) if sel_m else '?'}  alg={alg_m.group(1) if alg_m else '?'}")
        print()

    # Received chain
    if received_list:
        print(f"[RECEIVED CHAIN]  ({len(received_list)} hops, newest first)")
        for i, r in enumerate(received_list, 1):
            p = parse_received(r)
            frm = p.get("from","?"); by = p.get("by","?"); ts = p.get("timestamp","?")
            print(f"  [HOP {i}]  {frm}  →  {by}  ({ts[:30] if ts else ''})")
        print()

    # MIME
    ct = h('content-type')
    print(f"[CONTENT-TYPE]   {ct}")
    print(f"[MIME-VERSION]   {h('mime-version')}")
    print(f"[X-MAILER]       {h('x-mailer')}")
    print(f"[X-SPAM-STATUS]  {h('x-spam-status')}")
    print(f"[X-SPAM-SCORE]   {h('x-spam-score')}")
    print()

    # Routing anomaly flags
    flags = []
    from_val = h('from')
    rp_val = h('return-path')
    if from_val != "N/A" and rp_val != "N/A":
        from_dom = re.search(r'@([\w.-]+)', from_val)
        rp_dom = re.search(r'@([\w.-]+)', rp_val)
        if from_dom and rp_dom and from_dom.group(1) != rp_dom.group(1):
            flags.append(f"DOMAIN MISMATCH: From={from_dom.group(1)} vs ReturnPath={rp_dom.group(1)}")
    if len(received_list) > 6:
        flags.append(f"LONG RELAY CHAIN: {len(received_list)} hops (possible evasion)")
    spam_s = h('x-spam-status').lower()
    if 'yes' in spam_s:
        flags.append("FLAGGED AS SPAM by receiving server")

    if flags:
        print("[ANOMALIES DETECTED]")
        for f in flags: print(f"  ⚠  {f}")
    else:
        print("[ANOMALIES]  None detected")

    print()
    print("[DONE] Email header analysis complete.")

if __name__ == "__main__":
    main()
