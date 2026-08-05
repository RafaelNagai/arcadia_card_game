import type { PlayerId, RedactedGameState } from '@eltyca/engine';

export interface GamePlaceholderProps {
  game: RedactedGameState;
  you: PlayerId;
}

/** Stands in for real online gameplay (setup/main-phase interaction) until the next phase
 *  wires LiveMatch up to a redacted, server-synced GameState. This exists so the draft ->
 *  game transition is visible and verifiable end-to-end right now, not because it's meant
 *  to be played from. */
export function GamePlaceholder({ game, you }: GamePlaceholderProps) {
  const me = game.players.find((p) => p.id === you)!;
  const opponent = game.players.find((p) => p.id !== you)!;

  return (
    <div className="start-screen">
      <div className="start-hero">
        <h1>Match started</h1>
        <p className="start-tagline">Online gameplay lands in the next update — phase: {game.phase}</p>
      </div>

      <section>
        <h2>You ({you})</h2>
        <p>Captain: {me.captainId} · Ship: {me.shipId}</p>
        <p>Hand: {me.hand.length} items · Deck: {Array.isArray(me.deck) ? me.deck.length : me.deck.length}</p>
      </section>

      <section>
        <h2>Opponent ({opponent.id})</h2>
        <p>Captain: {opponent.captainId} · Ship: {opponent.shipId}</p>
        <p>Hand: {opponent.hand.length} items (contents hidden) · Deck: {Array.isArray(opponent.deck) ? opponent.deck.length : opponent.deck.length} cards (hidden)</p>
      </section>
    </div>
  );
}
