const FEATURES = [
  "All 173 real OSINT modules",
  "Unlimited module runs — no daily cap",
  "VirusTotal & AbuseIPDB threat intel",
  "AlienVault OTX breach intelligence",
  "Dark web & paste intel lookup",
  "FCC callsign & DMR radio lookup",
  "Full cryptographic tools suite",
  "History & saved reports",
];

export function Paywall() {
  return (
    <div className="w-[390px] h-[844px] bg-[#050a0e] font-mono flex flex-col overflow-hidden relative">
      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] text-[#00ccff]/60">
        <span>9:41</span>
        <div className="flex gap-1"><span>●●●● WiFi 100%</span></div>
      </div>

      {/* Close / restore */}
      <div className="flex items-center justify-between px-4 py-2">
        <button className="text-[12px] text-[#00ccff]/40 tracking-widest">✕ CLOSE</button>
        <button className="text-[11px] text-[#00ccff]/30 tracking-wide">Restore</button>
      </div>

      {/* Hero area */}
      <div className="px-6 pt-2 pb-6 text-center">
        {/* Shield icon */}
        <div className="mx-auto mb-4 w-20 h-20 border-2 border-[#00ccff]/40 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-[#00ccff]/5" />
          <div className="text-3xl text-[#00ccff] drop-shadow-[0_0_12px_rgba(0,204,255,0.8)]">◈</div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00ccff]/60" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#00ccff]/60" />
        </div>

        <div className="text-[10px] text-[#00ccff]/40 tracking-[0.35em] mb-1">UNLOCK FULL ACCESS</div>
        <h1 className="text-[22px] font-bold text-[#00ccff] tracking-wide leading-tight drop-shadow-[0_0_8px_rgba(0,204,255,0.5)]">
          SENTINEL<br />PRO
        </h1>
        <p className="text-[11px] text-[#00ccff]/50 mt-2 leading-relaxed">
          The complete OSINT intelligence suite — 173 live modules, unlimited runs.
        </p>
      </div>

      {/* Divider */}
      <div className="mx-6 border-t border-[#00ccff]/10 relative mb-4">
        <div className="absolute -top-px left-0 w-12 h-px bg-[#00ccff]/50" />
      </div>

      {/* Feature list */}
      <div className="px-6 flex-1 overflow-y-auto space-y-2 mb-3">
        {FEATURES.map((f) => (
          <div key={f} className="flex items-start gap-2.5 text-[12px] text-[#00ccff]/70">
            <span className="text-[#00ff41] mt-px shrink-0">▸</span>
            <span>{f}</span>
          </div>
        ))}
      </div>

      {/* Pricing toggle + CTA */}
      <div className="px-6 pb-2 space-y-3">
        {/* Toggle */}
        <div className="flex rounded-none border border-[#00ccff]/20 overflow-hidden text-[11px] tracking-widest">
          <div className="flex-1 py-2 text-center bg-[#00ccff] text-[#050a0e] font-bold">
            MONTHLY<br />
            <span className="text-[9px] font-normal">$19 / mo</span>
          </div>
          <div className="flex-1 py-2 text-center text-[#00ccff]/50 relative">
            YEARLY
            <div className="text-[9px] text-[#00ff41]/80">$159 / yr · SAVE 30%</div>
            <div className="absolute top-1 right-1 text-[8px] border border-[#00ff41]/40 text-[#00ff41] px-1">BEST</div>
          </div>
        </div>

        {/* Subscribe CTA */}
        <button className="w-full py-4 bg-[#00ccff] text-[#050a0e] text-[13px] font-bold tracking-[0.2em] shadow-[0_0_24px_rgba(0,204,255,0.4)]">
          [SUBSCRIBE MONTHLY — $19]
        </button>

        {/* Trial note */}
        <div className="text-center text-[10px] text-[#00ccff]/30 tracking-wide">
          Cancel anytime · Secured by RevenueCat
        </div>

        {/* Terms */}
        <div className="text-center text-[9px] text-[#00ccff]/20 tracking-wide leading-relaxed">
          Privacy Policy · Terms of Service
        </div>
      </div>

      {/* Home indicator */}
      <div className="h-6 flex items-end justify-center pb-1">
        <div className="w-32 h-1 rounded-full bg-[#00ccff]/20" />
      </div>

      {/* CRT overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,204,255,0.012)_2px,rgba(0,204,255,0.012)_4px)]" />
    </div>
  );
}
