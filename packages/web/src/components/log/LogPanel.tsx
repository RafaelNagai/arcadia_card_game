import { formatLogEvent, type GameContent, type GameState, type RedactedGameState } from '@eltyca/engine';

export interface LogPanelProps {
  /** log is identical between GameState and RedactedGameState — every entry is a placement
   *  that already happened in the open, never touched by redaction. */
  gameState: GameState | RedactedGameState;
  content: GameContent;
}

export function LogPanel({ gameState, content }: LogPanelProps) {
  return (
    <div className="log-panel">
      <h3>Registro de turnos</h3>
      <ol>
        {gameState.log.map((event, idx) => (
          <li key={idx}>{formatLogEvent(event, content)}</li>
        ))}
      </ol>
    </div>
  );
}
