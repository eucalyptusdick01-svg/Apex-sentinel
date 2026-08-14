import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthMe } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface Price {
  id: string;
  unit_amount: number;
  currency: string;
  recurring: { interval: string } | null;
}

interface Plan {
  id: string;
  name: string;
  description: string | null;
  prices: Price[];
}

function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

const FEATURES = [
  "All 238 real OSINT modules",
  "Unlimited module runs",
  "VirusTotal, AbuseIPDB & OTX threat intel",
  "Subdomain scan, cert history & Shodan probe",
  "Breach & leak intelligence via AlienVault OTX",
  "FCC callsign & DMR radio lookup",
  "SSL/TLS cert analysis",
  "Web scraper & fingerprinting",
  "Cryptographic tools suite",
];

export default function Pricing() {
  const [, navigate] = useLocation();
  const { data: user } = useAuthMe();
  const [weeklyPrice, setWeeklyPrice] = useState<Price | null>(null);
  const [monthlyPrice, setMonthlyPrice] = useState<Price | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${BASE}/api/stripe/plans`)
      .then((r) => r.json())
      .then((d: { plans?: Plan[]; error?: string }) => {
        if (d.error) { setError(d.error); return; }
        const proPlan = (d.plans ?? []).find(
          (p) => !p.name.toLowerCase().includes("enterprise"),
        );
        if (!proPlan) { setError("No plans found."); return; }
        setWeeklyPrice(proPlan.prices.find((p) => p.recurring?.interval === "week") ?? null);
        setMonthlyPrice(proPlan.prices.find((p) => p.recurring?.interval === "month") ?? null);
      })
      .catch(() => setError("Failed to load plans. Please try again."));
  }, []);

  async function handleCheckout(price: Price) {
    if (!user) {
      const interval = price.recurring?.interval === "week" ? "weekly" : "monthly";
      navigate(`/register?plan=${interval}`);
      return;
    }
    setLoading(price.id);
    try {
      const res = await fetch(`${BASE}/api/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ priceId: price.id }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Checkout failed. Please try again.");
        setLoading(null);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(null);
    }
  }

  const plansReady = weeklyPrice || monthlyPrice;

  return (
    <div className="min-h-screen bg-background text-primary font-mono p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-xs text-primary/40 hover:text-primary/70 tracking-widest mb-10 block transition-colors"
        >
          ← BACK TO DASHBOARD
        </button>

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="text-[10px] text-primary/40 tracking-[0.3em] mb-3">
            SWEPT SENTINEL // OPERATOR LICENSING
          </div>
          <h1 className="text-3xl font-bold tracking-[0.15em] mb-3">
            GO PRO
          </h1>
          <p className="text-xs text-primary/50 max-w-md mx-auto leading-relaxed">
            Unlock all{" "}
            <span className="text-primary font-bold">238 real-data modules</span>{" "}
            with live threat intelligence, full recon suite, and cryptographic tools.
            Cancel anytime.
          </p>
        </div>

        {error && (
          <div className="border border-red-500/50 bg-red-500/10 p-4 text-xs text-red-400 mb-8 tracking-wide">
            [ERROR] {error}
          </div>
        )}

        {!plansReady && !error && (
          <div className="text-center text-primary/40 text-xs tracking-widest animate-pulse py-16">
            [LOADING PLANS...]
          </div>
        )}

        {plansReady && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
            {/* Weekly card */}
            {weeklyPrice && (
              <div className="border border-primary/30 bg-card p-6 flex flex-col gap-5">
                <div>
                  <div className="text-[10px] text-primary/40 tracking-[0.25em] mb-1">[WEEKLY]</div>
                  <div className="text-primary font-bold text-2xl tracking-wide">
                    {formatAmount(weeklyPrice.unit_amount, weeklyPrice.currency)}
                    <span className="text-primary/40 text-sm font-normal ml-1">/ week</span>
                  </div>
                  <p className="text-xs text-primary/50 mt-1">
                    Lowest commitment — pay as you go.
                  </p>
                </div>

                <ul className="text-xs text-primary/70 space-y-1.5 flex-1">
                  {FEATURES.map((f) => (
                    <li key={f} className="flex gap-2 items-start">
                      <span className="text-primary/50 shrink-0 mt-px">▸</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  disabled={loading === weeklyPrice.id}
                  onClick={() => handleCheckout(weeklyPrice)}
                  className="w-full py-3 text-xs tracking-widest font-bold border border-primary/50 text-primary hover:bg-primary/10 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading === weeklyPrice.id
                    ? "[REDIRECTING TO STRIPE...]"
                    : "[ GET WEEKLY ACCESS ]"}
                </button>
              </div>
            )}

            {/* Monthly card */}
            {monthlyPrice && (
              <div className="border border-primary bg-primary/5 p-6 flex flex-col gap-5 relative shadow-[0_0_30px_rgba(0,204,255,0.07)]">
                <div className="absolute -top-px left-6 right-6 h-px bg-primary/60" />
                <div className="absolute top-3 right-4 text-[10px] border border-primary text-primary px-2 py-0.5 tracking-widest">
                  BEST VALUE
                </div>

                <div>
                  <div className="text-[10px] text-primary/40 tracking-[0.25em] mb-1">[MONTHLY]</div>
                  <div className="text-primary font-bold text-2xl tracking-wide">
                    {formatAmount(monthlyPrice.unit_amount, monthlyPrice.currency)}
                    <span className="text-primary/40 text-sm font-normal ml-1">/ month</span>
                  </div>
                  <p className="text-xs text-primary/50 mt-1">
                    Save ~23% vs weekly — billed once a month.
                  </p>
                </div>

                <ul className="text-xs text-primary/70 space-y-1.5 flex-1">
                  {FEATURES.map((f) => (
                    <li key={f} className="flex gap-2 items-start">
                      <span className="text-primary shrink-0 mt-px">▸</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  disabled={loading === monthlyPrice.id}
                  onClick={() => handleCheckout(monthlyPrice)}
                  className="w-full py-3 text-xs tracking-widest font-bold border border-primary bg-primary text-background hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading === monthlyPrice.id
                    ? "[REDIRECTING TO STRIPE...]"
                    : "[ GET MONTHLY ACCESS ]"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Gift section */}
        {plansReady && (
          <div className="border border-primary/20 p-5 mb-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1">
              <div className="text-[10px] text-primary/40 tracking-[0.25em] mb-1">🎁 GIVE AS A GIFT</div>
              <p className="text-xs text-primary/60 leading-relaxed">
                Buy a week or month of Pro access for a friend or colleague. They get a link to activate whenever they're ready.
              </p>
            </div>
            <button
              onClick={() => navigate("/gift")}
              className="shrink-0 border border-primary/40 text-primary/70 hover:border-primary hover:text-primary px-5 py-2.5 text-xs tracking-widest transition-colors"
            >
              [ GIFT ACCESS ]
            </button>
          </div>
        )}

        {/* Direct links callout */}
        {plansReady && (
          <div className="border border-primary/10 p-5 text-xs text-primary/40 tracking-wide space-y-2 mb-8">
            <div className="text-primary/30 tracking-widest mb-3">DIRECT PURCHASE LINKS</div>
            <div className="flex flex-col sm:flex-row gap-3">
              {weeklyPrice && (
                <button
                  onClick={() => navigate("/buy/weekly")}
                  className="flex-1 border border-primary/20 text-primary/50 hover:border-primary/50 hover:text-primary/80 py-2 px-3 tracking-widest transition-colors text-[11px]"
                >
                  /buy/weekly → $5.99/wk
                </button>
              )}
              {monthlyPrice && (
                <button
                  onClick={() => navigate("/buy/monthly")}
                  className="flex-1 border border-primary/20 text-primary/50 hover:border-primary/50 hover:text-primary/80 py-2 px-3 tracking-widest transition-colors text-[11px]"
                >
                  /buy/monthly → $19.99/mo
                </button>
              )}
            </div>
            <p className="text-primary/25 text-[10px] mt-2">
              Share these links anywhere — they skip straight to checkout.
            </p>
          </div>
        )}

        {/* Free tier note */}
        <div className="mb-8 border border-primary/10 p-4 text-xs text-primary/40 tracking-wide">
          <span className="text-primary/60 font-bold">FREE TIER: </span>
          Basic access — limited module runs per day, core network and recon modules only.
          {!user && (
            <button
              onClick={() => navigate("/register")}
              className="ml-2 text-primary/50 hover:text-primary underline transition-colors"
            >
              Register free →
            </button>
          )}
        </div>

        <div className="text-center text-xs text-primary/25 tracking-wide">
          Secured by Stripe · Cancel anytime · No hidden fees
        </div>
      </div>
    </div>
  );
}
