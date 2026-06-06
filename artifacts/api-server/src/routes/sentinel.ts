import { Router, type IRouter } from "express";
import { spawn } from "child_process";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";
import { db, runHistoryTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import {
  ExecuteModuleBody,
  ExecuteBatchBody,
  StreamOutputParams,
  GetHistoryRunParams,
  DeleteHistoryRunParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const SPECIALIZED_MODULES: Record<number, string> = {
  1: "IP TRACKER", 2: "DNS RESOLVE", 3: "PORT SCAN", 5: "WHOIS QUERY",
  6: "PHONE OSINT", 7: "EMAIL REP", 8: "PROXY CHECK", 9: "DB SEARCH",
  10: "GEOLOCATE", 45: "INSTAGRAM", 46: "TIKTOK", 49: "TELEGRAM ID",
  53: "STEAM ID", 60: "TRUECALLER", 71: "VIN CHECK", 91: "SATELLITE",
  131: "SQL MAP", 201: "BGP ROUTE", 207: "CDN ORIGIN", 230: "DMARC ANALYZE",
};

function getModuleName(id: number): string {
  return SPECIALIZED_MODULES[id] ?? `MODULE_${id}`;
}

function getModuleCategory(id: number): string {
  if (id <= 10) return "NETWORK";
  if (id <= 50) return "SOCIAL";
  if (id <= 100) return "RECON";
  if (id <= 150) return "EXPLOIT";
  if (id <= 200) return "INTEL";
  return "ADVANCED";
}

router.get("/sentinel/modules", (_req, res) => {
  const modules = Array.from({ length: 230 }, (_, i) => {
    const id = i + 1;
    return { id, name: getModuleName(id), category: getModuleCategory(id) };
  });
  res.json(modules);
});

type RunState = {
  lines: string[];
  done: boolean;
  listeners: Array<(line: string) => void>;
};
const activeRuns = new Map<string, RunState>();

const sentinelPath = path.resolve(process.cwd(), "swept_sentinel.py");

function spawnModule(moduleId: number, target: string, runState: RunState, onDone?: () => void) {
  const sentinelExists = fs.existsSync(sentinelPath);

  const push = (line: string) => {
    runState.lines.push(line);
    for (const l of runState.listeners) l(line);
  };

  if (sentinelExists) {
    const proc = spawn("python3", [sentinelPath], { cwd: process.cwd() });
    proc.stdin.write(`${moduleId}\n${target}\n`);
    proc.stdin.end();

    proc.stdout.on("data", (chunk: Buffer) => {
      chunk.toString().split("\n").filter(Boolean).forEach(push);
    });
    proc.stderr.on("data", (chunk: Buffer) => {
      const t = chunk.toString().trim();
      if (t) push(`[STDERR] ${t}`);
    });
    proc.on("close", (code) => {
      push(`[PROCESS EXITED: code ${code}]`);
      runState.done = true;
      runState.listeners = [];
      onDone?.();
    });
    proc.on("error", (err) => {
      push(`[ERROR] ${err.message}`);
      runState.done = true;
      runState.listeners = [];
      onDone?.();
    });
  } else {
    const stubs = [
      `[MODULE ${moduleId}] ${getModuleName(moduleId)} — executing on: ${target}`,
      `[INFO] swept_sentinel.py not found at project root.`,
      `[INFO] Drop swept_sentinel.py into the project root to enable real execution.`,
      `[INFO] The script reads stdin: first line = module number, second line = target.`,
      `[DONE] Simulation complete.`,
    ];
    stubs.forEach(push);
    runState.done = true;
    onDone?.();
  }
}

async function saveHistory(moduleId: number, target: string, lines: string[], batchId?: string) {
  const [row] = await db.insert(runHistoryTable).values({
    moduleId,
    moduleName: getModuleName(moduleId),
    target,
    output: lines.join("\n"),
    batchId: batchId ?? null,
  }).returning();
  return row;
}

router.post("/sentinel/execute", async (req, res) => {
  const parsed = ExecuteModuleBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }

  const { moduleId, target } = parsed.data;
  const runId = randomUUID();
  const runState: RunState = { lines: [], done: false, listeners: [] };
  activeRuns.set(runId, runState);

  let historyId = 0;
  const [row] = await db.insert(runHistoryTable).values({
    moduleId,
    moduleName: getModuleName(moduleId),
    target,
    output: "",
    batchId: null,
  }).returning();
  historyId = row.id;

  spawnModule(moduleId, target, runState, async () => {
    await db.update(runHistoryTable)
      .set({ output: runState.lines.join("\n") })
      .where(eq(runHistoryTable.id, historyId));
    setTimeout(() => activeRuns.delete(runId), 60_000);
  });

  res.json({ runId, moduleId, target, streamUrl: `/api/sentinel/stream/${runId}`, historyId });
});

router.post("/sentinel/batch", async (req, res) => {
  const parsed = ExecuteBatchBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request body" }); return; }

  const { moduleIds, target } = parsed.data;
  if (!moduleIds.length) { res.status(400).json({ error: "moduleIds must not be empty" }); return; }

  const batchId = randomUUID();
  const runId = randomUUID();
  const runState: RunState = { lines: [], done: false, listeners: [] };
  activeRuns.set(runId, runState);

  const push = (line: string) => {
    runState.lines.push(line);
    for (const l of runState.listeners) l(line);
  };

  const runSequential = async () => {
    for (let i = 0; i < moduleIds.length; i++) {
      const mid = moduleIds[i];
      push(`\n--- [${i + 1}/${moduleIds.length}] MODULE ${mid}: ${getModuleName(mid)} ---`);
      const subState: RunState = { lines: [], done: false, listeners: [] };
      await new Promise<void>((resolve) => {
        spawnModule(mid, target, subState, resolve);
        subState.listeners.push((line) => push(line));
      });
      await saveHistory(mid, target, subState.lines, batchId);
    }
    push(`\n--- BATCH COMPLETE: ${moduleIds.length} MODULES EXECUTED ---`);
    runState.done = true;
    for (const l of runState.listeners) l("[BATCH_DONE]");
    runState.listeners = [];
    setTimeout(() => activeRuns.delete(runId), 60_000);
  };

  runSequential();

  res.json({ batchId, runId, moduleIds, target, streamUrl: `/api/sentinel/stream/${runId}` });
});

router.get("/sentinel/stream/:runId", (req, res) => {
  const parsed = StreamOutputParams.safeParse({ runId: req.params.runId });
  if (!parsed.success) { res.status(400).json({ error: "Invalid runId" }); return; }

  const runState = activeRuns.get(parsed.data.runId);
  if (!runState) { res.status(404).json({ error: "Run not found" }); return; }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const send = (line: string) => res.write(`data: ${JSON.stringify(line)}\n\n`);

  for (const line of runState.lines) send(line);

  if (runState.done) {
    res.write("event: done\ndata: done\n\n");
    res.end();
    return;
  }

  const listener = (line: string) => {
    send(line);
    if (runState.done) {
      res.write("event: done\ndata: done\n\n");
      res.end();
    }
  };
  runState.listeners.push(listener);
  req.on("close", () => {
    runState.listeners = runState.listeners.filter((l) => l !== listener);
  });
});

router.get("/sentinel/history", async (_req, res) => {
  const rows = await db.select().from(runHistoryTable).orderBy(desc(runHistoryTable.createdAt)).limit(200);
  res.json(rows);
});

router.get("/sentinel/history/:id", async (req, res) => {
  const parsed = GetHistoryRunParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [row] = await db.select().from(runHistoryTable).where(eq(runHistoryTable.id, parsed.data.id));
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json(row);
});

router.delete("/sentinel/history/:id", async (req, res) => {
  const parsed = DeleteHistoryRunParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }

  const [row] = await db.delete(runHistoryTable).where(eq(runHistoryTable.id, parsed.data.id)).returning();
  if (!row) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ok: true });
});

export default router;
