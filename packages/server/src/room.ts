import type * as Party from 'partykit/server';
import type { Config, DraftState, GameState, PlayerId } from '@eltyca/engine';
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
}

const STORAGE_KEY = 'room';
const PLAYER_ORDER: PlayerId[] = ['P1', 'P2'];

/** Just reads storage — returns undefined if this room has never been saved, rather than
 *  fabricating a default one. Kept separate from creating a new room (below) so `onStart`
 *  (which runs before any connection exists, with no config to offer) can rehydrate an
 *  *existing* room without ever accidentally pre-empting a brand new one before its first
 *  connection gets a chance to supply configOverrides. */
export async function loadExistingRoom(room: Party.Room): Promise<PersistedRoomState | undefined> {
  return room.storage.get<PersistedRoomState>(STORAGE_KEY);
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
  };
}

export async function savePersistedRoom(room: Party.Room, state: PersistedRoomState): Promise<void> {
  await room.storage.put(STORAGE_KEY, state);
}

export class RoomFullError extends Error {
  constructor() {
    super('This room already has two players.');
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
