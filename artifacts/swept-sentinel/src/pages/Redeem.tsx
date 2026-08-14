import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useAuthMe } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Redeem() {
  const { code } = useParams<{ code: string }>();
  const [, navigate] = useLocation();
  const { data: user, isLoading: authLoading } = useAuthMe();

  const [giftInfo, setGiftInfo] = useState<{ interval: string; recipientEmail: string | null } | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!code) return;
    fetch(`${BASE}/api/gift/${code.toUpperCase()}`)
      .then((r) => r.json())
      .then((d: any) => {
        if (d.error) { setCheckError(d.error); return; }
        setGiftInfo({ interval: d.interval, recipientEmail: d.recipientEmail });
      })
      .catch(() => setCheckError("Failed to validate gift code."));
  }, [code]);

  async function handleRedeem() {
    setRedeeming(true);
    setRedeemError(null);
    try {
      const res = await fetch(`${BASE}/api/gift/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: code?.toUpperCase() }),
      });
      const d = await res.json() as any;
      if (d.success) {
        setSuccess(true);
      } else {
        setRedeemError(d.error ?? "Redemption failed.");
        setRedeeming(false);
      }
    } catch {
      setRedeemError("Network error. Please try again.");
      setRedeeming(false);
    }
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-background text-primary font-mono p-6 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">✅</div>
          <div className="text-[10px] text-primary/40 tracking-[0.3em] mb-3">GIFT REDEEMED</div>
          <h1 className="text-2xl font-bold tracking-widest mb-4">
            YOU'RE NOW PRO
          </h1>
          <p className="text-xs text-primary/50 mb-8 leading-relaxed">
            {giftInfo?.interval === "week" ? "7 days" : "30 days"} of full Pro access
            activated on your account. All 238 modules are now unlocked.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full py-3 text-xs tracking-widest font-bold border border-primary bg-primary text-background hover:bg-primary/90 transition-colors"
          >
            [ GO TO DASHBOARD ]
          </button>
        </div>
      </div>
    );
  }

  // Invalid code
  if (checkError) {
    return (
      <div className="min-h-screen bg-background text-primary font-mono p-6 flex items-center justify-center">
        <div className="max-w-md text-center">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-[10px] text-red-400 tracking-widest mb-3">[INVALID GIFT]</div>
          <p className="text-primary/60 text-sm mb-6">{checkError}</p>
          <button onClick={() => navigate("/")} className="text-xs text-primary/50 hover:text-primary underline">
            ← Back to home
          </button>
        </div>
      </div>
    );
  }

  // Loading gift info
  if (!giftInfo) {
    return (
      <div className="min-h-screen bg-background text-primary font-mono p-6 flex items-center justify-center">
        <div className="text-primary/40 text-xs tracking-widest animate-pulse">[VALIDATING GIFT CODE...]</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-primary font-mono p-6 md:p-10">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🎁</div>
          <div className="text-[10px] text-primary/40 tracking-[0.3em] mb-3">
            SWEPT SENTINEL // GIFT REDEMPTION
          </div>
          <h1 className="text-3xl font-bold tracking-[0.15em] mb-3">YOU GOT A GIFT</h1>
          <p className="text-xs text-primary/50 leading-relaxed max-w-sm mx-auto">
            Someone gifted you{" "}
            <span className="text-primary font-bold">
              {giftInfo.interval === "week" ? "1 week" : "1 month"}
            </span>{" "}
            of Swept Sentinel Pro — full access to all 238 OSINT modules.
          </p>
        </div>

        {/* Gift details */}
        <div className="border border-primary/30 bg-primary/5 p-5 mb-8 text-center">
          <div className="text-[10px] text-primary/40 tracking-widest mb-2">GIFT CODE</div>
          <div className="text-2xl font-bold tracking-[0.4em] text-primary mb-2">{code?.toUpperCase()}</div>
          <div className="text-xs text-primary/50">
            {giftInfo.interval === "week" ? "7 days" : "30 days"} of Pro access · 238 modules unlocked
          </div>
        </div>

        {redeemError && (
          <div className="border border-red-500/50 bg-red-500/10 p-4 text-xs text-red-400 mb-6 tracking-wide">
            [ERROR] {redeemError}
          </div>
        )}

        {authLoading ? (
          <div className="text-center text-primary/40 text-xs tracking-widest animate-pulse py-8">[CHECKING LOGIN...]</div>
        ) : user ? (
          /* Logged in — ready to redeem */
          <div>
            <div className="border border-primary/10 p-4 text-xs text-primary/40 tracking-wide mb-6">
              <span className="text-primary/60">Logged in as:</span>{" "}
              <span className="text-primary">{(user as any).email}</span>
            </div>
            <button
              disabled={redeeming}
              onClick={handleRedeem}
              className="w-full py-3 text-xs tracking-widest font-bold border border-primary bg-primary text-background hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {redeeming ? "[ACTIVATING...]" : "[ ACTIVATE GIFT ]"}
            </button>
          </div>
        ) : (
          /* Not logged in — prompt to login or register */
          <div className="space-y-3">
            <p className="text-xs text-primary/50 text-center mb-6">
              Log in or create a free account to activate your gift.
            </p>
            <button
              onClick={() => navigate(`/login?redirect=/redeem/${code}`)}
              className="w-full py-3 text-xs tracking-widest font-bold border border-primary bg-primary text-background hover:bg-primary/90 transition-colors"
            >
              [ LOG IN & ACTIVATE ]
            </button>
            <button
              onClick={() => navigate(`/register?redirect=/redeem/${code}`)}
              className="w-full py-3 text-xs tracking-widest font-bold border border-primary/50 text-primary hover:bg-primary/10 transition-colors"
            >
              [ CREATE FREE ACCOUNT ]
            </button>
          </div>
        )}

        <div className="mt-8 border-t border-primary/10 pt-6 text-[10px] text-primary/25 tracking-wide text-center space-y-1">
          <div>Gift codes are single-use and valid for 90 days from purchase</div>
          <div>Questions? Contact support via the landing page</div>
        </div>
      </div>
    </div>
  );
}
