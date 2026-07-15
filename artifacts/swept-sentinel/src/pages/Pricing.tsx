import { useState } from "react";
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
  metadata: Record<string, string> | null;
  prices: Price[];
}

function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function PlanCard({ plan, onCheckout, loading }: { plan: Plan; onCheckout: (priceId: string) => void; loading: string | null }) {
  const [interval, setInterval] = useState<"month" | "year">("month");
  const monthly = plan.prices.find(p => p.recurring?.interval === "month");
  const yearly = plan.prices.find(p => p.recurring?.interval === "year");
  const price = interval === "month" ? monthly : (yearly ?? monthly);
  const isEnterprise = plan.name.toLowerCase().includes("enterprise");

  return (
    <div className={`border font-mono flex flex-col p-6 gap-4 ${isEnterprise ? "border-primary bg-primary/5" : "border-primary/30 bg-card"}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs text-primary/50 tracking-widest mb-1">
            [{isEnterprise ? "ENTERPRISE" : "PRO"}]
          </div>
          <div className="text-primary font-bold text-lg tracking-wide">{plan.name.replace("Swept Sentinel ", "")}</div>
        </div>
        {isEnterprise && (
          <span className="text-[10px] border border-primary text-primary px-2 py-0.5 tracking-widest">RECOMMENDED</span>
        )}
      </div>

      <p className="text-xs text-primary/60 leading-relaxed">{plan.description}</p>

      {monthly && yearly && (
        <div className="flex gap-2 text-[11px]">
          <button
            onClick={() => setInterval("month")}
            className={`px-3 py-1 border tracking-widest transition-colors ${interval === "month" ? "border-primary bg-primary text-background" : "border-primary/30 text-primary/50 hover:border-primary/60"}`}
          >
            MONTHLY
          </button>
          <button
            onClick={() => setInterval("year")}
            className={`px-3 py-1 border tracking-widest transition-colors ${interval === "year" ? "border-primary bg-primary text-background" : "border-primary/30 text-primary/50 hover:border-primary/60"}`}
          >
            YEARLY <span className="text-primary/40 ml-1">SAVE ~30%</span>
          </button>
        </div>
      )}

      {price && (
        <div className="text-primary">
          <span className="text-3xl font-bold">{formatAmount(price.unit_amount, price.currency)}</span>
          <span className="text-primary/50 text-xs ml-1">/{price.recurring?.interval ?? "one-time"}</span>
        </div>
      )}

      <ul className="text-xs text-primary/70 space-y-1.5">
        <li className="flex gap-2"><span className="text-primary">▸</span> All 141 real OSINT modules</li>
        <li className="flex gap-2"><span className="text-primary">▸</span> Unlimited module runs</li>
        <li className="flex gap-2"><span className="text-primary">▸</span> VirusTotal, AbuseIPDB, OTX threat intel</li>
        <li className="flex gap-2"><span className="text-primary">▸</span> FCC callsign & DMR radio lookup</li>
        <li className="flex gap-2"><span className="text-primary">▸</span> Breach & leak intelligence</li>
        {isEnterprise && <>
          <li className="flex gap-2"><span className="text-primary">▸</span> REST API access</li>
          <li className="flex gap-2"><span className="text-primary">▸</span> Team accounts</li>
          <li className="flex gap-2"><span className="text-primary">▸</span> Priority support</li>
        </>}
      </ul>

      <button
        disabled={!price || loading === price.id}
        onClick={() => price && onCheckout(price.id)}
        className="mt-auto w-full py-2.5 text-xs tracking-widest font-bold border border-primary bg-primary text-background hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading === price?.id ? "[REDIRECTING...]" : `[SUBSCRIBE ${interval === "year" ? "YEARLY" : "MONTHLY"}]`}
      </button>
    </div>
  );
}

export default function Pricing() {
  const [, navigate] = useLocation();
  const { data: user } = useAuthMe();
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  if (!fetched) {
    setFetched(true);
    fetch(`${BASE}/api/stripe/plans`)
      .then(r => r.json())
      .then((d: { plans?: Plan[]; error?: string }) => {
        if (d.error) setError(d.error);
        else setPlans(d.plans ?? []);
      })
      .catch(() => setError("Failed to load plans"));
  }

  async function handleCheckout(priceId: string) {
    if (!user) { navigate("/login"); return; }
    setLoading(priceId);
    try {
      const res = await fetch(`${BASE}/api/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
      else setError(data.error ?? "Checkout failed");
    } catch {
      setError("Network error during checkout");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-background text-primary font-mono p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="text-xs text-primary/40 hover:text-primary/70 tracking-widest mb-8 block transition-colors"
        >
          ← BACK TO DASHBOARD
        </button>

        <div className="mb-10 text-center">
          <div className="text-xs text-primary/40 tracking-widest mb-2">SWEPT SENTINEL // SUBSCRIPTION TIERS</div>
          <h1 className="text-2xl font-bold tracking-wide mb-2">OPERATOR LICENSING</h1>
          <p className="text-xs text-primary/50 max-w-md mx-auto leading-relaxed">
            Select your clearance level. All plans include access to 141 real-data OSINT modules
            with live threat intelligence feeds.
          </p>
        </div>

        <div className="mb-8 border border-primary/20 p-4 text-xs text-primary/50 tracking-wide">
          <span className="text-primary font-bold">FREE TIER: </span>
          Basic access — 10 module runs per day, core network and recon modules only.
          Upgrade to unlock the full intelligence suite.
        </div>

        {error && (
          <div className="border border-red-500/50 bg-red-500/10 p-4 text-xs text-red-400 mb-6 tracking-wide">
            [ERROR] {error}
            {error.includes("not connected") && (
              <p className="mt-2 text-red-400/70">Stripe integration is not yet connected. Contact the operator.</p>
            )}
          </div>
        )}

        {plans === null && !error && (
          <div className="text-center text-primary/40 text-xs tracking-widest animate-pulse py-12">
            [LOADING PLANS...]
          </div>
        )}

        {plans && plans.length === 0 && (
          <div className="text-center text-primary/40 text-xs tracking-widest py-12">
            [NO PLANS CONFIGURED — ADMIN MUST RUN SEED SCRIPT]
          </div>
        )}

        {plans && plans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map(plan => (
              <PlanCard key={plan.id} plan={plan} onCheckout={handleCheckout} loading={loading} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center text-xs text-primary/30 tracking-wide">
          Secured by Stripe · Cancel anytime · No hidden fees
        </div>
      </div>
    </div>
  );
}
