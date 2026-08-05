import { describe, expect, it } from 'vitest';
import { sampleCaptains } from '../src/content/sampleCaptains';
import { sampleShips } from '../src/content/sampleShips';

describe('sampleShips (loaded from content/ships.json)', () => {
  it('has no duplicate ids and gives every ship a length-8 shields array and an imageUrl', () => {
    const ids = sampleShips.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const ship of sampleShips) {
      expect(ship.shields).toHaveLength(8);
      expect(ship.imageUrl.length).toBeGreaterThan(0);
    }
  });
});

describe('sampleCaptains (loaded from content/captains.json)', () => {
  it('has no duplicate ids and gives every captain an imageUrl', () => {
    const ids = sampleCaptains.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const captain of sampleCaptains) {
      expect(captain.imageUrl.length).toBeGreaterThan(0);
    }
  });
});
