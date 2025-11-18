/**
 * Level Progression Component
 * Step 214 - Create level progression and unlocks system
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Level tier interface
interface LevelTier {
  level: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlocks: string[];
}

// Level tiers and rewards
export const LEVEL_TIERS: LevelTier[] = [
  {
    level: 1,
    title: 'Beginner',
    description: 'Just starting your typing journey',
    icon: '🌱',
    color: 'from-green-400 to-green-500',
    unlocks: ['Basic letters', 'Simple words'],
  },
  {
    level: 5,
    title: 'Learner',
    description: 'Making great progress!',
    icon: '📚',
    color: 'from-blue-400 to-blue-500',
    unlocks: ['Word practice', 'First pet accessory'],
  },
  {
    level: 10,
    title: 'Typer',
    description: 'Getting the hang of it',
    icon: '⌨️',
    color: 'from-purple-400 to-purple-500',
    unlocks: ['Sentence mode', 'New themes', 'Speed challenges'],
  },
  {
    level: 15,
    title: 'Skilled',
    description: 'Showing real talent!',
    icon: '⭐',
    color: 'from-yellow-400 to-yellow-500',
    unlocks: ['Story mode', 'Advanced stats', '2nd pet'],
  },
  {
    level: 20,
    title: 'Expert',
    description: 'You\'re really good at this',
    icon: '🎯',
    color: 'from-orange-400 to-orange-500',
    unlocks: ['Custom exercises', 'All pets', 'Leaderboards'],
  },
  {
    level: 30,
    title: 'Master',
    description: 'A true typing master',
    icon: '👑',
    color: 'from-red-400 to-red-500',
    unlocks: ['Master mode', 'Golden badge', 'All achievements'],
  },
  {
    level: 50,
    title: 'Legend',
    description: 'Legendary typing skills!',
    icon: '🏆',
    color: 'from-yellow-500 via-orange-500 to-red-500',
    unlocks: ['Legend badge', 'All content', 'Special certificate'],
  },
];

// Get tier for a given level
export function getTierForLevel(level: number): LevelTier {
  const tiers = [...LEVEL_TIERS].reverse();
  return tiers.find((tier) => level >= tier.level) || LEVEL_TIERS[0];
}

// Get next tier
export function getNextTier(currentLevel: number): LevelTier | null {
  return LEVEL_TIERS.find((tier) => tier.level > currentLevel) || null;
}

// Main level progression component
export default function LevelProgression() {
  const [currentLevel, setCurrentLevel] = useState(1);
  const { settings } = useSettingsStore();

  const currentTier = getTierForLevel(currentLevel);
  const nextTier = getNextTier(currentLevel);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Level Progression
      </h2>

      {/* Current level */}
      <div className="mb-8">
        <motion.div
          key={currentLevel}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`bg-gradient-to-r ${currentTier.color} rounded-2xl p-8 text-center text-white shadow-xl`}
        >
          <div className="text-7xl mb-4">{currentTier.icon}</div>
          <div className="text-sm font-bold uppercase tracking-wide opacity-90 mb-2">
            Level {currentLevel}
          </div>
          <div className="text-4xl font-bold mb-2">{currentTier.title}</div>
          <div className="text-lg opacity-90">{currentTier.description}</div>
        </motion.div>
      </div>

      {/* Level selector (for demo) */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Try Different Levels
        </h3>
        <input
          type="range"
          min="1"
          max="100"
          value={currentLevel}
          onChange={(e) => setCurrentLevel(parseInt(e.target.value))}
          className="w-full mb-4"
        />
        <div className="text-center font-bold text-2xl text-gray-900">
          Level {currentLevel}
        </div>
      </div>

      {/* Current unlocks */}
      <div className="mb-8 bg-green-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-green-900 mb-4">
          🎁 Your Unlocks
        </h3>
        <div className="space-y-2">
          {currentTier.unlocks.map((unlock, index) => (
            <motion.div
              key={unlock}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
              className="flex items-center gap-3 p-3 bg-white rounded-lg"
            >
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <span className="text-gray-900">{unlock}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Next tier */}
      {nextTier && (
        <div className="mb-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">
            Next Tier: Level {nextTier.level}
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">{nextTier.icon}</div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{nextTier.title}</div>
              <div className="text-gray-700">{nextTier.description}</div>
            </div>
          </div>
          <div className="mb-3 text-sm font-bold text-gray-700">
            Unlocks at Level {nextTier.level}:
          </div>
          <div className="space-y-2">
            {nextTier.unlocks.map((unlock) => (
              <div key={unlock} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-gray-700">{unlock}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-sm text-blue-700 font-bold">
            {nextTier.level - currentLevel} levels to go!
          </div>
        </div>
      )}

      {/* All tiers */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          All Level Tiers
        </h3>
        <div className="space-y-3">
          {LEVEL_TIERS.map((tier, index) => (
            <motion.div
              key={tier.level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
              className={`p-4 rounded-lg transition-all ${
                currentLevel >= tier.level
                  ? `bg-gradient-to-r ${tier.color} text-white shadow-lg`
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">{tier.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">Level {tier.level}</span>
                    <span className="text-xl">•</span>
                    <span className="font-bold">{tier.title}</span>
                  </div>
                  <div className={`text-sm ${
                    currentLevel >= tier.level ? 'opacity-90' : 'opacity-70'
                  }`}>
                    {tier.description}
                  </div>
                </div>
                {currentLevel >= tier.level && (
                  <div className="text-3xl">✓</div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="bg-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-purple-900 mb-3">
          Level Progression Info
        </h3>
        <ul className="space-y-2 text-sm text-purple-800">
          <li>• Gain XP to level up and unlock new content</li>
          <li>• Each tier brings exciting new features</li>
          <li>• Higher levels unlock pets, themes, and modes</li>
          <li>• Reach level 50 to become a Legend!</li>
        </ul>
      </div>
    </div>
  );
}

// Compact level badge
export function LevelBadge({ level }: { level: number }) {
  const tier = getTierForLevel(level);

  return (
    <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${tier.color} text-white px-4 py-2 rounded-full font-bold shadow-md`}>
      <span className="text-xl">{tier.icon}</span>
      <span>Lv. {level}</span>
    </div>
  );
}

// Level progress card
export function LevelProgressCard({ currentLevel, xp, xpNeeded }: { currentLevel: number; xp: number; xpNeeded: number }) {
  const tier = getTierForLevel(currentLevel);
  const nextTier = getNextTier(currentLevel);
  const progress = (xp / xpNeeded) * 100;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{tier.icon}</div>
          <div>
            <div className="text-sm text-gray-600">Level {currentLevel}</div>
            <div className="font-bold text-xl text-gray-900">{tier.title}</div>
          </div>
        </div>
        {nextTier && (
          <div className="text-right">
            <div className="text-xs text-gray-500">Next:</div>
            <div className="text-sm font-bold text-gray-700">{nextTier.title}</div>
          </div>
        )}
      </div>

      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${tier.color} transition-all duration-300`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-2 flex justify-between text-xs text-gray-600">
        <span>{xp} XP</span>
        <span>{xpNeeded} XP</span>
      </div>
    </div>
  );
}
