import { CardFrame } from '../card/CardFrame';

export interface SchemaCardProps {
  power: number;
  /** Direction indices (0=N clockwise to 7=NW) that carry an arrow. */
  directions: number[];
  color: string;
  label: string;
}

// Fixed dark neutral fill, independent of accentColor — the arrows CardFrame draws are
// painted in accentColor too (see .card-arrow's `background: var(--card-accent)`), so a
// same-color fill would swallow them; real cards get away with a colored accent because
// photo art behind the arrows is never a flat match for it.
const FILL = '#141a2c';
const swatchImage = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="${FILL}"/></svg>`
)}`;

/** A schematic, art-free stand-in for a real Card — same CardFrame visual language (arrows,
 *  power badge) as the real game, but with arrow patterns hand-picked to make one rules example
 *  unambiguous. Tutorial-only; never fed real content, so it can't drift from what a real card
 *  looks like in a way that'd matter, and never needs updating when content.json changes. */
export function SchemaCard({ power, directions, color, label }: SchemaCardProps) {
  const marks = new Array(8).fill(false) as boolean[];
  for (const d of directions) marks[d] = true;

  return <CardFrame image={swatchImage} accentColor={color} directionMarks={marks} centerValue={power} name={label} />;
}
