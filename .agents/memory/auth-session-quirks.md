---
name: Auth & Session quirks
description: Known issues and fixes for the Swept Sentinel auth stack (bcryptjs, connect-pg-simple, Express 5 params).
---

## bcrypt native addon blocked
`bcrypt` (native addon) is blocked by pnpm build scripts policy in this sandbox. Use `bcryptjs` instead — it's a pure-JS drop-in with the same API.

**How to apply:** Always install `bcryptjs` + `@types/bcryptjs`, never `bcrypt`.

## connect-pg-simple createTableIfMissing fails after esbuild bundle
`createTableIfMissing: true` reads a `table.sql` file relative to the package. After esbuild bundles everything to `dist/`, the SQL file can't be found at runtime — you get `ENOENT: .../dist/table.sql`.

**Fix:** Create the session table manually with raw SQL before starting the server, then omit `createTableIfMissing` from the PgStore options. Use `executeSql()` in the code_execution notebook.

Standard session table SQL:
```sql
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
) WITH (OIDS=FALSE);
ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
```

## Express 5 req.params types
In `@types/express@^5`, `req.params[key]` is typed as `string | string[]`, not `string`. Drizzle `eq()` accepts `string | SQLWrapper` — passing `string | string[]` causes TS2345.

**Fix:** Always cast: `const id = String(req.params.userId)` or `const id = req.params.userId as string`.

## React Query retries block auth redirect
`useAuthMe()` getting a 401 keeps `isLoading=true` for ~3 retries before setting `error`. During that window, ProtectedRoute shows a loading spinner instead of redirecting to /login.

**Fix:** Set `retry: false` globally on the QueryClient instead of per-hook (per-hook requires `queryKey` in the options which causes TS errors with orval-generated hooks):
```ts
new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } })
```

## zod import
api-server uses `import { z } from "zod"` (v3 API). `z.email()` doesn't exist — use `z.string().email()`.
