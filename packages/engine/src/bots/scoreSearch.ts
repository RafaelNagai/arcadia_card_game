import type { GameState, Rotation } from '../types';
import { resolvePlacement } from '../rules/resolvePlacement';
import type { BotContext, BotMove } from './types';

/** Shared brute-force search for the "greedy" family of bots: try every (item, cell, rotation)
 *  combination through the real (pure) resolvePlacement, score the resulting board, keep the best. */
export function bestMoveByScore(ctx: BotContext, score: (candidate: GameState) => number): BotMove | null {
  const player = ctx.state.players.find((p) => p.id === ctx.playerId)!;
  const emptyCells = ctx.state.cells.filter((c) => !c.chasm && c.content === null);
  if (emptyCells.length === 0 || player.hand.length === 0) return null;

  let best: BotMove | null = null;
  let bestScore = -Infinity;

  for (const item of player.hand) {
    const rotations: Rotation[] = item.kind === 'cargo' ? [0] : [0, 1, 2, 3];
    for (const cell of emptyCells) {
      for (const rotation of rotations) {
        let candidate: GameState;
        try {
          candidate = resolvePlacement(ctx.state, ctx.content, ctx.playerId, cell.idx, item, rotation);
        } catch {
          continue; // item no longer valid for this exact combination (e.g. duplicate hand entry already tried)
        }
        const candidateScore = score(candidate);
        if (candidateScore > bestScore) {
          bestScore = candidateScore;
          best = { item, cellIdx: cell.idx, rotation };
        }
      }
    }
  }

  return best;
}
