export * from './types';
export { OFFSET, opposite } from './constants';
export { effectiveArrows } from './rotation';
export { loadConfig } from './config';
export { isOnEdge } from './util/grid';

export { registerEffect, effectRegistry, type EffectHooks } from './effects/registry';

export { isCaptainSilenced } from './rules/silencing';
export { effectivePower } from './rules/effectivePower';
export { canBeDominated } from './rules/canBeDominated';
export { refillHand, removeCardFromHand, removeCargoFromHand, playCargo } from './rules/hand';
export { resolvePlacement, type PlacementOptions } from './rules/resolvePlacement';
export { placeInSetup, revealSetup, type SetupItem } from './rules/setup';
export { playTurn, isGameOver, surrender } from './rules/turn';
export { createInitialState, type PlayerSetup } from './rules/initialState';
export {
  isShipPlaced,
  hiddenItemsPlacedCount,
  effectiveHiddenCargoTarget,
  isSetupDoneForPlayer,
  isSetupDoneForAll,
  nextSetupPlayer,
} from './rules/setupProgress';
export { redactGameStateForPlayer, type RedactedGameState, type RedactedCell, type RedactedCellContent, type RedactedPlayer, type RedactedHandItem } from './rules/redact';
export {
  createDraftState,
  pickCaptain,
  pickShip,
  pickCard,
  toPlayerSetups,
  type DraftState,
  type DraftPlayerState,
} from './rules/draft';
export { largestRoute, routeBonusWinner } from './rules/route';
export { computeScores, determineWinner, type Score } from './rules/scoring';
export { formatLogEvent } from './rules/log';

export { computeTelemetry, type MatchTelemetry, type ShipOwnershipChange } from './telemetry/computeTelemetry';
export { toTelemetryRow, rowsToCsv, type TelemetryRow } from './telemetry/csv';
export { telemetryToJson } from './telemetry/serialize';

export { randomBot, greedyBot, routeBot, BOTS, BOT_NAMES, type Bot, type BotContext, type BotMove, type BotName } from './bots';
export { randomSetupForPlayer } from './simulation/randomSetup';
export { runMatch, type MatchRunOptions, type MatchRunResult } from './simulation/runMatch';
export { runBatch, type BatchOptions, type BatchResult } from './simulation/runBatch';
export { summarizeBatch, type BatchSummary } from './simulation/summarize';

export {
  sampleCards,
  sampleCaptains,
  sampleShips,
  sampleDeckP1,
  sampleDeckP2,
  sampleContent,
  samplePlayerSetups,
} from './content';
