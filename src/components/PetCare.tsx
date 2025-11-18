/**
 * Pet Care Component
 * Step 222 - Create pet care and management system
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import type { Pet } from './PetSystem';

// Food item interface
export interface FoodItem {
  id: string;
  name: string;
  icon: string;
  hungerRestore: number;
  happinessBonus: number;
  cost: number;
  rarity: 'common' | 'rare' | 'epic';
}

// Activity interface
export interface Activity {
  id: string;
  name: string;
  icon: string;
  description: string;
  energyCost: number;
  happinessGain: number;
  xpGain: number;
  duration: number; // in seconds
}

// Care item interface
export interface CareItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  effect: 'health' | 'happiness' | 'energy' | 'all';
  value: number;
  cost: number;
}

// Food items
const FOOD_ITEMS: FoodItem[] = [
  {
    id: 'apple',
    name: 'Apple',
    icon: '🍎',
    hungerRestore: 20,
    happinessBonus: 5,
    cost: 10,
    rarity: 'common',
  },
  {
    id: 'cookie',
    name: 'Cookie',
    icon: '🍪',
    hungerRestore: 15,
    happinessBonus: 15,
    cost: 15,
    rarity: 'common',
  },
  {
    id: 'pizza',
    name: 'Pizza',
    icon: '🍕',
    hungerRestore: 40,
    happinessBonus: 20,
    cost: 30,
    rarity: 'rare',
  },
  {
    id: 'cake',
    name: 'Cake',
    icon: '🎂',
    hungerRestore: 30,
    happinessBonus: 30,
    cost: 40,
    rarity: 'rare',
  },
  {
    id: 'ice_cream',
    name: 'Ice Cream',
    icon: '🍦',
    hungerRestore: 25,
    happinessBonus: 25,
    cost: 25,
    rarity: 'common',
  },
  {
    id: 'sushi',
    name: 'Sushi',
    icon: '🍣',
    hungerRestore: 50,
    happinessBonus: 35,
    cost: 60,
    rarity: 'epic',
  },
];

// Activities
const ACTIVITIES: Activity[] = [
  {
    id: 'fetch',
    name: 'Play Fetch',
    icon: '🎾',
    description: 'Play a game of fetch',
    energyCost: 15,
    happinessGain: 20,
    xpGain: 10,
    duration: 30,
  },
  {
    id: 'walk',
    name: 'Go for a Walk',
    icon: '🚶',
    description: 'Take a nice walk together',
    energyCost: 20,
    happinessGain: 25,
    xpGain: 15,
    duration: 45,
  },
  {
    id: 'training',
    name: 'Training Session',
    icon: '🎯',
    description: 'Practice new skills',
    energyCost: 30,
    happinessGain: 15,
    xpGain: 30,
    duration: 60,
  },
  {
    id: 'swim',
    name: 'Swimming',
    icon: '🏊',
    description: 'Splash in the water',
    energyCost: 25,
    happinessGain: 30,
    xpGain: 20,
    duration: 40,
  },
  {
    id: 'treasure_hunt',
    name: 'Treasure Hunt',
    icon: '🗺️',
    description: 'Search for hidden treasures',
    energyCost: 35,
    happinessGain: 40,
    xpGain: 40,
    duration: 90,
  },
];

// Care items
const CARE_ITEMS: CareItem[] = [
  {
    id: 'toy',
    name: 'Toy',
    icon: '🧸',
    description: 'A fun toy to play with',
    effect: 'happiness',
    value: 20,
    cost: 20,
  },
  {
    id: 'medicine',
    name: 'Medicine',
    icon: '💊',
    description: 'Restores health',
    effect: 'health',
    value: 30,
    cost: 50,
  },
  {
    id: 'energy_drink',
    name: 'Energy Drink',
    icon: '🧃',
    description: 'Restores energy',
    effect: 'energy',
    value: 40,
    cost: 30,
  },
  {
    id: 'spa_treatment',
    name: 'Spa Treatment',
    icon: '🛁',
    description: 'Ultimate relaxation',
    effect: 'all',
    value: 25,
    cost: 100,
  },
];

// Custom hook for pet care
export function usePetCare() {
  const [coins, setCoins] = useState(100); // Starting coins
  const [inventory, setInventory] = useState<{ itemId: string; quantity: number }[]>([]);
  const [activeActivity, setActiveActivity] = useState<{
    activity: Activity;
    startTime: Date;
    endTime: Date;
  } | null>(null);

  const buyItem = (item: FoodItem | CareItem) => {
    if (coins < item.cost) {
      return { success: false, message: 'Not enough coins!' };
    }

    setCoins(coins - item.cost);

    const existingItem = inventory.find((i) => i.itemId === item.id);
    if (existingItem) {
      setInventory(
        inventory.map((i) =>
          i.itemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setInventory([...inventory, { itemId: item.id, quantity: 1 }]);
    }

    return { success: true, message: `Bought ${item.name}!` };
  };

  const useItem = (itemId: string) => {
    const item = inventory.find((i) => i.itemId === itemId);
    if (!item || item.quantity === 0) {
      return { success: false, message: 'Item not in inventory!' };
    }

    setInventory(
      inventory.map((i) =>
        i.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i
      ).filter((i) => i.quantity > 0)
    );

    return { success: true, message: 'Item used!' };
  };

  const startActivity = (activity: Activity) => {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + activity.duration * 1000);

    setActiveActivity({
      activity,
      startTime,
      endTime,
    });

    return { success: true, message: `Started ${activity.name}!` };
  };

  const completeActivity = () => {
    if (!activeActivity) return null;

    const result = {
      happinessGain: activeActivity.activity.happinessGain,
      xpGain: activeActivity.activity.xpGain,
    };

    setActiveActivity(null);
    return result;
  };

  const getItemQuantity = (itemId: string) => {
    const item = inventory.find((i) => i.itemId === itemId);
    return item?.quantity || 0;
  };

  return {
    coins,
    setCoins,
    inventory,
    buyItem,
    useItem,
    getItemQuantity,
    activeActivity,
    startActivity,
    completeActivity,
  };
}

// Main pet care component
export default function PetCare({ pet }: { pet: Pet | null }) {
  const {
    coins,
    buyItem,
    useItem,
    getItemQuantity,
    activeActivity,
    startActivity,
    completeActivity,
  } = usePetCare();

  const { settings } = useSettingsStore();
  const [selectedTab, setSelectedTab] = useState<'food' | 'activities' | 'care'>('food');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const showNotif = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleBuyFood = (food: FoodItem) => {
    const result = buyItem(food);
    showNotif(result.message);
  };

  const handleFeedPet = (food: FoodItem) => {
    if (!pet) {
      showNotif('No pet to feed!');
      return;
    }

    const result = useItem(food.id);
    if (result.success) {
      showNotif(`${pet.name} enjoyed the ${food.name}! 🍽️`);
    } else {
      showNotif(result.message);
    }
  };

  const handleStartActivity = (activity: Activity) => {
    if (!pet) {
      showNotif('No pet to play with!');
      return;
    }

    if (pet.energy < activity.energyCost) {
      showNotif(`${pet.name} is too tired for this activity!`);
      return;
    }

    const result = startActivity(activity);
    showNotif(result.message);
  };

  const handleBuyCareItem = (item: CareItem) => {
    const result = buyItem(item);
    showNotif(result.message);
  };

  const handleUseCareItem = (item: CareItem) => {
    if (!pet) {
      showNotif('No pet to use item on!');
      return;
    }

    const result = useItem(item.id);
    if (result.success) {
      showNotif(`Used ${item.name} on ${pet.name}!`);
    } else {
      showNotif(result.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🏥 Pet Care Center
      </h2>

      {/* Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-full shadow-lg font-bold"
          >
            {notificationMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coins display */}
      <div className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-4xl">💰</div>
          <div>
            <div className="text-sm opacity-90">Your Coins</div>
            <div className="text-3xl font-bold">{coins}</div>
          </div>
        </div>
        <div className="text-sm opacity-90">
          Earn coins by typing!
        </div>
      </div>

      {/* Active activity indicator */}
      {activeActivity && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-5xl">{activeActivity.activity.icon}</div>
              <div>
                <div className="font-bold text-xl">{activeActivity.activity.name}</div>
                <div className="text-sm opacity-90">In Progress...</div>
              </div>
            </div>
            <button
              onClick={() => {
                const result = completeActivity();
                if (result) {
                  showNotif(`Activity complete! +${result.xpGain} XP, +${result.happinessGain} Happiness`);
                }
              }}
              className="px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg font-bold transition-all"
            >
              Complete
            </button>
          </div>
          <div className="text-sm opacity-90">
            Duration: {activeActivity.activity.duration}s •
            Energy Cost: {activeActivity.activity.energyCost} •
            Rewards: +{activeActivity.activity.happinessGain} Happiness, +{activeActivity.activity.xpGain} XP
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setSelectedTab('food')}
          className={`flex-1 py-3 rounded-lg font-bold transition-all ${
            selectedTab === 'food'
              ? 'bg-primary-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🍽️ Food
        </button>
        <button
          onClick={() => setSelectedTab('activities')}
          className={`flex-1 py-3 rounded-lg font-bold transition-all ${
            selectedTab === 'activities'
              ? 'bg-primary-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🎾 Activities
        </button>
        <button
          onClick={() => setSelectedTab('care')}
          className={`flex-1 py-3 rounded-lg font-bold transition-all ${
            selectedTab === 'care'
              ? 'bg-primary-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          💊 Care Items
        </button>
      </div>

      {/* Food tab */}
      {selectedTab === 'food' && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Food Shop</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {FOOD_ITEMS.map((food, index) => (
              <motion.div
                key={food.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                className={`bg-gray-50 rounded-xl p-4 ${
                  food.rarity === 'epic' ? 'ring-2 ring-purple-500' :
                  food.rarity === 'rare' ? 'ring-2 ring-blue-500' :
                  'border border-gray-200'
                }`}
              >
                <div className="text-center mb-3">
                  <div className="text-5xl mb-2">{food.icon}</div>
                  <div className="font-bold text-gray-900">{food.name}</div>
                  <div className="text-xs text-gray-600 capitalize">{food.rarity}</div>
                </div>

                <div className="text-xs text-gray-600 mb-3 space-y-1">
                  <div>🍎 Hunger: +{food.hungerRestore}</div>
                  <div>💕 Happiness: +{food.happinessBonus}</div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleBuyFood(food)}
                    className="flex-1 py-2 bg-green-500 text-white rounded-lg font-bold text-sm hover:bg-green-600 transition-colors"
                  >
                    Buy 💰{food.cost}
                  </button>
                  {getItemQuantity(food.id) > 0 && (
                    <button
                      onClick={() => handleFeedPet(food)}
                      className="px-3 py-2 bg-primary-500 text-white rounded-lg font-bold text-sm hover:bg-primary-600 transition-colors"
                    >
                      Use ({getItemQuantity(food.id)})
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Activities tab */}
      {selectedTab === 'activities' && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Activities</h3>
          <div className="space-y-3">
            {ACTIVITIES.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                className="bg-gray-50 rounded-xl p-4 flex items-center gap-4"
              >
                <div className="text-5xl">{activity.icon}</div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900 mb-1">{activity.name}</div>
                  <div className="text-sm text-gray-600 mb-2">{activity.description}</div>
                  <div className="flex gap-4 text-xs text-gray-600">
                    <span>⚡ -{activity.energyCost}</span>
                    <span>💕 +{activity.happinessGain}</span>
                    <span>⭐ +{activity.xpGain} XP</span>
                    <span>⏱️ {activity.duration}s</span>
                  </div>
                </div>
                <button
                  onClick={() => handleStartActivity(activity)}
                  disabled={!!activeActivity || (!!pet && pet.energy < activity.energyCost)}
                  className="px-6 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Start
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Care items tab */}
      {selectedTab === 'care' && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Care Items</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CARE_ITEMS.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                className="bg-gray-50 rounded-xl p-4"
              >
                <div className="text-center mb-3">
                  <div className="text-5xl mb-2">{item.icon}</div>
                  <div className="font-bold text-gray-900 mb-1">{item.name}</div>
                  <div className="text-xs text-gray-600 mb-2">{item.description}</div>
                  <div className="text-xs text-primary-600 font-bold">
                    {item.effect === 'all' ? 'All Stats' : item.effect} +{item.value}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleBuyCareItem(item)}
                    className="flex-1 py-2 bg-green-500 text-white rounded-lg font-bold text-sm hover:bg-green-600 transition-colors"
                  >
                    💰{item.cost}
                  </button>
                  {getItemQuantity(item.id) > 0 && (
                    <button
                      onClick={() => handleUseCareItem(item)}
                      className="px-3 py-2 bg-primary-500 text-white rounded-lg font-bold text-sm hover:bg-primary-600 transition-colors"
                    >
                      ({getItemQuantity(item.id)})
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
          Care Center Guide
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Buy food to feed your pet and restore hunger</li>
          <li>• Do activities together to gain XP and happiness</li>
          <li>• Use care items to restore your pet's stats</li>
          <li>• Earn coins by practicing typing</li>
          <li>• Higher rarity items provide better benefits</li>
        </ul>
      </div>
    </div>
  );
}
