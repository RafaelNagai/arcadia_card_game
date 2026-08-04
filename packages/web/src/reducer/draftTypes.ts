import type { DraftState, GameContent, PlayerId } from '@eltyca/engine';

export interface DraftUIState {
  content: GameContent;
  draft: DraftState;
  error: string | null;
}

export type DraftAction =
  | { type: 'PICK_CAPTAIN'; playerId: PlayerId; captainId: string }
  | { type: 'PICK_SHIP'; playerId: PlayerId; shipId: string }
  | { type: 'PICK_CARD'; playerId: PlayerId; cardId: string }
  | { type: 'DISMISS_ERROR' };
