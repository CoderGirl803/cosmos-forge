import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../hooks/useGameStore';

export default function DisasterAlert() {
  const activeDisaster = useGameStore(s => s.activeDisaster);
  const dismissDisaster = useGameStore(s => s.dismissDisaster);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!activeDisaster) {
      return;
    }

    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(dismissDisaster, 400);
    }, 5500);

    return () => clearTimeout(t);
  }, [activeDisaster, dismissDisaster]);

  return (
    <AnimatePresence>
      {activeDisaster && visible && (
        <>
          {/* Screen flash */}
          <motion.div
            initial={{ opacity: 0.7 }}
            animate={{ opacity: [0.7, 0, 0.5, 0, 0.3, 0] }}
            transition={{ duration: 1.2, times: [0, 0.15, 0.3, 0.5, 0.7, 1] }}
            className="fixed inset-0 z-50 pointer-events-none"
            style={{ background: 'rgba(220,38,38,0.6)' }}
          />

          {/* Notification banner */}
          <motion.div
            initial={{ y: -120, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -120, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed top-6 left-1/2 z-50 flex flex-col items-center"
            style={{ transform: 'translateX(-50%)' }}
          >
            <div
              className="rounded-2xl px-8 py-5 flex flex-col items-center gap-2 max-w-lg w-full"
              style={{
                background: 'rgba(15,5,5,0.97)',
                border: '2px solid rgba(220,38,38,0.8)',
                boxShadow: '0 0 60px rgba(220,38,38,0.5), 0 0 120px rgba(220,38,38,0.2)',
              }}
            >
              {/* Pulsing icon */}
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.6, repeat: 4, repeatType: 'mirror' }}
                className="text-5xl mb-1"
              >
                {activeDisaster.icon}
              </motion.div>

              {/* Warning label */}
              <div className="text-xs font-bold tracking-[0.25em] uppercase" style={{ color: 'rgba(220,38,38,0.7)' }}>
                ⚠ natural disaster alert
              </div>

              {/* Title */}
              <div className="text-2xl font-bold tracking-wide" style={{ color: '#fca5a5' }}>
                {activeDisaster.title}
              </div>

              {/* Description */}
              <div className="text-sm text-center mt-1 leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {activeDisaster.description}
              </div>

              {/* Stats */}
              <div className="flex gap-4 mt-3 pt-3 w-full justify-center" style={{ borderTop: '1px solid rgba(220,38,38,0.2)' }}>
                {activeDisaster.deathPercent > 0 && (
                  <div className="text-center">
                    <div className="text-xl font-bold" style={{ color: '#f87171' }}>
                      ☠ {activeDisaster.deathPercent}%
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>population lost</div>
                  </div>
                )}
                {activeDisaster.energyLoss > 0 && (
                  <div className="text-center">
                    <div className="text-xl font-bold" style={{ color: '#fbbf24' }}>
                      ⚡ −{activeDisaster.energyLoss}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>energy lost</div>
                  </div>
                )}
                {activeDisaster.healthLoss > 0 && (
                  <div className="text-center">
                    <div className="text-xl font-bold" style={{ color: '#fb923c' }}>
                      💔 −{activeDisaster.healthLoss}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>health lost</div>
                  </div>
                )}
              </div>

              {/* Dismiss */}
              <button
                onClick={() => { setVisible(false); setTimeout(dismissDisaster, 400); }}
                className="mt-2 text-xs px-4 py-1.5 rounded-full transition-colors"
                style={{ color: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                dismiss
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
