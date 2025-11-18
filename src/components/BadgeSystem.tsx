/**
 * Badge System Component
 * Step 215 - Build badge collection and achievement badges
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Badge interface
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

// Sample badges
const BADGES: Badge[] = [
  {
    id: 'first_word',
    name: 'First Word',
    description: 'Typed your very first word',
    icon: '🎯',
    rarity: 'common',
    requirement: 'Type 1 word correctly',
    unlocked: false,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Reached 50 WPM typing speed',
    icon: '⚡',
    rarity: 'rare',
    requirement: 'Type at 50+ WPM',
    unlocked: false,
  },
  {
    id: 'perfect_accuracy',
    name: 'Perfectionist',
    description: 'Achieved 100% accuracy',
    icon: '💯',
    rarity: 'epic',
    requirement: 'Complete lesson with 100% accuracy',
    unlocked: false,
  },
  {
    id: 'week_streak',
    name: 'Week Warrior',
    description: 'Practiced for 7 days straight',
    icon: '🔥',
    rarity: 'rare',
    requirement: 'Maintain 7-day streak',
    unlocked: false,
  },
  {
    id: 'combo_king',
    name: 'Combo King',
    description: 'Reached a 50+ combo',
    icon: '👑',
    rarity: 'epic',
    requirement: 'Get 50 combo streak',
    unlocked: false,
  },
  {
    id: 'level_10',
    name: 'Rising Star',
    description: 'Reached level 10',
    icon: '⭐',
    rarity: 'rare',
    requirement: 'Reach level 10',
    unlocked: false,
  },
  {
    id: 'master_typer',
    name: 'Master Typer',
    description: 'Completed all lessons',
    icon: '🎓',
    rarity: 'legendary',
    requirement: 'Complete all lessons',
    unlocked: false,
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Practiced before 8 AM',
    icon: '🌅',
    rarity: 'common',
    requirement: 'Practice before 8 AM',
    unlocked: false,
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Practiced after 10 PM',
    icon: '🦉',
    rarity: 'common',
    requirement: 'Practice after 10 PM',
    unlocked: false,
  },
  {
    id: 'legend',
    name: 'Legend',
    description: 'Reached level 50',
    icon: '🏆',
    rarity: 'legendary',
    requirement: 'Reach level 50',
    unlocked: false,
  },
];

// Rarity colors
const RARITY_COLORS = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-500 to-pink-600',
  legendary: 'from-yellow-400 via-orange-500 to-red-500',
};

// Custom hook for badge system
export function useBadgeSystem() {
  const [badges, setBadges] = useState<Badge[]>(BADGES);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<Badge | null>(null);

  const unlockBadge = (badgeId: string) => {
    const badge = badges.find((b) => b.id === badgeId);
    if (!badge || badge.unlocked) return null;

    const updatedBadges = badges.map((b) =>
      b.id === badgeId
        ? { ...b, unlocked: true, unlockedAt: new Date() }
        : b
    );

    setBadges(updatedBadges);
    setRecentlyUnlocked(badge);

    setTimeout(() => setRecentlyUnlocked(null), 5000);

    return badge;
  };

  const getUnlockedBadges = () => badges.filter((b) => b.unlocked);
  const getLockedBadges = () => badges.filter((b) => !b.unlocked);
  const getBadgesByRarity = (rarity: Badge['rarity']) =>
    badges.filter((b) => b.rarity === rarity);

  const unlockProgress = (badges.filter((b) => b.unlocked).length / badges.length) * 100;

  return {
    badges,
    unlockBadge,
    getUnlockedBadges,
    getLockedBadges,
    getBadgesByRarity,
    unlockProgress,
    recentlyUnlocked,
  };
}

// Main badge system component
export default function BadgeSystem() {
  const {
    badges,
    unlockBadge,
    getUnlockedBadges,
    unlockProgress,
    recentlyUnlocked,
  } = useBadgeSystem();

  const { settings } = useSettingsStore();
  const [filter, setFilter] = useState<'all' | Badge['rarity']>('all');

  const filteredBadges =
    filter === 'all' ? badges : badges.filter((b) => b.rarity === filter);

  const unlockedCount = getUnlockedBadges().length;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Badge Collection
      </h2>

      {/* Progress */}
      <div className="mb-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold">Collection Progress</span>
          <span className="text-2xl font-bold">
            {unlockedCount} / {badges.length}
          </span>
        </div>
        <div className="h-4 bg-white bg-opacity-20 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${unlockProgress}%` }}
            className="h-full bg-white rounded-full"
          />
        </div>
        <div className="text-center mt-2 text-sm">
          {Math.round(unlockProgress)}% Complete
        </div>
      </div>

      {/* Unlock notification */}
      <AnimatePresence>
        {recentlyUnlocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className={`bg-gradient-to-r ${RARITY_COLORS[recentlyUnlocked.rarity]} text-white rounded-3xl p-12 shadow-2xl text-center max-w-md`}>
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 0.6 }}
                className="text-9xl mb-6"
              >
                {recentlyUnlocked.icon}
              </motion.div>
              <div className="text-3xl font-bold mb-4">Badge Unlocked!</div>
              <div className="text-2xl mb-2">{recentlyUnlocked.name}</div>
              <div className="text-lg opacity-90">{recentlyUnlocked.description}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            filter === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {(['common', 'rare', 'epic', 'legendary'] as Badge['rarity'][]).map((rarity) => (
          <button
            key={rarity}
            onClick={() => setFilter(rarity)}
            className={`px-4 py-2 rounded-lg font-bold capitalize transition-all ${
              filter === rarity
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {rarity}
          </button>
        ))}
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filteredBadges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
            whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
            onClick={() => !badge.unlocked && unlockBadge(badge.id)}
            className={`p-6 rounded-xl text-center cursor-pointer transition-all ${
              badge.unlocked
                ? `bg-gradient-to-br ${RARITY_COLORS[badge.rarity]} text-white shadow-lg`
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <div className={`text-6xl mb-3 ${badge.unlocked ? '' : 'grayscale opacity-50'}`}>
              {badge.icon}
            </div>
            <div className="font-bold mb-1">{badge.name}</div>
            <div className={`text-xs mb-2 ${badge.unlocked ? 'opacity-90' : 'opacity-70'}`}>
              {badge.description}
            </div>
            <div className={`text-xs font-bold capitalize ${
              badge.unlocked ? 'opacity-80' : 'opacity-60'
            }`}>
              {badge.rarity}
            </div>
            {!badge.unlocked && (
              <div className="text-xs mt-2 opacity-70">
                {badge.requirement}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          Badge Rarity Guide
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-gray-400 to-gray-500 rounded" />
            <span><strong>Common:</strong> Easy to unlock, available to all</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded" />
            <span><strong>Rare:</strong> Requires dedication and practice</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded" />
            <span><strong>Epic:</strong> For exceptional achievements</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded" />
            <span><strong>Legendary:</strong> The ultimate accomplishments</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Badge display component
export function BadgeDisplay({ badge }: { badge: Badge }) {
  return (
    <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${RARITY_COLORS[badge.rarity]} text-white px-4 py-2 rounded-full font-bold shadow-md`}>
      <span className="text-xl">{badge.icon}</span>
      <span>{badge.name}</span>
    </div>
  );
}
