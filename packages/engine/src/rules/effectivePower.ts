import type { PowerContext } from '../types';
import { effectRegistry } from '../effects/registry';
import { isCaptainSilenced } from './silencing';

/** Applies modifiers: from the card itself, from the opposing card, and from the owner's Captain passive (if not silenced). */
export function effectivePower(ctx: PowerContext): number {
  const cell = ctx.state.cells[ctx.cellIdx];
  if (!cell.content || cell.content.kind !== 'card') {
    throw new Error(`effectivePower: cell ${ctx.cellIdx} does not contain a card`);
  }
  const cellContent = cell.content;
  const card = ctx.content.cards[cellContent.cardId];
  let power = card.power;

  if (card.effect) {
    const hooks = effectRegistry[card.effect.id];
    if (hooks?.modifyOwnPower) power = hooks.modifyOwnPower(power, ctx);
  }

  if (ctx.opponentIdx !== undefined) {
    const opponentCell = ctx.state.cells[ctx.opponentIdx];
    if (opponentCell.content?.kind === 'card') {
      const opponentCard = ctx.content.cards[opponentCell.content.cardId];
      if (opponentCard.effect) {
        const opponentHooks = effectRegistry[opponentCard.effect.id];
        if (opponentHooks?.modifyOpponentPower) {
          power = opponentHooks.modifyOpponentPower(power, ctx);
        }
      }
    }
  }

  const player = ctx.state.players.find((p) => p.id === cellContent.owner);
  const captain = player ? ctx.content.captains[player.captainId] : undefined;
  if (captain?.passive && player && !isCaptainSilenced(ctx.state, player.id)) {
    const captainHooks = effectRegistry[captain.passive.id];
    if (captainHooks?.modifyOwnPower) power = captainHooks.modifyOwnPower(power, ctx);
  }

  return power;
}
