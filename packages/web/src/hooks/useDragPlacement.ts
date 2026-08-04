import { useCallback, useEffect, useRef, useState, type Dispatch, type PointerEvent as ReactPointerEvent } from 'react';
import type { GameState } from '@eltyca/engine';
import type { Action, Selection } from '../reducer/types';
import { isLegalDropCell } from '../game/dropTargets';

// Safari's trackpad pinch-to-zoom doesn't go through `wheel` (unlike Chrome/Firefox, where
// it's synthesized as wheel + ctrlKey and already blocked by the wheel handler's
// preventDefault below) — it fires these non-standard gesture events instead. Without
// blocking them too, an accidental pinch while holding a drag zooms the whole page
// (board included) continuously for as long as the drag lasts.
declare global {
  interface WindowEventMap {
    gesturestart: Event;
    gesturechange: Event;
    gestureend: Event;
  }
}

const CLICK_MOVEMENT_THRESHOLD_PX = 6;
const WHEEL_ROTATE_THRESHOLD = 60;

export interface GhostPosition {
  x: number;
  y: number;
}

export interface UseDragPlacementResult {
  ghostPos: GhostPosition | null;
  /** Call from a draggable source's onPointerDown. Dispatches `selectAction` immediately
   *  (same as a click would) and starts tracking the gesture to decide, on release,
   *  whether it was a drag (confirm/cancel a drop) or just a click (leave selection alone). */
  startDrag: (event: ReactPointerEvent, selectAction: Action) => void;
}

/**
 * Drag-and-drop is layered on top of the existing click flow, not a replacement for it —
 * the reducer already models "what's selected / what cell is targeted / what the preview
 * looks like", so this hook just drives those same actions (SELECT_CELL, ROTATE,
 * CONFIRM_PLACEMENT, CANCEL_SELECTION) from pointer/wheel/keyboard gestures instead of
 * clicks. A plain click (pointerdown+pointerup with negligible movement) intentionally
 * does nothing extra here, so it doesn't self-cancel the selection the click just made.
 */
export function useDragPlacement(
  dispatch: Dispatch<Action>,
  gameState: GameState,
  selection: Selection | null
): UseDragPlacementResult {
  const [isDragging, setIsDragging] = useState(false);
  const [ghostPos, setGhostPos] = useState<GhostPosition | null>(null);

  const pointerIdRef = useRef<number | null>(null);
  const movedRef = useRef(0);
  const hoveredCellRef = useRef<number | null>(null);
  const wheelAccumRef = useRef(0);

  // Long-lived window listeners must always see the latest values, never a stale
  // closure from the render that started the drag.
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const selectionRef = useRef(selection);
  selectionRef.current = selection;

  const endDrag = useCallback(() => {
    pointerIdRef.current = null;
    hoveredCellRef.current = null;
    wheelAccumRef.current = 0;
    setIsDragging(false);
    setGhostPos(null);
  }, []);

  const cancelDrag = useCallback(() => {
    endDrag();
    dispatch({ type: 'CANCEL_SELECTION' });
  }, [dispatch, endDrag]);

  const startDrag = useCallback(
    (event: ReactPointerEvent, selectAction: Action) => {
      pointerIdRef.current = event.pointerId;
      movedRef.current = 0;
      hoveredCellRef.current = null;
      wheelAccumRef.current = 0;
      (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
      dispatch(selectAction);
      setGhostPos({ x: event.clientX, y: event.clientY });
      setIsDragging(true);
    },
    [dispatch]
  );

  useEffect(() => {
    if (!isDragging) return;

    function decideDrop() {
      const moved = movedRef.current > CLICK_MOVEMENT_THRESHOLD_PX;
      const hoveredCell = hoveredCellRef.current;
      endDrag();

      if (!moved) return; // plain click — leave selection/target exactly as they already are

      const currentState = gameStateRef.current;
      const currentSelection = selectionRef.current;

      if (hoveredCell === null || !isLegalDropCell(currentState, currentSelection, hoveredCell)) {
        dispatch({ type: 'CANCEL_SELECTION' });
        return;
      }

      if (currentState.phase === 'setup') {
        dispatch({ type: 'CONFIRM_PLACEMENT' });
        return;
      }

      if (currentSelection?.mode === 'main-hand') {
        const activePlayer = currentState.players.find((p) => p.id === currentState.turnPlayer);
        const item = activePlayer?.hand[currentSelection.handIndex];
        if (item?.kind === 'card') {
          dispatch({ type: 'CONFIRM_PLACEMENT' });
        }
        // Cargo: targetCellIdx is already set via the hover-tracking SELECT_CELL below —
        // leave it there so Hand.tsx's existing discard-picker takes over from here.
      }
    }

    function onPointerMove(event: PointerEvent) {
      if (event.pointerId !== pointerIdRef.current) return;
      movedRef.current += Math.abs(event.movementX) + Math.abs(event.movementY);
      setGhostPos({ x: event.clientX, y: event.clientY });

      const elementUnderPointer = document.elementFromPoint(event.clientX, event.clientY);
      const cellElement = elementUnderPointer?.closest('[data-cell-idx]') as HTMLElement | null;
      const cellIdx = cellElement ? Number(cellElement.dataset.cellIdx) : null;
      if (cellIdx !== hoveredCellRef.current) {
        hoveredCellRef.current = cellIdx;
        if (cellIdx !== null) dispatch({ type: 'SELECT_CELL', cellIdx });
      }
    }

    function onWheel(event: WheelEvent) {
      event.preventDefault();
      wheelAccumRef.current += event.deltaY;
      if (Math.abs(wheelAccumRef.current) >= WHEEL_ROTATE_THRESHOLD) {
        wheelAccumRef.current = 0;
        dispatch({ type: 'ROTATE' });
      }
    }

    function onPointerUp(event: PointerEvent) {
      if (event.pointerId !== pointerIdRef.current) return;
      decideDrop();
    }

    function onPointerCancel(event: PointerEvent) {
      if (event.pointerId !== pointerIdRef.current) return;
      cancelDrag();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') cancelDrag();
    }

    function onGesture(event: Event) {
      event.preventDefault();
    }

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('blur', cancelDrag);
    window.addEventListener('gesturestart', onGesture);
    window.addEventListener('gesturechange', onGesture);
    window.addEventListener('gestureend', onGesture);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('blur', cancelDrag);
      window.removeEventListener('gesturestart', onGesture);
      window.removeEventListener('gesturechange', onGesture);
      window.removeEventListener('gestureend', onGesture);
    };
  }, [isDragging, dispatch, endDrag, cancelDrag]);

  return { ghostPos, startDrag };
}
