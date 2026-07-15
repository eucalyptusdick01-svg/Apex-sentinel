import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

function pgCode(err: unknown): string | undefined {
  return typeof err === "object" && err !== null && "code" in err
    ? String((err as Record<string, unknown>).code)
    : undefined;
}

function isPgUniqueViolation(err: unknown): boolean {
  return pgCode(err) === "23505";
}

function isPgSerializationFailure(err: unknown): boolean {
  return pgCode(err) === "40001";
}

router.post("/auth/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid email or password (min 8 chars)" });
    return;
  }

  const { email, password } = parsed.data;

  // Hash outside the transaction: bcrypt is CPU-bound and slow.
  // Holding a DB connection open while it runs wastes pool capacity.
  const hashedPassword = await bcrypt.hash(password, 12);

  let user: typeof usersTable.$inferSelect | undefined;
  try {
    // Wrap count + insert in a SERIALIZABLE transaction to eliminate the
    // TOCTOU race where two concurrent requests both read count=0 and both
    // set isAdmin=true. With serializable isolation, Postgres guarantees that
    // only one concurrent transaction can commit if they read-write the same
    // rows; the other is rolled back with code 40001 (serialization_failure).
    [user] = await db.transaction(
      async (tx) => {
        const userCount = await tx.select({ count: count() }).from(usersTable);
        const isFirstUser = (userCount[0]?.count ?? 0) === 0;
        return tx
          .insert(usersTable)
          .values({ email, hashedPassword, isAdmin: isFirstUser })
          .returning();
      },
      { isolationLevel: "serializable" },
    );
  } catch (err: unknown) {
    if (isPgUniqueViolation(err)) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    if (isPgSerializationFailure(err)) {
      // Two concurrent registrations raced — the losing request should retry.
      res.status(503).json({ error: "Please try again" });
      return;
    }
    throw err;
  }

  if (!user) {
    res.status(500).json({ error: "Failed to create user" });
    return;
  }

  req.session.regenerate((err) => {
    if (err) {
      res.status(500).json({ error: "Failed to establish session" });
      return;
    }
    req.session.userId = user!.id;
    req.session.isAdmin = user!.isAdmin;
    req.session.email = user!.email;
    res.status(201).json({ id: user!.id, email: user!.email, isAdmin: user!.isAdmin });
  });
});

router.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.hashedPassword);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  req.session.regenerate((err) => {
    if (err) {
      res.status(500).json({ error: "Failed to establish session" });
      return;
    }
    req.session.userId = user.id;
    req.session.isAdmin = user.isAdmin;
    req.session.email = user.email;
    res.json({ id: user.id, email: user.email, isAdmin: user.isAdmin });
  });
});

router.post("/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Failed to logout" });
      return;
    }
    res.clearCookie("connect.sid");
    res.json({ ok: true });
  });
});

router.get("/auth/me", (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.json({
    id: req.session.userId,
    email: req.session.email,
    isAdmin: req.session.isAdmin,
  });
});

export default router;
