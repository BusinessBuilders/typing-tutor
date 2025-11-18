/**
 * Sticker System Component
 * Step 231 - Create sticker collection and reward system
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Sticker interface
export interface Sticker {
  id: string;
  name: string;
  emoji: string;
  category: 'achievement' | 'milestone' | 'special' | 'seasonal' | 'pet' | 'theme';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  description: string;
  unlockCondition: string;
  unlocked: boolean;
  unlockedAt?: Date;
  quantity: number; // For duplicates
}

// Sticker categories with display info
export const STICKER_CATEGORIES = [
  { id: 'achievement', name: 'Achievements', icon: '🏆', color: 'from-yellow-400 to-orange-500' },
  { id: 'milestone', name: 'Milestones', icon: '⭐', color: 'from-blue-400 to-purple-500' },
  { id: 'special', name: 'Special', icon: '✨', color: 'from-pink-400 to-red-500' },
  { id: 'seasonal', name: 'Seasonal', icon: '🎃', color: 'from-green-400 to-teal-500' },
  { id: 'pet', name: 'Pet Friends', icon: '🐾', color: 'from-purple-400 to-pink-500' },
  { id: 'theme', name: 'Themes', icon: '🎨', color: 'from-indigo-400 to-blue-500' },
] as const;

// Rarity levels with display info
export const RARITY_LEVELS = [
  { level: 'common', name: 'Common', color: 'from-gray-400 to-gray-500', sparkle: '⚪', probability: 0.50 },
  { level: 'uncommon', name: 'Uncommon', color: 'from-green-400 to-green-500', sparkle: '🟢', probability: 0.30 },
  { level: 'rare', name: 'Rare', color: 'from-blue-400 to-blue-500', sparkle: '🔵', probability: 0.12 },
  { level: 'epic', name: 'Epic', color: 'from-purple-400 to-purple-500', sparkle: '🟣', probability: 0.05 },
  { level: 'legendary', name: 'Legendary', color: 'from-yellow-400 to-orange-500', sparkle: '🟡', probability: 0.02 },
  { level: 'mythic', name: 'Mythic', color: 'from-pink-400 to-red-500', sparkle: '🔴', probability: 0.01 },
] as const;

// Default sticker collection
const DEFAULT_STICKERS: Sticker[] = [
  // Achievement stickers
  { id: 'first_lesson', name: 'First Lesson', emoji: '📚', category: 'achievement', rarity: 'common', description: 'Completed your first lesson', unlockCondition: 'Complete 1 lesson', unlocked: false, quantity: 0 },
  { id: 'speed_demon', name: 'Speed Demon', emoji: '⚡', category: 'achievement', rarity: 'epic', description: 'Reached 100 WPM', unlockCondition: 'Type at 100+ WPM', unlocked: false, quantity: 0 },
  { id: 'perfect_score', name: 'Perfect Score', emoji: '💯', category: 'achievement', rarity: 'legendary', description: '100% accuracy on a lesson', unlockCondition: 'Get 100% accuracy', unlocked: false, quantity: 0 },

  // Milestone stickers
  { id: 'level_10', name: 'Level 10', emoji: '🎯', category: 'milestone', rarity: 'uncommon', description: 'Reached level 10', unlockCondition: 'Reach level 10', unlocked: false, quantity: 0 },
  { id: 'level_50', name: 'Level 50', emoji: '🏅', category: 'milestone', rarity: 'rare', description: 'Reached level 50', unlockCondition: 'Reach level 50', unlocked: false, quantity: 0 },
  { id: 'level_100', name: 'Level 100', emoji: '👑', category: 'milestone', rarity: 'legendary', description: 'Reached level 100', unlockCondition: 'Reach level 100', unlocked: false, quantity: 0 },

  // Special stickers
  { id: 'streak_7', name: '7 Day Streak', emoji: '🔥', category: 'special', rarity: 'uncommon', description: 'Practice 7 days in a row', unlockCondition: '7 day streak', unlocked: false, quantity: 0 },
  { id: 'streak_30', name: '30 Day Streak', emoji: '💪', category: 'special', rarity: 'epic', description: 'Practice 30 days in a row', unlockCondition: '30 day streak', unlocked: false, quantity: 0 },
  { id: 'night_owl', name: 'Night Owl', emoji: '🦉', category: 'special', rarity: 'rare', description: 'Practice after midnight', unlockCondition: 'Practice after 12 AM', unlocked: false, quantity: 0 },

  // Seasonal stickers
  { id: 'halloween', name: 'Halloween Spirit', emoji: '👻', category: 'seasonal', rarity: 'rare', description: 'Practice during Halloween', unlockCondition: 'Practice in October', unlocked: false, quantity: 0 },
  { id: 'winter', name: 'Winter Wonder', emoji: '❄️', category: 'seasonal', rarity: 'rare', description: 'Practice during winter', unlockCondition: 'Practice in December', unlocked: false, quantity: 0 },
  { id: 'new_year', name: 'New Year', emoji: '🎊', category: 'seasonal', rarity: 'epic', description: 'Practice on New Year', unlockCondition: 'Practice on Jan 1', unlocked: false, quantity: 0 },

  // Pet stickers
  { id: 'pet_owner', name: 'Pet Owner', emoji: '🐱', category: 'pet', rarity: 'common', description: 'Got your first pet', unlockCondition: 'Create a pet', unlocked: false, quantity: 0 },
  { id: 'pet_master', name: 'Pet Master', emoji: '🦁', category: 'pet', rarity: 'legendary', description: 'Evolved pet to master', unlockCondition: 'Evolve pet to master', unlocked: false, quantity: 0 },
  { id: 'pet_happy', name: 'Happy Pet', emoji: '😸', category: 'pet', rarity: 'uncommon', description: 'Pet happiness at 100%', unlockCondition: 'Pet happiness 100%', unlocked: false, quantity: 0 },

  // Theme stickers
  { id: 'rainbow', name: 'Rainbow', emoji: '🌈', category: 'theme', rarity: 'rare', description: 'Unlocked all themes', unlockCondition: 'Unlock all themes', unlocked: false, quantity: 0 },
  { id: 'dark_mode', name: 'Dark Mode', emoji: '🌙', category: 'theme', rarity: 'uncommon', description: 'Used dark mode', unlockCondition: 'Use dark mode', unlocked: false, quantity: 0 },
  { id: 'colorful', name: 'Colorful', emoji: '🎨', category: 'theme', rarity: 'common', description: 'Changed theme color', unlockCondition: 'Change theme', unlocked: false, quantity: 0 },

  // More special/mythic stickers
  { id: 'super_star', name: 'Super Star', emoji: '⭐', category: 'special', rarity: 'mythic', description: 'Collected all other stickers', unlockCondition: 'Collect all stickers', unlocked: false, quantity: 0 },
  { id: 'time_traveler', name: 'Time Traveler', emoji: '⏰', category: 'special', rarity: 'mythic', description: 'Practiced every hour of the day', unlockCondition: 'Practice in all 24 hours', unlocked: false, quantity: 0 },
];

// Custom hook for sticker system
export function useStickerSystem() {
  const [stickers, setStickers] = useState<Sticker[]>(DEFAULT_STICKERS);
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [newUnlocks, setNewUnlocks] = useState<Sticker[]>([]);

  const unlockSticker = (stickerId: string) => {
    const sticker = stickers.find((s) => s.id === stickerId);
    if (!sticker) return null;

    const updatedSticker: Sticker = {
      ...sticker,
      unlocked: true,
      unlockedAt: sticker.unlockedAt || new Date(),
      quantity: sticker.quantity + 1,
    };

    setStickers((prev) =>
      prev.map((s) => (s.id === stickerId ? updatedSticker : s))
    );

    // Show unlock animation
    setNewUnlocks((prev) => [...prev, updatedSticker]);
    setTimeout(() => {
      setNewUnlocks((prev) => prev.filter((s) => s.id !== stickerId));
    }, 3000);

    return updatedSticker;
  };

  const getStickersByCategory = (category: Sticker['category']) => {
    return stickers.filter((s) => s.category === category);
  };

  const getStickersByRarity = (rarity: Sticker['rarity']) => {
    return stickers.filter((s) => s.rarity === rarity);
  };

  const getUnlockedStickers = () => {
    return stickers.filter((s) => s.unlocked);
  };

  const getLockedStickers = () => {
    return stickers.filter((s) => !s.unlocked);
  };

  const getCollectionProgress = () => {
    const unlocked = getUnlockedStickers().length;
    const total = stickers.length;
    return {
      unlocked,
      total,
      percentage: Math.round((unlocked / total) * 100),
    };
  };

  const getTotalQuantity = () => {
    return stickers.reduce((sum, s) => sum + s.quantity, 0);
  };

  const getRarityProgress = () => {
    return RARITY_LEVELS.map((rarity) => {
      const total = stickers.filter((s) => s.rarity === rarity.level).length;
      const unlocked = stickers.filter(
        (s) => s.rarity === rarity.level && s.unlocked
      ).length;
      return {
        rarity: rarity.level,
        unlocked,
        total,
        percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
      };
    });
  };

  const getCategoryProgress = () => {
    return STICKER_CATEGORIES.map((category) => {
      const total = stickers.filter((s) => s.category === category.id).length;
      const unlocked = stickers.filter(
        (s) => s.category === category.id && s.unlocked
      ).length;
      return {
        category: category.id,
        unlocked,
        total,
        percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
      };
    });
  };

  return {
    stickers,
    selectedSticker,
    setSelectedSticker,
    newUnlocks,
    unlockSticker,
    getStickersByCategory,
    getStickersByRarity,
    getUnlockedStickers,
    getLockedStickers,
    getCollectionProgress,
    getTotalQuantity,
    getRarityProgress,
    getCategoryProgress,
  };
}

// Main sticker system component
export default function StickerSystem() {
  const {
    stickers,
    selectedSticker,
    setSelectedSticker,
    newUnlocks,
    unlockSticker,
    getCollectionProgress,
    getTotalQuantity,
    getRarityProgress,
    getCategoryProgress,
  } = useStickerSystem();

  const { settings } = useSettingsStore();
  const [selectedCategory, setSelectedCategory] = useState<Sticker['category'] | 'all'>('all');
  const [selectedRarity, setSelectedRarity] = useState<Sticker['rarity'] | 'all'>('all');

  const progress = getCollectionProgress();
  const rarityProgress = getRarityProgress();
  const categoryProgress = getCategoryProgress();

  // Filter stickers
  const filteredStickers = stickers.filter((sticker) => {
    if (selectedCategory !== 'all' && sticker.category !== selectedCategory) return false;
    if (selectedRarity !== 'all' && sticker.rarity !== selectedRarity) return false;
    return true;
  });

  const getRarityInfo = (rarity: Sticker['rarity']) => {
    return RARITY_LEVELS.find((r) => r.level === rarity);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🎉 Sticker Collection
      </h2>

      {/* Progress overview */}
      <div className="mb-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl p-8 text-white">
        <div className="text-center mb-4">
          <div className="text-6xl font-bold mb-2">{progress.unlocked}/{progress.total}</div>
          <div className="text-xl">Stickers Collected</div>
        </div>

        <div className="bg-white bg-opacity-20 rounded-full h-4 overflow-hidden">
          <motion.div
            animate={{ width: `${progress.percentage}%` }}
            className="h-full bg-white"
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="text-center mt-4">
          <div className="text-lg">{progress.percentage}% Complete</div>
          <div className="text-sm opacity-90">Total Collected: {getTotalQuantity()}</div>
        </div>
      </div>

      {/* Category progress */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Category Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {STICKER_CATEGORIES.map((category, index) => {
            const catProgress = categoryProgress.find((c) => c.category === category.id);
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                className={`bg-gradient-to-r ${category.color} rounded-xl p-4 text-white cursor-pointer hover:scale-105 transition-transform`}
                onClick={() => setSelectedCategory(selectedCategory === category.id ? 'all' : category.id as Sticker['category'])}
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <div className="font-bold">{category.name}</div>
                <div className="text-sm opacity-90">
                  {catProgress?.unlocked}/{catProgress?.total}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Rarity progress */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Rarity Progress</h3>
        <div className="space-y-3">
          {RARITY_LEVELS.map((rarity, index) => {
            const rarProgress = rarityProgress.find((r) => r.rarity === rarity.level);
            return (
              <motion.div
                key={rarity.level}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                className="cursor-pointer"
                onClick={() => setSelectedRarity(selectedRarity === rarity.level ? 'all' : rarity.level as Sticker['rarity'])}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{rarity.sparkle}</span>
                    <span className="font-bold text-gray-900">{rarity.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {rarProgress?.unlocked}/{rarProgress?.total} ({Math.round(rarity.probability * 100)}% drop rate)
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${rarProgress?.percentage || 0}%` }}
                    className={`h-full bg-gradient-to-r ${rarity.color}`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Filter status */}
      {(selectedCategory !== 'all' || selectedRarity !== 'all') && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Active filters:</span>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold hover:bg-purple-200"
            >
              {STICKER_CATEGORIES.find((c) => c.id === selectedCategory)?.name} ✕
            </button>
          )}
          {selectedRarity !== 'all' && (
            <button
              onClick={() => setSelectedRarity('all')}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold hover:bg-blue-200"
            >
              {getRarityInfo(selectedRarity)?.name} ✕
            </button>
          )}
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedRarity('all');
            }}
            className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold hover:bg-red-200"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Sticker grid */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {filteredStickers.length} Stickers
        </h3>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {filteredStickers.map((sticker, index) => {
            const rarityInfo = getRarityInfo(sticker.rarity);
            return (
              <motion.div
                key={sticker.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.02 }}
                onClick={() => setSelectedSticker(sticker)}
                className={`
                  relative aspect-square rounded-xl cursor-pointer transition-all
                  ${sticker.unlocked
                    ? `bg-gradient-to-br ${rarityInfo?.color} hover:scale-110 shadow-lg`
                    : 'bg-gray-200 hover:bg-gray-300'
                  }
                  flex items-center justify-center
                `}
              >
                <div className="text-4xl">
                  {sticker.unlocked ? sticker.emoji : '🔒'}
                </div>
                {sticker.unlocked && sticker.quantity > 1 && (
                  <div className="absolute top-1 right-1 bg-white bg-opacity-90 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {sticker.quantity}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Test unlock button */}
      <div className="bg-green-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-green-900 mb-3">
          Test Unlock (Development Only)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {stickers.slice(0, 6).map((sticker) => (
            <button
              key={sticker.id}
              onClick={() => unlockSticker(sticker.id)}
              className="py-2 px-3 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600 transition-colors"
            >
              {sticker.emoji} {sticker.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sticker detail modal */}
      <AnimatePresence>
        {selectedSticker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedSticker(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className={`
                bg-gradient-to-br ${getRarityInfo(selectedSticker.rarity)?.color}
                rounded-2xl p-8 max-w-md w-full text-white shadow-2xl
              `}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-8xl mb-4">
                  {selectedSticker.unlocked ? selectedSticker.emoji : '🔒'}
                </div>
                <div className="text-3xl font-bold mb-2">{selectedSticker.name}</div>
                <div className="text-xl mb-4 opacity-90">
                  {getRarityInfo(selectedSticker.rarity)?.name}
                </div>
                <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-4">
                  <p className="text-lg">{selectedSticker.description}</p>
                </div>
                {!selectedSticker.unlocked && (
                  <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-4">
                    <div className="text-sm font-bold mb-1">How to unlock:</div>
                    <div className="text-base">{selectedSticker.unlockCondition}</div>
                  </div>
                )}
                {selectedSticker.unlocked && (
                  <div className="space-y-2">
                    <div className="bg-white bg-opacity-20 rounded-lg p-3">
                      <div className="text-sm">Quantity Owned</div>
                      <div className="text-2xl font-bold">{selectedSticker.quantity}</div>
                    </div>
                    {selectedSticker.unlockedAt && (
                      <div className="bg-white bg-opacity-20 rounded-lg p-3">
                        <div className="text-sm">Unlocked On</div>
                        <div className="font-bold">
                          {selectedSticker.unlockedAt.toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <button
                  onClick={() => setSelectedSticker(null)}
                  className="mt-6 w-full py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New unlock notifications */}
      <AnimatePresence>
        {newUnlocks.map((sticker, index) => (
          <motion.div
            key={sticker.id}
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.5 }}
            className="fixed bottom-8 right-8 z-50"
            style={{ marginBottom: index * 120 }}
          >
            <div className={`bg-gradient-to-br ${getRarityInfo(sticker.rarity)?.color} rounded-2xl p-6 text-white shadow-2xl`}>
              <div className="text-center">
                <div className="text-6xl mb-2">{sticker.emoji}</div>
                <div className="text-xl font-bold mb-1">New Sticker!</div>
                <div className="text-lg">{sticker.name}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Compact sticker display
export function StickerBadge({ sticker }: { sticker: Sticker }) {
  const rarityInfo = RARITY_LEVELS.find((r) => r.level === sticker.rarity);

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${rarityInfo?.color} text-white shadow-md`}>
      <span className="text-2xl">{sticker.emoji}</span>
      <div>
        <div className="text-xs opacity-90">{rarityInfo?.name}</div>
        <div className="font-bold text-sm">{sticker.name}</div>
      </div>
      {sticker.quantity > 1 && (
        <div className="bg-white bg-opacity-30 rounded-full px-2 py-1 text-xs font-bold">
          ×{sticker.quantity}
        </div>
      )}
    </div>
  );
}

// Sticker unlock animation
export function StickerUnlockAnimation({ sticker, onComplete }: { sticker: Sticker; onComplete: () => void }) {
  const rarityInfo = RARITY_LEVELS.find((r) => r.level === sticker.rarity);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={onComplete}
    >
      <motion.div
        animate={{
          rotate: [0, 5, -5, 5, -5, 0],
          scale: [1, 1.1, 1, 1.1, 1],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`bg-gradient-to-br ${rarityInfo?.color} rounded-2xl p-12 text-white shadow-2xl text-center`}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-9xl mb-4"
        >
          {sticker.emoji}
        </motion.div>
        <div className="text-4xl font-bold mb-2">New Sticker!</div>
        <div className="text-2xl mb-4">{sticker.name}</div>
        <div className="text-xl opacity-90">{rarityInfo?.name}</div>
      </motion.div>
    </motion.div>
  );
}
