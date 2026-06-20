import React from 'react';
import { useGameStore } from '../hooks/useGameStore';
import StatsPanel from './StatsPanel';
import EventLog from './EventLog';
import EventPopup from './EventPopup';
import { Play, Pause, FastForward } from 'lucide-react';

export default function CivilizationView() {
  const { advanceTime, activeEvent } = useGameStore();
  const [playing, setPlaying] = React.useState(false);

  React.useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      advanceTime(10);
    }, 1000);
    return () => clearInterval(interval);
  }, [playing, advanceTime]);

  // Generate stars for background
  const stars = React.useMemo(() => {
    return Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random(),
      delay: Math.random() * 5
    }));
  }, []);

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-background">
      {/* Background Starfield */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {stars.map(star => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animation: `float ${5 + star.delay}s infinite ease-in-out alternate`
            }}
          />
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden z-10">
        <StatsPanel />

        <div className="flex-1 flex items-center justify-center relative">
          <div className="planet-orb animate-float cursor-pointer hover:scale-105 transition-transform duration-500" />
        </div>

        <EventLog />
      </div>

      <div className="h-20 border-t border-border bg-card/60 backdrop-blur-md flex items-center justify-center gap-4 px-6 z-20 shrink-0">
        <button
          onClick={() => setPlaying(!playing)}
          className="p-3 rounded-full hover:bg-white/10 transition-colors text-primary"
        >
          {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>

        <div className="h-8 w-px bg-border mx-2" />

        <button onClick={() => advanceTime(100)} className="px-4 py-2 rounded-full border border-primary/30 hover:bg-primary/20 text-primary text-sm flex items-center gap-2 transition-colors">
          <FastForward className="w-4 h-4" /> +100 yrs
        </button>
        <button onClick={() => advanceTime(1000)} className="px-4 py-2 rounded-full border border-secondary/30 hover:bg-secondary/20 text-secondary text-sm flex items-center gap-2 transition-colors">
          <FastForward className="w-4 h-4" /> +1,000 yrs
        </button>
        <button onClick={() => advanceTime(1000000)} className="px-4 py-2 rounded-full border border-accent/30 hover:bg-accent/20 text-accent text-sm flex items-center gap-2 transition-colors">
          <FastForward className="w-4 h-4" /> +1M yrs
        </button>
        <button onClick={() => advanceTime(1000000000)} className="px-4 py-2 rounded-full bg-primary/20 hover:bg-primary/40 text-white font-medium border border-primary text-sm flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(124,58,237,0.3)]">
          <FastForward className="w-4 h-4" /> +1B yrs
        </button>
      </div>

      <EventPopup event={activeEvent} />
    </div>
  );
}
