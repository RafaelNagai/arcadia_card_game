import type { MatchTelemetry } from './computeTelemetry';

export type TelemetryRow = Record<string, string | number>;

/** Flattens one match's telemetry into a single row — assumes the fixed 2-player (P1/P2) scope of this prototype. */
export function toTelemetryRow(telemetry: MatchTelemetry): TelemetryRow {
  const p1Score = telemetry.finalScore.find((s) => s.player === 'P1');
  const p2Score = telemetry.finalScore.find((s) => s.player === 'P2');

  return {
    seed: telemetry.seed,
    winner: telemetry.winner,
    turnCount: telemetry.turnCount,
    durationMs: telemetry.durationMs ?? '',
    victoryMargin: telemetry.metrics.victoryMargin,
    p1_total: p1Score?.total ?? '',
    p2_total: p2Score?.total ?? '',
    p1_cargoPlays: telemetry.metrics.cargoPlaysByPlayer.P1?.length ?? 0,
    p2_cargoPlays: telemetry.metrics.cargoPlaysByPlayer.P2?.length ?? 0,
    shipOwnershipChanges: telemetry.metrics.shipOwnershipChanges.length,
    p1_firstShipFallTurn: telemetry.metrics.firstShipFallTurn.P1 ?? '',
    p2_firstShipFallTurn: telemetry.metrics.firstShipFallTurn.P2 ?? '',
    dominations_boarding: telemetry.metrics.dominationsByType.boarding,
    dominations_clash: telemetry.metrics.dominationsByType.clash,
    dominations_chain: telemetry.metrics.dominationsByType.chain,
    p1_largestRoute: telemetry.metrics.largestRouteByPlayer.P1 ?? '',
    p2_largestRoute: telemetry.metrics.largestRouteByPlayer.P2 ?? '',
    p1_avgArrows: telemetry.metrics.averageArrowsByPlayer.P1?.toFixed(2) ?? '',
    p2_avgArrows: telemetry.metrics.averageArrowsByPlayer.P2?.toFixed(2) ?? '',
    p1_neverPlayedCount: telemetry.metrics.neverPlayedCardsByPlayer.P1?.length ?? 0,
    p2_neverPlayedCount: telemetry.metrics.neverPlayedCardsByPlayer.P2?.length ?? 0,
  };
}

export function rowsToCsv(rows: TelemetryRow[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => escapeCsvField(String(row[header] ?? ''))).join(','));
  }
  return lines.join('\n');
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
