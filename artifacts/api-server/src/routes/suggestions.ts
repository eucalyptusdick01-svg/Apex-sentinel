import { Router, type IRouter } from "express";
import { db, suggestionsTable, usersTable } from "@workspace/db";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router: IRouter = Router();

const submitSuggestionBody = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
});

router.post("/suggestions", requireAuth, async (req, res) => {
  const parsed = submitSuggestionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input: title and description are required" });
    return;
  }

  const userId = req.session.userId as string;
  const { title, description } = parsed.data;

  const [suggestion] = await db
    .insert(suggestionsTable)
    .values({ userId, title, description })
    .returning();

  res.status(201).json(suggestion);
});

router.get("/suggestions", requireAdmin, async (_req, res) => {
  const rows = await db
    .select({
      id: suggestionsTable.id,
      userId: suggestionsTable.userId,
      userEmail: usersTable.email,
      title: suggestionsTable.title,
      description: suggestionsTable.description,
      status: suggestionsTable.status,
      createdAt: suggestionsTable.createdAt,
    })
    .from(suggestionsTable)
    .innerJoin(usersTable, eq(suggestionsTable.userId, usersTable.id))
    .orderBy(desc(suggestionsTable.createdAt));

  res.json(rows);
});

router.patch("/suggestions/:id", requireAdmin, async (req, res) => {
  const id = String(req.params["id"]);

  const [updated] = await db
    .update(suggestionsTable)
    .set({ status: "reviewed" })
    .where(eq(suggestionsTable.id, id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Suggestion not found" });
    return;
  }

  res.json(updated);
});

export default router;
