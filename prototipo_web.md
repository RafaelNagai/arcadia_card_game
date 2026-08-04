# ELTYCA — Protótipo Web

### Especificação técnica, baseada nas Regras v0.9 — **M0 a M3 implementados**

---

## Por que este protótipo existe

Ele não é o jogo. Ele é o **instrumento de medição** do jogo.

O objetivo é responder às sete perguntas da lista de teste das regras com dados em vez de opinião: se a Carga está cara ou barata, se o Navio domina a partida, se a Abordagem é forte demais, se os +3 da rota decidem sozinhos, quanto dura uma partida de verdade.

Isso significa uma inversão de prioridade em relação a um projeto normal: **motor de regras e telemetria vêm antes de qualquer coisa visual.** Uma tela feia que registra tudo vale mais aqui do que uma tela bonita que não mede nada.

Esse instrumento já existe e roda: motor com 46 testes automatizados, três bots, simulação em lote com relatório, e um app jogável com arrastar-e-soltar e telemetria exportável. O resto deste documento descreve o que foi construído — não mais um plano, um relato do que existe.

---

## A decisão de arquitetura que importa

> **O motor de regras é uma função pura, sem nenhuma dependência de UI.**

```
resolvePlacement(state, action) -> newState
```

Sem DOM, sem framework, sem timers, sem aleatoriedade não-semeada. Todo acaso passa por um `seed` guardado no estado.

O motivo não é elegância. É que um motor puro roda **fora do navegador**, e isso libera o modo mais valioso do projeto inteiro: simular partidas com bots antes de convidar um ser humano. Isso já está de pé — `npm run batch` roda centenas de partidas em segundos e cospe taxa de vitória, médias de métrica e um CSV pra planilha.

**Stack escolhida:** TypeScript nos dois pacotes. Monorepo com npm workspaces:

```
arcadia_card_game/
├── package.json                 # workspaces: packages/*
├── tsconfig.base.json
└── packages/
    ├── engine/                  # @eltyca/engine — TS puro, zero UI
    │   ├── src/
    │   │   ├── types.ts, constants.ts, rotation.ts, config.ts
    │   │   ├── rules/           # resolvePlacement, setup, turn, route,
    │   │   │                    # scoring, hand, silencing, initialState, log
    │   │   ├── effects/         # os dois ganchos + exemplos
    │   │   ├── content/         # cartas/capitães/navios/decks de exemplo
    │   │   ├── bots/            # random, greedy, route
    │   │   ├── simulation/      # runMatch, runBatch, summarize
    │   │   ├── telemetry/       # computeTelemetry, csv, serialize
    │   │   └── cli/             # simulateMatch.ts, runBatch.ts
    │   └── test/                # 16 arquivos, 46 testes, Vitest
    └── web/                     # @eltyca/web — Vite + React, consome o engine
        └── src/
            ├── App.tsx, Match.tsx
            ├── reducer/         # gameReducer, drive tudo via ações
            ├── components/      # board, card, hand, panels, log, start, end, hotseat
            ├── hooks/           # useDragPlacement, useCommitAnimations, useRotateShortcut
            └── game/            # setupProgress, dropTargets, captureEffects, theme
```

Scripts principais: `npm test` (motor), `npm run simulate` (uma partida via CLI), `npm run batch -- N` (N partidas por par de bot, CSV no fim), `npm run dev:web` (app jogável).

---

## Escopo

**v1 — jogável e mensurável.** ✅ Feito. Dois jogadores, hot-seat, mesma tela. Sem contas, sem servidor, sem persistência.

**v2 — instrumentado.** ✅ Feito. Painel de configuração com todos os botões de balanceamento (na tela inicial), exportação de telemetria (JSON/CSV, tanto no app quanto no CLI), modo simulação com bots.

**v3 — opcional.** 🟡 Parcial. Os três bots existem e rodam em lote (`runBatch`). Partida por link e coleção persistente **não** foram feitas — continuam fora de escopo.

**Fora de escopo ainda:** arte definitiva, som, layout mobile dedicado, deckbuilding persistente, contas, modo Porto (draft).

---

## Modelo de dados

O código é todo em inglês — os tipos abaixo já são os nomes reais em `packages/engine/src/types.ts`, não uma tradução aproximada.

### Direções

Oito direções, índice 0 a 7, sentido horário a partir do Norte.

```ts
// 0=N  1=NE  2=E  3=SE  4=S  5=SW  6=W  7=NW
const OFFSET: [number, number][] = [
  [-1, 0], [-1, 1], [0, 1], [1, 1],
  [1, 0], [1, -1], [0, -1], [-1, -1]
];

const opposite = (d: number) => (d + 4) % 8;
```

### Rotação

A carta é quadrada: quatro orientações. Cada giro de 90° desloca o padrão **duas posições** no índice.

```ts
type Rotation = 0 | 1 | 2 | 3; // 0°, 90°, 180°, 270°

function effectiveArrows(arrows: boolean[], rot: Rotation): boolean[] {
  const out = new Array(8).fill(false);
  for (let i = 0; i < 8; i++) {
    if (arrows[i]) out[(i + rot * 2) % 8] = true;
  }
  return out;
}
```

### Entidades

```ts
type Element = 'energy' | 'anomaly' | 'paradox' | 'cognitive' | 'astral';
type CardType = 'creature' | 'vessel' | 'npc';

interface Card {
  id: string;
  name: string;
  type: CardType;
  element: Element;
  power: number;
  arrows: boolean[];      // length 8, orientação impressa
  effect?: EffectDef;
  tier: 'E'|'D'|'C'|'B'|'A'|'S'|'SS';
}

interface Ship {
  id: string;
  name: string;
  shields: boolean[];     // length 8
  hull: number;
}

interface Captain {
  id: string;
  name: string;
  cargoSlots: number;     // 2..5
  passive?: EffectDef;
}

// Setup só enterra o Navio ou Carga — carta comum nunca é item de setup.
type SetupItem = { kind: 'cargo' } | { kind: 'ship' };
type HandItem = { kind: 'card'; cardId: string } | { kind: 'cargo' };

type CellContent =
  | { kind: 'card'; cardId: string; rot: Rotation; owner: PlayerId }
  | { kind: 'ship'; shipId: string; owner: PlayerId }   // sem campo rot: nunca gira, estruturalmente
  | { kind: 'cargo'; placedBy: PlayerId }               // neutra: sem dono
  | null;

interface Cell {
  idx: number;             // row * width + column
  chasm: boolean;
  content: CellContent;
  hiddenUntil: 'setup' | null;
}

interface Player {
  id: PlayerId;
  captainId: string;
  shipId: string;
  deck: string[];
  hand: HandItem[];
  cargoRemaining: number;
  discard: string[];
}

interface Config { /* ver seção Configuração */ }

interface GameState {
  config: Config;
  seed: number;
  grid: { width: number; height: number };
  cells: Cell[];
  players: Player[];
  turnPlayer: PlayerId;
  phase: 'choice' | 'draft' | 'setup' | 'main' | 'end';
  turnNumber: number;
  log: LogEvent[];
}
```

O **dono do Navio agora** é o `owner` dentro de `CellContent`. `Player.shipId` guarda de quem o Navio é originalmente — é isso que decide qual Capitão fica silenciado (`rules/silencing.ts::isCaptainSilenced`).

---

## O coração: resolver uma colocação

`packages/engine/src/rules/resolvePlacement.ts`. É a parte com teste automatizado antes de qualquer tela — os 12 testes da lista abaixo cobrem exatamente isso.

```
resolvePlacement(state, content, playerId, cellIdx, item, rotation, options?):

1. Valida: casa vazia, não é abismo, item está na mão.

2. Coloca. Se for Carga: aplica a regra de descarte e reposição
   (rules/hand.ts::playCargo), e ENCERRA. Carga não resolve setas.

3. A = effectiveArrows(card.arrows, rotation)
   Daqui em diante `working` (um clone) É o snapshot: nenhuma captura
   é escrita nele até o fim, todas as comparações leem esse estado.

4. Resolução direta — para cada d em A:
     neighbor = vizinho da casa na direção d
     se inválido, vazio, abismo, carga, ou já é seu -> ignora

     se vizinho é NAVIO adversário:
        se ship.shields[opposite(d)] == false  -> DOMÍNIO (boarding)
        senão: se effectivePower(carta) > ship.hull -> DOMÍNIO
               senão -> nada

     se vizinho é CARTA adversária:
        B = effectiveArrows(cartaAlvo.arrows, rotAlvo)
        se B[opposite(d)] == false -> DOMÍNIO (boarding), não propaga
        senão -> CLASH:
             se effectivePower(carta) > effectivePower(alvo) -> DOMÍNIO, propaga
             senão -> nada (empate mantém com o defensor, salvo tieKeepsDefender=false)

5. Chain — para cada carta dominada por CLASH:
     C = effectiveArrows(dela)
     para cada d em C:
        vizinho adversário, ainda não capturado neste turno,
        sem seta de volta -> DOMÍNIO por chain

   Profundidade controlada por config.chainDepth (1 por padrão, ou Infinity).

6. Nenhuma carta é dominada mais de uma vez no mesmo turno (Set<idx>).

7. Repõe a mão até o limite (rules/hand.ts::refillHand).
```

`resolvePlacement` para exatamente no passo 7 — quem avança `turnPlayer` e detecta fim de partida é uma camada fina acima (`rules/turn.ts::playTurn`), pra manter a função testável isolada. Colocação de Navio/Carga no setup usa `rules/setup.ts::placeInSetup`, que reaproveita a mesma validação de casa mas nunca resolve setas (fica tudo oculto até `revealSetup`).

### Poder efetivo e domínio permitido

```ts
effectivePower(ctx: PowerContext): number
// aplica MODIFICADORES: da própria carta, da carta oposta,
// e do passivo do Capitão do dono — se ele não estiver silenciado.

canBeDominated(ctx: LockContext): boolean
// aplica TRAVAS. Default true.
```

Continuam sendo os dois únicos ganchos (`rules/effectivePower.ts`, `rules/canBeDominated.ts`), apoiados num registry pequeno (`effects/registry.ts`) — cada efeito de carta ou passivo de Capitão é uma função registrada por id, nunca um sistema genérico de gatilhos.

**Silenciamento:** `rules/silencing.ts::isCaptainSilenced` — checa se o Navio original daquele jogador está sob controle adversário antes de aplicar o passivo.

---

## Cálculo da rota

`rules/route.ts::largestRoute`. Mesmo grafo simples, roda só na pontuação final — Navio e Carga nunca entram (Carga porque não tem `owner`, estruturalmente; Navio porque a rota só olha `content.kind === 'card'`).

Bônus de +3 (`config.routeBonus`) só para quem tiver a **maior estritamente** (`routeBonusWinner`). Empate: ninguém leva.

---

## Pontuação

`rules/scoring.ts::computeScores` / `determineWinner`.

```
score(P) = (cartas comuns sob controle de P)
         + (navios sob controle de P)
         + (config.routeBonus se maiorRota(P) for única e máxima)
```

Cargas valem 0. Empate na pontuação final = `'drift'`.

---

## Configuração — todos os botões num arquivo

`packages/engine/config/config.default.json`, carregado por `src/config.ts::loadConfig(overrides?)`. Editável na **tela inicial** do app (todo campo abaixo tem um input lá — os marcados "not wired" existem, são salvos e exportados com a telemetria, mas ainda não mudam a resolução):

```json
{
  "grid": { "width": 5, "height": 5 },
  "chasms": [12],
  "maxHandSize": 7,
  "deckSize": 12,
  "draftPerRound": 4,
  "draftRounds": 3,
  "routeBonus": 3,
  "chainDepth": 1,
  "tieKeepsDefender": true,
  "shipOnEdge": false,
  "shipRotatable": false,
  "discardCanBeCargo": false,
  "setupHiddenCards": 2,
  "powerChart": {
    "2": 10, "3": 9, "4": 8, "5": 7, "6": 6, "7": 5, "8": 4
  },
  "modifierCost": 2,
  "lockCost": 4
}
```

`deckSize`, `draftPerRound`, `draftRounds`, `shipRotatable`, `powerChart`, `modifierCost`, `lockCost` ainda não são lidos em runtime (deck vem direto do `PlayerSetup`; draft e rotação de Navio não estão implementados; o gabarito de poder é ferramenta de criação de carta, nunca consultada durante a partida). `discardCanBeCargo` **é lido** — relaxa a trava "descarte nunca pode ser Carga" quando não sobra carta comum na mão.

---

## Telemetria — o que registrar em toda partida

Implementado em `telemetry/computeTelemetry.ts`, chamado uma vez por partida (no CLI e no app, no início da sequência de fim de partida).

**Da partida:** seed, config usada, capitães/navios/decks de cada jogador, vencedor, placar final, número de turnos, duração real, log turno a turno (já no formato usado pra montar o texto de replay).

**Do que a gente quer saber:**

| Métrica | Responde qual pergunta |
|---|---|
| Cargas jogadas por jogador e em que turno | Carga está cara ou barata |
| Quantas vezes o Navio trocou de dono, e em que turnos | O Navio vira o jogo inteiro |
| Turno da primeira queda de cada Navio | Casco está na faixa certa |
| Domínios por Abordagem vs por Confronto vs por Cadeia | Abordagem é forte demais |
| Tamanho da maior rota de cada jogador | Os +3 decidem sozinhos |
| Média de setas do deck vencedor vs perdedor | O gabarito está inclinado |
| Cartas nunca jogadas | Cartas mortas no set |
| Margem de vitória | Partidas apertadas ou atropelo |

Exportação: `telemetry/csv.ts` (`toTelemetryRow`, `rowsToCsv`) e `telemetry/serialize.ts` (`telemetryToJson`, preserva `Infinity` como string legível). No app, os botões "Download JSON"/"Download CSV" ficam na tela de **Analysis** (ver Interface). No CLI, `runBatch.ts` escreve um CSV com uma linha por partida de todo o lote.

---

## Modo simulação

`simulation/runMatch.ts` (uma partida headless: setup aleatório + bots no turno principal) e `simulation/runBatch.ts` (N partidas, agregado via `summarize.ts`). `npm run batch -- N` roda os 3×3 pares de bot e escreve o CSV combinado.

**Bots implementados** (`bots/`), do mais burro ao menos:

1. **`randomBot`** — casa e rotação sorteadas. Linha de base: se um deck vence outro consistentemente contra ele, o desbalanceamento é do deck, não do jogador.
2. **`greedyBot`** — testa toda combinação (item × casa × rotação) através do próprio `resolvePlacement` especulativo e fica com a que mais domina cartas nesse turno. Mede se "abordagem é forte demais".
3. **`routeBot`** — mesma busca, pontuando por `largestRoute` em vez de domínios. Mede se os +3 valem a pena.

Os dois últimos compartilham a busca por força bruta (`bots/scoreSearch.ts::bestMoveByScore`) — nenhuma heurística duplicando lógica do motor, só o motor pontuando os próprios resultados especulativos.

Uma leitura real já feita com essa ferramenta (config padrão, 20 partidas por par): `routeBot` bate `randomBot` 100% das vezes; `greedyBot` bate `routeBot` 65/35. Já é sinal, não é medo.

---

## Interface — o que existe hoje

### Tela inicial

`components/start/StartScreen.tsx`. Título grande + tagline, seguido de todos os knobs de balanceamento do arquivo de config, seção por seção (Board, Hand & deck, Combat & scoring, Ship, Cargo, Draft, Card-creation chart). Botão "Start match" cria a partida com esse config.

### Setup

Cada jogador enterra o Navio (nunca na borda) e `config.setupHiddenCards` Cargas (nunca carta comum — a Carga que sobrar continua jogável no turno principal). **Alterna peça a peça** (`game/setupProgress.ts::nextSetupPlayer`): quem colocou menos peças até agora joga a seguir, empate resolvido pela ordem fixa dos jogadores. Um jogador que termina antes (Capitão com pouca Carga) simplesmente some da alternância e o outro termina sozinho, sem handoff redundante.

### Tabuleiro e mão — arrastar e soltar

Arraste a carta/Navio/Carga da mão até uma casa (`hooks/useDragPlacement.ts`). Scroll do mouse **ou** tecla `R` giram a carta enquanto ela está sendo arrastada. O clique clássico (selecionar → clicar na casa → confirmar) continua funcionando em paralelo, como caminho alternativo — os dois convergem pras mesmas ações do reducer.

Antes de soltar, o tabuleiro já mostra em **overlay** o que aquela colocação vai capturar — não é um recurso à parte, é a própria `resolvePlacement` chamada de forma especulativa (`resolverColocação(estado_atual, ...)`, resultado nunca commitado a menos que o jogador solte ali).

### Animações

Três efeitos, todos derivados por diff (nenhuma mudança no motor pra existir):

- **Drop** — qualquer casa que passa de vazia pra ocupada faz um bounce de entrada (setup ou turno principal).
- **Dominada** — flash vermelho em cada casa realmente capturada pela última jogada.
- **Dominando** — pulso verde na casa de quem acabou de capturar algo.

### Painéis, log, hot-seat

Capitão e Navio de cada jogador nas laterais, com indicador de **silenciado**. Log de turno em texto corrido (`formatLogEvent`), uma linha por evento. Tela de "passe o dispositivo" entre turnos e a cada peça do setup, escondendo a mão/decisão até a revelação.

### Fim de partida — três telas

1. **Contagem** (`ScoreCountingScreen`) — o total de cada jogador sobe de 0 até o valor real em paralelo, ~1.2s, avança sozinho.
2. **Vencedor** (`WinnerScreen`) — só o resultado e os placares, limpo. Botões "Analyze" e "New match".
3. **Análise** (`AnalysisScreen`) — atrás do botão "Analyze": resumo de telemetria, downloads JSON/CSV, log completo. "Back to result" volta pro vencedor sem recalcular nada (mesma telemetria computada uma vez em `EndSequence`).

---

## Testes automatizados

✅ Escritos primeiro, como planejado — `packages/engine/test/`, 16 arquivos, 46 testes, Vitest. Os 12 originais (um por regra que mudou de ideia pelo menos uma vez):

1. Seta contra carta sem seta de volta → domínio, sem propagação. (`boardingCard.test.ts`)
2. Seta contra seta → confronto; empate mantém com o defensor. (`clashCard.test.ts`)
3. Cadeia: só a partir de vitória em confronto, profundidade 1, sem capturar duas vezes. (`chain.test.ts`)
4. Rotação: padrão de setas desloca 2 índices por giro; 4 giros voltam ao original. (`rotation.test.ts`)
5. Navio: ângulo sem escudo cai sempre, ângulo com escudo exige poder estritamente maior que o Casco. (`shipResolution.test.ts`)
6. Navio não pode ser colocado na borda; nunca é rotacionado (estrutural); nunca propaga cadeia; nunca entra em rota. (`shipPlacement.test.ts`)
7. Navio pode ser dominado em turnos consecutivos, e o passivo do Capitão liga e desliga junto. (`captainSilencing.test.ts`)
8. Carga: neutra, não pode ser dominada, não pontua, não entra em rota. (`cargoNeutral.test.ts`)
9. Carga jogada obriga descarte de carta comum — nunca de outra Carga — e repõe a mão até o limite. (`cargoDiscard.test.ts`)
10. Mão nunca passa do limite; deck vazio não trava o turno. (`handLimit.test.ts`)
11. Rota: componente conexa por setas mútuas; empate na maior rota não dá bônus a ninguém. (`route.test.ts`)
12. Pontuação final bate com a contagem manual num tabuleiro montado à mão. (`scoring.test.ts`)

Mais: `telemetry.test.ts`, `bots.test.ts`, `simulation.test.ts`, `setupCargoOnly.test.ts` (a regra de setup só-Carga, incluindo o caso de borda de Capitão com pouca Carga).

---

## Marcos

**M0 — Motor + testes.** ✅ Feito. Roda no terminal (`npm run simulate`), resolve uma partida inteira via script.

**M1 — Hot-seat jogável.** ✅ Feito, e evoluído depois: tabuleiro, mão, rotação e overlay de previsão continuam, mas a interação virou arrastar-e-soltar (clique ainda funciona em paralelo), ganhou animações de captura, uma tela inicial de verdade, e o setup passou a alternar peça a peça em vez de jogador a jogador.

**M2 — Config + telemetria.** ✅ Feito. Painel de knobs (tela inicial), exportação JSON/CSV, tela de agregação (Analysis, atrás de um botão pra manter a tela de resultado limpa).

**M3 — Simulação.** ✅ Feito. Os três bots, execução em lote (`npm run batch`), relatório com win rate e médias por métrica.

**M4 — Opcional.** Não feito: bot melhor, partida por link, coleção persistente.

**Depois do M1, em rodadas de ajuste pós-playtest:** a regra de setup mudou de "2 itens quaisquer da mão" pra "só Carga, quantidade capada pela Carga disponível" (removeu o blefe original, decisão consciente do design); drag-and-drop com giro por scroll/tecla substituiu o clique como interação principal; animações de queda/domínio/dominação; setup passou a alternar por peça; fim de partida virou uma sequência de três telas em vez de uma só.

O protótipo cumpriu a função dele quando você conseguir dizer, com número, quais dos sete itens da lista de teste eram problema de verdade — e quais eram medo. `npm run batch` já dá o primeiro pedaço dessa resposta de graça.

---

## Processo de commits

Commitar faseado, nunca um commit gigante com "motor inteiro" ou "app inteiro". Cada commit é uma unidade de trabalho que dá pra entender e reverter sozinha — por exemplo: um passo do algoritmo de `resolvePlacement` com seus testes, um grupo de componentes de UI relacionados, uma correção específica encontrada ao testar no navegador. Preferir várias mensagens pequenas e claras a uma só que resume tudo.
