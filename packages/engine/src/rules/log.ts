import type { DirectionResult, GameContent, LogEvent } from '../types';

/** Turns a structured LogEvent into the one-line text the CLI and the UI log both render. */
export function formatLogEvent(event: LogEvent, content: GameContent): string {
  if (event.placementType === 'cargo') {
    return `${event.player} placed a Cargo at cell ${event.cellIdx}`;
  }
  if (event.placementType === 'ship') {
    return `${event.player} placed their Ship at cell ${event.cellIdx}`;
  }

  const card = event.itemId ? content.cards[event.itemId] : undefined;
  const name = card?.name ?? event.itemId ?? 'a card';
  const rotationDeg = (event.rotation ?? 0) * 90;
  const header = `${event.player} placed ${name} (rot ${rotationDeg}°) at cell ${event.cellIdx}`;

  if (event.results.length === 0) return `${header} -> no captures`;
  return `${header} -> ${event.results.map(describeResult).join(', ')}`;
}

function describeResult(result: DirectionResult): string {
  switch (result.type) {
    case 'boarding':
      return `boarded cell ${result.targetIdx}`;
    case 'clash':
      return `clash at cell ${result.targetIdx} (${result.attackerPower} vs ${result.defenderPower}), ${result.winner} won`;
    case 'ship-open':
      return `Ship at cell ${result.targetIdx} fell (open angle)`;
    case 'ship-shielded':
      return result.dominated
        ? `Ship at cell ${result.targetIdx} fell (${result.attackerPower} vs hull ${result.hull})`
        : `Ship at cell ${result.targetIdx} held (${result.attackerPower} vs hull ${result.hull})`;
    case 'chain':
      return `chain captured cell ${result.targetIdx} from cell ${result.sourceIdx}`;
  }
}
