import { describe, expect, it } from 'vitest';
import { resolvePlacement } from '../src/rules/resolvePlacement';
import { bools, makeCard, makeContent, makeMinimalState } from './fixtures/state';

describe('Test 1 — Boarding: arrow against a card with no return arrow', () => {
  it('dominates automatically and does not propagate', () => {
    const content = makeContent({
      cards: [
        makeCard({ id: 'attacker', power: 5, arrows: bools([2]) }), // points only East
        makeCard({ id: 'target', power: 9, arrows: bools([]) }), // no arrows: cannot point back
      ],
    });

    const state = makeMinimalState({
      cells: {
        13: { content: { kind: 'card', cardId: 'target', rot: 0, owner: 'P2' } },
      },
      players: {
        P1: { hand: [{ kind: 'card', cardId: 'attacker' }] },
      },
    });

    const newState = resolvePlacement(state, content, 'P1', 12, { kind: 'card', cardId: 'attacker' }, 0);

    expect(newState.cells[13].content).toMatchObject({ kind: 'card', owner: 'P1' });

    const event = newState.log.at(-1)!;
    expect(event.results).toEqual([{ type: 'boarding', targetIdx: 13, direction: 2 }]);
  });

  it('does not dominate cards already owned by the same player', () => {
    const content = makeContent({
      cards: [
        makeCard({ id: 'attacker', power: 5, arrows: bools([2]) }),
        makeCard({ id: 'own', power: 1, arrows: bools([]) }),
      ],
    });

    const state = makeMinimalState({
      cells: {
        13: { content: { kind: 'card', cardId: 'own', rot: 0, owner: 'P1' } },
      },
      players: {
        P1: { hand: [{ kind: 'card', cardId: 'attacker' }] },
      },
    });

    const newState = resolvePlacement(state, content, 'P1', 12, { kind: 'card', cardId: 'attacker' }, 0);

    expect(newState.log.at(-1)!.results).toEqual([]);
  });
});
