import { formatLogEvent, type GameContent, type GameState } from '@eltyca/engine';

export interface LogPanelProps {
  gameState: GameState;
  content: GameContent;
}

export function LogPanel({ gameState, content }: LogPanelProps) {
  return (
    <div className="log-panel">
      <h3>Turn log</h3>
      <ol>
        {gameState.log.map((event, idx) => (
          <li key={idx}>{formatLogEvent(event, content)}</li>
        ))}
      </ol>
    </div>
  );
}
