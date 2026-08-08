import { motion } from 'framer-motion';

export function Scene1() {
  const categories = ['NETWORK', 'SOCIAL', 'RECON', 'EXPLOIT', 'INTEL', 'ADVANCED'];
  
  return (
    <motion.div 
      className="absolute inset-0 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative z-10 text-center">
        {/* BIG NUMBER */}
        <div className="overflow-hidden mb-[2vh]">
          <motion.h1 
            className="text-[12vw] font-bold text-primary leading-none tracking-tighter"
            style={{ textShadow: '0 0 40px rgba(0, 204, 255, 0.4)' }}
            initial={{ y: '100%', rotateX: 45, opacity: 0 }}
            animate={{ y: 0, rotateX: 0, opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          >
            230
          </motion.h1>
        </div>

        {/* TEXT REVEAL */}
        <div className="overflow-hidden">
          <motion.h2 
            className="text-[4vw] font-bold text-text-main tracking-widest uppercase"
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 1.2 }}
          >
            OSINT MODULES
          </motion.h2>
        </div>

        <div className="mt-[6vh] overflow-hidden">
          <motion.div
            className="text-[2vw] text-text-muted tracking-[0.5em] uppercase border border-primary/30 px-[3vw] py-[1.5vh] rounded-none bg-primary/5"
            initial={{ scale: 0.9, opacity: 0, filter: 'blur(10px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.5, delay: 2.5 }}
          >
            One Terminal.
          </motion.div>
        </div>
      </div>

      {/* BACKGROUND CASCADING CATEGORIES */}
      <div className="absolute inset-0 z-0 flex flex-col justify-between py-[15vh] px-[5vw] opacity-10 pointer-events-none overflow-hidden">
        {categories.map((cat, i) => (
          <motion.div
            key={cat}
            className="text-[8vw] font-bold tracking-widest whitespace-nowrap leading-none text-right"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: '-10%', opacity: 1 }}
            transition={{ 
              duration: 12, 
              ease: "linear",
              delay: i * 0.4 
            }}
          >
            {cat} // {cat} // {cat}
          </motion.div>
        ))}
      </div>
      
      {/* GLITCH EFFECTS */}
      <motion.div 
        className="absolute inset-0 bg-primary mix-blend-overlay z-20 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.2, 0, 0.1, 0] }}
        transition={{ times: [0, 0.1, 0.2, 0.3, 1], duration: 3, repeat: Infinity, repeatDelay: 4 }}
      />
    </motion.div>
  );
}
