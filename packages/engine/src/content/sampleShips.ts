import type { Ship } from '../types';
import { arrowsFrom } from '../util/arrows';

/** The two extremes of the Ship chart (shields + hull = 11): hard-to-breach-but-easy-to-flank vs. wide-open-but-thin. */
export const sampleShips: Ship[] = [
  {
    id: 'ship-widowmaker',
    name: 'The Widowmaker',
    shields: arrowsFrom([0, 2, 4]), // N, E, S shielded — 3 shields, 5 open angles
    hull: 8,
  },
  {
    id: 'ship-sieve',
    name: 'The Sieve',
    shields: arrowsFrom([0, 1, 2, 3, 4, 6]), // N, NE, E, SE, S, W shielded — 6 shields, 2 open angles (SW, NW)
    hull: 5,
  },
];
