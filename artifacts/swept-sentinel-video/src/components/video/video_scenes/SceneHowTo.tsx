import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const STEPS = [
  {
    number: '01',
    label: 'ENTER A TARGET',
    sub: 'Domain · IP · Email · Username · Phone',
    color: '#00ccff',
  },
  {
    number: '02',
    label: 'HIT RUN',
    sub: '230 modules fire simultaneously — no setup needed',
    color: '#00ffcc',
  },
  {
    number: '03',
    label: 'READ THE INTEL',
    sub: 'Results stream live · Export · Share · Act',
    color: '#cc00ff',
  },
];

const FAKE_TARGETS = [
  'elon@x.com',
  '104.21.43.12',
  '@johndoe',
  'sweptsentinel.com',
];

export function SceneHowTo() {
  const [activeStep, setActiveStep] = useState(0);
  const [typed, setTyped] = useState('');
  const [targetIndex, setTargetIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  // Animate through steps
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setActiveStep(0), 500));
    timers.push(setTimeout(() => setActiveStep(1), 3200));
    timers.push(setTimeout(() => setActiveStep(2), 6000));
    return () => timers.forEach(clearTimeout);
  }, []);

  // Type the fake target in step 1
  useEffect(() => {
    setTyped('');
    setTargetIndex((i) => (i + 1) % FAKE_TARGETS.length);
    const target = FAKE_TARGETS[targetIndex % FAKE_TARGETS.length];
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTyped(target.slice(0, i));
      if (i >= target.length) clearInterval(interval);
    }, 90);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Blinking cursor
  useEffect(() => {
    const id = setInterval(() => setShowCursor((v) => !v), 500);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center px-[8vw]"
      initial={{ opacity: 0, y: '5vh' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* HEADER */}
      <motion.div
        className="mb-[6vh] text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <div className="text-[1.2vw] text-primary tracking-[0.4em] font-bold mb-[1vh]">
          HOW IT WORKS
        </div>
        <div className="text-[3.5vw] font-bold text-text-main leading-none">
          Three Steps. Zero Friction.
        </div>
      </motion.div>

      {/* STEPS ROW */}
      <div className="flex gap-[3vw] w-full justify-center mb-[6vh]">
        {STEPS.map((step, i) => {
          const isActive = activeStep === i;
          const isDone = activeStep > i;
          return (
            <motion.div
              key={step.number}
              className="flex-1 max-w-[22vw] border p-[2.5vw] relative overflow-hidden transition-colors duration-700"
              style={{
                borderColor: isActive || isDone ? step.color : 'rgba(255,255,255,0.1)',
                backgroundColor: isActive ? `${step.color}10` : 'transparent',
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* TOP ACCENT */}
              <motion.div
                className="absolute top-0 left-0 w-full h-[2px] origin-left"
                style={{ backgroundColor: step.color }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isActive || isDone ? 1 : 0 }}
                transition={{ duration: 0.5 }}
              />

              <div
                className="text-[4vw] font-bold leading-none mb-[2vh] transition-colors duration-500"
                style={{ color: isActive || isDone ? step.color : 'rgba(255,255,255,0.2)' }}
              >
                {step.number}
              </div>
              <div className="text-[1.4vw] font-bold text-text-main mb-[1vh] tracking-wider">
                {step.label}
              </div>
              <div className="text-[1vw] text-text-muted leading-relaxed">
                {step.sub}
              </div>

              {/* DONE CHECKMARK */}
              <AnimatePresence>
                {isDone && (
                  <motion.div
                    className="absolute top-[1.5vh] right-[1.5vw] text-[1.5vw] font-bold"
                    style={{ color: step.color }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    ✓
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* LIVE DEMO BOX */}
      <motion.div
        className="w-full max-w-[70vw] border border-primary/25 bg-[#0a0f14] p-[3vw] relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <div className="text-[1vw] text-text-muted mb-[2vh] tracking-widest uppercase">
          Live preview
        </div>

        {/* STEP 1: INPUT */}
        <AnimatePresence mode="popLayout">
          {activeStep === 0 && (
            <motion.div
              key="step1"
              className="flex items-center gap-[2vw]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <span className="text-primary text-[2.5vw] font-bold">&gt;</span>
              <div className="flex-1 border border-primary/40 bg-primary/5 px-[2vw] py-[1.5vh] flex items-center">
                <span className="text-[2vw] text-text-main font-mono">{typed}</span>
                <span
                  className="text-[2vw] text-primary ml-[2px] font-bold"
                  style={{ opacity: showCursor ? 1 : 0 }}
                >
                  |
                </span>
              </div>
              <motion.div
                className="border border-primary text-primary px-[2vw] py-[1.2vh] text-[1.2vw] font-bold tracking-widest cursor-pointer bg-primary/10"
                animate={{ boxShadow: ['0 0 0px rgba(0,204,255,0)', '0 0 20px rgba(0,204,255,0.4)', '0 0 0px rgba(0,204,255,0)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                RUN ALL
              </motion.div>
            </motion.div>
          )}

          {/* STEP 2: RUNNING */}
          {activeStep === 1 && (
            <motion.div
              key="step2"
              className="flex flex-col gap-[1.5vh]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-[1.3vw] text-primary font-bold animate-pulse">
                ◉ EXECUTING 230 MODULES...
              </div>
              <div className="flex gap-[1vw] flex-wrap">
                {['DNS_RECON','IP_TRACKER','SUBDOMAIN','PORTS','BREACH_INTEL','EMAIL_ENUM','GEO_LOC','WAF_DETECT','WHOIS','CERT_TRANS'].map((mod, i) => (
                  <motion.div
                    key={mod}
                    className="text-[0.9vw] border border-primary/30 px-[1vw] py-[0.4vh] text-primary/80 bg-primary/5"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {mod}
                  </motion.div>
                ))}
                <motion.div
                  className="text-[0.9vw] text-text-muted px-[1vw] py-[0.4vh]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  +220 more...
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: RESULTS */}
          {activeStep === 2 && (
            <motion.div
              key="step3"
              className="flex flex-col gap-[1vh] font-mono text-[1.1vw]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {[
                { tag: 'DNS_RECON', text: 'A record → 104.21.43.12 (Cloudflare)', color: 'text-text-main' },
                { tag: 'BREACH_INTEL', text: 'ALERT: 3 credentials found in leaked databases', color: 'text-red-400' },
                { tag: 'SUBDOMAIN', text: '47 active subdomains discovered', color: 'text-primary' },
                { tag: 'PORTS', text: 'Open: 80, 443, 8080, 8443', color: 'text-text-main' },
                { tag: 'SYSTEM', text: 'Complete · 230 modules · 1.4s', color: 'text-primary font-bold' },
              ].map((line, i) => (
                <motion.div
                  key={i}
                  className="flex gap-[2vw]"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 }}
                >
                  <span className="text-primary/70 w-[12vw] shrink-0">[{line.tag}]</span>
                  <span className={line.color}>{line.text}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
