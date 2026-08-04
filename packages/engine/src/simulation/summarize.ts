import type { PlayerId } from '../types';
import type { BatchResult } from './runBatch';

export interface BatchSummary {
  matchCount: number;
  winRate: Record<PlayerId | 'drift', number>;
  avgTurnCount: number;
  avgVictoryMargin: number;
  avgCargoPlays: Record<PlayerId, number>;
  avgDominationsByType: { boarding: number; clash: number; chain: number };
  avgLargestRoute: Record<PlayerId, number>;
  /** fraction of matches where the Ship changed hands at least once */
  shipChangedHandsRate: number;
  avgNeverPlayedCount: Record<PlayerId, number>;
}

export function summarizeBatch(result: BatchResult): BatchSummary {
  const n = result.telemetries.length;
  const avg = (values: number[]): number => (n > 0 ? values.reduce((a, b) => a + b, 0) / n : 0);

  return {
    matchCount: n,
    winRate: {
      P1: n > 0 ? result.wins.P1 / n : 0,
      P2: n > 0 ? result.wins.P2 / n : 0,
      drift: n > 0 ? result.wins.drift / n : 0,
    },
    avgTurnCount: avg(result.telemetries.map((t) => t.turnCount)),
    avgVictoryMargin: avg(result.telemetries.map((t) => t.metrics.victoryMargin)),
    avgCargoPlays: {
      P1: avg(result.telemetries.map((t) => t.metrics.cargoPlaysByPlayer.P1.length)),
      P2: avg(result.telemetries.map((t) => t.metrics.cargoPlaysByPlayer.P2.length)),
    },
    avgDominationsByType: {
      boarding: avg(result.telemetries.map((t) => t.metrics.dominationsByType.boarding)),
      clash: avg(result.telemetries.map((t) => t.metrics.dominationsByType.clash)),
      chain: avg(result.telemetries.map((t) => t.metrics.dominationsByType.chain)),
    },
    avgLargestRoute: {
      P1: avg(result.telemetries.map((t) => t.metrics.largestRouteByPlayer.P1)),
      P2: avg(result.telemetries.map((t) => t.metrics.largestRouteByPlayer.P2)),
    },
    shipChangedHandsRate:
      n > 0 ? result.telemetries.filter((t) => t.metrics.shipOwnershipChanges.length > 0).length / n : 0,
    avgNeverPlayedCount: {
      P1: avg(result.telemetries.map((t) => t.metrics.neverPlayedCardsByPlayer.P1.length)),
      P2: avg(result.telemetries.map((t) => t.metrics.neverPlayedCardsByPlayer.P2.length)),
    },
  };
}
