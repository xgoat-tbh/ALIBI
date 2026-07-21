import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useSocket } from './hooks/useSocket';
import { useSoundEffects } from './hooks/useSoundEffects';
import { useGameStore } from './store/gameStore';
import LandingPage from './pages/LandingPage';
import GamePage from './pages/GamePage';
import { RulesModal } from './components/RulesModal';

const SOCKET_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001' : (import.meta.env.VITE_SOCKET_URL || window.location.origin);

function App() {
  const [showRules, setShowRules] = useState(false);
  const navigate = useNavigate();
  const roomCode = useGameStore((s) => s.roomCode);

  useSocket(SOCKET_URL);
  useSoundEffects();

  useEffect(() => {
    if (roomCode) {
      navigate(`/room/${roomCode}`, { replace: true });
    }
  }, [roomCode, navigate]);

  return (
    <>
      <div id="bg-layer" aria-hidden="true" />
      <Routes>
        <Route path="/" element={<LandingPage onOpenRules={() => setShowRules(true)} />} />
        <Route path="/room/:code" element={<GamePage onOpenRules={() => setShowRules(true)} />} />
      </Routes>
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </>
  );
}

export default App;
