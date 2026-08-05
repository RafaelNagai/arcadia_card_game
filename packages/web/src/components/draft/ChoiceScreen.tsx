import type { Dispatch } from 'react';
import type { DraftState, GameContent } from '@eltyca/engine';
import { CaptainBadge } from '../card/CaptainBadge';
import { ShipBadge } from '../card/ShipBadge';
import type { DraftAction } from '../../reducer/draftTypes';
import { nextChooser } from '../../game/draftProgress';

export interface ChoiceScreenProps {
  content: GameContent;
  draft: DraftState;
  dispatch: Dispatch<DraftAction>;
}

/** Captain/Ship pick, before the Porto draft itself. Public information the whole way — per
 *  regras_v0.9.md both picks are revealed immediately — so unlike hidden setup this is one
 *  shared screen, no device handoff, just whichever player still needs to pick going next. */
export function ChoiceScreen({ content, draft, dispatch }: ChoiceScreenProps) {
  const chooser = nextChooser(draft);
  if (!chooser) return null;
  const player = draft.players.find((p) => p.id === chooser)!;

  return (
    <div className="start-screen choice-screen">
      <div className="start-hero">
        <h1>Escolha seu Capitão &amp; Navio</h1>
        <p className="start-tagline">{chooser} escolhe</p>
      </div>

      <section>
        <h2>Capitão</h2>
        {player.captainId ? (
          <div className="choice-confirmed">
            <CaptainBadge captain={content.captains[player.captainId]} owner={chooser} />
          </div>
        ) : (
          <div className="choice-grid">
            {draft.availableCaptainIds.map((id) => (
              <button
                key={id}
                type="button"
                className="choice-card"
                onClick={() => dispatch({ type: 'PICK_CAPTAIN', playerId: chooser, captainId: id })}
              >
                <CaptainBadge captain={content.captains[id]} owner={chooser} />
              </button>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2>Navio</h2>
        {player.shipId ? (
          <div className="choice-confirmed">
            <ShipBadge ship={content.ships[player.shipId]} owner={chooser} />
          </div>
        ) : (
          <div className="choice-grid">
            {draft.availableShipIds.map((id) => (
              <button
                key={id}
                type="button"
                className="choice-card"
                onClick={() => dispatch({ type: 'PICK_SHIP', playerId: chooser, shipId: id })}
              >
                <ShipBadge ship={content.ships[id]} owner={chooser} />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
