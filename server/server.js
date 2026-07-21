import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

import {
  setIO,
  handleCreateRoom,
  handleJoinRoom,
  handleToggleReady,
  handleStartGame,
  handlePlaceCard,
  handleRemoveCard,
  handleChallengeCard,
  handleRespondChallenge,
  handleObjection,
  handleUpdateReconstruction,
  handleLockConfidence,
  handleSendChat,
  handleHostNextPhase,
  handlePlayAgain,
  handleToggleMute,
  handleUpdateSettings,
  handleKickPlayer,
  handleLeaveRoom,
  handleJoinAsSpectator,
  handleListRooms,
  handleReconnect,
  handleDisconnect,
} from './game.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

setIO(io);

// Serve static files from the React build directory
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/socket.io') || req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) next();
    });
  });
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), url: _req.headers.host });
});

// Keep alive for Render
function startKeepAlive() {
  const url = process.env.RENDER_EXTERNAL_URL;
  if (!url) return;
  setInterval(() => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      console.log(`Keep-alive ping. Status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error(`Keep-alive failed: ${err.message}`);
    });
  }, 10 * 60 * 1000);
}

// ─── Socket Event Router ───

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id} from ${socket.handshake.address}`);

  // Room lifecycle
  socket.on('create_room', (nickname) => handleCreateRoom(socket, nickname));
  socket.on('join_room', ({ code, nickname }) => handleJoinRoom(socket, code, nickname));
  socket.on('leave_room', () => handleLeaveRoom(socket.id));
  socket.on('reconnect', ({ code, nickname }) => handleReconnect(socket, code, nickname));

  // Lobby
  socket.on('toggle_ready', () => handleToggleReady(socket.id));
  socket.on('start_game', ({ themeId }) => handleStartGame(socket.id, themeId));

  // Investigation board
  socket.on('place_card', (data) => handlePlaceCard(socket.id, data));
  socket.on('remove_card', (data) => handleRemoveCard(socket.id, data));
  socket.on('challenge_card', (data) => handleChallengeCard(socket.id, data));
  socket.on('respond_challenge', (data) => handleRespondChallenge(socket.id, data));

  // Objection
  socket.on('trigger_objection', () => handleObjection(socket.id));

  // Reconstruction
  socket.on('update_reconstruction', (data) => handleUpdateReconstruction(socket.id, data));

  // Confidence lock
  socket.on('lock_confidence', (data) => handleLockConfidence(socket.id, data));

  // Chat
  socket.on('send_chat', (data) => handleSendChat(socket.id, data));

  // Host controls
  socket.on('host_next_phase', () => handleHostNextPhase(socket.id));
  socket.on('play_again', () => handlePlayAgain(socket.id));
  socket.on('update_settings', (settings) => handleUpdateSettings(socket.id, settings));
  socket.on('kick_player', ({ targetId }) => handleKickPlayer(socket.id, targetId));

  // Mute
  socket.on('toggle_mute', (isMuted) => handleToggleMute(socket.id, isMuted));

  // Spectator
  socket.on('join_as_spectator', ({ code }) => handleJoinAsSpectator(socket, code));
  socket.on('list_rooms', () => {
    const rooms = handleListRooms();
    socket.emit('room_list', rooms);
  });

  // Disconnect
  socket.on('disconnect', () => handleDisconnect(socket.id));
});

const PORT = parseInt(process.env.PORT || '3001', 10);
httpServer.listen(PORT, () => {
  console.log(`ALIBI server running on port ${PORT}`);
  startKeepAlive();
});
