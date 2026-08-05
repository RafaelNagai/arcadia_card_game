import type { Cell, DirectionResult, LogEvent, RedactedCell } from '@eltyca/engine';

/** Cells that went from empty to occupied between two board snapshots — the uniform
 *  "something got placed" signal across both setup (never logged) and the main phase.
 *  Works the same against redacted cells — a hidden opponent piece is still non-null. */
export function diffNewlyOccupiedCells(prevCells: (Cell | RedactedCell)[], nextCells: (Cell | RedactedCell)[]): number[] {
  const prevOccupied = new Set(prevCells.filter((c) => c.content !== null).map((c) => c.idx));
  const newlyOccupied: number[] = [];
  for (const cell of nextCells) {
    if (cell.content !== null && !prevOccupied.has(cell.idx)) newlyOccupied.push(cell.idx);
  }
  return newlyOccupied;
}

/** Mirrors bots/greedyBot.ts's private countDominations filter, duplicated on purpose —
 *  UI code shouldn't reach into a bot's internals for something this small. */
export function isRealCapture(result: DirectionResult): boolean {
  switch (result.type) {
    case 'boarding':
    case 'chain':
    case 'ship-open':
      return true;
    case 'clash':
    case 'ship-shielded':
      return result.dominated;
    default:
      return false;
  }
}

export interface LastEventCaptures {
  dominatedIdxs: Set<number>;
  dominatingCellIdx: number | null;
}

export function dominationCellsFromLastLogEvent(log: LogEvent[]): LastEventCaptures {
  const lastEvent = log.at(-1);
  if (!lastEvent) return { dominatedIdxs: new Set(), dominatingCellIdx: null };

  const dominatedIdxs = new Set<number>();
  for (const result of lastEvent.results) {
    if (isRealCapture(result)) dominatedIdxs.add(result.targetIdx);
  }
  return { dominatedIdxs, dominatingCellIdx: dominatedIdxs.size > 0 ? lastEvent.cellIdx : null };
}
