import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Seasonal Content Component
 * Step 322 - Build seasonal content system
 *
 * Features:
 * - Season-specific typing exercises
 * - Seasonal themes and visuals
 * - Weather-based content
 * - Seasonal vocabulary
 * - Automatic season detection
 * - Season transitions
 * - Seasonal achievements
 */

// Types
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export type SeasonalActivity =
  | 'outdoor'
  | 'indoor'
  | 'weather'
  | 'nature'
  | 'clothing'
  | 'food'
  | 'celebration';

export interface SeasonalWord {
  word: string;
  category: SeasonalActivity;
  difficulty: number; // 1-10
  description?: string;
}

export interface SeasonalExercise {
  id: string;
  season: Season;
  title: string;
  description: string;
  content: string;
  words: SeasonalWord[];
  activities: SeasonalActivity[];
  difficulty: 'easy' | 'medium' | 'hard';
  wordCount: number;
  estimatedTime: number; // seconds
  theme: {
    colors: string[];
    icon: string;
    mood: string;
  };
  autismFriendly: boolean;
  tags: string[];
  created: Date;
}

export interface SeasonalTheme {
  season: Season;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  imagery: string[];
  vocabulary: SeasonalWord[];
  activities: string[];
}

export interface SeasonalAchievement {
  id: string;
  season: Season;
  title: string;
  description: string;
  icon: string;
  requirement: {
    type: 'exercises' | 'words' | 'days';
    count: number;
  };
  unlocked: boolean;
  unlockedDate?: Date;
}

export interface SeasonalContentSettings {
  autoDetectSeason: boolean;
  showSeasonalDecorations: boolean;
  useSeasonalVocabulary: boolean;
  enableSeasonTransitions: boolean;
  preferredSeason?: Season;
}

interface SeasonalContentProps {
  onSeasonChange?: (season: Season) => void;
  onExerciseComplete?: (exercise: SeasonalExercise) => void;
  settings?: Partial<SeasonalContentSettings>;
}

// Seasonal data
const seasonalThemes: Record<Season, SeasonalTheme> = {
  spring: {
    season: 'spring',
    name: 'Spring Awakening',
    description: 'Fresh blooms and new beginnings',
    colors: {
      primary: '#8BC34A',
      secondary: '#FFEB3B',
      accent: '#FF4081',
      background: '#F1F8E9',
    },
    imagery: ['flowers', 'rain', 'butterflies', 'baby animals', 'green grass'],
    vocabulary: [
      { word: 'blossom', category: 'nature', difficulty: 3 },
      { word: 'rain', category: 'weather', difficulty: 1 },
      { word: 'flower', category: 'nature', difficulty: 1 },
      { word: 'butterfly', category: 'nature', difficulty: 3 },
      { word: 'garden', category: 'outdoor', difficulty: 2 },
      { word: 'sprout', category: 'nature', difficulty: 3 },
      { word: 'rainbow', category: 'weather', difficulty: 3 },
      { word: 'puddle', category: 'weather', difficulty: 2 },
      { word: 'nest', category: 'nature', difficulty: 2 },
      { word: 'bloom', category: 'nature', difficulty: 2 },
    ],
    activities: ['planting seeds', 'spring cleaning', 'flying kites', 'watching birds'],
  },
  summer: {
    season: 'summer',
    name: 'Summer Adventure',
    description: 'Sunny days and outdoor fun',
    colors: {
      primary: '#FFD54F',
      secondary: '#4FC3F7',
      accent: '#FF7043',
      background: '#FFF9C4',
    },
    imagery: ['sun', 'beach', 'ice cream', 'swimming', 'sunshine'],
    vocabulary: [
      { word: 'sunshine', category: 'weather', difficulty: 3 },
      { word: 'beach', category: 'outdoor', difficulty: 2 },
      { word: 'swimming', category: 'outdoor', difficulty: 3 },
      { word: 'vacation', category: 'outdoor', difficulty: 4 },
      { word: 'hot', category: 'weather', difficulty: 1 },
      { word: 'sandcastle', category: 'outdoor', difficulty: 4 },
      { word: 'watermelon', category: 'food', difficulty: 4 },
      { word: 'shorts', category: 'clothing', difficulty: 2 },
      { word: 'sunglasses', category: 'clothing', difficulty: 4 },
      { word: 'picnic', category: 'outdoor', difficulty: 3 },
    ],
    activities: ['swimming', 'camping', 'hiking', 'beach trips'],
  },
  autumn: {
    season: 'autumn',
    name: 'Autumn Harvest',
    description: 'Colorful leaves and cozy days',
    colors: {
      primary: '#FF9800',
      secondary: '#8D6E63',
      accent: '#FFEB3B',
      background: '#FFF3E0',
    },
    imagery: ['leaves', 'pumpkins', 'harvest', 'apples', 'scarecrow'],
    vocabulary: [
      { word: 'leaves', category: 'nature', difficulty: 2 },
      { word: 'pumpkin', category: 'food', difficulty: 3 },
      { word: 'harvest', category: 'outdoor', difficulty: 3 },
      { word: 'apple', category: 'food', difficulty: 2 },
      { word: 'scarecrow', category: 'outdoor', difficulty: 4 },
      { word: 'sweater', category: 'clothing', difficulty: 3 },
      { word: 'acorn', category: 'nature', difficulty: 3 },
      { word: 'crisp', category: 'weather', difficulty: 2 },
      { word: 'hayride', category: 'outdoor', difficulty: 3 },
      { word: 'corn', category: 'food', difficulty: 2 },
    ],
    activities: ['leaf jumping', 'apple picking', 'hayrides', 'pumpkin carving'],
  },
  winter: {
    season: 'winter',
    name: 'Winter Wonderland',
    description: 'Snowy magic and warm cocoa',
    colors: {
      primary: '#64B5F6',
      secondary: '#E1F5FE',
      accent: '#F44336',
      background: '#F5F5F5',
    },
    imagery: ['snow', 'snowman', 'mittens', 'cocoa', 'fireplace'],
    vocabulary: [
      { word: 'snow', category: 'weather', difficulty: 1 },
      { word: 'snowman', category: 'outdoor', difficulty: 3 },
      { word: 'cold', category: 'weather', difficulty: 1 },
      { word: 'mittens', category: 'clothing', difficulty: 3 },
      { word: 'cocoa', category: 'food', difficulty: 2 },
      { word: 'icicle', category: 'nature', difficulty: 3 },
      { word: 'sledding', category: 'outdoor', difficulty: 3 },
      { word: 'cozy', category: 'indoor', difficulty: 2 },
      { word: 'fireplace', category: 'indoor', difficulty: 4 },
      { word: 'snowflake', category: 'weather', difficulty: 4 },
    ],
    activities: ['building snowmen', 'sledding', 'ice skating', 'drinking hot cocoa'],
  },
};

// Helper to detect current season
const detectSeason = (): Season => {
  const month = new Date().getMonth(); // 0-11
  if (month >= 2 && month <= 4) return 'spring'; // Mar-May
  if (month >= 5 && month <= 7) return 'summer'; // Jun-Aug
  if (month >= 8 && month <= 10) return 'autumn'; // Sep-Nov
  return 'winter'; // Dec-Feb
};

const defaultSettings: SeasonalContentSettings = {
  autoDetectSeason: true,
  showSeasonalDecorations: true,
  useSeasonalVocabulary: true,
  enableSeasonTransitions: true,
};

export const useSeasonalContent = (props: SeasonalContentProps = {}) => {
  const settings = { ...defaultSettings, ...props.settings };

  // State
  const [currentSeason, setCurrentSeason] = useState<Season>(
    settings.preferredSeason || detectSeason()
  );
  const [exercises, setExercises] = useState<SeasonalExercise[]>([]);
  const [achievements, setAchievements] = useState<SeasonalAchievement[]>([]);
  const [stats, setStats] = useState({
    exercisesCompleted: 0,
    wordsTyped: 0,
    daysActive: 0,
  });

  // Auto-detect season
  useEffect(() => {
    if (settings.autoDetectSeason && !settings.preferredSeason) {
      const detectedSeason = detectSeason();
      if (detectedSeason !== currentSeason) {
        changeSeason(detectedSeason);
      }
    }
  }, []);

  // Generate exercises for current season
  useEffect(() => {
    const theme = seasonalThemes[currentSeason];
    const generatedExercises: SeasonalExercise[] = [];

    // Easy exercise
    generatedExercises.push({
      id: `${currentSeason}-easy-1`,
      season: currentSeason,
      title: `${theme.name} - Beginner`,
      description: `Simple ${currentSeason} words for beginners`,
      content: theme.vocabulary
        .filter((v) => v.difficulty <= 2)
        .map((v) => v.word)
        .slice(0, 5)
        .join(' '),
      words: theme.vocabulary.filter((v) => v.difficulty <= 2).slice(0, 5),
      activities: ['nature', 'weather'],
      difficulty: 'easy',
      wordCount: 5,
      estimatedTime: 30,
      theme: {
        colors: [theme.colors.primary, theme.colors.secondary],
        icon: getSeasonIcon(currentSeason),
        mood: 'cheerful',
      },
      autismFriendly: true,
      tags: [currentSeason, 'beginner', 'simple'],
      created: new Date(),
    });

    // Medium exercise
    const mediumWords = theme.vocabulary.filter((v) => v.difficulty >= 2 && v.difficulty <= 4);
    generatedExercises.push({
      id: `${currentSeason}-medium-1`,
      season: currentSeason,
      title: `${theme.name} - Intermediate`,
      description: `Practice ${currentSeason} activities and descriptions`,
      content: `During ${currentSeason}, we enjoy ${theme.activities.join(' and ')}. The ${mediumWords[0]?.word} is beautiful this time of year.`,
      words: mediumWords.slice(0, 8),
      activities: ['outdoor', 'nature', 'weather'],
      difficulty: 'medium',
      wordCount: 15,
      estimatedTime: 60,
      theme: {
        colors: [theme.colors.primary, theme.colors.accent],
        icon: getSeasonIcon(currentSeason),
        mood: 'focused',
      },
      autismFriendly: true,
      tags: [currentSeason, 'intermediate', 'activities'],
      created: new Date(),
    });

    // Hard exercise
    generatedExercises.push({
      id: `${currentSeason}-hard-1`,
      season: currentSeason,
      title: `${theme.name} - Advanced`,
      description: `Complex ${currentSeason} sentences and vocabulary`,
      content: `${theme.description}. In ${currentSeason}, we experience ${theme.vocabulary.slice(0, 3).map((v) => v.word).join(', and ')}. Many people enjoy ${theme.activities[0]} during this wonderful season. The ${theme.imagery[0]} creates a magical atmosphere.`,
      words: theme.vocabulary.slice(0, 10),
      activities: ['outdoor', 'nature', 'weather', 'indoor'],
      difficulty: 'hard',
      wordCount: 30,
      estimatedTime: 120,
      theme: {
        colors: [theme.colors.primary, theme.colors.secondary, theme.colors.accent],
        icon: getSeasonIcon(currentSeason),
        mood: 'challenging',
      },
      autismFriendly: true,
      tags: [currentSeason, 'advanced', 'descriptive'],
      created: new Date(),
    });

    setExercises(generatedExercises);
  }, [currentSeason]);

  // Initialize achievements
  useEffect(() => {
    const initialAchievements: SeasonalAchievement[] = [
      {
        id: `${currentSeason}-achievement-1`,
        season: currentSeason,
        title: `${currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)} Beginner`,
        description: `Complete 5 ${currentSeason} exercises`,
        icon: getSeasonIcon(currentSeason),
        requirement: { type: 'exercises', count: 5 },
        unlocked: false,
      },
      {
        id: `${currentSeason}-achievement-2`,
        season: currentSeason,
        title: `${currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)} Expert`,
        description: `Type 100 ${currentSeason} words`,
        icon: getSeasonIcon(currentSeason),
        requirement: { type: 'words', count: 100 },
        unlocked: false,
      },
      {
        id: `${currentSeason}-achievement-3`,
        season: currentSeason,
        title: `${currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)} Dedication`,
        description: `Practice for 7 days in ${currentSeason}`,
        icon: getSeasonIcon(currentSeason),
        requirement: { type: 'days', count: 7 },
        unlocked: false,
      },
    ];
    setAchievements(initialAchievements);
  }, [currentSeason]);

  // Change season
  const changeSeason = useCallback(
    (newSeason: Season) => {
      if (newSeason === currentSeason) return;

      setCurrentSeason(newSeason);
      props.onSeasonChange?.(newSeason);
    },
    [currentSeason, props]
  );

  // Complete exercise
  const completeExercise = useCallback(
    (exerciseId: string, wordsTyped: number) => {
      const exercise = exercises.find((e) => e.id === exerciseId);
      if (!exercise) return;

      // Update stats
      setStats((prev) => ({
        ...prev,
        exercisesCompleted: prev.exercisesCompleted + 1,
        wordsTyped: prev.wordsTyped + wordsTyped,
      }));

      // Check achievements
      setAchievements((prev) =>
        prev.map((achievement) => {
          if (achievement.unlocked) return achievement;

          const shouldUnlock =
            (achievement.requirement.type === 'exercises' &&
              stats.exercisesCompleted + 1 >= achievement.requirement.count) ||
            (achievement.requirement.type === 'words' &&
              stats.wordsTyped + wordsTyped >= achievement.requirement.count) ||
            (achievement.requirement.type === 'days' &&
              stats.daysActive >= achievement.requirement.count);

          if (shouldUnlock) {
            return {
              ...achievement,
              unlocked: true,
              unlockedDate: new Date(),
            };
          }

          return achievement;
        })
      );

      props.onExerciseComplete?.(exercise);
    },
    [exercises, stats, props]
  );

  // Get current theme
  const getCurrentTheme = useCallback(() => {
    return seasonalThemes[currentSeason];
  }, [currentSeason]);

  // Get vocabulary by category
  const getVocabularyByCategory = useCallback(
    (category: SeasonalActivity) => {
      return seasonalThemes[currentSeason].vocabulary.filter((v) => v.category === category);
    },
    [currentSeason]
  );

  return {
    // State
    currentSeason,
    exercises,
    achievements,
    stats,
    settings,

    // Actions
    changeSeason,
    completeExercise,
    getCurrentTheme,
    getVocabularyByCategory,
  };
};

// Helper function to get season icon
function getSeasonIcon(season: Season): string {
  const icons = {
    spring: '🌸',
    summer: '☀️',
    autumn: '🍂',
    winter: '❄️',
  };
  return icons[season];
}

// Main component
const SeasonalContent: React.FC<SeasonalContentProps> = (props) => {
  const {
    currentSeason,
    exercises,
    achievements,
    changeSeason,
    getCurrentTheme,
  } = useSeasonalContent(props);

  const theme = getCurrentTheme();
  const [selectedExercise, setSelectedExercise] = useState<SeasonalExercise | null>(null);

  const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter'];

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          padding: '40px',
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
          borderRadius: '20px',
          color: 'white',
          marginBottom: '30px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '64px', marginBottom: '10px' }}>
          {getSeasonIcon(currentSeason)}
        </div>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '36px' }}>{theme.name}</h1>
        <p style={{ margin: 0, fontSize: '18px', opacity: 0.9 }}>{theme.description}</p>
      </motion.div>

      {/* Season Selector */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '15px' }}>Choose a Season</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          {seasons.map((season) => {
            const seasonTheme = seasonalThemes[season];
            return (
              <motion.button
                key={season}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => changeSeason(season)}
                style={{
                  padding: '20px 30px',
                  backgroundColor:
                    season === currentSeason ? seasonTheme.colors.primary : 'white',
                  color: season === currentSeason ? 'white' : '#333',
                  border: `3px solid ${seasonTheme.colors.primary}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '32px' }}>{getSeasonIcon(season)}</span>
                <span>{season.charAt(0).toUpperCase() + season.slice(1)}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Seasonal Vocabulary */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '15px' }}>Seasonal Words</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {theme.vocabulary.map((word) => (
            <motion.div
              key={word.word}
              whileHover={{ scale: 1.1 }}
              style={{
                padding: '10px 16px',
                backgroundColor: 'white',
                border: `2px solid ${theme.colors.primary}`,
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              {word.word}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Exercises */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '15px' }}>Typing Exercises</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
          }}
        >
          {exercises.map((exercise) => (
            <motion.div
              key={exercise.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedExercise(exercise)}
              style={{
                padding: '24px',
                backgroundColor: 'white',
                borderRadius: '16px',
                border: '2px solid #e0e0e0',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '12px',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '18px' }}>{exercise.title}</h3>
                <span style={{ fontSize: '32px' }}>{exercise.theme.icon}</span>
              </div>

              <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                {exercise.description}
              </p>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <span
                  style={{
                    padding: '4px 10px',
                    backgroundColor: getDifficultyColor(exercise.difficulty),
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  {exercise.difficulty.toUpperCase()}
                </span>
                <span
                  style={{
                    padding: '4px 10px',
                    backgroundColor: '#E0E0E0',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                >
                  {exercise.wordCount} words
                </span>
              </div>

              <div
                style={{
                  padding: '10px',
                  backgroundColor: '#F5F5F5',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontStyle: 'italic',
                  color: '#666',
                }}
              >
                {exercise.content.substring(0, 100)}...
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h2 style={{ marginBottom: '15px' }}>Seasonal Achievements</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '15px',
          }}
        >
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              whileHover={{ scale: 1.02 }}
              style={{
                padding: '20px',
                backgroundColor: achievement.unlocked ? theme.colors.primary : 'white',
                color: achievement.unlocked ? 'white' : '#333',
                borderRadius: '12px',
                border: achievement.unlocked ? 'none' : '2px solid #e0e0e0',
                opacity: achievement.unlocked ? 1 : 0.6,
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '10px', textAlign: 'center' }}>
                {achievement.unlocked ? '🏆' : '🔒'}
              </div>
              <h4 style={{ margin: '0 0 8px 0', textAlign: 'center' }}>{achievement.title}</h4>
              <p style={{ margin: 0, fontSize: '13px', textAlign: 'center', opacity: 0.9 }}>
                {achievement.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Exercise Modal */}
      <AnimatePresence>
        {selectedExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px',
            }}
            onClick={() => setSelectedExercise(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '40px',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <div style={{ fontSize: '64px', marginBottom: '15px' }}>
                  {selectedExercise.theme.icon}
                </div>
                <h2 style={{ margin: '0 0 10px 0' }}>{selectedExercise.title}</h2>
                <p style={{ color: '#666', margin: 0 }}>{selectedExercise.description}</p>
              </div>

              <div
                style={{
                  padding: '30px',
                  backgroundColor: '#F9F9F9',
                  borderRadius: '12px',
                  fontSize: '18px',
                  lineHeight: '1.8',
                  marginBottom: '25px',
                }}
              >
                {selectedExercise.content}
              </div>

              <button
                onClick={() => setSelectedExercise(null)}
                style={{
                  width: '100%',
                  padding: '15px',
                  backgroundColor: theme.colors.primary,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Start Typing
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper function
function getDifficultyColor(difficulty: string): string {
  const colors = {
    easy: '#4CAF50',
    medium: '#FF9800',
    hard: '#F44336',
  };
  return colors[difficulty as keyof typeof colors] || '#999';
}

export default SeasonalContent;
