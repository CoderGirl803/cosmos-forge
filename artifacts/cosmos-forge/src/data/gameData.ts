export type ParticleType = 'H' | 'He' | 'Li' | 'C' | 'N' | 'O' | 'Ne' | 'Si' | 'Fe' | 'Plasma';

export const PARTICLE_CONFIG: Record<ParticleType, { color: string, name: string }> = {
  H: { color: '#e2e8f0', name: 'hydrogen' },
  He: { color: '#fef08a', name: 'helium' },
  Li: { color: '#f472b6', name: 'lithium' },
  C: { color: '#fb923c', name: 'carbon' },
  N: { color: '#4ade80', name: 'nitrogen' },
  O: { color: '#f87171', name: 'oxygen' },
  Ne: { color: '#22d3ee', name: 'neon' },
  Si: { color: '#94a3b8', name: 'silicon' },
  Fe: { color: '#d97706', name: 'iron' },
  Plasma: { color: '#ffffff', name: 'plasma' }
};

export type Era = 'primordial' | 'ancient' | 'medieval' | 'industrial' | 'digital' | 'cosmic';

export interface GameEvent {
  id: string;
  icon: string;
  title: string;
  description: string;
  type: 'neutral' | 'positive' | 'negative' | 'paradox';
  choices?: {
    label: string;
    action: (state: any) => Partial<any>;
  }[];
}

export interface Suggestion {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlockYear: number;
  unlocked: boolean;
  completed: boolean;
  effect: (state: any) => Partial<any>;
}

export const SUGGESTIONS: Suggestion[] = [
  {
    id: 'spark_life',
    icon: '🦠',
    title: 'spark life',
    description: 'seed unicellular organisms in the primordial soup.',
    unlockYear: 0,
    unlocked: true,
    completed: false,
    effect: (s) => ({ population: s.population + 10, health: 95 })
  },
  {
    id: 'multicellular',
    icon: '🐛',
    title: 'multicellular leap',
    description: 'evolve complex cells and simple creatures.',
    unlockYear: 500000000,
    unlocked: false,
    completed: false,
    effect: (s) => ({ population: s.population + 1000, food: s.food + 10 })
  },
  {
    id: 'fire',
    icon: '🔥',
    title: 'teach fire',
    description: 'early beings discover the warmth of flames.',
    unlockYear: 3000000,
    unlocked: false,
    completed: false,
    effect: (s) => ({ tech: s.tech + 10, energy: s.energy + 5 })
  },
  {
    id: 'agriculture',
    icon: '🌾',
    title: 'agriculture',
    description: 'settle down and farm the land.',
    unlockYear: 10000, // Using BCE conceptually mapped
    unlocked: false,
    completed: false,
    effect: (s) => ({ food: s.food + 30, population: s.population * 2, era: 'ancient' })
  },
  {
    id: 'cities',
    icon: '⚔️',
    title: 'first cities',
    description: 'build great walls and civilization centers.',
    unlockYear: 3000,
    unlocked: false,
    completed: false,
    effect: (s) => ({ population: s.population * 2, tech: s.tech + 15 })
  },
  {
    id: 'writing',
    icon: '📜',
    title: 'writing',
    description: 'develop written language to store knowledge.',
    unlockYear: 2000,
    unlocked: false,
    completed: false,
    effect: (s) => ({ tech: s.tech + 20 })
  },
  {
    id: 'industrial',
    icon: '⚙️',
    title: 'industrial revolution',
    description: 'machines, factories, and steam power.',
    unlockYear: 1760, // CE relative to era tracking
    unlocked: false,
    completed: false,
    effect: (s) => ({ energy: s.energy + 40, health: s.health - 15, tech: s.tech + 20, era: 'industrial' })
  },
  {
    id: 'digital',
    icon: '💻',
    title: 'digital age',
    description: 'computers, silicon, and the internet.',
    unlockYear: 1970,
    unlocked: false,
    completed: false,
    effect: (s) => ({ tech: s.tech + 30, energy: s.energy + 20, era: 'digital' })
  },
  {
    id: 'space',
    icon: '🚀',
    title: 'space age',
    description: 'reach for the stars and beyond.',
    unlockYear: 2000,
    unlocked: false,
    completed: false,
    effect: (s) => ({ tech: s.tech + 20, era: 'cosmic' })
  },
  {
    id: 'ai',
    icon: '🤖',
    title: 'ai singularity',
    description: 'superintelligent synthetic life emerges.',
    unlockYear: 2045,
    unlocked: false,
    completed: false,
    effect: (s) => ({ tech: 100, energy: s.energy + 30 })
  },
  {
    id: 'dyson',
    icon: '🌌',
    title: 'dyson sphere',
    description: 'harness the full energy of your star.',
    unlockYear: 2200,
    unlocked: false,
    completed: false,
    effect: (s) => ({ energy: 100, tech: 100 })
  },
  {
    id: 'federation',
    icon: '🪐',
    title: 'galactic federation',
    description: 'join the cosmic community.',
    unlockYear: 2500,
    unlocked: false,
    completed: false,
    effect: (s) => ({ win: true })
  }
];

export const RANDOM_EVENTS: GameEvent[] = [
  {
    id: 'asteroid',
    icon: '☄️',
    title: 'asteroid incoming!',
    description: 'a massive rock is hurtling toward terra-9.',
    type: 'negative',
    choices: [
      { label: 'deflect it (energy)', action: (s) => ({ energy: Math.max(0, s.energy - 20) }) },
      { label: 'accept fate', action: (s) => ({ population: Math.floor(s.population * 0.7) }) }
    ]
  },
  {
    id: 'supervolcano',
    icon: '🌋',
    title: 'supervolcano erupts',
    description: 'ash blocks out the sun.',
    type: 'negative',
    choices: [
      { label: 'evacuate', action: (s) => ({ food: Math.max(0, s.food - 30) }) },
      { label: 'adapt', action: (s) => ({ health: Math.max(0, s.health - 20) }) }
    ]
  },
  {
    id: 'contact',
    icon: '👽',
    title: 'first contact!',
    description: 'strange signals detected from tau ceti.',
    type: 'positive',
    choices: [
      { label: 'communicate', action: (s) => ({ tech: Math.min(100, s.tech + 20) }) },
      { label: 'hide', action: (s) => ({}) }
    ]
  },
  {
    id: 'paradox_sim',
    icon: '🤯',
    title: 'philosophical paradox',
    description: 'if you can simulate a universe, is your universe also simulated? 🤔',
    type: 'paradox',
    choices: [{ label: 'whoa.', action: (s) => ({ tech: Math.min(100, s.tech + 5) }) }]
  },
  {
    id: 'fermi',
    icon: '👀',
    title: 'fermi paradox',
    description: 'the stars are silent... where is everyone?',
    type: 'paradox',
    choices: [{ label: 'keep looking', action: (s) => ({}) }]
  },
  {
    id: 'renaissance',
    icon: '🎉',
    title: 'cultural renaissance!',
    description: 'art and science flourish across the planet.',
    type: 'positive',
    choices: [{ label: 'beautiful', action: (s) => ({ tech: Math.min(100, s.tech + 15), food: Math.min(100, s.food + 15) }) }]
  }
];
