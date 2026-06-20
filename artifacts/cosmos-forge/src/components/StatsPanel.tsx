import React from 'react';
import { useGameStore } from '../hooks/useGameStore';

export default function StatsPanel() {
  const { population, food, energy, tech, health, year, era } = useGameStore();

  const formatNumber = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'k';
    return num.toString();
  };

  const ProgressBar = ({ value, colorClass }: { value: number, colorClass: string }) => (
    <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
      <div 
        className={`h-full ${colorClass} transition-all duration-500`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );

  return (
    <div className="w-72 glass-panel border-r border-y-0 border-l-0 flex flex-col p-6 space-y-8 z-10 shrink-0 h-full overflow-y-auto">
      <div>
        <h2 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary glow-text mb-1">
          terra-9
        </h2>
        <div className="text-muted-foreground text-sm font-mono tracking-wider">
          year {formatNumber(year)}
        </div>
      </div>

      <div className="inline-flex items-center self-start px-3 py-1 rounded-full border border-accent/30 bg-accent/10 text-accent text-sm font-medium shadow-[0_0_10px_rgba(251,191,36,0.2)]">
        era: {era}
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2"><span className="text-lg">🧬</span> population</span>
            <span className="font-mono">{formatNumber(population)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2"><span className="text-lg">🌾</span> food</span>
            <span className="font-mono text-muted-foreground">{Math.floor(food)}%</span>
          </div>
          <ProgressBar value={food} colorClass="bg-green-500 shadow-[0_0_10px_#22c55e]" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2"><span className="text-lg">⚡</span> energy</span>
            <span className="font-mono text-muted-foreground">{Math.floor(energy)}%</span>
          </div>
          <ProgressBar value={energy} colorClass="bg-yellow-400 shadow-[0_0_10px_#facc15]" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2"><span className="text-lg">🔬</span> technology</span>
            <span className="font-mono text-muted-foreground">{Math.floor(tech)}%</span>
          </div>
          <ProgressBar value={tech} colorClass="bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2"><span className="text-lg">🌿</span> planet health</span>
            <span className="font-mono text-muted-foreground">{Math.floor(health)}%</span>
          </div>
          <ProgressBar value={health} colorClass="bg-emerald-400 shadow-[0_0_10px_#34d399]" />
        </div>
      </div>
    </div>
  );
}
