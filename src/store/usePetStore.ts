/**
 * Pet Store
 * Manages virtual pet companion state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Pet } from '../components/PetSystem';

interface PetStore {
  pet: Pet | null;
  setPet: (pet: Pet) => void;
  updatePet: (updates: Partial<Pet>) => void;
  feedPet: () => void;
  playWithPet: () => void;
  petPet: () => void;
  restPet: () => void;
  addXP: (amount: number) => void;
  clearPet: () => void;
}

export const usePetStore = create<PetStore>()(
  persist(
    (set) => ({
      pet: null,

      setPet: (pet) => set({ pet }),

      updatePet: (updates) =>
        set((state) => ({
          pet: state.pet ? { ...state.pet, ...updates } : null,
        })),

      feedPet: () =>
        set((state) => {
          if (!state.pet) return state;
          return {
            pet: {
              ...state.pet,
              hunger: Math.min(100, state.pet.hunger + 30),
              happiness: Math.min(100, state.pet.happiness + 10),
              lastFed: new Date(),
            },
          };
        }),

      playWithPet: () =>
        set((state) => {
          if (!state.pet) return state;
          return {
            pet: {
              ...state.pet,
              happiness: Math.min(100, state.pet.happiness + 20),
              energy: Math.max(0, state.pet.energy - 15),
              lastPlayed: new Date(),
            },
          };
        }),

      petPet: () =>
        set((state) => {
          if (!state.pet) return state;
          return {
            pet: {
              ...state.pet,
              happiness: Math.min(100, state.pet.happiness + 15),
              lastPetted: new Date(),
            },
          };
        }),

      restPet: () =>
        set((state) => {
          if (!state.pet) return state;
          return {
            pet: {
              ...state.pet,
              energy: Math.min(100, state.pet.energy + 40),
            },
          };
        }),

      addXP: (amount) =>
        set((state) => {
          if (!state.pet) return state;
          const newXP = state.pet.xp + amount;
          const newLevel = Math.floor(newXP / 100) + 1;
          return {
            pet: {
              ...state.pet,
              xp: newXP,
              level: newLevel,
              happiness: Math.min(100, state.pet.happiness + 5),
            },
          };
        }),

      clearPet: () => set({ pet: null }),
    }),
    {
      name: 'pet-storage',
    }
  )
);

/**
 * Hook to create a new pet
 */
export function useCreatePet() {
  const setPet = usePetStore((state) => state.setPet);

  return (type: Pet['type'], name: string, color: string) => {
    const emojis: Record<Pet['type'], string> = {
      cat: '🐱',
      dog: '🐶',
      rabbit: '🐰',
      bird: '🐦',
      dragon: '🐲',
      fox: '🦊',
    };

    const newPet: Pet = {
      id: crypto.randomUUID(),
      name,
      type,
      emoji: emojis[type],
      level: 1,
      xp: 0,
      happiness: 80,
      hunger: 70,
      energy: 100,
      age: 0,
      evolutionStage: 'baby',
      color,
      createdAt: new Date(),
    };

    setPet(newPet);
    return newPet;
  };
}

export default usePetStore;
