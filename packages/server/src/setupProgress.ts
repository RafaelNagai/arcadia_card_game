import type { GameState, PlayerId } from '@eltyca/engine';
import { effectiveHiddenCargoTarget, hiddenItemsPlacedCount, isShipPlaced, nextSetupPlayer } from '@eltyca/engine';
import type { SetupProgressSummary } from './protocol';

const PLAYER_IDS: PlayerId[] = ['P1', 'P2'];

/** Computed server-side, against the real (unredacted) GameState — see protocol.ts's
 *  SetupProgressSummary doc comment for why a client can't safely do this itself. */
export function summarizeSetupProgress(game: GameState): SetupProgressSummary {
  const perPlayer = {} as SetupProgressSummary['perPlayer'];
  for (const id of PLAYER_IDS) {
    perPlayer[id] = {
      shipPlaced: isShipPlaced(game, id),
      hiddenPlaced: hiddenItemsPlacedCount(game, id),
      hiddenNeeded: effectiveHiddenCargoTarget(game, id),
    };
  }
  return { activePlayer: nextSetupPlayer(game), perPlayer };
}
