import type { Config, GameContent, GameState, LogEvent, PlayerId } from '../types';
import type { PlayerSetup } from '../rules/initialState';
import { computeScores, determineWinner, type Score } from '../rules/scoring';
import { largestRoute } from '../rules/route';

export interface ShipOwnershipChange {
  shipId: string;
  turnNumber: number;
  from: PlayerId;
  to: PlayerId;
}

export interface MatchTelemetry {
  seed: number;
  config: Config;
  turnCount: number;
  durationMs: number | null;
  winner: PlayerId | 'drift';
  /** Set when the match ended by concession rather than a full board — `winner` above is
   *  already forced to the *other* player in this case, regardless of `finalScore`. */
  surrenderedBy: PlayerId | null;
  finalScore: Score[];
  players: { id: PlayerId; captainId: string; shipId: string; deck: string[] }[];
  /** turn-by-turn log, already in replayable form */
  turns: LogEvent[];
  metrics: {
    /** turn numbers on which each player played a Cargo */
    cargoPlaysByPlayer: Record<PlayerId, number[]>;
    shipOwnershipChanges: ShipOwnershipChange[];
    /** turn each player's OWN ship first fell to an opponent, or null if it never did */
    firstShipFallTurn: Record<PlayerId, number | null>;
    dominationsByType: { boarding: number; clash: number; chain: number };
    largestRouteByPlayer: Record<PlayerId, number>;
    /** average arrow-count of each player's full original deck */
    averageArrowsByPlayer: Record<PlayerId, number>;
    /** deck cards a player never placed during the main phase — a setup-buried card
     *  is not tracked here, since placeInSetup never resolves or logs anything. */
    neverPlayedCardsByPlayer: Record<PlayerId, string[]>;
    victoryMargin: number;
  };
}

export function computeTelemetry(
  state: GameState,
  content: GameContent,
  playerSetups: PlayerSetup[],
  durationMs: number | null = null
): MatchTelemetry {
  const scores = computeScores(state, content);
  // A concession overrides the normal score comparison entirely — the conceding player
  // loses regardless of how the (possibly incomplete) board happens to be scored.
  const winner = state.surrenderedBy
    ? state.players.find((p) => p.id !== state.surrenderedBy)!.id
    : determineWinner(scores);

  const cargoPlaysByPlayer = {} as Record<PlayerId, number[]>;
  const playedCardIdsByPlayer = {} as Record<PlayerId, Set<string>>;
  const dominationsByType = { boarding: 0, clash: 0, chain: 0 };

  for (const player of state.players) {
    cargoPlaysByPlayer[player.id] = [];
    playedCardIdsByPlayer[player.id] = new Set();
  }

  for (const event of state.log) {
    if (event.placementType === 'cargo') {
      cargoPlaysByPlayer[event.player].push(event.turnNumber);
    }
    if (event.placementType === 'card' && event.itemId) {
      playedCardIdsByPlayer[event.player].add(event.itemId);
    }
    for (const result of event.results) {
      if (result.type === 'boarding') dominationsByType.boarding++;
      else if (result.type === 'clash' && result.dominated) dominationsByType.clash++;
      else if (result.type === 'chain') dominationsByType.chain++;
    }
  }

  const shipOwnershipChanges = computeShipOwnershipChanges(state);
  const firstShipFallTurn = {} as Record<PlayerId, number | null>;
  for (const player of state.players) {
    const fall = shipOwnershipChanges.find((change) => change.from === player.id);
    firstShipFallTurn[player.id] = fall ? fall.turnNumber : null;
  }

  const largestRouteByPlayer = {} as Record<PlayerId, number>;
  const averageArrowsByPlayer = {} as Record<PlayerId, number>;
  const neverPlayedCardsByPlayer = {} as Record<PlayerId, string[]>;

  for (const setup of playerSetups) {
    largestRouteByPlayer[setup.id] = largestRoute(state, content, setup.id);

    const arrowCounts = setup.deck.map((id) => content.cards[id].arrows.filter(Boolean).length);
    averageArrowsByPlayer[setup.id] =
      arrowCounts.length > 0 ? arrowCounts.reduce((a, b) => a + b, 0) / arrowCounts.length : 0;

    const played = playedCardIdsByPlayer[setup.id] ?? new Set<string>();
    neverPlayedCardsByPlayer[setup.id] = setup.deck.filter((id) => !played.has(id));
  }

  const totals = scores.map((s) => s.total);
  const victoryMargin = totals.length > 0 ? Math.max(...totals) - Math.min(...totals) : 0;

  return {
    seed: state.seed,
    config: state.config,
    turnCount: state.turnNumber,
    durationMs,
    winner,
    surrenderedBy: state.surrenderedBy,
    finalScore: scores,
    players: playerSetups.map((p) => ({ id: p.id, captainId: p.captainId, shipId: p.shipId, deck: p.deck })),
    turns: state.log,
    metrics: {
      cargoPlaysByPlayer,
      shipOwnershipChanges,
      firstShipFallTurn,
      dominationsByType,
      largestRouteByPlayer,
      averageArrowsByPlayer,
      neverPlayedCardsByPlayer,
      victoryMargin,
    },
  };
}

/** Ships never change cell, only owner — replay the log against each ship's final
 *  cell to reconstruct exactly when it changed hands and to/from whom. */
function computeShipOwnershipChanges(state: GameState): ShipOwnershipChange[] {
  const currentOwner = new Map<number, PlayerId>();
  for (const cell of state.cells) {
    const content = cell.content;
    if (content?.kind !== 'ship') continue;
    const originalOwner = state.players.find((p) => p.shipId === content.shipId);
    if (originalOwner) currentOwner.set(cell.idx, originalOwner.id);
  }

  const changes: ShipOwnershipChange[] = [];
  for (const event of state.log) {
    for (const result of event.results) {
      const captured = result.type === 'ship-open' || (result.type === 'ship-shielded' && result.dominated);
      if (!captured) continue;

      const cell = state.cells[result.targetIdx];
      if (cell.content?.kind !== 'ship') continue;

      const from = currentOwner.get(result.targetIdx);
      const to = event.player;
      if (from && from !== to) {
        changes.push({ shipId: cell.content.shipId, turnNumber: event.turnNumber, from, to });
      }
      currentOwner.set(result.targetIdx, to);
    }
  }
  return changes;
}
