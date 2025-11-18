/**
 * Combo System Component
 * Step 212 - Build combo multipliers for consecutive correct actions
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Combo tier thresholds
const COMBO_TIERS = [
  { min: 0, max: 4, multiplier: 1, label: 'Getting Started', color: 'from-gray-400 to-gray-500' },
  { min: 5, max: 9, multiplier: 1.5, label: 'Nice!', color: 'from-blue-400 to-blue-500' },
  { min: 10, max: 19, multiplier: 2, label: 'Great!', color: 'from-green-400 to-green-500' },
  { min: 20, max: 29, multiplier: 2.5, label: 'Amazing!', color: 'from-purple-400 to-purple-500' },
  { min: 30, max: 49, multiplier: 3, label: 'Incredible!', color: 'from-orange-400 to-orange-500' },
  { min: 50, max: Infinity, multiplier: 4, label: 'LEGENDARY!', color: 'from-yellow-400 to-red-500' },
];

// Custom hook for combo system
export function useComboSystem() {
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [showComboAnimation, setShowComboAnimation] = useState(false);

  const getCurrentTier = () => {
    return COMBO_TIERS.find((tier) => combo >= tier.min && combo <= tier.max) || COMBO_TIERS[0];
  };

  const increaseCombo = () => {
    const newCombo = combo + 1;
    setCombo(newCombo);
    setShowComboAnimation(true);
    setTimeout(() => setShowComboAnimation(false), 500);

    if (newCombo > maxCombo) {
      setMaxCombo(newCombo);
    }

    return {
      combo: newCombo,
      multiplier: getCurrentTier().multiplier,
      isNewTier: COMBO_TIERS.some((tier) => tier.min === newCombo),
    };
  };

  const breakCombo = () => {
    setCombo(0);
  };

  const resetCombo = () => {
    setCombo(0);
    setMaxCombo(0);
  };

  const getMultiplier = () => {
    return getCurrentTier().multiplier;
  };

  const calculatePoints = (basePoints: number) => {
    return Math.round(basePoints * getMultiplier());
  };

  return {
    combo,
    maxCombo,
    increaseCombo,
    breakCombo,
    resetCombo,
    getMultiplier,
    calculatePoints,
    currentTier: getCurrentTier(),
    showComboAnimation,
  };
}

// Main combo system component
export default function ComboSystem() {
  const {
    combo,
    maxCombo,
    increaseCombo,
    breakCombo,
    resetCombo,
    getMultiplier,
    calculatePoints,
    currentTier,
    showComboAnimation,
  } = useComboSystem();

  const { settings } = useSettingsStore();
  const [testPoints, setTestPoints] = useState(100);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Combo Multipliers
      </h2>

      {/* Combo display */}
      <div className="mb-8">
        <motion.div
          animate={showComboAnimation ? { scale: [1, 1.2, 1] } : {}}
          className={`bg-gradient-to-r ${currentTier.color} rounded-2xl p-8 text-center shadow-xl`}
        >
          <div className="text-white text-sm font-bold mb-2 uppercase tracking-wide">
            Current Combo
          </div>
          <div className="text-white text-7xl font-bold mb-4">
            {combo}
          </div>
          <div className="text-white text-2xl font-bold mb-2">
            {currentTier.label}
          </div>
          <div className="text-white text-xl">
            {getMultiplier()}x Multiplier
          </div>
        </motion.div>

        <div className="mt-4 text-center text-gray-600">
          Best Combo: {maxCombo}
        </div>
      </div>

      {/* Tier progression */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Multiplier Tiers
        </h3>
        <div className="space-y-3">
          {COMBO_TIERS.map((tier, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
              className={`p-4 rounded-lg transition-all ${
                combo >= tier.min && combo <= tier.max
                  ? `bg-gradient-to-r ${tier.color} text-white shadow-lg`
                  : 'bg-white text-gray-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold">
                    {tier.min === 0 ? `${tier.min}-${tier.max}` :
                     tier.max === Infinity ? `${tier.min}+` :
                     `${tier.min}-${tier.max}`} Combo
                  </div>
                  <div className={`text-sm ${
                    combo >= tier.min && combo <= tier.max ? 'text-white opacity-90' : 'text-gray-600'
                  }`}>
                    {tier.label}
                  </div>
                </div>
                <div className="text-2xl font-bold">
                  {tier.multiplier}x
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Points calculator */}
      <div className="mb-8 bg-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-purple-900 mb-4">
          Points Calculator
        </h3>
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Base Points: {testPoints}
          </label>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={testPoints}
            onChange={(e) => setTestPoints(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="bg-white rounded-lg p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">With {getMultiplier()}x multiplier:</div>
          <div className="text-4xl font-bold text-purple-700">
            {calculatePoints(testPoints)} pts
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={increaseCombo}
          className="flex-1 py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-colors shadow-lg"
        >
          ✓ Correct (+1 Combo)
        </button>
        <button
          onClick={breakCombo}
          className="flex-1 py-4 bg-red-500 text-white rounded-xl font-bold text-lg hover:bg-red-600 transition-colors shadow-lg"
        >
          ✗ Break Combo
        </button>
      </div>

      <button
        onClick={resetCombo}
        className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
      >
        🔄 Reset
      </button>

      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          How Combos Work
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Each correct answer increases your combo</li>
          <li>• Higher combos give bigger point multipliers</li>
          <li>• Any mistake breaks your combo</li>
          <li>• Reach 50+ combo for legendary 4x multiplier!</li>
          <li>• Try to beat your personal best combo</li>
        </ul>
      </div>
    </div>
  );
}

// Compact combo display
export function ComboDisplay({ combo, multiplier }: { combo: number; multiplier: number }) {
  const tier = COMBO_TIERS.find((t) => combo >= t.min && combo <= t.max) || COMBO_TIERS[0];

  return (
    <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${tier.color} text-white px-6 py-3 rounded-full font-bold shadow-lg`}>
      <span className="text-2xl">🔥</span>
      <span className="text-xl">{combo}</span>
      <span className="text-sm opacity-90">({multiplier}x)</span>
    </div>
  );
}

// Combo break animation
export function ComboBreakAnimation({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <motion.div
            animate={{
              rotate: [0, -10, 10, -10, 10, 0],
            }}
            transition={{ duration: 0.5 }}
            className="text-9xl"
          >
            💔
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Combo tier up animation
export function ComboTierUpAnimation({
  show,
  tierLabel,
}: {
  show: boolean;
  tierLabel: string;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="text-6xl mb-4">🎉</div>
            <div className="text-3xl font-bold">{tierLabel}</div>
            <div className="text-xl mt-2">New Combo Tier!</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
