import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function validateSession(req: Request, res: Response): Promise<boolean> {
  if (!req.session.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }

  if (req.session.pwVersion === undefined) {
    req.session.destroy(() => {});
    res.status(401).json({ error: "Session expired — please log in again" });
    return false;
  }

  const [user] = await db
    .select({ pwVersion: usersTable.pwVersion })
    .from(usersTable)
    .where(eq(usersTable.id, req.session.userId))
    .limit(1);

  if (!user || user.pwVersion !== req.session.pwVersion) {
    req.session.destroy(() => {});
    res.status(401).json({ error: "Session expired — please log in again" });
    return false;
  }

  return true;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (await validateSession(req, res)) {
    next();
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!(await validateSession(req, res))) {
    return;
  }
  if (!req.session.isAdmin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}
