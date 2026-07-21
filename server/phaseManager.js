import { rooms, broadcastRoomState } from './roomManager.js';
import { calculateScoring } from './scoring.js';

export const PHASES = [
  'lobby', 'case_open', 'private_memory', 'opening_statements',
  'cross_talk', 'investigation', 'confidence_lock',
  'final_reconstruction', 'reveal', 'recap'
];

export function clearTimer(room) {
  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = null;
  }
}

export function startTimer(room, seconds, onEnd) {
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

export function advancePhase(room) {
  const currentIdx = PHASES.indexOf(room.status);
  if (currentIdx !== -1 && currentIdx < PHASES.length - 1) {
    transitionToPhase(room, PHASES[currentIdx + 1]);
  }
}

export function transitionToPhase(room, newPhase) {
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
