import { describe, expect, it } from 'vitest';
import { assignPlayerSlot, RoomFullError, type PersistedRoomState } from '../src/room';

function emptyRoom(): PersistedRoomState {
  return { code: 'TEST01', clientAssignments: {} };
}

describe('assignPlayerSlot', () => {
  it('assigns the first client P1', () => {
    const state = emptyRoom();
    expect(assignPlayerSlot(state, 'client-a')).toBe('P1');
    expect(state.clientAssignments).toEqual({ P1: 'client-a' });
  });

  it('assigns the second, different client P2', () => {
    const state = emptyRoom();
    assignPlayerSlot(state, 'client-a');
    expect(assignPlayerSlot(state, 'client-b')).toBe('P2');
    expect(state.clientAssignments).toEqual({ P1: 'client-a', P2: 'client-b' });
  });

  it('reclaims the same slot for a returning clientId instead of treating it as a new player', () => {
    const state = emptyRoom();
    assignPlayerSlot(state, 'client-a');
    assignPlayerSlot(state, 'client-b');
    expect(assignPlayerSlot(state, 'client-a')).toBe('P1');
    expect(assignPlayerSlot(state, 'client-b')).toBe('P2');
    expect(state.clientAssignments).toEqual({ P1: 'client-a', P2: 'client-b' });
  });

  it('rejects a third, genuinely new client once both slots are taken', () => {
    const state = emptyRoom();
    assignPlayerSlot(state, 'client-a');
    assignPlayerSlot(state, 'client-b');
    expect(() => assignPlayerSlot(state, 'client-c')).toThrow(RoomFullError);
  });
});
