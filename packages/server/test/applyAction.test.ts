import { describe, expect, it } from 'vitest';
import { loadConfig, sampleContent } from '@eltyca/engine';
import { applyAction } from '../src/applyAction';
import type { PersistedRoomState } from '../src/room';

function lobbyRoom(overrides?: Partial<PersistedRoomState>): PersistedRoomState {
  return {
    code: 'TEST01',
    clientAssignments: { P1: 'client-a', P2: 'client-b' },
    config: loadConfig(),
    phase: 'lobby',
    draft: null,
    game: null,
    ...overrides,
  };
}

describe('applyAction — start-match', () => {
  it('refuses to start until both slots are filled', () => {
    const room = lobbyRoom({ clientAssignments: { P1: 'client-a' } });
    expect(() => applyAction(room, 'P1', { type: 'start-match' }, sampleContent)).toThrow(/Waiting/);
  });

  it('transitions lobby -> draft with a fresh DraftState once both players are in', () => {
    const room = lobbyRoom();
    const next = applyAction(room, 'P1', { type: 'start-match' }, sampleContent);

    expect(next.phase).toBe('draft');
    expect(next.draft?.stage).toBe('choice');
  });

  it('refuses to start twice', () => {
    const room = lobbyRoom();
    const afterStart = applyAction(room, 'P1', { type: 'start-match' }, sampleContent);
    expect(() => applyAction(afterStart, 'P1', { type: 'start-match' }, sampleContent)).toThrow(/already started/);
  });
});

describe('applyAction — draft actions before the draft has started', () => {
  it('rejects pick-captain/pick-ship/pick-card while still in the lobby', () => {
    const room = lobbyRoom();
    expect(() => applyAction(room, 'P1', { type: 'pick-captain', captainId: 'x' }, sampleContent)).toThrow(/not started/);
    expect(() => applyAction(room, 'P1', { type: 'pick-ship', shipId: 'x' }, sampleContent)).toThrow(/not started/);
    expect(() => applyAction(room, 'P1', { type: 'pick-card', cardId: 'x' }, sampleContent)).toThrow(/not started/);
  });
});

describe('applyAction — full draft playthrough transitions the room into a real game', () => {
  it('produces a valid GameState once the draft completes, using the real drafted decks', () => {
    let room = lobbyRoom({ config: loadConfig({ draftPerRound: 2, draftRounds: 2 }) });
    room = applyAction(room, 'P1', { type: 'start-match' }, sampleContent);

    room = applyAction(room, 'P1', { type: 'pick-captain', captainId: 'captain-loud' }, sampleContent);
    room = applyAction(room, 'P1', { type: 'pick-ship', shipId: 'ship-widowmaker' }, sampleContent);
    room = applyAction(room, 'P2', { type: 'pick-captain', captainId: 'captain-broker' }, sampleContent);
    room = applyAction(room, 'P2', { type: 'pick-ship', shipId: 'ship-sieve' }, sampleContent);
    expect(room.phase).toBe('draft');
    expect(room.draft?.stage).toBe('draft');

    // 2 rounds * 2 cards/round * 2 players = 8 total picks, alternating who's up.
    for (let i = 0; i < 8; i++) {
      const picker = room.draft!.currentPicker!;
      const cardId = room.draft!.tableCards[0];
      room = applyAction(room, picker, { type: 'pick-card', cardId }, sampleContent);
    }

    expect(room.phase).toBe('game');
    expect(room.draft?.stage).toBe('done');
    expect(room.game).not.toBeNull();
    expect(room.game!.phase).toBe('setup');
    expect(room.game!.players.map((p) => p.id).sort()).toEqual(['P1', 'P2']);
    // 4 drafted cards per player, split between the starting hand (mixed in with Cargo
    // tokens, hence filtering to just card-kind items) and the remaining deck.
    const p1 = room.game!.players.find((p) => p.id === 'P1')!;
    const p1DraftedCards = p1.hand.filter((i) => i.kind === 'card').length + p1.deck.length;
    expect(p1DraftedCards).toBe(4);
  });

  it('rejects a pick made out of turn (trusting the engine\'s own pickCard validation)', () => {
    let room = lobbyRoom();
    room = applyAction(room, 'P1', { type: 'start-match' }, sampleContent);
    room = applyAction(room, 'P1', { type: 'pick-captain', captainId: 'captain-loud' }, sampleContent);
    room = applyAction(room, 'P1', { type: 'pick-ship', shipId: 'ship-widowmaker' }, sampleContent);
    room = applyAction(room, 'P2', { type: 'pick-captain', captainId: 'captain-broker' }, sampleContent);
    room = applyAction(room, 'P2', { type: 'pick-ship', shipId: 'ship-sieve' }, sampleContent);

    const notCurrentPicker = room.draft!.currentPicker === 'P1' ? 'P2' : 'P1';
    expect(() =>
      applyAction(room, notCurrentPicker, { type: 'pick-card', cardId: room.draft!.tableCards[0] }, sampleContent)
    ).toThrow(/turn/);
  });
});
