import type { GameState, HandItem, PlayerId, Rotation } from '../types';
import { cloneState } from '../util/clone';
import { isOnEdge } from '../util/grid';
import { refillHand, removeCardFromHand, removeCargoFromHand } from './hand';

export type SetupItem = HandItem | { kind: 'ship' };

/**
 * Places one of the 3 hidden setup pieces (the Ship, or a card/Cargo from hand) face-down.
 * Unlike resolvePlacement, this never resolves arrows or captures — everything stays
 * hidden until revealSetup flips the board over.
 */
export function placeInSetup(
  state: GameState,
  playerId: PlayerId,
  cellIdx: number,
  item: SetupItem,
  rotation: Rotation = 0
): GameState {
  if (state.phase !== 'setup') throw new Error('placeInSetup can only be used during the setup phase');

  const player = state.players.find((p) => p.id === playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const targetCell = state.cells[cellIdx];
  if (!targetCell) throw new Error(`Cell ${cellIdx} is invalid`);
  if (targetCell.chasm) throw new Error('Cannot place on a Chasm');
  if (targetCell.content !== null) throw new Error('Cell is already occupied');

  if (item.kind === 'ship') {
    if (!state.config.shipOnEdge && isOnEdge(cellIdx, state.grid)) {
      throw new Error('The Ship cannot be placed on the edge of the board');
    }
  } else {
    const isInHand =
      item.kind === 'cargo'
        ? player.hand.some((i) => i.kind === 'cargo')
        : player.hand.some((i) => i.kind === 'card' && i.cardId === item.cardId);
    if (!isInHand) throw new Error("Item is not in the player's hand");
  }

  const working = cloneState(state);
  const workingPlayer = working.players.find((p) => p.id === playerId)!;
  const workingCell = working.cells[cellIdx];

  if (item.kind === 'ship') {
    workingCell.content = { kind: 'ship', shipId: player.shipId, owner: playerId };
  } else if (item.kind === 'cargo') {
    removeCargoFromHand(workingPlayer);
    workingCell.content = { kind: 'cargo', placedBy: playerId };
  } else {
    removeCardFromHand(workingPlayer, item.cardId);
    workingCell.content = { kind: 'card', cardId: item.cardId, rot: rotation, owner: playerId };
  }
  workingCell.hiddenUntil = 'setup';

  return working;
}

/** Flips every hidden setup cell face-up and refills every player's hand to the limit. */
export function revealSetup(state: GameState): GameState {
  const working = cloneState(state);
  for (const cell of working.cells) {
    if (cell.hiddenUntil === 'setup') cell.hiddenUntil = null;
  }
  for (const player of working.players) {
    refillHand(working, player);
  }
  working.phase = 'main';
  return working;
}
