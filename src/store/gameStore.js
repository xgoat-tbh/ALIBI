import { create } from 'zustand'

const initialReconstruction = {
  who: null, where: null, when: null, how: null, why: null, evidenceNotes: ''
}

export const useGameStore = create((set, get) => ({
  // Connection
  socket: null,
  isConnected: false,

  // Room
  roomCode: null,
  playerId: null,
  playerName: '',

  // Game
  status: 'lobby',
  phaseTimer: 0,
  players: [],
  board: [],
  caseData: null,
  reconstruction: { ...initialReconstruction },
  objection: { active: false, playerId: null, playerName: null },
  testimonySpeakerIdx: 0,
  lockedPlayerIds: new Set(),
  trustPoints: 0,
  highlights: [],
  spectators: [],

  // Chat
  chats: [],

  // Private hand (this client only)
  privateHand: [],
  isSaboteur: false,

  // Actions
  setSocket: (socket) => set({ socket }),
  setConnected: (isConnected) => set({ isConnected }),

  setRoomCreated: (roomCode, playerId, players) =>
    set({ roomCode, playerId, status: 'lobby', players, isSaboteur: false }),

  setJoined: (roomCode, playerId, players) =>
    set({ roomCode, playerId, status: 'lobby', players, isSaboteur: false }),

  setRoomUpdated: (data) => set((state) => {
    // Check if WE are the saboteur from the player list
    const myPlayer = (data.players || state.players).find(p => p.id === state.playerId);

    return {
      status: data.status || state.status,
      phaseTimer: data.phaseTimer ?? state.phaseTimer,
      testimonySpeakerIdx: data.testimonySpeakerIdx ?? state.testimonySpeakerIdx,
      objection: data.objection || state.objection,
      board: data.board || state.board,
      reconstruction: data.reconstruction || state.reconstruction,
      players: data.players || state.players,
      caseData: data.caseData || state.caseData,
      lockedPlayerIds: new Set(data.lockedPlayerIds || []),
      trustPoints: data.trustPoints ?? state.trustPoints,
      highlights: data.highlights || state.highlights,
      chats: data.chats || state.chats,
      spectators: data.spectators || state.spectators,
      phaseTimer: data.phaseTimer ?? state.phaseTimer,
      isSaboteur: myPlayer ? myPlayer.isSaboteur : state.isSaboteur,
    };
  }),

  setPrivateHand: (hand) => set({ privateHand: hand }),
  setSaboteur: (isSaboteur) => set({ isSaboteur }),

  addChat: (chat) => set((state) => ({ chats: [...state.chats, chat] })),

  setPlayerName: (playerName) => set({ playerName }),

  reset: () => set({
    status: 'lobby',
    phaseTimer: 0,
    players: [],
    board: [],
    caseData: null,
    reconstruction: { ...initialReconstruction },
    objection: { active: false, playerId: null, playerName: null },
    testimonySpeakerIdx: 0,
    lockedPlayerIds: new Set(),
    privateHand: [],
    chats: [],
    trustPoints: 0,
    highlights: [],
    spectators: [],
    isSaboteur: false,
  }),

  clearRoom: () => set({
    roomCode: null,
    playerId: null,
    players: [],
    board: [],
    caseData: null,
    reconstruction: { ...initialReconstruction },
    privateHand: [],
    chats: [],
    lockedPlayerIds: new Set(),
    trustPoints: 0,
    highlights: [],
    isSaboteur: false,
  }),
}))
