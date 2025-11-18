/**
 * Pet Accessories Component
 * Step 230 - Build pet accessories and customization items
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import type { Pet } from './PetSystem';

// Accessory interface
export interface PetAccessory {
  id: string;
  name: string;
  icon: string;
  description: string;
  slot: 'head' | 'body' | 'neck' | 'feet' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  cost: number;
  unlockRequirement?: string;
  unlocked: boolean;
  equipped: boolean;
  stats: {
    happiness?: number;
    style?: number;
  };
}

// Accessory slots
const ACCESSORY_SLOTS = {
  head: { label: 'Head', icon: '👒', color: 'from-blue-400 to-blue-600' },
  body: { label: 'Body', icon: '👕', color: 'from-green-400 to-green-600' },
  neck: { label: 'Neck', icon: '📿', color: 'from-purple-400 to-purple-600' },
  feet: { label: 'Feet', icon: '👟', color: 'from-orange-400 to-orange-600' },
  special: { label: 'Special', icon: '✨', color: 'from-pink-500 to-purple-600' },
};

// Rarity colors
const RARITY_COLORS = {
  common: 'from-gray-400 to-gray-500',
  uncommon: 'from-green-400 to-green-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-500 to-pink-600',
  legendary: 'from-yellow-400 via-orange-500 to-red-500',
};

// Accessories collection
const ACCESSORIES: PetAccessory[] = [
  // Head accessories
  {
    id: 'party_hat',
    name: 'Party Hat',
    icon: '🎉',
    description: 'Perfect for celebrations!',
    slot: 'head',
    rarity: 'common',
    cost: 50,
    unlocked: false,
    equipped: false,
    stats: { happiness: 5, style: 10 },
  },
  {
    id: 'crown',
    name: 'Royal Crown',
    icon: '👑',
    description: 'Fit for a king or queen',
    slot: 'head',
    rarity: 'epic',
    cost: 500,
    unlockRequirement: 'Reach level 25',
    unlocked: false,
    equipped: false,
    stats: { happiness: 15, style: 30 },
  },
  {
    id: 'wizard_hat',
    name: 'Wizard Hat',
    icon: '🧙',
    description: 'Magical and mysterious',
    slot: 'head',
    rarity: 'rare',
    cost: 200,
    unlockRequirement: 'Learn 10 tricks',
    unlocked: false,
    equipped: false,
    stats: { happiness: 10, style: 20 },
  },
  {
    id: 'halo',
    name: 'Angel Halo',
    icon: '😇',
    description: 'Pure and divine',
    slot: 'head',
    rarity: 'legendary',
    cost: 1000,
    unlockRequirement: 'Perfect care for 7 days',
    unlocked: false,
    equipped: false,
    stats: { happiness: 20, style: 40 },
  },

  // Body accessories
  {
    id: 'cape',
    name: 'Hero Cape',
    icon: '🦸',
    description: 'For brave heroes',
    slot: 'body',
    rarity: 'uncommon',
    cost: 100,
    unlocked: false,
    equipped: false,
    stats: { happiness: 8, style: 15 },
  },
  {
    id: 'tuxedo',
    name: 'Fancy Tuxedo',
    icon: '🤵',
    description: 'Very sophisticated',
    slot: 'body',
    rarity: 'rare',
    cost: 300,
    unlockRequirement: 'Attend 5 events',
    unlocked: false,
    equipped: false,
    stats: { happiness: 12, style: 25 },
  },
  {
    id: 'armor',
    name: 'Knight Armor',
    icon: '⚔️',
    description: 'Strong and protective',
    slot: 'body',
    rarity: 'epic',
    cost: 600,
    unlockRequirement: 'Win 20 games',
    unlocked: false,
    equipped: false,
    stats: { happiness: 15, style: 35 },
  },

  // Neck accessories
  {
    id: 'collar',
    name: 'Bell Collar',
    icon: '🔔',
    description: 'Jingle jingle!',
    slot: 'neck',
    rarity: 'common',
    cost: 40,
    unlocked: false,
    equipped: false,
    stats: { happiness: 5, style: 8 },
  },
  {
    id: 'bow_tie',
    name: 'Bow Tie',
    icon: '🎀',
    description: 'Classy and cute',
    slot: 'neck',
    rarity: 'uncommon',
    cost: 80,
    unlocked: false,
    equipped: false,
    stats: { happiness: 7, style: 12 },
  },
  {
    id: 'necklace',
    name: 'Diamond Necklace',
    icon: '💎',
    description: 'Sparkly and expensive',
    slot: 'neck',
    rarity: 'legendary',
    cost: 1500,
    unlockRequirement: 'Collect 10000 coins',
    unlocked: false,
    equipped: false,
    stats: { happiness: 25, style: 50 },
  },

  // Feet accessories
  {
    id: 'sneakers',
    name: 'Running Sneakers',
    icon: '👟',
    description: 'For speedy pets',
    slot: 'feet',
    rarity: 'common',
    cost: 60,
    unlocked: false,
    equipped: false,
    stats: { happiness: 6, style: 10 },
  },
  {
    id: 'roller_skates',
    name: 'Roller Skates',
    icon: '🛼',
    description: 'Roll around in style',
    slot: 'feet',
    rarity: 'rare',
    cost: 250,
    unlockRequirement: 'Complete 15 races',
    unlocked: false,
    equipped: false,
    stats: { happiness: 12, style: 22 },
  },

  // Special accessories
  {
    id: 'sunglasses',
    name: 'Cool Sunglasses',
    icon: '😎',
    description: 'Too cool for school',
    slot: 'special',
    rarity: 'uncommon',
    cost: 120,
    unlocked: false,
    equipped: false,
    stats: { happiness: 10, style: 18 },
  },
  {
    id: 'wings',
    name: 'Angel Wings',
    icon: '👼',
    description: 'Fly to the sky!',
    slot: 'special',
    rarity: 'epic',
    cost: 800,
    unlockRequirement: 'Reach level 40',
    unlocked: false,
    equipped: false,
    stats: { happiness: 18, style: 38 },
  },
  {
    id: 'rainbow',
    name: 'Rainbow Aura',
    icon: '🌈',
    description: 'Magical rainbow glow',
    slot: 'special',
    rarity: 'legendary',
    cost: 2000,
    unlockRequirement: 'Unlock all other accessories',
    unlocked: false,
    equipped: false,
    stats: { happiness: 30, style: 60 },
  },
];

// Custom hook for pet accessories
export function usePetAccessories() {
  const [accessories, setAccessories] = useState<PetAccessory[]>(ACCESSORIES);
  const [coins, setCoins] = useState(500);

  const buyAccessory = (accessoryId: string) => {
    const accessory = accessories.find((a) => a.id === accessoryId);
    if (!accessory) return { success: false, message: 'Accessory not found' };

    if (accessory.unlocked) return { success: false, message: 'Already owned' };
    if (coins < accessory.cost) return { success: false, message: 'Not enough coins' };

    setCoins(coins - accessory.cost);
    setAccessories((prev) =>
      prev.map((a) =>
        a.id === accessoryId ? { ...a, unlocked: true } : a
      )
    );

    return { success: true, message: `Bought ${accessory.name}!` };
  };

  const equipAccessory = (accessoryId: string) => {
    const accessory = accessories.find((a) => a.id === accessoryId);
    if (!accessory || !accessory.unlocked) return { success: false, message: 'Cannot equip' };

    setAccessories((prev) =>
      prev.map((a) =>
        a.slot === accessory.slot
          ? { ...a, equipped: a.id === accessoryId }
          : a
      )
    );

    return { success: true, message: `Equipped ${accessory.name}!` };
  };

  const unequipSlot = (slot: PetAccessory['slot']) => {
    setAccessories((prev) =>
      prev.map((a) =>
        a.slot === slot ? { ...a, equipped: false } : a
      )
    );
  };

  const getEquippedAccessories = () => {
    return accessories.filter((a) => a.equipped);
  };

  const getTotalStats = () => {
    const equipped = getEquippedAccessories();
    return {
      happiness: equipped.reduce((sum, a) => sum + (a.stats.happiness || 0), 0),
      style: equipped.reduce((sum, a) => sum + (a.stats.style || 0), 0),
    };
  };

  const getAccessoriesBySlot = (slot: PetAccessory['slot']) => {
    return accessories.filter((a) => a.slot === slot);
  };

  const getUnlockedCount = () => {
    return accessories.filter((a) => a.unlocked).length;
  };

  return {
    accessories,
    coins,
    setCoins,
    buyAccessory,
    equipAccessory,
    unequipSlot,
    getEquippedAccessories,
    getTotalStats,
    getAccessoriesBySlot,
    getUnlockedCount,
  };
}

// Main pet accessories component
export default function PetAccessories({ pet }: { pet: Pet | null }) {
  const {
    accessories,
    coins,
    buyAccessory,
    equipAccessory,
    getEquippedAccessories,
    getTotalStats,
    getAccessoriesBySlot,
    getUnlockedCount,
  } = usePetAccessories();

  const { settings } = useSettingsStore();
  const [selectedSlot, setSelectedSlot] = useState<PetAccessory['slot'] | 'all'>('all');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const showNotif = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleBuy = (accessory: PetAccessory) => {
    const result = buyAccessory(accessory.id);
    showNotif(result.message);
  };

  const handleEquip = (accessory: PetAccessory) => {
    const result = equipAccessory(accessory.id);
    showNotif(result.message);
  };

  const equipped = getEquippedAccessories();
  const totalStats = getTotalStats();
  const filteredAccessories = selectedSlot === 'all'
    ? accessories
    : getAccessoriesBySlot(selectedSlot);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        👗 Pet Accessories
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
          <div>Get a pet first to customize with accessories!</div>
        </div>
      )}

      {pet && (
        <div>
          {/* Pet preview with accessories */}
          <div className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 text-center">
            <div className="text-sm font-bold text-gray-700 mb-4">Your Pet</div>
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-9xl mb-4 relative"
            >
              {pet.emoji}
              {/* Show equipped accessories as emojis around pet */}
              {equipped.map((acc, i) => (
                <motion.span
                  key={acc.id}
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                  className="absolute text-4xl"
                  style={{
                    top: `${20 + i * 15}%`,
                    right: `${10 + i * 10}%`,
                  }}
                >
                  {acc.icon}
                </motion.span>
              ))}
            </motion.div>

            <div className="text-2xl font-bold text-gray-900 mb-2">{pet.name}</div>

            {equipped.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {equipped.map((acc) => (
                  <div key={acc.id} className="px-3 py-1 bg-white rounded-full text-sm font-bold">
                    {acc.icon} {acc.name}
                  </div>
                ))}
              </div>
            )}

            {/* Total stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3">
                <div className="text-2xl">💕</div>
                <div className="font-bold text-primary-600">+{totalStats.happiness}</div>
                <div className="text-xs text-gray-600">Happiness</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-2xl">✨</div>
                <div className="font-bold text-purple-600">+{totalStats.style}</div>
                <div className="text-xs text-gray-600">Style</div>
              </div>
            </div>
          </div>

          {/* Coins */}
          <div className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">💰</div>
              <div>
                <div className="text-sm opacity-90">Your Coins</div>
                <div className="text-2xl font-bold">{coins}</div>
              </div>
            </div>
            <div className="text-sm opacity-90">
              {getUnlockedCount()} / {accessories.length} owned
            </div>
          </div>

          {/* Slot filter */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Filter by Slot:
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSlot('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedSlot === 'all'
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                👗 All
              </button>
              {Object.entries(ACCESSORY_SLOTS).map(([slot, { label, icon }]) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot as PetAccessory['slot'])}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedSlot === slot
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Accessories grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredAccessories.map((accessory, index) => (
              <motion.div
                key={accessory.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                className={`rounded-xl p-4 transition-all ${
                  accessory.equipped
                    ? 'ring-4 ring-primary-500 shadow-lg'
                    : ''
                } ${
                  accessory.unlocked
                    ? `bg-gradient-to-br ${RARITY_COLORS[accessory.rarity]} text-white`
                    : 'bg-gray-100'
                }`}
              >
                <div className="text-center">
                  <div className="text-5xl mb-2">{accessory.unlocked ? accessory.icon : '🔒'}</div>
                  <div className={`font-bold mb-1 ${
                    accessory.unlocked ? 'text-white' : 'text-gray-700'
                  }`}>
                    {accessory.unlocked ? accessory.name : '???'}
                  </div>
                  <div className={`text-xs mb-2 ${
                    accessory.unlocked ? 'text-white opacity-90' : 'text-gray-600'
                  }`}>
                    {accessory.unlocked ? accessory.description : 'Locked'}
                  </div>

                  {accessory.unlocked && (
                    <div className="text-xs bg-white bg-opacity-20 rounded px-2 py-1 mb-2">
                      💕 +{accessory.stats.happiness} | ✨ +{accessory.stats.style}
                    </div>
                  )}

                  {!accessory.unlocked && (
                    <div>
                      <div className="text-sm font-bold text-gray-900 mb-2">
                        💰 {accessory.cost}
                      </div>
                      {accessory.unlockRequirement && (
                        <div className="text-xs text-orange-600 mb-2">
                          🔒 {accessory.unlockRequirement}
                        </div>
                      )}
                      <button
                        onClick={() => handleBuy(accessory)}
                        disabled={coins < accessory.cost}
                        className="w-full py-2 bg-green-500 text-white rounded-lg font-bold text-xs hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Buy
                      </button>
                    </div>
                  )}

                  {accessory.unlocked && (
                    <button
                      onClick={() => handleEquip(accessory)}
                      className={`w-full py-2 rounded-lg font-bold text-xs transition-colors ${
                        accessory.equipped
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                      } text-white`}
                    >
                      {accessory.equipped ? 'Unequip' : 'Equip'}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          Accessories Guide
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Buy accessories with coins earned from typing</li>
          <li>• Each accessory provides stat bonuses</li>
          <li>• Higher rarity = better stats and cooler look</li>
          <li>• Some accessories require unlocking achievements</li>
          <li>• Mix and match to create your unique style!</li>
        </ul>
      </div>
    </div>
  );
}
