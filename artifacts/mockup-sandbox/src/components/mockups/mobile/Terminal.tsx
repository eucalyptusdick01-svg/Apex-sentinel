const OUTPUT = [
  { t: "0.00s", c: "#00ccff", text: "[INIT] Module 003 PORT SCAN v2.1" },
  { t: "0.12s", c: "#00ccff40", text: "[INFO] Target: 192.168.1.1" },
  { t: "0.13s", c: "#00ccff40", text: "[INFO] Scanning 1000 common ports..." },
  { t: "0.45s", c: "#00ff41", text: "[OPEN]  22/tcp  SSH" },
  { t: "0.51s", c: "#00ff41", text: "[OPEN]  80/tcp  HTTP" },
  { t: "0.67s", c: "#00ff41", text: "[OPEN] 443/tcp  HTTPS" },
  { t: "0.89s", c: "#ff9900", text: "[FILT] 8080/tcp FILTERED" },
  { t: "1.02s", c: "#00ccff40", text: "[INFO] Checking service banners..." },
  { t: "1.24s", c: "#00ccff", text: "[BANNER] SSH-2.0-OpenSSH_8.4" },
  { t: "1.31s", c: "#00ccff", text: "[BANNER] nginx/1.21.6" },
  { t: "1.55s", c: "#00ccff40", text: "[INFO] OS fingerprint: Linux 5.x" },
  { t: "1.78s", c: "#00ff41", text: "[DONE] Scan complete. 3 open ports." },
  { t: "1.79s", c: "#00ccff60", text: "─────────────────────────────" },
  { t: "1.80s", c: "#00ccff", text: "[SUMMARY]" },
  { t: "1.81s", c: "#00ff41", text: "  Open:     3 ports" },
  { t: "1.82s", c: "#ff9900", text: "  Filtered: 1 port" },
  { t: "1.83s", c: "#00ccff40", text: "  Closed:   996 ports" },
  { t: "", c: "#00ccff", text: "█" },
];

export function Terminal() {
  return (
    <div className="w-[390px] h-[844px] bg-[#050a0e] font-mono flex flex-col overflow-hidden">
      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] text-[#00ccff]/60">
        <span>9:41</span>
        <div className="flex gap-1 items-center"><span>●●●● WiFi 100%</span></div>
      </div>

      {/* Header */}
      <div className="px-4 pt-2 pb-3 border-b border-[#00ccff]/10">
        <div className="flex items-center gap-2">
          <span className="text-[#00ccff]/40 text-[12px]">‹</span>
          <div>
            <div className="text-[10px] text-[#00ccff]/40 tracking-[0.3em]">MODULE 003</div>
            <div className="text-[15px] font-bold text-[#00ccff] tracking-wide">PORT SCAN</div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse" />
            <span className="text-[10px] text-[#00ff41] tracking-widest">RUNNING</span>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2 text-[11px]">
          <span className="text-[#00ccff]/40">[TARGET]</span>
          <span className="text-[#00ccff]">192.168.1.1</span>
          <span className="ml-auto text-[#00ccff]/30 text-[10px]">1.83s elapsed</span>
        </div>
      </div>

      {/* Terminal output */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5 bg-[#020508]">
        {OUTPUT.map((line, i) => (
          <div key={i} className="flex gap-2 text-[11px] leading-[1.6]">
            {line.t && (
              <span className="text-[#00ccff]/20 w-12 shrink-0 text-right">{line.t}</span>
            )}
            <span style={{ color: line.c }}>{line.text}</span>
          </div>
        ))}
      </div>

      {/* Action bar */}
      <div className="border-t border-[#00ccff]/10 px-4 py-3 space-y-2">
        <div className="flex gap-2">
          <button className="flex-1 py-2.5 text-[11px] border border-[#00ccff]/20 text-[#00ccff]/50 tracking-widest">
            [COPY OUTPUT]
          </button>
          <button className="flex-1 py-2.5 text-[11px] bg-[#00ccff] text-[#050a0e] font-bold tracking-widest">
            [RUN AGAIN]
          </button>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 py-2 text-[10px] border border-[#00ccff]/10 text-[#00ccff]/30 tracking-widest">
            [SAVE TO HISTORY]
          </button>
          <button className="flex-1 py-2 text-[10px] border border-[#00ccff]/10 text-[#00ccff]/30 tracking-widest">
            [SHARE REPORT]
          </button>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="border-t border-[#00ccff]/10 flex">
        {["MODULES", "HISTORY", "SETTINGS"].map((t, i) => (
          <div key={t} className={`flex-1 py-3 text-center text-[10px] tracking-widest ${i === 1 ? "text-[#00ccff]" : "text-[#00ccff]/30"}`}>
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
