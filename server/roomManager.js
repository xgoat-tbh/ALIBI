export const rooms = new Map();
let io = null;

export function setIO(instance) {
  io = instance;
}

export function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

// ─── Utilities ───

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRoomCode() {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  if (rooms.has(code)) return generateRoomCode();
  return code;
}

export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function stripHtml(s) {
  if (!s) return '';
  return s.replace(/<[^>]*>/g, '').replace(/[&<>"']/g, '');
}

export function findPlayerRoom(socketId) {
  for (const room of rooms.values()) {
    if (room.players.some(p => p.id === socketId) || room.spectators.includes(socketId)) return room;
  }
  return null;
}

// ─── Rate Limiting ───

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

// ─── Filtered State & Broadcast ───

export function getFilteredRoomState(room, playerId) {
  const isEnded = room.status === 'reveal' || room.status === 'recap';
  const inGame = room.status !== 'lobby';
  const isSpectator = room.spectators.includes(playerId);
  const player = room.players.find(p => p.id === playerId);

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
        isSaboteur: (isSelf || isEnded) ? !!p.isSaboteur : false,
        isBot: !!p.isBot,
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
  room.players.forEach(p => {
    if (room.caseData && room.caseData.playersFacts) {
      const key = `player-${p.originalIndex ?? room.players.indexOf(p)}`;
      const facts = room.caseData.playersFacts[key];
      if (facts) {
        i.to(p.id).emit('private_hand', { hand: facts });
      }
    }
  });
  // Trigger bot AI after state broadcast (lazy import to avoid cycle at module level)
  import('./botManager.js').then(({ processBots }) => processBots(room)).catch(() => {});
}
