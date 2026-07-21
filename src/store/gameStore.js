import { create } from 'zustand'

export const useGameStore = create((set, get) => ({
  socket: null,
  isConnected: false,

  roomCode: null,
  playerId: null,
  playerName: '',

  // Game
  status: 'lobby',
  phaseTimer: 0,
  players: [],
  spectators: [],
  chats: [],

  // LINKED-specific
  currentPrompt: null,
  currentRound: 0,
  totalRounds: 8,
  mySubmission: '',
  revealGroups: [],
  standings: [],

  // Actions
  setSocket: (socket) => set({ socket }),
  setConnected: (isConnected) => set({ isConnected }),

  setRoomCreated: (roomCode, playerId, players) =>
    set({ roomCode, playerId, status: 'lobby', players }),

  setJoined: (roomCode, playerId, players) =>
    set({ roomCode, playerId, status: 'lobby', players }),

  setMySubmission: (mySubmission) => set({ mySubmission }),

  setRoomUpdated: (data) => set((state) => ({
    status: data.status || state.status,
    phaseTimer: data.phaseTimer ?? state.phaseTimer,
    players: data.players || state.players,
    chats: data.chats || state.chats,
    spectators: data.spectators || state.spectators,
    currentPrompt: data.currentPrompt !== undefined ? data.currentPrompt : state.currentPrompt,
    currentRound: data.currentRound !== undefined ? data.currentRound : state.currentRound,
    totalRounds: data.totalRounds || state.totalRounds,
    revealGroups: data.revealGroups || state.revealGroups,
    standings: data.standings || state.standings,
  })),

  addChat: (chat) => set((state) => ({ chats: [...state.chats, chat] })),
  setPlayerName: (playerName) => set({ playerName }),

  reset: () => set({
    status: 'lobby', phaseTimer: 0, players: [], chats: [],
    spectators: [], currentPrompt: null, currentRound: 0,
    revealGroups: [], standings: [], mySubmission: '',
  }),

  clearRoom: () => set({
    roomCode: null, playerId: null, players: [], chats: [],
    spectators: [], currentPrompt: null, currentRound: 0,
    revealGroups: [], standings: [], mySubmission: '',
  }),
}))
