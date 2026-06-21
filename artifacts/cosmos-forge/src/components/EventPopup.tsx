import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameEvent } from '../data/gameData';
import { useGameStore } from '../hooks/useGameStore';

const typeStyles: Record<string, { border: string; glow: string; bg: string }> = {
  negative:  { border: '#ef4444', glow: 'rgba(239,68,68,0.25)',   bg: 'rgba(239,68,68,0.05)' },
  positive:  { border: '#fbbf24', glow: 'rgba(251,191,36,0.25)',  bg: 'rgba(251,191,36,0.05)' },
  paradox:   { border: '#22d3ee', glow: 'rgba(34,211,238,0.25)',  bg: 'rgba(34,211,238,0.05)' },
  neutral:   { border: '#475569', glow: 'rgba(71,85,105,0.1)',    bg: 'rgba(71,85,105,0.05)' },
  extinction:{ border: '#dc2626', glow: 'rgba(220,38,38,0.4)',    bg: 'rgba(220,38,38,0.08)' },
  signal:    { border: '#7c3aed', glow: 'rgba(124,58,237,0.3)',   bg: 'rgba(124,58,237,0.05)' },
};

// Deterministic social-proof labels based on number of choices + index
function choiceMeta(totalChoices: number, idx: number, type: string): { label: string; color: string } | null {
  if (totalChoices < 2) return null;
  if (type === 'paradox') {
    if (idx === 0) return { label: 'most find comfort here', color: 'rgba(34,211,238,0.55)' };
    if (idx === totalChoices - 1 && totalChoices > 2) return { label: 'only 8% choose this', color: 'rgba(100,116,139,0.5)' };
    return null;
  }
  if (type === 'extinction') {
    if (idx === 0) return { label: 'most agree — safer', color: 'rgba(34,197,94,0.55)' };
    if (idx === totalChoices - 1) return { label: 'most avoid — very risky', color: 'rgba(239,68,68,0.55)' };
    if (totalChoices === 3 && idx === 1) return { label: '37% choose this', color: 'rgba(251,191,36,0.5)' };
    return null;
  }
  if (type === 'negative') {
    if (idx === 0) return { label: 'most agree', color: 'rgba(34,197,94,0.5)' };
    return null;
  }
  if (type === 'positive') {
    if (idx === totalChoices - 1) return { label: 'bold choice', color: 'rgba(251,191,36,0.55)' };
    return null;
  }
  return null;
}

export default function EventPopup({ event }: { event: GameEvent | null }) {
  const { resolveEvent } = useGameStore();
  const choices = event?.choices && event.choices.length > 1
    ? event.choices
    : event?.type === 'paradox'
    ? [
        ...(event.choices ?? []),
        {
          label: '🔬 turn it into science (+tech, -energy)',
          action: (s: any) => ({ tech: Math.min(100, s.tech + 8), energy: Math.max(0, s.energy - 8) }),
        },
        {
          label: '🧘 accept uncertainty (+health, -tech)',
          action: (s: any) => ({ health: Math.min(100, s.health + 6), tech: Math.max(0, s.tech - 3) }),
        },
        {
          label: '🚪 ignore it and stabilize society',
          action: (s: any) => ({ food: Math.min(100, s.food + 4), population: Math.floor(s.population * 0.99) }),
        },
      ].slice(0, 4)
    : event?.choices ?? [];

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-8 pb-28"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
        >
          <motion.div
            initial={{ scale: 0.88, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.88, y: 30 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="max-w-lg w-full max-h-[calc(100vh-10rem)] overflow-y-auto rounded-2xl p-7 relative"
            style={{
              background: `linear-gradient(135deg, rgba(10,11,30,0.95), rgba(15,18,45,0.95))`,
              border: `1.5px solid ${typeStyles[event.type]?.border ?? '#475569'}`,
              boxShadow: `0 0 50px ${typeStyles[event.type]?.glow ?? 'rgba(0,0,0,0.3)'}, 0 20px 60px rgba(0,0,0,0.5)`
            }}
          >
            {/* Ambient glow blob */}
            <div
              className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-30"
              style={{ background: typeStyles[event.type]?.border ?? '#475569' }}
            />

            {/* Type badge */}
            {event.type === 'extinction' && (
              <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-red-300" style={{ background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)' }}>
                ⚠️ extinction-level event
              </div>
            )}
            {event.type === 'paradox' && (
              <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-cyan-300" style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.3)' }}>
                🧠 philosophical paradox
              </div>
            )}

            <div className="flex flex-col items-center text-center space-y-3 relative z-10">
              <span className="text-6xl mb-1">{event.icon}</span>
              <h2 className="text-2xl font-bold text-white">{event.title}</h2>
              <p className="text-white/65 text-sm leading-relaxed max-w-sm">{event.description}</p>

              <div className="w-full space-y-2 pt-4">
                {choices.map((choice, idx) => {
                  const meta = choiceMeta(choices.length, idx, event.type);
                  return (
                    <div key={idx} className="relative">
                      <button
                        onClick={() => {
                          const updates = choice.action(useGameStore.getState());
                          resolveEvent(updates);
                        }}
                        className="w-full py-3 px-5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] text-left"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#e2e8f0',
                          paddingBottom: meta ? '22px' : undefined,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                      >
                        {choice.label}
                        {meta && (
                          <span
                            className="absolute bottom-1.5 right-3 text-xs"
                            style={{ color: meta.color, fontStyle: 'italic', pointerEvents: 'none' }}
                          >
                            {meta.label}
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
