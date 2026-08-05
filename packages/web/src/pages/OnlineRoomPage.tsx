import { useParams } from 'react-router-dom';
import { sampleContent } from '@eltyca/engine';
import { useConfig } from '../game/configStore';
import { useOnlineMatch } from '../hooks/useOnlineMatch';
import { RoomLobby } from '../components/online/RoomLobby';
import { GamePlaceholder } from '../components/online/GamePlaceholder';
import { ChoiceScreen } from '../components/draft/ChoiceScreen';
import { DraftScreen } from '../components/draft/DraftScreen';

/** /online/:code — lobby (waiting for a friend, then Start) -> Porto draft (reusing
 *  ChoiceScreen/DraftScreen unmodified, same as hot-seat) -> game. Full online gameplay
 *  (setup/main-phase interaction) lands in the next phase; for now the 'game' branch is a
 *  read-only placeholder — see GamePlaceholder's doc comment. */
export function OnlineRoomPage() {
  const { code } = useParams<{ code: string }>();
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

  return (
    <div className="game-screen">
      {online.error && <div className="error-banner">{online.error}</div>}

      {online.roomPhase === 'lobby' && (
        <RoomLobby code={code!} opponentConnected={online.opponentConnected} onStart={online.startMatch} />
      )}

      {online.roomPhase === 'draft' &&
        online.draftUIState &&
        (online.draftUIState.draft.stage === 'choice' ? (
          <ChoiceScreen content={online.draftUIState.content} draft={online.draftUIState.draft} dispatch={online.dispatchDraft} />
        ) : (
          <DraftScreen content={online.draftUIState.content} draft={online.draftUIState.draft} dispatch={online.dispatchDraft} />
        ))}

      {online.roomPhase === 'game' && online.game && online.you && <GamePlaceholder game={online.game} you={online.you} />}
    </div>
  );
}
