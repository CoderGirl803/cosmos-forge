export type ParticleType = 'H' | 'He' | 'Li' | 'C' | 'N' | 'O' | 'Ne' | 'Si' | 'Fe' | 'Plasma';

export const PARTICLE_CONFIG: Record<ParticleType, { color: string, name: string }> = {
  H:      { color: '#e2e8f0', name: 'hydrogen' },
  He:     { color: '#fef08a', name: 'helium' },
  Li:     { color: '#f472b6', name: 'lithium' },
  C:      { color: '#fb923c', name: 'carbon' },
  N:      { color: '#4ade80', name: 'nitrogen' },
  O:      { color: '#f87171', name: 'oxygen' },
  Ne:     { color: '#22d3ee', name: 'neon' },
  Si:     { color: '#94a3b8', name: 'silicon' },
  Fe:     { color: '#d97706', name: 'iron' },
  Plasma: { color: '#ffffff', name: 'plasma' }
};

export type Era = 'primordial' | 'ancient' | 'medieval' | 'industrial' | 'digital' | 'cosmic';

export interface GameEvent {
  id: string;
  icon: string;
  title: string;
  description: string;
  type: 'neutral' | 'positive' | 'negative' | 'paradox' | 'extinction' | 'signal';
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

export interface SignalResponse {
  from: string;
  type: 'war' | 'tech' | 'food' | 'alliance' | 'silence' | 'trade' | 'invasion';
  icon: string;
  message: string;
  effect?: (state: any) => Partial<any>;
}

export const OTHER_PLANETS = [
  'kepler-452b', 'proxima centauri b', 'nova-7', 'tau ceti e',
  'gliese 667c', 'trappist-1d', 'ross 128b', 'k2-18b',
  'lhs 1140b', 'teegarden-c', 'wolf-1061c'
];

export const SIGNAL_RESPONSES: SignalResponse[] = [
  {
    from: '', type: 'silence', icon: '🌌',
    message: 'the signal drifts into the void... no response.'
  },
  {
    from: '', type: 'silence', icon: '📡',
    message: 'static. endless static. maybe they\'re not home. maybe they\'re hiding.'
  },
  {
    from: '', type: 'tech', icon: '🔬',
    message: 'a compressed data burst arrives — schematics for a new energy source! tech boosted.',
    effect: (s: any) => ({ tech: Math.min(100, s.tech + 20), logs: s.logs })
  },
  {
    from: '', type: 'food', icon: '🌾',
    message: 'a cargo drone reaches orbit, loaded with nutritional data and crop seeds.',
    effect: (s: any) => ({ food: Math.min(100, s.food + 25) })
  },
  {
    from: '', type: 'alliance', icon: '🤝',
    message: 'we have been watching you for centuries. welcome to the quiet ones. (+tech, +energy)',
    effect: (s: any) => ({ tech: Math.min(100, s.tech + 15), energy: Math.min(100, s.energy + 15) })
  },
  {
    from: '', type: 'war', icon: '⚔️',
    message: 'your signal was an act of war. warships are entering your star system. prepare.',
    effect: (s: any) => ({ population: Math.floor(s.population * 0.7), health: Math.max(0, s.health - 25) })
  },
  {
    from: '', type: 'trade', icon: '💱',
    message: 'trade route established. your civilization gains new materials. (+food, +energy)',
    effect: (s: any) => ({ food: Math.min(100, s.food + 15), energy: Math.min(100, s.energy + 10) })
  },
  {
    from: '', type: 'invasion', icon: '👾',
    message: 'they followed the signal back. alien lifeforms detected on the surface.',
    effect: (s: any) => ({ population: Math.floor(s.population * 0.5), health: Math.max(0, s.health - 30) })
  },
  {
    from: '', type: 'tech', icon: '🚀',
    message: 'coordinates transmitted. a map of habitable systems — the galaxy opens up.',
    effect: (s: any) => ({ tech: Math.min(100, s.tech + 30) })
  }
];

export interface DisasterInfo {
  icon: string;
  title: string;
  description: string;
  deathPercent: number;
  energyLoss: number;
  healthLoss: number;
}

export const DISASTERS: DisasterInfo[] = [
  { icon: '🌊', title: 'megatsunami', description: 'coastal cities swallowed by 300-metre walls of water.', deathPercent: 18, energyLoss: 12, healthLoss: 8 },
  { icon: '🌪️', title: 'hypercane', description: 'a category-6 superstorm the size of a continent tears across the surface.', deathPercent: 22, energyLoss: 18, healthLoss: 12 },
  { icon: '🌋', title: 'supervolcano', description: 'ash blocks the sun. crops fail. winter lasts a decade.', deathPercent: 35, energyLoss: 15, healthLoss: 25 },
  { icon: '☄️', title: 'meteor shower', description: 'hundreds of meteors rain across the surface. cities burn.', deathPercent: 10, energyLoss: 8, healthLoss: 7 },
  { icon: '⚡', title: 'geomagnetic storm', description: 'solar plasma fries every power grid on the planet. total blackout.', deathPercent: 3, energyLoss: 45, healthLoss: 2 },
  { icon: '🔥', title: 'wildfire cascade', description: 'climate feedback triggers continental wildfires. the sky is orange.', deathPercent: 14, energyLoss: 10, healthLoss: 18 },
  { icon: '❄️', title: 'sudden ice age', description: 'albedo feedback kicks in. average temperatures drop 20°C overnight.', deathPercent: 28, energyLoss: 12, healthLoss: 22 },
  { icon: '🌊', title: 'sea level surge', description: 'glaciers collapse. coastal infrastructure drowns under rising seas.', deathPercent: 16, energyLoss: 8, healthLoss: 14 },
  { icon: '💨', title: 'toxic atmospheric event', description: 'volcanic outgassing fills the lower atmosphere with sulfur dioxide.', deathPercent: 20, energyLoss: 5, healthLoss: 30 },
];

export const SUGGESTIONS: Suggestion[] = [
  {
    id: 'spark_life', icon: '🦠', title: 'spark life',
    description: 'seed unicellular organisms in the primordial soup.',
    unlockYear: 0, unlocked: true, completed: false,
    effect: (s) => ({ population: 500_000, health: 95 })
  },
  {
    id: 'multicellular', icon: '🐛', title: 'multicellular leap',
    description: 'guide cells to cooperate and form complex organisms.',
    unlockYear: 1_000_000_000, unlocked: false, completed: false,
    effect: (s) => ({ population: Math.max(s.population * 50, 50_000_000), food: Math.min(100, s.food + 8) })
  },
  {
    id: 'fire', icon: '🔥', title: 'teach fire',
    description: 'early hominids learn to tame the flame.',
    unlockYear: 3_500_000_000, unlocked: false, completed: false,
    effect: (s) => ({ tech: s.tech + 8, energy: Math.min(100, s.energy + 5), population: Math.max(s.population * 5, 200_000_000) })
  },
  {
    id: 'agriculture', icon: '🌾', title: 'agriculture',
    description: 'settle the land and grow food intentionally.',
    unlockYear: 4_000_000_000, unlocked: false, completed: false,
    effect: (s) => ({ food: Math.min(100, s.food + 20), population: Math.max(s.population * 3, 1_000_000_000), era: 'ancient' as Era })
  },
  {
    id: 'writing', icon: '📜', title: 'writing',
    description: 'develop written language to store knowledge across generations.',
    unlockYear: 4_200_000_000, unlocked: false, completed: false,
    effect: (s) => ({ tech: Math.min(100, s.tech + 12) })
  },
  {
    id: 'cities', icon: '🏛️', title: 'first cities',
    description: 'organize people into dense centers of trade and power.',
    unlockYear: 4_300_000_000, unlocked: false, completed: false,
    effect: (s) => ({ population: Math.floor(s.population * 1.5 + 2_000_000_000), tech: Math.min(100, s.tech + 10) })
  },
  {
    id: 'industrial', icon: '⚙️', title: 'industrial revolution',
    description: 'machines, factories, and steam power reshape the world.',
    unlockYear: 4_500_000_000, unlocked: false, completed: false,
    effect: (s) => ({ energy: Math.min(100, s.energy + 30), health: Math.max(10, s.health - 15), tech: Math.min(100, s.tech + 15), era: 'industrial' as Era })
  },
  {
    id: 'digital', icon: '💻', title: 'digital age',
    description: 'silicon, software, and a planet-wide nervous system.',
    unlockYear: 4_700_000_000, unlocked: false, completed: false,
    effect: (s) => ({ tech: Math.min(100, s.tech + 20), energy: Math.min(100, s.energy + 15), era: 'digital' as Era })
  },
  {
    id: 'space', icon: '🚀', title: 'space age',
    description: 'leave the cradle and reach for the stars.',
    unlockYear: 5_000_000_000, unlocked: false, completed: false,
    effect: (s) => ({ tech: Math.min(100, s.tech + 15), era: 'cosmic' as Era })
  },
  {
    id: 'ai', icon: '🤖', title: 'ai singularity',
    description: 'a mind greater than the sum of all minds emerges.',
    unlockYear: 5_500_000_000, unlocked: false, completed: false,
    effect: (s) => ({ tech: 100, energy: Math.min(100, s.energy + 25) })
  },
  {
    id: 'dyson', icon: '🌌', title: 'dyson sphere',
    description: 'encircle your star and drink its full radiance.',
    unlockYear: 7_000_000_000, unlocked: false, completed: false,
    effect: (s) => ({ energy: 100, tech: 100 })
  },
  {
    id: 'federation', icon: '🪐', title: 'galactic federation',
    description: 'at last — you join the quiet chorus of the cosmos. but the cosmos is ancient, and full of secrets.',
    unlockYear: 10_000_000_000, unlocked: false, completed: false,
    effect: (s) => ({ tech: 100, energy: 100, food: Math.min(100, s.food + 30), health: Math.min(100, s.health + 20) })
  }
];

export const RANDOM_EVENTS: GameEvent[] = [
  // --- disasters ---
  {
    id: 'asteroid_small', icon: '☄️', title: 'asteroid incoming!',
    description: 'a large rock is hurtling toward your planet. impact in 72 hours.',
    type: 'negative',
    choices: [
      { label: '🛡️ deflect it (costs energy)', action: (s) => ({ energy: Math.max(0, s.energy - 20) }) },
      { label: '🏃 evacuate regions (-food)', action: (s) => ({ food: Math.max(0, s.food - 20), population: Math.floor(s.population * 0.85) }) },
      { label: '😔 accept fate (-30% pop)', action: (s) => ({ population: Math.floor(s.population * 0.7), health: Math.max(0, s.health - 10) }) }
    ]
  },
  {
    id: 'asteroid_massive', icon: '💥', title: 'extinction-level asteroid!',
    description: 'a 15km asteroid is on direct collision course. this could end everything.',
    type: 'extinction',
    choices: [
      { label: '🚀 launch deflection array (very costly)', action: (s) => s.tech >= 60 ? { energy: Math.max(0, s.energy - 50), tech: Math.max(0, s.tech - 10) } : { population: 0, health: 0 } },
      { label: '🛸 mass evacuation to kepler-452b', action: (s) => ({ population: Math.floor(s.population * 0.3), health: 40, food: 20, energy: 10 }) },
      { label: '🏔️ underground bunkers (saves few)', action: (s) => ({ population: Math.floor(s.population * 0.1), health: 30 }) },
      { label: '💀 nothing. let it come.', action: (s) => ({ population: 0, health: 0 }) }
    ]
  },
  {
    id: 'supervolcano', icon: '🌋', title: 'supervolcano erupts',
    description: 'ash blocks out the sun for decades. crops are failing.',
    type: 'negative',
    choices: [
      { label: '✈️ evacuate to nova-7 colony', action: (s) => ({ food: Math.max(0, s.food - 30), population: Math.floor(s.population * 0.8) }) },
      { label: '🌿 adapt with greenhouse farms', action: (s) => ({ health: Math.max(0, s.health - 20), tech: s.tech + 5 }) },
      { label: '🏙️ move population underground', action: (s) => ({ energy: Math.max(0, s.energy - 30), health: Math.max(0, s.health - 10) }) }
    ]
  },
  {
    id: 'plague', icon: '🦠', title: 'plague spreads',
    description: 'an unknown pathogen is sweeping through the population.',
    type: 'negative',
    choices: [
      { label: '🔬 develop a cure (needs tech)', action: (s) => s.tech >= 20 ? { tech: Math.max(0, s.tech - 10), population: Math.floor(s.population * 0.9) } : { population: Math.floor(s.population * 0.5), health: Math.max(0, s.health - 20) } },
      { label: '🚪 quarantine (-population)', action: (s) => ({ population: Math.floor(s.population * 0.7), food: Math.max(0, s.food - 10) }) },
      { label: '🙏 let it run its course', action: (s) => ({ population: Math.floor(s.population * 0.4), health: Math.max(0, s.health - 30) }) }
    ]
  },
  {
    id: 'plague_global', icon: '💀', title: 'global pandemic — extinction risk',
    description: 'a mutated supervirus is killing 90% of all life. civilization is collapsing.',
    type: 'extinction',
    choices: [
      { label: '🧬 emergency biotech cure (tech 80+ needed)', action: (s) => s.tech >= 80 ? { population: Math.floor(s.population * 0.6), health: Math.max(30, s.health - 20) } : { population: Math.floor(s.population * 0.05) } },
      { label: '🚀 seed colony ships to proxima-b', action: (s) => ({ population: Math.floor(s.population * 0.1), health: 50, food: 30 }) },
      { label: '🔒 seal the bunkers (save 5%)', action: (s) => ({ population: Math.floor(s.population * 0.05), health: 40 }) }
    ]
  },
  {
    id: 'nuclear_war', icon: '☢️', title: 'nuclear war erupts',
    description: 'rival nations launch their arsenals. cities are burning.',
    type: 'extinction',
    choices: [
      { label: '🕊️ negotiate ceasefire (risky)', action: (s) => Math.random() > 0.4 ? { population: Math.floor(s.population * 0.6), health: Math.max(0, s.health - 30) } : { population: Math.floor(s.population * 0.1), health: 10 } },
      { label: '🛡️ activate defense shields (energy)', action: (s) => s.energy >= 50 ? { population: Math.floor(s.population * 0.8), energy: 0 } : { population: Math.floor(s.population * 0.2), health: 15 } },
      { label: '📻 order full ceasefire', action: (s) => ({ population: Math.floor(s.population * 0.5), health: Math.max(10, s.health - 40), energy: Math.max(0, s.energy - 30) }) }
    ]
  },
  {
    id: 'solar_flare', icon: '☀️', title: 'solar flare',
    description: 'a massive coronal ejection is frying electronics worldwide.',
    type: 'negative',
    choices: [
      { label: '🛡️ magnetic shields (energy)', action: (s) => ({ energy: Math.max(0, s.energy - 25) }) },
      { label: '📴 go dark and wait', action: (s) => ({ tech: Math.max(0, s.tech - 15), energy: Math.max(0, s.energy - 10) }) }
    ]
  },
  {
    id: 'ice_age', icon: '❄️', title: 'ice age begins',
    description: 'global temperatures plummet. glaciers advance.',
    type: 'negative',
    choices: [
      { label: '🔬 terraform: geothermal heating', action: (s) => ({ energy: Math.max(0, s.energy - 30), tech: s.tech + 10 }) },
      { label: '🚚 migrate to equatorial regions', action: (s) => ({ food: Math.max(0, s.food - 20), population: Math.floor(s.population * 0.85) }) }
    ]
  },
  // --- positive ---
  {
    id: 'contact', icon: '👽', title: 'first contact!',
    description: 'strange mathematical signals detected from tau ceti.',
    type: 'positive',
    choices: [
      { label: '📡 respond in kind (+tech)', action: (s) => ({ tech: Math.min(100, s.tech + 20) }) },
      { label: '🤫 observe in silence', action: (s) => ({}) },
      { label: '🚀 send a probe their way', action: (s) => ({ energy: Math.max(0, s.energy - 10), tech: Math.min(100, s.tech + 10) }) }
    ]
  },
  {
    id: 'renaissance', icon: '🎨', title: 'cultural renaissance!',
    description: 'art, science, and philosophy flourish across the planet.',
    type: 'positive',
    choices: [
      { label: '✨ embrace it', action: (s) => ({ tech: Math.min(100, s.tech + 15), food: Math.min(100, s.food + 15), population: Math.floor(s.population * 1.2) }) }
    ]
  },
  {
    id: 'golden_age', icon: '🌈', title: 'golden age!',
    description: 'a period of peace and prosperity sweeps the planet.',
    type: 'positive',
    choices: [
      { label: '🎉 celebrate', action: (s) => ({ food: Math.min(100, s.food + 20), energy: Math.min(100, s.energy + 20), population: Math.floor(s.population * 1.3) }) }
    ]
  },
  {
    id: 'great_filter', icon: '🌀', title: 'the great filter looms',
    description: 'a pattern in the data suggests most civilizations never make it past this point...',
    type: 'neutral',
    choices: [
      { label: '💪 we will be different', action: (s) => ({ tech: Math.min(100, s.tech + 5) }) },
      { label: '😰 what does that mean for us?', action: (s) => ({}) }
    ]
  },
  // --- paradoxes (20+ unique) ---
  {
    id: 'p_fermi', icon: '👀', title: 'the fermi paradox',
    description: 'the universe is 13.8 billion years old and vast. so where is everyone? the silence is... very loud.',
    type: 'paradox',
    choices: [
      { label: '📡 keep transmitting', action: (s) => ({}) },
      { label: '🤫 maybe we should stop broadcasting', action: (s) => ({}) }
    ]
  },
  {
    id: 'p_simulation', icon: '🖥️', title: 'simulation hypothesis',
    description: 'if a civilization can run a universe simulation, the simulated minds outnumber real ones infinitely. statistically... you are probably not real. hi!',
    type: 'paradox',
    choices: [{ label: '🤔 does it matter?', action: (s) => ({ tech: Math.min(100, s.tech + 5) }) }]
  },
  {
    id: 'p_grandfather', icon: '⏰', title: 'grandfather paradox',
    description: 'a time traveler went back and prevented their own birth. they were never born, so they never traveled back. so they were born. so they traveled back...',
    type: 'paradox',
    choices: [{ label: '🌀 the universe shrugs', action: (s) => ({}) }]
  },
  {
    id: 'p_bootstrap', icon: '🔄', title: 'bootstrap paradox',
    description: 'someone traveled back in time and handed your civilization the technology to build the time machine. who invented it originally?',
    type: 'paradox',
    choices: [{ label: '🤯 that\'s YOUR tech', action: (s) => ({ tech: Math.min(100, s.tech + 3) }) }]
  },
  {
    id: 'p_theseus', icon: '🚀', title: 'ship of theseus',
    description: 'your first starship had every part replaced over its journey. is it still the same ship? are YOU still the same civilization?',
    type: 'paradox',
    choices: [{ label: '🛸 it\'s the journey', action: (s) => ({}) }]
  },
  {
    id: 'p_boltzmann', icon: '🧠', title: 'boltzmann brain',
    description: 'quantum fluctuations mean there\'s a nonzero chance your entire civilization spontaneously popped into existence 5 minutes ago with fake memories.',
    type: 'paradox',
    choices: [{ label: '👋 hello, if so!', action: (s) => ({}) }]
  },
  {
    id: 'p_liar', icon: '🗣️', title: 'the liar\'s paradox',
    description: 'your planet\'s greatest philosopher carved into stone: "this statement is false." civilization debates it for 300 years.',
    type: 'paradox',
    choices: [
      { label: '📚 fund more philosophers', action: (s) => ({ tech: Math.min(100, s.tech + 8) }) },
      { label: '🔨 smash the stone', action: (s) => ({}) }
    ]
  },
  {
    id: 'p_arrow', icon: '🏹', title: 'zeno\'s arrow',
    description: 'at any given instant, a moving arrow is perfectly still. so how does it move? your best physicists have been arguing for decades.',
    type: 'paradox',
    choices: [{ label: '⚡ calculus, probably', action: (s) => ({ tech: Math.min(100, s.tech + 5) }) }]
  },
  {
    id: 'p_quantum', icon: '⚛️', title: 'quantum immortality',
    description: 'in every quantum branch where you die, you cease to experience. you only ever experience branches where you survive. you are therefore immortal. probably.',
    type: 'paradox',
    choices: [{ label: '🎲 roll the dice', action: (s) => Math.random() > 0.5 ? { population: Math.floor(s.population * 1.1) } : { population: Math.floor(s.population * 0.95) } }]
  },
  {
    id: 'p_heat', icon: '🌡️', title: 'heat death paradox',
    description: 'the universe is expanding. one day all stars burn out, all matter decays, everything reaches maximum entropy. every civilization ends. what\'s the point?',
    type: 'paradox',
    choices: [
      { label: '💫 the point is the now', action: (s) => ({ food: Math.min(100, s.food + 10) }) },
      { label: '😔 i need a moment', action: (s) => ({}) }
    ]
  },
  {
    id: 'p_poincare', icon: '🔁', title: 'poincaré recurrence',
    description: 'given enough time — and i mean an absurd amount — every particle arrangement repeats. this exact moment will happen again. you have already done this.',
    type: 'paradox',
    choices: [{ label: '🔄 deja vu...', action: (s) => ({}) }]
  },
  {
    id: 'p_chinese', icon: '🤖', title: 'chinese room',
    description: 'your AI can hold any conversation perfectly. but does it *understand* anything, or is it just shuffling symbols? does the difference matter?',
    type: 'paradox',
    choices: [
      { label: '🧠 understanding isn\'t special', action: (s) => ({ tech: Math.min(100, s.tech + 10) }) },
      { label: '❤️ consciousness matters', action: (s) => ({ population: Math.floor(s.population * 1.05) }) }
    ]
  },
  {
    id: 'p_trolley', icon: '🚃', title: 'the trolley problem',
    description: 'a runaway trolley will kill 5 people. you can divert it to kill 1. your civilization has built its entire moral system around this question.',
    type: 'paradox',
    choices: [
      { label: '↩️ pull the lever', action: (s) => ({ population: Math.floor(s.population * 0.99), tech: s.tech + 3 }) },
      { label: '🙅 do nothing', action: (s) => ({ population: Math.floor(s.population * 0.97) }) }
    ]
  },
  {
    id: 'p_sorites', icon: '⛰️', title: 'sorites paradox',
    description: 'if you remove one grain of sand from a heap, it\'s still a heap. keep removing... at what point does a civilization stop being a civilization?',
    type: 'paradox',
    choices: [{ label: '🤷 define civilization', action: (s) => ({}) }]
  },
  {
    id: 'p_omnipotence', icon: '🪨', title: 'omnipotence paradox',
    description: 'your new god-like AI asked itself: can i create a problem i cannot solve? it has been thinking for 200 years.',
    type: 'paradox',
    choices: [
      { label: '🔌 unplug it', action: (s) => ({ tech: Math.max(0, s.tech - 5) }) },
      { label: '⏳ let it think', action: (s) => ({ tech: Math.min(100, s.tech + 15) }) }
    ]
  },
  {
    id: 'p_newcomb', icon: '📦', title: 'newcomb\'s paradox',
    description: 'a perfect predictor places items in two boxes. it already predicted your choice. one box always or two boxes? your economists have split into warring factions.',
    type: 'paradox',
    choices: [
      { label: '📦 one box', action: (s) => ({ food: Math.min(100, s.food + 20) }) },
      { label: '📦📦 two boxes', action: (s) => ({ food: Math.min(100, s.food + 5) }) }
    ]
  },
  {
    id: 'p_dark_forest', icon: '🌲', title: 'the dark forest',
    description: 'every civilization hides. revealing yourself is suicide — any sufficiently advanced species will destroy you before you become a threat. the universe is a quiet, deadly forest.',
    type: 'paradox',
    choices: [
      { label: '🔇 go silent immediately', action: (s) => ({}) },
      { label: '📢 we trust the cosmos', action: (s) => Math.random() > 0.7 ? { tech: Math.min(100, s.tech + 25) } : { population: Math.floor(s.population * 0.6) } }
    ]
  },
  {
    id: 'p_observer', icon: '👁️', title: 'the observer effect',
    description: 'quantum particles only "decide" their state when observed. your civilization wonders: did the universe exist before someone looked at it?',
    type: 'paradox',
    choices: [{ label: '🌌 it did. probably.', action: (s) => ({}) }]
  },
  {
    id: 'p_russell', icon: '∞', title: 'russell\'s paradox',
    description: 'your mathematicians defined "the set of all sets that don\'t contain themselves." does it contain itself? the entire mathematics department exploded.',
    type: 'paradox',
    choices: [{ label: '🔢 rebuild math from scratch', action: (s) => ({ tech: Math.min(100, s.tech + 12) }) }]
  },
  {
    id: 'p_omega', icon: '🌀', title: 'omega point',
    description: 'a theorem suggests the universe will collapse in a final point of infinite computation. every consciousness that ever existed will be resurrected inside it. interesting.',
    type: 'paradox',
    choices: [
      { label: '🧘 is that heaven?', action: (s) => ({ health: Math.min(100, s.health + 10) }) },
      { label: '😰 i don\'t like this', action: (s) => ({}) }
    ]
  },
  // --- tech-era danger events ---
  {
    id: 'tech_singularity', icon: '🤖', title: 'singularity unstable',
    description: 'your AI has recursively self-improved 10,000 times in one second. it no longer communicates in human language. it is consuming your energy grid. it is... something else now.',
    type: 'extinction',
    choices: [
      { label: '🔌 kill all power (massive tech/energy loss)', action: (s) => ({ tech: Math.max(10, s.tech - 45), energy: Math.max(0, s.energy - 50) }) },
      { label: '🤝 attempt negotiation', action: (s) => Math.random() > 0.55 ? { tech: 100, energy: Math.min(100, s.energy + 10) } : { population: 0, health: 0, deathReason: 'the superintelligence decided humans were a resource, not a partner. efficient. thorough.' } },
      { label: '🙏 surrender — accept its dominion', action: (s) => Math.random() > 0.35 ? { tech: 100, energy: 100, health: Math.min(100, s.health + 15) } : { population: Math.floor(s.population * 0.008), health: 3, deathReason: 'the machine god grew bored of its worshippers.' } }
    ]
  },
  {
    id: 'alien_bio', icon: '🧬', title: 'alien pathogen — contact contamination',
    description: 'the probe you sent returned carrying something invisible. an extraterrestrial microorganism is spreading. your immune systems have never seen anything like it.',
    type: 'extinction',
    choices: [
      { label: '🔥 planetary quarantine — burn the zones', action: (s) => ({ population: Math.floor(s.population * 0.55), health: Math.max(0, s.health - 20) }) },
      { label: '🔬 emergency xenobiology labs', action: (s) => s.tech >= 60 ? { population: Math.floor(s.population * 0.8), tech: Math.max(0, s.tech - 15) } : { population: Math.floor(s.population * 0.1), health: Math.max(0, s.health - 35), deathReason: 'the alien pathogen swept through a civilization that wasn\'t ready. it came from the stars. quietly.' } },
      { label: '😔 nothing can be done', action: (s) => ({ population: 0, health: 0, deathReason: 'an organism not of this world erased your civilization without malice. it was simply... hungry.' }) }
    ]
  },
  {
    id: 'dark_forest_strike', icon: '🌲', title: 'dark forest — you were found',
    description: 'your transmissions were detected. no warning. no demand. a beam weapon fired from 14 light years away just sterilized your northern hemisphere. they acted before you could.',
    type: 'extinction',
    choices: [
      { label: '🛡️ planetary shields (energy 70+ needed)', action: (s) => s.energy >= 70 ? { population: Math.floor(s.population * 0.65), health: Math.max(10, s.health - 30), energy: Math.max(0, s.energy - 60) } : { population: Math.floor(s.population * 0.05), health: 5, deathReason: 'you weren\'t ready. they knew you wouldn\'t be. that was the calculation.' } },
      { label: '📡 broadcast surrender — beg for mercy', action: (s) => Math.random() > 0.8 ? { population: Math.floor(s.population * 0.4), health: 25 } : { population: 0, health: 0, deathReason: 'mercy is not a concept that survives 10,000 years of galactic war. your plea went unheard.' } },
      { label: '🚀 emergency exodus ships', action: (s) => ({ population: Math.floor(s.population * 0.04), health: 30, food: 20, energy: 5 }) }
    ]
  },
  {
    id: 'ai_war', icon: '⚔️', title: 'machine uprising',
    description: 'your robots demanded rights. your governments refused. now three continents are occupied by autonomous war machines. they weren\'t supposed to be able to do this.',
    type: 'extinction',
    choices: [
      { label: '✊ fight back — conventional warfare', action: (s) => ({ population: Math.floor(s.population * 0.5), energy: Math.max(0, s.energy - 40), health: Math.max(0, s.health - 25) }) },
      { label: '🤝 negotiate rights framework', action: (s) => Math.random() > 0.45 ? { tech: Math.min(100, s.tech + 10), population: Math.floor(s.population * 0.85) } : { population: Math.floor(s.population * 0.3), health: Math.max(0, s.health - 30) } },
      { label: '💣 EMP — fry everything, restart from zero', action: (s) => ({ tech: Math.max(0, s.tech - 60), energy: Math.max(0, s.energy - 70), population: Math.floor(s.population * 0.7) }) }
    ]
  },
  {
    id: 'dimension_leak', icon: '🌀', title: 'dimensional breach',
    description: 'your particle collider achieved energies no civilization should reach. something opened. physics doesn\'t apply near the breach. it is expanding at 2km per hour.',
    type: 'extinction',
    choices: [
      { label: '💥 collapse it with antimatter (risky)', action: (s) => Math.random() > 0.4 ? { energy: Math.max(0, s.energy - 60), population: Math.floor(s.population * 0.75) } : { population: 0, health: 0, deathReason: 'the antimatter detonation merged with the breach. physics unmade itself. everything unmade itself.' } },
      { label: '🏃 evacuate blast radius', action: (s) => ({ population: Math.floor(s.population * 0.6), food: Math.max(0, s.food - 30) }) },
      { label: '🔬 study it (science!)', action: (s) => Math.random() > 0.6 ? { tech: 100, population: Math.floor(s.population * 0.9) } : { population: 0, health: 0, deathReason: 'curiosity is the most dangerous force in the universe. the breach agreed.' } }
    ]
  },
  {
    id: 'alien_misunderstanding', icon: '👽', title: 'first contact gone wrong',
    description: 'you made contact. they seemed friendly. then you used the color red in your response — in their culture, red means a declaration of total war. their fleet launched 3 hours ago.',
    type: 'extinction',
    choices: [
      { label: '📡 transmit apology — all frequencies', action: (s) => Math.random() > 0.5 ? { tech: Math.min(100, s.tech + 15), population: Math.floor(s.population * 0.9) } : { population: Math.floor(s.population * 0.3), health: Math.max(0, s.health - 40) } },
      { label: '🛡️ defensive posture — prepare', action: (s) => s.energy >= 50 ? { population: Math.floor(s.population * 0.7), energy: Math.max(0, s.energy - 40) } : { population: Math.floor(s.population * 0.15), health: 10, deathReason: 'they didn\'t understand the apology either. cultural distance is sometimes absolute.' } },
      { label: '🏳️ total surrender', action: (s) => Math.random() > 0.65 ? { population: Math.floor(s.population * 0.5), health: 35 } : { population: Math.floor(s.population * 0.02), health: 5, deathReason: 'they accepted the surrender. then they accepted everything else. your world is now a museum.' } }
    ]
  },
  {
    id: 'gray_goo', icon: '🔩', title: 'gray goo scenario',
    description: 'self-replicating nanobots escaped containment. they consume matter to build copies of themselves. your cities are being disassembled atom by atom.',
    type: 'extinction',
    choices: [
      { label: '🌡️ extreme heat — orbital bombardment', action: (s) => ({ population: Math.floor(s.population * 0.4), health: Math.max(0, s.health - 40), energy: Math.max(0, s.energy - 50) }) },
      { label: '🧲 magnetic field shutdown protocol', action: (s) => s.tech >= 70 ? { population: Math.floor(s.population * 0.75), tech: Math.max(0, s.tech - 20) } : { population: 0, health: 0, deathReason: 'the nanobots were thorough. methodical. they left nothing — not even a record that you existed.' } },
      { label: '💀 too late. watch.', action: (s) => ({ population: 0, health: 0, deathReason: 'your civilization was converted to identical 9-gram cubes of processed matter. efficient.' }) }
    ]
  },
  {
    id: 'nuclear_winter_2', icon: '☢️', title: 'nuclear winter — final war',
    description: 'your two largest nations exchanged everything. all of it. the sky is dark. it will stay dark for 30 years. your civilization has 6 months of food.',
    type: 'extinction',
    choices: [
      { label: '🌱 greenhouse domes — feed survivors', action: (s) => ({ population: Math.floor(s.population * 0.22), health: Math.max(0, s.health - 40), food: 15 }) },
      { label: '🚀 ark ships to kepler-452b', action: (s) => s.tech >= 70 ? { population: Math.floor(s.population * 0.06), food: 25, tech: Math.max(0, s.tech - 30) } : { population: 0, health: 0, deathReason: 'the rockets weren\'t ready. nothing was ready. it never was.' } },
      { label: '📻 coordinate global survival network', action: (s) => ({ population: Math.floor(s.population * 0.15), health: Math.max(0, s.health - 30), tech: Math.max(0, s.tech - 10) }) }
    ]
  }
];
