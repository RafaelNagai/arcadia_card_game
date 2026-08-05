import type { DirectionResult, GameContent, LogEvent } from '../types';

/** Turns a structured LogEvent into the one-line text the CLI and the UI log both render. */
export function formatLogEvent(event: LogEvent, content: GameContent): string {
  if (event.placementType === 'cargo') {
    return `${event.player} colocou uma Carga na casa ${event.cellIdx}`;
  }
  if (event.placementType === 'ship') {
    return `${event.player} colocou o Navio na casa ${event.cellIdx}`;
  }

  const card = event.itemId ? content.cards[event.itemId] : undefined;
  const name = card?.name ?? event.itemId ?? 'uma carta';
  const rotationDeg = (event.rotation ?? 0) * 90;
  const header = `${event.player} colocou ${name} (rot ${rotationDeg}°) na casa ${event.cellIdx}`;

  if (event.results.length === 0) return `${header} -> nenhum domínio`;
  return `${header} -> ${event.results.map(describeResult).join(', ')}`;
}

function describeResult(result: DirectionResult): string {
  switch (result.type) {
    case 'boarding':
      return `abordou a casa ${result.targetIdx}`;
    case 'clash':
      return `confronto na casa ${result.targetIdx} (${result.attackerPower} vs ${result.defenderPower}), ${result.winner} venceu`;
    case 'ship-open':
      return `Navio na casa ${result.targetIdx} caiu (ângulo aberto)`;
    case 'ship-shielded':
      return result.dominated
        ? `Navio na casa ${result.targetIdx} caiu (${result.attackerPower} vs casco ${result.hull})`
        : `Navio na casa ${result.targetIdx} resistiu (${result.attackerPower} vs casco ${result.hull})`;
    case 'chain':
      return `cadeia dominou a casa ${result.targetIdx} a partir da casa ${result.sourceIdx}`;
  }
}
