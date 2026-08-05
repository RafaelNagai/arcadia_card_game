import type { CardType, Element, PlayerId } from '@eltyca/engine';

export const PLAYER_COLORS: Record<PlayerId, string> = {
  P1: '#3b82f6',
  P2: '#ef4444',
};

export const ELEMENT_COLORS: Record<Element, string> = {
  energy: '#f59e0b',
  anomaly: '#ec4899',
  paradox: '#8b5cf6',
  cognitive: '#38bdf8',
  astral: '#34d399',
};

// Display-only labels — the engine's Element/CardType enum values stay in English (they're
// the wire/content format), this is purely what gets rendered on screen.
export const ELEMENT_LABELS: Record<Element, string> = {
  energy: 'Energia',
  anomaly: 'Anomalia',
  paradox: 'Paradoxo',
  cognitive: 'Cognitivo',
  astral: 'Astral',
};

export const TYPE_LABELS: Record<CardType, string> = {
  creature: 'Criatura',
  vessel: 'Embarcação',
  npc: 'NPC',
};
