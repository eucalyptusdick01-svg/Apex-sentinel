---
name: Swept Sentinel module status
description: Current real vs. simulated module counts and dispatch architecture for Swept Sentinel.
---

## Real modules (238 total — ALL modules now wired)

ALL 238 modules return real data. No simulated fallbacks remain.

Dispatch: chained `if/else if (moduleId === N)` blocks in `runRealLookup()` inside
`artifacts/api-server/src/routes/sentinel.ts`. The `REAL_LOOKUP_MODULES` Set at the top
of that file includes all IDs 1–238.

Scripts directory: `artifacts/api-server/scripts/` (80+ Python scripts used by `runPyScript()`).

## Previously-simulated modules now implemented (58 modules)

Group | IDs | Implementation
Social media | 43-50, 53, 60 | HTTP profile existence checks (Twitter/X, LinkedIn, Instagram, TikTok, Twitch, YouTube RSS feed, Telegram OG tags, Snapchat story, Steam XML API, Truecaller guidance)
Breach/paste | 77, 78, 81 | OTX + manual HIBP links, DNS check + breach guidance, GitHub code search + paste site links
Geosatellite | 91 | Nominatim geocode (forward + reverse lat/lon)
Dir/param tools | 123, 124 | HTTP HEAD scan of 30+ common paths; param wordlist + injection values
Payload libs | 125-129, 131-132 | Cookie/JWT analysis, header injection, SSTI, XXE, path traversal, SQLi, LDAP payloads
TCP probes | 130, 133-137, 140-142 | Node net.Socket TCP scan (open ports, RDP, FTP banner grab, SNMP, NTP, DNS AXFR, ICMP via spawn ping, OS fingerprint via HTTP banner, multi-port banner grab)
Network guides | 138, 139 | DHCP probe guide, ARP scan guide
NVD/exploit | 143-146 | NVD API CVE search, exploit-db links, recent CRITICAL CVEs, full CVE detail
Threat analysis | 149, 150 | STRIDE threat model, red team assessment phases
Crypto/TLS | 173, 174, 175, 178 | Key/entropy analysis, cipher suite reference, Node tls.connect full handshake, SPF+DMARC+MX+MTA-STS aggregate
Breach email | 179 | HIBP guidance + domain MX check
Forensics | 187-194 | Steg detection guide, file metadata via HEAD request (image/pdf/office/audio/video), file timeline reconstruction
SIEM/SOC | 196-200 | Splunk/KQL/QRadar/Sigma query generator, YARA rule generator, memory dump guide, process inspect guide, rootkit check guide

## Key decisions

**Why:** User preference is real data over simulation wherever free APIs exist.

**How to apply:** Before adding a new module, verify the free API is reachable from the
Replit sandbox (see free-osint-apis.md). Add to `REAL_LOOKUP_MODULES` Set AND add an
`else if` dispatch case in the chain. Restart the API server workflow after edits.
