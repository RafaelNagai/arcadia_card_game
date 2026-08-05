import type { Dispatch, PointerEvent as ReactPointerEvent } from 'react';
import { useRef } from 'react';
import type { GameState, Player, PlayerId, PlayerSetup } from '@eltyca/engine';
import type { UIState, Action } from './reducer/types';
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

const noopDispatch: Dispatch<Action> = () => {};
const noopStartDrag = (_event: ReactPointerEvent, _selectAction: Action) => {};

export interface LiveMatchProps {
  state: UIState;
  dispatch: Dispatch<Action>;
  /** The original draft/hot-seat setups (captain/ship/deck), independent of live reducer
   *  state — only needed for EndSequence's telemetry, which wants what each player started
   *  with, not anything derived from `state`. */
  playerSetups: PlayerSetup[];
  onNewMatch: () => void;
  /** Set only for online matches: this client always displays this fixed player's hand/setup
   *  panel, gated to interactive only when it's actually their turn. Hot-seat (viewerId
   *  undefined) keeps today's behavior — always show and control whoever's currently active,
   *  since only one physical screen exists to hand back and forth. */
  viewerId?: PlayerId;
  /** Who's allowed to place the next setup piece, per regras_v0.9.md's alternating rule.
   *  Hot-seat's caller computes this via the engine's nextSetupPlayer against the real
   *  gameState; an online caller must instead use a server-provided value, since running
   *  nextSetupPlayer against a redacted state silently gives the wrong answer (a hidden
   *  opponent piece no longer looks like a placed Ship/Cargo). LiveMatch itself stays
   *  agnostic to which source it came from. */
  activeSetupPlayer: PlayerId | null;
}

export default function LiveMatch({ state, dispatch, playerSetups, onNewMatch, viewerId, activeSetupPlayer }: LiveMatchProps) {
  const startedAt = useRef(Date.now());
  useRotateShortcut(state.selection, dispatch);
  const { ghostPos, startDrag } = useDragPlacement(dispatch, state.gameState, state.selection);
  const commitEffects = useCommitAnimations(state.gameState, state.awaitingHandoff);

  const { gameState, content } = state;

  // Tracked here (not inside Hand.tsx) because Hand unmounts every hot-seat handoff —
  // this needs to survive that to know what each player's hand looked like last time.
  // Online, there's no handoff, but the same "last seen" tracking is still needed for the
  // draw-in animation to fire correctly, keyed to the viewer's own fixed player rather than
  // whoever's turn it happens to be.
  const trackedPlayerId = viewerId ?? gameState.turnPlayer;
  const trackedPlayer = gameState.players.find((p) => p.id === trackedPlayerId);
  const newlyDrawnCount = useHandDrawAnimation(trackedPlayerId, trackedPlayer?.hand ?? []);

  // Belt-and-suspenders: an online reducer should never populate awaitingHandoff in the
  // first place (there's no device to pass), but guard explicitly rather than rely on that
  // invariant silently — showing "pass the device" to an online player would be a real bug.
  if (state.awaitingHandoff && !viewerId) {
    return <HotSeatScreen playerId={state.awaitingHandoff} dispatch={dispatch} />;
  }

  if (gameState.phase === 'end') {
    // redactGameStateForPlayer returns everything unredacted once phase is 'end' (see its
    // doc comment) — nothing left to hide, and EndSequence/computeTelemetry need full
    // fidelity for both players' stats. The cast reflects that, not a gap in redaction.
    return (
      <EndSequence
        gameState={gameState as GameState}
        content={content}
        playerSetups={playerSetups}
        durationMs={Date.now() - startedAt.current}
        onNewMatch={onNewMatch}
      />
    );
  }

  if (gameState.phase === 'setup') {
    const displayedPlayerId = viewerId ?? activeSetupPlayer;
    const canAct = viewerId ? activeSetupPlayer === viewerId : true;
    // Always the viewer's own player online (never redacted — redaction only ever hides the
    // *opponent's* data) and hot-seat's gameState is never actually redacted either, so this
    // cast is safe despite gameState.players' widened element type; SetupPanel/DragGhost
    // weren't widened since they only ever render this client's own, always-real hand.
    const player = gameState.players.find((p) => p.id === displayedPlayerId)! as Player;

    return (
      <div className="game-screen">
        <header>
          <h1>ELTYCA (setup){viewerId && !canAct ? ` — waiting for ${activeSetupPlayer}` : ''}</h1>
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
              onSelectCell={(idx) => (canAct ? dispatch : noopDispatch)({ type: 'SELECT_CELL', cellIdx: idx })}
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
              dispatch={canAct ? dispatch : noopDispatch}
              startDrag={canAct ? startDrag : noopStartDrag}
            />
          </aside>
        </div>
        <DragGhost ghostPos={ghostPos} selection={state.selection} content={content} player={player} />
      </div>
    );
  }

  // main phase
  const displayedPlayerId = viewerId ?? gameState.turnPlayer;
  const canAct = viewerId ? gameState.turnPlayer === viewerId : true;
  // Same reasoning as the setup branch above: always this client's own, always-real player.
  const displayedPlayer = gameState.players.find((p) => p.id === displayedPlayerId)! as Player;
  const activePlayer = gameState.players.find((p) => p.id === gameState.turnPlayer)!;
  const displayState = state.previewState ?? gameState;

  return (
    <div className="game-screen">
      <header>
        <h1>
          Turn {gameState.turnNumber} · {activePlayer.id} to play
          {viewerId && !canAct ? ' — waiting for opponent' : ''}
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
            onSelectCell={(idx) => (canAct ? dispatch : noopDispatch)({ type: 'SELECT_CELL', cellIdx: idx })}
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
        player={displayedPlayer}
        selection={state.selection}
        targetCellIdx={state.targetCellIdx}
        dispatch={canAct ? dispatch : noopDispatch}
        startDrag={canAct ? startDrag : noopStartDrag}
        newlyDrawnCount={newlyDrawnCount}
      />
      <DragGhost ghostPos={ghostPos} selection={state.selection} content={content} player={displayedPlayer} />
    </div>
  );
}
