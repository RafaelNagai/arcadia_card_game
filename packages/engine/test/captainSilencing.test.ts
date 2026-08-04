import { beforeAll, describe, expect, it } from 'vitest';
import { resolvePlacement } from '../src/rules/resolvePlacement';
import { effectivePower } from '../src/rules/effectivePower';
import { registerEffect } from '../src/effects/registry';
import { bools, makeCaptain, makeCard, makeContent, makeMinimalState, makeShip } from './fixtures/state';

describe('Test 7 — Ship changes owner on consecutive turns; the Captain passive toggles with it', () => {
  beforeAll(() => {
    registerEffect('loud', {
      modifyOwnPower: (power) => power + 2,
    });
  });

  it('the passive is on while the Ship is under its own owner, off while enemy-held, and back on when recaptured', () => {
    const content = makeContent({
      cards: [
        makeCard({ id: 'p1card', power: 5, arrows: bools([]) }), // sits still, only used to probe effectivePower
        makeCard({ id: 'p2attacker', power: 1, arrows: bools([6]) }), // points West at the ship
        makeCard({ id: 'p1attacker', power: 1, arrows: bools([4]) }), // points South at the ship
      ],
      ships: [makeShip({ id: 'ship-P1', shields: bools([]), hull: 1 })], // fully open, easy to flip
      captains: [
        makeCaptain({ id: 'captain-P1', passive: { id: 'loud', description: '+2 power while your Ship is yours' } }),
        makeCaptain({ id: 'captain-P2' }),
      ],
    });

    const state = makeMinimalState({
      cells: {
        12: { content: { kind: 'card', cardId: 'p1card', rot: 0, owner: 'P1' } },
        13: { content: { kind: 'ship', shipId: 'ship-P1', owner: 'P1' } },
      },
      players: {
        P1: { shipId: 'ship-P1', hand: [{ kind: 'card', cardId: 'p1attacker' }] },
        P2: { hand: [{ kind: 'card', cardId: 'p2attacker' }] },
      },
    });

    // Ship starts under its own owner: passive active.
    expect(effectivePower({ state, content, cellIdx: 12 })).toBe(7);

    // P2 captures the Ship (cell 14, West -> cell 13): passive silences immediately.
    const afterP2 = resolvePlacement(state, content, 'P2', 14, { kind: 'card', cardId: 'p2attacker' }, 0);
    expect(afterP2.cells[13].content).toMatchObject({ kind: 'ship', owner: 'P2' });
    expect(effectivePower({ state: afterP2, content, cellIdx: 12 })).toBe(5);

    // P1 recaptures the Ship on the very next turn: passive relights immediately.
    const afterP1 = resolvePlacement(afterP2, content, 'P1', 8, { kind: 'card', cardId: 'p1attacker' }, 0);
    expect(afterP1.cells[13].content).toMatchObject({ kind: 'ship', owner: 'P1' });
    expect(effectivePower({ state: afterP1, content, cellIdx: 12 })).toBe(7);
  });
});
