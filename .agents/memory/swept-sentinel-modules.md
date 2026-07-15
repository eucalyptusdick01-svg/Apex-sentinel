---
name: Swept Sentinel module status
description: Current real vs. simulated module counts and dispatch architecture for Swept Sentinel.
---

## Real modules (172 total)

IDs: 1–42, 51–52, 54–59, 61–122, 147–148, 151–171, 176–177, 180–186, 195, 201–230.

All dispatch cases live in `artifacts/api-server/src/routes/sentinel.ts` as chained `if/else if (moduleId === N)` blocks. The `runPyScript()` helper runs a Python script from `artifacts/api-server/scripts/` and returns its stdout as lines.

Scripts directory: `artifacts/api-server/scripts/` (80+ scripts).

## Simulated (58 modules)

IDs: 43–50, 53, 60, 81, 91, 123–146, 149–150, 172–175, 178–179, 187–194, 196–200. These fall through to `fetchIpLookupLines()` which returns simulated output — acceptable because they genuinely need paid/authenticated APIs (breach DBs, phone OSINT, satellite imagery, social platforms requiring OAuth, exploit DBs, SIEM).

## Key decisions

**Why:** User preference is real data over simulation wherever free APIs exist. Simulated modules are only left simulated if they need paid/authenticated APIs.

**How to apply:** Before adding a new "real" module, verify the free API is reachable from the Replit sandbox (see free-osint-apis.md). Add to REAL_LOOKUP_MODULES set (top of sentinel.ts) AND add an `else if` dispatch case in the chain. Always run `pnpm --filter @workspace/api-server run typecheck` after editing sentinel.ts, then restart the workflow.
