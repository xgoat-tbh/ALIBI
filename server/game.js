import { generateCase, THEMES } from './caseGenerator.js';
import {
  rooms, getIO, generateRoomCode, stripHtml, findPlayerRoom,
  checkRateLimit, broadcastRoomState, getFilteredRoomState
} from './roomManager.js';
import { clearTimer, advancePhase, transitionToPhase } from './phaseManager.js';
import { calculateScoring } from './scoring.js';

export { setIO, rooms } from './roomManager.js';
export { calculateScoring } from './scoring.js';
export { PHASES } from './phaseManager.js';

// ─── Board Conflict Check ───

function checkBoardConflicts(room) {
  room.board.forEach(item => { item.isConflict = false; });
  const categories = ['who', 'where', 'when', 'how', 'why', 'evidence'];
  categories.forEach(cat => {
    const items = room.board.filter(i => i.category === cat);
    if (items.length <= 1) return;
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        if (items[i].text !== items[j].text) {
          items[i].isConflict = true;
          items[j].isConflict = true;
        }
      }
    }
  });
}

// ─── Event Handlers ───

export function handleCreateRoom(socket, nickname) {
  const ip = socket.handshake.address;
  if (!checkRateLimit(`create:${ip}`, 5, 60000)) {
    socket.emit('game_error', 'Too many rooms created. Please wait.');
    return;
  }

  const code = generateRoomCode();
  const playerId = socket.id;
  const player = {
    id: playerId,
    name: stripHtml(nickname).slice(0, 15) || `Detective${Math.floor(Math.random() * 1000)}`,
    isHost: true,
    isReady: true,
    isMuted: false,
    score: 0,
    detectiveRating: 1000,
    currentLock: null,
    currentStake: null,
    lastScoreDelta: 0,
    eliminated: false
  };

  const room = {
    code,
    status: 'lobby',
    players: [player],
    board: [],
    caseData: null,
    reconstruction: { who: null, where: null, when: null, how: null, why: null, evidenceNotes: '' },
    objection: { active: false, playerId: null, playerName: null },
    testimonySpeakerIdx: 0,
    phaseTimer: 0,
    timerInterval: null,
    lockedPlayerIds: new Set(),
    chats: [],
    trustPoints: 0,
    highlights: [],
    spectators: [],
    echoPlayerIds: [],
    settings: { maxPlayers: 10 }
  };

  rooms.set(code, room);
  socket.join(code);
  socket.emit('room_created', { roomCode: code, playerId: player.id, players: room.players });
  broadcastRoomState(room);
}

export function handleJoinRoom(socket, code, nickname) {
  const ip = socket.handshake.address;
  if (!checkRateLimit(`join:${ip}`, 10, 60000)) {
    socket.emit('game_error', 'Too many join attempts. Please wait.');
    return;
  }

  const roomCode = code?.toUpperCase();
  const room = rooms.get(roomCode);
  if (!room) { socket.emit('game_error', 'Room not found.'); return; }

  if (room.status !== 'lobby') {
    handleJoinAsSpectator(socket, roomCode);
    return;
  }

  if (room.players.length >= 10) { socket.emit('game_error', 'Room is full (max 10).'); return; }

  const player = {
    id: socket.id,
    name: stripHtml(nickname).slice(0, 15) || `Detective${Math.floor(Math.random() * 1000)}`,
    isHost: false,
    isReady: false,
    score: 0,
    detectiveRating: 1000,
    currentLock: null,
    currentStake: null,
    lastScoreDelta: 0
  };

  room.players.push(player);
  socket.join(roomCode);
  broadcastRoomState(room);
  socket.emit('joined_successfully', { roomCode, playerId: player.id, players: room.players });
}

export function handleToggleReady(socketId) {
  const room = findPlayerRoom(socketId);
  if (!room || room.status !== 'lobby') return;
  const player = room.players.find(p => p.id === socketId);
  if (!player || player.isHost) return;
  player.isReady = !player.isReady;
  broadcastRoomState(room);
}

export function handleStartGame(socketId, themeId) {
  const room = findPlayerRoom(socketId);
  if (!room || room.status !== 'lobby') return;
  const host = room.players.find(p => p.id === socketId && p.isHost);
  if (!host) { getIO().to(socketId).emit('game_error', 'Only the host can start the game.'); return; }
  if (room.players.length < 2) { getIO().to(socketId).emit('game_error', 'Need at least 2 players.'); return; }

  const allReady = room.players.every(p => p.isReady);
  if (!allReady) { getIO().to(socketId).emit('game_error', 'All players must be ready.'); return; }

  room.board = [];
  room.lockedPlayerIds = new Set();
  room.chats = [];
  room.highlights = [];
  room.trustPoints = 0;
  room.reconstruction = { who: null, where: null, when: null, how: null, why: null, evidenceNotes: '' };
  room.players.forEach(p => { p.currentLock = null; p.currentStake = null; p.lastScoreDelta = 0; });

  room.caseData = generateCase(room.players.length, themeId);

  // Assign saboteur if 4+ players
  room.players.forEach(p => { p.isSaboteur = false; });
  if (room.players.length >= 4) {
    const nonHosts = room.players.filter(p => !p.isHost);
    const saboteur = nonHosts[Math.floor(Math.random() * nonHosts.length)];
    if (saboteur) {
      saboteur.isSaboteur = true;
      getIO().to(saboteur.id).emit('saboteur_assigned');
    }
  }

  room.players.forEach((player, idx) => {
    player.originalIndex = idx;
    const facts = room.caseData.playersFacts[`player-${idx}`];
    if (facts) {
      getIO().to(player.id).emit('private_hand', { hand: facts });
    }
  });

  transitionToPhase(room, 'case_open');
}

export function handlePlaceCard(socketId, { fact, category, because }) {
  const room = findPlayerRoom(socketId);
  if (!room || room.status !== 'investigation') return;
  if (!checkRateLimit(`place:${socketId}`, 10, 10000)) return;

  const player = room.players.find(p => p.id === socketId);
  if (!player) return;

  const text = (fact?.text || '').trim();
  const reason = (because || '').trim();
  if (!text || text.length > 500) return;
  if (reason.length > 500) return;

  const newBoardItem = {
    id: `board-item-${Date.now()}`,
    factId: fact?.id,
    text,
    category,
    placerId: player.id,
    placerName: player.name,
    because: reason,
    challenged: false,
    challengeText: null,
    challengeStatus: null
  };

  room.board.push(newBoardItem);
  checkBoardConflicts(room);
  broadcastRoomState(room);
}

export function handleRemoveCard(socketId, { boardItemId }) {
  const room = findPlayerRoom(socketId);
  if (!room || room.status !== 'investigation') return;
  room.board = room.board.filter(item => item.id !== boardItemId);
  checkBoardConflicts(room);
  broadcastRoomState(room);
}

export function handleChallengeCard(socketId, { boardItemId }) {
  const room = findPlayerRoom(socketId);
  if (!room || room.status !== 'investigation') return;
  const challenger = room.players.find(p => p.id === socketId);
  const item = room.board.find(i => i.id === boardItemId);
  if (!item || item.challenged || item.placerId === socketId) return;

  item.challenged = true;
  item.challengeStatus = 'pending';
  item.challengerName = challenger.name;
  broadcastRoomState(room);

  let challengeSeconds = 10;
  const cInterval = setInterval(() => {
    challengeSeconds--;
    if (challengeSeconds <= 0) {
      clearInterval(cInterval);
      if (item.challengeStatus === 'pending') {
        item.challengeStatus = 'stalled';
        item.challengeText = 'Failed to respond in time.';
        broadcastRoomState(room);
      }
    }
  }, 1000);
}

export function handleRespondChallenge(socketId, { boardItemId, explanation }) {
  const room = findPlayerRoom(socketId);
  if (!room) return;
  const item = room.board.find(i => i.id === boardItemId);
  if (!item || item.placerId !== socketId || item.challengeStatus !== 'pending') return;
  item.challengeStatus = 'resolved';
  item.challengeText = explanation;
  broadcastRoomState(room);
}

export function handleObjection(socketId) {
  const room = findPlayerRoom(socketId);
  if (!room || (room.status !== 'opening_statements' && room.status !== 'cross_talk')) return;
  const player = room.players.find(p => p.id === socketId);
  if (!player) return;

  room.objection = { active: true, playerId: player.id, playerName: player.name };
  broadcastRoomState(room);

  setTimeout(() => {
    if (room.objection.active && room.objection.playerId === player.id) {
      room.objection = { active: false, playerId: null, playerName: null };
      broadcastRoomState(room);
    }
  }, 8000);
}

export function handleUpdateReconstruction(socketId, { reconstruction }) {
  const room = findPlayerRoom(socketId);
  if (!room || room.status !== 'final_reconstruction') return;
  if (!checkRateLimit(`recon:${socketId}`, 20, 10000)) return;

  const sanitized = {};
  for (const [key, val] of Object.entries(reconstruction || {})) {
    if (['who','where','when','how','why','evidenceNotes'].includes(key)) {
      sanitized[key] = (typeof val === 'string' ? val : '').slice(0, 500);
    }
  }
  room.reconstruction = { ...room.reconstruction, ...sanitized };
  broadcastRoomState(room);
}

export function handleLockConfidence(socketId, { fact, stake }) {
  const room = findPlayerRoom(socketId);
  if (!room || room.status !== 'confidence_lock') return;
  const player = room.players.find(p => p.id === socketId);
  if (!player) return;

  const playerIdx = player.originalIndex ?? room.players.indexOf(player);
  const assignedFacts = room.caseData?.playersFacts?.[`player-${playerIdx}`];
  const serverFact = assignedFacts?.find(f => f.id === fact.id);
  if (!serverFact) {
    getIO().to(socketId).emit('game_error', 'Invalid fact. Cannot lock confidence.');
    return;
  }

  player.currentLock = serverFact;
  player.currentStake = stake;
  room.lockedPlayerIds.add(player.id);
  broadcastRoomState(room);

  const allLocked = room.players.every(p => p.currentLock !== null);
  if (allLocked) {
    setTimeout(() => transitionToPhase(room, 'final_reconstruction'), 1000);
  }
}

export function handleSendChat(socketId, { message }) {
  const room = findPlayerRoom(socketId);
  if (!room) return;
  if (!checkRateLimit(`chat:${socketId}`, 10, 10000)) return;

  const player = room.players.find(p => p.id === socketId);
  if (!player) return;

  const text = stripHtml(message.trim()).slice(0, 200);
  if (!text) return;

  const chatMsg = {
    id: `chat-${Date.now()}`,
    playerId: player.id,
    playerName: player.name,
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  room.chats.push(chatMsg);
  broadcastRoomState(room);
}

export function handleHostNextPhase(socketId) {
  const room = findPlayerRoom(socketId);
  if (!room) return;
  const player = room.players.find(p => p.id === socketId);
  if (!player || !player.isHost) return;
  advancePhase(room);
}

export function handlePlayAgain(socketId) {
  const room = findPlayerRoom(socketId);
  if (!room || room.status !== 'recap') return;
  const host = room.players.find(p => p.id === socketId && p.isHost);
  if (!host) return;

  clearTimer(room);
  room.status = 'lobby';
  room.board = [];
  room.caseData = null;
  room.reconstruction = { who: null, where: null, when: null, how: null, why: null, evidenceNotes: '' };
  room.objection = { active: false, playerId: null, playerName: null };
  room.chats = [];
  room.trustPoints = 0;
  room.highlights = [];
  room.lockedPlayerIds = new Set();
  room.players.forEach(p => {
    p.currentLock = null;
    p.currentStake = null;
    p.lastScoreDelta = 0;
    p.isSaboteur = false;
    p.isReady = p.isHost;
  });

  broadcastRoomState(room);
}

export function handleToggleMute(socketId, isMuted) {
  const room = findPlayerRoom(socketId);
  if (!room) return;
  const player = room.players.find(p => p.id === socketId);
  if (!player) return;
  player.isMuted = isMuted;
  broadcastRoomState(room);
}

export function handleKickPlayer(socketId, targetId) {
  const room = findPlayerRoom(socketId);
  if (!room || room.status !== 'lobby') return;
  const host = room.players.find(p => p.id === socketId && p.isHost);
  if (!host || host.id === targetId) return;

  const idx = room.players.findIndex(p => p.id === targetId);
  if (idx === -1) return;
  room.players.splice(idx, 1);
  getIO().to(targetId).emit('kicked');
  getIO().sockets.sockets.get(targetId)?.leave(room.code);
  broadcastRoomState(room);
}

export function handleUpdateSettings(socketId, settings) {
  const room = findPlayerRoom(socketId);
  if (!room || room.status !== 'lobby') return;
  const host = room.players.find(p => p.id === socketId && p.isHost);
  if (!host) return;
  Object.assign(room.settings || {}, settings);
  broadcastRoomState(room);
}

export function handleJoinAsSpectator(socket, code) {
  const roomCode = code?.toUpperCase();
  const room = rooms.get(roomCode);
  if (!room) { socket.emit('game_error', 'Room not found.'); return; }

  room.spectators.push(socket.id);
  socket.join(roomCode);
  socket.emit('room_updated', getFilteredRoomState(room, socket.id));
}

export function handleLeaveRoom(socketId) {
  for (const [code, room] of rooms.entries()) {
    const specIdx = room.spectators.indexOf(socketId);
    if (specIdx >= 0) {
      room.spectators.splice(specIdx, 1);
      getIO().to(socketId).emit('room_cleared');
      if (room.players.length === 0 && room.spectators.length === 0) { clearTimer(room); rooms.delete(code); }
      return;
    }

    const pIndex = room.players.findIndex(p => p.id === socketId);
    if (pIndex === -1) continue;

    const player = room.players[pIndex];
    const timerKey = `${code}_${player.name}`;
    const existingTimer = disconnectTimers.get(timerKey);
    if (existingTimer) { clearTimeout(existingTimer); disconnectTimers.delete(timerKey); }

    room.players.splice(pIndex, 1);
    if (player.isHost && room.players.length > 0) {
      const nextHost = room.players.find(p => !p.eliminated) || room.players[0];
      nextHost.isHost = true;
      nextHost.isReady = true;
    }

    getIO().to(socketId).emit('room_cleared');
    getIO().sockets.sockets.get(socketId)?.leave(code);

    if (room.players.length === 0 && room.spectators.length === 0) {
      clearTimer(room);
      rooms.delete(code);
    } else {
      broadcastRoomState(room);
    }
    return;
  }
}

const disconnectTimers = new Map();

export function handleReconnect(socket, code, nickname) {
  const roomCode = code?.toUpperCase();
  const room = rooms.get(roomCode);
  nickname = stripHtml(nickname).slice(0, 15);
  if (!room) { socket.emit('game_error', 'Room not found.'); return; }

  const timerKey = `${roomCode}_${nickname}`;
  const existingTimer = disconnectTimers.get(timerKey);
  if (existingTimer) { clearTimeout(existingTimer); disconnectTimers.delete(timerKey); }

  const existing = room.players.find(p => p.name === nickname);
  if (existing) {
    existing.id = socket.id;
    socket.join(roomCode);
    socket.emit('room_updated', getFilteredRoomState(room, socket.id));
    broadcastRoomState(room);
    return;
  }

  if (room.status === 'lobby') {
    handleJoinRoom(socket, code, nickname);
  } else {
    socket.emit('game_error', 'Game in progress. Could not reconnect.');
  }
}

export function handleListRooms() {
  const list = [];
  for (const room of rooms.values()) {
    if (room.status === 'lobby' || room.status === 'case_open') {
      list.push({
        code: room.code,
        playerCount: room.players.length,
        maxPlayers: 10,
        status: room.status
      });
    }
  }
  return list;
}

export function handleDisconnect(socketId) {
  for (const [code, room] of rooms.entries()) {
    const specIdx = room.spectators.indexOf(socketId);
    if (specIdx >= 0) { room.spectators.splice(specIdx, 1); }

    const pIndex = room.players.findIndex(p => p.id === socketId);
    if (pIndex === -1) {
      if (room.players.length === 0 && room.spectators.length === 0) { clearTimer(room); rooms.delete(code); }
      continue;
    }

    const player = room.players[pIndex];
    const timerKey = `${code}_${player.name}`;

    const timer = setTimeout(() => {
      room.players.splice(pIndex, 1);
      disconnectTimers.delete(timerKey);

      if (player.isHost && room.players.length > 0) {
        const nextHost = room.players.find(p => !p.eliminated) || room.players[0];
        nextHost.isHost = true;
        nextHost.isReady = true;
      }

      if (room.players.length === 0 && room.spectators.length === 0) {
        clearTimer(room);
        rooms.delete(code);
      } else {
        broadcastRoomState(room);
      }
    }, 20000);

    disconnectTimers.set(timerKey, timer);
    break;
  }
}
