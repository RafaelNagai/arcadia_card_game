import { useReducer } from 'react';
import type { Config, GameState, PlayerId, PlayerSetup } from '@eltyca/engine';
import { createInitialState, nextSetupPlayer, sampleContent } from '@eltyca/engine';
import { createInitialUIState, gameReducer } from './reducer/gameReducer';
import LiveMatch from './LiveMatch';

export interface LiveMatchHostProps {
  config: Config;
  playerSetups: PlayerSetup[];
  onNewMatch: () => void;
  /** Present only for online matches — see LiveMatch.tsx. Hot-seat callers omit it. */
  viewerId?: PlayerId;
}

function buildInitialState(config: Config, playerSetups: PlayerSetup[]): GameState {
  const seed = Math.floor(Math.random() * 1_000_000);
  return createInitialState(config, playerSetups, seed);
}

/** Owns the local (hot-seat) game reducer — split out from LiveMatch so LiveMatch itself
 *  can be a plain controlled component (state/dispatch as props), reusable by a future
 *  online path that owns its state very differently (synced from a server, not constructed
 *  fresh from a local seed). useReducer can't be called conditionally, so this only mounts
 *  once playerSetups actually exists (i.e. once the pre-game draft has finished) — the same
 *  constraint that already shaped Match.tsx before this split. */
export default function LiveMatchHost({ config, playerSetups, onNewMatch, viewerId }: LiveMatchHostProps) {
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
      viewerId={viewerId}
      activeSetupPlayer={nextSetupPlayer(state.gameState)}
    />
  );
}
