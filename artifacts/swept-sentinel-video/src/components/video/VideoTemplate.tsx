import { useEffect } from 'react';
import { useVideoPlayer } from '@/lib/video';
import { AnimatePresence, motion } from 'framer-motion';

import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { SceneHowTo } from './video_scenes/SceneHowTo';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

export const SCENE_DURATIONS: Record<string, number> = {
  scene1: 7500,
  scene2: 7000,
  sceneHowTo: 9000,
  scene3: 9000,
  scene4: 7000,
  scene5: 7500,
};

const SCENE_COMPONENTS: Record<string, React.ComponentType> = {
  scene1: Scene1,
  scene2: Scene2,
  sceneHowTo: SceneHowTo,
  scene3: Scene3,
  scene4: Scene4,
  scene5: Scene5,
};

export default function VideoTemplate({
  durations = SCENE_DURATIONS,
  loop = true,
  onSceneChange,
}: {
  durations?: Record<string, number>;
  loop?: boolean;
  onSceneChange?: (sceneKey: string) => void;
} = {}) {
  const { currentScene, currentSceneKey } = useVideoPlayer({ durations, loop });

  useEffect(() => {
    onSceneChange?.(currentSceneKey);
  }, [currentSceneKey, onSceneChange]);

  const baseSceneKey = currentSceneKey.replace(/_r[12]$/, '');
  const sceneIndex = Object.keys(SCENE_DURATIONS).indexOf(baseSceneKey);
  const SceneComponent = SCENE_COMPONENTS[baseSceneKey];

  return (
    <div className="w-full h-screen overflow-hidden relative font-mono text-text-main bg-[#0a0f14]">
      
      {/* GLOBAL BACKGROUND GRID - PERSISTENT */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(0, 204, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 204, 255, 0.05) 1px, transparent 1px)',
            backgroundSize: '4vw 4vw'
          }}
        />
      </div>

      {/* SCANLINES OVERLAY */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay z-50"
        style={{
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
          backgroundSize: '100% 4px, 3px 100%'
        }}
      />
      
      {/* VIGNETTE */}
      <div className="absolute inset-0 pointer-events-none z-40 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(10,15,20,0.9)_100%)]" />

      {/* PERSISTENT HUD - fades on payoff scene */}
      <motion.div 
        className="absolute top-[4vh] left-[4vw] z-50 flex items-center gap-4 text-primary font-mono"
        animate={{ opacity: sceneIndex === 4 ? 0 : 0.8 }}
        transition={{ duration: 0.8 }}
      >
        <div className="w-3 h-3 bg-primary animate-pulse-fast rounded-sm" />
        <div className="text-[1.2vw] tracking-widest font-bold">SYS.TERMINAL // OP:ACTIVE</div>
      </motion.div>

      <motion.div 
        className="absolute bottom-[4vh] right-[4vw] z-50 text-[1vw] text-text-muted text-right opacity-60 font-mono"
        animate={{ opacity: sceneIndex === 4 ? 0 : 0.6 }}
        transition={{ duration: 0.8 }}
      >
        <span>SECURE CONNECTION ESTABLISHED</span><br />
        <span>v.2.4.1_stable // LAT: 31ms</span>
      </motion.div>

      <AnimatePresence mode="popLayout">
        {SceneComponent && <SceneComponent key={currentSceneKey} />}
      </AnimatePresence>
    </div>
  );
}
