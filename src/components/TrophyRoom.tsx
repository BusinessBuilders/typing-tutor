/**
 * Trophy Room Component
 * Step 218 - Build trophy room to display achievements and collections
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Trophy interface
export interface Trophy {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'gold' | 'silver' | 'bronze' | 'platinum' | 'special';
  requirement: string;
  earnedAt?: Date;
  unlocked: boolean;
  stats?: {
    label: string;
    value: string;
  }[];
}

// Trophy categories
const TROPHY_CATEGORIES = {
  gold: {
    label: 'Gold Trophies',
    color: 'from-yellow-400 to-yellow-600',
    glow: 'shadow-yellow-400/50',
  },
  silver: {
    label: 'Silver Trophies',
    color: 'from-gray-300 to-gray-500',
    glow: 'shadow-gray-400/50',
  },
  bronze: {
    label: 'Bronze Trophies',
    color: 'from-orange-700 to-orange-900',
    glow: 'shadow-orange-500/50',
  },
  platinum: {
    label: 'Platinum Trophies',
    color: 'from-cyan-300 to-blue-500',
    glow: 'shadow-cyan-400/50',
  },
  special: {
    label: 'Special Trophies',
    color: 'from-purple-500 via-pink-500 to-red-500',
    glow: 'shadow-purple-500/50',
  },
};

// Predefined trophies
const TROPHIES: Trophy[] = [
  // Gold trophies
  {
    id: 'gold_speed',
    name: 'Speed Champion',
    description: 'Type at 60+ WPM consistently',
    icon: '🏆',
    category: 'gold',
    requirement: 'Achieve 60 WPM in 10 sessions',
    unlocked: false,
    stats: [
      { label: 'Best WPM', value: '0' },
      { label: 'Sessions', value: '0/10' },
    ],
  },
  {
    id: 'gold_accuracy',
    name: 'Precision Master',
    description: 'Maintain 99% accuracy',
    icon: '🎯',
    category: 'gold',
    requirement: 'Complete 20 lessons with 99%+ accuracy',
    unlocked: false,
    stats: [
      { label: 'Best Accuracy', value: '0%' },
      { label: 'Lessons', value: '0/20' },
    ],
  },
  {
    id: 'gold_dedication',
    name: 'Dedicated Learner',
    description: '100 days of practice',
    icon: '📚',
    category: 'gold',
    requirement: 'Practice for 100 days',
    unlocked: false,
    stats: [
      { label: 'Current Streak', value: '0' },
      { label: 'Total Days', value: '0/100' },
    ],
  },

  // Silver trophies
  {
    id: 'silver_fast',
    name: 'Quick Fingers',
    description: 'Type at 40+ WPM',
    icon: '⚡',
    category: 'silver',
    requirement: 'Achieve 40 WPM in 5 sessions',
    unlocked: false,
    stats: [
      { label: 'Best WPM', value: '0' },
      { label: 'Sessions', value: '0/5' },
    ],
  },
  {
    id: 'silver_consistent',
    name: 'Consistency King',
    description: '30-day practice streak',
    icon: '🔥',
    category: 'silver',
    requirement: 'Practice 30 days in a row',
    unlocked: false,
    stats: [
      { label: 'Current Streak', value: '0' },
      { label: 'Target', value: '30 days' },
    ],
  },
  {
    id: 'silver_complete',
    name: 'Lesson Completer',
    description: 'Complete 50 lessons',
    icon: '✅',
    category: 'silver',
    requirement: 'Finish 50 complete lessons',
    unlocked: false,
    stats: [
      { label: 'Completed', value: '0/50' },
    ],
  },

  // Bronze trophies
  {
    id: 'bronze_beginner',
    name: 'Getting Started',
    description: 'Complete first lesson',
    icon: '🌟',
    category: 'bronze',
    requirement: 'Finish your first lesson',
    unlocked: false,
    stats: [
      { label: 'Status', value: 'Not started' },
    ],
  },
  {
    id: 'bronze_week',
    name: 'Week Warrior',
    description: '7-day practice streak',
    icon: '📅',
    category: 'bronze',
    requirement: 'Practice 7 days in a row',
    unlocked: false,
    stats: [
      { label: 'Current Streak', value: '0' },
      { label: 'Target', value: '7 days' },
    ],
  },
  {
    id: 'bronze_typer',
    name: 'Budding Typist',
    description: 'Type 1,000 characters',
    icon: '⌨️',
    category: 'bronze',
    requirement: 'Type 1,000 total characters',
    unlocked: false,
    stats: [
      { label: 'Typed', value: '0/1000' },
    ],
  },

  // Platinum trophies
  {
    id: 'platinum_master',
    name: 'Typing Master',
    description: 'Master all skills',
    icon: '💎',
    category: 'platinum',
    requirement: 'Complete all lessons with 95%+ accuracy',
    unlocked: false,
    stats: [
      { label: 'Lessons', value: '0/100' },
      { label: 'Min Accuracy', value: '95%' },
    ],
  },
  {
    id: 'platinum_legend',
    name: 'Typing Legend',
    description: 'Reach level 50',
    icon: '👑',
    category: 'platinum',
    requirement: 'Achieve maximum level',
    unlocked: false,
    stats: [
      { label: 'Current Level', value: '1' },
      { label: 'Target', value: '50' },
    ],
  },

  // Special trophies
  {
    id: 'special_perfect',
    name: 'Perfect Performance',
    description: '100% accuracy lesson',
    icon: '⭐',
    category: 'special',
    requirement: 'Complete any lesson with perfect accuracy',
    unlocked: false,
    stats: [
      { label: 'Attempts', value: '0' },
    ],
  },
  {
    id: 'special_speedster',
    name: 'Ultimate Speedster',
    description: 'Type at 100+ WPM',
    icon: '🚀',
    category: 'special',
    requirement: 'Achieve 100 WPM in any session',
    unlocked: false,
    stats: [
      { label: 'Best WPM', value: '0' },
      { label: 'Target', value: '100' },
    ],
  },
  {
    id: 'special_collector',
    name: 'Badge Collector',
    description: 'Collect all badges',
    icon: '🎖️',
    category: 'special',
    requirement: 'Unlock every achievement badge',
    unlocked: false,
    stats: [
      { label: 'Collected', value: '0/50' },
    ],
  },
];

// Custom hook for trophy room
export function useTrophyRoom() {
  const [trophies, setTrophies] = useState<Trophy[]>(TROPHIES);
  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedTrophy, setEarnedTrophy] = useState<Trophy | null>(null);

  const unlockTrophy = (trophyId: string) => {
    const trophy = trophies.find((t) => t.id === trophyId);
    if (!trophy || trophy.unlocked) return null;

    const updatedTrophies = trophies.map((t) =>
      t.id === trophyId
        ? { ...t, unlocked: true, earnedAt: new Date() }
        : t
    );

    setTrophies(updatedTrophies);
    setEarnedTrophy({ ...trophy, unlocked: true, earnedAt: new Date() });
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 6000);

    return trophy;
  };

  const updateTrophyStats = (trophyId: string, stats: Trophy['stats']) => {
    setTrophies((prev) =>
      prev.map((t) =>
        t.id === trophyId ? { ...t, stats } : t
      )
    );
  };

  const getTrophiesByCategory = (category: Trophy['category']) => {
    return trophies.filter((t) => t.category === category);
  };

  const getUnlockedTrophies = () => {
    return trophies.filter((t) => t.unlocked);
  };

  const getLockedTrophies = () => {
    return trophies.filter((t) => !t.unlocked);
  };

  const getCompletionPercentage = () => {
    const unlocked = trophies.filter((t) => t.unlocked).length;
    return Math.round((unlocked / trophies.length) * 100);
  };

  const getTotalByCategory = (category: Trophy['category']) => {
    return trophies.filter((t) => t.category === category).length;
  };

  const getUnlockedByCategory = (category: Trophy['category']) => {
    return trophies.filter((t) => t.category === category && t.unlocked).length;
  };

  return {
    trophies,
    unlockTrophy,
    updateTrophyStats,
    getTrophiesByCategory,
    getUnlockedTrophies,
    getLockedTrophies,
    getCompletionPercentage,
    getTotalByCategory,
    getUnlockedByCategory,
    showCelebration,
    earnedTrophy,
  };
}

// Main trophy room component
export default function TrophyRoom() {
  const {
    trophies,
    unlockTrophy,
    getTrophiesByCategory,
    getCompletionPercentage,
    getTotalByCategory,
    getUnlockedByCategory,
    showCelebration,
    earnedTrophy,
  } = useTrophyRoom();

  const { settings } = useSettingsStore();
  const [selectedCategory, setSelectedCategory] = useState<Trophy['category'] | 'all'>('all');
  const [selectedTrophy, setSelectedTrophy] = useState<Trophy | null>(null);

  const filteredTrophies =
    selectedCategory === 'all'
      ? trophies
      : getTrophiesByCategory(selectedCategory);

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-white p-8">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent"
        >
          🏆 Trophy Room 🏆
        </motion.h1>
        <p className="text-center text-gray-400 mb-8">
          Your Collection of Achievements
        </p>

        {/* Trophy earned celebration */}
        <AnimatePresence>
          {showCelebration && earnedTrophy && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70"
            >
              <div className={`bg-gradient-to-r ${TROPHY_CATEGORIES[earnedTrophy.category].color} rounded-3xl p-12 shadow-2xl text-center max-w-lg`}>
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 10, 0],
                    scale: [1, 1.2, 1.2, 1.2, 1],
                  }}
                  transition={{ duration: 1 }}
                  className="text-9xl mb-6"
                >
                  {earnedTrophy.icon}
                </motion.div>
                <div className="text-5xl font-bold mb-4">Trophy Unlocked!</div>
                <div className="text-3xl mb-2">{earnedTrophy.name}</div>
                <div className="text-xl opacity-90 mb-4">
                  {earnedTrophy.description}
                </div>
                <div className="text-lg bg-white bg-opacity-20 rounded-lg py-3 px-6 inline-block">
                  {TROPHY_CATEGORIES[earnedTrophy.category].label}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trophy detail modal */}
        <AnimatePresence>
          {selectedTrophy && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedTrophy(null)}
                className="fixed inset-0 bg-black bg-opacity-70 z-40"
              />
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`bg-gradient-to-br ${TROPHY_CATEGORIES[selectedTrophy.category].color} rounded-2xl shadow-2xl p-8 max-w-md w-full`}
                >
                  <div className="text-center mb-6">
                    <div className="text-8xl mb-4">{selectedTrophy.icon}</div>
                    <h3 className="text-3xl font-bold mb-2">{selectedTrophy.name}</h3>
                    <p className="text-lg opacity-90 mb-4">{selectedTrophy.description}</p>
                    <div className="text-sm bg-white bg-opacity-20 rounded-lg py-2 px-4 inline-block mb-4">
                      {TROPHY_CATEGORIES[selectedTrophy.category].label}
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-4">
                    <div className="font-bold mb-2">Requirement:</div>
                    <div className="opacity-90">{selectedTrophy.requirement}</div>
                  </div>

                  {selectedTrophy.stats && selectedTrophy.stats.length > 0 && (
                    <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-4">
                      <div className="font-bold mb-2">Progress:</div>
                      <div className="space-y-2">
                        {selectedTrophy.stats.map((stat, i) => (
                          <div key={i} className="flex justify-between">
                            <span className="opacity-90">{stat.label}:</span>
                            <span className="font-bold">{stat.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTrophy.unlocked && selectedTrophy.earnedAt && (
                    <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-4 text-center">
                      <div className="font-bold mb-1">Unlocked</div>
                      <div className="text-sm opacity-90">
                        {selectedTrophy.earnedAt.toLocaleDateString()} at{' '}
                        {selectedTrophy.earnedAt.toLocaleTimeString()}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedTrophy(null)}
                    className="w-full py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg font-bold transition-all"
                  >
                    Close
                  </button>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* Overall stats */}
        <div className="mb-8 bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Collection Progress</h2>
            <div className="text-4xl font-bold text-yellow-400">
              {getCompletionPercentage()}%
            </div>
          </div>

          <div className="h-4 bg-gray-700 rounded-full overflow-hidden mb-6">
            <motion.div
              animate={{ width: `${getCompletionPercentage()}%` }}
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600"
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(TROPHY_CATEGORIES).map(([category, data]) => (
              <div key={category} className="bg-gray-700 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {getUnlockedByCategory(category as Trophy['category'])}/
                  {getTotalByCategory(category as Trophy['category'])}
                </div>
                <div className="text-xs text-gray-400">{data.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-yellow-500 text-gray-900'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Trophies
          </button>
          {Object.entries(TROPHY_CATEGORIES).map(([category, data]) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as Trophy['category'])}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                selectedCategory === category
                  ? 'bg-yellow-500 text-gray-900'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {data.label} ({getUnlockedByCategory(category as Trophy['category'])}/
              {getTotalByCategory(category as Trophy['category'])})
            </button>
          ))}
        </div>

        {/* Trophy grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTrophies.map((trophy, index) => (
            <TrophyCard
              key={trophy.id}
              trophy={trophy}
              index={index}
              onClick={() => setSelectedTrophy(trophy)}
              onUnlock={() => unlockTrophy(trophy.id)}
              settings={settings}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Trophy card component
function TrophyCard({
  trophy,
  index,
  onClick,
  onUnlock,
  settings,
}: {
  trophy: Trophy;
  index: number;
  onClick: () => void;
  onUnlock: () => void;
  settings: any;
}) {
  const categoryData = TROPHY_CATEGORIES[trophy.category];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
      whileHover={{ scale: settings.reducedMotion ? 1 : 1.05, y: -5 }}
      onClick={onClick}
      className={`rounded-xl p-6 cursor-pointer transition-all ${
        trophy.unlocked
          ? `bg-gradient-to-br ${categoryData.color} shadow-xl ${categoryData.glow} shadow-lg`
          : 'bg-gray-800 opacity-50 hover:opacity-70'
      }`}
    >
      <div className="text-center">
        <motion.div
          animate={
            trophy.unlocked
              ? { rotate: [0, -5, 5, -5, 5, 0] }
              : {}
          }
          transition={
            trophy.unlocked
              ? { duration: 2, repeat: Infinity, repeatDelay: 3 }
              : {}
          }
          className="text-6xl mb-3"
        >
          {trophy.unlocked ? trophy.icon : '🔒'}
        </motion.div>
        <div className={`font-bold mb-2 ${
          trophy.unlocked ? 'text-white' : 'text-gray-400'
        }`}>
          {trophy.unlocked ? trophy.name : '???'}
        </div>
        <div className={`text-xs mb-3 ${
          trophy.unlocked ? 'opacity-90' : 'text-gray-500'
        }`}>
          {trophy.unlocked ? trophy.description : 'Locked'}
        </div>
        <div className={`text-xs px-2 py-1 rounded ${
          trophy.unlocked
            ? 'bg-white bg-opacity-20'
            : 'bg-gray-700'
        }`}>
          {categoryData.label.replace(' Trophies', '')}
        </div>

        {/* Test unlock button (for demo) */}
        {!trophy.unlocked && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUnlock();
            }}
            className="mt-3 w-full py-2 bg-yellow-500 text-gray-900 rounded-lg font-bold text-xs hover:bg-yellow-400 transition-colors"
          >
            Unlock (Test)
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Mini trophy display
export function TrophyDisplay({ trophy }: { trophy: Trophy }) {
  const categoryData = TROPHY_CATEGORIES[trophy.category];

  return (
    <div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
        trophy.unlocked
          ? `bg-gradient-to-r ${categoryData.color} text-white shadow-lg`
          : 'bg-gray-200 text-gray-600'
      }`}
    >
      <span className="text-xl">{trophy.unlocked ? trophy.icon : '🔒'}</span>
      <span className="font-bold text-sm">
        {trophy.unlocked ? trophy.name : 'Locked'}
      </span>
    </div>
  );
}
