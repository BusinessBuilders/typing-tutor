import { create } from 'zustand';
import { AIProvider } from '../types';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface AppStore {
  // UI State
  isLoading: boolean;
  currentScreen: 'home' | 'profile-select' | 'learning' | 'settings' | 'progress' | 'parent-dashboard';
  showSettings: boolean;
  showPauseMenu: boolean;

  // AI Configuration
  aiProvider: AIProvider | null;
  aiApiKey: string | null;

  // Notifications
  notification: {
    message: string;
    type: NotificationType;
  } | null;

  // Actions
  setLoading: (isLoading: boolean) => void;
  setScreen: (screen: AppStore['currentScreen']) => void;
  toggleSettings: () => void;
  togglePauseMenu: () => void;

  // AI Configuration
  setAIProvider: (provider: AIProvider, apiKey: string) => void;
  clearAIProvider: () => void;

  // Notifications
  showNotification: (message: string, type: NotificationType) => void;
  hideNotification: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // Initial state
  isLoading: false,
  currentScreen: 'home',
  showSettings: false,
  showPauseMenu: false,
  aiProvider: null,
  aiApiKey: null,
  notification: null,

  // Actions
  setLoading: (isLoading) => set({ isLoading }),

  setScreen: (screen) => set({ currentScreen: screen }),

  toggleSettings: () => set((state) => ({ showSettings: !state.showSettings })),

  togglePauseMenu: () => set((state) => ({ showPauseMenu: !state.showPauseMenu })),

  setAIProvider: (provider, apiKey) =>
    set({
      aiProvider: provider,
      aiApiKey: apiKey,
    }),

  clearAIProvider: () =>
    set({
      aiProvider: null,
      aiApiKey: null,
    }),

  showNotification: (message, type) =>
    set({
      notification: { message, type },
    }),

  hideNotification: () => set({ notification: null }),
}));
