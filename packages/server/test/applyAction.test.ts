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
    playerSetups: null,
    ...overrides,
  };
}

/** Drives a lobby room all the way through choice + a minimal draft into a real 'game'
 *  phase room, for tests that only care about what happens once actual gameplay starts. */
function roomInGame(configOverrides?: Parameters<typeof loadConfig>[0]): PersistedRoomState {
  let room = lobbyRoom({ config: loadConfig({ draftPerRound: 1, draftRounds: 1, ...configOverrides }) });
  room = applyAction(room, 'P1', { type: 'start-match' }, sampleContent);
  room = applyAction(room, 'P1', { type: 'pick-captain', captainId: 'captain-1' }, sampleContent);
  room = applyAction(room, 'P1', { type: 'pick-ship', shipId: 'ship-1' }, sampleContent);
  room = applyAction(room, 'P2', { type: 'pick-captain', captainId: 'captain-2' }, sampleContent);
  room = applyAction(room, 'P2', { type: 'pick-ship', shipId: 'ship-2' }, sampleContent);

  // 1 round * 1 card/round * 2 players = 2 total picks.
  for (let i = 0; i < 2; i++) {
    const picker = room.draft!.currentPicker!;
    const cardId = room.draft!.tableCards[0];
    room = applyAction(room, picker, { type: 'pick-card', cardId }, sampleContent);
  }
  return room;
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

    room = applyAction(room, 'P1', { type: 'pick-captain', captainId: 'captain-1' }, sampleContent);
    room = applyAction(room, 'P1', { type: 'pick-ship', shipId: 'ship-1' }, sampleContent);
    room = applyAction(room, 'P2', { type: 'pick-captain', captainId: 'captain-2' }, sampleContent);
    room = applyAction(room, 'P2', { type: 'pick-ship', shipId: 'ship-2' }, sampleContent);
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
    // Stashed once, at the same moment as the game itself — EndSequence needs this at match
    // end, and the server only ever reveals it then (see room.ts's doc comment).
    expect(room.playerSetups?.map((p) => p.id).sort()).toEqual(['P1', 'P2']);
    // 4 drafted cards per player, split between the starting hand (mixed in with Cargo
    // tokens, hence filtering to just card-kind items) and the remaining deck.
    const p1 = room.game!.players.find((p) => p.id === 'P1')!;
    const p1DraftedCards = p1.hand.filter((i) => i.kind === 'card').length + p1.deck.length;
    expect(p1DraftedCards).toBe(4);
  });

  it('rejects a pick made out of turn (trusting the engine\'s own pickCard validation)', () => {
    let room = lobbyRoom();
    room = applyAction(room, 'P1', { type: 'start-match' }, sampleContent);
    room = applyAction(room, 'P1', { type: 'pick-captain', captainId: 'captain-1' }, sampleContent);
    room = applyAction(room, 'P1', { type: 'pick-ship', shipId: 'ship-1' }, sampleContent);
    room = applyAction(room, 'P2', { type: 'pick-captain', captainId: 'captain-2' }, sampleContent);
    room = applyAction(room, 'P2', { type: 'pick-ship', shipId: 'ship-2' }, sampleContent);

    const notCurrentPicker = room.draft!.currentPicker === 'P1' ? 'P2' : 'P1';
    expect(() =>
      applyAction(room, notCurrentPicker, { type: 'pick-card', cardId: room.draft!.tableCards[0] }, sampleContent)
    ).toThrow(/turn/);
  });
});

describe('applyAction — place-setup', () => {
  it('rejects a placement from whoever is not next to act (the engine gap this fills)', () => {
    const room = roomInGame();
    expect(() =>
      applyAction(room, 'P2', { type: 'place-setup', cellIdx: 6, item: { kind: 'ship' } }, sampleContent)
    ).toThrow(/turn/);
  });

  it('alternates one piece at a time between players, per regras_v0.9.md', () => {
    let room = roomInGame();
    room = applyAction(room, 'P1', { type: 'place-setup', cellIdx: 6, item: { kind: 'ship' } }, sampleContent);
    // P1 just placed one piece; P2 has placed none, so P2 must go next.
    expect(() =>
      applyAction(room, 'P1', { type: 'place-setup', cellIdx: 7, item: { kind: 'cargo' } }, sampleContent)
    ).toThrow(/turn/);

    room = applyAction(room, 'P2', { type: 'place-setup', cellIdx: 8, item: { kind: 'ship' } }, sampleContent);
    expect(room.game!.cells[6].content).toEqual({ kind: 'ship', shipId: 'ship-1', owner: 'P1' });
    expect(room.game!.cells[8].content).toEqual({ kind: 'ship', shipId: 'ship-2', owner: 'P2' });
  });

  it('reveals and transitions to the main phase once both players finish setup', () => {
    let room = roomInGame({ setupHiddenCards: 1 });
    room = applyAction(room, 'P1', { type: 'place-setup', cellIdx: 6, item: { kind: 'ship' } }, sampleContent);
    room = applyAction(room, 'P2', { type: 'place-setup', cellIdx: 8, item: { kind: 'ship' } }, sampleContent);
    room = applyAction(room, 'P1', { type: 'place-setup', cellIdx: 7, item: { kind: 'cargo' } }, sampleContent);
    expect(room.game!.phase).toBe('setup');

    room = applyAction(room, 'P2', { type: 'place-setup', cellIdx: 11, item: { kind: 'cargo' } }, sampleContent);
    expect(room.game!.phase).toBe('main');
    // revealSetup flips hiddenUntil back to null — the whole point of finishing setup.
    expect(room.game!.cells[6].hiddenUntil).toBeNull();
  });
});

describe('applyAction — play-card', () => {
  function finishSetup(room: PersistedRoomState): PersistedRoomState {
    let next = applyAction(room, 'P1', { type: 'place-setup', cellIdx: 6, item: { kind: 'ship' } }, sampleContent);
    next = applyAction(next, 'P2', { type: 'place-setup', cellIdx: 8, item: { kind: 'ship' } }, sampleContent);
    next = applyAction(next, 'P1', { type: 'place-setup', cellIdx: 7, item: { kind: 'cargo' } }, sampleContent);
    next = applyAction(next, 'P2', { type: 'place-setup', cellIdx: 11, item: { kind: 'cargo' } }, sampleContent);
    return next;
  }

  it('rejects a play from whoever is not the current turnPlayer (trusting playTurn\'s own check)', () => {
    const room = finishSetup(roomInGame({ setupHiddenCards: 1 }));
    const game = room.game!;
    const notTurnPlayer = game.turnPlayer === 'P1' ? 'P2' : 'P1';
    const theirItem = game.players.find((p) => p.id === notTurnPlayer)!.hand.find((i) => i.kind === 'card')!;

    expect(() =>
      applyAction(room, notTurnPlayer, { type: 'play-card', cellIdx: 0, item: theirItem, rotation: 0 }, sampleContent)
    ).toThrow(/turn/);
  });

  it('advances the turn and places the card on the board', () => {
    const room = finishSetup(roomInGame({ setupHiddenCards: 1 }));
    const game = room.game!;
    const turnPlayer = game.players.find((p) => p.id === game.turnPlayer)!;
    const item = turnPlayer.hand.find((i) => i.kind === 'card')!;
    const targetCell = game.cells.find((c) => !c.chasm && !c.content)!.idx;

    const next = applyAction(room, game.turnPlayer, { type: 'play-card', cellIdx: targetCell, item, rotation: 0 }, sampleContent);

    expect(next.game!.turnNumber).toBe(game.turnNumber + 1);
    expect(next.game!.turnPlayer).not.toBe(game.turnPlayer);
    expect(next.game!.cells[targetCell].content).toMatchObject({ kind: 'card', owner: game.turnPlayer });
  });
});

describe('applyAction — surrender', () => {
  it('ends the match, crediting the other player as the surrenderer, regardless of whose turn it is', () => {
    const room = roomInGame();
    const game = room.game!;
    const notTurnPlayer = game.turnPlayer === 'P1' ? 'P2' : 'P1';

    const next = applyAction(room, notTurnPlayer, { type: 'surrender' }, sampleContent);

    expect(next.game!.phase).toBe('end');
    expect(next.game!.surrenderedBy).toBe(notTurnPlayer);
  });

  it('rejects surrendering before the match has actually started', () => {
    const room = lobbyRoom();
    expect(() => applyAction(room, 'P1', { type: 'surrender' }, sampleContent)).toThrow(/not started/);
  });
});
