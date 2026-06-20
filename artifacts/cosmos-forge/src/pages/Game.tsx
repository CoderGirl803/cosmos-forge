import React from 'react';
import { useGameStore } from '../hooks/useGameStore';
import IntroScreen from '../components/IntroScreen';
import ParticleField from '../components/ParticleField';
import CivilizationView from '../components/CivilizationView';
import { motion, AnimatePresence } from 'framer-motion';

export default function Game() {
  const { phase, resetGame, planetName } = useGameStore();

  return (
    <div className="fixed inset-0 bg-background text-foreground overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" className="absolute inset-0" exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 1.5 }}>
            <IntroScreen />
          </motion.div>
        )}

        {phase === 'bigbang' && (
          <motion.div
            key="bigbang"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 z-50 bg-white"
          />
        )}

        {phase === 'particles' && (
          <motion.div key="particles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2, delay: 0.3 }} className="absolute inset-0">
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
            <div className="text-center space-y-6 max-w-md p-8 glass-panel rounded-2xl" style={{ boxShadow: phase === 'win' ? '0 0 60px rgba(251,191,36,0.3)' : '0 0 60px rgba(239,68,68,0.2)' }}>
              <div className="text-6xl mb-4">{phase === 'win' ? '🌌' : '🌑'}</div>
              <h1 className="text-3xl font-bold text-foreground">
                {phase === 'win' ? 'you did it!' : 'silence...'}
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed">
                {phase === 'win'
                  ? `${planetName} has joined the cosmic federation. a small world that reached the stars. ✨`
                  : `the last light on ${planetName} went out. the stars remain, indifferent and beautiful.`}
              </p>
              <button
                onClick={resetGame}
                className="px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/80 transition-all font-medium mt-4"
                style={{ boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}
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
