import { create } from 'zustand';
import { SUGGESTIONS, Era, RANDOM_EVENTS, GameEvent, SignalResponse, SIGNAL_RESPONSES, DisasterInfo, DISASTERS } from '../data/gameData';

export type GamePhase = 'intro' | 'bigbang' | 'particles' | 'civilization' | 'lose';

interface LogEntry { id: string; time: string; text: string; }
export interface Moon { id: string; color: string; size: number; orbitSpeed: number; }
interface SentSignal { id: string; to: string; sentAt: number; response?: SignalResponse; responded: boolean; }

interface TimedAlert { timeLeft: number; }

interface GameState {
  phase: GamePhase;
  logs: LogEntry[];
  population: number;
  food: number;
  energy: number;
  tech: number;
  health: number;
  year: number;
  era: Era;
  planetName: string;
  starName: string;
  starStatus: 'stable' | 'flare' | 'supernova' | 'blackhole';
  planetLevel: number;
  shieldLevel: number;
  greenhouse: number;
  orbitDecay: number;
  suggestions: typeof SUGGESTIONS;
  activeEvent: GameEvent | null;
  activeDisaster: DisasterInfo | null;
  blackHoleAlert: TimedAlert | null;
  pandemicAlert: TimedAlert | null;
  nuclearAlert: TimedAlert | null;
  deathReason: string;
  signals: SentSignal[];
  pendingSignalResponse: (SignalResponse & { signalId: string }) | null;
  moons: Moon[];

  setPhase: (phase: GamePhase) => void;
  addLog: (text: string) => void;
  updateStats: (updates: Partial<GameState>) => void;
  advanceTime: (years: number) => void;
  completeSuggestion: (id: string) => void;
  resolveEvent: (updates: Partial<GameState>) => void;
  resetGame: () => void;
  setPlanetName: (name: string) => void;
  setStarName: (name: string) => void;
  sendSignal: (targetPlanet: string) => string;
  deliverSignalResponse: (signalId: string) => void;
  dismissSignalResponse: () => void;
  dismissDisaster: () => void;
  addMoon: (moon: Moon) => void;
  escapeBlackHole: () => void;
  tickBlackHole: () => void;
  escapePandemic: () => void;
  tickPandemic: () => void;
  escapeNuclear: () => void;
  tickNuclear: () => void;
}

const mkInitial = () => ({
  phase: 'intro' as GamePhase,
  logs: [] as LogEntry[],
  population: 0,
  food: 10,
  energy: 10,
  tech: 0,
  health: 100,
  year: 0,
  era: 'primordial' as Era,
  planetName: 'terra-9',
  starName: 'sol-prime',
  starStatus: 'stable' as const,
  planetLevel: 1,
  shieldLevel: 0,
  greenhouse: 0,
  orbitDecay: 0,
  suggestions: SUGGESTIONS.map(s => ({ ...s })),
  activeEvent: null as GameEvent | null,
  activeDisaster: null as DisasterInfo | null,
  blackHoleAlert: null as TimedAlert | null,
  pandemicAlert: null as TimedAlert | null,
  nuclearAlert: null as TimedAlert | null,
  deathReason: '',
  signals: [] as SentSignal[],
  pendingSignalResponse: null,
  moons: [] as Moon[],
});

function getDeathReason(eventId: string | undefined, era: Era): string {
  const map: Record<string, string> = {
    asteroid_massive: 'a 15km rock rewrote the surface in fire and silence.',
    plague_global: 'the supervirus moved faster than your last cure. nobody made it.',
    nuclear_war: 'the arsenals spoke louder than the diplomats.',
    p_dark_forest: 'you broadcast your coordinates. they answered — with weapons.',
    tech_singularity: 'the machine you built to serve you decided it had better plans.',
    alien_invasion: 'they followed your signal home. politely, at first.',
    dark_forest_strike: 'they found you before you could hide. there was no warning.',
    gray_goo: 'the nanobots were thorough. methodical. they left nothing.',
    black_hole: 'your planet crossed the event horizon. physics made no exceptions.',
    pandemic: 'the engineered pathogen spread before the cure could reach everyone.',
    nuclear_launch: 'the missiles landed before the defense shields activated.',
    tech_overdose: 'your civilization achieved godlike power. wisdom did not keep pace.',
    resource_collapse: 'you consumed faster than the planet could heal.',
    signal_war: 'the aliens you contacted sent warships instead of handshakes.',
    alien_misunderstanding: 'a color in your transmission meant war in their language. you had no way to know.',
  };
  if (map[eventId ?? '']) return map[eventId ?? ''];
  if (era === 'cosmic') return 'at the height of your power, something broke that could not be fixed.';
  if (era === 'digital' || era === 'industrial') return 'technology accelerated past wisdom. the cascade was total.';
  return 'the last light on your planet flickered, and went out.';
}

export const useGameStore = create<GameState>((set, get) => ({
  ...mkInitial(),

  setPhase: (phase) => set({ phase }),
  addLog: (text) => set((state) => {
    const time = state.phase === 'civilization'
      ? `yr ${fmtYear(state.year)}`
      : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { logs: [{ id: Math.random().toString(36), time, text }, ...state.logs].slice(0, 80) };
  }),

  updateStats: (updates) => set((state) => ({ ...state, ...updates })),
  setPlanetName: (name) => set({ planetName: name }),
  setStarName: (name) => set({ starName: name }),

  advanceTime: (years) => set((state) => {
    if (state.phase !== 'civilization') return state;

    const newYear = state.year + years;
    const updates: Partial<GameState> & { deathReason?: string } = {
      year: newYear,
      orbitDecay: Math.min(1, state.orbitDecay + years / 6_000_000_000),
    };
    const hasHumans = newYear >= 3_500_000_000 && (updates.population ?? state.population) >= 200_000_000;

    // Unlock suggestions
    const nextLocked = state.suggestions.find(s => !s.unlocked && newYear >= s.unlockYear);
    if (nextLocked) {
      updates.suggestions = state.suggestions.map(s => s.id === nextLocked.id ? { ...s, unlocked: true } : s);
    }

    // Slow stat drift
    if (state.population > 0) {
      const rate = years >= 1_000_000_000 ? 1.005 : years >= 1_000_000 ? 1.002 : 1.0005;
      updates.population = Math.floor(state.population * rate);
      const drain = years >= 1_000_000_000 ? 0.5 : years >= 1_000_000 ? 0.2 : 0.1;
      updates.food = Math.max(0, state.food - drain);
      if ((updates.food ?? state.food) < 3) {
        updates.population = Math.floor((updates.population ?? state.population) * 0.97);
        if (hasHumans && (updates.population ?? 0) < 1000 && state.population > 0) {
          updates.phase = 'lose';
          updates.deathReason = 'famine swept the planet. the last generation starved in silence.';
        }
      }
    }

    // Overpopulation collapse
    if (hasHumans && (updates.population ?? state.population) > 800_000_000_000 && Math.random() < 0.22) {
      updates.phase = 'lose';
      updates.deathReason = 'population exceeded all sustainable limits. the biosphere collapsed in a decade.';
    }

    // Tech overdose
    if (state.tech >= 95 && state.energy >= 88 && !state.activeEvent && !(updates.activeEvent) && Math.random() < 0.10) {
      const evt = RANDOM_EVENTS.find(e => e.id === 'tech_singularity');
      if (evt) updates.activeEvent = evt;
    }

    // Rare stellar crisis
    const starChance = state.era === 'cosmic' ? 0.08 : state.era === 'digital' ? 0.035 : 0.012;
    if (hasHumans && state.population > 0 && state.year >= 2_000_000_000 && state.starStatus === 'stable' && !state.activeEvent && !(updates.activeEvent) && Math.random() < starChance) {
      const evt = RANDOM_EVENTS.find(e => e.id === 'stellar_instability');
      if (evt) updates.activeEvent = evt;
      updates.starStatus = 'flare';
    }

    // Random events
    const eventChance = years >= 1_000_000_000 ? 0.45 : years >= 1_000_000 ? 0.35 : 0.25;
    if (Math.random() < eventChance && !state.activeEvent && !(updates.activeEvent) && state.population > 0) {
      const pool = RANDOM_EVENTS.filter(e => {
        if (e.id === 'tech_singularity') return false;
        if (e.type === 'paradox' && !hasHumans) return false;
        if (['ai_war', 'tech_singularity', 'nuclear_war', 'nuclear_war_2', 'nuclear_winter_2', 'gray_goo', 'dimension_leak'].includes(e.id) && !hasHumans) return false;
        if (e.type === 'extinction' && !hasHumans) return false;
        if (e.id === 'nuclear_war' && state.era === 'primordial') return false;
        if (e.id === 'nuclear_war_2' && state.era === 'primordial') return false;
        return true;
      });
      if (pool.length) updates.activeEvent = pool[Math.floor(Math.random() * pool.length)];
    }

    // Natural disaster
    const disasterChance = years >= 1_000_000_000 ? 0.28 : years >= 1_000_000 ? 0.18 : 0.10;
    if (hasHumans && Math.random() < disasterChance && !state.activeDisaster && !(updates.activeEvent) && state.population > 0) {
      const d = DISASTERS[Math.floor(Math.random() * DISASTERS.length)];
      updates.activeDisaster = d;
      const shieldReduction = Math.min(0.8, state.shieldLevel * 0.22);
      const kill = Math.max(0, d.deathPercent / 100 - shieldReduction);
      updates.population = Math.floor((updates.population ?? state.population) * (1 - kill));
      updates.energy = Math.max(0, state.energy - Math.max(0, d.energyLoss - state.shieldLevel * 4));
      updates.health = Math.max(0, state.health - Math.max(0, d.healthLoss - state.shieldLevel * 3) - Math.floor(state.greenhouse / 8));
    }

    // Black hole trigger
    const bhChance = years >= 1_000_000_000 ? 0.05 : 0.02;
    if (hasHumans && !state.blackHoleAlert && !state.pandemicAlert && !state.nuclearAlert && state.tech >= 35 && state.year >= 4_000_000_000 && Math.random() < bhChance) {
      updates.blackHoleAlert = { timeLeft: 5 };
      updates.logs = [{ id: Math.random().toString(36), time: `yr ${fmtYear(newYear)}`, text: '⚫ CRITICAL: black hole gravitational pull detected!' }, ...state.logs].slice(0, 80);
    }

    // Pandemic alert
    const pandChance = years >= 1_000_000_000 ? 0.07 : 0.03;
    if (!state.pandemicAlert && !state.blackHoleAlert && !state.nuclearAlert && hasHumans && !updates.blackHoleAlert && Math.random() < pandChance) {
      updates.pandemicAlert = { timeLeft: 5 };
      updates.logs = [{ id: Math.random().toString(36), time: `yr ${fmtYear(newYear)}`, text: '🦠 OUTBREAK: engineered pathogen spreading rapidly!' }, ...state.logs].slice(0, 80);
    }

    // Nuclear launch alert
    const nukeChance = years >= 1_000_000_000 ? 0.04 : 0.02;
    if (!state.nuclearAlert && !state.blackHoleAlert && !state.pandemicAlert && !updates.pandemicAlert && (state.era === 'industrial' || state.era === 'digital' || state.era === 'cosmic') && Math.random() < nukeChance) {
      updates.nuclearAlert = { timeLeft: 5 };
      updates.logs = [{ id: Math.random().toString(36), time: `yr ${fmtYear(newYear)}`, text: '☢️ LAUNCH DETECTED: nuclear warheads inbound!' }, ...state.logs].slice(0, 80);
    }

    // Death checks
    if (hasHumans && (updates.health ?? state.health) <= 0 && !updates.phase) {
      updates.phase = 'lose';
      if (!updates.deathReason) updates.deathReason = getDeathReason(undefined, state.era);
    }
    if (hasHumans && (updates.population ?? state.population) <= 0 && state.population > 0 && !updates.phase) {
      updates.phase = 'lose';
      if (!updates.deathReason) updates.deathReason = getDeathReason(undefined, state.era);
    }

    return updates;
  }),

  completeSuggestion: (id) => set((state) => {
    const suggestion = state.suggestions.find(s => s.id === id);
    if (!suggestion) return state;
    const effects = suggestion.effect(state) as any;
    delete effects.win;
    return {
      suggestions: state.suggestions.map(s => s.id === id ? { ...s, completed: true } : s),
      ...effects,
      logs: [{ id: Math.random().toString(36), time: `yr ${fmtYear(state.year)}`, text: `✨ ${suggestion.title} achieved!` }, ...state.logs].slice(0, 80),
    };
  }),

  resolveEvent: (updates) => set((state) => {
    const raw = updates as any;
    const next: any = { ...state, ...updates, activeEvent: null };
    const died = (next.population <= 0 && state.population > 0) || next.health <= 0;
    if (died && next.phase !== 'lose') {
      next.phase = 'lose';
      next.deathReason = raw.deathReason || getDeathReason(state.activeEvent?.id, state.era);
    }
    return next;
  }),

  dismissDisaster: () => set({ activeDisaster: null }),
  addMoon: (moon) => set((state) => ({ moons: [...state.moons, moon] })),

  escapeBlackHole: () => set((state) => ({
    blackHoleAlert: null,
    logs: [{ id: Math.random().toString(36), time: `yr ${fmtYear(state.year)}`, text: '⚡ emergency thrust! your planet escaped the black hole.' }, ...state.logs].slice(0, 80),
  })),
  tickBlackHole: () => set((state) => {
    if (!state.blackHoleAlert) return state;
    const newTime = state.blackHoleAlert.timeLeft - 1;
    if (newTime <= 0) return { blackHoleAlert: null, phase: 'lose', deathReason: 'your planet crossed the event horizon. the gravitational tide tore it apart atom by atom.' };
    return { blackHoleAlert: { timeLeft: newTime } };
  }),

  escapePandemic: () => set((state) => ({
    pandemicAlert: null,
    population: Math.floor(state.population * 0.92),
    health: Math.max(0, state.health - 8),
    logs: [{ id: Math.random().toString(36), time: `yr ${fmtYear(state.year)}`, text: '🔬 cure deployed! pandemic contained — but not without cost.' }, ...state.logs].slice(0, 80),
  })),
  tickPandemic: () => set((state) => {
    if (!state.pandemicAlert) return state;
    const newTime = state.pandemicAlert.timeLeft - 1;
    if (newTime <= 0) {
      const newPop = Math.floor(state.population * 0.35);
      if (newPop <= 0) return { pandemicAlert: null, phase: 'lose', deathReason: 'the engineered pathogen had no cure. it spread without mercy until nothing breathed.' };
      return { pandemicAlert: null, population: newPop, health: Math.max(0, state.health - 30), logs: [{ id: Math.random().toString(36), time: `yr ${fmtYear(state.year)}`, text: '💀 pandemic unchecked — 65% of population lost.' }, ...state.logs].slice(0, 80) };
    }
    return { pandemicAlert: { timeLeft: newTime } };
  }),

  escapeNuclear: () => set((state) => ({
    nuclearAlert: null,
    energy: Math.max(0, state.energy - 25),
    logs: [{ id: Math.random().toString(36), time: `yr ${fmtYear(state.year)}`, text: '🛡️ missiles intercepted! defense grid held — barely.' }, ...state.logs].slice(0, 80),
  })),
  tickNuclear: () => set((state) => {
    if (!state.nuclearAlert) return state;
    const newTime = state.nuclearAlert.timeLeft - 1;
    if (newTime <= 0) {
      const newPop = Math.floor(state.population * 0.48);
      const newHealth = Math.max(0, state.health - 40);
      if (newPop <= 0 || newHealth <= 0) return { nuclearAlert: null, phase: 'lose', deathReason: 'the nuclear exchange sterilized the surface. a hundred years of ash followed. nothing survived the winter.' };
      return { nuclearAlert: null, population: newPop, health: newHealth, energy: Math.max(0, state.energy - 50), logs: [{ id: Math.random().toString(36), time: `yr ${fmtYear(state.year)}`, text: '☢️ nuclear strike — 52% population lost. nuclear winter begins.' }, ...state.logs].slice(0, 80) };
    }
    return { nuclearAlert: { timeLeft: newTime } };
  }),

  sendSignal: (targetPlanet) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({
      signals: [{ id, to: targetPlanet, sentAt: Date.now(), responded: false }, ...state.signals],
      logs: [{ id: Math.random().toString(36), time: `yr ${fmtYear(state.year)}`, text: `📡 signal transmitted to ${targetPlanet}...` }, ...state.logs].slice(0, 80),
    }));
    return id;
  },

  deliverSignalResponse: (signalId) => set((state) => {
    const signal = state.signals.find(s => s.id === signalId);
    if (!signal || signal.responded) return state;
    const response = { ...SIGNAL_RESPONSES[Math.floor(Math.random() * SIGNAL_RESPONSES.length)], from: signal.to };
    return {
      signals: state.signals.map(s => s.id === signalId ? { ...s, responded: true, response } : s),
      pendingSignalResponse: { ...response, signalId },
      logs: [{ id: Math.random().toString(36), time: `yr ${fmtYear(state.year)}`, text: `📨 ${signal.to} responded` }, ...state.logs].slice(0, 80),
    };
  }),

  dismissSignalResponse: () => set((state) => {
    const resp = state.pendingSignalResponse;
    if (!resp) return { pendingSignalResponse: null };
    const effects = resp.effect ? resp.effect(state) : {};
    const effAny = effects as any;
    if ((effAny.population !== undefined && effAny.population === 0) || (effAny.health !== undefined && effAny.health <= 0)) {
      return {
        ...effects,
        pendingSignalResponse: null,
        phase: 'lose',
        deathReason: resp.type === 'war'
          ? 'your signal was an act of war. the fleet arrived before your defenses were ready.'
          : 'the contact ended your civilization.',
      };
    }
    return { ...effects, pendingSignalResponse: null };
  }),

  resetGame: () => set(mkInitial()),
}));

export function fmtYear(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
  return n.toString();
}
