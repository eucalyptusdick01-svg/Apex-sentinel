/**
 * Confirms that the session cookie carries the Secure attribute when the
 * request arrives over HTTPS (as signalled by X-Forwarded-Proto: https via
 * the trusted proxy) and does NOT carry it for plain HTTP.
 *
 * This test exercises the exact combination used in app.ts:
 *   app.set("trust proxy", 1)
 *   cookie: { secure: "auto" }
 *
 * We use an in-memory session store so no database mock is required.
 */

import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import session from "express-session";

// ---------------------------------------------------------------------------
// Build a minimal app that mirrors the production session config exactly.
//
// "trust proxy": 1  — trust the first proxy hop's X-Forwarded-* headers
// secure: "auto"    — set Secure on the cookie iff req.secure is true,
//                     which express-session derives from req.protocol after
//                     the proxy trust setting has been applied.
// ---------------------------------------------------------------------------
function buildApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(
    session({
      // MemoryStore is express-session's built-in default; fine for tests.
      secret: "test-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: "auto",
        httpOnly: true,
        sameSite: "lax",
      },
    }),
  );

  // A route that writes to the session so express-session will persist it and
  // emit a Set-Cookie header.  (saveUninitialized:false means an unmodified
  // session is never saved, so we must touch req.session here.)
  app.get("/touch", (req, res) => {
    (req.session as Record<string, unknown>)["touched"] = true;
    res.json({ ok: true });
  });

  return app;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return the raw Set-Cookie header string(s) from a supertest response. */
function setCookieHeader(res: request.Response): string[] {
  const raw = res.headers["set-cookie"] as string | string[] | undefined;
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

/** True iff at least one Set-Cookie entry contains the Secure attribute. */
function hasSecureFlag(res: request.Response): boolean {
  return setCookieHeader(res).some((c) =>
    // Match "; Secure" or "; secure" (case-insensitive, semicolon-separated)
    /;\s*Secure(?:\s*;|$)/i.test(c),
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Session cookie Secure flag — trust proxy + secure: auto", () => {
  it("includes the Secure attribute when X-Forwarded-Proto is https", async () => {
    const app = buildApp();

    const res = await request(app)
      .get("/touch")
      .set("X-Forwarded-Proto", "https");

    // A session cookie must have been issued.
    expect(setCookieHeader(res).length).toBeGreaterThan(0);
    expect(hasSecureFlag(res)).toBe(true);
  });

  it("omits the Secure attribute when X-Forwarded-Proto is http", async () => {
    const app = buildApp();

    const res = await request(app)
      .get("/touch")
      .set("X-Forwarded-Proto", "http");

    expect(setCookieHeader(res).length).toBeGreaterThan(0);
    expect(hasSecureFlag(res)).toBe(false);
  });

  it("omits the Secure attribute when no X-Forwarded-Proto header is present", async () => {
    const app = buildApp();

    // supertest connects over a plain TCP socket with no forwarded headers.
    const res = await request(app).get("/touch");

    expect(setCookieHeader(res).length).toBeGreaterThan(0);
    expect(hasSecureFlag(res)).toBe(false);
  });
});
