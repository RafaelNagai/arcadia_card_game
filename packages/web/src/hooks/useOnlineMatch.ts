import { useCallback, useRef, useState, type Dispatch } from 'react';
import { usePartySocket } from 'partysocket/react';
import type { Config, GameContent, PlayerId, PlayerSetup, RedactedGameState } from '@eltyca/engine';
import type { ClientMessage, RoomPhase, ServerMessage, SetupProgressSummary } from '@eltyca/server';
import { createInitialDraftUIState, draftReducer } from '../reducer/draftReducer';
import type { DraftAction, DraftUIState } from '../reducer/draftTypes';
import { buildPlacementRequest, gameReducer } from '../reducer/gameReducer';
import type { Action, UIState } from '../reducer/types';
import { getOrCreateClientId } from '../game/clientId';

const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST ?? 'localhost:1999';

export type ConnectionStatus = 'connecting' | 'open' | 'closed';

function initialGameUIState(content: GameContent, game: RedactedGameState): UIState {
  return { content, gameState: game, selection: null, targetCellIdx: null, previewState: null, awaitingHandoff: null, error: null };
}

export interface OnlineMatchHandle {
  connectionStatus: ConnectionStatus;
  you: PlayerId | null;
  roomPhase: RoomPhase;
  opponentConnected: boolean;
  config: Config | null;
  error: string | null;
  dismissError: () => void;
  /** Only meaningful in the 'lobby' phase, once opponentConnected is true. */
  startMatch: () => void;
  /** Non-null once the server has sent at least one draft state (i.e. roomPhase is no
   *  longer 'lobby'). Drop-in replacement for the local draftReducer's state/dispatch pair —
   *  ChoiceScreen/DraftScreen don't need to know or care that this one talks to a server. */
  draftUIState: DraftUIState | null;
  dispatchDraft: Dispatch<DraftAction>;
  /** Non-null once roomPhase is 'game'. Drop-in replacement for LiveMatchHost's local
   *  gameReducer state/dispatch pair — LiveMatch doesn't need to know or care that this one
   *  talks to a server instead of mutating gameState directly. */
  gameUIState: UIState | null;
  dispatchGame: Dispatch<Action>;
  setupProgress: SetupProgressSummary | null;
  /** Only non-null once the match has actually ended — see protocol.ts's doc comment on why
   *  this is withheld until then. Needed for EndSequence's telemetry. */
  playerSetups: PlayerSetup[] | null;
}

/**
 * Connects to one online match room (a partyserver-backed Durable Object) and exposes it in
 * roughly the same shape
 * the local hot-seat reducers already use, so LiveMatch/ChoiceScreen/DraftScreen can stay
 * identical between hot-seat and online. Unlike hot-seat, nothing here runs the engine's
 * mutating rule functions directly — every commit-shaped action (start-match, pick-*,
 * CONFIRM_PLACEMENT) is sent to the server and only ever applied locally once the server's
 * own broadcast comes back, since the server is the sole authority over the room's real
 * state. Everything else (SELECT_*, ROTATE, CANCEL_SELECTION — the purely local-UI actions)
 * runs through the same gameReducer/draftReducer hot-seat already uses, unchanged.
 */
export function useOnlineMatch(roomCode: string, content: GameContent, initialConfig: Config): OnlineMatchHandle {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [you, setYou] = useState<PlayerId | null>(null);
  const [roomPhase, setRoomPhase] = useState<RoomPhase>('lobby');
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [config, setConfig] = useState<Config | null>(null);
  const [draftUIState, setDraftUIState] = useState<DraftUIState | null>(null);
  const [gameUIState, setGameUIState] = useState<UIState | null>(null);
  const [setupProgress, setSetupProgress] = useState<SetupProgressSummary | null>(null);
  const [playerSetups, setPlayerSetups] = useState<PlayerSetup[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clientIdRef = useRef<string | null>(null);
  if (!clientIdRef.current) clientIdRef.current = getOrCreateClientId();

  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: roomCode,
    party: 'main',
    // Only honored by the server the instant a room is first created — see
    // packages/server/src/room.ts's createNewRoom doc comment. Sending it unconditionally
    // on every connect is harmless; a joiner's config is simply ignored once a room exists.
    query: () => ({ clientId: clientIdRef.current!, config: JSON.stringify(initialConfig) }),
    onOpen: () => setConnectionStatus('open'),
    onClose: () => setConnectionStatus('closed'),
    onMessage: (event: MessageEvent<string>) => {
      const msg = JSON.parse(event.data) as ServerMessage;
      switch (msg.type) {
        case 'welcome':
          setYou(msg.you);
          setRoomPhase(msg.phase);
          setOpponentConnected(msg.opponentConnected);
          setConfig(msg.config);
          setDraftUIState(msg.draft ? createInitialDraftUIState(content, msg.draft) : null);
          setGameUIState(msg.game ? initialGameUIState(content, msg.game) : null);
          setSetupProgress(msg.setupProgress);
          setPlayerSetups(msg.playerSetups);
          break;
        case 'room-update':
          setOpponentConnected(msg.opponentConnected);
          break;
        case 'draft-update':
          setRoomPhase('draft');
          setDraftUIState((prev) =>
            prev ? draftReducer(prev, { type: 'SYNC_REMOTE_DRAFT', draft: msg.draft }) : createInitialDraftUIState(content, msg.draft)
          );
          break;
        case 'game-update':
          setRoomPhase('game');
          setGameUIState((prev) =>
            prev ? gameReducer(prev, { type: 'SYNC_REMOTE_STATE', gameState: msg.game }) : initialGameUIState(content, msg.game)
          );
          setSetupProgress(msg.setupProgress);
          setPlayerSetups(msg.playerSetups);
          break;
        case 'error':
          setError(msg.message);
          break;
      }
    },
  });

  const send = useCallback((msg: ClientMessage) => socket.send(JSON.stringify(msg)), [socket]);

  const dispatchDraft = useCallback<Dispatch<DraftAction>>(
    (action) => {
      switch (action.type) {
        case 'DISMISS_ERROR':
          setError(null);
          return;
        case 'PICK_CAPTAIN':
          send({ type: 'pick-captain', captainId: action.captainId });
          return;
        case 'PICK_SHIP':
          send({ type: 'pick-ship', shipId: action.shipId });
          return;
        case 'PICK_CARD':
          send({ type: 'pick-card', cardId: action.cardId });
          return;
        case 'SYNC_REMOTE_DRAFT':
          // Only ever produced internally (above) from a real server message — a screen
          // dispatching this itself would be a bug, not something to forward to the server.
          return;
      }
    },
    [send]
  );

  const dispatchGame = useCallback<Dispatch<Action>>(
    (action) => {
      if (action.type === 'DISMISS_ERROR') {
        setError(null);
        return;
      }

      if (action.type === 'SURRENDER') {
        // The server derives the acting player from the connection, not the action's
        // payload — see protocol.ts's ClientMessage doc comment — so playerId isn't sent.
        send({ type: 'surrender' });
        return;
      }

      if (action.type === 'CONFIRM_PLACEMENT') {
        setGameUIState((prev) => {
          if (!prev) return prev;
          const req = buildPlacementRequest(prev, action.discardCardId);
          if (req) {
            send(
              req.phase === 'setup'
                ? { type: 'place-setup', cellIdx: req.cellIdx, item: req.item }
                : { type: 'play-card', cellIdx: req.cellIdx, item: req.item, rotation: req.rotation, discardCardId: req.discardCardId }
            );
          }
          // Optimistically clear the local selection while waiting for the server's
          // broadcast — reuses the existing CANCEL_SELECTION case rather than a new one.
          return gameReducer(prev, { type: 'CANCEL_SELECTION' });
        });
        return;
      }

      // Everything else (SELECT_*, ROTATE, SELECT_CELL, CANCEL_SELECTION) is purely local UI
      // state — never touches gameState — so it runs through the exact same gameReducer
      // hot-seat uses, unchanged. SYNC_REMOTE_STATE and CONFIRM_HANDOFF are handled above/
      // never dispatched online respectively, but routing them through here too is harmless.
      setGameUIState((prev) => (prev ? gameReducer(prev, action) : prev));
    },
    [send]
  );

  const startMatch = useCallback(() => send({ type: 'start-match' }), [send]);
  const dismissError = useCallback(() => setError(null), []);

  return {
    connectionStatus,
    you,
    roomPhase,
    opponentConnected,
    config,
    error,
    dismissError,
    startMatch,
    draftUIState,
    dispatchDraft,
    gameUIState,
    dispatchGame,
    setupProgress,
    playerSetups,
  };
}
