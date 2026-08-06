# ELTYCA

### Regras v0.9 — compilado

*Jogo de cartas ambientado em Arcádia. Nome provisório.*

---

## Resumo em dez linhas

Dois jogadores colocam cartas numa grade 5×5. Cada carta tem um **Poder** e um punhado de **setas** na borda, e pode ser girada ao ser colocada. Se a sua seta aponta pra uma carta adversária que não aponta de volta, você a domina de graça; se ela aponta de volta, ganha quem tem mais Poder.

Antes de tudo isso, cada jogador tem um **Capitão** na frente de si — que nunca entra no tabuleiro, define quantas Cargas você carrega e traz o único texto de regra da sua mesa — e um **Navio**, colocado escondido no setup, que não ataca ninguém e que, enquanto estiver nas mãos do adversário, deixa o passivo do seu Capitão desligado.

No fim, ganha quem controla mais cartas, com um bônus pra maior rota.

---

## Vocabulário

- **Dominar** — passar uma carta para o seu controle. Acontece por Abordagem ou por Confronto.
- **Rota** — cadeia de cartas suas ligadas por setas mútuas.
- **Eltys** — a ficha que marca quem domina cada carta.
- **Abismo** — casa morta do tabuleiro.

---

## Componentes

| Item | Quantidade |
|---|---|
| Tabuleiro | Grade 5×5 (escala com o nº de jogadores) |
| Marcadores de Eltys | ~30 fichas por jogador, uma cor cada |
| Cartas de Carga | 7 por jogador (2 de lastro fixo de setup + até 5 da Carga do Capitão) |
| Capitão | 1 por jogador, escolhido antes da partida |
| Navio | 1 por jogador, escolhido antes da partida |
| Deck | 12 cartas comuns |

Domínio é marcado com **Eltys**, não virando a carta. Carta de um lado só, arte inteira, domínio legível do outro lado da mesa.

---

## O Capitão

**É o personagem.** Fica fora do tabuleiro, na frente do jogador, a partida inteira. Nunca é dominado, nunca corre risco, nunca sai de lá.

| Campo | O que faz |
|---|---|
| **Cargas** | Quantas Cargas você carrega. De 1 a 5. Define quantas cartas comuns cabem na sua mão. |
| **Passivo** | Uma regra em texto, sempre **passiva** (nunca uma ação que você escolhe ativar) e sempre **só bônus** — sem ônus. Ligada a um arquétipo (Buffer, Controlador, Vidente, etc.). |

O Capitão é a carta de arte cheia do jogo — retrato, nome próprio, o personagem daquele jogador. É a única peça que carrega texto de regra, justamente pra que exista **um passivo por jogador** e não quatro coisas rodando ao mesmo tempo na mesa.

> **Sem ônus no texto, o balanceamento vem de escopo e magnitude** — quão específico é o subconjunto de cartas/situações que a passiva afeta — e do valor de Cargas de cada Capitão, que já é, por si só, um trade-off estrutural do sistema (mais Cargas = menos cartas comuns na mão inicial).

Exemplos de arquétipo, pra trocar pelos personagens reais (elenco de lançamento completo em [GDD.md § Capitães e Navios](GDD.md)):

| Arquétipo | Passivo |
|---|---|
| **Buffer** | Suas cartas de Criatura têm +2 de Poder. |
| **Controlador** | Suas cartas adjacentes ao seu Navio não podem ser dominadas por Abordagem. |
| **Movimento** | Suas cartas adjacentes ao Navio são empurradas 1 casa no fim do turno, se houver espaço. |

---

## O Navio

Colocado no tabuleiro, escondido, no setup. **É a peça que não briga.**

- **Não tem Poder. Não tem setas. Nunca domina ninguém e nunca propaga cadeia.**
- **Nunca faz parte de uma rota.**
- **Nunca é rotacionado.** Entra sempre em pé, e por isso a disposição dos escudos é característica dele, não escolha de turno.
- **Não tem texto.** Ele é objetivo posicional, não motor de regras.
- Tem **Escudos**: quais dos 8 ângulos ele guarda.
- Tem **Casco**: a força desses escudos. Um número, válido para todos.

### Ser abordado

| Ângulo | Resultado |
|---|---|
| **Sem escudo** | Domínio automático. |
| **Com escudo** | Compare o Poder do atacante com o **Casco**. Poder **maior** domina. Empate ou menos: nada acontece. |

### O Navio troca de mão livremente

Ele pode ser dominado **quantas vezes for preciso**, por qualquer jogador, inclusive **por Abordagem em turnos seguidos**. Vai pular de mão em mão, e isso é intencional: é o ponto quente do tabuleiro, e disputar aquelas oito casas vizinhas é uma das linhas de jogo.

- Enquanto o Navio estiver sob Eltys adversário, **o passivo do seu Capitão fica desligado**.
- Se você retomar, **religa** na hora.
- Na pontuação final, o Navio vale **+1**, como qualquer carta.

Quem toma o Navio ganha 1 ponto, tira 1 do dono, e cala a regra que fazia o deck dele funcionar. Como ele troca de mão várias vezes, o que importa não é ter tomado — é **estar com ele no fim**, e ter deixado o outro sem passivo enquanto durou.

### Onde pode ser colocado

**Fora da borda do tabuleiro.** Num 5×5, isso é o anel interno — 8 casas, já que o centro é o Abismo. No canto, três dos oito ângulos apontariam pro vazio e nunca poderiam ser atacados, com Casco 5 ou 50.

### Gabarito de Navio

> **Escudos + Casco = 11**

| Escudos | Ângulos abertos | Casco |
|---|---|---|
| 3 | 5 | 8 |
| 4 | 4 | 7 |
| 5 | 3 | 6 |
| 6 | 2 | 5 |

Poucos escudos mas grossos (difícil de furar, fácil de contornar) contra muitos escudos mas finos (não tem por onde entrar, mas qualquer carta grande entra).

---

## A carta comum

- **Poder** — número único, usado em todo Confronto.
- **Setas** — de 2 a 8, nas 8 posições da borda (4 lados, 4 cantos).
- **Elemento** — Energia, Anomalia, Paradoxo, Cognitivo ou Astral. Um só.
- **Tipo** — Criatura, Embarcação ou NPC.
- **Efeito** — opcional, texto curto.

> **Nem elemento nem tipo têm regra própria.** São etiquetas: só fazem alguma coisa quando o texto de uma carta diz que fazem. Custa zero imprimir e abre espaço de design pra sempre.

### Rotação

Por padrão, a carta é colocada **na orientação impressa, sem escolha** — 0° fixo.

**Exceção:** cartas de **Paradoxo**, sob o Capitão **Cryow**, mantêm rotação livre nas **quatro orientações** — 0°, 90°, 180° e 270° — na hora de colocar. Cada giro desloca o padrão de setas em duas posições (um lado vira o lado seguinte, um canto vira o canto seguinte).

> Rotação livre já foi regra universal, pra toda carta de todo jogador. Virou um poder específico de Capitão — ver `GDD.md § Capitães e Navios`. "Três setas em L" volta a ser uma ferramenta diferente em cada casa do tabuleiro só quando é uma carta de Paradoxo em mesa com o Cryow.

| Tipo | O que é | Papel |
|---|---|---|
| **Criatura** | O bestiário do Mar de Nuvens | O grosso do baralho, e o que rende arte |
| **Embarcação** | Barcos pequenos, escunas de contrabando, naufrágios | Silhueta larga, muitas setas, Poder baixo |
| **NPC** | Gente de porto: contramestres, cartógrafos, Imperiais | Onde moram os efeitos estranhos |

*Embarcação* e não *Navio*, pra não confundir com a peça do jogador.

---

## A mão e as Cargas

**A mão base tem no máximo 5 cartas**, e as Cargas do seu Capitão ocupam espaço nela — mas só entram na mão **depois** do setup (ver § Preparação), não fazem parte do lastro enterrado.

Capitão com Carga 3 (Navah, Navarro, Cycar) começa com **2 cartas comuns e 3 Cargas**. Capitão com Carga 1 (Katty) começa com 4 comuns e 1 Carga.

**Ao colocar uma carta comum:** compre até voltar a 5.

**Ao colocar uma Carga:** descarte **1 carta comum** da mão e compre até voltar a 5. A Carga saiu da mão e não volta, então aquele espaço fica livre pro resto da partida.

> **O descarte não pode ser uma Carga.** Sem essa trava, a linha ótima é jogar carga e descartar carga duas vezes seguidas, esvaziar o porão em dois turnos gastando só duas casas, e o arco da partida evapora.

O efeito disso é que você começa sufocado e termina com a mão aberta — e como o tabuleiro esvazia na direção contrária, o número de jogadas possíveis por turno fica quase constante do começo ao fim.

### A Carga em si

- **Neutra.** Não é de ninguém, não pontua pra ninguém, não entra em rota.
- Sem setas, não domina, **não pode ser dominada** — mas pode ser **destruída** por efeito específico de Capitão (ver Katty em [GDD.md § Capitães e Navios](GDD.md)), o que é diferente de dominada: ninguém fica com ela, ela só sai do jogo.
- Serve pra fechar um ângulo aberto do seu Navio, cortar a rota do adversário, ou simplesmente destravar a sua mão.

---

## Os dois modos

**PORTO — o indicado.** Draft na hora. Ninguém chega com o deck resolvido de casa, e coleções desiguais jogam parelho.

**ROTA — pra quem já manja.** Deck construído em casa: 12 cartas comuns, máximo 2 cópias de cada e 1 Lendária.

### O draft do Porto

Três rodadas. Em cada uma, um jogador abre **4 cartas por jogador na mesa** (8 num jogo de 2, 16 num de 4) e todos compram uma por vez até acabar.

- Quem abriu compra **por último**.
- O papel de abrir gira a cada rodada.
- Ao fim, cada um tem **12 cartas comuns**.

As cartas saem do **Baralho do Porto** (pilha comum) ou, em campanha, da coleção do próprio jogador.

> Escolha Capitão e Navio **antes** do draft. O passivo do Capitão é o que diz o que vale a pena comprar.

---

## Preparação

1. Monte a grade e marque os **Abismos**. Casa morta.
2. Cada jogador escolhe **Capitão** e **Navio** e revela os dois.
3. **Setup escondido:** cada jogador enterra **1 Navio + 2 Cargas de um lastro neutro**, virados para baixo, na ordem que quiser. Esse lastro é sempre o mesmo pra todo mundo — **não sai da Carga do Capitão**, é fixo independente de quem você escolheu. O Navio não pode ir na borda e entra em pé.
4. **Revela tudo de uma vez.**
5. **Só agora monte a mão:** pegue as Cargas do seu Capitão + compre cartas comuns do baralho, até ter no máximo **5 cartas no total**.

> O setup não é mais sobre blefe de identidade de carta (o lastro é sempre Carga, sem força nenhuma) — o que ele ainda esconde é **posição**: até a revelação, ninguém sabe em qual das 8 casas do anel o Navio adversário está, o que mantém o primeiro ataque de cada jogador como aposta, não cálculo. Ver `GDD.md § Modo de jogo` para o raciocínio completo.

---

## O turno

**1. Coloque uma carta** da mão em qualquer casa vazia, na orientação que quiser.

**2. Resolva cada seta** que aponte para uma carta adversária adjacente:

- **Abordagem** — a carta alvo **não** tem seta apontando de volta. Domínio automático.
- **Confronto** — a carta alvo **tem** seta apontando de volta. Compare os Poderes. Maior vence. **Empate: o defensor mantém.**

Contra **Navio**: ângulo aberto domina; ângulo com escudo exige Poder maior que o Casco.
Contra **Carga**: nada acontece.

**3. Cadeia.** Toda carta dominada **por Confronto** propaga: as cartas adversárias para as quais ela aponta e que não apontam de volta são dominadas também. Abordagem não propaga. Navio não propaga. Cada carta só pode ser dominada uma vez por turno.

**4. Reponha a mão** conforme as regras de Carga acima.

---

## Fim e pontuação

Acaba quando todas as casas livres estão ocupadas. **Vence quem fizer mais pontos.**

| Fonte | Pontos |
|---|---|
| Cada carta comum sob o seu Eltys | +1 |
| Cada Navio sob o seu Eltys (o seu ou o tomado) | +1 |
| **Maior rota da partida** | **+3** |
| Cartas de Carga | 0 |

**A rota** é a maior cadeia de cartas comuns suas ligadas por **setas mútuas** — as duas cartas precisam apontar uma para a outra. Navios e Cargas nunca entram.

Empate na maior rota: **ninguém leva os +3**. Empate na pontuação: **Deriva**.

> Os +3 são o contrapeso do jogo. Carta com muitas setas tem Poder baixo pelo gabarito e perde quase todo Confronto — mas é ela que costura rota longa.

---

## Escala por número de jogadores

Todos contra todos.

| Jogadores | Grade | Abismos | Colocações por jogador | Deck |
|---|---|---|---|---|
| 2 | 5×5 | 1 (centro) | 9 | 12 |
| 3 | 6×6 | — | 9 | 12 |
| 4 | 7×7 | 1 (centro) | 9 | 12 |
| 6 | 8×8 | 4 (miolo 2×2) | 7 | 12 |

As casas livres depois do setup dividem exato pelo número de jogadores.

> **Fique de olho a partir de 3.** Todos contra todos em jogo de domínio tende a virar "todo mundo bate em quem está na frente". A correção mais barata é duplas e trios com pontuação somada.

---

## Gabarito de criação de carta

> Ferramenta **sua**, na hora de criar carta. Não vai pra mesa.

| Setas | Poder | Com Modificador | Com Trava |
|---|---|---|---|
| 2 | 10 | 8 | 6 |
| 3 | 9 | 7 | 5 |
| 4 | 8 | 6 | 4 |
| 5 | 7 | 5 | 3 |
| 6 | 6 | 4 | 2 |
| 7 | 5 | 3 | 1 |
| 8 | 4 | 2 | — |

**Modificador** mexe no número da comparação (*cartas de Anomalia têm −2 contra esta carta*) e custa 2.
**Trava** nega a interação inteira (*cartas de Energia não podem dominar esta carta*) e custa 4, porque é absoluta e o único contra-jogo é ter sacado outro elemento.

**Lendária (SS):** +2 de Poder, máximo 1 por deck no modo Rota.

**Por que respeitar isso:** as cartas vão ser entregues uma por uma como loot de sessão. Se carta nova for carta mais forte, quem jogou mais sessões ganha sem jogar. Com o gabarito, carta nova é ferramenta nova.

**Escrita de efeito:**

- Um gatilho por carta: *ao entrar*, *ao ser dominada*, *ao vencer um Confronto*, *enquanto*.
- Sinergia por **elemento** ou por **tipo**. É o que dá sentido aos símbolos.
- Efeito que muda **quem se conecta com quem** é mais interessante e menos perigoso que efeito que muda Poder.
- Nada que cancele o turno do adversário.

---

## Direção de arte

**Carta quadrada, sem moldura circular.** A maioria das cartas hoje é colocada em orientação fixa (ver § Rotação) — mas cartas de Paradoxo sob o Capitão Cryow continuam girando livremente, então pra essa fatia do baralho arte e texto ainda vão aparecer de lado ou de cabeça pra baixo com frequência. É aceito: dá pra ler e dá pra reconhecer de qualquer ângulo.

As três consequências práticas abaixo continuam valendo pro baralho inteiro, não só pras cartas que giram — não custam nada e mantêm a arte consistente caso mais poderes de rotação apareçam depois:

- **O Poder no centro**, ou repetido em cantos opostos, pra ser lido em qualquer orientação.
- **Texto de efeito curto.** Uma linha. Frase longa de cabeça pra baixo é onde o ritmo morre.
- **As setas na borda são a informação mais importante da carta** — precisam ter contraste alto contra a arte, porque é nelas que o olho bate primeiro.

**O elemento é a paleta.** Cinco elementos, cinco esquemas de cor, reconhecíveis do outro lado da mesa antes de ler qualquer número.

**O Capitão é a carta grande.** Fora do tabuleiro, orientação fixa, arte cheia, nome próprio. É onde mora a personalidade do jogador e onde vale gastar o melhor da ilustração.

**O Navio precisa de moldura própria.** Formato, tamanho ou borda diferente das comuns — ele é a peça mais disputada do tabuleiro e não pode se perder no meio das criaturas.

**Proposta narrativa, a decidir:** as cartas são impressões colhidas do **Mundo das Tintas** — o retrato emocional daquilo que foi retratado. Justifica o estilo em tinta, justifica a cor carregar o elemento, e faz criatura, barco e pessoa caberem na mesma moldura.

---

## Ideias em avaliação

Registro do que foi discutido e não entrou, pra não se perder.

**Remover o Navio do tabuleiro.** *Avaliado e descartado.* Capitão e Navio ficariam os dois de fora e o setup seria só Cargas escondidas. Ganharia simplicidade real, mas perderia o segundo objetivo da partida, o blefe do setup, e a única forma de interferir na build do adversário. O que motivou a ideia — o personagem ter pouca personalidade — foi resolvido movendo o texto de regra pro Capitão. Guardado caso um dia se queira uma versão leve.

**Navio com efeito compartilhado.** Cada jogador escolhe um navio cujo efeito vale para a mesa inteira. Descartado como base: mata a ideia de build e não escala pra 4 jogadores. Possível categoria de expansão.

**Navio como tapete de jogador.** Se o Navio voltasse a ficar fora, viraria um tapete com os lugares marcados: deck, mão, Eltys. Organiza a mesa e faz o produto parecer board game.

**Segundo número no Capitão.** Iniciativa, ou quantas cartas ele draftea. Caráter sem um segundo texto de regra rodando na mesa.

**Variante Sigilo.** O Navio fica virado pra baixo até alguém se conectar a ele, em vez de ser revelado no fim do setup. A dedução corre a partida inteira.

**Duplas e trios.** Para 4 e 6 jogadores, com pontuação somada, cada um mantendo seu Capitão e seu Navio.

---

## O que testar primeiro

1. **A Carga está boa demais ou ruim demais?** Se todo mundo despejar as cargas nos três primeiros turnos, o descongestionamento está barato. Se ninguém jogar nenhuma, o custo em casas está alto.
2. **O Navio vira o jogo inteiro?** Ele agora pula de mão em mão de propósito. Se as partidas viverem só em torno daquelas oito casas e o resto do tabuleiro ficar indiferente, o problema é o passivo do Capitão estar forte demais.
3. **O Casco está na faixa certa?** Poder das comuns vai de 4 a 10. Casco 5 é furado por metade do baralho; Casco 8 só cai pra carta grande, que tem poucas setas e é difícil de mirar.
4. **Os +3 da rota decidem sozinhos?** Se toda partida virar corrida por rota, cai pra +2.
5. **Abordagem é forte demais?** Com rotação livre, a carta de poucas setas fica melhor do que parece. Se decks de 2–3 setas dominarem, endureça a coluna de cima do gabarito.
6. **O elemento e o tipo estão pesando?** Só existem através do texto das cartas. Se o símbolo parecer decoração, mais cartas mencionando na próxima leva.
7. **Duração real.** 24 colocações num jogo de 2. Se estourar 30 min, corte uma Carga antes de mexer no tabuleiro.

---

## Em aberto

- Nome definitivo (*Constelações*, *Deriva*, *Rota*).
- Nome da carta neutra (*Carga*, *Lastro*, *Caixaria*).
- Quantos Capitães e Navios existem no set base, e como se ganha um novo.
- Se a moldura do Mundo das Tintas entra como ficção oficial.
- Modo campanha: como as cartas entram na coleção do jogador durante as sessões.
