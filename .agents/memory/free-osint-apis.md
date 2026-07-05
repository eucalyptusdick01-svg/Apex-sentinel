---
name: Free OSINT/network APIs reachability
description: Which no-API-key public data sources are reachable vs. DNS-blocked from this Replit sandbox network, for OSINT/recon-style features.
---

When building features that need free, no-key public data lookups (IP/geo, ASN/BGP, whois, etc.), not every well-known free API is reachable from the Replit sandbox network. Verify with a direct `curl` before wiring a fetcher into app code.

Confirmed reachable (as of building Swept Sentinel, 2026-07):
- `ip-api.com` — IP geolocation, ISP, proxy/VPN detection
- `rdap.org` — RDAP whois lookups
- `open.kickbox.com` — disposable email domain check
- `api.github.com` — GitHub user lookups
- `archive.org` (Wayback Availability API)
- `ipinfo.io` — IP → ASN/org/geo (free tier, no key needed for basic fields)
- Raw Node `dns/promises` and `tls` (direct TLS handshake) work fine for DNS records and SSL cert inspection.

Confirmed NOT reachable (DNS resolution fails from this sandbox):
- `api.bgpview.io` — intended for BGP route/ASN lookups; use `ipinfo.io`'s `org` field (format `"AS15169 Google LLC"`) as a substitute for ASN + AS name.

**Why:** wasted a full implementation + test cycle before discovering bgpview.io doesn't resolve here, even though it's a valid public API elsewhere.

**How to apply:** before integrating a new free/public API for OSINT-style or network-data features, run a quick `curl -v --max-time 8 <url>` from the shell first. If DNS resolution fails, look for an equivalent reachable alternative rather than debugging the integration code.
