import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { PARTICLE_CONFIG, ParticleType } from '../data/gameData';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: ParticleType;
  radius: number;
  orbitAngle?: number;
  orbitRadius?: number;
}

const TYPES: ParticleType[] = ['H', 'He', 'Li', 'C', 'N', 'O', 'Ne', 'Si', 'Fe', 'Plasma'];

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { addLog, setPhase } = useGameStore();

  const [hoveredParticle, setHoveredParticle] = useState<{ x: number; y: number; name: string } | null>(null);
  const [canStartCiv, setCanStartCiv] = useState(false);
  const [starFormed, setStarFormed] = useState(false);

  const particlesRef = useRef<Particle[]>([]);
  const discoveredRef = useRef<Set<ParticleType>>(new Set(['H']));
  const starFormedRef = useRef(false);
  const frameRef = useRef(0);

  // init particles
  useEffect(() => {
    const count = 200;
    const w = window.innerWidth * 0.88;
    const h = window.innerHeight;
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5,
      type: 'H' as ParticleType,
      radius: 2 + Math.random() * 2
    }));
    addLog('⚡ hydrogen created!');
  }, [addLog]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

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
        else if (type === 'Fe') addLog('⚙️ iron detected! stellar core forming...');
        else addLog(`💫 ${name} detected!`);
      }
    };

    let orbitTime = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isFormed = starFormedRef.current;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      let ironCount = 0;
      let plasmaCount = 0;

      particlesRef.current.forEach((p, idx) => {
        if (!isFormed) {
          // Normal bouncing
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

          // Fusion — moderate rate so it takes ~20-30s for plasma/iron
          if (Math.random() < 0.015) {
            const ci = TYPES.indexOf(p.type);
            if (ci < TYPES.length - 1) {
              p.type = TYPES[ci + 1];
              checkDiscovered(p.type);
            }
          }
        } else {
          // After star forms: orbit slowly, continue rare mutations
          if (p.orbitAngle === undefined) {
            const dx = p.x - cx;
            const dy = p.y - cy;
            p.orbitRadius = Math.max(60, Math.hypot(dx, dy));
            p.orbitAngle = Math.atan2(dy, dx);
          }
          const speed = 0.002 + (idx % 5) * 0.0003;
          p.orbitAngle! += speed;
          p.x = cx + Math.cos(p.orbitAngle!) * p.orbitRadius!;
          p.y = cy + Math.sin(p.orbitAngle!) * p.orbitRadius!;

          // Slower mutation continues after star forms
          if (Math.random() < 0.003) {
            const ci = TYPES.indexOf(p.type);
            if (ci < TYPES.length - 1) {
              p.type = TYPES[ci + 1];
              checkDiscovered(p.type);
            }
          }
        }

        if (p.type === 'Fe') ironCount++;
        if (p.type === 'Plasma') plasmaCount++;

        const color = PARTICLE_CONFIG[p.type].color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowBlur = p.type === 'Plasma' ? 18 : 8;
        ctx.shadowColor = color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      if (!isFormed && ironCount >= 5 && plasmaCount >= 5) {
        starFormedRef.current = true;
        setStarFormed(true);
        addLog('⭐ a star is born!');
        setTimeout(() => {
          addLog('🌍 your planet is ready!');
          setCanStartCiv(true);
        }, 2500);
      }

      if (isFormed) {
        orbitTime += 0.008;

        // Draw star glow rings
        const glowRadius = 44 + Math.sin(orbitTime * 2) * 3;
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius * 2.5);
        gradient.addColorStop(0, 'rgba(251,191,36,0.9)');
        gradient.addColorStop(0.4, 'rgba(251,146,60,0.5)');
        gradient.addColorStop(1, 'rgba(251,191,36,0)');
        ctx.beginPath();
        ctx.arc(cx, cy, glowRadius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#fef3c7';
        ctx.shadowBlur = 60;
        ctx.shadowColor = '#fb923c';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Planet orbit trail
        const orbitR = 160;
        ctx.beginPath();
        ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(6,182,212,0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Planet
        const px = cx + Math.cos(orbitTime) * orbitR;
        const py = cy + Math.sin(orbitTime) * orbitR;
        const pGrad = ctx.createRadialGradient(px - 4, py - 4, 1, px, py, 18);
        pGrad.addColorStop(0, '#a5f3fc');
        pGrad.addColorStop(0.6, '#06b6d4');
        pGrad.addColorStop(1, '#0e7490');
        ctx.beginPath();
        ctx.arc(px, py, 18, 0, Math.PI * 2);
        ctx.fillStyle = pGrad;
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#22d3ee';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      frameRef.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, [addLog]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const hovered = particlesRef.current.find(p => Math.hypot(p.x - mx, p.y - my) < p.radius + 6);
    if (hovered) {
      setHoveredParticle({ x: e.clientX, y: e.clientY, name: PARTICLE_CONFIG[hovered.type].name });
    } else {
      setHoveredParticle(null);
    }
  };

  const logs = useGameStore(s => s.logs);

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
            className="fixed z-50 pointer-events-none bg-black/80 backdrop-blur border border-white/10 px-2 py-1 rounded text-xs text-white shadow-lg"
            style={{ left: hoveredParticle.x + 12, top: hoveredParticle.y + 12 }}
          >
            {hoveredParticle.name}
          </div>
        )}

        <AnimatePresence>
          {canStartCiv && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
            >
              <button
                onClick={() => setPhase('civilization')}
                className="px-8 py-3 rounded-full font-semibold text-white transition-all hover:-translate-y-1"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                  boxShadow: '0 0 30px rgba(124,58,237,0.6), 0 0 60px rgba(6,182,212,0.3)'
                }}
              >
                begin civilization ✨
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sidebar */}
      <div className="w-60 border-l border-white/10 bg-black/40 backdrop-blur flex flex-col z-10 shrink-0">
        <div className="p-3 border-b border-white/10 font-bold text-amber-400 text-sm tracking-wide">⭐ event log</div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {logs.map(log => (
            <div key={log.id} className="text-xs">
              <span className="text-white/40 block mb-0.5">{log.time}</span>
              <span className="text-white/80">{log.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
