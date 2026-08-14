import { useState, useEffect } from "react";
import { useAuthRegister, getAuthMeQueryKey } from "@workspace/api-client-react";
import { useLocation, useSearch } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";

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

function intervalLabel(interval: string) {
  switch (interval) {
    case "week": return "/ week";
    case "month": return "/ month";
    case "year": return "/ year";
    default: return `/ ${interval}`;
  }
}

const INTERVAL_ORDER = ["week", "month", "year"];

export default function Register() {
  const [step, setStep] = useState<"plan" | "credentials">("plan");
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [plansError, setPlansError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [, navigate] = useLocation();
  const search = useSearch();
  const queryClient = useQueryClient();
  const register = useAuthRegister();

  useEffect(() => {
    fetch(`${BASE}/api/stripe/plans`)
      .then((r) => r.json())
      .then((d: { plans?: Plan[]; error?: string }) => {
        if (d.error) setPlansError(d.error);
        else setPlans(d.plans ?? []);
      })
      .catch(() => setPlansError("Could not load plans."));
  }, []);

  const handlePlanContinue = () => {
    setStep("credentials");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return;
    register.mutate(
      { data: { email, password } },
      {
        onSuccess: (user) => {
          queryClient.setQueryData(getAuthMeQueryKey(), user);
          const redirectTo = new URLSearchParams(search).get("redirect");
          if (redirectTo) {
            navigate(redirectTo);
          } else if (selectedPriceId) {
            // Redirect to checkout for the selected plan
            fetch(`${BASE}/api/stripe/checkout`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ priceId: selectedPriceId }),
            })
              .then((r) => r.json())
              .then((data: { url?: string }) => {
                if (data.url) window.location.href = data.url;
                else navigate("/dashboard");
              })
              .catch(() => navigate("/dashboard"));
          } else {
            navigate("/dashboard");
          }
        },
      },
    );
  };

  const mismatch = confirm.length > 0 && password !== confirm;

  // Flatten prices — Pro only, week + month only, sorted by interval order
  const allPrices: Array<{ price: Price; plan: Plan }> = [];
  if (plans) {
    for (const plan of plans) {
      if (plan.name.toLowerCase().includes("enterprise")) continue;
      const sorted = [...plan.prices]
        .filter((p) => p.recurring?.interval === "week" || p.recurring?.interval === "month")
        .sort(
          (a, b) =>
            INTERVAL_ORDER.indexOf(a.recurring?.interval ?? "") -
            INTERVAL_ORDER.indexOf(b.recurring?.interval ?? ""),
        );
      for (const price of sorted) {
        allPrices.push({ price, plan });
      }
    }
  }

  // Pre-select based on ?plan=weekly or ?plan=monthly query param
  useEffect(() => {
    if (!plans || allPrices.length === 0) return;
    const params = new URLSearchParams(search);
    const planParam = params.get("plan");
    if (!planParam) return;
    const targetInterval = planParam === "weekly" ? "week" : planParam === "monthly" ? "month" : null;
    if (!targetInterval) return;
    const match = allPrices.find(({ price }) => price.recurring?.interval === targetInterval);
    if (match) {
      setSelectedPriceId(match.price.id);
      setStep("credentials");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans]);

  if (step === "plan") {
    return (
      <div className="flex flex-col min-h-screen w-full bg-background text-foreground font-mono items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          <div className="border border-primary/30 bg-card shadow-[0_0_30px_rgba(0,204,255,0.08)] p-6">
            <h1 className="text-xl font-bold tracking-[0.15em] text-primary drop-shadow-[0_0_8px_rgba(0,204,255,0.5)] uppercase mb-1">
              S W E P T - S E N T I N E L
            </h1>
            <p className="text-xs text-muted-foreground tracking-widest mb-6">SELECT YOUR PLAN — STEP 1 OF 2</p>

            {plansError && (
              <div className="text-xs text-red-400 border border-red-500/30 bg-red-950/20 px-3 py-2 mb-4">
                [WARN] Could not load plans — you can still register for free below.
              </div>
            )}

            {plans === null && !plansError && (
              <div className="text-xs text-primary/40 tracking-widest animate-pulse py-6 text-center">
                [LOADING PLANS...]
              </div>
            )}

            {(plans !== null || plansError) && (
              <div className="flex flex-col gap-3">
                {/* Free option */}
                <button
                  type="button"
                  onClick={() => setSelectedPriceId(null)}
                  className={`w-full text-left border px-4 py-3 transition-colors ${
                    selectedPriceId === null
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-primary/20 text-primary/60 hover:border-primary/40 hover:text-primary/80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs tracking-widest font-bold">FREE</span>
                      <p className="text-[11px] text-primary/50 mt-0.5">
                        Limited module runs per day — core network &amp; recon modules only.
                      </p>
                    </div>
                    <div className="text-lg font-bold ml-4">$0</div>
                  </div>
                  {selectedPriceId === null && (
                    <div className="text-[10px] text-primary/40 mt-1 tracking-wider">▸ SELECTED</div>
                  )}
                </button>

                {/* Paid plan price options */}
                {allPrices.map(({ price, plan }) => (
                  <button
                    key={price.id}
                    type="button"
                    onClick={() => setSelectedPriceId(price.id)}
                    className={`w-full text-left border px-4 py-3 transition-colors ${
                      selectedPriceId === price.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-primary/20 text-primary/60 hover:border-primary/40 hover:text-primary/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs tracking-widest font-bold">
                          {plan.name.replace("Swept Sentinel ", "").toUpperCase()} —{" "}
                          {price.recurring?.interval?.toUpperCase() ?? "ONE-TIME"}
                        </span>
                        <p className="text-[11px] text-primary/50 mt-0.5">
                          {plan.description ?? "All 173 real OSINT modules, unlimited runs."}
                        </p>
                      </div>
                      <div className="text-right ml-4 shrink-0">
                        <span className="text-lg font-bold">
                          {formatAmount(price.unit_amount, price.currency)}
                        </span>
                        <span className="text-xs text-primary/50 ml-1">
                          {price.recurring ? intervalLabel(price.recurring.interval) : ""}
                        </span>
                      </div>
                    </div>
                    {selectedPriceId === price.id && (
                      <div className="text-[10px] text-primary/40 mt-1 tracking-wider">▸ SELECTED</div>
                    )}
                  </button>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handlePlanContinue}
              disabled={plans === null && !plansError}
              className="mt-6 w-full h-10 bg-primary/10 border border-primary/50 text-primary text-sm tracking-widest hover:bg-primary/20 hover:border-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              [ CONTINUE → CREATE ACCOUNT ]
            </button>

            <div className="mt-4 pt-4 border-t border-border text-center">
              <span className="text-xs text-muted-foreground tracking-wider">HAVE AN ACCOUNT? </span>
              <button
                onClick={() => navigate("/login")}
                className="text-xs text-primary hover:underline tracking-wider"
              >
                AUTHENTICATE
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: credentials
  return (
    <div className="flex flex-col min-h-screen w-full bg-background text-foreground font-mono items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="border border-primary/30 bg-card p-6 shadow-[0_0_30px_rgba(0,204,255,0.1)]">
          <h1 className="text-xl font-bold tracking-[0.15em] text-primary drop-shadow-[0_0_8px_rgba(0,204,255,0.5)] uppercase mb-1">
            S W E P T - S E N T I N E L
          </h1>
          <p className="text-xs text-muted-foreground tracking-widest mb-1">REGISTER NEW OPERATOR — STEP 2 OF 2</p>

          {/* Plan summary pill */}
          <div className="mb-5 mt-2 border border-primary/20 bg-primary/5 px-3 py-2 flex items-center justify-between text-xs">
            <span className="text-primary/50 tracking-wider">
              {selectedPriceId
                ? (() => {
                    const found = allPrices.find(({ price }) => price.id === selectedPriceId);
                    if (!found) return "SELECTED PLAN";
                    const { price, plan } = found;
                    return `${plan.name.replace("Swept Sentinel ", "").toUpperCase()} — ${formatAmount(price.unit_amount, price.currency)}${price.recurring ? ` ${intervalLabel(price.recurring.interval)}` : ""}`;
                  })()
                : "FREE PLAN"}
            </span>
            <button
              type="button"
              onClick={() => setStep("plan")}
              className="text-primary/40 hover:text-primary tracking-widest transition-colors"
            >
              CHANGE
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-primary tracking-widest">[EMAIL] &gt;</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-primary/30 text-foreground font-mono rounded-none h-10 text-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
                placeholder="operator@domain.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-primary tracking-widest">[PASSWORD] &gt;</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-primary/30 text-foreground font-mono rounded-none h-10 text-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
                placeholder="min. 8 characters"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-primary tracking-widest">[CONFIRM PASSWORD] &gt;</label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={`bg-background border-primary/30 text-foreground font-mono rounded-none h-10 text-sm focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary ${mismatch ? "border-red-500/50" : ""}`}
                placeholder="repeat password"
                autoComplete="new-password"
                required
              />
              {mismatch && (
                <span className="text-xs text-red-400 tracking-wider">[WARN] Passwords do not match</span>
              )}
            </div>

            {register.error && (
              <div className="text-xs text-red-400 tracking-wider border border-red-500/30 bg-red-950/20 px-3 py-2">
                [ERROR] {(register.error as { error?: string })?.error ?? "Registration failed"}
              </div>
            )}

            <button
              type="submit"
              disabled={register.isPending || mismatch}
              className="mt-2 h-10 bg-primary/10 border border-primary/50 text-primary text-sm tracking-widest hover:bg-primary/20 hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {register.isPending
                ? selectedPriceId
                  ? "CREATING ACCOUNT..."
                  : "REGISTERING..."
                : selectedPriceId
                  ? "[ CREATE ACCOUNT & SUBSCRIBE ]"
                  : "[ CREATE FREE ACCOUNT ]"}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-border text-center">
            <span className="text-xs text-muted-foreground tracking-wider">HAVE AN ACCOUNT? </span>
            <button
              onClick={() => navigate("/login")}
              className="text-xs text-primary hover:underline tracking-wider"
            >
              AUTHENTICATE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
