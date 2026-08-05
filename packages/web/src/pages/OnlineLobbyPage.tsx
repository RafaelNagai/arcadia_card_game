import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateRoomCode } from '../game/roomCode';

/** The /online entry point: create a fresh room, or join one a friend already made and sent
 *  you the code for. A friend can also just be sent a raw /online/<code> link directly and
 *  skip this page entirely. */
export function OnlineLobbyPage() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');

  return (
    <div className="start-screen">
      <div className="start-hero">
        <h1>Play online</h1>
        <p className="start-tagline">Create a room, or join one with a code</p>
      </div>

      <section>
        <h2>Create a room</h2>
        <button type="button" className="confirm" onClick={() => void navigate(`/online/${generateRoomCode()}`)}>
          Create room
        </button>
      </section>

      <section>
        <h2>Join a room</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const code = joinCode.trim().toUpperCase();
            if (code) void navigate(`/online/${code}`);
          }}
        >
          <label>
            Room code
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="ABC123"
              maxLength={8}
            />
          </label>
          <button type="submit" disabled={!joinCode.trim()}>
            Join room
          </button>
        </form>
      </section>
    </div>
  );
}
