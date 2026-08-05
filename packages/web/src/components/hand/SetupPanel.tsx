import type { Dispatch, PointerEvent } from 'react';
import type { GameContent, GameState, Player, RedactedGameState } from '@eltyca/engine';
import { effectiveHiddenCargoTarget, hiddenItemsPlacedCount, isShipPlaced } from '@eltyca/engine';
import type { Action, Selection } from '../../reducer/types';
import { ShipBadge } from '../card/ShipBadge';

export interface SetupPanelProps {
  content: GameContent;
  gameState: GameState | RedactedGameState;
  player: Player;
  selection: Selection | null;
  targetCellIdx: number | null;
  dispatch: Dispatch<Action>;
  startDrag: (event: PointerEvent, selectAction: Action) => void;
}

export function SetupPanel({ content, gameState, player, selection, targetCellIdx, dispatch, startDrag }: SetupPanelProps) {
  // Always this client's own player (LiveMatch only ever renders SetupPanel for the viewer's
  // own turn), and redaction never hides your own pieces — only the opponent's — so scanning
  // gameState for player.id's own Ship/Cargo is safe even against a redacted view. The cast
  // is for isShipPlaced/etc.'s strict engine typing, not because the data could be redacted.
  const game = gameState as GameState;
  const shipDone = isShipPlaced(game, player.id);
  const hiddenDone = hiddenItemsPlacedCount(game, player.id);
  const hiddenNeeded = effectiveHiddenCargoTarget(game, player.id);

  return (
    <div className="setup-panel">
      <p>
        Preparação escondida de {player.id}: Navio {shipDone ? 'colocado' : 'pendente'} · {hiddenDone}/{hiddenNeeded} Carga(s) enterrada(s)
      </p>

      {!shipDone && (
        <button
          type="button"
          className="ship-pickup"
          onClick={() => dispatch({ type: 'SELECT_SETUP_SHIP' })}
          onPointerDown={(e) => startDrag(e, { type: 'SELECT_SETUP_SHIP' })}
        >
          <ShipBadge
            ship={content.ships[player.shipId]}
            owner={player.id}
            compact
            selected={selection?.mode === 'setup-ship'}
          />
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
                onPointerDown={(e) => startDrag(e, { type: 'SELECT_SETUP_CARGO' })}
              >
                Carga
              </button>
            ))}
        </div>
      )}

      {selection && (
        <div className="hand-actions">
          {targetCellIdx !== null && (
            <button type="button" className="confirm" onClick={() => dispatch({ type: 'CONFIRM_PLACEMENT' })}>
              Enterrar aqui, virada para baixo
            </button>
          )}
          <button type="button" onClick={() => dispatch({ type: 'CANCEL_SELECTION' })}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
