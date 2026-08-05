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
        <h1>Jogar online</h1>
        <p className="start-tagline">Crie uma sala, ou entre em uma com um código</p>
      </div>

      <section>
        <h2>Criar uma sala</h2>
        <button type="button" className="confirm" onClick={() => void navigate(`/online/${generateRoomCode()}`)}>
          Criar sala
        </button>
      </section>

      <section>
        <h2>Entrar em uma sala</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const code = joinCode.trim().toUpperCase();
            if (code) void navigate(`/online/${code}`);
          }}
        >
          <label>
            Código da sala
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="ABC123"
              maxLength={8}
            />
          </label>
          <button type="submit" disabled={!joinCode.trim()}>
            Entrar na sala
          </button>
        </form>
      </section>
    </div>
  );
}
