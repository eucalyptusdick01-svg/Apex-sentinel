import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

const LOG_LINES = [
  "[01:02:47] INITIATING TARGET SCAN: 192.168.1.104",
  "[01:02:48] PORT SCAN COMPLETE: 22 OPEN PORTS FOUND",
  "[01:02:49] RESOLVING DNS RECORDS... SUCCESS",
  "[01:02:50] FETCHING BGP ROUTING DATA",
  "[01:02:52] BATCH MODE: SOCIAL OSINT QUEUED",
  "[01:02:53] TARGET MATCH: INSTAGRAM PROFILE ACQUIRED",
  "[01:02:55] TARGET MATCH: TELEGRAM HANDLE IDENTIFIED",
  "[01:02:58] COMPILING THREAT INTELLIGENCE REPORT"
];

export function Scene3() {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 12000), // exit start
    ];

    let currentLine = 0;
    const logInterval = setInterval(() => {
      if (currentLine < LOG_LINES.length) {
        setVisibleLines(prev => prev + 1);
        currentLine++;
      } else {
        clearInterval(logInterval);
      }
    }, 1200);

    return () => {
      timers.forEach(t => clearTimeout(t));
      clearInterval(logInterval);
    };
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center p-[5vw]"
      {...sceneTransitions.morphExpand}
    >
      <motion.div 
        className="w-full max-w-5xl bg-black/80 border border-success/30 rounded-lg p-6 shadow-[0_0_30px_rgba(34,197,94,0.2)] backdrop-blur-md"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={phase >= 1 ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.9 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        <div className="flex justify-between items-center border-b border-success/30 pb-4 mb-4">
          <div className="text-success font-mono text-[1.5vw] uppercase tracking-wider">
            Real-time Execution
          </div>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-error" />
            <div className="w-3 h-3 rounded-full bg-warning" />
            <div className="w-3 h-3 rounded-full bg-success" />
          </div>
        </div>

        <div className="font-mono text-[1.2vw] space-y-3 h-[40vh] overflow-hidden flex flex-col justify-end">
          {LOG_LINES.slice(0, visibleLines).map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`${line.includes('SUCCESS') || line.includes('ACQUIRED') ? 'text-success' : 'text-accent'}`}
            >
              {line}
            </motion.div>
          ))}
          {visibleLines < LOG_LINES.length && (
            <motion.div 
              className="text-white mt-2"
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              _
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
