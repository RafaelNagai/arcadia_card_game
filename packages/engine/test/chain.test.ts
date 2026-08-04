import { describe, expect, it } from 'vitest';
import { resolvePlacement } from '../src/rules/resolvePlacement';
import { bools, makeCard, makeContent, makeMinimalState } from './fixtures/state';

describe('Test 3 — Chain: only seeded by a Clash win, depth 1', () => {
  it('propagates one hop from a card dominated by Clash', () => {
    const content = makeContent({
      cards: [
        makeCard({ id: 'attacker', power: 9, arrows: bools([2]) }), // points East
        makeCard({ id: 'bridge', power: 5, arrows: bools([6, 2]) }), // points West (clash) and East (chain)
        makeCard({ id: 'far', power: 1, arrows: bools([]) }), // no return arrow
      ],
    });

    const state = makeMinimalState({
      cells: {
        13: { content: { kind: 'card', cardId: 'bridge', rot: 0, owner: 'P2' } },
        14: { content: { kind: 'card', cardId: 'far', rot: 0, owner: 'P2' } },
      },
      players: {
        P1: { hand: [{ kind: 'card', cardId: 'attacker' }] },
      },
    });

    const newState = resolvePlacement(state, content, 'P1', 12, { kind: 'card', cardId: 'attacker' }, 0);

    expect(newState.cells[13].content).toMatchObject({ kind: 'card', owner: 'P1' }); // won by clash
    expect(newState.cells[14].content).toMatchObject({ kind: 'card', owner: 'P1' }); // captured by chain

    const chainResult = newState.log.at(-1)!.results.find((r) => r.type === 'chain');
    expect(chainResult).toEqual({ type: 'chain', targetIdx: 14, sourceIdx: 13 });
  });

  it('does not propagate past depth 1 by default, and boarding never seeds a chain', () => {
    const content = makeContent({
      cards: [
        makeCard({ id: 'attacker', power: 9, arrows: bools([2]) }),
        makeCard({ id: 'bridge', power: 5, arrows: bools([6, 2]) }),
        makeCard({ id: 'hop2', power: 1, arrows: bools([2]) }), // would chain onward to 15 if depth allowed it
        makeCard({ id: 'untouched', power: 1, arrows: bools([]) }),
      ],
    });

    const state = makeMinimalState({
      cells: {
        13: { content: { kind: 'card', cardId: 'bridge', rot: 0, owner: 'P2' } },
        14: { content: { kind: 'card', cardId: 'hop2', rot: 0, owner: 'P2' } },
        15: { content: { kind: 'card', cardId: 'untouched', rot: 0, owner: 'P2' } },
      },
      players: {
        P1: { hand: [{ kind: 'card', cardId: 'attacker' }] },
      },
    });

    const newState = resolvePlacement(state, content, 'P1', 12, { kind: 'card', cardId: 'attacker' }, 0);

    expect(newState.cells[14].content).toMatchObject({ kind: 'card', owner: 'P1' }); // first hop, still captured
    expect(newState.cells[15].content).toMatchObject({ kind: 'card', owner: 'P2' }); // second hop blocked by depth 1
  });

  it('a card dominated only by Boarding never seeds a chain', () => {
    const content = makeContent({
      cards: [
        makeCard({ id: 'attacker', power: 5, arrows: bools([2]) }), // points East, target has no return arrow
        makeCard({ id: 'undefended', power: 1, arrows: bools([2]) }), // would chain onward if it seeded one
        makeCard({ id: 'next', power: 1, arrows: bools([]) }),
      ],
    });

    const state = makeMinimalState({
      cells: {
        13: { content: { kind: 'card', cardId: 'undefended', rot: 0, owner: 'P2' } },
        14: { content: { kind: 'card', cardId: 'next', rot: 0, owner: 'P2' } },
      },
      players: {
        P1: { hand: [{ kind: 'card', cardId: 'attacker' }] },
      },
    });

    const newState = resolvePlacement(state, content, 'P1', 12, { kind: 'card', cardId: 'attacker' }, 0);

    expect(newState.cells[13].content).toMatchObject({ kind: 'card', owner: 'P1' }); // boarding
    expect(newState.cells[14].content).toMatchObject({ kind: 'card', owner: 'P2' }); // untouched: boarding never chains
  });
});
