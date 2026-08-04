import { describe, expect, it } from 'vitest';
import {
  createDraftState,
  pickCaptain,
  pickShip,
  pickCard,
  toPlayerSetups,
  type DraftState,
} from '../src/rules/draft';
import { createInitialState } from '../src/rules/initialState';
import { makeCaptain, makeCard, makeContent, makeShip, testConfig } from './fixtures/state';

const content = makeContent({
  cards: [
    makeCard({ id: 'c1' }),
    makeCard({ id: 'c2' }),
    makeCard({ id: 'c3' }),
    makeCard({ id: 'c4' }),
    makeCard({ id: 'c5' }),
    makeCard({ id: 'leg1', tier: 'SS' }),
  ],
  captains: [makeCaptain({ id: 'cap-a', cargoSlots: 4 }), makeCaptain({ id: 'cap-b', cargoSlots: 2 })],
  ships: [makeShip({ id: 'ship-a' }), makeShip({ id: 'ship-b' })],
});

function finishChoice(draft: DraftState): DraftState {
  let working = draft;
  working = pickCaptain(working, 'P1', 'cap-a');
  working = pickShip(working, 'P1', 'ship-a');
  working = pickCaptain(working, 'P2', 'cap-b');
  working = pickShip(working, 'P2', 'ship-b');
  return working;
}

describe('createDraftState', () => {
  it('starts in the choice stage with a pool sized for the whole draft, excluding Legendaries', () => {
    const config = { ...testConfig, draftPerRound: 2, draftRounds: 2 };
    const draft = createDraftState(content, config, ['P1', 'P2'], 1);

    expect(draft.stage).toBe('choice');
    expect(draft.poolRemaining).toHaveLength(2 * 2 * 2); // perRound * players * rounds
    expect(draft.poolRemaining).not.toContain('leg1');
    expect(draft.availableCaptainIds.sort()).toEqual(['cap-a', 'cap-b']);
    expect(draft.availableShipIds.sort()).toEqual(['ship-a', 'ship-b']);
    expect(draft.tableCards).toEqual([]);
    expect(draft.currentPicker).toBeNull();
  });

  it('repeats the common catalog when it is smaller than the draft needs, never running out', () => {
    const smallContent = makeContent({
      cards: [makeCard({ id: 'only1' }), makeCard({ id: 'only2' })],
      captains: [makeCaptain({ id: 'cap-a' }), makeCaptain({ id: 'cap-b' })],
      ships: [makeShip({ id: 'ship-a' }), makeShip({ id: 'ship-b' })],
    });
    const config = { ...testConfig, draftPerRound: 4, draftRounds: 3 };

    const draft = createDraftState(smallContent, config, ['P1', 'P2'], 1);

    expect(draft.poolRemaining).toHaveLength(4 * 2 * 3);
  });
});

describe('pickCaptain / pickShip (choice stage)', () => {
  it('assigns the pick and removes it from what is still available', () => {
    const draft = createDraftState(content, testConfig, ['P1', 'P2'], 1);
    const afterCaptain = pickCaptain(draft, 'P1', 'cap-a');

    expect(afterCaptain.players.find((p) => p.id === 'P1')!.captainId).toBe('cap-a');
    expect(afterCaptain.availableCaptainIds).toEqual(['cap-b']);
  });

  it('throws if the captain was already taken', () => {
    const draft = createDraftState(content, testConfig, ['P1', 'P2'], 1);
    const afterP1 = pickCaptain(draft, 'P1', 'cap-a');

    expect(() => pickCaptain(afterP1, 'P2', 'cap-a')).toThrow(/not available/);
  });

  it('throws if the same player tries to pick a captain twice', () => {
    const draft = createDraftState(content, testConfig, ['P1', 'P2'], 1);
    const afterP1 = pickCaptain(draft, 'P1', 'cap-a');

    expect(() => pickCaptain(afterP1, 'P1', 'cap-b')).toThrow(/already chose/);
  });

  it('does not advance to the draft stage until every player has both a Captain and a Ship', () => {
    const draft = createDraftState(content, testConfig, ['P1', 'P2'], 1);
    let working = pickCaptain(draft, 'P1', 'cap-a');
    working = pickShip(working, 'P1', 'ship-a');
    working = pickCaptain(working, 'P2', 'cap-b');

    expect(working.stage).toBe('choice');

    working = pickShip(working, 'P2', 'ship-b');
    expect(working.stage).toBe('draft');
  });

  it('auto-opens round 1 the instant choice completes', () => {
    const config = { ...testConfig, draftPerRound: 2, draftRounds: 2 };
    const draft = createDraftState(content, config, ['P1', 'P2'], 1);
    const working = finishChoice(draft);

    expect(working.stage).toBe('draft');
    expect(working.round).toBe(1);
    expect(working.tableCards).toHaveLength(4); // perRound(2) * players(2)
    // opener defaults to players[0] = P1, so the other player picks first.
    expect(working.currentPicker).toBe('P2');
  });
});

describe('pickCard (draft stage)', () => {
  it('alternates pickers within a round and lets the opener pick last', () => {
    const config = { ...testConfig, draftPerRound: 2, draftRounds: 2 };
    let draft = finishChoice(createDraftState(content, config, ['P1', 'P2'], 1));
    const round1Table = [...draft.tableCards]; // opener = P1, so pick order is P2,P1,P2,P1

    draft = pickCard(draft, 'P2', round1Table[0]);
    expect(draft.currentPicker).toBe('P1');
    draft = pickCard(draft, 'P1', round1Table[1]);
    expect(draft.currentPicker).toBe('P2');
    draft = pickCard(draft, 'P2', round1Table[2]);
    expect(draft.currentPicker).toBe('P1');

    draft = pickCard(draft, 'P1', round1Table[3]); // opener's last pick of the round
    // Round 2 auto-opens; opener rotates to P2, so P1 picks first this time.
    expect(draft.round).toBe(2);
    expect(draft.opener).toBe('P2');
    expect(draft.currentPicker).toBe('P1');
  });

  it('rejects a pick out of turn', () => {
    const config = { ...testConfig, draftPerRound: 2, draftRounds: 2 };
    const draft = finishChoice(createDraftState(content, config, ['P1', 'P2'], 1));

    expect(() => pickCard(draft, 'P1', draft.tableCards[0])).toThrow(/turn/);
  });

  it('rejects a card that is not on the table', () => {
    const config = { ...testConfig, draftPerRound: 2, draftRounds: 2 };
    const draft = finishChoice(createDraftState(content, config, ['P1', 'P2'], 1));

    expect(() => pickCard(draft, 'P2', 'not-on-the-table')).toThrow(/not on the table/);
  });

  it('reaches stage "done" after the last round, with each player holding perRound * rounds cards', () => {
    const config = { ...testConfig, draftPerRound: 1, draftRounds: 2 };
    let draft = finishChoice(createDraftState(content, config, ['P1', 'P2'], 1));

    // 2 rounds * 1 card/round/player * 2 players = 4 total picks.
    for (let i = 0; i < 4; i++) {
      expect(draft.stage).toBe('draft');
      draft = pickCard(draft, draft.currentPicker!, draft.tableCards[0]);
    }

    expect(draft.stage).toBe('done');
    expect(draft.currentPicker).toBeNull();
    for (const player of draft.players) {
      expect(player.pickedCardIds).toHaveLength(2); // perRound(1) * rounds(2)
    }
  });
});

describe('toPlayerSetups + createInitialState integration', () => {
  it('hands off a finished draft straight into the existing, untouched createInitialState', () => {
    const config = { ...testConfig, draftPerRound: 2, draftRounds: 2 };
    let draft = finishChoice(createDraftState(content, config, ['P1', 'P2'], 1));
    while (draft.stage !== 'done') {
      draft = pickCard(draft, draft.currentPicker!, draft.tableCards[0]);
    }

    const setups = toPlayerSetups(draft, content);
    expect(setups).toHaveLength(2);
    const p1 = setups.find((s) => s.id === 'P1')!;
    expect(p1.captainId).toBe('cap-a');
    expect(p1.shipId).toBe('ship-a');
    expect(p1.cargoSlots).toBe(4); // from cap-a's cargoSlots
    expect(p1.deck).toHaveLength(4); // perRound(2) * rounds(2)

    const gameState = createInitialState(config, setups, 42);
    expect(gameState.phase).toBe('setup');
    expect(gameState.players).toHaveLength(2);
  });

  it('throws if called before the draft is done', () => {
    const draft = createDraftState(content, testConfig, ['P1', 'P2'], 1);
    expect(() => toPlayerSetups(draft, content)).toThrow(/done/);
  });
});
