import { useNavigate } from 'react-router-dom';

/** The game's front door: art (placeholder for now — real key art comes later), title,
 *  and the two ways in: jump straight into a match, or go tune the balance knobs first. */
export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <div className="landing-art" aria-hidden="true">
        <span className="landing-art-label">Artwork coming soon</span>
      </div>

      <div className="start-hero">
        <h1>ELTYCA</h1>
        <p className="start-tagline">Hot-seat · 2 players</p>
      </div>

      <div className="landing-actions">
        <button type="button" className="confirm" onClick={() => navigate('/game')}>
          Start
        </button>
        <button type="button" onClick={() => navigate('/settings')}>
          Settings
        </button>
      </div>
    </div>
  );
}
