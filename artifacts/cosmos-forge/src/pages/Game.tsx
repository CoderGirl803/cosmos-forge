import React from 'react';
import { useGameStore } from '../hooks/useGameStore';
import IntroScreen from '../components/IntroScreen';
import ParticleField from '../components/ParticleField';
import CivilizationView from '../components/CivilizationView';
import { motion, AnimatePresence } from 'framer-motion';

export default function Game() {
  const { phase, resetGame } = useGameStore();

  return (
    <div className="min-h-screen w-full bg-background text-foreground overflow-hidden relative">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 1.5 }}>
            <IntroScreen />
          </motion.div>
        )}
        
        {phase === 'bigbang' && (
          <motion.div 
            key="bigbang"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, backgroundColor: '#ffffff' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 z-50 flex items-center justify-center"
          />
        )}

        {phase === 'particles' && (
          <motion.div key="particles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2, delay: 0.5 }} className="absolute inset-0">
            <ParticleField />
          </motion.div>
        )}

        {phase === 'civilization' && (
          <motion.div key="civ" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} className="absolute inset-0">
            <CivilizationView />
          </motion.div>
        )}

        {(phase === 'win' || phase === 'lose') && (
          <motion.div key="end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md">
            <div className="text-center space-y-6 max-w-md p-8 glass-panel rounded-xl glow-border">
              <h1 className="text-4xl font-bold glow-text">
                {phase === 'win' ? '🌌 you did it!' : '🌑 silence...'}
              </h1>
              <p className="text-muted-foreground text-lg">
                {phase === 'win' ? 'terra-9 has joined the cosmic federation. your small universe flourishes.' : 'the last light went out. but the stars remain.'}
              </p>
              <button 
                onClick={resetGame}
                className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/80 transition-all font-medium glow-border mt-4"
              >
                play again ✨
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
