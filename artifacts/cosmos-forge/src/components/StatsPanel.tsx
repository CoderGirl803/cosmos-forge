import React, { useState } from 'react';
import { useGameStore } from '../hooks/useGameStore';

export default function StatsPanel() {
  const { population, food, energy, tech, health, year, era, planetName, setPlanetName } = useGameStore();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const startEdit = () => {
    setNameInput(planetName);
    setEditing(true);
  };

  const finishEdit = () => {
    const trimmed = nameInput.trim();
    if (trimmed) setPlanetName(trimmed.toLowerCase());
    setEditing(false);
  };

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
    <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          background: color,
          boxShadow: `0 0 8px ${glow}`
        }}
      />
    </div>
  );

  const eraColors: Record<string, string> = {
    primordial: '#64748b', ancient: '#d97706', medieval: '#7c3aed',
    industrial: '#6b7280', digital: '#06b6d4', cosmic: '#fbbf24'
  };

  return (
    <div className="w-72 flex flex-col p-5 space-y-6 shrink-0 h-full overflow-y-auto" style={{ background: 'rgba(10,11,30,0.7)', backdropFilter: 'blur(12px)', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
      {/* Planet name */}
      <div>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onBlur={finishEdit}
              onKeyDown={e => { if (e.key === 'Enter') finishEdit(); if (e.key === 'Escape') setEditing(false); }}
              className="text-xl font-serif font-bold bg-transparent border-b border-primary outline-none text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary w-full"
              style={{ maxWidth: 180 }}
            />
            <button onClick={finishEdit} className="text-xs text-primary">✓</button>
          </div>
        ) : (
          <button
            onClick={startEdit}
            className="group flex items-center gap-2"
            title="click to rename"
          >
            <h2
              className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary"
              style={{ filter: 'drop-shadow(0 0 12px rgba(6,182,212,0.5))' }}
            >
              {planetName}
            </h2>
            <span className="text-xs text-white/30 group-hover:text-white/60 transition-colors">✏️</span>
          </button>
        )}
        <div className="text-white/40 text-xs font-mono tracking-wider mt-1">{formatYear(year)}</div>
      </div>

      {/* Era badge */}
      <div
        className="self-start px-3 py-1 rounded-full text-xs font-semibold"
        style={{
          background: `${eraColors[era]}20`,
          border: `1px solid ${eraColors[era]}50`,
          color: eraColors[era],
          boxShadow: `0 0 10px ${eraColors[era]}30`
        }}
      >
        era: {era}
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
          { icon: '🌿', label: 'planet health', value: health, color: health > 60 ? '#34d399' : health > 30 ? '#f59e0b' : '#ef4444', glow: health > 60 ? '#34d399' : '#ef4444' },
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

      {/* Extinction warning */}
      {population === 0 && (
        <div className="p-3 rounded-lg text-xs text-red-300 text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          ☠️ no life detected. spark life to begin.
        </div>
      )}
    </div>
  );
}
