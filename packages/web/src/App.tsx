import { useState } from 'react';
import { loadConfig, type Config } from '@eltyca/engine';
import { StartScreen } from './components/start/StartScreen';
import Match from './Match';

export default function App() {
  const [config, setConfig] = useState<Config | null>(null);

  if (!config) {
    return <StartScreen initialConfig={loadConfig()} onStart={setConfig} />;
  }

  return <Match config={config} onNewMatch={() => setConfig(null)} />;
}
