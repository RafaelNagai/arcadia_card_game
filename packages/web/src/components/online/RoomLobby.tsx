export interface RoomLobbyProps {
  code: string;
  opponentConnected: boolean;
  onStart: () => void;
}

export function RoomLobby({ code, opponentConnected, onStart }: RoomLobbyProps) {
  return (
    <div className="start-screen">
      <div className="start-hero">
        <h1>Room {code}</h1>
        <p className="start-tagline">Share this code with a friend</p>
      </div>

      <section>
        <p>{opponentConnected ? 'Your friend is here.' : 'Waiting for your friend to join…'}</p>
        <button type="button" className="confirm" onClick={onStart} disabled={!opponentConnected}>
          Start
        </button>
      </section>
    </div>
  );
}
