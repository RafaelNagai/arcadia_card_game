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
      <h1>Análise da partida</h1>
      <p className="analysis-recap">
        {recap} — {winner === 'drift' ? 'Deriva (empate)' : `${winner} vence`}
      </p>

      <div className="telemetry-summary">
        <h2>Telemetria</h2>
        <ul>
          <li>Turnos jogados: {telemetry.turnCount}</li>
          <li>Margem de vitória: {metrics.victoryMargin}</li>
          <li>
            Cargas jogadas — P1: {metrics.cargoPlaysByPlayer.P1.length}, P2: {metrics.cargoPlaysByPlayer.P2.length}
          </li>
          <li>Navio trocou de mão {metrics.shipOwnershipChanges.length} vez(es)</li>
          <li>
            Primeira queda do Navio — P1: {metrics.firstShipFallTurn.P1 ?? 'nunca'}, P2:{' '}
            {metrics.firstShipFallTurn.P2 ?? 'nunca'}
          </li>
          <li>
            Domínios — abordagem: {metrics.dominationsByType.boarding}, confronto: {metrics.dominationsByType.clash},
            cadeia: {metrics.dominationsByType.chain}
          </li>
          <li>
            Maior rota — P1: {metrics.largestRouteByPlayer.P1}, P2: {metrics.largestRouteByPlayer.P2}
          </li>
          <li>
            Cartas nunca jogadas — P1: {metrics.neverPlayedCardsByPlayer.P1.length}, P2:{' '}
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
            Baixar JSON
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
            Baixar CSV
          </button>
        </div>
      </div>

      <LogPanel gameState={gameState} content={content} />

      <div className="winner-actions">
        <button type="button" onClick={onBack}>
          Voltar ao resultado
        </button>
        <button type="button" className="confirm" onClick={onNewMatch}>
          Nova partida
        </button>
      </div>
    </div>
  );
}
