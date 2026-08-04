import { useState } from 'react';
import { computeTelemetry, type GameContent, type GameState, type PlayerSetup } from '@eltyca/engine';
import { ScoreCountingScreen } from './ScoreCountingScreen';
import { WinnerScreen } from './WinnerScreen';
import { AnalysisScreen } from './AnalysisScreen';

export interface EndSequenceProps {
  gameState: GameState;
  content: GameContent;
  /** The Captain/Ship/deck actually used this match (drafted or, previously, hardcoded) —
   *  computeTelemetry reads real per-player deck data from this (average arrows, cards never
   *  played, etc.), so it has to be the setups this specific match was built from, not a
   *  fixed sample. */
  playerSetups: PlayerSetup[];
  durationMs: number | null;
  onNewMatch: () => void;
}

type Stage = 'counting' | 'winner' | 'analysis';

/** Match end, in three beats: an animated score tally, then a clean winner screen, then
 *  (only if asked for, via "Analyze") the telemetry/log/downloads that used to be the
 *  whole end screen. Telemetry is computed once here and shared across all three stages. */
export function EndSequence({ gameState, content, playerSetups, durationMs, onNewMatch }: EndSequenceProps) {
  const [telemetry] = useState(() => computeTelemetry(gameState, content, playerSetups, durationMs));
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
