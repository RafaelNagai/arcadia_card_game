import type { GameState, Player } from '../types';

/** Draws up to the hand limit. An empty deck never blocks the turn — the hand just stays under the limit. */
export function refillHand(state: GameState, player: Player): void {
  const { maxHandSize } = state.config;
  while (player.hand.length < maxHandSize && player.deck.length > 0) {
    const cardId = player.deck.shift()!;
    player.hand.push({ kind: 'card', cardId });
  }
}

export function removeCardFromHand(player: Player, cardId: string): void {
  const idx = player.hand.findIndex((i) => i.kind === 'card' && i.cardId === cardId);
  if (idx === -1) throw new Error(`Card ${cardId} is not in ${player.id}'s hand`);
  player.hand.splice(idx, 1);
}

export function removeCargoFromHand(player: Player): void {
  const idx = player.hand.findIndex((i) => i.kind === 'cargo');
  if (idx === -1) throw new Error(`Player ${player.id} has no Cargo in hand`);
  player.hand.splice(idx, 1);
}

/** Removes 1 Cargo from the hand, discards 1 common card (never another Cargo), and refills the hand. */
export function playCargo(state: GameState, player: Player, discardCardId?: string): void {
  const cargoIdx = player.hand.findIndex((i) => i.kind === 'cargo');
  if (cargoIdx === -1) throw new Error(`Player ${player.id} has no Cargo in hand`);
  player.hand.splice(cargoIdx, 1);

  let discardIdx: number;
  if (discardCardId) {
    discardIdx = player.hand.findIndex((i) => i.kind === 'card' && i.cardId === discardCardId);
    if (discardIdx === -1) throw new Error(`Discard card ${discardCardId} is not in hand`);
  } else {
    discardIdx = player.hand.findIndex((i) => i.kind === 'card');
  }
  if (discardIdx === -1) {
    throw new Error('No common card in hand to discard — the discard can never be a Cargo');
  }

  const [discarded] = player.hand.splice(discardIdx, 1);
  if (discarded.kind === 'card') player.discard.push(discarded.cardId);

  refillHand(state, player);
}
