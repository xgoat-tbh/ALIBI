import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import {
  playJoin, playLeave, playReady, playGameStart, playPhaseChange,
  playTimerTick, playObjection, playLockIn, playError, playChat
} from './useSound';

function isMuted() {
  return useUIStore.getState().isMuted;
}

function playIf(playFn) {
  if (!isMuted()) playFn();
}

export function useSoundEffects() {
  const prevPlayersLen = useRef(0);
  const prevStatus = useRef(null);
  const prevTimer = useRef(0);
  const prevObjectionActive = useRef(false);
  const prevLockedCount = useRef(0);
  const prevErrorMsg = useRef('');
  const prevChatsLen = useRef(0);

  useEffect(() => {
    const unsub = useGameStore.subscribe((state) => {
      const { status, players, phaseTimer, objection, lockedPlayerIds } = state;

      if (status !== prevStatus.current && prevStatus.current !== null) {
        if (status === 'case_open') playIf(playGameStart);
        else if (status !== 'lobby') playIf(playPhaseChange);
      }
      prevStatus.current = status;

      if (players.length > prevPlayersLen.current && prevPlayersLen.current > 0) playIf(playJoin);
      if (players.length < prevPlayersLen.current) playIf(playLeave);
      prevPlayersLen.current = players.length;

      if (phaseTimer > 0 && phaseTimer <= 5 && prevTimer.current > 5) playIf(playTimerTick);
      prevTimer.current = phaseTimer;

      if (objection?.active && !prevObjectionActive.current) playIf(playObjection);
      prevObjectionActive.current = !!objection?.active;

      const lockCount = lockedPlayerIds.size;
      if (lockCount > prevLockedCount.current) playIf(playLockIn);
      prevLockedCount.current = lockCount;
    });

    const unsubUi = useUIStore.subscribe((state) => {
      if (state.errorMsg && state.errorMsg !== prevErrorMsg.current) playIf(playError);
      prevErrorMsg.current = state.errorMsg;
    });

    return () => { unsub(); unsubUi(); };
  }, []);

  useEffect(() => {
    const unsub = useGameStore.subscribe((state) => {
      if (state.chats.length > prevChatsLen.current) playIf(playChat);
      prevChatsLen.current = state.chats.length;
    });
    return unsub;
  }, []);
}
