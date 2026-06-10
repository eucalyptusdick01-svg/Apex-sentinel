import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 8000),
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center overflow-hidden"
      {...sceneTransitions.slideLeft}
    >
      {/* Background data graphs */}
      <div className="absolute inset-0 flex items-end justify-center opacity-30 pb-20">
        <div className="flex gap-4 items-end h-[40vh] w-full px-12">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-accent"
              initial={{ height: 0 }}
              animate={phase >= 1 ? { height: `${Math.random() * 100}%` } : { height: 0 }}
              transition={{ duration: 1.5, delay: i * 0.05, ease: "easeOut" }}
            />
          ))}
        </div>
      </div>

      <div className="z-10 text-center flex flex-col items-center">
        <motion.div 
          className="text-accent border border-accent rounded-full px-6 py-2 font-mono text-[1.5vw] tracking-widest mb-8"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={phase >= 1 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          PERSISTED HISTORY
        </motion.div>
        
        <motion.h1 
          className="text-white text-[5vw] font-bold leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          Replay Past
          <br />
          Investigations
        </motion.h1>

        {/* Abstract timeline */}
        <motion.div 
          className="mt-12 w-[60vw] h-[2px] bg-white/20 relative"
          initial={{ opacity: 0, width: 0 }}
          animate={phase >= 2 ? { opacity: 1, width: '60vw' } : { opacity: 0, width: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
        >
          <motion.div 
            className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-success shadow-[0_0_20px_rgba(34,197,94,1)]"
            animate={{ left: ['0%', '100%'] }}
            transition={{ duration: 6, ease: "linear", repeat: Infinity }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
