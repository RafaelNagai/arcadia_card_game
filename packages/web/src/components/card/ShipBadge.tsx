import type { PlayerId, Ship } from '@eltyca/engine';
import { CardFrame } from './CardFrame';
import { PLAYER_COLORS } from '../../game/theme';

export interface ShipBadgeProps {
  ship: Ship;
  owner: PlayerId;
  compact?: boolean;
  selected?: boolean;
}

/** Stand-in art for the Ship until real art is authored. */
const PLACEHOLDER_SHIP_IMAGE = '/ship-01.jpg';

export function ShipBadge({ ship, owner, compact, selected }: ShipBadgeProps) {
  return (
    <CardFrame
      image={PLACEHOLDER_SHIP_IMAGE}
      accentColor={PLAYER_COLORS[owner]}
      directionMarks={ship.shields}
      centerValue={ship.hull}
      name={ship.name}
      tags={[{ text: 'Ship' }]}
      compact={compact}
      selected={selected}
      title={`${ship.name} — hull ${ship.hull} — controlled by ${owner}`}
    />
  );
}
