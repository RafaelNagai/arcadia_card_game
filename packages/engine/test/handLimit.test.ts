import { describe, expect, it } from 'vitest';
import { resolvePlacement } from '../src/rules/resolvePlacement';
import { refillHand } from '../src/rules/hand';
import { bools, makeCard, makeContent, makeMinimalState } from './fixtures/state';

describe('Test 10 — Hand never exceeds the limit; an empty deck never blocks the turn', () => {
  it('refillHand stops exactly at maxHandSize even with more cards left in the deck', () => {
    const state = makeMinimalState({ config: { maxHandSize: 3 } });
    const player = state.players[0];
    player.hand = [{ kind: 'card', cardId: 'a' }];
    player.deck = ['b', 'c', 'd', 'e'];

    refillHand(state, player);

    expect(player.hand).toHaveLength(3);
    expect(player.deck).toEqual(['d', 'e']);
  });

  it('placing a card with an empty deck leaves the hand under the limit without throwing', () => {
    const content = makeContent({
      cards: [makeCard({ id: 'only', power: 1, arrows: bools([]) })],
    });
    const state = makeMinimalState({
      players: { P1: { hand: [{ kind: 'card', cardId: 'only' }], deck: [] } },
    });

    const newState = resolvePlacement(state, content, 'P1', 12, { kind: 'card', cardId: 'only' }, 0);
    const player = newState.players.find((p) => p.id === 'P1')!;

    expect(player.hand).toHaveLength(0);
    expect(player.deck).toHaveLength(0);
  });
});
