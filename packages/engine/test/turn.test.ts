import { describe, expect, it } from 'vitest';
import { surrender } from '../src/rules/turn';
import { computeTelemetry } from '../src/telemetry/computeTelemetry';
import { makeContent, makeMinimalState } from './fixtures/state';
import type { PlayerSetup } from '../src/rules/initialState';

describe('surrender', () => {
  it('ends the match and records who conceded', () => {
    const state = makeMinimalState({ phase: 'main' });
    const next = surrender(state, 'P1');

    expect(next.phase).toBe('end');
    expect(next.surrenderedBy).toBe('P1');
  });

  it('is allowed during setup, not just the main phase', () => {
    const state = makeMinimalState({ phase: 'setup' });
    const next = surrender(state, 'P2');

    expect(next.phase).toBe('end');
    expect(next.surrenderedBy).toBe('P2');
  });

  it('refuses to surrender a match that has already ended', () => {
    const state = makeMinimalState({ phase: 'end' });
    expect(() => surrender(state, 'P1')).toThrow(/already ended/);
  });

  it('forces the other player to win regardless of the board score', () => {
    const content = makeContent({ cards: [] });
    // P1 has strictly more on the board than P2 — without the surrender override this
    // would make P1 the winner by score, exactly backwards from what conceding means.
    const state = makeMinimalState({
      cells: {
        0: { content: { kind: 'cargo', placedBy: 'P1' } }, // Cargo never scores, but board isn't empty
      },
    });
    const ended = surrender(state, 'P1');

    const playerSetups: PlayerSetup[] = [
      { id: 'P1', captainId: 'captain-P1', shipId: 'ship-P1', deck: [], cargoSlots: 0 },
      { id: 'P2', captainId: 'captain-P2', shipId: 'ship-P2', deck: [], cargoSlots: 0 },
    ];
    const telemetry = computeTelemetry(ended, content, playerSetups);

    expect(telemetry.winner).toBe('P2');
    expect(telemetry.surrenderedBy).toBe('P1');
  });
});
