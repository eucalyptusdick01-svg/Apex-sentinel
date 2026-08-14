import { useState, useCallback } from "react";
import { useListModules, useExecuteModule } from "@workspace/api-client-react";
import ModuleGrid from "@/components/ModuleGrid";
import ConsoleOutput from "@/components/ConsoleOutput";
import SuggestionModal from "@/components/SuggestionModal";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

function getTimestamp() {
  const now = new Date();
  return `[${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}]`;
}

export default function Dashboard() {
  const [target, setTarget] = useState("");
  const [lines, setLines] = useState<string[]>([
    `${getTimestamp()} SYSTEM READY. ENTER TARGET DATA AND SELECT A MODULE.`,
  ]);
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [, navigate] = useLocation();

  const { data: modules, isLoading } = useListModules();
  const executeModule = useExecuteModule();
  const { user, isAdmin, logout } = useAuth();

  const appendLine = useCallback((line: string) => {
    setLines((prev) => [...prev, `${getTimestamp()} ${line}`]);
  }, []);

  const handleModuleClick = (moduleId: number) => {
    if (!target.trim()) {
      appendLine(`ALERT: MODULE ${moduleId} REQUIRES TARGET DATA.`);
      setConsoleOpen(true);
      return;
    }

    appendLine(`EXECUTING MODULE ${moduleId} ON: ${target}`);
    setConsoleOpen(true);

    executeModule.mutate(
      { data: { moduleId, target } },
      {
        onSuccess: (res) => {
          const es = new EventSource(`/api/sentinel/stream/${res.runId}`);

          es.onmessage = (event) => {
            appendLine(event.data as string);
          };

          es.onerror = () => {
            es.close();
            appendLine(`MODULE ${moduleId} STREAM CLOSED.`);
          };
        },
        onError: (err) => {
          appendLine(`ERROR: ${(err as { error?: string }).error ?? "Failed to execute module."}`);
        },
      },
    );
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden font-mono selection:bg-primary selection:text-primary-foreground">
      {/* Header */}
      <header className="px-4 py-3 border-b border-border bg-card shrink-0 flex flex-col gap-0.5 z-10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-[0.15em] text-primary drop-shadow-[0_0_8px_rgba(0,204,255,0.5)] uppercase">
            S W E P T - S E N T I N E L
          </h1>
          <div className="flex items-center gap-3 text-xs font-mono">
            {user && (
              <>
                {isAdmin && (
                  <button
                    onClick={() => navigate("/admin")}
                    className="text-yellow-400 hover:text-yellow-300 tracking-widest border border-yellow-400/30 px-2 py-1 hover:border-yellow-400/60 transition-colors"
                  >
                    [ADMIN]
                  </button>
                )}
                <button
                  onClick={() => navigate("/guide")}
                  className="text-primary/60 hover:text-primary tracking-widest border border-primary/20 px-2 py-1 hover:border-primary/50 transition-colors hidden sm:inline-flex"
                >
                  [GUIDE]
                </button>
                <button
                  onClick={() => setSuggestionOpen(true)}
                  className="text-primary/60 hover:text-primary tracking-widest border border-primary/20 px-2 py-1 hover:border-primary/50 transition-colors"
                >
                  [SUGGEST]
                </button>
                  <button
                  onClick={() => navigate("/pricing")}
                  className="text-primary/60 hover:text-primary tracking-widest border border-primary/20 px-2 py-1 hover:border-primary/50 transition-colors"
                >
                  [UPGRADE]
                </button>
                <span className="text-muted-foreground tracking-wider hidden sm:inline">
                  {user.email}
                </span>
                <button
                  onClick={logout}
                  className="text-primary/70 hover:text-primary tracking-widest border border-primary/20 px-2 py-1 hover:border-primary/50 transition-colors"
                >
                  [LOGOUT]
                </button>
              </>
            )}
          </div>
        </div>
        <div className="text-xs opacity-80 tracking-widest text-foreground/70">
          STATUS: <span className="text-[#00ff41]">ACTIVE</span>
          {" · "}
          <span className="text-primary">{modules?.length ?? 0}</span> MODULES LOADED
          {" · "}
          <span className="text-muted-foreground">173 REAL · 57 SIMULATED</span>
        </div>
      </header>

      {/* Target Input */}
      <div className="px-4 py-3 border-b border-border bg-background shrink-0 flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <label
          htmlFor="target-input"
          className="text-primary font-bold whitespace-nowrap text-sm tracking-widest drop-shadow-[0_0_4px_rgba(0,204,255,0.4)]"
        >
          [TARGET] &gt;
        </label>
        <Input
          id="target-input"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="flex-1 bg-card border-primary/30 text-foreground font-mono rounded-none h-10 text-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/40"
          placeholder="IPv4 · domain · email · username"
          autoComplete="off"
          spellCheck="false"
        />
      </div>

      {/* Module Grid — scrollable */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-background min-h-0">
        <ModuleGrid modules={modules} isLoading={isLoading} onExecute={handleModuleClick} />
      </div>

      {/* Console — collapsible */}
      <div className="shrink-0 border-t border-primary/50">
        <button
          onClick={() => setConsoleOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-1.5 bg-card hover:bg-card/80 text-xs font-mono text-primary/80 tracking-widest"
        >
          <span>
            [ CONSOLE OUTPUT — {lines.length} LINE{lines.length !== 1 ? "S" : ""} ]
          </span>
          <span className="opacity-60">{consoleOpen ? "▼ HIDE" : "▲ SHOW"}</span>
        </button>
        {consoleOpen && (
          <div className="h-48 md:h-56 relative">
            <ConsoleOutput lines={lines} />
          </div>
        )}
      </div>

      {/* Suggestion Modal */}
      {suggestionOpen && (
        <SuggestionModal onClose={() => setSuggestionOpen(false)} />
      )}
    </div>
  );
}
