import type { LockContext } from '../types';
import { effectRegistry } from '../effects/registry';

/** Applies locks. Defaults to true (can be dominated). */
export function canBeDominated(ctx: LockContext): boolean {
  const defenderCell = ctx.state.cells[ctx.defenderIdx];
  if (!defenderCell.content || defenderCell.content.kind !== 'card') return true;

  const defenderCard = ctx.content.cards[defenderCell.content.cardId];
  if (defenderCard.effect) {
    const hooks = effectRegistry[defenderCard.effect.id];
    if (hooks?.blocksDomination) return hooks.blocksDomination(ctx);
  }
  return true;
}
