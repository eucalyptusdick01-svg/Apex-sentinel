import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 3000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-black"
      {...sceneTransitions.zoomThrough}
    >
      <div className="text-center z-10">
        <motion.h2 
          className="text-accent text-[2vw] font-mono tracking-[0.5em] mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          SWEPT SENTINEL
        </motion.h2>

        <motion.h1 
          className="text-white text-[8vw] font-black uppercase tracking-tighter"
          initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
          animate={phase >= 2 ? { opacity: 1, scale: 1, filter: "blur(0px)" } : { opacity: 0, scale: 0.9, filter: "blur(20px)" }}
          transition={{ duration: 1.5, ease: "circOut" }}
          style={{ textShadow: '0 0 40px rgba(6,182,212,0.3)' }}
        >
          KNOW EVERYTHING.
        </motion.h1>

        <motion.div 
          className="mt-12 w-full h-[1px] bg-gradient-to-r from-transparent via-success to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={phase >= 3 ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        
        <motion.div
          className="mt-8 text-success/70 font-mono text-[1vw]"
          initial={{ opacity: 0 }}
          animate={phase >= 3 ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          [SYSTEM.TERMINATED]
        </motion.div>
      </div>

      {/* Radical Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_300px_rgba(0,0,0,1)] pointer-events-none" />
    </motion.div>
  );
}
