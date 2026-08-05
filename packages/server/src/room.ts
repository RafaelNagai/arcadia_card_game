import type { Config, DraftState, GameState, PlayerId, PlayerSetup } from '@eltyca/engine';
import { loadConfig } from '@eltyca/engine';
import type { RoomPhase } from './protocol';

export interface PersistedRoomState {
  code: string;
  /** playerId -> the clientId (persisted per-browser, see packages/web's clientId.ts) that
   *  currently holds that slot. */
  clientAssignments: Partial<Record<PlayerId, string>>;
  config: Config;
  phase: RoomPhase;
  draft: DraftState | null;
  game: GameState | null;
  /** Set once, the instant the draft finishes (see applyAction.ts's advancePick) — the
   *  original drafted decks, which EndSequence/computeTelemetry need at match end. Each
   *  player's own full deck is exactly the private information the rest of this protocol
   *  works hard to hide, so — same as everything else — this only ever goes out over the
   *  wire once game.phase is 'end' (see protocol.ts's ServerMessage doc comment); never
   *  broadcast mid-match. */
  playerSetups: PlayerSetup[] | null;
}

const STORAGE_KEY = 'room';
const PLAYER_ORDER: PlayerId[] = ['P1', 'P2'];

/** Just reads storage — returns undefined if this room has never been saved, rather than
 *  fabricating a default one. Kept separate from creating a new room (below) so `onStart`
 *  (which runs before any connection exists, with no config to offer) can rehydrate an
 *  *existing* room without ever accidentally pre-empting a brand new one before its first
 *  connection gets a chance to supply configOverrides. */
export async function loadExistingRoom(storage: DurableObjectStorage): Promise<PersistedRoomState | undefined> {
  return storage.get<PersistedRoomState>(STORAGE_KEY);
}

/** `configOverrides` only ever matters here, the instant a room is created by whoever
 *  connects first — once a room exists, its config is fixed for the rest of its life; a
 *  later joiner's local config is simply ignored, per the plan's "host's config wins". */
export function createNewRoom(code: string, configOverrides?: Partial<Config>): PersistedRoomState {
  return {
    code,
    clientAssignments: {},
    config: loadConfig(configOverrides),
    phase: 'lobby',
    draft: null,
    game: null,
    playerSetups: null,
  };
}

export async function savePersistedRoom(storage: DurableObjectStorage, state: PersistedRoomState): Promise<void> {
  await storage.put(STORAGE_KEY, state);
}

export class RoomFullError extends Error {
  constructor() {
    super('Esta sala já tem dois jogadores.');
  }
}

/**
 * Assigns (or reclaims) a player slot for a connecting client, mutating `state` in place.
 * First-come gets P1, second gets P2. A returning `clientId` — persisted per-browser, so it
 * survives a page refresh — reclaims whichever slot it already held rather than being
 * treated as a 3rd connection. A genuinely new client once both slots are taken is rejected.
 */
export function assignPlayerSlot(state: PersistedRoomState, clientId: string): PlayerId {
  for (const playerId of PLAYER_ORDER) {
    if (state.clientAssignments[playerId] === clientId) return playerId;
  }
  for (const playerId of PLAYER_ORDER) {
    if (!state.clientAssignments[playerId]) {
      state.clientAssignments[playerId] = clientId;
      return playerId;
    }
  }
  throw new RoomFullError();
}

export function isRoomFull(state: PersistedRoomState): boolean {
  return PLAYER_ORDER.every((id) => !!state.clientAssignments[id]);
}
