import { describe, expect, it } from 'vitest';
import { placeInSetup } from '../src/rules/setup';
import { randomSetupForPlayer } from '../src/simulation/randomSetup';
import { createRng } from '../src/util/rng';
import { makeMinimalState } from './fixtures/state';

describe('Setup only ever buries the Ship and Cargo', () => {
  it('buries a Cargo token, removing it from hand', () => {
    const state = makeMinimalState({
      phase: 'setup',
      players: { P1: { hand: [{ kind: 'cargo' }, { kind: 'card', cardId: 'x' }] } },
    });

    const newState = placeInSetup(state, 'P1', 12, { kind: 'cargo' });

    expect(newState.cells[12].content).toEqual({ kind: 'cargo', placedBy: 'P1' });
    expect(newState.cells[12].hiddenUntil).toBe('setup');
    const player = newState.players.find((p) => p.id === 'P1')!;
    expect(player.hand).toEqual([{ kind: 'card', cardId: 'x' }]);
  });

  it('throws once no Cargo is left in hand to bury', () => {
    const state = makeMinimalState({
      phase: 'setup',
      players: { P1: { hand: [{ kind: 'card', cardId: 'x' }] } },
    });

    expect(() => placeInSetup(state, 'P1', 12, { kind: 'cargo' })).toThrow(/Cargo/);
  });
});

describe('randomSetupForPlayer never soft-locks when a Captain has less Cargo than setupHiddenCards', () => {
  it('buries exactly the available Cargo, not the full setupHiddenCards count', () => {
    const state = makeMinimalState({
      phase: 'setup',
      config: { setupHiddenCards: 3 },
      players: { P1: { hand: [{ kind: 'cargo' }, { kind: 'card', cardId: 'a' }, { kind: 'card', cardId: 'b' }] } },
    });

    const newState = randomSetupForPlayer(state, 'P1', createRng(1));

    const buriedCargo = newState.cells.filter((c) => c.content?.kind === 'cargo' && c.content.placedBy === 'P1');
    expect(buriedCargo).toHaveLength(1); // capped by the single Cargo actually in hand, not setupHiddenCards=3
    const player = newState.players.find((p) => p.id === 'P1')!;
    expect(player.hand).toEqual([{ kind: 'card', cardId: 'a' }, { kind: 'card', cardId: 'b' }]); // untouched
  });

  it('buries exactly setupHiddenCards worth of Cargo when there is enough', () => {
    const state = makeMinimalState({
      phase: 'setup',
      config: { setupHiddenCards: 2 },
      players: { P1: { hand: [{ kind: 'cargo' }, { kind: 'cargo' }, { kind: 'cargo' }] } },
    });

    const newState = randomSetupForPlayer(state, 'P1', createRng(1));

    const buriedCargo = newState.cells.filter((c) => c.content?.kind === 'cargo' && c.content.placedBy === 'P1');
    expect(buriedCargo).toHaveLength(2);
    const player = newState.players.find((p) => p.id === 'P1')!;
    expect(player.hand).toEqual([{ kind: 'cargo' }]); // 1 left over, still playable in the main phase
  });
});
