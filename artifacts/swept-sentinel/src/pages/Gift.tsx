import { useState, useEffect } from "react";
import { useLocation } from "wouter";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Price {
  id: string;
  unit_amount: number;
  currency: string;
  recurring: { interval: string } | null;
}

function fmt(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export default function Gift() {
  const [, navigate] = useLocation();
  const [weeklyPrice, setWeeklyPrice] = useState<Price | null>(null);
  const [monthlyPrice, setMonthlyPrice] = useState<Price | null>(null);
  const [selected, setSelected] = useState<"week" | "month">("month");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BASE}/api/stripe/plans`)
      .then((r) => r.json())
      .then((d: any) => {
        const proPlan = (d.plans ?? []).find(
          (p: any) => !p.name.toLowerCase().includes("enterprise"),
        );
        if (!proPlan) return;
        setWeeklyPrice(proPlan.prices.find((p: any) => p.recurring?.interval === "week") ?? null);
        setMonthlyPrice(proPlan.prices.find((p: any) => p.recurring?.interval === "month") ?? null);
      })
      .catch(() => setError("Failed to load plans."));
  }, []);

  const activePrice = selected === "week" ? weeklyPrice : monthlyPrice;

  async function handleGift() {
    if (!activePrice) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/stripe/gift-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: activePrice.id,
          interval: selected,
          quantity,
        }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Checkout failed.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-primary font-mono p-6 md:p-10">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate("/pricing")}
          className="text-xs text-primary/40 hover:text-primary/70 tracking-widest mb-10 block transition-colors"
        >
          ← BACK TO PRICING
        </button>

        <div className="mb-10 text-center">
          <div className="text-[10px] text-primary/40 tracking-[0.3em] mb-3">
            SWEPT SENTINEL // GIFT ACCESS
          </div>
          <div className="text-4xl mb-3">🎁</div>
          <h1 className="text-3xl font-bold tracking-[0.15em] mb-3">GIVE PRO</h1>
          <p className="text-xs text-primary/50 max-w-sm mx-auto leading-relaxed">
            Give someone full access to all 238 OSINT modules. They'll get a
            redemption link to activate whenever they're ready.
          </p>
        </div>

        {error && (
          <div className="border border-red-500/50 bg-red-500/10 p-4 text-xs text-red-400 mb-6 tracking-wide">
            [ERROR] {error}
          </div>
        )}

        {/* Plan selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {weeklyPrice && (
            <button
              onClick={() => setSelected("week")}
              className={`border p-4 text-left transition-colors ${
                selected === "week"
                  ? "border-primary bg-primary/10"
                  : "border-primary/20 hover:border-primary/50"
              }`}
            >
              <div className="text-[10px] text-primary/40 tracking-widest mb-1">[WEEKLY]</div>
              <div className="text-primary font-bold text-xl">
                {fmt(weeklyPrice.unit_amount, weeklyPrice.currency)}
              </div>
              <div className="text-xs text-primary/40 mt-0.5">7 days of Pro access</div>
            </button>
          )}
          {monthlyPrice && (
            <button
              onClick={() => setSelected("month")}
              className={`border p-4 text-left transition-colors relative ${
                selected === "month"
                  ? "border-primary bg-primary/10"
                  : "border-primary/20 hover:border-primary/50"
              }`}
            >
              {selected === "month" && (
                <div className="absolute top-2 right-2 text-[9px] border border-primary text-primary px-1.5 py-0.5 tracking-widest">
                  SELECTED
                </div>
              )}
              <div className="text-[10px] text-primary/40 tracking-widest mb-1">[MONTHLY]</div>
              <div className="text-primary font-bold text-xl">
                {fmt(monthlyPrice.unit_amount, monthlyPrice.currency)}
              </div>
              <div className="text-xs text-primary/40 mt-0.5">30 days of Pro access</div>
            </button>
          )}
        </div>

        {/* Quantity selector */}
        <div className="mb-6">
          <label className="text-[10px] tracking-[0.25em] text-primary/50 block mb-2">
            HOW MANY GIFTS?
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="border border-primary/30 hover:border-primary text-primary w-10 h-10 text-lg font-bold transition-colors"
            >
              −
            </button>
            <span className="text-primary font-bold text-2xl w-12 text-center tracking-widest">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              className="border border-primary/30 hover:border-primary text-primary w-10 h-10 text-lg font-bold transition-colors"
            >
              +
            </button>
            {activePrice && (
              <span className="text-xs text-primary/40 ml-2">
                = {fmt(activePrice.unit_amount * quantity, activePrice.currency)} total
              </span>
            )}
          </div>
          <p className="text-[10px] text-primary/30 mt-2 tracking-wide">
            You'll get {quantity} separate redemption {quantity === 1 ? "link" : "links"} after checkout — share each one with a different person.
          </p>
        </div>

        <button
          disabled={loading || !activePrice || !weeklyPrice}
          onClick={handleGift}
          className="w-full py-3 text-xs tracking-widest font-bold border border-primary bg-primary text-background hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-6"
        >
          {loading
            ? "[REDIRECTING TO STRIPE...]"
            : activePrice
            ? `[ BUY ${quantity} ${selected === "week" ? "WEEKLY" : "MONTHLY"} GIFT${quantity > 1 ? "S" : ""} — ${fmt(activePrice.unit_amount * quantity, activePrice.currency)} ]`
            : "[LOADING...]"}
        </button>

        <div className="border border-primary/10 p-4 text-[10px] text-primary/30 tracking-wide space-y-1.5">
          <div>▸ One-time payment — you are not charged again</div>
          <div>▸ Each recipient gets their own link to activate within 90 days</div>
          <div>▸ They can use an existing account or create a new one</div>
          <div>▸ Secured by Stripe · No refunds after redemption</div>
        </div>
      </div>
    </div>
  );
}
