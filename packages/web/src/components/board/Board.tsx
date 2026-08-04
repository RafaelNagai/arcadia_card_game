import type { GameContent, GameState } from '@eltyca/engine';
import { BoardCell } from './BoardCell';
import type { Selection } from '../../reducer/types';
import { isLegalDropCell } from '../../game/dropTargets';
import type { CommitAnimationState } from '../../hooks/useCommitAnimations';

export interface BoardProps {
  /** The state actually shown — the live gameState, or a speculative previewState while a target cell is picked. */
  displayState: GameState;
  /** Always the real, committed state — used to know which cells are truly empty and to diff captures. */
  baseState: GameState;
  content: GameContent;
  selection: Selection | null;
  targetCellIdx: number | null;
  onSelectCell: (idx: number) => void;
  commitEffects: CommitAnimationState;
}

export function Board({
  displayState,
  baseState,
  content,
  selection,
  targetCellIdx,
  onSelectCell,
  commitEffects,
}: BoardProps) {
  const { grid } = displayState;

  return (
    <div className="board" style={{ gridTemplateColumns: `repeat(${grid.width}, 1fr)` }}>
      {displayState.cells.map((cell) => {
        const baseCell = baseState.cells[cell.idx];
        const captured =
          displayState !== baseState &&
          !!cell.content &&
          !!baseCell.content &&
          'owner' in cell.content &&
          'owner' in baseCell.content &&
          cell.content.owner !== baseCell.content.owner;

        const selectable = isLegalDropCell(baseState, selection, cell.idx);

        return (
          <BoardCell
            key={cell.idx}
            cell={cell}
            gameState={displayState}
            content={content}
            captured={captured}
            isTarget={selectable && cell.idx === targetCellIdx}
            selectable={selectable}
            onClick={() => onSelectCell(cell.idx)}
            justPlaced={commitEffects.justPlacedCellIdx === cell.idx}
            dominated={commitEffects.dominatedCellIndices.has(cell.idx)}
            dominating={commitEffects.dominatingCellIdx === cell.idx}
          />
        );
      })}
    </div>
  );
}
