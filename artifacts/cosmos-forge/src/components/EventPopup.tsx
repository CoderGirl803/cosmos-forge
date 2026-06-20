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

export default function EventPopup({ event }: { event: GameEvent | null }) {
  const { resolveEvent } = useGameStore();

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
        >
          <motion.div
            initial={{ scale: 0.88, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.88, y: 30 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="max-w-lg w-full mx-4 rounded-2xl p-7 relative overflow-hidden"
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

            {/* Extinction badge */}
            {event.type === 'extinction' && (
              <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-red-300" style={{ background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)' }}>
                ⚠️ extinction-level event
              </div>
            )}

            <div className="flex flex-col items-center text-center space-y-3 relative z-10">
              <span className="text-6xl mb-1">{event.icon}</span>
              <h2 className="text-2xl font-bold text-white">{event.title}</h2>
              <p className="text-white/65 text-sm leading-relaxed max-w-sm">{event.description}</p>

              <div className="w-full space-y-2.5 pt-4">
                {event.choices?.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const updates = choice.action(useGameStore.getState());
                      resolveEvent(updates);
                    }}
                    className="w-full py-3 px-5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] active:scale-[0.98] text-left flex items-center gap-3"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: '#e2e8f0'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                  >
                    <span>{choice.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
