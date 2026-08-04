import { describe, expect, it } from 'vitest';
import { computeScores, determineWinner } from '../src/rules/scoring';
import { bools, makeCard, makeContent, makeMinimalState } from './fixtures/state';

describe('Test 12 — Final score matches a hand count on a hand-built board', () => {
  it('adds 1 per common card, 1 per Ship, and the route bonus only for the unique largest route', () => {
    const content = makeContent({
      cards: [
        makeCard({ id: 'p1-linked-a', power: 1, arrows: bools([2]) }),
        makeCard({ id: 'p1-linked-b', power: 1, arrows: bools([6]) }),
        makeCard({ id: 'p1-solo', power: 1, arrows: bools([]) }),
        makeCard({ id: 'p2-a', power: 1, arrows: bools([]) }),
        makeCard({ id: 'p2-b', power: 1, arrows: bools([]) }),
      ],
    });

    const state = makeMinimalState({
      cells: {
        6: { content: { kind: 'card', cardId: 'p1-linked-a', rot: 0, owner: 'P1' } },
        7: { content: { kind: 'card', cardId: 'p1-linked-b', rot: 0, owner: 'P1' } },
        0: { content: { kind: 'card', cardId: 'p1-solo', rot: 0, owner: 'P1' } },
        20: { content: { kind: 'card', cardId: 'p2-a', rot: 0, owner: 'P2' } },
        21: { content: { kind: 'card', cardId: 'p2-b', rot: 0, owner: 'P2' } },
        24: { content: { kind: 'ship', shipId: 'ship-P2', owner: 'P2' } },
      },
    });

    const scores = computeScores(state, content);
    const p1 = scores.find((s) => s.player === 'P1')!;
    const p2 = scores.find((s) => s.player === 'P2')!;

    // hand count: P1 = 3 cards + 0 ships + 3 route bonus (largest route 2, strictly > P2's 1) = 6
    expect(p1).toEqual({ player: 'P1', cardPoints: 3, shipPoints: 0, routeBonus: 3, total: 6 });
    // hand count: P2 = 2 cards + 1 ship + 0 bonus = 3
    expect(p2).toEqual({ player: 'P2', cardPoints: 2, shipPoints: 1, routeBonus: 0, total: 3 });

    expect(determineWinner(scores)).toBe('P1');
  });

  it('a tied final score is a Drift — nobody wins', () => {
    const content = makeContent({
      cards: [
        makeCard({ id: 'p1-a', power: 1, arrows: bools([]) }),
        makeCard({ id: 'p2-a', power: 1, arrows: bools([]) }),
      ],
    });

    const state = makeMinimalState({
      cells: {
        0: { content: { kind: 'card', cardId: 'p1-a', rot: 0, owner: 'P1' } },
        24: { content: { kind: 'card', cardId: 'p2-a', rot: 0, owner: 'P2' } },
      },
    });

    const scores = computeScores(state, content);
    expect(determineWinner(scores)).toBe('drift');
  });

  it('Cargo is never counted for anyone', () => {
    const content = makeContent({ cards: [] });
    const state = makeMinimalState({
      cells: {
        0: { content: { kind: 'cargo', placedBy: 'P1' } },
        1: { content: { kind: 'cargo', placedBy: 'P2' } },
      },
    });

    const scores = computeScores(state, content);
    expect(scores.every((s) => s.total === 0)).toBe(true);
  });
});
