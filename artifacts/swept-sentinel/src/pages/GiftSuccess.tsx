import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function GiftSuccess() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const sessionId = params.get("session_id");

  const [code, setCode] = useState<string | null>(null);
  const [interval, setInterval] = useState<string | null>(null);
  const [recipientEmail, setRecipientEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
        setCode(d.code);
        setInterval(d.interval);
        setRecipientEmail(d.recipientEmail ?? null);
      })
      .catch(() => setError("Failed to generate gift code. Contact support."));
  }, [sessionId]);

  const redeemUrl = code
    ? `${window.location.origin}${BASE}/redeem/${code}`
    : null;

  function copyLink() {
    if (!redeemUrl) return;
    navigator.clipboard.writeText(redeemUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
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

  if (!code) {
    return (
      <div className="min-h-screen bg-background text-primary font-mono p-6 flex items-center justify-center">
        <div className="text-primary/40 text-xs tracking-widest animate-pulse">[GENERATING GIFT CODE...]</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-primary font-mono p-6 md:p-10">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🎁</div>
          <div className="text-[10px] text-primary/40 tracking-[0.3em] mb-3">GIFT PURCHASED</div>
          <h1 className="text-3xl font-bold tracking-[0.15em] mb-3">GIFT READY</h1>
          <p className="text-xs text-primary/50 leading-relaxed">
            Payment confirmed. Share the link below with{" "}
            {recipientEmail ? (
              <span className="text-primary">{recipientEmail}</span>
            ) : (
              "your recipient"
            )}{" "}
            — they'll click it to activate{" "}
            <span className="text-primary">{interval === "week" ? "7 days" : "30 days"}</span> of Pro access.
          </p>
        </div>

        {/* Gift code display */}
        <div className="border border-primary/30 bg-primary/5 p-6 mb-6 text-center">
          <div className="text-[10px] text-primary/40 tracking-[0.25em] mb-3">GIFT CODE</div>
          <div className="text-3xl font-bold tracking-[0.4em] text-primary mb-1">{code}</div>
          <div className="text-[10px] text-primary/30 tracking-wide">Valid for 90 days</div>
        </div>

        {/* Redemption link */}
        <div className="border border-primary/20 p-4 mb-4">
          <div className="text-[10px] text-primary/40 tracking-widest mb-2">REDEMPTION LINK</div>
          <div className="text-xs text-primary/60 break-all mb-3 leading-relaxed">{redeemUrl}</div>
          <button
            onClick={copyLink}
            className="w-full py-2.5 text-xs tracking-widest font-bold border border-primary text-primary hover:bg-primary/10 transition-colors"
          >
            {copied ? "[ ✓ COPIED! ]" : "[ COPY LINK ]"}
          </button>
        </div>

        <div className="border border-primary/10 p-4 text-[10px] text-primary/30 tracking-wide space-y-1.5 mb-8">
          <div>▸ Share this link (or just the code) with your recipient</div>
          <div>▸ They can create a free account and enter the code to go Pro</div>
          <div>▸ The link works on any device — no app download needed</div>
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
