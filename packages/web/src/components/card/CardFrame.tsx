import type { CSSProperties, ReactNode } from 'react';

/** Direction order matches the engine's arrow/shield encoding: 0=N, clockwise to 7=NW. */
export const DIRECTIONS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

export interface CardFrameTag {
  text: string;
  color?: string;
}

export interface CardFrameProps {
  image: string;
  accentColor: string;
  /** length-8 boolean array in engine direction order — a card's arrows or a Ship's shields. */
  directionMarks: boolean[];
  centerValue: ReactNode;
  centerValueModified?: boolean;
  /** Only rendered when compact is false. */
  name?: string;
  tags?: CardFrameTag[];
  compact?: boolean;
  selected?: boolean;
  title?: string;
}

/** Shared square, full-bleed-image visual frame — used by both CardMini (Cards) and ShipBadge
 *  (the Ship), which render identically now that regular cards and the Ship both got the
 *  same "photo card" redesign. Domain mapping (Card vs Ship data → these generic props)
 *  stays in each caller; this only owns the shared markup/CSS classes. */
export function CardFrame({
  image,
  accentColor,
  directionMarks,
  centerValue,
  centerValueModified,
  name,
  tags,
  compact,
  selected,
  title,
}: CardFrameProps) {
  return (
    <div
      className={`card-mini${compact ? ' compact' : ''}${selected ? ' selected' : ''}`}
      style={{ '--card-accent': accentColor, borderColor: accentColor } as CSSProperties}
      title={title}
    >
      <img className="card-mini-img" src={image} alt="" />

      <div className="card-mini-arrows">
        {directionMarks.map(
          (active, d) => active && <span key={d} className={`card-arrow card-arrow-${DIRECTIONS[d]}`} />
        )}
      </div>

      <div className="card-mini-power-badge">
        <span className={`card-mini-power${centerValueModified ? ' modified' : ''}`}>{centerValue}</span>
      </div>

      {!compact && name && (
        <div className="card-mini-info">
          <div className="card-mini-name">{name}</div>
          {tags && (
            <div className="card-mini-tags">
              {tags.map((tag) => (
                <span key={tag.text} style={tag.color ? { color: tag.color } : undefined}>
                  {tag.text}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
