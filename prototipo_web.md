# ELTYCA — Protótipo Web

### Especificação técnica v1, baseada nas Regras v0.9

---

## Por que este protótipo existe

Ele não é o jogo. Ele é o **instrumento de medição** do jogo.

O objetivo é responder às sete perguntas da lista de teste das regras com dados em vez de opinião: se a Carga está cara ou barata, se o Navio domina a partida, se a Abordagem é forte demais, se os +3 da rota decidem sozinhos, quanto dura uma partida de verdade.

Isso significa uma inversão de prioridade em relação a um projeto normal: **motor de regras e telemetria vêm antes de qualquer coisa visual.** Uma tela feia que registra tudo vale mais aqui do que uma tela bonita que não mede nada.

---

## A decisão de arquitetura que importa

> **O motor de regras é uma função pura, sem nenhuma dependência de UI.**

```
resolve(estado, ação) -> novoEstado
```

Sem DOM, sem framework, sem timers, sem aleatoriedade não-semeada. Todo acaso passa por um `seed` guardado no estado.

O motivo não é elegância. É que um motor puro roda **fora do navegador**, e isso libera o modo mais valioso do projeto inteiro: simular dez mil partidas com bots antes de convidar um ser humano. Metade das perguntas de balanceamento se responde sozinha assim, de graça, numa noite.

Se o motor nascer amarrado na tela, essa porta fecha e não abre depois.

**Stack:** qualquer uma serve, desde que o pacote do motor seja separado e rode em Node ou equivalente. TypeScript é o caminho de menor atrito para web + simulação headless no mesmo código. Flutter Web também funciona e aproveita seu terreno conhecido — nesse caso o motor é um pacote Dart puro e a simulação roda em Dart CLI. O que não pode é o motor morar dentro do widget.

---

## Escopo

**v1 — jogável e mensurável**
Dois jogadores, hot-seat, mesma tela. Sem contas, sem servidor, sem persistência além de `localStorage` para o log das partidas.

**v2 — instrumentado**
Painel de configuração com todos os botões de balanceamento, exportação de telemetria, modo simulação com bots.

**v3 — opcional**
Bot decente, partida por link compartilhado, coleção persistente.

**Fora de escopo em v1:** arte definitiva, animação, layout mobile polido, deckbuilding persistente, contas, som.

---

## Modelo de dados

### Direções

Oito direções, índice 0 a 7, sentido horário a partir do Norte.

```ts
// 0=N  1=NE  2=E  3=SE  4=S  5=SW  6=W  7=NW
const OFFSET: [number, number][] = [
  [-1, 0], [-1, 1], [0, 1], [1, 1],
  [1, 0], [1, -1], [0, -1], [-1, -1]
];

const oposta = (d: number) => (d + 4) % 8;
```

### Rotação

A carta é quadrada: quatro orientações. Cada giro de 90° desloca o padrão **duas posições** no índice.

```ts
type Rotacao = 0 | 1 | 2 | 3; // 0°, 90°, 180°, 270°

function setasEfetivas(setas: boolean[], rot: Rotacao): boolean[] {
  const out = new Array(8).fill(false);
  for (let i = 0; i < 8; i++) {
    if (setas[i]) out[(i + rot * 2) % 8] = true;
  }
  return out;
}
```

### Entidades

```ts
type Elemento = 'energia' | 'anomalia' | 'paradoxo' | 'cognitivo' | 'astral';
type TipoCarta = 'criatura' | 'embarcacao' | 'npc';

interface Carta {
  id: string;
  nome: string;
  tipo: TipoCarta;
  elemento: Elemento;
  poder: number;          // 1..12
  setas: boolean[];       // length 8, orientação impressa
  efeito?: EfeitoDef;
  tier: 'E'|'D'|'C'|'B'|'A'|'S'|'SS';
}

interface Navio {
  id: string;
  nome: string;
  escudos: boolean[];     // length 8
  casco: number;
}

interface Capitao {
  id: string;
  nome: string;
  cargas: number;         // 2..5
  passivo?: EfeitoDef;
}

type ConteudoCasa =
  | { kind: 'carta'; cartaId: string; rot: Rotacao; dono: PlayerId }
  | { kind: 'navio'; navioId: string; dono: PlayerId }   // rot sempre 0
  | { kind: 'carga'; colocadaPor: PlayerId }             // neutra: sem dono
  | null;

interface Casa {
  idx: number;            // linha * largura + coluna
  abismo: boolean;
  conteudo: ConteudoCasa;
  ocultaAte: 'setup' | null;   // cartas viradas para baixo no setup
}

interface Jogador {
  id: PlayerId;
  capitaoId: string;
  navioId: string;
  deck: string[];         // ids, ordem embaralhada
  mao: ItemMao[];         // cartas + cargas
  cargasRestantes: number;
  descarte: string[];
}

interface Estado {
  config: Config;
  seed: number;
  grade: { largura: number; altura: number };
  casas: Casa[];
  jogadores: Jogador[];
  vez: PlayerId;
  fase: 'escolha' | 'draft' | 'setup' | 'principal' | 'fim';
  log: EventoLog[];
}
```

O **dono do Navio** é quem o controla agora, não quem o colocou. Guarde `navioId` para saber de quem ele é originalmente — é isso que decide qual Capitão fica silenciado.

---

## O coração: resolver uma colocação

Esta é a parte que precisa de teste automatizado antes de qualquer tela.

```
resolverColocacao(estado, jogador, casa, cartaOuCarga, rotacao):

1. Valida: casa vazia, não é abismo, item está na mão.
   Se for Navio no setup: valida que não é casa de borda.

2. Coloca. Se for Carga: aplica a regra de descarte e reposição, e ENCERRA.
   Carga não resolve setas.

3. A = setasEfetivas(carta.setas, rotacao)
   Tira um snapshot do tabuleiro ANTES de aplicar qualquer captura.

4. Resolução direta — para cada d em A:
     vizinho = casa + OFFSET[d]
     se inválido, vazio, abismo, carga, ou já é seu -> ignora

     se vizinho é NAVIO adversário:
        se navio.escudos[oposta(d)] == false  -> DOMÍNIO (abordagem)
        senão: se poderEfetivo(carta) > cascoEfetivo(navio) -> DOMÍNIO
               senão -> nada

     se vizinho é CARTA adversária:
        B = setasEfetivas(cartaAlvo.setas, rotAlvo)
        se B[oposta(d)] == false -> DOMÍNIO (abordagem), não propaga
        senão -> CONFRONTO:
             se poderEfetivo(carta) > poderEfetivo(alvo) -> DOMÍNIO, propaga
             senão -> nada (empate mantém com o defensor)

   Todas as comparações usam o snapshot. Capturas são aplicadas depois,
   simultaneamente.

5. Cadeia — para cada carta dominada por CONFRONTO:
     C = setasEfetivas(dela)
     para cada d em C:
        vizinho adversário, ainda não capturado neste turno,
        e que NÃO tenha seta de volta -> DOMÍNIO por cadeia

   A cadeia tem profundidade 1: captura por cadeia não propaga de novo.
   (Deixe isso como knob de config: `profundidadeCadeia: 1 | Infinity`.)

6. Nenhuma carta é dominada mais de uma vez no mesmo turno.
   Mantenha um Set<idxCasa> durante toda a resolução.

7. Repõe a mão até o limite.
```

### Poder efetivo e domínio permitido

Todo efeito de carta e todo passivo de Capitão entram por **dois ganchos apenas**. Resistir à tentação de criar um terceiro é o que mantém isso administrável.

```ts
poderEfetivo(carta, contexto): number
// aplica MODIFICADORES: da própria carta, da carta oposta,
// e do passivo do Capitão do dono — se ele não estiver silenciado.

podeSerDominada(atacante, defensora, contexto): boolean
// aplica TRAVAS. Default true.
```

**Silenciamento:** antes de aplicar o passivo de um Capitão, checar se o Navio daquele jogador está sob controle adversário. Se estiver, o passivo não existe naquele cálculo.

---

## Cálculo da rota

Grafo simples, roda só na pontuação final.

```
para cada jogador P:
  nós = casas com carta comum sob controle de P (navio e carga fora)
  aresta entre a e b se: a e b são vizinhos,
      setasEfetivas(a)[direção de a para b] == true  E
      setasEfetivas(b)[direção de b para a] == true
  maiorRota(P) = tamanho da maior componente conexa
```

Bônus de +3 só para quem tiver a **maior estritamente**. Empate: ninguém leva.

---

## Pontuação

```
pontos(P) = (cartas comuns sob Eltys de P)
          + (navios sob Eltys de P)
          + (3 se maiorRota(P) for única e máxima)
```

Cargas valem 0. Empate na pontuação final = Deriva.

---

## Configuração — todos os botões num arquivo

Tudo que a lista de teste pode querer mexer precisa ser dado, não código.

```json
{
  "grade": { "largura": 5, "altura": 5 },
  "abismos": [12],
  "maoMaxima": 7,
  "deckTamanho": 12,
  "draftPorRodada": 4,
  "draftRodadas": 3,
  "bonusRota": 3,
  "profundidadeCadeia": 1,
  "empateMantemDefensor": true,
  "navioNaBorda": false,
  "navioRotacionavel": false,
  "descartePodeSerCarga": false,
  "setupCartasOcultas": 2,
  "gabarito": {
    "2": 10, "3": 9, "4": 8, "5": 7, "6": 6, "7": 5, "8": 4
  },
  "custoModificador": 2,
  "custoTrava": 4
}
```

Cada item dessa lista é uma pergunta em aberto do documento de regras. Se um deles estiver hardcoded, aquele teste vira uma tarde de refatoração em vez de um clique.

---

## Telemetria — o que registrar em toda partida

Sem isso o protótipo não cumpre a função dele.

**Da partida:** seed, config usada, capitães e navios escolhidos, decks completos, vencedor, placar final, número de turnos, duração real, turno a turno em formato replayável.

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

Exportar JSON e CSV. Uma tela simples de agregação já basta — a análise pode ser feita em planilha.

---

## Modo simulação

Roda o motor sem tela, N partidas, e cospe o agregado.

**Bots, do mais burro ao menos:**

1. **Aleatório** — casa e rotação sorteadas. Serve de linha de base: se um deck vence outro consistentemente contra bots aleatórios, o desbalanceamento é do deck, não do jogador.
2. **Guloso** — maximiza domínios imediatos no turno. É o bot que mede se "abordagem é forte demais".
3. **Rotista** — prioriza construir rota contígua. Mede se os +3 valem a pena.

Rodar os três em todos os pares (aleatório vs guloso, guloso vs rotista, etc.) responde os itens 1, 4 e 5 da lista de teste sem gastar uma noite de ninguém.

---

## Interface mínima da v1

**Tabuleiro.** Grade clicável. Casa vazia destacada ao selecionar uma carta. Abismo visualmente morto.

**Mão.** Faixa embaixo, cartas comuns e Cargas visualmente distintas. Como a carta é quadrada e gira, a miniatura precisa mostrar as setas com clareza — nessa fase, um quadrado com as oito posições e os traços marcados já resolve. Arte pode ser placeholder.

**Rotação.** Selecionou a carta, tecla `R` ou clique gira 90°. Antes de confirmar, mostrar em **overlay no tabuleiro** o que aquela colocação vai capturar. Isso não é conforto: é o que permite o jogador entender a regra sem ler o manual, e é o que faz o teste render.

**Painéis laterais.** Capitão e Navio de cada jogador, com o passivo escrito e um indicador claro de **silenciado**.

**Log de turno.** Texto corrido, uma linha por evento: `P1 colocou Leviatã (rot 90°) em D3 → abordou C3, confronto em D4 (8 vs 6) venceu, cadeia capturou E4`. É a ferramenta de depuração de regra mais barata que existe, e depois vira replay.

**Hot-seat.** Tela de "passe o dispositivo" entre turnos, escondendo a mão. No setup, ocultar as colocações até a revelação.

---

## Testes automatizados a escrever primeiro

Antes da UI. Cada um é uma regra que já mudou de ideia pelo menos uma vez nesta conversa.

1. Seta contra carta sem seta de volta → domínio, sem propagação.
2. Seta contra seta → confronto; empate mantém com o defensor.
3. Cadeia: só a partir de vitória em confronto, profundidade 1, sem capturar duas vezes a mesma carta no turno.
4. Rotação: padrão de setas desloca 2 índices por giro; 4 giros voltam ao original.
5. Navio: ângulo sem escudo cai sempre, ângulo com escudo exige poder estritamente maior que o Casco.
6. Navio não pode ser colocado na borda; nunca é rotacionado; nunca propaga cadeia; nunca entra em rota.
7. Navio pode ser dominado em turnos consecutivos, e o passivo do Capitão liga e desliga junto.
8. Carga: neutra, não pode ser dominada, não pontua, não entra em rota.
9. Carga jogada obriga descarte de carta comum — nunca de outra Carga — e repõe a mão até o limite.
10. Mão nunca passa do limite; deck vazio não trava o turno.
11. Rota: componente conexa por setas mútuas; empate na maior rota não dá bônus a ninguém.
12. Pontuação final bate com a contagem manual num tabuleiro montado à mão.

---

## Marcos

**M0 — Motor + testes.** Sem tela nenhuma. Roda no terminal, resolve uma partida inteira via script. É aqui que as regras param de ser texto e viram verdade.

**M1 — Hot-seat jogável.** Tabuleiro, mão, rotação, overlay de previsão, log. Suficiente pra jogar com outra pessoa na mesma tela.

**M2 — Config + telemetria.** Painel de knobs, exportação, tela de agregação.

**M3 — Simulação.** Os três bots, execução em lote, relatório.

**M4 — Opcional.** Partida por link, bot melhor, coleção persistente.

O protótipo cumpriu a função dele quando você conseguir dizer, com número, quais dos sete itens da lista de teste eram problema de verdade — e quais eram medo.

---

## Processo de commits

Commitar faseado, nunca um commit gigante com "motor inteiro" ou "app inteiro". Cada commit é uma unidade de trabalho que dá pra entender e reverter sozinha — por exemplo: um passo do algoritmo de `resolvePlacement` com seus testes, um grupo de componentes de UI relacionados, uma correção específica encontrada ao testar no navegador. Preferir várias mensagens pequenas e claras a uma só que resume tudo.
