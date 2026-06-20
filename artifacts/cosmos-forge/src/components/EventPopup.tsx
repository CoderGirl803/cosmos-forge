import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameEvent } from '../data/gameData';
import { useGameStore } from '../hooks/useGameStore';

export default function EventPopup({ event }: { event: GameEvent | null }) {
  const { resolveEvent } = useGameStore();

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className={`max-w-md w-full glass-panel p-6 rounded-xl border-2 shadow-2xl relative overflow-hidden
              ${event.type === 'negative' ? 'border-destructive/50 shadow-[0_0_40px_rgba(239,68,68,0.2)]' : ''}
              ${event.type === 'positive' ? 'border-accent/50 shadow-[0_0_40px_rgba(251,191,36,0.2)]' : ''}
              ${event.type === 'paradox' ? 'border-secondary/50 shadow-[0_0_40px_rgba(6,182,212,0.2)]' : ''}
              ${event.type === 'neutral' ? 'border-white/20' : ''}
            `}
          >
            {/* Background glow blob */}
            <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none
              ${event.type === 'negative' ? 'bg-destructive' : ''}
              ${event.type === 'positive' ? 'bg-accent' : ''}
              ${event.type === 'paradox' ? 'bg-secondary' : ''}
            `} />

            <div className="flex flex-col items-center text-center space-y-4 relative z-10">
              <span className="text-5xl mb-2">{event.icon}</span>
              <h2 className="text-2xl font-bold text-foreground glow-text">{event.title}</h2>
              <p className="text-muted-foreground">{event.description}</p>

              <div className="w-full grid gap-3 pt-4">
                {event.choices?.map((choice, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const updates = choice.action(useGameStore.getState());
                      resolveEvent(updates);
                    }}
                    className="w-full py-3 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors font-medium text-sm flex items-center justify-center"
                  >
                    {choice.label}
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
