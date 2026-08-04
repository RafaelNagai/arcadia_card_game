import { useReducer } from 'react';
import {
  computeScores,
  createInitialState,
  determineWinner,
  loadConfig,
  sampleContent,
  samplePlayerSetups,
} from '@eltyca/engine';
import { createInitialUIState, gameReducer } from './reducer/gameReducer';
import { Board } from './components/board/Board';
import { Hand } from './components/hand/Hand';
import { SetupPanel } from './components/hand/SetupPanel';
import { PanelCaptain } from './components/panels/PanelCaptain';
import { PanelShip } from './components/panels/PanelShip';
import { LogPanel } from './components/log/LogPanel';
import { HotSeatScreen } from './components/hotseat/HotSeatScreen';
import { useRotateShortcut } from './hooks/useRotateShortcut';
import { nextSetupPlayer } from './game/setupProgress';

function newMatchState() {
  const config = loadConfig();
  const seed = Math.floor(Math.random() * 1_000_000);
  const gameState = createInitialState(config, samplePlayerSetups, seed);
  return createInitialUIState(sampleContent, gameState);
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, newMatchState);
  useRotateShortcut(state.selection, dispatch);

  const { gameState, content } = state;

  if (state.awaitingHandoff) {
    return <HotSeatScreen playerId={state.awaitingHandoff} dispatch={dispatch} />;
  }

  if (gameState.phase === 'end') {
    const scores = computeScores(gameState, content);
    const winner = determineWinner(scores);
    return (
      <div className="app app-end">
        <h1>{winner === 'drift' ? 'Drift — tie' : `${winner} wins`}</h1>
        <div className="scores">
          {scores.map((score) => (
            <div key={score.player} className="score-card">
              <h2>{score.player}</h2>
              <p>{score.cardPoints} cards</p>
              <p>{score.shipPoints} ship(s)</p>
              <p>{score.routeBonus} route bonus</p>
              <p className="score-total">Total: {score.total}</p>
            </div>
          ))}
        </div>
        <LogPanel gameState={gameState} content={content} />
        <NewMatchButton onNewMatch={() => window.location.reload()} />
      </div>
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
              content={content}
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

function NewMatchButton({ onNewMatch }: { onNewMatch: () => void }) {
  return (
    <button type="button" className="confirm" onClick={onNewMatch}>
      New match
    </button>
  );
}
