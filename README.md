# LINKED

A real-time multiplayer word association party game. A word appears. You type the first word that comes to mind. See who matched — and who went solo.

## Tech Stack

- **Frontend:** React + Vite, Zustand (state), Socket.IO client, react-router-dom
- **Backend:** Node.js, Socket.IO server, Express
- **Deploy:** Render (backend + frontend)

## Getting Started

```bash
git clone <repo>
cd ALIBI
npm install
npm run dev       # starts Vite dev server (port 5173) + backend (port 3001)
```

## Project Structure

```
src/
  pages/         LandingPage, GamePage
  components/    Lobby, LinkedDrop, LinkedReveal, LinkedResults, ChatSidebar
  hooks/         useSocket, useMediaQuery
  store/         gameStore (game state), uiStore (UI state)
server/
  linkedGame.js  Event handler orchestrator
  linkedWords.js Word bank
  botManager.js  Bot AI
  roomManager.js Room state, broadcast, rate limiting
  server.js      Socket.io/Express entry
```

## Environment Variables

- `VITE_SOCKET_URL` — Backend URL for production. Falls back to `window.location.origin`.
