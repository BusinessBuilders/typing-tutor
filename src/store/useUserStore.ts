import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '../types';
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../utils/constants';

interface UserStore {
  currentUser: UserProfile | null;
  setUser: (user: UserProfile) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  clearUser: () => void;
  isAuthenticated: boolean;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          currentUser: user,
          isAuthenticated: true,
        }),

      updateUser: (updates) =>
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, ...updates }
            : null,
        })),

      clearUser: () =>
        set({
          currentUser: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: STORAGE_KEYS.USER_PROFILE,
    }
  )
);

// Helper function to create a new user profile
export const createUserProfile = (name: string, age?: number): UserProfile => ({
  id: crypto.randomUUID(),
  name,
  age,
  createdAt: new Date(),
  settings: DEFAULT_SETTINGS as UserProfile['settings'],
});
