import { describe, expect, it } from 'vitest';
import { placeInSetup } from '../src/rules/setup';
import { resolvePlacement } from '../src/rules/resolvePlacement';
import { bools, makeCard, makeContent, makeMinimalState, makeShip } from './fixtures/state';

describe('Test 6 — Ship placement: never on the edge, never rotated, never chains', () => {
  it('rejects placement on an edge cell', () => {
    const state = makeMinimalState({ phase: 'setup', players: { P1: { shipId: 'ship-P1' } } });
    // idx 2 is row 0 (top edge) on a 5x5 grid
    expect(() => placeInSetup(state, 'P1', 2, { kind: 'ship' })).toThrow(/edge/);
  });

  it('places successfully off the edge, hidden, with no rotation field at all', () => {
    const state = makeMinimalState({ phase: 'setup', players: { P1: { shipId: 'ship-P1' } } });
    const newState = placeInSetup(state, 'P1', 12, { kind: 'ship' });

    const cell = newState.cells[12];
    expect(cell.hiddenUntil).toBe('setup');
    expect(cell.content).toEqual({ kind: 'ship', shipId: 'ship-P1', owner: 'P1' });
    expect(cell.content && 'rot' in cell.content).toBe(false);
  });

  it('a captured Ship never seeds a chain, even when it has arrow-bearing neighbors', () => {
    const content = makeContent({
      cards: [makeCard({ id: 'attacker', power: 5, arrows: bools([2]) })], // points East only, at the ship
      ships: [makeShip({ id: 'ship-P2', shields: bools([]), hull: 1 })], // fully open
    });

    const state = makeMinimalState({
      cells: {
        13: { content: { kind: 'ship', shipId: 'ship-P2', owner: 'P2' } },
      },
      players: {
        P1: { hand: [{ kind: 'card', cardId: 'attacker' }] },
        P2: { shipId: 'ship-P2' },
      },
    });

    const newState = resolvePlacement(state, content, 'P1', 12, { kind: 'card', cardId: 'attacker' }, 0);

    expect(newState.log.at(-1)!.results).toEqual([{ type: 'ship-open', targetIdx: 13, direction: 2 }]);
    expect(newState.log.at(-1)!.results.some((r) => r.type === 'chain')).toBe(false);
  });
});
