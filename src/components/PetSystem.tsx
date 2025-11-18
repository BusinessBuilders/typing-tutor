/**
 * Pet System Component
 * Step 221 - Build virtual pet companion system
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

// Pet interface
export interface Pet {
  id: string;
  name: string;
  type: 'cat' | 'dog' | 'rabbit' | 'bird' | 'dragon' | 'fox';
  emoji: string;
  level: number;
  xp: number;
  happiness: number; // 0-100
  hunger: number; // 0-100 (lower is hungrier)
  energy: number; // 0-100
  age: number; // in days
  evolutionStage: 'baby' | 'child' | 'teen' | 'adult' | 'master';
  color: string;
  createdAt: Date;
  lastFed?: Date;
  lastPlayed?: Date;
  lastPetted?: Date;
}

// Pet types configuration
const PET_TYPES: Record<Pet['type'], {
  name: string;
  emoji: Record<Pet['evolutionStage'], string>;
  description: string;
  color: string;
}> = {
  cat: {
    name: 'Cat',
    emoji: {
      baby: '🐱',
      child: '😺',
      teen: '😸',
      adult: '😻',
      master: '🦁',
    },
    description: 'Playful and independent',
    color: 'from-orange-400 to-orange-600',
  },
  dog: {
    name: 'Dog',
    emoji: {
      baby: '🐶',
      child: '🐕',
      teen: '🦮',
      adult: '🐕‍🦺',
      master: '🐺',
    },
    description: 'Loyal and energetic',
    color: 'from-brown-400 to-brown-600',
  },
  rabbit: {
    name: 'Rabbit',
    emoji: {
      baby: '🐰',
      child: '🐇',
      teen: '🐇',
      adult: '🐇',
      master: '🦘',
    },
    description: 'Gentle and curious',
    color: 'from-pink-400 to-pink-600',
  },
  bird: {
    name: 'Bird',
    emoji: {
      baby: '🐣',
      child: '🐤',
      teen: '🐥',
      adult: '🐦',
      master: '🦅',
    },
    description: 'Free-spirited and musical',
    color: 'from-blue-400 to-blue-600',
  },
  dragon: {
    name: 'Dragon',
    emoji: {
      baby: '🥚',
      child: '🦎',
      teen: '🐉',
      adult: '🐲',
      master: '🐉',
    },
    description: 'Majestic and powerful',
    color: 'from-purple-500 to-pink-600',
  },
  fox: {
    name: 'Fox',
    emoji: {
      baby: '🦊',
      child: '🦊',
      teen: '🦊',
      adult: '🦊',
      master: '🦊',
    },
    description: 'Clever and adventurous',
    color: 'from-red-400 to-orange-500',
  },
};

// Custom hook for pet system
export function usePetSystem() {
  const [pet, setPet] = useState<Pet | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Calculate XP needed for next level
  const getXPForNextLevel = (level: number) => {
    return Math.floor(100 * Math.pow(1.5, level - 1));
  };

  // Determine evolution stage based on level
  const getEvolutionStage = (level: number): Pet['evolutionStage'] => {
    if (level >= 50) return 'master';
    if (level >= 30) return 'adult';
    if (level >= 15) return 'teen';
    if (level >= 5) return 'child';
    return 'baby';
  };

  // Create a new pet
  const createPet = (type: Pet['type'], name: string) => {
    const newPet: Pet = {
      id: Date.now().toString(),
      name,
      type,
      emoji: PET_TYPES[type].emoji.baby,
      level: 1,
      xp: 0,
      happiness: 100,
      hunger: 100,
      energy: 100,
      age: 0,
      evolutionStage: 'baby',
      color: PET_TYPES[type].color,
      createdAt: new Date(),
    };
    setPet(newPet);
    showNotif(`${name} joined you! Take good care of them! 🎉`);
    return newPet;
  };

  // Add XP to pet
  const addXP = (amount: number) => {
    if (!pet) return;

    let newXP = pet.xp + amount;
    let newLevel = pet.level;
    let leveledUp = false;

    while (newXP >= getXPForNextLevel(newLevel)) {
      newXP -= getXPForNextLevel(newLevel);
      newLevel++;
      leveledUp = true;
    }

    const newStage = getEvolutionStage(newLevel);
    const evolved = newStage !== pet.evolutionStage;

    setPet({
      ...pet,
      xp: newXP,
      level: newLevel,
      evolutionStage: newStage,
      emoji: PET_TYPES[pet.type].emoji[newStage],
    });

    if (evolved) {
      showNotif(`${pet.name} evolved to ${newStage} stage! 🎊`);
    } else if (leveledUp) {
      showNotif(`${pet.name} reached level ${newLevel}! ⭐`);
    }
  };

  // Feed pet
  const feedPet = () => {
    if (!pet) return;

    setPet({
      ...pet,
      hunger: Math.min(100, pet.hunger + 30),
      happiness: Math.min(100, pet.happiness + 10),
      lastFed: new Date(),
    });
    showNotif(`${pet.name} enjoyed the meal! 🍽️`);
    addXP(5);
  };

  // Play with pet
  const playWithPet = () => {
    if (!pet) return;

    if (pet.energy < 20) {
      showNotif(`${pet.name} is too tired to play. Let them rest! 😴`);
      return;
    }

    setPet({
      ...pet,
      happiness: Math.min(100, pet.happiness + 20),
      energy: Math.max(0, pet.energy - 20),
      hunger: Math.max(0, pet.hunger - 10),
      lastPlayed: new Date(),
    });
    showNotif(`${pet.name} had fun playing! 🎾`);
    addXP(10);
  };

  // Pet the pet
  const petPet = () => {
    if (!pet) return;

    setPet({
      ...pet,
      happiness: Math.min(100, pet.happiness + 15),
      lastPetted: new Date(),
    });
    showNotif(`${pet.name} loves your attention! 💕`);
    addXP(3);
  };

  // Rest pet
  const restPet = () => {
    if (!pet) return;

    setPet({
      ...pet,
      energy: Math.min(100, pet.energy + 40),
    });
    showNotif(`${pet.name} feels refreshed! 💤`);
  };

  // Update pet stats over time
  useEffect(() => {
    if (!pet) return;

    const interval = setInterval(() => {
      setPet((currentPet) => {
        if (!currentPet) return null;

        return {
          ...currentPet,
          hunger: Math.max(0, currentPet.hunger - 1),
          energy: Math.min(100, currentPet.energy + 2),
          happiness: Math.max(0, currentPet.happiness - 0.5),
        };
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [pet?.id]);

  // Show notification
  const showNotif = (message: string) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Get pet status
  const getPetStatus = () => {
    if (!pet) return null;

    const status: {
      overall: 'excellent' | 'good' | 'okay' | 'poor';
      warnings: string[];
    } = {
      overall: 'excellent',
      warnings: [],
    };

    const avgStats = (pet.happiness + pet.hunger + pet.energy) / 3;

    if (avgStats >= 80) status.overall = 'excellent';
    else if (avgStats >= 60) status.overall = 'good';
    else if (avgStats >= 40) status.overall = 'okay';
    else status.overall = 'poor';

    if (pet.hunger < 30) status.warnings.push('Hungry');
    if (pet.energy < 30) status.warnings.push('Tired');
    if (pet.happiness < 30) status.warnings.push('Sad');

    return status;
  };

  return {
    pet,
    createPet,
    addXP,
    feedPet,
    playWithPet,
    petPet,
    restPet,
    getPetStatus,
    getXPForNextLevel,
    showNotification,
    notificationMessage,
  };
}

// Main pet system component
export default function PetSystem() {
  const {
    pet,
    createPet,
    feedPet,
    playWithPet,
    petPet,
    restPet,
    getPetStatus,
    getXPForNextLevel,
    showNotification,
    notificationMessage,
  } = usePetSystem();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<Pet['type']>('cat');
  const [petName, setPetName] = useState('');

  const handleCreatePet = () => {
    if (!petName.trim()) {
      alert('Please enter a name for your pet');
      return;
    }

    createPet(selectedType, petName);
    setShowCreateDialog(false);
    setPetName('');
  };

  const status = getPetStatus();
  const xpNeeded = pet ? getXPForNextLevel(pet.level) : 0;
  const xpProgress = pet ? (pet.xp / xpNeeded) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🐾 Your Pet Companion
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

      {/* Create pet dialog */}
      <AnimatePresence>
        {showCreateDialog && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateDialog(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Choose Your Pet
                </h3>

                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Pet Name:
                  </label>
                  <input
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="Enter a name"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Pet Type:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(PET_TYPES).map(([type, data]) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type as Pet['type'])}
                        className={`p-4 rounded-lg transition-all ${
                          selectedType === type
                            ? `bg-gradient-to-r ${data.color} text-white shadow-lg`
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        <div className="text-4xl mb-2">{data.emoji.baby}</div>
                        <div className="font-bold">{data.name}</div>
                        <div className={`text-xs ${
                          selectedType === type ? 'text-white opacity-90' : 'text-gray-600'
                        }`}>
                          {data.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCreatePet}
                    className="flex-1 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-colors"
                  >
                    Create Pet
                  </button>
                  <button
                    onClick={() => setShowCreateDialog(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* No pet yet */}
      {!pet && (
        <div className="text-center py-12">
          <div className="text-8xl mb-4">🐾</div>
          <div className="text-xl font-bold text-gray-900 mb-2">
            No Pet Yet
          </div>
          <div className="text-gray-600 mb-6">
            Create a virtual pet companion to join you on your typing journey!
          </div>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
          >
            🐾 Get a Pet
          </button>
        </div>
      )}

      {/* Pet display */}
      {pet && (
        <div>
          {/* Pet visualization */}
          <div className={`mb-8 bg-gradient-to-br ${pet.color} rounded-2xl p-8 text-white text-center`}>
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

            <div className="text-3xl font-bold mb-2">{pet.name}</div>
            <div className="text-xl opacity-90 mb-2">
              Level {pet.level} {PET_TYPES[pet.type].name}
            </div>
            <div className="text-sm opacity-80 mb-4">
              {pet.evolutionStage.charAt(0).toUpperCase() + pet.evolutionStage.slice(1)} Stage
            </div>

            {status && (
              <div className={`inline-block px-4 py-2 rounded-full font-bold ${
                status.overall === 'excellent' ? 'bg-green-500' :
                status.overall === 'good' ? 'bg-blue-500' :
                status.overall === 'okay' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}>
                Status: {status.overall.toUpperCase()}
              </div>
            )}

            {status && status.warnings.length > 0 && (
              <div className="mt-2 text-sm">
                ⚠️ {status.warnings.join(', ')}
              </div>
            )}
          </div>

          {/* XP Progress */}
          <div className="mb-6 bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-700">XP Progress</span>
              <span className="text-sm text-gray-600">
                {pet.xp} / {xpNeeded} XP
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${xpProgress}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatBar label="Happiness" value={pet.happiness} color="from-pink-400 to-pink-600" icon="💕" />
            <StatBar label="Hunger" value={pet.hunger} color="from-green-400 to-green-600" icon="🍎" />
            <StatBar label="Energy" value={pet.energy} color="from-blue-400 to-blue-600" icon="⚡" />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={feedPet}
              disabled={pet.hunger >= 90}
              className="py-4 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🍽️ Feed
            </button>
            <button
              onClick={playWithPet}
              disabled={pet.energy < 20}
              className="py-4 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              🎾 Play
            </button>
            <button
              onClick={petPet}
              className="py-4 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-colors"
            >
              💕 Pet
            </button>
            <button
              onClick={restPet}
              disabled={pet.energy >= 90}
              className="py-4 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              💤 Rest
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-3">
              Pet Care Tips
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Feed your pet regularly to keep them healthy</li>
              <li>• Play with them to increase happiness</li>
              <li>• Let them rest when energy is low</li>
              <li>• Pet them often for bonus happiness</li>
              <li>• Level up by practicing typing!</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// Stat bar component
function StatBar({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="text-center mb-2">
        <div className="text-2xl mb-1">{icon}</div>
        <div className="text-xs font-bold text-gray-700">{label}</div>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${value}%` }}
          className={`h-full bg-gradient-to-r ${color}`}
        />
      </div>
      <div className="text-center text-xs text-gray-600 mt-1">{value}%</div>
    </div>
  );
}

// Compact pet display
export function PetDisplay({ pet }: { pet: Pet }) {
  return (
    <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r ${pet.color} text-white shadow-lg`}>
      <span className="text-2xl">{pet.emoji}</span>
      <div>
        <div className="font-bold">{pet.name}</div>
        <div className="text-xs opacity-90">Lv {pet.level}</div>
      </div>
    </div>
  );
}
