import { isCaptainSilenced, type Captain, type GameState, type Player, type RedactedGameState, type RedactedPlayer } from '@eltyca/engine';
import { CaptainBadge } from '../card/CaptainBadge';

export interface PanelCaptainProps {
  captain: Captain;
  player: Player | RedactedPlayer;
  gameState: GameState | RedactedGameState;
}

export function PanelCaptain({ captain, player, gameState }: PanelCaptainProps) {
  // Ship control (what isCaptainSilenced actually reads) is only ever secret while a piece
  // is still face-down during setup, and PanelCaptain only ever renders during the main
  // phase (see LiveMatch.tsx) — by then nothing is hidden anymore, so gameState is genuinely
  // real here despite its widened type. isCaptainSilenced stays strictly typed on purpose —
  // it's core engine logic, not something that should need to know about redaction.
  const silenced = !!captain.passive && isCaptainSilenced(gameState as GameState, player.id);
  const cargoInHand = player.hand.filter((i) => i.kind === 'cargo').length;

  return (
    <div className={`panel-captain${silenced ? ' silenced' : ''}`}>
      <CaptainBadge captain={captain} owner={player.id} />
      <p>
        Carga: {cargoInHand} na mão (começou com {captain.cargoSlots})
      </p>
      {captain.passive && (
        <p className="passive">
          {silenced && <span className="silenced-tag">SILENCIADO — </span>}
          {captain.passive.description}
        </p>
      )}
    </div>
  );
}
