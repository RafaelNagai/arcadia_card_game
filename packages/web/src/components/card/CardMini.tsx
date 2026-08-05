import type { PointerEvent } from 'react';
import { effectiveArrows, type Card, type PlayerId, type Rotation } from '@eltyca/engine';
import { CardFrame } from './CardFrame';
import { ELEMENT_COLORS, ELEMENT_LABELS, PLAYER_COLORS, TYPE_LABELS } from '../../game/theme';

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

  const title = `${card.name} — poder ${power}${modified ? ` (base ${card.power})` : ''} — ${TYPE_LABELS[card.type]}/${ELEMENT_LABELS[card.element]}${card.effect ? ` — ${card.effect.description}` : ''}`;

  const body = (
    <CardFrame
      image={card.imageUrl}
      accentColor={ownerColor ?? elementColor}
      directionMarks={arrows}
      centerValue={power}
      centerValueModified={modified}
      name={card.name}
      tags={[{ text: ELEMENT_LABELS[card.element], color: elementColor }, { text: TYPE_LABELS[card.type] }]}
      compact={compact}
      selected={selected}
      title={onClick ? undefined : title}
    />
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
