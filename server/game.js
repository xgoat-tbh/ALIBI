import { generateCase, THEMES } from './caseGenerator.js';

// ─── Types (JSDoc for clarity) ───

/** @typedef {import('socket.io').Server & import('socket.io').Socket} */

// ─── State ───

export const rooms = new Map();
let io = null;

export function setIO(instance) {
  io = instance;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

// ─── Utilities ───

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateRoomCode() {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  if (rooms.has(code)) return generateRoomCode();
  return code;
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function stripHtml(s) {
  if (!s) return '';
  return s.replace(/<[^>]*>/g, '').replace(/[&<>"]/g, '');
}

// ─── Rate Limiting ───

const rateLimitMap = new Map();

function checkRateLimit(key, maxAttempts, windowMs) {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxAttempts) return false;
  entry.count++;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, 300000);

// ─── Filtered State ───

export function getFilteredRoomState(room, playerId) {
  const isEnded = room.status === 'reveal' || room.status === 'recap';
  const inGame = room.status !== 'lobby';
  const isSpectator = room.spectators.includes(playerId);
  const player = room.players.find(p => p.id === playerId);
  const isEcho = false; // Not applicable for ALIBI

  return {
    code: room.code,
    status: room.status,
    phaseTimer: room.phaseTimer,
    testimonySpeakerIdx: room.testimonySpeakerIdx,
    objection: room.objection,
    board: room.board,
    reconstruction: room.reconstruction,
    trustPoints: room.trustPoints,
    highlights: room.highlights || [],
    chats: room.chats.slice(-100),
    players: room.players.map(p => {
      const isSelf = p.id === playerId;
      return {
        id: p.id,
        name: p.name,
        score: p.score,
        detectiveRating: p.detectiveRating,
        isHost: p.isHost,
        currentStake: (isSelf || isEnded) ? p.currentStake : null,
        currentLock: (isSelf || isEnded) ? p.currentLock : null,
        lastScoreDelta: p.lastScoreDelta,
        isReady: p.isReady
      };
    }),
    caseData: inGame ? {
      themeTitle: room.caseData?.themeTitle,
      themeDescription: room.caseData?.themeDescription,
      groundTruth: (isEnded || isSpectator) ? room.caseData?.groundTruth : null
    } : null,
    lockedPlayerIds: Array.from(room.lockedPlayerIds),
    spectators: room.spectators
  };
}

export function broadcastRoomState(room) {
  const i = getIO();
  room.players.forEach(p => {
    i.to(p.id).emit('room_updated', getFilteredRoomState(room, p.id));
  });
  room.spectators.forEach(sId => {
    i.to(sId).emit('room_updated', getFilteredRoomState(room, sId));
  });
  // Also emit private hand data
  room.players.forEach((p, idx) => {
    if (room.caseData && room.caseData.playersFacts) {
      const facts = room.caseData.playersFacts[`player-${idx}`];
      if (facts) {
        i.to(p.id).emit('private_hand', { hand: facts });
      }
    }
  });
}

// ─── Timer ───

function clearTimer(room) {
  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = null;
  }
}

function startTimer(room, seconds, onEnd) {
  clearTimer(room);
  room.phaseTimer = seconds;
  if (seconds <= 0) { onEnd(); return; }
  room.timerInterval = setInterval(() => {
    const r = rooms.get(room.code);
    if (!r) { clearTimer(room); return; }
    r.phaseTimer--;
    broadcastRoomState(r);
    if (r.phaseTimer <= 0) {
      clearTimer(r);
      onEnd();
    }
  }, 1000);
}

function findPlayerRoom(socketId) {
  for (const room of rooms.values()) {
    if (room.players.some(p => p.id === socketId) || room.spectators.includes(socketId)) return room;
  }
  return null;
}

// ─── Phase Transitions ───

const PHASES = [
  'lobby', 'case_open', 'private_memory', 'opening_statements',
  'cross_talk', 'investigation', 'confidence_lock',
  'final_reconstruction', 'reveal', 'recap'
];

function advancePhase(room) {
  const currentIdx = PHASES.indexOf(room.status);
  if (currentIdx !== -1 && currentIdx < PHASES.length - 1) {
    transitionToPhase(room, PHASES[currentIdx + 1]);
  }
}

function transitionToPhase(room, newPhase) {
  room.status = newPhase;
  clearTimer(room);
  room.objection = { active: false, playerId: null, playerName: null };

  let duration = 0;
  switch (newPhase) {
    case 'case_open': duration = 12; break;
    case 'private_memory': duration = 30; break;
    case 'opening_statements': room.testimonySpeakerIdx = 0; duration = 20; break;
    case 'cross_talk': duration = 90; break;
    case 'investigation': duration = 180; break;
    case 'confidence_lock': duration = 25; break;
    case 'final_reconstruction': duration = 60; break;
    case 'reveal': duration = 25; break;
    case 'recap': duration = 0; calculateScoring(room); break;
  }

  broadcastRoomState(room);

  if (duration > 0) {
    startTimer(room, duration, () => {
      if (room.status === 'opening_statements') {
        room.testimonySpeakerIdx++;
        if (room.testimonySpeakerIdx < room.players.length) {
          transitionToPhase(room, 'opening_statements');
        } else {
          transitionToPhase(room, 'cross_talk');
        }
      } else {
        advancePhase(room);
      }
    });
  }
}

// ─── Scoring ───

function calculateScoring(room) {
  const gt = room.caseData?.groundTruth;
  const reconstruction = room.reconstruction;
  if (!gt) return;

  let correctCategories = 0;
  if (reconstruction.who === gt.who) correctCategories++;
  if (reconstruction.where === gt.where) correctCategories++;
  if (reconstruction.when === gt.when) correctCategories++;
  if (reconstruction.how === gt.how) correctCategories++;
  if (reconstruction.why === gt.why) correctCategories++;

  room.trustPoints = correctCategories * 20;

  const totalLocked = room.players.filter(p => p.currentLock !== null).length;
  const incorrectCount = room.players.filter(p => p.currentLock && !p.currentLock.isCorrect).length;

  const highlights = [];

  room.players.forEach(player => {
    let delta = 0;
    const isCorrect = player.currentLock ? player.currentLock.isCorrect : false;

    if (player.currentLock && player.currentStake) {
      if (isCorrect) {
        if (player.currentStake === 'Hunch') delta += 10;
        if (player.currentStake === 'Confident') delta += 25;
        if (player.currentStake === 'Certain') delta += 50;
        if (totalLocked > 1 && (incorrectCount / totalLocked) > 0.5) {
          delta += 20;
          player.minorityReportTriggered = true;
        } else {
          player.minorityReportTriggered = false;
        }
      } else {
        if (player.currentStake === 'Hunch') delta += 0;
        if (player.currentStake === 'Confident') delta -= 10;
        if (player.currentStake === 'Certain') delta -= 25;
        player.minorityReportTriggered = false;
      }
    }

    player.lastScoreDelta = delta;
    player.score += delta;

    let ratingDelta = 0;
    if (player.currentStake === 'Certain') ratingDelta = isCorrect ? +15 : -25;
    else if (player.currentStake === 'Confident') ratingDelta = isCorrect ? +8 : -10;
    else if (player.currentStake === 'Hunch') ratingDelta = isCorrect ? +3 : 0;
    player.detectiveRating = Math.max(500, (player.detectiveRating || 1000) + ratingDelta);
  });

  // Build highlights
  const confidentWrong = room.players.find(p => p.currentStake === 'Certain' && p.currentLock && !p.currentLock.isCorrect);
  if (confidentWrong) {
    highlights.push({ type: 'blunder', text: `${confidentWrong.name} was absolutely Certain of their memory... but it was completely fabricated!` });
  }
  const hero = room.players.find(p => p.minorityReportTriggered);
  if (hero) {
    highlights.push({ type: 'hero', text: `${hero.name} was the lone voice of reason, standing by a memory that the rest of the table doubted!` });
  }
  const allCorrect = room.players.length > 0 && room.players.every(p => p.currentLock && p.currentLock.isCorrect);
  if (allCorrect) {
    highlights.push({ type: 'synergy', text: 'The table shares a singular consciousness: Every single detective locked in a correct memory!' });
  }
  if (highlights.length === 0) {
    highlights.push({ type: 'info', text: `Investigation complete. The team achieved a ${room.trustPoints}% reconstruction accuracy.` });
  }
  room.highlights = highlights;
}

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

  // Allow join as spectator if game started
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

  // Reset game state
  room.board = [];
  room.lockedPlayerIds = new Set();
  room.chats = [];
  room.highlights = [];
  room.trustPoints = 0;
  room.reconstruction = { who: null, where: null, when: null, how: null, why: null, evidenceNotes: '' };
  room.players.forEach(p => { p.currentLock = null; p.currentStake = null; p.lastScoreDelta = 0; });

  // Generate case data
  room.caseData = generateCase(room.players.length, themeId);

  // Distribute private hands
  room.players.forEach((player, idx) => {
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

  const newBoardItem = {
    id: `board-item-${Date.now()}`,
    factId: fact.id,
    text: fact.text,
    category,
    placerId: player.id,
    placerName: player.name,
    because,
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
  room.reconstruction = { ...room.reconstruction, ...reconstruction };
  broadcastRoomState(room);
}

export function handleLockConfidence(socketId, { fact, stake }) {
  const room = findPlayerRoom(socketId);
  if (!room || room.status !== 'confidence_lock') return;
  const player = room.players.find(p => p.id === socketId);
  if (!player) return;

  player.currentLock = fact;
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
      if (room.players.every(p => !p) && room.spectators.length === 0) { clearTimer(room); rooms.delete(code); }
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
