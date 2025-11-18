/**
 * Pet Achievements Component
 * Step 229 - Create pet-specific achievements and rewards
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Pet achievement interface
export interface PetAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'care' | 'interaction' | 'evolution' | 'training' | 'special';
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  requirement: string;
  target: number;
  current: number;
  unlocked: boolean;
  unlockedAt?: Date;
  rewards: {
    coins: number;
    xp: number;
    title?: string;
  };
}

// Achievement categories
const ACHIEVEMENT_CATEGORIES = {
  care: { label: 'Pet Care', icon: '💕', color: 'from-pink-400 to-pink-600' },
  interaction: { label: 'Interaction', icon: '🤝', color: 'from-blue-400 to-blue-600' },
  evolution: { label: 'Evolution', icon: '⭐', color: 'from-purple-500 to-pink-600' },
  training: { label: 'Training', icon: '🎓', color: 'from-green-400 to-green-600' },
  special: { label: 'Special', icon: '👑', color: 'from-yellow-400 to-orange-500' },
};

// Predefined pet achievements
const PET_ACHIEVEMENTS: PetAchievement[] = [
  // Care achievements
  {
    id: 'first_pet',
    name: 'First Pet Friend',
    description: 'Get your first pet companion',
    icon: '🐾',
    category: 'care',
    rarity: 'bronze',
    requirement: 'Adopt your first pet',
    target: 1,
    current: 0,
    unlocked: false,
    rewards: { coins: 50, xp: 25, title: 'Pet Owner' },
  },
  {
    id: 'well_fed',
    name: 'Well Fed',
    description: 'Feed your pet 50 times',
    icon: '🍽️',
    category: 'care',
    rarity: 'bronze',
    requirement: 'Feed pet 50 times',
    target: 50,
    current: 0,
    unlocked: false,
    rewards: { coins: 100, xp: 50 },
  },
  {
    id: 'happy_pet',
    name: 'Happy Pet',
    description: 'Keep happiness at 100% for 1 hour',
    icon: '😊',
    category: 'care',
    rarity: 'silver',
    requirement: 'Maintain max happiness',
    target: 1,
    current: 0,
    unlocked: false,
    rewards: { coins: 200, xp: 100, title: 'Happy Keeper' },
  },
  {
    id: 'perfect_care',
    name: 'Perfect Care',
    description: 'Keep all stats at 100% simultaneously',
    icon: '💯',
    category: 'care',
    rarity: 'gold',
    requirement: 'Max all stats at once',
    target: 1,
    current: 0,
    unlocked: false,
    rewards: { coins: 500, xp: 250, title: 'Perfect Caretaker' },
  },

  // Interaction achievements
  {
    id: 'friendly',
    name: 'Friendly',
    description: 'Pet your companion 100 times',
    icon: '👋',
    category: 'interaction',
    rarity: 'bronze',
    requirement: 'Pet 100 times',
    target: 100,
    current: 0,
    unlocked: false,
    rewards: { coins: 150, xp: 75 },
  },
  {
    id: 'playmate',
    name: 'Playmate',
    description: 'Play with your pet 50 times',
    icon: '🎾',
    category: 'interaction',
    rarity: 'silver',
    requirement: 'Play 50 times',
    target: 50,
    current: 0,
    unlocked: false,
    rewards: { coins: 250, xp: 125, title: 'Playmate' },
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Use all interaction types 10 times each',
    icon: '🦋',
    category: 'interaction',
    rarity: 'gold',
    requirement: 'Use all interactions',
    target: 10,
    current: 0,
    unlocked: false,
    rewards: { coins: 400, xp: 200, title: 'Social Expert' },
  },

  // Evolution achievements
  {
    id: 'growing_up',
    name: 'Growing Up',
    description: 'Evolve to child stage',
    icon: '🌱',
    category: 'evolution',
    rarity: 'bronze',
    requirement: 'Reach child stage',
    target: 1,
    current: 0,
    unlocked: false,
    rewards: { coins: 100, xp: 50 },
  },
  {
    id: 'teenager',
    name: 'Teenager',
    description: 'Evolve to teen stage',
    icon: '🌿',
    category: 'evolution',
    rarity: 'silver',
    requirement: 'Reach teen stage',
    target: 1,
    current: 0,
    unlocked: false,
    rewards: { coins: 300, xp: 150, title: 'Teen Mentor' },
  },
  {
    id: 'fully_grown',
    name: 'Fully Grown',
    description: 'Evolve to adult stage',
    icon: '🌳',
    category: 'evolution',
    rarity: 'gold',
    requirement: 'Reach adult stage',
    target: 1,
    current: 0,
    unlocked: false,
    rewards: { coins: 600, xp: 300, title: 'Adult Trainer' },
  },
  {
    id: 'master_evolution',
    name: 'Master Evolution',
    description: 'Reach the ultimate master stage',
    icon: '👑',
    category: 'evolution',
    rarity: 'diamond',
    requirement: 'Reach master stage',
    target: 1,
    current: 0,
    unlocked: false,
    rewards: { coins: 2000, xp: 1000, title: 'Master Trainer' },
  },

  // Training achievements
  {
    id: 'student',
    name: 'Eager Student',
    description: 'Complete 10 training sessions',
    icon: '📚',
    category: 'training',
    rarity: 'bronze',
    requirement: 'Complete training',
    target: 10,
    current: 0,
    unlocked: false,
    rewards: { coins: 120, xp: 60 },
  },
  {
    id: 'game_master',
    name: 'Game Master',
    description: 'Play 25 mini-games',
    icon: '🎮',
    category: 'training',
    rarity: 'silver',
    requirement: 'Play mini-games',
    target: 25,
    current: 0,
    unlocked: false,
    rewards: { coins: 300, xp: 150, title: 'Game Master' },
  },
  {
    id: 'trick_master',
    name: 'Trick Master',
    description: 'Master all trick types',
    icon: '🎪',
    category: 'training',
    rarity: 'gold',
    requirement: 'Learn all tricks',
    target: 1,
    current: 0,
    unlocked: false,
    rewards: { coins: 500, xp: 250, title: 'Trick Master' },
  },

  // Special achievements
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Interact with pet before 6 AM',
    icon: '🌅',
    category: 'special',
    rarity: 'silver',
    requirement: 'Early morning care',
    target: 1,
    current: 0,
    unlocked: false,
    rewards: { coins: 200, xp: 100 },
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Interact with pet after midnight',
    icon: '🦉',
    category: 'special',
    rarity: 'silver',
    requirement: 'Late night care',
    target: 1,
    current: 0,
    unlocked: false,
    rewards: { coins: 200, xp: 100 },
  },
  {
    id: 'dedication',
    name: 'Dedication',
    description: 'Care for pet every day for 30 days',
    icon: '⭐',
    category: 'special',
    rarity: 'platinum',
    requirement: '30-day streak',
    target: 30,
    current: 0,
    unlocked: false,
    rewards: { coins: 1000, xp: 500, title: 'Dedicated Caretaker' },
  },
  {
    id: 'legend',
    name: 'Pet Legend',
    description: 'Unlock all other achievements',
    icon: '🏆',
    category: 'special',
    rarity: 'diamond',
    requirement: 'Unlock everything',
    target: 1,
    current: 0,
    unlocked: false,
    rewards: { coins: 5000, xp: 2500, title: 'Pet Legend' },
  },
];

// Custom hook for pet achievements
export function usePetAchievements() {
  const [achievements, setAchievements] = useState<PetAchievement[]>(PET_ACHIEVEMENTS);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<PetAchievement | null>(null);

  const updateProgress = (achievementId: string, progress: number) => {
    setAchievements((prev) =>
      prev.map((achievement) => {
        if (achievement.id === achievementId && !achievement.unlocked) {
          const newCurrent = Math.min(progress, achievement.target);
          const isUnlocked = newCurrent >= achievement.target;

          if (isUnlocked && !achievement.unlocked) {
            const unlockedAch = { ...achievement, current: newCurrent, unlocked: true, unlockedAt: new Date() };
            setUnlockedAchievement(unlockedAch);
            setShowUnlockAnimation(true);
            setTimeout(() => setShowUnlockAnimation(false), 5000);
            return unlockedAch;
          }

          return { ...achievement, current: newCurrent };
        }
        return achievement;
      })
    );
  };

  const unlockAchievement = (achievementId: string) => {
    const achievement = achievements.find((a) => a.id === achievementId);
    if (!achievement || achievement.unlocked) return null;

    updateProgress(achievementId, achievement.target);
    return achievement;
  };

  const getAchievementsByCategory = (category: PetAchievement['category']) => {
    return achievements.filter((a) => a.category === category);
  };

  const getUnlockedAchievements = () => {
    return achievements.filter((a) => a.unlocked);
  };

  const getProgressPercentage = () => {
    const unlocked = achievements.filter((a) => a.unlocked).length;
    return Math.round((unlocked / achievements.length) * 100);
  };

  const getTotalRewardsEarned = () => {
    const unlocked = getUnlockedAchievements();
    return {
      coins: unlocked.reduce((sum, a) => sum + a.rewards.coins, 0),
      xp: unlocked.reduce((sum, a) => sum + a.rewards.xp, 0),
    };
  };

  const getUnlockedTitles = () => {
    return achievements
      .filter((a) => a.unlocked && a.rewards.title)
      .map((a) => a.rewards.title!);
  };

  return {
    achievements,
    updateProgress,
    unlockAchievement,
    getAchievementsByCategory,
    getUnlockedAchievements,
    getProgressPercentage,
    getTotalRewardsEarned,
    getUnlockedTitles,
    showUnlockAnimation,
    unlockedAchievement,
  };
}

// Main pet achievements component
export default function PetAchievements() {
  const {
    achievements,
    unlockAchievement,
    getAchievementsByCategory,
    getProgressPercentage,
    getTotalRewardsEarned,
    getUnlockedTitles,
    showUnlockAnimation,
    unlockedAchievement,
  } = usePetAchievements();

  const { settings } = useSettingsStore();
  const [selectedCategory, setSelectedCategory] = useState<PetAchievement['category'] | 'all'>('all');

  const filteredAchievements = selectedCategory === 'all'
    ? achievements
    : getAchievementsByCategory(selectedCategory);

  const progress = getProgressPercentage();
  const rewards = getTotalRewardsEarned();
  const titles = getUnlockedTitles();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🏆 Pet Achievements
      </h2>

      {/* Unlock animation */}
      <AnimatePresence>
        {showUnlockAnimation && unlockedAchievement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70"
          >
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-12 shadow-2xl text-center max-w-lg text-white">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.3, 1],
                }}
                transition={{ duration: 1, repeat: 3 }}
                className="text-9xl mb-6"
              >
                {unlockedAchievement.icon}
              </motion.div>
              <div className="text-5xl font-bold mb-4">Achievement Unlocked!</div>
              <div className="text-3xl mb-2">{unlockedAchievement.name}</div>
              <div className="text-xl opacity-90 mb-6">{unlockedAchievement.description}</div>
              <div className="bg-white bg-opacity-20 rounded-lg py-3 px-6 inline-block">
                <div className="text-lg font-bold">
                  Rewards: {unlockedAchievement.rewards.coins} Coins, {unlockedAchievement.rewards.xp} XP
                </div>
                {unlockedAchievement.rewards.title && (
                  <div className="text-sm mt-1">Title: "{unlockedAchievement.rewards.title}"</div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overall progress */}
      <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Overall Progress</h3>
          <div className="text-4xl font-bold text-purple-700">{progress}%</div>
        </div>

        <div className="h-4 bg-gray-200 rounded-full overflow-hidden mb-6">
          <motion.div
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">
              {achievements.filter((a) => a.unlocked).length}
            </div>
            <div className="text-xs text-gray-600">Unlocked</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">{rewards.coins}</div>
            <div className="text-xs text-gray-600">Coins Earned</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-600">{rewards.xp}</div>
            <div className="text-xs text-gray-600">XP Earned</div>
          </div>
        </div>
      </div>

      {/* Titles earned */}
      {titles.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl p-6">
          <h3 className="text-lg font-bold mb-3">Titles Earned ({titles.length})</h3>
          <div className="flex flex-wrap gap-2">
            {titles.map((title, i) => (
              <div key={i} className="px-4 py-2 bg-white bg-opacity-20 rounded-full font-bold">
                👑 {title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Filter by Category:
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-primary-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📋 All
          </button>
          {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, { label, icon }]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key as PetAchievement['category'])}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === key
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements list */}
      <div className="space-y-3">
        {filteredAchievements.map((achievement, index) => {
          const progress = (achievement.current / achievement.target) * 100;

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
              className={`rounded-xl p-6 transition-all ${
                achievement.unlocked
                  ? `bg-gradient-to-r ${ACHIEVEMENT_CATEGORIES[achievement.category].color} text-white shadow-lg`
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-6xl">{achievement.icon}</div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className={`font-bold text-xl mb-1 ${
                        achievement.unlocked ? 'text-white' : 'text-gray-900'
                      }`}>
                        {achievement.name}
                        {achievement.unlocked && ' ✓'}
                      </div>
                      <div className={`text-sm mb-2 ${
                        achievement.unlocked ? 'text-white opacity-90' : 'text-gray-600'
                      }`}>
                        {achievement.description}
                      </div>
                    </div>

                    <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      achievement.unlocked
                        ? 'bg-white bg-opacity-20 text-white'
                        : achievement.rarity === 'diamond'
                        ? 'bg-cyan-100 text-cyan-700'
                        : achievement.rarity === 'platinum'
                        ? 'bg-blue-100 text-blue-700'
                        : achievement.rarity === 'gold'
                        ? 'bg-yellow-100 text-yellow-700'
                        : achievement.rarity === 'silver'
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {achievement.rarity.toUpperCase()}
                    </div>
                  </div>

                  <div className={`text-sm mb-3 ${
                    achievement.unlocked ? 'text-white opacity-80' : 'text-gray-700'
                  }`}>
                    Reward: {achievement.rewards.coins} Coins, {achievement.rewards.xp} XP
                    {achievement.rewards.title && ` • "${achievement.rewards.title}"`}
                  </div>

                  {!achievement.unlocked && (
                    <>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-gray-700">Progress: {achievement.current} / {achievement.target}</span>
                        <span className="text-gray-600">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          animate={{ width: `${progress}%` }}
                          className={`h-full bg-gradient-to-r ${ACHIEVEMENT_CATEGORIES[achievement.category].color}`}
                        />
                      </div>
                    </>
                  )}

                  {achievement.unlocked && achievement.unlockedAt && (
                    <div className="text-sm text-white opacity-80">
                      Unlocked on {achievement.unlockedAt.toLocaleDateString()}
                    </div>
                  )}

                  {/* Test unlock button (for demo) */}
                  {!achievement.unlocked && (
                    <button
                      onClick={() => unlockAchievement(achievement.id)}
                      className="mt-3 px-4 py-2 bg-primary-500 text-white rounded-lg font-bold text-sm hover:bg-primary-600 transition-colors"
                    >
                      Unlock (Test)
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          Achievement Guide
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Complete tasks to unlock achievements</li>
          <li>• Earn coins, XP, and special titles</li>
          <li>• Higher rarity = better rewards</li>
          <li>• Track your progress for each achievement</li>
          <li>• Collect them all to become a Pet Legend!</li>
        </ul>
      </div>
    </div>
  );
}
