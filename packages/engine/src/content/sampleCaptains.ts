import type { Captain } from '../types';

/** Reuses the two archetypes from regras_v0.9.md almost verbatim, just with a rewritten second element pair. */
export const sampleCaptains: Captain[] = [
  {
    id: 'captain-loud',
    name: 'The One Who Shouts Loudest',
    cargoSlots: 4, // starts with 3 common cards + 4 Cargo
    passive: {
      id: 'captain-loud-voice',
      description: 'Your Creature cards have +2 power · your NPC cards have -1.',
    },
  },
  {
    id: 'captain-broker',
    name: 'The Tide-Bound Broker',
    cargoSlots: 2, // starts with 5 common cards + 2 Cargo
    passive: {
      id: 'captain-tide-broker',
      description: 'Your Astral cards have +2 power · your Paradox cards have -1.',
    },
  },
];
