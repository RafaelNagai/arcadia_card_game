import { useEffect, useState } from 'react';
import type { Score } from '@eltyca/engine';

export interface ScoreCountingScreenProps {
  finalScore: Score[];
  onDone: () => void;
}

const COUNT_DURATION_MS = 1200;
const PAUSE_AFTER_MS = 600;

/** Ticks each player's total up from 0 to their real score, then auto-advances — no
 *  click needed. Linear progress is enough for a v1 tally; a "skip" affordance would be
 *  a cheap follow-up if this ever feels slow. */
export function ScoreCountingScreen({ finalScore, onDone }: ScoreCountingScreenProps) {
  const [displayed, setDisplayed] = useState<Record<string, number>>(() =>
    Object.fromEntries(finalScore.map((s) => [s.player, 0]))
  );

  useEffect(() => {
    let rafId: number;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / COUNT_DURATION_MS);
      setDisplayed(Object.fromEntries(finalScore.map((s) => [s.player, Math.round(s.total * progress)])));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        timeoutId = setTimeout(onDone, PAUSE_AFTER_MS);
      }
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      if (timeoutId) clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once for this screen's lifetime
  }, []);

  return (
    <div className="app app-end">
      <h1>Tallying the score…</h1>
      <div className="scores">
        {finalScore.map((score) => (
          <div key={score.player} className="score-card">
            <h2>{score.player}</h2>
            <p className="score-total counting">{displayed[score.player] ?? 0}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
