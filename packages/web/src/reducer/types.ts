import type { GameContent, GameState, PlayerId, Rotation } from '@eltyca/engine';

export type Selection =
  | { mode: 'setup-ship' }
  | { mode: 'setup-cargo' }
  | { mode: 'main-hand'; handIndex: number; rotation: Rotation };

export interface UIState {
  content: GameContent;
  gameState: GameState;
  selection: Selection | null;
  targetCellIdx: number | null;
  /** Speculative result of resolvePlacement for the current selection+target — never committed, just diffed for the capture preview overlay. */
  previewState: GameState | null;
  /** Non-null while the "pass the device" screen should be shown for this player, hiding the board/hand from the other player. */
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
  | { type: 'DISMISS_ERROR' };
