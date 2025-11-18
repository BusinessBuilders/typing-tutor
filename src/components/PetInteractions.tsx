/**
 * Pet Interactions Component
 * Step 227 - Build interactive pet behaviors and responses
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import type { Pet } from './PetSystem';

// Interaction type
export type InteractionType =
  | 'pet'
  | 'feed'
  | 'play'
  | 'talk'
  | 'hug'
  | 'tickle'
  | 'groom'
  | 'teach';

// Interaction interface
export interface Interaction {
  type: InteractionType;
  name: string;
  icon: string;
  description: string;
  cooldown: number; // in seconds
  effects: {
    happiness?: number;
    hunger?: number;
    energy?: number;
    xp?: number;
  };
  responses: string[];
}

// Pet reactions
export interface PetReaction {
  message: string;
  emoji: string;
  animation: 'happy' | 'excited' | 'loving' | 'playful' | 'calm';
}

// Available interactions
const INTERACTIONS: Interaction[] = [
  {
    type: 'pet',
    name: 'Pet',
    icon: '👋',
    description: 'Give your pet some gentle pets',
    cooldown: 5,
    effects: { happiness: 10, xp: 2 },
    responses: [
      'Purrs happily 😊',
      'Leans into your hand 💕',
      'Wags tail excitedly 🐾',
      'Closes eyes contentedly 😌',
      'Nuzzles your hand ❤️',
    ],
  },
  {
    type: 'feed',
    name: 'Feed',
    icon: '🍽️',
    description: 'Give your pet a tasty treat',
    cooldown: 15,
    effects: { hunger: 20, happiness: 15, xp: 5 },
    responses: [
      'Nom nom nom! Delicious! 😋',
      'Thank you so much! 🥰',
      'My favorite! 🤩',
      'Munches happily 😊',
      'Wants more! 😍',
    ],
  },
  {
    type: 'play',
    name: 'Play',
    icon: '🎾',
    description: 'Play an energetic game',
    cooldown: 20,
    effects: { happiness: 25, energy: -15, xp: 10 },
    responses: [
      'Let\'s go! This is fun! 🎉',
      'Best game ever! 🤪',
      'Wheee! Catch me! 🏃',
      'Having a blast! 😄',
      'More! Let\'s play more! 🎮',
    ],
  },
  {
    type: 'talk',
    name: 'Talk',
    icon: '💬',
    description: 'Have a conversation',
    cooldown: 10,
    effects: { happiness: 12, xp: 3 },
    responses: [
      'I love listening to you! 👂',
      'Tell me more! 🗣️',
      'That\'s so interesting! 🤔',
      'You\'re my best friend! 💖',
      'I understand! 😊',
    ],
  },
  {
    type: 'hug',
    name: 'Hug',
    icon: '🤗',
    description: 'Give a warm hug',
    cooldown: 12,
    effects: { happiness: 20, xp: 5 },
    responses: [
      '*hugs back* 💝',
      'I needed that! Thank you! 🥺',
      'You\'re the best! 🤗',
      'Warm and cozy! ☺️',
      'Love you too! 💕',
    ],
  },
  {
    type: 'tickle',
    name: 'Tickle',
    icon: '😂',
    description: 'Playful tickles',
    cooldown: 8,
    effects: { happiness: 15, energy: -5, xp: 3 },
    responses: [
      'Hehe that tickles! 🤭',
      'Stop! No wait, keep going! 😆',
      'Giggling uncontrollably! 😂',
      'You got me! 😄',
      'My tickle spot! 🤣',
    ],
  },
  {
    type: 'groom',
    name: 'Groom',
    icon: '✨',
    description: 'Brush and groom your pet',
    cooldown: 18,
    effects: { happiness: 18, xp: 6 },
    responses: [
      'So clean and shiny! ✨',
      'I feel beautiful! 💅',
      'This feels nice... 😌',
      'Thank you for grooming me! 🎀',
      'Looking good! 😎',
    ],
  },
  {
    type: 'teach',
    name: 'Teach',
    icon: '📚',
    description: 'Teach a new skill',
    cooldown: 25,
    effects: { happiness: 10, energy: -10, xp: 15 },
    responses: [
      'I\'m learning! 🎓',
      'This is challenging but fun! 🧠',
      'I think I got it! 💡',
      'Teach me more! 📖',
      'Smart pet coming through! 🤓',
    ],
  },
];

// Custom hook for pet interactions
export function usePetInteractions() {
  const [cooldowns, setCooldowns] = useState<Record<InteractionType, number>>({} as any);
  const [lastReaction, setLastReaction] = useState<PetReaction | null>(null);
  const [interactionCount, setInteractionCount] = useState<Record<InteractionType, number>>({} as any);

  useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          if (updated[key as InteractionType] > 0) {
            updated[key as InteractionType] = Math.max(0, updated[key as InteractionType] - 1);
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const interact = (interaction: Interaction): PetReaction => {
    // Random response
    const randomResponse = interaction.responses[Math.floor(Math.random() * interaction.responses.length)];

    // Determine animation based on interaction type
    let animation: PetReaction['animation'] = 'happy';
    if (interaction.type === 'play') animation = 'excited';
    if (interaction.type === 'hug') animation = 'loving';
    if (interaction.type === 'tickle') animation = 'playful';
    if (interaction.type === 'groom') animation = 'calm';

    const reaction: PetReaction = {
      message: randomResponse,
      emoji: interaction.icon,
      animation,
    };

    setLastReaction(reaction);
    setCooldowns((prev) => ({
      ...prev,
      [interaction.type]: interaction.cooldown,
    }));

    setInteractionCount((prev) => ({
      ...prev,
      [interaction.type]: (prev[interaction.type] || 0) + 1,
    }));

    return reaction;
  };

  const isOnCooldown = (type: InteractionType) => {
    return (cooldowns[type] || 0) > 0;
  };

  const getCooldownTime = (type: InteractionType) => {
    return cooldowns[type] || 0;
  };

  const getMostUsedInteraction = () => {
    let max = 0;
    let mostUsed: InteractionType | null = null;

    Object.entries(interactionCount).forEach(([type, count]) => {
      if (count > max) {
        max = count;
        mostUsed = type as InteractionType;
      }
    });

    return mostUsed;
  };

  return {
    interact,
    isOnCooldown,
    getCooldownTime,
    lastReaction,
    interactionCount,
    getMostUsedInteraction,
  };
}

// Main pet interactions component
export default function PetInteractions({ pet }: { pet: Pet | null }) {
  const {
    interact,
    isOnCooldown,
    getCooldownTime,
    lastReaction,
    interactionCount,
    getMostUsedInteraction,
  } = usePetInteractions();

  const { settings } = useSettingsStore();
  const [showReaction, setShowReaction] = useState(false);

  const handleInteract = (interaction: Interaction) => {
    if (!pet) {
      alert('No pet to interact with!');
      return;
    }

    if (isOnCooldown(interaction.type)) {
      alert(`Wait ${getCooldownTime(interaction.type)} seconds!`);
      return;
    }

    interact(interaction);
    setShowReaction(true);
    setTimeout(() => setShowReaction(false), 3000);
  };

  const mostUsed = getMostUsedInteraction();
  const totalInteractions = Object.values(interactionCount).reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🤝 Pet Interactions
      </h2>

      {/* Reaction display */}
      <AnimatePresence>
        {showReaction && lastReaction && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-2xl shadow-2xl max-w-md"
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={
                  lastReaction.animation === 'excited'
                    ? { scale: [1, 1.3, 1], rotate: [0, 360] }
                    : lastReaction.animation === 'loving'
                    ? { scale: [1, 1.2, 1] }
                    : lastReaction.animation === 'playful'
                    ? { y: [0, -10, 0], rotate: [0, 10, -10, 0] }
                    : { scale: [1, 1.1, 1] }
                }
                transition={{ duration: 0.8 }}
                className="text-5xl"
              >
                {pet?.emoji}
              </motion.div>
              <div className="flex-1">
                <div className="font-bold text-xl">{pet?.name} says:</div>
                <div className="text-lg">{lastReaction.message}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!pet && (
        <div className="text-center text-gray-500 py-12">
          <div className="text-6xl mb-4">🐾</div>
          <div>Get a pet first to interact!</div>
        </div>
      )}

      {pet && (
        <div>
          {/* Pet display */}
          <div className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 text-center">
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              className="text-9xl mb-4"
            >
              {pet.emoji}
            </motion.div>
            <div className="text-2xl font-bold text-gray-900 mb-2">{pet.name}</div>
            <div className="text-gray-600">Waiting for interaction...</div>
          </div>

          {/* Stats */}
          <div className="mb-8 bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Interaction Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-primary-600">{totalInteractions}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {Object.keys(interactionCount).length}
                </div>
                <div className="text-xs text-gray-600">Types Used</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl">
                  {mostUsed ? INTERACTIONS.find((i) => i.type === mostUsed)?.icon : '❓'}
                </div>
                <div className="text-xs text-gray-600">Favorite</div>
              </div>
            </div>
          </div>

          {/* Interactions grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {INTERACTIONS.map((interaction, index) => {
              const onCooldown = isOnCooldown(interaction.type);
              const cooldownTime = getCooldownTime(interaction.type);
              const timesUsed = interactionCount[interaction.type] || 0;

              return (
                <motion.button
                  key={interaction.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                  onClick={() => handleInteract(interaction)}
                  disabled={onCooldown}
                  whileHover={!onCooldown ? { scale: 1.05 } : {}}
                  whileTap={!onCooldown ? { scale: 0.95 } : {}}
                  className={`p-6 rounded-xl transition-all ${
                    onCooldown
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-br from-primary-500 to-purple-500 text-white hover:from-primary-600 hover:to-purple-600 shadow-lg'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-5xl mb-2">{interaction.icon}</div>
                    <div className="font-bold mb-1">{interaction.name}</div>
                    <div className={`text-xs mb-2 ${onCooldown ? 'text-gray-500' : 'opacity-90'}`}>
                      {interaction.description}
                    </div>

                    {onCooldown ? (
                      <div className="text-sm font-bold text-red-600">
                        Wait {cooldownTime}s
                      </div>
                    ) : (
                      <div className="text-xs opacity-75">
                        {timesUsed > 0 && `Used ${timesUsed}x`}
                      </div>
                    )}

                    {/* Effects */}
                    <div className="mt-2 flex flex-wrap gap-1 justify-center text-xs">
                      {interaction.effects.happiness && (
                        <span className={`px-2 py-1 rounded ${
                          onCooldown ? 'bg-gray-300' : 'bg-white bg-opacity-20'
                        }`}>
                          💕 +{interaction.effects.happiness}
                        </span>
                      )}
                      {interaction.effects.xp && (
                        <span className={`px-2 py-1 rounded ${
                          onCooldown ? 'bg-gray-300' : 'bg-white bg-opacity-20'
                        }`}>
                          ⭐ +{interaction.effects.xp}
                        </span>
                      )}
                      {interaction.effects.energy && interaction.effects.energy < 0 && (
                        <span className={`px-2 py-1 rounded ${
                          onCooldown ? 'bg-gray-300' : 'bg-white bg-opacity-20'
                        }`}>
                          ⚡ {interaction.effects.energy}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Interaction history */}
          {totalInteractions > 0 && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Interaction History
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {INTERACTIONS.filter((i) => interactionCount[i.type] > 0)
                  .sort((a, b) => (interactionCount[b.type] || 0) - (interactionCount[a.type] || 0))
                  .map((interaction) => (
                    <div
                      key={interaction.type}
                      className="bg-white rounded-lg p-3 text-center"
                    >
                      <div className="text-3xl mb-1">{interaction.icon}</div>
                      <div className="font-bold text-sm text-gray-900">{interaction.name}</div>
                      <div className="text-2xl font-bold text-primary-600">
                        {interactionCount[interaction.type]}
                      </div>
                      <div className="text-xs text-gray-600">times</div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          Interaction Tips
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Different interactions have different effects</li>
          <li>• Each interaction has a cooldown period</li>
          <li>• Your pet responds with unique messages</li>
          <li>• Frequent interactions keep your pet happy</li>
          <li>• Try all interactions to see what your pet likes best!</li>
        </ul>
      </div>
    </div>
  );
}

// Quick interaction buttons
export function QuickInteractions({ onInteract }: {
  pet?: Pet | null;
  onInteract: (interaction: Interaction) => void;
}) {
  const quickInteractions = INTERACTIONS.filter((i) =>
    ['pet', 'feed', 'play'].includes(i.type)
  );

  return (
    <div className="flex gap-2">
      {quickInteractions.map((interaction) => (
        <button
          key={interaction.type}
          onClick={() => onInteract(interaction)}
          className="flex-1 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-colors"
        >
          {interaction.icon} {interaction.name}
        </button>
      ))}
    </div>
  );
}
