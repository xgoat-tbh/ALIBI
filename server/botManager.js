import { rooms, broadcastRoomState, findPlayerRoom } from './roomManager.js';
import { transitionToPhase } from './phaseManager.js';
import { THEMES } from './caseGenerator.js';

const BOT_DELAY_MIN = 300;
const BOT_DELAY_MAX = 1000;
const REASONS = [
  'Matches my memory fragment.',
  'Consistent with the timeline.',
  'Cross-referenced with other accounts.',
  'Seems plausible given the evidence.',
  'Fits the pattern of events.',
  'Corroborated by multiple sources.'
];

function randDelay(room) {
  return new Promise(r => setTimeout(r, BOT_DELAY_MIN + Math.random() * (BOT_DELAY_MAX - BOT_DELAY_MIN)));
}

function getBotFacts(room, botId) {
  const idx = room.players.findIndex(p => p.id === botId);
  if (idx < 0) return [];
  return room.caseData?.playersFacts?.[`player-${idx}`] || [];
}

async function botReadyUp(playerId) {
  const room = findPlayerRoom(playerId);
  if (!room || room.status !== 'lobby') return;
  const player = room.players.find(p => p.id === playerId);
  if (!player || player.isReady) return;
  await randDelay(room);
  player.isReady = true;
  broadcastRoomState(room);
}

async function botPlaceCard(playerId) {
  const room = findPlayerRoom(playerId);
  if (!room || room.status !== 'investigation') return;
  const player = room.players.find(p => p.id === playerId);
  if (!player) return;
  await randDelay(room);

  const facts = getBotFacts(room, playerId);
  if (facts.length === 0) return;

  const placedIds = room.board.filter(i => i.placerId === playerId).map(i => i.factId);
  const available = facts.filter(f => !placedIds.includes(f.id));
  if (available.length === 0) return;

  const fact = available[Math.floor(Math.random() * available.length)];
  const categories = ['who', 'where', 'when', 'how', 'why', 'evidence'];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const because = REASONS[Math.floor(Math.random() * REASONS.length)];
  const text = (fact?.text || '').trim();
  if (!text || text.length > 500) return;

  room.board.push({
    id: `board-item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    factId: fact.id,
    text,
    category,
    placerId: player.id,
    placerName: player.name,
    because,
    challenged: false,
    challengeText: null,
    challengeStatus: null,
    isConflict: false
  });
  broadcastRoomState(room);
}

async function botLockConfidence(playerId) {
  const room = findPlayerRoom(playerId);
  if (!room || room.status !== 'confidence_lock') return;
  const player = room.players.find(p => p.id === playerId);
  if (!player || player.currentLock) return;
  await randDelay(room);

  const facts = getBotFacts(room, playerId);
  if (facts.length === 0) return;

  const r = Math.random();
  const stake = r < 0.4 ? 'Hunch' : r < 0.8 ? 'Confident' : 'Certain';
  const fact = facts[Math.floor(Math.random() * facts.length)];

  const playerIdx = player.originalIndex ?? room.players.indexOf(player);
  const assignedFacts = room.caseData?.playersFacts?.[`player-${playerIdx}`];
  const serverFact = assignedFacts?.find(f => f.id === fact.id);
  if (!serverFact) return;

  player.currentLock = serverFact;
  player.currentStake = stake;
  room.lockedPlayerIds.add(player.id);
  broadcastRoomState(room);

  const allLocked = room.players.every(p => p.currentLock !== null);
  if (allLocked) {
    setTimeout(() => transitionToPhase(room, 'final_reconstruction'), 1000);
  }
}

async function botUpdateReconstruction(playerId) {
  const room = findPlayerRoom(playerId);
  if (!room || room.status !== 'final_reconstruction') return;
  await randDelay(room);

  const gt = room.caseData?.groundTruth;
  if (!gt) return;

  const player = room.players.find(p => p.id === playerId);
  const isSaboteur = player?.isSaboteur;
  const themeId = room.caseData?.themeId;

  const fields = ['who', 'where', 'when', 'how', 'why'];
  let needsUpdate = false;

  for (const field of fields) {
    if (!room.reconstruction[field]) {
      const truth = gt[field];
      if (isSaboteur) {
        const themeData = THEMES[themeId];
        const options = themeData?.[field] || [];
        const wrong = options.filter(o => o !== truth);
        room.reconstruction[field] = wrong.length > 0
          ? wrong[Math.floor(Math.random() * wrong.length)]
          : `Wrong ${field}`;
      } else {
        room.reconstruction[field] = truth;
      }
      needsUpdate = true;
    }
  }

  if (!room.reconstruction.evidenceNotes) {
    room.reconstruction.evidenceNotes = isSaboteur
      ? 'Our analysis suggests this is a dead end.'
      : 'The evidence clearly supports the above conclusion.';
    needsUpdate = true;
  }

  if (needsUpdate) broadcastRoomState(room);
}

export async function processBots(room) {
  if (!room) return;
  const bots = room.players.filter(p => p.isBot);
  if (bots.length === 0) return;

  switch (room.status) {
    case 'lobby':
      for (const bot of bots) {
        if (!bot.isReady) botReadyUp(bot.id);
      }
      break;
    case 'investigation':
      for (const bot of bots) {
        botPlaceCard(bot.id);
      }
      break;
    case 'confidence_lock':
      for (const bot of bots) {
        if (!bot.currentLock) botLockConfidence(bot.id);
      }
      break;
    case 'final_reconstruction':
      for (const bot of bots) {
        botUpdateReconstruction(bot.id);
      }
      break;
  }
}

export function createBotPlayer(room, name) {
  const botId = `bot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const player = {
    id: botId,
    name,
    isHost: false,
    isReady: false,
    isBot: true,
    isSaboteur: false,
    isMuted: false,
    score: 0,
    detectiveRating: 1000,
    currentLock: null,
    currentStake: null,
    lastScoreDelta: 0,
    eliminated: false,
    originalIndex: room.players.length
  };
  room.players.push(player);
  return player;
}

export function handleAddBots(socketId, count = 1) {
  const room = findPlayerRoom(socketId);
  if (!room || room.status !== 'lobby') return;
  const host = room.players.find(p => p.id === socketId && p.isHost);
  if (!host) return;

  const botNames = [
    'Agent Smith', 'Detective Noir', 'Inspector Rex',
    'Officer Chen', 'Specialist Vega', 'Analyst Frost',
    'Captain Drake', 'Sergeant Blake', 'Coroner Miles',
    'Prof. Hawthorne', 'Agent Delta', 'Detective Cross'
  ];

  const existingNames = room.players.map(p => p.name);
  const available = botNames.filter(n => !existingNames.includes(n));

  const toAdd = Math.min(count, 10 - room.players.length, available.length);
  for (let i = 0; i < toAdd; i++) {
    const name = available[i] || `Bot-${i + 1}`;
    const bot = createBotPlayer(room, name);
    bot.isReady = true;
  }

  broadcastRoomState(room);
  processBots(room);
}
