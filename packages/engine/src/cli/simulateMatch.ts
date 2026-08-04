import { loadConfig } from '../config';
import { sampleContent, samplePlayerSetups } from '../content';
import { createInitialState } from '../rules/initialState';
import { placeInSetup, revealSetup } from '../rules/setup';
import { isGameOver, playTurn } from '../rules/turn';
import { computeScores, determineWinner } from '../rules/scoring';
import { formatLogEvent } from '../rules/log';
import { isOnEdge } from '../util/grid';
import type { GameContent, GameState, PlayerId } from '../types';

/**
 * Runs one full match end to end with a trivial "first valid move" strategy —
 * no intelligent bot needed yet, this only has to prove resolvePlacement/playTurn
 * can carry a real match from setup to scoring without throwing or hanging.
 */
function findFirstEmptyCell(state: GameState): number {
  const cell = state.cells.find((c) => !c.chasm && c.content === null);
  if (!cell) throw new Error('Board is full');
  return cell.idx;
}

function findFirstEmptyNonEdgeCell(state: GameState): number {
  const cell = state.cells.find((c) => !c.chasm && c.content === null && !isOnEdge(c.idx, state.grid));
  if (!cell) throw new Error('No non-edge cell available for the Ship');
  return cell.idx;
}

function runSetupForPlayer(state: GameState, playerId: PlayerId): GameState {
  let working = placeInSetup(state, playerId, findFirstEmptyNonEdgeCell(state), { kind: 'ship' });

  for (let i = 0; i < working.config.setupHiddenCards; i++) {
    const player = working.players.find((p) => p.id === playerId)!;
    const item = player.hand[0];
    working = placeInSetup(working, playerId, findFirstEmptyCell(working), item);
  }

  return working;
}

function playTrivialTurn(state: GameState, content: GameContent): GameState {
  const player = state.players.find((p) => p.id === state.turnPlayer)!;
  const item = player.hand[0];
  return playTurn(state, content, player.id, findFirstEmptyCell(state), item, 0);
}

function run(): void {
  const seed = 42;
  const config = loadConfig();
  let state = createInitialState(config, samplePlayerSetups, seed);

  for (const player of state.players) {
    state = runSetupForPlayer(state, player.id);
  }
  state = revealSetup(state);

  const maxTurns = state.cells.filter((c) => !c.chasm).length * 2 + 10;
  let turns = 0;
  while (!isGameOver(state) && turns < maxTurns) {
    state = playTrivialTurn(state, sampleContent);
    turns++;
  }

  console.log(`--- Match log (${state.log.length} events, ${turns} main-phase turns) ---`);
  for (const event of state.log) {
    console.log(formatLogEvent(event, sampleContent));
  }

  console.log('\n--- Final score ---');
  const scores = computeScores(state, sampleContent);
  for (const score of scores) {
    console.log(
      `${score.player}: ${score.cardPoints} cards + ${score.shipPoints} ship(s) + ${score.routeBonus} route bonus = ${score.total}`
    );
  }

  const winner = determineWinner(scores);
  console.log(winner === 'drift' ? '\nResult: Drift (tie)' : `\nResult: ${winner} wins`);

  if (!isGameOver(state)) {
    throw new Error(`Simulation hit the turn cap (${maxTurns}) without finishing — board did not fill.`);
  }
}

run();
