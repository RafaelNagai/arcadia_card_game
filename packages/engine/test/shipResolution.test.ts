import { describe, expect, it } from 'vitest';
import { resolvePlacement } from '../src/rules/resolvePlacement';
import { bools, makeCard, makeContent, makeMinimalState, makeShip } from './fixtures/state';

describe('Test 5 — Ship: open angle always falls, shielded angle needs power > hull', () => {
  it('an open angle is dominated automatically regardless of power', () => {
    const content = makeContent({
      cards: [makeCard({ id: 'weak', power: 1, arrows: bools([2]) })], // points East
      ships: [makeShip({ id: 'ship-P2', shields: bools([0]), hull: 99 })], // shield only on North
    });

    const state = makeMinimalState({
      cells: {
        13: { content: { kind: 'ship', shipId: 'ship-P2', owner: 'P2' } },
      },
      players: {
        P1: { hand: [{ kind: 'card', cardId: 'weak' }] },
        P2: { shipId: 'ship-P2' },
      },
    });

    const newState = resolvePlacement(state, content, 'P1', 12, { kind: 'card', cardId: 'weak' }, 0);

    expect(newState.cells[13].content).toMatchObject({ kind: 'ship', owner: 'P1' });
    expect(newState.log.at(-1)!.results).toEqual([{ type: 'ship-open', targetIdx: 13, direction: 2 }]);
  });

  it('a shielded angle falls only when attacker power is strictly greater than the hull', () => {
    const content = makeContent({
      cards: [makeCard({ id: 'strong', power: 6, arrows: bools([2]) })],
      ships: [makeShip({ id: 'ship-P2', shields: bools([6]), hull: 5 })], // shield covers West == opposite(East)
    });

    const state = makeMinimalState({
      cells: {
        13: { content: { kind: 'ship', shipId: 'ship-P2', owner: 'P2' } },
      },
      players: {
        P1: { hand: [{ kind: 'card', cardId: 'strong' }] },
        P2: { shipId: 'ship-P2' },
      },
    });

    const newState = resolvePlacement(state, content, 'P1', 12, { kind: 'card', cardId: 'strong' }, 0);

    expect(newState.cells[13].content).toMatchObject({ kind: 'ship', owner: 'P1' });
    expect(newState.log.at(-1)!.results).toEqual([
      { type: 'ship-shielded', targetIdx: 13, direction: 2, attackerPower: 6, hull: 5, dominated: true },
    ]);
  });

  it('a shielded angle holds when power is equal to or less than the hull', () => {
    const content = makeContent({
      cards: [makeCard({ id: 'equal', power: 5, arrows: bools([2]) })],
      ships: [makeShip({ id: 'ship-P2', shields: bools([6]), hull: 5 })],
    });

    const state = makeMinimalState({
      cells: {
        13: { content: { kind: 'ship', shipId: 'ship-P2', owner: 'P2' } },
      },
      players: {
        P1: { hand: [{ kind: 'card', cardId: 'equal' }] },
        P2: { shipId: 'ship-P2' },
      },
    });

    const newState = resolvePlacement(state, content, 'P1', 12, { kind: 'card', cardId: 'equal' }, 0);

    expect(newState.cells[13].content).toMatchObject({ kind: 'ship', owner: 'P2' });
    expect(newState.log.at(-1)!.results).toEqual([
      { type: 'ship-shielded', targetIdx: 13, direction: 2, attackerPower: 5, hull: 5, dominated: false },
    ]);
  });
});
