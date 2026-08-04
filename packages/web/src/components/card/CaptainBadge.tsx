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

/** Stand-in art, one per captain (unlike the single shared placeholder for cards/Ship,
 *  since only two captains exist and each already has its own example image). */
const CAPTAIN_IMAGES: Record<string, string> = {
  'captain-loud': '/captain-02.jpg',
  'captain-broker': '/captain-01.jpg',
};
const DEFAULT_CAPTAIN_IMAGE = '/captain-01.jpg';

export function CaptainBadge({ captain, owner }: CaptainBadgeProps) {
  return (
    <CardFrame
      image={CAPTAIN_IMAGES[captain.id] ?? DEFAULT_CAPTAIN_IMAGE}
      accentColor={PLAYER_COLORS[owner]}
      directionMarks={NO_DIRECTION_MARKS}
      centerValue={captain.cargoSlots}
      name={captain.name}
      tags={[{ text: 'Captain' }]}
      title={`${captain.name} — cargo capacity ${captain.cargoSlots}`}
    />
  );
}
