import { useNavigate } from 'react-router-dom';
import type { Config } from '@eltyca/engine';
import { useConfig } from '../game/configStore';

/** Every balance knob from the spec, editable on its own screen — changes apply live to
 *  the shared config, so whatever's set here is what "Start" on the landing page uses. */
export function SettingsPage() {
  const navigate = useNavigate();
  const { config, setConfig } = useConfig();
  const chainUnlimited = config.chainDepth === Infinity;

  function set<K extends keyof Config>(key: K, value: Config[K]) {
    setConfig({ ...config, [key]: value });
  }

  function setGrid(dim: 'width' | 'height', value: number) {
    if (!Number.isFinite(value)) return;
    setConfig({ ...config, grid: { ...config.grid, [dim]: value } });
  }

  function setPowerChart(arrows: string, power: number) {
    if (!Number.isFinite(power)) return;
    setConfig({ ...config, powerChart: { ...config.powerChart, [arrows]: power } });
  }

  return (
    <div className="start-screen">
      <div className="start-hero">
        <h1>Configurações</h1>
        <p className="start-tagline">Todos os ajustes de balanceamento da especificação, num só lugar</p>
      </div>

      <p className="config-intro">
        Campos marcados "não conectado" são salvos e exportados com a telemetria, mas ainda não mudam a resolução das jogadas.
      </p>

      <section>
        <h2>Tabuleiro</h2>
        <label>
          Largura
          <input type="number" min={3} value={config.grid.width} onChange={(e) => setGrid('width', Number(e.target.value))} />
        </label>
        <label>
          Altura
          <input type="number" min={3} value={config.grid.height} onChange={(e) => setGrid('height', Number(e.target.value))} />
        </label>
        <label>
          Abismos (índices de casa separados por vírgula)
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
        <h2>Mão &amp; baralho</h2>
        <label>
          Tamanho máximo da mão
          <input
            type="number"
            min={1}
            value={config.maxHandSize}
            onChange={(e) => set('maxHandSize', Number(e.target.value))}
          />
        </label>
        <label>
          Tamanho do baralho <span className="knob-note">(não conectado — os baralhos vêm direto da preparação dos jogadores)</span>
          <input type="number" min={1} value={config.deckSize} onChange={(e) => set('deckSize', Number(e.target.value))} />
        </label>
      </section>

      <section>
        <h2>Combate &amp; pontuação</h2>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={config.tieKeepsDefender}
            onChange={(e) => set('tieKeepsDefender', e.target.checked)}
          />
          Empate mantém o defensor
        </label>
        <label>
          Profundidade da cadeia
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
          Profundidade de cadeia ilimitada
        </label>
        <label>
          Bônus de rota
          <input type="number" min={0} value={config.routeBonus} onChange={(e) => set('routeBonus', Number(e.target.value))} />
        </label>
      </section>

      <section>
        <h2>Navio</h2>
        <label className="checkbox">
          <input type="checkbox" checked={config.shipOnEdge} onChange={(e) => set('shipOnEdge', e.target.checked)} />
          Navio pode ser colocado na borda
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={config.shipRotatable} disabled />
          Navio pode ser rotacionado <span className="knob-note">(não conectado — o regras_v0.9.md trata isso como absoluto)</span>
        </label>
        <label>
          Itens escondidos na preparação por jogador
          <input
            type="number"
            min={0}
            value={config.setupHiddenCards}
            onChange={(e) => set('setupHiddenCards', Number(e.target.value))}
          />
        </label>
      </section>

      <section>
        <h2>Carga</h2>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={config.discardCanBeCargo}
            onChange={(e) => set('discardCanBeCargo', e.target.checked)}
          />
          Descarte pode ser outra Carga quando não sobrar carta comum
        </label>
      </section>

      <section>
        <h2>
          Draft <span className="knob-note">(toda partida usa o Porto — isto controla o conjunto de draft compartilhado)</span>
        </h2>
        <label>
          Cartas abertas por rodada
          <input
            type="number"
            min={1}
            value={config.draftPerRound}
            onChange={(e) => set('draftPerRound', Number(e.target.value))}
          />
        </label>
        <label>
          Rodadas de draft
          <input type="number" min={1} value={config.draftRounds} onChange={(e) => set('draftRounds', Number(e.target.value))} />
        </label>
      </section>

      <section>
        <h2>
          Gabarito de criação de carta <span className="knob-note">(referência apenas de design, nunca lida em tempo real)</span>
        </h2>
        <div className="power-chart-grid">
          {Object.entries(config.powerChart).map(([arrows, power]) => (
            <label key={arrows}>
              {arrows} setas
              <input type="number" value={power} onChange={(e) => setPowerChart(arrows, Number(e.target.value))} />
            </label>
          ))}
        </div>
        <label>
          Custo do modificador
          <input type="number" value={config.modifierCost} onChange={(e) => set('modifierCost', Number(e.target.value))} />
        </label>
        <label>
          Custo da trava
          <input type="number" value={config.lockCost} onChange={(e) => set('lockCost', Number(e.target.value))} />
        </label>
      </section>

      <button type="button" className="confirm" onClick={() => void navigate('/')}>
        Voltar ao menu
      </button>
    </div>
  );
}
