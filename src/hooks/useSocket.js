import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';

export function useSocket(SOCKET_URL) {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { timeout: 45000 });
    socketRef.current = socket;

    const gs = useGameStore.getState;
    const us = useUIStore.getState;

    gs().setSocket(socket);

    socket.on('connect', () => {
      gs().setConnected(true);
      us().setError('');
    });
    socket.on('disconnect', () => gs().setConnected(false));
    socket.on('connect_error', () => us().setError('Connection failed. Retrying...'));
    socket.on('room_created', ({ roomCode, playerId, players }) => gs().setRoomCreated(roomCode, playerId, players));
    socket.on('joined_successfully', ({ roomCode, playerId, players }) => gs().setJoined(roomCode, playerId, players));
    socket.on('room_updated', (data) => gs().setRoomUpdated(data));
    socket.on('private_hand', ({ hand }) => gs().setPrivateHand(hand));
    socket.on('game_error', ({ message }) => us().setError(message));
    socket.on('room_cleared', () => gs().clearRoom());
    socket.on('kicked', () => {
      gs().clearRoom();
      us().setError('You were removed from the room.');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      useGameStore.getState().setSocket(null);
    };
  }, [SOCKET_URL]);

  const emit = useCallback((event, data) => {
    if (socketRef.current) socketRef.current.emit(event, data);
  }, []);

  return { emit };
}
