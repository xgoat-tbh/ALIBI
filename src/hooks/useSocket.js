import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';

export function useSocket(SOCKET_URL) {
  useEffect(() => {
    const socket = io(SOCKET_URL, { timeout: 45000 });
    useGameStore.getState().setSocket(socket);

    const gs = useGameStore.getState;
    const us = useUIStore.getState;

    socket.on('connect', () => { gs().setConnected(true); us().setError(''); });
    socket.on('disconnect', () => gs().setConnected(false));
    socket.on('connect_error', () => {
      us().setError('Connection failed. Retrying...');
      setTimeout(() => us().setError(''), 5000);
    });
    socket.on('room_created', ({ roomCode, playerId, players }) => gs().setRoomCreated(roomCode, playerId, players));
    socket.on('joined_successfully', ({ roomCode, playerId, players }) => gs().setJoined(roomCode, playerId, players));
    socket.on('room_updated', (data) => gs().setRoomUpdated(data));
    socket.on('game_error', ({ message }) => {
      us().setError(message);
      setTimeout(() => us().setError(''), 5000);
    });
    socket.on('room_cleared', () => {
      gs().clearRoom();
      us().setError('');
    });

    return () => {
      socket.disconnect();
      useGameStore.getState().setSocket(null);
    };
  }, [SOCKET_URL]);
}
