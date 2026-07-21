import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';

function isMuted() {
  return useUIStore.getState().isMuted;
}

export function useSoundEffects() {
  const prevStatus = useRef(null);
  const prevChatsLen = useRef(0);

  useEffect(() => {
    const unsub = useGameStore.subscribe((state) => {
      const { status, chats } = state;

      if (status !== prevStatus.current && prevStatus.current !== null && !isMuted()) {
        if (status === 'word_drop') {
          try {
            const c = new (window.AudioContext || window.webkitAudioContext)();
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.frequency.value = 660;
            gain.gain.value = 0.06;
            osc.connect(gain);
            gain.connect(c.destination);
            osc.start();
            osc.stop(c.currentTime + 0.1);
            setTimeout(() => { osc.frequency.value = 880; }, 60);
          } catch {}
        }
      }
      prevStatus.current = status;

      if (chats.length > prevChatsLen.current && !isMuted()) {
        try {
          const c = new (window.AudioContext || window.webkitAudioContext)();
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.frequency.value = 600;
          gain.gain.value = 0.04;
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start();
          osc.stop(c.currentTime + 0.08);
        } catch {}
      }
      prevChatsLen.current = chats.length;
    });

    return unsub;
  }, []);
}
