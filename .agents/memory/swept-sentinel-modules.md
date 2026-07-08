---
name: Swept Sentinel module status
description: Current real vs. simulated module counts and dispatch architecture for Swept Sentinel.
---

## Real modules (128 total)

IDs: 1–42, 51–52, 54–59, 61–72, 82, 86–87, 90, 92–103, 104–112, 115, 118, 151–163, 165–166, 169–170, 201–216, 220–222, 225, 227, 230.

All dispatch cases live in `artifacts/api-server/src/routes/sentinel.ts` as chained `if/else if (moduleId === N)` blocks starting around line 2665. The `runPyScript()` helper (line ~974) runs a Python script from `artifacts/api-server/scripts/` and returns its stdout as lines.

All 80+ scripts live in `artifacts/api-server/scripts/`.

## Simulated (102 modules)

IDs: 43–50, 53, 60, 73–81, 83–85, 88–89, 91, 113–114, 116–117, 119–150, 164, 167–168, 171–200, 217–219, 223–224, 226, 228–229. These fall through to `fetchIpLookupLines()` which returns simulated output — acceptable because they genuinely need paid/authenticated APIs.

## Key decisions

**Why:** User preference is real data over simulation wherever free APIs exist. Simulated modules are only left simulated if they need paid/authenticated APIs (breach DBs, phone OSINT, satellite imagery, social platforms requiring OAuth, etc.).

**How to apply:** Before adding a new "real" module, verify the free API is reachable from the Replit sandbox (see free-osint-apis.md). Add to REAL_LOOKUP_MODULES set (line ~283) AND add an `else if` dispatch case in the chain. Always typecheck after editing sentinel.ts.
