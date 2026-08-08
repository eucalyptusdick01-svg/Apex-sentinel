import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Scene2() {
  const [typedText, setTypedText] = useState('');
  const target = "sweptsentinel.com";
  
  useEffect(() => {
    let current = '';
    const timers: ReturnType<typeof setTimeout>[] = [];
    
    for (let i = 0; i < target.length; i++) {
      timers.push(
        setTimeout(() => {
          current += target[i];
          setTypedText(current);
        }, 1500 + i * 200)
      );
    }
    
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center bg-[#05080a]"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, y: '-10vh' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-[80vw] h-[60vh] border border-primary/20 bg-[#0a0f14]/80 backdrop-blur-md flex flex-col shadow-[0_0_50px_rgba(0,204,255,0.05)] relative overflow-hidden">
        
        {/* TERMINAL HEADER */}
        <div className="h-[6vh] border-b border-primary/20 flex items-center px-[2vw] gap-[1vw] bg-primary/5">
          <div className="flex gap-[0.5vw]">
            <div className="w-[1vw] h-[1vw] rounded-full bg-red-500/50" />
            <div className="w-[1vw] h-[1vw] rounded-full bg-yellow-500/50" />
            <div className="w-[1vw] h-[1vw] rounded-full bg-green-500/50" />
          </div>
          <div className="text-[1vw] text-text-muted ml-[2vw]">root@sentinel: ~/recon</div>
        </div>

        {/* TERMINAL BODY */}
        <div className="flex-1 p-[4vw] flex flex-col justify-center">
          
          <motion.div 
            className="text-[2vw] text-text-muted mb-[4vh]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            Select Target {"->"} IP, Domain, Email, or Username
          </motion.div>

          <div className="flex items-center text-[4vw] font-bold">
            <span className="text-primary mr-[2vw]">{">"}</span>
            <span className="text-text-main">{typedText}</span>
            <motion.span 
              className="w-[2vw] h-[5vw] bg-primary ml-[1vw] inline-block"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
            />
          </div>

          <motion.div
            className="mt-[8vh] flex flex-col items-center gap-[2vh]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={typedText.length === target.length ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <motion.div 
              className="text-[1.5vw] text-text-muted"
              initial={{ opacity: 0 }}
              animate={typedText.length === target.length ? { opacity: [0, 1, 0.5, 1] } : { opacity: 0 }}
              transition={{ delay: 1, duration: 2 }}
            >
              [ VALIDATING TARGET ... OK ]
            </motion.div>
            
            <motion.div 
              className="border border-primary text-primary px-[4vw] py-[1.5vh] text-[2vw] uppercase tracking-widest font-bold bg-primary/10 shadow-[0_0_20px_rgba(0,204,255,0.2)]"
              initial={{ y: 20, opacity: 0 }}
              animate={typedText.length === target.length ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
              transition={{ delay: 2, duration: 0.5 }}
            >
              [ ENTER ] TO EXECUTE
            </motion.div>
          </motion.div>
        </div>

        {/* BACKGROUND GLOW */}
        <motion.div 
          className="absolute right-0 bottom-0 w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-[100px] pointer-events-none"
          animate={typedText.length === target.length ? { scale: 1.2, opacity: 0.8 } : { scale: 1, opacity: 0.4 }}
          transition={{ duration: 1 }}
        />
      </div>
    </motion.div>
  );
}
