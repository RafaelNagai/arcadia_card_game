import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ConfigProvider } from './game/configStore';
import { LandingPage } from './pages/LandingPage';
import { SettingsPage } from './pages/SettingsPage';
import { GamePage } from './pages/GamePage';

export default function App() {
  return (
    <ConfigProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/game" element={<GamePage />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
