import type { DirectionResult, GameContent, GameState, HandItem, PlayerId, Rotation } from '../types';
import { opposite } from '../constants';
import { effectiveArrows } from '../rotation';
import { cloneState } from '../util/clone';
import { neighbor } from '../util/grid';
import { playCargo, refillHand, removeCardFromHand } from './hand';
import { effectivePower } from './effectivePower';
import { canBeDominated } from './canBeDominated';

export interface PlacementOptions {
  /** id of the common card to discard when the placed item is a Cargo. If omitted, discards the first common card in hand. */
  discardCardId?: string;
}

/**
 * resolvePlacement(state, content, player, cell, item, rotation) -> newState
 *
 * Pure function: never mutates `state`. Covers placing a common card or a Cargo
 * from hand during the main turn — placing a Ship during setup is handled by
 * `rules/setup.ts`, which reuses the same cell validation but never resolves arrows.
 */
export function resolvePlacement(
  state: GameState,
  content: GameContent,
  playerId: PlayerId,
  cellIdx: number,
  item: HandItem,
  rotation: Rotation,
  options?: PlacementOptions
): GameState {
  // ---- step 1: validation ----
  const player = state.players.find((p) => p.id === playerId);
  if (!player) throw new Error(`Player ${playerId} not found`);

  const targetCell = state.cells[cellIdx];
  if (!targetCell) throw new Error(`Cell ${cellIdx} is invalid`);
  if (targetCell.chasm) throw new Error('Cannot place on a Chasm');
  if (targetCell.content !== null) throw new Error('Cell is already occupied');

  const isInHand =
    item.kind === 'cargo'
      ? player.hand.some((i) => i.kind === 'cargo')
      : player.hand.some((i) => i.kind === 'card' && i.cardId === item.cardId);
  if (!isInHand) throw new Error('Item is not in the player\'s hand');

  const working = cloneState(state);
  const workingPlayer = working.players.find((p) => p.id === playerId)!;
  const workingCell = working.cells[cellIdx];

  // ---- step 2: place ----
  if (item.kind === 'cargo') {
    workingCell.content = { kind: 'cargo', placedBy: playerId };
    playCargo(working, workingPlayer, options?.discardCardId);
    working.log.push({
      turnNumber: working.turnNumber,
      player: playerId,
      cellIdx,
      placementType: 'cargo',
      results: [],
    });
    return working; // Cargo never resolves arrows, stop here
  }

  removeCardFromHand(workingPlayer, item.cardId);
  workingCell.content = { kind: 'card', cardId: item.cardId, rot: rotation, owner: playerId };

  // ---- step 3: effective arrows. From here on `working` IS the snapshot: no
  // capture is written into it until the very end, every comparison reads this state. ----
  const card = content.cards[item.cardId];
  const activeDirections = effectiveArrows(card.arrows, rotation)
    .map((active, d) => (active ? d : -1))
    .filter((d) => d !== -1);

  const grid = working.grid;
  const captures = new Map<number, PlayerId>();
  const dominatedByClash: number[] = [];
  const results: DirectionResult[] = [];

  // ---- step 4: direct resolution ----
  for (const d of activeDirections) {
    const neighborIdx = neighbor(cellIdx, d, grid);
    if (neighborIdx === null) continue;
    const neighborCell = working.cells[neighborIdx];
    if (!neighborCell.content) continue;
    if (neighborCell.content.kind === 'cargo') continue;
    if (neighborCell.content.owner === playerId) continue;

    if (neighborCell.content.kind === 'ship') {
      const ship = content.ships[neighborCell.content.shipId];
      const defenseAngle = opposite(d);
      if (!ship.shields[defenseAngle]) {
        captures.set(neighborIdx, playerId);
        results.push({ type: 'ship-open', targetIdx: neighborIdx, direction: d });
      } else {
        const attackerPower = effectivePower({ state: working, content, cellIdx, opponentIdx: neighborIdx });
        const dominated = attackerPower > ship.hull;
        if (dominated) captures.set(neighborIdx, playerId);
        results.push({
          type: 'ship-shielded',
          targetIdx: neighborIdx,
          direction: d,
          attackerPower,
          hull: ship.hull,
          dominated,
        });
      }
      continue;
    }

    // opposing card
    const targetCard = content.cards[neighborCell.content.cardId];
    const targetArrows = effectiveArrows(targetCard.arrows, neighborCell.content.rot);
    const defenseAngle = opposite(d);

    if (!targetArrows[defenseAngle]) {
      // Boarding: no return arrow, automatic domination, no propagation
      if (canBeDominated({ state: working, content, attackerIdx: cellIdx, defenderIdx: neighborIdx })) {
        captures.set(neighborIdx, playerId);
        results.push({ type: 'boarding', targetIdx: neighborIdx, direction: d });
      }
      continue;
    }

    // Clash: both cards point at each other
    const attackerPower = effectivePower({ state: working, content, cellIdx, opponentIdx: neighborIdx });
    const defenderPower = effectivePower({ state: working, content, cellIdx: neighborIdx, opponentIdx: cellIdx });
    const attackerWins = working.config.tieKeepsDefender
      ? attackerPower > defenderPower
      : attackerPower >= defenderPower;

    const dominated =
      attackerWins &&
      canBeDominated({ state: working, content, attackerIdx: cellIdx, defenderIdx: neighborIdx });

    results.push({
      type: 'clash',
      targetIdx: neighborIdx,
      direction: d,
      attackerPower,
      defenderPower,
      winner: attackerWins ? 'attacker' : 'defender',
      dominated,
    });

    if (dominated) {
      captures.set(neighborIdx, playerId);
      dominatedByClash.push(neighborIdx);
    }
  }

  // ---- step 6: no card is dominated more than once in the same turn ----
  const alreadyCaptured = new Set<number>(captures.keys());
  alreadyCaptured.add(cellIdx);

  // ---- step 5: chain — only seeded by a Clash win, depth controlled by config ----
  const depth = working.config.chainDepth;
  let frontier = dominatedByClash;
  let level = 0;
  while (frontier.length > 0 && level < depth) {
    const nextFrontier: number[] = [];
    for (const sourceIdx of frontier) {
      const sourceCell = working.cells[sourceIdx]; // original snapshot: cardId/rot don't change on capture
      if (!sourceCell.content || sourceCell.content.kind !== 'card') continue;
      const sourceCard = content.cards[sourceCell.content.cardId];
      const sourceArrows = effectiveArrows(sourceCard.arrows, sourceCell.content.rot);

      for (let d = 0; d < 8; d++) {
        if (!sourceArrows[d]) continue;
        const targetIdx = neighbor(sourceIdx, d, grid);
        if (targetIdx === null || alreadyCaptured.has(targetIdx)) continue;
        const chainTargetCell = working.cells[targetIdx];
        if (!chainTargetCell.content || chainTargetCell.content.kind !== 'card') continue;
        if (chainTargetCell.content.owner === playerId) continue;

        const chainTargetCard = content.cards[chainTargetCell.content.cardId];
        const chainTargetArrows = effectiveArrows(chainTargetCard.arrows, chainTargetCell.content.rot);
        if (chainTargetArrows[opposite(d)]) continue; // has a return arrow -> chain does not capture

        if (!canBeDominated({ state: working, content, attackerIdx: sourceIdx, defenderIdx: targetIdx })) {
          continue;
        }

        captures.set(targetIdx, playerId);
        alreadyCaptured.add(targetIdx);
        nextFrontier.push(targetIdx);
        results.push({ type: 'chain', targetIdx, sourceIdx });
      }
    }
    frontier = nextFrontier;
    level++;
  }

  // ---- apply all captures simultaneously ----
  for (const [idx, newOwner] of captures) {
    const c = working.cells[idx].content;
    if (c && (c.kind === 'card' || c.kind === 'ship')) c.owner = newOwner;
  }

  // ---- step 7: refill the hand ----
  refillHand(working, workingPlayer);

  working.log.push({
    turnNumber: working.turnNumber,
    player: playerId,
    cellIdx,
    placementType: 'card',
    itemId: item.cardId,
    rotation,
    results,
  });

  return working;
}
