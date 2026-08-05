import type { GameContent, Player } from '@eltyca/engine';
import type { Selection } from '../../reducer/types';
import type { GhostPosition } from '../../hooks/useDragPlacement';
import { CardMini } from '../card/CardMini';
import { ShipBadge } from '../card/ShipBadge';

export interface DragGhostProps {
  ghostPos: GhostPosition | null;
  selection: Selection | null;
  content: GameContent;
  /** The player currently acting — used to resolve `selection` (e.g. a hand index) into an actual item to render. */
  player: Player | null;
}

/** Pure presentation, follows the pointer during a drag. `pointer-events: none` (in CSS)
 *  is load-bearing, not just styling — without it the ghost itself would be the topmost
 *  element under the cursor, and the drag hook's elementFromPoint hit-test would find it
 *  instead of the board cell underneath. */
export function DragGhost({ ghostPos, selection, content, player }: DragGhostProps) {
  if (!ghostPos || !selection || !player) return null;

  let inner: React.ReactNode = null;
  if (selection.mode === 'setup-ship') {
    inner = <ShipBadge ship={content.ships[player.shipId]} owner={player.id} compact />;
  } else if (selection.mode === 'setup-cargo') {
    inner = <div className="board-cell-cargo">Carga</div>;
  } else if (selection.mode === 'main-hand') {
    const item = player.hand[selection.handIndex];
    if (item?.kind === 'card') {
      inner = <CardMini card={content.cards[item.cardId]} rotation={selection.rotation} compact />;
    } else if (item?.kind === 'cargo') {
      inner = <div className="board-cell-cargo">Carga</div>;
    }
  }

  if (!inner) return null;

  return (
    <div className="drag-ghost" style={{ left: ghostPos.x, top: ghostPos.y }}>
      {inner}
    </div>
  );
}
