import type { Dispatch } from 'react';
import type { GameContent, Player } from '@eltyca/engine';
import { CardMini } from '../card/CardMini';
import type { Action, Selection } from '../../reducer/types';

export interface HandProps {
  content: GameContent;
  player: Player;
  selection: Selection | null;
  targetCellIdx: number | null;
  dispatch: Dispatch<Action>;
}

export function Hand({ content, player, selection, targetCellIdx, dispatch }: HandProps) {
  const selectedHandIndex = selection?.mode === 'main-hand' ? selection.handIndex : null;
  const selectedItem = selectedHandIndex !== null ? player.hand[selectedHandIndex] : null;
  const showDiscardPicker = selectedItem?.kind === 'cargo' && targetCellIdx !== null;

  return (
    <div className="hand">
      <div className="hand-strip">
        {player.hand.map((item, idx) => {
          if (item.kind === 'card') {
            const card = content.cards[item.cardId];
            const rotation = selectedHandIndex === idx && selection?.mode === 'main-hand' ? selection.rotation : 0;
            return (
              <CardMini
                key={idx}
                card={card}
                rotation={rotation}
                selected={selectedHandIndex === idx}
                onClick={() => dispatch({ type: 'SELECT_HAND_ITEM', handIndex: idx })}
              />
            );
          }
          return (
            <button
              key={idx}
              type="button"
              className={`cargo-chip${selectedHandIndex === idx ? ' selected' : ''}`}
              onClick={() => dispatch({ type: 'SELECT_HAND_ITEM', handIndex: idx })}
            >
              Cargo
            </button>
          );
        })}
      </div>

      {selection?.mode === 'main-hand' && (
        <div className="hand-actions">
          {selectedItem?.kind === 'card' && (
            <button type="button" onClick={() => dispatch({ type: 'ROTATE' })}>
              Rotate (R)
            </button>
          )}

          {showDiscardPicker ? (
            <div className="discard-picker">
              <span>Discard which card to play the Cargo?</span>
              {player.hand.map((item, idx) =>
                item.kind === 'card' ? (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => dispatch({ type: 'CONFIRM_PLACEMENT', discardCardId: item.cardId })}
                  >
                    Discard {content.cards[item.cardId].name}
                  </button>
                ) : null
              )}
            </div>
          ) : (
            targetCellIdx !== null && (
              <button type="button" className="confirm" onClick={() => dispatch({ type: 'CONFIRM_PLACEMENT' })}>
                Confirm placement
              </button>
            )
          )}

          <button type="button" onClick={() => dispatch({ type: 'CANCEL_SELECTION' })}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
