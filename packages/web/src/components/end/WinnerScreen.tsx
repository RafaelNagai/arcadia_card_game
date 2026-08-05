import type { MatchTelemetry } from '@eltyca/engine';

export interface WinnerScreenProps {
  telemetry: MatchTelemetry;
  onAnalyze: () => void;
  onNewMatch: () => void;
}

/** The clean result screen — winner and final score only. Everything else (telemetry, log, downloads) lives behind "Analyze". */
export function WinnerScreen({ telemetry, onAnalyze, onNewMatch }: WinnerScreenProps) {
  const { winner, surrenderedBy, finalScore } = telemetry;

  return (
    <div className="app app-end">
      <h1>{winner === 'drift' ? 'Deriva — empate' : `${winner} vence`}</h1>
      {surrenderedBy && <p className="surrender-note">{surrenderedBy} desistiu da partida</p>}

      <div className="scores">
        {finalScore.map((score) => (
          <div key={score.player} className="score-card">
            <h2>{score.player}</h2>
            <p>{score.cardPoints} carta(s)</p>
            <p>{score.shipPoints} navio(s)</p>
            <p>{score.routeBonus} bônus de rota</p>
            <p className="score-total">Total: {score.total}</p>
          </div>
        ))}
      </div>

      <div className="winner-actions">
        <button type="button" onClick={onAnalyze}>
          Analisar
        </button>
        <button type="button" className="confirm" onClick={onNewMatch}>
          Nova partida
        </button>
      </div>
    </div>
  );
}
