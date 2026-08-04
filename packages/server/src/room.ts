import type * as Party from 'partykit/server';
import type { PlayerId } from '@eltyca/engine';

export interface PersistedRoomState {
  code: string;
  /** playerId -> the clientId (persisted per-browser, see packages/web's clientId.ts) that
   *  currently holds that slot. */
  clientAssignments: Partial<Record<PlayerId, string>>;
}

const STORAGE_KEY = 'room';
const PLAYER_ORDER: PlayerId[] = ['P1', 'P2'];

export async function loadPersistedRoom(room: Party.Room): Promise<PersistedRoomState> {
  const existing = await room.storage.get<PersistedRoomState>(STORAGE_KEY);
  if (existing) return existing;
  return { code: room.id, clientAssignments: {} };
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
