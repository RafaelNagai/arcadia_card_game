import type { GameState, PlayerId } from '@eltyca/engine';

export function isShipPlaced(state: GameState, playerId: PlayerId): boolean {
  const player = state.players.find((p) => p.id === playerId)!;
  return state.cells.some((c) => c.content?.kind === 'ship' && c.content.shipId === player.shipId);
}

export function hiddenItemsPlacedCount(state: GameState, playerId: PlayerId): number {
  return state.cells.filter((c) => {
    if (c.hiddenUntil !== 'setup' || !c.content) return false;
    if (c.content.kind === 'card') return c.content.owner === playerId;
    if (c.content.kind === 'cargo') return c.content.placedBy === playerId;
    return false;
  }).length;
}

export function isSetupDoneForPlayer(state: GameState, playerId: PlayerId): boolean {
  return isShipPlaced(state, playerId) && hiddenItemsPlacedCount(state, playerId) >= state.config.setupHiddenCards;
}

export function isSetupDoneForAll(state: GameState): boolean {
  return state.players.every((p) => isSetupDoneForPlayer(state, p.id));
}

export function nextSetupPlayer(state: GameState): PlayerId | null {
  const pending = state.players.find((p) => !isSetupDoneForPlayer(state, p.id));
  return pending ? pending.id : null;
}
