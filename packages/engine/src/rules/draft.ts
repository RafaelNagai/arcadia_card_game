import type { Config, GameContent, PlayerId } from '../types';
import type { PlayerSetup } from './initialState';
import { createRng, shuffle } from '../util/rng';

export interface DraftPlayerState {
  id: PlayerId;
  captainId: string | null;
  shipId: string | null;
  pickedCardIds: string[];
}

/**
 * Pre-game state machine for the Porto draft (regras_v0.9.md "Os dois modos" / "O draft do
 * Porto"). Deliberately kept separate from GameState/createInitialState rather than folding
 * 'choice'/'draft' into Player.captainId etc. as optional fields — every existing rule
 * function assumes those are already resolved. Once `stage` reaches 'done', toPlayerSetups
 * hands off to the untouched, already-tested createInitialState.
 */
export interface DraftState {
  stage: 'choice' | 'draft' | 'done';
  seed: number;
  players: DraftPlayerState[];
  availableCaptainIds: string[];
  availableShipIds: string[];
  poolRemaining: string[]; // shuffled common card ids, not yet revealed
  round: number; // 1-based
  totalRounds: number; // config.draftRounds
  perRound: number; // config.draftPerRound
  opener: PlayerId; // whose turn it is to have opened the current round
  tableCards: string[]; // cards revealed for the current round, not yet picked
  currentPicker: PlayerId | null; // null only before 'draft' stage starts
}

function cloneDraft(draft: DraftState): DraftState {
  return structuredClone(draft);
}

function otherPlayer(draft: DraftState, playerId: PlayerId): PlayerId {
  const other = draft.players.find((p) => p.id !== playerId);
  if (!other) throw new Error('Draft requires at least 2 players');
  return other.id;
}

/** Reveals the next `perRound * players.length` cards from the pool and sets the picker to
 *  whoever did NOT open — with 2 players alternating from there, the opener naturally picks
 *  last, per "quem abriu compra por último". Mutates `draft` in place (always called on an
 *  already-cloned working copy from within an exported function, same pattern rules/setup.ts
 *  uses for its internal helpers). */
function openRound(draft: DraftState): DraftState {
  const count = draft.perRound * draft.players.length;
  draft.tableCards = draft.poolRemaining.splice(0, count);
  draft.currentPicker = otherPlayer(draft, draft.opener);
  return draft;
}

function advanceIfChoiceDone(draft: DraftState): DraftState {
  const allDone = draft.players.every((p) => p.captainId !== null && p.shipId !== null);
  if (!allDone) return draft;
  draft.stage = 'draft';
  return openRound(draft);
}

/** Builds the pool large enough to cover the whole draft (perRound * players * rounds cards)
 *  by repeating the shuffled common-card catalog as many times as needed — decks in this game
 *  already allow duplicate card ids (see sampleDecks.ts), so a shared pool with repeats is
 *  consistent with existing data, not a new assumption. Legendaries (tier 'SS') are excluded:
 *  the rules reserve those for the Route/constructed deck-building rule, not the Porto pool. */
export function createDraftState(content: GameContent, config: Config, playerIds: PlayerId[], seed: number): DraftState {
  const rng = createRng(seed);
  const commonCardIds = Object.values(content.cards)
    .filter((c) => c.tier !== 'SS')
    .map((c) => c.id);
  if (commonCardIds.length === 0) throw new Error('No common cards available to draft');

  const needed = config.draftPerRound * playerIds.length * config.draftRounds;
  const pool: string[] = [];
  while (pool.length < needed) {
    pool.push(...shuffle(commonCardIds, rng));
  }

  return {
    stage: 'choice',
    seed,
    players: playerIds.map((id) => ({ id, captainId: null, shipId: null, pickedCardIds: [] })),
    availableCaptainIds: Object.keys(content.captains),
    availableShipIds: Object.keys(content.ships),
    poolRemaining: shuffle(pool.slice(0, needed), rng),
    round: 1,
    totalRounds: config.draftRounds,
    perRound: config.draftPerRound,
    opener: playerIds[0],
    tableCards: [],
    currentPicker: null,
  };
}

export function pickCaptain(draft: DraftState, playerId: PlayerId, captainId: string): DraftState {
  if (draft.stage !== 'choice') throw new Error('pickCaptain can only be used during the choice stage');
  if (!draft.availableCaptainIds.includes(captainId)) throw new Error(`Captain ${captainId} is not available`);
  const player = draft.players.find((p) => p.id === playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);
  if (player.captainId !== null) throw new Error(`${playerId} already chose a Captain`);

  const working = cloneDraft(draft);
  working.players.find((p) => p.id === playerId)!.captainId = captainId;
  working.availableCaptainIds = working.availableCaptainIds.filter((id) => id !== captainId);

  return advanceIfChoiceDone(working);
}

export function pickShip(draft: DraftState, playerId: PlayerId, shipId: string): DraftState {
  if (draft.stage !== 'choice') throw new Error('pickShip can only be used during the choice stage');
  if (!draft.availableShipIds.includes(shipId)) throw new Error(`Ship ${shipId} is not available`);
  const player = draft.players.find((p) => p.id === playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);
  if (player.shipId !== null) throw new Error(`${playerId} already chose a Ship`);

  const working = cloneDraft(draft);
  working.players.find((p) => p.id === playerId)!.shipId = shipId;
  working.availableShipIds = working.availableShipIds.filter((id) => id !== shipId);

  return advanceIfChoiceDone(working);
}

export function pickCard(draft: DraftState, playerId: PlayerId, cardId: string): DraftState {
  if (draft.stage !== 'draft') throw new Error('pickCard can only be used during the draft stage');
  if (draft.currentPicker !== playerId) throw new Error(`It is not ${playerId}'s turn to pick`);
  if (!draft.tableCards.includes(cardId)) throw new Error(`Card ${cardId} is not on the table`);

  const working = cloneDraft(draft);
  working.players.find((p) => p.id === playerId)!.pickedCardIds.push(cardId);
  working.tableCards.splice(working.tableCards.indexOf(cardId), 1);

  if (working.tableCards.length > 0) {
    working.currentPicker = otherPlayer(working, playerId);
    return working;
  }

  if (working.round < working.totalRounds) {
    working.round += 1;
    working.opener = otherPlayer(working, working.opener);
    return openRound(working);
  }

  working.stage = 'done';
  working.currentPicker = null;
  return working;
}

/** Converts a finished draft into the same PlayerSetup[] shape samplePlayerSetups already
 *  provides — createInitialState doesn't need to know or care whether a deck came from a
 *  draft or a hardcoded literal. */
export function toPlayerSetups(draft: DraftState, content: GameContent): PlayerSetup[] {
  if (draft.stage !== 'done') throw new Error('toPlayerSetups can only be called once the draft is done');

  return draft.players.map((p) => {
    if (!p.captainId || !p.shipId) throw new Error(`${p.id} never finished choosing a Captain/Ship`);
    const captain = content.captains[p.captainId];
    if (!captain) throw new Error(`Unknown captain ${p.captainId}`);

    return {
      id: p.id,
      captainId: p.captainId,
      shipId: p.shipId,
      deck: p.pickedCardIds,
      cargoSlots: captain.cargoSlots,
    };
  });
}
