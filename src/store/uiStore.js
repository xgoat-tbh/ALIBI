import { create } from 'zustand';

export const useUIStore = create((set) => ({
  errorMsg: '',
  showChatPanel: true,
  mobileChatOpen: false,
  copied: false,
  isMuted: localStorage.getItem('alibi_muted') === 'true',

  setError: (errorMsg) => set({ errorMsg }),
  setShowChatPanel: (showChatPanel) => set({ showChatPanel }),
  setMobileChatOpen: (mobileChatOpen) => set({ mobileChatOpen }),
  setCopied: (copied) => set({ copied }),
  setMuted: (isMuted) => { localStorage.setItem('alibi_muted', isMuted); set({ isMuted }); },
}));
