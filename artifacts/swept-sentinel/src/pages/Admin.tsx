import { useState } from "react";
import {
  useAdminListUsers,
  useAdminGetUserRuns,
  useAdminGetRun,
  useAdminListSuggestions,
  useReviewSuggestion,
} from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { getAdminListSuggestionsQueryKey } from "@workspace/api-client-react";

type AdminUserItem = {
  id: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  runCount: number;
};

type RunItem = {
  id: string;
  userId: string;
  target: string;
  moduleId: number;
  moduleName: string;
  output: string;
  startedAt: string;
  finishedAt?: string | null;
};

type SuggestionItem = {
  id: string;
  userId: string;
  userEmail: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
};

function RunDetail({ runId, onBack }: { runId: string; onBack: () => void }) {
  const { data: run, isLoading } = useAdminGetRun(runId);

  if (isLoading) {
    return <div className="text-primary/60 text-xs tracking-wider animate-pulse">[LOADING RUN DATA...]</div>;
  }
  if (!run) {
    return <div className="text-red-400 text-xs tracking-wider">[ERROR] Run not found</div>;
  }

  const r = run as RunItem;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="text-xs text-primary hover:underline tracking-widest"
        >
          ← BACK TO RUNS
        </button>
        <span className="text-xs text-muted-foreground tracking-wider">
          MODULE {r.moduleId} · {r.moduleName} · {r.target}
        </span>
      </div>
      <div className="border border-primary/20 bg-black/40 p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
        {r.output.split("\n").map((line, i) => (
          <div key={i} className="text-xs text-[#00ff41] font-mono leading-5">
            {line || "\u00a0"}
          </div>
        ))}
      </div>
      <div className="text-xs text-muted-foreground tracking-wider">
        STARTED: {new Date(r.startedAt).toLocaleString()}
        {r.finishedAt ? ` · FINISHED: ${new Date(r.finishedAt).toLocaleString()}` : ""}
      </div>
    </div>
  );
}

function UserRuns({ userId, onBack, onRunClick }: { userId: string; onBack: () => void; onRunClick: (id: string) => void }) {
  const { data: runs, isLoading } = useAdminGetUserRuns(userId);

  if (isLoading) {
    return <div className="text-primary/60 text-xs tracking-wider animate-pulse">[LOADING RUNS...]</div>;
  }

  const runList = (runs as RunItem[] | undefined) ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-xs text-primary hover:underline tracking-widest">
          ← BACK TO USERS
        </button>
        <span className="text-xs text-muted-foreground tracking-wider">{runList.length} RUNS</span>
      </div>
      {runList.length === 0 ? (
        <div className="text-xs text-muted-foreground tracking-wider">[NO RUNS FOUND]</div>
      ) : (
        <div className="border border-primary/20 overflow-hidden">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="bg-primary/10 border-b border-primary/20">
                <th className="text-left px-3 py-2 text-primary/80 tracking-wider">MODULE</th>
                <th className="text-left px-3 py-2 text-primary/80 tracking-wider">TARGET</th>
                <th className="text-left px-3 py-2 text-primary/80 tracking-wider">STARTED</th>
                <th className="text-left px-3 py-2 text-primary/80 tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              {runList.map((run, i) => (
                <tr
                  key={run.id}
                  className={`border-b border-border/50 hover:bg-primary/5 ${i % 2 === 0 ? "" : "bg-card/30"}`}
                >
                  <td className="px-3 py-2 text-foreground/90">
                    <span className="text-primary/60">#{run.moduleId}</span> {run.moduleName}
                  </td>
                  <td className="px-3 py-2 text-foreground/70 max-w-[160px] truncate">{run.target}</td>
                  <td className="px-3 py-2 text-muted-foreground">{new Date(run.startedAt).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => onRunClick(run.id)}
                      className="text-primary hover:underline tracking-wider"
                    >
                      VIEW
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SuggestionsList() {
  const { data: suggestions, isLoading } = useAdminListSuggestions();
  const reviewSuggestion = useReviewSuggestion();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);

  const list = (suggestions as SuggestionItem[] | undefined) ?? [];

  const handleReview = (id: string) => {
    reviewSuggestion.mutate(
      { id },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: getAdminListSuggestionsQueryKey() });
        },
      },
    );
  };

  if (isLoading) {
    return <div className="text-primary/60 text-xs tracking-wider animate-pulse">[LOADING SUGGESTIONS...]</div>;
  }

  if (list.length === 0) {
    return <div className="text-xs text-muted-foreground tracking-wider">[NO SUGGESTIONS SUBMITTED YET]</div>;
  }

  return (
    <div className="border border-primary/20 overflow-hidden">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="bg-primary/10 border-b border-primary/20">
            <th className="text-left px-3 py-2 text-primary/80 tracking-wider">USER</th>
            <th className="text-left px-3 py-2 text-primary/80 tracking-wider">TITLE</th>
            <th className="text-left px-3 py-2 text-primary/80 tracking-wider">DATE</th>
            <th className="text-left px-3 py-2 text-primary/80 tracking-wider">STATUS</th>
            <th className="text-left px-3 py-2 text-primary/80 tracking-wider"></th>
          </tr>
        </thead>
        <tbody>
          {list.map((s, i) => (
            <>
              <tr
                key={s.id}
                className={`border-b border-border/50 hover:bg-primary/5 cursor-pointer ${i % 2 === 0 ? "" : "bg-card/30"}`}
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
              >
                <td className="px-3 py-2 text-foreground/70 max-w-[140px] truncate">{s.userEmail}</td>
                <td className="px-3 py-2 text-foreground/90 max-w-[200px] truncate">{s.title}</td>
                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                  {new Date(s.createdAt).toLocaleDateString()}
                </td>
                <td className="px-3 py-2">
                  <span className={s.status === "reviewed" ? "text-[#00ff41]" : "text-yellow-400"}>
                    {s.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {s.status === "pending" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleReview(s.id); }}
                      disabled={reviewSuggestion.isPending}
                      className="text-primary/70 hover:text-primary hover:underline tracking-wider disabled:opacity-40"
                    >
                      MARK REVIEWED
                    </button>
                  )}
                </td>
              </tr>
              {expanded === s.id && (
                <tr key={`${s.id}-detail`} className="border-b border-border/50 bg-black/20">
                  <td colSpan={5} className="px-4 py-3">
                    <div className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {s.description}
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type AdminView = "users" | "suggestions";

export default function Admin() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { data: users, isLoading } = useAdminListUsers();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<AdminView>("users");

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-primary/60 font-mono text-xs tracking-wider animate-pulse">
        [AUTHENTICATING...]
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-red-400 font-mono text-xs tracking-wider">
        [ACCESS DENIED] Admin clearance required.
      </div>
    );
  }

  const userList = (users as AdminUserItem[] | undefined) ?? [];

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden font-mono">
      <header className="px-4 py-3 border-b border-border bg-card shrink-0 flex items-center gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <h1 className="text-xl font-bold tracking-[0.15em] text-primary drop-shadow-[0_0_8px_rgba(0,204,255,0.5)] uppercase">
          S W E P T - S E N T I N E L · ADMIN
        </h1>
        <div className="flex-1" />
        <button
          onClick={() => navigate("/")}
          className="text-xs text-primary/70 hover:text-primary tracking-widest border border-primary/20 px-3 py-1"
        >
          ← DASHBOARD
        </button>
      </header>

      {/* Tab nav */}
      <div className="flex border-b border-border bg-card shrink-0">
        <button
          onClick={() => { setActiveView("users"); setSelectedUserId(null); setSelectedRunId(null); }}
          className={`text-xs tracking-widest px-4 py-2 border-r border-border transition-colors ${
            activeView === "users"
              ? "text-primary bg-primary/10 border-b-2 border-b-primary"
              : "text-muted-foreground hover:text-primary"
          }`}
        >
          OPERATOR REGISTRY
        </button>
        <button
          onClick={() => { setActiveView("suggestions"); setSelectedUserId(null); setSelectedRunId(null); }}
          className={`text-xs tracking-widest px-4 py-2 transition-colors ${
            activeView === "suggestions"
              ? "text-primary bg-primary/10 border-b-2 border-b-primary"
              : "text-muted-foreground hover:text-primary"
          }`}
        >
          SUGGESTIONS
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {activeView === "suggestions" ? (
          <div className="flex flex-col gap-4">
            <div className="text-xs text-muted-foreground tracking-wider mb-2">
              SUGGESTION INBOX — feature requests from operators
            </div>
            <SuggestionsList />
          </div>
        ) : selectedRunId ? (
          <RunDetail runId={selectedRunId} onBack={() => setSelectedRunId(null)} />
        ) : selectedUserId ? (
          <UserRuns
            userId={selectedUserId}
            onBack={() => setSelectedUserId(null)}
            onRunClick={(id) => setSelectedRunId(id)}
          />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="text-xs text-muted-foreground tracking-wider mb-2">
              OPERATOR REGISTRY — {userList.length} USER{userList.length !== 1 ? "S" : ""} ENROLLED
            </div>
            {isLoading ? (
              <div className="text-primary/60 text-xs tracking-wider animate-pulse">[LOADING...]</div>
            ) : (
              <div className="border border-primary/20 overflow-hidden">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="bg-primary/10 border-b border-primary/20">
                      <th className="text-left px-3 py-2 text-primary/80 tracking-wider">EMAIL</th>
                      <th className="text-left px-3 py-2 text-primary/80 tracking-wider">ROLE</th>
                      <th className="text-left px-3 py-2 text-primary/80 tracking-wider">RUNS</th>
                      <th className="text-left px-3 py-2 text-primary/80 tracking-wider">ENROLLED</th>
                      <th className="text-left px-3 py-2 text-primary/80 tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {userList.map((user, i) => (
                      <tr
                        key={user.id}
                        className={`border-b border-border/50 ${i % 2 === 0 ? "" : "bg-card/30"}`}
                      >
                        <td className="px-3 py-2 text-foreground/90">{user.email}</td>
                        <td className="px-3 py-2">
                          <span className={user.isAdmin ? "text-yellow-400" : "text-muted-foreground"}>
                            {user.isAdmin ? "ADMIN" : "OPERATOR"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-primary">{user.runCount}</td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => setSelectedUserId(user.id)}
                            className="text-primary hover:underline tracking-wider"
                          >
                            VIEW RUNS
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
