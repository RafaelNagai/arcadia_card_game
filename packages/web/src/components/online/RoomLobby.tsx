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
    void navigator.clipboard.writeText(text).then(() => {
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
        <h1>Sala {code}</h1>
        <p className="start-tagline">Compartilhe este código com um amigo{you ? ` · Você é ${you}` : ''}</p>
      </div>

      <section>
        <div className="room-code-box">{code}</div>
        <div className="room-code-actions">
          <button type="button" onClick={() => copyCode(code)}>
            {codeCopied ? 'Copiado!' : 'Copiar código'}
          </button>
          <button type="button" onClick={() => copyLink(window.location.href)}>
            {linkCopied ? 'Copiado!' : 'Copiar link de convite'}
          </button>
        </div>

        <p>{opponentConnected ? 'Seu amigo chegou.' : 'Aguardando seu amigo entrar…'}</p>
        <button type="button" className="confirm" onClick={onStart} disabled={!opponentConnected}>
          Iniciar
        </button>
      </section>

      <button type="button" onClick={onLeave}>
        Sair da sala
      </button>
    </div>
  );
}
