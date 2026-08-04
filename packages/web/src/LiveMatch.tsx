import { useReducer, useRef } from 'react';
import type { Config, GameState, PlayerSetup } from '@eltyca/engine';
import { createInitialState, sampleContent } from '@eltyca/engine';
import { createInitialUIState, gameReducer } from './reducer/gameReducer';
import { Board } from './components/board/Board';
import { DragGhost } from './components/board/DragGhost';
import { Hand } from './components/hand/Hand';
import { SetupPanel } from './components/hand/SetupPanel';
import { PanelCaptain } from './components/panels/PanelCaptain';
import { PanelShip } from './components/panels/PanelShip';
import { LogPanel } from './components/log/LogPanel';
import { HotSeatScreen } from './components/hotseat/HotSeatScreen';
import { EndSequence } from './components/end/EndSequence';
import { useRotateShortcut } from './hooks/useRotateShortcut';
import { useDragPlacement } from './hooks/useDragPlacement';
import { useCommitAnimations } from './hooks/useCommitAnimations';
import { useHandDrawAnimation } from './hooks/useHandDrawAnimation';
import { nextSetupPlayer } from './game/setupProgress';

export interface LiveMatchProps {
  config: Config;
  /** Resolved by the Match.tsx orchestrator, either from a finished Porto draft or (before
   *  the draft existed) the old hardcoded samplePlayerSetups — this component doesn't care
   *  which. */
  playerSetups: PlayerSetup[];
  onNewMatch: () => void;
}

function buildInitialState(config: Config, playerSetups: PlayerSetup[]): GameState {
  const seed = Math.floor(Math.random() * 1_000_000);
  return createInitialState(config, playerSetups, seed);
}

export default function LiveMatch({ config, playerSetups, onNewMatch }: LiveMatchProps) {
  const startedAt = useRef(Date.now());
  const [state, dispatch] = useReducer(
    gameReducer,
    config,
    (initialConfig) => createInitialUIState(sampleContent, buildInitialState(initialConfig, playerSetups))
  );
  useRotateShortcut(state.selection, dispatch);
  const { ghostPos, startDrag } = useDragPlacement(dispatch, state.gameState, state.selection);
  const commitEffects = useCommitAnimations(state.gameState, state.awaitingHandoff);

  const { gameState, content } = state;

  // Tracked here (not inside Hand.tsx) because Hand unmounts every hot-seat handoff —
  // this needs to survive that to know what each player's hand looked like last time.
  const turnPlayer = gameState.players.find((p) => p.id === gameState.turnPlayer);
  const newlyDrawnCount = useHandDrawAnimation(gameState.turnPlayer, turnPlayer?.hand ?? []);

  if (state.awaitingHandoff) {
    return <HotSeatScreen playerId={state.awaitingHandoff} dispatch={dispatch} />;
  }

  if (gameState.phase === 'end') {
    return (
      <EndSequence
        gameState={gameState}
        content={content}
        playerSetups={playerSetups}
        durationMs={Date.now() - startedAt.current}
        onNewMatch={onNewMatch}
      />
    );
  }

  if (gameState.phase === 'setup') {
    const activePlayerId = nextSetupPlayer(gameState)!;
    const player = gameState.players.find((p) => p.id === activePlayerId)!;

    return (
      <div className="game-screen">
        <header>
          <h1>ELTYCA (setup)</h1>
        </header>
        {state.error && <div className="error-banner">{state.error}</div>}
        <div className="layout">
          <div className="board-wrapper">
            <Board
              displayState={gameState}
              baseState={gameState}
              content={content}
              selection={state.selection}
              targetCellIdx={state.targetCellIdx}
              onSelectCell={(idx) => dispatch({ type: 'SELECT_CELL', cellIdx: idx })}
              commitEffects={commitEffects}
            />
          </div>
          <aside>
            <SetupPanel
              content={content}
              gameState={gameState}
              player={player}
              selection={state.selection}
              targetCellIdx={state.targetCellIdx}
              dispatch={dispatch}
              startDrag={startDrag}
            />
          </aside>
        </div>
        <DragGhost ghostPos={ghostPos} selection={state.selection} content={content} player={player} />
      </div>
    );
  }

  // main phase
  const activePlayer = gameState.players.find((p) => p.id === gameState.turnPlayer)!;
  const displayState = state.previewState ?? gameState;

  return (
    <div className="game-screen">
      <header>
        <h1>
          Turn {gameState.turnNumber} · {activePlayer.id} to play
        </h1>
      </header>
      {state.error && <div className="error-banner">{state.error}</div>}
      <div className="layout">
        <div className="board-wrapper">
          <Board
            displayState={displayState}
            baseState={gameState}
            content={content}
            selection={state.selection}
            targetCellIdx={state.targetCellIdx}
            onSelectCell={(idx) => dispatch({ type: 'SELECT_CELL', cellIdx: idx })}
            commitEffects={commitEffects}
          />
        </div>
        <aside>
          {gameState.players.map((p) => (
            <div key={p.id} className={`player-panels${p.id === activePlayer.id ? ' active' : ''}`}>
              <PanelCaptain captain={content.captains[p.captainId]} player={p} gameState={gameState} />
              <PanelShip content={content} gameState={gameState} player={p} />
            </div>
          ))}
          <LogPanel gameState={gameState} content={content} />
        </aside>
      </div>
      <Hand
        content={content}
        player={activePlayer}
        selection={state.selection}
        targetCellIdx={state.targetCellIdx}
        dispatch={dispatch}
        startDrag={startDrag}
        newlyDrawnCount={newlyDrawnCount}
      />
      <DragGhost ghostPos={ghostPos} selection={state.selection} content={content} player={activePlayer} />
    </div>
  );
}
