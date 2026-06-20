import { create } from 'zustand';
import { SUGGESTIONS, Era, RANDOM_EVENTS, GameEvent, SignalResponse, SIGNAL_RESPONSES, OTHER_PLANETS } from '../data/gameData';

export type GamePhase = 'intro' | 'bigbang' | 'particles' | 'civilization' | 'win' | 'lose';

interface LogEntry {
  id: string;
  time: string;
  text: string;
}

interface SentSignal {
  id: string;
  to: string;
  sentAt: number;
  response?: SignalResponse;
  responded: boolean;
}

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
  win: boolean;
  signals: SentSignal[];
  pendingSignalResponse: (SignalResponse & { signalId: string }) | null;

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
}

const initialState = {
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
  suggestions: SUGGESTIONS,
  activeEvent: null,
  win: false,
  signals: [] as SentSignal[],
  pendingSignalResponse: null
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),

  addLog: (text) => set((state) => {
    const time = state.phase === 'civilization'
      ? `year ${formatNum(state.year)}`
      : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { logs: [{ id: Math.random().toString(36), time, text }, ...state.logs].slice(0, 80) };
  }),

  updateStats: (updates) => set((state) => ({ ...state, ...updates })),

  setPlanetName: (name) => set({ planetName: name }),

  advanceTime: (years) => set((state) => {
    const newYear = state.year + years;
    let updates: Partial<GameState> = { year: newYear };

    updates.suggestions = state.suggestions.map(s =>
      newYear >= s.unlockYear ? { ...s, unlocked: true } : s
    );

    if (state.population > 0) {
      const growthFactor = 1 + Math.min(years, 10000) * 0.00001;
      updates.population = Math.floor(state.population * growthFactor);
      updates.food = Math.max(0, state.food - 3);
      if (state.food <= 5) updates.population = Math.floor(state.population * 0.9);
    }

    if (Math.random() > 0.65 && !state.activeEvent && state.population > 0) {
      const pool = RANDOM_EVENTS.filter(e => {
        if (e.type === 'extinction') return state.year > 1000;
        return true;
      });
      const event = pool[Math.floor(Math.random() * pool.length)];
      updates.activeEvent = event;
    }

    if (updates.health !== undefined && updates.health <= 0) updates.phase = 'lose';
    if (updates.population !== undefined && updates.population <= 0 && state.population > 0) updates.phase = 'lose';

    return updates;
  }),

  completeSuggestion: (id) => set((state) => {
    const suggestion = state.suggestions.find(s => s.id === id);
    if (!suggestion) return state;

    const effects = suggestion.effect(state);
    const newPhase = effects.win ? 'win' : state.phase;

    return {
      suggestions: state.suggestions.map(s => s.id === id ? { ...s, completed: true } : s),
      ...effects,
      phase: newPhase,
      logs: [{ id: Math.random().toString(36), time: `year ${formatNum(state.year)}`, text: `✨ completed: ${suggestion.title}` }, ...state.logs].slice(0, 80)
    };
  }),

  resolveEvent: (updates) => set((state) => {
    const newState = { ...state, ...updates, activeEvent: null };
    if (newState.population <= 0 && state.population > 0) newState.phase = 'lose';
    if (newState.health !== undefined && newState.health <= 0) newState.phase = 'lose';
    return newState;
  }),

  sendSignal: (targetPlanet) => {
    const id = Math.random().toString(36).slice(2);
    const signal: SentSignal = { id, to: targetPlanet, sentAt: Date.now(), responded: false };
    set((state) => ({
      signals: [signal, ...state.signals],
      logs: [{ id: Math.random().toString(36), time: `year ${formatNum(state.year)}`, text: `📡 signal sent to ${targetPlanet}...` }, ...state.logs].slice(0, 80)
    }));
    return id;
  },

  deliverSignalResponse: (signalId) => set((state) => {
    const signal = state.signals.find(s => s.id === signalId);
    if (!signal || signal.responded) return state;

    const responsePool = SIGNAL_RESPONSES;
    const response = { ...responsePool[Math.floor(Math.random() * responsePool.length)] };
    const target = signal.to;
    response.from = target;

    const updatedSignals = state.signals.map(s =>
      s.id === signalId ? { ...s, responded: true, response } : s
    );

    return {
      signals: updatedSignals,
      pendingSignalResponse: { ...response, signalId },
      logs: [{ id: Math.random().toString(36), time: `year ${formatNum(state.year)}`, text: `📨 response from ${target}: ${response.type}` }, ...state.logs].slice(0, 80)
    };
  }),

  dismissSignalResponse: () => set((state) => {
    const resp = state.pendingSignalResponse;
    if (!resp) return { pendingSignalResponse: null };
    const effects = resp.effect ? resp.effect(state) : {};
    return { ...effects, pendingSignalResponse: null };
  }),

  resetGame: () => set({ ...initialState, suggestions: SUGGESTIONS.map(s => ({ ...s, completed: false, unlocked: s.unlockYear === 0 })) })
}));

function formatNum(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
  return n.toString();
}
