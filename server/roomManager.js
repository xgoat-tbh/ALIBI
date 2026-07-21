export const rooms = new Map();
let io = null;

export function setIO(instance) {
  io = instance;
}

export function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRoomCode() {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  if (rooms.has(code)) return generateRoomCode();
  return code;
}

export function stripHtml(s) {
  if (!s) return '';
  return s.replace(/<[^>]*>/g, '').replace(/[&<>"']/g, '');
}

export function findPlayerRoom(socketId) {
  for (const room of rooms.values()) {
    if (room.players.some(p => p.id === socketId)) return room;
  }
  return null;
}

const rateLimitMap = new Map();

export function checkRateLimit(key, maxAttempts, windowMs) {
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

export function getFilteredRoomState(room, playerId) {
  return {
    code: room.code,
    status: room.status,
    phaseTimer: room.phaseTimer,
    chats: room.chats.slice(-100),
    players: room.players.map(p => {
      const isSelf = p.id === playerId;
      const isTiebreakerPlayer = room.tiebreakerPlayers?.includes(p.id);
      return {
        id: p.id,
        name: p.name,
        score: p.score,
        isHost: p.isHost,
        isBot: !!p.isBot,
        isReady: p.isReady,
        lastScoreDelta: p.lastScoreDelta,
        isTiebreakerPlayer: !!isTiebreakerPlayer,
        mySubmission: isSelf ? room.submissions?.find(s => s.playerId === p.id)?.word || '' : undefined
      };
    }),
    currentPrompt: room.currentPrompt,
    currentRound: room.currentRound,
    totalRounds: 8,
    revealGroups: room.revealGroups,
    standings: room.standings,
    tiebreakerPlayers: room.tiebreakerPlayers || [],
    spectators: []
  };
}

export function broadcastRoomState(room) {
  const i = getIO();
  room.players.forEach(p => {
    i.to(p.id).emit('room_updated', getFilteredRoomState(room, p.id));
  });
}
