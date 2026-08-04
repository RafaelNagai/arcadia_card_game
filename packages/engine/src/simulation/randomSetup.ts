import type { GameState, PlayerId } from '../types';
import { isOnEdge } from '../util/grid';
import { placeInSetup } from '../rules/setup';

/** Setup is blind information with no captures to optimize for, so every bot uses the same randomized placement. */
export function randomSetupForPlayer(state: GameState, playerId: PlayerId, rng: () => number): GameState {
  let working = state;

  const shipCells = working.cells.filter((c) => !c.chasm && c.content === null && !isOnEdge(c.idx, working.grid));
  if (shipCells.length === 0) throw new Error('No non-edge cell available for the Ship');
  const shipCell = shipCells[Math.floor(rng() * shipCells.length)];
  working = placeInSetup(working, playerId, shipCell.idx, { kind: 'ship' });

  const player = working.players.find((p) => p.id === playerId)!;
  const cargoInHand = player.hand.filter((i) => i.kind === 'cargo').length;
  const target = Math.min(working.config.setupHiddenCards, cargoInHand);

  for (let i = 0; i < target; i++) {
    const emptyCells = working.cells.filter((c) => !c.chasm && c.content === null);
    const cell = emptyCells[Math.floor(rng() * emptyCells.length)];
    working = placeInSetup(working, playerId, cell.idx, { kind: 'cargo' });
  }

  return working;
}
