import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * Step 294: Build Confidence Exercises
 *
 * Provides specialized exercises designed to build typing confidence
 * through progressive difficulty, success-oriented challenges, and
 * supportive practice environments.
 *
 * Features:
 * - Progressive difficulty levels
 * - Success-guaranteed starter exercises
 * - Comfort zone expansion activities
 * - Fear reduction exercises
 * - Performance anxiety management
 * - Skill-building challenges
 * - Confidence tracking
 * - Personal best celebrations
 */

export type ExerciseType =
  | 'starter'
  | 'comfort'
  | 'stretch'
  | 'mastery'
  | 'challenge'
  | 'review';

export type DifficultyLevel =
  | 'very-easy'
  | 'easy'
  | 'moderate'
  | 'challenging'
  | 'advanced';

export type ConfidenceArea =
  | 'speed'
  | 'accuracy'
  | 'consistency'
  | 'endurance'
  | 'vocabulary'
  | 'punctuation';

export interface ConfidenceExercise {
  id: string;
  title: string;
  description: string;
  type: ExerciseType;
  difficulty: DifficultyLevel;
  area: ConfidenceArea;
  duration: number; // minutes
  content: string;
  successCriteria: {
    minWPM?: number;
    minAccuracy?: number;
    minCompletion?: number; // percentage
  };
  tips: string[];
  encouragement: string;
  icon: string;
  estimatedConfidenceGain: number; // 0-100
}

export interface ExerciseSession {
  id: string;
  exerciseId: string;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  wpm: number;
  accuracy: number;
  completion: number;
  success: boolean;
  confidenceGain: number;
  attempts: number;
}

export interface ConfidenceProfile {
  currentLevel: number; // 0-100
  strengthAreas: ConfidenceArea[];
  improvementAreas: ConfidenceArea[];
  totalExercisesCompleted: number;
  successRate: number; // percentage
  averageConfidenceGain: number;
  preferredDifficulty: DifficultyLevel;
  recommendedExercises: string[];
}

export interface ConfidenceSettings {
  enableProgressiveUnlock: boolean;
  requireSuccessToAdvance: boolean;
  allowRetry: boolean;
  maxAttempts: number;
  showEncouragement: boolean;
  celebrateSuccess: boolean;
  trackPersonalBests: boolean;
  adaptiveDifficulty: boolean;
  startWithEasyExercises: boolean;
  focusOnStrengths: boolean;
}

const confidenceExercises: ConfidenceExercise[] = [
  {
    id: 'starter-homerow',
    title: 'Home Row Mastery',
    description: 'Build confidence with the foundation keys',
    type: 'starter',
    difficulty: 'very-easy',
    area: 'consistency',
    duration: 3,
    content: 'asdf jkl; asdf jkl; sad lad fad jad has gas',
    successCriteria: {
      minWPM: 10,
      minAccuracy: 80,
      minCompletion: 50,
    },
    tips: [
      'Keep fingers on home row',
      'Look at the screen, not your hands',
      'Maintain a steady rhythm',
    ],
    encouragement: 'Perfect for building muscle memory!',
    icon: '🏠',
    estimatedConfidenceGain: 15,
  },
  {
    id: 'starter-simple-words',
    title: 'Simple Words',
    description: 'Easy common words to build fluency',
    type: 'starter',
    difficulty: 'very-easy',
    area: 'vocabulary',
    duration: 5,
    content: 'the and for you can all not but has had his was one our out day get',
    successCriteria: {
      minWPM: 15,
      minAccuracy: 85,
      minCompletion: 60,
    },
    tips: [
      'These are the most common words',
      'Take your time',
      'Focus on accuracy first',
    ],
    encouragement: 'You\'re learning the building blocks!',
    icon: '📝',
    estimatedConfidenceGain: 20,
  },
  {
    id: 'comfort-short-sentences',
    title: 'Short Sentences',
    description: 'Build confidence with complete thoughts',
    type: 'comfort',
    difficulty: 'easy',
    area: 'consistency',
    duration: 5,
    content: 'I can type well. This is easy. I am learning. Practice makes progress.',
    successCriteria: {
      minWPM: 20,
      minAccuracy: 88,
      minCompletion: 70,
    },
    tips: [
      'Read ahead to the next word',
      'Type in word chunks, not letters',
      'Pause briefly between sentences',
    ],
    encouragement: 'Sentences make typing meaningful!',
    icon: '💬',
    estimatedConfidenceGain: 25,
  },
  {
    id: 'comfort-positive-affirmations',
    title: 'Positive Affirmations',
    description: 'Type encouraging messages about yourself',
    type: 'comfort',
    difficulty: 'easy',
    area: 'vocabulary',
    duration: 5,
    content: 'I am capable. I am improving. I trust my abilities. I learn from mistakes. I celebrate progress.',
    successCriteria: {
      minWPM: 20,
      minAccuracy: 85,
      minCompletion: 75,
    },
    tips: [
      'Focus on the positive message',
      'Type with intention',
      'Believe what you type',
    ],
    encouragement: 'Positive thoughts create positive results!',
    icon: '💙',
    estimatedConfidenceGain: 30,
  },
  {
    id: 'stretch-numbers-symbols',
    title: 'Numbers & Symbols',
    description: 'Expand your comfort zone with special characters',
    type: 'stretch',
    difficulty: 'moderate',
    area: 'punctuation',
    duration: 5,
    content: '123 456 789 0. Email: user@example.com. Price: $99.99. Time: 3:30pm.',
    successCriteria: {
      minWPM: 18,
      minAccuracy: 82,
      minCompletion: 65,
    },
    tips: [
      'Take your time with symbols',
      'Practice shift key combinations',
      'Numbers require different fingers',
    ],
    encouragement: 'You\'re expanding your skills!',
    icon: '🔢',
    estimatedConfidenceGain: 35,
  },
  {
    id: 'stretch-longer-paragraphs',
    title: 'Longer Paragraphs',
    description: 'Build endurance with extended typing',
    type: 'stretch',
    difficulty: 'moderate',
    area: 'endurance',
    duration: 7,
    content: 'Learning to type is a journey of small steps. Each practice session builds your skills. Mistakes are opportunities to learn. Progress may feel slow, but it is happening. Trust the process and celebrate every improvement.',
    successCriteria: {
      minWPM: 25,
      minAccuracy: 88,
      minCompletion: 80,
    },
    tips: [
      'Maintain consistent pace throughout',
      'Take a breath between sentences',
      'Don\'t rush at the end',
    ],
    encouragement: 'Endurance builds with practice!',
    icon: '📖',
    estimatedConfidenceGain: 40,
  },
  {
    id: 'mastery-speed-burst',
    title: 'Speed Burst',
    description: 'Push your speed while maintaining control',
    type: 'mastery',
    difficulty: 'challenging',
    area: 'speed',
    duration: 3,
    content: 'quick brown fox jumps over lazy dog the fast cat ran up the tall tree',
    successCriteria: {
      minWPM: 35,
      minAccuracy: 90,
      minCompletion: 85,
    },
    tips: [
      'Type as fast as you can control',
      'Don\'t sacrifice too much accuracy',
      'Build speed gradually',
    ],
    encouragement: 'Feel your speed improving!',
    icon: '⚡',
    estimatedConfidenceGain: 45,
  },
  {
    id: 'mastery-accuracy-focus',
    title: 'Accuracy Focus',
    description: 'Perfect your precision with challenging text',
    type: 'mastery',
    difficulty: 'challenging',
    area: 'accuracy',
    duration: 5,
    content: 'Precisely typed text demonstrates careful attention to detail. Every character matters when pursuing perfection.',
    successCriteria: {
      minWPM: 25,
      minAccuracy: 95,
      minCompletion: 90,
    },
    tips: [
      'Slow down for accuracy',
      'Double-check before pressing keys',
      'Quality over quantity',
    ],
    encouragement: 'Precision is a valuable skill!',
    icon: '🎯',
    estimatedConfidenceGain: 50,
  },
  {
    id: 'challenge-speed-accuracy-balance',
    title: 'Speed & Accuracy Balance',
    description: 'Master the balance between speed and precision',
    type: 'challenge',
    difficulty: 'advanced',
    area: 'consistency',
    duration: 7,
    content: 'The skilled typist finds harmony between speed and accuracy, maintaining consistent performance across varied content and challenging conditions.',
    successCriteria: {
      minWPM: 40,
      minAccuracy: 93,
      minCompletion: 95,
    },
    tips: [
      'Find your optimal balance point',
      'Maintain rhythm throughout',
      'Stay relaxed and focused',
    ],
    encouragement: 'You\'re approaching mastery!',
    icon: '⚖️',
    estimatedConfidenceGain: 60,
  },
  {
    id: 'review-favorites',
    title: 'Review Your Strengths',
    description: 'Revisit exercises you\'ve mastered',
    type: 'review',
    difficulty: 'easy',
    area: 'consistency',
    duration: 5,
    content: 'I am capable and improving. Practice builds confidence. I celebrate my progress.',
    successCriteria: {
      minWPM: 20,
      minAccuracy: 85,
      minCompletion: 70,
    },
    tips: [
      'Enjoy exercises you know well',
      'Notice your improvement',
      'Build on your success',
    ],
    encouragement: 'Celebrate how far you\'ve come!',
    icon: '⭐',
    estimatedConfidenceGain: 25,
  },
];

const defaultSettings: ConfidenceSettings = {
  enableProgressiveUnlock: true,
  requireSuccessToAdvance: false,
  allowRetry: true,
  maxAttempts: 3,
  showEncouragement: true,
  celebrateSuccess: true,
  trackPersonalBests: true,
  adaptiveDifficulty: true,
  startWithEasyExercises: true,
  focusOnStrengths: false,
};

export const useConfidenceExercises = () => {
  const [settings, setSettings] = useState<ConfidenceSettings>(defaultSettings);
  const [sessions, setSessions] = useState<ExerciseSession[]>([]);
  const [currentExercise, setCurrentExercise] = useState<ConfidenceExercise | null>(null);
  const [profile, setProfile] = useState<ConfidenceProfile>({
    currentLevel: 50,
    strengthAreas: [],
    improvementAreas: ['speed', 'accuracy'],
    totalExercisesCompleted: 0,
    successRate: 0,
    averageConfidenceGain: 0,
    preferredDifficulty: 'easy',
    recommendedExercises: ['starter-homerow', 'starter-simple-words'],
  });

  const getExercisesByType = useCallback((type: ExerciseType) => {
    return confidenceExercises.filter((ex) => ex.type === type);
  }, []);

  const getExercisesByDifficulty = useCallback((difficulty: DifficultyLevel) => {
    return confidenceExercises.filter((ex) => ex.difficulty === difficulty);
  }, []);

  const getExercisesByArea = useCallback((area: ConfidenceArea) => {
    return confidenceExercises.filter((ex) => ex.area === area);
  }, []);

  const getRecommendedExercises = useCallback((): ConfidenceExercise[] => {
    // Start with easy exercises for beginners
    if (profile.totalExercisesCompleted < 5) {
      return confidenceExercises.filter(
        (ex) => ex.difficulty === 'very-easy' || ex.difficulty === 'easy'
      );
    }

    // Focus on improvement areas
    const improvementExercises = confidenceExercises.filter(
      (ex) => profile.improvementAreas.includes(ex.area)
    );

    // Mix in some strength exercises for confidence
    const strengthExercises = confidenceExercises.filter(
      (ex) => profile.strengthAreas.includes(ex.area)
    );

    return [...improvementExercises.slice(0, 3), ...strengthExercises.slice(0, 2)];
  }, [profile]);

  const startExercise = useCallback((exerciseId: string) => {
    const exercise = confidenceExercises.find((ex) => ex.id === exerciseId);
    if (exercise) {
      setCurrentExercise(exercise);
    }
  }, []);

  const completeExercise = useCallback(
    (exerciseId: string, wpm: number, accuracy: number, completion: number) => {
      const exercise = confidenceExercises.find((ex) => ex.id === exerciseId);
      if (!exercise) return;

      const success =
        (exercise.successCriteria.minWPM ? wpm >= exercise.successCriteria.minWPM : true) &&
        (exercise.successCriteria.minAccuracy ? accuracy >= exercise.successCriteria.minAccuracy : true) &&
        (exercise.successCriteria.minCompletion ? completion >= exercise.successCriteria.minCompletion : true);

      const confidenceGain = success
        ? exercise.estimatedConfidenceGain
        : exercise.estimatedConfidenceGain * 0.5;

      const session: ExerciseSession = {
        id: `session-${Date.now()}`,
        exerciseId,
        startTime: new Date(),
        endTime: new Date(),
        completed: true,
        wpm,
        accuracy,
        completion,
        success,
        confidenceGain,
        attempts: 1,
      };

      setSessions((prev) => [...prev, session]);
      setCurrentExercise(null);

      // Update profile
      updateProfile(session);

      return session;
    },
    []
  );

  const updateProfile = useCallback(
    (session: ExerciseSession) => {
      const completedSessions = [...sessions, session].filter((s) => s.completed);
      const successfulSessions = completedSessions.filter((s) => s.success);

      const successRate =
        completedSessions.length > 0
          ? (successfulSessions.length / completedSessions.length) * 100
          : 0;

      const averageConfidenceGain =
        completedSessions.length > 0
          ? completedSessions.reduce((sum, s) => sum + s.confidenceGain, 0) /
            completedSessions.length
          : 0;

      const totalConfidenceGain = completedSessions.reduce(
        (sum, s) => sum + s.confidenceGain,
        0
      );
      const currentLevel = Math.min(100, 50 + totalConfidenceGain / 10);

      // Determine strength and improvement areas
      const areaStats = new Map<ConfidenceArea, { success: number; total: number }>();

      completedSessions.forEach((s) => {
        const exercise = confidenceExercises.find((ex) => ex.id === s.exerciseId);
        if (exercise) {
          const current = areaStats.get(exercise.area) || { success: 0, total: 0 };
          areaStats.set(exercise.area, {
            success: current.success + (s.success ? 1 : 0),
            total: current.total + 1,
          });
        }
      });

      const strengthAreas: ConfidenceArea[] = [];
      const improvementAreas: ConfidenceArea[] = [];

      areaStats.forEach((stats, area) => {
        const rate = stats.success / stats.total;
        if (rate >= 0.8) {
          strengthAreas.push(area);
        } else if (rate < 0.6) {
          improvementAreas.push(area);
        }
      });

      setProfile({
        currentLevel,
        strengthAreas,
        improvementAreas,
        totalExercisesCompleted: completedSessions.length,
        successRate,
        averageConfidenceGain,
        preferredDifficulty: successRate >= 80 ? 'moderate' : 'easy',
        recommendedExercises: [],
      });
    },
    [sessions]
  );

  const retryExercise = useCallback((exerciseId: string) => {
    startExercise(exerciseId);
  }, [startExercise]);

  const updateSettings = useCallback((updates: Partial<ConfidenceSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetProgress = useCallback(() => {
    setSessions([]);
    setProfile({
      currentLevel: 50,
      strengthAreas: [],
      improvementAreas: ['speed', 'accuracy'],
      totalExercisesCompleted: 0,
      successRate: 0,
      averageConfidenceGain: 0,
      preferredDifficulty: 'easy',
      recommendedExercises: ['starter-homerow', 'starter-simple-words'],
    });
  }, []);

  const getPersonalBest = useCallback(
    (exerciseId: string): ExerciseSession | null => {
      const exerciseSessions = sessions.filter((s) => s.exerciseId === exerciseId);
      if (exerciseSessions.length === 0) return null;

      return exerciseSessions.reduce((best, current) => {
        const bestScore = best.wpm * (best.accuracy / 100);
        const currentScore = current.wpm * (current.accuracy / 100);
        return currentScore > bestScore ? current : best;
      });
    },
    [sessions]
  );

  return {
    settings,
    updateSettings,
    exercises: confidenceExercises,
    currentExercise,
    sessions,
    profile,
    getExercisesByType,
    getExercisesByDifficulty,
    getExercisesByArea,
    getRecommendedExercises,
    startExercise,
    completeExercise,
    retryExercise,
    getPersonalBest,
    resetProgress,
  };
};

interface ConfidenceExercisesControlsProps {
  confidenceExercises: ReturnType<typeof useConfidenceExercises>;
}

export const ConfidenceExercisesControls: React.FC<
  ConfidenceExercisesControlsProps
> = ({ confidenceExercises: ce }) => {
  const {
    settings,
    updateSettings,
    profile,
    getExercisesByType,
    getRecommendedExercises,
    startExercise,
    completeExercise,
  } = ce;

  const [selectedType, setSelectedType] = useState<ExerciseType>('starter');

  const getConfidenceLevelColor = (level: number): string => {
    if (level >= 80) return '#4caf50';
    if (level >= 60) return '#8bc34a';
    if (level >= 40) return '#ff9800';
    return '#f44336';
  };

  const getDifficultyColor = (difficulty: DifficultyLevel): string => {
    switch (difficulty) {
      case 'very-easy':
        return '#4caf50';
      case 'easy':
        return '#8bc34a';
      case 'moderate':
        return '#ff9800';
      case 'challenging':
        return '#ff5722';
      case 'advanced':
        return '#f44336';
    }
  };

  const handleTestComplete = (exerciseId: string) => {
    // Simulate completion with random values for demo
    const wpm = 20 + Math.random() * 30;
    const accuracy = 80 + Math.random() * 15;
    const completion = 70 + Math.random() * 25;
    completeExercise(exerciseId, wpm, accuracy, completion);
  };

  const exerciseTypes: { type: ExerciseType; name: string; icon: string }[] = [
    { type: 'starter', name: 'Starter', icon: '🌱' },
    { type: 'comfort', name: 'Comfort', icon: '🏠' },
    { type: 'stretch', name: 'Stretch', icon: '🎯' },
    { type: 'mastery', name: 'Mastery', icon: '⭐' },
    { type: 'challenge', name: 'Challenge', icon: '🏆' },
    { type: 'review', name: 'Review', icon: '🔄' },
  ];

  const recommendedExercises = getRecommendedExercises();

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '1000px',
      }}
    >
      <h2 style={{ marginBottom: '20px' }}>Confidence Building Exercises</h2>

      {/* Confidence Profile */}
      <div
        style={{
          marginBottom: '24px',
          padding: '20px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '16px' }}>Your Confidence Profile</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Confidence Level</div>
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: getConfidenceLevelColor(profile.currentLevel),
              }}
            >
              {Math.round(profile.currentLevel)}
            </div>
            <div style={{ marginTop: '8px' }}>
              <div
                style={{
                  height: '8px',
                  background: '#e0e0e0',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${profile.currentLevel}%`,
                    background: getConfidenceLevelColor(profile.currentLevel),
                  }}
                />
              </div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Success Rate</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196f3' }}>
              {Math.round(profile.successRate)}%
            </div>
            <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
              {profile.totalExercisesCompleted} exercises completed
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Avg Confidence Gain</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff9800' }}>
              +{Math.round(profile.averageConfidenceGain)}
            </div>
            <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
              per exercise
            </div>
          </div>
        </div>

        {profile.strengthAreas.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
              Strength Areas
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {profile.strengthAreas.map((area) => (
                <div
                  key={area}
                  style={{
                    padding: '4px 12px',
                    background: '#e8f5e9',
                    color: '#4caf50',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  💪 {area}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommended Exercises */}
      {recommendedExercises.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '12px' }}>Recommended for You</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '12px',
            }}
          >
            {recommendedExercises.slice(0, 4).map((exercise) => (
              <motion.div
                key={exercise.id}
                whileHover={{ scale: 1.02 }}
                style={{
                  padding: '16px',
                  background: 'white',
                  border: '2px solid #2196f3',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
                onClick={() => startExercise(exercise.id)}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <div style={{ fontSize: '24px' }}>{exercise.icon}</div>
                  <div
                    style={{
                      padding: '2px 8px',
                      background: getDifficultyColor(exercise.difficulty),
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '11px',
                      height: 'fit-content',
                    }}
                  >
                    {exercise.difficulty}
                  </div>
                </div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {exercise.title}
                </div>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                  {exercise.description}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  ⏱️ {exercise.duration} min • +{exercise.estimatedConfidenceGain}{' '}
                  confidence
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Exercise Type Tabs */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {exerciseTypes.map((type) => (
            <button
              key={type.type}
              onClick={() => setSelectedType(type.type)}
              style={{
                padding: '10px 20px',
                background: selectedType === type.type ? '#2196f3' : 'white',
                color: selectedType === type.type ? 'white' : '#333',
                border: '2px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: selectedType === type.type ? 'bold' : 'normal',
              }}
            >
              {type.icon} {type.name}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise List */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {getExercisesByType(selectedType).map((exercise) => (
          <div
            key={exercise.id}
            style={{
              padding: '16px',
              background: 'white',
              border: '2px solid #ddd',
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}
            >
              <div>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                  {exercise.icon}
                </div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {exercise.title}
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {exercise.description}
                </div>
              </div>
              <div
                style={{
                  padding: '4px 8px',
                  background: getDifficultyColor(exercise.difficulty),
                  color: 'white',
                  borderRadius: '4px',
                  fontSize: '11px',
                  height: 'fit-content',
                }}
              >
                {exercise.difficulty}
              </div>
            </div>

            <div
              style={{
                padding: '12px',
                background: '#f5f5f5',
                borderRadius: '4px',
                marginBottom: '12px',
                fontFamily: 'monospace',
                fontSize: '13px',
              }}
            >
              {exercise.content.slice(0, 80)}
              {exercise.content.length > 80 ? '...' : ''}
            </div>

            <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>
              <div>⏱️ Duration: {exercise.duration} minutes</div>
              <div>🎯 Area: {exercise.area}</div>
              <div>✨ Confidence Gain: +{exercise.estimatedConfidenceGain}</div>
            </div>

            <button
              onClick={() => {
                startExercise(exercise.id);
                // Simulate completion for demo
                setTimeout(() => handleTestComplete(exercise.id), 100);
              }}
              style={{
                width: '100%',
                padding: '10px',
                background: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Start Exercise
            </button>
          </div>
        ))}
      </div>

      {/* Settings */}
      <div
        style={{
          padding: '16px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '12px' }}>Exercise Settings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.startWithEasyExercises}
              onChange={(e) =>
                updateSettings({ startWithEasyExercises: e.target.checked })
              }
            />
            Start with easy exercises
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.showEncouragement}
              onChange={(e) =>
                updateSettings({ showEncouragement: e.target.checked })
              }
            />
            Show encouragement
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.celebrateSuccess}
              onChange={(e) =>
                updateSettings({ celebrateSuccess: e.target.checked })
              }
            />
            Celebrate successes
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.adaptiveDifficulty}
              onChange={(e) =>
                updateSettings({ adaptiveDifficulty: e.target.checked })
              }
            />
            Adaptive difficulty
          </label>
        </div>
      </div>
    </div>
  );
};

export default ConfidenceExercisesControls;
