import { create } from 'zustand';
import { SUGGESTIONS, Era, RANDOM_EVENTS, GameEvent, SignalResponse, SIGNAL_RESPONSES, OTHER_PLANETS, DisasterInfo, DISASTERS } from '../data/gameData';

export type GamePhase = 'intro' | 'bigbang' | 'particles' | 'civilization' | 'win' | 'lose';

interface LogEntry { id: string; time: string; text: string; }

export interface Moon { id: string; color: string; size: number; orbitSpeed: number; }

interface SentSignal { id: string; to: string; sentAt: number; response?: SignalResponse; responded: boolean; }

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
  suggestions: typeof SUGGESTIONS;
  activeEvent: GameEvent | null;
  activeDisaster: DisasterInfo | null;
  win: boolean;
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
  sendSignal: (targetPlanet: string) => string;
  deliverSignalResponse: (signalId: string) => void;
  dismissSignalResponse: () => void;
  dismissDisaster: () => void;
  addMoon: (moon: Moon) => void;
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
  suggestions: SUGGESTIONS.map(s => ({ ...s })),
  activeEvent: null,
  activeDisaster: null,
  win: false,
  signals: [] as SentSignal[],
  pendingSignalResponse: null,
  moons: [] as Moon[],
});

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

  advanceTime: (years) => set((state) => {
    if (state.phase !== 'civilization') return state;

    const newYear = state.year + years;
    const updates: Partial<GameState> = { year: newYear };

    // Unlock suggestions based on year only — one at a time
    const nextLocked = state.suggestions.find(s => !s.unlocked && newYear >= s.unlockYear);
    if (nextLocked) {
      updates.suggestions = state.suggestions.map(s =>
        s.id === nextLocked.id ? { ...s, unlocked: true } : s
      );
    }

    // Very slow stat drift — scale by time but capped heavily
    if (state.population > 0) {
      const growthRate = years >= 1_000_000_000 ? 1.005
        : years >= 1_000_000 ? 1.002
        : years >= 1_000 ? 1.0005
        : 1.0001;
      updates.population = Math.floor(state.population * growthRate);
      const foodDrain = years >= 1_000_000_000 ? 0.5 : years >= 1_000 ? 0.2 : 0.1;
      updates.food = Math.max(0, state.food - foodDrain);
      if ((updates.food ?? state.food) <= 3 && state.population > 0) {
        updates.population = Math.floor(state.population * 0.97);
      }
    }

    // Random event (lower chance for big jumps since not much happens per press)
    const eventChance = years >= 1_000_000_000 ? 0.45 : years >= 1_000_000 ? 0.35 : 0.25;
    if (Math.random() < eventChance && !state.activeEvent && state.population > 0) {
      const pool = RANDOM_EVENTS.filter(e => e.type !== 'extinction' || state.year > 2_000_000_000);
      updates.activeEvent = pool[Math.floor(Math.random() * pool.length)];
    }

    // Natural disaster (separate from choice events — auto-applies)
    const disasterChance = years >= 1_000_000_000 ? 0.30 : years >= 1_000_000 ? 0.20 : 0.12;
    if (Math.random() < disasterChance && !state.activeDisaster && state.population > 0 && !updates.activeEvent) {
      const d = DISASTERS[Math.floor(Math.random() * DISASTERS.length)];
      updates.activeDisaster = d;
      // Apply damage immediately
      const deathFraction = d.deathPercent / 100;
      updates.population = Math.floor((updates.population ?? state.population) * (1 - deathFraction));
      updates.energy = Math.max(0, state.energy - d.energyLoss);
      updates.health = Math.max(0, state.health - d.healthLoss);
      updates.food = Math.max(0, (updates.food ?? state.food) - d.healthLoss * 0.3);
    }

    if ((updates.health ?? state.health) <= 0) updates.phase = 'lose';
    if ((updates.population ?? state.population) <= 0 && state.population > 0) updates.phase = 'lose';

    return updates;
  }),

  completeSuggestion: (id) => set((state) => {
    const suggestion = state.suggestions.find(s => s.id === id);
    if (!suggestion) return state;
    const effects = suggestion.effect(state);
    const newPhase = (effects as any).win ? 'win' : state.phase;
    return {
      suggestions: state.suggestions.map(s => s.id === id ? { ...s, completed: true } : s),
      ...effects,
      phase: newPhase,
      logs: [{ id: Math.random().toString(36), time: `yr ${fmtYear(state.year)}`, text: `✨ ${suggestion.title} completed!` }, ...state.logs].slice(0, 80),
    };
  }),

  resolveEvent: (updates) => set((state) => {
    const next = { ...state, ...updates, activeEvent: null };
    if (next.population <= 0 && state.population > 0) next.phase = 'lose';
    if ((next.health ?? 100) <= 0) next.phase = 'lose';
    return next;
  }),

  dismissDisaster: () => set({ activeDisaster: null }),

  addMoon: (moon) => set((state) => ({ moons: [...state.moons, moon] })),

  sendSignal: (targetPlanet) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({
      signals: [{ id, to: targetPlanet, sentAt: Date.now(), responded: false }, ...state.signals],
      logs: [{ id: Math.random().toString(36), time: `yr ${fmtYear(state.year)}`, text: `📡 signal sent to ${targetPlanet}...` }, ...state.logs].slice(0, 80),
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
      logs: [{ id: Math.random().toString(36), time: `yr ${fmtYear(state.year)}`, text: `📨 ${signal.to} responded: ${response.type}` }, ...state.logs].slice(0, 80),
    };
  }),

  dismissSignalResponse: () => set((state) => {
    const resp = state.pendingSignalResponse;
    if (!resp) return { pendingSignalResponse: null };
    const effects = resp.effect ? resp.effect(state) : {};
    return { ...effects, pendingSignalResponse: null };
  }),

  resetGame: () => set(mkInitial()),
}));

function fmtYear(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
  return n.toString();
}
