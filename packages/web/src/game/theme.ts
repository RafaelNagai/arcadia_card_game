import type { Element, PlayerId } from '@eltyca/engine';

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
