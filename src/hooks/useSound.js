let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function playTone(freq, duration, type = 'sine', volume = 0.08) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch {}
}

function playNoise(duration, volume = 0.03) {
  try {
    const c = getCtx();
    const bufSize = c.sampleRate * duration;
    const buf = c.createBuffer(1, bufSize, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1);
    const src = c.createBufferSource();
    src.buffer = buf;
    const gain = c.createGain();
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    src.connect(gain);
    gain.connect(c.destination);
    src.start();
  } catch {}
}

export function playJoin() {
  playTone(523, 0.15, 'sine', 0.06);
  setTimeout(() => playTone(659, 0.15, 'sine', 0.06), 100);
}

export function playLeave() {
  playTone(400, 0.2, 'sine', 0.05);
  setTimeout(() => playTone(300, 0.25, 'sine', 0.04), 120);
}

export function playReady() {
  playTone(440, 0.1, 'triangle', 0.06);
  setTimeout(() => playTone(660, 0.15, 'triangle', 0.06), 80);
}

export function playGameStart() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => setTimeout(() => playTone(f, 0.2, 'sine', 0.07), i * 120));
  setTimeout(() => playNoise(0.3, 0.04), 500);
}

export function playPhaseChange() {
  playTone(880, 0.1, 'sine', 0.05);
  setTimeout(() => playTone(1109, 0.15, 'sine', 0.05), 80);
}

export function playTimerTick() {
  playTone(1000, 0.05, 'square', 0.02);
}

export function playObjection() {
  playTone(200, 0.3, 'sawtooth', 0.08);
  setTimeout(() => playTone(180, 0.4, 'sawtooth', 0.07), 150);
}

export function playLockIn() {
  playTone(330, 0.1, 'triangle', 0.06);
  setTimeout(() => playTone(440, 0.1, 'triangle', 0.06), 80);
  setTimeout(() => playTone(554, 0.2, 'triangle', 0.06), 160);
}

export function playError() {
  playTone(180, 0.2, 'square', 0.06);
  setTimeout(() => playTone(150, 0.3, 'square', 0.05), 150);
}

export function playChat() {
  playTone(600, 0.08, 'sine', 0.04);
}

export function useSound() {
  return {
    playJoin,
    playLeave,
    playReady,
    playGameStart,
    playPhaseChange,
    playTimerTick,
    playObjection,
    playLockIn,
    playError,
    playChat
  };
}
