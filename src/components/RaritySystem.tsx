/**
 * Rarity System Component
 * Step 238 - Build advanced rarity system with drop rates and gacha mechanics
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import type { Sticker } from './StickerSystem';

// Rarity tier
export type RarityTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';

// Drop rate configuration
export interface DropRateConfig {
  rarity: RarityTier;
  baseRate: number; // 0-1 (e.g., 0.50 = 50%)
  pityCount: number; // Number of pulls before guaranteed
  name: string;
  color: string;
  sparkle: string;
}

// Pull result
export interface PullResult {
  item: Sticker;
  rarity: RarityTier;
  isNew: boolean;
  isPity: boolean;
}

// Pack type
export interface Pack {
  id: string;
  name: string;
  icon: string;
  cost: number;
  guaranteedRarity?: RarityTier;
  pullCount: number; // Number of items per pull
  description: string;
  backgroundColor: string;
}

// Pity system tracking
export interface PityTracker {
  [rarity: string]: number; // Pulls since last of this rarity
}

// Drop rate configurations
const DROP_RATES: DropRateConfig[] = [
  { rarity: 'common', baseRate: 0.50, pityCount: 2, name: 'Common', color: 'from-gray-400 to-gray-600', sparkle: '⚪' },
  { rarity: 'uncommon', baseRate: 0.30, pityCount: 5, name: 'Uncommon', color: 'from-green-400 to-green-600', sparkle: '🟢' },
  { rarity: 'rare', baseRate: 0.12, pityCount: 10, name: 'Rare', color: 'from-blue-400 to-blue-600', sparkle: '🔵' },
  { rarity: 'epic', baseRate: 0.05, pityCount: 25, name: 'Epic', color: 'from-purple-400 to-purple-600', sparkle: '🟣' },
  { rarity: 'legendary', baseRate: 0.02, pityCount: 50, name: 'Legendary', color: 'from-yellow-400 to-orange-600', sparkle: '🟡' },
  { rarity: 'mythic', baseRate: 0.01, pityCount: 100, name: 'Mythic', color: 'from-pink-400 to-red-600', sparkle: '🔴' },
];

// Available packs
const PACKS: Pack[] = [
  {
    id: 'basic',
    name: 'Basic Pack',
    icon: '📦',
    cost: 100,
    pullCount: 1,
    description: 'Standard pull with base drop rates',
    backgroundColor: 'from-gray-400 to-gray-600',
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    icon: '🎁',
    cost: 250,
    pullCount: 1,
    guaranteedRarity: 'rare',
    description: 'Guaranteed Rare or better!',
    backgroundColor: 'from-blue-400 to-purple-600',
  },
  {
    id: 'mega',
    name: 'Mega Pack',
    icon: '🎀',
    cost: 900,
    pullCount: 10,
    guaranteedRarity: 'epic',
    description: '10 pulls with guaranteed Epic!',
    backgroundColor: 'from-purple-400 to-pink-600',
  },
  {
    id: 'ultra',
    name: 'Ultra Pack',
    icon: '💎',
    cost: 2500,
    pullCount: 10,
    guaranteedRarity: 'legendary',
    description: '10 pulls with guaranteed Legendary!',
    backgroundColor: 'from-yellow-400 to-orange-600',
  },
];

// Custom hook for rarity system
export function useRaritySystem(availableStickers: Sticker[]) {
  const [coins, setCoins] = useState(5000);
  const [pityTracker, setPityTracker] = useState<PityTracker>({});
  const [pullHistory, setPullHistory] = useState<PullResult[]>([]);
  const [showPullAnimation, setShowPullAnimation] = useState(false);
  const [currentPulls, setCurrentPulls] = useState<PullResult[]>([]);

  const getRarityConfig = (rarity: RarityTier) => {
    return DROP_RATES.find((r) => r.rarity === rarity) || DROP_RATES[0];
  };

  const determineRarity = (guaranteedRarity?: RarityTier): RarityTier => {
    // Check pity system first
    for (const config of DROP_RATES.slice().reverse()) {
      const pullsSince = pityTracker[config.rarity] || 0;
      if (pullsSince >= config.pityCount) {
        return config.rarity;
      }
    }

    // Apply guaranteed rarity
    if (guaranteedRarity) {
      const random = Math.random();
      let cumulative = 0;

      // Redistribute rates for guaranteed minimum
      const minIndex = DROP_RATES.findIndex((r) => r.rarity === guaranteedRarity);
      const eligibleRates = DROP_RATES.slice(minIndex);
      const totalRate = eligibleRates.reduce((sum, r) => sum + r.baseRate, 0);

      for (const config of eligibleRates) {
        cumulative += config.baseRate / totalRate;
        if (random < cumulative) {
          return config.rarity;
        }
      }

      return guaranteedRarity;
    }

    // Normal random pull
    const random = Math.random();
    let cumulative = 0;

    for (const config of DROP_RATES) {
      cumulative += config.baseRate;
      if (random < cumulative) {
        return config.rarity;
      }
    }

    return 'common';
  };

  const pullFromPool = (guaranteedRarity?: RarityTier): PullResult => {
    const rarity = determineRarity(guaranteedRarity);
    const eligibleStickers = availableStickers.filter((s) => s.rarity === rarity);
    const randomSticker = eligibleStickers[Math.floor(Math.random() * eligibleStickers.length)];

    const result: PullResult = {
      item: randomSticker,
      rarity,
      isNew: !randomSticker.unlocked,
      isPity: (pityTracker[rarity] || 0) >= getRarityConfig(rarity).pityCount,
    };

    // Update pity tracker
    const newPity: PityTracker = {};
    DROP_RATES.forEach((config) => {
      if (config.rarity === rarity) {
        newPity[config.rarity] = 0; // Reset this rarity's pity
      } else {
        newPity[config.rarity] = (pityTracker[config.rarity] || 0) + 1;
      }
    });
    setPityTracker(newPity);

    return result;
  };

  const openPack = (pack: Pack) => {
    if (coins < pack.cost) {
      return { success: false, message: 'Not enough coins!' };
    }

    setCoins(coins - pack.cost);

    const pulls: PullResult[] = [];
    for (let i = 0; i < pack.pullCount; i++) {
      const isLastPull = i === pack.pullCount - 1;
      const guaranteedRarity = isLastPull ? pack.guaranteedRarity : undefined;
      pulls.push(pullFromPool(guaranteedRarity));
    }

    setPullHistory((prev) => [...pulls, ...prev].slice(0, 100));
    setCurrentPulls(pulls);
    setShowPullAnimation(true);

    return { success: true, pulls };
  };

  const addCoins = (amount: number) => {
    setCoins((prev) => prev + amount);
  };

  const getRarityStats = () => {
    return DROP_RATES.map((config) => {
      const pulls = pullHistory.filter((p) => p.rarity === config.rarity).length;
      const pityProgress = pityTracker[config.rarity] || 0;
      const pityPercentage = Math.round((pityProgress / config.pityCount) * 100);

      return {
        rarity: config.rarity,
        name: config.name,
        pulls,
        pityProgress,
        pityCount: config.pityCount,
        pityPercentage,
        baseRate: config.baseRate * 100,
      };
    });
  };

  return {
    coins,
    addCoins,
    openPack,
    pullHistory,
    getRarityStats,
    showPullAnimation,
    setShowPullAnimation,
    currentPulls,
    pityTracker,
  };
}

// Main rarity system component
export default function RaritySystem({ availableStickers }: { availableStickers: Sticker[] }) {
  const {
    coins,
    addCoins,
    openPack,
    pullHistory,
    getRarityStats,
    showPullAnimation,
    setShowPullAnimation,
    currentPulls,
  } = useRaritySystem(availableStickers);

  const { settings } = useSettingsStore();
  const rarityStats = getRarityStats();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🎲 Rarity System
      </h2>

      {/* Coin display */}
      <div className="mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white text-center">
        <div className="text-6xl font-bold mb-2">{coins} 🪙</div>
        <div className="text-xl">Your Coins</div>
        <button
          onClick={() => addCoins(1000)}
          className="mt-4 px-6 py-2 bg-white text-orange-600 rounded-lg font-bold hover:bg-gray-100 transition-colors"
        >
          + Add 1000 Coins (Test)
        </button>
      </div>

      {/* Available packs */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Available Packs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PACKS.map((pack, index) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
              className={`
                rounded-2xl overflow-hidden shadow-xl
                bg-gradient-to-br ${pack.backgroundColor}
                text-white
              `}
            >
              <div className="p-6 text-center">
                <div className="text-7xl mb-3">{pack.icon}</div>
                <div className="text-2xl font-bold mb-2">{pack.name}</div>
                <div className="text-sm opacity-90 mb-4">{pack.description}</div>

                <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-4">
                  <div className="text-3xl font-bold">{pack.cost} 🪙</div>
                  <div className="text-sm opacity-90">{pack.pullCount} pull{pack.pullCount > 1 ? 's' : ''}</div>
                </div>

                <button
                  onClick={() => openPack(pack)}
                  disabled={coins < pack.cost}
                  className={`
                    w-full py-3 rounded-xl font-bold text-lg transition-all
                    ${coins >= pack.cost
                      ? 'bg-white text-gray-900 hover:scale-105'
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    }
                  `}
                >
                  {coins >= pack.cost ? 'Open Pack!' : 'Not Enough Coins'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Drop rates */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Drop Rates & Pity System</h3>
        <div className="space-y-4">
          {rarityStats.map((stat, index) => {
            const config = DROP_RATES.find((r) => r.rarity === stat.rarity);
            return (
              <motion.div
                key={stat.rarity}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{config?.sparkle}</span>
                    <span className="font-bold text-gray-900">{stat.name}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.baseRate.toFixed(1)}% base rate • {stat.pulls} pulled
                  </div>
                </div>

                {/* Pity progress */}
                <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                  <motion.div
                    animate={{ width: `${stat.pityPercentage}%` }}
                    className={`h-full bg-gradient-to-r ${config?.color} relative`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                      {stat.pityProgress}/{stat.pityCount} to guaranteed
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Pull history */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Recent Pulls ({pullHistory.length})
        </h3>
        {pullHistory.length > 0 ? (
          <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
            {pullHistory.slice(0, 20).map((pull, i) => {
              const config = DROP_RATES.find((r) => r.rarity === pull.rarity);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: settings.reducedMotion ? 0 : i * 0.02 }}
                  className={`
                    relative aspect-square rounded-lg
                    bg-gradient-to-br ${config?.color}
                    flex items-center justify-center text-3xl
                    ${pull.isNew ? 'ring-4 ring-yellow-400' : ''}
                  `}
                >
                  {pull.item.emoji}
                  {pull.isPity && (
                    <div className="absolute -top-1 -right-1 text-xs">⭐</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎲</div>
            <div>No pulls yet. Open a pack to get started!</div>
          </div>
        )}
      </div>

      {/* Pull animation modal */}
      <AnimatePresence>
        {showPullAnimation && currentPulls.length > 0 && (
          <PullAnimationModal
            pulls={currentPulls}
            onComplete={() => setShowPullAnimation(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Pull animation modal
function PullAnimationModal({
  pulls,
  onComplete,
}: {
  pulls: PullResult[];
  onComplete: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { settings } = useSettingsStore();

  const currentPull = pulls[currentIndex];
  const config = DROP_RATES.find((r) => r.rarity === currentPull.rarity);

  const handleNext = () => {
    if (currentIndex < pulls.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      onClick={handleNext}
    >
      <div className="text-center">
        <motion.div
          key={currentIndex}
          initial={{ scale: 0, rotate: -360 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className={`
            bg-gradient-to-br ${config?.color}
            rounded-3xl p-12 mb-6 shadow-2xl
          `}
        >
          <motion.div
            animate={
              settings.reducedMotion
                ? {}
                : {
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0],
                  }
            }
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
            className="text-9xl mb-6"
          >
            {currentPull.item.emoji}
          </motion.div>

          <div className="text-white">
            <div className="text-4xl font-bold mb-2">{currentPull.item.name}</div>
            <div className="text-2xl mb-4">
              {config?.sparkle} {config?.name}
            </div>

            {currentPull.isNew && (
              <div className="bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full text-xl font-bold inline-block mb-2">
                ✨ NEW!
              </div>
            )}

            {currentPull.isPity && (
              <div className="bg-purple-400 text-purple-900 px-6 py-2 rounded-full text-xl font-bold inline-block">
                ⭐ PITY!
              </div>
            )}
          </div>
        </motion.div>

        <div className="text-white text-xl mb-4">
          {currentIndex + 1} / {pulls.length}
        </div>

        <button
          onClick={handleNext}
          className="px-12 py-4 bg-white text-gray-900 rounded-2xl font-bold text-xl hover:scale-105 transition-transform"
        >
          {currentIndex < pulls.length - 1 ? 'Next →' : 'Done! ✨'}
        </button>

        <div className="text-white text-sm mt-4 opacity-75">
          Click anywhere to continue
        </div>
      </div>
    </motion.div>
  );
}
