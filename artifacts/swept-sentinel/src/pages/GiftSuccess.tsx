import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function GiftSuccess() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const sessionId = params.get("session_id");

  const [codes, setCodes] = useState<string[]>([]);
  const [interval, setInterval] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  useEffect(() => {
    if (!sessionId) { setError("Missing session ID."); return; }
    fetch(`${BASE}/api/gift/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((r) => r.json())
      .then((d: any) => {
        if (d.error) { setError(d.error); return; }
        setCodes(d.codes ?? []);
        setInterval(d.interval ?? null);
      })
      .catch(() => setError("Failed to generate gift codes. Contact support."));
  }, [sessionId]);

  function redeemUrl(code: string) {
    return `${window.location.origin}${BASE}/redeem/${code}`;
  }

  function copyOne(idx: number) {
    navigator.clipboard.writeText(redeemUrl(codes[idx])).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2500);
    });
  }

  function copyAll() {
    const text = codes.map((c, i) => `Gift ${i + 1}: ${redeemUrl(c)}`).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    });
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-primary font-mono p-6 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="text-red-400 text-xs tracking-widest mb-4">[ERROR]</div>
          <p className="text-primary/60 text-sm mb-6">{error}</p>
          <button onClick={() => navigate("/gift")} className="text-xs text-primary/50 hover:text-primary underline">
            ← Back to gift page
          </button>
        </div>
      </div>
    );
  }

  if (!codes.length) {
    return (
      <div className="min-h-screen bg-background text-primary font-mono p-6 flex items-center justify-center">
        <div className="text-primary/40 text-xs tracking-widest animate-pulse">[GENERATING GIFT CODES...]</div>
      </div>
    );
  }

  const accessLabel = interval === "week" ? "7 days" : "30 days";
  const plural = codes.length > 1;

  return (
    <div className="min-h-screen bg-background text-primary font-mono p-6 md:p-10">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🎁</div>
          <div className="text-[10px] text-primary/40 tracking-[0.3em] mb-2">GIFT RECEIPT</div>
          <h1 className="text-3xl font-bold tracking-[0.15em] mb-3">
            {plural ? `${codes.length} GIFTS READY` : "GIFT READY"}
          </h1>
          <p className="text-xs text-primary/50 leading-relaxed max-w-sm mx-auto">
            Payment confirmed.{" "}
            {plural
              ? `Share each link with a different person — every code gives ${accessLabel} of Pro access.`
              : `Share the link below — it gives ${accessLabel} of Pro access.`}
          </p>
        </div>

        {/* Individual codes */}
        <div className="space-y-3 mb-6">
          {codes.map((code, i) => (
            <div key={code} className="border border-primary/25 bg-card p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <div className="text-[10px] text-primary/40 tracking-widest mb-0.5">
                    GIFT {plural ? `#${i + 1}` : ""} · {accessLabel.toUpperCase()} ACCESS
                  </div>
                  <div className="text-xl font-bold tracking-[0.35em] text-primary">{code}</div>
                </div>
                <button
                  onClick={() => copyOne(i)}
                  className="shrink-0 border border-primary/40 hover:border-primary text-primary/70 hover:text-primary px-3 py-1.5 text-[10px] tracking-widest transition-colors"
                >
                  {copiedIdx === i ? "✓ COPIED" : "COPY LINK"}
                </button>
              </div>
              <div className="text-[10px] text-primary/30 break-all leading-relaxed">
                {redeemUrl(code)}
              </div>
            </div>
          ))}
        </div>

        {/* Copy all button (multi-gift only) */}
        {plural && (
          <button
            onClick={copyAll}
            className="w-full py-3 text-xs tracking-widest font-bold border border-primary text-primary hover:bg-primary/10 transition-colors mb-6"
          >
            {copiedAll ? "[ ✓ ALL LINKS COPIED ]" : `[ COPY ALL ${codes.length} LINKS ]`}
          </button>
        )}

        {/* Info footer */}
        <div className="border border-primary/10 p-4 text-[10px] text-primary/30 tracking-wide space-y-1.5 mb-8">
          <div>▸ Each code is single-use and valid for 90 days</div>
          <div>▸ Recipients can create a free account or use an existing one</div>
          <div>▸ Bookmark this page or copy the links before you leave</div>
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-xs text-primary/40 hover:text-primary/70 tracking-widest transition-colors"
          >
            → GO TO DASHBOARD
          </button>
        </div>

      </div>
    </div>
  );
}
