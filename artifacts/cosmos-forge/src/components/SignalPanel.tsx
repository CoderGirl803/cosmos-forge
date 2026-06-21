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
  const { sendSignal, deliverSignalResponse, dismissSignalResponse, pendingSignalResponse, signals } = useGameStore();
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
            className="fixed inset-0 z-[90] flex items-center justify-center px-4 pt-4 pb-24"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-[520px] max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl p-6"
              style={{
                background: 'rgba(10,11,30,0.95)',
                border: '1.5px solid rgba(124,58,237,0.4)',
                boxShadow: '0 0 50px rgba(124,58,237,0.3)'
              }}
            >
              <h3 className="text-lg font-bold text-white mb-1">📡 send a signal</h3>
              <p className="text-white/50 text-xs mb-5">choose a target. responses may take time. some bring gifts. some bring war.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5 max-h-[34vh] overflow-y-auto pr-1">
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
            className="fixed inset-0 z-[95] flex items-center justify-center px-4 pt-4 pb-24"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ scale: 0.7, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="max-w-md w-full mx-4 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl p-8 text-center"
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

              <button
                onClick={dismissSignalResponse}
                className="px-8 py-3 rounded-full font-semibold text-white transition-all hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${typeColors[resp.type]}80, ${typeColors[resp.type]}40)`,
                  border: `1px solid ${typeColors[resp.type]}60`,
                  boxShadow: `0 0 20px ${typeColors[resp.type]}40`
                }}
              >
                {resp.type === 'war' || resp.type === 'invasion' ? 'brace for impact 💀' : 'acknowledge ✨'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
