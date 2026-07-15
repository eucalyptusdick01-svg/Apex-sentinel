import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, runsTable } from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth";

const router: IRouter = Router();

router.get("/admin/users", requireAdmin, async (_req, res) => {
  const users = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      isAdmin: usersTable.isAdmin,
      createdAt: usersTable.createdAt,
      runCount: count(runsTable.id),
    })
    .from(usersTable)
    .leftJoin(runsTable, eq(runsTable.userId, usersTable.id))
    .groupBy(usersTable.id)
    .orderBy(desc(usersTable.createdAt));

  res.json(users);
});

router.get("/admin/users/:userId/runs", requireAdmin, async (req, res) => {
  const userId = String(req.params.userId);

  const runs = await db
    .select()
    .from(runsTable)
    .where(eq(runsTable.userId, userId))
    .orderBy(desc(runsTable.startedAt))
    .limit(200);

  res.json(runs);
});

router.get("/admin/runs/:runId", requireAdmin, async (req, res) => {
  const runId = String(req.params.runId);

  const [run] = await db.select().from(runsTable).where(eq(runsTable.id, runId)).limit(1);
  if (!run) {
    res.status(404).json({ error: "Run not found" });
    return;
  }

  res.json(run);
});

export default router;
