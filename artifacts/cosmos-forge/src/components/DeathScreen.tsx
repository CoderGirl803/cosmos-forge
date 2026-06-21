import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props { reason: string; onRestart: () => void; }

const COLS = 5;
const ROWS = 4;

function makeShards() {
  return Array.from({ length: COLS * ROWS }, (_, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const j = () => (Math.random() - 0.5) * 18;
    const clip = `polygon(${j()}% ${j()}%, ${100+j()}% ${j()}%, ${100+j()}% ${100+j()}%, ${j()}% ${100+j()}%)`;
    const cx = (col + 0.5) / COLS - 0.5;
    const cy = (row + 0.5) / ROWS - 0.5;
    const angle = Math.atan2(cy, cx);
    const dist = 300 + Math.random() * 350;
    return {
      left: `${col * (100 / COLS)}%`,
      top: `${row * (100 / ROWS)}%`,
      width: `${100 / COLS}%`,
      height: `${100 / ROWS}%`,
      clip,
      ex: Math.cos(angle) * dist,
      ey: Math.sin(angle) * dist,
      rot: (Math.random() - 0.5) * 240,
      delay: i * 0.028 + Math.random() * 0.06,
    };
  });
}

const SVG_CRACKS = [
  'M 50 50 L 8 12', 'M 50 50 L 88 8', 'M 50 50 L 95 55',
  'M 50 50 L 75 92', 'M 50 50 L 25 95', 'M 50 50 L 4 60',
  'M 50 50 L 30 5', 'M 50 50 L 60 2',
  'M 30 20 L 8 12', 'M 30 20 L 50 50',
  'M 70 18 L 88 8', 'M 70 18 L 50 50',
];

const PLANET_FRAGMENTS = Array.from({ length: 40 }, (_, i) => {
  const angle = (i / 40) * Math.PI * 2 + Math.random() * 0.3;
  const dist = 80 + Math.random() * 280;
  const size = 3 + Math.random() * 8;
  const color = Math.random() > 0.5 ? '#22d3ee' : (Math.random() > 0.5 ? '#0891b2' : '#22c55e');
  return { angle, dist, size, color, delay: Math.random() * 0.4 };
});

export default function DeathScreen({ reason, onRestart }: Props) {
  const [step, setStep] = useState<0 | 1 | 2>(0); // 0=cracking, 1=shattering, 2=revealed
  const shards = useMemo(() => makeShards(), []);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 700);
    const t2 = setTimeout(() => setStep(2), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dark void background + YOU DIED (revealed when shards fly off) */}
      <div className="absolute inset-0 bg-[#05000a] flex flex-col items-center justify-center text-center px-8 gap-6">
        {/* Planet fragments */}
        <div className="absolute" style={{ top: '50%', left: '50%' }}>
          {step >= 2 && PLANET_FRAGMENTS.map((f, i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: Math.cos(f.angle) * f.dist, y: Math.sin(f.angle) * f.dist, opacity: 0, scale: 0.2 }}
              transition={{ duration: 1.8 + Math.random(), delay: f.delay, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                width: f.size, height: f.size,
                marginLeft: -f.size / 2, marginTop: -f.size / 2,
                borderRadius: '50%',
                background: f.color,
                boxShadow: `0 0 ${f.size * 2}px ${f.color}80`,
              }}
            />
          ))}
        </div>

        {/* YOU DIED */}
        <AnimatePresence>
          {step >= 2 && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 2.5, filter: 'blur(30px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="font-bold tracking-[0.15em] uppercase leading-none select-none"
                style={{
                  fontSize: 'clamp(3.5rem, 10vw, 7rem)',
                  color: '#dc2626',
                  textShadow: '0 0 80px rgba(220,38,38,0.9), 0 0 160px rgba(220,38,38,0.4)',
                  fontFamily: 'Space Grotesk, sans-serif',
                }}
              >
                you died.
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="text-base max-w-md leading-relaxed"
                style={{ color: 'rgba(255,180,180,0.6)', fontStyle: 'italic' }}
              >
                {reason}
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="flex flex-col items-center gap-3 mt-2"
              >
                <div className="text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.15)' }}>
                  the stars remain, indifferent and beautiful.
                </div>
                <button
                  onClick={onRestart}
                  className="mt-2 px-8 py-3 rounded-full text-sm font-medium transition-all hover:scale-105"
                  style={{
                    background: 'rgba(220,38,38,0.12)',
                    border: '1px solid rgba(220,38,38,0.35)',
                    color: '#fca5a5',
                    boxShadow: '0 0 30px rgba(220,38,38,0.15)',
                  }}
                >
                  try again ↺
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Crack lines SVG */}
      <AnimatePresence>
        {step === 0 && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-20"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {SVG_CRACKS.map((d, i) => (
              <motion.path
                key={i}
                d={d}
                fill="none"
                stroke="rgba(220,60,60,0.7)"
                strokeWidth="0.35"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: i * 0.06, duration: 0.22, ease: 'easeOut' }}
              />
            ))}
          </svg>
        )}
      </AnimatePresence>

      {/* Glass shards */}
      {step < 2 && shards.map((shard, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={step >= 1 ? {
            x: shard.ex,
            y: shard.ey,
            rotate: shard.rot,
            opacity: 0,
          } : {}}
          transition={{
            delay: step >= 1 ? shard.delay : 0,
            duration: 0.65,
            ease: [0.2, 0.0, 0.6, 1.0],
          }}
          style={{
            position: 'absolute',
            left: shard.left,
            top: shard.top,
            width: shard.width,
            height: shard.height,
            clipPath: shard.clip,
            background: 'linear-gradient(135deg, #0a0b1e 0%, #0d1040 50%, #090b1a 100%)',
            zIndex: 30,
            willChange: 'transform, opacity',
          }}
        />
      ))}

      {/* Red flash on enter */}
      <motion.div
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="absolute inset-0 pointer-events-none z-40"
        style={{ background: '#dc2626', mixBlendMode: 'screen' }}
      />
    </div>
  );
}
