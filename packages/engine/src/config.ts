import type { Config } from './types';
import defaultConfigJson from '../config/config.default.json';

const defaultConfig = defaultConfigJson as Config;

/** Every balance knob comes from here — nothing the test list might want to tweak is ever hardcoded in a rule module. */
export function loadConfig(overrides?: Partial<Config>): Config {
  if (!overrides) return { ...defaultConfig, powerChart: { ...defaultConfig.powerChart } };

  const { powerChart, ...rest } = overrides;
  return {
    ...defaultConfig,
    ...rest,
    powerChart: { ...defaultConfig.powerChart, ...(powerChart ?? {}) },
  };
}
