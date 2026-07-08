import { Router, type IRouter } from "express";
import { spawn } from "child_process";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";
import dns from "dns/promises";
import net from "net";
import tls from "tls";
import {
  ExecuteModuleBody,
  StreamOutputParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

const SPECIALIZED_MODULES: Record<number, string> = {
  1: "IP TRACKER",
  2: "DNS RESOLVE",
  3: "PORT SCAN",
  4: "ASN LOOKUP",
  5: "WHOIS QUERY",
  6: "PHONE OSINT",
  7: "EMAIL REP",
  8: "PROXY CHECK",
  9: "DB SEARCH",
  10: "GEOLOCATE",
  11: "GITHUB LOOKUP",
  12: "USERNAME CHECK",
  13: "NEWS SEARCH",
  14: "PEOPLE SEARCH",
  15: "IMAGE SEARCH",
  16: "SITE ENUM",
  17: "SUBDOMAIN SCAN",
  18: "DNS FULL",
  19: "PAGE LINKS",
  20: "SHARED HOST",
  21: "ZONE TRANSFER",
  22: "ZIP LOOKUP",
  23: "ADDRESS LOOKUP",
  24: "AREA CODE",
  25: "BIZ DIRECTORY",
  45: "INSTAGRAM",
  46: "TIKTOK",
  49: "TELEGRAM ID",
  53: "STEAM ID",
  60: "TRUECALLER",
  71: "VIN CHECK",
  91: "SATELLITE",
  92: "SSL CERT INFO",
  93: "WAYBACK CHECK",
  94: "HTTP FINGERPRINT",
  95: "REVERSE IP",
  96: "TECH STACK",
  97: "ADMIN FINDER",
  98: "ROBOTS SCAN",
  99: "API PROBE",
  100: "CERT HISTORY",
  131: "SQL MAP",
  151: "CVE LOOKUP",
  152: "MAC LOOKUP",
  153: "SHODAN PROBE",
  154: "THREAT INTEL",
  155: "RIPE STAT",
  156: "DUCK INTEL",
  201: "BGP ROUTE",
  207: "CDN ORIGIN",
  208: "TOR CHECK",
  209: "URL SCAN",
  210: "ARCHIVE DEPTH",
  211: "NPM AUDIT",
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

const REAL_LOOKUP_MODULES = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 71, 92, 93, 94, 95, 96, 97, 98, 99, 100, 151, 152, 153, 154, 155, 156, 201, 207, 208, 209, 210, 211, 230]);

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

async function fetchGithubLookupLines(moduleId: number, target: string): Promise<string[]> {
  const res = await fetch(`https://api.github.com/users/${encodeURIComponent(target)}`, {
    headers: { "User-Agent": "swept-sentinel-osint", Accept: "application/vnd.github+json" },
  });
  if (res.status === 404) {
    return [
      `[MODULE ${moduleId}] GITHUB LOOKUP — executing on: ${target}`,
      `[QUERY] GitHub public API user lookup`,
      `[RESULT] account exists: false`,
      `[DONE] Lookup complete — no GitHub account found for this username.`,
    ];
  }
  if (!res.ok) {
    throw new Error(`GitHub API responded with status ${res.status}`);
  }
  const data = (await res.json()) as {
    login?: string;
    name?: string;
    bio?: string;
    public_repos?: number;
    followers?: number;
    following?: number;
    created_at?: string;
    location?: string;
    company?: string;
    html_url?: string;
  };
  return [
    `[MODULE ${moduleId}] GITHUB LOOKUP — executing on: ${target}`,
    `[QUERY] GitHub public API user lookup`,
    `[RESULT] account exists: true`,
    `[RESULT] username: ${data.login ?? target}`,
    `[RESULT] display name: ${data.name ?? "n/a"}`,
    `[RESULT] bio: ${data.bio ?? "n/a"}`,
    `[RESULT] location: ${data.location ?? "n/a"}`,
    `[RESULT] company: ${data.company ?? "n/a"}`,
    `[RESULT] public repos: ${String(data.public_repos ?? 0)}`,
    `[RESULT] followers: ${String(data.followers ?? 0)} | following: ${String(data.following ?? 0)}`,
    `[RESULT] account created: ${data.created_at ?? "unknown"}`,
    `[RESULT] profile url: ${data.html_url ?? `https://github.com/${target}`}`,
    `[DONE] Lookup complete.`,
  ];
}

async function fetchUsernameCheckLines(moduleId: number, target: string): Promise<string[]> {
  const platforms: Array<{ name: string; check: () => Promise<boolean> }> = [
    {
      name: "GitHub",
      check: async () => {
        const r = await fetch(`https://api.github.com/users/${encodeURIComponent(target)}`, {
          headers: { "User-Agent": "swept-sentinel-osint" },
        });
        return r.status === 200;
      },
    },
    {
      name: "Reddit",
      check: async () => {
        const r = await fetch(`https://www.reddit.com/user/${encodeURIComponent(target)}/about.json`, {
          headers: { "User-Agent": "swept-sentinel-osint" },
        });
        return r.status === 200;
      },
    },
  ];

  const lines: string[] = [
    `[MODULE ${moduleId}] USERNAME CHECK — executing on: ${target}`,
    `[QUERY] live availability check across platforms`,
  ];

  for (const p of platforms) {
    let taken = false;
    try {
      taken = await p.check();
    } catch {
      taken = false;
    }
    lines.push(`[PLATFORM ${p.name}] ${taken ? "TAKEN" : "available / not found"}`);
  }
  lines.push(`[DONE] Username check complete.`);
  return lines;
}

function fetchSslCertLines(moduleId: number, target: string): Promise<string[]> {
  const domain = target.replace(/^https?:\/\//, "").split("/")[0];
  return new Promise((resolve) => {
    const socket = tls.connect(
      { host: domain, port: 443, servername: domain, timeout: 5000, rejectUnauthorized: false },
      () => {
        const cert = socket.getPeerCertificate();
        const lines: string[] = [
          `[MODULE ${moduleId}] SSL CERT INFO — executing on: ${domain}`,
          `[QUERY] live TLS certificate handshake`,
        ];
        if (cert && Object.keys(cert).length > 0) {
          lines.push(`[RESULT] subject: ${cert.subject?.CN ?? "unknown"}`);
          lines.push(`[RESULT] issuer: ${cert.issuer?.O ?? cert.issuer?.CN ?? "unknown"}`);
          lines.push(`[RESULT] valid from: ${cert.valid_from ?? "unknown"}`);
          lines.push(`[RESULT] valid to: ${cert.valid_to ?? "unknown"}`);
          lines.push(`[RESULT] serial number: ${cert.serialNumber ?? "unknown"}`);
          const altNames = (cert.subjectaltname ?? "").split(", ").slice(0, 8).join(", ");
          lines.push(`[RESULT] alt names: ${altNames || "none"}`);
          lines.push(`[RESULT] tls protocol: ${socket.getProtocol() ?? "unknown"}`);
        } else {
          lines.push(`[ERROR] no certificate returned`);
        }
        lines.push(`[DONE] Certificate inspection complete.`);
        socket.destroy();
        resolve(lines);
      },
    );
    socket.once("error", (err: Error) => {
      resolve([
        `[MODULE ${moduleId}] SSL CERT INFO — executing on: ${domain}`,
        `[ERROR] ${err.message}`,
        `[DONE] Certificate inspection failed.`,
      ]);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve([
        `[MODULE ${moduleId}] SSL CERT INFO — executing on: ${domain}`,
        `[ERROR] connection timed out`,
        `[DONE] Certificate inspection failed.`,
      ]);
    });
  });
}

async function fetchWaybackLines(moduleId: number, target: string): Promise<string[]> {
  const res = await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(target)}`);
  if (!res.ok) {
    throw new Error(`archive.org responded with status ${res.status}`);
  }
  const data = (await res.json()) as {
    archived_snapshots?: {
      closest?: { available?: boolean; url?: string; timestamp?: string; status?: string };
    };
  };
  const snap = data.archived_snapshots?.closest;
  const lines: string[] = [
    `[MODULE ${moduleId}] WAYBACK CHECK — executing on: ${target}`,
    `[QUERY] archive.org Wayback Machine availability check`,
  ];
  if (snap?.available) {
    lines.push(`[RESULT] archived: true`);
    lines.push(`[RESULT] closest snapshot: ${snap.timestamp ?? "unknown"}`);
    lines.push(`[RESULT] snapshot url: ${snap.url ?? "n/a"}`);
    lines.push(`[RESULT] http status at capture: ${snap.status ?? "unknown"}`);
  } else {
    lines.push(`[RESULT] archived: false`);
    lines.push(`[RESULT] no snapshots found for this URL`);
  }
  lines.push(`[DONE] Wayback lookup complete.`);
  return lines;
}

async function fetchHttpFingerprintLines(moduleId: number, target: string): Promise<string[]> {
  const url = target.startsWith("http") ? target : `https://${target}`;
  const res = await fetch(url, { redirect: "follow" });
  const cfRay = res.headers.get("cf-ray");
  const via = res.headers.get("via");
  const servedBy = res.headers.get("x-served-by");
  const cdnIndicator = cfRay ? "Cloudflare" : (via ?? servedBy ?? "unknown");
  return [
    `[MODULE ${moduleId}] HTTP FINGERPRINT — executing on: ${target}`,
    `[QUERY] live HTTP header + tech fingerprint scan`,
    `[RESULT] final url: ${res.url}`,
    `[RESULT] status: ${res.status} ${res.statusText}`,
    `[RESULT] server: ${res.headers.get("server") ?? "not disclosed"}`,
    `[RESULT] x-powered-by: ${res.headers.get("x-powered-by") ?? "not disclosed"}`,
    `[RESULT] content-type: ${res.headers.get("content-type") ?? "unknown"}`,
    `[RESULT] cache-control: ${res.headers.get("cache-control") ?? "none"}`,
    `[RESULT] set-cookie present: ${String(res.headers.has("set-cookie"))}`,
    `[RESULT] cdn indicator: ${cdnIndicator}`,
    `[DONE] Fingerprint scan complete.`,
  ];
}

async function fetchBgpRouteLines(moduleId: number, target: string): Promise<string[]> {
  let ip = target;
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(target) || target.includes(":");
  if (!isIp) {
    try {
      const addrs = await dns.resolve4(target);
      ip = addrs[0] ?? target;
    } catch {
      throw new Error(`could not resolve ${target} to an IP address`);
    }
  }
  const res = await fetch(`https://ipinfo.io/${encodeURIComponent(ip)}/json`, {
    headers: { "User-Agent": "swept-sentinel-osint" },
  });
  if (!res.ok) {
    throw new Error(`ipinfo.io responded with status ${res.status}`);
  }
  const data = (await res.json()) as {
    ip?: string;
    org?: string;
    country?: string;
    city?: string;
    region?: string;
    anycast?: boolean;
    bogon?: boolean;
  };
  if (data.bogon) {
    throw new Error("target is a bogon/private address — no BGP route data available");
  }
  const orgMatch = data.org?.match(/^(AS\d+)\s+(.*)$/);
  const asn = orgMatch?.[1] ?? "unknown";
  const asName = orgMatch?.[2] ?? data.org ?? "unknown";
  const lines: string[] = [
    `[MODULE ${moduleId}] BGP ROUTE — executing on: ${target}`,
    `[QUERY] ipinfo.io ASN + network ownership lookup`,
    `[RESULT] ip: ${data.ip ?? ip}`,
    `[RESULT] asn: ${asn}`,
    `[RESULT] as name: ${asName}`,
    `[RESULT] country: ${data.country ?? "unknown"}`,
    `[RESULT] region/city: ${data.region ?? "unknown"}, ${data.city ?? "unknown"}`,
    `[RESULT] anycast: ${String(data.anycast ?? false)}`,
  ];
  lines.push(`[DONE] BGP route lookup complete.`);
  return lines;
}

async function fetchDmarcAnalyzeLines(moduleId: number, target: string): Promise<string[]> {
  const domain = target.replace(/^https?:\/\//, "").split("/")[0];
  const lines: string[] = [
    `[MODULE ${moduleId}] DMARC ANALYZE — executing on: ${domain}`,
    `[QUERY] DNS TXT lookup for SPF + DMARC records`,
  ];

  let spf: string | null = null;
  try {
    const txt = await dns.resolveTxt(domain);
    const flat = txt.map((t) => t.join(""));
    spf = flat.find((t) => t.toLowerCase().startsWith("v=spf1")) ?? null;
  } catch {
    spf = null;
  }
  lines.push(`[SPF] ${spf ?? "no SPF record found"}`);

  let dmarc: string | null = null;
  try {
    const txt = await dns.resolveTxt(`_dmarc.${domain}`);
    const flat = txt.map((t) => t.join(""));
    dmarc = flat.find((t) => t.toLowerCase().startsWith("v=dmarc1")) ?? flat[0] ?? null;
  } catch {
    dmarc = null;
  }
  lines.push(`[DMARC] ${dmarc ?? "no DMARC record found"}`);

  const policyMatch = dmarc?.match(/p=([a-zA-Z]+)/);
  const policy = policyMatch?.[1] ?? "none";
  const risk = !spf && !dmarc
    ? "HIGH — no email authentication configured"
    : !dmarc
      ? "MEDIUM — SPF only, no DMARC enforcement"
      : policy === "none"
        ? "MEDIUM — DMARC present but policy is 'none' (monitor only)"
        : "LOW — SPF + DMARC enforced";
  lines.push(`[ASSESSMENT] dmarc policy: ${policy}`);
  lines.push(`[ASSESSMENT] risk level: ${risk}`);
  lines.push(`[DONE] DMARC analysis complete.`);
  return lines;
}

const SERPAPI_KEY = process.env["SERPAPI_KEY"] ?? "";

async function fetchSerpApiResults(
  query: string,
  params: Record<string, string> = {},
): Promise<{
  organic_results?: Array<{ title?: string; link?: string; snippet?: string; displayed_link?: string }>;
  news_results?: Array<{ title?: string; link?: string; snippet?: string; source?: string; date?: string }>;
  error?: string;
}> {
  if (!SERPAPI_KEY) throw new Error("SERPAPI_KEY not configured");
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("api_key", SERPAPI_KEY);
  url.searchParams.set("q", query);
  url.searchParams.set("num", "10");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { headers: { "User-Agent": "swept-sentinel-osint" } });
  if (!res.ok) throw new Error(`SerpApi responded with status ${res.status}`);
  return (await res.json()) as Awaited<ReturnType<typeof fetchSerpApiResults>>;
}

async function fetchDbSearchLines(moduleId: number, target: string): Promise<string[]> {
  const data = await fetchSerpApiResults(target, { engine: "google" });
  const results = data.organic_results ?? [];
  const lines: string[] = [
    `[MODULE ${moduleId}] DB SEARCH — executing on: ${target}`,
    `[QUERY] Google web search via SerpApi`,
    `[RESULT] organic results found: ${results.length}`,
  ];
  for (const r of results.slice(0, 8)) {
    lines.push(`[HIT] ${r.title ?? "untitled"}`);
    lines.push(`  url: ${r.link ?? "n/a"}`);
    if (r.snippet) lines.push(`  snippet: ${r.snippet.slice(0, 120)}${r.snippet.length > 120 ? "…" : ""}`);
  }
  if (results.length === 0) lines.push(`[RESULT] no results returned`);
  lines.push(`[DONE] Search complete.`);
  return lines;
}

async function fetchNewsSearchLines(moduleId: number, target: string): Promise<string[]> {
  const data = await fetchSerpApiResults(target, { engine: "google", tbm: "nws" });
  const results = data.news_results ?? [];
  const lines: string[] = [
    `[MODULE ${moduleId}] NEWS SEARCH — executing on: ${target}`,
    `[QUERY] Google News search via SerpApi`,
    `[RESULT] news articles found: ${results.length}`,
  ];
  for (const r of results.slice(0, 8)) {
    lines.push(`[ARTICLE] ${r.title ?? "untitled"}`);
    lines.push(`  source: ${r.source ?? "unknown"}  date: ${r.date ?? "n/a"}`);
    lines.push(`  url: ${r.link ?? "n/a"}`);
    if (r.snippet) lines.push(`  summary: ${r.snippet.slice(0, 120)}${r.snippet.length > 120 ? "…" : ""}`);
  }
  if (results.length === 0) lines.push(`[RESULT] no news articles found`);
  lines.push(`[DONE] News search complete.`);
  return lines;
}

async function fetchPeopleSearchLines(moduleId: number, target: string): Promise<string[]> {
  const query = `"${target}" (site:linkedin.com OR site:twitter.com OR site:facebook.com OR site:instagram.com OR "about.me")`;
  const data = await fetchSerpApiResults(query, { engine: "google" });
  const results = data.organic_results ?? [];
  const lines: string[] = [
    `[MODULE ${moduleId}] PEOPLE SEARCH — executing on: ${target}`,
    `[QUERY] targeted social-profile search via SerpApi Google`,
    `[RESULT] profile hits found: ${results.length}`,
  ];
  for (const r of results.slice(0, 8)) {
    const platform = r.link?.includes("linkedin") ? "LinkedIn"
      : r.link?.includes("twitter") ? "Twitter/X"
      : r.link?.includes("facebook") ? "Facebook"
      : r.link?.includes("instagram") ? "Instagram"
      : r.link?.includes("about.me") ? "About.me"
      : "Web";
    lines.push(`[PROFILE] [${platform}] ${r.title ?? "untitled"}`);
    lines.push(`  url: ${r.link ?? "n/a"}`);
    if (r.snippet) lines.push(`  info: ${r.snippet.slice(0, 120)}${r.snippet.length > 120 ? "…" : ""}`);
  }
  if (results.length === 0) lines.push(`[RESULT] no public profiles found for this target`);
  lines.push(`[DONE] People search complete.`);
  return lines;
}

async function fetchBizDirectoryLines(moduleId: number, target: string): Promise<string[]> {
  const serpKey = process.env["SERPAPI_KEY"];
  if (!serpKey) throw new Error("SERPAPI_KEY not set");

  const q = target.trim();
  const lines: string[] = [
    `[MODULE ${moduleId}] BIZ DIRECTORY — executing on: ${q}`,
    `[QUERY] business directory search across YellowPages, Yelp, Whitepages, BBB`,
  ];

  type SerpResult = { title?: string; link?: string; snippet?: string };

  const SOURCES: Array<{ label: string; site: string }> = [
    { label: "YellowPages", site: "yellowpages.com" },
    { label: "Yelp", site: "yelp.com" },
    { label: "Whitepages", site: "whitepages.com" },
    { label: "BBB", site: "bbb.org" },
  ];

  const fetches = SOURCES.map(async ({ label, site }) => {
    const encoded = encodeURIComponent(`site:${site} "${q}"`);
    const res = await fetch(
      `https://serpapi.com/search.json?q=${encoded}&num=5&api_key=${serpKey}`,
      { headers: { "User-Agent": "swept-sentinel-osint" } },
    );
    if (!res.ok) return { label, results: [] as SerpResult[] };
    const data = (await res.json()) as { organic_results?: SerpResult[] };
    return { label, results: data.organic_results ?? [] };
  });

  const results = await Promise.all(fetches);
  let totalHits = 0;
  for (const { label, results: hits } of results) {
    if (!hits.length) {
      lines.push(`[${label}] no listings found`);
      continue;
    }
    totalHits += hits.length;
    lines.push(`[${label}] ${hits.length} listing${hits.length !== 1 ? "s" : ""} found`);
    for (const r of hits.slice(0, 3)) {
      lines.push(`  [LISTING] ${r.title ?? "untitled"}`);
      if (r.link) lines.push(`    url: ${r.link}`);
      if (r.snippet) lines.push(`    ${r.snippet.slice(0, 160)}`);
    }
  }
  lines.push(`[RESULT] total directory hits: ${totalHits}`);
  if (totalHits === 0) {
    lines.push(`[RESULT] no business listings found — try a business name, address, or phone number`);
  }
  lines.push(`[DONE] Business directory search complete.`);
  return lines;
}

async function fetchAreaCodeLines(moduleId: number, target: string): Promise<string[]> {
  const input = target.trim().replace(/^\+/, "");
  const lines: string[] = [
    `[MODULE ${moduleId}] AREA CODE — executing on: ${input}`,
  ];

  const STATE_INFO: Record<string, { name: string; tz: string; country: string }> = {
    AL: { name: "Alabama", tz: "CT (UTC-6/-5)", country: "US" },
    AK: { name: "Alaska", tz: "AKT (UTC-9/-8)", country: "US" },
    AZ: { name: "Arizona", tz: "MT (UTC-7, no DST)", country: "US" },
    AR: { name: "Arkansas", tz: "CT (UTC-6/-5)", country: "US" },
    CA: { name: "California", tz: "PT (UTC-8/-7)", country: "US" },
    CO: { name: "Colorado", tz: "MT (UTC-7/-6)", country: "US" },
    CT: { name: "Connecticut", tz: "ET (UTC-5/-4)", country: "US" },
    DC: { name: "Washington D.C.", tz: "ET (UTC-5/-4)", country: "US" },
    DE: { name: "Delaware", tz: "ET (UTC-5/-4)", country: "US" },
    FL: { name: "Florida", tz: "ET (UTC-5/-4)", country: "US" },
    GA: { name: "Georgia", tz: "ET (UTC-5/-4)", country: "US" },
    HI: { name: "Hawaii", tz: "HT (UTC-10, no DST)", country: "US" },
    ID: { name: "Idaho", tz: "MT (UTC-7/-6)", country: "US" },
    IL: { name: "Illinois", tz: "CT (UTC-6/-5)", country: "US" },
    IN: { name: "Indiana", tz: "ET (UTC-5/-4)", country: "US" },
    IA: { name: "Iowa", tz: "CT (UTC-6/-5)", country: "US" },
    KS: { name: "Kansas", tz: "CT (UTC-6/-5)", country: "US" },
    KY: { name: "Kentucky", tz: "ET (UTC-5/-4)", country: "US" },
    LA: { name: "Louisiana", tz: "CT (UTC-6/-5)", country: "US" },
    ME: { name: "Maine", tz: "ET (UTC-5/-4)", country: "US" },
    MD: { name: "Maryland", tz: "ET (UTC-5/-4)", country: "US" },
    MA: { name: "Massachusetts", tz: "ET (UTC-5/-4)", country: "US" },
    MI: { name: "Michigan", tz: "ET (UTC-5/-4)", country: "US" },
    MN: { name: "Minnesota", tz: "CT (UTC-6/-5)", country: "US" },
    MS: { name: "Mississippi", tz: "CT (UTC-6/-5)", country: "US" },
    MO: { name: "Missouri", tz: "CT (UTC-6/-5)", country: "US" },
    MT: { name: "Montana", tz: "MT (UTC-7/-6)", country: "US" },
    NE: { name: "Nebraska", tz: "CT (UTC-6/-5)", country: "US" },
    NV: { name: "Nevada", tz: "PT (UTC-8/-7)", country: "US" },
    NH: { name: "New Hampshire", tz: "ET (UTC-5/-4)", country: "US" },
    NJ: { name: "New Jersey", tz: "ET (UTC-5/-4)", country: "US" },
    NM: { name: "New Mexico", tz: "MT (UTC-7/-6)", country: "US" },
    NY: { name: "New York", tz: "ET (UTC-5/-4)", country: "US" },
    NC: { name: "North Carolina", tz: "ET (UTC-5/-4)", country: "US" },
    ND: { name: "North Dakota", tz: "CT (UTC-6/-5)", country: "US" },
    OH: { name: "Ohio", tz: "ET (UTC-5/-4)", country: "US" },
    OK: { name: "Oklahoma", tz: "CT (UTC-6/-5)", country: "US" },
    OR: { name: "Oregon", tz: "PT (UTC-8/-7)", country: "US" },
    PA: { name: "Pennsylvania", tz: "ET (UTC-5/-4)", country: "US" },
    RI: { name: "Rhode Island", tz: "ET (UTC-5/-4)", country: "US" },
    SC: { name: "South Carolina", tz: "ET (UTC-5/-4)", country: "US" },
    SD: { name: "South Dakota", tz: "CT (UTC-6/-5)", country: "US" },
    TN: { name: "Tennessee", tz: "CT (UTC-6/-5)", country: "US" },
    TX: { name: "Texas", tz: "CT (UTC-6/-5)", country: "US" },
    UT: { name: "Utah", tz: "MT (UTC-7/-6)", country: "US" },
    VT: { name: "Vermont", tz: "ET (UTC-5/-4)", country: "US" },
    VI: { name: "U.S. Virgin Islands", tz: "AT (UTC-4, no DST)", country: "US" },
    VA: { name: "Virginia", tz: "ET (UTC-5/-4)", country: "US" },
    WA: { name: "Washington", tz: "PT (UTC-8/-7)", country: "US" },
    WV: { name: "West Virginia", tz: "ET (UTC-5/-4)", country: "US" },
    WI: { name: "Wisconsin", tz: "CT (UTC-6/-5)", country: "US" },
    WY: { name: "Wyoming", tz: "MT (UTC-7/-6)", country: "US" },
    ON: { name: "Ontario", tz: "ET (UTC-5/-4)", country: "CA" },
    QC: { name: "Quebec", tz: "ET (UTC-5/-4)", country: "CA" },
    BC: { name: "British Columbia", tz: "PT (UTC-8/-7)", country: "CA" },
    AB: { name: "Alberta", tz: "MT (UTC-7/-6)", country: "CA" },
    MB: { name: "Manitoba", tz: "CT (UTC-6/-5)", country: "CA" },
    SK: { name: "Saskatchewan", tz: "CT (UTC-6, no DST)", country: "CA" },
    NS: { name: "Nova Scotia", tz: "AT (UTC-4/-3)", country: "CA" },
    NB: { name: "New Brunswick", tz: "AT (UTC-4/-3)", country: "CA" },
    NL: { name: "Newfoundland", tz: "NT (UTC-3:30/-2:30)", country: "CA" },
  };

  const NANP: Record<string, string> = {
    "201":"NJ","202":"DC","203":"CT","204":"MB","205":"AL","206":"WA","207":"ME",
    "208":"ID","209":"CA","210":"TX","212":"NY","213":"CA","214":"TX","215":"PA",
    "216":"OH","217":"IL","218":"MN","219":"IN","224":"IL","225":"LA","226":"ON",
    "228":"MS","229":"GA","231":"MI","234":"OH","236":"BC","239":"FL","240":"MD",
    "248":"MI","249":"ON","250":"BC","251":"AL","252":"NC","253":"WA","254":"TX",
    "256":"AL","260":"IN","262":"WI","263":"QC","267":"PA","269":"MI","270":"KY",
    "272":"PA","276":"VA","281":"TX","289":"ON","301":"MD","302":"DE","303":"CO",
    "304":"WV","305":"FL","306":"SK","307":"WY","308":"NE","309":"IL","310":"CA",
    "312":"IL","313":"MI","314":"MO","315":"NY","316":"KS","317":"IN","318":"LA",
    "319":"IA","320":"MN","321":"FL","323":"CA","325":"TX","330":"OH","331":"IL",
    "334":"AL","336":"NC","337":"LA","339":"MA","340":"VI","343":"ON","347":"NY",
    "351":"MA","352":"FL","360":"WA","361":"TX","365":"ON","367":"QC","380":"OH",
    "385":"UT","386":"FL","401":"RI","402":"NE","403":"AB","404":"GA","405":"OK",
    "406":"MT","407":"FL","408":"CA","409":"TX","410":"MD","412":"PA","413":"MA",
    "414":"WI","415":"CA","416":"ON","417":"MO","418":"QC","419":"OH","423":"TN",
    "424":"CA","425":"WA","430":"TX","431":"MB","432":"TX","434":"VA","435":"UT",
    "437":"ON","438":"QC","440":"OH","442":"CA","443":"MD","450":"QC","458":"OR",
    "469":"TX","470":"GA","475":"CT","478":"GA","479":"AR","480":"AZ","484":"PA",
    "501":"AR","502":"KY","503":"OR","504":"LA","505":"NM","506":"NB","507":"MN",
    "508":"MA","509":"WA","510":"CA","512":"TX","513":"OH","514":"QC","515":"IA",
    "516":"NY","517":"MI","518":"NY","519":"ON","520":"AZ","530":"CA","531":"NE",
    "539":"OK","540":"VA","541":"OR","548":"ON","551":"NJ","559":"CA","561":"FL",
    "562":"CA","563":"IA","564":"WA","567":"OH","570":"PA","571":"VA","573":"MO",
    "574":"IN","575":"NM","579":"QC","580":"OK","581":"QC","587":"AB","585":"NY",
    "586":"MI","601":"MS","602":"AZ","603":"NH","604":"BC","605":"SD",
    "606":"KY","607":"NY","608":"WI","609":"NJ","610":"PA","612":"MN","613":"ON",
    "614":"OH","615":"TN","616":"MI","617":"MA","618":"IL","619":"CA","620":"KS",
    "623":"AZ","626":"CA","628":"CA","629":"TN","630":"IL","631":"NY","636":"MO",
    "639":"SK","641":"IA","647":"ON","646":"NY","650":"CA","651":"MN","657":"CA",
    "660":"MO","661":"CA","662":"MS","667":"MD","669":"CA","672":"BC","678":"GA",
    "679":"ON","681":"WV","682":"TX","683":"ON","701":"ND","702":"NV","703":"VA",
    "704":"NC","705":"ON","706":"GA","707":"CA","708":"IL","709":"NL","712":"IA",
    "713":"TX","714":"CA","715":"WI","716":"NY","717":"PA","718":"NY","719":"CO",
    "720":"CO","721":"NJ","724":"PA","725":"NV","726":"TX","727":"FL","731":"TN",
    "732":"NJ","734":"MI","737":"TX","740":"OH","742":"ON","743":"NC","747":"CA",
    "753":"ON","754":"FL","757":"VA","760":"CA","762":"GA","763":"MN","765":"IN",
    "769":"MS","770":"GA","771":"VA","772":"FL","773":"IL","774":"MA","775":"NV",
    "778":"BC","779":"IL","780":"AB","781":"MA","782":"NS","785":"KS","786":"FL",
    "801":"UT","802":"VT","803":"SC","804":"VA","805":"CA","806":"TX",
    "807":"ON","808":"HI","810":"MI","812":"IN","813":"FL","814":"PA","815":"IL",
    "816":"MO","817":"TX","818":"CA","819":"QC","825":"AB","828":"NC","830":"TX",
    "831":"CA","832":"TX","838":"NY","843":"SC","845":"NY","847":"IL","848":"NJ",
    "850":"FL","854":"SC","856":"NJ","857":"MA","858":"CA","859":"KY","860":"CT",
    "861":"CA","862":"NJ","863":"FL","864":"SC","865":"TN","867":"ON","870":"AR",
    "872":"IL","873":"QC","878":"PA","902":"NS","905":"ON","906":"MI","907":"AK",
    "908":"NJ","909":"CA","910":"NC","912":"GA","913":"KS","914":"NY","915":"TX",
    "916":"CA","917":"NY","918":"OK","919":"NC","920":"WI","925":"CA","928":"AZ",
    "929":"NY","930":"IN","931":"TN","934":"NY","936":"TX","937":"OH","938":"AL",
    "940":"TX","941":"FL","942":"ON","945":"TX","947":"MI","949":"CA","951":"CA",
    "952":"MN","954":"FL","956":"TX","959":"CT","970":"CO","971":"OR","972":"TX",
    "973":"NJ","978":"MA","979":"TX","980":"NC","983":"CO","984":"NC","985":"LA",
    "986":"ID","989":"MI",
  };

  const INTL: Record<string, string> = {
    "1":"United States / Canada / Caribbean (NANP)",
    "7":"Russia / Kazakhstan","20":"Egypt","27":"South Africa","30":"Greece",
    "31":"Netherlands","32":"Belgium","33":"France","34":"Spain","36":"Hungary",
    "39":"Italy","40":"Romania","41":"Switzerland","43":"Austria","44":"United Kingdom",
    "45":"Denmark","46":"Sweden","47":"Norway","48":"Poland","49":"Germany",
    "51":"Peru","52":"Mexico","53":"Cuba","54":"Argentina","55":"Brazil",
    "56":"Chile","57":"Colombia","58":"Venezuela","60":"Malaysia","61":"Australia",
    "62":"Indonesia","63":"Philippines","64":"New Zealand","65":"Singapore",
    "66":"Thailand","81":"Japan","82":"South Korea","84":"Vietnam","86":"China",
    "90":"Turkey","91":"India","92":"Pakistan","93":"Afghanistan","94":"Sri Lanka",
    "95":"Myanmar","98":"Iran","212":"Morocco","213":"Algeria","216":"Tunisia",
    "218":"Libya","220":"Gambia","221":"Senegal","234":"Nigeria","254":"Kenya",
    "255":"Tanzania","256":"Uganda","260":"Zambia","263":"Zimbabwe","351":"Portugal",
    "353":"Ireland","354":"Iceland","355":"Albania","358":"Finland","359":"Bulgaria",
    "370":"Lithuania","371":"Latvia","372":"Estonia","373":"Moldova","374":"Armenia",
    "375":"Belarus","376":"Andorra","380":"Ukraine","381":"Serbia","385":"Croatia",
    "386":"Slovenia","387":"Bosnia and Herzegovina","389":"North Macedonia",
    "420":"Czech Republic","421":"Slovakia","423":"Liechtenstein",
    "502":"Guatemala","503":"El Salvador","504":"Honduras","505":"Nicaragua",
    "506":"Costa Rica","507":"Panama","509":"Haiti","852":"Hong Kong","853":"Macau",
    "855":"Cambodia","856":"Laos","880":"Bangladesh","886":"Taiwan","960":"Maldives",
    "961":"Lebanon","962":"Jordan","963":"Syria","964":"Iraq","965":"Kuwait",
    "966":"Saudi Arabia","967":"Yemen","968":"Oman","971":"UAE","972":"Israel",
    "973":"Bahrain","974":"Qatar","975":"Bhutan","976":"Mongolia","977":"Nepal",
    "992":"Tajikistan","993":"Turkmenistan","994":"Azerbaijan","995":"Georgia",
    "996":"Kyrgyzstan","998":"Uzbekistan",
  };

  const digits = input.replace(/\D/g, "");

  if (digits.length === 3 && NANP[digits]) {
    const stateAbbr = NANP[digits]!;
    const stateInfo = STATE_INFO[stateAbbr];
    lines.push(`[QUERY] NANP area code lookup + geographic enrichment`);
    lines.push(`[RESULT] area code: ${digits}`);
    lines.push(`[RESULT] type: North American Numbering Plan (NANP)`);
    lines.push(`[RESULT] state/province: ${stateInfo?.name ?? stateAbbr} (${stateAbbr})`);
    lines.push(`[RESULT] country: ${stateInfo?.country === "CA" ? "Canada" : "United States"}`);
    lines.push(`[RESULT] time zone: ${stateInfo?.tz ?? "unknown"}`);
    const allAreaCodes = Object.entries(NANP).filter(([, s]) => s === stateAbbr).map(([c]) => c);
    lines.push(`[RESULT] all area codes for ${stateAbbr}: ${allAreaCodes.join(", ")}`);
    try {
      const searchName = stateInfo?.country === "CA"
        ? `${stateInfo.name} Canada`
        : `${stateInfo?.name ?? stateAbbr} USA`;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchName)}&format=json&addressdetails=1&limit=1`,
        { headers: { "User-Agent": "swept-sentinel-osint" } },
      );
      if (res.ok) {
        const data = (await res.json()) as Array<{ lat?: string; lon?: string; boundingbox?: string[] }>;
        if (data[0]) {
          lines.push(`[RESULT] geographic center: ${data[0].lat}, ${data[0].lon}`);
          if (data[0].boundingbox) {
            const [s, n, w, e] = data[0].boundingbox;
            lines.push(`[RESULT] bounding box: ${s},${w} → ${n},${e}`);
          }
        }
      }
    } catch { /* ignore */ }
  } else if (digits.length > 3 || !NANP[digits]) {
    const match = Object.keys(INTL).sort((a, b) => b.length - a.length)
      .find((cc) => digits.startsWith(cc));
    if (match) {
      lines.push(`[QUERY] international calling code lookup`);
      lines.push(`[RESULT] calling code: +${match}`);
      lines.push(`[RESULT] country/region: ${INTL[match]}`);
      if (match === "1" && digits.length === 4) {
        const areaCode = digits.slice(1);
        const stateAbbr = NANP[areaCode];
        if (stateAbbr) {
          lines.push(`[RESULT] NANP area: ${STATE_INFO[stateAbbr]?.name ?? stateAbbr} (${stateAbbr})`);
          lines.push(`[RESULT] time zone: ${STATE_INFO[stateAbbr]?.tz ?? "unknown"}`);
        }
      }
    } else {
      lines.push(`[RESULT] not found in NANP or international calling code database`);
      lines.push(`[TIP] enter a 3-digit NANP area code (e.g. 415) or country calling code (e.g. 44 for UK)`);
    }
  } else {
    lines.push(`[RESULT] area code ${digits} not found in database`);
    lines.push(`[TIP] try a US/Canada 3-digit area code (e.g. 212, 415, 416, 808)`);
  }
  lines.push(`[DONE] Area code lookup complete.`);
  return lines;
}

async function fetchAddressLookupLines(moduleId: number, target: string): Promise<string[]> {
  const input = target.trim();
  const isLatLon = /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(input);

  const lines: string[] = [
    `[MODULE ${moduleId}] ADDRESS LOOKUP — executing on: ${input}`,
  ];

  if (isLatLon) {
    const [lat, lon] = input.split(",").map((s) => s.trim());
    lines.push(`[QUERY] Nominatim reverse geocode (lat/lon → address)`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      { headers: { "User-Agent": "swept-sentinel-osint" } },
    );
    if (!res.ok) throw new Error(`Nominatim responded with ${res.status}`);
    const data = (await res.json()) as {
      display_name?: string;
      name?: string;
      type?: string;
      osm_type?: string;
      place_id?: number;
      address?: Record<string, string>;
      boundingbox?: string[];
    };
    lines.push(`[RESULT] display: ${data.display_name ?? "unknown"}`);
    lines.push(`[RESULT] type: ${data.osm_type ?? "?"} / ${data.type ?? "?"}`);
    const addr = data.address ?? {};
    const fields: [string, string][] = [
      ["house_number", "number"], ["road", "road"], ["office", "office"],
      ["building", "building"], ["amenity", "amenity"], ["suburb", "suburb"],
      ["city", "city"], ["county", "county"], ["state", "state"],
      ["postcode", "postcode"], ["country", "country"],
    ];
    for (const [key, label] of fields) {
      if (addr[key]) lines.push(`  [${label}] ${addr[key]}`);
    }
    if (data.boundingbox) {
      const [s, n, w, e] = data.boundingbox;
      lines.push(`[RESULT] bounding box: ${s},${w} → ${n},${e}`);
    }
  } else {
    lines.push(`[QUERY] Nominatim forward geocode (address → coordinates + details)`);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&addressdetails=1&limit=5`,
      { headers: { "User-Agent": "swept-sentinel-osint" } },
    );
    if (!res.ok) throw new Error(`Nominatim responded with ${res.status}`);
    const data = (await res.json()) as Array<{
      display_name?: string;
      lat?: string;
      lon?: string;
      type?: string;
      osm_type?: string;
      importance?: number;
      address?: Record<string, string>;
      boundingbox?: string[];
    }>;
    if (!data.length) {
      lines.push(`[RESULT] no results found for this address`);
      lines.push(`[TIP] try a more complete address (e.g. "1600 Pennsylvania Ave NW Washington DC")`);
    } else {
      lines.push(`[RESULT] matches found: ${data.length}`);
      for (const r of data) {
        lines.push(`[MATCH] ${r.display_name ?? "unknown"}`);
        lines.push(`  coordinates: ${r.lat}, ${r.lon}`);
        lines.push(`  type: ${r.osm_type ?? "?"} / ${r.type ?? "?"}`);
        lines.push(`  confidence: ${((r.importance ?? 0) * 100).toFixed(0)}%`);
        const addr = r.address ?? {};
        const city = addr["city"] ?? addr["town"] ?? addr["village"] ?? "";
        const state = addr["state"] ?? "";
        const country = addr["country"] ?? "";
        const postcode = addr["postcode"] ?? "";
        if (city || state || country)
          lines.push(`  location: ${[city, state, postcode, country].filter(Boolean).join(", ")}`);
        if (r.lat && r.lon) {
          const lat = parseFloat(r.lat).toFixed(6);
          const lon = parseFloat(r.lon).toFixed(6);
          lines.push(`  maps: https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=16`);
        }
      }
    }
  }
  lines.push(`[DONE] Address lookup complete.`);
  return lines;
}

async function fetchPhoneOsintLines(moduleId: number, target: string): Promise<string[]> {
  const raw = target.replace(/[\s\-().]/g, "");
  const e164 = raw.startsWith("+") ? raw : `+${raw}`;
  const digits = raw.replace(/\D/g, "");

  const lines: string[] = [
    `[MODULE ${moduleId}] PHONE OSINT — executing on: ${target}`,
    `[QUERY] phone number format analysis + public records search`,
  ];

  let country = "unknown"; let region = "unknown"; let ccLen = 0;
  if (e164.startsWith("+1") && digits.length === 11) {
    country = "United States / Canada"; ccLen = 1;
    const area = digits.slice(1, 4);
    const US_AREAS: Record<string, string> = {
      "201":"NJ","202":"DC","203":"CT","205":"AL","206":"WA","207":"ME",
      "208":"ID","209":"CA","210":"TX","212":"NY","213":"CA","214":"TX",
      "215":"PA","216":"OH","217":"IL","218":"MN","219":"IN","224":"IL",
      "225":"LA","228":"MS","229":"GA","231":"MI","234":"OH","239":"FL",
      "240":"MD","248":"MI","251":"AL","252":"NC","253":"WA","254":"TX",
      "256":"AL","260":"IN","262":"WI","267":"PA","269":"MI","270":"KY",
      "272":"PA","276":"VA","281":"TX","301":"MD","302":"DE","303":"CO",
      "304":"WV","305":"FL","307":"WY","308":"NE","309":"IL","310":"CA",
      "312":"IL","313":"MI","314":"MO","315":"NY","316":"KS","317":"IN",
      "318":"LA","319":"IA","320":"MN","321":"FL","323":"CA","325":"TX",
      "330":"OH","331":"IL","334":"AL","336":"NC","337":"LA","339":"MA",
      "340":"VI","347":"NY","351":"MA","352":"FL","360":"WA","361":"TX",
      "385":"UT","386":"FL","401":"RI","402":"NE","404":"GA","405":"OK",
      "406":"MT","407":"FL","408":"CA","409":"TX","410":"MD","412":"PA",
      "413":"MA","414":"WI","415":"CA","417":"MO","419":"OH","423":"TN",
      "424":"CA","425":"WA","430":"TX","432":"TX","434":"VA","435":"UT",
      "440":"OH","442":"CA","443":"MD","458":"OR","469":"TX","470":"GA",
      "475":"CT","478":"GA","479":"AR","480":"AZ","484":"PA","501":"AR",
      "502":"KY","503":"OR","504":"LA","505":"NM","507":"MN","508":"MA",
      "509":"WA","510":"CA","512":"TX","513":"OH","515":"IA","516":"NY",
      "517":"MI","518":"NY","520":"AZ","530":"CA","539":"OK","540":"VA",
      "541":"OR","551":"NJ","559":"CA","561":"FL","562":"CA","563":"IA",
      "564":"WA","567":"OH","570":"PA","571":"VA","573":"MO","574":"IN",
      "575":"NM","580":"OK","585":"NY","586":"MI","601":"MS","602":"AZ",
      "603":"NH","605":"SD","606":"KY","607":"NY","608":"WI","609":"NJ",
      "610":"PA","612":"MN","614":"OH","615":"TN","616":"MI","617":"MA",
      "618":"IL","619":"CA","620":"KS","623":"AZ","626":"CA","628":"CA",
      "629":"TN","630":"IL","631":"NY","636":"MO","641":"IA","646":"NY",
      "650":"CA","651":"MN","657":"CA","660":"MO","661":"CA","662":"MS",
      "667":"MD","669":"CA","678":"GA","681":"WV","682":"TX","701":"ND",
      "702":"NV","703":"VA","704":"NC","706":"GA","707":"CA","708":"IL",
      "712":"IA","713":"TX","714":"CA","715":"WI","716":"NY","717":"PA",
      "718":"NY","719":"CO","720":"CO","724":"PA","725":"NV","727":"FL",
      "731":"TN","732":"NJ","734":"MI","737":"TX","740":"OH","743":"NC",
      "747":"CA","754":"FL","757":"VA","760":"CA","762":"GA","763":"MN",
      "765":"IN","769":"MS","770":"GA","771":"VA","772":"FL","773":"IL",
      "774":"MA","775":"NV","779":"IL","781":"MA","785":"KS","786":"FL",
      "801":"UT","802":"VT","803":"SC","804":"VA","805":"CA","806":"TX",
      "808":"HI","810":"MI","812":"IN","813":"FL","814":"PA","815":"IL",
      "816":"MO","817":"TX","818":"CA","828":"NC","830":"TX","831":"CA",
      "832":"TX","843":"SC","845":"NY","847":"IL","848":"NJ","850":"FL",
      "856":"NJ","857":"MA","858":"CA","859":"KY","860":"CT","862":"NJ",
      "863":"FL","864":"SC","865":"TN","870":"AR","872":"IL","878":"PA",
      "901":"TN","903":"TX","904":"FL","906":"MI","907":"AK","908":"NJ",
      "909":"CA","910":"NC","912":"GA","913":"KS","914":"NY","915":"TX",
      "916":"CA","917":"NY","918":"OK","919":"NC","920":"WI","925":"CA",
      "928":"AZ","929":"NY","930":"IN","931":"TN","936":"TX","937":"OH",
      "940":"TX","941":"FL","945":"TX","947":"MI","949":"CA","951":"CA",
      "952":"MN","954":"FL","956":"TX","959":"CT","970":"CO","971":"OR",
      "972":"TX","973":"NJ","978":"MA","979":"TX","980":"NC","984":"NC",
      "985":"LA","989":"MI",
    };
    region = US_AREAS[area] ? `US — ${US_AREAS[area]} (area ${area})` : `US/CA area code ${area}`;
    const localPart = digits.slice(4);
    lines.push(`[RESULT] format: valid E.164`);
    lines.push(`[RESULT] country: ${country}`);
    lines.push(`[RESULT] region: ${region}`);
    lines.push(`[RESULT] number: +1 (${area}) ${localPart.slice(0,3)}-${localPart.slice(3)}`);
    lines.push(`[RESULT] length: ${digits.length} digits — ${digits.length === 11 ? "valid NANP" : "invalid NANP"}`);
  } else if (e164.startsWith("+44")) {
    country = "United Kingdom"; ccLen = 2;
    lines.push(`[RESULT] country: United Kingdom (+44)`);
    lines.push(`[RESULT] format: UK number, ${digits.length} digits`);
  } else if (e164.startsWith("+33")) {
    country = "France"; lines.push(`[RESULT] country: France (+33)`);
  } else if (e164.startsWith("+49")) {
    country = "Germany"; lines.push(`[RESULT] country: Germany (+49)`);
  } else if (e164.startsWith("+61")) {
    country = "Australia"; lines.push(`[RESULT] country: Australia (+61)`);
  } else if (e164.startsWith("+91")) {
    country = "India"; lines.push(`[RESULT] country: India (+91)`);
  } else if (e164.startsWith("+86")) {
    country = "China"; lines.push(`[RESULT] country: China (+86)`);
  } else if (e164.startsWith("+55")) {
    country = "Brazil"; lines.push(`[RESULT] country: Brazil (+55)`);
  } else if (e164.startsWith("+7")) {
    country = "Russia/Kazakhstan"; lines.push(`[RESULT] country: Russia/Kazakhstan (+7)`);
  } else if (e164.startsWith("+81")) {
    country = "Japan"; lines.push(`[RESULT] country: Japan (+81)`);
  } else if (e164.startsWith("+52")) {
    country = "Mexico"; lines.push(`[RESULT] country: Mexico (+52)`);
  } else {
    lines.push(`[RESULT] format: ${e164.startsWith("+") ? "international" : "unknown"}`);
    lines.push(`[RESULT] country: unrecognized prefix`);
  }
  lines.push(`[RESULT] digits: ${digits.length}`);

  const serpKey = process.env["SERPAPI_KEY"];
  if (serpKey) {
    lines.push(`[QUERY] public records search via SerpApi`);
    try {
      const q = encodeURIComponent(`"${target}"`);
      const r = await fetch(`https://serpapi.com/search.json?q=${q}&num=5&api_key=${serpKey}`, {
        headers: { "User-Agent": "swept-sentinel-osint" },
      });
      if (r.ok) {
        const data = (await r.json()) as {
          organic_results?: Array<{ title?: string; link?: string; snippet?: string }>;
        };
        const results = data.organic_results ?? [];
        lines.push(`[RESULT] public records indexed: ${results.length}`);
        for (const res of results.slice(0, 5)) {
          lines.push(`[RECORD] ${res.title ?? "untitled"}`);
          lines.push(`  url: ${res.link ?? "unknown"}`);
          if (res.snippet) lines.push(`  ${res.snippet.slice(0, 140)}`);
        }
        if (results.length === 0) lines.push(`[RESULT] no public records found for this number`);
      }
    } catch (e) {
      lines.push(`[WARN] public records search failed: ${(e as Error).message}`);
    }
  } else {
    lines.push(`[INFO] SERPAPI_KEY not set — skipping public records search`);
  }
  lines.push(`[DONE] Phone OSINT complete.`);
  return lines;
}

async function fetchZipLookupLines(moduleId: number, target: string): Promise<string[]> {
  const input = target.trim().toUpperCase().replace(/\s+/g, " ");
  let countryCode = "us";
  let zip = input;

  const caMatch = input.match(/^[A-Z]\d[A-Z](\s?\d[A-Z]\d)?$/);
  const ukMatch = input.match(/^[A-Z]{1,2}\d{1,2}[A-Z]?(\s?\d[A-Z]{2})?$/);

  if (caMatch) {
    countryCode = "ca";
    zip = input.replace(" ", "").slice(0, 3);
  } else if (ukMatch && !/^\d+$/.test(input)) {
    countryCode = "gb";
    zip = input.replace(" ", "").slice(0, 4);
  } else if (/^\d{5}(-\d{4})?$/.test(input)) {
    countryCode = "us";
    zip = input.slice(0, 5);
  }

  const res = await fetch(`https://api.zippopotam.us/${countryCode}/${encodeURIComponent(zip)}`, {
    headers: { "User-Agent": "swept-sentinel-osint" },
  });
  if (res.status === 404) {
    return [
      `[MODULE ${moduleId}] ZIP LOOKUP — executing on: ${input}`,
      `[QUERY] Zippopotam.us postal code database`,
      `[RESULT] no data found — try US zip (90210), UK postcode (SW1A), or Canadian postal prefix (M5V)`,
      `[DONE] ZIP lookup complete.`,
    ];
  }
  if (!res.ok) throw new Error(`Zippopotam.us responded with ${res.status}`);

  const data = (await res.json()) as {
    country?: string;
    "country abbreviation"?: string;
    "post code"?: string;
    places?: Array<{
      "place name"?: string;
      longitude?: string;
      latitude?: string;
      state?: string;
      "state abbreviation"?: string;
    }>;
  };

  const places = data.places ?? [];
  const lines: string[] = [
    `[MODULE ${moduleId}] ZIP LOOKUP — executing on: ${input}`,
    `[QUERY] Zippopotam.us postal code database`,
    `[RESULT] postal code: ${data["post code"] ?? zip}`,
    `[RESULT] country: ${data.country ?? "unknown"} (${data["country abbreviation"] ?? countryCode.toUpperCase()})`,
    `[RESULT] places found: ${places.length}`,
  ];
  for (const p of places) {
    lines.push(`[PLACE] ${p["place name"] ?? "unknown"}`);
    if (p.state) lines.push(`  state/region: ${p.state} (${p["state abbreviation"] ?? ""})`);
    if (p.latitude && p.longitude)
      lines.push(`  coordinates: ${p.latitude}, ${p.longitude}`);
  }
  lines.push(`[DONE] ZIP lookup complete.`);
  return lines;
}

async function fetchAsnLookupLines(moduleId: number, target: string): Promise<string[]> {
  let ip = target.trim();
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(ip);
  if (!isIp) {
    try { [ip] = await dns.resolve4(ip); }
    catch { throw new Error(`could not resolve ${target} to an IP address`); }
  }
  const res = await fetch(`https://api.hackertarget.com/aslookup/?q=${encodeURIComponent(ip)}`, {
    headers: { "User-Agent": "swept-sentinel-osint" },
  });
  if (!res.ok) throw new Error(`HackerTarget responded with ${res.status}`);
  const text = await res.text();
  if (text.startsWith("error") || text.startsWith("API count")) throw new Error(text.trim());
  const parts = text.trim().split(",");
  const lines: string[] = [
    `[MODULE ${moduleId}] ASN LOOKUP — executing on: ${ip}`,
    `[QUERY] HackerTarget ASN lookup`,
    `[RESULT] ip: ${parts[0]?.replace(/"/g, "") ?? ip}`,
    `[RESULT] asn: AS${parts[1]?.replace(/"/g, "").trim() ?? "unknown"}`,
    `[RESULT] prefix: ${parts[2]?.replace(/"/g, "").trim() ?? "unknown"}`,
    `[RESULT] org: ${parts[3]?.replace(/"/g, "").trim() ?? "unknown"}`,
    `[DONE] ASN lookup complete.`,
  ];
  return lines;
}

async function fetchDnsFullLines(moduleId: number, target: string): Promise<string[]> {
  const domain = target.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const res = await fetch(`https://api.hackertarget.com/dnslookup/?q=${encodeURIComponent(domain)}`, {
    headers: { "User-Agent": "swept-sentinel-osint" },
  });
  if (!res.ok) throw new Error(`HackerTarget responded with ${res.status}`);
  const text = await res.text();
  if (text.startsWith("error") || text.startsWith("API count")) throw new Error(text.trim());
  const records = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const byType: Record<string, string[]> = {};
  for (const r of records) {
    const m = r.match(/^([A-Z]+)\s*:\s*(.+)$/);
    if (m) {
      const [, t, v] = m;
      (byType[t] = byType[t] ?? []).push(v.trim());
    }
  }
  const lines: string[] = [
    `[MODULE ${moduleId}] DNS FULL — executing on: ${domain}`,
    `[QUERY] HackerTarget full DNS record lookup (A, MX, NS, TXT, SOA)`,
    `[RESULT] record types found: ${Object.keys(byType).join(", ") || "none"}`,
  ];
  for (const [type, vals] of Object.entries(byType)) {
    for (const v of vals) lines.push(`[${type}] ${v}`);
  }
  if (!records.length) lines.push(`[RESULT] no DNS records returned`);
  lines.push(`[DONE] Full DNS lookup complete.`);
  return lines;
}

async function fetchPageLinksLines(moduleId: number, target: string): Promise<string[]> {
  const url = target.startsWith("http") ? target : `https://${target}`;
  const res = await fetch(`https://api.hackertarget.com/pagelinks/?q=${encodeURIComponent(url)}`, {
    headers: { "User-Agent": "swept-sentinel-osint" },
  });
  if (!res.ok) throw new Error(`HackerTarget responded with ${res.status}`);
  const text = await res.text();
  if (text.startsWith("error") || text.startsWith("API count")) throw new Error(text.trim());
  const links = text.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("http"));
  const domain = new URL(url).hostname;
  const internal = links.filter((l) => { try { return new URL(l).hostname.endsWith(domain); } catch { return false; } });
  const external = links.filter((l) => { try { return !new URL(l).hostname.endsWith(domain); } catch { return false; } });
  const lines: string[] = [
    `[MODULE ${moduleId}] PAGE LINKS — executing on: ${url}`,
    `[QUERY] HackerTarget page link extraction`,
    `[RESULT] total links: ${links.length} (internal: ${internal.length}, external: ${external.length})`,
  ];
  for (const l of internal.slice(0, 15)) lines.push(`[INTERNAL] ${l}`);
  for (const l of external.slice(0, 15)) lines.push(`[EXTERNAL] ${l}`);
  if (links.length > 30) lines.push(`[RESULT] ... and ${links.length - 30} more`);
  if (!links.length) lines.push(`[RESULT] no links found`);
  lines.push(`[DONE] Page link extraction complete.`);
  return lines;
}

async function fetchSharedHostLines(moduleId: number, target: string): Promise<string[]> {
  const domain = target.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const res = await fetch(`https://api.hackertarget.com/findshareddns/?q=${encodeURIComponent(domain)}`, {
    headers: { "User-Agent": "swept-sentinel-osint" },
  });
  if (!res.ok) throw new Error(`HackerTarget responded with ${res.status}`);
  const text = await res.text();
  if (text.startsWith("error") || text.startsWith("API count")) throw new Error(text.trim());
  const hosts = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const lines: string[] = [
    `[MODULE ${moduleId}] SHARED HOST — executing on: ${domain}`,
    `[QUERY] HackerTarget shared DNS — other domains on the same IP`,
    `[RESULT] co-hosted domains found: ${hosts.length}`,
  ];
  for (const h of hosts.slice(0, 40)) lines.push(`[HOST] ${h}`);
  if (hosts.length > 40) lines.push(`[RESULT] ... and ${hosts.length - 40} more`);
  if (!hosts.length) lines.push(`[RESULT] no shared hosts found (dedicated IP or no passive DNS data)`);
  lines.push(`[DONE] Shared host lookup complete.`);
  return lines;
}

async function fetchZoneTransferLines(moduleId: number, target: string): Promise<string[]> {
  const domain = target.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const res = await fetch(`https://api.hackertarget.com/zonetransfer/?q=${encodeURIComponent(domain)}`, {
    headers: { "User-Agent": "swept-sentinel-osint" },
  });
  if (!res.ok) throw new Error(`HackerTarget responded with ${res.status}`);
  const text = await res.text();
  if (text.startsWith("error") || text.startsWith("API count")) throw new Error(text.trim());
  const records = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const vulnerable = !text.includes("AXFR failed") && !text.includes("no nameservers") && records.length > 2;
  const lines: string[] = [
    `[MODULE ${moduleId}] ZONE TRANSFER — executing on: ${domain}`,
    `[QUERY] DNS AXFR zone transfer attempt`,
    `[RESULT] zone transfer: ${vulnerable ? "SUCCEEDED — server is VULNERABLE" : "REFUSED — server is protected"}`,
    `[RESULT] records returned: ${records.length}`,
  ];
  if (vulnerable) {
    lines.push(`[VULN] ZONE TRANSFER ALLOWED — all DNS records exposed:`);
    for (const r of records.slice(0, 30)) lines.push(`  ${r}`);
    if (records.length > 30) lines.push(`  ... and ${records.length - 30} more`);
  } else {
    for (const r of records.slice(0, 5)) lines.push(`[INFO] ${r}`);
  }
  lines.push(`[DONE] Zone transfer attempt complete.`);
  return lines;
}

async function fetchRipeStatLines(moduleId: number, target: string): Promise<string[]> {
  let ip = target.trim();
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(ip);
  if (!isIp) {
    try { [ip] = await dns.resolve4(ip); }
    catch { throw new Error(`could not resolve ${target} to an IP address`); }
  }
  const prefixRes = await fetch(
    `https://stat.ripe.net/data/prefix-overview/data.json?resource=${encodeURIComponent(ip)}`,
    { headers: { "User-Agent": "swept-sentinel-osint" } },
  );
  if (!prefixRes.ok) throw new Error(`RIPE STAT responded with ${prefixRes.status}`);
  const prefixData = (await prefixRes.json()) as {
    data?: { asns?: Array<{ asn: number; holder: string }>; prefix?: string; is_less_specific?: boolean };
  };
  const asns = prefixData.data?.asns ?? [];
  const lines: string[] = [
    `[MODULE ${moduleId}] RIPE STAT — executing on: ${ip}`,
    `[QUERY] RIPE NCC Routing Information Service`,
    `[RESULT] covering prefix: ${prefixData.data?.prefix ?? "unknown"}`,
    `[RESULT] less specific: ${prefixData.data?.is_less_specific ? "yes" : "no"}`,
    `[RESULT] origin ASNs: ${asns.length}`,
  ];
  for (const a of asns) lines.push(`[ASN] AS${a.asn} — ${a.holder}`);
  if (asns.length > 0) {
    const asnNum = asns[0]!.asn;
    try {
      const announcedRes = await fetch(
        `https://stat.ripe.net/data/announced-prefixes/data.json?resource=AS${asnNum}`,
        { headers: { "User-Agent": "swept-sentinel-osint" } },
      );
      if (announcedRes.ok) {
        const announcedData = (await announcedRes.json()) as {
          data?: { prefixes?: Array<{ prefix: string }> };
        };
        const count = announcedData.data?.prefixes?.length ?? 0;
        lines.push(`[RESULT] total prefixes announced by AS${asnNum}: ${count}`);
        for (const p of (announcedData.data?.prefixes ?? []).slice(0, 10))
          lines.push(`[PREFIX] ${p.prefix}`);
        if (count > 10) lines.push(`[RESULT] ... and ${count - 10} more prefixes`);
      }
    } catch { /* ignore secondary fetch errors */ }
  }
  lines.push(`[DONE] RIPE STAT lookup complete.`);
  return lines;
}

async function fetchDuckIntelLines(moduleId: number, target: string): Promise<string[]> {
  const query = target.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const res = await fetch(
    `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`,
    { headers: { "User-Agent": "swept-sentinel-osint" } },
  );
  if (!res.ok) throw new Error(`DuckDuckGo responded with ${res.status}`);
  const data = (await res.json()) as {
    Abstract?: string; AbstractSource?: string; AbstractURL?: string;
    Heading?: string; Type?: string;
    Infobox?: { content?: Array<{ data_type: string; label: string; value: string }> };
    RelatedTopics?: Array<{ Text?: string }>;
  };
  const lines: string[] = [
    `[MODULE ${moduleId}] DUCK INTEL — executing on: ${query}`,
    `[QUERY] DuckDuckGo instant answer entity intelligence`,
  ];
  if (data.Heading) lines.push(`[RESULT] entity: ${data.Heading} (type: ${data.Type ?? "unknown"})`);
  if (data.Abstract) lines.push(`[ABSTRACT] ${data.Abstract}`);
  if (data.AbstractSource) lines.push(`[SOURCE] ${data.AbstractSource} — ${data.AbstractURL ?? ""}`);
  const infoFields = data.Infobox?.content ?? [];
  if (infoFields.length) {
    lines.push(`[RESULT] infobox fields: ${infoFields.length}`);
    for (const f of infoFields.slice(0, 12)) lines.push(`  [${f.label}] ${f.value}`);
  }
  const related = data.RelatedTopics ?? [];
  if (related.length) {
    lines.push(`[RESULT] related topics: ${related.length}`);
    for (const r of related.slice(0, 5)) if (r.Text) lines.push(`  ${r.Text.slice(0, 120)}`);
  }
  if (!data.Abstract && !data.Heading) lines.push(`[RESULT] no entity information found for this target`);
  lines.push(`[DONE] DuckDuckGo intelligence lookup complete.`);
  return lines;
}

async function fetchArchiveDepthLines(moduleId: number, target: string): Promise<string[]> {
  const domain = target.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const res = await fetch(
    `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(domain)}&output=json&limit=5&fl=timestamp,original,statuscode&from=20000101&fastLatest=false`,
    { headers: { "User-Agent": "swept-sentinel-osint" } },
  );
  if (!res.ok) throw new Error(`Wayback CDX responded with ${res.status}`);
  const data = (await res.json()) as string[][];
  const rows = data.slice(1);
  const latestRes = await fetch(
    `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(domain)}&output=json&limit=3&fl=timestamp,original,statuscode&from=20200101&fastLatest=true`,
    { headers: { "User-Agent": "swept-sentinel-osint" } },
  );
  const latestData = latestRes.ok ? ((await latestRes.json()) as string[][]).slice(1) : [];
  const lines: string[] = [
    `[MODULE ${moduleId}] ARCHIVE DEPTH — executing on: ${domain}`,
    `[QUERY] Wayback Machine CDX API — archive history depth`,
  ];
  if (rows.length === 0) {
    lines.push(`[RESULT] no archive history found for this target`);
  } else {
    const earliest = rows[0];
    const ts = earliest?.[0] ?? "";
    const year = ts.slice(0, 4), month = ts.slice(4, 6), day = ts.slice(6, 8);
    lines.push(`[RESULT] earliest snapshot: ${year}-${month}-${day} — ${earliest?.[1] ?? domain} (HTTP ${earliest?.[2] ?? "?"})`);
    const ageYears = new Date().getFullYear() - parseInt(year || "2000");
    lines.push(`[RESULT] domain age in archives: ~${ageYears} year${ageYears !== 1 ? "s" : ""}`);
    lines.push(`[RESULT] earliest snapshots:`);
    for (const r of rows.slice(0, 5)) {
      const t = r[0] ?? ""; const y = t.slice(0,4), mo = t.slice(4,6), d = t.slice(6,8);
      lines.push(`  [${y}-${mo}-${d}] ${r[1] ?? domain} — HTTP ${r[2] ?? "?"}`);
    }
  }
  if (latestData.length) {
    lines.push(`[RESULT] recent snapshots:`);
    for (const r of latestData.slice(0, 3)) {
      const t = r[0] ?? ""; const y = t.slice(0,4), mo = t.slice(4,6), d = t.slice(6,8);
      lines.push(`  [${y}-${mo}-${d}] ${r[1] ?? domain} — HTTP ${r[2] ?? "?"}`);
    }
  }
  lines.push(`[DONE] Archive depth lookup complete.`);
  return lines;
}

async function fetchNpmAuditLines(moduleId: number, target: string): Promise<string[]> {
  const pkg = target.trim().replace(/^https?:\/\/[^/]+\//, "").replace(/\/$/, "");
  const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg)}`, {
    headers: { "User-Agent": "swept-sentinel-osint", "Accept": "application/json" },
  });
  if (res.status === 404) {
    return [
      `[MODULE ${moduleId}] NPM AUDIT — executing on: ${pkg}`,
      `[QUERY] npm registry package intelligence`,
      `[RESULT] package not found on npm`,
      `[DONE] npm audit complete.`,
    ];
  }
  if (!res.ok) throw new Error(`npm registry responded with ${res.status}`);
  const data = (await res.json()) as {
    name?: string; description?: string; license?: string;
    "dist-tags"?: Record<string, string>;
    versions?: Record<string, unknown>;
    time?: Record<string, string>;
    homepage?: string; repository?: { url?: string };
    bugs?: { url?: string };
    keywords?: string[];
    maintainers?: Array<{ name: string; email?: string }>;
  };
  const versions = Object.keys(data.versions ?? {});
  const latest = data["dist-tags"]?.latest;
  const times = data.time ?? {};
  const created = times["created"]?.slice(0, 10);
  const modified = times["modified"]?.slice(0, 10);
  const lines: string[] = [
    `[MODULE ${moduleId}] NPM AUDIT — executing on: ${pkg}`,
    `[QUERY] npm registry package intelligence`,
    `[RESULT] name: ${data.name ?? pkg}`,
    `[RESULT] description: ${data.description ?? "none"}`,
    `[RESULT] latest version: ${latest ?? "unknown"}`,
    `[RESULT] total versions published: ${versions.length}`,
    `[RESULT] license: ${data.license ?? "unspecified"}`,
    `[RESULT] created: ${created ?? "unknown"}`,
    `[RESULT] last modified: ${modified ?? "unknown"}`,
    `[RESULT] keywords: ${data.keywords?.join(", ") ?? "none"}`,
    `[RESULT] homepage: ${data.homepage ?? "none"}`,
    `[RESULT] repository: ${data.repository?.url ?? "none"}`,
    `[RESULT] maintainers: ${data.maintainers?.map((m) => m.name).join(", ") ?? "none"}`,
  ];
  if (latest && times[latest]) lines.push(`[RESULT] latest released: ${times[latest]?.slice(0, 10)}`);
  const distTags = Object.entries(data["dist-tags"] ?? {});
  if (distTags.length > 1) {
    lines.push(`[RESULT] dist-tags:`);
    for (const [tag, ver] of distTags) lines.push(`  [${tag}] ${ver}`);
  }
  lines.push(`[DONE] npm audit complete.`);
  return lines;
}

async function fetchSubdomainScanLines(moduleId: number, target: string): Promise<string[]> {
  const domain = target.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const res = await fetch(`https://api.hackertarget.com/hostsearch/?q=${encodeURIComponent(domain)}`, {
    headers: { "User-Agent": "swept-sentinel-osint" },
  });
  if (!res.ok) throw new Error(`HackerTarget responded with ${res.status}`);
  const text = await res.text();
  if (text.startsWith("error") || text.startsWith("API count")) throw new Error(text.trim());
  const entries = text.split("\n").map((l) => l.trim()).filter((l) => l.includes(","));
  const lines: string[] = [
    `[MODULE ${moduleId}] SUBDOMAIN SCAN — executing on: ${domain}`,
    `[QUERY] HackerTarget passive subdomain enumeration`,
    `[RESULT] subdomains found: ${entries.length}`,
  ];
  for (const e of entries.slice(0, 40)) {
    const [sub, ip] = e.split(",");
    lines.push(`[SUB] ${sub}  →  ${ip}`);
  }
  if (entries.length > 40) lines.push(`[RESULT] ... and ${entries.length - 40} more`);
  if (entries.length === 0) lines.push(`[RESULT] no subdomains found`);
  lines.push(`[DONE] Subdomain scan complete.`);
  return lines;
}

async function fetchCertHistoryLines(moduleId: number, target: string): Promise<string[]> {
  const domain = target.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const res = await fetch(
    `https://crt.sh/?q=%.${encodeURIComponent(domain)}&output=json`,
    { headers: { "User-Agent": "swept-sentinel-osint", "Accept": "application/json", "Accept-Encoding": "identity" } },
  );
  if (!res.ok) throw new Error(`crt.sh responded with ${res.status}`);
  const data = (await res.json()) as Array<{
    id: number; name_value: string; issuer_ca_id: number;
    issuer_name: string; not_before: string; not_after: string;
  }>;
  const uniqueNames = [...new Set(data.map((r) => r.name_value.replace(/\n/g, ", ")))];
  const issuers = [...new Set(data.map((r) => r.issuer_name.match(/O=([^,]+)/)?.[1]?.trim()).filter(Boolean))];
  const lines: string[] = [
    `[MODULE ${moduleId}] CERT HISTORY — executing on: ${domain}`,
    `[QUERY] crt.sh certificate transparency log search`,
    `[RESULT] total cert records: ${data.length}`,
    `[RESULT] unique domains/subdomains: ${uniqueNames.length}`,
    `[RESULT] certificate issuers seen: ${issuers.join(", ") || "unknown"}`,
  ];
  const sorted = data.sort((a, b) => new Date(b.not_before).getTime() - new Date(a.not_before).getTime());
  lines.push(`[RESULT] most recent cert issued: ${sorted[0]?.not_before?.slice(0, 10) ?? "unknown"}`);
  for (const name of uniqueNames.slice(0, 30)) lines.push(`[DOMAIN] ${name}`);
  if (uniqueNames.length > 30) lines.push(`[RESULT] ... and ${uniqueNames.length - 30} more`);
  lines.push(`[DONE] Certificate transparency lookup complete.`);
  return lines;
}

async function fetchShodanProbeLines(moduleId: number, target: string): Promise<string[]> {
  let ip = target.trim();
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(ip);
  if (!isIp) {
    try { [ip] = await dns.resolve4(ip); }
    catch { throw new Error(`could not resolve ${target} to an IP address`); }
  }
  const res = await fetch(`https://internetdb.shodan.io/${encodeURIComponent(ip)}`, {
    headers: { "User-Agent": "swept-sentinel-osint" },
  });
  if (res.status === 404) {
    return [
      `[MODULE ${moduleId}] SHODAN PROBE — executing on: ${ip}`,
      `[QUERY] Shodan InternetDB — open ports, banners, vulns (no API key required)`,
      `[RESULT] no data found for this IP in Shodan InternetDB`,
      `[DONE] Shodan probe complete.`,
    ];
  }
  if (!res.ok) throw new Error(`Shodan InternetDB responded with ${res.status}`);
  const data = (await res.json()) as {
    ip?: string; ports?: number[]; hostnames?: string[];
    cpes?: string[]; tags?: string[]; vulns?: string[];
  };
  const lines: string[] = [
    `[MODULE ${moduleId}] SHODAN PROBE — executing on: ${ip}`,
    `[QUERY] Shodan InternetDB — open ports, banners, vulns (no API key required)`,
    `[RESULT] open ports: ${data.ports?.join(", ") || "none"}`,
    `[RESULT] hostnames: ${data.hostnames?.join(", ") || "none"}`,
    `[RESULT] tags: ${data.tags?.join(", ") || "none"}`,
    `[RESULT] cpes (software fingerprints): ${data.cpes?.length ?? 0}`,
  ];
  for (const c of data.cpes ?? []) lines.push(`  [CPE] ${c}`);
  lines.push(`[RESULT] known vulns: ${data.vulns?.length ?? 0}`);
  for (const v of data.vulns ?? []) lines.push(`  [VULN] ${v}`);
  lines.push(`[DONE] Shodan probe complete.`);
  return lines;
}

async function fetchThreatIntelLines(moduleId: number, target: string): Promise<string[]> {
  let ip = target.trim();
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(ip);
  if (!isIp) {
    try { [ip] = await dns.resolve4(ip); }
    catch { throw new Error(`could not resolve ${target} to an IP address`); }
  }
  const res = await fetch(`https://api.greynoise.io/v3/community/${encodeURIComponent(ip)}`, {
    headers: { "User-Agent": "swept-sentinel-osint", "Accept": "application/json" },
  });
  if (!res.ok && res.status !== 404) throw new Error(`GreyNoise responded with ${res.status}`);
  const data = (await res.json()) as {
    ip?: string; noise?: boolean; riot?: boolean;
    classification?: string; name?: string; link?: string; message?: string;
  };
  const lines: string[] = [
    `[MODULE ${moduleId}] THREAT INTEL — executing on: ${ip}`,
    `[QUERY] GreyNoise Community API — internet noise / scanner classification`,
  ];
  if (data.message) {
    lines.push(`[RESULT] ${data.message}`);
  } else {
    lines.push(`[RESULT] internet noise: ${data.noise ? "YES — this IP is actively scanning the internet" : "NO"}`);
    lines.push(`[RESULT] riot (known benign): ${data.riot ? `YES — ${data.name ?? "known provider"}` : "NO"}`);
    if (data.classification) lines.push(`[RESULT] classification: ${data.classification}`);
    if (data.name) lines.push(`[RESULT] identified as: ${data.name}`);
    if (data.link) lines.push(`[RESULT] details: ${data.link}`);
    const risk = data.noise ? "HIGH — active internet scanner"
      : data.riot ? "LOW — known benign service"
      : "MEDIUM — not observed scanning";
    lines.push(`[ASSESSMENT] threat level: ${risk}`);
  }
  lines.push(`[DONE] Threat intel lookup complete.`);
  return lines;
}

async function fetchTorCheckLines(moduleId: number, target: string): Promise<string[]> {
  let ip = target.trim();
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(ip);
  if (!isIp) {
    try { [ip] = await dns.resolve4(ip); }
    catch { throw new Error(`could not resolve ${target} to an IP address`); }
  }
  const res = await fetch("https://check.torproject.org/torbulkexitlist", {
    headers: { "User-Agent": "swept-sentinel-osint" },
  });
  if (!res.ok) throw new Error(`Tor exit list responded with ${res.status}`);
  const text = await res.text();
  const exitNodes = new Set(text.split("\n").map((l) => l.trim()).filter((l) => l.match(/^\d/)));
  const isTor = exitNodes.has(ip);
  const lines: string[] = [
    `[MODULE ${moduleId}] TOR CHECK — executing on: ${ip}`,
    `[QUERY] Tor Project official exit node list`,
    `[RESULT] exit nodes in list: ${exitNodes.size}`,
    `[RESULT] is tor exit node: ${isTor ? "YES" : "NO"}`,
    `[ASSESSMENT] ${isTor ? "HIGH — this IP is a known Tor exit node. Traffic may be anonymized." : "CLEAR — not found in Tor exit node list"}`,
  ];
  lines.push(`[DONE] Tor check complete.`);
  return lines;
}

async function fetchUrlScanLines(moduleId: number, target: string): Promise<string[]> {
  const query = target.includes(".")
    ? `domain:${target.replace(/^https?:\/\//, "").replace(/\/.*$/, "")}`
    : target;
  const res = await fetch(
    `https://urlscan.io/api/v1/search/?q=${encodeURIComponent(query)}&size=10`,
    { headers: { "User-Agent": "swept-sentinel-osint", "Accept": "application/json" } },
  );
  if (!res.ok) throw new Error(`URLScan.io responded with ${res.status}`);
  const data = (await res.json()) as {
    total: number;
    results: Array<{
      page?: { url?: string; domain?: string; ip?: string; country?: string; server?: string };
      verdicts?: { overall?: { score?: number; malicious?: boolean; tags?: string[] } };
      task?: { time?: string };
    }>;
  };
  const lines: string[] = [
    `[MODULE ${moduleId}] URL SCAN — executing on: ${target}`,
    `[QUERY] URLScan.io public scan history`,
    `[RESULT] total scans found: ${data.total ?? 0}`,
  ];
  for (const r of (data.results ?? []).slice(0, 8)) {
    const score = r.verdicts?.overall?.score ?? 0;
    const malicious = r.verdicts?.overall?.malicious ? "MALICIOUS" : score > 50 ? "SUSPICIOUS" : "CLEAN";
    lines.push(`[SCAN] ${r.page?.url ?? "unknown"}`);
    lines.push(`  time: ${r.task?.time?.slice(0, 10) ?? "unknown"}  ip: ${r.page?.ip ?? "?"}  verdict: ${malicious} (score: ${score})`);
    if (r.verdicts?.overall?.tags?.length) lines.push(`  tags: ${r.verdicts.overall.tags.join(", ")}`);
  }
  if (!data.results?.length) lines.push(`[RESULT] no scan history found`);
  lines.push(`[DONE] URL scan history complete.`);
  return lines;
}

async function fetchTechStackLines(moduleId: number, target: string): Promise<string[]> {
  const base = target.startsWith("http") ? target : `https://${target}`;
  const domain = base.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const lines: string[] = [
    `[MODULE ${moduleId}] TECH STACK — executing on: ${domain}`,
    `[QUERY] fetch page source + header analysis for CMS/framework fingerprinting`,
  ];
  const res = await fetch(base, {
    signal: AbortSignal.timeout(10000),
    headers: { "User-Agent": "Mozilla/5.0 (compatible; swept-sentinel-osint)" },
  });
  const html = await res.text();
  const headers: Record<string, string> = {};
  res.headers.forEach((v, k) => { headers[k.toLowerCase()] = v; });

  const SERVER_SIGS: [string, string][] = [
    ["Apache", /apache/i], ["Nginx", /nginx/i], ["IIS", /iis|microsoft-iis/i],
    ["LiteSpeed", /litespeed/i], ["Caddy", /caddy/i], ["OpenResty", /openresty/i],
  ].map(([n, r]) => [n as string, r as unknown as string]) as [string, string][];
  const serverRaw = headers["server"] ?? "";
  const server = SERVER_SIGS.find(([, r]) => new RegExp(r).test(serverRaw))?.[0] ?? (serverRaw || "unknown");

  const CMS: [string, RegExp][] = [
    ["WordPress", /wp-content|wp-includes|wordpress/i],
    ["Drupal", /drupal|sites\/default\/files/i],
    ["Joomla", /joomla|\/components\/com_/i],
    ["Shopify", /shopify|cdn\.shopify/i],
    ["Squarespace", /squarespace/i],
    ["Wix", /wix\.com|wixsite/i],
    ["Webflow", /webflow/i],
    ["Ghost", /ghost\.org|content\/themes/i],
    ["Magento", /magento|mage\/cookies/i],
    ["PrestaShop", /prestashop/i],
    ["HubSpot", /hubspot|hs-scripts/i],
  ];
  const JS_FRAMEWORKS: [string, RegExp][] = [
    ["React", /react(?:\.min)?\.js|__reactFiber|_reactRootContainer/i],
    ["Vue.js", /vue(?:\.min)?\.js|__vue__|v-bind|v-if/i],
    ["Angular", /angular(?:\.min)?\.js|ng-version|ng-app/i],
    ["Next.js", /__NEXT_DATA__|_next\/static/i],
    ["Nuxt.js", /__nuxt__|_nuxt\//i],
    ["Svelte", /svelte/i],
    ["jQuery", /jquery(?:\.min)?\.js/i],
    ["Bootstrap", /bootstrap(?:\.min)?\.(?:css|js)/i],
    ["Tailwind", /tailwind/i],
    ["Ember.js", /ember(?:\.min)?\.js/i],
  ];
  const ANALYTICS: [string, RegExp][] = [
    ["Google Analytics", /google-analytics|gtag|UA-\d|G-[A-Z0-9]/],
    ["Google Tag Manager", /googletagmanager/i],
    ["Hotjar", /hotjar/i],
    ["Segment", /segment\.com|analytics\.js/i],
    ["Mixpanel", /mixpanel/i],
    ["Plausible", /plausible\.io/i],
    ["Sentry", /sentry/i],
  ];

  const detectedCms = CMS.filter(([, r]) => r.test(html)).map(([n]) => n);
  const detectedJs = JS_FRAMEWORKS.filter(([, r]) => r.test(html)).map(([n]) => n);
  const detectedAnalytics = ANALYTICS.filter(([, r]) => r.test(html)).map(([n]) => n);

  const poweredBy = headers["x-powered-by"] ?? null;
  const generator = html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["']/i)?.[1] ?? null;

  lines.push(`[RESULT] server: ${server}`);
  if (poweredBy) lines.push(`[RESULT] x-powered-by: ${poweredBy}`);
  if (generator) lines.push(`[RESULT] generator meta: ${generator}`);
  lines.push(`[CMS] ${detectedCms.length > 0 ? detectedCms.join(", ") : "none detected"}`);
  lines.push(`[JS FRAMEWORKS] ${detectedJs.length > 0 ? detectedJs.join(", ") : "none detected"}`);
  lines.push(`[ANALYTICS] ${detectedAnalytics.length > 0 ? detectedAnalytics.join(", ") : "none detected"}`);

  const hasHttps = base.startsWith("https");
  lines.push(`[RESULT] https: ${hasHttps}`);
  lines.push(`[RESULT] status: ${res.status} ${res.statusText}`);
  lines.push(`[DONE] Tech stack analysis complete.`);
  return lines;
}

async function fetchAdminFinderLines(moduleId: number, target: string): Promise<string[]> {
  const base = (target.startsWith("http") ? target : `https://${target}`).replace(/\/$/, "");
  const domain = base.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const PATHS = [
    "/admin", "/admin/", "/administrator", "/administrator/",
    "/wp-admin", "/wp-admin/", "/wp-login.php",
    "/login", "/login.php", "/signin",
    "/dashboard", "/panel", "/cpanel",
    "/manager", "/management", "/backend",
    "/user/login", "/users/sign_in", "/account/login",
    "/auth", "/auth/login", "/secure",
    "/phpmyadmin", "/pma", "/phpMyAdmin",
    "/webmail", "/mail",
  ];
  const lines: string[] = [
    `[MODULE ${moduleId}] ADMIN FINDER — executing on: ${domain}`,
    `[QUERY] probing ${PATHS.length} common admin/login paths`,
  ];
  const found: string[] = [];
  const redirects: string[] = [];
  await Promise.all(
    PATHS.map(async (p) => {
      try {
        const r = await fetch(`${base}${p}`, {
          method: "HEAD",
          redirect: "manual",
          signal: AbortSignal.timeout(5000),
          headers: { "User-Agent": "Mozilla/5.0 (compatible; swept-sentinel-osint)" },
        });
        if (r.status === 200 || r.status === 401 || r.status === 403) {
          found.push(`${p}  [${r.status}]`);
        } else if (r.status >= 301 && r.status <= 308) {
          const loc = r.headers.get("location") ?? "";
          redirects.push(`${p}  [${r.status}] → ${loc}`);
        }
      } catch { /* timeout / unreachable */ }
    }),
  );
  lines.push(`[RESULT] accessible panels found: ${found.length}`);
  for (const f of found) lines.push(`[HIT] ${f}`);
  lines.push(`[RESULT] redirects found: ${redirects.length}`);
  for (const r of redirects.slice(0, 5)) lines.push(`[REDIRECT] ${r}`);
  if (found.length === 0 && redirects.length === 0) lines.push(`[RESULT] no admin panels found`);
  lines.push(`[DONE] Admin finder scan complete.`);
  return lines;
}

async function fetchRobotsScanLines(moduleId: number, target: string): Promise<string[]> {
  const base = (target.startsWith("http") ? target : `https://${target}`).replace(/\/$/, "");
  const domain = base.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const lines: string[] = [
    `[MODULE ${moduleId}] ROBOTS SCAN — executing on: ${domain}`,
    `[QUERY] fetch robots.txt + sitemap.xml for hidden path disclosure`,
  ];

  let robotsText = "";
  try {
    const r = await fetch(`${base}/robots.txt`, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "swept-sentinel-osint" },
    });
    if (r.ok && r.headers.get("content-type")?.includes("text")) {
      robotsText = await r.text();
    }
  } catch { /* skip */ }

  if (robotsText) {
    const robotsLines = robotsText.split("\n").map((l) => l.trim()).filter((l) => l);
    const disallowed = robotsLines.filter((l) => l.toLowerCase().startsWith("disallow:")).map((l) => l.split(":")[1]?.trim()).filter(Boolean);
    const allowed = robotsLines.filter((l) => l.toLowerCase().startsWith("allow:")).map((l) => l.split(":")[1]?.trim()).filter(Boolean);
    const sitemaps = robotsLines.filter((l) => l.toLowerCase().startsWith("sitemap:")).map((l) => l.split(": ")[1]?.trim()).filter(Boolean);
    lines.push(`[ROBOTS.TXT] found — ${robotsLines.length} directives`);
    lines.push(`[RESULT] disallow entries: ${disallowed.length}`);
    for (const p of disallowed.slice(0, 15)) lines.push(`  [DISALLOW] ${p}`);
    lines.push(`[RESULT] allow entries: ${allowed.length}`);
    for (const p of allowed.slice(0, 5)) lines.push(`  [ALLOW] ${p}`);
    lines.push(`[RESULT] sitemaps referenced: ${sitemaps.length}`);
    for (const s of sitemaps) lines.push(`  [SITEMAP] ${s}`);
  } else {
    lines.push(`[ROBOTS.TXT] not found or empty`);
  }

  let sitemapText = "";
  try {
    const r = await fetch(`${base}/sitemap.xml`, {
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "swept-sentinel-osint" },
    });
    if (r.ok) sitemapText = await r.text();
  } catch { /* skip */ }

  if (sitemapText && sitemapText.includes("<url")) {
    const urls = [...sitemapText.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => m[1]);
    lines.push(`[SITEMAP.XML] found — ${urls.length} URLs indexed`);
    for (const u of urls.slice(0, 10)) lines.push(`  [URL] ${u}`);
    if (urls.length > 10) lines.push(`  ... and ${urls.length - 10} more`);
  } else {
    lines.push(`[SITEMAP.XML] not found or not XML`);
  }

  lines.push(`[DONE] Robots scan complete.`);
  return lines;
}

async function fetchApiProbeLines(moduleId: number, target: string): Promise<string[]> {
  const base = (target.startsWith("http") ? target : `https://${target}`).replace(/\/$/, "");
  const domain = base.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const ENDPOINTS = [
    "/api", "/api/v1", "/api/v2", "/api/v3",
    "/v1", "/v2", "/v3",
    "/graphql", "/graphiql", "/playground",
    "/swagger", "/swagger.json", "/swagger.yaml", "/swagger-ui.html",
    "/openapi.json", "/openapi.yaml",
    "/docs", "/api/docs", "/api-docs",
    "/.well-known/openid-configuration",
    "/health", "/healthz", "/ping", "/status",
    "/metrics", "/actuator", "/actuator/health",
    "/api/health", "/api/status",
  ];
  const lines: string[] = [
    `[MODULE ${moduleId}] API PROBE — executing on: ${domain}`,
    `[QUERY] probing ${ENDPOINTS.length} common API/doc endpoints`,
  ];
  const found: string[] = [];
  await Promise.all(
    ENDPOINTS.map(async (p) => {
      try {
        const r = await fetch(`${base}${p}`, {
          method: "GET",
          redirect: "follow",
          signal: AbortSignal.timeout(5000),
          headers: { "User-Agent": "swept-sentinel-osint", "Accept": "application/json, */*" },
        });
        const ct = r.headers.get("content-type") ?? "";
        if (r.status === 200) {
          const hint = ct.includes("json") ? "JSON" : ct.includes("html") ? "HTML" : ct.includes("yaml") ? "YAML" : "unknown";
          found.push(`${p}  [200 OK — ${hint}]`);
        } else if (r.status === 401 || r.status === 403) {
          found.push(`${p}  [${r.status} — protected, endpoint exists]`);
        }
      } catch { /* timeout / unreachable */ }
    }),
  );
  lines.push(`[RESULT] live endpoints found: ${found.length}`);
  for (const f of found) lines.push(`[ENDPOINT] ${f}`);
  if (found.length === 0) lines.push(`[RESULT] no API endpoints discovered`);
  lines.push(`[DONE] API probe complete.`);
  return lines;
}

async function fetchReverseIpLines(moduleId: number, target: string): Promise<string[]> {
  let ip = target.trim();
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(ip);
  if (!isIp) {
    try {
      const addrs = await dns.resolve4(ip);
      ip = addrs[0] ?? ip;
    } catch {
      throw new Error(`could not resolve ${target} to an IP address`);
    }
  }
  const res = await fetch(`https://api.hackertarget.com/reverseiplookup/?q=${encodeURIComponent(ip)}`, {
    headers: { "User-Agent": "swept-sentinel-osint" },
  });
  if (!res.ok) throw new Error(`HackerTarget API responded with status ${res.status}`);
  const text = await res.text();
  if (text.startsWith("error") || text.startsWith("API count")) {
    throw new Error(text.trim());
  }
  const domains = text.split("\n").map((d) => d.trim()).filter((d) => d.length > 0);
  const lines: string[] = [
    `[MODULE ${moduleId}] REVERSE IP — executing on: ${ip}${!isIp ? ` (resolved from ${target})` : ""}`,
    `[QUERY] HackerTarget reverse IP lookup — domains sharing this host`,
    `[RESULT] domains found on ${ip}: ${domains.length}`,
  ];
  for (const d of domains.slice(0, 50)) {
    lines.push(`[DOMAIN] ${d}`);
  }
  if (domains.length > 50) {
    lines.push(`[RESULT] ... and ${domains.length - 50} more (showing first 50)`);
  }
  if (domains.length === 0) lines.push(`[RESULT] no domains found on this IP`);
  lines.push(`[DONE] Reverse IP lookup complete.`);
  return lines;
}

async function fetchImageSearchLines(moduleId: number, target: string): Promise<string[]> {
  const data = await fetchSerpApiResults(target, { engine: "google", tbm: "isch" });
  const raw = data as unknown as { images_results?: Array<{ title?: string; original?: string; source?: string; thumbnail?: string }> };
  const results = raw.images_results ?? [];
  const lines: string[] = [
    `[MODULE ${moduleId}] IMAGE SEARCH — executing on: ${target}`,
    `[QUERY] Google Images search via SerpApi`,
    `[RESULT] images found: ${results.length}`,
  ];
  for (const r of results.slice(0, 8)) {
    lines.push(`[IMAGE] ${r.title ?? "untitled"}`);
    lines.push(`  source: ${r.source ?? "unknown"}`);
    lines.push(`  url: ${r.original ?? r.thumbnail ?? "n/a"}`);
  }
  if (results.length === 0) lines.push(`[RESULT] no images found`);
  lines.push(`[DONE] Image search complete.`);
  return lines;
}

async function fetchSiteEnumLines(moduleId: number, target: string): Promise<string[]> {
  const domain = target.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const data = await fetchSerpApiResults(`site:${domain}`, { engine: "google", num: "20" });
  const results = data.organic_results ?? [];
  const lines: string[] = [
    `[MODULE ${moduleId}] SITE ENUM — executing on: ${domain}`,
    `[QUERY] Google site: operator — indexed page enumeration via SerpApi`,
    `[RESULT] indexed pages found: ${results.length}`,
  ];
  for (const r of results.slice(0, 15)) {
    lines.push(`[PAGE] ${r.title ?? "untitled"}`);
    lines.push(`  path: ${r.link ?? "n/a"}`);
  }
  if (results.length === 0) lines.push(`[RESULT] no indexed pages found for this domain`);
  lines.push(`[DONE] Site enumeration complete.`);
  return lines;
}

async function fetchVinCheckLines(moduleId: number, target: string): Promise<string[]> {
  const vin = target.trim().toUpperCase();
  const res = await fetch(
    `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${encodeURIComponent(vin)}?format=json`,
    { headers: { "User-Agent": "swept-sentinel-osint" } },
  );
  if (!res.ok) throw new Error(`NHTSA API responded with status ${res.status}`);
  const data = (await res.json()) as { Results: Array<{ Variable: string; Value: string | null }> };
  const keep = [
    "Make", "Model", "Model Year", "Vehicle Type", "Body Class", "Doors",
    "Engine Number of Cylinders", "Displacement (L)", "Fuel Type - Primary",
    "Transmission Style", "Drive Type", "Plant Country", "Plant State", "Plant City",
    "Manufacturer Name", "Series", "Trim", "Error Text",
  ];
  const fields = data.Results.filter(
    (r) => keep.includes(r.Variable) && r.Value && r.Value !== "Not Applicable" && r.Value !== "",
  );
  const lines: string[] = [
    `[MODULE ${moduleId}] VIN CHECK — executing on: ${vin}`,
    `[QUERY] NHTSA vehicle identification number decode (no API key required)`,
    `[RESULT] vin length: ${vin.length} (${vin.length === 17 ? "valid" : "non-standard"})`,
  ];
  for (const f of fields) {
    lines.push(`[FIELD] ${f.Variable}: ${f.Value}`);
  }
  if (fields.length === 0) lines.push(`[RESULT] no vehicle data found — check VIN format`);
  lines.push(`[DONE] VIN decode complete.`);
  return lines;
}

async function fetchCveLookupLines(moduleId: number, target: string): Promise<string[]> {
  const isExactCve = /^CVE-\d{4}-\d+$/i.test(target.trim());
  const url = isExactCve
    ? `https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${encodeURIComponent(target.trim().toUpperCase())}`
    : `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(target)}&resultsPerPage=10`;
  const res = await fetch(url, { headers: { "User-Agent": "swept-sentinel-osint" } });
  if (!res.ok) throw new Error(`NVD API responded with status ${res.status}`);
  const data = (await res.json()) as {
    totalResults: number;
    vulnerabilities: Array<{
      cve: {
        id: string;
        published: string;
        lastModified: string;
        vulnStatus: string;
        descriptions: Array<{ lang: string; value: string }>;
        metrics?: {
          cvssMetricV31?: Array<{ cvssData?: { baseScore?: number; baseSeverity?: string; vectorString?: string } }>;
          cvssMetricV2?: Array<{ cvssData?: { baseScore?: number } }>;
        };
      };
    }>;
  };
  const total = data.totalResults ?? 0;
  const vulns = data.vulnerabilities ?? [];
  const lines: string[] = [
    `[MODULE ${moduleId}] CVE LOOKUP — executing on: ${target}`,
    `[QUERY] NIST National Vulnerability Database (NVD) — free, no API key`,
    `[RESULT] total matching CVEs: ${total}`,
  ];
  for (const v of vulns.slice(0, 8)) {
    const cve = v.cve;
    const desc = cve.descriptions.find((d) => d.lang === "en")?.value ?? "no description";
    const score = cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore
      ?? cve.metrics?.cvssMetricV2?.[0]?.cvssData?.baseScore
      ?? null;
    const severity = cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseSeverity ?? null;
    lines.push(`[CVE] ${cve.id}  status: ${cve.vulnStatus}  published: ${cve.published.slice(0, 10)}`);
    if (score !== null) lines.push(`  cvss score: ${score}${severity ? ` (${severity})` : ""}`);
    lines.push(`  ${desc.slice(0, 150)}${desc.length > 150 ? "…" : ""}`);
  }
  if (vulns.length === 0) lines.push(`[RESULT] no CVEs found matching this query`);
  lines.push(`[DONE] CVE lookup complete.`);
  return lines;
}

async function fetchMacLookupLines(moduleId: number, target: string): Promise<string[]> {
  const mac = target.trim();
  const lines: string[] = [
    `[MODULE ${moduleId}] MAC LOOKUP — executing on: ${mac}`,
    `[QUERY] IEEE MAC vendor database lookup via api.macvendors.com`,
  ];
  const res = await fetch(`https://api.macvendors.com/${encodeURIComponent(mac)}`, {
    headers: { "User-Agent": "swept-sentinel-osint" },
  });
  if (res.status === 404) {
    lines.push(`[RESULT] vendor: not found — MAC prefix not in registry`);
  } else if (res.status === 429) {
    throw new Error("MAC vendor API rate-limited — wait a moment and retry");
  } else if (!res.ok) {
    throw new Error(`MAC vendor API responded with status ${res.status}`);
  } else {
    const vendor = await res.text();
    lines.push(`[RESULT] vendor: ${vendor.trim()}`);
    lines.push(`[RESULT] mac prefix: ${mac.substring(0, 8).toUpperCase()}`);
    const oui = mac.replace(/[^0-9a-fA-F]/g, "").substring(0, 6).toUpperCase();
    lines.push(`[RESULT] oui: ${oui}`);
  }
  lines.push(`[DONE] MAC vendor lookup complete.`);
  return lines;
}

async function fetchCdnOriginLines(moduleId: number, target: string): Promise<string[]> {
  const domain = target.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const lines: string[] = [
    `[MODULE ${moduleId}] CDN ORIGIN — executing on: ${domain}`,
    `[QUERY] DNS CNAME chain + HTTP header fingerprinting`,
  ];

  let cnames: string[] = [];
  try { cnames = await dns.resolveCname(domain); } catch { cnames = []; }
  let wwwCnames: string[] = [];
  try { wwwCnames = await dns.resolveCname(`www.${domain}`); } catch { wwwCnames = []; }
  const allCnames = [...new Set([...cnames, ...wwwCnames])];

  const CDN_SIGNATURES: Record<string, string[]> = {
    Cloudflare: ["cloudflare", "cdn.cloudflare"],
    Fastly: ["fastly", "fastly.net"],
    Akamai: ["akamai", "edgekey", "akamaitechnologies"],
    Cloudfront: ["cloudfront.net"],
    "Azure CDN": ["azureedge", "azure"],
    "Google Cloud CDN": ["googleapis", "googleusercontent"],
    Vercel: ["vercel", "vercel-dns"],
    Netlify: ["netlify"],
    Sucuri: ["sucuri"],
    StackPath: ["stackpath", "highwinds"],
    Imperva: ["imperva", "incapsula"],
  };

  let detectedCdn = "unknown";
  for (const cname of allCnames) {
    for (const [cdn, sigs] of Object.entries(CDN_SIGNATURES)) {
      if (sigs.some((s) => cname.toLowerCase().includes(s))) {
        detectedCdn = cdn;
        break;
      }
    }
  }

  if (allCnames.length > 0) {
    lines.push(`[RESULT] cname records: ${allCnames.join(", ")}`);
  } else {
    lines.push(`[RESULT] no CNAME records found — direct A record`);
  }
  lines.push(`[RESULT] cdn detected: ${detectedCdn}`);

  try {
    const httpRes = await fetch(`https://${domain}`, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "swept-sentinel-osint" },
    });
    const server = httpRes.headers.get("server") ?? "not disclosed";
    const via = httpRes.headers.get("via") ?? "none";
    const xServedBy = httpRes.headers.get("x-served-by") ?? httpRes.headers.get("x-cache") ?? "none";
    const cfRay = httpRes.headers.get("cf-ray");
    const xVercel = httpRes.headers.get("x-vercel-id");
    const xAmz = httpRes.headers.get("x-amz-cf-id") ?? httpRes.headers.get("x-amz-request-id");

    lines.push(`[HEADER] server: ${server}`);
    if (via !== "none") lines.push(`[HEADER] via: ${via}`);
    if (xServedBy !== "none") lines.push(`[HEADER] x-cache/x-served-by: ${xServedBy}`);
    if (cfRay) { lines.push(`[CONFIRM] Cloudflare Ray ID detected — CDN: Cloudflare`); detectedCdn = "Cloudflare"; }
    if (xVercel) { lines.push(`[CONFIRM] Vercel ID detected — CDN/Host: Vercel`); detectedCdn = "Vercel"; }
    if (xAmz) { lines.push(`[CONFIRM] AWS identifier detected — CDN: CloudFront`); detectedCdn = "Cloudfront"; }
  } catch {
    lines.push(`[HEADER] HTTP header fetch failed — DNS-only result`);
  }

  lines.push(`[ASSESSMENT] cdn/edge: ${detectedCdn}`);
  lines.push(`[DONE] CDN origin analysis complete.`);
  return lines;
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
    } else if (moduleId === 4) {
      lines = await fetchAsnLookupLines(moduleId, target);
    } else if (moduleId === 5) {
      lines = await fetchWhoisLines(target);
    } else if (moduleId === 6) {
      lines = await fetchPhoneOsintLines(moduleId, target);
    } else if (moduleId === 9) {
      lines = await fetchDbSearchLines(moduleId, target);
    } else if (moduleId === 11) {
      lines = await fetchGithubLookupLines(moduleId, target);
    } else if (moduleId === 12) {
      lines = await fetchUsernameCheckLines(moduleId, target);
    } else if (moduleId === 13) {
      lines = await fetchNewsSearchLines(moduleId, target);
    } else if (moduleId === 14) {
      lines = await fetchPeopleSearchLines(moduleId, target);
    } else if (moduleId === 15) {
      lines = await fetchImageSearchLines(moduleId, target);
    } else if (moduleId === 16) {
      lines = await fetchSiteEnumLines(moduleId, target);
    } else if (moduleId === 17) {
      lines = await fetchSubdomainScanLines(moduleId, target);
    } else if (moduleId === 18) {
      lines = await fetchDnsFullLines(moduleId, target);
    } else if (moduleId === 19) {
      lines = await fetchPageLinksLines(moduleId, target);
    } else if (moduleId === 20) {
      lines = await fetchSharedHostLines(moduleId, target);
    } else if (moduleId === 21) {
      lines = await fetchZoneTransferLines(moduleId, target);
    } else if (moduleId === 22) {
      lines = await fetchZipLookupLines(moduleId, target);
    } else if (moduleId === 23) {
      lines = await fetchAddressLookupLines(moduleId, target);
    } else if (moduleId === 24) {
      lines = await fetchAreaCodeLines(moduleId, target);
    } else if (moduleId === 25) {
      lines = await fetchBizDirectoryLines(moduleId, target);
    } else if (moduleId === 71) {
      lines = await fetchVinCheckLines(moduleId, target);
    } else if (moduleId === 92) {
      lines = await fetchSslCertLines(moduleId, target);
    } else if (moduleId === 93) {
      lines = await fetchWaybackLines(moduleId, target);
    } else if (moduleId === 94) {
      lines = await fetchHttpFingerprintLines(moduleId, target);
    } else if (moduleId === 95) {
      lines = await fetchReverseIpLines(moduleId, target);
    } else if (moduleId === 96) {
      lines = await fetchTechStackLines(moduleId, target);
    } else if (moduleId === 97) {
      lines = await fetchAdminFinderLines(moduleId, target);
    } else if (moduleId === 98) {
      lines = await fetchRobotsScanLines(moduleId, target);
    } else if (moduleId === 99) {
      lines = await fetchApiProbeLines(moduleId, target);
    } else if (moduleId === 100) {
      lines = await fetchCertHistoryLines(moduleId, target);
    } else if (moduleId === 151) {
      lines = await fetchCveLookupLines(moduleId, target);
    } else if (moduleId === 152) {
      lines = await fetchMacLookupLines(moduleId, target);
    } else if (moduleId === 153) {
      lines = await fetchShodanProbeLines(moduleId, target);
    } else if (moduleId === 154) {
      lines = await fetchThreatIntelLines(moduleId, target);
    } else if (moduleId === 155) {
      lines = await fetchRipeStatLines(moduleId, target);
    } else if (moduleId === 156) {
      lines = await fetchDuckIntelLines(moduleId, target);
    } else if (moduleId === 201) {
      lines = await fetchBgpRouteLines(moduleId, target);
    } else if (moduleId === 207) {
      lines = await fetchCdnOriginLines(moduleId, target);
    } else if (moduleId === 208) {
      lines = await fetchTorCheckLines(moduleId, target);
    } else if (moduleId === 209) {
      lines = await fetchUrlScanLines(moduleId, target);
    } else if (moduleId === 210) {
      lines = await fetchArchiveDepthLines(moduleId, target);
    } else if (moduleId === 211) {
      lines = await fetchNpmAuditLines(moduleId, target);
    } else if (moduleId === 230) {
      lines = await fetchDmarcAnalyzeLines(moduleId, target);
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
