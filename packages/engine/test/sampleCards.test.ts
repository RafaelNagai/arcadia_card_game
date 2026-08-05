import { describe, expect, it } from 'vitest';
import { sampleCards } from '../src/content/sampleCards';

describe('sampleCards (loaded from content/cards.json)', () => {
  it('has no duplicate ids', () => {
    const ids = sampleCards.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every card a length-8 arrows array and an imageUrl', () => {
    for (const card of sampleCards) {
      expect(card.arrows).toHaveLength(8);
      expect(card.imageUrl.length).toBeGreaterThan(0);
    }
  });
});
