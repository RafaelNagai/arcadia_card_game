import type { Config, GameContent, PlayerId } from '../types';
import type { PlayerSetup } from '../rules/initialState';
import type { Bot } from '../bots/types';
import type { MatchTelemetry } from '../telemetry/computeTelemetry';
import { runMatch } from './runMatch';

export interface BatchOptions {
  config: Config;
  content: GameContent;
  playerSetups: PlayerSetup[];
  botP1: Bot;
  botP2: Bot;
  matchCount: number;
  seedStart?: number;
}

export interface BatchResult {
  matchCount: number;
  wins: Record<PlayerId | 'drift', number>;
  hitTurnCapCount: number;
  telemetries: MatchTelemetry[];
}

/** Runs N full matches between two bots and collects every match's telemetry — the "simulate 10k games overnight" mode. */
export function runBatch(options: BatchOptions): BatchResult {
  const { config, content, playerSetups, botP1, botP2, matchCount, seedStart = 0 } = options;
  const wins: Record<PlayerId | 'drift', number> = { P1: 0, P2: 0, drift: 0 };
  const telemetries: MatchTelemetry[] = [];
  let hitTurnCapCount = 0;

  for (let i = 0; i < matchCount; i++) {
    const result = runMatch({
      config,
      content,
      playerSetups,
      bots: { P1: botP1, P2: botP2 },
      seed: seedStart + i,
    });
    telemetries.push(result.telemetry);
    wins[result.telemetry.winner]++;
    if (result.hitTurnCap) hitTurnCapCount++;
  }

  return { matchCount, wins, hitTurnCapCount, telemetries };
}
