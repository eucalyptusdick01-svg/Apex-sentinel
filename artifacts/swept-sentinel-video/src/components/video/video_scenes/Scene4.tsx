import { motion } from 'framer-motion';

const CATEGORIES = [
  { name: "NETWORK", count: 42, desc: "Ports, DNS, Topologies", color: "#00ccff" },
  { name: "SOCIAL", count: 35, desc: "Profiles, Connections", color: "#00ffcc" },
  { name: "RECON", count: 68, desc: "Subdomains, Endpoints", color: "#ff00cc" },
  { name: "EXPLOIT", count: 24, desc: "CVEs, Vulnerabilities", color: "#ffcc00" },
  { name: "INTEL", count: 46, desc: "Breaches, Dark Web", color: "#cc00ff" },
  { name: "ADVANCED", count: 15, desc: "Custom Payloads, AI", color: "#ffffff" },
];

export function Scene4() {
  return (
    <motion.div 
      className="absolute inset-0 flex items-center justify-center p-[8vw]"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, rotateX: -90 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 1000 }}
    >
      <div className="w-full h-full flex flex-col justify-center">
        
        <motion.div 
          className="mb-[8vh]"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <div className="text-[1.5vw] text-primary tracking-[0.3em] font-bold mb-[1vh]">SYS.CAPABILITY</div>
          <div className="text-[4vw] font-bold text-text-main leading-none">Unmatched Breadth.</div>
        </motion.div>

        <div className="grid grid-cols-3 gap-[2vw]">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.name}
              className="border border-primary/20 bg-primary/5 p-[3vw] relative overflow-hidden"
              initial={{ opacity: 0, y: 50, rotateY: 15 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ delay: 1 + i * 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* ACCENT LINE */}
              <motion.div 
                className="absolute top-0 left-0 w-full h-[2px]"
                style={{ backgroundColor: cat.color }}
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.5 + i * 0.2, duration: 0.8 }}
              />

              <div className="flex justify-between items-start mb-[2vh]">
                <div className="text-[2vw] font-bold tracking-widest">{cat.name}</div>
                <div className="text-[2.5vw] font-bold text-text-muted opacity-50">{cat.count}</div>
              </div>
              
              <div className="text-[1.2vw] text-text-muted opacity-80">
                {cat.desc}
              </div>

              <motion.div 
                className="absolute -right-[10%] -bottom-[10%] w-[50%] h-[50%] blur-[40px] opacity-10 pointer-events-none"
                style={{ backgroundColor: cat.color }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
              />
            </motion.div>
          ))}
        </div>

      </div>
    </motion.div>
  );
}
