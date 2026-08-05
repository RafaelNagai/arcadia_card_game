import type { Config, DraftState, HandItem, PlayerId, PlayerSetup, RedactedGameState, Rotation, SetupItem } from '@eltyca/engine';

export type RoomPhase = 'lobby' | 'draft' | 'game';

/**
 * No `playerId` on any of these — unlike the local, trusted-by-construction DraftAction the
 * web client dispatches from its own clicks, a message arriving over a socket always has its
 * acting player derived from the connection itself (see room.ts's clientAssignments), never
 * from the message body. A client can never claim to act as its opponent.
 */
export type ClientMessage =
  | { type: 'start-match' }
  | { type: 'pick-captain'; captainId: string }
  | { type: 'pick-ship'; shipId: string }
  | { type: 'pick-card'; cardId: string }
  | { type: 'place-setup'; cellIdx: number; item: SetupItem }
  | { type: 'play-card'; cellIdx: number; item: HandItem; rotation: Rotation; discardCardId?: string }
  | { type: 'surrender' };

/** Setup-phase turn/progress info the server must compute itself and ship explicitly — a
 *  client can't safely re-derive this from a redacted GameState (nextSetupPlayer/isShipPlaced
 *  detect a placed piece by inspecting content.kind, which a redacted opponent cell never has,
 *  so it'd silently look like the opponent never finishes setup — see the engine's redact.ts
 *  and setupProgress.ts doc comments). Null once phase is 'main' or 'end', where turn order is
 *  just gameState.turnPlayer, safe to read directly off the (redacted-but-otherwise-accurate)
 *  broadcast game state. */
export interface SetupProgressSummary {
  activePlayer: PlayerId | null;
  perPlayer: Record<PlayerId, { shipPlaced: boolean; hiddenPlaced: number; hiddenNeeded: number }>;
}

export type ServerMessage =
  | {
      type: 'welcome';
      you: PlayerId;
      phase: RoomPhase;
      opponentConnected: boolean;
      config: Config;
      draft: DraftState | null;
      game: RedactedGameState | null;
      setupProgress: SetupProgressSummary | null;
      /** The original drafted decks — only ever non-null once game.phase is 'end' (nothing
       *  left to hide by then), same as the seed field inside a redacted GameState. Needed
       *  for EndSequence's telemetry; a real per-player deck the rest of this protocol
       *  otherwise treats as exactly the private information worth protecting. */
      playerSetups: PlayerSetup[] | null;
    }
  | { type: 'room-update'; opponentConnected: boolean }
  | { type: 'draft-update'; draft: DraftState }
  | { type: 'game-update'; game: RedactedGameState; setupProgress: SetupProgressSummary | null; playerSetups: PlayerSetup[] | null }
  | { type: 'error'; message: string };
