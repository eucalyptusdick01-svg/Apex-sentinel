import { useState, useCallback } from "react";
import { useListModules, useExecuteModule } from "@workspace/api-client-react";
import ModuleGrid from "@/components/ModuleGrid";
import ConsoleOutput from "@/components/ConsoleOutput";
import { Input } from "@/components/ui/input";

function getTimestamp() {
  const now = new Date();
  return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
}

export default function Dashboard() {
  const [target, setTarget] = useState("");
  const [lines, setLines] = useState<string[]>([`${getTimestamp()} SYSTEM READY. ENTER TARGET DATA AND SELECT A MODULE.`]);

  const { data: modules, isLoading } = useListModules();
  const executeModule = useExecuteModule();

  const appendLine = useCallback((line: string) => {
    setLines(prev => [...prev, `${getTimestamp()} ${line}`]);
  }, []);

  const handleModuleClick = (moduleId: number) => {
    if (!target.trim()) {
      appendLine(`ALERT: MODULE ${moduleId} REQUIRES TARGET DATA.`);
      return;
    }
    
    appendLine(`EXECUTING MODULE ${moduleId} ON: ${target}`);
    
    executeModule.mutate({ data: { moduleId, target } }, {
      onSuccess: (res) => {
        const es = new EventSource(`/api/sentinel/stream/${res.runId}`);
        
        es.onmessage = (event) => {
          appendLine(event.data);
        };
        
        es.onerror = () => {
          es.close();
          appendLine(`MODULE ${moduleId} STREAM CLOSED.`);
        };
      },
      onError: (err) => {
        appendLine(`ERROR: ${err.error || 'Failed to execute module.'}`);
      }
    });
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden font-mono selection:bg-primary selection:text-primary-foreground">
      {/* Header */}
      <header className="px-6 py-4 border-b border-border bg-card shrink-0 flex flex-col gap-1 z-10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <h1 className="text-3xl md:text-4xl font-bold tracking-[0.2em] text-primary drop-shadow-[0_0_8px_rgba(0,204,255,0.5)] uppercase">
          S W E P T - S E N T I N E L
        </h1>
        <div className="text-sm opacity-80 tracking-widest text-foreground/80 mt-1">
          SYSTEM STATUS: <span className="text-[#00ff41]">ENCRYPTED NODE ACTIVE</span> | {modules?.length || 0} MODULES LOADED
        </div>
      </header>

      {/* Target Input */}
      <div className="px-6 py-4 border-b border-border bg-background shrink-0 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <label htmlFor="target-input" className="text-primary font-bold whitespace-nowrap text-lg tracking-widest drop-shadow-[0_0_4px_rgba(0,204,255,0.4)]">
          [TARGET_DATA] &gt;
        </label>
        <Input
          id="target-input"
          value={target}
          onChange={e => setTarget(e.target.value)}
          className="flex-1 bg-card border-primary/30 text-foreground font-mono rounded-none h-14 text-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary placeholder:text-muted-foreground/50"
          placeholder="Enter IPv4, domain, email, username..."
          autoComplete="off"
          spellCheck="false"
        />
      </div>

      {/* Grid Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-background">
        <ModuleGrid modules={modules} isLoading={isLoading} onExecute={handleModuleClick} />
      </div>

      {/* Console */}
      <div className="h-64 shrink-0 border-t border-primary/50 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/20 animate-pulse"></div>
        <ConsoleOutput lines={lines} />
      </div>
    </div>
  );
}
