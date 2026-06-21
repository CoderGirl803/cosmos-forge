import React from 'react';
import { useGameStore } from '../hooks/useGameStore';
import IntroScreen from '../components/IntroScreen';
import ParticleField from '../components/ParticleField';
import CivilizationView from '../components/CivilizationView';
import DisasterAlert from '../components/DisasterAlert';
import DeathScreen from '../components/DeathScreen';
import { motion, AnimatePresence } from 'framer-motion';

export default function Game() {
  const { phase, resetGame, deathReason } = useGameStore();

  return (
    <div className="fixed inset-0 bg-background text-foreground overflow-hidden star-cursor">
      {phase !== 'bigbang' && phase !== 'lose' && (
        <div className="fixed top-3 right-3 z-[80] flex items-center gap-2 rounded-full px-2.5 py-1.5"
          style={{ background: 'rgba(5,7,20,0.62)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
          <img src="/sen-icon.svg" alt="sen" width={28} height={28} style={{ imageRendering: 'pixelated' }} />
          <span className="text-xs text-white/60">hi, i'm sen</span>
        </div>
      )}
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" className="absolute inset-0"
            exit={{ opacity: 0, scale: 1.08 }} transition={{ duration: 1.5 }}>
            <IntroScreen />
          </motion.div>
        )}

        {phase === 'bigbang' && (
          <motion.div
            key="bigbang"
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, times: [0, 0.6, 1] }}
            className="absolute inset-0 z-50 bg-white"
          />
        )}

        {phase === 'particles' && (
          <motion.div key="particles" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.3 }} className="absolute inset-0">
            <ParticleField />
          </motion.div>
        )}

        {phase === 'civilization' && (
          <motion.div key="civ" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 2 }} className="absolute inset-0">
            <CivilizationView />
            <DisasterAlert />
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'lose' && (
        <DeathScreen
          reason={deathReason || 'the last light on your planet went out. the stars remain, indifferent and beautiful.'}
          onRestart={resetGame}
        />
      )}
    </div>
  );
}
