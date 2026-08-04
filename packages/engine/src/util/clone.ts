import type { GameState } from '../types';

/** Single cloning choke point — if performance becomes an issue in M3 (thousands of
 *  simulated matches), swap the strategy here without touching any rule logic. */
export function cloneState(state: GameState): GameState {
  return structuredClone(state);
}
