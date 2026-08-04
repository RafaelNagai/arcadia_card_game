import type { GameContent, GameState, Player } from '@eltyca/engine';
import { ShipBadge } from '../card/ShipBadge';

export interface PanelShipProps {
  content: GameContent;
  gameState: GameState;
  player: Player;
}

export function PanelShip({ content, gameState, player }: PanelShipProps) {
  const ship = content.ships[player.shipId];
  const cell = gameState.cells.find((c) => c.content?.kind === 'ship' && c.content.shipId === player.shipId);
  const controller = cell?.content?.kind === 'ship' ? cell.content.owner : null;

  return (
    <div className="panel-ship">
      {controller ? (
        <ShipBadge ship={ship} owner={controller} />
      ) : (
        <div className="ship-badge pending">Not placed yet</div>
      )}
      <p>
        {controller === player.id
          ? 'Under your control'
          : controller
            ? `Captured by ${controller}`
            : 'Waiting for setup'}
      </p>
    </div>
  );
}
