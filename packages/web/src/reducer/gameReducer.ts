import {
  type GameContent,
  type GameState,
  type HandItem,
  type Player,
  type Rotation,
  type SetupItem,
  isSetupDoneForAll,
  nextSetupPlayer,
  placeInSetup,
  playTurn,
  resolvePlacement,
  revealSetup,
  surrender,
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

    // Hot-seat only in practice — useOnlineMatch intercepts this before it reaches here,
    // same reasoning as commitSetupPlacement/commitMainPlacement's doc comments below.
    case 'SURRENDER':
      return {
        ...state,
        gameState: surrender(state.gameState as GameState, action.playerId),
        selection: null,
        targetCellIdx: null,
        previewState: null,
        error: null,
        awaitingHandoff: null,
      };

    case 'CANCEL_SELECTION':
      return { ...state, selection: null, targetCellIdx: null, previewState: null, error: null };

    case 'DISMISS_ERROR':
      return { ...state, error: null };

    case 'SYNC_REMOTE_STATE':
      return { ...state, gameState: action.gameState, selection: null, targetCellIdx: null, previewState: null, error: null };

    default:
      return state;
  }
}

export type PlacementRequest =
  | { phase: 'setup'; cellIdx: number; item: SetupItem }
  | { phase: 'main'; cellIdx: number; item: HandItem; rotation: Rotation; discardCardId?: string };

/** Derives the same "what am I about to commit" intent commitSetupPlacement/commitMainPlacement
 *  compute internally, without actually calling the engine — useOnlineMatch.ts uses this to
 *  turn a CONFIRM_PLACEMENT into a network request instead of a local mutation, so the two
 *  code paths (hot-seat: mutate locally; online: ask the server) don't have to duplicate the
 *  "which item, which cell, which rotation" derivation. Returns null for whatever reason
 *  commitPlacement would have been a no-op (nothing selected/targeted yet). */
export function buildPlacementRequest(state: UIState, discardCardId?: string): PlacementRequest | null {
  if (!state.selection || state.targetCellIdx === null) return null;

  if (state.gameState.phase === 'setup') {
    if (state.selection.mode === 'setup-ship') return { phase: 'setup', cellIdx: state.targetCellIdx, item: { kind: 'ship' } };
    if (state.selection.mode === 'setup-cargo') return { phase: 'setup', cellIdx: state.targetCellIdx, item: { kind: 'cargo' } };
    return null;
  }

  if (state.selection.mode !== 'main-hand') return null;
  // Same "always the viewer's own, always-real hand" reasoning as computePreview above.
  const player = state.gameState.players.find((p) => p.id === state.gameState.turnPlayer)! as Player;
  const item = player.hand[state.selection.handIndex];
  if (!item) return null;
  return { phase: 'main', cellIdx: state.targetCellIdx, item, rotation: state.selection.rotation, discardCardId };
}

function computePreview(state: UIState, selection: Selection, cellIdx: number): GameState | null {
  if (selection.mode !== 'main-hand') return null;
  // SELECT_HAND_ITEM only ever fires from the viewer's own rendered hand (LiveMatch only
  // wires that up when it's genuinely this player's turn), so this is always real data —
  // never a redacted opponent view — despite gameState's widened type. resolvePlacement
  // stays strictly typed on purpose; it's core engine logic that shouldn't need to know
  // about the network-only concept of redaction.
  const player = state.gameState.players.find((p) => p.id === state.gameState.turnPlayer)! as Player;
  const item = player.hand[selection.handIndex];
  if (!item) return null;
  try {
    return resolvePlacement(state.gameState as GameState, state.content, player.id, cellIdx, item, selection.rotation);
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

/** Hot-seat only in practice: useOnlineMatch's dispatch wrapper intercepts CONFIRM_PLACEMENT
 *  and sends it to the server instead of ever letting it reach here (see useOnlineMatch.ts),
 *  since the server is the sole authority for an online match. This still has to satisfy
 *  UIState's widened gameState type, though, since gameReducer itself is shared by both
 *  modes — hence the casts below, not because redacted data could genuinely reach here. */
function commitSetupPlacement(state: UIState, selection: Selection, cellIdx: number): UIState {
  const activePlayerId = state.awaitingHandoff ?? nextSetupPlayer(state.gameState as GameState);
  if (!activePlayerId) return state;

  let item: SetupItem;
  if (selection.mode === 'setup-ship') {
    item = { kind: 'ship' };
  } else if (selection.mode === 'setup-cargo') {
    item = { kind: 'cargo' };
  } else {
    throw new Error('Selecione o Navio ou uma ficha de Carga primeiro');
  }

  let nextGameState = placeInSetup(state.gameState as GameState, activePlayerId, cellIdx, item);

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

/** Hot-seat only in practice — see commitSetupPlacement's doc comment; same reasoning. */
function commitMainPlacement(
  state: UIState,
  selection: Selection,
  cellIdx: number,
  discardCardId?: string
): UIState {
  if (selection.mode !== 'main-hand') return state;
  const player = state.gameState.players.find((p) => p.id === state.gameState.turnPlayer)! as Player;
  const item = player.hand[selection.handIndex];
  if (!item) throw new Error('O item selecionado não está mais na mão');

  const nextGameState = playTurn(
    state.gameState as GameState,
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
