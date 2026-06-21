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

  const particlesRef = useRef<Particle[]>([]);
  const discoveredRef = useRef<Set<ParticleType>>(new Set(['H']));
  const starFormedRef = useRef(false);
  const frameRef = useRef(0);
  const orbitTimeRef = useRef(0);
  const planetPosRef = useRef({ x: 0, y: 0 });
  const canStartCivRef = useRef(false);

  // init particles
  useEffect(() => {
    const count = 200;
    const w = window.innerWidth;
    const h = window.innerHeight;
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5,
      type: 'H' as ParticleType,
      radius: 2 + Math.random() * 2,
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
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isFormed = starFormedRef.current;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      let ironCount = 0;
      let plasmaCount = 0;

      particlesRef.current.forEach((p, idx) => {
        if (!isFormed) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

          // Bouncing collisions with nearby particles
          for (let j = idx + 1; j < Math.min(idx + 8, particlesRef.current.length); j++) {
            const q = particlesRef.current[j];
            const dx = q.x - p.x;
            const dy = q.y - p.y;
            const dist = Math.hypot(dx, dy);
            const minD = p.radius + q.radius + 1;
            if (dist < minD && dist > 0) {
              const nx = dx / dist;
              const ny = dy / dist;
              const relV = (p.vx - q.vx) * nx + (p.vy - q.vy) * ny;
              if (relV > 0) {
                p.vx -= relV * nx;
                p.vy -= relV * ny;
                q.vx += relV * nx;
                q.vy += relV * ny;
              }
            }
          }

          if (Math.random() < 0.012) {
            const ci = TYPES.indexOf(p.type);
            if (ci < TYPES.length - 1) {
              p.type = TYPES[ci + 1];
              checkDiscovered(p.type);
            }
          }
        } else {
          // Orbit star
          if (p.orbitAngle === undefined) {
            const dx = p.x - cx;
            const dy = p.y - cy;
            p.orbitRadius = Math.max(55, Math.hypot(dx, dy));
            p.orbitAngle = Math.atan2(dy, dx);
          }
          const speed = 0.0015 + (idx % 7) * 0.00025;
          p.orbitAngle! += speed;
          p.x = cx + Math.cos(p.orbitAngle!) * p.orbitRadius!;
          p.y = cy + Math.sin(p.orbitAngle!) * p.orbitRadius!;

          if (Math.random() < 0.002) {
            const ci = TYPES.indexOf(p.type);
            if (ci < TYPES.length - 1) { p.type = TYPES[ci + 1]; checkDiscovered(p.type); }
          }
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

      if (!isFormed && ironCount >= 5 && plasmaCount >= 5) {
        starFormedRef.current = true;
        setTimeout(() => {
          setCanStartCiv(true);
          canStartCivRef.current = true;
          addLog('🌍 your planet is ready. click it to begin.');
        }, 1800);
      }

      if (isFormed) {
        orbitTimeRef.current += 0.008;
        const ot = orbitTimeRef.current;

        // Star glow
        const glowR = 44 + Math.sin(ot * 2) * 3;
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR * 2.5);
        gradient.addColorStop(0, 'rgba(251,191,36,0.9)');
        gradient.addColorStop(0.4, 'rgba(251,146,60,0.5)');
        gradient.addColorStop(1, 'rgba(251,191,36,0)');
        ctx.beginPath();
        ctx.arc(cx, cy, glowR * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
        ctx.fillStyle = '#fef3c7';
        ctx.shadowBlur = 60;
        ctx.shadowColor = '#fb923c';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Orbit trail
        const orbitR = 160;
        ctx.beginPath();
        ctx.arc(cx, cy, orbitR, 0, Math.PI * 2);
        ctx.strokeStyle = canStartCivRef.current ? 'rgba(6,182,212,0.25)' : 'rgba(6,182,212,0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Planet
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
        if (canStartCivRef.current) {
          ctx.shadowBlur = 45;
          ctx.shadowColor = '#22d3ee';
        } else {
          ctx.shadowBlur = 22;
          ctx.shadowColor = '#22d3ee';
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Clickable indicator pulse
        if (canStartCivRef.current) {
          ctx.beginPath();
          ctx.arc(px, py, 26 + Math.sin(ot * 4) * 4, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(34,211,238,${0.3 + Math.sin(ot * 4) * 0.15})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
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

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canStartCivRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const { x: px, y: py } = planetPosRef.current;
    if (Math.hypot(mx - px, my - py) < 32) {
      setPhase('civilization');
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden" ref={containerRef}
      style={{ background: '#050714' }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ cursor: canStartCiv ? 'pointer' : 'crosshair' }}
        onMouseMove={handleMouseMove}
        onClick={handleCanvasClick}
      />

      {hoveredParticle && (
        <div
          className="fixed z-50 pointer-events-none bg-black/80 backdrop-blur border border-white/10 px-2 py-1 rounded text-xs text-white"
          style={{ left: hoveredParticle.x + 12, top: hoveredParticle.y + 12 }}
        >
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
