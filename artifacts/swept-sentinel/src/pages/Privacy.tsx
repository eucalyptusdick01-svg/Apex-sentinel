import { useLocation } from "wouter";

export default function Privacy() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground font-mono p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="text-xs text-primary/40 hover:text-primary/70 tracking-widest mb-10 block transition-colors"
        >
          ← BACK TO HOME
        </button>

        <div className="mb-10">
          <div className="text-[10px] text-primary/40 tracking-[0.3em] mb-2">SWEPT SENTINEL</div>
          <h1 className="text-2xl font-bold tracking-[0.1em] text-primary mb-2">PRIVACY POLICY</h1>
          <p className="text-xs text-primary/40 tracking-wide">Last updated: August 7, 2026</p>
        </div>

        <div className="space-y-8 text-sm text-primary/70 leading-relaxed">

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">1. INFORMATION WE COLLECT</h2>
            <p>When you register for Swept Sentinel, we collect your email address and a hashed version of your password. We do not store your password in plain text. When you subscribe to a paid plan, payment is processed by Stripe — we receive a customer ID and subscription status from Stripe but never store your full card number or banking details on our servers.</p>
            <p className="mt-2">When you use the platform, we log which modules you run and the results returned, in order to provide the service and troubleshoot issues.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">2. HOW WE USE YOUR INFORMATION</h2>
            <ul className="space-y-2">
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>To create and manage your account</li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>To process subscription payments via Stripe</li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>To provide access to OSINT intelligence modules</li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>To send transactional emails (receipts, password resets)</li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>To detect and prevent abuse or unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">3. DATA SHARING</h2>
            <p>We do not sell your personal data. We share data only with the following third parties as necessary to provide the service:</p>
            <ul className="space-y-2 mt-2">
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span><span><strong className="text-primary/90">Stripe</strong> — payment processing and subscription management</span></li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span><span><strong className="text-primary/90">VirusTotal, AbuseIPDB, AlienVault OTX</strong> — threat intelligence lookups initiated by you</span></li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span><span><strong className="text-primary/90">Replit</strong> — cloud hosting and infrastructure</span></li>
            </ul>
            <p className="mt-2">We may disclose information if required by law or to protect the rights and safety of our users.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">4. COOKIES & SESSION DATA</h2>
            <p>We use a session cookie to keep you logged in. This cookie is HTTP-only, secure, and expires when your session ends. We do not use tracking cookies or third-party advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">5. DATA RETENTION</h2>
            <p>We retain your account data for as long as your account is active. If you delete your account, we remove your personal data within 30 days, except where retention is required by law or to resolve disputes.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">6. YOUR RIGHTS</h2>
            <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us. You may also cancel your subscription at any time through the billing portal.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">7. SECURITY</h2>
            <p>We use industry-standard security practices including encrypted connections (HTTPS/TLS), hashed passwords, and HTTP-only session cookies. No method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">8. CONTACT</h2>
            <p>For privacy-related requests or questions, contact:</p>
            <div className="mt-2 border border-primary/10 p-4 text-xs text-primary/50 space-y-1">
              <div className="text-primary/70 font-bold">Eric Monroy Jr</div>
              <div>803 W Poplar St, Stockton CA 95202</div>
              <div>(209) 373-8518</div>
              <div>sweptsentinel.com</div>
            </div>
          </section>

        </div>

        <div className="mt-12 pt-6 border-t border-primary/10 text-[10px] text-primary/20 tracking-wide text-center">
          © 2026 SWEPT SENTINEL · ERIC MONROY JR
        </div>
      </div>
    </div>
  );
}
