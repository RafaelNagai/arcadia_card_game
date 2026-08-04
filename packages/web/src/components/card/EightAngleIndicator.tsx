import type { ReactNode } from 'react';

const POSITIONS: { row: number; col: number }[] = [
  { row: 1, col: 2 }, // 0 N
  { row: 1, col: 3 }, // 1 NE
  { row: 2, col: 3 }, // 2 E
  { row: 3, col: 3 }, // 3 SE
  { row: 3, col: 2 }, // 4 S
  { row: 3, col: 1 }, // 5 SW
  { row: 2, col: 1 }, // 6 W
  { row: 1, col: 1 }, // 7 NW
];

export interface EightAngleIndicatorProps {
  /** length-8 boolean array in engine direction order (0=N, clockwise) */
  active: boolean[];
  center?: ReactNode;
  activeColor?: string;
  size?: number;
}

/** Generic 8-position indicator, reused for both a card's arrows and a Ship's shields. */
export function EightAngleIndicator({ active, center, activeColor, size = 56 }: EightAngleIndicatorProps) {
  return (
    <div className="eight-angle-grid" style={{ width: size, height: size }}>
      {active.map((isActive, d) => (
        <span
          key={d}
          className={`eight-angle-dot${isActive ? ' active' : ''}`}
          style={{
            gridRow: POSITIONS[d].row,
            gridColumn: POSITIONS[d].col,
            background: isActive ? (activeColor ?? 'var(--accent, #4ade80)') : undefined,
          }}
        />
      ))}
      <span className="eight-angle-center" style={{ gridRow: 2, gridColumn: 2 }}>
        {center}
      </span>
    </div>
  );
}
