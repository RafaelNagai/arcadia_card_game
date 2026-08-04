import type { Dispatch } from 'react';
import type { GameContent, GameState, Player } from '@eltyca/engine';
import { CardMini } from '../card/CardMini';
import type { Action, Selection } from '../../reducer/types';
import { hiddenItemsPlacedCount, isShipPlaced } from '../../game/setupProgress';

export interface SetupPanelProps {
  content: GameContent;
  gameState: GameState;
  player: Player;
  selection: Selection | null;
  targetCellIdx: number | null;
  dispatch: Dispatch<Action>;
}

export function SetupPanel({ content, gameState, player, selection, targetCellIdx, dispatch }: SetupPanelProps) {
  const shipDone = isShipPlaced(gameState, player.id);
  const hiddenDone = hiddenItemsPlacedCount(gameState, player.id);
  const hiddenNeeded = gameState.config.setupHiddenCards;

  return (
    <div className="setup-panel">
      <p>
        Hidden setup for {player.id}: Ship {shipDone ? 'placed' : 'pending'} · {hiddenDone}/{hiddenNeeded} cards buried
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
          {player.hand.map((item, idx) => {
            const selected = selection?.mode === 'setup-hand' && selection.handIndex === idx;
            if (item.kind === 'card') {
              const card = content.cards[item.cardId];
              return (
                <CardMini
                  key={idx}
                  card={card}
                  rotation={0}
                  selected={selected}
                  onClick={() => dispatch({ type: 'SELECT_SETUP_HAND_ITEM', handIndex: idx })}
                />
              );
            }
            return (
              <button
                key={idx}
                type="button"
                className={`cargo-chip${selected ? ' selected' : ''}`}
                onClick={() => dispatch({ type: 'SELECT_SETUP_HAND_ITEM', handIndex: idx })}
              >
                Cargo
              </button>
            );
          })}
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
