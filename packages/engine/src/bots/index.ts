import { randomBot } from './randomBot';
import { greedyBot } from './greedyBot';
import { routeBot } from './routeBot';
import type { Bot } from './types';

export { randomBot } from './randomBot';
export { greedyBot } from './greedyBot';
export { routeBot } from './routeBot';
export type { Bot, BotContext, BotMove } from './types';

export const BOT_NAMES = ['random', 'greedy', 'route'] as const;
export type BotName = (typeof BOT_NAMES)[number];

export const BOTS: Record<BotName, Bot> = {
  random: randomBot,
  greedy: greedyBot,
  route: routeBot,
};
