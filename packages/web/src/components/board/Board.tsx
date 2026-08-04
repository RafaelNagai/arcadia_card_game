import { isOnEdge, type GameContent, type GameState } from '@eltyca/engine';
import { BoardCell } from './BoardCell';
import type { Selection } from '../../reducer/types';

export interface BoardProps {
  /** The state actually shown — the live gameState, or a speculative previewState while a target cell is picked. */
  displayState: GameState;
  /** Always the real, committed state — used to know which cells are truly empty and to diff captures. */
  baseState: GameState;
  content: GameContent;
  selection: Selection | null;
  targetCellIdx: number | null;
  onSelectCell: (idx: number) => void;
}

export function Board({ displayState, baseState, content, selection, targetCellIdx, onSelectCell }: BoardProps) {
  const { grid } = displayState;
  const shipNeedsInterior = selection?.mode === 'setup-ship' && !baseState.config.shipOnEdge;

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

        const legalForSelection = !shipNeedsInterior || !isOnEdge(cell.idx, baseState.grid);

        return (
          <BoardCell
            key={cell.idx}
            cell={cell}
            gameState={displayState}
            content={content}
            captured={captured}
            isTarget={cell.idx === targetCellIdx}
            selectable={selection !== null && legalForSelection && !baseCell.chasm && baseCell.content === null}
            onClick={() => onSelectCell(cell.idx)}
          />
        );
      })}
    </div>
  );
}
