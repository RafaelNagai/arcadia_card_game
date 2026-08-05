export type Element = 'energy' | 'anomaly' | 'paradox' | 'cognitive' | 'astral';
export type CardType = 'creature' | 'vessel' | 'npc';
export type Tier = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS';
export type PlayerId = 'P1' | 'P2';
export type Rotation = 0 | 1 | 2 | 3;
export type Phase = 'choice' | 'draft' | 'setup' | 'main' | 'end';

export interface EffectDef {
  id: string;
  description: string;
}

export interface Card {
  id: string;
  name: string;
  type: CardType;
  element: Element;
  power: number;
  arrows: boolean[]; // length 8, printed orientation (rotation 0)
  effect?: EffectDef;
  tier: Tier;
  /** Path to the card's art, served from packages/web/public/ (e.g. "/dragon-01.jpg"). */
  imageUrl: string;
}

export interface Ship {
  id: string;
  name: string;
  shields: boolean[]; // length 8
  hull: number;
  /** Path to the ship's art, served from packages/web/public/ (e.g. "/ships/ship-01.jpg"). */
  imageUrl: string;
}

export interface Captain {
  id: string;
  name: string;
  cargoSlots: number; // 2..5
  passive?: EffectDef;
  /** Path to the captain's art, served from packages/web/public/ (e.g. "/captains/captain-01.jpg"). */
  imageUrl: string;
}

/** An item that can sit in a player's hand: a specific common card, or a Cargo token (fungible, no id). */
export type HandItem = { kind: 'card'; cardId: string } | { kind: 'cargo' };

export type CellContent =
  | { kind: 'card'; cardId: string; rot: Rotation; owner: PlayerId }
  | { kind: 'ship'; shipId: string; owner: PlayerId } // rot is always 0
  | { kind: 'cargo'; placedBy: PlayerId } // neutral: no owner
  | null;

export interface Cell {
  idx: number; // row * width + column
  chasm: boolean;
  content: CellContent;
  hiddenUntil: 'setup' | null; // cards placed face-down during setup
}

export interface Player {
  id: PlayerId;
  captainId: string;
  shipId: string; // ORIGINAL owner of the ship, not whoever currently controls it
  deck: string[]; // ids, shuffled order
  hand: HandItem[];
  cargoRemaining: number;
  discard: string[];
}

export interface Config {
  grid: { width: number; height: number };
  chasms: number[];
  maxHandSize: number;
  deckSize: number;
  draftPerRound: number;
  draftRounds: number;
  routeBonus: number;
  chainDepth: number; // 1 (default) or Infinity
  tieKeepsDefender: boolean;
  shipOnEdge: boolean;
  shipRotatable: boolean;
  discardCanBeCargo: boolean;
  setupHiddenCards: number;
  powerChart: Record<string, number>;
  modifierCost: number;
  lockCost: number;
}

export type DirectionResult =
  | { type: 'boarding'; targetIdx: number; direction: number }
  | {
      type: 'clash';
      targetIdx: number;
      direction: number;
      attackerPower: number;
      defenderPower: number;
      winner: 'attacker' | 'defender';
      /** false when the attacker won but a Lock effect blocked the capture anyway. */
      dominated: boolean;
    }
  | { type: 'ship-open'; targetIdx: number; direction: number }
  | {
      type: 'ship-shielded';
      targetIdx: number;
      direction: number;
      attackerPower: number;
      hull: number;
      dominated: boolean;
    }
  | { type: 'chain'; targetIdx: number; sourceIdx: number };

export interface LogEvent {
  turnNumber: number;
  player: PlayerId;
  cellIdx: number;
  placementType: 'card' | 'cargo' | 'ship';
  itemId?: string; // cardId or shipId, when applicable
  rotation?: Rotation;
  results: DirectionResult[];
}

export interface GameState {
  config: Config;
  seed: number;
  grid: { width: number; height: number };
  cells: Cell[];
  players: Player[];
  turnPlayer: PlayerId;
  phase: Phase;
  turnNumber: number;
  log: LogEvent[];
}

/** Static match content — card/captain/ship definitions, indexed by id. */
export interface GameContent {
  cards: Record<string, Card>;
  captains: Record<string, Captain>;
  ships: Record<string, Ship>;
}

/** Context passed to the two extension hooks (effectivePower, canBeDominated). */
export interface ResolutionContext {
  state: GameState;
  content: GameContent;
}

export interface PowerContext {
  state: GameState;
  content: GameContent;
  cellIdx: number; // cell of the card whose power is being computed
  opponentIdx?: number; // cell of the card/ship on the other side of the comparison, if any
}

export interface LockContext {
  state: GameState;
  content: GameContent;
  attackerIdx: number;
  defenderIdx: number;
}
