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

## Architecture decisions

- The dashboard exposes 230 "modules" (numbered, categorized by ID range: NETWORK ≤10, SOCIAL ≤50, RECON ≤100, EXPLOIT ≤150, INTEL ≤200, ADVANCED >200 per `getModuleCategory`). A small subset run real, free, no-API-key lookups; the rest are intentionally simulated because they'd require paid/authenticated APIs (breach DBs, phone OSINT, satellite imagery, most social platforms, exploit tooling) — do not fake real results for those.
- Real-data modules implemented so far (IDs 1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,71,92,93,94,95,96,97,98,99,100,151,152,153,154,155,156,201,207,208,209,210,211,230 — 45 total): IP Tracker/Geolocate/Proxy Check (ip-api.com), DNS Resolve (Node `dns/promises`), Port Scan (raw TCP connect scan), Whois Query (RDAP via rdap.org), Email Rep (DNS MX + Kickbox), DB Search/News Search/People Search/Image Search/Site Enum (SerpApi Google — requires SERPAPI_KEY), GitHub Lookup (api.github.com), Username Check (GitHub + Reddit), SSL Cert Info (raw TLS), Wayback Check (archive.org), HTTP Fingerprint (headers), VIN Check (NHTSA free API), CVE Lookup (NVD/NIST free API), MAC Lookup (api.macvendors.com), BGP Route (ipinfo.io — see Gotchas), CDN Origin (DNS CNAME + HTTP headers), DMARC Analyze (DNS TXT), Subdomain Scan (HackerTarget hostsearch), Reverse IP (HackerTarget reverseiplookup), Tech Stack (header + source fingerprinting), Admin Finder (HTTP probe 27 paths), Robots Scan (robots.txt + sitemap.xml), API Probe (29 common API/doc endpoints), Cert History (crt.sh certificate transparency — note: slow for large domains), Shodan Probe (Shodan InternetDB — free no-key, open ports/vulns), Threat Intel (GreyNoise Community — free no-key, scanner classification), Tor Check (Tor Project exit node list), URL Scan (URLScan.io public search).
- Module results stream to the client over SSE (`/api/sentinel/stream/:runId`) line-by-line to mimic a live terminal feed, whether the module is real or simulated.

## Product

- Terminal-styled dashboard: enter a target (IP/domain/email/username), pick one of 230 numbered modules, watch live streamed output in a console pane.
- 14 modules currently return real, live data from free public APIs/protocols (no API keys required). The remainder are simulated placeholders pending paid/authenticated data sources.

## User preferences

- Prefer real, free (no-API-key) live data over mocked/simulated output wherever a feasible free source exists. Only leave a module simulated when it genuinely needs a paid/authenticated API.

## Gotchas

- `api.bgpview.io` does not resolve from this environment's network (DNS lookup fails) — the BGP Route module uses `ipinfo.io` instead, which is reachable and returns ASN/org data via its free tier.
- After editing `sentinel.ts`, always run `pnpm --filter @workspace/api-server run typecheck` and restart the `artifacts/api-server: API Server` workflow before curl-testing.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
