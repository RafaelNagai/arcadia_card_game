import { effectivePower, type Cell, type GameContent, type GameState } from '@eltyca/engine';
import { CardMini } from '../card/CardMini';
import { ShipBadge } from '../card/ShipBadge';

export interface BoardCellProps {
  cell: Cell;
  gameState: GameState;
  content: GameContent;
  captured: boolean;
  isTarget: boolean;
  selectable: boolean;
  onClick: () => void;
  /** Transient post-commit animation flags — see hooks/useCommitAnimations.ts. */
  justPlaced?: boolean;
  dominated?: boolean;
  dominating?: boolean;
}

export function BoardCell({
  cell,
  gameState,
  content,
  captured,
  isTarget,
  selectable,
  onClick,
  justPlaced,
  dominated,
  dominating,
}: BoardCellProps) {
  if (cell.chasm) {
    return <div className="board-cell chasm" aria-hidden="true" />;
  }

  const classes = ['board-cell'];
  if (selectable) classes.push('selectable');
  if (isTarget) classes.push('target');
  if (captured) classes.push('captured');
  if (justPlaced) classes.push('just-placed');
  if (dominated) classes.push('just-dominated');
  if (dominating) classes.push('just-dominating');

  let inner: React.ReactNode = null;
  if (cell.hiddenUntil === 'setup') {
    inner = <div className="board-cell-hidden">?</div>;
  } else if (cell.content?.kind === 'card') {
    const card = content.cards[cell.content.cardId];
    const power = effectivePower({ state: gameState, content, cellIdx: cell.idx });
    inner = <CardMini card={card} rotation={cell.content.rot} owner={cell.content.owner} displayPower={power} compact />;
  } else if (cell.content?.kind === 'ship') {
    const ship = content.ships[cell.content.shipId];
    inner = <ShipBadge ship={ship} owner={cell.content.owner} compact />;
  } else if (cell.content?.kind === 'cargo') {
    inner = <div className="board-cell-cargo">Cargo</div>;
  }

  return (
    <button
      type="button"
      className={classes.join(' ')}
      data-cell-idx={cell.idx}
      onClick={onClick}
      disabled={!selectable}
    >
      {inner}
    </button>
  );
}
