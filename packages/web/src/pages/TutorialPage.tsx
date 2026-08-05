import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { sampleContent } from '@eltyca/engine';
import { CardMini } from '../components/card/CardMini';
import { CaptainBadge } from '../components/card/CaptainBadge';
import { ShipBadge } from '../components/card/ShipBadge';
import { SchemaCard } from '../components/tutorial/SchemaCard';
import { PLAYER_COLORS } from '../game/theme';

const YOU = PLAYER_COLORS.P1;
const ENEMY = PLAYER_COLORS.P2;

// Real content, reused so these examples never drift from what's actually in the game.
const anatomyCard = sampleContent.cards['c05']; // Colosso de Coral — 4 cardinal arrows, easy to read
const rotationCard = sampleContent.cards['c11']; // Colosso de Cracas — 6 arrows, asymmetric, shows the shift clearly
const sampleCaptain = sampleContent.captains['captain-1'];
const sampleShip = sampleContent.ships['ship-1'];

/** Small standalone diagram, not the real board component — the real .board sizes itself to
 *  its game-screen container via container-query units that don't apply here, and pulling in
 *  Board.tsx would drag along cell selection/drag-and-drop wiring this page has no use for. */
function MiniBoard() {
  const cells = Array.from({ length: 25 }, (_, i) => i);
  const chasmIdx = 12;
  return (
    <div className="tutorial-mini-board">
      {cells.map((i) => (
        <div key={i} className={`tutorial-mini-cell${i === chasmIdx ? ' chasm' : ''}`} />
      ))}
    </div>
  );
}

interface Step {
  eyebrow: string;
  title: string;
  body: ReactNode;
}

const STEPS: Step[] = [
  {
    eyebrow: 'Bem-vindo',
    title: 'O objetivo',
    body: (
      <>
        <p>ELTYCA é um jogo de cartas para dois jogadores num tabuleiro compartilhado. Não há mão escondida depois que a partida começa, nem dados — cada decisão é onde colocar uma carta e para que lado ela fica virada.</p>
        <p>Você e seu adversário se revezam colocando cartas até o tabuleiro encher. Quem terminar controlando mais cartas vence.</p>
        <p>Este guia cobre tudo que você precisa para sua primeira partida, uma ideia de cada vez. Use Próximo / Voltar para navegar.</p>
      </>
    ),
  },
  {
    eyebrow: 'O tabuleiro',
    title: 'Uma grade 5×5, menos uma casa morta',
    body: (
      <>
        <div className="tutorial-visual-row">
          <MiniBoard />
        </div>
        <p>O tabuleiro é uma grade 5×5 de 25 casas. A casa central é o <strong>Abismo</strong> — espaço morto, ninguém nunca coloca ali.</p>
        <p>Isso deixa 24 casas para 9 colocações por jogador, mais o Navio e a Carga inicial enterrados na preparação. A partida acaba assim que toda casa restante estiver ocupada.</p>
      </>
    ),
  },
  {
    eyebrow: 'Cartas',
    title: 'Anatomia de uma carta',
    body: (
      <>
        <div className="tutorial-visual-row">
          <CardMini card={anatomyCard} rotation={0} />
        </div>
        <ul className="tutorial-legend">
          <li>
            <strong>Poder</strong> — o número no círculo central. É a única coisa que importa quando duas cartas disputam a mesma casa.
          </li>
          <li>
            <strong>Setas</strong> — as marcas ao longo das bordas, de 2 a 8 delas. São a única coisa que permite a uma carta dominar outra.
          </li>
          <li>
            <strong>Elemento &amp; Tipo</strong> — a etiqueta colorida e o rótulo abaixo do nome. São só categorias: só fazem alguma coisa quando o texto de efeito da própria carta as menciona.
          </li>
        </ul>
      </>
    ),
  },
  {
    eyebrow: 'Cartas',
    title: 'Rotação',
    body: (
      <>
        <p>Antes de colocar uma carta, você escolhe uma de quatro orientações. Cada giro de 90° desloca todas as setas duas posições ao redor da borda — uma carta é um <em>padrão</em>, não uma direção fixa.</p>
        <div className="tutorial-visual-row">
          {([0, 1, 2, 3] as const).map((rot) => (
            <div key={rot} className="tutorial-rotation-item">
              <CardMini card={rotationCard} rotation={rot} />
              <span>{rot * 90}°</span>
            </div>
          ))}
        </div>
        <p>A mesma carta, quatro conjuntos de vizinhos completamente diferentes que ela pode ameaçar — ler o tabuleiro é tanto sobre para que lado girar uma carta quanto sobre qual carta jogar.</p>
      </>
    ),
  },
  {
    eyebrow: 'Colocando uma carta',
    title: 'Abordagem vs. Confronto',
    body: (
      <>
        <p>Quando você coloca uma carta, verifique toda carta adversária adjacente para a qual uma das suas setas aponta. Duas coisas podem acontecer:</p>
        <div className="tutorial-matchup">
          <div className="tutorial-matchup-pair">
            <SchemaCard power={7} directions={[2]} color={YOU} label="Sua carta" />
            <span className="tutorial-matchup-arrow">→</span>
            <SchemaCard power={9} directions={[0, 4]} color={ENEMY} label="Carta inimiga" />
          </div>
          <p>
            <strong>Abordagem</strong> — a carta inimiga não tem nada apontando de volta para você. Domínio automático. O Poder nunca é comparado.
          </p>
        </div>
        <div className="tutorial-matchup">
          <div className="tutorial-matchup-pair">
            <SchemaCard power={7} directions={[2]} color={YOU} label="Sua carta" />
            <span className="tutorial-matchup-arrow">⇄</span>
            <SchemaCard power={5} directions={[6, 0, 4]} color={ENEMY} label="Carta inimiga" />
          </div>
          <p>
            <strong>Confronto</strong> — a carta inimiga aponta de volta para você. Compare o Poder: o maior vence. Um empate deixa o defensor exatamente onde estava.
          </p>
        </div>
      </>
    ),
  },
  {
    eyebrow: 'Colocando uma carta',
    title: 'Cadeias',
    body: (
      <>
        <p>Um domínio que acontece por <strong>Confronto</strong> continua se espalhando: qualquer vizinho inimigo da carta recém-dominada que não aponte de volta para ela cai também — de graça, sem checar Poder.</p>
        <div className="tutorial-chain-grid">
          <div className="tutorial-chain-cell" style={{ gridColumn: 1, gridRow: 1 }}>
            <SchemaCard power={8} directions={[2]} color={YOU} label="A — você" />
          </div>
          <div className="tutorial-chain-cell" style={{ gridColumn: 2, gridRow: 1 }}>
            <SchemaCard power={6} directions={[6, 4]} color={ENEMY} label="B — inimiga" />
          </div>
          <div className="tutorial-chain-cell" style={{ gridColumn: 2, gridRow: 2 }}>
            <SchemaCard power={9} directions={[]} color={ENEMY} label="C — inimiga" />
          </div>
        </div>
        <ol className="tutorial-steps-list">
          <li>Você coloca A. Sua seta Leste alcança B.</li>
          <li>A seta Oeste de B aponta de volta para A — um Confronto. O Poder 8 de A vence o 6 de B, então B é dominada.</li>
          <li>Esse domínio aconteceu num Confronto, então ele propaga: a própria seta Sul de B alcança C, e C não tem nada apontando de volta para o Norte. C cai também — automaticamente, seu Poder 9 nunca é checado.</li>
          <li>Abordagem nunca inicia uma cadeia, e nenhuma carta pode ser dominada duas vezes no mesmo turno.</li>
        </ol>
      </>
    ),
  },
  {
    eyebrow: 'Suas peças',
    title: 'O Capitão',
    body: (
      <>
        <div className="tutorial-visual-row">
          <CaptainBadge captain={sampleCaptain} owner="P1" />
        </div>
        <p>Seu Capitão fica na sua frente a partida inteira. Ele nunca toca o tabuleiro, então nunca pode ser dominado e nunca corre risco.</p>
        <p>
          O número nele — <strong>Cargas</strong> — é quantas cartas de Carga ele leva para sua mão inicial, e portanto quantas cartas comuns a menos você começa com (sua mão é sempre 7 no total; mais sobre Carga em breve).
        </p>
        {sampleCaptain.passive && (
          <p className="tutorial-callout">
            <strong>Passivo:</strong> {sampleCaptain.passive.description}
          </p>
        )}
        <p>O passivo de cada Capitão é exatamente uma regra, e sempre tem duas pontas — um bônus e um ônus. É o único texto de regra do seu lado da mesa.</p>
      </>
    ),
  },
  {
    eyebrow: 'Suas peças',
    title: 'O Navio',
    body: (
      <>
        <div className="tutorial-visual-row">
          <ShipBadge ship={sampleShip} owner="P1" />
        </div>
        <p>As marcas ao redor da borda parecem setas, mas são <strong>Escudos</strong> — ângulos que o Navio defende. Ele nunca ataca, nunca domina e nunca entra numa Rota.</p>
        <p>
          Ataque um ângulo aberto (sem Escudo) e você domina o Navio automaticamente. Ataque um ângulo com Escudo e você precisa de Poder maior que o <strong>Casco</strong> dele ({sampleShip.hull} aqui) — empate ou menos, nada acontece.
        </p>
        <p>Ele é enterrado virado para baixo durante a preparação, só no anel de casas ao redor do Abismo central, e nunca rotaciona — sua disposição de Escudos é fixa.</p>
        <p>
          Ele pode trocar de mão repetidamente por Abordagem, a partida inteira — isso é intencional, as casas ao redor dele são o ponto mais disputado do tabuleiro. Enquanto um adversário estiver com seu Navio, <strong>o passivo do seu Capitão fica desligado</strong>; retome e ele religa na hora. Na
          pontuação final ele vale +1, como qualquer carta, não importa quem termine com ele.
        </p>
      </>
    ),
  },
  {
    eyebrow: 'Sua mão',
    title: 'Tamanho da mão e Carga',
    body: (
      <>
        <div className="tutorial-visual-row">
          <div className="tutorial-cargo-tile">Carga</div>
        </div>
        <p>Sua mão sempre tem exatamente 7 itens.</p>
        <ul className="tutorial-legend">
          <li>Coloque uma carta comum → compre até voltar a 7.</li>
          <li>Jogue uma Carga → descarte uma carta comum da sua mão (nunca outra Carga) → compre até voltar a 7. Esse espaço da mão some pelo resto da partida.</li>
        </ul>
        <p>Carga não é de ninguém: sem Poder, sem setas, não domina e não pode ser dominada, vale 0 pontos. Use uma para fechar um buraco nos Escudos do seu Navio, cortar a Rota de um adversário, ou simplesmente destravar uma mão emperrada.</p>
      </>
    ),
  },
  {
    eyebrow: 'Antes do primeiro turno',
    title: 'Preparação',
    body: (
      <>
        <p>Escolha um Capitão e um Navio primeiro — isso é público, você verá exatamente o que seu adversário escolheu. Depois façam juntos o draft do baralho de 12 cartas a partir de um conjunto compartilhado de cartas viradas para cima, revezando até o baralho de todo mundo estar completo.</p>
        <p>
          Em seguida, <strong>preparação escondida</strong>: enterre seu Navio e sua Carga inicial virados para baixo, na ordem que quiser, onde quiser — o Navio só dentro do anel de casas ao redor do Abismo. Quando os dois jogadores terminarem, tudo vira para cima de uma vez e as mãos completam de volta a 7.
        </p>
      </>
    ),
  },
  {
    eyebrow: 'Juntando tudo',
    title: 'Seu turno',
    body: (
      <ol className="tutorial-steps-list tutorial-steps-list-big">
        <li>
          <strong>Coloque</strong> uma carta da sua mão em qualquer casa vazia, na orientação que quiser.
        </li>
        <li>
          <strong>Resolva</strong> cada seta que aponte para uma carta adversária adjacente ou para o Navio — Abordagem ou Confronto.
        </li>
        <li>
          <strong>Cadeia</strong> — todo domínio feito por Confronto se espalha para os vizinhos desprotegidos daquela carta.
        </li>
        <li>
          <strong>Reponha</strong> sua mão de volta a 7, descartando uma carta comum primeiro se você jogou uma Carga.
        </li>
        <li>Passe a vez ao seu adversário. Repita até toda casa que não é Abismo estar ocupada.</li>
      </ol>
    ),
  },
  {
    eyebrow: 'O fim',
    title: 'Pontuação',
    body: (
      <>
        <p>A partida acaba no instante em que toda casa que não é Abismo está ocupada. Pontos:</p>
        <ul className="tutorial-legend">
          <li>
            <strong>+1</strong> por cada carta comum sob seu controle.
          </li>
          <li>
            <strong>+1</strong> pelo Navio, não importa quem termine com ele.
          </li>
          <li>
            <strong>+3</strong> para quem tiver a maior <strong>Rota</strong> — uma cadeia de cartas suas ligadas entre si por setas mútuas. Navios e Cargas nunca contam para uma Rota.
          </li>
        </ul>
        <p>Empate na maior Rota significa que ninguém leva os +3. Empate na pontuação total significa que a partida é uma <strong>Deriva</strong>.</p>
      </>
    ),
  },
  {
    eyebrow: 'Você está pronto',
    title: 'Jogue sua primeira partida',
    body: (
      <p>Isso é tudo que você precisa. O melhor jeito de fixar é jogando uma partida — você sempre pode voltar a este guia pelo menu principal.</p>
    ),
  },
];

/** Step-by-step guided walkthrough of the rules, reached from the landing page — the "learn
 *  before you play" path, as opposed to regras_v0.9.md (the authoritative design doc, not
 *  meant for a first-time player) or figuring it out live in a match. Reuses the same visual
 *  components the real game renders with (CardMini, CaptainBadge, ShipBadge) wherever a real
 *  card/Captain/Ship is being shown, and a schematic stand-in (SchemaCard) only where a rules
 *  example needs an arrow pattern no real card happens to have. */
export function TutorialPage() {
  const navigate = useNavigate();
  const [stepIdx, setStepIdx] = useState(0);
  const step = STEPS[stepIdx];
  const isFirst = stepIdx === 0;
  const isLast = stepIdx === STEPS.length - 1;

  return (
    <div className="start-screen tutorial-screen">
      <div className="tutorial-header">
        <span className="start-tagline">
          {step.eyebrow} · Passo {stepIdx + 1} de {STEPS.length}
        </span>
        <button type="button" onClick={() => void navigate('/')}>
          Sair
        </button>
      </div>

      <div className="tutorial-progress">
        {STEPS.map((s, i) => (
          <button
            key={s.title}
            type="button"
            className={`tutorial-dot${i === stepIdx ? ' active' : ''}${i < stepIdx ? ' done' : ''}`}
            aria-label={`Ir para o passo ${i + 1}: ${s.title}`}
            onClick={() => setStepIdx(i)}
          />
        ))}
      </div>

      <section className="tutorial-step">
        <h1>{step.title}</h1>
        {step.body}
      </section>

      <div className="tutorial-nav">
        <button type="button" disabled={isFirst} onClick={() => setStepIdx((i) => Math.max(0, i - 1))}>
          Voltar
        </button>
        {isLast ? (
          <button type="button" className="confirm" onClick={() => void navigate('/game')}>
            Começar a jogar
          </button>
        ) : (
          <button type="button" className="confirm" onClick={() => setStepIdx((i) => Math.min(STEPS.length - 1, i + 1))}>
            Próximo
          </button>
        )}
      </div>
    </div>
  );
}
