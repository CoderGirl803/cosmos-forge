import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../hooks/useGameStore';

export const UNIVERSE_EMAIL_KEY = 'cosmos-forge-email';

function inboxUrl(email: string) {
  const domain = email.split('@')[1]?.toLowerCase() ?? '';
  if (domain.includes('gmail')) return 'https://mail.google.com/';
  if (domain.includes('outlook') || domain.includes('hotmail') || domain.includes('live')) return 'https://outlook.live.com/mail/';
  if (domain.includes('yahoo')) return 'https://mail.yahoo.com/';
  if (domain.includes('icloud') || domain.includes('me.com')) return 'https://www.icloud.com/mail/';
  return `mailto:${email}`;
}

function currentStats() {
  const state = useGameStore.getState();
  return {
    planetName: state.planetName,
    starName: state.starName,
    year: state.year,
    era: state.era,
    population: state.population,
    food: state.food,
    energy: state.energy,
    tech: state.tech,
    health: state.health,
    moons: state.moons.length,
  };
}

export async function syncUniverseEmailStats() {
  const email = localStorage.getItem(UNIVERSE_EMAIL_KEY);
  if (!email) return;

  try {
    await fetch('/api/universe-emails/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, stats: currentStats() }),
    });
  } catch {
    localStorage.setItem('cosmos-forge-email-stats', JSON.stringify(currentStats()));
  }
}

export default function EmailSignupNote() {
  const [email, setEmail] = useState(localStorage.getItem(UNIVERSE_EMAIL_KEY) ?? '');
  const [saved, setSaved] = useState(Boolean(localStorage.getItem(UNIVERSE_EMAIL_KEY)));
  const [status, setStatus] = useState(saved ? 'daily universe note armed.' : '');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus('that email looks a little lost.');
      return;
    }

    localStorage.setItem(UNIVERSE_EMAIL_KEY, trimmed);
    localStorage.setItem('cosmos-forge-email-stats', JSON.stringify(currentStats()));
    setSaved(true);

    try {
      await fetch('/api/universe-emails/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, stats: currentStats() }),
      });
      setStatus('done. check your inbox now.');
    } catch {
      setStatus('saved here. run the api server to send daily emails.');
    }
  };

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, rotate: -3, y: -12 }}
      animate={{ opacity: 1, rotate: -1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.8 }}
      className="absolute left-5 top-5 z-30 w-[260px] pointer-events-auto"
      style={{
        background: '#f8ead0',
        color: '#20150d',
        border: '1px solid rgba(120,80,36,0.35)',
        boxShadow: '0 18px 45px rgba(0,0,0,0.28)',
        padding: '20px 16px 14px',
        fontFamily: 'monospace',
      }}
    >
      <div
        className="absolute left-1/2 top-0 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle at 35% 30%, #fef3c7, #a16207)',
          boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
        }}
      />
      <div className="text-sm leading-snug mb-3">
        gimmie yah email i promise i'll respect yah inbox - sen
      </div>
      <input
        value={email}
        onChange={event => setEmail(event.target.value)}
        type="email"
        placeholder="you@stardust.com"
        className="w-full rounded px-2 py-2 text-xs outline-none"
        style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(120,80,36,0.25)', color: '#20150d' }}
      />
      <div className="mt-2 flex items-center gap-2">
        <button
          type="submit"
          className="rounded px-3 py-1.5 text-xs font-bold"
          style={{ background: '#20150d', color: '#f8ead0' }}
        >
          send me stars
        </button>
        {saved && (
          <a
            href={inboxUrl(email)}
            target="_blank"
            rel="noreferrer"
            className="text-xs underline"
            style={{ color: '#5f3f18' }}
          >
            inbox
          </a>
        )}
      </div>
      {status && <div className="mt-2 text-[10px]" style={{ color: '#6b4a1f' }}>{status}</div>}
    </motion.form>
  );
}
