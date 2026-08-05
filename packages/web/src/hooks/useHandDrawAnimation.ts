import { useEffect, useRef, useState } from 'react';
import type { HandItem, PlayerId, RedactedHandItem } from '@eltyca/engine';

/** Per-card stagger between successive draw-in animations — also used by Hand.tsx to set animationDelay. */
export const HAND_DRAW_STAGGER_MS = 90;
/** Must match .card-drawn-in's animation-duration in index.css. */
const CARD_ANIMATION_MS = 420;
/** Slack after the last card's animation completes before clearing the "just drawn" state. */
const REVEAL_BUFFER_MS = 100;

/**
 * How many of the CURRENT hand's items are newly drawn since this specific player's hand
 * was last observed. refillHand only ever `.push()`es, and placing a card only ever
 * splices an existing slot out — the hand array's relative order is otherwise stable, so
 * "newly drawn" is always exactly the last K items, K = growth in length since last seen.
 *
 * Tracking lives in a ref keyed by playerId (not inside Hand.tsx) on purpose: Hand fully
 * unmounts every hot-seat handoff, so state local to it would forget "what this player's
 * hand looked like last time" and misfire on every turn. Call this from Match.tsx, which
 * survives the whole match.
 */
export function useHandDrawAnimation(playerId: PlayerId, hand: HandItem[] | RedactedHandItem[]): number {
  const lastSeenLengthRef = useRef<Partial<Record<PlayerId, number>>>({});
  const [newlyDrawnCount, setNewlyDrawnCount] = useState(0);

  useEffect(() => {
    const previousLength = lastSeenLengthRef.current[playerId] ?? 0;
    const grown = Math.max(0, hand.length - previousLength);
    lastSeenLengthRef.current[playerId] = hand.length;
    setNewlyDrawnCount(grown);

    if (grown === 0) return;
    // The last card starts its animation after (grown - 1) stagger steps, so the whole
    // reveal — not just one card's animation — must finish before this fires.
    const totalDurationMs = HAND_DRAW_STAGGER_MS * (grown - 1) + CARD_ANIMATION_MS + REVEAL_BUFFER_MS;
    const timeout = setTimeout(() => setNewlyDrawnCount(0), totalDurationMs);
    return () => clearTimeout(timeout);
    // Only the length change should retrigger this, not a new array reference for the same contents.
  }, [playerId, hand.length]);

  return newlyDrawnCount;
}
