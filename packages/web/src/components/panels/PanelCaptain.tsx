import { isCaptainSilenced, type Captain, type GameState, type Player } from '@eltyca/engine';
import { CaptainBadge } from '../card/CaptainBadge';

export interface PanelCaptainProps {
  captain: Captain;
  player: Player;
  gameState: GameState;
}

export function PanelCaptain({ captain, player, gameState }: PanelCaptainProps) {
  const silenced = !!captain.passive && isCaptainSilenced(gameState, player.id);
  const cargoInHand = player.hand.filter((i) => i.kind === 'cargo').length;

  return (
    <div className={`panel-captain${silenced ? ' silenced' : ''}`}>
      <CaptainBadge captain={captain} owner={player.id} />
      <p>
        Cargo: {cargoInHand} in hand (started with {captain.cargoSlots})
      </p>
      {captain.passive && (
        <p className="passive">
          {silenced && <span className="silenced-tag">SILENCED — </span>}
          {captain.passive.description}
        </p>
      )}
    </div>
  );
}
