import { nextSetupPlayer, type GameState, type PlayerId } from '@eltyca/engine';

/** placeInSetup (unlike playTurn) doesn't self-validate whose turn it is — the alternating
 *  one-piece-at-a-time order only ever lived in the UI reducer before online play existed.
 *  A server has to enforce it itself, since it's the one place a client can't be trusted to
 *  get right (or play fair) on its own. */
export function assertSetupTurn(game: GameState, playerId: PlayerId): void {
  const active = nextSetupPlayer(game);
  if (active !== playerId) throw new Error(`It is not ${playerId}'s turn to place a setup piece`);
}
