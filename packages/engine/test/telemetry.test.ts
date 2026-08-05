import { describe, expect, it } from 'vitest';
import { bools, makeCaptain, makeCard, makeContent, makeMinimalState, makeShip } from './fixtures/state';
import { computeTelemetry } from '../src/telemetry/computeTelemetry';
import { toTelemetryRow, rowsToCsv } from '../src/telemetry/csv';
import { telemetryToJson } from '../src/telemetry/serialize';
import { resolvePlacement } from '../src/rules/resolvePlacement';
import type { PlayerSetup } from '../src/rules/initialState';

describe('computeTelemetry', () => {
  it('derives cargo plays, domination counts, ship falls, and never-played cards from the log', () => {
    const content = makeContent({
      cards: [
        makeCard({ id: 'attacker', power: 9, arrows: bools([2, 4]) }), // East (clash) + South (ship)
        makeCard({ id: 'bridge', power: 5, arrows: bools([6, 2]) }), // West back (clash) + East (chain)
        makeCard({ id: 'far', power: 1, arrows: bools([]) }),
        makeCard({ id: 'filler', power: 1, arrows: bools([]) }),
        makeCard({ id: 'unused', power: 1, arrows: bools([]) }),
      ],
      ships: [makeShip({ id: 'ship-P2', shields: bools([]), hull: 1 })],
      captains: [makeCaptain({ id: 'captain-P1' }), makeCaptain({ id: 'captain-P2' })],
    });

    let state = makeMinimalState({
      cells: {
        13: { content: { kind: 'card', cardId: 'bridge', rot: 0, owner: 'P2' } },
        14: { content: { kind: 'card', cardId: 'far', rot: 0, owner: 'P2' } },
        17: { content: { kind: 'ship', shipId: 'ship-P2', owner: 'P2' } },
      },
      players: {
        P1: { hand: [{ kind: 'card', cardId: 'attacker' }, { kind: 'cargo' }, { kind: 'card', cardId: 'filler' }] },
        P2: { shipId: 'ship-P2' },
      },
    });

    // Turn 1: P1 clashes+chains into P2's cards and opens P2's Ship in the same placement.
    state = resolvePlacement(state, content, 'P1', 12, { kind: 'card', cardId: 'attacker' }, 0);
    // Turn 2: P1 plays a Cargo (discarding 'filler').
    state = { ...state, turnNumber: 2 };
    state = resolvePlacement(state, content, 'P1', 20, { kind: 'cargo' }, 0, { discardCardId: 'filler' });

    const playerSetups: PlayerSetup[] = [
      { id: 'P1', captainId: 'captain-P1', shipId: 'ship-P1', deck: ['attacker', 'filler', 'unused'], cargoSlots: 1 },
      { id: 'P2', captainId: 'captain-P2', shipId: 'ship-P2', deck: ['bridge', 'far'], cargoSlots: 0 },
    ];

    const telemetry = computeTelemetry(state, content, playerSetups, 1234);

    expect(telemetry.metrics.cargoPlaysByPlayer.P1).toEqual([2]);
    expect(telemetry.metrics.dominationsByType).toEqual({ boarding: 0, clash: 1, chain: 1 });
    expect(telemetry.metrics.shipOwnershipChanges).toEqual([
      { shipId: 'ship-P2', turnNumber: 1, from: 'P2', to: 'P1' },
    ]);
    expect(telemetry.metrics.firstShipFallTurn).toEqual({ P1: null, P2: 1 });
    // 'filler' was discarded to play the Cargo, never actually placed on the board.
    expect(telemetry.metrics.neverPlayedCardsByPlayer.P1).toEqual(['filler', 'unused']);
    expect(telemetry.metrics.neverPlayedCardsByPlayer.P2).toEqual(['bridge', 'far']);
    expect(telemetry.durationMs).toBe(1234);
  });

  it('produces a flat CSV row and valid JSON with Infinity preserved as a readable sentinel', () => {
    const content = makeContent({ cards: [makeCard({ id: 'a', power: 1, arrows: bools([]) })] });
    const state = makeMinimalState({
      config: { chainDepth: Infinity },
      cells: { 0: { content: { kind: 'card', cardId: 'a', rot: 0, owner: 'P1' } } },
    });
    const playerSetups: PlayerSetup[] = [
      { id: 'P1', captainId: 'captain-P1', shipId: 'ship-P1', deck: ['a'], cargoSlots: 0 },
      { id: 'P2', captainId: 'captain-P2', shipId: 'ship-P2', deck: [], cargoSlots: 0 },
    ];

    const telemetry = computeTelemetry(state, content, playerSetups);
    const row = toTelemetryRow(telemetry);
    const csv = rowsToCsv([row]);

    expect(csv.split('\n')).toHaveLength(2);
    expect(csv).toContain('seed');

    const json = telemetryToJson(telemetry);
    expect(json).toContain('"Infinity"');
    expect(() => {
      JSON.parse(json);
    }).not.toThrow();
  });
});
