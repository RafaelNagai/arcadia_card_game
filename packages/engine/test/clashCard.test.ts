import { describe, expect, it } from 'vitest';
import { resolvePlacement } from '../src/rules/resolvePlacement';
import { bools, makeCard, makeContent, makeMinimalState } from './fixtures/state';

describe('Test 2 — Clash: arrow against arrow', () => {
  it('higher power dominates', () => {
    const content = makeContent({
      cards: [
        makeCard({ id: 'strong', power: 8, arrows: bools([2]) }), // points East
        makeCard({ id: 'weak', power: 5, arrows: bools([6]) }), // points West back
      ],
    });

    const state = makeMinimalState({
      cells: {
        13: { content: { kind: 'card', cardId: 'weak', rot: 0, owner: 'P2' } },
      },
      players: {
        P1: { hand: [{ kind: 'card', cardId: 'strong' }] },
      },
    });

    const newState = resolvePlacement(state, content, 'P1', 12, { kind: 'card', cardId: 'strong' }, 0);

    expect(newState.cells[13].content).toMatchObject({ kind: 'card', owner: 'P1' });
    expect(newState.log.at(-1)!.results).toEqual([
      {
        type: 'clash',
        targetIdx: 13,
        direction: 2,
        attackerPower: 8,
        defenderPower: 5,
        winner: 'attacker',
        dominated: true,
      },
    ]);
  });

  it('a tie keeps the card with the defender', () => {
    const content = makeContent({
      cards: [
        makeCard({ id: 'a', power: 6, arrows: bools([2]) }),
        makeCard({ id: 'b', power: 6, arrows: bools([6]) }),
      ],
    });

    const state = makeMinimalState({
      cells: {
        13: { content: { kind: 'card', cardId: 'b', rot: 0, owner: 'P2' } },
      },
      players: {
        P1: { hand: [{ kind: 'card', cardId: 'a' }] },
      },
    });

    const newState = resolvePlacement(state, content, 'P1', 12, { kind: 'card', cardId: 'a' }, 0);

    expect(newState.cells[13].content).toMatchObject({ kind: 'card', owner: 'P2' });
    expect(newState.log.at(-1)!.results).toEqual([
      {
        type: 'clash',
        targetIdx: 13,
        direction: 2,
        attackerPower: 6,
        defenderPower: 6,
        winner: 'defender',
        dominated: false,
      },
    ]);
  });
});
