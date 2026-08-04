import type { GameContent, GameState, HandItem, PlayerId, Rotation } from '../types';

export interface BotContext {
  state: GameState;
  content: GameContent;
  playerId: PlayerId;
  /** Seeded RNG shared across the match — bots must never call Math.random() directly, so a batch run stays reproducible from its seed. */
  rng: () => number;
}

export interface BotMove {
  item: HandItem;
  cellIdx: number;
  rotation: Rotation;
}

/** A bot only decides main-phase moves — setup placement is identical (randomized) for all bots, since it's blind information with no captures to optimize for. */
export type Bot = (ctx: BotContext) => BotMove | null;
