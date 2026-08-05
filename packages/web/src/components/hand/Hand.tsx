import type { Dispatch, PointerEvent } from 'react';
import type { GameContent, Player } from '@eltyca/engine';
import { CardMini } from '../card/CardMini';
import type { Action, Selection } from '../../reducer/types';
import { HAND_DRAW_STAGGER_MS } from '../../hooks/useHandDrawAnimation';

export interface HandProps {
  content: GameContent;
  player: Player;
  selection: Selection | null;
  targetCellIdx: number | null;
  dispatch: Dispatch<Action>;
  startDrag: (event: PointerEvent, selectAction: Action) => void;
  /** How many of the last hand slots just got drawn — see hooks/useHandDrawAnimation.ts. */
  newlyDrawnCount?: number;
}

export function Hand({
  content,
  player,
  selection,
  targetCellIdx,
  dispatch,
  startDrag,
  newlyDrawnCount = 0,
}: HandProps) {
  const selectedHandIndex = selection?.mode === 'main-hand' ? selection.handIndex : null;
  const selectedItem = selectedHandIndex !== null ? player.hand[selectedHandIndex] : null;
  const showDiscardPicker = selectedItem?.kind === 'cargo' && targetCellIdx !== null;
  const firstNewIdx = player.hand.length - newlyDrawnCount;

  return (
    <div className="hand">
      <div className="hand-strip">
        {player.hand.map((item, idx) => {
          const isNew = newlyDrawnCount > 0 && idx >= firstNewIdx;
          const slotClassName = isNew ? 'hand-slot card-drawn-in' : 'hand-slot';
          const slotStyle = isNew
            ? { animationDelay: `${(idx - firstNewIdx) * HAND_DRAW_STAGGER_MS}ms` }
            : undefined;

          if (item.kind === 'card') {
            const card = content.cards[item.cardId];
            const rotation = selectedHandIndex === idx && selection?.mode === 'main-hand' ? selection.rotation : 0;
            return (
              <div key={idx} className={slotClassName} style={slotStyle}>
                <CardMini
                  card={card}
                  rotation={rotation}
                  selected={selectedHandIndex === idx}
                  onClick={() => dispatch({ type: 'SELECT_HAND_ITEM', handIndex: idx })}
                  onPointerDown={(e) => startDrag(e, { type: 'SELECT_HAND_ITEM', handIndex: idx })}
                />
              </div>
            );
          }
          return (
            <div key={idx} className={slotClassName} style={slotStyle}>
              <button
                type="button"
                className={`cargo-chip${selectedHandIndex === idx ? ' selected' : ''}`}
                onClick={() => dispatch({ type: 'SELECT_HAND_ITEM', handIndex: idx })}
                onPointerDown={(e) => startDrag(e, { type: 'SELECT_HAND_ITEM', handIndex: idx })}
              >
                Carga
              </button>
            </div>
          );
        })}
      </div>

      {selection?.mode === 'main-hand' && (
        <div className="hand-actions">
          {selectedItem?.kind === 'card' && (
            <button type="button" onClick={() => dispatch({ type: 'ROTATE' })}>
              Girar (R)
            </button>
          )}

          {showDiscardPicker ? (
            <div className="discard-picker">
              <span>Descartar qual carta para jogar a Carga?</span>
              {player.hand.map((item, idx) =>
                item.kind === 'card' ? (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => dispatch({ type: 'CONFIRM_PLACEMENT', discardCardId: item.cardId })}
                  >
                    Descartar {content.cards[item.cardId].name}
                  </button>
                ) : null
              )}
            </div>
          ) : (
            targetCellIdx !== null && (
              <button type="button" className="confirm" onClick={() => dispatch({ type: 'CONFIRM_PLACEMENT' })}>
                Confirmar colocação
              </button>
            )
          )}

          <button type="button" onClick={() => dispatch({ type: 'CANCEL_SELECTION' })}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
