import React, { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import IntroScreen from '../components/IntroScreen';
import ParticleField from '../components/ParticleField';
import CivilizationView from '../components/CivilizationView';
import DisasterAlert from '../components/DisasterAlert';
import DeathScreen from '../components/DeathScreen';
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

export default function Game() {
  const { phase, resetGame, deathReason } = useGameStore();
  const [senHovered, setSenHovered] = useState(false);

  return (
    <div className="fixed inset-0 bg-background text-foreground overflow-hidden star-cursor">
      <SoftMusic />
      <CursorTrail />
      {phase !== 'bigbang' && phase !== 'lose' && (
        <div
          className="fixed bottom-3 right-3 z-[80]"
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
              ☺
            </div>
          )}
          <div
            className="rounded-full p-1.5"
            style={{ background: 'rgba(5,7,20,0.58)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}
          >
            <img src="/sen-icon.svg" alt="sen" width={34} height={34} style={{ imageRendering: 'pixelated' }} />
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
