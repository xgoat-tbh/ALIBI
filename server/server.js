import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

import { setIO } from './roomManager.js';
import {
  handleCreateRoom, handleJoinRoom, handleToggleReady,
  handleStartGame, handleSubmitWord, handleSendChat,
  handleHostNextPhase, handlePlayAgain, handleLeaveRoom,
  handleKickPlayer, handleAddBots, handleStartTiebreaker
} from './linkedGame.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

setIO(io);

const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/socket.io') || req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'), (err) => { if (err) next(); });
  });
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), url: _req.headers.host });
});

function startKeepAlive() {
  const url = process.env.RENDER_EXTERNAL_URL;
  if (!url) return;
  setInterval(() => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => { console.log(`Keep-alive ping. Status: ${res.statusCode}`); })
      .on('error', (err) => { console.error(`Keep-alive failed: ${err.message}`); });
  }, 10 * 60 * 1000);
}

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('create_room', (nickname) => handleCreateRoom(socket, nickname));
  socket.on('join_room', ({ code, nickname }) => handleJoinRoom(socket, code, nickname));
  socket.on('leave_room', () => handleLeaveRoom(socket.id));

  socket.on('toggle_ready', () => handleToggleReady(socket.id));
  socket.on('start_game', () => handleStartGame(socket.id));

  socket.on('submit_word', (data) => handleSubmitWord(socket.id, data));
  socket.on('send_chat', (data) => handleSendChat(socket.id, data));

  socket.on('host_next_phase', () => handleHostNextPhase(socket.id));
  socket.on('play_again', () => handlePlayAgain(socket.id));

  socket.on('add_bots', ({ count }) => handleAddBots(socket.id, count));
  socket.on('kick_player', ({ playerId }) => handleKickPlayer(socket.id, playerId));
  socket.on('start_tiebreaker', () => handleStartTiebreaker(socket.id));

  socket.on('disconnect', () => handleLeaveRoom(socket.id));
});

const PORT = parseInt(process.env.PORT || '3001', 10);
httpServer.listen(PORT, () => {
  console.log(`LINKED server running on port ${PORT}`);
  startKeepAlive();
});
