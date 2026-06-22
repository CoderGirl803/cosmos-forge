import React, { useRef, useEffect, useState } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { PARTICLE_CONFIG, ParticleType } from '../data/gameData';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  x: number; y: number; vx: number; vy: number;
  type: ParticleType; radius: number;
  orbitAngle?: number; orbitRadius?: number;
}

const TYPES: ParticleType[] = ['H', 'He', 'Li', 'C', 'N', 'O', 'Ne', 'Si', 'Fe', 'Plasma'];

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { addLog, setPhase } = useGameStore();

  const [canStartCiv, setCanStartCiv] = useState(false);
  const [hoveredParticle, setHoveredParticle] = useState<{ x: number; y: number; name: string } | null>(null);
  const [discovered, setDiscovered] = useState<Set<ParticleType>>(new Set(['H']));

  const particlesRef = useRef<Particle[]>([]);
  const discoveredRef = useRef<Set<ParticleType>>(new Set(['H']));
  const starFormedRef = useRef(false);
  const frameRef = useRef(0);
  const orbitTimeRef = useRef(0);
  const planetPosRef = useRef({ x: 0, y: 0 });
  const canStartCivRef = useRef(false);
  const starOpacityRef = useRef(0);
  const planetOpacityRef = useRef(0);
  const starFormedTimeRef = useRef(0);

  useEffect(() => {
    const count = 200;
    const w = window.innerWidth;
    const h = window.innerHeight;
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5,
      type: 'H' as ParticleType, radius: 2 + Math.random() * 2,
    }));
  }, []);

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
        setDiscovered(new Set(discoveredRef.current));
      }
    };

    const render = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isFormed = starFormedRef.current;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      let ironCount = 0, plasmaCount = 0;

      particlesRef.current.forEach((p, idx) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Elastic collisions
        for (let j = idx + 1; j < Math.min(idx + 8, particlesRef.current.length); j++) {
          const q = particlesRef.current[j];
          const dx = q.x - p.x, dy = q.y - p.y;
          const dist = Math.hypot(dx, dy);
          const minD = p.radius + q.radius + 1;
          if (dist < minD && dist > 0) {
            const nx = dx / dist, ny = dy / dist;
            const relV = (p.vx - q.vx) * nx + (p.vy - q.vy) * ny;
            if (relV > 0) { p.vx -= relV * nx; p.vy -= relV * ny; q.vx += relV * nx; q.vy += relV * ny; }
          }
        }
        if (Math.random() < (isFormed ? 0.004 : 0.012)) {
          const ci = TYPES.indexOf(p.type);
          if (ci < TYPES.length - 1) { p.type = TYPES[ci + 1]; checkDiscovered(p.type); }
        }

        if (p.type === 'Fe') ironCount++;
        if (p.type === 'Plasma') plasmaCount++;

        const color = PARTICLE_CONFIG[p.type].color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.shadowBlur = p.type === 'Plasma' ? 16 : 7;
        ctx.shadowColor = color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      if (!isFormed && plasmaCount >= 1) {
        starFormedRef.current = true;
        starFormedTimeRef.current = timestamp;
        setTimeout(() => {
          setCanStartCiv(true);
          canStartCivRef.current = true;
        }, 3500);
      }

      if (isFormed) {
        if (starFormedTimeRef.current === 0) starFormedTimeRef.current = timestamp;
        orbitTimeRef.current += 0.008;
        const ot = orbitTimeRef.current;
        const elapsed = (timestamp - starFormedTimeRef.current) / 1000;

        // Slowly increase opacity
        starOpacityRef.current = Math.min(1, elapsed / 2.5);
        planetOpacityRef.current = Math.min(1, Math.max(0, (elapsed - 1.0) / 2.0));

        const starAlpha = starOpacityRef.current;
        const planetAlpha = planetOpacityRef.current;

        // Star glow — emerges slowly
        const glowR = 44 + Math.sin(ot * 2) * 3;
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR * 2.5);
        gradient.addColorStop(0, `rgba(251,191,36,${0.9 * starAlpha})`);
        gradient.addColorStop(0.4, `rgba(251,146,60,${0.5 * starAlpha})`);
        gradient.addColorStop(1, 'rgba(251,191,36,0)');
        ctx.beginPath();
        ctx.arc(cx, cy, glowR * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(254,243,199,${starAlpha})`;
        ctx.shadowBlur = 60 * starAlpha;
        ctx.shadowColor = '#fb923c';
        ctx.fill();
        ctx.shadowBlur = 0;

        if (planetAlpha > 0) {
          const orbitR = 160;
          ctx.beginPath();
          ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
          ctx.strokeStyle = canStartCivRef.current ? `rgba(6,182,212,${0.25 * planetAlpha})` : `rgba(6,182,212,${0.08 * planetAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          const px = cx + Math.cos(ot) * orbitR;
          const py = cy + Math.sin(ot) * orbitR;
          planetPosRef.current = { x: px, y: py };
          const pGrad = ctx.createRadialGradient(px - 4, py - 4, 1, px, py, 20);
          pGrad.addColorStop(0, '#a5f3fc');
          pGrad.addColorStop(0.6, '#06b6d4');
          pGrad.addColorStop(1, '#0e7490');
          ctx.beginPath();
          ctx.arc(px, py, 20, 0, Math.PI * 2);
          ctx.fillStyle = pGrad;
          ctx.globalAlpha = planetAlpha;
          ctx.shadowBlur = canStartCivRef.current ? 45 : 22;
          ctx.shadowColor = '#22d3ee';
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;

          if (canStartCivRef.current) {
            ctx.beginPath();
            ctx.arc(px, py, 26 + Math.sin(ot * 4) * 4, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(34,211,238,${(0.3 + Math.sin(ot * 4) * 0.15) * planetAlpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }

      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const hovered = particlesRef.current.find(p => Math.hypot(p.x - mx, p.y - my) < p.radius + 6);
    setHoveredParticle(hovered ? { x: e.clientX, y: e.clientY, name: PARTICLE_CONFIG[hovered.type].name } : null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canStartCivRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const { x: px, y: py } = planetPosRef.current;
    if (Math.hypot(mx - px, my - py) < 34) setPhase('civilization');
  };

  return (
    <div className="w-full h-full relative overflow-hidden flex" ref={containerRef} style={{ background: '#050714' }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ cursor: canStartCiv ? 'pointer' : 'crosshair', left: 0, right: '3rem' }}
        onMouseMove={handleMouseMove}
        onClick={handleCanvasClick}
      />

      {/* Element discovery sidebar */}
      <div className="absolute right-0 top-0 bottom-0 w-14 flex flex-col items-center gap-2 py-5 z-20"
        style={{ background: 'rgba(5,7,20,0.85)', borderLeft: '1px solid rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)' }}>
        <div className="text-white/20 text-xs mb-2" style={{ fontSize: 8, letterSpacing: '0.1em', writingMode: 'vertical-rl', textOrientation: 'upright' }}>
          ELEMENTS
        </div>
        {TYPES.map(type => {
          const isDiscovered = discovered.has(type);
          const config = PARTICLE_CONFIG[type];
          return (
            <div key={type} className="flex flex-col items-center gap-0.5" title={config.name}>
              <div style={{
                width: 9, height: 9, borderRadius: '50%',
                background: isDiscovered ? config.color : 'rgba(255,255,255,0.08)',
                boxShadow: isDiscovered ? `0 0 8px ${config.color}, 0 0 16px ${config.color}50` : 'none',
                transition: 'all 0.8s ease',
              }} />
              <span style={{
                fontSize: 8, fontFamily: 'monospace',
                color: isDiscovered ? config.color : 'rgba(255,255,255,0.15)',
                transition: 'color 0.8s ease',
              }}>
                {type}
              </span>
            </div>
          );
        })}
      </div>

      {hoveredParticle && (
        <div className="fixed z-50 pointer-events-none bg-black/80 backdrop-blur border border-white/10 px-2 py-1 rounded text-xs text-white"
          style={{ left: hoveredParticle.x + 12, top: hoveredParticle.y + 12 }}>
          {hoveredParticle.name}
        </div>
      )}

      <AnimatePresence>
        {canStartCiv && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none z-20"
          >
            <div className="text-xs tracking-widest uppercase animate-pulse"
              style={{ color: 'rgba(34,211,238,0.55)' }}>
              click the planet to begin ↑
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
