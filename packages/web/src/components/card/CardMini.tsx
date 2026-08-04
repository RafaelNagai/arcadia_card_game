import type { CSSProperties, PointerEvent } from 'react';
import { effectiveArrows, type Card, type PlayerId, type Rotation } from '@eltyca/engine';
import { ELEMENT_COLORS, PLAYER_COLORS } from '../../game/theme';

export interface CardMiniProps {
  card: Card;
  rotation: Rotation;
  owner?: PlayerId;
  /** Power to display in the center — pass the engine's effectivePower() result to show modifiers baked in; defaults to the printed base power. */
  displayPower?: number;
  selected?: boolean;
  compact?: boolean;
  onClick?: () => void;
  /** Starts a drag gesture — layered alongside onClick, not a replacement for it. */
  onPointerDown?: (event: PointerEvent<HTMLButtonElement>) => void;
}

/** Direction order matches the engine's arrow encoding: 0=N, clockwise to 7=NW. */
const DIRECTIONS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

/** Stand-in art for every card until per-card images are authored. */
const PLACEHOLDER_CARD_IMAGE = '/creature-01.jpg';

export function CardMini({ card, rotation, owner, displayPower, selected, compact, onClick, onPointerDown }: CardMiniProps) {
  const arrows = effectiveArrows(card.arrows, rotation);
  const elementColor = ELEMENT_COLORS[card.element];
  const ownerColor = owner ? PLAYER_COLORS[owner] : undefined;
  const accent = ownerColor ?? elementColor;
  const power = displayPower ?? card.power;
  const modified = power !== card.power;

  const title = `${card.name} — power ${power}${modified ? ` (base ${card.power})` : ''} — ${card.type}/${card.element}${card.effect ? ` — ${card.effect.description}` : ''}`;

  const body = (
    <div
      className={`card-mini${compact ? ' compact' : ''}${selected ? ' selected' : ''}`}
      style={{ '--card-accent': accent, borderColor: accent } as CSSProperties}
      title={onClick ? undefined : title}
    >
      <img className="card-mini-img" src={PLACEHOLDER_CARD_IMAGE} alt="" />

      <div className="card-mini-arrows">
        {arrows.map(
          (active, d) => active && <span key={d} className={`card-arrow card-arrow-${DIRECTIONS[d]}`} />
        )}
      </div>

      <div className="card-mini-power-badge">
        <span className={`card-mini-power${modified ? ' modified' : ''}`}>{power}</span>
      </div>

      {!compact && (
        <div className="card-mini-info">
          <div className="card-mini-name">{card.name}</div>
          <div className="card-mini-tags">
            <span style={{ color: elementColor }}>{card.element}</span>
            <span>{card.type}</span>
          </div>
        </div>
      )}
    </div>
  );

  if (!onClick) return body;

  return (
    <button
      type="button"
      className="card-mini-button"
      onClick={onClick}
      onPointerDown={onPointerDown}
      title={title}
    >
      {body}
    </button>
  );
}
