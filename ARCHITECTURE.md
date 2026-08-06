# ELTYCA — Arquitetura técnica

### Baseado no GDD (design + regras). Hot-seat, draft Porto, multiplayer online real e deploy — todos implementados.

---

## O que este projeto é hoje

ELTYCA começou como um instrumento de medição (um protótipo pra validar as regras com dados de simulação antes de qualquer coisa visual) e evoluiu, deliberadamente, para o jogo de verdade: arte por carta, capitão e navio, modo Porto (draft), partida online real com sala por código, e desistência. A engenharia por trás continua a mesma — motor puro, testado, simulável — mas o objetivo não é mais só medir, é ser jogado.

Este documento descreve a arquitetura como ela existe agora, não um plano. Pra regras de jogo (o "porquê" de cada mecânica), ver [GDD.md](GDD.md) § 5 em diante. Pra convenções de como trabalhar neste repositório, ver [CLAUDE.md](CLAUDE.md).

---

## A decisão de arquitetura que importa

> **O motor de regras é uma função pura, sem nenhuma dependência de UI, rede ou DOM.**

```
resolvePlacement(state, content, playerId, cellIdx, item, rotation) -> newState
```

Todo acaso passa por um `seed` guardado no estado. Isso não é elegância — é o que permite o motor rodar **fora do navegador**: simular partidas com bots antes de convidar um humano (`npm run batch`), e mais tarde, rodar dentro de um Durable Object da Cloudflare sem nenhuma adaptação (o servidor de multiplayer chama exatamente as mesmas funções que o reducer local do hot-seat chama).

**Stack:** TypeScript em todos os pacotes. Monorepo com npm workspaces, três pacotes:

```
arcadia_card_game/
├── package.json                    # workspaces: packages/*
├── tsconfig.base.json
├── GDD.md                           # design + regras do jogo (fonte da verdade de design)
├── ARCHITECTURE.md                 # este arquivo
├── CLAUDE.md                       # guia de convenções pro Claude Code
└── packages/
    ├── engine/                     # @eltyca/engine — TS puro, zero UI, zero rede
    │   ├── src/
    │   │   ├── types.ts, constants.ts, rotation.ts, config.ts
    │   │   ├── rules/              # resolvePlacement, setup, turn (+ surrender), route,
    │   │   │                       # scoring, hand, silencing, initialState, log,
    │   │   │                       # redact (sigilo), draft (Porto), setupProgress
    │   │   ├── effects/            # os dois ganchos + exemplos (efeitos de carta/passivas)
    │   │   ├── content/            # cards.json, ships.json, captains.json (dados, não código)
    │   │   ├── bots/                # random, greedy, route
    │   │   ├── simulation/          # runMatch, runBatch, summarize
    │   │   ├── telemetry/           # computeTelemetry, csv, serialize
    │   │   └── cli/                 # simulateMatch.ts, runBatch.ts
    │   └── test/                    # 21 arquivos, Vitest
    │
    ├── server/                     # @eltyca/server — multiplayer online
    │   ├── wrangler.jsonc          # config de deploy: Durable Object binding + migração SQLite
    │   ├── src/
    │   │   ├── server.ts           # EltycaRoom — o Durable Object (partyserver)
    │   │   ├── protocol.ts         # ClientMessage / ServerMessage (contrato de rede)
    │   │   ├── applyAction.ts      # mensagem validada -> novo estado (chama o engine direto)
    │   │   ├── room.ts             # estado persistido da sala, atribuição de slot P1/P2
    │   │   ├── setupProgress.ts    # resumo de progresso do setup pro cliente
    │   │   └── validate.ts         # validação que o engine não faz sozinho (turno do setup)
    │   └── test/                   # vitest, mesmo padrão do engine
    │
    └── web/                        # @eltyca/web — Vite + React
        ├── wrangler.jsonc          # config de deploy: Worker de assets estáticos
        └── src/
            ├── App.tsx              # rotas: /, /settings, /game, /online, /online/:code
            ├── Match.tsx            # orquestrador pré-jogo hot-seat (choice -> draft)
            ├── LiveMatch.tsx        # componente controlado — usado por hot-seat E online
            ├── LiveMatchHost.tsx    # dono do reducer local, só hot-seat
            ├── reducer/             # gameReducer, draftReducer — mesmas ações nos dois modos
            ├── hooks/useOnlineMatch.ts  # conecta ao servidor, troca dispatch local por rede
            ├── components/          # board, card, hand, panels, log, draft, end, hotseat,
            │                        # online (lobby/sala), settings (desistir)
            └── game/                 # setupProgress, dropTargets, captureEffects, theme,
                                       # clientId (localStorage), roomCode
```

Scripts principais: ver [CLAUDE.md](CLAUDE.md#commands).

---

## Modelo de dados

O código é todo em inglês — os tipos abaixo são os nomes reais em `packages/engine/src/types.ts`.

### Direções e rotação

Oito direções, índice 0 a 7, sentido horário a partir do Norte. Cada giro de 90° desloca o padrão de setas duas posições no índice.

```ts
// 0=N  1=NE  2=E  3=SE  4=S  5=SW  6=W  7=NW
type Rotation = 0 | 1 | 2 | 3;
function effectiveArrows(arrows: boolean[], rot: Rotation): boolean[] { /* desloca rot*2 */ }
```

### Entidades

```ts
type Element = 'energy' | 'anomaly' | 'paradox' | 'cognitive' | 'astral';
type CardType = 'creature' | 'vessel' | 'npc';

interface Card {
  id: string; name: string; type: CardType; element: Element; power: number;
  arrows: boolean[];       // length 8, orientação impressa
  effect?: EffectDef;
  tier: 'E'|'D'|'C'|'B'|'A'|'S'|'SS';
  imageUrl: string;        // caminho em packages/web/public/, ex: "/creatures/creature-01.jpg"
}

interface Ship {
  id: string; name: string; shields: boolean[]; hull: number; imageUrl: string;
}

interface Captain {
  id: string; name: string; cargoSlots: number; passive?: EffectDef; imageUrl: string;
}

type SetupItem = { kind: 'cargo' } | { kind: 'ship' };
type HandItem = { kind: 'card'; cardId: string } | { kind: 'cargo' };

type CellContent =
  | { kind: 'card'; cardId: string; rot: Rotation; owner: PlayerId }
  | { kind: 'ship'; shipId: string; owner: PlayerId }   // sem rot: nunca gira
  | { kind: 'cargo'; placedBy: PlayerId }               // neutra: sem dono
  | null;

interface Cell { idx: number; chasm: boolean; content: CellContent; hiddenUntil: 'setup' | null; }

interface Player {
  id: PlayerId; captainId: string; shipId: string;
  deck: string[]; hand: HandItem[]; cargoRemaining: number; discard: string[];
}

interface GameState {
  config: Config; seed: number; grid: { width: number; height: number };
  cells: Cell[]; players: Player[]; turnPlayer: PlayerId;
  phase: 'choice' | 'draft' | 'setup' | 'main' | 'end';
  turnNumber: number; log: LogEvent[];
  surrenderedBy: PlayerId | null;   // set por rules/turn.ts::surrender
}
```

`Player.shipId` guarda de quem o Navio é **originalmente** — decide qual Capitão fica silenciado (`rules/silencing.ts`). Quem controla o Navio *agora* é o `owner` dentro de `CellContent`.

---

## O coração: resolver uma colocação

`packages/engine/src/rules/resolvePlacement.ts`.

```
resolvePlacement(state, content, playerId, cellIdx, item, rotation, options?):

1. Valida: casa vazia, não é abismo, item está na mão.
2. Se for Carga: aplica descarte+reposição (rules/hand.ts::playCargo), ENCERRA.
3. A = effectiveArrows(card.arrows, rotation) — `working` é um snapshot; nenhuma
   captura é escrita até o fim, todas as comparações leem o snapshot.
4. Resolução direta, para cada d em A:
     vizinho NAVIO adversário: sem escudo -> domínio (boarding);
       com escudo -> domínio se effectivePower(carta) > hull
     vizinho CARTA adversária: sem seta de volta -> domínio (boarding), não propaga;
       com seta de volta -> CLASH: maior effectivePower domina e propaga
5. Chain — cada carta dominada por CLASH propaga pelas próprias setas, profundidade
   controlada por config.chainDepth (1 padrão, ou Infinity).
6. Nenhuma carta dominada mais de uma vez no mesmo turno.
7. Repõe a mão até o limite (rules/hand.ts::refillHand).
```

`resolvePlacement` para no passo 7 — quem avança `turnPlayer`/detecta fim de partida é `rules/turn.ts::playTurn`, uma camada fina acima, mantendo a função de resolução isolada e testável. Setup usa `rules/setup.ts::placeInSetup`, que reaproveita a mesma validação de casa mas nunca resolve setas (fica oculto até `revealSetup`).

**Poder efetivo e domínio:** os dois únicos ganchos de extensão são `rules/effectivePower.ts` (modificadores de carta/oposição/passiva de Capitão) e `rules/canBeDominated.ts` (travas), apoiados num registry pequeno (`effects/registry.ts`) — cada efeito é uma função registrada por id, nunca um sistema genérico de gatilhos.

**Fim de partida:** normalmente quando o tabuleiro enche (`rules/turn.ts::isGameOver`). `rules/turn.ts::surrender(state, playerId)` também encerra a partida a qualquer momento (setup ou main), forçando o **outro** jogador como vencedor via `GameState.surrenderedBy` — `computeTelemetry` checa esse campo antes de calcular o placar normalmente, então quem desiste perde mesmo se estiver na frente no tabuleiro.

---

## Sistema de conteúdo — cartas, navios e capitães são dados

`packages/engine/src/content/{cards,ships,captains}.json`. Cada entrada tem todos os campos do tipo (`Card`/`Ship`/`Captain`), com uma conveniência: setas/escudos são escritos como a lista de **índices ativos** (`"arrows": [0, 2]`), não os 8 booleanos que o motor usa de fato — `sampleCards.ts`/`sampleShips.ts` fazem essa conversão (`arrowsFrom`) ao carregar. `imageUrl` aponta pra um arquivo em `packages/web/public/{creatures,ships,captains}/`.

Adicionar uma carta/navio/capitão novo é só um objeto novo no array JSON com um `id` novo — nenhum código muda. `sampleCaptains.test.ts`/`sampleCards.test.ts`/`sampleShipsCaptains.test.ts` garantem que não hajam ids duplicados nem campos obrigatórios faltando.

---

## Sigilo — a redação de estado

`packages/engine/src/rules/redact.ts::redactGameStateForPlayer(state, viewerId)`.

Tipo próprio (`RedactedGameState`/`RedactedCellContent`), **não** um novo caso no `CellContent` real — assim nenhum dos lugares que fazem pattern-match exaustivo em `CellContent.kind` precisa de um branch morto pra um valor que o estado autoritativo nunca contém de verdade. Redação só acontece na borda de rede (dentro de `server.ts`), nunca dentro do motor.

O que é apagado: mão do adversário (`{kind:'card', cardId}` vira `{kind:'card'}` — some a identidade, `kind` fica porque a contagem de Carga é pública); baralho do adversário (vira só `{length}`); peças enterradas do setup que não são suas (viram `{kind:'hidden', owner}` — até saber que é especificamente um Navio já vaza informação); `seed` (a ordem de compra é determinística a partir dele, então fica oculto — a composição do baralho já é pública via draft, então vazar `seed` deixaria reconstruir a ordem exata).

**`phase === 'end'` é a única exceção deliberada** — nesse ponto a telemetria precisa da mão/baralho reais de ambos, e não há mais nada a esconder, igual a virar as cartas no fim de uma partida física.

Esse é o motivo de **`SetupProgressSummary`** existir como campo explícito no protocolo em vez de o cliente recalcular localmente: `nextSetupPlayer`/`isShipPlaced` detectam uma peça colocada inspecionando `content.kind`, e uma peça escondida do adversário nunca tem esse campo depois de redigida — o cliente acharia que o adversário nunca termina o setup. O servidor calcula isso contra o estado real e manda pronto.

---

## Multiplayer online

`packages/server` é um Durable Object (`EltycaRoom`, via `partyserver`) rodando como Cloudflare Worker. Uma sala = uma instância do Durable Object; o **nome** da instância (`this.name`, vindo do segmento `:name` da URL — `/parties/main/<código>`) É o código compartilhado. Estado persistido em `ctx.storage` (uma chave, o blob `PersistedRoomState` inteiro), recarregado em `onStart()` — sobrevive à hibernação do Durable Object entre mensagens, não só a uma conexão.

- **Conexão e slots**: primeira conexão vira P1, segunda vira P2, a terceira é rejeitada (`room.ts::assignPlayerSlot`). Reconexão (refresh de página) é resolvida por um `clientId` (UUID em `localStorage`, primeiro uso de localStorage no projeto) mandado como query param — o servidor reclama o mesmo slot em vez de tratar como um 3º jogador. Verificado que sobrevive a um refresh no meio de uma partida real, não só no lobby.
- **Nenhuma mensagem do cliente carrega `playerId`** — o jogador agindo é sempre derivado da conexão no servidor (`protocol.ts`'s `ClientMessage`), nunca do payload. Um cliente nunca consegue alegar ser o adversário.
- **`applyAction.ts`** espelha o que `gameReducer.ts`/`draftReducer.ts` já fazem localmente, chamando as mesmas funções do `@eltyca/engine` — sem duplicar regra nenhuma. A validação extra que o motor não dá de graça (`assertSetupTurn`, já que `placeInSetup` não valida de quem é a vez, ao contrário de `playTurn`) vive em `validate.ts`.
- **Cliente híbrido**: seleção/hover/preview de jogada continuam 100% locais (a mesma `computePreview`/`resolvePlacement` que o hot-seat usa, contra o último estado redigido recebido) — só ações que realmente comitam (`CONFIRM_PLACEMENT`, `PICK_*`, `SURRENDER`) viram mensagens de rede. Ver `useOnlineMatch.ts`.
- **`LiveMatch` é um componente controlado** — `state`/`dispatch` vêm de fora, e um `viewerId?: PlayerId` opcional distingue os dois modos: ausente (hot-seat) mostra sempre quem estiver ativo no momento (uma tela só, passada de mão em mão); presente (online) mostra sempre o mesmo jogador fixo, travado pra somente-leitura quando não é a vez dele.

Verificação de sigilo real (não cosmética) é feita inspecionando os **frames WebSocket brutos** (`page.on('websocket', ws => ws.on('framereceived', ...))`), não só checando o que a UI renderiza — ver a skill `run-and-verify`.

---

## Pontuação

`rules/scoring.ts::computeScores` / `determineWinner`.

```
score(P) = (cartas comuns sob controle de P)
         + (navios sob controle de P)
         + (config.routeBonus se maiorRota(P) for única e máxima)
```

Cargas valem 0. Empate na pontuação final = `'drift'`. Desistência (`GameState.surrenderedBy`) sobrescreve esse cálculo inteiro em `computeTelemetry` — o resultado nunca é `'drift'` nem depende do placar quando alguém desistiu.

---

## Configuração

`packages/engine/config/config.default.json`, carregado por `config.ts::loadConfig(overrides?)`. Editável na tela `/settings` do app — todo campo tem um input lá.

Campos **não** lidos em runtime hoje: `shipRotatable` (rotação de Navio não implementada), `powerChart` (ferramenta de criação de carta, nunca consultada durante a partida), `modifierCost`/`lockCost` (idem). `deckSize` vem do `PlayerSetup` real (drafted ou hot-seat), não é reamostrado do config. `discardCanBeCargo` **é lido** — relaxa a trava "descarte nunca pode ser Carga" quando não sobra carta comum na mão. `draftPerRound`/`draftRounds` **são lidos** pelo modo Porto (`rules/draft.ts`).

---

## Deploy

Dois deploys separados, mesma conta Cloudflare:

- **`packages/server`** → Cloudflare Worker com Durable Object, via `wrangler deploy` (`wrangler.jsonc`: binding `Main` → classe `EltycaRoom`, migração `new_sqlite_classes` — obrigatório desde jul/2026 pra contas sem namespace legado). Local: `wrangler dev --port 1999`.
- **`packages/web`** → Cloudflare Worker de **assets estáticos** (não é mais o produto "Pages" clássico — o fluxo atual do dashboard passa por Workers Builds). `wrangler.jsonc`: `assets.directory: "./dist"` + `not_found_handling: "single-page-application"` (substitui o antigo `_redirects` de Pages, que hoje até conflita/gera loop). Build: `npm run build --workspace=packages/web`. Deploy: `npm run deploy --workspace=packages/web`.
- `VITE_PARTYKIT_HOST` (env var do build do `web`) aponta pro host publicado do `server` — `<nome>.<subdomínio>.workers.dev` por padrão, ou um domínio customizado se configurado.

---

## Testes automatizados

`packages/engine/test/` (21 arquivos) + `packages/server/test/` (2 arquivos), Vitest. Cobertura por regra, cada uma nascida de uma dúvida de design real:

Seta sem volta → domínio sem propagação (`boardingCard`); seta contra seta → confronto, empate mantém defensor (`clashCard`); cadeia só a partir de clash, profundidade 1 (`chain`); rotação desloca 2 por giro (`rotation`); Navio: ângulo sem escudo cai sempre, com escudo exige poder > casco (`shipResolution`); Navio nunca na borda/nunca gira/nunca propaga/nunca entra em rota (`shipPlacement`); passivo do Capitão liga/desliga com o Navio (`captainSilencing`); Carga neutra, não pontua, não entra em rota (`cargoNeutral`); Carga obriga descarte de carta comum (`cargoDiscard`); mão nunca passa do limite (`handLimit`); rota é componente conexa por setas mútuas (`route`); placar bate com contagem manual (`scoring`); desistência força vencedor independente do placar (`turn`); sigilo real por campo (`redact`); draft Porto (`draft`); conteúdo JSON sem duplicatas (`sampleCards`/`sampleShipsCaptains`); telemetria/CSV/JSON (`telemetry`); bots e simulação em lote (`bots`/`simulation`).

Servidor: atribuição de slot e reconexão (`room`), toda ação validada incluindo turno de setup e desistência (`applyAction`).

---

## Modo simulação

`simulation/runMatch.ts` (uma partida headless: setup aleatório + bots) e `simulation/runBatch.ts` (N partidas, agregado via `summarize.ts`). `npm run batch -- N` roda os 3×3 pares de bot.

**Bots** (`bots/`): `randomBot` (linha de base — se um deck vence esse consistentemente, o desbalanceamento é do deck); `greedyBot` (busca por força bruta via `resolvePlacement` especulativo, maximiza domínios no turno); `routeBot` (mesma busca, maximiza `largestRoute`). Os dois últimos compartilham `bots/scoreSearch.ts::bestMoveByScore` — nenhuma heurística duplicando o motor, só o motor pontuando os próprios resultados especulativos.

---

## Interface — visão geral

- **`/`** — landing, arte de fundo, "Start" (hot-seat) e "Play online".
- **`/settings`** — knobs de balanceamento do config.
- **`/game`** — hot-seat: `Match.tsx` (choice → draft) entrega pra `LiveMatchHost.tsx` (dono do reducer local) → `LiveMatch.tsx`.
- **`/online`** — criar sala (gera código) ou entrar com um código.
- **`/online/:code`** — lobby (código copiável, indicador de presença) → mesmo choice/draft do hot-seat, mas por rede → `LiveMatch.tsx`, dessa vez alimentado por `useOnlineMatch.ts`.
- **Tabuleiro e mão** — arrastar-e-soltar (`hooks/useDragPlacement.ts`) com giro por scroll/tecla `R`; clique clássico continua funcionando em paralelo. Overlay de prévia de captura é a própria `resolvePlacement` chamada especulativamente, nunca commitada a menos que a colocação seja confirmada.
- **Animações** — drop, dominada (flash vermelho), dominando (pulso verde), todas derivadas por diff, nenhuma mudança no motor pra existir.
- **Settings em batalha** — engrenagem no cabeçalho (`components/settings/SettingsMenu.tsx`), hoje só "Surrender", com confirmação.
- **Fim de partida — três telas** — Contagem (`ScoreCountingScreen`) → Vencedor (`WinnerScreen`, mostra "X surrendered the match" quando aplicável) → Análise (atrás de "Analyze": telemetria, downloads JSON/CSV, log completo).

---

## Marcos

**Motor + testes.** ✅ Roda no terminal (`npm run simulate`).
**Hot-seat jogável.** ✅ Tabuleiro, mão, arrastar-e-soltar, animações, tela inicial, setup alternado peça a peça.
**Config + telemetria.** ✅ Painel de knobs, exportação JSON/CSV, tela de análise.
**Simulação.** ✅ Três bots, execução em lote, relatório com win rate e médias.
**Modo Porto (draft).** ✅ Escolha de Capitão/Navio revelada na hora, pool de cartas compartilhado, alternância de picks.
**Arte real.** ✅ Cada carta/navio/capitão com imagem própria, via JSON de conteúdo.
**Multiplayer online real.** ✅ Sala por código, sigilo real (verificado por inspeção de frame WebSocket, não só UI), reconexão por `clientId`, draft e partida inteira pela rede.
**Desistência.** ✅ Botão de settings em batalha, força vitória do adversário independente do placar.
**Deploy.** ✅ Servidor (Worker + Durable Object) e site (Worker de assets estáticos) publicados na Cloudflare.

**Fora de escopo, documentado, não construído:** 3+ jogadores (refactor real, `PlayerId` é hardcoded), matchmaking/lista de salas, hardening de colisão de código de sala, UX rica de desconexão (timers de forfeit — hoje só um indicador simples "adversário conectado: sim/não"), rate-limiting/anti-abuso, chat/voz, histórico de partidas além da sala atual, negociação de config entre os dois jogadores (quem cria a sala manda), rotação de Navio, som, layout mobile dedicado.

---

## Processo de commits

Commitar faseado, nunca um commit gigante. Cada commit é uma unidade de trabalho que dá pra entender e reverter sozinha — um passo de algoritmo com seus testes, um grupo de componentes de UI relacionados, uma correção específica encontrada ao testar no navegador. Ver o histórico do git para o padrão já estabelecido.
