import type { LockContext, PowerContext } from '../types';

/** Every card effect and every Captain passive enters through these two hooks only. */
export interface EffectHooks {
  modifyOwnPower?: (power: number, ctx: PowerContext) => number;
  modifyOpponentPower?: (power: number, ctx: PowerContext) => number;
  blocksDomination?: (ctx: LockContext) => boolean;
}

export const effectRegistry: Record<string, EffectHooks> = {};

export function registerEffect(id: string, hooks: EffectHooks): void {
  effectRegistry[id] = hooks;
}
