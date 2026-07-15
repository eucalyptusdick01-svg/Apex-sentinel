import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { type Request, type Response, type NextFunction } from "express";

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

const dbCallQueue = vi.hoisted(() => ({ responses: [] as unknown[][] }));
const insertValuesSpy = vi.hoisted(() => vi.fn());

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

  return {
    db: {
      select: () => makeBuilder(),
      insert: () => makeBuilder(),
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

describe("POST /api/auth/register — admin promotion protection", () => {
  beforeEach(() => {
    dbCallQueue.responses = [];
    insertValuesSpy.mockClear();
    vi.clearAllMocks();
  });

  describe("isAdmin written to the database is derived from user count, not from the request body", () => {
    it("writes isAdmin:false to the DB even when the body contains isAdmin:true (non-first user)", async () => {
      dbCallQueue.responses = [
        [],
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

    it("writes isAdmin:true to the DB for the first user even when the body contains isAdmin:false", async () => {
      dbCallQueue.responses = [
        [],
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

    it("writes isAdmin:false for a late registration even when the body contains isAdmin:true (many existing users)", async () => {
      dbCallQueue.responses = [
        [],
        [{ count: 42 }],
        [{ id: "user-43", email: "late@example.com", isAdmin: false, hashedPassword: "hashed_password" }],
      ];

      const app = buildTestApp();
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "late@example.com", password: "password123", isAdmin: true });

      expect(res.status).toBe(201);
      expect(insertValuesSpy).toHaveBeenCalledOnce();
      expect(insertValuesSpy).toHaveBeenCalledWith(
        expect.objectContaining({ isAdmin: false }),
      );
      expect(res.body.isAdmin).toBe(false);
    });
  });

  describe("first-user admin bootstrap", () => {
    it("grants admin to the first registered user (DB count = 0)", async () => {
      dbCallQueue.responses = [
        [],
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
      dbCallQueue.responses = [
        [],
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

  describe("input validation", () => {
    it("rejects registration if the email is already taken (409)", async () => {
      dbCallQueue.responses = [
        [{ id: "user-1", email: "taken@example.com", isAdmin: false, hashedPassword: "x" }],
      ];

      const app = buildTestApp();
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "taken@example.com", password: "password123" });

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({ error: "Email already registered" });
      expect(insertValuesSpy).not.toHaveBeenCalled();
    });

    it("rejects registration with an invalid email (400) and never touches the DB insert", async () => {
      const app = buildTestApp();
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "not-an-email", password: "password123" });

      expect(res.status).toBe(400);
      expect(insertValuesSpy).not.toHaveBeenCalled();
    });

    it("rejects registration with a password shorter than 8 characters (400) and never touches the DB insert", async () => {
      const app = buildTestApp();
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "valid@example.com", password: "short" });

      expect(res.status).toBe(400);
      expect(insertValuesSpy).not.toHaveBeenCalled();
    });
  });
});
