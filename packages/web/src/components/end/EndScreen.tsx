import {
  computeTelemetry,
  rowsToCsv,
  samplePlayerSetups,
  telemetryToJson,
  toTelemetryRow,
  type GameContent,
  type GameState,
} from '@eltyca/engine';
import { LogPanel } from '../log/LogPanel';
import { downloadTextFile } from '../../game/download';

export interface EndScreenProps {
  gameState: GameState;
  content: GameContent;
  durationMs: number | null;
  onNewMatch: () => void;
}

export function EndScreen({ gameState, content, durationMs, onNewMatch }: EndScreenProps) {
  const telemetry = computeTelemetry(gameState, content, samplePlayerSetups, durationMs);
  const { winner, metrics } = telemetry;

  return (
    <div className="app app-end">
      <h1>{winner === 'drift' ? 'Drift — tie' : `${winner} wins`}</h1>

      <div className="scores">
        {telemetry.finalScore.map((score) => (
          <div key={score.player} className="score-card">
            <h2>{score.player}</h2>
            <p>{score.cardPoints} cards</p>
            <p>{score.shipPoints} ship(s)</p>
            <p>{score.routeBonus} route bonus</p>
            <p className="score-total">Total: {score.total}</p>
          </div>
        ))}
      </div>

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

      <button type="button" className="confirm" onClick={onNewMatch}>
        New match
      </button>
    </div>
  );
}
