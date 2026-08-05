import type { Captain, Card, Cell, Config, GameContent, GameState, Player, PlayerId, Ship } from '../../src/types';

export const testConfig: Config = {
  grid: { width: 5, height: 5 },
  chasms: [],
  maxHandSize: 7,
  deckSize: 12,
  draftPerRound: 4,
  draftRounds: 3,
  routeBonus: 3,
  chainDepth: 1,
  tieKeepsDefender: true,
  shipOnEdge: false,
  shipRotatable: false,
  discardCanBeCargo: false,
  setupHiddenCards: 2,
  powerChart: { '2': 10, '3': 9, '4': 8, '5': 7, '6': 6, '7': 5, '8': 4 },
  modifierCost: 2,
  lockCost: 4,
};

/** Turns a list of direction indices (0..7) into an 8-position boolean array. */
export function bools(indices: number[]): boolean[] {
  const out = new Array<boolean>(8).fill(false);
  for (const i of indices) out[i] = true;
  return out;
}

export function makeCard(overrides: Partial<Card> & { id: string }): Card {
  return {
    name: overrides.id,
    type: 'creature',
    element: 'energy',
    power: 5,
    arrows: bools([0]),
    tier: 'C',
    imageUrl: '/creature-01.jpg',
    ...overrides,
  };
}

export function makeShip(overrides: Partial<Ship> & { id: string }): Ship {
  return {
    name: overrides.id,
    shields: bools([]),
    hull: 5,
    imageUrl: '/ships/ship-01.jpg',
    ...overrides,
  };
}

export function makeCaptain(overrides: Partial<Captain> & { id: string }): Captain {
  return {
    name: overrides.id,
    cargoSlots: 3,
    imageUrl: '/captains/captain-01.jpg',
    ...overrides,
  };
}

export function makeContent(opts: { cards?: Card[]; ships?: Ship[]; captains?: Captain[] }): GameContent {
  const cards: Record<string, Card> = {};
  for (const c of opts.cards ?? []) cards[c.id] = c;
  const ships: Record<string, Ship> = {};
  for (const s of opts.ships ?? []) ships[s.id] = s;
  const captains: Record<string, Captain> = {};
  for (const cap of opts.captains ?? []) captains[cap.id] = cap;
  return { cards, ships, captains };
}

interface MinimalStateOptions {
  grid?: { width: number; height: number };
  chasms?: number[];
  config?: Partial<Config>;
  cells?: Record<number, Partial<Cell>>; // point overrides by idx
  players?: Partial<Record<PlayerId, Partial<Player>>>;
  phase?: GameState['phase'];
}

export function makeMinimalState(options: MinimalStateOptions = {}): GameState {
  const grid = options.grid ?? { width: 5, height: 5 };
  const chasms = new Set(options.chasms ?? []);
  const total = grid.width * grid.height;

  const cells: Cell[] = [];
  for (let idx = 0; idx < total; idx++) {
    cells.push({ idx, chasm: chasms.has(idx), content: null, hiddenUntil: null });
  }
  if (options.cells) {
    for (const [idxStr, override] of Object.entries(options.cells)) {
      const idx = Number(idxStr);
      cells[idx] = { ...cells[idx], ...override };
    }
  }

  const defaultPlayer = (id: PlayerId): Player => ({
    id,
    captainId: `captain-${id}`,
    shipId: `ship-${id}`,
    deck: [],
    hand: [],
    cargoRemaining: 0,
    discard: [],
  });

  const players: Player[] = (['P1', 'P2'] as PlayerId[]).map((id) => ({
    ...defaultPlayer(id),
    ...(options.players?.[id] ?? {}),
  }));

  return {
    config: { ...testConfig, ...options.config, grid },
    seed: 1,
    grid,
    cells,
    players,
    turnPlayer: 'P1',
    phase: options.phase ?? 'main',
    turnNumber: 1,
    log: [],
    surrenderedBy: null,
  };
}
