import type { Captain } from '../types';
import captainsData from './captains.json';

/** Reuses the two archetypes from regras_v0.9.md almost verbatim, just with a rewritten
 *  second element pair. Captain data itself lives in captains.json, edited directly to
 *  add/change captains (name, cargoSlots, passive, art) without touching TypeScript. */
export const sampleCaptains: Captain[] = captainsData as Captain[];
