import { registerEffect } from './registry';

/** Card effect (Modifier, cost 2 per the card-creation chart): opposing Anomaly cards get -2 power against this card. */
registerEffect('ward-anomaly', {
  modifyOpponentPower: (power, ctx) => {
    const cell = ctx.state.cells[ctx.cellIdx];
    if (cell.content?.kind !== 'card') return power;
    const card = ctx.content.cards[cell.content.cardId];
    return card.element === 'anomaly' ? power - 2 : power;
  },
});

/** Card effect (Lock, cost 4): Energy cards can never dominate this card. */
registerEffect('lock-energy', {
  blocksDomination: (ctx) => {
    const attackerCell = ctx.state.cells[ctx.attackerIdx];
    if (attackerCell.content?.kind !== 'card') return true;
    const attackerCard = ctx.content.cards[attackerCell.content.cardId];
    return attackerCard.element !== 'energy';
  },
});

/** Captain passive: +2 power to your Creature cards, -1 to your NPC cards. */
registerEffect('captain-loud-voice', {
  modifyOwnPower: (power, ctx) => {
    const cell = ctx.state.cells[ctx.cellIdx];
    if (cell.content?.kind !== 'card') return power;
    const card = ctx.content.cards[cell.content.cardId];
    if (card.type === 'creature') return power + 2;
    if (card.type === 'npc') return power - 1;
    return power;
  },
});

/** Captain passive: +2 power to your Astral cards, -1 to your Paradox cards. */
registerEffect('captain-tide-broker', {
  modifyOwnPower: (power, ctx) => {
    const cell = ctx.state.cells[ctx.cellIdx];
    if (cell.content?.kind !== 'card') return power;
    const card = ctx.content.cards[cell.content.cardId];
    if (card.element === 'astral') return power + 2;
    if (card.element === 'paradox') return power - 1;
    return power;
  },
});
