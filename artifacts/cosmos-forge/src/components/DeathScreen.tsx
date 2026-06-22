import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../hooks/useGameStore';

interface Props { reason: string; onRestart: () => void; }

const RUNS_KEY = 'cosmos-forge-runs';
const REFERENCE_UNIVERSE_YEARS = [
  120_000,
  18_000_000,
  340_000_000,
  1_200_000_000,
  2_800_000_000,
  3_900_000_000,
  4_450_000_000,
  4_900_000_000,
  6_300_000_000,
  9_200_000_000,
];

function makeDust() {
  return Array.from({ length: 170 }, (_, i) => {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const angle = Math.atan2(y - 50, x - 50);
    const dist = 70 + Math.random() * 280;
    return {
      id: i,
      left: `${x}%`,
      top: `${y}%`,
      size: 2 + Math.random() * 9,
      delay: Math.random() * 0.75,
      x: Math.cos(angle) * dist + (Math.random() - 0.5) * 80,
      y: Math.sin(angle) * dist + (Math.random() - 0.5) * 80,
      color: ['#dc2626', '#fb7185', '#fca5a5', '#7f1d1d', '#38bdf8'][Math.floor(Math.random() * 5)],
    };
  });
}

const PLANET_FRAGS = Array.from({ length: 40 }, (_, i) => {
  const angle = (i / 40) * Math.PI * 2 + Math.random() * 0.3;
  const dist = 80 + Math.random() * 280;
  const size = 3 + Math.random() * 8;
  const color = ['#22d3ee', '#0891b2', '#22c55e', '#06b6d4'][Math.floor(Math.random() * 4)];
  return { angle, dist, size, color, delay: Math.random() * 0.4 };
});

export default function DeathScreen({ reason, onRestart }: Props) {
  const { year } = useGameStore();
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [percentile, setPercentile] = useState<number | null>(null);
  const [totalRuns, setTotalRuns] = useState(0);
  const dust = useMemo(() => makeDust(), []);

  useEffect(() => {
    // Save this run and compute percentile
    const prev = JSON.parse(localStorage.getItem(RUNS_KEY) || '[]') as number[];
    const allRuns = [...prev, year];
    const comparisonRuns = [...REFERENCE_UNIVERSE_YEARS, ...prev];
    localStorage.setItem(RUNS_KEY, JSON.stringify(allRuns.slice(-500)));
    const shorter = comparisonRuns.filter(y => y < year).length;
    const pct = Math.round((shorter / comparisonRuns.length) * 100);
    setPercentile(pct);
    setTotalRuns(comparisonRuns.length + 1);

    const t1 = setTimeout(() => setStep(1), 260);
    const t2 = setTimeout(() => setStep(2), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const formatYear = (n: number) => {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + ' billion years';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + ' million years';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k years';
    return n + ' years';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dark void revealed behind disintegration */}
      <div className="absolute inset-0 bg-[#05000a] flex flex-col items-center justify-center text-center px-8 gap-5">
        {/* Planet fragments */}
        <div className="absolute" style={{ top: '50%', left: '50%' }}>
          {step >= 2 && PLANET_FRAGS.map((f, i) => (
            <motion.div key={i}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: Math.cos(f.angle) * f.dist, y: Math.sin(f.angle) * f.dist, opacity: 0, scale: 0.2 }}
              transition={{ duration: 1.8 + Math.random(), delay: f.delay, ease: 'easeOut' }}
              style={{ position: 'absolute', width: f.size, height: f.size, marginLeft: -f.size / 2, marginTop: -f.size / 2, borderRadius: '50%', background: f.color, boxShadow: `0 0 ${f.size * 2}px ${f.color}80` }}
            />
          ))}
        </div>

        <AnimatePresence>
          {step >= 2 && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 2.5, filter: 'blur(30px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="font-bold tracking-[0.15em] uppercase leading-none select-none"
                style={{ fontSize: 'clamp(3.5rem, 10vw, 7rem)', color: '#dc2626', textShadow: '0 0 80px rgba(220,38,38,0.9), 0 0 160px rgba(220,38,38,0.4)' }}
              >
                you died.
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="text-base max-w-md leading-relaxed"
                style={{ color: 'rgba(255,180,180,0.65)', fontStyle: 'italic' }}
              >
                {reason}
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="flex flex-col items-center gap-2 mt-1"
              >
                <div className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  your civilization survived for{' '}
                  <span style={{ color: 'rgba(34,211,238,0.8)' }}>{formatYear(year)}</span>
                </div>

                {percentile !== null && (
                  <div className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.28)' }}>
                    you survived more than{' '}
                    <span style={{ color: percentile >= 50 ? 'rgba(34,197,94,0.7)' : 'rgba(251,191,36,0.7)' }}>
                      {percentile}% of universes
                    </span>
                    {' '}({totalRuns} total recorded)
                  </div>
                )}

                <div className="text-xs tracking-widest uppercase mt-2" style={{ color: 'rgba(255,255,255,0.12)' }}>
                  the universe awaits
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                onClick={onRestart}
                className="mt-2 px-8 py-3 rounded-full text-sm font-medium transition-all hover:scale-105"
                style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.35)', color: '#fca5a5', boxShadow: '0 0 30px rgba(220,38,38,0.15)' }}
              >
                try again ↺
              </motion.button>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Screen disintegration */}
      {step < 2 && (
        <motion.div
          className="absolute inset-0 z-30"
          initial={{ opacity: 1 }}
          animate={step >= 1 ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
          style={{ background: 'linear-gradient(135deg, #090b1a 0%, #0a0b1e 55%, #16060b 100%)' }}
        />
      )}
      {dust.map(bit => (
        <motion.div
          key={bit.id}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.2 }}
          animate={step >= 1 ? { x: bit.x, y: bit.y, opacity: [0, 0.95, 0], scale: [0.2, 1, 0.1] } : {}}
          transition={{ delay: bit.delay, duration: 1.25, ease: 'easeOut' }}
          className="absolute rounded-full pointer-events-none z-40"
          style={{
            left: bit.left,
            top: bit.top,
            width: bit.size,
            height: bit.size,
            background: bit.color,
            boxShadow: `0 0 ${bit.size * 3}px ${bit.color}`,
          }}
        />
      ))}

      {/* Red flash */}
      <motion.div
        initial={{ opacity: 0.6 }} animate={{ opacity: 0 }} transition={{ duration: 0.5 }}
        className="absolute inset-0 pointer-events-none z-40"
        style={{ background: '#dc2626', mixBlendMode: 'screen' }}
      />
    </div>
  );
}
