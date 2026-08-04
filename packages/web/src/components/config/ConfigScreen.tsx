import { useState } from 'react';
import type { Config } from '@eltyca/engine';

export interface ConfigScreenProps {
  initialConfig: Config;
  onStart: (config: Config) => void;
}

/** Every balance knob from prototipo_web.md's config.json, editable before a match starts. */
export function ConfigScreen({ initialConfig, onStart }: ConfigScreenProps) {
  const [config, setConfig] = useState(initialConfig);
  const chainUnlimited = config.chainDepth === Infinity;

  function set<K extends keyof Config>(key: K, value: Config[K]) {
    setConfig((c) => ({ ...c, [key]: value }));
  }

  function setGrid(dim: 'width' | 'height', value: number) {
    if (!Number.isFinite(value)) return;
    setConfig((c) => ({ ...c, grid: { ...c.grid, [dim]: value } }));
  }

  function setPowerChart(arrows: string, power: number) {
    if (!Number.isFinite(power)) return;
    setConfig((c) => ({ ...c, powerChart: { ...c.powerChart, [arrows]: power } }));
  }

  return (
    <div className="config-screen">
      <h1>ELTYCA — Prototype</h1>
      <p className="config-intro">
        Every balance knob from the spec, in one place. Fields marked "not wired" are saved and exported with
        telemetry but don't change resolution yet.
      </p>

      <section>
        <h2>Board</h2>
        <label>
          Width
          <input type="number" min={3} value={config.grid.width} onChange={(e) => setGrid('width', Number(e.target.value))} />
        </label>
        <label>
          Height
          <input type="number" min={3} value={config.grid.height} onChange={(e) => setGrid('height', Number(e.target.value))} />
        </label>
        <label>
          Chasms (comma-separated cell indices)
          <input
            type="text"
            defaultValue={config.chasms.join(', ')}
            onBlur={(e) =>
              set(
                'chasms',
                e.target.value
                  .split(',')
                  .map((s) => Number(s.trim()))
                  .filter((n) => Number.isFinite(n))
              )
            }
          />
        </label>
      </section>

      <section>
        <h2>Hand &amp; deck</h2>
        <label>
          Max hand size
          <input
            type="number"
            min={1}
            value={config.maxHandSize}
            onChange={(e) => set('maxHandSize', Number(e.target.value))}
          />
        </label>
        <label>
          Deck size <span className="knob-note">(not wired — decks come from the player setup directly)</span>
          <input type="number" min={1} value={config.deckSize} onChange={(e) => set('deckSize', Number(e.target.value))} />
        </label>
      </section>

      <section>
        <h2>Combat &amp; scoring</h2>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={config.tieKeepsDefender}
            onChange={(e) => set('tieKeepsDefender', e.target.checked)}
          />
          Tie keeps the defender
        </label>
        <label>
          Chain depth
          <input
            type="number"
            min={0}
            disabled={chainUnlimited}
            value={chainUnlimited ? '' : config.chainDepth}
            onChange={(e) => set('chainDepth', Number(e.target.value))}
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={chainUnlimited}
            onChange={(e) => set('chainDepth', e.target.checked ? Infinity : 1)}
          />
          Unlimited chain depth
        </label>
        <label>
          Route bonus
          <input type="number" min={0} value={config.routeBonus} onChange={(e) => set('routeBonus', Number(e.target.value))} />
        </label>
      </section>

      <section>
        <h2>Ship</h2>
        <label className="checkbox">
          <input type="checkbox" checked={config.shipOnEdge} onChange={(e) => set('shipOnEdge', e.target.checked)} />
          Ship can be placed on the edge
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={config.shipRotatable} disabled />
          Ship is rotatable <span className="knob-note">(not wired — regras_v0.9.md treats this as absolute)</span>
        </label>
        <label>
          Hidden setup items per player
          <input
            type="number"
            min={0}
            value={config.setupHiddenCards}
            onChange={(e) => set('setupHiddenCards', Number(e.target.value))}
          />
        </label>
      </section>

      <section>
        <h2>Cargo</h2>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={config.discardCanBeCargo}
            onChange={(e) => set('discardCanBeCargo', e.target.checked)}
          />
          Discard can be another Cargo once no common card is left
        </label>
      </section>

      <section>
        <h2>
          Draft <span className="knob-note">(Porto mode not implemented — this build only plays Route/constructed decks)</span>
        </h2>
        <label>
          Cards opened per round
          <input
            type="number"
            min={1}
            value={config.draftPerRound}
            onChange={(e) => set('draftPerRound', Number(e.target.value))}
          />
        </label>
        <label>
          Draft rounds
          <input type="number" min={1} value={config.draftRounds} onChange={(e) => set('draftRounds', Number(e.target.value))} />
        </label>
      </section>

      <section>
        <h2>
          Card-creation chart <span className="knob-note">(design-time reference only, never read at runtime)</span>
        </h2>
        <div className="power-chart-grid">
          {Object.entries(config.powerChart).map(([arrows, power]) => (
            <label key={arrows}>
              {arrows} arrows
              <input type="number" value={power} onChange={(e) => setPowerChart(arrows, Number(e.target.value))} />
            </label>
          ))}
        </div>
        <label>
          Modifier cost
          <input type="number" value={config.modifierCost} onChange={(e) => set('modifierCost', Number(e.target.value))} />
        </label>
        <label>
          Lock cost
          <input type="number" value={config.lockCost} onChange={(e) => set('lockCost', Number(e.target.value))} />
        </label>
      </section>

      <button type="button" className="confirm" onClick={() => onStart(config)}>
        Start match
      </button>
    </div>
  );
}
