import React, { useState } from 'react';
import { useGameStore } from '../hooks/useGameStore';

export default function StatsPanel() {
  const {
    population, food, energy, tech, health, year, era,
    planetLevel, shieldLevel, greenhouse, starStatus,
    planetName, setPlanetName, starName, setStarName,
    cosmicScore, streak, unlockedAchievements,
  } = useGameStore();

  const [editingPlanet, setEditingPlanet] = useState(false);
  const [editingStar, setEditingStar] = useState(false);
  const [planetInput, setPlanetInput] = useState('');
  const [starInput, setStarInput] = useState('');

  const startEditPlanet = () => { setPlanetInput(planetName); setEditingPlanet(true); };
  const finishEditPlanet = () => { const t = planetInput.trim(); if (t) setPlanetName(t.toLowerCase()); setEditingPlanet(false); };

  const startEditStar = () => { setStarInput(starName); setEditingStar(true); };
  const finishEditStar = () => { const t = starInput.trim(); if (t) setStarName(t.toLowerCase()); setEditingStar(false); };

  const formatPopulation = (num: number) => {
    if (num === 0) return '0';
    if (num >= 1e9) return (num / 1e9).toFixed(3) + ' billion';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k';
    return num.toLocaleString();
  };
  const formatYear = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B yrs';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M yrs';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k yrs';
    return num + ' yrs';
  };

  const ProgressBar = ({ value, color, glow }: { value: number; color: string; glow: string }) => (
    <div className="h-2 w-full rounded-full overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color, boxShadow: `0 0 8px ${glow}` }} />
    </div>
  );

  const eraColors: Record<string, string> = {
    primordial: '#64748b', ancient: '#d97706', medieval: '#7c3aed',
    industrial: '#6b7280', digital: '#06b6d4', cosmic: '#fbbf24'
  };

  return (
    <div className="w-72 flex flex-col p-5 shrink-0 h-full overflow-y-auto"
      style={{ background: 'rgba(10,11,30,0.7)', backdropFilter: 'blur(12px)', borderRight: '1px solid rgba(255,255,255,0.07)' }}>

      <div className="flex flex-col gap-5 flex-1">
        {/* Planet name */}
        <div>
          {editingPlanet ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus value={planetInput}
                onChange={e => setPlanetInput(e.target.value)}
                onBlur={finishEditPlanet}
                onKeyDown={e => { if (e.key === 'Enter') finishEditPlanet(); if (e.key === 'Escape') setEditingPlanet(false); }}
                className="text-xl font-serif font-bold bg-transparent border-b border-primary outline-none text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary w-full"
                style={{ maxWidth: 180 }}
              />
              <button onClick={finishEditPlanet} className="text-xs text-primary">✓</button>
            </div>
          ) : (
            <button onClick={startEditPlanet} className="group flex items-center gap-2" title="click to rename">
              <h2 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary"
                style={{ filter: 'drop-shadow(0 0 12px rgba(6,182,212,0.5))' }}>
                {planetName}
              </h2>
              <span className="text-xs text-white/30 group-hover:text-white/60 transition-colors">✏️</span>
            </button>
          )}
          <div className="text-white/40 text-xs font-mono tracking-wider mt-1">{formatYear(year)}</div>
        </div>

        {/* Star name */}
        <div className="flex items-center gap-2">
          {editingStar ? (
            <div className="flex items-center gap-2 w-full">
              <span className="text-amber-400/60 text-xs">⭐</span>
              <input
                autoFocus value={starInput}
                onChange={e => setStarInput(e.target.value)}
                onBlur={finishEditStar}
                onKeyDown={e => { if (e.key === 'Enter') finishEditStar(); if (e.key === 'Escape') setEditingStar(false); }}
                className="text-sm bg-transparent border-b border-amber-400/40 outline-none text-amber-300 w-full"
              />
              <button onClick={finishEditStar} className="text-xs text-amber-400">✓</button>
            </div>
          ) : (
            <button onClick={startEditStar} className="group flex items-center gap-1.5" title="rename your star">
              <span className="text-amber-400/60 text-xs">⭐</span>
              <span className="text-xs font-mono text-amber-300/70 group-hover:text-amber-300 transition-colors">{starName}</span>
              <span className="text-xs text-white/20 group-hover:text-white/50 transition-colors">✏️</span>
            </button>
          )}
        </div>

        {/* Era badge */}
        <div className="flex flex-wrap gap-2">
          <div className="self-start px-3 py-1 rounded-full text-xs font-semibold" style={{
            background: `${eraColors[era]}18`,
            border: `1px solid ${eraColors[era]}40`,
            color: eraColors[era],
          }}>
            era: {era}
          </div>
          <div className="self-start px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(148,163,184,0.08)', border: '1px solid rgba(148,163,184,0.18)', color: 'rgba(203,213,225,0.75)' }}>
            planet lv {planetLevel}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'score', value: cosmicScore.toLocaleString(), color: '#fbbf24' },
            { label: 'streak', value: `${streak}x`, color: '#22d3ee' },
            { label: 'badges', value: `${unlockedAchievements.length}/8`, color: '#a78bfa' },
          ].map(item => (
            <div key={item.label} className="rounded-lg px-2 py-2 text-center"
              style={{ background: `${item.color}10`, border: `1px solid ${item.color}30` }}>
              <div className="text-sm font-bold" style={{ color: item.color }}>{item.value}</div>
              <div className="text-[10px] uppercase tracking-wide text-white/35">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="space-y-5">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2 text-white/80"><span>🧬</span> population</span>
              <span className="font-mono text-white/60 text-right">{formatPopulation(population)}</span>
            </div>
          </div>

          {[
            { icon: '🌾', label: 'food', value: food, color: '#22c55e', glow: '#22c55e' },
            { icon: '⚡', label: 'energy', value: energy, color: '#facc15', glow: '#facc15' },
            { icon: '🔬', label: 'technology', value: tech, color: '#22d3ee', glow: '#22d3ee' },
            { icon: '🌿', label: 'planet health', value: health,
              color: health > 60 ? '#34d399' : health > 30 ? '#f59e0b' : '#ef4444',
              glow: health > 60 ? '#34d399' : '#ef4444' },
            { icon: '🛡️', label: 'barrier', value: shieldLevel * 33.34, color: '#93c5fd', glow: '#93c5fd' },
            { icon: '🏭', label: 'greenhouse', value: greenhouse, color: '#a3a3a3', glow: '#a3a3a3' },
          ].map(stat => (
            <div key={stat.label} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-white/80"><span>{stat.icon}</span> {stat.label}</span>
                <span className="font-mono text-white/50">{Math.floor(stat.value)}%</span>
              </div>
              <ProgressBar value={stat.value} color={stat.color} glow={stat.glow} />
            </div>
          ))}
        </div>

        {/* Warnings */}
        {tech >= 90 && energy >= 80 && (
          <div className="p-3 rounded-lg text-xs text-amber-300 text-center animate-pulse"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}>
            ⚠️ civilization approaching critical power threshold
          </div>
        )}
        {population === 0 && (
          <div className="p-3 rounded-lg text-xs text-red-300 text-center"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
            ☠️ no life detected. spark life to begin.
          </div>
        )}
        {starStatus !== 'stable' && (
          <div className="p-3 rounded-lg text-xs text-red-200 text-center"
            style={{ background: 'rgba(127,29,29,0.18)', border: '1px solid rgba(248,113,113,0.25)' }}>
            ☀️ star status: {starStatus}
          </div>
        )}
      </div>
    </div>
  );
}
