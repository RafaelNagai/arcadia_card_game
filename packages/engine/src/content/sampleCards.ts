import type { Card } from '../types';
import { arrowsFrom } from '../util/arrows';

/**
 * ~18 common cards spanning every row of the card-creation chart (2..8 arrows),
 * plus 2 Legendaries — enough to build two playable 12-card decks for the Route
 * (constructed) mode without a draft. Power follows the chart exactly; the two
 * NPCs carry the example Modifier/Lock effects from effects/examples.ts.
 */
export const sampleCards: Card[] = [
  // 2 arrows -> power 10
  { id: 'c01', name: 'Tideclaw Whelp', type: 'creature', element: 'energy', power: 10, arrows: arrowsFrom([0, 2]), tier: 'D' },
  { id: 'c02', name: 'Glass Adder', type: 'creature', element: 'anomaly', power: 10, arrows: arrowsFrom([4, 6]), tier: 'D' },

  // 3 arrows -> power 9
  { id: 'c03', name: 'Rift Hound', type: 'creature', element: 'paradox', power: 9, arrows: arrowsFrom([0, 2, 4]), tier: 'D' },
  { id: 'c04', name: 'Mistveil Lynx', type: 'creature', element: 'cognitive', power: 9, arrows: arrowsFrom([1, 3, 5]), tier: 'D' },

  // 4 arrows -> power 8
  { id: 'c05', name: 'Coral Behemoth', type: 'creature', element: 'astral', power: 8, arrows: arrowsFrom([0, 2, 4, 6]), tier: 'C' },
  { id: 'c06', name: 'Driftjaw Serpent', type: 'creature', element: 'energy', power: 8, arrows: arrowsFrom([1, 3, 5, 7]), tier: 'C' },
  {
    id: 'c07',
    name: 'Portside Cartographer',
    type: 'npc',
    element: 'anomaly',
    power: 8,
    arrows: arrowsFrom([0, 1, 2, 3]),
    tier: 'C',
    effect: { id: 'ward-anomaly', description: 'Opposing Anomaly cards get -2 power against this card.' },
  },

  // 5 arrows -> power 7
  { id: 'c08', name: 'Wave-Runner Skiff', type: 'creature', element: 'paradox', power: 7, arrows: arrowsFrom([0, 1, 2, 4, 6]), tier: 'C' },
  { id: 'c09', name: 'Stormglass Kraken', type: 'creature', element: 'cognitive', power: 7, arrows: arrowsFrom([0, 2, 3, 4, 5]), tier: 'C' },
  { id: 'c10', name: 'Ashen Gull-Rider', type: 'creature', element: 'astral', power: 7, arrows: arrowsFrom([1, 2, 3, 5, 7]), tier: 'C' },

  // 6 arrows -> power 6
  { id: 'c11', name: 'Barnacle Colossus', type: 'creature', element: 'energy', power: 6, arrows: arrowsFrom([0, 1, 2, 3, 4, 6]), tier: 'B' },
  { id: 'c12', name: 'Hollow Tide Chorus', type: 'creature', element: 'anomaly', power: 6, arrows: arrowsFrom([0, 2, 3, 4, 5, 6]), tier: 'B' },
  {
    id: 'c13',
    name: 'Quartermaster Vey',
    type: 'npc',
    element: 'paradox',
    power: 6,
    arrows: arrowsFrom([0, 1, 2, 4, 5, 6]),
    tier: 'B',
    effect: { id: 'lock-energy', description: 'Energy cards can never dominate this card.' },
  },

  // 7 arrows -> power 5 (leaning Vessel per the design notes)
  { id: 'c14', name: 'Brinewrack Galley', type: 'vessel', element: 'cognitive', power: 5, arrows: arrowsFrom([0, 1, 2, 3, 5, 6, 7]), tier: 'B' },
  { id: 'c15', name: "Smuggler's Runabout", type: 'vessel', element: 'astral', power: 5, arrows: arrowsFrom([1, 2, 3, 4, 5, 6, 7]), tier: 'B' },
  { id: 'c16', name: 'Tattered Longboat', type: 'vessel', element: 'energy', power: 5, arrows: arrowsFrom([0, 1, 3, 4, 5, 6, 7]), tier: 'B' },

  // 8 arrows -> power 4 (Vessel: wide silhouette, low power)
  { id: 'c17', name: 'Sunken Hulk', type: 'vessel', element: 'anomaly', power: 4, arrows: arrowsFrom([0, 1, 2, 3, 4, 5, 6, 7]), tier: 'A' },
  { id: 'c18', name: 'Driftwood Armada', type: 'vessel', element: 'paradox', power: 4, arrows: arrowsFrom([0, 1, 2, 3, 4, 5, 6, 7]), tier: 'A' },

  // Legendaries (SS): chart power for their arrow count, +2
  { id: 'leg01', name: 'The Tideless Sovereign', type: 'creature', element: 'cognitive', power: 10, arrows: arrowsFrom([0, 2, 4, 6]), tier: 'SS' },
  { id: 'leg02', name: 'Voidmaw, the Last Current', type: 'creature', element: 'astral', power: 9, arrows: arrowsFrom([0, 1, 2, 4, 6]), tier: 'SS' },
];
