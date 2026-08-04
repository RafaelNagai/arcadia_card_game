import {
  rowsToCsv,
  telemetryToJson,
  toTelemetryRow,
  type GameContent,
  type GameState,
  type MatchTelemetry,
} from '@eltyca/engine';
import { LogPanel } from '../log/LogPanel';
import { downloadTextFile } from '../../game/download';

export interface AnalysisScreenProps {
  telemetry: MatchTelemetry;
  gameState: GameState;
  content: GameContent;
  onBack: () => void;
  onNewMatch: () => void;
}

/** Everything the "Analyze" button on WinnerScreen leads to — metrics, downloads, and the full turn log. */
export function AnalysisScreen({ telemetry, gameState, content, onBack, onNewMatch }: AnalysisScreenProps) {
  const { winner, metrics } = telemetry;
  const recap = telemetry.finalScore.map((s) => `${s.player}: ${s.total}`).join(' · ');

  return (
    <div className="app app-end">
      <h1>Match analysis</h1>
      <p className="analysis-recap">
        {recap} — {winner === 'drift' ? 'Drift (tie)' : `${winner} wins`}
      </p>

      <div className="telemetry-summary">
        <h2>Telemetry</h2>
        <ul>
          <li>Turns played: {telemetry.turnCount}</li>
          <li>Victory margin: {metrics.victoryMargin}</li>
          <li>
            Cargo plays — P1: {metrics.cargoPlaysByPlayer.P1.length}, P2: {metrics.cargoPlaysByPlayer.P2.length}
          </li>
          <li>Ship changed hands {metrics.shipOwnershipChanges.length} time(s)</li>
          <li>
            First Ship fall — P1: {metrics.firstShipFallTurn.P1 ?? 'never'}, P2:{' '}
            {metrics.firstShipFallTurn.P2 ?? 'never'}
          </li>
          <li>
            Dominations — boarding: {metrics.dominationsByType.boarding}, clash: {metrics.dominationsByType.clash},
            chain: {metrics.dominationsByType.chain}
          </li>
          <li>
            Largest route — P1: {metrics.largestRouteByPlayer.P1}, P2: {metrics.largestRouteByPlayer.P2}
          </li>
          <li>
            Never-played cards — P1: {metrics.neverPlayedCardsByPlayer.P1.length}, P2:{' '}
            {metrics.neverPlayedCardsByPlayer.P2.length}
          </li>
        </ul>
        <div className="telemetry-actions">
          <button
            type="button"
            onClick={() =>
              downloadTextFile(`eltyca-match-${telemetry.seed}.json`, telemetryToJson(telemetry), 'application/json')
            }
          >
            Download JSON
          </button>
          <button
            type="button"
            onClick={() =>
              downloadTextFile(
                `eltyca-match-${telemetry.seed}.csv`,
                rowsToCsv([toTelemetryRow(telemetry)]),
                'text/csv'
              )
            }
          >
            Download CSV
          </button>
        </div>
      </div>

      <LogPanel gameState={gameState} content={content} />

      <div className="winner-actions">
        <button type="button" onClick={onBack}>
          Back to result
        </button>
        <button type="button" className="confirm" onClick={onNewMatch}>
          New match
        </button>
      </div>
    </div>
  );
}
