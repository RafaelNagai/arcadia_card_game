import type { GameContent, GameState, PlayerId } from '../types';
import { routeBonusWinner } from './route';

export interface Score {
  player: PlayerId;
  cardPoints: number;
  shipPoints: number;
  routeBonus: number;
  total: number;
}

/** Cargo is worth 0 and is simply never counted. */
export function computeScores(state: GameState, content: GameContent): Score[] {
  const bonusWinner = routeBonusWinner(state, content);

  return state.players.map((player) => {
    const cardPoints = state.cells.filter(
      (c) => c.content?.kind === 'card' && c.content.owner === player.id
    ).length;
    const shipPoints = state.cells.filter(
      (c) => c.content?.kind === 'ship' && c.content.owner === player.id
    ).length;
    const routeBonus = bonusWinner === player.id ? state.config.routeBonus : 0;

    return {
      player: player.id,
      cardPoints,
      shipPoints,
      routeBonus,
      total: cardPoints + shipPoints + routeBonus,
    };
  });
}

/** Highest total wins; a tie in the final score is a Drift ("Deriva") — nobody wins. */
export function determineWinner(scores: Score[]): PlayerId | 'drift' {
  const max = Math.max(...scores.map((s) => s.total));
  const winners = scores.filter((s) => s.total === max);
  if (winners.length !== 1) return 'drift';
  return winners[0].player;
}
