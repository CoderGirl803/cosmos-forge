import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../hooks/useGameStore';
import StatsPanel from './StatsPanel';
import EventLog from './EventLog';
import EventPopup from './EventPopup';
import SignalPanel from './SignalPanel';
import { Play, Pause, FastForward } from 'lucide-react';

const MIN_ZOOM = 0.07;
const MAX_ZOOM = 2.0;
const C = 2000;

interface SolarObj {
  id: string;
  orbitR: number;
  orbitDur: number;
  startAngle: number;
  size: number;
  bg: string;
  color: string;
  label: string;
  lifeChance: number;
  signalTarget?: string;
  type: 'rock' | 'planet' | 'gas';
}

const SOLAR_OBJS: SolarObj[] = [
  {
    id: 'hot_rock', orbitR: 240, orbitDur: 22, startAngle: 1.1, size: 9,
    color: '#9ca3af', bg: 'radial-gradient(circle at 40% 30%, #d1d5db, #4b5563)',
    label: 'scorched rock', lifeChance: 0, type: 'rock',
  },
  {
    id: 'venus_like', orbitR: 370, orbitDur: 44, startAngle: 3.8, size: 22,
    color: '#f97316', bg: 'radial-gradient(circle at 35% 30%, #fdba74, #c2410c, #7c2d12)',
    label: 'volcanic world', lifeChance: 0.5, signalTarget: 'gliese 667c', type: 'planet',
  },
  {
    id: 'mars_like', orbitR: 680, orbitDur: 88, startAngle: 1.4, size: 17,
    color: '#ef4444', bg: 'radial-gradient(circle at 35% 30%, #f87171, #991b1b)',
    label: 'kepler-452b', lifeChance: 4, signalTarget: 'kepler-452b', type: 'planet',
  },
  {
    id: 'ice_rock', orbitR: 940, orbitDur: 170, startAngle: 5.2, size: 10,
    color: '#94a3b8', bg: 'radial-gradient(circle at 40% 30%, #e2e8f0, #334155)',
    label: 'ice asteroid', lifeChance: 0, type: 'rock',
  },
  {
    id: 'debris', orbitR: 1010, orbitDur: 185, startAngle: 2.3, size: 7,
    color: '#78716c', bg: 'radial-gradient(circle at 40% 30%, #a8a29e, #292524)',
    label: 'debris', lifeChance: 0, type: 'rock',
  },
  {
    id: 'gas_giant', orbitR: 1350, orbitDur: 320, startAngle: 4.1, size: 90,
    color: '#fbbf24', bg: 'radial-gradient(circle at 35% 30%, #fef9c3, #f59e0b, #b45309, #78350f)',
    label: 'nova-7', lifeChance: 9, signalTarget: 'nova-7', type: 'gas',
  },
  {
    id: 'ringed', orbitR: 1780, orbitDur: 520, startAngle: 0.6, size: 64,
    color: '#a78bfa', bg: 'radial-gradient(circle at 35% 30%, #ddd6fe, #7c3aed, #4c1d95)',
    label: 'tau ceti e', lifeChance: 3, signalTarget: 'tau ceti e', type: 'planet',
  },
  {
    id: 'ice_giant', orbitR: 2150, orbitDur: 750, startAngle: 2.9, size: 46,
    color: '#22d3ee', bg: 'radial-gradient(circle at 35% 30%, #a5f3fc, #0891b2, #1e3a8a)',
    label: 'trappist-1d', lifeChance: 7, signalTarget: 'trappist-1d', type: 'planet',
  },
  {
    id: 'far_ice', orbitR: 2550, orbitDur: 1300, startAngle: 4.8, size: 30,
    color: '#60a5fa', bg: 'radial-gradient(circle at 35% 30%, #bfdbfe, #3b82f6, #1e3a8a)',
    label: 'proxima centauri b', lifeChance: 13, signalTarget: 'proxima centauri b', type: 'planet',
  },
];

const GALAXIES = [
  { id: 'lullaby spiral', x: 18, y: 22, size: 120, rot: -18 },
  { id: 'violet spoon', x: 72, y: 18, size: 160, rot: 24 },
  { id: 'paper lantern sea', x: 82, y: 72, size: 130, rot: -35 },
  { id: 'sens hiding place', x: 30, y: 78, size: 105, rot: 12 },
  { id: 'the almost home galaxy', x: 52, y: 48, size: 190, rot: 40 },
];

const ROGUE_BLACK_HOLES = [
  { id: 'bh-1', x: 14, y: 62, size: 62 },
  { id: 'bh-2', x: 88, y: 34, size: 42 },
];

function lifeColor(pct: number) {
  if (pct === 0) return 'rgba(100,116,139,0.6)';
  if (pct < 3) return 'rgba(251,191,36,0.75)';
  if (pct < 9) return 'rgba(251,146,60,0.75)';
  return 'rgba(34,197,94,0.80)';
}

function lifeLabel(pct: number) {
  if (pct === 0) return 'no life signals';
  if (pct < 3) return `${pct}% trace chemistry`;
  if (pct < 9) return `${pct}% possible life`;
  return `${pct}% promising!`;
}

export default function CivilizationView() {
  const {
    advanceTime, activeEvent, activeDisaster, planetName, starName,
    starStatus, planetLevel, shieldLevel, greenhouse, orbitDecay,
    addLog, addMoon, moons,
    blackHoleAlert, escapeBlackHole, tickBlackHole,
    pandemicAlert, escapePandemic, tickPandemic,
    nuclearAlert, escapeNuclear, tickNuclear,
    sendSignal, deliverSignalResponse,
  } = useGameStore();

  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [capturedRocks, setCapturedRocks] = useState<Set<string>>(new Set());
  const [alertPulse, setAlertPulse] = useState(false);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [hoveredGalaxy, setHoveredGalaxy] = useState<string | null>(null);
  const [clickedPlanet, setClickedPlanet] = useState<SolarObj | null>(null);
  const [signalSending, setSignalSending] = useState(false);
  const [playMs, setPlayMs] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const planetBodyRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0, moved: false });

  // Auto-advance time
  useEffect(() => {
    if (!playing) return;
    const iv = setInterval(() => {
      advanceTime(10);
      setPlayMs(ms => Math.min(600_000, ms + 1200));
    }, 1200);
    return () => clearInterval(iv);
  }, [playing, advanceTime]);

  // Countdown ticks
  useEffect(() => { if (!blackHoleAlert) return; const iv = setInterval(tickBlackHole, 1000); return () => clearInterval(iv); }, [blackHoleAlert, tickBlackHole]);
  useEffect(() => { if (!pandemicAlert) return; const iv = setInterval(tickPandemic, 1000); return () => clearInterval(iv); }, [pandemicAlert, tickPandemic]);
  useEffect(() => { if (!nuclearAlert) return; const iv = setInterval(tickNuclear, 1000); return () => clearInterval(iv); }, [nuclearAlert, tickNuclear]);

  // Alert pulse
  const activeAlert = blackHoleAlert ?? pandemicAlert ?? nuclearAlert;
  useEffect(() => {
    if (!activeAlert) { setAlertPulse(false); return; }
    const urgency = activeAlert.timeLeft < 10 ? 250 : 650;
    const iv = setInterval(() => setAlertPulse(p => !p), urgency);
    return () => clearInterval(iv);
  }, [activeAlert]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - e.deltaY * 0.0012)));
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    panStartRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y, moved: false };
    setIsPanning(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [pan.x, pan.y]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    if (Math.hypot(dx, dy) > 4) panStartRef.current.moved = true;
    setPan({ x: panStartRef.current.panX + dx, y: panStartRef.current.panY + dy });
  }, [isPanning]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPanning) return;
    setIsPanning(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, [isPanning]);

  const playerOrbitR = 430 - Math.min(1, playMs / 600_000) * 140 - Math.min(1, orbitDecay) * 120;
  const galaxyOpacity = Math.min(1, Math.max(0, (0.18 - zoom) / 0.08));
  const stellarVisibility = Math.min(1, Math.max(0, (0.86 - zoom) / 0.28));
  const closePlanetView = zoom > 0.86;
  const systemOffsetX = closePlanetView ? -(playerOrbitR * zoom) : 0;

  const getPlanetCenter = useCallback(() => {
    if (!planetBodyRef.current) return null;
    const r = planetBodyRef.current.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, []);

  const handleRockDragEnd = useCallback((rock: { id: string; color: string; size: number; label: string }, info: { point: { x: number; y: number } }) => {
    const center = getPlanetCenter();
    if (!center) return;
    const dist = Math.hypot(info.point.x - center.x, info.point.y - center.y);
    if (dist < 130) {
      setCapturedRocks(prev => new Set([...prev, rock.id]));
      const becameAsteroid = Math.random() < (rock.size > 28 ? 0.42 : 0.24);
      if (becameAsteroid) {
        const current = useGameStore.getState();
        current.updateStats({
          health: Math.max(0, current.health - (rock.size > 28 ? 12 : 6)),
          orbitDecay: Math.min(1, current.orbitDecay + 0.025),
        });
        addLog(`☄️ ${rock.label} slipped into a dangerous orbit. asteroid risk increased.`);
      } else {
        addMoon({ id: rock.id, color: rock.color, size: Math.max(5, rock.size * 0.45), orbitSpeed: 0.5 + Math.random() * 1.2 });
        addLog(`🌙 ${rock.label} captured — now orbiting ${planetName}!`);
      }
    }
  }, [getPlanetCenter, addMoon, addLog, planetName]);

  const stars = useMemo(() =>
    Array.from({ length: 220 }).map((_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.4, opacity: Math.random() * 0.5 + 0.06,
    })), []);

  const DRAGGABLE_ROCKS = useMemo(() => [
    { id: 'dr1', dx: -310, dy: -260, size: 18, color: '#9ca3af', bg: 'radial-gradient(circle at 40% 30%, #9ca3af, #374151)', label: 'stray rock' },
    { id: 'dr2', dx: 280, dy: -220, size: 14, color: '#a8a29e', bg: 'radial-gradient(circle at 40% 30%, #d6d3d1, #57534e)', label: 'meteorite' },
    { id: 'dr3', dx: -280, dy: 265, size: 22, color: '#6b7280', bg: 'radial-gradient(circle at 35% 35%, #9ca3af, #374151)', label: 'debris' },
    { id: 'dr4', dx: 290, dy: 280, size: 38, color: '#f97316', bg: 'radial-gradient(circle at 35% 30%, #fb923c, #9a3412)', label: 'proto-moon' },
  ], []);

  const handlePlanetSignal = (obj: SolarObj) => {
    if (!obj.signalTarget || signalSending) return;
    setSignalSending(true);
    setClickedPlanet(null);
    const id = sendSignal(obj.signalTarget);
    const delay = 4000 + Math.random() * 8000;
    setTimeout(() => {
      deliverSignalResponse(id);
      setSignalSending(false);
    }, delay);
  };

  // Alert info
  const alertInfo = blackHoleAlert
    ? { alert: blackHoleAlert, icon: '⚫', title: 'black hole incoming', subtitle: '5 seconds to escape the gravity well', color: '#dc2626', btnLabel: '⚡ emergency boost!', onEscape: escapeBlackHole, bg: 'rgba(60,0,0,0.9)' }
    : pandemicAlert
    ? { alert: pandemicAlert, icon: '🦠', title: 'engineered pathogen outbreak', subtitle: '5 seconds to deploy a cure', color: '#f97316', btnLabel: '🔬 deploy cure', onEscape: escapePandemic, bg: 'rgba(40,15,0,0.9)' }
    : nuclearAlert
    ? { alert: nuclearAlert, icon: '☢️', title: 'nuclear missiles inbound', subtitle: '5 seconds to intercept', color: '#fbbf24', btnLabel: '🛡️ intercept!', onEscape: escapeNuclear, bg: 'rgba(35,30,0,0.9)' }
    : null;

  const zoomHint = alertInfo
    ? (blackHoleAlert ? '⚫ zoom out to see it!' : '')
    : zoom < 0.45 ? 'solar system view · click planets to send signals'
    : zoom < 0.75 ? 'scroll to zoom out · drag rocks to create moons' : '';

  return (
    <div className={`w-full h-full flex flex-col relative overflow-hidden bg-background ${activeDisaster ? 'screen-shake' : ''}`}>
      {/* Starfield */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {stars.map(s => (
          <div key={s.id} className="absolute rounded-full bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, opacity: s.opacity }} />
        ))}
      </div>

      {/* Countdown danger banner */}
      <AnimatePresence>
        {alertInfo && (
          <motion.div
            initial={{ y: -80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -80, opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-xl rounded-2xl px-7 py-6 flex items-center justify-between gap-5"
            style={{
              background: alertPulse
                ? alertInfo.bg.replace('0.9', '1.0')
                : alertInfo.bg,
              border: `1px solid ${alertInfo.color}50`,
              backdropFilter: 'blur(12px)',
              boxShadow: `0 0 40px ${alertInfo.color}30`,
              transition: 'background 0.25s',
            }}>
            <div className="flex items-center gap-3">
              <span className="text-6xl">{alertInfo.icon}</span>
              <div>
                <div className="font-bold text-2xl tracking-wide" style={{ color: alertInfo.color }}>
                  {alertInfo.title}
                </div>
                <div className="text-sm mt-1" style={{ color: `${alertInfo.color}95` }}>
                  {alertInfo.subtitle}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="font-mono font-bold text-6xl"
                  style={{ color: alertInfo.alert.timeLeft < 10 ? '#ef4444' : alertInfo.color }}>
                  {alertInfo.alert.timeLeft}s
                </div>
                <div className="text-xs" style={{ color: `${alertInfo.color}50` }}>remaining</div>
              </div>
              <button
                onClick={alertInfo.onEscape}
                className="px-4 py-2 rounded-full font-bold text-sm transition-all hover:scale-105"
                style={{
                  background: `${alertInfo.color}20`,
                  border: `2px solid ${alertInfo.color}60`,
                  color: alertInfo.color,
                  boxShadow: `0 0 20px ${alertInfo.color}30`,
                }}
              >
                {alertInfo.btnLabel}
              </button>
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden z-10 relative" style={{ paddingTop: alertInfo ? 64 : 0 }}>
        <StatsPanel />

        {/* Planet viewport */}
        <div
          className="flex-1 relative overflow-hidden flex items-center justify-center"
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
          onClick={() => {
            if (!panStartRef.current.moved) setClickedPlanet(null);
          }}
        >
          {/* Galaxy layer when zoomed far out */}
          <div className="absolute inset-0 z-[1] pointer-events-none" style={{ opacity: galaxyOpacity, transition: 'opacity 0.25s' }}>
            {GALAXIES.map(g => (
              <div
                key={g.id}
                className="absolute pointer-events-auto"
                onMouseEnter={() => setHoveredGalaxy(g.id)}
                onMouseLeave={() => setHoveredGalaxy(null)}
                style={{
                  left: `${g.x}%`, top: `${g.y}%`,
                  width: g.size, height: Math.round(g.size * 0.42),
                  transform: `translate(-50%, -50%) rotate(${g.rot}deg)`,
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse, rgba(226,232,240,0.45) 0%, rgba(148,163,184,0.16) 34%, rgba(30,41,59,0.02) 70%)',
                  boxShadow: '0 0 35px rgba(148,163,184,0.18)',
                }}
              >
                {hoveredGalaxy === g.id && (
                  <div style={{
                    position: 'absolute', left: '50%', top: '105%', transform: 'translateX(-50%)',
                    color: 'rgba(226,232,240,0.8)', fontSize: 11, whiteSpace: 'nowrap',
                    background: 'rgba(2,6,23,0.65)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '4px 8px',
                  }}>
                    {g.id}
                  </div>
                )}
              </div>
            ))}
            {ROGUE_BLACK_HOLES.map((hole, index) => (
              <motion.div
                key={hole.id}
                animate={{ rotate: index % 2 === 0 ? 360 : -360 }}
                transition={{ duration: 12 + index * 5, repeat: Infinity, ease: 'linear' }}
                className="absolute rounded-full"
                style={{
                  left: `${hole.x}%`,
                  top: `${hole.y}%`,
                  width: hole.size,
                  height: hole.size,
                  transform: 'translate(-50%, -50%)',
                  background: 'radial-gradient(circle, #000 0%, #000 45%, rgba(251,146,60,0.28) 56%, rgba(34,211,238,0.08) 70%, transparent 100%)',
                  boxShadow: '0 0 36px rgba(0,0,0,0.9), 0 0 22px rgba(251,146,60,0.16)',
                }}
              />
            ))}
          </div>
          {/* Solar system container */}
          <div
            style={{
              position: 'absolute',
              width: C * 2, height: C * 2,
              top: '50%', left: '50%',
              transform: `translate(calc(-50% + ${systemOffsetX + pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
              transformOrigin: 'center center',
              pointerEvents: 'none',
            }}
          >
            {/* HOME STAR at center — behind planet */}
            <div style={{
              position: 'absolute', left: C, top: C, transform: 'translate(-50%, -50%)',
              zIndex: 1,
              opacity: stellarVisibility,
              transition: 'opacity 0.25s',
            }}>
              {/* Outer corona glow */}
              <div style={{
                position: 'absolute', borderRadius: '50%',
                width: 700, height: 700, left: -350, top: -350,
                background: starStatus === 'blackhole'
                  ? 'radial-gradient(circle, rgba(0,0,0,0.95) 0%, rgba(148,163,184,0.08) 42%, transparent 70%)'
                  : starStatus === 'supernova'
                  ? 'radial-gradient(circle, rgba(255,255,255,0.35) 0%, rgba(248,113,113,0.16) 45%, transparent 72%)'
                  : 'radial-gradient(circle, rgba(251,191,36,0.10) 0%, rgba(251,146,60,0.04) 50%, transparent 70%)',
                filter: 'blur(20px)',
                pointerEvents: 'none',
              }} />
              {/* Star body */}
              <motion.div
                animate={{ scale: starStatus === 'flare' ? [1, 1.12, 1] : [1, 1.025, 1] }}
                transition={{ duration: starStatus === 'flare' ? 1.4 : 5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: 260, height: 260, marginLeft: -130, marginTop: -130,
                  borderRadius: '50%',
                  background: starStatus === 'blackhole'
                    ? 'radial-gradient(circle, #000 0%, #000 48%, rgba(15,23,42,0.95) 62%, rgba(248,113,113,0.28) 70%, transparent 100%)'
                    : starStatus === 'supernova'
                    ? 'radial-gradient(circle, #fff 0%, #fde68a 22%, #f87171 54%, rgba(239,68,68,0.25) 82%, transparent 100%)'
                    : 'radial-gradient(circle, #fff9e0 0%, #fef08a 18%, #fb923c 48%, rgba(251,146,60,0.2) 80%, transparent 100%)',
                  boxShadow: starStatus === 'blackhole'
                    ? '0 0 80px rgba(0,0,0,1), 0 0 170px rgba(248,113,113,0.22)'
                    : starStatus === 'supernova'
                    ? '0 0 120px rgba(255,255,255,0.85), 0 0 260px rgba(248,113,113,0.5), 0 0 420px rgba(239,68,68,0.25)'
                    : '0 0 60px rgba(251,191,36,0.62), 0 0 130px rgba(251,146,60,0.34), 0 0 260px rgba(251,146,60,0.12)',
                  position: 'absolute',
                }}
              />
              {/* Star name label */}
              <div style={{
                position: 'absolute', top: 155, left: '50%', transform: 'translateX(-50%)',
                color: 'rgba(251,191,36,0.55)', fontSize: 12, whiteSpace: 'nowrap',
                fontFamily: 'monospace', letterSpacing: '0.15em',
                textShadow: '0 0 10px rgba(251,191,36,0.4)',
                opacity: Math.max(0, (0.30 - zoom) / 0.12),
              }}>
                ⭐ {starName}
              </div>
            </div>

            {/* Orbit rings */}
            <div style={{
              position: 'absolute',
              left: C - playerOrbitR, top: C - playerOrbitR,
              width: playerOrbitR * 2, height: playerOrbitR * 2,
              borderRadius: '50%',
              border: '1px solid rgba(103,232,249,0.12)',
              pointerEvents: 'none',
              zIndex: 2,
            }} />
            {SOLAR_OBJS.map(obj => {
              const fadeIn = Math.min(1, Math.max(0, (680 / obj.orbitR / zoom - 0.7) * 2));
              if (fadeIn < 0.01) return null;
              return (
                <div key={`ring-${obj.id}`} style={{
                  position: 'absolute',
                  left: C - obj.orbitR, top: C - obj.orbitR,
                  width: obj.orbitR * 2, height: obj.orbitR * 2,
                  borderRadius: '50%',
                  border: `1px ${obj.type === 'gas' ? 'solid' : 'dashed'} rgba(255,255,255,${0.04 * fadeIn})`,
                  pointerEvents: 'none',
                  zIndex: 2,
                }} />
              );
            })}

            {/* Black hole (when alert active) */}
            {blackHoleAlert && zoom < 0.86 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }}
                style={{ position: 'absolute', left: 550, top: 550, zIndex: 3 }}
              >
                {/* Accretion ring outer */}
                <motion.div
                  animate={{ rotate: 360 }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute', width: 220, height: 220, left: -110, top: -110,
                    borderRadius: '50%',
                    border: '5px solid transparent', borderTopColor: 'rgba(251,146,60,0.65)', borderRightColor: 'rgba(251,191,36,0.45)',
                    boxShadow: '0 0 40px rgba(251,146,60,0.4)',
                  }}
                />
                <motion.div
                  animate={{ rotate: -360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'absolute', width: 160, height: 160, left: -80, top: -80,
                    borderRadius: '50%', border: '3px solid rgba(139,0,0,0.7)',
                  }}
                />
                <div style={{
                  width: 100, height: 100, marginLeft: -50, marginTop: -50,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #000 55%, rgba(20,0,0,0.9) 100%)',
                  boxShadow: 'inset 0 0 30px rgba(0,0,0,1), 0 0 50px rgba(0,0,0,0.95)',
                  position: 'absolute',
                }} />
                <div style={{
                  position: 'absolute', top: 65, left: '50%', transform: 'translateX(-50%)',
                  color: 'rgba(220,38,38,0.65)', fontSize: 11, whiteSpace: 'nowrap', fontFamily: 'monospace',
                }}>
                  ⚫ singularity
                </div>
              </motion.div>
            )}

            {/* Orbiting solar system objects */}
            {SOLAR_OBJS.map(obj => {
              const fadeIn = Math.min(1, Math.max(0, (680 / obj.orbitR / zoom - 0.55) * 2.2));
              if (fadeIn < 0.01) return null;
              const startDeg = obj.startAngle * (180 / Math.PI);

              return (
                <React.Fragment key={obj.id}>
                  {/* Rotating orbit wrapper — planet orbits with this */}
                  <motion.div
                    style={{ position: 'absolute', left: C, top: C, width: 0, height: 0, zIndex: 4 }}
                    initial={{ rotate: startDeg }}
                    animate={{ rotate: startDeg + 360 }}
                    transition={{ duration: obj.orbitDur, repeat: Infinity, ease: 'linear' }}
                  >
                    {/* Counter-rotating inner — keeps planet upright */}
                    <motion.div
                      style={{ position: 'absolute', left: obj.orbitR, top: 0, transform: 'translate(-50%, -50%)' }}
                      initial={{ rotate: -startDeg }}
                      animate={{ rotate: -startDeg - 360 }}
                      transition={{ duration: obj.orbitDur, repeat: Infinity, ease: 'linear' }}
                    >
                      {/* Planet sphere */}
                      <div
                        style={{
                          width: obj.size * 2, height: obj.size * 2,
                          borderRadius: '50%',
                          background: obj.bg,
                          opacity: fadeIn,
                          boxShadow: obj.type === 'gas'
                            ? `0 0 ${obj.size * 1.2}px ${obj.color}55, 0 0 ${obj.size * 2.5}px ${obj.color}20`
                            : `0 0 ${obj.size * 0.9}px ${obj.color}60`,
                          cursor: obj.signalTarget ? 'pointer' : 'default',
                          pointerEvents: fadeIn > 0.3 ? 'auto' : 'none',
                          position: 'relative',
                          marginLeft: -obj.size, marginTop: -obj.size,
                          transition: 'transform 0.2s',
                          transform: hoveredPlanet === obj.id ? 'scale(1.12)' : 'scale(1)',
                        }}
                        onMouseEnter={() => obj.signalTarget && setHoveredPlanet(obj.id)}
                        onMouseLeave={() => setHoveredPlanet(null)}
                        onClick={e => { if (obj.signalTarget) { e.stopPropagation(); setClickedPlanet(obj); } }}
                      />

                      {/* Planet label + life % (visible when zoomed out enough) */}
                      <div style={{
                        position: 'absolute',
                        top: obj.size + 8,
                        left: '50%', transform: 'translateX(-50%)',
                        textAlign: 'center',
                        opacity: fadeIn * Math.min(1, (0.55 / zoom - 0.4) * 3),
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                      }}>
                        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, fontFamily: 'monospace' }}>
                          {obj.label}
                        </div>
                        <div style={{ color: lifeColor(obj.lifeChance), fontSize: 10, fontFamily: 'monospace', marginTop: 2 }}>
                          {lifeLabel(obj.lifeChance)}
                        </div>
                        {obj.signalTarget && (
                          <div style={{ color: 'rgba(167,139,250,0.5)', fontSize: 9, marginTop: 1 }}>
                            click to signal
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                </React.Fragment>
              );
            })}

            {/* PLAYER PLANET — orbits the home star */}
            <motion.div
              style={{ position: 'absolute', left: C, top: C, width: 0, height: 0, zIndex: 10 }}
              initial={{ rotate: -30 }}
              animate={{ rotate: closePlanetView ? 0 : 330 }}
              transition={closePlanetView ? { duration: 0.35 } : { duration: 96, repeat: Infinity, ease: 'linear' }}
            >
              <motion.div
                style={{ position: 'absolute', left: playerOrbitR, top: 0, transform: 'translate(-50%, -50%)', pointerEvents: 'auto' }}
                initial={{ rotate: 30 }}
                animate={{ rotate: closePlanetView ? 0 : -330 }}
                transition={closePlanetView ? { duration: 0.35 } : { duration: 96, repeat: Infinity, ease: 'linear' }}
              >
                {/* Atmosphere glow */}
                <div className="absolute rounded-full pointer-events-none" style={{
                  inset: '-60%',
                  background: 'radial-gradient(circle, rgba(148,163,184,0.10) 0%, transparent 70%)',
                  filter: 'blur(22px)',
                }} />

                {/* Moons orbiting */}
                {moons.map((moon, i) => {
                  const r = 120 + i * 40;
                  return (
                    <React.Fragment key={moon.id}>
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%',
                        width: r * 2, height: r * 2, marginLeft: -r, marginTop: -r,
                        borderRadius: '50%', border: '1px solid rgba(255,255,255,0.04)',
                        pointerEvents: 'none',
                      }} />
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 6 / moon.orbitSpeed, repeat: Infinity, ease: 'linear' }}
                        style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0, zIndex: 5 }}
                      >
                        <div style={{
                          position: 'absolute', left: r - moon.size, top: -moon.size,
                          width: moon.size * 2, height: moon.size * 2, borderRadius: '50%',
                          background: `radial-gradient(circle at 35% 30%, ${moon.color}ff, ${moon.color}44)`,
                          boxShadow: `0 0 ${moon.size * 1.5}px ${moon.color}60`,
                        }} />
                      </motion.div>
                    </React.Fragment>
                  );
                })}

                {/* Planet body */}
                <div
                  ref={planetBodyRef}
                  style={{
                    position: 'relative', width: 220, height: 220, borderRadius: '50%',
                    background: 'radial-gradient(circle at 35% 35%, #9ccbd5, #287080, #123843, #0f242b)',
                    boxShadow: '0 0 34px rgba(148,163,184,0.32), inset -22px -22px 42px rgba(0,0,0,0.66), inset 8px 8px 25px rgba(226,232,240,0.16)',
                  }}
                >
                  <div className="absolute inset-0 rounded-full opacity-40" style={{
                    background: `
                      radial-gradient(ellipse 55% 35% at 40% 45%, rgba(74,122,83,0.85) 0%, transparent 60%),
                      radial-gradient(ellipse 30% 20% at 72% 30%, rgba(74,122,83,0.65) 0%, transparent 50%),
                      radial-gradient(ellipse 25% 18% at 22% 68%, rgba(74,122,83,0.55) 0%, transparent 55%)
                    `
                  }} />
                  <motion.div
                    animate={{ rotate: 360 }} transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      opacity: 0.16 + greenhouse / 250,
                      background: `
                        radial-gradient(ellipse 60% 22% at 50% 28%, rgba(226,232,240,0.9), transparent 60%),
                        radial-gradient(ellipse 40% 18% at 68% 62%, rgba(190,190,180,0.75), transparent 55%),
                        radial-gradient(ellipse 70% 24% at 45% 72%, rgba(130,130,120,${greenhouse / 150}), transparent 60%)
                      `
                    }}
                  />
                  {greenhouse > 10 && (
                    <div className="absolute inset-0 rounded-full pointer-events-none" style={{
                      background: `rgba(120,113,108,${Math.min(0.34, greenhouse / 260)})`,
                      boxShadow: `0 0 ${20 + greenhouse}px rgba(120,113,108,0.18)`,
                    }} />
                  )}
                  {shieldLevel > 0 && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                      className="absolute rounded-full pointer-events-none"
                      style={{
                        inset: -12 - shieldLevel * 7,
                        border: `${1 + shieldLevel}px solid rgba(147,197,253,${0.18 + shieldLevel * 0.08})`,
                        boxShadow: `0 0 ${18 + shieldLevel * 12}px rgba(147,197,253,0.22)`,
                      }}
                    />
                  )}
                  <div className="absolute rounded-full pointer-events-none" style={{
                    inset: -8, border: '2px solid rgba(148,163,184,0.16)',
                    boxShadow: '0 0 20px rgba(148,163,184,0.12) inset',
                  }} />
                </div>

                {/* Planet label */}
                <div style={{
                  position: 'absolute', top: '100%', marginTop: 16, left: '50%', transform: 'translateX(-50%)',
                  color: 'rgba(203,213,225,0.62)', fontSize: 14, letterSpacing: '0.2em',
                  whiteSpace: 'nowrap', fontFamily: 'monospace', textShadow: '0 0 10px rgba(148,163,184,0.35)',
                }}>
                  {planetName}
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* DRAGGABLE ROCKS (viewport space) */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {DRAGGABLE_ROCKS.filter(r => !capturedRocks.has(r.id)).map(rock => {
              const visible = zoom < 0.88;
              const scale = Math.min(1, (0.88 - zoom) / 0.22 + 0.1);
              return (
                <motion.div
                  key={rock.id}
                  drag dragSnapToOrigin dragMomentum={false}
                  animate={{
                    x: [0, rock.size * 0.25, 0, -rock.size * 0.18, 0],
                    y: [0, -rock.size * 0.18, 0, rock.size * 0.22, 0],
                  }}
                  transition={{ duration: 5 + rock.size / 8, repeat: Infinity, ease: 'easeInOut' }}
                  whileDrag={{ scale: 1.2, zIndex: 30, cursor: 'grabbing' }}
                  onDragEnd={(_, info) => handleRockDragEnd(rock, info)}
                  style={{
                    position: 'absolute',
                    top: `calc(50% + ${rock.dy}px)`, left: `calc(50% + ${rock.dx}px)`,
                    width: rock.size * 2, height: rock.size * 2,
                    marginTop: -rock.size, marginLeft: -rock.size,
                    cursor: visible ? 'grab' : 'default',
                    pointerEvents: visible ? 'auto' : 'none',
                    opacity: visible ? scale : 0,
                    transition: 'opacity 0.3s', zIndex: 20,
                  }}
                >
                  <div className="w-full h-full rounded-full"
                    style={{ background: rock.bg, boxShadow: `0 0 ${rock.size * 0.8}px ${rock.color}60` }} />
                  <div style={{
                    position: 'absolute', top: '115%', left: '50%', transform: 'translateX(-50%)',
                    color: 'rgba(255,255,255,0.3)', fontSize: 9, whiteSpace: 'nowrap',
                  }}>{rock.label}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Planet click popup — signal to planet */}
          <AnimatePresence>
            {clickedPlanet && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85 }}
                onClick={e => e.stopPropagation()}
                style={{
                  position: 'absolute', top: 24, right: 60,
                  zIndex: 40,
                  background: 'rgba(10,11,30,0.97)',
                  border: '1.5px solid rgba(124,58,237,0.5)',
                  borderRadius: 16,
                  padding: '18px 20px',
                  boxShadow: '0 0 40px rgba(124,58,237,0.25)',
                  minWidth: 200,
                  maxWidth: 240,
                }}
              >
                <div className="text-white font-semibold text-sm mb-1">{clickedPlanet.label}</div>
                <div className="text-xs mb-3" style={{ color: lifeColor(clickedPlanet.lifeChance) }}>
                  {lifeLabel(clickedPlanet.lifeChance)}
                </div>
                <div className="text-xs text-white/40 mb-3">
                  distance: {(clickedPlanet.orbitR / 100).toFixed(1)} AU
                </div>
                <button
                  onClick={() => handlePlanetSignal(clickedPlanet)}
                  disabled={signalSending}
                  className="w-full py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.03] disabled:opacity-50"
                  style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.45)', color: '#c4b5fd' }}
                >
                  {signalSending ? '📡 transmitting...' : '📡 send signal'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Zoom controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-30">
            <button onClick={() => setZoom(z => Math.min(MAX_ZOOM, z + 0.2))}
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all hover:scale-110"
              style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>+</button>
            <button onClick={() => setZoom(z => Math.max(MIN_ZOOM, z - 0.2))}
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all hover:scale-110"
              style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa' }}>−</button>
            <div className="text-center text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {Math.round(zoom * 100)}%
            </div>
          </div>

          {/* Hint */}
          {zoomHint && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 text-xs px-3 py-1.5 rounded-full"
              style={{
                color: blackHoleAlert ? 'rgba(252,165,165,0.8)' : 'rgba(255,255,255,0.35)',
                background: blackHoleAlert ? 'rgba(60,0,0,0.5)' : 'rgba(0,0,0,0.3)',
                border: `1px solid ${blackHoleAlert ? 'rgba(220,38,38,0.3)' : 'rgba(255,255,255,0.05)'}`,
              }}>
              {zoomHint}
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
          className="px-3 py-2 rounded-full transition-colors flex items-center gap-2 text-xs font-medium"
          style={{ color: '#a78bfa', background: playing ? 'rgba(124,58,237,0.15)' : 'transparent' }}
        >
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {playing ? 'pause' : 'resume'}
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

        {/* Signal panel — prominently in bottom bar */}
        <SignalPanel />
      </div>

      <EventPopup event={activeEvent} />
    </div>
  );
}
