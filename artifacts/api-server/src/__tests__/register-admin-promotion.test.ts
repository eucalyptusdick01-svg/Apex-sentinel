import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { type Request, type Response, type NextFunction } from "express";

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

// --- db mock ----------------------------------------------------------------
// db.transaction(callback, options) is the only db method the register handler
// now calls. We expose:
//   transactionSpy     — vi.fn() so each test can configure it
//   transactionOptsSpy — captures the options object passed to transaction()
//   insertValuesSpy    — captures what .values() receives inside the callback
// ---------------------------------------------------------------------------
const transactionSpy = vi.hoisted(() => vi.fn());
const transactionOptsSpy = vi.hoisted(() => vi.fn());
const insertValuesSpy = vi.hoisted(() => vi.fn());

// Queue of values the tx query builder will resolve to, consumed in order.
const txResponseQueue = vi.hoisted(() => ({ responses: [] as unknown[][] }));

vi.mock("@workspace/db", () => {
  function makeBuilder(): any {
    return new Proxy(
      {},
      {
        get(_target, prop) {
          if (typeof prop === "symbol") return undefined;
          if (prop === "then") {
            const result = txResponseQueue.responses.shift() ?? [];
            return (resolve: (v: unknown) => void, reject: (e: unknown) => void) =>
              Promise.resolve(result).then(resolve, reject);
          }
          if (prop === "values") {
            return (...args: unknown[]) => {
              insertValuesSpy(...args);
              return makeBuilder();
            };
          }
          return (..._args: unknown[]) => makeBuilder();
        },
      },
    );
  }

  // A tx object that behaves like a drizzle client using the queue above.
  const tx = {
    select: () => makeBuilder(),
    insert: () => makeBuilder(),
  };

  return {
    db: {
      // Default: call through to the callback so tests just need to configure
      // txResponseQueue and insertValuesSpy. Individual tests may override
      // transactionSpy with mockRejectedValueOnce to simulate DB errors.
      transaction: transactionSpy.mockImplementation(
        (callback: (tx: unknown) => unknown, options?: unknown) => {
          transactionOptsSpy(options);
          return callback(tx);
        },
      ),
      // login route still uses db.select directly
      select: () => makeBuilder(),
    },
    usersTable: {
      id: "users.id",
      email: "users.email",
      isAdmin: "users.isAdmin",
      hashedPassword: "users.hashedPassword",
      createdAt: "users.createdAt",
    },
    pool: { query: () => Promise.resolve({ rows: [] }) },
  };
});

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  count: vi.fn(() => "count_expr"),
  desc: vi.fn(),
}));

import authRouter from "../routes/auth";

// ---------------------------------------------------------------------------
// Test app factory
// ---------------------------------------------------------------------------
function buildTestApp() {
  const app = express();
  app.use(express.json());

  app.use((req: Request, _res: Response, next: NextFunction) => {
    const sessionData: Record<string, unknown> = {};
    Object.assign(req, {
      session: {
        ...sessionData,
        save: (cb?: (err?: unknown) => void) => { cb?.(); },
        destroy: (cb?: (err?: unknown) => void) => { cb?.(); },
        regenerate: (cb?: (err?: unknown) => void) => {
          Object.keys(sessionData).forEach((k) => delete sessionData[k]);
          cb?.();
        },
        reload: (cb?: (err?: unknown) => void) => { cb?.(); },
        touch: (cb?: (err?: unknown) => void) => { cb?.(); },
        resetMaxAge: () => {},
        cookie: {},
        id: "test-session-id",
      },
    });
    next();
  });

  app.use("/api", authRouter);
  return app;
}

// ---------------------------------------------------------------------------
// Helper: make transactionSpy throw a Postgres error with the given code.
// ---------------------------------------------------------------------------
function makeDbError(code: string): Error & { code: string } {
  const err = new Error(`pg error ${code}`) as Error & { code: string };
  err.code = code;
  return err;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("POST /api/auth/register — admin promotion protection", () => {
  beforeEach(() => {
    txResponseQueue.responses = [];
    insertValuesSpy.mockClear();
    transactionOptsSpy.mockClear();
    // Reset to default call-through implementation for each test.
    transactionSpy.mockImplementation(
      (callback: (tx: unknown) => unknown, options?: unknown) => {
        transactionOptsSpy(options);
        // Inline tx factory so the queue is read fresh per test.
        function makeBuilder(): any {
          return new Proxy(
            {},
            {
              get(_target, prop) {
                if (typeof prop === "symbol") return undefined;
                if (prop === "then") {
                  const result = txResponseQueue.responses.shift() ?? [];
                  return (resolve: (v: unknown) => void, reject: (e: unknown) => void) =>
                    Promise.resolve(result).then(resolve, reject);
                }
                if (prop === "values") {
                  return (...args: unknown[]) => {
                    insertValuesSpy(...args);
                    return makeBuilder();
                  };
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

  // ── Serializable isolation ──────────────────────────────────────────────
  describe("transaction isolation", () => {
    it("wraps count + insert in a SERIALIZABLE transaction to prevent race", async () => {
      txResponseQueue.responses = [
        [{ count: 1 }],
        [{ id: "u1", email: "a@example.com", isAdmin: false, hashedPassword: "x" }],
      ];
      const app = buildTestApp();
      await request(app)
        .post("/api/auth/register")
        .send({ email: "a@example.com", password: "password123" });

      expect(transactionOptsSpy).toHaveBeenCalledOnce();
      expect(transactionOptsSpy).toHaveBeenCalledWith(
        expect.objectContaining({ isolationLevel: "serializable" }),
      );
    });
  });

  // ── isAdmin derived from count inside the transaction ───────────────────
  describe("isAdmin written to the database is derived from user count, not from the request body", () => {
    it("writes isAdmin:false even when the body contains isAdmin:true (non-first user)", async () => {
      txResponseQueue.responses = [
        [{ count: 1 }],
        [{ id: "user-2", email: "attacker@example.com", isAdmin: false, hashedPassword: "hashed_password" }],
      ];

      const app = buildTestApp();
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "attacker@example.com", password: "password123", isAdmin: true });

      expect(res.status).toBe(201);
      expect(insertValuesSpy).toHaveBeenCalledOnce();
      expect(insertValuesSpy).toHaveBeenCalledWith(
        expect.objectContaining({ isAdmin: false }),
      );
      expect(res.body.isAdmin).toBe(false);
    });

    it("writes isAdmin:true for the first user even when the body contains isAdmin:false", async () => {
      txResponseQueue.responses = [
        [{ count: 0 }],
        [{ id: "user-1", email: "first@example.com", isAdmin: true, hashedPassword: "hashed_password" }],
      ];

      const app = buildTestApp();
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "first@example.com", password: "password123", isAdmin: false });

      expect(res.status).toBe(201);
      expect(insertValuesSpy).toHaveBeenCalledOnce();
      expect(insertValuesSpy).toHaveBeenCalledWith(
        expect.objectContaining({ isAdmin: true }),
      );
      expect(res.body.isAdmin).toBe(true);
    });

    it("writes isAdmin:false for a late registration even with isAdmin:true in the body", async () => {
      txResponseQueue.responses = [
        [{ count: 42 }],
        [{ id: "user-43", email: "late@example.com", isAdmin: false, hashedPassword: "hashed_password" }],
      ];

      const app = buildTestApp();
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "late@example.com", password: "password123", isAdmin: true });

      expect(res.status).toBe(201);
      expect(insertValuesSpy).toHaveBeenCalledWith(
        expect.objectContaining({ isAdmin: false }),
      );
      expect(res.body.isAdmin).toBe(false);
    });
  });

  // ── First-user bootstrap ────────────────────────────────────────────────
  describe("first-user admin bootstrap", () => {
    it("grants admin to the first registered user (DB count = 0)", async () => {
      txResponseQueue.responses = [
        [{ count: 0 }],
        [{ id: "user-1", email: "first@example.com", isAdmin: true, hashedPassword: "hashed_password" }],
      ];

      const app = buildTestApp();
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "first@example.com", password: "password123" });

      expect(res.status).toBe(201);
      expect(insertValuesSpy).toHaveBeenCalledWith(
        expect.objectContaining({ isAdmin: true }),
      );
    });

    it("does not grant admin to the second registration (DB count = 1)", async () => {
      txResponseQueue.responses = [
        [{ count: 1 }],
        [{ id: "user-2", email: "second@example.com", isAdmin: false, hashedPassword: "hashed_password" }],
      ];

      const app = buildTestApp();
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "second@example.com", password: "password123" });

      expect(res.status).toBe(201);
      expect(insertValuesSpy).toHaveBeenCalledWith(
        expect.objectContaining({ isAdmin: false }),
      );
    });
  });

  // ── Input validation ────────────────────────────────────────────────────
  describe("input validation", () => {
    it("rejects registration with invalid email (400)", async () => {
      const app = buildTestApp();
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "not-an-email", password: "password123" });

      expect(res.status).toBe(400);
      expect(insertValuesSpy).not.toHaveBeenCalled();
    });

    it("rejects registration with a password shorter than 8 characters (400)", async () => {
      const app = buildTestApp();
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "valid@example.com", password: "short" });

      expect(res.status).toBe(400);
      expect(insertValuesSpy).not.toHaveBeenCalled();
    });
  });

  // ── Race condition: concurrent first-user registrations ─────────────────
  describe("race condition safety — concurrent first-user registrations", () => {
    it("returns 409 when the transaction throws a unique-violation (23505): duplicate email from a concurrent insert", async () => {
      // Simulate: two requests raced, the second hits the unique constraint
      // on the email column before our pre-check can catch it.
      transactionSpy.mockRejectedValueOnce(makeDbError("23505"));

      const app = buildTestApp();
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "race@example.com", password: "password123" });

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({ error: "Email already registered" });
    });

    it("returns 503 when the transaction throws a serialization-failure (40001): two concurrent transactions both read count=0", async () => {
      // Simulate: T1 and T2 both enter a SERIALIZABLE transaction on an
      // empty DB, read count=0, and attempt to insert. Postgres detects the
      // read-write conflict and aborts the loser with code 40001. The client
      // should retry (503 = Service Unavailable / retry-able).
      transactionSpy.mockRejectedValueOnce(makeDbError("40001"));

      const app = buildTestApp();
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "racer@example.com", password: "password123" });

      expect(res.status).toBe(503);
      expect(res.body).toMatchObject({ error: "Please try again" });
    });

    it("after a serialization failure the winner is the only admin: winning request sees count=0 and registers as admin", async () => {
      // The loser got 503 and retried. On the retry DB count=1 (the winner
      // already committed). Verify the retry correctly writes isAdmin:false.
      txResponseQueue.responses = [
        [{ count: 1 }],
        [{ id: "loser", email: "loser@example.com", isAdmin: false, hashedPassword: "hashed_password" }],
      ];

      const app = buildTestApp();
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "loser@example.com", password: "password123" });

      expect(res.status).toBe(201);
      expect(insertValuesSpy).toHaveBeenCalledWith(
        expect.objectContaining({ isAdmin: false }),
      );
      // Invariant: at most one admin — the winning transaction that saw count=0.
    });

    it("winner of the race registers as admin (count=0 inside transaction)", async () => {
      txResponseQueue.responses = [
        [{ count: 0 }],
        [{ id: "winner", email: "winner@example.com", isAdmin: true, hashedPassword: "hashed_password" }],
      ];

      const app = buildTestApp();
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "winner@example.com", password: "password123" });

      expect(res.status).toBe(201);
      expect(res.body.isAdmin).toBe(true);
      expect(insertValuesSpy).toHaveBeenCalledWith(
        expect.objectContaining({ isAdmin: true }),
      );
    });
  });
});
