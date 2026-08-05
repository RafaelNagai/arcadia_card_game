import type { GameContent, GameState, PlayerId, RedactedGameState, Rotation } from '@eltyca/engine';

export type Selection =
  | { mode: 'setup-ship' }
  | { mode: 'setup-cargo' }
  | { mode: 'main-hand'; handIndex: number; rotation: Rotation };

export interface UIState {
  content: GameContent;
  /** A real GameState in hot-seat (never redacted, single shared screen); a RedactedGameState
   *  online (this client's own view, synced from the server — see useOnlineMatch.ts). */
  gameState: GameState | RedactedGameState;
  selection: Selection | null;
  targetCellIdx: number | null;
  /** Speculative result of resolvePlacement for the current selection+target — never committed, just diffed for the capture preview overlay. */
  previewState: GameState | null;
  /** Non-null while the "pass the device" screen should be shown for this player, hiding the board/hand from the other player. Hot-seat only — an online UIState never populates this. */
  awaitingHandoff: PlayerId | null;
  error: string | null;
}

export type Action =
  | { type: 'CONFIRM_HANDOFF' }
  | { type: 'SELECT_SETUP_SHIP' }
  | { type: 'SELECT_SETUP_CARGO' }
  | { type: 'SELECT_HAND_ITEM'; handIndex: number }
  | { type: 'ROTATE' }
  | { type: 'SELECT_CELL'; cellIdx: number }
  | { type: 'CONFIRM_PLACEMENT'; discardCardId?: string }
  | { type: 'CANCEL_SELECTION' }
  | { type: 'DISMISS_ERROR' }
  /** Concede the match — playerId is whoever's currently displayed (LiveMatch already knows
   *  this; the reducer doesn't need to re-derive "current player" the way commitPlacement
   *  does, since surrender applies regardless of whose turn it technically is). Online
   *  intercepts this and sends it to the server instead of mutating locally, same as
   *  CONFIRM_PLACEMENT — see useOnlineMatch.ts. */
  | { type: 'SURRENDER'; playerId: PlayerId }
  /** Dispatched by useOnlineMatch whenever the server pushes a fresh (redacted) game state —
   *  replaces `gameState` wholesale and clears any in-flight local selection/preview, since
   *  those were speculating about a state that's now stale. Never dispatched in hot-seat. */
  | { type: 'SYNC_REMOTE_STATE'; gameState: RedactedGameState };
