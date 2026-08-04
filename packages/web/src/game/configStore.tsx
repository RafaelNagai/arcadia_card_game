import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { loadConfig, type Config } from '@eltyca/engine';

interface ConfigContextValue {
  config: Config;
  setConfig: (config: Config) => void;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

/** Shared balance-knob config, readable from the landing page (Start uses it), the
 *  settings page (edits it), and the game page (builds the match from it) — lives above
 *  the router so it survives navigating between routes within a session. */
export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<Config>(() => loadConfig());
  const value = useMemo(() => ({ config, setConfig }), [config]);
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used within a ConfigProvider');
  return ctx;
}
