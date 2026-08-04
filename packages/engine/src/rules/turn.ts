import type { GameContent, GameState, HandItem, PlayerId, Rotation } from '../types';
import { resolvePlacement, type PlacementOptions } from './resolvePlacement';

export function isGameOver(state: GameState): boolean {
  return state.cells.every((c) => c.chasm || c.content !== null);
}

function nextPlayerId(state: GameState): PlayerId {
  const idx = state.players.findIndex((p) => p.id === state.turnPlayer);
  return state.players[(idx + 1) % state.players.length].id;
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
