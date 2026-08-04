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
      <h1>Pass the device to {playerId}</h1>
      <p>Hide the screen from the other player, then continue.</p>
      <button type="button" onClick={() => dispatch({ type: 'CONFIRM_HANDOFF' })}>
        I'm {playerId}, ready
      </button>
    </div>
  );
}
