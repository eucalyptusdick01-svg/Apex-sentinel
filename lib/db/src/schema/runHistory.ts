import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const runHistoryTable = pgTable("run_history", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull(),
  moduleName: text("module_name").notNull(),
  target: text("target").notNull(),
  output: text("output").notNull().default(""),
  batchId: text("batch_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRunHistorySchema = createInsertSchema(runHistoryTable).omit({
  id: true,
  createdAt: true,
});
export type InsertRunHistory = z.infer<typeof insertRunHistorySchema>;
export type RunHistory = typeof runHistoryTable.$inferSelect;
