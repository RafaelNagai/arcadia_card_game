import { describe, expect, it } from 'vitest';
import { randomBot } from '../src/bots/randomBot';
import { greedyBot } from '../src/bots/greedyBot';
import { routeBot } from '../src/bots/routeBot';
import { createRng } from '../src/util/rng';
import { bools, makeCard, makeContent, makeMinimalState } from './fixtures/state';

describe('randomBot', () => {
  it('always returns a move that is legal to resolve', () => {
    const content = makeContent({
      cards: [makeCard({ id: 'a', power: 1, arrows: bools([0]) }), makeCard({ id: 'b', power: 1, arrows: bools([2]) })],
    });
    const state = makeMinimalState({
      players: { P1: { hand: [{ kind: 'card', cardId: 'a' }, { kind: 'card', cardId: 'b' }, { kind: 'cargo' }] } },
    });

    const rng = createRng(7);
    for (let i = 0; i < 20; i++) {
      const move = randomBot({ state, content, playerId: 'P1', rng });
      expect(move).not.toBeNull();
      const cell = state.cells[move!.cellIdx];
      expect(cell.chasm).toBe(false);
      expect(cell.content).toBeNull();
    }
  });

  it('returns null when the hand is empty', () => {
    const content = makeContent({});
    const state = makeMinimalState({ players: { P1: { hand: [] } } });
    expect(randomBot({ state, content, playerId: 'P1', rng: createRng(1) })).toBeNull();
  });
});

describe('greedyBot', () => {
  it('picks the placement that dominates the most cards this turn', () => {
    const content = makeContent({
      cards: [
        // Points in all 4 orthogonal directions once rotated correctly — but only rot=0 lines up with two undefended targets.
        makeCard({ id: 'wide', power: 9, arrows: bools([2, 6]) }), // East + West
        makeCard({ id: 'narrow', power: 9, arrows: bools([2]) }), // East only
        makeCard({ id: 'east-target', power: 1, arrows: bools([]) }),
        makeCard({ id: 'west-target', power: 1, arrows: bools([]) }),
      ],
    });

    const state = makeMinimalState({
      cells: {
        13: { content: { kind: 'card', cardId: 'east-target', rot: 0, owner: 'P2' } }, // East of cell 12
        11: { content: { kind: 'card', cardId: 'west-target', rot: 0, owner: 'P2' } }, // West of cell 12
      },
      players: {
        P1: { hand: [{ kind: 'card', cardId: 'wide' }, { kind: 'card', cardId: 'narrow' }] },
      },
    });

    const move = greedyBot({ state, content, playerId: 'P1', rng: createRng(1) });

    expect(move).toMatchObject({ item: { kind: 'card', cardId: 'wide' }, cellIdx: 12, rotation: 0 });
  });
});

describe('routeBot', () => {
  it('picks the placement that builds the longest mutual-arrow route', () => {
    const content = makeContent({
      cards: [
        makeCard({ id: 'anchor', power: 1, arrows: bools([2]) }), // already on the board, points East
        makeCard({ id: 'joiner', power: 1, arrows: bools([6]) }), // points West — mutual with the anchor if placed just East of it
        makeCard({ id: 'loner', power: 9, arrows: bools([]) }), // never connects to anything
      ],
    });

    const state = makeMinimalState({
      cells: {
        12: { content: { kind: 'card', cardId: 'anchor', rot: 0, owner: 'P1' } },
      },
      players: {
        P1: { hand: [{ kind: 'card', cardId: 'joiner' }, { kind: 'card', cardId: 'loner' }] },
      },
    });

    const move = routeBot({ state, content, playerId: 'P1', rng: createRng(1) });

    // Joining the anchor (route size 2) beats placing the disconnected loner (route size 1) anywhere.
    expect(move).toMatchObject({ item: { kind: 'card', cardId: 'joiner' }, cellIdx: 13, rotation: 0 });
  });
});
