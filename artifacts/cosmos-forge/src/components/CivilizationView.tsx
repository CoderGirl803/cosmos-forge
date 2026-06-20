import React, { useState, useRef } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import StatsPanel from './StatsPanel';
import EventLog from './EventLog';
import EventPopup from './EventPopup';
import SignalPanel from './SignalPanel';
import { Play, Pause, FastForward } from 'lucide-react';
import { motion } from 'framer-motion';

const MIN_ZOOM = 0.6;
const MAX_ZOOM = 3.2;

export default function CivilizationView() {
  const { advanceTime, activeEvent, pendingSignalResponse, planetName } = useGameStore();
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const playRef = useRef(playing);
  playRef.current = playing;

  React.useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      advanceTime(10);
    }, 1000);
    return () => clearInterval(interval);
  }, [playing, advanceTime]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - e.deltaY * 0.001)));
  };

  const stars = React.useMemo(() =>
    Array.from({ length: 180 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.6 + 0.1,
      delay: Math.random() * 5
    })), []);

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-background">
      {/* Starfield */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {stars.map(star => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`, top: `${star.y}%`,
              width: star.size, height: star.size,
              opacity: star.opacity,
              animation: `float ${5 + star.delay}s infinite ease-in-out alternate`
            }}
          />
        ))}
      </div>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden z-10">
        <StatsPanel />

        {/* Planet viewport */}
        <div
          className="flex-1 flex items-center justify-center relative overflow-hidden"
          onWheel={handleWheel}
        >
          {/* Zoom hint */}
          <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-20">
            <button
              onClick={() => setZoom(z => Math.min(MAX_ZOOM, z + 0.25))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all hover:scale-110"
              style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}
            >+</button>
            <button
              onClick={() => setZoom(z => Math.max(MIN_ZOOM, z - 0.25))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all hover:scale-110"
              style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}
            >−</button>
            <div className="text-center text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{Math.round(zoom * 100)}%</div>
          </div>

          {/* Zoom hint text */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs z-20" style={{ color: 'rgba(255,255,255,0.2)' }}>
            scroll to zoom · drag to move
          </div>

          {/* Draggable, zoomable planet */}
          <motion.div
            drag
            dragMomentum={false}
            dragElastic={0.1}
            whileDrag={{ cursor: 'grabbing' }}
            className="relative cursor-grab"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* Outer atmosphere glow */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                inset: '-40%',
                background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
                filter: 'blur(20px)'
              }}
            />

            {/* Atmosphere ring */}
            <div
              className="w-64 h-64 rounded-full relative flex items-center justify-center"
              style={{
                background: 'radial-gradient(circle at 35% 35%, rgba(6,182,212,0.15), transparent 60%)',
                boxShadow: '0 0 60px rgba(6,182,212,0.2), 0 0 120px rgba(6,182,212,0.08)'
              }}
            >
              {/* Planet body */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
                className="w-48 h-48 rounded-full relative overflow-hidden"
                style={{
                  background: 'radial-gradient(circle at 35% 35%, #67e8f9 0%, #0891b2 35%, #065f80 60%, #0a4050 100%)',
                  boxShadow: '0 0 40px rgba(6,182,212,0.5), inset -15px -15px 30px rgba(0,0,0,0.6), inset 5px 5px 20px rgba(103,232,249,0.3)'
                }}
              >
                {/* Continents/surface detail */}
                <div className="absolute inset-0 opacity-40"
                  style={{
                    background: `
                      radial-gradient(ellipse 55% 35% at 40% 45%, rgba(34,197,94,0.8) 0%, transparent 60%),
                      radial-gradient(ellipse 30% 20% at 70% 30%, rgba(34,197,94,0.6) 0%, transparent 50%),
                      radial-gradient(ellipse 25% 15% at 25% 70%, rgba(34,197,94,0.5) 0%, transparent 50%)
                    `
                  }}
                />
                {/* Cloud layer */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 opacity-30 rounded-full"
                  style={{
                    background: `
                      radial-gradient(ellipse 60% 20% at 50% 30%, rgba(255,255,255,0.9) 0%, transparent 60%),
                      radial-gradient(ellipse 40% 15% at 70% 65%, rgba(255,255,255,0.7) 0%, transparent 50%)
                    `
                  }}
                />
              </motion.div>

              {/* Planet name label */}
              <div
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-medium tracking-widest"
                style={{ color: 'rgba(6,182,212,0.6)', whiteSpace: 'nowrap' }}
              >
                {planetName}
              </div>
            </div>
          </motion.div>
        </div>

        <EventLog />
      </div>

      {/* Bottom controls */}
      <div
        className="h-16 flex items-center justify-center gap-3 px-6 shrink-0 z-20"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,11,30,0.8)', backdropFilter: 'blur(12px)' }}
      >
        <button
          onClick={() => setPlaying(!playing)}
          className="p-2.5 rounded-full transition-colors"
          style={{ color: '#a78bfa', background: playing ? 'rgba(124,58,237,0.15)' : 'transparent' }}
        >
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {[
          { label: '+100 yrs', years: 100, color: '#94a3b8' },
          { label: '+1,000 yrs', years: 1000, color: '#a78bfa' },
          { label: '+1M yrs', years: 1_000_000, color: '#22d3ee' },
          { label: '+1B yrs', years: 1_000_000_000, color: '#fbbf24' },
        ].map(btn => (
          <button
            key={btn.label}
            onClick={() => advanceTime(btn.years)}
            className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all hover:-translate-y-0.5 hover:scale-105"
            style={{
              border: `1px solid ${btn.color}30`,
              background: `${btn.color}10`,
              color: btn.color
            }}
          >
            <FastForward className="w-3 h-3" />
            {btn.label}
          </button>
        ))}

        <div className="w-px h-6 bg-white/10 mx-1" />

        <SignalPanel />
      </div>

      <EventPopup event={activeEvent} />
    </div>
  );
}
