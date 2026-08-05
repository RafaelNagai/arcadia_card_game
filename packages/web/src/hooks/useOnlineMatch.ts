import { useCallback, useRef, useState, type Dispatch } from 'react';
import { usePartySocket } from 'partysocket/react';
import type { Config, GameContent, PlayerId, RedactedGameState } from '@eltyca/engine';
import type { ClientMessage, RoomPhase, ServerMessage, SetupProgressSummary } from '@eltyca/server';
import { createInitialDraftUIState, draftReducer } from '../reducer/draftReducer';
import type { DraftAction, DraftUIState } from '../reducer/draftTypes';
import { getOrCreateClientId } from '../game/clientId';

const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST ?? 'localhost:1999';

export type ConnectionStatus = 'connecting' | 'open' | 'closed';

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
  /** Redacted — this client's own view only. Real LiveMatch integration (place-setup,
   *  play-card) lands in the next phase; for now this just carries whatever the server has
   *  broadcast once roomPhase is 'game'. */
  game: RedactedGameState | null;
  setupProgress: SetupProgressSummary | null;
}

/**
 * Connects to one online match room over PartyKit and exposes it in roughly the same shape
 * the local hot-seat reducers already use, so the draft screens can stay identical between
 * hot-seat and online. Unlike hot-seat, nothing here runs the engine's mutating rule
 * functions directly — every commit-shaped action (start-match, pick-*) is sent to the
 * server and only ever applied locally once the server's own broadcast comes back, since the
 * server is the sole authority over the room's real state.
 */
export function useOnlineMatch(roomCode: string, content: GameContent, initialConfig: Config): OnlineMatchHandle {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [you, setYou] = useState<PlayerId | null>(null);
  const [roomPhase, setRoomPhase] = useState<RoomPhase>('lobby');
  const [opponentConnected, setOpponentConnected] = useState(false);
  const [config, setConfig] = useState<Config | null>(null);
  const [draftUIState, setDraftUIState] = useState<DraftUIState | null>(null);
  const [game, setGame] = useState<RedactedGameState | null>(null);
  const [setupProgress, setSetupProgress] = useState<SetupProgressSummary | null>(null);
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
          setGame(msg.game);
          setSetupProgress(msg.setupProgress);
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
          setGame(msg.game);
          setSetupProgress(msg.setupProgress);
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
    game,
    setupProgress,
  };
}
