import { largestRoute } from '../rules/route';
import { bestMoveByScore } from './scoreSearch';
import type { Bot } from './types';

/** Prioritizes building the largest contiguous route. The bot that measures whether the +3 route bonus is worth it. */
export const routeBot: Bot = (ctx) =>
  bestMoveByScore(ctx, (candidate) => largestRoute(candidate, ctx.content, ctx.playerId));
