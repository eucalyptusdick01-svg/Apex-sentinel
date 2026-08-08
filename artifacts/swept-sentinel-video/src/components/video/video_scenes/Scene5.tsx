import { motion } from 'framer-motion';

export function Scene5() {
  const letters = "Find What Others Miss".split(" ");

  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0f14]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
    >
      {/* MASSIVE GLOW */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-primary/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      />

      <div className="relative z-10 text-center flex flex-col items-center">
        {/* MAIN TEXT */}
        <div className="overflow-hidden flex flex-wrap justify-center gap-[2vw] mb-[8vh]">
          {letters.map((word, i) => (
            <motion.div
              key={i}
              className="text-[8vw] font-bold text-text-main tracking-tighter"
              initial={{ y: '100%', rotateX: -90, opacity: 0 }}
              animate={{ y: 0, rotateX: 0, opacity: 1 }}
              transition={{ 
                duration: 1.2, 
                ease: [0.16, 1, 0.3, 1], 
                delay: 0.5 + i * 0.15 
              }}
              style={{ transformOrigin: "bottom center", textShadow: '0 0 30px rgba(255, 255, 255, 0.2)' }}
            >
              {word}
            </motion.div>
          ))}
        </div>

        {/* LOCKUP */}
        <motion.div 
          className="border border-primary px-[4vw] py-[2vh] bg-primary/5 flex items-center gap-[2vw]"
          initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.5, delay: 2 }}
        >
          <div className="w-[1.5vw] h-[1.5vw] bg-primary animate-pulse-fast" />
          <div className="text-[3vw] font-bold tracking-widest text-primary">sweptsentinel.com</div>
        </motion.div>
        
        <motion.div
          className="mt-[4vh] text-[1.2vw] text-text-muted uppercase tracking-[0.4em]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 3 }}
        >
          Terminal Access Granted
        </motion.div>
      </div>
      
      {/* SCANLINES FINAL BURST */}
      <motion.div
        className="absolute inset-0 bg-white z-50 pointer-events-none mix-blend-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.1, 0] }}
        transition={{ duration: 0.2, delay: 0.2 }}
      />
    </motion.div>
  );
}
