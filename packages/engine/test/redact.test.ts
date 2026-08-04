import { describe, expect, it } from 'vitest';
import { redactGameStateForPlayer } from '../src/rules/redact';
import { makeMinimalState } from './fixtures/state';

describe('redactGameStateForPlayer', () => {
  it("scrubs the opponent's hand card identities but keeps kind and length", () => {
    const state = makeMinimalState({
      players: {
        P2: { hand: [{ kind: 'card', cardId: 'secret-card' }, { kind: 'cargo' }, { kind: 'card', cardId: 'another' }] },
      },
    });

    const redacted = redactGameStateForPlayer(state, 'P1');
    const p2 = redacted.players.find((p) => p.id === 'P2')!;

    expect(p2.hand).toHaveLength(3);
    expect(p2.hand).toEqual([{ kind: 'card' }, { kind: 'cargo' }, { kind: 'card' }]);
  });

  it("leaves the viewer's own hand fully intact", () => {
    const state = makeMinimalState({
      players: { P1: { hand: [{ kind: 'card', cardId: 'my-card' }] } },
    });

    const redacted = redactGameStateForPlayer(state, 'P1');
    const p1 = redacted.players.find((p) => p.id === 'P1')!;

    expect(p1.hand).toEqual([{ kind: 'card', cardId: 'my-card' }]);
  });

  it("scrubs the opponent's deck to just a length", () => {
    const state = makeMinimalState({ players: { P2: { deck: ['a', 'b', 'c'] } } });

    const redacted = redactGameStateForPlayer(state, 'P1');
    const p2 = redacted.players.find((p) => p.id === 'P2')!;

    expect(p2.deck).toEqual({ length: 3 });
  });

  it("leaves the viewer's own deck fully intact", () => {
    const state = makeMinimalState({ players: { P1: { deck: ['a', 'b'] } } });

    const redacted = redactGameStateForPlayer(state, 'P1');
    const p1 = redacted.players.find((p) => p.id === 'P1')!;

    expect(p1.deck).toEqual(['a', 'b']);
  });

  it("scrubs the opponent's hidden setup Ship to a kind-less 'hidden' marker", () => {
    const state = makeMinimalState({
      phase: 'setup',
      cells: { 7: { content: { kind: 'ship', shipId: 'ship-x', owner: 'P2' }, hiddenUntil: 'setup' } },
    });

    const redacted = redactGameStateForPlayer(state, 'P1');
    expect(redacted.cells[7].content).toEqual({ kind: 'hidden', owner: 'P2' });
  });

  it('scrubs a hidden Cargo the same way as a hidden Ship — the kind itself is the leak, not just identity', () => {
    const state = makeMinimalState({
      phase: 'setup',
      cells: { 3: { content: { kind: 'cargo', placedBy: 'P2' }, hiddenUntil: 'setup' } },
    });

    const redacted = redactGameStateForPlayer(state, 'P1');
    expect(redacted.cells[3].content).toEqual({ kind: 'hidden', owner: 'P2' });
  });

  it("leaves the viewer's own hidden setup piece fully visible to them", () => {
    const state = makeMinimalState({
      phase: 'setup',
      cells: { 7: { content: { kind: 'ship', shipId: 'ship-x', owner: 'P1' }, hiddenUntil: 'setup' } },
    });

    const redacted = redactGameStateForPlayer(state, 'P1');
    expect(redacted.cells[7].content).toEqual({ kind: 'ship', shipId: 'ship-x', owner: 'P1' });
  });

  it('leaves already-revealed cells (hiddenUntil null) fully visible regardless of owner', () => {
    const state = makeMinimalState({
      cells: { 5: { content: { kind: 'card', cardId: 'revealed-card', rot: 0, owner: 'P2' }, hiddenUntil: null } },
    });

    const redacted = redactGameStateForPlayer(state, 'P1');
    expect(redacted.cells[5].content).toEqual({ kind: 'card', cardId: 'revealed-card', rot: 0, owner: 'P2' });
  });

  it('omits seed while the match is still in progress', () => {
    const state = makeMinimalState({ phase: 'main' });
    const redacted = redactGameStateForPlayer(state, 'P1');
    expect(redacted.seed).toBeUndefined();
  });

  it('reveals everything — including seed and both hands/decks — once phase is "end"', () => {
    const state = makeMinimalState({
      phase: 'end',
      players: {
        P1: { hand: [{ kind: 'card', cardId: 'p1-card' }], deck: ['p1-deck-card'] },
        P2: { hand: [{ kind: 'card', cardId: 'p2-card' }], deck: ['p2-deck-card'] },
      },
    });

    const redacted = redactGameStateForPlayer(state, 'P1');
    const p2 = redacted.players.find((p) => p.id === 'P2')!;

    expect(p2.hand).toEqual([{ kind: 'card', cardId: 'p2-card' }]);
    expect(p2.deck).toEqual(['p2-deck-card']);
    expect(redacted.seed).toBe(state.seed);
  });
});
