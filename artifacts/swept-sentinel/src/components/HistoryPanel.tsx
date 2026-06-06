import { useState } from "react";
import { useListHistory, useGetHistoryRun, useDeleteHistoryRun, getListHistoryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetHistoryRunQueryKey } from "@workspace/api-client-react";

interface HistoryPanelProps {
  open: boolean;
  onClose: () => void;
  onReplay: (lines: string[]) => void;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function HistoryPanel({ open, onClose, onReplay }: HistoryPanelProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: history, isLoading } = useListHistory({ query: { enabled: open, queryKey: getListHistoryQueryKey() } });
  const { data: detail, isLoading: detailLoading } = useGetHistoryRun(
    selectedId ?? 0,
    { query: { enabled: !!selectedId, queryKey: getGetHistoryRunQueryKey(selectedId ?? 0) } }
  );
  const deleteRun = useDeleteHistoryRun();

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteRun.mutate({ id }, {
      onSuccess: () => {
        if (selectedId === id) setSelectedId(null);
        queryClient.invalidateQueries({ queryKey: getListHistoryQueryKey() });
      }
    });
  };

  const handleReplay = () => {
    if (!detail) return;
    onReplay(detail.output.split("\n"));
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex" data-testid="history-panel">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-4xl h-full bg-[#010810] border-l border-primary/40 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary/30 bg-[#0a1a2a] shrink-0">
          <div>
            <h2 className="text-primary font-bold tracking-widest text-lg">[ RUN HISTORY ]</h2>
            <p className="text-foreground/50 text-xs mt-1 tracking-wide">
              {history?.length ?? 0} RECORDS — SESSIONS PERSISTED ACROSS RESTARTS
            </p>
          </div>
          <button
            data-testid="history-close"
            onClick={onClose}
            className="text-foreground/40 hover:text-primary font-mono text-xl transition-colors px-2"
          >
            [×]
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* List */}
          <div className="w-80 shrink-0 border-r border-primary/20 overflow-y-auto custom-scrollbar bg-[#010810]">
            {isLoading ? (
              <div className="p-4 text-primary/60 text-sm animate-pulse tracking-widest">LOADING...</div>
            ) : !history?.length ? (
              <div className="p-6 text-foreground/40 text-sm tracking-wide text-center mt-8">
                NO HISTORY YET.<br />EXECUTE A MODULE TO BEGIN.
              </div>
            ) : (
              history.map(run => (
                <div
                  key={run.id}
                  data-testid={`history-item-${run.id}`}
                  onClick={() => setSelectedId(run.id)}
                  className={`px-4 py-3 border-b border-primary/10 cursor-pointer transition-colors group flex items-start justify-between gap-2
                    ${selectedId === run.id ? "bg-primary/10 border-l-2 border-l-primary" : "hover:bg-primary/5"}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-primary font-bold text-xs tracking-widest truncate">
                      [{run.moduleId.toString().padStart(3, "0")}] {run.moduleName}
                      {run.batchId && <span className="ml-2 text-yellow-400/70 text-xs">[BATCH]</span>}
                    </div>
                    <div className="text-foreground/70 text-xs mt-0.5 truncate">{run.target}</div>
                    <div className="text-foreground/30 text-xs mt-1">{formatDate(run.createdAt)}</div>
                  </div>
                  <button
                    data-testid={`delete-run-${run.id}`}
                    onClick={(e) => handleDelete(run.id, e)}
                    className="text-foreground/20 hover:text-destructive text-xs font-mono shrink-0 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    [×]
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Detail pane */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!selectedId ? (
              <div className="flex-1 flex items-center justify-center text-foreground/30 text-sm tracking-widest">
                SELECT A RUN TO VIEW OUTPUT
              </div>
            ) : detailLoading ? (
              <div className="flex-1 flex items-center justify-center text-primary/60 text-sm animate-pulse tracking-widest">
                DECRYPTING OUTPUT...
              </div>
            ) : detail ? (
              <>
                <div className="px-5 py-3 border-b border-primary/20 bg-[#0a1a2a] shrink-0 flex items-center justify-between">
                  <div>
                    <div className="text-primary font-bold tracking-widest text-sm">
                      [{detail.moduleId.toString().padStart(3, "0")}] {detail.moduleName}
                    </div>
                    <div className="text-foreground/50 text-xs mt-0.5">TARGET: {detail.target} | {formatDate(detail.createdAt)}</div>
                  </div>
                  <button
                    data-testid="replay-btn"
                    onClick={handleReplay}
                    className="text-xs font-mono text-primary border border-primary/40 px-3 py-1.5 hover:bg-primary/10 transition-colors tracking-widest"
                  >
                    [REPLAY TO CONSOLE]
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 bg-black font-mono text-xs text-[#00ff41] custom-scrollbar whitespace-pre-wrap shadow-[inset_0_0_20px_rgba(0,255,65,0.05)]">
                  {detail.output || <span className="text-foreground/30">(no output)</span>}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
