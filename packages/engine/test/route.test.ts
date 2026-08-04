import { describe, expect, it } from 'vitest';
import { largestRoute, routeBonusWinner } from '../src/rules/route';
import { bools, makeCard, makeContent, makeMinimalState } from './fixtures/state';

describe('Test 11 — Route: connected component via mutual arrows', () => {
  it('links a chain of cards that all point back at each other', () => {
    const content = makeContent({
      cards: [
        makeCard({ id: 'left', power: 1, arrows: bools([2]) }), // points East
        makeCard({ id: 'middle', power: 1, arrows: bools([6, 2]) }), // points West and East
        makeCard({ id: 'right', power: 1, arrows: bools([6]) }), // points West
        makeCard({ id: 'lonely', power: 1, arrows: bools([]) }),
      ],
    });

    const state = makeMinimalState({
      cells: {
        6: { content: { kind: 'card', cardId: 'left', rot: 0, owner: 'P1' } },
        7: { content: { kind: 'card', cardId: 'middle', rot: 0, owner: 'P1' } },
        8: { content: { kind: 'card', cardId: 'right', rot: 0, owner: 'P1' } },
        0: { content: { kind: 'card', cardId: 'lonely', rot: 0, owner: 'P2' } },
      },
    });

    expect(largestRoute(state, content, 'P1')).toBe(3);
    expect(largestRoute(state, content, 'P2')).toBe(1);
    expect(routeBonusWinner(state, content)).toBe('P1');
  });

  it('does not link a card whose neighbor points at it without pointing back', () => {
    const content = makeContent({
      cards: [
        makeCard({ id: 'points-east', power: 1, arrows: bools([2]) }),
        makeCard({ id: 'silent', power: 1, arrows: bools([]) }), // never points back West
      ],
    });

    const state = makeMinimalState({
      cells: {
        12: { content: { kind: 'card', cardId: 'points-east', rot: 0, owner: 'P1' } },
        13: { content: { kind: 'card', cardId: 'silent', rot: 0, owner: 'P1' } },
      },
    });

    expect(largestRoute(state, content, 'P1')).toBe(1);
  });

  it('a tie for the largest route awards the bonus to nobody', () => {
    const content = makeContent({
      cards: [
        makeCard({ id: 'p1a', power: 1, arrows: bools([2]) }),
        makeCard({ id: 'p1b', power: 1, arrows: bools([6]) }),
        makeCard({ id: 'p2a', power: 1, arrows: bools([2]) }),
        makeCard({ id: 'p2b', power: 1, arrows: bools([6]) }),
      ],
    });

    const state = makeMinimalState({
      cells: {
        6: { content: { kind: 'card', cardId: 'p1a', rot: 0, owner: 'P1' } },
        7: { content: { kind: 'card', cardId: 'p1b', rot: 0, owner: 'P1' } },
        18: { content: { kind: 'card', cardId: 'p2a', rot: 0, owner: 'P2' } },
        19: { content: { kind: 'card', cardId: 'p2b', rot: 0, owner: 'P2' } },
      },
    });

    expect(largestRoute(state, content, 'P1')).toBe(2);
    expect(largestRoute(state, content, 'P2')).toBe(2);
    expect(routeBonusWinner(state, content)).toBeNull();
  });

  it('Ships and Cargo never take part in a route', () => {
    const content = makeContent({
      cards: [makeCard({ id: 'solo', power: 1, arrows: bools([2]) })],
      ships: [],
    });

    const state = makeMinimalState({
      cells: {
        12: { content: { kind: 'card', cardId: 'solo', rot: 0, owner: 'P1' } },
        13: { content: { kind: 'ship', shipId: 'ship-P1', owner: 'P1' } },
        11: { content: { kind: 'cargo', placedBy: 'P1' } },
      },
    });

    expect(largestRoute(state, content, 'P1')).toBe(1);
  });
});
