import type { GameState, PlayerId } from '../types';

/** While a player's original Ship is under enemy control, their Captain's passive does not exist in any calculation. */
export function isCaptainSilenced(state: GameState, playerId: PlayerId): boolean {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return false;

  const shipCell = state.cells.find((c) => c.content?.kind === 'ship' && c.content.shipId === player.shipId);
  if (!shipCell || shipCell.content?.kind !== 'ship') return false; // ship not on the board yet

  return shipCell.content.owner !== playerId;
}
