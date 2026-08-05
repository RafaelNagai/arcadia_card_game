import type { Dispatch } from 'react';
import type { PlayerId } from '@eltyca/engine';
import type { Action } from '../../reducer/types';
import { PLAYER_COLORS } from '../../game/theme';

export interface HotSeatScreenProps {
  playerId: PlayerId;
  dispatch: Dispatch<Action>;
}

export function HotSeatScreen({ playerId, dispatch }: HotSeatScreenProps) {
  return (
    <div className="hotseat-screen" style={{ borderColor: PLAYER_COLORS[playerId] }}>
      <h1>Passe o dispositivo para {playerId}</h1>
      <p>Esconda a tela do outro jogador, depois continue.</p>
      <button type="button" onClick={() => dispatch({ type: 'CONFIRM_HANDOFF' })}>
        Sou {playerId}, pronto(a)
      </button>
    </div>
  );
}
