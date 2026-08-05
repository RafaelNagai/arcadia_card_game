import { useNavigate, useParams } from 'react-router-dom';
import { sampleContent } from '@eltyca/engine';
import { useConfig } from '../game/configStore';
import { useOnlineMatch } from '../hooks/useOnlineMatch';
import { RoomLobby } from '../components/online/RoomLobby';
import { ChoiceScreen } from '../components/draft/ChoiceScreen';
import { DraftScreen } from '../components/draft/DraftScreen';
import LiveMatch from '../LiveMatch';

/** /online/:code — lobby (waiting for a friend, then Start) -> Porto draft (reusing
 *  ChoiceScreen/DraftScreen unmodified, same as hot-seat) -> the actual game, via the same
 *  LiveMatch hot-seat uses, driven by useOnlineMatch's server-synced state instead of a
 *  locally-owned reducer. */
export function OnlineRoomPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { config } = useConfig();
  const online = useOnlineMatch(code!, sampleContent, config);

  if (online.connectionStatus === 'connecting') {
    return (
      <div className="start-screen">
        <div className="start-hero">
          <h1>Connecting…</h1>
        </div>
      </div>
    );
  }

  if (online.connectionStatus === 'closed') {
    return (
      <div className="start-screen">
        <div className="start-hero">
          <h1>Disconnected</h1>
        </div>
        {online.error && <div className="error-banner">{online.error}</div>}
      </div>
    );
  }

  if (online.roomPhase === 'lobby') {
    return (
      <div className="game-screen">
        {online.error && <div className="error-banner">{online.error}</div>}
        <RoomLobby
          code={code!}
          opponentConnected={online.opponentConnected}
          you={online.you}
          onStart={online.startMatch}
          onLeave={() => void navigate('/online')}
        />
      </div>
    );
  }

  if (online.roomPhase === 'draft' && online.draftUIState) {
    return (
      <div className="game-screen">
        {online.error && <div className="error-banner">{online.error}</div>}
        {!online.opponentConnected && (
          <div className="opponent-disconnected-banner">Your opponent disconnected — waiting for them to come back…</div>
        )}
        {online.draftUIState.draft.stage === 'choice' ? (
          <ChoiceScreen content={online.draftUIState.content} draft={online.draftUIState.draft} dispatch={online.dispatchDraft} />
        ) : (
          <DraftScreen content={online.draftUIState.content} draft={online.draftUIState.draft} dispatch={online.dispatchDraft} />
        )}
      </div>
    );
  }

  if (online.roomPhase === 'game' && online.gameUIState && online.you) {
    return (
      <LiveMatch
        state={online.gameUIState}
        dispatch={online.dispatchGame}
        playerSetups={online.playerSetups ?? []}
        onNewMatch={() => void navigate('/online')}
        viewerId={online.you}
        activeSetupPlayer={online.setupProgress?.activePlayer ?? null}
        opponentConnected={online.opponentConnected}
      />
    );
  }

  return null;
}
