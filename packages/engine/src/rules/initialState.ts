import type { Cell, Config, GameState, PlayerId } from '../types';
import { createRng, shuffle } from '../util/rng';

export interface PlayerSetup {
  id: PlayerId;
  captainId: string;
  shipId: string;
  deck: string[]; // unshuffled common-card ids, config.deckSize entries expected
  cargoSlots: number; // from the Captain: how many Cargo tokens this player starts with
}

/** Builds the empty grid, shuffles each player's deck from `seed`, and deals the opening hand
 *  (cargoSlots Cargo tokens + the rest common cards, per the Captain's Cargo rating). */
export function createInitialState(config: Config, players: PlayerSetup[], seed: number): GameState {
  const rng = createRng(seed);
  const grid = config.grid;
  const total = grid.width * grid.height;
  const chasmSet = new Set(config.chasms);

  const cells: Cell[] = [];
  for (let idx = 0; idx < total; idx++) {
    cells.push({ idx, chasm: chasmSet.has(idx), content: null, hiddenUntil: null });
  }

  const gamePlayers = players.map((p) => {
    const shuffledDeck = shuffle(p.deck, rng);
    const commonSlots = Math.max(config.maxHandSize - p.cargoSlots, 0);
    const handCommons = shuffledDeck.splice(0, commonSlots);

    return {
      id: p.id,
      captainId: p.captainId,
      shipId: p.shipId,
      deck: shuffledDeck,
      hand: [
        ...handCommons.map((cardId) => ({ kind: 'card' as const, cardId })),
        ...Array.from({ length: p.cargoSlots }, () => ({ kind: 'cargo' as const })),
      ],
      cargoRemaining: p.cargoSlots,
      discard: [],
    };
  });

  return {
    config,
    seed,
    grid,
    cells,
    players: gamePlayers,
    turnPlayer: gamePlayers[0].id,
    phase: 'setup',
    turnNumber: 1,
    log: [],
    surrenderedBy: null,
  };
}
