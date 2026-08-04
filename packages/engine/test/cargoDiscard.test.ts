import { describe, expect, it } from 'vitest';
import { resolvePlacement } from '../src/rules/resolvePlacement';
import { bools, makeCard, makeContent, makeMinimalState } from './fixtures/state';

describe('Test 9 — Playing a Cargo discards one common card and refills the hand', () => {
  it('discards the requested common card, never the Cargo itself, and draws back up to the limit', () => {
    const content = makeContent({
      cards: ['a', 'b', 'c', 'd', 'e'].map((id) => makeCard({ id, power: 1, arrows: bools([]) })),
    });
    const state = makeMinimalState({
      players: {
        P1: {
          hand: [{ kind: 'cargo' }, { kind: 'card', cardId: 'a' }, { kind: 'card', cardId: 'b' }],
          deck: ['c', 'd', 'e'],
        },
      },
    });

    const newState = resolvePlacement(state, content, 'P1', 12, { kind: 'cargo' }, 0, { discardCardId: 'a' });
    const player = newState.players.find((p) => p.id === 'P1')!;

    expect(player.discard).toEqual(['a']);
    expect(player.hand).toEqual([
      { kind: 'card', cardId: 'b' },
      { kind: 'card', cardId: 'c' },
      { kind: 'card', cardId: 'd' },
      { kind: 'card', cardId: 'e' },
    ]);
    expect(player.deck).toEqual([]);
  });

  it('refuses to play a Cargo when the hand has no common card left to discard', () => {
    const content = makeContent({ cards: [] });
    const state = makeMinimalState({
      players: { P1: { hand: [{ kind: 'cargo' }] } },
    });

    expect(() => resolvePlacement(state, content, 'P1', 12, { kind: 'cargo' }, 0)).toThrow(/discard/);
  });

  it('without an explicit discardCardId, discards the first common card found in hand', () => {
    const content = makeContent({
      cards: ['a', 'b'].map((id) => makeCard({ id, power: 1, arrows: bools([]) })),
    });
    const state = makeMinimalState({
      players: { P1: { hand: [{ kind: 'cargo' }, { kind: 'card', cardId: 'a' }, { kind: 'card', cardId: 'b' }] } },
    });

    const newState = resolvePlacement(state, content, 'P1', 12, { kind: 'cargo' }, 0);
    expect(newState.players.find((p) => p.id === 'P1')!.discard).toEqual(['a']);
  });
});
