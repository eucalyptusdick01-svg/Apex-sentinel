import { Router, type IRouter } from "express";
import { spawn } from "child_process";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";
import {
  ExecuteModuleBody,
  StreamOutputParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const SPECIALIZED_MODULES: Record<number, string> = {
  1: "IP TRACKER",
  2: "DNS RESOLVE",
  3: "PORT SCAN",
  5: "WHOIS QUERY",
  6: "PHONE OSINT",
  7: "EMAIL REP",
  8: "PROXY CHECK",
  9: "DB SEARCH",
  10: "GEOLOCATE",
  45: "INSTAGRAM",
  46: "TIKTOK",
  49: "TELEGRAM ID",
  53: "STEAM ID",
  60: "TRUECALLER",
  71: "VIN CHECK",
  91: "SATELLITE",
  131: "SQL MAP",
  201: "BGP ROUTE",
  207: "CDN ORIGIN",
  230: "DMARC ANALYZE",
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
    return {
      id,
      name: getModuleName(id),
      category: getModuleCategory(id),
    };
  });
  res.json(modules);
});

const activeRuns = new Map<string, {
  lines: string[];
  done: boolean;
  listeners: Array<(line: string) => void>;
}>();

router.post("/sentinel/execute", (req, res) => {
  const parsed = ExecuteModuleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { moduleId, target } = parsed.data;
  const runId = randomUUID();
  const runState = { lines: [] as string[], done: false, listeners: [] as Array<(line: string) => void> };
  activeRuns.set(runId, runState);

  const sentinelPath = path.resolve(process.cwd(), "swept_sentinel.py");
  const sentinelExists = fs.existsSync(sentinelPath);

  if (sentinelExists) {
    const proc = spawn("python3", [sentinelPath], {
      cwd: process.cwd(),
    });

    proc.stdin.write(`${moduleId}\n${target}\n`);
    proc.stdin.end();

    proc.stdout.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      const lines = text.split("\n").filter((l) => l.length > 0);
      for (const line of lines) {
        runState.lines.push(line);
        for (const listener of runState.listeners) {
          listener(line);
        }
      }
    });

    proc.stderr.on("data", (chunk: Buffer) => {
      const text = chunk.toString().trim();
      if (text) {
        const line = `[STDERR] ${text}`;
        runState.lines.push(line);
        for (const listener of runState.listeners) {
          listener(line);
        }
      }
    });

    proc.on("close", (code) => {
      const doneLine = `[PROCESS EXITED: code ${code}]`;
      runState.lines.push(doneLine);
      for (const listener of runState.listeners) {
        listener(doneLine);
      }
      runState.done = true;
      runState.listeners = [];
      setTimeout(() => activeRuns.delete(runId), 60_000);
    });

    proc.on("error", (err) => {
      const errLine = `[ERROR] ${err.message}`;
      runState.lines.push(errLine);
      for (const listener of runState.listeners) {
        listener(errLine);
      }
      runState.done = true;
      runState.listeners = [];
      setTimeout(() => activeRuns.delete(runId), 60_000);
    });
  } else {
    const stub = [
      `[MODULE ${moduleId}] ${getModuleName(moduleId)} — executing on: ${target}`,
      `[INFO] swept_sentinel.py not found at project root.`,
      `[INFO] Drop your swept_sentinel.py file into the project root to enable real execution.`,
      `[INFO] The module will read stdin: first line = module number, second line = target.`,
      `[DONE] Simulation complete.`,
    ];
    for (const line of stub) {
      runState.lines.push(line);
    }
    runState.done = true;
    setTimeout(() => activeRuns.delete(runId), 60_000);
  }

  const streamUrl = `/api/sentinel/stream/${runId}`;
  res.json({ runId, moduleId, target, streamUrl });
});

router.get("/sentinel/stream/:runId", (req, res) => {
  const parsed = StreamOutputParams.safeParse({ runId: req.params.runId });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid runId" });
    return;
  }

  const { runId } = parsed.data;
  const runState = activeRuns.get(runId);
  if (!runState) {
    res.status(404).json({ error: "Run not found" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const send = (line: string) => {
    res.write(`data: ${JSON.stringify(line)}\n\n`);
  };

  for (const line of runState.lines) {
    send(line);
  }

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

export default router;
