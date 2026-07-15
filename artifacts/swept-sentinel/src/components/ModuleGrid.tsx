import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Module } from "@workspace/api-client-react/src/generated/api.schemas";

interface ModuleGridProps {
  modules?: Module[];
  isLoading: boolean;
  onExecute: (moduleId: number) => void;
}

type Category = "ALL" | "NETWORK" | "SOCIAL" | "RECON" | "EXPLOIT" | "INTEL" | "ADVANCED";

function getCategory(id: number): Exclude<Category, "ALL"> {
  if (id <= 10) return "NETWORK";
  if (id <= 50) return "SOCIAL";
  if (id <= 100) return "RECON";
  if (id <= 150) return "EXPLOIT";
  if (id <= 200) return "INTEL";
  return "ADVANCED";
}

const CATEGORY_COLORS: Record<Exclude<Category, "ALL">, string> = {
  NETWORK: "text-[#7AA2F7]",
  SOCIAL: "text-[#9ECE6A]",
  RECON: "text-[#E0AF68]",
  EXPLOIT: "text-[#FF9E64]",
  INTEL: "text-[#BB9AF7]",
  ADVANCED: "text-[#2AC3DE]",
};

const CATEGORY_BORDER: Record<Exclude<Category, "ALL">, string> = {
  NETWORK: "border-[#7AA2F7]",
  SOCIAL: "border-[#9ECE6A]",
  RECON: "border-[#E0AF68]",
  EXPLOIT: "border-[#FF9E64]",
  INTEL: "border-[#BB9AF7]",
  ADVANCED: "border-[#2AC3DE]",
};

const CATEGORY_BG: Record<Exclude<Category, "ALL">, string> = {
  NETWORK: "bg-[#7AA2F7]/10",
  SOCIAL: "bg-[#9ECE6A]/10",
  RECON: "bg-[#E0AF68]/10",
  EXPLOIT: "bg-[#FF9E64]/10",
  INTEL: "bg-[#BB9AF7]/10",
  ADVANCED: "bg-[#2AC3DE]/10",
};

export default function ModuleGrid({ modules, isLoading, onExecute }: ModuleGridProps) {
  const [activeCategory, setActiveCategory] = useState<Category>("ALL");
  const [search, setSearch] = useState("");

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

  const categories: Category[] = ["ALL", "NETWORK", "SOCIAL", "RECON", "EXPLOIT", "INTEL", "ADVANCED"];

  const countFor = (cat: Category) =>
    cat === "ALL" ? modules.length : modules.filter(m => getCategory(m.id) === cat).length;

  const filtered = modules.filter(m => {
    const matchCat = activeCategory === "ALL" || getCategory(m.id) === activeCategory;
    const matchSearch = search.trim() === "" || m.name.toLowerCase().includes(search.toLowerCase()) || String(m.id).includes(search.trim());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="SEARCH MODULES BY NAME OR ID..."
        className="w-full bg-card border border-border text-foreground font-mono text-sm px-4 py-2 rounded-none placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary"
      />

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => {
          const isActive = activeCategory === cat;
          const color = cat === "ALL" ? "text-primary" : CATEGORY_COLORS[cat as Exclude<Category, "ALL">];
          const border = cat === "ALL" ? "border-primary" : CATEGORY_BORDER[cat as Exclude<Category, "ALL">];
          const bg = cat === "ALL" ? "bg-primary/10" : CATEGORY_BG[cat as Exclude<Category, "ALL">];
          const count = countFor(cat);
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`font-mono text-xs px-3 py-1 border rounded-none transition-all tracking-widest ${
                isActive
                  ? `${border} ${bg} ${color} font-bold`
                  : "border-border text-muted-foreground hover:border-muted-foreground"
              }`}
            >
              {cat}
              <span className={`ml-2 opacity-70 ${isActive ? color : ""}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Result count */}
      <div className="text-xs font-mono text-muted-foreground tracking-widest">
        SHOWING {filtered.length} OF {modules.length} MODULES
        {search && ` — FILTER: "${search.toUpperCase()}"`}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-muted-foreground font-mono text-sm tracking-widest py-12 text-center">
          [ NO MODULES MATCH QUERY ]
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {filtered.map(m => {
            const cat = getCategory(m.id);
            const color = CATEGORY_COLORS[cat];
            const border = CATEGORY_BORDER[cat];
            return (
              <Button
                key={m.id}
                variant="outline"
                className={`h-16 py-2 px-3 flex flex-col items-start justify-center text-left bg-card border-border hover:${border} hover:bg-card font-mono rounded-none transition-all duration-150 group relative overflow-hidden`}
                onClick={() => onExecute(m.id)}
              >
                <span className={`text-[10px] font-bold mb-0.5 z-10 ${color} opacity-80 group-hover:opacity-100`}>
                  [{m.id.toString().padStart(3, "0")}]
                </span>
                <span className="text-[11px] font-bold truncate w-full z-10 tracking-wide text-foreground group-hover:text-foreground/90 leading-tight">
                  {m.name}
                </span>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}
