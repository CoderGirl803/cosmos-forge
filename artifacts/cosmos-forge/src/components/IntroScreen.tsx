import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, useDragControls } from 'framer-motion';
import { useGameStore } from '../hooks/useGameStore';

export default function IntroScreen() {
  const setPhase = useGameStore(state => state.setPhase);
  const [merged, setMerged] = useState(false);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);

  const checkCollision = () => {
    if (!orb1Ref.current || !orb2Ref.current) return;
    const rect1 = orb1Ref.current.getBoundingClientRect();
    const rect2 = orb2Ref.current.getBoundingClientRect();

    const x1 = rect1.left + rect1.width / 2;
    const y1 = rect1.top + rect1.height / 2;
    const x2 = rect2.left + rect2.width / 2;
    const y2 = rect2.top + rect2.height / 2;

    const dist = Math.hypot(x2 - x1, y2 - y1);
    
    if (dist < 60 && !merged) {
      setMerged(true);
      setTimeout(() => {
        setPhase('bigbang');
        setTimeout(() => setPhase('particles'), 1500);
      }, 500);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-background">
      {/* Stars Background */}
      <div className="absolute inset-0 opacity-50">
        {Array.from({ length: 50 }).map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 'px',
              height: Math.random() * 3 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random(),
              animation: `float ${Math.random() * 3 + 2}s infinite`
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2 }}
        className="z-10 text-center space-y-4 pointer-events-none"
      >
        <h1 className="text-6xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary glow-text">
          cosmos forge
        </h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 2 }}
          className="text-muted-foreground font-medium"
        >
          made by a girl named sen :)
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4, duration: 2 }}
        className="absolute bottom-32 text-center text-secondary font-medium pointer-events-none"
      >
        drag two particles together to begin ✨
      </motion.div>

      {/* Orbs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4.5, duration: 2 }}
        className="absolute inset-0"
      >
        <motion.div
          ref={orb1Ref}
          drag
          dragMomentum={false}
          onDrag={checkCollision}
          className="absolute left-1/4 top-1/2 w-12 h-12 rounded-full cursor-grab active:cursor-grabbing z-20 shadow-[0_0_30px_#7c3aed]"
          style={{ background: 'radial-gradient(circle at 30% 30%, #a78bfa, #7c3aed)' }}
          animate={merged ? { scale: 0, opacity: 0 } : { y: [0, -10, 0] }}
          transition={{ y: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
        />
        <motion.div
          ref={orb2Ref}
          drag
          dragMomentum={false}
          onDrag={checkCollision}
          className="absolute right-1/4 top-1/2 w-12 h-12 rounded-full cursor-grab active:cursor-grabbing z-20 shadow-[0_0_30px_#06b6d4]"
          style={{ background: 'radial-gradient(circle at 30% 30%, #67e8f9, #06b6d4)' }}
          animate={merged ? { scale: 0, opacity: 0 } : { y: [0, 10, 0] }}
          transition={{ y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } }}
        />
      </motion.div>
    </div>
  );
}
