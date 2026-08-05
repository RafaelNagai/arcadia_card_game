import { useState } from 'react';
import type { PlayerId } from '@eltyca/engine';

export interface RoomLobbyProps {
  code: string;
  opponentConnected: boolean;
  you: PlayerId | null;
  onStart: () => void;
  onLeave: () => void;
}

/** Copies text to the clipboard and flips a button's label to "Copied!" for a moment —
 *  the only feedback a friend pasting a code over chat actually needs. */
function useCopyFeedback(): [copied: boolean, copy: (text: string) => void] {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return [copied, copy];
}

export function RoomLobby({ code, opponentConnected, you, onStart, onLeave }: RoomLobbyProps) {
  const [codeCopied, copyCode] = useCopyFeedback();
  const [linkCopied, copyLink] = useCopyFeedback();

  return (
    <div className="start-screen">
      <div className="start-hero">
        <h1>Room {code}</h1>
        <p className="start-tagline">Share this code with a friend{you ? ` · You are ${you}` : ''}</p>
      </div>

      <section>
        <div className="room-code-box">{code}</div>
        <div className="room-code-actions">
          <button type="button" onClick={() => copyCode(code)}>
            {codeCopied ? 'Copied!' : 'Copy code'}
          </button>
          <button type="button" onClick={() => copyLink(window.location.href)}>
            {linkCopied ? 'Copied!' : 'Copy invite link'}
          </button>
        </div>

        <p>{opponentConnected ? 'Your friend is here.' : 'Waiting for your friend to join…'}</p>
        <button type="button" className="confirm" onClick={onStart} disabled={!opponentConnected}>
          Start
        </button>
      </section>

      <button type="button" onClick={onLeave}>
        Leave room
      </button>
    </div>
  );
}
