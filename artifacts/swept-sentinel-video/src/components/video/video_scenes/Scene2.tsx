import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

const MODULES = [
  "IP TRACKING", "PORT SCANNING", "DNS RESOLUTION", "BGP ROUTING", 
  "SOCIAL OSINT", "EMAIL REPUTATION", "GEOLOCATION", "WHOIS", 
  "DMARC", "VIN CHECKS", "SATELLITE IMAGERY", "DARK WEB SCAN"
];

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 4000),
      setTimeout(() => setPhase(4), 9000), // exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center"
      {...sceneTransitions.clipPolygon}
    >
      {/* Background Nodes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-accent rounded-full shadow-[0_0_10px_rgba(6,182,212,1)]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="w-full px-[10vw] flex flex-col md:flex-row gap-12 items-center justify-between z-10">
        {/* Left Side: Title */}
        <div className="flex-1">
          <motion.h2 
            className="text-accent text-[2vw] font-mono mb-2 uppercase tracking-widest"
            initial={{ opacity: 0, x: -50 }}
            animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            The Arsenal
          </motion.h2>
          <motion.h1 
            className="text-white text-[6vw] font-bold leading-none uppercase tracking-tighter"
            initial={{ opacity: 0, y: 50 }}
            animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 1, type: "spring", bounce: 0.4 }}
          >
            230+
            <br />
            <span className="text-success text-[4vw]">MODULES</span>
          </motion.h1>
        </div>

        {/* Right Side: Module Grid */}
        <div className="flex-1 grid grid-cols-2 gap-4">
          {MODULES.map((mod, i) => (
            <motion.div
              key={mod}
              className="border border-accent/30 bg-accent/5 p-4 rounded text-accent font-mono text-[1vw] relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
              animate={phase >= 3 ? { opacity: 1, scale: 1, rotateX: 0 } : { opacity: 0, scale: 0.8, rotateX: -90 }}
              transition={{ 
                duration: 0.6, 
                delay: phase >= 3 ? i * 0.1 : 0,
                type: "spring",
                bounce: 0.3
              }}
            >
              <motion.div 
                className="absolute inset-0 bg-accent/20"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2, ease: 'linear' }}
              />
              <span className="relative z-10">{mod}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
