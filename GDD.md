# ELTYCA — Game Design Document

*v0.2 — documento único de design. Iniciado 2026-08-06 a partir de `regras_v0.9.md`; consolidado no mesmo dia — o conteúdo de `regras_v0.9.md` foi incorporado abaixo e o arquivo removido, pra parar de manter a mesma regra em dois lugares. Complementa o [ARCHITECTURE.md](ARCHITECTURE.md) do protótipo web (arquitetura técnica, documento separado, não afetado por esta fusão).*

> Este é o único documento de design ativo do projeto — pitch, narrativa, regras completas, elenco de conteúdo, produção e questões em aberto, tudo num lugar só, enquanto o design ainda está em movimento. Quando o jogo estabilizar, a intenção é extrair um livro de regras limpo — só o necessário pra jogar, sem rationale nem histórico de decisão — a partir do que estiver fechado aqui.

---

## 1. Pitch

**ELTYCA** é um jogo de cartas tático de dois jogadores, jogado numa grade, onde posicionamento importa mais que sorte. Cada carta tem Poder e um padrão de setas nas oito bordas; dominar a carta do adversário é uma questão de geometria — sua seta aponta pra ela e ela não aponta de volta — ou de força, quando as setas se encontram e o maior Poder vence. A maioria das cartas tem orientação fixa; é o Capitão escolhido que decide se e como essa regra se dobra (ver § 2 e § 6).

**Referências de gênero:** Triple Triad (FF8) e Ligretto pela leitura espacial e virada de cartas; Gwent e Hearthstone pela profundidade de deck e efeitos de texto. ELTYCA fica entre os dois — a leveza de regras de um jogo de tabuleiro físico, com a profundidade de build de um TCG.

**O que faz o jogo ser dele mesmo, não um clone de Triple Triad:** o Capitão (a única fonte de texto de regra na mesa, um passivo por jogador) e o Navio (peça neutra que troca de mão a partida inteira e liga/desliga esse passivo). Ver § 5.3 e § 5.4.

---

## 2. Pilares de design

1. **Um texto de regra por jogador.** Todo o "motor" de um deck mora no passivo do Capitão. Cartas comuns raramente têm efeito de texto extenso — a profundidade vem de posicionamento, não de pilhas de keywords.
2. **O Navio é o ponto quente.** Ele não briga, mas decide quem tem passivo ativo. Disputar as 8 casas ao redor dele é uma linha de jogo por si só.
3. **O baralho comum é previsível; o Capitão é onde mora a exceção.** Cartas comuns seguem regras fixas e legíveis (posição fixa, sem giro, sem se mover depois de colocada). É o arquétipo do Capitão que abre uma brecha específica nessas regras — Violet recicla posição, Golar empurra cartas, Cryow gira Paradoxo. Isso mantém o baralho simples de ler e concentra a complexidade tática num único lugar da mesa.
4. **Carta nova não pode ser carta mais forte.** O orçamento de Tier (§ 5.12) existe para que quem entrou depois não perca por ter uma coleção menor.
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
| **Papel do protótipo web** | Validar Porto (draft), Rota (deck construído), Capitão/Navio, multiplayer online e a curva de Carga *antes* de investir em produção Unity. |

**Implicação prática:** decisões de UI/UX do protótipo web (React, drag-and-drop, etc.) não são vinculantes para a versão Unity — são só a forma mais rápida de testar se a mecânica funciona. Decisões de **regras** (§ 5 abaixo) são as que de fato carregam pra frente.

**Nota de sincronia:** `packages/engine/src/content/captains.json`, `ships.json` e `cards.json` do protótipo web **não refletem** o elenco fechado em § 6, § 7 e § 8 — ainda têm dados antigos/placeholder. Este documento é a fonte de verdade; o protótipo não foi atualizado nesta sessão.

---

## 4. Narrativa e ambientação

> **Decisão registrada 2026-08-06:** a moldura "Mundo das Tintas" cogitada na v0.9 das regras foi **descartada** como justificativa de arte do card game. Motivo: no lore do RPG Arcádia, o Mundo das Tintas já é um plano específico e concreto — a dimensão onde sentimentos têm cor e peso (ver `content/books/01_01_00_introducao.md` e `02_02_05_astral.md`) — reaproveitar o nome de forma solta pra "cartas são impressões emocionais" teria colidido com esse significado já estabelecido.

### ELTYCA existe dentro do mundo do RPG Arcádia

Esse é o ponto central da narrativa: **ELTYCA não é um jogo de cartas sobre Arcádia — é um jogo de tabuleiro jogado pelos habitantes de Arcádia.** Como Gwent existe dentro do mundo de The Witcher, ELTYCA existe dentro do mundo do RPG de mesa Arcádia (`content/books/`), e deveria fazer sentido pra quem já conhece esse mundo.

**O que já sabemos de Arcádia que se conecta direto ao jogo:**

| Elemento do RPG | Conexão com ELTYCA |
|---|---|
| **Mar de Nuvens** — mundo de continentes flutuantes, sem chão firme, viajado por navios voadores (`01_01_00_introducao.md`) | É o cenário principal. Usa-se "Embarcação" (não "Navio") pra não confundir com a peça do jogador (§ 5.5). O bestiário das cartas, porém, veio de puxar Arcádia inteira, não só o Mar de Nuvens — ver § 8.2. |
| **Eltys** — minério arcano raro que move navios, alimenta feitiços e é a base de poder econômico das nações (`04_03_00_regioes.md`) | É literalmente o nome da ficha de domínio do jogo. Proposta de flavor (não confirmada, revisar): as fichas de Eltys do jogo são pedaços reais do minério — dominar uma carta é "carregá-la" com Eltys, o mesmo recurso que decide poder entre nações no mundo real do jogo. |
| **Os Cinco Elementos** — Energia, Anomalia, Paradoxo, Cognitivo, Astral, o sistema de magia do RPG (`02_02_00_elementos.md`) | São, nome por nome, os cinco elementos das cartas comuns (§ 5.5). Não é coincidência — é o mesmo sistema arcano, só que virado paleta de cores e etiqueta de carta. |
| **Camelot e os Imperiais** — a guarda nacional de Camelot (`04_03_00_regioes.md`) | Já citados como um dos arquétipos de NPC ("contramestres, cartógrafos, Imperiais"), e batizam o Navio "Cruz Imperial" (§ 7). |
| **Constelações e Navegação** — assinaturas mágicas usadas pra rastrear ilhas que nunca ficam paradas (`03_03_00_constelacao_e_navegacao.md`) | Não vira mecânica direta (evitar confundir com "Rota", que no card game é a cadeia de setas mútuas), mas já rendeu carta de verdade: "A Última Maré de Aetheria" (§ 8.3) é a mesma ilha lendária do exemplo de Fennick nesse capítulo do RPG. |
| **Navios Materiais vs. Orgânicos** (`03_02_00_navios.md`) | O RPG já distingue essas duas categorias de navio (aço/madeira vs. criatura colossal domesticada) — vira regra de design real (não só flavor) pro elenco de Navios (§ 7). |
| **Bestiário de Arcádia** (`book/creatures.json`, fora deste repositório) | Fonte direta de 12 Criaturas reais do card game (§ 8.2) — nomes, lore e nível de poder do RPG, não inventados pro jogo. |

### O framing do "garoto do porto" (conceito, não travado)

> **Decisão registrada 2026-08-06:** a ideia adotada — não confirmada em detalhe — é apresentar/vender o jogo pela perspectiva de **uma criança de porto**: alguém que vê navios voadores passando, joga ELTYCA em becos, tavernas e portos ao lado de uma embarcação de verdade. Não é uma criança "no quarto" — é rua, contrabando, o Mar de Nuvens acontecendo ao redor.

- **Confirmado como direção de arte / posicionamento de marca** (capa, trailer, tom visual).
- **Ainda não decidido** se isso deveria moldar UI/menus do jogo (telas literalmente ambientadas num porto/taverna) ou ficar restrito a material de marketing e à ilustração das cartas.
- Combina bem com o que já existia antes desse framing — "Embarcação: barcos pequenos, escunas de contrabando, naufrágios" e "NPC: gente de porto" — o framing não inventa tom novo, reforça o que já estava lá.

---

## 5. Regras do jogo

Conjunto completo das regras mecânicas — a parte deste documento que se pareceria com um livro de regras, se fosse extraído hoje.

### 5.1 Vocabulário

- **Dominar** — passar uma carta para o seu controle. Acontece por Abordagem ou por Confronto.
- **Rota** — cadeia de cartas suas ligadas por setas mútuas.
- **Eltys** — a ficha que marca quem domina cada carta.
- **Abismo** — casa morta do tabuleiro.

### 5.2 Componentes

| Item | Quantidade |
|---|---|
| Tabuleiro | Grade 5×5 (escala com o nº de jogadores — fora do escopo v1, ver § 9) |
| Marcadores de Eltys | ~30 fichas por jogador, uma cor cada |
| Cartas de Carga | 7 por jogador (2 de lastro fixo de setup + até 5 da Carga do Capitão) |
| Capitão | 1 por jogador, escolhido antes da partida |
| Navio | 1 por jogador, escolhido antes da partida |
| Deck | 12 cartas comuns por jogador, escolhidas do baralho compartilhado de 30 (§ 8) |

Domínio é marcado com **Eltys**, não virando a carta. Carta de um lado só, arte inteira, domínio legível do outro lado da mesa.

### 5.3 O Capitão

**É o personagem.** Fica fora do tabuleiro, na frente do jogador, a partida inteira. Nunca é dominado, nunca corre risco, nunca sai de lá.

| Campo | O que faz |
|---|---|
| **Cargas** | Quantas Cargas você carrega. De 1 a 5. Define quantas cartas comuns cabem na sua mão (§ 5.6). |
| **Passivo** | Uma regra em texto, sempre **passiva** (nunca uma ação que o jogador escolhe ativar — sem "1x por partida", sem custo, sem gatilho manual) e sempre **só bônus**, sem ônus. Ligada a um arquétipo nomeado (Buffer, Controlador, Movimento — ver § 6). |

O Capitão é a carta de arte cheia do jogo — retrato, nome próprio, o personagem daquele jogador. É a única peça que carrega texto de regra, justamente pra que exista **um passivo por jogador** e não sete coisas rodando ao mesmo tempo na mesa.

> **Sem ônus no texto, o balanceamento vem de escopo e magnitude** — quão específico é o subconjunto de cartas/situações que a passiva afeta — e do valor de Cargas de cada Capitão, que já é, por si, um trade-off estrutural do sistema (mais Cargas = menos cartas comuns na mão inicial).

Elenco completo em § 6.

### 5.4 O Navio

Colocado no tabuleiro, escondido, no setup. **É a peça que não briga.**

- **Não tem Poder. Não tem setas. Nunca domina ninguém e nunca propaga cadeia.**
- **Nunca faz parte de uma rota.**
- **Nunca é rotacionado.** Entra sempre em pé, e por isso a disposição dos escudos é característica dele, não escolha de turno.
- **Não tem texto.** Ele é objetivo posicional, não motor de regras.
- Tem **Escudos**: quais dos 8 ângulos ele guarda.
- Tem **Casco**: a força desses escudos. Um número, válido para todos.

> **Convenção de índice dos 8 ângulos** (mesma do motor, `packages/engine/src/constants.ts`, também usada nas setas das cartas comuns § 5.5): sentido horário a partir do Norte — **0=N, 1=NE, 2=E, 3=SE, 4=S, 5=SW, 6=W, 7=NW**. Pares são lados, ímpares são cantos.

**Ser abordado:**

| Ângulo | Resultado |
|---|---|
| **Sem escudo** | Domínio automático. |
| **Com escudo** | Compare o Poder do atacante com o **Casco**. Poder **maior** domina. Empate ou menos: nada acontece. |

**O Navio troca de mão livremente.** Pode ser dominado quantas vezes for preciso, por qualquer jogador, inclusive por Abordagem em turnos seguidos. Vai pular de mão em mão, e isso é intencional: é o ponto quente do tabuleiro (Pilar #2), e disputar aquelas oito casas vizinhas é uma das linhas de jogo.

- Enquanto o Navio estiver sob Eltys adversário, **o passivo do seu Capitão fica desligado**.
- Se você retomar, **religa** na hora.
- Na pontuação final, o Navio vale **+1**, como qualquer carta.

Quem toma o Navio ganha 1 ponto, tira 1 do dono, e cala a regra que fazia o deck dele funcionar. Como ele troca de mão várias vezes, o que importa não é ter tomado — é **estar com ele no fim**, e ter deixado o outro sem passivo enquanto durou.

**Onde pode ser colocado:** fora da borda do tabuleiro. Num 5×5, isso é o anel interno — 8 casas, já que o centro é o Abismo. No canto, três dos oito ângulos apontariam pro vazio e nunca poderiam ser atacados, com Casco 5 ou 50.

**Gabarito de Navio:**

> **Escudos + Casco = 11**

| Escudos | Ângulos abertos | Casco |
|---|---|---|
| 3 | 5 | 8 |
| 4 | 4 | 7 |
| 5 | 3 | 6 |
| 6 | 2 | 5 |

Poucos escudos mas grossos (difícil de furar, fácil de contornar) contra muitos escudos mas finos (não tem por onde entrar, mas qualquer carta grande entra).

Elenco completo em § 7.

### 5.5 A carta comum

- **Poder** — número único, usado em todo Confronto.
- **Setas** — de 2 a 8, nas 8 posições da borda (4 lados, 4 cantos).
- **Elemento** — Energia, Anomalia, Paradoxo, Cognitivo ou Astral (os cinco do RPG, § 4). Um só.
- **Tipo** — Criatura, Embarcação ou NPC.
- **Efeito** — opcional, texto curto.

> **Nem elemento nem tipo têm regra própria.** São etiquetas: só fazem alguma coisa quando o texto de uma carta diz que fazem. Custa zero imprimir e abre espaço de design pra sempre.

**Rotação:**

Por padrão, a carta é colocada **na orientação impressa, sem escolha** — 0° fixo.

**Exceção:** cartas de **Paradoxo**, sob o Capitão **Cryow**, mantêm rotação livre nas **quatro orientações** — 0°, 90°, 180° e 270° — na hora de colocar. Cada giro desloca o padrão de setas em duas posições (um lado vira o lado seguinte, um canto vira o canto seguinte).

> Rotação livre já foi regra universal, pra toda carta de todo jogador — virou um poder específico de Capitão (Pilar #3). "Três setas em L" é uma ferramenta diferente em cada casa do tabuleiro só quando é uma carta de Paradoxo em mesa com o Cryow.

**Tipo:**

| Tipo | O que é | Papel |
|---|---|---|
| **Criatura** | O bestiário de Arcádia (§ 8.2) | O grosso do baralho, e o que rende arte. A maioria não tem efeito, mas as mais raras (Tier A e acima) podem carregar um. |
| **Embarcação** | Barcos pequenos, escunas de contrabando, naufrágios | Silhueta larga, muitas setas, Poder baixo |
| **NPC** | Gente de porto: contramestres, cartógrafos, Imperiais | Onde efeitos aparecem com mais frequência |

*Embarcação* e não *Navio*, pra não confundir com a peça do jogador.

### 5.6 A mão e as Cargas

**A mão base tem no máximo 5 cartas**, e as Cargas do seu Capitão ocupam espaço nela — mas só entram na mão **depois** do setup (§ 5.8), não fazem parte do lastro enterrado.

Capitão com Carga 3 (Navah, Navarro, Cycar) começa com **2 cartas comuns e 3 Cargas**. Capitão com Carga 1 (Katty) começa com 4 comuns e 1 Carga.

**Ao colocar uma carta comum:** compre até voltar a 5.

**Ao colocar uma Carga:** descarte **1 carta comum** da mão e compre até voltar a 5. A Carga saiu da mão e não volta, então aquele espaço fica livre pro resto da partida.

> **O descarte não pode ser uma Carga.** Sem essa trava, a linha ótima é jogar carga e descartar carga duas vezes seguidas, esvaziar o porão em dois turnos gastando só duas casas, e o arco da partida evapora.

O efeito disso é que você começa sufocado e termina com a mão aberta — e como o tabuleiro esvazia na direção contrária, o número de jogadas possíveis por turno fica quase constante do começo ao fim.

**A Carga em si:**

- **Neutra.** Não é de ninguém, não pontua pra ninguém, não entra em rota.
- Sem setas, não domina, **não pode ser dominada** — mas pode ser **destruída** por efeito específico de Capitão (Katty, § 6), o que é diferente de dominada: ninguém fica com ela, ela só sai do jogo.
- Serve pra fechar um ângulo aberto do seu Navio, cortar a rota do adversário, ou simplesmente destravar a sua mão.

### 5.7 Os dois modos

**PORTO — o indicado.** Draft na hora. Ninguém chega com o deck resolvido de casa, e coleções desiguais jogam parelho.

**ROTA — pra quem já manja.** Deck construído em casa: 12 cartas comuns, máximo 2 cópias de cada e 1 Lendária.

**O draft do Porto:** três rodadas. Em cada uma, um jogador abre **4 cartas por jogador na mesa** (8 num jogo de 2, 16 num de 4) e todos compram uma por vez até acabar.

- Quem abriu compra **por último**.
- O papel de abrir gira a cada rodada.
- Ao fim, cada um tem **12 cartas comuns**.

As cartas saem do **Baralho do Porto** (pilha comum) ou, em campanha, da coleção do próprio jogador.

> Escolha Capitão e Navio **antes** do draft. O passivo do Capitão é o que diz o que vale a pena comprar.

### 5.8 Preparação

1. Monte a grade e marque os **Abismos**. Casa morta.
2. Cada jogador escolhe **Capitão** e **Navio** e revela os dois.
3. **Setup escondido:** cada jogador enterra **1 Navio + 2 Cargas de um lastro neutro**, virados para baixo, na ordem que quiser. Esse lastro é sempre o mesmo pra todo mundo — **não sai da Carga do Capitão**, é fixo independente de quem você escolheu. O Navio não pode ir na borda e entra em pé.
4. **Revela tudo de uma vez.**
5. **Só agora monte a mão:** pegue as Cargas do seu Capitão + compre cartas comuns do baralho, até ter no máximo **5 cartas no total**.

> O setup não é sobre blefe de identidade de carta (o lastro é sempre Carga, sem força nenhuma) — o que ele esconde é **posição**: até a revelação, ninguém sabe em qual das 8 casas do anel o Navio adversário está, o que mantém o primeiro ataque de cada jogador como aposta, não cálculo. Reforça o Pilar #2. Item de alta prioridade na checklist de playtest (§ 13).

### 5.9 O turno

**1. Coloque uma carta** da mão em qualquer casa vazia, na orientação permitida (§ 5.5).

**2. Resolva cada seta** que aponte para uma carta adversária adjacente:

- **Abordagem** — a carta alvo **não** tem seta apontando de volta. Domínio automático.
- **Confronto** — a carta alvo **tem** seta apontando de volta. Compare os Poderes. Maior vence. **Empate: o defensor mantém.**

Contra **Navio**: ângulo aberto domina; ângulo com escudo exige Poder maior que o Casco.
Contra **Carga**: nada acontece (exceto efeito específico de Capitão, § 6).

**3. Cadeia.** Toda carta dominada **por Confronto** propaga: as cartas adversárias para as quais ela aponta e que não apontam de volta são dominadas também. Abordagem não propaga. Navio não propaga. Cada carta só pode ser dominada uma vez por turno.

**4. Reponha a mão** conforme as regras de Carga (§ 5.6).

### 5.10 Fim e pontuação

Acaba quando todas as casas livres estão ocupadas. **Vence quem fizer mais pontos.**

| Fonte | Pontos |
|---|---|
| Cada carta comum sob o seu Eltys | +1 |
| Cada Navio sob o seu Eltys (o seu ou o tomado) | +1 |
| **Maior rota da partida** | **+3** |
| Cartas de Carga | 0 |

**A rota** é a maior cadeia de cartas comuns suas ligadas por **setas mútuas** — as duas cartas precisam apontar uma para a outra. Navios e Cargas nunca entram.

Empate na maior rota: **ninguém leva os +3**. Empate na pontuação: **Deriva**.

> Os +3 são o contrapeso do jogo. Carta com muitas setas tem Poder baixo pelo orçamento de Tier e perde quase todo Confronto — mas é ela que costura rota longa.

### 5.11 Escala por número de jogadores

> **Fora do escopo v1** (§ 9) — documentado como visão de longo prazo, não implementado.

Todos contra todos.

| Jogadores | Grade | Abismos | Colocações por jogador | Deck |
|---|---|---|---|---|
| 2 | 5×5 | 1 (centro) | 9 | 12 |
| 3 | 6×6 | — | 9 | 12 |
| 4 | 7×7 | 1 (centro) | 9 | 12 |
| 6 | 8×8 | 4 (miolo 2×2) | 7 | 12 |

As casas livres depois do setup dividem exato pelo número de jogadores.

> **Fique de olho a partir de 3.** Todos contra todos em jogo de domínio tende a virar "todo mundo bate em quem está na frente". A correção mais barata é duplas e trios com pontuação somada (§ 12).

### 5.12 Gabarito de criação de carta

> Ferramenta **sua**, na hora de criar carta. Não vai pra mesa.

**Tier é orçamento, não é sobre contagem de Setas.** *(Reescrito 2026-08-06 — a versão anterior definia Tier só pela contagem de Setas, e usava Modificador/Trava com custos diferentes. Não bate mais com como o elenco real foi desenhado, ver § 8.)* Toda carta comum tem um total fixo pro seu Tier:

> **Setas + Poder + custo de Efeito = Tier**

| Tier | Total |
|---|---|
| D | 10 |
| C | 11 |
| B | 12 |
| A | 13 |
| S | 14 |
| SS | 15 |

Sem efeito, **B (12) é o padrão** — qualquer combinação Setas/Poder sem efeito já soma 12 (2+10, 3+9, 4+8, 5+7, 6+6, 7+5, 8+4). Tiers abaixo do padrão (D, C) são cartas deliberadamente mais fracas do que a contagem de Setas sugeriria; tiers acima (A, S, SS) são mais fortes. **Setas e Poder são potes independentes dentro do total** — Tier baixo não obriga muitas Setas: dá pra ser fraco com poucas Setas e Poder baixo também, contanto que a soma bata.

**Todo efeito custa 2** — Modificador (mexe no número da comparação, ex: *cartas de Anomalia adversárias têm −2 de Poder contra esta*), Trava (nega a interação inteira, ex: *cartas de Cognitivo nunca dominam esta*), ou exceção de regra (ex: *pode ser colocada sobre uma Carga*) custam o mesmo. Não existe mais preço diferente por tipo de efeito.

**SS (15) é, na prática, Lendária** — máximo 1 por deck no modo Rota (§ 5.7).

**Por que respeitar isso:** as cartas vão ser entregues uma por uma como loot de sessão (§ 10). Se carta nova for carta mais forte sem gastar Tier, quem jogou mais sessões ganha sem jogar. Com o orçamento, carta de Tier alto é rara de propósito, não um acidente de design.

**Escrita de efeito:**

- Um gatilho por carta: *ao entrar*, *ao ser dominada*, *ao vencer um Confronto*, *enquanto*.
- Sinergia por **elemento** ou por **tipo**. É o que dá sentido aos símbolos.
- Efeito que muda **quem se conecta com quem** é mais interessante e menos perigoso que efeito que muda Poder.
- Nada que cancele o turno do adversário.

---

## 6. Capitães — elenco de lançamento (7)

Regra geral de design do passivo já em § 5.3 (sempre passiva, sempre só bônus, sempre ligada a um arquétipo nomeado). Esta seção é o elenco real.

> **Fechado 2026-08-06**, com pontos de resolução mecânica ainda em aberto — ver final desta seção.

| Capitão | Arquétipo | Passiva | Cargas |
|---|---|---|---|
| **Navah** | Buffer | Suas cartas de Criatura têm +2 de Poder. | 3 |
| **Navarro** | Buffer | Suas cartas de NPC têm +2 de Poder. | 3 |
| **Cycar** | Buffer | Suas cartas de NPC têm +1 de Poder para cada espaço vazio ao redor da posição escolhida, **até um máximo de +3**. | 3 |
| **Katty** | Controlador | Suas cartas do elemento Anomalia destroem Cargas adjacentes — ganha 1 ponto por Carga destruída. | 1 |
| **Violet** | Controlador | Suas cartas podem ser colocadas sobre uma carta **sua** já dominada, ou sobre uma Carga, em vez de só em casa vazia. | 2 |
| **Golar** | Movimento | No final do turno, suas cartas adjacentes (vertical/horizontal) ao Navio são empurradas 1 casa **radialmente, pra longe do Navio**, se houver espaço. | 2 |
| **Cryow** | Movimento | Suas cartas do elemento Paradoxo podem ser rotacionadas na hora de colocar (§ 5.5). | 2 |

**No banco** (nomes válidos, não usados no lançamento — podem voltar em expansão): Annya, Favacha, Loren, Oswald.

**Por que os arquétipos existem:** três categorias — Buffer (mexe em Poder por Tipo/situação), Controlador (nega ou reconfigura uma regra padrão a seu favor), Movimento (quebra a regra de "carta fica onde foi colocada", § 5.5/5.9) — cada Capitão é uma instância clara de um deles, nunca uma frase de efeito solta.

**Decisões de balanceamento já feitas:**
- **Cycar — teto de +3.** Sem teto, o bônus chegava a +8 num tabuleiro vazio (turno 1), quebrando a troca setas×Poder do orçamento de Tier (§ 5.12) — um NPC de 8 setas/4 Poder (a carta mais fraca do orçamento, feita só pra Rota) virava 12 de Poder de graça, sem contrajogo possível nos primeiros turnos. +3 fica um pouco acima do +2 fixo do Navah/Navarro, como compensação por exigir leitura de tabuleiro (o bônus não é garantido — cai conforme a mesa enche).
- **Cycar / Katty** — calculados **uma vez, no momento da colocação**. O Poder do Cycar fica fixo depois de colocado; a Carga da Katty só é destruída se já estiver adjacente na hora da jogada, não depois.
- **Violet** — só cartas **suas** já dominadas, nunca do adversário. Continua sendo utilidade/reciclagem, não uma forma de ignorar Abordagem/Confronto.
- **Golar** — empurrão é **radial, pra longe do Navio**, e é **reposicionamento mudo** — não re-dispara Abordagem/Confronto contra os vizinhos novos. Só importa pro cálculo final de Rota (§ 5.10) e pras jogadas futuras. Sem isso, Golar ganharia uma rodada extra de combate de graça todo turno — forte demais, e complica a ordem de resolução se mais de uma carta empurrar ao mesmo tempo.
- **Cryow** — rotacionar acontece **no momento de colocar a carta**, parte da ação normal de "colocar uma carta" — não é uma ação ativa separada, e por isso nem levanta a questão de "re-disparo": as setas resolvem uma vez, na hora de colocar, exatamente como qualquer carta.
- **Katty pontua mesmo, de propósito.** Cada Carga destruída rende **+1 ponto**, uma exceção deliberada ao § 5.10 (Carga normalmente vale 0). Fica como o item de maior risco de balanceamento do elenco pra observar em playtest (§ 13): o setup sozinho já bota 4 Cargas no tabuleiro antes do turno 1 (2 por jogador, lastro fixo), o que dá a Katty uma fonte de pontos incondicional — não depende de vencer Confronto nenhum — disponível cedo. Se isso se provar forte demais em jogo real, o teto (como o do Cycar) é o conserto mais direto.

---

## 7. Navios — elenco de lançamento (7)

> **Fechado 2026-08-06.** Ângulos exatos usando a convenção real do motor (`packages/engine/src/constants.ts`): índices 0-7 no sentido horário a partir do Norte — **0=N, 1=NE, 2=E, 3=SE, 4=S, 5=SW, 6=W, 7=NW**. Pares (0,2,4,6) são lados, ímpares (1,3,5,7) são cantos — bate com "4 lados, 4 cantos" de § 5.5.

**Regra de design (vale pro elenco inteiro, não só estes 7):** diferente das cartas comuns — onde Elemento e Tipo são só etiquetas sem regra própria (§ 5.5) — em Navios o **Tipo carrega peso mecânico real**. **Orgânico** tende a mais Escudos, porém mais fraco (Casco baixo). **Material** tende a menos Escudos, porém mais forte (Casco alto). Reforça a distinção do RPG (`03_02_00_navios.md`) sem herdar a complexidade de Slots/Setores, que não existe no card game.

| Navio | Tipo | Escudos (ângulos) | Casco | Flavor |
|---|---|---|---|---|
| **Scarlet** | Material | `[0,2,4]` — N, E, S | **9** ⚠️ | Casco vermelho, fino e certeiro — três lados impenetráveis mesmo pra quase todo o baralho, mas cinco ângulos totalmente nus. Ou você entra de graça, ou precisa da sua melhor carta. |
| **Violet** | Material | `[1,3,5]` — NE, SE, SW | **9** ⚠️ | Irmã da Scarlet, mesmo Casco reforçado — guarda cantos em vez de lados. Prova de que o mesmo número joga diferente dependendo de onde a casa cai. |
| **Cruz Imperial** | Material | `[0,2,4,6]` — N, E, S, W | 7 | Nau de patrulha de Camelot — os quatro lados cardeais fechados como muralha, os quatro cantos abertos. O nome não é acidente: bate com os Imperiais de Camelot (§ 4), armadura branca, cruz vermelha no peito. |
| **Encruzilhada** | Material | `[7,0,1,4]` — NW, N, NE, S | 7 | Proa vigiando três direções ao mesmo tempo, popa coberta — mas os dois flancos e a retaguarda diagonal ficam cegos. Um batedor, não um tanque. |
| **Tormenta** | Orgânico | `[7,0,1,3,5]` — NW, N, NE, SE, SW | 6 | Fera de tempestade — instinto protege a frente inteira e os dois cantos de trás, mas os dois lados e a popa estão nus. |
| **Chapa de Ferro** | Orgânico | `[0,1,2,3,4,7]` — N, NE, E, SE, S, NW | 5 | Nome irônico pra uma criatura viva: pele tão dura que parece placa de metal. Quase todo blindado por instinto, só o flanco Oeste/Sudoeste fica cego — mas qualquer coisa que entre por ali afunda o barco. |
| **Alcateia dos Céus** | Orgânico | `[0,2,4,5,7]` — N, E, S, SW, NW | 6 | Bando de criaturas voadoras puxando o mesmo casco — defesa assimétrica, como uma alcateia cercando a presa por um lado só. |

**Exceção nomeada ao gabarito:** Scarlet e Violet têm Casco 9, não 8 — `Escudos + Casco = 12`, não 11. Justificativa: com só 3 Escudos, 5 dos 8 ângulos ficam totalmente abertos (Abordagem automática, Poder nem entra na conta) — o Casco só importa nos poucos casos em que um ataque é forçado a vir por um ângulo guardado. Casco 9 exige Poder 10 pra furar, restrito à fatia mais rara do baralho — mesma lógica de exceção que Tier SS já tem no orçamento de carta (§ 5.12).

**Notas:**
- Nenhum dos 7 nomes/dados bate com o que estava em `packages/engine/src/content/ships.json` do protótipo (`ship-1` "A Viúva Negra" incluído) — este GDD é a fonte de verdade; sincronizar o protótipo é tarefa de implementação futura, não pré-requisito pra esta seção estar fechada.

---

## 8. Cartas comuns — elenco de lançamento

> **Fechado 2026-08-06.** Usa o orçamento de Tier de § 5.12. 33 comuns + 4 Lendárias = 37 cartas.

### 8.1 Baralho original — NPCs e Embarcações (7)

As 5 cartas de Embarcação e 2 de NPC que já existiam no protótipo (`packages/engine/src/content/cards.json`), auditadas contra o orçamento nesta sessão. Uma correção: **Contramestre Vey** tinha um efeito (Trava) sem descontar o custo do Poder — subiu de Poder 2 pra 4 pra fechar em Tier B. As 13 cartas de Tipo Criatura que existiam nesse mesmo baralho original **foram descartadas e substituídas** por § 8.3 — nomes inventados sem lastro, revisitados nesta sessão.

| Setas | Nome | Tipo | Elemento | Poder | Tier | Efeito |
|---|---|---|---|---|---|---|
| 4 | Cartógrafo do Porto | NPC | Anomalia | 6 | B | Modificador: Anomalia adversária −2 contra esta |
| 6 | Contramestre Vey | NPC | Paradoxo | 4 *(corrigido)* | B | Trava: Energia nunca domina esta |
| 7 | Galé do Naufrágio Salgado | Embarcação | Cognitivo | 5 | B | — |
| 7 | Lancha do Contrabandista | Embarcação | Astral | 5 | B | — |
| 7 | Baleeira Esfarrapada | Embarcação | Energia | 5 | B | — |
| 8 | Casco Afundado | Embarcação | Anomalia | 4 | B | — |
| 8 | Armada de Madeira à Deriva | Embarcação | Paradoxo | 4 | B | — |

### 8.2 Bestiário do RPG (12)

Adaptação direta de 12 criaturas reais do bestiário de Arcádia (`book/creatures.json`, repositório irmão fora de `arcadia_card_game`). Nível/HP/DA do RPG definiram a força relativa; Elemento veio da lore de cada uma (ex: Nauak nasceu de "magia paradoxal" → Paradoxo; Sugovat rouba traumas/memórias → Cognitivo; Tuntruga se camufla mimetizando pedra → Anomalia). Onde há efeito, ele espelha uma imunidade real da criatura no RPG — não é inventado.

| Tier | Nome | Tipo | Elemento | Setas | Índices | Poder | Efeito |
|---|---|---|---|---|---|---|---|
| SS | Sugovat | Criatura | Cognitivo | 2 | `[3,7]` | 11 | Trava: Astral nunca domina esta |
| SS | Nauak | Criatura | Paradoxo | 7 | `[0,2,3,4,5,6,7]` | 6 | +3 de Poder contra cartas do Tipo NPC |
| A | Tuntruga | Criatura | Anomalia | 4 | `[7,0,1,2]` | 9 | — |
| A | Vinhavora | Criatura | Anomalia | 5 | `[0,1,2,4,6]` | 8 | — |
| A | Dragão das Planícies | Criatura | Energia | 4 | `[0,1,4,5]` | 7 | Pode ser colocada sobre uma Carga |
| A | Las Praga | Criatura | Energia | 6 | `[0,1,2,3,5,7]` | 7 | — |
| A | Las Grande | Criatura | Energia | 3 | `[0,3,6]` | 8 | Trava: Cognitivo nunca domina esta |
| B | Hondra | Criatura | Astral | 4 | `[1,3,5,7]` | 8 | — |
| C | Pedroso | Criatura | Astral | 4 | `[0,2,3,6]` | 7 | — |
| C | Anomora | Criatura | Anomalia | 7 | `[0,1,2,3,4,5,7]` | 4 | — |
| D | Goblin Saqueador | Criatura | Paradoxo | 6 | `[0,1,2,3,4,6]` | 4 | — |
| D | Goblin Explorador | Criatura | Cognitivo | 6 | `[0,1,2,4,5,7]` | 4 | — |

**Notas:**
- Todas Tipo Criatura, mas 4 delas carregam efeito (Sugovat, Nauak, Dragão, Las Grande) — isso amplia o que § 5.5 diz sobre Tipo (efeito não é mais exclusividade de NPC, só mais raro em Criatura).
- `book/creatures.json` tem exatamente essas 12 criaturas — nenhuma sobrando pra levas futuras (conferido nesta sessão). A única coisa a mais era uma variante interna do Pedroso ("Pedroso Menor"), descartada por decisão do usuário.

### 8.3 Criaturas originais de Arcádia (18)

Sem mais fonte real de bestiário disponível, essas 18 foram criadas do zero — mas ancoradas nas regiões e planos de Arcádia já estabelecidos em § 4, não são nomes decorativos. Substituem as 13 cartas Criatura do baralho original (§ 8.1 antiga), que eram só flavor oceânico sem lastro nenhum.

**13 gerais**, cobrindo Tier D a A, mais 2 Lendárias novas substituindo "O Soberano Sem Maré" e "Fauce-do-Vazio":

| Tier | Nome | Tipo | Elemento | Setas | Índices | Poder | Efeito | De onde vem |
|---|---|---|---|---|---|---|---|---|
| D | Ratazana-de-Casco | Criatura | Anomalia | 7 | `[0,1,2,3,4,5,6]` | 3 | — | Praga comum em cascos abandonados no Mar de Nuvens |
| D | Gaivota-Chorona de Union | Criatura | Cognitivo | 8 | `[0,1,2,3,4,5,6,7]` | 2 | — | Ave carniceira dos portos de Union, grito perturbador |
| C | Escorpião de Rubra | Criatura | Energia | 6 | `[0,1,2,4,5,6]` | 5 | — | Deserto de Rubra, carapaça usada por engenheiros locais |
| C | Lince-das-Neves do Norte | Criatura | Paradoxo | 5 | `[1,2,4,5,7]` | 6 | — | Predador solitário do Norte de Galahad |
| C | Sussurro do Duto | Criatura | Astral | 6 | `[0,2,3,4,6,7]` | 5 | — | Vive nos túneis de Britannia, folclore dos anões sobre desabamento |
| B | Ceifeira das Copas | Criatura | Anomalia | 5 | `[0,1,3,5,6]` | 7 | — | Caça do topo das árvores colossais de Galahad, camuflada |
| B | Arauto de Ferro | Criatura | Energia | 4 | `[0,2,5,7]` | 8 | — | Besta de guerra criada pelos Imperiais de Camelot |
| B | Medusa das Correntes | Criatura | Cognitivo | 6 | `[1,2,3,4,5,7]` | 6 | — | Água-viva do céu que deriva entre ilhas, ferroada alucinógena |
| A | Guardiã de Galahad | Criatura | Anomalia | 4 | `[0,3,5,6]` | 9 | — | A própria floresta de Galahad, decidindo quem pode passar |
| A | Devorador de Auroras | Criatura | Astral | 4 | `[0,1,3,6]` | 7 | Modificador: Astral adversária −2 | Predador raro do Norte, se alimenta da luz arcana do céu |
| A | Leviatã de Rubra | Criatura | Paradoxo | 3 | `[2,4,7]` | 10 | — | Ser colossal que nada pelas dunas profundas de Rubra |
| **SS** | O Arquiteto do Caos | Criatura | Energia | 3 | `[1,4,6]` | 10 | Trava: Paradoxo nunca domina esta | Testemunhou o Período Existencial, antes do próprio conceito de Paradoxo existir |
| **SS** | A Última Maré de Aetheria | Criatura | Astral | 4 | `[2,3,5,7]` | 9 | Modificador: +3 contra Embarcação | Guarda a ilha lendária de Aetheria — a mesma do exemplo de Fennick em § 4 |

**5 Figuras — Tier S**, preenchendo o que a § 8.2 deixou vazio de propósito. Seres que usaram tanto o próprio elemento que foram corrompidos e dominados por ele — a consequência levada ao extremo das "Leis" de cada elemento no RPG (Lei da Volatilidade Arcana, Lei da Deformação Residual, etc., `content/books/02_02_0X`). Todas têm o mesmo efeito estrutural — **imunes ao próprio elemento**, já saturadas demais pra mais dele entrar, mesmo padrão do Cartógrafo do Porto (§ 8.1) levado ao extremo — o que faz a diferença entre elas ser só Setas/Poder, numa progressão limpa (a mesma curva do gabarito base, deslocada +2):

| Tier | Nome | Tipo | Elemento | Setas | Índices | Poder | Efeito |
|---|---|---|---|---|---|---|---|
| S | Figura de Energia | Criatura | Energia | 2 | `[1,5]` | 10 | Trava: Energia nunca domina esta |
| S | Figura de Anomalia | Criatura | Anomalia | 3 | `[2,5,7]` | 9 | Trava: Anomalia nunca domina esta |
| S | Figura de Paradoxo | Criatura | Paradoxo | 4 | `[1,2,5,6]` | 8 | Trava: Paradoxo nunca domina esta |
| S | Figura de Cognitivo | Criatura | Cognitivo | 5 | `[1,3,4,6,7]` | 7 | Trava: Cognitivo nunca domina esta |
| S | Figura de Astral | Criatura | Astral | 6 | `[1,2,3,5,6,7]` | 6 | Trava: Astral nunca domina esta |

**Notas:**
- Total de Lendárias (SS) no pool inteiro: **4** — Sugovat e Nauak (§ 8.2) mais O Arquiteto do Caos e A Última Maré de Aetheria (aqui). Todas valem "máximo 1 por deck" (§ 5.7).
- Distribuição de Elemento no pool combinado de 33 comuns: **Anomalia 9**, Energia 7, Astral 6, Paradoxo 6, **Cognitivo 5** — Anomalia ficou puxando mais que o resto, Cognitivo é o mais raro. Não é grave (nenhum é zero), mas se a próxima leva de cartas mirar em equilibrar, é Cognitivo que precisa de mais peças.
- `packages/engine/src/content/cards.json` do protótipo não reflete nada disso — este GDD é a fonte de verdade.

---

## 9. Modos de jogo e escopo de jogadores (v1)

> **Decisão registrada 2026-08-06:** o v1 comercial (Unity) mira **1×1 apenas — contra bot e contra outro jogador (online e/ou local).** § 5.11 já existe como visão de longo prazo, não escopo de lançamento.

Isso também casa com o estado técnico real do protótipo: `PlayerId = 'P1' | 'P2'` está hardcoded em todo o motor (`packages/engine`), e escalar pra 3+ jogadores é um refator real, não um parâmetro — não foi começado. Ver `CLAUDE.md` § Non-negotiable invariants.

| Modo | Descrição | Escopo v1 |
|---|---|---|
| **Porto** (draft na hora) | Modo recomendado — ninguém chega com deck resolvido, coleções desiguais jogam parelho. | Dentro do escopo v1. |
| **Rota** (deck construído) | Pra quem já manja — 12 comuns + 1 Lendária, montado em casa. | Dentro do escopo v1. |
| **vs. Bot** | Contra IA. | Dentro do escopo v1 — já existem bots/simulação no protótipo (`npm run simulate`, `npm run batch`). |
| **vs. Jogador (online)** | Multiplayer real via código de sala. | Já validado no protótipo web (PartyKit); arquitetura equivalente precisa ser recriada em Unity — decisão de rede (P2P vs. servidor autoritativo) ainda não tomada pro produto final. |
| **3/4/6 jogadores, duplas/trios** | Escala descrita em § 5.11, "Fique de olho a partir de 3" quanto a balanceamento. | **Fora do escopo v1.** Backlog (§ 12). |

---

## 10. Progressão e coleção

As regras dizem que cartas "vão ser entregues uma por uma como loot de sessão" — mas não definem o formato. **Isso segue em aberto.** Opções cogitadas, nenhuma escolhida:

- **Recompensa pós-partida** — toda partida rende carta nova, tipo loot casual.
- **Progressão por campanha/história** — cartas desbloqueadas seguindo capítulos/missões.
- **Híbrido** — loot casual + marcos de campanha pra Capitães/Navios/raras.

**Por que isso importa antes de produzir conteúdo demais:** o próprio orçamento de Tier (§ 5.12) foi desenhado assumindo *algum* sistema de loot sequencial ("se carta nova for carta mais forte, quem jogou mais sessões ganha sem jogar") — então a forma exata da progressão deveria ser decidida antes de desenhar a curva de desbloqueio de conteúdo (quantas cartas por sessão, se existe "banco" de cartas disponíveis desde o início no modo Rota vs. indisponíveis até desbloquear, etc.).

---

## 11. Direção de arte

**Carta quadrada, sem moldura circular.** A maioria das cartas hoje é colocada em orientação fixa (§ 5.5) — mas cartas de Paradoxo sob o Capitão Cryow continuam girando livremente, então pra essa fatia do baralho arte e texto ainda vão aparecer de lado ou de cabeça pra baixo com frequência. É aceito: dá pra ler e dá pra reconhecer de qualquer ângulo.

As três práticas abaixo continuam valendo pro baralho inteiro, não só pras cartas que giram — não custam nada e mantêm a arte consistente caso mais poderes de rotação apareçam depois:

- **O Poder no centro**, ou repetido em cantos opostos, pra ser lido em qualquer orientação.
- **Texto de efeito curto.** Uma linha. Frase longa de cabeça pra baixo é onde o ritmo morre.
- **As setas na borda são a informação mais importante da carta** — precisam ter contraste alto contra a arte, porque é nelas que o olho bate primeiro.

**O elemento é a paleta.** Cinco elementos, cinco esquemas de cor, reconhecíveis do outro lado da mesa antes de ler qualquer número.

**O Capitão é a carta grande.** Fora do tabuleiro, orientação fixa, arte cheia, nome próprio. É onde mora a personalidade do jogador e onde vale gastar o melhor da ilustração.

**O Navio precisa de moldura própria.** Formato, tamanho ou borda diferente das comuns — ele é a peça mais disputada do tabuleiro e não pode se perder no meio das criaturas. Reforçado pelo fato de que, no lore do RPG, Navios Materiais e Orgânicos são visualmente muito diferentes entre si — dá pra usar isso como variedade visual entre os 7 Navios do elenco (§ 7).

**Sem moldura narrativa pra justificar o estilo** (ver § 4 — "Mundo das Tintas" cortado). A estética fica sustentada só pelas exigências práticas acima, sem uma explicação diegética de "por que a arte é assim". O framing do "garoto do porto" (§ 4) cobre posicionamento de marca/marketing, não é regra de produção de carta individual.

---

## 12. Backlog de design (ideias em avaliação)

Registro do que foi discutido e não entrou, pra não se perder.

**Remover o Navio do tabuleiro.** *Avaliado e descartado.* Capitão e Navio ficariam os dois de fora e o setup seria só Cargas escondidas. Ganharia simplicidade real, mas perderia o segundo objetivo da partida e a única forma de interferir na build do adversário. O que motivou a ideia — o personagem ter pouca personalidade — foi resolvido movendo o texto de regra pro Capitão. Guardado caso um dia se queira uma versão leve.

**Navio com efeito compartilhado.** Cada jogador escolhe um navio cujo efeito vale para a mesa inteira. Descartado como base: mata a ideia de build e não escala pra 4 jogadores. Possível categoria de expansão.

**Navio como tapete de jogador.** Se o Navio voltasse a ficar fora, viraria um tapete com os lugares marcados: deck, mão, Eltys. Organiza a mesa e faz o produto parecer board game.

**Segundo número no Capitão.** Iniciativa, ou quantas cartas ele draftea. Caráter sem um segundo texto de regra rodando na mesa.

**Variante Sigilo.** O Navio fica virado pra baixo até alguém se conectar a ele, em vez de ser revelado no fim do setup. A dedução corre a partida inteira.

**Duplas e trios.** Para 4 e 6 jogadores, com pontuação somada, cada um mantendo seu Capitão e seu Navio.

---

## 13. Checklist de playtest

Itens originais da v0.9 das regras, mais os que surgiram desenhando Capitães/Navios/Cartas nesta sessão.

1. **A Carga está boa demais ou ruim demais?** Se todo mundo despejar as cargas nos três primeiros turnos, o descongestionamento está barato. Se ninguém jogar nenhuma, o custo em casas está alto.
2. **O Navio vira o jogo inteiro?** Ele pula de mão em mão de propósito. Se as partidas viverem só em torno daquelas oito casas e o resto do tabuleiro ficar indiferente, o problema é o passivo do Capitão estar forte demais.
3. **O Casco está na faixa certa?** Poder das comuns vai de 2 a 11 agora (§ 8). Casco 5 é furado por boa parte do baralho; Casco 9 (Scarlet/Violet) só cai pra Tier SS.
4. **Os +3 da rota decidem sozinhos?** Se toda partida virar corrida por rota, cai pra +2.
5. **Abordagem é forte demais?** Com Cryow/Paradoxo em mesa, a carta de poucas setas fica melhor do que parece. Se decks de 2–3 setas dominarem, endureça a coluna de cima do orçamento.
6. **O elemento e o tipo estão pesando?** Só existem através do texto das cartas. Se o símbolo parecer decoração, mais cartas mencionando na próxima leva.
7. **Duração real.** 24 colocações num jogo de 2 (mão agora com máximo 5, não 7 — recontar). Se estourar 30 min, corte uma Carga antes de mexer no tabuleiro.
8. **Passiva sem ônus fica forte demais sem avisar?** Sem ônus escrito no texto do Capitão, é mais fácil um passivo passar do ponto sem que isso salte aos olhos de quem lê a carta — Cycar já precisou de teto (§ 6); vale reler o elenco inteiro com esse viés.
9. **Katty muda o total de pontos da partida?** Cargas destruídas geram pontos que não existiam antes (§ 5.10 normalmente zera Carga) — e o setup sozinho já garante 4 Cargas no tabuleiro antes do turno 1. Testar se isso desequilibra o placar final; se sim, aplicar teto (mesma lógica do Cycar).
10. **Empurrão do Golar confunde a leitura de Rota?** Reposicionamento silencioso pode deixar difícil acompanhar de cabeça qual é a "maior cadeia" no fim de jogo, mesmo sem re-disparar captura — vale testar com tabuleiro físico ou protótipo antes de assumir que é só cosmético.
11. **O orçamento de Tier (D-SS) entrega variedade real, ou os extremos quebram o jogo?** *(novo)* Sugovat (2 setas/11 Poder) e Nauak (7 setas/6 Poder + efeito) são os primeiros cards fora do padrão B(12) do baralho original — testar se saem cedo demais e decidem a partida sozinhos antes de produzir mais S/SS.

---

## 14. Questões em aberto

| Questão | Status |
|---|---|
| Nome definitivo do jogo | ✅ Resolvido — ELTYCA |
| Nome da carta neutra | ✅ Resolvido — Carga |
| Moldura "Mundo das Tintas" como ficção oficial do card game | ✅ Resolvido — cortada |
| Quantos Capitães/Navios/Cartas no set base | 🟡 Parcial — 7 Capitães (§ 6), 7 Navios (§ 7) e 33 comuns + 4 Lendárias (§ 8) fechados; só a forma de desbloqueio de conteúdo novo segue em aberto |
| Modo campanha / como cartas entram na coleção | 🔴 Em aberto (§ 10) |
| Modelo de venda (premium / DLC / F2P) | 🔴 Em aberto (§ 3) |
| Arquitetura de rede pro multiplayer em Unity | 🔴 Em aberto — protótipo web usa PartyKit/Durable Object; não decidido se isso se repete em Unity |
| Framing "garoto do porto" afeta UI ou só arte/marketing | 🔴 Em aberto (§ 4) |
| Katty gera pontos destruindo Cargas — total de pontos da partida deixa de ser fixo | 🔴 Em aberto, mantido de propósito — ver § 6 e § 13; teto é o conserto se se provar forte demais |
| Ideias em avaliação (backlog completo) | 🔴 Nenhuma decidida ou descartada — ver § 12 |
| Testes de balanceamento (Carga, Navio/Casco, +3 da rota, Abordagem, elemento/tipo pesando, duração real, passiva sem ônus, leitura de Rota com o empurrão do Golar, extremos do orçamento de Tier) | 🔴 Em aberto — ver § 13; ainda pendentes de playtesting sistemático |

---

## 15. Referências

- `regras_v0.9.md` — **removido 2026-08-06**, incorporado a este documento (§ 5 em diante). Versão original recuperável pelo histórico do git, se precisar.
- [ARCHITECTURE.md](ARCHITECTURE.md) — arquitetura técnica do protótipo web (não vinculante pro produto Unity).
- `content/books/` — livro de regras do RPG de mesa Arcádia (lore fonte). Especialmente relevantes pra ELTYCA: `01_01_00_introducao.md`, `02_02_00_elementos.md` (+ os 5 arquivos de elemento individual), `03_02_00_navios.md`, `03_03_00_constelacao_e_navegacao.md`, `04_03_00_regioes.md`, `04_06_00_bestiario.md`.
- `content/tall_tails/` — contos curtos ambientados em Arcádia, fonte potencial de flavor text pra cartas individuais (não explorado ainda neste GDD).
- `content/timeline.json` — linha do tempo histórica de Arcádia.
- `book/creatures.json` — bestiário completo do RPG Arcádia, repositório irmão fora de `arcadia_card_game`. Fonte das 12 Criaturas de § 8.2 — as 12 que existem no arquivo, nenhuma sobrando (conferido 2026-08-06). Levas futuras de Criatura precisam de fonte nova ou vão ser originais, como § 8.3.
