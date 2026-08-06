import { useLocation } from "wouter";

export default function CheckoutSuccess() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background text-primary font-mono flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-6">
        <div className="text-4xl text-primary animate-pulse">▸</div>
        <div className="text-xs text-primary/40 tracking-widest">[PAYMENT CONFIRMED]</div>
        <h1 className="text-xl font-bold tracking-wide">ACCESS GRANTED</h1>
        <p className="text-xs text-primary/60 leading-relaxed">
          Your subscription is now active. All modules unlocked. Welcome to the full intelligence suite, operator.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="text-xs border border-primary px-6 py-2.5 tracking-widest hover:bg-primary hover:text-background transition-colors"
        >
          [RETURN TO DASHBOARD]
        </button>
      </div>
    </div>
  );
}
