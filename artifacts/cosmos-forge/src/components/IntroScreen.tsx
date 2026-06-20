import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../hooks/useGameStore';

export default function IntroScreen() {
  const setPhase = useGameStore(state => state.setPhase);
  const [merged, setMerged] = useState(false);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);

  const checkCollision = () => {
    if (!orb1Ref.current || !orb2Ref.current || merged) return;
    const r1 = orb1Ref.current.getBoundingClientRect();
    const r2 = orb2Ref.current.getBoundingClientRect();
    const x1 = r1.left + r1.width / 2;
    const y1 = r1.top + r1.height / 2;
    const x2 = r2.left + r2.width / 2;
    const y2 = r2.top + r2.height / 2;
    const dist = Math.hypot(x2 - x1, y2 - y1);
    if (dist < 70) {
      setMerged(true);
      setTimeout(() => {
        setPhase('bigbang');
        setTimeout(() => setPhase('particles'), 1500);
      }, 400);
    }
  };

  const stars = React.useMemo(() =>
    Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.7 + 0.1,
      dur: Math.random() * 4 + 2
    })), []);

  return (
    <div
      className="absolute inset-0 bg-background overflow-hidden"
      style={{ userSelect: 'none' }}
    >
      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map(s => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${s.x}%`, top: `${s.y}%`,
              width: s.size, height: s.size,
              opacity: s.opacity,
              animation: `float ${s.dur}s ease-in-out infinite alternate`
            }}
          />
        ))}
      </div>

      {/* Title block — fixed center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ paddingBottom: '30vh' }}>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
          className="font-serif font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-300 to-secondary"
          style={{
            fontSize: 'clamp(4.5rem, 12vw, 10rem)',
            lineHeight: 1.05,
            filter: 'drop-shadow(0 0 40px rgba(124,58,237,0.6))'
          }}
        >
          cosmos forge
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 2 }}
          className="text-xl text-muted-foreground font-medium mt-6 tracking-wide"
        >
          made by a girl named sen :)
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5, duration: 1.5 }}
          className="text-base mt-4 font-medium"
          style={{ color: 'hsl(var(--secondary))' }}
        >
          drag two particles together to begin ✨
        </motion.p>
      </div>

      {/* Orbs — lower portion of screen */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4, duration: 1.5 }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Orb 1 — left */}
        <motion.div
          ref={orb1Ref}
          drag
          dragMomentum={false}
          onDrag={checkCollision}
          className="absolute cursor-grab active:cursor-grabbing pointer-events-auto"
          style={{
            left: '22%',
            top: '65%',
            width: 56, height: 56,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #c4b5fd, #7c3aed)',
            boxShadow: '0 0 30px 8px rgba(124,58,237,0.7), 0 0 60px 20px rgba(124,58,237,0.3)',
          }}
          animate={merged ? { scale: 0, opacity: 0 } : { y: [0, -14, 0] }}
          transition={{ y: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
        />

        {/* Orb 2 — right */}
        <motion.div
          ref={orb2Ref}
          drag
          dragMomentum={false}
          onDrag={checkCollision}
          className="absolute cursor-grab active:cursor-grabbing pointer-events-auto"
          style={{
            right: '22%',
            top: '62%',
            width: 56, height: 56,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #67e8f9, #06b6d4)',
            boxShadow: '0 0 30px 8px rgba(6,182,212,0.7), 0 0 60px 20px rgba(6,182,212,0.3)',
          }}
          animate={merged ? { scale: 0, opacity: 0 } : { y: [0, 14, 0] }}
          transition={{ y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } }}
        />
      </motion.div>

      {/* Big bang flash overlay */}
      {merged && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.2, times: [0, 0.2, 0.7, 1] }}
          className="absolute inset-0 bg-white pointer-events-none z-50"
        />
      )}
    </div>
  );
}
