import { useState } from 'react';
import { computeTelemetry, samplePlayerSetups, type GameContent, type GameState } from '@eltyca/engine';
import { ScoreCountingScreen } from './ScoreCountingScreen';
import { WinnerScreen } from './WinnerScreen';
import { AnalysisScreen } from './AnalysisScreen';

export interface EndSequenceProps {
  gameState: GameState;
  content: GameContent;
  durationMs: number | null;
  onNewMatch: () => void;
}

type Stage = 'counting' | 'winner' | 'analysis';

/** Match end, in three beats: an animated score tally, then a clean winner screen, then
 *  (only if asked for, via "Analyze") the telemetry/log/downloads that used to be the
 *  whole end screen. Telemetry is computed once here and shared across all three stages. */
export function EndSequence({ gameState, content, durationMs, onNewMatch }: EndSequenceProps) {
  const [telemetry] = useState(() => computeTelemetry(gameState, content, samplePlayerSetups, durationMs));
  const [stage, setStage] = useState<Stage>('counting');

  if (stage === 'counting') {
    return <ScoreCountingScreen finalScore={telemetry.finalScore} onDone={() => setStage('winner')} />;
  }

  if (stage === 'analysis') {
    return (
      <AnalysisScreen
        telemetry={telemetry}
        gameState={gameState}
        content={content}
        onBack={() => setStage('winner')}
        onNewMatch={onNewMatch}
      />
    );
  }

  return <WinnerScreen telemetry={telemetry} onAnalyze={() => setStage('analysis')} onNewMatch={onNewMatch} />;
}
