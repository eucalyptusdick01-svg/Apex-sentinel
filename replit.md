# Swept Sentinel

An OSINT / network reconnaissance dashboard — pick a target (IP, domain, email, username) and run investigation modules against it from a retro terminal-style UI.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/swept-sentinel run dev` — run the dashboard frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/api-server/src/routes/sentinel.ts` — all module dispatch + lookup logic (real data fetchers and simulated modules) live here
- `artifacts/swept-sentinel/src/pages/Dashboard.tsx` — main dashboard UI, module grid, target input, live output terminal
- `artifacts/api-server/scripts/` — 80+ Python scripts, one per real module

## Architecture decisions

- The dashboard exposes 230 "modules" (numbered, categorized by ID range: NETWORK ≤10, SOCIAL ≤50, RECON ≤100, EXPLOIT ≤150, INTEL ≤200, ADVANCED >200 per `getModuleCategory`). Real free/no-key implementations are preferred; modules are only simulated when they genuinely require paid/authenticated APIs (breach DBs, phone OSINT, satellite imagery, most social platforms, exploit tooling) — do not fake real results for those.
- Real-data modules (141 total — IDs 1–42, 51–52, 54–59, 61–72, 79–80, 82, 84–88, 90, 92–103, 104–112, 115, 118, 151–163, 165–166, 169–170, 180–186, 201–216, 220–222, 225, 227, 230): IP Tracker/Geolocate/Proxy Check (ip-api.com), DNS Resolve (Node `dns/promises`), Port Scan (raw TCP connect scan), Whois Query (RDAP), Email Rep (DNS MX), DB/News/People/Image/Site Search (SerpApi — requires SERPAPI_KEY), GitHub Lookup, Username Check, SSL Cert Info (raw TLS), Wayback Check (archive.org), HTTP Fingerprint, VIN Check (NHTSA), CVE Lookup (NVD), MAC Lookup (api.macvendors.com), BGP Route (ipinfo.io), CDN Origin, DMARC Analyze, Subdomain Scan (HackerTarget), Reverse IP (HackerTarget), Tech Stack, Admin Finder, Robots Scan, API Probe, Cert History (crt.sh), Shodan Probe (InternetDB), Threat Intel (GreyNoise), Tor Check, URL Scan (urlscan.io), CORS Check, CSP Analyze, REST Probe, Entropy Calc, String Extract, File Ident, AES Cipher (cryptography), RSA Keygen (cryptography), Passphrase Gen, HMAC Calc, Hash Compare, Regex Test, Cron Parser, TZ Convert, Rand Data, Pass Audit, Token Count, Evidence Hash, QR Encode (qrcode), Code Stats, Reddit User, HackerNews User, Gravatar, GitLab User, Mastodon User, DEV.to User, Discord Snowflake, PyPI Lookup, npm User/Package, Docker Hub, Keybase, StackOverflow, DNSSEC Check, CAA Record, SPF Check, DKIM Check, MX DeepDive, NS Lookup, SOA Record, TXT Records, PTR Lookup, Redirect Chain, Cookie Audit, Header Grade, HSTS Check, HTTP Methods, HTTP/2 Check, Clickjack Test, Domain Age, Email Validate, IPInfo Full (ipinfo.io), Traceroute, CIDR Calc, IP Convert, Port Reference, HTTP Status, IOC Extract, Typosquat, Base64 Coder, Hex Coder, URL Coder, HTML Coder, ROT13, Caesar Cipher, Vigenère Cipher, Morse Code, JWT Decode, Wordlist Gen, Banner Grab, JSON Format, Date Calc, Unit Convert, Color Convert, Num Base, Unicode Info, Phish Check/Malware URL (VirusTotal), Honeypot Check/Blocklist Check/Abuse IPDB (AbuseIPDB), Breach Intel/Paste Intel/Dark Web Intel (AlienVault OTX), FCC Callsign (callook.info), Ham Lookup (hamdb.org), DMR Lookup (radioid.net).
- Simulated (90 modules, all genuinely need paid/authenticated APIs): 43–50, 53, 60, 73–78, 81, 83, 89, 91, 113–114, 116–117, 119–150, 164, 167–168, 171–180, 187–200, 217–219, 223–224, 226, 228–229.
- Module results stream to the client over SSE (`/api/sentinel/stream/:runId`) line-by-line to mimic a live terminal feed, whether the module is real or simulated.

## Product

- Terminal-styled dashboard: enter a target (IP/domain/email/username), pick one of 230 numbered modules, watch live streamed output in a console pane.
- 128 modules return real, live data (free APIs/protocols or local computation). 102 are simulated placeholders for modules that genuinely require paid/authenticated data sources.

## User preferences

- Prefer real, free (no-API-key) live data over mocked/simulated output wherever a feasible free source exists. Only leave a module simulated when it genuinely needs a paid/authenticated API.

## Gotchas

- `api.bgpview.io` does not resolve from this environment's network (DNS lookup fails) — the BGP Route module uses `ipinfo.io` instead, which is reachable and returns ASN/org data via its free tier.
- After editing `sentinel.ts`, always run `pnpm --filter @workspace/api-server run typecheck` and restart the `artifacts/api-server: API Server` workflow before curl-testing.
- `cryptography` and `qrcode` pip packages are installed in the environment.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
