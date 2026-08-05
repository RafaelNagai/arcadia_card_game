import { useReducer } from 'react';
import type { Config, GameState, PlayerSetup } from '@eltyca/engine';
import { createInitialState, nextSetupPlayer, sampleContent } from '@eltyca/engine';
import { createInitialUIState, gameReducer } from './reducer/gameReducer';
import LiveMatch from './LiveMatch';

export interface LiveMatchHostProps {
  config: Config;
  playerSetups: PlayerSetup[];
  onNewMatch: () => void;
}

function buildInitialState(config: Config, playerSetups: PlayerSetup[]): GameState {
  const seed = Math.floor(Math.random() * 1_000_000);
  return createInitialState(config, playerSetups, seed);
}

/** Owns the local (hot-seat) game reducer — split out from LiveMatch so LiveMatch itself can
 *  be a plain controlled component (state/dispatch as props). This is hot-seat's *only*
 *  state-owning path: it always constructs a fresh GameState from createInitialState, never
 *  syncs from a server, so it never passes viewerId down (LiveMatch treats that as "hot-seat,
 *  follow whoever's active" when absent). Online instead drives LiveMatch directly from
 *  useOnlineMatch's server-synced state — see pages/OnlineRoomPage.tsx — bypassing this host
 *  entirely, so state.gameState here is always genuinely real despite UIState's type having
 *  to accommodate both cases. useReducer can't be called conditionally, so this only mounts
 *  once playerSetups actually exists (i.e. once the pre-game draft has finished) — the same
 *  constraint that already shaped Match.tsx before this split. */
export default function LiveMatchHost({ config, playerSetups, onNewMatch }: LiveMatchHostProps) {
  const [state, dispatch] = useReducer(
    gameReducer,
    config,
    (initialConfig) => createInitialUIState(sampleContent, buildInitialState(initialConfig, playerSetups))
  );

  return (
    <LiveMatch
      state={state}
      dispatch={dispatch}
      playerSetups={playerSetups}
      onNewMatch={onNewMatch}
      activeSetupPlayer={nextSetupPlayer(state.gameState as GameState)}
    />
  );
}
