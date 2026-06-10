import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene1() {
  const [text, setText] = useState('');
  const fullText = "INITIALIZING SWEPT SENTINEL...";
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let currentText = '';
    const typeInterval = setInterval(() => {
      if (currentText.length < fullText.length) {
        currentText = fullText.slice(0, currentText.length + 1);
        setText(currentText);
      } else {
        clearInterval(typeInterval);
        setTimeout(() => setPhase(1), 1000);
      }
    }, 80);

    const timers = [
      setTimeout(() => setPhase(2), 5000), // Start glitch/exit
    ];

    return () => {
      clearInterval(typeInterval);
      timers.forEach(t => clearTimeout(t));
    };
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-black"
      {...sceneTransitions.fadeBlur}
    >
      <div className="w-full max-w-4xl px-8 font-mono">
        <div className="text-accent text-2xl mb-4">
          <motion.span 
            animate={{ opacity: [1, 0] }} 
            transition={{ duration: 0.5, repeat: Infinity }}
          >_</motion.span>
        </div>
        
        <h1 className="text-[4vw] font-bold text-success leading-tight tracking-wider" 
            data-text={text}
            style={{ textShadow: '0 0 20px rgba(34,197,94,0.5)' }}>
          {text}
        </h1>

        {phase >= 1 && (
          <motion.div 
            className="mt-8 text-[1.5vw] text-accent font-mono space-y-2 opacity-80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <motion.p initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>&gt; LOADING MODULES [230/230]</motion.p>
            <motion.p initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>&gt; ESTABLISHING SECURE CONNECTION...</motion.p>
            <motion.p initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.7 }}>&gt; BYPASSING FIREWALLS...</motion.p>
            <motion.p initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.0 }} className="text-success">&gt; ACCESS GRANTED.</motion.p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
