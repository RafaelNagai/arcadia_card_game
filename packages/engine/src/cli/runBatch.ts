import { writeFileSync } from 'node:fs';
import { loadConfig } from '../config';
import { sampleContent, samplePlayerSetups } from '../content';
import { BOT_NAMES, BOTS, type BotName } from '../bots';
import { runBatch } from '../simulation/runBatch';
import { summarizeBatch } from '../simulation/summarize';
import { toTelemetryRow, rowsToCsv } from '../telemetry/csv';

/**
 * Runs every bot pairing (3x3, including mirrors) N matches each and prints an
 * aggregate report — "rodar os três em todos os pares" from prototipo_web.md,
 * answering test-list items 1 (Cargo), 4 (route bonus), and 5 (Abordagem) with
 * numbers instead of a guess. Usage: `npm run batch -- 50` (default 30 matches/pairing).
 */
function run(): void {
  const matchCountArg = Number(process.argv[2]);
  const matchCount = Number.isFinite(matchCountArg) && matchCountArg > 0 ? matchCountArg : 30;

  const config = loadConfig();
  const allRows: ReturnType<typeof toTelemetryRow>[] = [];

  console.log(`Running every bot pairing, ${matchCount} matches each (${BOT_NAMES.length}x${BOT_NAMES.length} = ${BOT_NAMES.length ** 2} pairings)...\n`);

  for (const p1Name of BOT_NAMES) {
    for (const p2Name of BOT_NAMES) {
      const result = runBatch({
        config,
        content: sampleContent,
        playerSetups: samplePlayerSetups,
        botP1: BOTS[p1Name],
        botP2: BOTS[p2Name],
        matchCount,
        seedStart: hashPairing(p1Name, p2Name),
      });
      const summary = summarizeBatch(result);

      console.log(`--- P1=${p1Name} vs P2=${p2Name} ---`);
      console.log(
        `Win rate — P1: ${pct(summary.winRate.P1)}, P2: ${pct(summary.winRate.P2)}, drift: ${pct(summary.winRate.drift)}` +
          (result.hitTurnCapCount > 0 ? ` (${result.hitTurnCapCount} hit the turn cap!)` : '')
      );
      console.log(`Avg turns: ${summary.avgTurnCount.toFixed(1)} · avg victory margin: ${summary.avgVictoryMargin.toFixed(2)}`);
      console.log(
        `Avg Cargo plays — P1: ${summary.avgCargoPlays.P1.toFixed(2)}, P2: ${summary.avgCargoPlays.P2.toFixed(2)}`
      );
      console.log(
        `Avg dominations — boarding: ${summary.avgDominationsByType.boarding.toFixed(2)}, clash: ${summary.avgDominationsByType.clash.toFixed(2)}, chain: ${summary.avgDominationsByType.chain.toFixed(2)}`
      );
      console.log(
        `Avg largest route — P1: ${summary.avgLargestRoute.P1.toFixed(2)}, P2: ${summary.avgLargestRoute.P2.toFixed(2)}`
      );
      console.log(`Ship changed hands in ${pct(summary.shipChangedHandsRate)} of matches\n`);

      for (const telemetry of result.telemetries) {
        allRows.push({ p1Bot: p1Name, p2Bot: p2Name, ...toTelemetryRow(telemetry) });
      }
    }
  }

  const outPath = new URL('../../batch-results.csv', import.meta.url).pathname;
  writeFileSync(outPath, rowsToCsv(allRows));
  console.log(`Wrote ${allRows.length} match rows to ${outPath} — open it in a spreadsheet for the rest.`);
}

function pct(fraction: number): string {
  return `${(fraction * 100).toFixed(1)}%`;
}

/** Deterministic per-pairing seed offset so re-running the CLI reproduces the same matches. */
function hashPairing(p1: BotName, p2: BotName): number {
  const key = `${p1}:${p2}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return hash;
}

run();
