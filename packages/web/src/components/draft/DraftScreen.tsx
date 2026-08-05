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
  const picked = draft.players.find((p) => p.id === picker)!.pickedCardIds;

  return (
    <div className="start-screen draft-screen">
      <aside className="draft-deck-panel">
        <h2>
          Baralho de {picker} ({picked.length})
        </h2>
        {picked.length === 0 ? (
          <p className="draft-deck-empty">Nenhuma carta escolhida ainda.</p>
        ) : (
          <div className="draft-deck-list">
            {/* Keyed by index — a drafted deck can end up with duplicate card ids (see the
                pool comment below), same reasoning as the table below. */}
            {picked.map((cardId, idx) => (
              <CardMini key={idx} card={content.cards[cardId]} rotation={0} compact />
            ))}
          </div>
        )}
      </aside>

      <div className="draft-main">
        <div className="start-hero">
          <h1>Draft do Porto</h1>
          <p className="start-tagline">
            Rodada {draft.round}/{draft.totalRounds} · {picker} escolhe
          </p>
        </div>

        <div className="draft-picked-counts">
          {draft.players.map((p) => (
            <span key={p.id}>
              {p.id}: {p.pickedCardIds.length} escolhida(s)
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
    </div>
  );
}
