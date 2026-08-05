import type { GameContent } from '../types';
import type { PlayerSetup } from '../rules/initialState';
import '../effects/examples'; // side effect: registers the example effects used by sampleCards/sampleCaptains

import { sampleCards } from './sampleCards';
import { sampleCaptains } from './sampleCaptains';
import { sampleShips } from './sampleShips';
import { sampleDeckP1, sampleDeckP2 } from './sampleDecks';

export { sampleCards } from './sampleCards';
export { sampleCaptains } from './sampleCaptains';
export { sampleShips } from './sampleShips';
export { sampleDeckP1, sampleDeckP2 } from './sampleDecks';

export const sampleContent: GameContent = {
  cards: Object.fromEntries(sampleCards.map((c) => [c.id, c])),
  captains: Object.fromEntries(sampleCaptains.map((c) => [c.id, c])),
  ships: Object.fromEntries(sampleShips.map((s) => [s.id, s])),
};

export const samplePlayerSetups: PlayerSetup[] = [
  { id: 'P1', captainId: 'captain-1', shipId: 'ship-1', deck: sampleDeckP1, cargoSlots: 4 },
  { id: 'P2', captainId: 'captain-2', shipId: 'ship-2', deck: sampleDeckP2, cargoSlots: 3 },
];
