const MODULES = [
  { id: "001", name: "IP TRACKER", cat: "NETWORK", real: true },
  { id: "002", name: "GEOLOCATE", cat: "NETWORK", real: true },
  { id: "003", name: "PORT SCAN", cat: "NETWORK", real: true },
  { id: "004", name: "DNS RESOLVE", cat: "NETWORK", real: true },
  { id: "005", name: "WHOIS QUERY", cat: "NETWORK", real: true },
  { id: "021", name: "SUBDOMAIN SCAN", cat: "RECON", real: true },
  { id: "022", name: "TECH STACK", cat: "RECON", real: true },
  { id: "023", name: "ADMIN FINDER", cat: "RECON", real: true },
  { id: "031", name: "PHISH CHECK", cat: "INTEL", real: true },
  { id: "032", name: "THREAT INTEL", cat: "INTEL", real: true },
  { id: "051", name: "GITHUB LOOKUP", cat: "SOCIAL", real: true },
  { id: "052", name: "USERNAME CHECK", cat: "SOCIAL", real: true },
];

const CATS: Record<string, string> = {
  NETWORK: "#00ccff",
  RECON: "#00ff99",
  INTEL: "#ff9900",
  SOCIAL: "#cc66ff",
  EXPLOIT: "#ff4444",
  ADVANCED: "#ffff00",
};

export function Modules() {
  return (
    <div className="w-[390px] h-[844px] bg-[#050a0e] font-mono flex flex-col overflow-hidden">
      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] text-[#00ccff]/60">
        <span>9:41</span>
        <div className="flex gap-1 items-center"><span>●●●● WiFi 100%</span></div>
      </div>

      {/* Header */}
      <div className="px-4 pt-2 pb-3 border-b border-[#00ccff]/10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[#00ccff]/40 tracking-[0.3em]">SWEPT-SENTINEL</div>
            <div className="text-[18px] font-bold text-[#00ccff] tracking-wide drop-shadow-[0_0_8px_rgba(0,204,255,0.5)]">MODULES</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[#00ff41] tracking-widest">● ACTIVE</div>
            <div className="text-[10px] text-[#00ccff]/40 tracking-wide">173 TOTAL</div>
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-3 border border-[#00ccff]/20 bg-[#00ccff]/5 px-3 py-2 flex items-center gap-2">
          <span className="text-[#00ccff]/40 text-[12px]">⌕</span>
          <span className="text-[12px] text-[#00ccff]/30 tracking-wide">SEARCH MODULES...</span>
        </div>

        {/* Target */}
        <div className="mt-2 flex items-center gap-2 text-[11px]">
          <span className="text-[#00ccff]/40 tracking-widest">[TARGET]</span>
          <span className="text-[#00ccff] tracking-wide">192.168.1.1</span>
          <span className="ml-auto text-[#00ccff]/30 border border-[#00ccff]/20 px-2 py-0.5">EDIT</span>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto no-scrollbar border-b border-[#00ccff]/10">
        {["ALL", "NETWORK", "RECON", "INTEL", "SOCIAL"].map((c, i) => (
          <div key={c} className={`shrink-0 px-3 py-1 text-[10px] tracking-widest border ${i === 0 ? "bg-[#00ccff] text-[#050a0e] border-[#00ccff]" : "border-[#00ccff]/20 text-[#00ccff]/50"}`}>
            {c}
          </div>
        ))}
      </div>

      {/* Module list */}
      <div className="flex-1 overflow-y-auto">
        {MODULES.map((m) => (
          <div key={m.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#00ccff]/5 active:bg-[#00ccff]/5">
            <div className="text-[11px] text-[#00ccff]/30 w-8 shrink-0">{m.id}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-[#00ccff] tracking-wide font-bold truncate">{m.name}</div>
              <div className="text-[10px] tracking-widest mt-0.5" style={{ color: CATS[m.cat] + "99" }}>{m.cat}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className={`text-[9px] px-1.5 py-0.5 ${m.real ? "text-[#00ff41] border border-[#00ff41]/30" : "text-[#00ccff]/30 border border-[#00ccff]/10"}`}>
                {m.real ? "REAL" : "SIM"}
              </div>
              <span className="text-[#00ccff]/30 text-[14px]">›</span>
            </div>
          </div>
        ))}
        {/* Pro locked teaser */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#ff9900]/10 bg-[#ff9900]/3">
          <div className="text-[11px] text-[#00ccff]/20 w-8">121</div>
          <div className="flex-1">
            <div className="text-[13px] text-[#00ccff]/30 tracking-wide">DARK WEB INTEL</div>
            <div className="text-[10px] text-[#ff9900]/60 tracking-widest">PRO REQUIRED</div>
          </div>
          <div className="text-[9px] border border-[#ff9900]/40 text-[#ff9900] px-2 py-0.5 tracking-widest">🔒 PRO</div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="border-t border-[#00ccff]/10 flex">
        {["MODULES", "HISTORY", "SETTINGS"].map((t, i) => (
          <div key={t} className={`flex-1 py-3 text-center text-[10px] tracking-widest ${i === 0 ? "text-[#00ccff]" : "text-[#00ccff]/30"}`}>
            {t}
          </div>
        ))}
      </div>
      <div className="h-6 flex items-end justify-center pb-1">
        <div className="w-32 h-1 rounded-full bg-[#00ccff]/20" />
      </div>

      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,204,255,0.012)_2px,rgba(0,204,255,0.012)_4px)]" />
    </div>
  );
}
