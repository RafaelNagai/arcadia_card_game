import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ConfigProvider } from './game/configStore';
import { LandingPage } from './pages/LandingPage';
import { SettingsPage } from './pages/SettingsPage';
import { TutorialPage } from './pages/TutorialPage';
import { GamePage } from './pages/GamePage';
import { OnlineLobbyPage } from './pages/OnlineLobbyPage';
import { OnlineRoomPage } from './pages/OnlineRoomPage';

export default function App() {
  return (
    <ConfigProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/tutorial" element={<TutorialPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/online" element={<OnlineLobbyPage />} />
          <Route path="/online/:code" element={<OnlineRoomPage />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
