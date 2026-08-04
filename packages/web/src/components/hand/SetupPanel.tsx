import type { Dispatch } from 'react';
import type { GameState, Player } from '@eltyca/engine';
import type { Action, Selection } from '../../reducer/types';
import { effectiveHiddenCargoTarget, hiddenItemsPlacedCount, isShipPlaced } from '../../game/setupProgress';

export interface SetupPanelProps {
  gameState: GameState;
  player: Player;
  selection: Selection | null;
  targetCellIdx: number | null;
  dispatch: Dispatch<Action>;
}

export function SetupPanel({ gameState, player, selection, targetCellIdx, dispatch }: SetupPanelProps) {
  const shipDone = isShipPlaced(gameState, player.id);
  const hiddenDone = hiddenItemsPlacedCount(gameState, player.id);
  const hiddenNeeded = effectiveHiddenCargoTarget(gameState, player.id);

  return (
    <div className="setup-panel">
      <p>
        Hidden setup for {player.id}: Ship {shipDone ? 'placed' : 'pending'} · {hiddenDone}/{hiddenNeeded} Cargo buried
      </p>

      {!shipDone && (
        <button
          type="button"
          className={selection?.mode === 'setup-ship' ? 'selected' : ''}
          onClick={() => dispatch({ type: 'SELECT_SETUP_SHIP' })}
        >
          Select your Ship
        </button>
      )}

      {hiddenDone < hiddenNeeded && (
        <div className="hand-strip">
          {player.hand
            .filter((item) => item.kind === 'cargo')
            .map((_, idx) => (
              <button
                key={idx}
                type="button"
                className={`cargo-chip${selection?.mode === 'setup-cargo' ? ' selected' : ''}`}
                onClick={() => dispatch({ type: 'SELECT_SETUP_CARGO' })}
              >
                Cargo
              </button>
            ))}
        </div>
      )}

      {selection && (
        <div className="hand-actions">
          {targetCellIdx !== null && (
            <button type="button" className="confirm" onClick={() => dispatch({ type: 'CONFIRM_PLACEMENT' })}>
              Bury it here, face-down
            </button>
          )}
          <button type="button" onClick={() => dispatch({ type: 'CANCEL_SELECTION' })}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
