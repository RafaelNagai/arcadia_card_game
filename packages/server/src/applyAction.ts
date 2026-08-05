import type { GameContent, PlayerId } from '@eltyca/engine';
import { createDraftState, createInitialState, pickCaptain, pickCard, pickShip, toPlayerSetups } from '@eltyca/engine';
import type { ClientMessage } from './protocol';
import { isRoomFull, type PersistedRoomState } from './room';

const PLAYER_IDS: PlayerId[] = ['P1', 'P2'];

/** Turns a validated client message into a new authoritative room state — mirrors what
 *  packages/web/src/reducer/{gameReducer,draftReducer}.ts's commit cases already do, calling
 *  the same @eltyca/engine functions directly, but without any of the UI-only state
 *  (selection, previewState, awaitingHandoff) those reducers also carry, which the server has
 *  no use for. Throws a plain Error on anything illegal — server.ts catches it and reports it
 *  back to just the sender, same shape as the local reducers' error handling. */
export function applyAction(room: PersistedRoomState, playerId: PlayerId, msg: ClientMessage, content: GameContent): PersistedRoomState {
  switch (msg.type) {
    case 'start-match':
      return startMatch(room, content);
    case 'pick-captain':
      return { ...room, draft: pickCaptain(mustDraft(room), playerId, msg.captainId) };
    case 'pick-ship':
      return { ...room, draft: pickShip(mustDraft(room), playerId, msg.shipId) };
    case 'pick-card':
      return advancePick(room, playerId, msg.cardId, content);
  }
}

function mustDraft(room: PersistedRoomState) {
  if (room.phase !== 'draft' || !room.draft) throw new Error('The draft has not started yet');
  return room.draft;
}

function startMatch(room: PersistedRoomState, content: GameContent): PersistedRoomState {
  if (room.phase !== 'lobby') throw new Error('The match has already started');
  if (!isRoomFull(room)) throw new Error('Waiting for the other player to join');

  const seed = Math.floor(Math.random() * 1_000_000);
  const draft = createDraftState(content, room.config, PLAYER_IDS, seed);
  return { ...room, phase: 'draft', draft };
}

/** Mirrors Match.tsx's own draft-done -> LiveMatchHost hand-off: once the draft reaches
 *  stage 'done', synthesize a PlayerSetup[] and feed it into the same, untouched
 *  createInitialState the hot-seat path already uses. */
function advancePick(room: PersistedRoomState, playerId: PlayerId, cardId: string, content: GameContent): PersistedRoomState {
  const draft = pickCard(mustDraft(room), playerId, cardId);
  if (draft.stage !== 'done') return { ...room, draft };

  const playerSetups = toPlayerSetups(draft, content);
  const seed = Math.floor(Math.random() * 1_000_000);
  const game = createInitialState(room.config, playerSetups, seed);
  return { ...room, phase: 'game', draft, game };
}
