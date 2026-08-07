import { useLocation } from "wouter";

export default function Terms() {
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
          <h1 className="text-2xl font-bold tracking-[0.1em] text-primary mb-2">TERMS OF SERVICE</h1>
          <p className="text-xs text-primary/40 tracking-wide">Last updated: August 7, 2026</p>
        </div>

        <div className="space-y-8 text-sm text-primary/70 leading-relaxed">

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">1. ACCEPTANCE OF TERMS</h2>
            <p>By accessing or using Swept Sentinel ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. The Service is operated by Eric Monroy Jr, 803 W Poplar St, Stockton CA 95202.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">2. DESCRIPTION OF SERVICE</h2>
            <p>Swept Sentinel is an OSINT (Open Source Intelligence) platform providing access to 173 intelligence modules including IP reputation lookups, DNS analysis, threat intelligence feeds, subdomain enumeration, and cryptographic tools. Modules query publicly available data sources and licensed third-party APIs.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">3. ACCEPTABLE USE</h2>
            <p>You may only use the Service for lawful purposes. You agree not to:</p>
            <ul className="space-y-2 mt-2">
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>Use the Service to harass, stalk, or harm any individual</li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>Use query results to facilitate unauthorized access to computer systems</li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>Resell or redistribute Service output without written permission</li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>Attempt to reverse engineer, scrape, or circumvent rate limits</li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>Use the Service for any purpose that violates applicable law</li>
            </ul>
            <p className="mt-2">We reserve the right to suspend or terminate accounts that violate these terms without refund.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">4. SUBSCRIPTION & BILLING</h2>
            <p>Paid plans are billed on a recurring basis (weekly or monthly) through Stripe. By subscribing, you authorize us to charge your payment method on the applicable billing cycle.</p>
            <ul className="space-y-2 mt-2">
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span><span><strong className="text-primary/90">Weekly plan:</strong> $5.99 charged every 7 days</span></li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span><span><strong className="text-primary/90">Monthly plan:</strong> $19.99 charged every 30 days</span></li>
            </ul>
            <p className="mt-2">Subscriptions renew automatically until cancelled. You may cancel at any time through the billing portal. Cancellation takes effect at the end of the current billing period — no partial refunds are issued for unused time.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">5. REFUND POLICY</h2>
            <p>All sales are final. We do not offer refunds except where required by applicable law. If you believe a charge was made in error, contact us within 7 days of the charge at (209) 373-8518 or via sweptsentinel.com.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">6. FREE TIER</h2>
            <p>A free tier is available with limited module access and daily run limits. We reserve the right to modify or discontinue the free tier at any time with reasonable notice.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">7. DISCLAIMER OF WARRANTIES</h2>
            <p>The Service is provided "as is" without warranty of any kind. We do not guarantee the accuracy, completeness, or timeliness of data returned by third-party APIs. Intelligence results are provided for informational purposes only and should not be used as the sole basis for any legal, financial, or security decision.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">8. LIMITATION OF LIABILITY</h2>
            <p>To the maximum extent permitted by law, Eric Monroy Jr shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability to you shall not exceed the amount you paid us in the 30 days preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">9. CHANGES TO TERMS</h2>
            <p>We may update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms. We will notify active subscribers of material changes via email.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">10. GOVERNING LAW</h2>
            <p>These Terms are governed by the laws of the State of California. Any disputes shall be resolved in the courts of San Joaquin County, California.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">11. CONTACT</h2>
            <div className="border border-primary/10 p-4 text-xs text-primary/50 space-y-1">
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
