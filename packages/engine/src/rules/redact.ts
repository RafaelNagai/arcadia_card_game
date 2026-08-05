import type { Cell, CellContent, GameState, HandItem, Player, PlayerId } from '../types';

export type RedactedHandItem = { kind: 'card' } | { kind: 'cargo' };

/** Everything CellContent already allows, plus a fourth case for "something's buried here
 *  and you're not allowed to know what" — deliberately not a new arm on CellContent itself,
 *  since that type is pattern-matched all over the engine (resolvePlacement, canBeDominated,
 *  ...) against data that never actually contains this case: redaction only ever happens at
 *  the network-broadcast boundary, never inside the engine's own real, authoritative state. */
export type RedactedCellContent = CellContent | { kind: 'hidden'; owner: PlayerId };

export type RedactedCell = Omit<Cell, 'content'> & { content: RedactedCellContent };

export type RedactedPlayer = Omit<Player, 'hand' | 'deck'> & {
  hand: HandItem[] | RedactedHandItem[];
  deck: string[] | { length: number };
};

export type RedactedGameState = Omit<GameState, 'cells' | 'players' | 'seed'> & {
  cells: RedactedCell[];
  players: RedactedPlayer[];
  /** Present only once phase === 'end' — see redactGameStateForPlayer's doc comment. */
  seed?: number;
};

function ownerOf(content: NonNullable<CellContent>): PlayerId {
  switch (content.kind) {
    case 'card':
      return content.owner;
    case 'ship':
      return content.owner;
    case 'cargo':
      return content.placedBy;
  }
}

function redactCell(cell: Cell, viewerId: PlayerId): RedactedCell {
  if (cell.hiddenUntil === 'setup' && cell.content && ownerOf(cell.content) !== viewerId) {
    // Hiding just the identity wouldn't be enough — knowing it's specifically a Ship (as
    // opposed to Cargo) is itself a major strategic leak, so `kind` gets scrubbed too.
    return { ...cell, content: { kind: 'hidden', owner: ownerOf(cell.content) } };
  }
  return cell;
}

function redactPlayer(player: Player, viewerId: PlayerId): RedactedPlayer {
  if (player.id === viewerId) return player;
  return {
    ...player,
    hand: player.hand.map((item): RedactedHandItem => (item.kind === 'cargo' ? { kind: 'cargo' } : { kind: 'card' })),
    deck: { length: player.deck.length },
  };
}

/**
 * Server-side redaction boundary: strips whatever `viewerId` genuinely isn't allowed to see
 * yet, for real — this is what actually goes out over the wire, so inspecting network
 * traffic reveals nothing extra, unlike hot-seat's "hidden" cells and hands, which are only
 * ever hidden by client-side rendering discipline. Only ever called at the point a server
 * broadcasts state to a specific connection; the engine's own internal logic and local
 * hot-seat play always operate on the real, unredacted GameState.
 */
export function redactGameStateForPlayer(state: GameState, viewerId: PlayerId): RedactedGameState {
  // Nothing is left to hide once the match is over — computeTelemetry needs full-fidelity
  // hand/deck data for both players (average arrows, cards never played, etc.), same as
  // flipping every card face-up at the end of a physical round.
  if (state.phase === 'end') {
    return { ...state };
  }

  return {
    config: state.config,
    grid: state.grid,
    cells: state.cells.map((cell) => redactCell(cell, viewerId)),
    players: state.players.map((player) => redactPlayer(player, viewerId)),
    turnPlayer: state.turnPlayer,
    phase: state.phase,
    turnNumber: state.turnNumber,
    log: state.log, // every entry is a placement that already happened in the open
    // Always null here — surrender() sets phase to 'end' in the same update, so a
    // surrendered match always hits the branch above instead, never this one.
    surrenderedBy: state.surrenderedBy,
    // Deck order is a deterministic function of `seed` (shuffle(deck, createRng(seed))) —
    // deck *membership* is already public (the Porto draft is drafted face-up), so leaking
    // the seed would let a motivated client recompute the opponent's exact draw order even
    // with Player.deck redacted above. Omitted entirely until phase 'end' (handled above),
    // when there's nothing left to protect.
  };
}
