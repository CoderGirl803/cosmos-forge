import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../hooks/useGameStore';
import { OTHER_PLANETS } from '../data/gameData';

const typeColors: Record<string, string> = {
  war:      '#ef4444',
  invasion: '#dc2626',
  tech:     '#22d3ee',
  food:     '#22c55e',
  alliance: '#fbbf24',
  trade:    '#a78bfa',
  silence:  '#64748b',
};

const typeLabel: Record<string, string> = {
  war:      '⚔️ war declared!',
  invasion: '👾 invasion incoming!',
  tech:     '🔬 tech received!',
  food:     '🌾 supplies received!',
  alliance: '🤝 alliance formed!',
  trade:    '💱 trade route opened!',
  silence:  '🌌 no response.',
};

export default function SignalPanel() {
  const {
    sendSignal, deliverSignalResponse, dismissSignalResponse, pendingSignalResponse,
    battleCount, activeBattle, engageSignalBattle, resolveBattleChoice,
  } = useGameStore();
  const [open, setOpen] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState('');
  const [sentId, setSentId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // When a signal is sent, schedule a response
  useEffect(() => {
    if (!sentId) return;
    const delay = 4000 + Math.random() * 8000;
    const timer = setTimeout(() => {
      deliverSignalResponse(sentId);
      setSentId(null);
      setSending(false);
    }, delay);
    return () => clearTimeout(timer);
  }, [sentId, deliverSignalResponse]);

  const handleSend = () => {
    if (!selectedPlanet || sending) return;
    setSending(true);
    const id = sendSignal(selectedPlanet);
    setSentId(id);
    setOpen(false);
    setSelectedPlanet('');
  };

  const resp = pendingSignalResponse;

  return (
    <>
      {/* Send signal button */}
      <button
        onClick={() => setOpen(true)}
        disabled={sending}
        className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        style={{
          border: '1px solid rgba(124,58,237,0.5)',
          background: 'rgba(124,58,237,0.1)',
          color: '#a78bfa',
          boxShadow: sending ? '0 0 20px rgba(124,58,237,0.4)' : 'none'
        }}
        data-testid="button-send-signal"
      >
        <span>{sending ? '📡' : '📡'}</span>
        {sending ? 'signal sent...' : 'send signal'}
      </button>

      {/* Planet picker modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-0 pb-32"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-[500px] max-h-[calc(100vh-7rem)] overflow-y-auto rounded-b-2xl p-5"
              style={{
                background: 'rgba(10,11,30,0.95)',
                border: '1.5px solid rgba(124,58,237,0.4)',
                boxShadow: '0 0 50px rgba(124,58,237,0.3)'
              }}
            >
              <h3 className="text-lg font-bold text-white mb-1">📡 send a signal</h3>
              <p className="text-white/50 text-xs mb-5">choose a target. responses may take time. some bring gifts. some bring war.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5 max-h-[24vh] overflow-y-auto pr-1">
                {OTHER_PLANETS.map(planet => (
                  <button
                    key={planet}
                    onClick={() => setSelectedPlanet(planet)}
                    className="px-3 py-2.5 rounded-lg text-sm text-left transition-all truncate"
                    style={{
                      background: selectedPlanet === planet ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.04)',
                      border: selectedPlanet === planet ? '1px solid rgba(124,58,237,0.6)' : '1px solid rgba(255,255,255,0.07)',
                      color: selectedPlanet === planet ? '#c4b5fd' : '#94a3b8'
                    }}
                  >
                    🌍 {planet}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm text-white/50"
                  style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'transparent' }}
                >
                  cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={!selectedPlanet}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                    color: 'white',
                    boxShadow: selectedPlanet ? '0 0 20px rgba(124,58,237,0.5)' : 'none'
                  }}
                >
                  transmit ✨
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Signal response notification — shown dramatically */}
      <AnimatePresence>
        {resp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] flex items-start justify-center px-4 pt-0 pb-32"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ scale: 0.7, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="max-w-md w-full mx-4 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-b-2xl p-6 text-center"
              style={{
                background: 'rgba(10,11,30,0.97)',
                border: `2px solid ${typeColors[resp.type] ?? '#475569'}`,
                boxShadow: `0 0 80px ${typeColors[resp.type]}60, 0 0 30px ${typeColors[resp.type]}30`
              }}
            >
              {/* Big pulsing icon */}
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: 3 }}
                className="text-7xl mb-5"
              >
                {resp.icon}
              </motion.div>

              <div
                className="inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-4"
                style={{
                  background: `${typeColors[resp.type]}20`,
                  border: `1px solid ${typeColors[resp.type]}50`,
                  color: typeColors[resp.type]
                }}
              >
                {typeLabel[resp.type] ?? resp.type}
              </div>

              <p className="text-white/50 text-xs mb-2">response from: <span className="text-white/80">{resp.from}</span></p>
              <p className="text-white/80 text-sm leading-relaxed mb-6">{resp.message}</p>

              {(resp.type === 'war' || resp.type === 'invasion') && battleCount < 2 && (
                <button
                  onClick={engageSignalBattle}
                  className="mb-3 px-8 py-3 rounded-full font-semibold text-white transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239,68,68,0.9), rgba(124,58,237,0.62))',
                    border: '1px solid rgba(248,113,113,0.75)',
                    boxShadow: '0 0 28px rgba(239,68,68,0.42)',
                  }}
                >
                  engage in battle
                </button>
              )}

              <button
                onClick={dismissSignalResponse}
                className="px-8 py-3 rounded-full font-semibold text-white transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${typeColors[resp.type]}80, ${typeColors[resp.type]}40)`,
                  border: `1px solid ${typeColors[resp.type]}60`,
                  boxShadow: `0 0 20px ${typeColors[resp.type]}40`
                }}
              >
                {resp.type === 'war' || resp.type === 'invasion' ? 'take the hit' : 'acknowledge ✨'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeBattle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
            style={{ background: 'radial-gradient(circle at 50% 55%, rgba(8,47,73,0.78), rgba(2,6,23,0.96) 65%)' }}
          >
            <motion.div
              initial={{ scale: 1.4, filter: 'blur(10px)' }}
              animate={{ scale: 1, filter: 'blur(0px)' }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-3xl overflow-hidden rounded-2xl"
              style={{ border: '1px solid rgba(248,113,113,0.35)', background: 'rgba(5,7,20,0.9)', boxShadow: '0 0 80px rgba(239,68,68,0.22)' }}
            >
              <div className="relative h-[360px] overflow-hidden">
                <div className="absolute inset-0" style={{
                  background: `
                    radial-gradient(circle at 50% 115%, rgba(34,197,94,0.42), transparent 50%),
                    radial-gradient(circle at 50% 52%, #287080 0%, #123843 28%, #081826 65%, #050714 100%)
                  `
                }} />
                <div className="absolute left-5 top-5 rounded-full px-3 py-1 text-xs font-mono" style={{ color: '#fca5a5', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.28)' }}>
                  battle {battleCount}/2 · wave {activeBattle.round}/3 · {activeBattle.from}
                </div>
                <div className="absolute left-6 bottom-5 text-sm font-mono" style={{ color: '#93c5fd' }}>
                  your civilization: {activeBattle.player}
                </div>
                <div className="absolute right-6 bottom-5 text-sm font-mono" style={{ color: '#fca5a5' }}>
                  aliens: {activeBattle.enemy}
                </div>
                {Array.from({ length: Math.min(42, Math.ceil(activeBattle.player / 3)) }).map((_, i) => (
                  <motion.div
                    key={`blue-${i}`}
                    animate={{ x: [0, 8, -3, 0], y: [0, -4, 2, 0] }}
                    transition={{ duration: 1.6 + (i % 5) * 0.12, repeat: Infinity }}
                    className="absolute rounded-full"
                    style={{
                      left: `${12 + (i % 7) * 5}%`,
                      top: `${54 + Math.floor(i / 7) * 6}%`,
                      width: 9,
                      height: 9,
                      background: '#38bdf8',
                      boxShadow: '0 0 12px rgba(56,189,248,0.85)',
                    }}
                  />
                ))}
                {Array.from({ length: Math.min(48, Math.ceil(activeBattle.enemy / 3)) }).map((_, i) => (
                  <motion.div
                    key={`red-${i}`}
                    animate={{ x: [0, -10, 4, 0], y: [0, 4, -2, 0] }}
                    transition={{ duration: 1.4 + (i % 6) * 0.1, repeat: Infinity }}
                    className="absolute rounded-full"
                    style={{
                      right: `${12 + (i % 8) * 4.5}%`,
                      top: `${28 + Math.floor(i / 8) * 6}%`,
                      width: 9,
                      height: 9,
                      background: '#ef4444',
                      boxShadow: '0 0 12px rgba(239,68,68,0.9)',
                    }}
                  />
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-4">
                <button onClick={() => resolveBattleChoice('shield')} className="rounded-xl px-3 py-3 text-sm font-semibold" style={{ color: '#bfdbfe', border: '1px solid rgba(147,197,253,0.3)', background: 'rgba(59,130,246,0.12)' }}>raise shields</button>
                <button onClick={() => resolveBattleChoice('tech')} className="rounded-xl px-3 py-3 text-sm font-semibold" style={{ color: '#67e8f9', border: '1px solid rgba(34,211,238,0.3)', background: 'rgba(6,182,212,0.12)' }}>use tech weapons</button>
                <button onClick={() => resolveBattleChoice('charge')} className="rounded-xl px-3 py-3 text-sm font-semibold" style={{ color: '#fecaca', border: '1px solid rgba(248,113,113,0.35)', background: 'rgba(239,68,68,0.14)' }}>counterattack</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
