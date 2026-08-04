import type { Dispatch } from 'react';
import type { DraftState, GameContent } from '@eltyca/engine';
import { CardMini } from '../card/CardMini';
import type { DraftAction } from '../../reducer/draftTypes';

export interface DraftScreenProps {
  content: GameContent;
  draft: DraftState;
  dispatch: Dispatch<DraftAction>;
}

/** The Porto draft's card-picking round: a shared, face-up pool (also public info, so — like
 *  ChoiceScreen — no device handoff), one click per pick. draft.currentPicker (engine-owned,
 *  unlike the choice stage) is who's allowed to click right now. */
export function DraftScreen({ content, draft, dispatch }: DraftScreenProps) {
  const picker = draft.currentPicker;
  if (!picker) return null;

  return (
    <div className="start-screen draft-screen">
      <div className="start-hero">
        <h1>Porto Draft</h1>
        <p className="start-tagline">
          Round {draft.round}/{draft.totalRounds} · {picker} to pick
        </p>
      </div>

      <div className="draft-picked-counts">
        {draft.players.map((p) => (
          <span key={p.id}>
            {p.id}: {p.pickedCardIds.length} picked
          </span>
        ))}
      </div>

      <div className="choice-grid">
        {/* Keyed by index, not cardId — the pool intentionally reuses common card ids within
            the same revealed round (see rules/draft.ts), so cardId alone isn't unique here.
            Index is safe: cards are only ever removed from this array, never reordered. */}
        {draft.tableCards.map((cardId, idx) => (
          <CardMini
            key={idx}
            card={content.cards[cardId]}
            rotation={0}
            onClick={() => dispatch({ type: 'PICK_CARD', playerId: picker, cardId })}
          />
        ))}
      </div>
    </div>
  );
}
