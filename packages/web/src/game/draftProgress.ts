import type { DraftState, PlayerId } from '@eltyca/engine';

/** Who should be prompted to choose next — whoever hasn't finished picking both a Captain
 *  and a Ship yet, in player order. Mirrors setupProgress.ts's nextSetupPlayer in spirit, but
 *  the choice stage has no engine-enforced turn order (see rules/draft.ts): the engine only
 *  rejects double-picks/conflicts, not out-of-order picks. This purely drives which player's
 *  name the ChoiceScreen shows next. */
export function nextChooser(draft: DraftState): PlayerId | null {
  const pending = draft.players.find((p) => p.captainId === null || p.shipId === null);
  return pending?.id ?? null;
}
