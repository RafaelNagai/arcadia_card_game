import type { DirectionResult } from '../types';
import { bestMoveByScore } from './scoreSearch';
import type { Bot } from './types';

function countDominations(results: DirectionResult[]): number {
  let count = 0;
  for (const result of results) {
    if (result.type === 'boarding') count++;
    else if (result.type === 'clash' && result.dominated) count++;
    else if (result.type === 'chain') count++;
    else if (result.type === 'ship-open') count++;
    else if (result.type === 'ship-shielded' && result.dominated) count++;
  }
  return count;
}

/** Maximizes immediate dominations this turn. The bot that measures whether Abordagem/Confronto is too strong. */
export const greedyBot: Bot = (ctx) =>
  bestMoveByScore(ctx, (candidate) => countDominations(candidate.log.at(-1)!.results));
