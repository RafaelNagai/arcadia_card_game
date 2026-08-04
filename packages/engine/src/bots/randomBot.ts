import type { Rotation } from '../types';
import type { Bot } from './types';

/** Baseline: casa e rotação sorteadas. If a deck beats this consistently, the deck is unbalanced, not the player. */
export const randomBot: Bot = ({ state, playerId, rng }) => {
  const player = state.players.find((p) => p.id === playerId)!;
  const emptyCells = state.cells.filter((c) => !c.chasm && c.content === null);
  if (emptyCells.length === 0 || player.hand.length === 0) return null;

  const item = player.hand[Math.floor(rng() * player.hand.length)];
  const cell = emptyCells[Math.floor(rng() * emptyCells.length)];
  const rotation = Math.floor(rng() * 4) as Rotation;

  return { item, cellIdx: cell.idx, rotation };
};
