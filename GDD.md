# ELTYCA — Game Design Document

*v0.1 — rascunho vivo, construído em conjunto em 2026-08-06. Complementa, não substitui, [regras_v0.9.md](regras_v0.9.md) (regras mecânicas completas, autoritativas) e o [ARCHITECTURE.md](ARCHITECTURE.md) do protótipo web.*

> Este documento assume que quem lê já conhece ou vai ler `regras_v0.9.md` — as regras de jogo não são reexplicadas aqui em detalhe, só resumidas onde ajudam a decisão de design. O que este GDD adiciona é tudo que as regras não cobrem: pitch, público, narrativa, plataforma, produção e escopo.

---

## 1. Pitch

**ELTYCA** é um jogo de cartas tático de dois jogadores, jogado numa grade, onde posicionamento importa mais que sorte. Cada carta tem Poder e um padrão de setas nas oito bordas; dominar a carta do adversário é uma questão de geometria — sua seta aponta pra ela e ela não aponta de volta — ou de força, quando as setas se encontram e o maior Poder vence. A maioria das cartas tem orientação fixa; é o Capitão escolhido que decide se e como essa regra se dobra (ver § 2 e § 6).

**Referências de gênero:** Triple Triad (FF8) e Ligretto pela leitura espacial e virada de cartas; Gwent e Hearthstone pela profundidade de deck e efeitos de texto. ELTYCA fica entre os dois — a leveza de regras de um jogo de tabuleiro físico, com a profundidade de build de um TCG.

**O que faz o jogo ser dele mesmo, não um clone de Triple Triad:** o Capitão (a única fonte de texto de regra na mesa, um passivo por jogador) e o Navio (peça neutra que troca de mão a partida inteira e liga/desliga esse passivo). Ver [regras_v0.9.md § O Capitão](regras_v0.9.md#o-capitão) e [§ O Navio](regras_v0.9.md#o-navio).

---

## 2. Pilares de design

Pilares herdados de `regras_v0.9.md` e do que foi decidido nesta sessão:

1. **Um texto de regra por jogador.** Todo o "motor" de um deck mora no passivo do Capitão. Cartas comuns raramente têm efeito de texto extenso — a profundidade vem de posicionamento e rotação, não de pilhas de keywords.
2. **O Navio é o ponto quente.** Ele não briga, mas decide quem tem passivo ativo. Disputar as 8 casas ao redor dele é uma linha de jogo por si só.
3. **O baralho comum é previsível; o Capitão é onde mora a exceção.** *(Reescrito 2026-08-06 — rotação deixou de ser regra universal, ver § 6.4.)* Cartas comuns seguem regras fixas e legíveis (posição fixa, sem giro, sem se mover depois de colocada). É o arquétipo do Capitão que abre uma brecha específica nessas regras — Violet recicla posição, Golar empurra cartas, Cryow gira Paradoxo. Isso mantém o baralho simples de ler e concentra a complexidade tática num único lugar da mesa.
4. **Carta nova não pode ser carta mais forte.** O gabarito de criação (setas × Poder) existe para que quem entrou depois não perca por ter uma coleção menor.
5. **Curva de decisões constante.** A mecânica de Carga existe pra evitar que o meio de jogo fique um deserto de jogadas óbvias.

---

## 3. Plataforma, produção e o papel deste repositório

> **Decisão registrada 2026-08-06:** este repositório (`arcadia_card_game`, web/TypeScript) é um **protótipo de validação de mecânicas** — hot-seat e multiplayer online já funcionam e servem pra testar se as regras batem. **Não é o produto final.**

| | |
|---|---|
| **Produto final** | Jogo comercial em **Unity**, para venda. |
| **Plataforma alvo** | **PC (Steam)**. |
| **Modelo de venda** | Em aberto — avaliado pago único (premium), pago + expansões, ou free-to-play com compras. Nenhum compromisso ainda. |
| **Equipe** | **Solo dev** (o autor deste documento faz o desenvolvimento; arte pode ser terceirizada). |
| **Papel do protótipo web** | Validar Porto (draft), Rota (deck construído), Capitão/Navio, multiplayer online e a curva de Carga *antes* de investir em produção Unity. Ver [`content/prototipo_web.md`] e memória do projeto para o que já foi testado. |

**Implicação prática:** decisões de UI/UX do protótipo web (React, drag-and-drop, etc.) não são vinculantes para a versão Unity — são só a forma mais rápida de testar se a mecânica funciona. Decisões de **regras** (o que está em `regras_v0.9.md`) são as que de fato carregam pra frente.

---

## 4. Narrativa e ambientação

> **Decisão registrada 2026-08-06:** a moldura "Mundo das Tintas" cogitada em `regras_v0.9.md` (linha 291, "proposta narrativa a decidir") foi **descartada** como justificativa de arte do card game. Motivo: no lore do RPG Arcádia, o Mundo das Tintas já é um plano específico e concreto — a dimensão onde sentimentos têm cor e peso (ver `content/books/01_01_00_introducao.md` e `04_02_05_astral.md`) — reaproveitar o nome de forma solta pra "cartas são impressões emocionais" teria colidido com esse significado já estabelecido.

### ELTYCA existe dentro do mundo do RPG Arcádia

Esse é o ponto central da narrativa: **ELTYCA não é um jogo de cartas sobre Arcádia — é um jogo de tabuleiro jogado pelos habitantes de Arcádia.** Como Gwent existe dentro do mundo de The Witcher, ELTYCA existe dentro do mundo do RPG de mesa Arcádia (`content/books/`), e deveria fazer sentido pra quem já conhece esse mundo.

**O que já sabemos de Arcádia que se conecta direto ao jogo:**

| Elemento do RPG | Conexão com ELTYCA |
|---|---|
| **Mar de Nuvens** — mundo de continentes flutuantes, sem chão firme, viajado por navios voadores (`01_01_00_introducao.md`) | É o cenário. `regras_v0.9.md` já cita "o bestiário do Mar de Nuvens" pras Criaturas e usa "Embarcação" (não "Navio") justamente pra não confundir com a peça do jogador. |
| **Eltys** — minério arcano raro que move navios, alimenta feitiços e é a base de poder econômico das nações (`04_03_00_regioes.md`) | É literalmente o nome da ficha de domínio do jogo. Proposta de flavor (não confirmada, revisar): as fichas de Eltys do jogo são pedaços reais do minério — dominar uma carta é "carregá-la" com Eltys, o mesmo recurso que decide poder entre nações no mundo real do jogo. |
| **Os Cinco Elementos** — Energia, Anomalia, Paradoxo, Cognitivo, Astral, o sistema de magia do RPG (`02_02_00_elementos.md`) | São, nome por nome, os cinco elementos das cartas comuns em `regras_v0.9.md`. Não é coincidência — é o mesmo sistema arcano, só que virado paleta de cores e etiqueta de carta. |
| **Camelot e os Imperiais** — a guarda nacional de Camelot (`04_03_00_regioes.md`) | Já citados nas regras como um dos arquétipos de NPC ("contramestres, cartógrafos, Imperiais"). |
| **Constelações e Navegação** — assinaturas mágicas usadas pra rastrear ilhas que nunca ficam paradas (`03_03_00_constelacao_e_navegacao.md`) | Não vira mecânica direta (evitar confundir com "Rota", que no card game é a cadeia de setas mútuas), mas é uma fonte natural de flavor pra cartas de Embarcação e NPC "Navegador". |
| **Navios Materiais vs. Orgânicos** (`03_02_00_navios.md`) | O RPG já distingue essas duas categorias de navio (aço/madeira vs. criatura colossal domesticada) — pode informar variedade visual/flavor das cartas de Embarcação e do design de Navios-jogador futuros, sem precisar herdar a complexidade mecânica (Slots, Setores) do RPG. |

### O framing do "garoto do porto" (conceito, não travado)

> **Decisão registrada 2026-08-06:** a ideia adotada — não confirmada em detalhe — é apresentar/vender o jogo pela perspectiva de **uma criança de porto**: alguém que vê navios voadores passando, joga ELTYCA em becos, tavernas e portos ao lado de uma embarcação de verdade. Não é uma criança "no quarto" — é rua, contrabando, o Mar de Nuvens acontecendo ao redor.

- **Confirmado como direção de arte / posicionamento de marca** (capa, trailer, tom visual).
- **Ainda não decidido** se isso deveria moldar UI/menus do jogo (telas literalmente ambientadas num porto/taverna) ou ficar restrito a material de marketing e à ilustração das cartas.
- Combina bem com o que as regras já description "Embarcação: barcos pequenos, escunas de contrabando, naufrágios" e "NPC: gente de porto" — o framing não inventa tom novo, reforça o que já existia.

---

## 5. Núcleo de gameplay (resumo)

Regras completas em [regras_v0.9.md](regras_v0.9.md). Resumo pra quem está desenhando conteúdo (cartas, Capitães, Navios) sem reler o documento inteiro:

- Grade 5×5 (2 jogadores), 1 Abismo central. Turno: colocar carta → resolver Abordagem/Confronto em cada seta adjacente → propagar cadeia (só Confronto propaga) → repor mão.
- **Capitão**: fora do tabuleiro, define Cargas (2–5) e carrega o único passivo em texto da mesa (sempre bônus + ônus).
- **Navio**: escondido no setup, sem Poder/setas, nunca em rota. Tem Escudos (ângulos guardados) e Casco (força), gabarito `Escudos + Casco = 11`. Troca de mão livremente; enquanto adversário o controla, o passivo do seu Capitão desliga.
- **Carta comum**: Poder + 2–8 setas + Elemento (dos 5 do RPG) + Tipo (Criatura/Embarcação/NPC) + Efeito opcional. Gabarito de criação liga setas a Poder pra manter cartas novas equilibradas com cartas antigas.
- **Carga**: peça neutra pra destravar a mão / fechar ângulo do Navio / cortar rota adversária. Não pontua, não pode ser dominada.
- Pontuação: +1 por carta comum dominada, +1 por Navio, +3 pra maior rota (cadeia de setas mútuas).
- Dois modos: **Porto** (draft na hora, recomendado) e **Rota** (deck construído em casa, 12 cartas + 1 Lendária).

---

## 6. Escopo de conteúdo para o v1

| Item | Escopo decidido | Status |
|---|---|---|
| **Nome do jogo** | **ELTYCA**, definitivo. | ✅ Fechado |
| **Nome da carta neutra** | **Carga**, definitivo (não "Lastro"/"Caixaria"). | ✅ Fechado |
| **Capitães e Navios no set base** | **7 Capitães** com elenco e passivo fechados (ver § 6.1-6.2). Navios seguem em 4-6, ainda não desenhados. | 🟡 Capitães fechados na forma, detalhes de resolução de algumas passivas em aberto (ver § 6.3); Navios e forma de desbloqueio seguem em aberto |

### 6.1 Regra de design: passiva de Capitão

> **Decisão registrada 2026-08-06** — supersede a frase de `regras_v0.9.md` ("sempre de duas pontas: bônus e ônus"), já atualizada lá também.

- **Sempre passiva.** Nunca uma ação que o jogador escolhe ativar (sem "1x por partida", sem custo, sem gatilho manual) — é regra permanente de mesa, do início ao fim.
- **Nunca tem ônus.** Só bônus. O balanceamento entre Capitães vem de **escopo e magnitude** do bônus (quão específico é o subconjunto de cartas/situações afetado), e do valor de **Cargas** de cada um — que já é, por si, um trade-off estrutural do sistema (mais Cargas = menos comuns na mão inicial), sem precisar de ônus escrito no texto do passivo.
- **Sempre ligada a um arquétipo nomeado.** Cada Capitão é uma instância clara de um arquétipo — não uma frase de efeito solta.
- **Risco de playtest a observar:** sem ônus explícito no texto, é mais fácil uma passiva ficar forte demais sem que isso salte aos olhos de quem lê a carta — vale adicionar à lista de `regras_v0.9.md § O que testar primeiro`.

### 6.2 Elenco de lançamento (7 Capitães)

> **Atualizado 2026-08-06** — revisão completa dos passivos e da lista, substitui a versão anterior desta seção. Arquétipos agora são **Buffer, Controlador, Movimento** (Vidente e Engenheiro Posicional saíram do elenco real).

| Capitão | Arquétipo | Passiva | Cargas |
|---|---|---|---|
| **Navah** | Buffer | Suas cartas de Criatura têm +2 de Poder. | 3 |
| **Navarro** | Buffer | Suas cartas de NPC têm +2 de Poder. | 3 |
| **Cycar** *(novo)* | Buffer | Suas cartas de NPC têm +1 de Poder para cada espaço vazio ao redor da posição escolhida, **até um máximo de +3**. | 3 |
| **Katty** | Controlador | Suas cartas do elemento Anomalia destroem Cargas — ganha 1 ponto por Carga destruída. | 1 |
| **Violet** | Controlador | Suas cartas podem ser colocadas sobre uma carta **sua** já dominada, ou sobre uma Carga, em vez de só em casa vazia. | 2 |
| **Golar** | Movimento | No final do turno, suas cartas adjacentes (vertical/horizontal) ao Navio são empurradas 1 casa **radialmente, pra longe do Navio**, se houver espaço. | 2 |
| **Cryow** *(novo)* | Movimento | Suas cartas do elemento Paradoxo podem ser rotacionadas depois de colocadas. | 2 |

**No banco** (nomes válidos, não usados no lançamento — podem voltar em expansão): Annya, Favacha, Loren, **Oswald**.

**Notas:**
- Cycar e Cryow são nomes novos, fora da lista original de 9 candidatos — assumindo que foram aprovados nesta rodada junto com o resto.
- Katty com Cargas 1 está fora da faixa "De 2 a 5" que `regras_v0.9.md § O Capitão` ainda documenta — atualizei essa faixa pra "De 1 a 5" lá.
- `packages/engine/src/content/captains.json` no protótipo web não reflete nada disso ainda — este GDD é a fonte de verdade; o JSON do protótipo segue desatualizado.

### 6.3 Pontos de resolução em aberto (mecânica, não só flavor)

Passivos com movimento, destruição e placement sobre carta já ocupada são território mecânico novo — nada disso existia em `regras_v0.9.md` antes desta sessão. Antes de considerar essas 7 passivas "fechadas" pra implementação, faltam decidir:

| Passiva | Pergunta em aberto |
|---|---|
| **Katty** (destrói Carga) | Cria pontos que não existiam antes (Carga hoje vale 0 na pontuação final) — é intencional que o total de pontos da partida não seja mais um valor fixo/previsível? Ainda em aberto, vale item de playtest. |
| **Golar / Cryow** (geral) | Card que muda de posição/rotação depois de colocada — isso **re-dispara** Abordagem/Confronto contra as cartas que passam a ficar adjacentes/apontadas, ou é só reposicionamento silencioso que só importa pro cálculo final de Rota? Ainda em aberto. |

**Resolvidos 2026-08-06:**
- **Violet** — só cartas **suas** já dominadas, nunca do adversário. Continua sendo utilidade/reciclagem, não uma forma de ignorar Abordagem/Confronto.
- **Cryow** — rotacionar acontece **no momento de colocar a carta** (parte da ação normal de "colocar uma carta") — não é uma ação ativa separada. Só cartas de Paradoxo sob o Cryow mantêm essa liberdade; o resto do baralho passou a ter orientação fixa (§ 6.4).
- **Golar** — empurrão é **radial, pra longe do Navio**.
- **Cycar / Katty** — ambos calculados **uma vez, no momento da colocação**. O Poder do Cycar fica fixo depois de colocado; a Carga da Katty só é destruída se já estiver adjacente na hora da jogada, não depois.
- **Cycar — teto de +3** *(2026-08-06)*. Sem teto, o bônus chegava a +8 num tabuleiro vazio (turno 1), quebrando a troca setas×Poder do gabarito de criação de carta — um NPC de 8 setas/4 Poder (a carta mais fraca do gabarito, feita só pra Rota) virava 12 de Poder de graça, sem contrajogo possível nos primeiros turnos. +3 fica um pouco acima do +2 fixo do Navah/Navarro, como compensação por exigir leitura de tabuleiro (o bônus não é garantido — cai conforme a mesa enche).
- **Componente físico de Carga** — sobe de 5 para **7 por jogador** (2 de lastro fixo de setup + até 5 da Carga do Capitão). Já atualizado em `regras_v0.9.md § Componentes`.
| **Elementos** | Os 5 do RPG: Energia, Anomalia, Paradoxo, Cognitivo, Astral. Já herdados 1:1 do sistema de magia de Arcádia — não precisa inventar elemento novo pro card game. | ✅ Fechado |
| **Tipos de carta** | Criatura / Embarcação / NPC, como já definido nas regras. | ✅ Fechado |
| **Deck de comuns** | 12 cartas por jogador no modo Rota (regras já definem). | ✅ Fechado |

---

### 6.4 Decisão registrada: rotação deixa de ser universal

> **Confirmado 2026-08-06.** Rotação livre na colocação (antes regra universal, qualquer carta de qualquer jogador) passa a ser **exclusiva de cartas de Paradoxo sob o Capitão Cryow**. Toda outra carta, de todo outro Capitão, é colocada numa orientação fixa (a impressa, sem escolha).

Essa mudança já foi propagada para:

| Onde | O que mudou |
|---|---|
| **Pilar de design #3** (§ 2) | Reescrito de "Rotação transforma a mesma carta em ferramentas diferentes" para "O baralho comum é previsível; o Capitão é onde mora a exceção" — unifica Violet, Golar e Cryow como a mesma ideia (o arquétipo do Capitão é quem abre brecha numa regra fixa). |
| **`regras_v0.9.md` § A carta comum § Rotação** | Orientação fixa por padrão; Paradoxo+Cryow como exceção nomeada. |
| **`regras_v0.9.md` § Direção de arte** | Prática de legibilidade em qualquer ângulo mantida pro baralho inteiro (custa zero, futuro-prova caso surjam mais poderes de rotação), mas a razão de ser deixou de ser "toda carta gira" e passou a ser "essa fatia do baralho gira, e mais Capitões podem vir a girar outras coisas depois". |
| **Pitch do jogo** (§ 1) | Trocado "posicionamento e rotação importam mais que sorte" por linguagem que não assume rotação como universal. |

## 7. Modos de jogo e escopo de jogadores

> **Decisão registrada 2026-08-06:** o v1 comercial (Unity) mira **1×1 apenas — contra bot e contra outro jogador (online e/ou local).** As tabelas de escala pra 3/4/6 jogadores já existem em `regras_v0.9.md § Escala por número de jogadores`, mas ficam como **visão de longo prazo, não escopo de lançamento**.

Isso também casa com o estado técnico real: `PlayerId = 'P1' | 'P2'` está hardcoded em todo o motor do protótipo (`packages/engine`), e escalar pra 3+ jogadores é um refator real, não um parâmetro — não foi começado. Ver `CLAUDE.md` § Non-negotiable invariants.

| Modo | Descrição | Escopo v1 |
|---|---|---|
| **Porto** (draft na hora) | Modo recomendado — ninguém chega com deck resolvido, coleções desiguais jogam parelho. | Dentro do escopo v1. |
| **Rota** (deck construído) | Pra quem já manja — 12 comuns + 1 Lendária, montado em casa. | Dentro do escopo v1. |
| **vs. Bot** | Contra IA. | Dentro do escopo v1 — já existem bots/simulação no protótipo (`npm run simulate`, `npm run batch`). |
| **vs. Jogador (online)** | Multiplayer real via código de sala. | Já validado no protótipo web (PartyKit); arquitetura equivalente precisa ser recriada em Unity — decisão de rede (P2P vs. servidor autoritativo) ainda não tomada pro produto final. |
| **3/4/6 jogadores, duplas/trios** | Escala descrita nas regras, "Fique de olho a partir de 3" quanto a balanceamento. | **Fora do escopo v1.** Backlog de expansão. |

### 7.1 Setup escondido — por que mantemos, e a nova sequência

> **Decisão registrada 2026-08-06.**

O setup escondido (Navio + Cargas enterrados virados pra baixo antes da primeira jogada) segue existindo, mas não pelo motivo que `regras_v0.9.md` dava originalmente (blefe de identidade de carta — já não existe, o lastro é sempre Carga, sem força). O motivo que sustenta manter a fase escondida agora é **posicional**: até a revelação, nenhum jogador sabe em qual das 8 casas do anel o Navio adversário está, o que preserva o Navio como aposta, não cálculo, no primeiro ataque de cada jogador — reforça o Pilar #2 ("o Navio é o ponto quente"). Cortar o setup escondido deixaria o turno 1 inteiramente informado, o que esvazia essa tensão. Fica como item de alta prioridade em `regras_v0.9.md § O que testar primeiro`.

**Sequência atualizada:**

1. Escolhe Capitão e Navio, revela os dois.
2. **Setup escondido, agora fixo pra todo mundo:** enterra sempre **1 Navio + 2 Cargas de um lastro neutro**, virados pra baixo — não sai mais da Carga do próprio Capitão, é igual pra qualquer escolha de Capitão.
3. Revela tudo de uma vez.
4. **Só agora monta a mão:** Cargas do Capitão (1 a 5) + comuns compradas do baralho, até **no máximo 5 cartas no total**. Mão máxima cai de 7 pra 5 — vale pro resto da partida também, não só no início (toda reposição, seja jogando comum ou Carga, agora repõe até 5).

**Componente físico:** confirmado — sobe de 5 para **7 Cargas por jogador** (2 do lastro fixo de setup + até 5 da Carga do Capitão). Já atualizado em `regras_v0.9.md § Componentes`.

---

## 8. Progressão e coleção

`regras_v0.9.md` diz que cartas "vão ser entregues uma por uma como loot de sessão" — mas não define o formato. **Isso segue em aberto** (confirmado nesta sessão: nenhuma decisão tomada ainda). Opções cogitadas, nenhuma escolhida:

- **Recompensa pós-partida** — toda partida rende carta nova, tipo loot casual.
- **Progressão por campanha/história** — cartas desbloqueadas seguindo capítulos/missões.
- **Híbrido** — loot casual + marcos de campanha pra Capitães/Navios/raras.

**Por que isso importa antes de produzir conteúdo demais:** o próprio gabarito de criação de carta em `regras_v0.9.md` (§ Gabarito de criação de carta) foi desenhado assumindo *algum* sistema de loot sequencial ("se carta nova for carta mais forte, quem jogou mais sessões ganha sem jogar") — então a forma exata da progressão deveria ser decidida antes de desenhar a curva de desbloqueio de conteúdo (quantas cartas por sessão, se existe "banco" de cartas disponíveis desde o início no modo Rota vs. indisponíveis até desbloquear, etc.).

---

## 9. Direção de arte

Herdado de `regras_v0.9.md § Direção de arte` — carta quadrada sem moldura circular, Poder legível em qualquer rotação, texto de efeito curto, setas de alto contraste, elemento como paleta de cor.

**Ajustes desta sessão:**

- ~~"Proposta narrativa: Mundo das Tintas"~~ — cortado (ver § 4). Sem substituto de "por que a arte é assim" no nível de lore por enquanto.
- **Rotação deixou de ser universal** (§ 6.4) — só cartas de Paradoxo sob o Cryow giram de verdade na mesa. A prática de "legível em qualquer orientação" continua valendo pro baralho inteiro por barato/futuro-prova, mas não é mais justificada por "toda carta gira sempre".
- **Framing do "garoto do porto"** (§ 4) é a nova direção de posicionamento visual/marketing — capa, trailer, talvez arte de menu. Não é regra de produção de carta individual, é identidade de marca.
- **Capitão continua sendo a carta grande** — arte cheia, orientação fixa, onde vale investir a melhor ilustração (igual já estabelecido nas regras).
- **Navio precisa de moldura própria** (já nas regras) — reforçado pelo fato de que, no lore do RPG, Navios Materiais e Orgânicos são visualmente muito diferentes entre si; dá pra usar isso como variedade visual entre os 4–6 Navios do set base.

---

## 10. Questões em aberto

Consolidado do que `regras_v0.9.md § Em aberto` já listava, atualizado com o que foi resolvido nesta sessão:

| Questão | Status |
|---|---|
| Nome definitivo do jogo | ✅ Resolvido — ELTYCA |
| Nome da carta neutra | ✅ Resolvido — Carga |
| Moldura "Mundo das Tintas" como ficção oficial do card game | ✅ Resolvido — cortada |
| Quantos Capitães/Navios no set base | 🟡 Parcial — 7 Capitães fechados com arquétipo, passiva e Cargas (§6.2); Navios (4-6) e forma de desbloqueio de novos Capitães/Navios seguem em aberto |
| Modo campanha / como cartas entram na coleção | 🔴 Em aberto |
| Modelo de venda (premium / DLC / F2P) | 🔴 Em aberto |
| Arquitetura de rede pro multiplayer em Unity | 🔴 Em aberto — protótipo web usa PartyKit/Durable Object; não decidido se isso se repete em Unity |
| Framing "garoto do porto" afeta UI ou só arte/marketing | 🔴 Em aberto |
| Katty gera pontos destruindo Cargas — total de pontos da partida deixa de ser fixo | 🔴 Em aberto — ver §6.3, item de playtest |
| Cartas que mudam de posição/rotação (Golar, Cryow) re-disparam Abordagem/Confronto, ou só reposicionam em silêncio? | 🔴 Em aberto — ver §6.3 |
| Ideias em avaliação da v0.9 (Navio removido do tabuleiro, Navio com efeito compartilhado, Navio como tapete de jogador, segundo número no Capitão, Variante Sigilo, duplas/trios) | 🔴 Mantidas como backlog, nenhuma decidida ou descartada — ver `regras_v0.9.md § Ideias em avaliação` |
| Testes de balanceamento (Carga, Navio/Casco, +3 da rota, Abordagem, elemento/tipo pesando, duração real) | 🔴 Em aberto — ver `regras_v0.9.md § O que testar primeiro`; ainda pendentes de playtesting sistemático |

---

## 11. Referências

- [regras_v0.9.md](regras_v0.9.md) — regras mecânicas completas e autoritativas.
- [ARCHITECTURE.md](ARCHITECTURE.md) — arquitetura técnica do protótipo web (não vinculante pro produto Unity).
- `content/books/` — livro de regras do RPG de mesa Arcádia (lore fonte). Especialmente relevantes pra ELTYCA: `01_01_00_introducao.md`, `02_02_00_elementos.md` (+ os 5 arquivos de elemento individual), `03_02_00_navios.md`, `03_03_00_constelacao_e_navegacao.md`, `04_03_00_regioes.md`, `04_06_00_bestiario.md`.
- `content/tall_tails/` — contos curtos ambientados em Arcádia, fonte potencial de flavor text pra cartas individuais (não explorado ainda neste GDD).
- `content/timeline.json` — linha do tempo histórica de Arcádia.
