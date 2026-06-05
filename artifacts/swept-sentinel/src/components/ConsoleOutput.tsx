import { useEffect, useRef } from "react";

interface ConsoleOutputProps {
  lines: string[];
}

export default function ConsoleOutput({ lines }: ConsoleOutputProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  return (
    <div className="h-full w-full bg-black p-4 font-mono text-[13px] md:text-sm overflow-y-auto custom-scrollbar flex flex-col gap-1 shadow-[inset_0_0_20px_rgba(0,255,65,0.05)]">
      {lines.map((l, i) => (
        <div 
          key={i} 
          className={`whitespace-pre-wrap ${l.includes('ERROR:') || l.includes('ALERT:') ? 'text-destructive drop-shadow-[0_0_2px_rgba(255,0,0,0.8)]' : 'text-[#00ff41] drop-shadow-[0_0_2px_rgba(0,255,65,0.4)]'}`}
        >
          {l}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
