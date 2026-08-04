import { loadConfig } from '../config';
import { sampleContent, samplePlayerSetups } from '../content';
import { createInitialState } from '../rules/initialState';
import { placeInSetup, revealSetup } from '../rules/setup';
import { isGameOver, playTurn } from '../rules/turn';
import { computeScores, determineWinner } from '../rules/scoring';
import { formatLogEvent } from '../rules/log';
import { computeTelemetry } from '../telemetry/computeTelemetry';
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

  const player = working.players.find((p) => p.id === playerId)!;
  const cargoInHand = player.hand.filter((i) => i.kind === 'cargo').length;
  const target = Math.min(working.config.setupHiddenCards, cargoInHand);

  for (let i = 0; i < target; i++) {
    working = placeInSetup(working, playerId, findFirstEmptyCell(working), { kind: 'cargo' });
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

  const telemetry = computeTelemetry(state, sampleContent, samplePlayerSetups);
  console.log('\n--- Telemetry ---');
  console.log(`Cargo plays: P1 turns ${telemetry.metrics.cargoPlaysByPlayer.P1.join(', ') || '(none)'}` +
    ` · P2 turns ${telemetry.metrics.cargoPlaysByPlayer.P2.join(', ') || '(none)'}`);
  console.log(
    `Ship ownership changes: ${telemetry.metrics.shipOwnershipChanges
      .map((c) => `turn ${c.turnNumber}: ${c.from} -> ${c.to}`)
      .join(' | ') || '(none)'}`
  );
  console.log(
    `First Ship fall: P1 turn ${telemetry.metrics.firstShipFallTurn.P1 ?? 'never'}` +
      ` · P2 turn ${telemetry.metrics.firstShipFallTurn.P2 ?? 'never'}`
  );
  console.log(
    `Dominations — boarding: ${telemetry.metrics.dominationsByType.boarding}` +
      `, clash: ${telemetry.metrics.dominationsByType.clash}` +
      `, chain: ${telemetry.metrics.dominationsByType.chain}`
  );
  console.log(
    `Largest route — P1: ${telemetry.metrics.largestRouteByPlayer.P1}` +
      `, P2: ${telemetry.metrics.largestRouteByPlayer.P2}`
  );
  console.log(
    `Never played — P1: [${telemetry.metrics.neverPlayedCardsByPlayer.P1.join(', ')}]` +
      ` · P2: [${telemetry.metrics.neverPlayedCardsByPlayer.P2.join(', ')}]`
  );
  console.log(`Victory margin: ${telemetry.metrics.victoryMargin}`);

  if (!isGameOver(state)) {
    throw new Error(`Simulation hit the turn cap (${maxTurns}) without finishing — board did not fill.`);
  }
}

run();
