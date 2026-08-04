import {
  type GameContent,
  type GameState,
  type Rotation,
  type SetupItem,
  isSetupDoneForAll,
  nextSetupPlayer,
  placeInSetup,
  playTurn,
  resolvePlacement,
  revealSetup,
} from '@eltyca/engine';
import type { Action, Selection, UIState } from './types';

export function createInitialUIState(content: GameContent, gameState: GameState): UIState {
  return {
    content,
    gameState,
    selection: null,
    targetCellIdx: null,
    previewState: null,
    awaitingHandoff: nextSetupPlayer(gameState),
    error: null,
  };
}

export function gameReducer(state: UIState, action: Action): UIState {
  switch (action.type) {
    case 'CONFIRM_HANDOFF':
      if (!state.awaitingHandoff) return state;
      return { ...state, awaitingHandoff: null, selection: null, targetCellIdx: null, previewState: null, error: null };

    case 'SELECT_SETUP_SHIP':
      if (state.gameState.phase !== 'setup') return state;
      return { ...state, selection: { mode: 'setup-ship' }, targetCellIdx: null, error: null };

    case 'SELECT_SETUP_CARGO':
      if (state.gameState.phase !== 'setup') return state;
      return { ...state, selection: { mode: 'setup-cargo' }, targetCellIdx: null, error: null };

    case 'SELECT_HAND_ITEM':
      if (state.gameState.phase !== 'main') return state;
      return {
        ...state,
        selection: { mode: 'main-hand', handIndex: action.handIndex, rotation: 0 },
        targetCellIdx: null,
        previewState: null,
        error: null,
      };

    case 'ROTATE': {
      if (!state.selection || state.selection.mode !== 'main-hand') return state;
      const rotation = ((state.selection.rotation + 1) % 4) as Rotation;
      const selection: Selection = { ...state.selection, rotation };
      const previewState =
        state.targetCellIdx !== null ? computePreview(state, selection, state.targetCellIdx) : null;
      return { ...state, selection, previewState };
    }

    case 'SELECT_CELL': {
      if (!state.selection) return state;
      if (state.gameState.phase === 'setup') {
        return { ...state, targetCellIdx: action.cellIdx, error: null };
      }
      const previewState = computePreview(state, state.selection, action.cellIdx);
      return { ...state, targetCellIdx: action.cellIdx, previewState, error: null };
    }

    case 'CONFIRM_PLACEMENT':
      return commitPlacement(state, action.discardCardId);

    case 'CANCEL_SELECTION':
      return { ...state, selection: null, targetCellIdx: null, previewState: null, error: null };

    case 'DISMISS_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
}

function computePreview(state: UIState, selection: Selection, cellIdx: number): GameState | null {
  if (selection.mode !== 'main-hand') return null;
  const player = state.gameState.players.find((p) => p.id === state.gameState.turnPlayer)!;
  const item = player.hand[selection.handIndex];
  if (!item) return null;
  try {
    return resolvePlacement(state.gameState, state.content, player.id, cellIdx, item, selection.rotation);
  } catch {
    return null;
  }
}

function commitPlacement(state: UIState, discardCardId?: string): UIState {
  if (!state.selection || state.targetCellIdx === null) return state;

  try {
    if (state.gameState.phase === 'setup') {
      return commitSetupPlacement(state, state.selection, state.targetCellIdx);
    }
    return commitMainPlacement(state, state.selection, state.targetCellIdx, discardCardId);
  } catch (err) {
    return { ...state, error: err instanceof Error ? err.message : String(err) };
  }
}

function commitSetupPlacement(state: UIState, selection: Selection, cellIdx: number): UIState {
  const activePlayerId = state.awaitingHandoff ?? nextSetupPlayer(state.gameState);
  if (!activePlayerId) return state;

  let item: SetupItem;
  if (selection.mode === 'setup-ship') {
    item = { kind: 'ship' };
  } else if (selection.mode === 'setup-cargo') {
    item = { kind: 'cargo' };
  } else {
    throw new Error('Select the Ship or a Cargo token first');
  }

  let nextGameState = placeInSetup(state.gameState, activePlayerId, cellIdx, item);

  const base: UIState = {
    ...state,
    gameState: nextGameState,
    selection: null,
    targetCellIdx: null,
    previewState: null,
    error: null,
  };

  if (isSetupDoneForAll(nextGameState)) {
    nextGameState = revealSetup(nextGameState);
    return { ...base, gameState: nextGameState, awaitingHandoff: nextGameState.turnPlayer };
  }

  // Alternate one piece at a time ("em ordem, revezando" per regras_v0.9.md) — hand off
  // after every placement unless the only player left to act is the one who just went
  // (the other player already finished their own setup, so there's no one to alternate with).
  const upcoming = nextSetupPlayer(nextGameState)!;
  return { ...base, awaitingHandoff: upcoming === activePlayerId ? null : upcoming };
}

function commitMainPlacement(
  state: UIState,
  selection: Selection,
  cellIdx: number,
  discardCardId?: string
): UIState {
  if (selection.mode !== 'main-hand') return state;
  const player = state.gameState.players.find((p) => p.id === state.gameState.turnPlayer)!;
  const item = player.hand[selection.handIndex];
  if (!item) throw new Error('Selected item is no longer in hand');

  const nextGameState = playTurn(
    state.gameState,
    state.content,
    player.id,
    cellIdx,
    item,
    selection.rotation,
    discardCardId ? { discardCardId } : undefined
  );

  return {
    ...state,
    gameState: nextGameState,
    selection: null,
    targetCellIdx: null,
    previewState: null,
    error: null,
    awaitingHandoff: nextGameState.phase === 'end' ? null : nextGameState.turnPlayer,
  };
}
