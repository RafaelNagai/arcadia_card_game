import { useNavigate } from 'react-router-dom';
import { useConfig } from '../game/configStore';
import Match from '../Match';

/** The /game route — builds and plays one match with whatever config is current when
 *  this mounts. "New match" (from the end sequence) returns to the landing page rather
 *  than silently restarting, matching the menu-driven flow the routes are for. */
export function GamePage() {
  const navigate = useNavigate();
  const { config } = useConfig();
  return <Match config={config} onNewMatch={() => void navigate('/')} />;
}
