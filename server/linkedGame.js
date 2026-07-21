import { rooms, getIO, generateRoomCode, stripHtml, findPlayerRoom, checkRateLimit, broadcastRoomState } from './roomManager.js';
import { pickWord } from './linkedWords.js';
import { processBots } from './botManager.js';

const TOTAL_ROUNDS = 8;
const DROP_DURATION = 12;
const REVEAL_DURATION = 5;

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function fuzzyMatch(a, b) {
  const na = a.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  const nb = b.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (na === nb) return true;
  if (na.length < 3 || nb.length < 3) return na === nb;
  return levenshtein(na, nb) <= Math.max(1, Math.floor(Math.min(na.length, nb.length) * 0.25));
}

function clearTimer(room) {
  if (room._timer) { clearInterval(room._timer); room._timer = null; }
}

function startTimer(room, seconds, onEnd) {
  clearTimer(room);
  room.phaseTimer = seconds;
  if (seconds <= 0) { onEnd(); return; }
  room._timer = setInterval(() => {
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

function buildScoreboard(room) {
  room.players.sort((a, b) => b.score - a.score);
  room.standings = room.players.map((p, i) => ({
    name: p.name,
    score: p.score,
    rank: i + 1,
    isBot: !!p.isBot,
  }));
}

function getTiedPlayers(room) {
  if (room.standings.length < 2) return [];
  const topScore = room.standings[0].score;
  const bottomScore = room.standings[room.standings.length - 1].score;
  const topTied = room.standings.filter(p => p.score === topScore);
  const bottomTied = room.standings.filter(p => p.score === bottomScore);
  if (topTied.length > 1 && topTied.length < room.players.length) return topTied;
  if (bottomTied.length > 1 && topTied.length === 1) return bottomTied;
  return [];
}

function processReveal(room) {
  const prompt = room.currentPrompt;
  const subs = room.submissions || [];

  const groups = [];
  const assigned = new Set();

  for (let i = 0; i < subs.length; i++) {
    if (assigned.has(i)) continue;
    const group = [subs[i]];
    assigned.add(i);
    for (let j = i + 1; j < subs.length; j++) {
      if (assigned.has(j)) continue;
      if (fuzzyMatch(subs[i].word, subs[j].word)) {
        group.push(subs[j]);
        assigned.add(j);
      }
    }
    groups.push(group);
  }

  for (const group of groups) {
    const size = group.length;
    let pts = 0;
    if (size >= 3) pts = 15;
    else if (size === 2) pts = 10;
    else if (size === 1) pts = 3;

    for (const sub of group) {
      const isPromptRepeat = fuzzyMatch(sub.word, prompt);
      const finalPts = isPromptRepeat ? 0 : pts;
      sub.points = finalPts;
      sub.isPromptRepeat = isPromptRepeat;
      const player = room.players.find(p => p.id === sub.playerId);
      if (player) player.score += finalPts;
    }
  }

  room.revealGroups = groups.map(g => g.map(s => ({
    word: s.word,
    playerId: s.playerId,
    playerName: s.playerName,
    points: s.points,
    isPromptRepeat: s.isPromptRepeat
  })));
  room.submissions = [];
}

function nextRound(room) {
  room.currentRound++;
  if (room.currentRound > TOTAL_ROUNDS) {
    buildScoreboard(room);
    clearTimer(room);
    if (!room._tiebreakerDone) {
      const tied = getTiedPlayers(room);
      if (tied.length > 0) {
        room.tiebreakerPlayers = tied.map(p => p.id);
        room.status = 'tiebreaker_ready';
        broadcastRoomState(room);
        return;
      }
    }
    room._tiebreakerDone = false;
    room.status = 'results';
    broadcastRoomState(room);
    return;
  }
  room.currentPrompt = pickWord(room.usedWords || []);
  room.usedWords = [...(room.usedWords || []), room.currentPrompt];
  room.submissions = [];
  room.revealGroups = [];
  room.status = 'word_drop';
  broadcastRoomState(room);
  processBots(room);
  startTimer(room, DROP_DURATION, () => {
    processReveal(room);
    room.status = 'reveal';
    broadcastRoomState(room);
    startTimer(room, REVEAL_DURATION, () => {
      nextRound(room);
    });
  });
}

export function handleCreateRoom(socket, nickname) {
  const ip = socket.handshake.address;
  if (!checkRateLimit(`create:${ip}`, 5, 60000)) {
    socket.emit('game_error', 'Too many rooms created.');
    return;
  }
  const code = generateRoomCode();
  const player = {
    id: socket.id, name: stripHtml(nickname).slice(0, 15) || `Player${Math.floor(Math.random() * 1000)}`,
    isHost: true, isReady: true, score: 0, lastScoreDelta: 0
  };
  const room = {
    code, status: 'lobby', players: [player], chats: [],
    currentRound: 0, currentPrompt: null, usedWords: [],
    submissions: [], revealGroups: [], standings: [], phaseTimer: 0, _timer: null,
    spectators: [], settings: { maxPlayers: 10 },
    tiebreakerPlayers: [], _tiebreakerDone: false,
  };
  rooms.set(code, room);
  socket.join(code);
  socket.emit('room_created', { roomCode: code, playerId: player.id, players: room.players });
  broadcastRoomState(room);
}

export function handleJoinRoom(socket, code, nickname) {
  const ip = socket.handshake.address;
  if (!checkRateLimit(`join:${ip}`, 10, 60000)) {
    socket.emit('game_error', 'Too many join attempts.');
    return;
  }
  const roomCode = code?.toUpperCase();
  const room = rooms.get(roomCode);
  if (!room) { socket.emit('game_error', 'Room not found.'); return; }
  if (room.status !== 'lobby') { socket.emit('game_error', 'Game already in progress.'); return; }
  if (room.players.length >= 10) { socket.emit('game_error', 'Room is full.'); return; }
  const player = {
    id: socket.id, name: stripHtml(nickname).slice(0, 15) || `Player${Math.floor(Math.random() * 1000)}`,
    isHost: false, isReady: false, score: 0, lastScoreDelta: 0
  };
  room.players.push(player);
  socket.join(roomCode);
  socket.emit('joined_successfully', { roomCode, playerId: player.id, players: room.players });
  broadcastRoomState(room);
}

export function handleToggleReady(socketId) {
  const room = findPlayerRoom(socketId);
  if (!room || room.status !== 'lobby') return;
  const player = room.players.find(p => p.id === socketId);
  if (!player || player.isHost) return;
  player.isReady = !player.isReady;
  broadcastRoomState(room);
}

export function handleStartGame(socketId) {
  const room = findPlayerRoom(socketId);
  if (!room || room.status !== 'lobby') return;
  const host = room.players.find(p => p.id === socketId && p.isHost);
  if (!host) return;
  if (room.players.length < 2) { getIO().to(socketId).emit('game_error', 'Need at least 2 players.'); return; }
  const allReady = room.players.every(p => p.isReady);
  if (!allReady) { getIO().to(socketId).emit('game_error', 'All players must be ready.'); return; }

  room.players.forEach(p => { p.score = 0; p.lastScoreDelta = 0; });
  room.currentRound = 0;
  room.usedWords = [];
  room.submissions = [];
  room.revealGroups = [];
  room.standings = [];
  room.chats = [];
  room.tiebreakerPlayers = [];
  room._tiebreakerDone = false;

  nextRound(room);
}

export function handleSubmitWord(socketId, { word }) {
  const room = findPlayerRoom(socketId);
  if (!room || room.status !== 'word_drop') return;
  if (room._isTiebreaker && room.tiebreakerPlayers.length > 0 && !room.tiebreakerPlayers.includes(socketId)) return;
  const cleaned = stripHtml(word || '').slice(0, 30).trim();
  if (!cleaned) return;
  const already = room.submissions.find(s => s.playerId === socketId);
  if (already) { already.word = cleaned; return; }
  const player = room.players.find(p => p.id === socketId);
  if (!player) return;
  room.submissions.push({ playerId: socketId, playerName: player.name, word: cleaned });
  broadcastRoomState(room);
}

export function handleStartTiebreaker(socketId) {
  const room = findPlayerRoom(socketId);
  if (!room || room.status !== 'tiebreaker_ready') return;
  const host = room.players.find(p => p.id === socketId && p.isHost);
  if (!host) return;

  room._isTiebreaker = true;
  room._tiebreakerDone = true;
  room.currentRound = TOTAL_ROUNDS;
  room.players.forEach(p => {
    if (room.tiebreakerPlayers.includes(p.id)) { p.score = 0; }
  });
  room.usedWords = [];
  room.submissions = [];
  room.revealGroups = [];
  nextRound(room);
}

export function handleSendChat(socketId, { message }) {
  const room = findPlayerRoom(socketId);
  if (!room) return;
  if (!checkRateLimit(`chat:${socketId}`, 10, 10000)) return;
  const player = room.players.find(p => p.id === socketId);
  if (!player) return;
  const clean = stripHtml(message || '').slice(0, 200).trim();
  if (!clean) return;
  room.chats.push({ id: `chat-${Date.now()}`, playerId: socketId, playerName: player.name, text: clean, timestamp: new Date().toLocaleTimeString() });
  broadcastRoomState(room);
}

export function handleHostNextPhase(socketId) {
  const room = findPlayerRoom(socketId);
  if (!room) return;
  const host = room.players.find(p => p.id === socketId && p.isHost);
  if (!host) return;
  clearTimer(room);
  if (room.status === 'word_drop') {
    processReveal(room);
    room.status = 'reveal';
    broadcastRoomState(room);
    startTimer(room, REVEAL_DURATION, () => nextRound(room));
  } else if (room.status === 'reveal') {
    nextRound(room);
  }
}

export function handlePlayAgain(socketId) {
  const room = findPlayerRoom(socketId);
  if (!room || room.status !== 'results') return;
  const host = room.players.find(p => p.id === socketId && p.isHost);
  if (!host) return;
  clearTimer(room);
  room.status = 'lobby';
  room.players.forEach(p => { p.isReady = p.isHost; p.score = 0; p.lastScoreDelta = 0; });
  room.currentRound = 0;
  room.currentPrompt = null;
  room.usedWords = [];
  room.submissions = [];
  room.revealGroups = [];
  room.standings = [];
  room.chats = [];
  room.tiebreakerPlayers = [];
  room._isTiebreaker = false;
  room._tiebreakerDone = false;
  broadcastRoomState(room);
}

export function handleKickPlayer(socketId, targetId) {
  const room = findPlayerRoom(socketId);
  if (!room || room.status !== 'lobby') return;
  const host = room.players.find(p => p.id === socketId && p.isHost);
  if (!host) return;
  if (targetId === socketId) return;
  const pIndex = room.players.findIndex(p => p.id === targetId);
  if (pIndex === -1) return;
  room.players.splice(pIndex, 1);
  getIO().to(targetId).emit('room_cleared');
  getIO().sockets.sockets.get(targetId)?.leave(room.code);
  broadcastRoomState(room);
}

export function handleLeaveRoom(socketId) {
  const room = findPlayerRoom(socketId);
  if (!room) return;
  const pIndex = room.players.findIndex(p => p.id === socketId);
  if (pIndex === -1) return;
  const player = room.players[pIndex];
  room.players.splice(pIndex, 1);
  if (player.isHost && room.players.length > 0) { room.players[0].isHost = true; room.players[0].isReady = true; }
  getIO().to(socketId).emit('room_cleared');
  getIO().sockets.sockets.get(socketId)?.leave(room.code);
  if (room.players.length === 0) { clearTimer(room); rooms.delete(room.code); }
  else broadcastRoomState(room);
}

export { handleAddBots } from './botManager.js';
