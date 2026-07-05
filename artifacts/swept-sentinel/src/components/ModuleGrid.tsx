import { Button } from "@/components/ui/button";
import type { Module } from "@workspace/api-client-react/src/generated/api.schemas";

interface ModuleGridProps {
  modules?: Module[];
  isLoading: boolean;
  onExecute: (moduleId: number) => void;
}

export default function ModuleGrid({ modules, isLoading, onExecute }: ModuleGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-primary animate-pulse text-xl tracking-widest">
          [ FETCHING MODULE REPOSITORY... ]
        </div>
      </div>
    );
  }

  if (!modules || modules.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-destructive text-xl tracking-widest">
          [ ERROR: NO MODULES FOUND ]
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      {modules.map(m => (
        <Button
          key={m.id}
          variant="outline"
          className="h-20 py-3 px-4 flex flex-col items-start justify-center text-left bg-card border-border hover:bg-primary/10 hover:border-primary hover:text-primary font-mono rounded-none transition-all duration-200 group relative overflow-hidden shadow-sm"
          onClick={() => onExecute(m.id)}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          <span className="text-xs opacity-50 group-hover:text-primary group-hover:opacity-100 mb-1 font-bold z-10 transition-colors">
            [{m.id.toString().padStart(3, '0')}]
          </span>
          <span className="text-sm font-bold truncate w-full z-10 tracking-wide text-foreground group-hover:text-primary transition-colors">
            {m.name}
          </span>
        </Button>
      ))}
    </div>
  );
}
