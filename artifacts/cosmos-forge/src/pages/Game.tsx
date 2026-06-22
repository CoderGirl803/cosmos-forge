import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import IntroScreen from '../components/IntroScreen';
import ParticleField from '../components/ParticleField';
import CivilizationView from '../components/CivilizationView';
import DisasterAlert from '../components/DisasterAlert';
import DeathScreen from '../components/DeathScreen';
import { syncUniverseEmailStats, UNIVERSE_EMAIL_KEY } from '../components/EmailSignupNote';
import { motion, AnimatePresence } from 'framer-motion';

function CursorTrail() {
  const [points, setPoints] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    let id = 0;
    const onMove = (event: PointerEvent) => {
      const next = { id: id++, x: event.clientX, y: event.clientY };
      setPoints(current => [...current.slice(-9), next]);
      window.setTimeout(() => {
        setPoints(current => current.filter(point => point.id !== next.id));
      }, 520);
    };

    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[120]">
      {points.map((point, index) => (
        <span
          key={point.id}
          className="absolute"
          style={{
            left: point.x,
            top: point.y,
            color: 'rgba(248,250,252,0.75)',
            fontSize: 8 + index,
            transform: 'translate(-50%, -50%)',
            opacity: (index + 1) / points.length,
            textShadow: '0 0 10px rgba(255,255,255,0.75)',
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

function SoftMusic() {
  const audioRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<Array<OscillatorNode | GainNode | BiquadFilterNode>>([]);

  useEffect(() => {
    const start = () => {
      if (audioRef.current) {
        void audioRef.current.resume();
        return;
      }

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const context = new AudioContextClass();
      const master = context.createGain();
      const filter = context.createBiquadFilter();
      master.gain.value = 0.025;
      filter.type = 'lowpass';
      filter.frequency.value = 900;
      filter.connect(master);
      master.connect(context.destination);

      [174.61, 261.63, 329.63].forEach((frequency, index) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = 'sine';
        osc.frequency.value = frequency;
        gain.gain.value = index === 0 ? 0.22 : 0.1;
        osc.connect(gain);
        gain.connect(filter);
        osc.start();
        nodesRef.current.push(osc, gain);
      });

      audioRef.current = context;
      nodesRef.current.push(filter, master);
    };

    window.addEventListener('pointerdown', start, { once: true });
    return () => {
      window.removeEventListener('pointerdown', start);
      nodesRef.current.forEach(node => {
        if ('stop' in node) {
          try { node.stop(); } catch {}
        }
        node.disconnect();
      });
      void audioRef.current?.close();
    };
  }, []);

  return null;
}

function BigBangFlash() {
  const letters = 'big bang'.split('');

  return (
    <motion.div
      key="bigbang"
      initial={{ opacity: 1 }}
      animate={{ opacity: [1, 1, 0] }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.42, times: [0, 0.72, 1] }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-white"
    >
      <div
        className="font-serif font-black lowercase tracking-normal"
        style={{
          color: '#050714',
          fontSize: 'clamp(4.5rem, 17vw, 13rem)',
          textShadow: '0 0 28px rgba(5,7,20,0.18)',
        }}
      >
        {letters.map((letter, index) => (
          <motion.span
            key={`${letter}-${index}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.035, duration: 0.035 }}
          >
            {letter === ' ' ? '\u00a0' : letter}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

function UniverseEmailStatsSync() {
  const { phase, year, population, food, energy, tech, health, moons } = useGameStore();

  useEffect(() => {
    if (!localStorage.getItem(UNIVERSE_EMAIL_KEY)) return;
    void syncUniverseEmailStats();
  }, [phase, year, population, food, energy, tech, health, moons.length]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (localStorage.getItem(UNIVERSE_EMAIL_KEY)) {
        void syncUniverseEmailStats();
      }
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  return null;
}

export default function Game() {
  const { phase, resetGame, deathReason } = useGameStore();
  const [senHovered, setSenHovered] = useState(false);

  return (
    <div className="fixed inset-0 bg-background text-foreground overflow-hidden star-cursor">
      <SoftMusic />
      <CursorTrail />
      <UniverseEmailStatsSync />
      {phase !== 'bigbang' && phase !== 'lose' && (
        <div
          className="fixed bottom-1 right-1 z-[80] opacity-55 hover:opacity-100 transition-opacity"
          onMouseEnter={() => setSenHovered(true)}
          onMouseLeave={() => setSenHovered(false)}
        >
          {senHovered && (
            <div
              className="absolute bottom-full right-0 mb-2 rounded-full px-3 py-1.5 text-xs"
              style={{
                background: 'rgba(5,7,20,0.86)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(226,232,240,0.82)',
                whiteSpace: 'nowrap',
                backdropFilter: 'blur(10px)',
              }}
            >
              hi, im sen.
            </div>
          )}
          <div
            className="rounded-full p-1"
            style={{ background: 'rgba(5,7,20,0.32)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)' }}
          >
            <img src="/sen-icon.svg" alt="sen" width={28} height={28} style={{ imageRendering: 'pixelated' }} />
          </div>
        </div>
      )}
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" className="absolute inset-0"
            exit={{ opacity: 0, scale: 1.08 }} transition={{ duration: 1.5 }}>
            <IntroScreen />
          </motion.div>
        )}

        {phase === 'bigbang' && <BigBangFlash />}

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
