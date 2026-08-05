import type { PlayerId, Ship } from '@eltyca/engine';
import { CardFrame } from './CardFrame';
import { PLAYER_COLORS } from '../../game/theme';

export interface ShipBadgeProps {
  ship: Ship;
  owner: PlayerId;
  compact?: boolean;
  selected?: boolean;
}

export function ShipBadge({ ship, owner, compact, selected }: ShipBadgeProps) {
  return (
    <CardFrame
      image={ship.imageUrl}
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
