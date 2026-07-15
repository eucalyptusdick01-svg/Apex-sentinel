import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express, { type Request, type Response, type NextFunction } from "express";

const queryResultRef = vi.hoisted(() => ({ value: [] as unknown[] }));

vi.mock("@workspace/db", () => {
  function makeBuilder(): any {
    return new Proxy(
      {},
      {
        get(_target, prop) {
          if (typeof prop === "symbol") return undefined;
          if (prop === "then") {
            return (resolve: (v: unknown) => void, reject: (e: unknown) => void) =>
              Promise.resolve(queryResultRef.value).then(resolve, reject);
          }
          return () => makeBuilder();
        },
      },
    );
  }

  return {
    db: { select: () => makeBuilder() },
    usersTable: { id: "users.id", email: "users.email", isAdmin: "users.isAdmin", createdAt: "users.createdAt" },
    runsTable: { id: "runs.id", userId: "runs.userId", startedAt: "runs.startedAt" },
    pool: { query: () => Promise.resolve({ rows: [] }) },
  };
});

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(),
  count: vi.fn(() => "count_expr"),
  desc: vi.fn(),
}));

import adminRouter from "../routes/admin";
import { requireAdmin } from "../middleware/auth";

const MOCK_USERS = [
  { id: "admin-1", email: "admin@swept.local", isAdmin: true, createdAt: new Date("2026-01-01"), runCount: 5 },
  { id: "user-1", email: "user@swept.local", isAdmin: false, createdAt: new Date("2026-01-02"), runCount: 2 },
];

const MOCK_RUNS = [
  { id: "run-1", userId: "user-1", target: "8.8.8.8", moduleId: 1, startedAt: new Date("2026-01-10") },
  { id: "run-2", userId: "user-1", target: "1.1.1.1", moduleId: 2, startedAt: new Date("2026-01-11") },
];

function buildTestApp(sessionOverrides: Record<string, unknown> = {}) {
  const app = express();
  app.use(express.json());

  app.use((req: Request, _res: Response, next: NextFunction) => {
    Object.assign(req, {
      session: {
        userId: undefined,
        isAdmin: undefined,
        ...sessionOverrides,
        save: (cb?: (err?: unknown) => void) => { cb?.(); },
        destroy: (cb?: (err?: unknown) => void) => { cb?.(); },
        regenerate: (cb?: (err?: unknown) => void) => { cb?.(); },
        reload: (cb?: (err?: unknown) => void) => { cb?.(); },
        touch: (cb?: (err?: unknown) => void) => { cb?.(); },
        resetMaxAge: () => {},
        cookie: {},
        id: "test-session-id",
      },
    });
    next();
  });

  app.use("/api", adminRouter);

  return app;
}

describe("Admin API — /api/admin/* access control", () => {
  beforeEach(() => {
    queryResultRef.value = [];
    vi.clearAllMocks();
  });

  describe("GET /api/admin/users", () => {
    it("returns 401 when the request has no session (unauthenticated)", async () => {
      const app = buildTestApp();
      const res = await request(app).get("/api/admin/users");
      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ error: "Unauthorized" });
    });

    it("returns 403 when session belongs to a non-admin user", async () => {
      const app = buildTestApp({ userId: "user-1", isAdmin: false });
      const res = await request(app).get("/api/admin/users");
      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({ error: "Forbidden" });
    });

    it("returns 200 with user list when the session belongs to an admin", async () => {
      queryResultRef.value = MOCK_USERS;
      const app = buildTestApp({ userId: "admin-1", isAdmin: true });
      const res = await request(app).get("/api/admin/users");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toMatchObject({ email: "admin@swept.local", isAdmin: true });
    });
  });

  describe("GET /api/admin/users/:userId/runs", () => {
    it("returns 401 when the request has no session (unauthenticated)", async () => {
      const app = buildTestApp();
      const res = await request(app).get("/api/admin/users/user-1/runs");
      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ error: "Unauthorized" });
    });

    it("returns 403 when session belongs to a non-admin user", async () => {
      const app = buildTestApp({ userId: "user-1", isAdmin: false });
      const res = await request(app).get("/api/admin/users/user-1/runs");
      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({ error: "Forbidden" });
    });

    it("returns 200 with run list when the session belongs to an admin", async () => {
      queryResultRef.value = MOCK_RUNS;
      const app = buildTestApp({ userId: "admin-1", isAdmin: true });
      const res = await request(app).get("/api/admin/users/user-1/runs");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toMatchObject({ id: "run-1", userId: "user-1" });
    });
  });

  describe("GET /api/admin/runs/:runId", () => {
    it("returns 401 when the request has no session (unauthenticated)", async () => {
      const app = buildTestApp();
      const res = await request(app).get("/api/admin/runs/run-1");
      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ error: "Unauthorized" });
    });

    it("returns 403 when session belongs to a non-admin user", async () => {
      const app = buildTestApp({ userId: "user-1", isAdmin: false });
      const res = await request(app).get("/api/admin/runs/run-1");
      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({ error: "Forbidden" });
    });

    it("returns 200 with the run when the session belongs to an admin", async () => {
      queryResultRef.value = [MOCK_RUNS[0]];
      const app = buildTestApp({ userId: "admin-1", isAdmin: true });
      const res = await request(app).get("/api/admin/runs/run-1");
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: "run-1", userId: "user-1" });
    });

    it("returns 404 when the admin queries a run that does not exist", async () => {
      queryResultRef.value = [];
      const app = buildTestApp({ userId: "admin-1", isAdmin: true });
      const res = await request(app).get("/api/admin/runs/nonexistent-run");
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ error: "Run not found" });
    });
  });

  describe("requireAdmin middleware — direct unit verification", () => {
    it("blocks unauthenticated requests with 401 (no userId in session)", () => {
      const req = { session: {} } as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;
      const next = vi.fn() as NextFunction;

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
      expect(next).not.toHaveBeenCalled();
    });

    it("blocks authenticated non-admin with 403 (userId set, isAdmin falsy)", () => {
      const req = { session: { userId: "user-1", isAdmin: false } } as unknown as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;
      const next = vi.fn() as NextFunction;

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "Forbidden" });
      expect(next).not.toHaveBeenCalled();
    });

    it("passes authenticated admin through to the next handler", () => {
      const req = { session: { userId: "admin-1", isAdmin: true } } as unknown as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;
      const next = vi.fn() as NextFunction;

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
