import type { PlayerId } from '@eltyca/engine';

/**
 * Lobby-only for now (Phase 2 of the online-multiplayer rollout — see the project plan):
 * connect, get assigned a player slot, know whether the opponent is connected. Draft and
 * game messages join this union in later phases; nothing sent by the client yet beyond the
 * connection itself (clientId travels as a query param, not a message — see room.ts).
 */
export type ServerMessage =
  | { type: 'welcome'; you: PlayerId; opponentConnected: boolean }
  | { type: 'room-update'; opponentConnected: boolean }
  | { type: 'error'; message: string };
