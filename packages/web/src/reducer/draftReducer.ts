import type { DraftState, GameContent } from '@eltyca/engine';
import { pickCaptain, pickShip, pickCard } from '@eltyca/engine';
import type { DraftAction, DraftUIState } from './draftTypes';

export function createInitialDraftUIState(content: GameContent, draft: DraftState): DraftUIState {
  return { content, draft, error: null };
}

export function draftReducer(state: DraftUIState, action: DraftAction): DraftUIState {
  switch (action.type) {
    case 'PICK_CAPTAIN':
      return runEngineAction(state, () => pickCaptain(state.draft, action.playerId, action.captainId));
    case 'PICK_SHIP':
      return runEngineAction(state, () => pickShip(state.draft, action.playerId, action.shipId));
    case 'PICK_CARD':
      return runEngineAction(state, () => pickCard(state.draft, action.playerId, action.cardId));
    case 'DISMISS_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

function runEngineAction(state: DraftUIState, run: () => DraftState): DraftUIState {
  try {
    return { ...state, draft: run(), error: null };
  } catch (err) {
    return { ...state, error: err instanceof Error ? err.message : String(err) };
  }
}
