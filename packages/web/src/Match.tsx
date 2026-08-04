import { useReducer, useRef } from 'react';
import type { Config, GameState } from '@eltyca/engine';
import { createInitialState, sampleContent, samplePlayerSetups } from '@eltyca/engine';
import { createInitialUIState, gameReducer } from './reducer/gameReducer';
import { Board } from './components/board/Board';
import { Hand } from './components/hand/Hand';
import { SetupPanel } from './components/hand/SetupPanel';
import { PanelCaptain } from './components/panels/PanelCaptain';
import { PanelShip } from './components/panels/PanelShip';
import { LogPanel } from './components/log/LogPanel';
import { HotSeatScreen } from './components/hotseat/HotSeatScreen';
import { EndScreen } from './components/end/EndScreen';
import { useRotateShortcut } from './hooks/useRotateShortcut';
import { nextSetupPlayer } from './game/setupProgress';

export interface MatchProps {
  config: Config;
  onNewMatch: () => void;
}

function buildInitialState(config: Config): GameState {
  const seed = Math.floor(Math.random() * 1_000_000);
  return createInitialState(config, samplePlayerSetups, seed);
}

export default function Match({ config, onNewMatch }: MatchProps) {
  const startedAt = useRef(Date.now());
  const [state, dispatch] = useReducer(
    gameReducer,
    config,
    (initialConfig) => createInitialUIState(sampleContent, buildInitialState(initialConfig))
  );
  useRotateShortcut(state.selection, dispatch);

  const { gameState, content } = state;

  if (state.awaitingHandoff) {
    return <HotSeatScreen playerId={state.awaitingHandoff} dispatch={dispatch} />;
  }

  if (gameState.phase === 'end') {
    return (
      <EndScreen
        gameState={gameState}
        content={content}
        durationMs={Date.now() - startedAt.current}
        onNewMatch={onNewMatch}
      />
    );
  }

  if (gameState.phase === 'setup') {
    const activePlayerId = nextSetupPlayer(gameState)!;
    const player = gameState.players.find((p) => p.id === activePlayerId)!;

    return (
      <div className="app">
        <header>
          <h1>ELTYCA — Prototype (setup)</h1>
        </header>
        {state.error && <div className="error-banner">{state.error}</div>}
        <div className="layout">
          <Board
            displayState={gameState}
            baseState={gameState}
            content={content}
            selection={state.selection}
            targetCellIdx={state.targetCellIdx}
            onSelectCell={(idx) => dispatch({ type: 'SELECT_CELL', cellIdx: idx })}
          />
          <aside>
            <SetupPanel
              gameState={gameState}
              player={player}
              selection={state.selection}
              targetCellIdx={state.targetCellIdx}
              dispatch={dispatch}
            />
          </aside>
        </div>
      </div>
    );
  }

  // main phase
  const activePlayer = gameState.players.find((p) => p.id === gameState.turnPlayer)!;
  const displayState = state.previewState ?? gameState;

  return (
    <div className="app">
      <header>
        <h1>
          ELTYCA — Prototype · Turn {gameState.turnNumber} · {activePlayer.id} to play
        </h1>
      </header>
      {state.error && <div className="error-banner">{state.error}</div>}
      <div className="layout">
        <Board
          displayState={displayState}
          baseState={gameState}
          content={content}
          selection={state.selection}
          targetCellIdx={state.targetCellIdx}
          onSelectCell={(idx) => dispatch({ type: 'SELECT_CELL', cellIdx: idx })}
        />
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
      />
    </div>
  );
}
