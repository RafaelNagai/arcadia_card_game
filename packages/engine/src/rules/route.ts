import type { GameContent, GameState, PlayerId } from '../types';
import { opposite } from '../constants';
import { effectiveArrows } from '../rotation';
import { neighbor } from '../util/grid';

/** Size of the largest connected component of a player's common cards, linked by mutual arrows. Ships and Cargo never take part. */
export function largestRoute(state: GameState, content: GameContent, playerId: PlayerId): number {
  const ownedIdx = state.cells
    .filter((c) => c.content?.kind === 'card' && c.content.owner === playerId)
    .map((c) => c.idx);
  const ownedSet = new Set(ownedIdx);

  const visited = new Set<number>();
  let largest = 0;

  for (const start of ownedIdx) {
    if (visited.has(start)) continue;
    let size = 0;
    const stack = [start];
    visited.add(start);

    while (stack.length > 0) {
      const idx = stack.pop()!;
      size++;
      const cell = state.cells[idx];
      if (!cell.content || cell.content.kind !== 'card') continue;
      const card = content.cards[cell.content.cardId];
      const arrows = effectiveArrows(card.arrows, cell.content.rot);

      for (let d = 0; d < 8; d++) {
        if (!arrows[d]) continue;
        const otherIdx = neighbor(idx, d, state.grid);
        if (otherIdx === null || !ownedSet.has(otherIdx) || visited.has(otherIdx)) continue;
        const otherCell = state.cells[otherIdx];
        if (!otherCell.content || otherCell.content.kind !== 'card') continue;
        const otherCard = content.cards[otherCell.content.cardId];
        const otherArrows = effectiveArrows(otherCard.arrows, otherCell.content.rot);
        if (!otherArrows[opposite(d)]) continue; // must point back for the edge to exist

        visited.add(otherIdx);
        stack.push(otherIdx);
      }
    }

    largest = Math.max(largest, size);
  }

  return largest;
}

/** Player with the strictly largest route, or null on a tie (nobody gets the bonus). */
export function routeBonusWinner(state: GameState, content: GameContent): PlayerId | null {
  const routes = state.players.map((p) => ({ id: p.id, size: largestRoute(state, content, p.id) }));
  const maxSize = Math.max(...routes.map((r) => r.size));
  const winners = routes.filter((r) => r.size === maxSize);
  if (winners.length !== 1) return null;
  return winners[0].id;
}
