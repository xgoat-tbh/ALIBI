import { create } from 'zustand';

export const useUIStore = create((set) => ({
  errorMsg: '',
  showChatPanel: true,
  mobileChatOpen: false,

  setError: (errorMsg) => set({ errorMsg }),
  setShowChatPanel: (showChatPanel) => set({ showChatPanel }),
  setMobileChatOpen: (mobileChatOpen) => set({ mobileChatOpen }),
}));
