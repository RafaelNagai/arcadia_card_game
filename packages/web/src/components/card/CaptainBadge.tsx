import type { Captain, PlayerId } from '@eltyca/engine';
import { CardFrame } from './CardFrame';
import { PLAYER_COLORS } from '../../game/theme';

export interface CaptainBadgeProps {
  captain: Captain;
  owner: PlayerId;
}

/** Captain has no directional stats (no arrows/shields), unlike Card and Ship — the frame
 *  just renders with no edge marks, which is a correct, not a degraded, presentation. */
const NO_DIRECTION_MARKS = new Array(8).fill(false);

export function CaptainBadge({ captain, owner }: CaptainBadgeProps) {
  return (
    <CardFrame
      image={captain.imageUrl}
      accentColor={PLAYER_COLORS[owner]}
      directionMarks={NO_DIRECTION_MARKS}
      centerValue={captain.cargoSlots}
      name={captain.name}
      tags={[{ text: 'Capitão' }]}
      title={`${captain.name} — capacidade de carga ${captain.cargoSlots}`}
    />
  );
}
