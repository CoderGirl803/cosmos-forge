import { create } from 'zustand';
import { SUGGESTIONS, Era, RANDOM_EVENTS, GameEvent } from '../data/gameData';

export type GamePhase = 'intro' | 'bigbang' | 'particles' | 'civilization' | 'win' | 'lose';

interface LogEntry {
  id: string;
  time: string;
  text: string;
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
  suggestions: typeof SUGGESTIONS;
  activeEvent: GameEvent | null;
  win: boolean;
  
  setPhase: (phase: GamePhase) => void;
  addLog: (text: string) => void;
  updateStats: (updates: Partial<GameState>) => void;
  advanceTime: (years: number) => void;
  completeSuggestion: (id: string) => void;
  resolveEvent: (updates: Partial<GameState>) => void;
  resetGame: () => void;
}

const initialState = {
  phase: 'intro' as GamePhase,
  logs: [],
  population: 0,
  food: 10,
  energy: 10,
  tech: 0,
  health: 100,
  year: 0,
  era: 'primordial' as Era,
  suggestions: SUGGESTIONS,
  activeEvent: null,
  win: false
};

export const useGameStore = create<GameState>((set, get) => ({
  ...initialState,
  
  setPhase: (phase) => set({ phase }),
  
  addLog: (text) => set((state) => {
    const time = state.phase === 'civilization' ? `year ${state.year}` : new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    return { logs: [{ id: Math.random().toString(36), time, text }, ...state.logs].slice(0, 50) };
  }),

  updateStats: (updates) => set((state) => ({ ...state, ...updates })),

  advanceTime: (years) => set((state) => {
    const newYear = state.year + years;
    let updates: Partial<GameState> = { year: newYear };

    // Update suggestions unlock
    updates.suggestions = state.suggestions.map(s => 
      (newYear >= s.unlockYear) ? { ...s, unlocked: true } : s
    );

    // Natural stat shifts based on time
    if (state.population > 0) {
      updates.population = Math.floor(state.population * (1 + (Math.min(years, 1000) * 0.01)));
      updates.food = Math.max(0, state.food - 5);
      if (updates.food === 0) updates.population = Math.floor(updates.population * 0.8);
    }

    // Random events chance
    if (Math.random() > 0.7 && !state.activeEvent && state.population > 0) {
      const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
      updates.activeEvent = event;
    }

    // Check lose conditions
    if (updates.health && updates.health <= 0) updates.phase = 'lose';
    if (state.population > 0 && updates.population !== undefined && updates.population <= 0) updates.phase = 'lose';

    return updates;
  }),

  completeSuggestion: (id) => set((state) => {
    const suggestion = state.suggestions.find(s => s.id === id);
    if (!suggestion) return state;
    
    const effects = suggestion.effect(state);
    
    return {
      suggestions: state.suggestions.map(s => s.id === id ? { ...s, completed: true } : s),
      ...effects,
      logs: [{ id: Math.random().toString(36), time: `year ${state.year}`, text: `✨ completed: ${suggestion.title}` }, ...state.logs].slice(0, 50)
    };
  }),

  resolveEvent: (updates) => set((state) => ({
    ...state,
    ...updates,
    activeEvent: null
  })),

  resetGame: () => set(initialState)
}));
