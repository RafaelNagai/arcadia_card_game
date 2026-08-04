import { useReducer } from 'react';
import type { Config } from '@eltyca/engine';
import { createDraftState, sampleContent, toPlayerSetups } from '@eltyca/engine';
import { createInitialDraftUIState, draftReducer } from './reducer/draftReducer';
import { ChoiceScreen } from './components/draft/ChoiceScreen';
import { DraftScreen } from './components/draft/DraftScreen';
import LiveMatchHost from './LiveMatchHost';

export interface MatchProps {
  config: Config;
  onNewMatch: () => void;
}

/** Pre-game orchestrator: runs Captain/Ship choice, then the Porto draft, entirely as its
 *  own small reducer — see reducer/draftReducer.ts and @eltyca/engine's rules/draft.ts for
 *  why this is kept separate from the real match state rather than folded into it. Once the
 *  draft reaches stage 'done', hands the result to LiveMatchHost (which owns the actual game's
 *  reducer — this used to be the whole of Match.tsx before the draft existed), which knows
 *  nothing about how the Captain/Ship/deck it received were decided. */
export default function Match({ config, onNewMatch }: MatchProps) {
  const [draftState, dispatch] = useReducer(draftReducer, config, (initialConfig) => {
    const seed = Math.floor(Math.random() * 1_000_000);
    return createInitialDraftUIState(sampleContent, createDraftState(sampleContent, initialConfig, ['P1', 'P2'], seed));
  });

  const { draft } = draftState;

  if (draft.stage !== 'done') {
    return (
      <div className="game-screen">
        {draftState.error && <div className="error-banner">{draftState.error}</div>}
        {draft.stage === 'choice' ? (
          <ChoiceScreen content={draftState.content} draft={draft} dispatch={dispatch} />
        ) : (
          <DraftScreen content={draftState.content} draft={draft} dispatch={dispatch} />
        )}
      </div>
    );
  }

  const playerSetups = toPlayerSetups(draft, draftState.content);
  return <LiveMatchHost config={config} playerSetups={playerSetups} onNewMatch={onNewMatch} />;
}
