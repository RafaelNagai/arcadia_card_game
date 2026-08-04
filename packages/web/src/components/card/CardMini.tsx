import type { PointerEvent } from 'react';
import { effectiveArrows, type Card, type PlayerId, type Rotation } from '@eltyca/engine';
import { EightAngleIndicator } from './EightAngleIndicator';
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

export function CardMini({ card, rotation, owner, displayPower, selected, compact, onClick, onPointerDown }: CardMiniProps) {
  const arrows = effectiveArrows(card.arrows, rotation);
  const elementColor = ELEMENT_COLORS[card.element];
  const ownerColor = owner ? PLAYER_COLORS[owner] : undefined;
  const power = displayPower ?? card.power;
  const modified = power !== card.power;

  const title = `${card.name} — power ${power}${modified ? ` (base ${card.power})` : ''} — ${card.type}/${card.element}${card.effect ? ` — ${card.effect.description}` : ''}`;

  const body = (
    <div
      className={`card-mini${compact ? ' compact' : ''}${selected ? ' selected' : ''}`}
      style={{ borderColor: ownerColor ?? elementColor }}
      title={onClick ? undefined : title}
    >
      {!compact && <div className="card-mini-name">{card.name}</div>}
      <EightAngleIndicator
        active={arrows}
        activeColor={elementColor}
        center={<span className={`card-mini-power${modified ? ' modified' : ''}`}>{power}</span>}
        size={compact ? 44 : 64}
      />
      {!compact && (
        <div className="card-mini-tags">
          <span style={{ color: elementColor }}>{card.element}</span>
          <span>{card.type}</span>
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
