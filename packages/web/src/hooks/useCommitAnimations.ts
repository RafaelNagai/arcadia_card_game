import { useEffect, useRef, useState } from 'react';
import type { GameState, PlayerId, RedactedGameState } from '@eltyca/engine';
import { diffNewlyOccupiedCells, dominationCellsFromLastLogEvent } from '../game/captureEffects';

export interface CommitAnimationState {
  justPlacedCellIdx: number | null;
  dominatedCellIndices: Set<number>;
  dominatingCellIdx: number | null;
}

const EMPTY: CommitAnimationState = { justPlacedCellIdx: null, dominatedCellIndices: new Set(), dominatingCellIdx: null };
const VISIBLE_DURATION_MS = 650;

/**
 * Board unmounts every time `awaitingHandoff` becomes non-null (Match.tsx swaps it for
 * HotSeatScreen), which happens right after almost every main-phase placement — so a
 * diff computed and animated inside Board itself would either replay on the whole
 * board at once on remount, or never be seen at all. This hook lives in Match.tsx
 * (never unmounts mid-match) instead: it computes the diff the instant gameState
 * changes, but only *reveals* it once the board is actually visible — immediately if
 * it already was (a single player's own back-to-back setup placements), or the moment
 * `awaitingHandoff` clears (the next player just pressed "ready").
 */
export function useCommitAnimations(gameState: GameState | RedactedGameState, awaitingHandoff: PlayerId | null): CommitAnimationState {
  const [visible, setVisible] = useState<CommitAnimationState>(EMPTY);

  const prevCellsRef = useRef(gameState.cells);
  const prevLogLengthRef = useRef(gameState.log.length);
  const pendingRef = useRef<CommitAnimationState | null>(null);

  useEffect(() => {
    const prevCells = prevCellsRef.current;
    const prevLogLength = prevLogLengthRef.current;
    prevCellsRef.current = gameState.cells;
    prevLogLengthRef.current = gameState.log.length;

    const newlyOccupied = diffNewlyOccupiedCells(prevCells, gameState.cells);
    if (newlyOccupied.length === 0) return;

    let dominatedIdxs = new Set<number>();
    let dominatingCellIdx: number | null = null;
    if (gameState.log.length > prevLogLength) {
      const fromLog = dominationCellsFromLastLogEvent(gameState.log);
      dominatedIdxs = fromLog.dominatedIdxs;
      dominatingCellIdx = fromLog.dominatingCellIdx;
    }

    pendingRef.current = { justPlacedCellIdx: newlyOccupied[0] ?? null, dominatedCellIndices: dominatedIdxs, dominatingCellIdx };
  }, [gameState]);

  useEffect(() => {
    if (awaitingHandoff !== null) return;
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;

    setVisible(pending);
    const timeout = setTimeout(() => setVisible(EMPTY), VISIBLE_DURATION_MS);
    return () => clearTimeout(timeout);
    // Re-check whenever gameState changes too, not just awaitingHandoff.
  }, [gameState, awaitingHandoff]);

  return visible;
}
