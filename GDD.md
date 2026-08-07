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

1. **Um texto de regra por jogador.** Todo o "motor" de um deck mora no passivo do Capitão. *(2026-08-07 — endurecido: cartas comuns não têm efeito de texto nenhum por enquanto, nem raro. Só o Capitão carrega regra. Ver § 5.12.)* A profundidade vem de posicionamento, não de pilhas de keywords.
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
| **Modelo de venda** | **Pago único.** Comparável direto: Balatro (solo dev, Steam, pago único, sem live-ops). DLC futura fica possível, não é compromisso. |
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
| **Mar de Nuvens** — mundo de continentes flutuantes, sem chão firme, viajado por navios voadores (`01_01_00_introducao.md`) | É o cenário principal — o "mar de perigos" onde as cartas acontecem (§ 4, origem do jogo). O bestiário das cartas, porém, veio de puxar Arcádia inteira, não só o Mar de Nuvens — ver § 8.1. |
| **Eltys** — minério arcano raro que move navios, alimenta feitiços e é a base de poder econômico das nações (`04_03_00_regioes.md`) | É literalmente o nome da ficha de domínio do jogo. Proposta de flavor (não confirmada, revisar): as fichas de Eltys do jogo são pedaços reais do minério — dominar uma carta é "carregá-la" com Eltys, o mesmo recurso que decide poder entre nações no mundo real do jogo. |
| **Os Cinco Elementos** — Energia, Anomalia, Paradoxo, Cognitivo, Astral, o sistema de magia do RPG (`02_02_00_elementos.md`) | São, nome por nome, os cinco elementos das cartas comuns (§ 5.5). Não é coincidência — é o mesmo sistema arcano, só que virado paleta de cores e etiqueta de carta. |
| **Camelot e os Imperiais** — a guarda nacional de Camelot (`04_03_00_regioes.md`) | Batizam o Navio "Cruz Imperial" (§ 7). |
| **Constelações e Navegação** — assinaturas mágicas usadas pra rastrear ilhas que nunca ficam paradas (`03_03_00_constelacao_e_navegacao.md`) | Não vira mecânica direta (evitar confundir com "Conexão", a cadeia de setas mútuas do card game — ver § 5.1), mas é uma fonte natural de flavor pra Mito ainda não usada — nenhuma carta atual referencia Fennick ou Constelação diretamente (as duas tentativas anteriores, Fennick e "A Última Maré de Aetheria", saíram do pool). Candidato pra próxima leva. |
| **Navios Materiais vs. Orgânicos** (`03_02_00_navios.md`) | O RPG já distingue essas duas categorias de navio (aço/madeira vs. criatura colossal domesticada) — vira regra de design real (não só flavor) pro elenco de Navios (§ 7). |
| **Bestiário de Arcádia** (`book/creatures.json`, fora deste repositório) | Fonte direta de 12 Criaturas reais do card game (§ 8.1) — nomes, lore e nível de poder do RPG, não inventados pro jogo. |

### A origem do jogo dentro de Arcádia

> **Decisão registrada 2026-08-07.**

ELTYCA nasceu de tédio de convés. Ninguém sabe dizer ao certo onde — cada porto de Arcádia jura que foi o dele — mas a lenda mais contada é a mesma em toda taverna: numa travessia longa demais, uma tripulação entediada começou a apostar pedaços de carga e lascas de Eltys que sobravam do porão, riscando padrões de setas em tábua de madeira só pra ter alguma coisa em jogo. O jogo pegou. Ficou rústico, de mão em mão, de navio em navio, até alguém em terra perceber que dava pra vender aquilo — e o que era distração de marinheiro virou o maior sucesso comercial de jogo de Arcádia inteira.

**Hoje é o pôquer de Arcádia.** Criança joga na rua, no beco, na escada do porto — por diversão, por coleção, sem nada em jogo além de orgulho e a esperança de puxar uma Lendária. Adulto joga em taverna, e aí a coisa muda de figura: aposta dinheiro, favor, informação, o que estiver na mesa. É o mesmo baralho, as mesmas regras — só o que está em risco que muda com quem senta pra jogar.

Isso também explica por que a ficha de domínio se chama **Eltys**: a lenda diz que o jogo original usava lascas reais do minério como marcador, porque era o que sobrava fácil num navio de carga. O nome ficou depois que Eltys de verdade virou caro demais pra desperdiçar em jogo — hoje são fichas pintadas, mas ninguém trocou o nome.

**O que as cartas representam, dentro dessa ficção:** perigo real que marinheiro enfrenta no Mar de Nuvens — bicho (Criatura), coisa construída e animada por magia (Construto), boato de taverna que ninguém confirma (Mito), ou capricho natural/arcano do próprio mar (Fenômeno) — ver § 5.5. O objetivo, dentro da ficção, é o mesmo do jogo de verdade: sair com mais Eltys que o adversário, num mar cheio de perigo.

**O que isso confirma/resolve:**
- **Colecionador é canônico**, não só flavor de marketing — é o motor da economia in-world, e bate direto com Tier SS já valer "máximo 1 por deck" (§ 5.12): puxar uma Lendária é sonho de colecionador de verdade.
- **A régua de "quem vira carta"** fica clara: perigo real, reconhecível ou temido por quem navega — nunca gente comum do dia a dia. É por isso que NPC saiu da tipagem (§ 5.5).
- **Porto** (modo recomendado) e **Rota** (construído) ganham motivação social — Porto é o casual de rua/taverna que qualquer um senta pra jogar; Rota é pra quem já investiu, já colecionou, já tem baralho montado.

### O framing do "garoto do porto" (conceito, não travado)

> **Decisão registrada 2026-08-06:** a ideia adotada — não confirmada em detalhe — é apresentar/vender o jogo pela perspectiva de **uma criança de porto**: alguém que vê navios voadores passando, joga ELTYCA em becos, tavernas e portos ao lado de uma embarcação de verdade. Não é uma criança "no quarto" — é rua, contrabando, o Mar de Nuvens acontecendo ao redor. Essa criança joga a versão sem aposta — o adulto na taverna ao lado é quem joga valendo alguma coisa (ver acima).

**Se afeta UI ou só arte/marketing — resolvido 2026-08-07:** framing forte fica **só no Modo Aventura** (§ 10), onde o protagonista É essa criança. Menu principal, partida Porto/Rota solta, vs. Bot, vs. Jogador — tudo isso fica com UI funcional e neutra (tabuleiro, mão, retrato do Capitão, sem cena em volta). Fora do Modo Aventura, o framing aparece só em arte/marketing (capa, trailer, ilustração de carta), não na estrutura de tela.

Dentro do Modo Aventura, o framing forte não fica preso ao ponto de vista fixo da criança — a **tela de partida em si** (não só a navegação do mapa) é ambientada onde aquele Desafio específico acontece: mesa de taverna, convés de navio, canto de beco, dependendo do nó/região. Varia com o contexto, não é uma câmera fixa nos olhos de um personagem só.

---

## 5. Regras do jogo

Conjunto completo das regras mecânicas — a parte deste documento que se pareceria com um livro de regras, se fosse extraído hoje.

### 5.1 Vocabulário

- **Dominar** — passar uma carta para o seu controle. Acontece por Abordagem ou por Confronto.
- **Conexão** — cadeia de cartas suas ligadas por setas mútuas. *(Renomeada 2026-08-07, era "Rota" — colidia com o nome do modo de jogo Rota, § 5.7.)*
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
| Deck | 12 cartas comuns por jogador, escolhidas do baralho compartilhado de 33 (§ 8) |

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
- **Nunca faz parte de uma Conexão.**
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
- **Tipo** — Criatura, Construto, Mito ou Fenômeno (§ 4 explica o porquê desses 4).

> **Cartas comuns não têm campo de Efeito por enquanto** *(2026-08-07)*. Só o Capitão carrega texto de regra (§ 5.3, § 6) — ver § 5.12 pro raciocínio completo e pro que fica pra trás se isso voltar depois.

> **Nem elemento nem tipo têm regra própria.** São etiquetas: só fazem alguma coisa quando o texto de uma carta diz que fazem. Custa zero imprimir e abre espaço de design pra sempre.

**Rotação:**

Por padrão, a carta é colocada **na orientação impressa, sem escolha** — 0° fixo.

**Exceção:** cartas de **Paradoxo**, sob o Capitão **Cryow**, mantêm rotação livre nas **quatro orientações** — 0°, 90°, 180° e 270° — na hora de colocar. Cada giro desloca o padrão de setas em duas posições (um lado vira o lado seguinte, um canto vira o canto seguinte).

> Rotação livre já foi regra universal, pra toda carta de todo jogador — virou um poder específico de Capitão (Pilar #3). "Três setas em L" é uma ferramenta diferente em cada casa do tabuleiro só quando é uma carta de Paradoxo em mesa com o Cryow.

**Tipo:** *(refeito 2026-08-07 — substitui Criatura/Embarcação/NPC. Motivo completo em § 4 "A origem do jogo dentro de Arcádia": carta só existe pra perigo real de marinheiro, e "NPC" genérico não passava nesse teste — nem "Embarcação", que confundia com a peça do Navio.)*

| Tipo | O que é | Papel |
|---|---|---|
| **Criatura** | Bicho do bestiário de Arcádia (§ 8.1) | O grosso do baralho, e o que rende arte |
| **Construto** | Coisa construída e animada por magia — golem, autômato, servo — nunca nasceu | Perigo mecânico, não biológico; lastro em "Forja do Golem de Lava" (`02_02_01_energia.md`) |
| **Mito** | Figura ou episódio de lenda contada de porto em porto — a carta nunca confirma se é verdade | Nunca afirma, só conta — voz de "conta-se que..."; onde cabem coisas como a lenda de Matriel/"How God Was Deceived" |
| **Fenômeno** | Capricho natural ou arcano do Mar de Nuvens — tempestade, corrente amaldiçoada, fenda no céu | Silhueta grande, muitas setas, Poder baixo — preenche o papel que Embarcação tinha |

Sem Embarcação como Tipo de carta, a palavra "Embarcação" fica livre — não precisa mais da distinção "*Embarcação* e não *Navio*" de antes.

### 5.6 A mão e as Cargas

**A mão base tem no máximo 5 cartas**, e as Cargas do seu Capitão ocupam espaço nela — mas só entram na mão **depois** do setup (§ 5.8), não fazem parte do lastro enterrado.

Capitão com Carga 3 (Navah, Navarro, Cycar) começa com **2 cartas comuns e 3 Cargas**. Capitão com Carga 1 (Katty) começa com 4 comuns e 1 Carga.

**Ao colocar uma carta comum:** compre até voltar a 5.

**Ao colocar uma Carga:** descarte **1 carta comum** da mão e compre até voltar a 5. A Carga saiu da mão e não volta, então aquele espaço fica livre pro resto da partida.

> **O descarte não pode ser uma Carga.** Sem essa trava, a linha ótima é jogar carga e descartar carga duas vezes seguidas, esvaziar o porão em dois turnos gastando só duas casas, e o arco da partida evapora.

O efeito disso é que você começa sufocado e termina com a mão aberta — e como o tabuleiro esvazia na direção contrária, o número de jogadas possíveis por turno fica quase constante do começo ao fim.

**A Carga em si:**

- **Neutra.** Não é de ninguém, não pontua pra ninguém, não entra em Conexão.
- Sem setas, não domina, **não pode ser dominada** — mas pode ser **destruída** por efeito específico de Capitão (Katty, § 6), o que é diferente de dominada: ninguém fica com ela, ela só sai do jogo.
- Serve pra fechar um ângulo aberto do seu Navio, cortar a Conexão do adversário, ou simplesmente destravar a sua mão.

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
| **Maior Conexão da partida** | **+3** |
| Cartas de Carga | 0 |

**A Conexão** é a maior cadeia de cartas comuns suas ligadas por **setas mútuas** — as duas cartas precisam apontar uma para a outra. Navios e Cargas nunca entram. *(Renomeada 2026-08-07, era "Rota" — colidia com o modo de jogo Rota, § 5.7.)*

Empate na maior Conexão: **ninguém leva os +3**. Empate na pontuação: **Deriva**.

> Os +3 são o contrapeso do jogo. Carta com muitas setas tem Poder baixo pelo orçamento de Tier e perde quase todo Confronto — mas é ela que costura Conexão longa.

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

**Tier é orçamento, não é sobre contagem de Setas.** Toda carta comum tem um total fixo pro seu Tier:

> **Setas + Poder + custo de Efeito = Tier**

| Tier | Total |
|---|---|
| D | 10 |
| C | 11 |
| B | 12 |
| A | 13 |
| S | 14 |
| SS | 15 |

**B (12) é o padrão** — qualquer combinação Setas/Poder já soma 12 (2+10, 3+9, 4+8, 5+7, 6+6, 7+5, 8+4). Tiers abaixo do padrão (D, C) são cartas deliberadamente mais fracas do que a contagem de Setas sugeriria; tiers acima (A, S, SS) são mais fortes. **Setas e Poder são potes independentes dentro do total** — Tier baixo não obriga muitas Setas: dá pra ser fraco com poucas Setas e Poder baixo também, contanto que a soma bata.

**SS (15) é, na prática, Lendária** — máximo 1 por deck no modo Rota (§ 5.7).

**Por que respeitar isso:** as cartas vão ser entregues uma por uma como loot de sessão (§ 10). Se carta nova for carta mais forte sem gastar Tier, quem jogou mais sessões ganha sem jogar. Com o orçamento, carta de Tier alto é rara de propósito, não um acidente de design.

> ### Efeito de carta — pausado por enquanto
>
> **Decisão registrada 2026-08-07: cartas comuns não carregam efeito nenhum.** `custo de Efeito` na fórmula acima é sempre **0** pra toda carta comum hoje — só o Capitão tem texto de regra (Pilar #1, § 5.3, § 6).
>
> **Como chegamos aqui:** as 14 cartas que tinham efeito (Trava/Modificador, todas "enquanto" — condição permanente presa a uma carta só) foram identificadas como redundantes com o que o Capitão já faz, só que em miniatura. Uma primeira tentativa de consertar isso — trocar pra efeitos de entrada ("Desembarque": um evento pontual, não uma condição permanente, pra separar de verdade Capitão-como-regra-do-jogo de carta-como-coisa-que-acontece) — chegou a ser desenhada e nomeada, mas a decisão final foi mais simples: tirar efeito de carta do jogo inteiramente, por ora. As 14 cartas voltaram a ser puro Setas/Poder, usando o orçamento inteiro sem gastar em Efeito (ver § 8 pros números atualizados).
>
> **Se isso voltar no futuro:** o conceito "Desembarque" (gatilho *ao entrar*, evento único, não condição permanente) fica registrado aqui como o caminho já pensado — evita duplicar o trabalho de decidir de novo qual tipo de efeito diferenciaria carta de Capitão. Outros gatilhos cogitados e nunca implementados: *ao ser dominada*, *ao vencer um Confronto*. Regras de escrita que valiam antes, pra reaproveitar se algum dia isso for retomado: um gatilho por carta; sinergia por elemento ou tipo; efeito que muda **quem se conecta com quem** é mais interessante e menos perigoso que efeito que muda Poder; nada que cancele o turno do adversário.

---

## 6. Capitães — elenco de lançamento (7)

Regra geral de design do passivo já em § 5.3 (sempre passiva, sempre só bônus, sempre ligada a um arquétipo nomeado). Esta seção é o elenco real.

> **Fechado 2026-08-06**, com Navarro e Cycar revisados em 2026-08-07 (troca de Tipo NPC pra Construto, ver "Decisões de balanceamento" abaixo).

| Capitão | Arquétipo | Passiva | Cargas |
|---|---|---|---|
| **Navah** | Buffer | Suas cartas de Criatura têm +2 de Poder. | 3 |
| **Navarro** | Buffer | Suas cartas de Construto têm +2 de Poder. | 3 |
| **Cycar** | Buffer | Suas cartas ganham +1 de Poder em Confronto contra cartas do Tipo Criatura ou Construto. | 3 |
| **Katty** | Controlador | Suas cartas do elemento Anomalia destroem Cargas adjacentes — ganha 1 ponto por Carga destruída. | 1 |
| **Violet** | Controlador | Suas cartas podem ser colocadas sobre uma carta **sua** já dominada, ou sobre uma Carga, em vez de só em casa vazia. | 2 |
| **Golar** | Movimento | No final do turno, suas cartas adjacentes (vertical/horizontal) ao Navio são empurradas 1 casa **radialmente, pra longe do Navio**, se houver espaço. | 2 |
| **Cryow** | Movimento | Suas cartas do elemento Paradoxo podem ser rotacionadas na hora de colocar (§ 5.5). | 2 |

**No banco** (nomes válidos, não usados no lançamento — podem voltar em expansão): Annya, Favacha, Loren, Oswald.

**Por que os arquétipos existem:** três categorias — Buffer (mexe em Poder por Tipo/situação), Controlador (nega ou reconfigura uma regra padrão a seu favor), Movimento (quebra a regra de "carta fica onde foi colocada", § 5.5/5.9) — cada Capitão é uma instância clara de um deles, nunca uma frase de efeito solta.

**Decisões de balanceamento já feitas:**
- **Navarro/Cycar — de NPC pra Construto.** *(2026-08-07)* Os dois liam Tipo NPC, cortado na Fase 1 da tipagem (§ 5.5). Passaram por uma versão intermediária (Navarro→Mito, Cycar→Fenômeno com bônus por espaço vazio) antes de fechar na versão final acima — Navarro buffa Construto direto, Cycar troca o bônus por espaço vazio por **+1 de Poder em Confronto contra Criatura ou Construto especificamente**, um bônus fixo (não escala mais com o tabuleiro, então não precisa mais de teto).
- **Katty** — calculada **uma vez, no momento da colocação**: a Carga só é destruída se já estiver adjacente na hora da jogada, não depois.
- **Violet** — só cartas **suas** já dominadas, nunca do adversário. Continua sendo utilidade/reciclagem, não uma forma de ignorar Abordagem/Confronto.
- **Golar** — empurrão é **radial, pra longe do Navio**, e é **reposicionamento mudo** — não re-dispara Abordagem/Confronto contra os vizinhos novos. Só importa pro cálculo final de Conexão (§ 5.10) e pras jogadas futuras. Sem isso, Golar ganharia uma rodada extra de combate de graça todo turno — forte demais, e complica a ordem de resolução se mais de uma carta empurrar ao mesmo tempo.
- **Cryow** — rotacionar acontece **no momento de colocar a carta**, parte da ação normal de "colocar uma carta" — não é uma ação ativa separada, e por isso nem levanta a questão de "re-disparo": as setas resolvem uma vez, na hora de colocar, exatamente como qualquer carta.
- **Katty pontua mesmo, de propósito.** Cada Carga destruída rende **+1 ponto**, uma exceção deliberada ao § 5.10 (Carga normalmente vale 0). Fica como o item de maior risco de balanceamento do elenco pra observar em playtest (§ 13): o setup sozinho já bota 4 Cargas no tabuleiro antes do turno 1 (2 por jogador, lastro fixo), o que dá a Katty uma fonte de pontos incondicional — não depende de vencer Confronto nenhum — disponível cedo. Se isso se provar forte demais em jogo real, um teto no número de Cargas destruídas por partida é o conserto mais direto.

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

> **Fechado 2026-08-07.** Usa o orçamento de Tier de § 5.12. 37 cartas, organizadas por Tipo (§ 5.5: Criatura, Construto, Mito, Fenômeno) — reestruturado nesta sessão depois do refactor de tipagem; a organização antiga (por origem: baralho original / bestiário do RPG / criações Arcádia) não fazia mais sentido como divisão principal, mas a proveniência de cada carta ficou anotada onde importa.

### 8.1 Criatura (19)

O bestiário de verdade — bicho, nada mais. 12 vêm direto do RPG (`book/creatures.json`, repositório irmão), 7 são originais ancoradas nas regiões de Arcádia (§ 4).

| Tier | Nome | Elemento | Setas | Índices | Poder | Origem |
|---|---|---|---|---|---|---|
| SS | Sugovat | Cognitivo | 2 | `[3,7]` | 13 | RPG — rouba trauma/memória |
| SS | Nauak | Paradoxo | 8 | `[0,1,2,3,4,5,6,7]` | 7 | RPG — nasceu de magia paradoxal |
| A | Tuntruga | Anomalia | 4 | `[7,0,1,2]` | 9 | RPG |
| A | Vinhavora | Anomalia | 5 | `[0,1,2,4,6]` | 8 | RPG |
| A | Dragão das Planícies | Energia | 4 | `[0,1,4,5]` | 9 | RPG |
| A | Las Praga | Energia | 6 | `[0,1,2,3,5,7]` | 7 | RPG |
| A | Las Grande | Energia | 3 | `[0,3,6]` | 10 | RPG |
| A | Devorador de Auroras | Astral | 5 | `[0,1,3,5,6]` | 8 | Original — predador raro do Norte, come luz arcana do céu |
| A | Leviatã de Rubra | Paradoxo | 3 | `[2,4,7]` | 10 | Original — ser colossal das dunas profundas de Rubra |
| B | Hondra | Astral | 4 | `[1,3,5,7]` | 8 | RPG |
| B | Ceifeira das Copas | Anomalia | 5 | `[0,1,3,5,6]` | 7 | Original — caça do topo das árvores de Galahad, camuflada |
| B | Medusa das Correntes | Cognitivo | 6 | `[1,2,3,4,5,7]` | 6 | Original — água-viva do céu, ferroada alucinógena |
| C | Pedroso | Astral | 4 | `[0,2,3,6]` | 7 | RPG |
| C | Anomora | Anomalia | 7 | `[0,1,2,3,4,5,7]` | 4 | RPG |
| C | Escorpião de Rubra | Energia | 6 | `[0,1,2,4,5,6]` | 5 | Original — deserto de Rubra |
| D | Goblin Saqueador | Paradoxo | 6 | `[0,1,2,3,4,6]` | 4 | RPG |
| D | Goblin Explorador | Cognitivo | 6 | `[0,1,2,4,5,7]` | 4 | RPG |
| D | Ratazana-de-Casco | Anomalia | 7 | `[0,1,2,3,4,5,6]` | 3 | Original — praga de casco abandonado no Mar de Nuvens |
| D | Gaivota-Chorona de Union | Cognitivo | 8 | `[0,1,2,3,4,5,6,7]` | 2 | Original — ave carniceira dos portos de Union |

`book/creatures.json` tem exatamente as 12 usadas — nenhuma sobrando (conferido nesta sessão). A única coisa a mais era uma variante interna do Pedroso ("Pedroso Menor"), descartada por decisão do usuário.

### 8.2 Mito (6)

Figura ou episódio de lenda contada de porto em porto — a carta nunca confirma se é verdade (§ 4, § 5.5).

| Tier | Nome | Elemento | Setas | Índices | Poder | De onde vem |
|---|---|---|---|---|---|---|
| S | Figura de Energia | Energia | 2 | `[1,5]` | 12 | Consumido pelo próprio elemento (§ 5.12, "Leis" de cada elemento no RPG) |
| S | Figura de Anomalia | Anomalia | 3 | `[2,5,7]` | 11 | idem |
| S | Figura de Paradoxo | Paradoxo | 4 | `[1,2,5,6]` | 10 | idem |
| S | Figura de Cognitivo | Cognitivo | 5 | `[1,3,4,6,7]` | 9 | idem |
| S | Figura de Astral | Astral | 6 | `[1,2,3,5,6,7]` | 8 | idem |
| B | Capuz Dourado | Astral | 6 | `[0,1,2,3,4,5]` | 6 | A garota da trilha de Galahad, capuz abençoado por um deus (`content/tall_tails/golden_hood.md`) |

Nenhuma tem efeito de texto (§ 5.12) — mesmo as Figuras, que antes tinham "imune ao próprio elemento" como Trava.

### 8.3 Construto (6)

Coisa construída e animada por magia — nunca nasceu (§ 4, § 5.5).

| Tier | Nome | Elemento | Setas | Índices | Poder | De onde vem |
|---|---|---|---|---|---|---|
| SS | O Titã de Eltys | Energia | 3 | `[1,4,6]` | 12 | Autômato ancestral feito de Eltys puro, de antes das nações atuais, reativa de vez em quando |
| B | Arauto de Ferro | Energia | 4 | `[0,2,5,7]` | 8 | Besta de guerra criada pelos Imperiais de Camelot |
| B | Marionete do Contrabandista | Energia | 7 | `[0,1,2,3,4,5,6]` | 5 | Boneco de convés que Union constrói pra enganar patrulha à distância |
| B | Golem de Duto | Anomalia | 7 | `[1,2,3,4,5,6,7]` | 5 | Golem de escavação de Britannia, às vezes foge de controle |
| B | Colosso de Engrenagens | Paradoxo | 7 | `[0,1,3,4,5,6,7]` | 5 | Máquina de guerra de Rubra — engenharia pura, sem depender de arcano |
| C | Sussurro do Duto | Energia | 6 | `[0,2,3,4,6,7]` | 5 | Autômato de manutenção dos anões de Britannia, avisa desabamento nos túneis |

### 8.4 Fenômeno (6)

Capricho natural ou arcano do Mar de Nuvens — preenche o papel que Embarcação tinha (silhueta grande, muitas setas, Poder baixo).

| Tier | Nome | Elemento | Setas | Índices | Poder | De onde vem |
|---|---|---|---|---|---|---|
| SS | A Respiração do Abismo | Astral | 4 | `[2,3,5,7]` | 11 | O abismo sem fundo sob Arcádia exala névoa prateada até o Mar de Nuvens — raro, mas catalogado |
| A | Falha Arcana de Camelot | Energia | 4 | `[0,3,5,6]` | 9 | Descarga quando a magia institucionalizada de Camelot sobrecarrega |
| B | Nevoeiro Devorador | Anomalia | 8 | `[0,1,2,3,4,5,6,7]` | 4 | Névoa do Mar de Nuvens que engole embarcação inteira, dizem |
| B | Corrente Amaldiçoada | Paradoxo | 8 | `[0,1,2,3,4,5,6,7]` | 4 | Corrente que sempre arrasta destroço atrás de si, contra o vento |
| B | Miragem de Porto | Cognitivo | 4 | `[0,2,4,6]` | 8 | Porto fantasma que marinheiro às vezes vê, atraindo navio pra rocha que não existe em mapa nenhum |
| C | Nevasca Viva | Paradoxo | 5 | `[1,2,4,5,7]` | 6 | O próprio branco-total do Norte de Galahad, com forma |

**Notas gerais do § 8:**
- **Nenhuma carta tem efeito de texto** (§ 5.12) — só o Capitão carrega regra.
- **Total de Lendárias (SS): 4** — Sugovat, Nauak (Criatura), O Titã de Eltys (Construto), A Respiração do Abismo (Fenômeno). Todas valem "máximo 1 por deck" (§ 5.7).
- **Distribuição por Tipo:** Criatura 19, Mito 6, Construto 6, Fenômeno 6 — Criatura ainda é o grosso do baralho de propósito (§ 5.5), os outros três parelhos entre si.
- **Distribuição de Elemento:** Energia 10, Anomalia 8, Paradoxo 7, Cognitivo 6, Astral 6 — Energia ficou puxando mais que o resto dessa vez (efeito colateral de virar o elemento padrão pra Construto). Não é grave, mas próxima leva pode mirar Cognitivo/Astral se quiser equilibrar.
- `packages/engine/src/content/cards.json` do protótipo não reflete nada disso — este GDD é a fonte de verdade.

---

## 9. Modos de jogo e escopo de jogadores (v1)

> **Decisão registrada 2026-08-06:** o v1 comercial (Unity) mira **1×1 apenas — contra bot e contra outro jogador (online e/ou local).** § 5.11 já existe como visão de longo prazo, não escopo de lançamento.

Isso também casa com o estado técnico real do protótipo: `PlayerId = 'P1' | 'P2'` está hardcoded em todo o motor (`packages/engine`), e escalar pra 3+ jogadores é um refator real, não um parâmetro — não foi começado. Ver `CLAUDE.md` § Non-negotiable invariants.

> **Ordem de construção** *(2026-08-07)*: **bot primeiro, jogador depois, Modo Aventura por último.** Bot e multiplayer já foram validados no protótipo web — é a base mais rápida de recriar em Unity. Aventura (§ 10) é sistema inteiramente novo (mapa, nós, loja, troca) e fica pra depois dos dois modos de partida solta estarem redondos.

> **Offline-first, exceto onde é impossível — decisão registrada 2026-08-07.** Ninguém fica bloqueado de jogar só porque não tem internet. **Modo Aventura, vs. Bot e hot-seat local não precisam de rede nenhuma.** Só **vs. Jogador (online)** exige conexão — porque conectar duas pessoas remotas é a única coisa aqui que é, por natureza, impossível sem rede.

| Modo | Descrição | Precisa de rede? | Escopo v1 |
|---|---|---|---|
| **Porto** (draft na hora) | Modo recomendado — ninguém chega com deck resolvido, coleções desiguais jogam parelho. | Não (regra do modo, independe de contra quem você joga) | Dentro do escopo v1. |
| **Rota** (deck construído) | Pra quem já manja — 12 comuns + 1 Lendária, montado em casa. | Não | Dentro do escopo v1. |
| **vs. Bot** | Contra IA. | **Não** | Dentro do escopo v1, **primeiro a construir** — já existem bots/simulação no protótipo (`npm run simulate`, `npm run batch`). |
| **vs. Jogador (local/hot-seat)** | Dois jogadores no mesmo aparelho, revezando a vez. | **Não** | Dentro do escopo v1 — já existe no protótipo web (`/game`). |
| **vs. Jogador (online)** | Multiplayer real via código de sala. | **Sim** — único modo que exige | Dentro do escopo v1, **segundo a construir**. Já validado no protótipo web (PartyKit); servidor autoritativo (§ arquitetura de rede abaixo) precisa ser recriado em Unity, mas só pra essa linha da tabela — o resto do jogo não depende disso. |

**Arquitetura de rede (só pro modo online):** servidor autoritativo, não P2P — reaproveitando o backend já validado (PartyKit/Cloudflare Durable Object), com Unity como cliente fino que manda ação e recebe estado redigido via WebSocket. P2P puro é incompatível com o requisito de redação real de servidor (esconder mão/Navio de verdade, não só na UI — ver memória do projeto/`packages/server`), e reescrever o motor de regras em C# duplicaria trabalho já validado em TypeScript, o tipo de custo que um solo dev (§ 3) não deveria pagar duas vezes.
| **Modo Aventura** (roguelite) | Progressão/coleção — ver § 10. | **Fora do escopo v1**, mas é o próximo passo depois de bot+jogador (não backlog de "algum dia", como duplas/trios abaixo). |
| **3/4/6 jogadores, duplas/trios** | Escala descrita em § 5.11, "Fique de olho a partir de 3" quanto a balanceamento. | **Fora do escopo v1.** Backlog (§ 12). |

---

## 10. Progressão e coleção — Modo Aventura

> **Decisão registrada 2026-08-07.**

Progressão vem de um modo roguelite — **Modo Aventura**. O protagonista é o garoto/a garota de porto do § 4 (mesma pessoa, não dois conceitos separados): percorre ruas, portos e tavernas de Arcádia desafiando gente pra partida, sonhando em virar um navegador lendário algum dia. Backstory leve de propósito — não é campanha com ramificação narrativa grande, é só o contexto que costura as recompensas.

**100% offline** (§ 9) — todos os Desafios são contra NPC/bot, sem depender de rede nenhuma. Ninguém fica de fora do Modo Aventura por falta de internet.

**Estrutura:**

- **Mapa ramificado**, cruzando as regiões de Arcádia (Union, Britannia, Camelot, Galahad, Norte de Galahad, Rubra) — cada região puxa os bichos/Construtos/Fenômenos já ancorados nela (§ 8) pros adversários daquele trecho do mapa.
- **Trilha** — os ramais que você escolhe entre um nó e outro. Termo novo, escolhido pra não colidir com "Conexão" (mecânica, § 5.1) nem com o modo "Rota" (§ 5.7) — os três já disputavam a mesma palavra antes.
- **Nós de Trilha:**
  - **Desafio** — partida completa (Porto ou Rota) contra um NPC do lugar. Vencer avança na Trilha e dá recompensa. A tela da partida em si é ambientada onde o Desafio acontece — mesa de taverna, convés de navio, canto de beco — varia por nó/região (§ 4), não é uma câmera fixa no garoto/garota de porto.
  - **Loja** — gasta Eltys (moeda in-fiction, § 4) pra comprar uma carta específica.
  - **Troca** — troca uma carta sua por outra.
- **Recompensa ao vencer um Desafio:** escolhe entre carta nova (mini-draft, 2-3 opções), Troca, ou Eltys pra gastar numa Loja depois — mesmo padrão de roguelite de carta já validado (tipo Slay the Spire).
- **Perder é permadeath.** A run acaba, você recomeça do início do mapa. Mantido simples de propósito nesta fase — sem vidas, sem soft-loss. Pode evoluir depois se jogo real mostrar que é frustrante demais dado o tamanho de uma partida de ELTYCA (9 colocações cada).

**Por que isso importa antes de produzir conteúdo demais:** o orçamento de Tier (§ 5.12) já foi desenhado assumindo *algum* sistema de loot sequencial ("se carta nova for carta mais forte, quem jogou mais sessões ganha sem jogar") — isso agora está resolvido: carta de Tier alto é recompensa rara de Desafio vencido, não desbloqueio automático.

**Ainda em aberto:** partida solta (Porto/Rota contra bot ou jogador, fora do Modo Aventura) também rende loot, ou o Modo Aventura é a única fonte de progressão? Não decidido ainda.

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
3. **O Casco está na faixa certa?** Poder vai de 2 a 13 agora (§ 8) — 10 se contar só as não-Lendárias. Casco 5 é furado por boa parte do baralho; Casco 9 (Scarlet/Violet) só cai pra Tier SS.
4. **Os +3 da Conexão decidem sozinhos?** Se toda partida virar corrida por Conexão, cai pra +2.
5. **Abordagem é forte demais?** Com Cryow/Paradoxo em mesa, a carta de poucas setas fica melhor do que parece. Se decks de 2–3 setas dominarem, endureça a coluna de cima do orçamento.
6. **O elemento e o tipo estão pesando?** Só existem através do texto das cartas. Se o símbolo parecer decoração, mais cartas mencionando na próxima leva.
7. **Duração real.** 24 colocações num jogo de 2 (mão agora com máximo 5, não 7 — recontar). Se estourar 30 min, corte uma Carga antes de mexer no tabuleiro.
8. **Passiva sem ônus fica forte demais sem avisar?** Sem ônus escrito no texto do Capitão, é mais fácil um passivo passar do ponto sem que isso salte aos olhos de quem lê a carta — uma versão anterior do Cycar precisou de teto por esse motivo (§ 6); vale reler o elenco inteiro com esse viés.
9. **Katty muda o total de pontos da partida?** Cargas destruídas geram pontos que não existiam antes (§ 5.10 normalmente zera Carga) — e o setup sozinho já garante 4 Cargas no tabuleiro antes do turno 1. Testar se isso desequilibra o placar final; se sim, aplicar teto (mesma lógica do Cycar).
10. **Empurrão do Golar confunde a leitura de Conexão?** Reposicionamento silencioso pode deixar difícil acompanhar de cabeça qual é a "maior cadeia" no fim de jogo, mesmo sem re-disparar captura — vale testar com tabuleiro físico ou protótipo antes de assumir que é só cosmético.
11. **O orçamento de Tier (D-SS) entrega variedade real, ou os extremos quebram o jogo?** Sugovat (2 setas/13 Poder) e Nauak (8 setas/7 Poder) são os primeiros cards fora do padrão B(12) do baralho original — testar se saem cedo demais e decidem a partida sozinhos antes de produzir mais S/SS.
12. **Baralho sem nenhum efeito de carta fica raso demais?** *(novo, 2026-08-07)* Toda a profundidade de build agora mora só no Capitão — testar se 9 turnos de puro Setas/Poder sem nenhuma leitura de texto de carta ainda segura a atenção, ou se falta alguma coisa. "Desembarque" (§ 5.12) é o caminho já desenhado se a resposta for sim.

---

## 14. Questões em aberto

| Questão | Status |
|---|---|
| Nome definitivo do jogo | ✅ Resolvido — ELTYCA |
| Nome da carta neutra | ✅ Resolvido — Carga |
| Moldura "Mundo das Tintas" como ficção oficial do card game | ✅ Resolvido — cortada |
| Quantos Capitães/Navios/Cartas no set base | 🟡 Parcial — 7 Capitães (§ 6), 7 Navios (§ 7) e 33 comuns + 4 Lendárias (§ 8) fechados; só a forma de desbloqueio de conteúdo novo segue em aberto |
| Modo campanha / como cartas entram na coleção | ✅ Resolvido — Modo Aventura, roguelite (§ 10). Só falta decidir se partida solta também rende loot. |
| Modelo de venda (premium / DLC / F2P) | ✅ Resolvido — pago único (§ 3) |
| Arquitetura de rede pro multiplayer em Unity | ✅ Resolvido — servidor autoritativo, reaproveitando PartyKit/Durable Object; só o modo online depende disso, resto do jogo é offline (§ 9) |
| Framing "garoto do porto" afeta UI ou só arte/marketing | ✅ Resolvido — forte só no Modo Aventura, resto fica neutro (§ 4, § 10) |
| Katty gera pontos destruindo Cargas — total de pontos da partida deixa de ser fixo | 🔴 Em aberto, mantido de propósito — ver § 6 e § 13; teto é o conserto se se provar forte demais |
| Ideias em avaliação (backlog completo) | 🔴 Nenhuma decidida ou descartada — ver § 12 |
| Testes de balanceamento (Carga, Navio/Casco, +3 da Conexão, Abordagem, elemento/tipo pesando, duração real, passiva sem ônus, leitura de Conexão com o empurrão do Golar, extremos do orçamento de Tier) | 🔴 Em aberto — ver § 13; ainda pendentes de playtesting sistemático |

---

## 15. Referências

- `regras_v0.9.md` — **removido 2026-08-06**, incorporado a este documento (§ 5 em diante). Versão original recuperável pelo histórico do git, se precisar.
- [ARCHITECTURE.md](ARCHITECTURE.md) — arquitetura técnica do protótipo web (não vinculante pro produto Unity).
- `content/books/` — livro de regras do RPG de mesa Arcádia (lore fonte). Especialmente relevantes pra ELTYCA: `01_01_00_introducao.md`, `02_02_00_elementos.md` (+ os 5 arquivos de elemento individual), `03_02_00_navios.md`, `03_03_00_constelacao_e_navegacao.md`, `04_03_00_regioes.md`, `04_06_00_bestiario.md`.
- `content/tall_tails/` — contos curtos ambientados em Arcádia, fonte potencial de flavor text pra cartas individuais (não explorado ainda neste GDD).
- `content/timeline.json` — linha do tempo histórica de Arcádia.
- `book/creatures.json` — bestiário completo do RPG Arcádia, repositório irmão fora de `arcadia_card_game`. Fonte de 12 das 19 Criaturas em § 8.1 — as 12 que existem no arquivo, nenhuma sobrando (conferido 2026-08-06). Levas futuras de Criatura precisam de fonte nova ou vão ser originais, como as outras 7 já são.
