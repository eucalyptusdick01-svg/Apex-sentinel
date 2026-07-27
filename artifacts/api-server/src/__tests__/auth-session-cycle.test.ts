import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { type Request, type Response, type NextFunction } from "express";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

// Shared queue: each entry is consumed in order by the next awaited db call.
const dbCallQueue = vi.hoisted(() => ({ responses: [] as unknown[][] }));
const transactionSpy = vi.hoisted(() => vi.fn());

vi.mock("@workspace/db", () => {
  function makeBuilder(): any {
    return new Proxy(
      {},
      {
        get(_target, prop) {
          if (typeof prop === "symbol") return undefined;
          if (prop === "then") {
            const result = dbCallQueue.responses.shift() ?? [];
            return (resolve: (v: unknown) => void, reject: (e: unknown) => void) =>
              Promise.resolve(result).then(resolve, reject);
          }
          return (..._args: unknown[]) => makeBuilder();
        },
      },
    );
  }

  return {
    db: {
      transaction: transactionSpy.mockImplementation(
        (callback: (tx: unknown) => unknown, _options?: unknown) => {
          const tx = { select: () => makeBuilder(), insert: () => makeBuilder() };
          return callback(tx);
        },
      ),
      select: () => makeBuilder(),
    },
    usersTable: {
      id: "users.id",
      email: "users.email",
      isAdmin: "users.isAdmin",
      hashedPassword: "users.hashedPassword",
      pwVersion: "users.pwVersion",
      createdAt: "users.createdAt",
    },
    pool: { query: () => Promise.resolve({ rows: [] }) },
  };
});

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  count: vi.fn(() => "count_expr"),
  desc: vi.fn(),
  sql: vi.fn(),
}));

import authRouter from "../routes/auth";

// ---------------------------------------------------------------------------
// Stateful session test app
//
// Unlike the single-request session stubs in other tests, this app maintains
// an in-memory session store so that cookies set during one request are
// honoured in subsequent requests — the same way a real session store works.
//
// Key behaviour:
//   - Each request without a cookie gets a fresh session ID.
//   - req.session.regenerate() creates a NEW session ID and clears all data,
//     mirroring session fixation protection in express-session.
//   - req.session.destroy() removes the session from the store entirely.
//   - The response always carries a Set-Cookie with the current session ID so
//     callers can capture it and pass it to the next request.
// ---------------------------------------------------------------------------

function buildStatefulTestApp() {
  const store = new Map<string, Record<string, unknown>>();
  let counter = 0;
  const newId = () => `sess-${++counter}`;

  const app = express();
  app.use(express.json());

  app.use((req: Request, res: Response, next: NextFunction) => {
    const cookieHeader = (req.headers["cookie"] as string | undefined) ?? "";
    const match = cookieHeader.match(/connect\.sid=([^;]+)/);
    let sid = match ? decodeURIComponent(match[1]) : newId();
    if (!store.has(sid)) store.set(sid, {});

    // `data` is the live storage bucket; mutations to req.session properties
    // go here so they are visible in the store on the next request.
    const data = store.get(sid)!;

    const sessionMethods: Record<string, unknown> = {
      regenerate(cb?: (err?: unknown) => void) {
        const oldSid = sid;
        sid = newId();
        store.delete(oldSid);
        // Clear data in-place so post-regenerate property assignments go to
        // the same object (now mapped to the new session ID).
        for (const k of Object.keys(data)) delete data[k];
        store.set(sid, data);
        cb?.();
      },
      destroy(cb?: (err?: unknown) => void) {
        store.delete(sid);
        for (const k of Object.keys(data)) delete data[k];
        cb?.();
      },
      save(cb?: (err?: unknown) => void) { cb?.(); },
      reload(cb?: (err?: unknown) => void) { cb?.(); },
      touch(cb?: (err?: unknown) => void) { cb?.(); },
      resetMaxAge() {},
      cookie: {},
    };

    Object.assign(req, {
      session: new Proxy(sessionMethods, {
        get(target, prop) {
          if (prop === "id") return sid;
          if (prop in target) return target[prop as string];
          return data[prop as string];
        },
        set(_target, prop, value) {
          if (prop === "cookie") return true;
          data[prop as string] = value;
          return true;
        },
      }),
    });

    // Attach the current session ID as a cookie before every JSON response so
    // that tests can extract it and pass it to subsequent requests.
    const origJson = res.json.bind(res);
    res.json = (body: unknown) => {
      if (!res.headersSent) {
        res.setHeader(
          "Set-Cookie",
          `connect.sid=${encodeURIComponent(sid)}; Path=/; HttpOnly`,
        );
      }
      return origJson(body);
    };

    next();
  });

  // Lightweight helper endpoint — lets tests capture an initial session ID
  // before making a login/register call (needed for fixation checks).
  app.get("/api/session-id", (req: Request, res: Response) => {
    res.json({ id: (req as any).session.id });
  });

  app.use("/api", authRouter);
  return app;
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_USER = {
  id: "user-1",
  email: "alice@example.com",
  isAdmin: false,
  hashedPassword: "hashed_password",
  pwVersion: 1,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Pull the connect.sid value out of a supertest response's Set-Cookie header. */
function extractSid(res: request.Response): string | null {
  const raw = res.headers["set-cookie"] as string[] | string | undefined;
  if (!raw) return null;
  const arr = Array.isArray(raw) ? raw : [raw];
  for (const c of arr) {
    const m = c.match(/^connect\.sid=([^;]+)/);
    if (m) return decodeURIComponent(m[1]);
  }
  return null;
}

/** Build a Cookie request header from a session ID. */
function cookieFor(sid: string): string {
  return `connect.sid=${encodeURIComponent(sid)}`;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Auth session cycle — login / register / logout", () => {
  beforeEach(() => {
    dbCallQueue.responses = [];
    vi.clearAllMocks();

    // Restore the default transaction pass-through after clearAllMocks resets
    // any one-time overrides from a previous test.
    transactionSpy.mockImplementation(
      (callback: (tx: unknown) => unknown, _options?: unknown) => {
        function makeBuilder(): any {
          return new Proxy(
            {},
            {
              get(_target, prop) {
                if (typeof prop === "symbol") return undefined;
                if (prop === "then") {
                  const result = dbCallQueue.responses.shift() ?? [];
                  return (resolve: (v: unknown) => void, reject: (e: unknown) => void) =>
                    Promise.resolve(result).then(resolve, reject);
                }
                return (..._args: unknown[]) => makeBuilder();
              },
            },
          );
        }
        const tx = { select: () => makeBuilder(), insert: () => makeBuilder() };
        return callback(tx);
      },
    );
  });

  // ── Registration cycle ────────────────────────────────────────────────────

  describe("register → authenticated request succeeds", () => {
    it("GET /auth/me returns the registered user after a successful registration", async () => {
      // register transaction: count query → user insert
      // requireAuth DB check for /auth/me
      dbCallQueue.responses = [
        [{ count: 0 }],
        [MOCK_USER],
        [{ pwVersion: MOCK_USER.pwVersion }],
      ];

      const app = buildStatefulTestApp();

      const registerRes = await request(app)
        .post("/api/auth/register")
        .send({ email: MOCK_USER.email, password: "password123" });

      expect(registerRes.status).toBe(201);
      const sid = extractSid(registerRes);
      expect(sid).not.toBeNull();

      const meRes = await request(app)
        .get("/api/auth/me")
        .set("Cookie", cookieFor(sid!));

      expect(meRes.status).toBe(200);
      expect(meRes.body).toMatchObject({
        id: MOCK_USER.id,
        email: MOCK_USER.email,
        isAdmin: MOCK_USER.isAdmin,
      });
    });

    it("session ID changes after registration (session fixation protection)", async () => {
      dbCallQueue.responses = [
        [{ count: 1 }],
        [{ ...MOCK_USER, isAdmin: false }],
      ];

      const app = buildStatefulTestApp();

      // Establish a pre-registration session to capture its ID.
      const preRes = await request(app).get("/api/session-id");
      const preSid = extractSid(preRes);
      expect(preSid).not.toBeNull();

      // Register while carrying the pre-existing session.
      const registerRes = await request(app)
        .post("/api/auth/register")
        .set("Cookie", cookieFor(preSid!))
        .send({ email: MOCK_USER.email, password: "password123" });

      expect(registerRes.status).toBe(201);
      const postSid = extractSid(registerRes);
      expect(postSid).not.toBeNull();

      // The session ID in the response must differ from the one sent in the
      // request — proving regenerate() issued a fresh ID.
      expect(postSid).not.toBe(preSid);
    });
  });

  // ── Login cycle ───────────────────────────────────────────────────────────

  describe("login → authenticated request succeeds", () => {
    it("GET /auth/me returns the authenticated user after a successful login", async () => {
      dbCallQueue.responses = [
        // login: user lookup by email
        [MOCK_USER],
        // requireAuth DB check for /auth/me
        [{ pwVersion: MOCK_USER.pwVersion }],
      ];

      const app = buildStatefulTestApp();

      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: MOCK_USER.email, password: "password123" });

      expect(loginRes.status).toBe(200);
      const sid = extractSid(loginRes);
      expect(sid).not.toBeNull();

      const meRes = await request(app)
        .get("/api/auth/me")
        .set("Cookie", cookieFor(sid!));

      expect(meRes.status).toBe(200);
      expect(meRes.body).toMatchObject({
        id: MOCK_USER.id,
        email: MOCK_USER.email,
        isAdmin: MOCK_USER.isAdmin,
      });
    });

    it("session ID changes after login (session fixation protection)", async () => {
      dbCallQueue.responses = [
        [MOCK_USER],
      ];

      const app = buildStatefulTestApp();

      // Establish a pre-login session to capture its ID.
      const preRes = await request(app).get("/api/session-id");
      const preSid = extractSid(preRes);
      expect(preSid).not.toBeNull();

      // Log in while carrying the pre-existing session.
      const loginRes = await request(app)
        .post("/api/auth/login")
        .set("Cookie", cookieFor(preSid!))
        .send({ email: MOCK_USER.email, password: "password123" });

      expect(loginRes.status).toBe(200);
      const postSid = extractSid(loginRes);
      expect(postSid).not.toBeNull();

      // The session ID in the response must differ from the one sent in the
      // request — proving regenerate() issued a fresh ID.
      expect(postSid).not.toBe(preSid);
    });
  });

  // ── Logout cycle ─────────────────────────────────────────────────────────

  describe("logout → subsequent authenticated request is rejected", () => {
    it("GET /auth/me returns 401 after the session is destroyed by logout", async () => {
      dbCallQueue.responses = [
        // login: user lookup
        [MOCK_USER],
        // No /auth/me call is expected here — it should 401 before hitting the DB.
      ];

      const app = buildStatefulTestApp();

      // Log in to get a valid session.
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: MOCK_USER.email, password: "password123" });

      expect(loginRes.status).toBe(200);
      const sid = extractSid(loginRes);
      expect(sid).not.toBeNull();

      // Log out — this destroys the server-side session.
      const logoutRes = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", cookieFor(sid!));

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body).toMatchObject({ ok: true });

      // A subsequent request with the now-invalid session ID must be rejected.
      const meRes = await request(app)
        .get("/api/auth/me")
        .set("Cookie", cookieFor(sid!));

      expect(meRes.status).toBe(401);
    });
  });
});
