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

const PRO_FEATURES = [
  "All 173 real OSINT modules",
  "Unlimited module runs",
  "VirusTotal, AbuseIPDB & OTX threat intel",
  "FCC callsign & DMR radio lookup",
  "Breach & leak intelligence via AlienVault OTX",
  "Subdomain scan, cert history, Shodan probe",
];

const ENTERPRISE_EXTRAS = [
  "REST API access",
  "Team accounts",
  "Priority support",
  "SLA guarantee",
];

function PlanCard({
  plan,
  onCheckout,
  loading,
}: {
  plan: Plan;
  onCheckout: (priceId: string) => void;
  loading: string | null;
}) {
  const [interval, setInterval] = useState<"month" | "year">("month");
  const monthly = plan.prices.find((p) => p.recurring?.interval === "month");
  const yearly = plan.prices.find((p) => p.recurring?.interval === "year");
  const price = interval === "month" ? monthly : (yearly ?? monthly);
  const isEnterprise = plan.name.toLowerCase().includes("enterprise");
  const tierLabel = isEnterprise ? "ENTERPRISE" : "PRO";
  const features = isEnterprise
    ? [...PRO_FEATURES, ...ENTERPRISE_EXTRAS]
    : PRO_FEATURES;

  const yearlySavings =
    monthly && yearly
      ? Math.round(
          (1 - yearly.unit_amount / 12 / monthly.unit_amount) * 100,
        )
      : null;

  return (
    <div
      className={`border font-mono flex flex-col p-6 gap-5 relative ${
        isEnterprise
          ? "border-primary bg-primary/5 shadow-[0_0_30px_rgba(0,204,255,0.07)]"
          : "border-primary/30 bg-card"
      }`}
    >
      {isEnterprise && (
        <div className="absolute -top-px left-6 right-6 h-px bg-primary/60" />
      )}

      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] text-primary/40 tracking-[0.25em] mb-1">
            [{tierLabel}]
          </div>
          <div className="text-primary font-bold text-xl tracking-wide">
            {plan.name.replace("Swept Sentinel ", "")}
          </div>
        </div>
        {isEnterprise && (
          <span className="text-[10px] border border-primary text-primary px-2 py-0.5 tracking-widest shrink-0">
            RECOMMENDED
          </span>
        )}
      </div>

      <p className="text-xs text-primary/60 leading-relaxed">
        {plan.description}
      </p>

      {monthly && yearly && (
        <div className="flex gap-2 text-[11px]">
          <button
            onClick={() => setInterval("month")}
            className={`px-3 py-1 border tracking-widest transition-colors ${
              interval === "month"
                ? "border-primary bg-primary text-background"
                : "border-primary/30 text-primary/50 hover:border-primary/60"
            }`}
          >
            MONTHLY
          </button>
          <button
            onClick={() => setInterval("year")}
            className={`px-3 py-1 border tracking-widest transition-colors flex items-center gap-2 ${
              interval === "year"
                ? "border-primary bg-primary text-background"
                : "border-primary/30 text-primary/50 hover:border-primary/60"
            }`}
          >
            YEARLY
            {yearlySavings && (
              <span
                className={
                  interval === "year" ? "opacity-70" : "text-primary/40"
                }
              >
                SAVE {yearlySavings}%
              </span>
            )}
          </button>
        </div>
      )}

      {price ? (
        <div className="text-primary">
          <span className="text-4xl font-bold">
            {formatAmount(price.unit_amount, price.currency)}
          </span>
          <span className="text-primary/50 text-xs ml-1.5">
            /{price.recurring?.interval ?? "one-time"}
          </span>
          {interval === "year" && monthly && yearly && (
            <div className="text-[11px] text-primary/40 mt-1 tracking-wide">
              {formatAmount(yearly.unit_amount / 12, yearly.currency)}/mo billed
              annually
            </div>
          )}
        </div>
      ) : null}

      <ul className="text-xs text-primary/70 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex gap-2 items-start">
            <span className="text-primary mt-px shrink-0">▸</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        disabled={!price || loading === price.id}
        onClick={() => price && onCheckout(price.id)}
        className="mt-auto w-full py-3 text-xs tracking-widest font-bold border border-primary bg-primary text-background hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading === price?.id
          ? "[REDIRECTING TO STRIPE...]"
          : `[SUBSCRIBE — ${interval === "year" ? "YEARLY" : "MONTHLY"}]`}
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

  useEffect(() => {
    fetch(`${BASE}/api/stripe/plans`)
      .then((r) => r.json())
      .then((d: { plans?: Plan[]; error?: string }) => {
        if (d.error) setError(d.error);
        else setPlans(d.plans ?? []);
      })
      .catch(() => setError("Failed to load plans. Please try again."));
  }, []);

  async function handleCheckout(priceId: string) {
    if (!user) {
      navigate("/login");
      return;
    }
    setLoading(priceId);
    try {
      const res = await fetch(`${BASE}/api/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ priceId }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Checkout failed. Please try again.");
      }
    } catch {
      setError("Network error during checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-background text-primary font-mono p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="text-xs text-primary/40 hover:text-primary/70 tracking-widest mb-10 block transition-colors"
        >
          ← BACK TO DASHBOARD
        </button>

        {/* Header */}
        <div className="mb-12 text-center">
          <div className="text-[10px] text-primary/40 tracking-[0.3em] mb-3">
            SWEPT SENTINEL // SUBSCRIPTION TIERS
          </div>
          <h1 className="text-3xl font-bold tracking-[0.15em] mb-3">
            OPERATOR LICENSING
          </h1>
          <p className="text-xs text-primary/50 max-w-lg mx-auto leading-relaxed">
            Select your clearance level. All paid plans unlock{" "}
            <span className="text-primary font-bold">173 real-data modules</span>{" "}
            with live threat intelligence, full recon suite, and cryptographic tools.
          </p>
        </div>

        {/* Free tier callout */}
        <div className="mb-8 border border-primary/20 p-4 text-xs text-primary/50 tracking-wide flex flex-col sm:flex-row sm:items-center gap-2">
          <div>
            <span className="text-primary font-bold">FREE TIER: </span>
            Basic access — limited module runs per day, core network and recon
            modules only.
          </div>
          <div className="sm:ml-auto text-primary/30 shrink-0">
            Upgrade to unlock the full 173-module intelligence suite.
          </div>
        </div>

        {error && (
          <div className="border border-red-500/50 bg-red-500/10 p-4 text-xs text-red-400 mb-8 tracking-wide">
            [ERROR] {error}
          </div>
        )}

        {plans === null && !error && (
          <div className="text-center text-primary/40 text-xs tracking-widest animate-pulse py-16">
            [LOADING PLANS...]
          </div>
        )}

        {plans && plans.length === 0 && (
          <div className="text-center text-primary/40 text-xs tracking-widest py-16 border border-primary/10">
            [NO PLANS CONFIGURED]
          </div>
        )}

        {plans && plans.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onCheckout={handleCheckout}
                loading={loading}
              />
            ))}
          </div>
        )}

        {/* Feature comparison strip */}
        {plans && plans.length > 0 && (
          <div className="mt-10 border border-primary/10 p-6 text-xs text-primary/50 space-y-2">
            <div className="text-primary/30 tracking-widest mb-4">
              ALL PLANS INCLUDE
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {[
                "173 OSINT modules",
                "Live streaming output",
                "SSL / TLS cert analysis",
                "DNS & WHOIS lookup",
                "Port & vulnerability scanning",
                "Cryptographic tools suite",
                "Web scraper & fingerprinting",
                "Wayback Machine integration",
                "SerpAPI search modules",
              ].map((f) => (
                <div key={f} className="flex gap-2">
                  <span className="text-primary/40">·</span> {f}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-primary/30 tracking-wide">
          Secured by Stripe · Cancel anytime · No hidden fees
        </div>
      </div>
    </div>
  );
}
