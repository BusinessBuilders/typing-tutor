import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSettings } from '../types';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../utils/constants';

interface SettingsStore {
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS as UserSettings,

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      resetSettings: () =>
        set({ settings: DEFAULT_SETTINGS as UserSettings }),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
    }
  )
);
