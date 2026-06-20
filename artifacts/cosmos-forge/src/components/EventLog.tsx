import React from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { AnimatePresence, motion } from 'framer-motion';

export default function EventLog() {
  const logs = useGameStore(s => s.logs);
  const suggestions = useGameStore(s => s.suggestions);
  const completeSuggestion = useGameStore(s => s.completeSuggestion);

  const activeSuggestions = suggestions.filter(s => s.unlocked && !s.completed).slice(0, 3);

  return (
    <div
      className="w-72 flex flex-col shrink-0 h-full"
      style={{ background: 'rgba(10,11,30,0.7)', backdropFilter: 'blur(12px)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Log section */}
      <div className="flex-1 flex flex-col min-h-0 p-4">
        <h3 className="text-sm font-bold text-amber-400 mb-3 shrink-0 tracking-wide">⭐ event log</h3>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <AnimatePresence initial={false}>
            {logs.map(log => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="text-xs p-2 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <span className="text-white/30 block mb-0.5">{log.time}</span>
                <span className="text-white/75">{log.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Suggestions section */}
      <div
        className="p-4 shrink-0 max-h-[52%] overflow-y-auto"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.15)' }}
      >
        <h3 className="text-sm font-bold text-purple-400 mb-3 tracking-wide">💡 suggestions</h3>
        <div className="space-y-2.5">
          <AnimatePresence>
            {activeSuggestions.map(s => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, height: 0, marginTop: 0 }}
                className="p-3 rounded-xl"
                style={{
                  background: 'rgba(124,58,237,0.05)',
                  border: '1px solid rgba(124,58,237,0.2)',
                  boxShadow: '0 0 15px rgba(124,58,237,0.08)'
                }}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-xl mt-0.5 shrink-0">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-purple-300 mb-1">{s.title}</h4>
                    <p className="text-xs text-white/45 leading-relaxed mb-2">{s.description}</p>
                    <button
                      onClick={() => completeSuggestion(s.id)}
                      className="w-full py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
                      style={{
                        background: 'rgba(124,58,237,0.2)',
                        border: '1px solid rgba(124,58,237,0.4)',
                        color: '#c4b5fd'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.35)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(124,58,237,0.2)')}
                    >
                      do it ✨
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {activeSuggestions.length === 0 && (
            <div className="text-center text-white/25 text-xs py-4 italic">
              waiting for the right moment...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
