import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthMe, useListModules } from "@workspace/api-client-react";
import ModuleGrid from "@/components/ModuleGrid";
import type { Module } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const GUEST_KEY = "guestRunsUsed";
const GUEST_LIMIT = 4;

function getGuestUsed(): number {
  try { return Math.min(parseInt(localStorage.getItem(GUEST_KEY) ?? "0", 10) || 0, GUEST_LIMIT); }
  catch { return 0; }
}
function setGuestUsed(n: number) {
  try { localStorage.setItem(GUEST_KEY, String(n)); } catch { /* ignore */ }
}

export default function Modules() {
  const [, navigate] = useLocation();
  const { data: user } = useAuthMe();
  const { data: modules, isLoading } = useListModules();

  const [promptModule, setPromptModule] = useState<Module | null>(null);
  const [guestUsed, setGuestUsedState] = useState(getGuestUsed);
  const [target, setTarget] = useState("");
  const [lines, setLines] = useState<string[]>([]);
  const [runStatus, setRunStatus] = useState<"idle" | "running" | "done">("idle");
  const termRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [lines]);

  function handleModuleClick(moduleId: number) {
    if (user) { navigate("/dashboard"); return; }
    const mod = modules?.find((m) => m.id === moduleId) ?? null;
    setPromptModule(mod);
    setTarget("");
    setLines([]);
    setRunStatus("idle");
  }

  function closePrompt() {
    setPromptModule(null);
    setLines([]);
    setRunStatus("idle");
  }

  async function handleRun(e: React.FormEvent) {
    e.preventDefault();
    if (!promptModule || !target.trim() || runStatus === "running") return;

    setRunStatus("running");
    setLines([`[INIT] Starting module ${promptModule.id}: ${promptModule.name}`, `[TARGET] ${target.trim()}`]);

    try {
      const res = await fetch(`${BASE}/api/sentinel/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId: promptModule.id, target: target.trim() }),
      });

      if (res.status === 429) {
        // Server confirmed limit hit
        const newCount = GUEST_LIMIT;
        setGuestUsedState(newCount);
        setGuestUsed(newCount);
        setRunStatus("done");
        setLines(["[LIMIT] You've used all 4 free runs. Register to continue."]);
        return;
      }

      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        setLines((prev) => [...prev, `[ERROR] ${err.error ?? "Execute failed"}`]);
        setRunStatus("done");
        return;
      }

      const data = (await res.json()) as { streamUrl: string };

      // Increment client-side counter
      const newCount = guestUsed + 1;
      setGuestUsedState(newCount);
      setGuestUsed(newCount);

      // Stream output via EventSource
      const es = new EventSource(`${BASE}${data.streamUrl}`);
      es.onmessage = (ev) => {
        try {
          const line = JSON.parse(ev.data) as string;
          setLines((prev) => [...prev, line]);
        } catch { /* ignore parse errors */ }
      };
      es.addEventListener("done", () => {
        es.close();
        setRunStatus("done");
      });
      es.onerror = () => {
        es.close();
        setRunStatus("done");
      };
    } catch {
      setLines((prev) => [...prev, "[ERROR] Network error. Please try again."]);
      setRunStatus("done");
    }
  }

  const runsLeft = GUEST_LIMIT - guestUsed;
  const limitReached = guestUsed >= GUEST_LIMIT;

  return (
    <div className="min-h-screen bg-background text-foreground font-mono flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-primary/10 shrink-0">
        <button
          onClick={() => navigate("/")}
          className="text-primary font-bold tracking-[0.2em] text-sm drop-shadow-[0_0_8px_rgba(0,204,255,0.4)]"
        >
          SWEPT-SENTINEL
        </button>
        <div className="flex gap-4 text-xs tracking-widest">
          <button onClick={() => navigate("/guide")} className="text-primary/50 hover:text-primary transition-colors">
            GUIDE
          </button>
          <button onClick={() => navigate("/pricing")} className="text-primary/50 hover:text-primary transition-colors">
            PRICING
          </button>
          {user ? (
            <button onClick={() => navigate("/dashboard")} className="border border-primary/50 text-primary px-3 py-1 hover:bg-primary/10 transition-colors">
              LAUNCH APP
            </button>
          ) : (
            <>
              <button onClick={() => navigate("/login")} className="text-primary/50 hover:text-primary transition-colors">LOGIN</button>
              <button onClick={() => navigate("/register")} className="border border-primary/50 text-primary px-3 py-1 hover:bg-primary/10 transition-colors">REGISTER</button>
            </>
          )}
        </div>
      </nav>

      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-primary/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-end gap-3 justify-between">
          <div>
            <div className="text-[10px] text-primary/40 tracking-[0.3em] mb-1">SWEPT SENTINEL // OSINT PLATFORM</div>
            <h1 className="text-2xl font-bold tracking-[0.1em] text-primary">MODULE REPOSITORY</h1>
            <p className="text-xs text-primary/50 mt-1">
              {modules?.length ?? 0} intelligence modules
              {!user && (
                <span className="ml-2 text-primary/40">
                  · <span className={runsLeft > 0 ? "text-primary" : "text-red-400"}>{runsLeft} free run{runsLeft !== 1 ? "s" : ""} remaining</span>
                </span>
              )}
            </p>
          </div>
          {!user && (
            <div className="flex gap-2 text-xs shrink-0">
              <button onClick={() => navigate("/register")} className="border border-primary bg-primary text-background px-4 py-2 tracking-widest hover:bg-primary/90 transition-colors font-bold">
                START FREE
              </button>
              <button onClick={() => navigate("/buy/weekly")} className="border border-primary/40 text-primary/70 px-4 py-2 tracking-widest hover:border-primary hover:text-primary transition-colors">
                $5.99 / WK
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Module grid */}
      <div className="flex-1 px-6 py-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <ModuleGrid modules={modules} isLoading={isLoading} onExecute={handleModuleClick} />
        </div>
      </div>

      {/* Module run popup */}
      {promptModule && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closePrompt} />
          <div className="relative z-10 w-full sm:max-w-lg bg-card border border-primary/40 shadow-[0_0_40px_rgba(0,204,255,0.15)] font-mono">
            {/* Popup header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary/20">
              <div>
                <span className="text-primary/40 text-[10px] tracking-widest mr-2">[{String(promptModule.id).padStart(3, "0")}]</span>
                <span className="text-primary font-bold text-sm tracking-wide">{promptModule.name}</span>
              </div>
              <button onClick={closePrompt} className="text-primary/30 hover:text-primary transition-colors text-lg">✕</button>
            </div>

            {/* Limit reached → register prompt */}
            {limitReached ? (
              <div className="p-6 space-y-4">
                <p className="text-xs text-primary/60 leading-relaxed">
                  You've used all <span className="text-primary font-bold">4 free runs</span>. Register for a free account to keep going, or go Pro for unlimited access to all 230 modules.
                </p>
                <div className="flex flex-col gap-2">
                  <button onClick={() => navigate("/register")} className="w-full py-3 bg-primary text-background text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors">
                    [ REGISTER FREE — CONTINUE RUNNING ]
                  </button>
                  <button onClick={() => navigate("/buy/weekly")} className="w-full py-3 border border-primary/50 text-primary text-xs tracking-widest hover:bg-primary/10 hover:border-primary transition-colors">
                    [ $5.99 / WEEK — UNLIMITED ACCESS ]
                  </button>
                  <button onClick={() => navigate("/buy/monthly")} className="w-full py-2 text-primary/40 text-xs tracking-widest hover:text-primary/70 transition-colors">
                    or $19.99 / month (save 23%)
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Target input */}
                <form onSubmit={handleRun} className="px-4 py-3 border-b border-primary/10 flex gap-2">
                  <input
                    type="text"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="Enter target (IP, domain, username…)"
                    disabled={runStatus === "running"}
                    className="flex-1 bg-background border border-primary/30 text-foreground text-xs font-mono px-3 py-2 focus:outline-none focus:border-primary placeholder:text-primary/20 disabled:opacity-50"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!target.trim() || runStatus === "running"}
                    className="px-4 py-2 bg-primary text-background text-xs font-bold tracking-widest hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                  >
                    {runStatus === "running" ? "RUNNING…" : "RUN"}
                  </button>
                </form>

                {/* Terminal output */}
                {lines.length > 0 && (
                  <div ref={termRef} className="h-48 overflow-y-auto bg-black/40 px-4 py-3 text-[11px] text-primary/80 space-y-0.5 leading-relaxed">
                    {lines.map((l, i) => (
                      <div key={i} className="font-mono whitespace-pre-wrap break-all">{l}</div>
                    ))}
                    {runStatus === "running" && (
                      <div className="text-primary/30 animate-pulse">▋</div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="px-4 py-2 border-t border-primary/10 flex items-center justify-between text-[10px] text-primary/30 tracking-wide">
                  <span>{runsLeft} free run{runsLeft !== 1 ? "s" : ""} remaining</span>
                  {runStatus === "done" && runsLeft <= 1 && (
                    <button onClick={() => navigate("/register")} className="text-primary/50 hover:text-primary underline transition-colors">
                      Register for unlimited →
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
