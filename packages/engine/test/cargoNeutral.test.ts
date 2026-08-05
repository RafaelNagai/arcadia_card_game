import { describe, expect, it } from 'vitest';
import { resolvePlacement } from '../src/rules/resolvePlacement';
import { bools, makeCard, makeContent, makeMinimalState } from './fixtures/state';

describe('Test 8 — Cargo: neutral, cannot be dominated, never resolves arrows', () => {
  it('is never targeted by an adjacent arrow and keeps no owner', () => {
    const content = makeContent({
      cards: [makeCard({ id: 'attacker', power: 5, arrows: bools([2]) })],
    });
    const state = makeMinimalState({
      cells: { 13: { content: { kind: 'cargo', placedBy: 'P2' } } },
      players: { P1: { hand: [{ kind: 'card', cardId: 'attacker' }] } },
    });

    const newState = resolvePlacement(state, content, 'P1', 12, { kind: 'card', cardId: 'attacker' }, 0);

    expect(newState.cells[13].content).toEqual({ kind: 'cargo', placedBy: 'P2' });
    expect(newState.log.at(-1)!.results).toEqual([]);
    expect(newState.cells[13].content && 'owner' in newState.cells[13].content).toBe(false);
  });

  it('placing a Cargo never resolves arrows, even adjacent to a vulnerable enemy card', () => {
    const content = makeContent({
      cards: [makeCard({ id: 'undefended', power: 1, arrows: bools([]) })],
    });
    const state = makeMinimalState({
      cells: { 13: { content: { kind: 'card', cardId: 'undefended', rot: 0, owner: 'P2' } } },
      players: { P1: { hand: [{ kind: 'cargo' }, { kind: 'card', cardId: 'filler' }] } },
    });
    // 'filler' is not registered in content on purpose: it only needs to exist as the discard target.
    const contentWithFiller = makeContent({
      cards: [...Object.values(content.cards), makeCard({ id: 'filler', power: 1, arrows: bools([]) })],
    });

    const newState = resolvePlacement(state, contentWithFiller, 'P1', 12, { kind: 'cargo' }, 0, {
      discardCardId: 'filler',
    });

    expect(newState.cells[12].content).toEqual({ kind: 'cargo', placedBy: 'P1' });
    expect(newState.cells[13].content).toMatchObject({ owner: 'P2' }); // untouched
    expect(newState.log.at(-1)!.results).toEqual([]);
  });
});
