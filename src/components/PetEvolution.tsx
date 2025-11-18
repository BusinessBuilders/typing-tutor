/**
 * Pet Evolution Component
 * Step 226 - Add pet evolution and transformation system
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import type { Pet } from './PetSystem';

// Evolution stage interface
export interface EvolutionStage {
  stage: Pet['evolutionStage'];
  level: number;
  name: string;
  description: string;
  requirements: string[];
  unlocks: string[];
  stats: {
    happiness: number;
    hunger: number;
    energy: number;
  };
}

// Evolution path interface
export interface EvolutionPath {
  id: string;
  name: string;
  description: string;
  type: Pet['type'];
  stages: EvolutionStage[];
}

// Evolution paths for different pet types
const EVOLUTION_PATHS: Record<Pet['type'], EvolutionPath> = {
  cat: {
    id: 'cat_evolution',
    name: 'Feline Evolution',
    description: 'From kitten to majestic lion',
    type: 'cat',
    stages: [
      {
        stage: 'baby',
        level: 1,
        name: 'Kitten',
        description: 'A tiny, adorable kitten',
        requirements: ['Level 1'],
        unlocks: ['Basic meow', 'Playful pounce'],
        stats: { happiness: 80, hunger: 90, energy: 100 },
      },
      {
        stage: 'child',
        level: 5,
        name: 'Young Cat',
        description: 'Growing stronger and more curious',
        requirements: ['Level 5', '50 XP'],
        unlocks: ['Purring', 'Climbing'],
        stats: { happiness: 85, hunger: 85, energy: 95 },
      },
      {
        stage: 'teen',
        level: 15,
        name: 'Adult Cat',
        description: 'Fully grown and independent',
        requirements: ['Level 15', '200 XP'],
        unlocks: ['Hunting skills', 'Night vision'],
        stats: { happiness: 90, hunger: 80, energy: 90 },
      },
      {
        stage: 'adult',
        level: 30,
        name: 'Noble Cat',
        description: 'Wise and elegant',
        requirements: ['Level 30', '500 XP', '1000 pets given'],
        unlocks: ['Leadership', 'Grace'],
        stats: { happiness: 95, hunger: 75, energy: 85 },
      },
      {
        stage: 'master',
        level: 50,
        name: 'Lion King',
        description: 'The ultimate evolution - a majestic lion!',
        requirements: ['Level 50', '2000 XP', 'All tricks mastered'],
        unlocks: ['Royal roar', 'Pride leadership', 'Ultimate speed'],
        stats: { happiness: 100, hunger: 70, energy: 80 },
      },
    ],
  },
  dog: {
    id: 'dog_evolution',
    name: 'Canine Evolution',
    description: 'From puppy to legendary wolf',
    type: 'dog',
    stages: [
      {
        stage: 'baby',
        level: 1,
        name: 'Puppy',
        description: 'An energetic little puppy',
        requirements: ['Level 1'],
        unlocks: ['Bark', 'Tail wag'],
        stats: { happiness: 85, hunger: 95, energy: 100 },
      },
      {
        stage: 'child',
        level: 5,
        name: 'Young Dog',
        description: 'Learning and playful',
        requirements: ['Level 5', '50 XP'],
        unlocks: ['Fetch', 'Sit command'],
        stats: { happiness: 88, hunger: 90, energy: 98 },
      },
      {
        stage: 'teen',
        level: 15,
        name: 'Service Dog',
        description: 'Trained and helpful',
        requirements: ['Level 15', '200 XP'],
        unlocks: ['Advanced tricks', 'Guard duty'],
        stats: { happiness: 92, hunger: 85, energy: 95 },
      },
      {
        stage: 'adult',
        level: 30,
        name: 'Hero Dog',
        description: 'Brave and loyal',
        requirements: ['Level 30', '500 XP', '100 games played'],
        unlocks: ['Rescue skills', 'Super speed'],
        stats: { happiness: 95, hunger: 80, energy: 92 },
      },
      {
        stage: 'master',
        level: 50,
        name: 'Alpha Wolf',
        description: 'Legendary pack leader',
        requirements: ['Level 50', '2000 XP', 'Max friendship'],
        unlocks: ['Pack call', 'Wild instinct', 'Ultimate loyalty'],
        stats: { happiness: 100, hunger: 75, energy: 90 },
      },
    ],
  },
  rabbit: {
    id: 'rabbit_evolution',
    name: 'Lagomorph Evolution',
    description: 'From bunny to mystic hare',
    type: 'rabbit',
    stages: [
      {
        stage: 'baby',
        level: 1,
        name: 'Bunny',
        description: 'A cute little bunny',
        requirements: ['Level 1'],
        unlocks: ['Hop', 'Twitch nose'],
        stats: { happiness: 90, hunger: 100, energy: 95 },
      },
      {
        stage: 'child',
        level: 5,
        name: 'Young Rabbit',
        description: 'Quick and curious',
        requirements: ['Level 5', '50 XP'],
        unlocks: ['Speed hop', 'Burrow'],
        stats: { happiness: 92, hunger: 95, energy: 93 },
      },
      {
        stage: 'teen',
        level: 15,
        name: 'Swift Hare',
        description: 'Incredibly fast',
        requirements: ['Level 15', '200 XP'],
        unlocks: ['Lightning speed', 'Dodge'],
        stats: { happiness: 95, hunger: 90, energy: 90 },
      },
      {
        stage: 'adult',
        level: 30,
        name: 'Moon Rabbit',
        description: 'Blessed with lunar energy',
        requirements: ['Level 30', '500 XP', '50 treasures found'],
        unlocks: ['Lunar blessing', 'Star jump'],
        stats: { happiness: 97, hunger: 85, energy: 88 },
      },
      {
        stage: 'master',
        level: 50,
        name: 'Mystic Kangaroo',
        description: 'Ancient wisdom and power',
        requirements: ['Level 50', '2000 XP', 'All evolutions seen'],
        unlocks: ['Mystic leap', 'Time hop', 'Ultimate wisdom'],
        stats: { happiness: 100, hunger: 80, energy: 85 },
      },
    ],
  },
  bird: {
    id: 'bird_evolution',
    name: 'Avian Evolution',
    description: 'From hatchling to soaring eagle',
    type: 'bird',
    stages: [
      {
        stage: 'baby',
        level: 1,
        name: 'Egg',
        description: 'Waiting to hatch',
        requirements: ['Level 1'],
        unlocks: ['Chirp'],
        stats: { happiness: 75, hunger: 100, energy: 100 },
      },
      {
        stage: 'child',
        level: 5,
        name: 'Chick',
        description: 'Just hatched and learning',
        requirements: ['Level 5', '50 XP'],
        unlocks: ['Peep', 'Flap wings'],
        stats: { happiness: 80, hunger: 95, energy: 98 },
      },
      {
        stage: 'teen',
        level: 15,
        name: 'Young Bird',
        description: 'Learning to fly',
        requirements: ['Level 15', '200 XP'],
        unlocks: ['Flight', 'Song'],
        stats: { happiness: 88, hunger: 90, energy: 95 },
      },
      {
        stage: 'adult',
        level: 30,
        name: 'Songbird',
        description: 'Beautiful and free',
        requirements: ['Level 30', '500 XP', '200 songs sung'],
        unlocks: ['Beautiful melody', 'High flight'],
        stats: { happiness: 95, hunger: 85, energy: 92 },
      },
      {
        stage: 'master',
        level: 50,
        name: 'Royal Eagle',
        description: 'King of the skies',
        requirements: ['Level 50', '2000 XP', 'Touch the clouds'],
        unlocks: ['Soaring mastery', 'Storm call', 'Ultimate freedom'],
        stats: { happiness: 100, hunger: 80, energy: 90 },
      },
    ],
  },
  dragon: {
    id: 'dragon_evolution',
    name: 'Dragon Evolution',
    description: 'From egg to legendary dragon',
    type: 'dragon',
    stages: [
      {
        stage: 'baby',
        level: 1,
        name: 'Dragon Egg',
        description: 'A mysterious dragon egg',
        requirements: ['Level 1'],
        unlocks: ['Warmth'],
        stats: { happiness: 70, hunger: 100, energy: 100 },
      },
      {
        stage: 'child',
        level: 5,
        name: 'Hatchling',
        description: 'A small dragon learning to breathe fire',
        requirements: ['Level 5', '50 XP'],
        unlocks: ['Small flame', 'Wing flutter'],
        stats: { happiness: 78, hunger: 95, energy: 97 },
      },
      {
        stage: 'teen',
        level: 15,
        name: 'Young Dragon',
        description: 'Growing scales and power',
        requirements: ['Level 15', '200 XP'],
        unlocks: ['Fire breath', 'Flight'],
        stats: { happiness: 85, hunger: 90, energy: 93 },
      },
      {
        stage: 'adult',
        level: 30,
        name: 'Guardian Dragon',
        description: 'Protector of treasures',
        requirements: ['Level 30', '500 XP', '1000 coins collected'],
        unlocks: ['Treasure sense', 'Dragon roar'],
        stats: { happiness: 92, hunger: 85, energy: 90 },
      },
      {
        stage: 'master',
        level: 50,
        name: 'Ancient Dragon',
        description: 'Legendary and powerful',
        requirements: ['Level 50', '2000 XP', 'Defeat 100 challenges'],
        unlocks: ['Dragon magic', 'Time control', 'Ultimate power'],
        stats: { happiness: 100, hunger: 80, energy: 88 },
      },
    ],
  },
  fox: {
    id: 'fox_evolution',
    name: 'Vulpine Evolution',
    description: 'From kit to mystical nine-tails',
    type: 'fox',
    stages: [
      {
        stage: 'baby',
        level: 1,
        name: 'Kit',
        description: 'A clever little fox kit',
        requirements: ['Level 1'],
        unlocks: ['Yip', 'Pounce'],
        stats: { happiness: 82, hunger: 93, energy: 98 },
      },
      {
        stage: 'child',
        level: 5,
        name: 'Young Fox',
        description: 'Cunning and quick',
        requirements: ['Level 5', '50 XP'],
        unlocks: ['Stealth', 'Quick dash'],
        stats: { happiness: 86, hunger: 90, energy: 96 },
      },
      {
        stage: 'teen',
        level: 15,
        name: 'Swift Fox',
        description: 'Master of agility',
        requirements: ['Level 15', '200 XP'],
        unlocks: ['Shadow step', 'Cunning tricks'],
        stats: { happiness: 90, hunger: 87, energy: 94 },
      },
      {
        stage: 'adult',
        level: 30,
        name: 'Spirit Fox',
        description: 'Touched by magic',
        requirements: ['Level 30', '500 XP', '500 tricks performed'],
        unlocks: ['Illusion', 'Spirit form'],
        stats: { happiness: 95, hunger: 84, energy: 91 },
      },
      {
        stage: 'master',
        level: 50,
        name: 'Nine-Tailed Fox',
        description: 'Legendary shape-shifter',
        requirements: ['Level 50', '2000 XP', 'Master all illusions'],
        unlocks: ['Nine tails', 'Transformation', 'Ultimate cunning'],
        stats: { happiness: 100, hunger: 82, energy: 90 },
      },
    ],
  },
};

// Custom hook for pet evolution
export function usePetEvolution(pet: Pet | null) {
  const [showEvolutionAnimation, setShowEvolutionAnimation] = useState(false);
  const [evolutionMessage, setEvolutionMessage] = useState('');

  const getEvolutionPath = () => {
    if (!pet) return null;
    return EVOLUTION_PATHS[pet.type];
  };

  const getCurrentStageInfo = () => {
    const path = getEvolutionPath();
    if (!path || !pet) return null;
    return path.stages.find((s) => s.stage === pet.evolutionStage);
  };

  const getNextStageInfo = () => {
    const path = getEvolutionPath();
    if (!path || !pet) return null;

    const currentIndex = path.stages.findIndex((s) => s.stage === pet.evolutionStage);
    if (currentIndex === -1 || currentIndex >= path.stages.length - 1) return null;

    return path.stages[currentIndex + 1];
  };

  const canEvolve = () => {
    if (!pet) return false;
    const nextStage = getNextStageInfo();
    if (!nextStage) return false;

    return pet.level >= nextStage.level;
  };

  const evolve = () => {
    if (!canEvolve()) return null;

    const nextStage = getNextStageInfo();
    if (!nextStage) return null;

    setEvolutionMessage(`Evolved to ${nextStage.name}!`);
    setShowEvolutionAnimation(true);
    setTimeout(() => setShowEvolutionAnimation(false), 5000);

    return nextStage;
  };

  const getEvolutionProgress = () => {
    const path = getEvolutionPath();
    if (!path || !pet) return 0;

    const currentIndex = path.stages.findIndex((s) => s.stage === pet.evolutionStage);
    return ((currentIndex + 1) / path.stages.length) * 100;
  };

  return {
    getEvolutionPath,
    getCurrentStageInfo,
    getNextStageInfo,
    canEvolve,
    evolve,
    getEvolutionProgress,
    showEvolutionAnimation,
    evolutionMessage,
  };
}

// Main pet evolution component
export default function PetEvolution({ pet }: { pet: Pet | null }) {
  const {
    getEvolutionPath,
    getCurrentStageInfo,
    getNextStageInfo,
    canEvolve,
    evolve,
    getEvolutionProgress,
    showEvolutionAnimation,
    evolutionMessage,
  } = usePetEvolution(pet);

  const { settings } = useSettingsStore();

  const evolutionPath = getEvolutionPath();
  const currentStage = getCurrentStageInfo();
  const nextStage = getNextStageInfo();
  const progress = getEvolutionProgress();

  const handleEvolve = () => {
    const result = evolve();
    if (result) {
      alert(`Congratulations! Your pet evolved into ${result.name}!`);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🌟 Pet Evolution
      </h2>

      {/* Evolution animation */}
      <AnimatePresence>
        {showEvolutionAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70"
          >
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 rounded-3xl p-12 shadow-2xl text-center max-w-lg text-white">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.5, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-9xl mb-6"
              >
                ✨
              </motion.div>
              <div className="text-5xl font-bold mb-4">Evolution!</div>
              <div className="text-2xl">{evolutionMessage}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!pet && (
        <div className="text-center text-gray-500 py-12">
          <div className="text-6xl mb-4">🐾</div>
          <div>Get a pet first to see evolution!</div>
        </div>
      )}

      {pet && evolutionPath && currentStage && (
        <div>
          {/* Current stage */}
          <div className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="text-sm font-bold text-gray-700 mb-2">Current Stage</div>
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-9xl mb-4"
              >
                {pet.emoji}
              </motion.div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{currentStage.name}</div>
              <div className="text-gray-600 mb-4">{currentStage.description}</div>

              <div className="inline-block px-4 py-2 bg-white rounded-full font-bold text-purple-700">
                Level {pet.level} • {pet.evolutionStage}
              </div>
            </div>

            {/* Current stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">💕</div>
                <div className="text-sm text-gray-600">Happiness</div>
                <div className="font-bold">{currentStage.stats.happiness}%</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">🍎</div>
                <div className="text-sm text-gray-600">Hunger</div>
                <div className="font-bold">{currentStage.stats.hunger}%</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-sm text-gray-600">Energy</div>
                <div className="font-bold">{currentStage.stats.energy}%</div>
              </div>
            </div>
          </div>

          {/* Evolution progress */}
          <div className="mb-8 bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-700">Evolution Progress</span>
              <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </div>
          </div>

          {/* Next stage */}
          {nextStage && (
            <div className="mb-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Next Evolution</h3>

              <div className="text-center mb-6">
                <div className="text-8xl mb-4 opacity-50">❓</div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{nextStage.name}</div>
                <div className="text-gray-600 mb-4">{nextStage.description}</div>
              </div>

              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="font-bold text-gray-900 mb-2">Requirements:</div>
                <ul className="space-y-1 text-sm text-gray-700">
                  {nextStage.requirements.map((req, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className={pet.level >= nextStage.level ? '✅' : '⬜'}>
                        {req}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-lg p-4 mb-6">
                <div className="font-bold text-gray-900 mb-2">New Unlocks:</div>
                <div className="flex flex-wrap gap-2">
                  {nextStage.unlocks.map((unlock, i) => (
                    <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                      {unlock}
                    </span>
                  ))}
                </div>
              </div>

              {canEvolve() && (
                <button
                  onClick={handleEvolve}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg animate-pulse"
                >
                  ✨ Evolve Now!
                </button>
              )}

              {!canEvolve() && (
                <div className="text-center text-gray-600 py-4">
                  Reach Level {nextStage.level} to evolve!
                </div>
              )}
            </div>
          )}

          {/* Evolution path */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Evolution Path</h3>

            <div className="space-y-4">
              {evolutionPath.stages.map((stage, index) => (
                <motion.div
                  key={stage.stage}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
                  className={`p-4 rounded-lg transition-all ${
                    stage.stage === pet.evolutionStage
                      ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg ring-4 ring-primary-200'
                      : pet.level >= stage.level
                      ? 'bg-green-100'
                      : 'bg-gray-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">
                        {stage.stage === pet.evolutionStage ? pet.emoji : '❓'}
                      </div>
                      <div>
                        <div className={`font-bold ${
                          stage.stage === pet.evolutionStage ? 'text-white' : 'text-gray-900'
                        }`}>
                          {stage.name}
                        </div>
                        <div className={`text-sm ${
                          stage.stage === pet.evolutionStage ? 'text-white opacity-90' : 'text-gray-600'
                        }`}>
                          {stage.description}
                        </div>
                      </div>
                    </div>
                    <div className={`text-sm font-bold ${
                      stage.stage === pet.evolutionStage ? 'text-white' : 'text-gray-700'
                    }`}>
                      Lv {stage.level}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          Evolution Guide
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Your pet evolves as it grows stronger</li>
          <li>• Each evolution unlocks new abilities</li>
          <li>• Higher stages have better stats</li>
          <li>• Complete requirements to unlock evolutions</li>
          <li>• Master level is the ultimate form!</li>
        </ul>
      </div>
    </div>
  );
}
