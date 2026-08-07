import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthMe } from "@workspace/api-client-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const MODULES = [
  "IP Reputation & Geolocation",
  "DNS & WHOIS Lookup",
  "Subdomain Enumeration",
  "Port & Vulnerability Scan",
  "VirusTotal Threat Intel",
  "AbuseIPDB Check",
  "AlienVault OTX Feed",
  "Shodan Host Probe",
  "SSL/TLS Certificate Analysis",
  "Breach & Leak Intelligence",
  "Web Scraper & Fingerprinting",
  "Cryptographic Tools Suite",
];

export default function Landing() {
  const [, navigate] = useLocation();
  const { data: user, isLoading } = useAuthMe();

  // Logged-in users go straight to the dashboard
  useEffect(() => {
    if (!isLoading && user) navigate("/dashboard");
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-primary/40 font-mono text-xs tracking-widest animate-pulse">
        [INITIALIZING...]
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-primary/10">
        <span className="text-primary font-bold tracking-[0.2em] text-sm drop-shadow-[0_0_8px_rgba(0,204,255,0.4)]">
          SWEPT-SENTINEL
        </span>
        <div className="flex gap-4 text-xs tracking-widest">
          <button
            onClick={() => navigate("/pricing")}
            className="text-primary/50 hover:text-primary transition-colors"
          >
            PRICING
          </button>
          <button
            onClick={() => navigate("/login")}
            className="text-primary/50 hover:text-primary transition-colors"
          >
            LOGIN
          </button>
          <button
            onClick={() => navigate("/register")}
            className="border border-primary/50 text-primary px-3 py-1 hover:bg-primary/10 transition-colors"
          >
            GET STARTED
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="text-[10px] text-primary/40 tracking-[0.4em] mb-4">
          OSINT INTELLIGENCE PLATFORM
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-[0.1em] text-primary drop-shadow-[0_0_20px_rgba(0,204,255,0.3)] mb-6 leading-tight">
          FIND WHAT<br />OTHERS MISS
        </h1>
        <p className="text-sm text-primary/60 max-w-xl mx-auto leading-relaxed mb-10">
          173 real-data OSINT modules — IP intelligence, threat feeds, breach data,
          subdomain recon, and cryptographic tools — all in one terminal.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/buy/weekly")}
            className="px-8 py-3 bg-primary text-background text-sm font-bold tracking-widest hover:bg-primary/90 transition-colors"
          >
            START FOR $5.99 / WEEK
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-8 py-3 border border-primary/40 text-primary/70 text-sm tracking-widest hover:border-primary hover:text-primary transition-colors"
          >
            TRY FREE
          </button>
        </div>
        <p className="text-[11px] text-primary/30 mt-4 tracking-wide">
          No contract · Cancel anytime · Full access from day one
        </p>
      </section>

      {/* Module grid */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="text-[10px] text-primary/30 tracking-[0.3em] text-center mb-6">
          WHAT'S INSIDE
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {MODULES.map((m) => (
            <div
              key={m}
              className="border border-primary/10 px-3 py-2 text-xs text-primary/50 flex gap-2 items-center"
            >
              <span className="text-primary/30 shrink-0">▸</span>
              {m}
            </div>
          ))}
          <div className="border border-primary/10 px-3 py-2 text-xs text-primary/30 flex gap-2 items-center col-span-2 md:col-span-1">
            <span className="shrink-0">▸</span>
            +161 more modules
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="text-[10px] text-primary/30 tracking-[0.3em] text-center mb-6">
          SIMPLE PRICING
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Weekly */}
          <div className="border border-primary/20 p-6 flex flex-col gap-4">
            <div>
              <div className="text-[10px] text-primary/40 tracking-widest mb-1">[WEEKLY]</div>
              <div className="text-3xl font-bold text-primary">$5.99
                <span className="text-sm font-normal text-primary/40 ml-1">/ week</span>
              </div>
              <p className="text-xs text-primary/40 mt-1">Lowest commitment — pay as you go.</p>
            </div>
            <button
              onClick={() => navigate("/buy/weekly")}
              className="w-full py-2.5 border border-primary/50 text-primary text-xs tracking-widest hover:bg-primary/10 hover:border-primary transition-colors"
            >
              [ GET WEEKLY ACCESS ]
            </button>
          </div>

          {/* Monthly */}
          <div className="border border-primary bg-primary/5 p-6 flex flex-col gap-4 relative shadow-[0_0_20px_rgba(0,204,255,0.06)]">
            <div className="absolute -top-px left-6 right-6 h-px bg-primary/60" />
            <div className="absolute top-3 right-3 text-[10px] border border-primary text-primary px-2 py-0.5 tracking-widest">
              BEST VALUE
            </div>
            <div>
              <div className="text-[10px] text-primary/40 tracking-widest mb-1">[MONTHLY]</div>
              <div className="text-3xl font-bold text-primary">$19.99
                <span className="text-sm font-normal text-primary/40 ml-1">/ month</span>
              </div>
              <p className="text-xs text-primary/40 mt-1">Save ~23% vs weekly.</p>
            </div>
            <button
              onClick={() => navigate("/buy/monthly")}
              className="w-full py-2.5 bg-primary text-background text-xs font-bold tracking-widest hover:bg-primary/90 transition-colors"
            >
              [ GET MONTHLY ACCESS ]
            </button>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-primary/25 tracking-wide">
          Secured by Stripe · Free tier available ·{" "}
          <button onClick={() => navigate("/register")} className="underline hover:text-primary/50 transition-colors">
            Register free →
          </button>
        </div>
      </section>

      {/* About */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="text-[10px] text-primary/30 tracking-[0.3em] text-center mb-6">
          ABOUT
        </div>
        <div className="border border-primary/10 p-6 text-xs text-primary/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div className="flex-1 space-y-1">
              <div className="text-primary font-bold tracking-widest text-sm">ERIC MONROY JR</div>
              <div className="text-primary/40 tracking-wide">Application Developer · Graphic Design Artist</div>
              <p className="text-primary/40 leading-relaxed mt-3">
                Swept Sentinel is an independent OSINT intelligence platform built for
                investigators, researchers, and security professionals who need real data fast.
                Every module runs against live APIs — no simulated results, no guesswork.
              </p>
            </div>
            <div className="shrink-0 space-y-1 text-primary/40 text-[11px] tracking-wide border-t border-primary/10 pt-4 sm:border-t-0 sm:pt-0 sm:border-l sm:border-primary/10 sm:pl-6">
              <div className="text-primary/30 tracking-widest text-[10px] mb-2">CONTACT</div>
              <div>803 W Poplar St</div>
              <div>Stockton, CA 95202</div>
              <div className="mt-2">
                <a href="tel:+12093738518" className="hover:text-primary transition-colors">(209) 373-8518</a>
              </div>
              <div>
                <a href="https://sweptsentinel.com" className="hover:text-primary transition-colors">sweptsentinel.com</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/10 px-6 py-8 text-center space-y-2">
        <div className="text-[10px] text-primary/20 tracking-widest">
          © 2026 SWEPT SENTINEL · ERIC MONROY JR · ALL RIGHTS RESERVED
        </div>
        <div className="text-[10px] text-primary/20 tracking-wide space-x-3">
          <span>Payments secured by Stripe</span>
          <span>·</span>
          <a href="/privacy" className="hover:text-primary/40 transition-colors underline">Privacy Policy</a>
          <span>·</span>
          <a href="/terms" className="hover:text-primary/40 transition-colors underline">Terms of Service</a>
          <span>·</span>
          <a href="mailto:support@sweptsentinel.com" className="hover:text-primary/40 transition-colors underline">Contact</a>
        </div>
        <div className="text-[9px] text-primary/15 tracking-wide">
          Eric Monroy Jr · 803 W Poplar St, Stockton CA 95202 · (209) 373-8518
        </div>
      </footer>
    </div>
  );
}
