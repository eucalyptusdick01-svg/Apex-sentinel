import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const OUTPUT_LINES = [
  { module: "SYSTEM", text: "Initializing payload... target: sweptsentinel.com", color: "text-text-muted" },
  { module: "DNS_RECON", text: "Resolving A records...", color: "text-text-muted" },
  { module: "DNS_RECON", text: "Target identified: sweptsentinel.com (104.21.43.12)", color: "text-text-main" },
  { module: "IP_TRACKER", text: "104.21.43.12 -> Cloudflare, Inc. (United States)", color: "text-text-main" },
  { module: "SUBDOMAIN_SCAN", text: "Brute-forcing subdomains...", color: "text-text-muted" },
  { module: "SUBDOMAIN_SCAN", text: "api.sweptsentinel.com [200 OK]", color: "text-text-main" },
  { module: "SUBDOMAIN_SCAN", text: "dev.sweptsentinel.com [403 Forbidden]", color: "text-yellow-400" },
  { module: "SUBDOMAIN_SCAN", text: "Found 47 active subdomains.", color: "text-primary" },
  { module: "PORTS_SCAN", text: "Initiating SYN stealth scan...", color: "text-text-muted" },
  { module: "PORTS_SCAN", text: "Open ports: 80, 443, 8080, 8443", color: "text-text-main" },
  { module: "CERT_TRANSPARENCY", text: "Extracting SSL certificates...", color: "text-text-muted" },
  { module: "CERT_TRANSPARENCY", text: "12 valid certificates found.", color: "text-text-main" },
  { module: "BREACH_INTEL", text: "Cross-referencing dark web databases...", color: "text-text-muted" },
  { module: "BREACH_INTEL", text: "Scanning combolists...", color: "text-text-muted" },
  { module: "BREACH_INTEL", text: "ALERT: 3 exposed credentials found.", color: "text-red-400" },
  { module: "EMAIL_ENUM", text: "Discovering linked addresses via OSINT...", color: "text-text-muted" },
  { module: "EMAIL_ENUM", text: "Found 14 associated emails.", color: "text-text-main" },
  { module: "TECH_STACK", text: "Fingerprinting server headers...", color: "text-text-muted" },
  { module: "TECH_STACK", text: "React, Node.js, Vercel, Stripe", color: "text-text-main" },
  { module: "GEO_LOC", text: "Latitude: 37.7749, Longitude: -122.4194", color: "text-text-main" },
  { module: "WAF_DETECT", text: "WAF Detected: Cloudflare Enterprise", color: "text-yellow-400" },
  { module: "WHOIS", text: "Domain Age: 345 days", color: "text-text-main" },
  { module: "SYSTEM", text: "Module execution complete. 230 modules ran in 1.4s", color: "text-primary font-bold" },
];

export function Scene3() {
  const [visibleLines, setVisibleLines] = useState<number>(0);

  useEffect(() => {
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < OUTPUT_LINES.length) {
        currentLine++;
        setVisibleLines(currentLine);
      } else {
        clearInterval(interval);
      }
    }, 280);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center p-[5vw]"
      initial={{ opacity: 0, y: '10vh' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, filter: 'blur(20px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-full h-full flex flex-col font-mono text-[1.5vw] leading-relaxed relative">
        
        {/* PROGRESS BAR */}
        <motion.div 
          className="absolute top-0 left-0 h-[2px] bg-primary"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: (OUTPUT_LINES.length * 0.15) }}
        />

        <div className="flex-1 overflow-hidden relative">
          <div className="absolute bottom-0 left-0 w-full flex flex-col justify-end min-h-full">
            {OUTPUT_LINES.slice(0, visibleLines).map((line, i) => (
              <motion.div 
                key={i} 
                className="flex gap-[2vw] py-[0.5vh]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-primary w-[15vw] shrink-0 font-bold opacity-80">
                  [{line.module}]
                </span>
                <span className={line.color}>
                  {line.text}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}
