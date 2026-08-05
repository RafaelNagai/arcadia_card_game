import type { Ship } from '../types';
import { arrowsFrom } from '../util/arrows';
import shipsData from './ships.json';

/** ships.json's shape: same fields as Ship, except shields are the *indices* that are
 *  shielded (0=N clockwise to 7=NW) rather than the length-8 boolean array Ship actually
 *  uses — much less error-prone to hand-edit than typing out 8 booleans per ship. */
interface RawShip {
  id: string;
  name: string;
  shields: number[];
  hull: number;
  imageUrl: string;
}

/** The two extremes of the Ship chart (shields + hull = 11): hard-to-breach-but-easy-to-flank
 *  vs. wide-open-but-thin. Ship data itself lives in ships.json, edited directly to add/change
 *  ships (name, shields, hull, art) without touching TypeScript. */
export const sampleShips: Ship[] = (shipsData as RawShip[]).map((raw) => ({
  ...raw,
  shields: arrowsFrom(raw.shields),
}));
