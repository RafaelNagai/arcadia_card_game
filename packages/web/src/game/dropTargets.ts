import { isOnEdge, type GameState } from '@eltyca/engine';
import type { Selection } from '../reducer/types';

/** Single source of truth for "can the current selection legally land here" — used by
 *  Board.tsx (to decide what to highlight) and by the drag hook (to decide whether a
 *  drop confirms or cancels). Always checked against the real, committed state, never
 *  a speculative preview. */
export function isLegalDropCell(baseState: GameState, selection: Selection | null, cellIdx: number): boolean {
  if (!selection) return false;
  const cell = baseState.cells[cellIdx];
  if (!cell || cell.chasm || cell.content !== null) return false;
  if (selection.mode === 'setup-ship' && !baseState.config.shipOnEdge && isOnEdge(cellIdx, baseState.grid)) {
    return false;
  }
  return true;
}
