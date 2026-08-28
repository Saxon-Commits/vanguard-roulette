import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LobbyScreen } from './components/LobbyScreen';
import { GameRoom } from './components/GameRoom';
import { RoomContext } from './contexts/RoomContext';
import { useRoom } from './hooks/useRoom';

function AppProviders() {
  const room = useRoom();

  return (
    <RoomContext.Provider value={room}>
      <Routes>
        <Route path="/" element={<LobbyScreen />} />
        <Route path="/room/:code" element={<GameRoom />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </RoomContext.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProviders />
    </BrowserRouter>
  );
}
