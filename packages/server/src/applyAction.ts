import type { GameContent, HandItem, PlayerId, Rotation, SetupItem } from '@eltyca/engine';
import {
  createDraftState,
  createInitialState,
  isSetupDoneForAll,
  pickCaptain,
  pickCard,
  pickShip,
  placeInSetup,
  playTurn,
  revealSetup,
  surrender,
  toPlayerSetups,
} from '@eltyca/engine';
import type { ClientMessage } from './protocol';
import { isRoomFull, type PersistedRoomState } from './room';
import { assertSetupTurn } from './validate';

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
    case 'place-setup':
      return applySetupPlacement(room, playerId, msg.cellIdx, msg.item);
    case 'play-card':
      return applyMainPlay(room, playerId, msg.cellIdx, msg.item, msg.rotation, msg.discardCardId, content);
    case 'surrender':
      return { ...room, game: surrender(mustGame(room), playerId) };
  }
}

function mustDraft(room: PersistedRoomState) {
  if (room.phase !== 'draft' || !room.draft) throw new Error('The draft has not started yet');
  return room.draft;
}

function mustGame(room: PersistedRoomState) {
  if (room.phase !== 'game' || !room.game) throw new Error('The match has not started yet');
  return room.game;
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
  return { ...room, phase: 'game', draft, game, playerSetups };
}

/** Mirrors gameReducer.ts's commitSetupPlacement, minus the UI-only bookkeeping. The one
 *  real addition versus that local reducer: assertSetupTurn, since placeInSetup itself never
 *  checks whose turn it is (see validate.ts's doc comment) — that enforcement only ever
 *  existed in the trusted local UI before online play existed. */
function applySetupPlacement(room: PersistedRoomState, playerId: PlayerId, cellIdx: number, item: SetupItem): PersistedRoomState {
  const game = mustGame(room);
  assertSetupTurn(game, playerId);

  let nextGame = placeInSetup(game, playerId, cellIdx, item);
  if (isSetupDoneForAll(nextGame)) nextGame = revealSetup(nextGame);
  return { ...room, game: nextGame };
}

/** Mirrors gameReducer.ts's commitMainPlacement — playTurn already self-validates both the
 *  phase and whose turn it is, so there's nothing extra to add here. */
function applyMainPlay(
  room: PersistedRoomState,
  playerId: PlayerId,
  cellIdx: number,
  item: HandItem,
  rotation: Rotation,
  discardCardId: string | undefined,
  content: GameContent
): PersistedRoomState {
  const game = mustGame(room);
  const nextGame = playTurn(game, content, playerId, cellIdx, item, rotation, discardCardId ? { discardCardId } : undefined);
  return { ...room, game: nextGame };
}
