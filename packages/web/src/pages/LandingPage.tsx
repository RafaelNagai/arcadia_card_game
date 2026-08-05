import { useNavigate } from 'react-router-dom';

/** Stand-in key art until real art is commissioned — see CardFrame.tsx for the same pattern. */
const LANDING_ART = '/wallpaper-01.jpg';

/** The game's front door: full-bleed art behind the title, and the two ways in — jump
 *  straight into a match, or go tune the balance knobs first. */
export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <img className="landing-bg" src={LANDING_ART} alt="" draggable={false} onDragStart={(e) => e.preventDefault()} />

      <div className="landing-content">
        <div className="start-hero">
          <h1>ELTYCA</h1>
          <p className="start-tagline">Local · 2 jogadores</p>
        </div>

        <div className="landing-actions">
          <button type="button" className="confirm" onClick={() => void navigate('/game')}>
            Iniciar
          </button>
          <button type="button" onClick={() => void navigate('/online')}>
            Jogar online
          </button>
          <button type="button" onClick={() => void navigate('/tutorial')}>
            Como jogar
          </button>
          <button type="button" onClick={() => void navigate('/settings')}>
            Configurações
          </button>
        </div>
      </div>
    </div>
  );
}
