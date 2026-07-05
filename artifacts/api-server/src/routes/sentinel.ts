import { Router, type IRouter } from "express";
import { spawn } from "child_process";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";
import dns from "dns/promises";
import net from "net";
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

const REAL_LOOKUP_MODULES = new Set([1, 2, 3, 5, 7, 8, 10]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function emitLine(
  runState: { lines: string[]; done: boolean; listeners: Array<(line: string) => void> },
  line: string,
): void {
  runState.lines.push(line);
  for (const listener of runState.listeners) {
    listener(line);
  }
}

function finishRun(
  runState: { lines: string[]; done: boolean; listeners: Array<(line: string) => void> },
  runId: string,
): void {
  runState.done = true;
  runState.listeners = [];
  setTimeout(() => activeRuns.delete(runId), 60_000);
}

async function fetchEmailLookupLines(target: string): Promise<string[]> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validFormat = emailRegex.test(target);
  const domain = target.split("@")[1];

  const lines: string[] = [
    `[MODULE 7] EMAIL REP — executing on: ${target}`,
    `[QUERY] format validation + DNS MX lookup + disposable-domain check`,
    `[RESULT] valid format: ${validFormat}`,
  ];

  if (!validFormat || !domain) {
    lines.push(`[RESULT] domain: n/a`);
    lines.push(`[ASSESSMENT] risk level: HIGH — malformed email address`);
    lines.push(`[DONE] Lookup complete.`);
    return lines;
  }

  lines.push(`[RESULT] domain: ${domain}`);

  let mxRecords: Awaited<ReturnType<typeof dns.resolveMx>> = [];
  try {
    mxRecords = await dns.resolveMx(domain);
  } catch {
    mxRecords = [];
  }
  const canReceiveMail = mxRecords.length > 0;
  lines.push(`[RESULT] mx records found: ${mxRecords.length}`);
  lines.push(`[RESULT] can receive mail: ${canReceiveMail}`);
  if (canReceiveMail) {
    const top = [...mxRecords].sort((a, b) => a.priority - b.priority)[0];
    lines.push(`[RESULT] primary mail server: ${top.exchange}`);
  }

  let domainResolves = canReceiveMail;
  if (!domainResolves) {
    try {
      await dns.resolve4(domain);
      domainResolves = true;
    } catch {
      try {
        await dns.resolve6(domain);
        domainResolves = true;
      } catch {
        domainResolves = false;
      }
    }
  }
  lines.push(`[RESULT] domain resolves: ${domainResolves}`);

  let disposable: boolean | null = null;
  try {
    const res = await fetch(`https://open.kickbox.com/v1/disposable/${encodeURIComponent(target)}`);
    if (res.ok) {
      const data = (await res.json()) as { disposable?: boolean };
      disposable = data.disposable ?? null;
    }
  } catch {
    disposable = null;
  }
  lines.push(`[FLAGS] disposable/temp email: ${disposable === null ? "unknown" : String(disposable)}`);

  const risk = !domainResolves
    ? "HIGH — domain does not resolve"
    : disposable
      ? "HIGH — disposable email provider"
      : !canReceiveMail
        ? "MEDIUM — no MX records found"
        : "LOW";
  lines.push(`[ASSESSMENT] risk level: ${risk}`);
  lines.push(`[DONE] Lookup complete.`);
  return lines;
}

async function fetchIpLookupLines(moduleId: number, target: string): Promise<string[]> {
  const res = await fetch(
    `http://ip-api.com/json/${encodeURIComponent(target)}?fields=status,message,country,regionName,city,zip,lat,lon,timezone,isp,org,as,query,reverse,proxy,hosting`,
  );
  if (!res.ok) {
    throw new Error(`ip-api.com responded with status ${res.status}`);
  }
  const data = (await res.json()) as {
    status: string;
    message?: string;
    country?: string;
    regionName?: string;
    city?: string;
    zip?: string;
    lat?: number;
    lon?: number;
    timezone?: string;
    isp?: string;
    org?: string;
    as?: string;
    query?: string;
    reverse?: string;
    proxy?: boolean;
    hosting?: boolean;
  };

  if (data.status !== "success") {
    throw new Error(data.message ?? "lookup failed — target must be a valid IP or hostname");
  }

  return [
    `[MODULE ${moduleId}] ${getModuleName(moduleId)} — executing on: ${target}`,
    `[QUERY] ip-api.com geolocation + network lookup`,
    `[RESULT] ip: ${data.query ?? target}`,
    `[RESULT] hostname: ${data.reverse || "n/a"}`,
    `[RESULT] country: ${data.country ?? "unknown"}`,
    `[RESULT] region: ${data.regionName ?? "unknown"}`,
    `[RESULT] city: ${data.city ?? "unknown"}${data.zip ? `, ${data.zip}` : ""}`,
    `[RESULT] coordinates: ${data.lat ?? "?"}, ${data.lon ?? "?"}`,
    `[RESULT] timezone: ${data.timezone ?? "unknown"}`,
    `[RESULT] isp: ${data.isp ?? "unknown"}`,
    `[RESULT] org: ${data.org ?? "unknown"}`,
    `[RESULT] as: ${data.as ?? "unknown"}`,
    `[FLAGS] proxy/vpn detected: ${String(data.proxy ?? "unknown")}`,
    `[FLAGS] hosting/datacenter: ${String(data.hosting ?? "unknown")}`,
    `[DONE] Lookup complete.`,
  ];
}

async function fetchDnsResolveLines(target: string): Promise<string[]> {
  const lines: string[] = [
    `[MODULE 2] DNS RESOLVE — executing on: ${target}`,
    `[QUERY] DNS record lookup (A/AAAA/MX/TXT/NS/CNAME)`,
  ];

  try {
    const a = await dns.resolve4(target);
    lines.push(`[A] ${a.join(", ")}`);
  } catch {
    lines.push(`[A] none found`);
  }
  try {
    const aaaa = await dns.resolve6(target);
    lines.push(`[AAAA] ${aaaa.join(", ")}`);
  } catch {
    lines.push(`[AAAA] none found`);
  }
  try {
    const mx = await dns.resolveMx(target);
    lines.push(
      `[MX] ${mx.length ? mx.map((m) => `${m.exchange} (priority ${m.priority})`).join(", ") : "none found"}`,
    );
  } catch {
    lines.push(`[MX] none found`);
  }
  try {
    const txt = await dns.resolveTxt(target);
    lines.push(`[TXT] ${txt.length ? txt.map((t) => t.join("")).join(" | ") : "none found"}`);
  } catch {
    lines.push(`[TXT] none found`);
  }
  try {
    const ns = await dns.resolveNs(target);
    lines.push(`[NS] ${ns.join(", ")}`);
  } catch {
    lines.push(`[NS] none found`);
  }
  try {
    const cname = await dns.resolveCname(target);
    lines.push(`[CNAME] ${cname.join(", ")}`);
  } catch {
    lines.push(`[CNAME] none found`);
  }
  lines.push(`[DONE] DNS resolution complete.`);
  return lines;
}

const COMMON_PORTS: Array<[number, string]> = [
  [21, "FTP"],
  [22, "SSH"],
  [23, "Telnet"],
  [25, "SMTP"],
  [53, "DNS"],
  [80, "HTTP"],
  [110, "POP3"],
  [143, "IMAP"],
  [443, "HTTPS"],
  [445, "SMB"],
  [3306, "MySQL"],
  [3389, "RDP"],
  [5432, "PostgreSQL"],
  [6379, "Redis"],
  [8080, "HTTP-ALT"],
  [8443, "HTTPS-ALT"],
];

function checkPort(host: string, port: number, timeoutMs = 1000): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;
    const finish = (open: boolean) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(open);
    };
    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
    socket.connect(port, host);
  });
}

async function fetchPortScanLines(target: string): Promise<string[]> {
  const lines: string[] = [
    `[MODULE 3] PORT SCAN — executing on: ${target}`,
    `[QUERY] TCP connect scan across ${COMMON_PORTS.length} common ports`,
  ];

  const results = await Promise.all(
    COMMON_PORTS.map(async ([port, name]) => ({ port, name, open: await checkPort(target, port) })),
  );

  for (const r of results) {
    lines.push(`[PORT ${r.port}/${r.name}] ${r.open ? "OPEN" : "closed"}`);
  }
  const openCount = results.filter((r) => r.open).length;
  lines.push(`[RESULT] ${openCount} open port(s) found out of ${COMMON_PORTS.length} scanned`);
  lines.push(`[DONE] Port scan complete.`);
  return lines;
}

async function fetchWhoisLines(target: string): Promise<string[]> {
  const domain = target.replace(/^https?:\/\//, "").split("/")[0];
  const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
    headers: { Accept: "application/rdap+json" },
  });
  if (!res.ok) {
    throw new Error(
      `RDAP lookup failed with status ${res.status} — domain may not exist or its TLD is unsupported`,
    );
  }
  const data = (await res.json()) as {
    ldhName?: string;
    status?: string[];
    events?: Array<{ eventAction: string; eventDate: string }>;
    nameservers?: Array<{ ldhName: string }>;
  };

  const registration = data.events?.find((e) => e.eventAction === "registration");
  const expiration = data.events?.find((e) => e.eventAction === "expiration");
  const lastChanged = data.events?.find((e) => e.eventAction === "last changed");
  const nameservers = (data.nameservers ?? []).map((ns) => ns.ldhName).join(", ");

  return [
    `[MODULE 5] WHOIS QUERY — executing on: ${domain}`,
    `[QUERY] RDAP domain registration lookup`,
    `[RESULT] domain: ${data.ldhName ?? domain}`,
    `[RESULT] status: ${(data.status ?? []).join(", ") || "unknown"}`,
    `[RESULT] registered: ${registration?.eventDate ?? "unknown"}`,
    `[RESULT] expires: ${expiration?.eventDate ?? "unknown"}`,
    `[RESULT] last changed: ${lastChanged?.eventDate ?? "unknown"}`,
    `[RESULT] nameservers: ${nameservers || "none found"}`,
    `[DONE] WHOIS lookup complete.`,
  ];
}

async function runRealLookup(
  moduleId: number,
  target: string,
  runState: { lines: string[]; done: boolean; listeners: Array<(line: string) => void> },
  runId: string,
): Promise<void> {
  try {
    let lines: string[];
    if (moduleId === 7) {
      lines = await fetchEmailLookupLines(target);
    } else if (moduleId === 2) {
      lines = await fetchDnsResolveLines(target);
    } else if (moduleId === 3) {
      lines = await fetchPortScanLines(target);
    } else if (moduleId === 5) {
      lines = await fetchWhoisLines(target);
    } else {
      lines = await fetchIpLookupLines(moduleId, target);
    }
    for (const line of lines) {
      emitLine(runState, line);
      await sleep(120);
    }
    emitLine(runState, `[PROCESS EXITED: code 0]`);
  } catch (err) {
    emitLine(runState, `[ERROR] ${(err as Error).message}`);
    emitLine(runState, `[PROCESS EXITED: code 1]`);
  } finally {
    finishRun(runState, runId);
  }
}

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

  if (REAL_LOOKUP_MODULES.has(moduleId)) {
    void runRealLookup(moduleId, target, runState, runId);
  } else if (sentinelExists) {
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
