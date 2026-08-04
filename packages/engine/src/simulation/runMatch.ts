import type { Config, GameContent, GameState, PlayerId } from '../types';
import type { PlayerSetup } from '../rules/initialState';
import { createInitialState } from '../rules/initialState';
import { revealSetup } from '../rules/setup';
import { isGameOver, playTurn } from '../rules/turn';
import { createRng } from '../util/rng';
import { randomSetupForPlayer } from './randomSetup';
import type { Bot } from '../bots/types';
import { computeTelemetry, type MatchTelemetry } from '../telemetry/computeTelemetry';

export interface MatchRunOptions {
  config: Config;
  content: GameContent;
  playerSetups: PlayerSetup[];
  bots: Record<PlayerId, Bot>;
  seed: number;
  maxTurns?: number;
}

export interface MatchRunResult {
  state: GameState;
  telemetry: MatchTelemetry;
  /** true if the safety cap was hit before the board actually filled up — a sign a bot got stuck. */
  hitTurnCap: boolean;
}

/** Plays one full match headless: random setup for both players, then bot-driven main-phase turns until the board fills. */
export function runMatch(options: MatchRunOptions): MatchRunResult {
  const { config, content, playerSetups, bots, seed } = options;
  // A second, independent stream from the same seed — createInitialState already
  // consumes its own RNG internally to shuffle decks; this one drives setup + bots.
  const rng = createRng(seed + 1);

  let state = createInitialState(config, playerSetups, seed);
  for (const player of state.players) {
    state = randomSetupForPlayer(state, player.id, rng);
  }
  state = revealSetup(state);

  const maxTurns = options.maxTurns ?? state.cells.filter((c) => !c.chasm).length * 2 + 10;
  let turns = 0;
  while (!isGameOver(state) && turns < maxTurns) {
    const bot = bots[state.turnPlayer];
    const move = bot({ state, content, playerId: state.turnPlayer, rng });
    if (!move) break; // no legal move left — shouldn't happen while the board still has room
    state = playTurn(state, content, state.turnPlayer, move.cellIdx, move.item, move.rotation);
    turns++;
  }

  return {
    state,
    telemetry: computeTelemetry(state, content, playerSetups),
    hitTurnCap: !isGameOver(state),
  };
}
