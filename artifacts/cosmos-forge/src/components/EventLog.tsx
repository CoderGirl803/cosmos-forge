import React from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { AnimatePresence, motion } from 'framer-motion';

export default function EventLog() {
  const logs = useGameStore(s => s.logs);
  const suggestions = useGameStore(s => s.suggestions);
  const completeSuggestion = useGameStore(s => s.completeSuggestion);
  const { population, tech, energy, health, moons, signals, shieldLevel, era } = useGameStore();

  const activeSuggestions = suggestions.filter(s => s.unlocked && !s.completed).slice(0, 3);
  const quests = [
    { icon: '🦠', label: 'spark life', value: Math.min(1, population / 1), target: population > 0 ? 'done' : '0/1' },
    { icon: '🌙', label: 'make a moon', value: Math.min(1, moons.length / 1), target: `${Math.min(1, moons.length)}/1` },
    { icon: '📡', label: 'send signal', value: Math.min(1, signals.length / 1), target: `${Math.min(1, signals.length)}/1` },
    { icon: '🛡️', label: 'raise shield', value: Math.min(1, shieldLevel / 1), target: `${Math.min(1, shieldLevel)}/1` },
    { icon: '🔬', label: 'reach 50 tech', value: Math.min(1, tech / 50), target: `${Math.min(50, Math.floor(tech))}/50` },
    { icon: '🚀', label: 'reach space', value: era === 'cosmic' ? 1 : 0, target: era === 'cosmic' ? 'done' : 'locked' },
  ].filter(q => q.value < 1).slice(0, 3);
  const vibe = health > 70 && energy > 40 ? 'thriving' : health > 35 ? 'unstable' : 'critical';

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
        <div className="mb-4 rounded-xl p-3"
          style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.16)' }}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-cyan-300 tracking-wide">🎯 quests</h3>
            <span className="text-[10px] uppercase text-white/35">{vibe}</span>
          </div>
          <div className="space-y-2">
            {quests.map(q => (
              <div key={q.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/70">{q.icon} {q.label}</span>
                  <span className="text-white/35">{q.target}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.round(q.value * 100)}%`, background: '#22d3ee', boxShadow: '0 0 10px rgba(34,211,238,0.55)' }} />
                </div>
              </div>
            ))}
            {quests.length === 0 && <div className="text-xs text-white/35 italic">all quick quests cleared. chase the stars.</div>}
          </div>
        </div>

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
