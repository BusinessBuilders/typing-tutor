/**
 * Pet Customization Component
 * Step 223 - Add pet appearance and personality customization
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import type { Pet } from './PetSystem';

// Customization options
export interface CustomizationOption {
  id: string;
  name: string;
  category: 'color' | 'accessory' | 'pattern' | 'personality';
  icon: string;
  cost: number;
  unlocked: boolean;
  unlockRequirement?: string;
}

// Pet colors
const PET_COLORS: CustomizationOption[] = [
  { id: 'default', name: 'Default', category: 'color', icon: '🎨', cost: 0, unlocked: true },
  { id: 'red', name: 'Ruby Red', category: 'color', icon: '🔴', cost: 50, unlocked: false },
  { id: 'blue', name: 'Ocean Blue', category: 'color', icon: '🔵', cost: 50, unlocked: false },
  { id: 'green', name: 'Forest Green', category: 'color', icon: '🟢', cost: 50, unlocked: false },
  { id: 'purple', name: 'Royal Purple', category: 'color', icon: '🟣', cost: 100, unlocked: false, unlockRequirement: 'Reach level 10' },
  { id: 'gold', name: 'Golden', category: 'color', icon: '🟡', cost: 200, unlocked: false, unlockRequirement: 'Reach level 25' },
  { id: 'rainbow', name: 'Rainbow', category: 'color', icon: '🌈', cost: 500, unlocked: false, unlockRequirement: 'Reach level 50' },
];

// Pet accessories
const PET_ACCESSORIES: CustomizationOption[] = [
  { id: 'none', name: 'None', category: 'accessory', icon: '❌', cost: 0, unlocked: true },
  { id: 'hat', name: 'Party Hat', category: 'accessory', icon: '🎩', cost: 75, unlocked: false },
  { id: 'bow', name: 'Bow Tie', category: 'accessory', icon: '🎀', cost: 75, unlocked: false },
  { id: 'crown', name: 'Crown', category: 'accessory', icon: '👑', cost: 150, unlocked: false, unlockRequirement: 'Reach level 15' },
  { id: 'glasses', name: 'Sunglasses', category: 'accessory', icon: '🕶️', cost: 100, unlocked: false },
  { id: 'scarf', name: 'Scarf', category: 'accessory', icon: '🧣', cost: 80, unlocked: false },
  { id: 'bandana', name: 'Bandana', category: 'accessory', icon: '🎽', cost: 90, unlocked: false },
  { id: 'wings', name: 'Angel Wings', category: 'accessory', icon: '👼', cost: 300, unlocked: false, unlockRequirement: 'Reach level 30' },
];

// Pet patterns
const PET_PATTERNS: CustomizationOption[] = [
  { id: 'solid', name: 'Solid', category: 'pattern', icon: '⬜', cost: 0, unlocked: true },
  { id: 'spots', name: 'Spots', category: 'pattern', icon: '🔘', cost: 60, unlocked: false },
  { id: 'stripes', name: 'Stripes', category: 'pattern', icon: '📏', cost: 60, unlocked: false },
  { id: 'gradient', name: 'Gradient', category: 'pattern', icon: '🌅', cost: 100, unlocked: false },
  { id: 'sparkles', name: 'Sparkles', category: 'pattern', icon: '✨', cost: 150, unlocked: false, unlockRequirement: 'Reach level 20' },
  { id: 'galaxy', name: 'Galaxy', category: 'pattern', icon: '🌌', cost: 250, unlocked: false, unlockRequirement: 'Reach level 35' },
];

// Personality traits
const PERSONALITY_TRAITS: CustomizationOption[] = [
  { id: 'friendly', name: 'Friendly', category: 'personality', icon: '😊', cost: 0, unlocked: true },
  { id: 'playful', name: 'Playful', category: 'personality', icon: '🤪', cost: 50, unlocked: false },
  { id: 'calm', name: 'Calm', category: 'personality', icon: '😌', cost: 50, unlocked: false },
  { id: 'energetic', name: 'Energetic', category: 'personality', icon: '⚡', cost: 75, unlocked: false },
  { id: 'sleepy', name: 'Sleepy', category: 'personality', icon: '😴', cost: 60, unlocked: false },
  { id: 'curious', name: 'Curious', category: 'personality', icon: '🧐', cost: 80, unlocked: false },
  { id: 'brave', name: 'Brave', category: 'personality', icon: '🦸', cost: 100, unlocked: false, unlockRequirement: 'Complete 50 lessons' },
];

// Custom hook for pet customization
export function usePetCustomization() {
  const [colors, setColors] = useState(PET_COLORS);
  const [accessories, setAccessories] = useState(PET_ACCESSORIES);
  const [patterns, setPatterns] = useState(PET_PATTERNS);
  const [personalities, setPersonalities] = useState(PERSONALITY_TRAITS);

  const [selectedColor, setSelectedColor] = useState('default');
  const [selectedAccessory, setSelectedAccessory] = useState('none');
  const [selectedPattern, setSelectedPattern] = useState('solid');
  const [selectedPersonality, setSelectedPersonality] = useState('friendly');

  const unlockOption = (optionId: string, category: CustomizationOption['category']) => {
    const updateList = (list: CustomizationOption[]) =>
      list.map((option) =>
        option.id === optionId ? { ...option, unlocked: true } : option
      );

    switch (category) {
      case 'color':
        setColors(updateList);
        break;
      case 'accessory':
        setAccessories(updateList);
        break;
      case 'pattern':
        setPatterns(updateList);
        break;
      case 'personality':
        setPersonalities(updateList);
        break;
    }
  };

  const getCustomizationSummary = () => {
    return {
      color: colors.find((c) => c.id === selectedColor),
      accessory: accessories.find((a) => a.id === selectedAccessory),
      pattern: patterns.find((p) => p.id === selectedPattern),
      personality: personalities.find((p) => p.id === selectedPersonality),
    };
  };

  return {
    colors,
    accessories,
    patterns,
    personalities,
    selectedColor,
    selectedAccessory,
    selectedPattern,
    selectedPersonality,
    setSelectedColor,
    setSelectedAccessory,
    setSelectedPattern,
    setSelectedPersonality,
    unlockOption,
    getCustomizationSummary,
  };
}

// Main pet customization component
export default function PetCustomization({ pet, coins = 0 }: { pet: Pet | null; coins?: number }) {
  const {
    colors,
    accessories,
    patterns,
    personalities,
    selectedColor,
    selectedAccessory,
    selectedPattern,
    selectedPersonality,
    setSelectedColor,
    setSelectedAccessory,
    setSelectedPattern,
    setSelectedPersonality,
    unlockOption,
    getCustomizationSummary,
  } = usePetCustomization();

  const { settings } = useSettingsStore();
  const [selectedCategory, setSelectedCategory] = useState<CustomizationOption['category']>('color');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const showNotif = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handlePurchase = (option: CustomizationOption) => {
    if (option.unlocked) {
      showNotif('Already unlocked!');
      return;
    }

    if (coins < option.cost) {
      showNotif('Not enough coins!');
      return;
    }

    unlockOption(option.id, option.category);
    showNotif(`Unlocked ${option.name}! 🎉`);
  };

  const handleSelect = (option: CustomizationOption) => {
    if (!option.unlocked) {
      showNotif('Unlock this option first!');
      return;
    }

    switch (option.category) {
      case 'color':
        setSelectedColor(option.id);
        break;
      case 'accessory':
        setSelectedAccessory(option.id);
        break;
      case 'pattern':
        setSelectedPattern(option.id);
        break;
      case 'personality':
        setSelectedPersonality(option.id);
        break;
    }

    showNotif(`${option.name} selected!`);
  };

  const getOptionsForCategory = () => {
    switch (selectedCategory) {
      case 'color':
        return colors;
      case 'accessory':
        return accessories;
      case 'pattern':
        return patterns;
      case 'personality':
        return personalities;
    }
  };

  const getSelectedForCategory = () => {
    switch (selectedCategory) {
      case 'color':
        return selectedColor;
      case 'accessory':
        return selectedAccessory;
      case 'pattern':
        return selectedPattern;
      case 'personality':
        return selectedPersonality;
    }
  };

  const summary = getCustomizationSummary();
  const options = getOptionsForCategory();
  const selected = getSelectedForCategory();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🎨 Pet Customization
      </h2>

      {/* Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg font-bold"
          >
            {notificationMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {!pet && (
        <div className="text-center text-gray-500 py-12">
          <div className="text-6xl mb-4">🐾</div>
          <div>Get a pet first to customize it!</div>
        </div>
      )}

      {pet && (
        <div>
          {/* Pet preview */}
          <div className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 text-center">
            <div className="text-sm font-bold text-gray-700 mb-4">Preview</div>
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              className="text-9xl mb-4"
            >
              {pet.emoji}
            </motion.div>

            <div className="text-2xl font-bold text-gray-900 mb-2">{pet.name}</div>

            <div className="flex flex-wrap gap-2 justify-center">
              {summary.color && summary.color.id !== 'default' && (
                <div className="px-3 py-1 bg-white rounded-full text-sm font-bold">
                  {summary.color.icon} {summary.color.name}
                </div>
              )}
              {summary.accessory && summary.accessory.id !== 'none' && (
                <div className="px-3 py-1 bg-white rounded-full text-sm font-bold">
                  {summary.accessory.icon} {summary.accessory.name}
                </div>
              )}
              {summary.pattern && summary.pattern.id !== 'solid' && (
                <div className="px-3 py-1 bg-white rounded-full text-sm font-bold">
                  {summary.pattern.icon} {summary.pattern.name}
                </div>
              )}
              {summary.personality && (
                <div className="px-3 py-1 bg-white rounded-full text-sm font-bold">
                  {summary.personality.icon} {summary.personality.name}
                </div>
              )}
            </div>
          </div>

          {/* Coins display */}
          <div className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-3xl">💰</div>
              <div>
                <div className="text-sm opacity-90">Coins</div>
                <div className="text-2xl font-bold">{coins}</div>
              </div>
            </div>
          </div>

          {/* Category tabs */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { value: 'color' as const, label: 'Colors', icon: '🎨' },
              { value: 'accessory' as const, label: 'Accessories', icon: '👑' },
              { value: 'pattern' as const, label: 'Patterns', icon: '✨' },
              { value: 'personality' as const, label: 'Personality', icon: '😊' },
            ].map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setSelectedCategory(value)}
                className={`py-3 rounded-lg font-bold transition-all ${
                  selectedCategory === value
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Options grid */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 capitalize">
              {selectedCategory} Options
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {options.map((option, index) => (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                  className={`rounded-xl p-4 cursor-pointer transition-all ${
                    selected === option.id
                      ? 'bg-gradient-to-br from-primary-500 to-purple-500 text-white shadow-lg ring-4 ring-primary-200'
                      : option.unlocked
                      ? 'bg-gray-50 hover:bg-gray-100'
                      : 'bg-gray-100 opacity-60'
                  }`}
                  onClick={() => option.unlocked && handleSelect(option)}
                >
                  <div className="text-center">
                    <div className="text-5xl mb-2">{option.icon}</div>
                    <div className={`font-bold mb-1 ${
                      selected === option.id ? 'text-white' : 'text-gray-900'
                    }`}>
                      {option.name}
                    </div>

                    {option.unlocked ? (
                      <div className={`text-xs ${
                        selected === option.id ? 'text-white opacity-90' : 'text-gray-600'
                      }`}>
                        {selected === option.id ? 'Selected ✓' : option.cost > 0 ? 'Owned' : 'Free'}
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs text-gray-600 mb-2">
                          💰 {option.cost} coins
                        </div>
                        {option.unlockRequirement && (
                          <div className="text-xs text-orange-600 mb-2">
                            🔒 {option.unlockRequirement}
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePurchase(option);
                          }}
                          disabled={coins < option.cost}
                          className="w-full py-2 bg-green-500 text-white rounded-lg font-bold text-xs hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Unlock
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-3">
              Customization Guide
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Earn coins by practicing typing to unlock new options</li>
              <li>• Some items require reaching certain levels</li>
              <li>• Change your pet's appearance anytime</li>
              <li>• Personality affects how your pet behaves</li>
              <li>• Rare items cost more but look amazing!</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// Customization summary component
export function CustomizationSummary({ summary }: {
  summary: {
    color?: CustomizationOption;
    accessory?: CustomizationOption;
    pattern?: CustomizationOption;
    personality?: CustomizationOption;
  };
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <h4 className="text-sm font-bold text-gray-900 mb-3">Customizations</h4>
      <div className="space-y-2 text-sm">
        {summary.color && summary.color.id !== 'default' && (
          <div className="flex items-center gap-2">
            <span>{summary.color.icon}</span>
            <span className="text-gray-700">{summary.color.name}</span>
          </div>
        )}
        {summary.accessory && summary.accessory.id !== 'none' && (
          <div className="flex items-center gap-2">
            <span>{summary.accessory.icon}</span>
            <span className="text-gray-700">{summary.accessory.name}</span>
          </div>
        )}
        {summary.pattern && summary.pattern.id !== 'solid' && (
          <div className="flex items-center gap-2">
            <span>{summary.pattern.icon}</span>
            <span className="text-gray-700">{summary.pattern.name}</span>
          </div>
        )}
        {summary.personality && (
          <div className="flex items-center gap-2">
            <span>{summary.personality.icon}</span>
            <span className="text-gray-700">{summary.personality.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
