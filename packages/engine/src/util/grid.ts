import { OFFSET } from '../constants';

export interface GridDimensions {
  width: number;
  height: number;
}

export function idxToRowCol(idx: number, grid: GridDimensions): { row: number; col: number } {
  return { row: Math.floor(idx / grid.width), col: idx % grid.width };
}

export function rowColToIdx(row: number, col: number, grid: GridDimensions): number {
  return row * grid.width + col;
}

/** Returns the index of the neighbor in the given direction, or null if it falls outside the grid. */
export function neighbor(idx: number, direction: number, grid: GridDimensions): number | null {
  const { row, col } = idxToRowCol(idx, grid);
  const [dr, dc] = OFFSET[direction];
  const newRow = row + dr;
  const newCol = col + dc;
  if (newRow < 0 || newRow >= grid.height || newCol < 0 || newCol >= grid.width) {
    return null;
  }
  return rowColToIdx(newRow, newCol, grid);
}

export function isOnEdge(idx: number, grid: GridDimensions): boolean {
  const { row, col } = idxToRowCol(idx, grid);
  return row === 0 || row === grid.height - 1 || col === 0 || col === grid.width - 1;
}
