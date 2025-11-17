import { create } from 'zustand';
import { TypingSession, Exercise, LearningLevel } from '../types';

interface SessionStore {
  currentSession: TypingSession | null;
  currentExercise: Exercise | null;
  isSessionActive: boolean;

  // Session actions
  startSession: (userId: string, level: LearningLevel) => void;
  endSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;

  // Exercise actions
  setCurrentExercise: (exercise: Exercise) => void;
  completeExercise: () => void;
  recordMistake: (mistake: string) => void;

  // Stats
  updateStats: (stats: Partial<Pick<TypingSession, 'accuracy' | 'wordsPerMinute'>>) => void;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  currentSession: null,
  currentExercise: null,
  isSessionActive: false,

  startSession: (userId, level) => {
    const session: TypingSession = {
      id: crypto.randomUUID(),
      userId,
      startTime: new Date(),
      level,
      exercises: [],
      totalWords: 0,
      correctWords: 0,
      accuracy: 100,
      wordsPerMinute: 0,
    };

    set({
      currentSession: session,
      isSessionActive: true,
    });
  },

  endSession: () => {
    const session = get().currentSession;
    if (session) {
      set({
        currentSession: { ...session, endTime: new Date() },
        isSessionActive: false,
        currentExercise: null,
      });
    }
  },

  pauseSession: () => {
    set({ isSessionActive: false });
  },

  resumeSession: () => {
    set({ isSessionActive: true });
  },

  setCurrentExercise: (exercise) => {
    set({ currentExercise: exercise });
  },

  completeExercise: () => {
    const { currentSession, currentExercise } = get();

    if (currentSession && currentExercise) {
      const updatedExercise = { ...currentExercise, completed: true };
      const updatedExercises = [...currentSession.exercises, updatedExercise];

      set({
        currentSession: {
          ...currentSession,
          exercises: updatedExercises,
        },
        currentExercise: null,
      });
    }
  },

  recordMistake: (mistake) => {
    const exercise = get().currentExercise;
    if (exercise) {
      set({
        currentExercise: {
          ...exercise,
          mistakes: [...exercise.mistakes, mistake],
        },
      });
    }
  },

  updateStats: (stats) => {
    const session = get().currentSession;
    if (session) {
      set({
        currentSession: { ...session, ...stats },
      });
    }
  },
}));
