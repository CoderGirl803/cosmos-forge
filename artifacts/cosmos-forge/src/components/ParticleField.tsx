import React, { useRef, useEffect, useState } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { PARTICLE_CONFIG, ParticleType } from '../data/gameData';
import { motion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: ParticleType;
  radius: number;
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { addLog, setPhase } = useGameStore();
  
  const [hoveredParticle, setHoveredParticle] = useState<{x: number, y: number, name: string} | null>(null);
  const [canStartCiv, setCanStartCiv] = useState(false);
  const [starFormed, setStarFormed] = useState(false);

  // Simulation state
  const particlesRef = useRef<Particle[]>([]);
  const discoveredRef = useRef<Set<ParticleType>>(new Set(['H']));

  useEffect(() => {
    // Init particles
    const count = 200;
    const initial: Particle[] = [];
    for(let i=0; i<count; i++) {
      initial.push({
        x: Math.random() * window.innerWidth * 0.8,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        type: 'H',
        radius: 2 + Math.random() * 2
      });
    }
    particlesRef.current = initial;
    addLog('⚡ hydrogen created!');
  }, [addLog]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const resize = () => {
      if (containerRef.current) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const checkDiscovered = (type: ParticleType) => {
      if (!discoveredRef.current.has(type)) {
        discoveredRef.current.add(type);
        const name = PARTICLE_CONFIG[type].name;
        if (type === 'Plasma') addLog('🔥 plasma igniting...');
        else addLog(`💫 ${name} detected!`);
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let ironCount = 0;
      let plasmaCount = 0;

      particlesRef.current.forEach(p => {
        if (!starFormed) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

          // Random mutation (fusion simulation)
          if (Math.random() < 0.001) {
            const types: ParticleType[] = ['H','He','Li','C','N','O','Ne','Si','Fe','Plasma'];
            const currentIndex = types.indexOf(p.type);
            if (currentIndex < types.length - 1 && Math.random() < 0.5) {
              p.type = types[currentIndex + 1];
              checkDiscovered(p.type);
            }
          }
        } else {
          // Orbit center
          const cx = canvas.width / 2;
          const cy = canvas.height / 2;
          const dx = p.x - cx;
          const dy = p.y - cy;
          const dist = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx) + 0.005;
          p.x = cx + Math.cos(angle) * dist;
          p.y = cy + Math.sin(angle) * dist;
        }

        if (p.type === 'Fe') ironCount++;
        if (p.type === 'Plasma') plasmaCount++;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = PARTICLE_CONFIG[p.type].color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = PARTICLE_CONFIG[p.type].color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      if (!starFormed && ironCount >= 5 && plasmaCount >= 5) {
        setStarFormed(true);
        addLog('⭐ a star is born!');
        setTimeout(() => {
          addLog('🌍 your planet is ready!');
          setCanStartCiv(true);
        }, 2000);
      }

      if (starFormed) {
        // Draw Star
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 40, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.shadowBlur = 50;
        ctx.shadowColor = '#fb923c';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw Planet
        const time = Date.now() / 1000;
        const px = cx + Math.cos(time) * 150;
        const py = cy + Math.sin(time) * 150;
        ctx.beginPath();
        ctx.arc(px, py, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#06b6d4';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#22d3ee';
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [starFormed, addLog]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const hovered = particlesRef.current.find(p => Math.hypot(p.x - mx, p.y - my) < p.radius + 5);
    if (hovered) {
      setHoveredParticle({ x: e.clientX, y: e.clientY, name: PARTICLE_CONFIG[hovered.type].name });
    } else {
      setHoveredParticle(null);
    }
  };

  return (
    <div className="w-full h-full flex bg-background relative overflow-hidden">
      <div className="flex-1 relative" ref={containerRef}>
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 cursor-crosshair"
          onMouseMove={handleMouseMove}
        />
        
        {hoveredParticle && (
          <div 
            className="absolute z-50 pointer-events-none bg-card/80 backdrop-blur border border-border px-2 py-1 rounded text-xs text-foreground shadow-lg"
            style={{ left: hoveredParticle.x + 10, top: hoveredParticle.y + 10 }}
          >
            {hoveredParticle.name}
          </div>
        )}

        <AnimatePresence>
          {canStartCiv && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2"
            >
              <button
                onClick={() => setPhase('civilization')}
                className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:shadow-[0_0_30px_rgba(124,58,237,0.8)] transition-all hover:-translate-y-1"
              >
                begin civilization ✨
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-64 border-l border-border bg-card/50 backdrop-blur flex flex-col z-10 shrink-0">
        <div className="p-4 border-b border-border font-bold text-accent glow-text">⭐ event log</div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {useGameStore.getState().logs.map(log => (
            <div key={log.id} className="text-sm">
              <span className="text-muted-foreground text-xs block mb-0.5">{log.time}</span>
              <span className="text-foreground">{log.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { AnimatePresence } from 'framer-motion';
