import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const runsTable = pgTable("runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  target: text("target").notNull(),
  moduleId: integer("module_id").notNull(),
  moduleName: text("module_name").notNull(),
  output: text("output").notNull().default(""),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  finishedAt: timestamp("finished_at"),
});

export const insertRunSchema = createInsertSchema(runsTable).omit({ id: true, startedAt: true });
export const selectRunSchema = createSelectSchema(runsTable);

export type InsertRun = z.infer<typeof insertRunSchema>;
export type Run = typeof runsTable.$inferSelect;
