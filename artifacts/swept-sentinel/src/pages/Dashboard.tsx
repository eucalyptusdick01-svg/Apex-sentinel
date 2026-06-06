import { useState, useCallback } from "react";
import { useListModules, useExecuteModule, useExecuteBatch } from "@workspace/api-client-react";
import ModuleGrid from "@/components/ModuleGrid";
import ConsoleOutput from "@/components/ConsoleOutput";
import HistoryPanel from "@/components/HistoryPanel";
import { Input } from "@/components/ui/input";

function getTimestamp() {
  const now = new Date();
  return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
}

export default function Dashboard() {
  const [target, setTarget] = useState("");
  const [lines, setLines] = useState<string[]>([
    `${getTimestamp()} SYSTEM READY. ENTER TARGET DATA AND SELECT A MODULE.`
  ]);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [historyOpen, setHistoryOpen] = useState(false);

  const { data: modules, isLoading } = useListModules();
  const executeModule = useExecuteModule();
  const executeBatch = useExecuteBatch();

  const appendLine = useCallback((line: string) => {
    setLines(prev => [...prev, `${getTimestamp()} ${line}`]);
  }, []);

  const openStream = useCallback((runId: string, label: string) => {
    const es = new EventSource(`/api/sentinel/stream/${runId}`);
    es.onmessage = (event) => {
      try {
        const text = JSON.parse(event.data);
        appendLine(text);
      } catch {
        appendLine(event.data);
      }
    };
    es.addEventListener("done", () => es.close());
    es.onerror = () => {
      es.close();
      appendLine(`${label} STREAM CLOSED.`);
    };
  }, [appendLine]);

  const handleModuleClick = (moduleId: number) => {
    if (!target.trim()) {
      appendLine(`ALERT: MODULE ${moduleId} REQUIRES TARGET DATA.`);
      return;
    }
    appendLine(`EXECUTING MODULE ${moduleId} ON: ${target}`);
    executeModule.mutate({ data: { moduleId, target } }, {
      onSuccess: (res) => openStream(res.runId, `MODULE ${moduleId}`),
      onError: () => appendLine(`ERROR: FAILED TO EXECUTE MODULE ${moduleId}.`),
    });
  };

  const handleToggleSelect = (moduleId: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const handleBatchRun = () => {
    if (!target.trim()) {
      appendLine("ALERT: BATCH MODE REQUIRES TARGET DATA.");
      return;
    }
    if (selectedIds.size === 0) {
      appendLine("ALERT: SELECT AT LEAST ONE MODULE FOR BATCH EXECUTION.");
      return;
    }
    const ids = Array.from(selectedIds).sort((a, b) => a - b);
    appendLine(`BATCH EXECUTING ${ids.length} MODULES ON: ${target}`);
    appendLine(`QUEUE: ${ids.join(", ")}`);
    executeBatch.mutate({ data: { moduleIds: ids, target } }, {
      onSuccess: (res) => openStream(res.runId, "BATCH"),
      onError: () => appendLine("ERROR: FAILED TO START BATCH EXECUTION."),
    });
  };

  const handleExitBatch = () => {
    setBatchMode(false);
    setSelectedIds(new Set());
  };

  const handleReplay = useCallback((replayLines: string[]) => {
    setLines(prev => [
      ...prev,
      `${getTimestamp()} --- REPLAYING HISTORICAL RUN ---`,
      ...replayLines.map(l => `${getTimestamp()} ${l}`),
      `${getTimestamp()} --- END OF HISTORICAL RUN ---`,
    ]);
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden font-mono selection:bg-primary selection:text-primary-foreground">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border bg-card shrink-0 flex items-center justify-between z-10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-[0.2em] text-primary drop-shadow-[0_0_8px_rgba(0,204,255,0.5)] uppercase">
            S W E P T - S E N T I N E L
          </h1>
          <div className="text-sm opacity-80 tracking-widest text-foreground/80 mt-1">
            SYSTEM STATUS: <span className="text-[#00ff41]">ENCRYPTED NODE ACTIVE</span> | {modules?.length || 0} MODULES LOADED
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            data-testid="history-btn"
            onClick={() => setHistoryOpen(true)}
            className="text-xs font-mono text-primary border border-primary/40 px-4 py-2 hover:bg-primary/10 transition-colors tracking-widest"
          >
            [HISTORY]
          </button>
          <button
            data-testid="batch-mode-btn"
            onClick={() => { setBatchMode(b => !b); setSelectedIds(new Set()); }}
            className={`text-xs font-mono border px-4 py-2 transition-colors tracking-widest
              ${batchMode
                ? "border-yellow-400/60 text-yellow-400 bg-yellow-400/10"
                : "border-primary/40 text-primary hover:bg-primary/10"}`}
          >
            {batchMode ? "[EXIT BATCH]" : "[BATCH MODE]"}
          </button>
        </div>
      </header>

      {/* Target Input */}
      <div className="px-6 py-4 border-b border-border bg-background shrink-0 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <label htmlFor="target-input" className="text-primary font-bold whitespace-nowrap text-lg tracking-widest drop-shadow-[0_0_4px_rgba(0,204,255,0.4)]">
          [TARGET_DATA] &gt;
        </label>
        <Input
          id="target-input"
          data-testid="target-input"
          value={target}
          onChange={e => setTarget(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && batchMode) handleBatchRun(); }}
          className="flex-1 bg-card border-primary/30 text-foreground font-mono rounded-none h-14 text-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/50"
          placeholder="Enter IPv4, domain, email, username..."
          autoComplete="off"
          spellCheck="false"
        />
        {batchMode && (
          <button
            data-testid="batch-run-btn"
            onClick={handleBatchRun}
            disabled={selectedIds.size === 0 || executeBatch.isPending}
            className="shrink-0 text-sm font-mono border border-yellow-400/60 text-yellow-400 px-5 py-4 hover:bg-yellow-400/10 transition-colors tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {executeBatch.isPending
              ? "[RUNNING...]"
              : `[RUN ${selectedIds.size} MODULE${selectedIds.size !== 1 ? "S" : ""}]`}
          </button>
        )}
      </div>

      {/* Batch mode banner */}
      {batchMode && (
        <div className="px-6 py-2 bg-yellow-400/5 border-b border-yellow-400/20 shrink-0 flex items-center justify-between">
          <span className="text-yellow-400 text-xs tracking-widest font-mono">
            BATCH MODE ACTIVE — CLICK MODULES TO SELECT, THEN HIT [RUN] TO EXECUTE IN SEQUENCE
          </span>
          {selectedIds.size > 0 && (
            <button
              onClick={handleExitBatch}
              className="text-foreground/40 hover:text-foreground text-xs font-mono ml-4"
            >
              CLEAR SELECTION
            </button>
          )}
        </div>
      )}

      {/* Grid Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-background">
        <ModuleGrid
          modules={modules}
          isLoading={isLoading}
          onExecute={handleModuleClick}
          batchMode={batchMode}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
        />
      </div>

      {/* Console */}
      <div className="h-64 shrink-0 border-t border-primary/50 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/20 animate-pulse"></div>
        <ConsoleOutput lines={lines} />
      </div>

      {/* History Panel */}
      <HistoryPanel
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onReplay={handleReplay}
      />
    </div>
  );
}
