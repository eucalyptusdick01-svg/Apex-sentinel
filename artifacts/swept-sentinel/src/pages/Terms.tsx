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
          <p className="text-xs text-primary/40 tracking-wide">Last updated: August 10, 2026</p>
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
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">5. CANCELLATION POLICY</h2>
            <p>You may cancel your subscription at any time with no cancellation fee.</p>
            <ul className="space-y-2 mt-2">
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>Cancellation takes effect at the end of your current billing period. You retain full Pro access until then.</li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>To cancel, log into your dashboard and use the billing portal, or email us at <strong className="text-primary/90">support@sweptsentinel.com</strong>.</li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>After cancellation your account reverts to the free tier automatically. No data is deleted.</li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>If you cancel within 24 hours of your very first subscription charge and have run fewer than 10 modules, contact us for a courtesy refund consideration.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">6. REFUND & DISPUTE POLICY</h2>
            <p>Swept Sentinel provides digital intelligence services consumed immediately upon use. Subscription charges are generally non-refundable once a billing period has begun.</p>
            <ul className="space-y-2 mt-2">
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>If you believe a charge was made in error, contact us within <strong className="text-primary/90">7 days</strong> of the charge date.</li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>We will investigate and respond within <strong className="text-primary/90">3 business days</strong>.</li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>Refunds may be granted at our discretion for documented billing errors or service outages exceeding 24 hours.</li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>Approved refunds are returned to the original payment method and may take 5–10 business days to appear.</li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>We do not issue refunds for partial billing periods or unused module runs.</li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>If you initiate a chargeback with your bank before contacting us, we reserve the right to suspend your account pending resolution.</li>
            </ul>
            <p className="mt-2">To request a refund or dispute a charge, contact us at <strong className="text-primary/90">support@sweptsentinel.com</strong> or (209) 377-8518 with your account email, the charge date, and reason for your request. Nothing in this policy limits your rights under applicable consumer protection law.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">7. NO PHYSICAL GOODS</h2>
            <p>Swept Sentinel sells digital software access only. No physical goods are shipped or sold. No return or shipping policy applies. All purchases are for access to the online platform and its intelligence modules.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">8. FREE TIER</h2>
            <p>A free tier is available with limited module access (4 guest runs per day, core network and recon modules only). We reserve the right to modify or discontinue the free tier at any time with reasonable notice to registered users.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">9. PROMOTIONS & TRIAL OFFERS</h2>
            <p>From time to time we may offer promotional pricing, discount codes, or free trial periods. The following terms apply to all promotions unless stated otherwise at the point of offer:</p>
            <ul className="space-y-2 mt-2">
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>Promotions are for new subscribers only unless explicitly stated otherwise.</li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>Promotional pricing applies only for the stated duration; subscriptions then renew at the standard rate.</li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>Discount codes must be applied at checkout and cannot be applied retroactively.</li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>One promotion per account. Promotions cannot be combined with each other.</li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>We reserve the right to modify or withdraw any promotion at any time without notice.</li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>Guest trial runs (4 per day) are available to unregistered visitors at no charge and require no payment method.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">10. EXPORT CONTROLS & LEGAL RESTRICTIONS</h2>
            <p>Swept Sentinel is operated from the United States and is subject to U.S. export control laws, including the Export Administration Regulations (EAR) and regulations administered by the Office of Foreign Assets Control (OFAC).</p>
            <ul className="space-y-2 mt-2">
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>You may not use the Service if you are located in, or are a national or resident of, any country subject to U.S. embargo or sanctions, including but not limited to Cuba, Iran, North Korea, Russia, Syria, and the Crimea region.</li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>You may not use the Service if you appear on any U.S. government list of prohibited or restricted parties.</li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>You are responsible for complying with all local laws regarding online conduct and acceptable use in your jurisdiction.</li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>The intelligence tools provided are intended for lawful security research, testing of systems you own or have authorization to test, and investigative purposes only. Use for unauthorized surveillance or any unlawful purpose is strictly prohibited.</li>
              <li className="flex gap-2"><span className="text-primary/40 shrink-0">▸</span>By using the Service, you represent and warrant that none of the above restrictions apply to you.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">11. DISCLAIMER OF WARRANTIES</h2>
            <p>The Service is provided "as is" without warranty of any kind. We do not guarantee the accuracy, completeness, or timeliness of data returned by third-party APIs. Intelligence results are provided for informational purposes only and should not be used as the sole basis for any legal, financial, or security decision.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">12. LIMITATION OF LIABILITY</h2>
            <p>To the maximum extent permitted by law, Eric Monroy Jr shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service. Our total liability to you shall not exceed the amount you paid us in the 30 days preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">13. CHANGES TO TERMS</h2>
            <p>We may update these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms. We will notify active subscribers of material changes via email.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">14. GOVERNING LAW</h2>
            <p>These Terms are governed by the laws of the State of California. Any disputes shall be resolved in the courts of San Joaquin County, California.</p>
          </section>

          <section>
            <h2 className="text-xs font-bold text-primary tracking-widest mb-3">15. CONTACT & CUSTOMER SERVICE</h2>
            <p className="mb-3">For billing questions, refund requests, cancellations, or any other support, reach us through any of the following:</p>
            <div className="border border-primary/10 p-4 text-xs text-primary/50 space-y-2">
              <div className="text-primary/70 font-bold">Eric Monroy Jr — Swept Sentinel</div>
              <div>803 W Poplar St, Stockton CA 95202</div>
              <div>📞 (209) 377-8518</div>
              <div>✉ support@sweptsentinel.com</div>
              <div>🌐 sweptsentinel.com</div>
              <div className="pt-1 text-primary/30">Support hours: Mon–Fri, 9 AM – 6 PM PT · Response within 1 business day</div>
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
