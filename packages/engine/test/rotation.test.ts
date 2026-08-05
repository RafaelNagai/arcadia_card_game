import { describe, expect, it } from 'vitest';
import { effectiveArrows } from '../src/rotation';
import { bools } from './fixtures/state';

describe('effectiveArrows (Test 4 — rotation)', () => {
  it('shifts the arrow pattern by two positions per 90° turn', () => {
    const arrows = bools([0]); // N

    expect(effectiveArrows(arrows, 0)).toEqual(bools([0]));
    expect(effectiveArrows(arrows, 1)).toEqual(bools([2])); // 90° -> E
    expect(effectiveArrows(arrows, 2)).toEqual(bools([4])); // 180° -> S
    expect(effectiveArrows(arrows, 3)).toEqual(bools([6])); // 270° -> W
  });

  it('four successive 90° turns return to the original pattern', () => {
    const original = [true, false, true, false, false, true, false, false];
    let rotated = original;
    for (let i = 0; i < 4; i++) {
      rotated = effectiveArrows(rotated, 1); // turn 90° from the already-rotated state
    }
    expect(rotated).toEqual(original);
  });

  it('a multi-arrow pattern rotates while keeping its relative shape', () => {
    // arrows at N, NE, E (indices 0,1,2) -> after 90° (rot=1) become E, SE, S (2,3,4)
    const arrows = bools([0, 1, 2]);
    expect(effectiveArrows(arrows, 1)).toEqual(bools([2, 3, 4]));
  });
});
