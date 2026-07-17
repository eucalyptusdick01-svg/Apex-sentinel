export function Login() {
  return (
    <div className="w-[390px] h-[844px] bg-[#050a0e] font-mono flex flex-col overflow-hidden relative">
      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] text-[#00ccff]/60">
        <span>9:41</span>
        <div className="flex gap-1 items-center">
          <span>●●●●</span>
          <span>WiFi</span>
          <span>100%</span>
        </div>
      </div>

      {/* Logo area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6">
        <div className="text-center space-y-2">
          <div className="text-[10px] text-[#00ccff]/40 tracking-[0.4em] mb-1">v2.4.1 // MOBILE</div>
          <h1 className="text-[28px] font-bold tracking-[0.18em] text-[#00ccff] drop-shadow-[0_0_16px_rgba(0,204,255,0.6)]">
            SWEPT<br />SENTINEL
          </h1>
          <div className="text-[10px] text-[#00ccff]/40 tracking-[0.3em]">OSINT · RECON · INTEL</div>
        </div>

        {/* Decorative scan line */}
        <div className="w-full border-t border-[#00ccff]/10 relative">
          <div className="absolute -top-px left-0 w-16 h-px bg-[#00ccff]/60" />
        </div>

        {/* Form */}
        <div className="w-full space-y-3">
          <div className="space-y-1">
            <div className="text-[10px] text-[#00ccff]/50 tracking-widest">[OPERATOR ID]</div>
            <div className="border border-[#00ccff]/20 bg-[#00ccff]/5 px-4 py-3 text-[13px] text-[#00ccff]/60 tracking-wide flex items-center gap-2">
              <span className="text-[#00ccff]/30">▸</span>
              <span>operator@example.com</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] text-[#00ccff]/50 tracking-widest">[PASSPHRASE]</div>
            <div className="border border-[#00ccff]/20 bg-[#00ccff]/5 px-4 py-3 text-[13px] text-[#00ccff]/60 tracking-wide flex items-center gap-2">
              <span className="text-[#00ccff]/30">▸</span>
              <span>● ● ● ● ● ● ● ●</span>
            </div>
          </div>

          <button className="w-full py-3.5 bg-[#00ccff] text-[#050a0e] text-[12px] font-bold tracking-[0.25em] mt-2 shadow-[0_0_20px_rgba(0,204,255,0.3)]">
            [AUTHENTICATE]
          </button>
        </div>

        <div className="text-center space-y-2 text-[11px] text-[#00ccff]/30 tracking-wide">
          <div>No account? <span className="text-[#00ccff]/60 underline">Register →</span></div>
          <div className="text-[10px]">Forgot passphrase?</div>
        </div>
      </div>

      {/* Bottom safe area */}
      <div className="h-8 flex items-center justify-center">
        <div className="w-32 h-1 rounded-full bg-[#00ccff]/20" />
      </div>

      {/* Scan line animation overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,204,255,0.015)_2px,rgba(0,204,255,0.015)_4px)]" />
      </div>
    </div>
  );
}
