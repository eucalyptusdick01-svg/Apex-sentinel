import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
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
  prices: Price[];
}

function formatAmount(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export default function DirectBuy() {
  const { interval } = useParams<{ interval: string }>();
  const [, navigate] = useLocation();
  const { data: user, isLoading: userLoading } = useAuthMe();
  const [status, setStatus] = useState<"loading" | "redirecting" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [price, setPrice] = useState<Price | null>(null);

  const validInterval = interval === "weekly" ? "week" : interval === "monthly" ? "month" : null;

  useEffect(() => {
    if (!validInterval) {
      setStatus("error");
      setErrorMsg("Invalid plan. Use /buy/weekly or /buy/monthly.");
      return;
    }
    // Fetch plans to find the matching price
    fetch(`${BASE}/api/stripe/plans`)
      .then((r) => r.json())
      .then((d: { plans?: Plan[]; error?: string }) => {
        if (d.error) { setStatus("error"); setErrorMsg(d.error); return; }
        const plans = d.plans ?? [];
        // Find the Pro plan (not enterprise) with the matching interval
        const proPlan = plans.find(
          (p) => !p.name.toLowerCase().includes("enterprise"),
        );
        const matched = proPlan?.prices.find(
          (p) => p.recurring?.interval === validInterval,
        );
        if (!matched) {
          setStatus("error");
          setErrorMsg(`No ${interval} plan found. Please contact support.`);
          return;
        }
        setPrice(matched);
      })
      .catch(() => { setStatus("error"); setErrorMsg("Could not load plan details."); });
  }, [validInterval, interval]);

  // Once we have the price and know auth state, act
  useEffect(() => {
    if (!price || userLoading) return;

    if (!user) {
      // Not logged in — send to register with plan pre-selected
      navigate(`/register?plan=${interval}`);
      return;
    }

    // Logged in — trigger checkout immediately
    setStatus("redirecting");
    fetch(`${BASE}/api/stripe/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ priceId: price.id }),
    })
      .then((r) => r.json())
      .then((data: { url?: string; error?: string }) => {
        if (data.url) {
          window.location.href = data.url;
        } else {
          setStatus("error");
          setErrorMsg(data.error ?? "Checkout failed. Please try again.");
        }
      })
      .catch(() => { setStatus("error"); setErrorMsg("Network error. Please try again."); });
  }, [price, user, userLoading, interval, navigate]);

  const label = interval === "weekly"
    ? `$5.99 / week`
    : interval === "monthly"
    ? `$19.99 / month`
    : interval;

  return (
    <div className="flex flex-col min-h-screen w-full bg-background text-foreground font-mono items-center justify-center px-4">
      <div className="w-full max-w-sm border border-primary/30 bg-card p-8 shadow-[0_0_30px_rgba(0,204,255,0.08)] text-center">
        <h1 className="text-lg font-bold tracking-[0.15em] text-primary drop-shadow-[0_0_8px_rgba(0,204,255,0.5)] uppercase mb-2">
          S W E P T - S E N T I N E L
        </h1>
        <p className="text-xs text-primary/40 tracking-widest mb-8">PRO — {label?.toUpperCase()}</p>

        {status === "error" ? (
          <div className="space-y-4">
            <div className="border border-red-500/30 bg-red-950/20 px-4 py-3 text-xs text-red-400 tracking-wider">
              [ERROR] {errorMsg}
            </div>
            <button
              onClick={() => navigate("/pricing")}
              className="w-full h-10 border border-primary/40 text-primary/60 text-xs tracking-widest hover:border-primary hover:text-primary transition-colors"
            >
              [ VIEW PLANS ]
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-primary/40 text-xs tracking-widest animate-pulse">
              {status === "redirecting"
                ? "[REDIRECTING TO STRIPE...]"
                : "[INITIALIZING CHECKOUT...]"}
            </div>
            {price && (
              <div className="text-primary/60 text-xs tracking-wide mt-4">
                {formatAmount(price.unit_amount, price.currency)}{" "}
                <span className="text-primary/30">
                  / {price.recurring?.interval}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
