import type { GameContent, GameState, HandItem, PlayerId, Rotation } from '../types';
import { resolvePlacement, type PlacementOptions } from './resolvePlacement';

export function isGameOver(state: GameState): boolean {
  return state.cells.every((c) => c.chasm || c.content !== null);
}

function nextPlayerId(state: GameState): PlayerId {
  const idx = state.players.findIndex((p) => p.id === state.turnPlayer);
  return state.players[(idx + 1) % state.players.length].id;
}

/** Ends the match immediately, conceding to whoever `playerId` isn't — see
 *  computeTelemetry's use of `surrenderedBy` for how the forced win overrides the normal
 *  score comparison. Allowed during setup or main (anything short of an already-ended
 *  match), since conceding isn't a turn action the way placing a card is. */
export function surrender(state: GameState, playerId: PlayerId): GameState {
  if (state.phase === 'end') throw new Error('The match has already ended');
  return { ...state, phase: 'end', surrenderedBy: playerId };
}

/** Thin layer above resolvePlacement: advances turnPlayer/turnNumber and checks for the end of the match.
 *  resolvePlacement itself stops at "refill the hand" and never touches whose turn it is. */
export function playTurn(
  state: GameState,
  content: GameContent,
  playerId: PlayerId,
  cellIdx: number,
  item: HandItem,
  rotation: Rotation,
  options?: PlacementOptions
): GameState {
  if (state.phase !== 'main') throw new Error('playTurn can only be used during the main phase');
  if (state.turnPlayer !== playerId) throw new Error(`It is not ${playerId}'s turn`);

  const placed = resolvePlacement(state, content, playerId, cellIdx, item, rotation, options);

  if (isGameOver(placed)) {
    return { ...placed, phase: 'end' };
  }
  return { ...placed, turnPlayer: nextPlayerId(placed), turnNumber: placed.turnNumber + 1 };
}
