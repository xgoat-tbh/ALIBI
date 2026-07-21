# ALIBI

A real-time multiplayer deception & deduction game. Players receive private facts, build a shared investigation board, challenge contradictions, and reconstruct the case file — all in a live browser session.

## Tech Stack

- **Frontend:** React + Vite, Zustand (state), Socket.IO client, react-router-dom
- **Backend:** Node.js, Socket.IO server, Express
- **Deploy:** Render (backend), Vercel (frontend)

## Getting Started

```bash
git clone <repo>
cd ALIBI
npm install
npm run dev       # starts Vite dev server (port 5173)
npm run server    # starts backend (port 3001)
```

## Project Structure

```
src/
  pages/         LandingPage, GamePage
  components/    Lobby, InvestigationBoard, ConfidenceLock, etc.
  hooks/         useSocket, useSound, useSoundEffects, useMediaQuery
  store/         gameStore (game state), uiStore (UI state)
server/
  game.js        Event handler orchestrator
  roomManager.js Room state, broadcast, rate limiting
  phaseManager.js Timers, phase transitions
  scoring.js     Fuzzy-match scoring, stake highlights
```

## Environment Variables

- `VITE_SOCKET_URL` — Backend URL for production. Falls back to `window.location.origin`.
