import type { PlayerId, Ship } from '@eltyca/engine';
import { EightAngleIndicator } from './EightAngleIndicator';
import { PLAYER_COLORS } from '../../game/theme';

export interface ShipBadgeProps {
  ship: Ship;
  owner: PlayerId;
  compact?: boolean;
}

export function ShipBadge({ ship, owner, compact }: ShipBadgeProps) {
  return (
    <div
      className={`ship-badge${compact ? ' compact' : ''}`}
      style={{ borderColor: PLAYER_COLORS[owner] }}
      title={`${ship.name} — hull ${ship.hull} — controlled by ${owner}`}
    >
      {!compact && <div className="ship-badge-name">{ship.name}</div>}
      {compact && <div className="ship-badge-tag">SHIP</div>}
      <EightAngleIndicator
        active={ship.shields}
        activeColor={PLAYER_COLORS[owner]}
        center={<span className="ship-badge-hull">{ship.hull}</span>}
        size={compact ? 44 : 64}
      />
    </div>
  );
}
