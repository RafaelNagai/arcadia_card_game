import type { Card, CardType, Element, Tier } from '../types';
import { arrowsFrom } from '../util/arrows';
import cardsData from './cards.json';

/** cards.json's shape: same fields as Card, except arrows are the *indices* that are active
 *  (0=N clockwise to 7=NW) rather than the length-8 boolean array Card actually uses — much
 *  less error-prone to hand-edit than typing out 8 booleans per card. */
interface RawCard {
  id: string;
  name: string;
  type: CardType;
  element: Element;
  power: number;
  arrows: number[];
  tier: Tier;
  imageUrl: string;
  effect?: { id: string; description: string };
}

/**
 * ~18 common cards spanning every row of the card-creation chart (2..8 arrows),
 * plus 2 Legendaries — enough to build two playable 12-card decks for the Route
 * (constructed) mode without a draft. Power follows the chart exactly; the two
 * NPCs carry the example Modifier/Lock effects from effects/examples.ts.
 *
 * Card data itself lives in cards.json, edited directly to add/change cards (name, power,
 * arrows, art, etc.) without touching TypeScript.
 */
export const sampleCards: Card[] = (cardsData as RawCard[]).map((raw) => ({
  ...raw,
  arrows: arrowsFrom(raw.arrows),
}));
