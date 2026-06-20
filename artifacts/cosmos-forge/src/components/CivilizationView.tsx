import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useGameStore } from '../hooks/useGameStore';
import StatsPanel from './StatsPanel';
import EventLog from './EventLog';
import EventPopup from './EventPopup';
import SignalPanel from './SignalPanel';
import { Play, Pause, FastForward, ChevronUp, ChevronDown } from 'lucide-react';

const MIN_ZOOM = 0.15;
const MAX_ZOOM = 2.0;
const CONTAINER = 4000;
const C = CONTAINER / 2; // 2000 = center

interface SolarObj {
  id: string;
  x: number; y: number;
  size: number;
  color: string;
  bg: string;
  label: string;
  type: 'rock' | 'smallPlanet' | 'largePlanet' | 'sun';
}

const SOLAR_OBJS: SolarObj[] = [
  { id: 'r1', x: 1250, y: 1050, size: 18, color: '#9ca3af', bg: 'radial-gradient(circle at 40% 30%, #9ca3af, #4b5563)', label: 'barren rock', type: 'rock' },
  { id: 'r2', x: 2750, y: 1100, size: 14, color: '#78716c', bg: 'radial-gradient(circle at 40% 30%, #a8a29e, #44403c)', label: 'asteroid', type: 'rock' },
  { id: 'r3', x: 1100, y: 2850, size: 22, color: '#6b7280', bg: 'radial-gradient(circle at 35% 35%, #9ca3af, #374151)', label: 'iron rock', type: 'rock' },
  { id: 'r4', x: 2900, y: 2900, size: 15, color: '#92400e', bg: 'radial-gradient(circle at 40% 30%, #b45309, #78350f)', label: 'scorched rock', type: 'rock' },
  { id: 'p1', x: 650, y: 2000, size: 52, color: '#ef4444', bg: 'radial-gradient(circle at 35% 30%, #f87171, #991b1b, #7f1d1d)', label: 'ember world', type: 'smallPlanet' },
  { id: 'p2', x: 3350, y: 1950, size: 60, color: '#f97316', bg: 'radial-gradient(circle at 35% 30%, #fb923c, #c2410c, #9a3412)', label: 'amber planet', type: 'smallPlanet' },
  { id: 'p3', x: 2000, y: 400, size: 45, color: '#60a5fa', bg: 'radial-gradient(circle at 35% 30%, #93c5fd, #1d4ed8, #1e3a8a)', label: 'frozen world', type: 'smallPlanet' },
  { id: 'gg', x: 3500, y: 3400, size: 115, color: '#fbbf24', bg: 'radial-gradient(circle at 35% 30%, #fef08a, #f59e0b, #b45309, #78350f)', label: 'gas giant', type: 'largePlanet' },
  { id: 'sun2', x: 300, y: 280, size: 155, color: '#fef9c3', bg: 'radial-gradient(circle, #fffbeb, #fef08a, #fde047, #facc15)', label: 'distant star', type: 'sun' },
];

const DRAGGABLE_ROCKS = [
  { id: 'dr1', dx: -290, dy: -230, size: 18, color: '#9ca3af', bg: 'radial-gradient(circle at 40% 30%, #9ca3af, #374151)', label: 'stray rock' },
  { id: 'dr2', dx: 260, dy: -200, size: 14, color: '#a8a29e', bg: 'radial-gradient(circle at 40% 30%, #d6d3d1, #57534e)', label: 'meteorite' },
  { id: 'dr3', dx: -260, dy: 240, size: 22, color: '#6b7280', bg: 'radial-gradient(circle at 35% 35%, #9ca3af, #374151)', label: 'debris' },
  { id: 'dr4', dx: 280, dy: 260, size: 38, color: '#f97316', bg: 'radial-gradient(circle at 35% 30%, #fb923c, #9a3412)', label: 'proto-moon' },
];

export default function CivilizationView() {
  const { advanceTime, activeEvent, activeDisaster, planetName, addLog, addMoon, moons } = useGameStore();
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [capturedRocks, setCapturedRocks] = useState<Set<string>>(new Set());

  const planetBodyRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => advanceTime(10), 1200);
    return () => clearInterval(interval);
  }, [playing, advanceTime]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - e.deltaY * 0.0012)));
  }, []);

  const getPlanetCenter = useCallback(() => {
    if (!planetBodyRef.current) return null;
    const r = planetBodyRef.current.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, []);

  const handleRockDragEnd = useCallback((rock: typeof DRAGGABLE_ROCKS[0], info: PanInfo) => {
    const center = getPlanetCenter();
    if (!center) return;
    const dist = Math.hypot(info.point.x - center.x, info.point.y - center.y);
    if (dist < 130) {
      setCapturedRocks(prev => new Set([...prev, rock.id]));
      const moonSize = Math.max(5, rock.size * 0.45);
      addMoon({ id: rock.id, color: rock.color, size: moonSize, orbitSpeed: 0.5 + Math.random() * 1.2 });
      addLog(`🌙 ${rock.label} captured — now orbiting ${planetName}!`);
    }
  }, [getPlanetCenter, addMoon, addLog, planetName]);

  const stars = useMemo(() =>
    Array.from({ length: 200 }).map((_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 2.2 + 0.5, opacity: Math.random() * 0.55 + 0.08, delay: Math.random() * 6
    })), []);

  const zoomHint = zoom < 0.5 ? 'solar system view' : zoom < 0.75 ? 'zoom out to see more' : '';

  return (
    <div className={`w-full h-full flex flex-col relative overflow-hidden bg-background ${activeDisaster ? 'screen-shake' : ''}`}>
      {/* Starfield */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {stars.map(s => (
          <div key={s.id} className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, opacity: s.opacity }} />
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden z-10 relative">
        <StatsPanel />

        {/* Planet viewport */}
        <div
          ref={viewportRef}
          className="flex-1 relative overflow-hidden flex items-center justify-center"
          onWheel={handleWheel}
          style={{ cursor: 'crosshair' }}
        >
          {/* Solar system container — scales around center */}
          <div
            style={{
              position: 'absolute',
              width: CONTAINER,
              height: CONTAINER,
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) scale(${zoom})`,
              transformOrigin: 'center center',
              pointerEvents: 'none',
            }}
          >
            {/* Background solar objects */}
            {SOLAR_OBJS.map(obj => {
              const distFromCenter = Math.hypot(obj.x - C, obj.y - C);
              const rawOpacity = ((C / distFromCenter) * zoom - 0.6) * 2.5;
              const opacity = Math.min(1, Math.max(0, 1 - rawOpacity));
              if (opacity < 0.01) return null;
              const isGiant = obj.type === 'largePlanet' || obj.type === 'sun';
              return (
                <div
                  key={obj.id}
                  style={{
                    position: 'absolute',
                    left: obj.x - obj.size,
                    top: obj.y - obj.size,
                    width: obj.size * 2,
                    height: obj.size * 2,
                    opacity,
                    transition: 'opacity 0.4s',
                  }}
                >
                  <div className="w-full h-full rounded-full"
                    style={{
                      background: obj.bg,
                      boxShadow: isGiant
                        ? `0 0 ${obj.size * 1.5}px ${obj.color}60, 0 0 ${obj.size * 3}px ${obj.color}20`
                        : `0 0 ${obj.size * 0.8}px ${obj.color}50`,
                    }}
                  />
                  <div style={{
                    position: 'absolute', top: '110%', left: '50%', transform: 'translateX(-50%)',
                    color: 'rgba(255,255,255,0.35)', fontSize: 12, whiteSpace: 'nowrap', fontFamily: 'monospace'
                  }}>
                    {obj.label}
                  </div>
                </div>
              );
            })}

            {/* ── PLANET AT CENTER ── */}
            <div
              style={{
                position: 'absolute',
                left: C,
                top: C,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'auto',
                zIndex: 10,
              }}
            >
              {/* Atmosphere glow */}
              <div className="absolute rounded-full pointer-events-none"
                style={{
                  inset: '-50%',
                  background: 'radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 70%)',
                  filter: 'blur(22px)',
                }}
              />

              {/* Moons orbiting */}
              {moons.map((moon, i) => {
                const r = 115 + i * 38;
                const dur = 6 / moon.orbitSpeed;
                return (
                  <motion.div
                    key={moon.id}
                    animate={{ rotate: 360 }}
                    transition={{ duration: dur, repeat: Infinity, ease: 'linear' }}
                    style={{
                      position: 'absolute',
                      top: '50%', left: '50%',
                      width: 0, height: 0,
                      zIndex: 5,
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      left: r - moon.size,
                      top: -moon.size,
                      width: moon.size * 2,
                      height: moon.size * 2,
                      borderRadius: '50%',
                      background: `radial-gradient(circle at 35% 30%, ${moon.color}ff, ${moon.color}44)`,
                      boxShadow: `0 0 ${moon.size * 1.5}px ${moon.color}60`,
                    }} />
                  </motion.div>
                );
              })}

              {/* Orbit rings for moons */}
              {moons.map((moon, i) => {
                const r = 115 + i * 38;
                return (
                  <div key={`ring-${moon.id}`} style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    width: r * 2, height: r * 2,
                    marginLeft: -r, marginTop: -r,
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.05)',
                    pointerEvents: 'none',
                  }} />
                );
              })}

              {/* Planet body */}
              <div
                style={{
                  position: 'relative',
                  width: 220,
                  height: 220,
                  background: 'radial-gradient(circle at 35% 35%, #67e8f9, #0891b2, #065f80, #0a4050)',
                  borderRadius: '50%',
                  boxShadow: '0 0 60px rgba(6,182,212,0.5), inset -20px -20px 40px rgba(0,0,0,0.6), inset 8px 8px 25px rgba(103,232,249,0.25)',
                }}
                ref={planetBodyRef}
              >
                {/* Continents */}
                <div className="absolute inset-0 rounded-full opacity-40" style={{
                  background: `
                    radial-gradient(ellipse 55% 35% at 40% 45%, rgba(34,197,94,0.85) 0%, transparent 60%),
                    radial-gradient(ellipse 30% 20% at 72% 30%, rgba(34,197,94,0.65) 0%, transparent 50%),
                    radial-gradient(ellipse 25% 18% at 22% 68%, rgba(34,197,94,0.55) 0%, transparent 55%)
                  `
                }} />
                {/* Cloud layer */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full opacity-25"
                  style={{
                    background: `
                      radial-gradient(ellipse 60% 22% at 50% 28%, rgba(255,255,255,0.95), transparent 60%),
                      radial-gradient(ellipse 40% 18% at 68% 62%, rgba(255,255,255,0.8), transparent 55%)
                    `
                  }}
                />
                {/* Atmosphere rim */}
                <div className="absolute rounded-full pointer-events-none" style={{
                  inset: -8,
                  border: '2px solid rgba(6,182,212,0.18)',
                  boxShadow: '0 0 25px rgba(6,182,212,0.15) inset',
                }} />
              </div>

              {/* Planet label */}
              <div style={{
                position: 'absolute',
                top: '100%', marginTop: 16,
                left: '50%', transform: 'translateX(-50%)',
                color: 'rgba(6,182,212,0.55)',
                fontSize: 14, letterSpacing: '0.2em',
                whiteSpace: 'nowrap', fontFamily: 'monospace',
                textShadow: '0 0 12px rgba(6,182,212,0.4)',
              }}>
                {planetName}
              </div>
            </div>
          </div>

          {/* ── DRAGGABLE ROCKS (unscaled, viewport-space) ── */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {DRAGGABLE_ROCKS.filter(r => !capturedRocks.has(r.id)).map(rock => {
              const visible = zoom < 0.85;
              const scale = Math.min(1, (0.85 - zoom) / 0.2 + 0.1);
              return (
                <motion.div
                  key={rock.id}
                  drag
                  dragSnapToOrigin
                  dragMomentum={false}
                  whileDrag={{ scale: 1.2, zIndex: 30, cursor: 'grabbing' }}
                  onDragEnd={(_, info) => handleRockDragEnd(rock, info)}
                  style={{
                    position: 'absolute',
                    top: `calc(50% + ${rock.dy}px)`,
                    left: `calc(50% + ${rock.dx}px)`,
                    width: rock.size * 2,
                    height: rock.size * 2,
                    marginTop: -rock.size,
                    marginLeft: -rock.size,
                    cursor: visible ? 'grab' : 'default',
                    pointerEvents: visible ? 'auto' : 'none',
                    opacity: visible ? scale : 0,
                    transition: 'opacity 0.3s',
                    zIndex: 20,
                  }}
                >
                  <div className="w-full h-full rounded-full flex items-center justify-center"
                    style={{
                      background: rock.bg,
                      boxShadow: `0 0 ${rock.size * 0.8}px ${rock.color}60`,
                    }}
                  />
                  <div style={{
                    position: 'absolute', top: '115%', left: '50%', transform: 'translateX(-50%)',
                    color: 'rgba(255,255,255,0.35)', fontSize: 10, whiteSpace: 'nowrap',
                  }}>
                    {rock.label}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Zoom controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-30">
            <button onClick={() => setZoom(z => Math.min(MAX_ZOOM, z + 0.2))}
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all hover:scale-110"
              style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
              +
            </button>
            <button onClick={() => setZoom(z => Math.max(MIN_ZOOM, z - 0.2))}
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all hover:scale-110"
              style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>
              −
            </button>
            <div className="text-center text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {Math.round(zoom * 100)}%
            </div>
          </div>

          {/* Zoom hint */}
          {zoomHint && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 text-xs px-3 py-1.5 rounded-full"
              style={{ color: 'rgba(255,255,255,0.35)', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
              {zoomHint}
            </div>
          )}
          {zoom >= 0.75 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 text-xs"
              style={{ color: 'rgba(255,255,255,0.18)' }}>
              scroll to zoom out · drag rocks to create moons
            </div>
          )}
        </div>

        <EventLog />
      </div>

      {/* Bottom controls */}
      <div className="h-16 flex items-center justify-center gap-3 px-6 shrink-0 z-20"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,11,30,0.8)', backdropFilter: 'blur(12px)' }}>
        <button
          onClick={() => setPlaying(p => !p)}
          className="p-2.5 rounded-full transition-colors"
          style={{ color: '#a78bfa', background: playing ? 'rgba(124,58,237,0.15)' : 'transparent' }}
        >
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {([
          { label: '+100 yrs', years: 100, color: '#94a3b8' },
          { label: '+1k yrs', years: 1_000, color: '#a78bfa' },
          { label: '+1M yrs', years: 1_000_000, color: '#22d3ee' },
          { label: '+1B yrs', years: 1_000_000_000, color: '#fbbf24' },
        ] as const).map(btn => (
          <button
            key={btn.label}
            onClick={() => advanceTime(btn.years)}
            className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all hover:-translate-y-0.5 hover:scale-105"
            style={{ border: `1px solid ${btn.color}30`, background: `${btn.color}10`, color: btn.color }}
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
