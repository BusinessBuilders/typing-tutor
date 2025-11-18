/**
 * Trading Cards Component
 * Step 234 - Create trading card system for collectibles
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Trading card interface
export interface TradingCard {
  id: string;
  name: string;
  title: string;
  emoji: string;
  type: 'character' | 'skill' | 'achievement' | 'pet' | 'special';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  level: number;
  power: number; // Overall power rating
  stats: {
    speed: number; // 1-100
    accuracy: number; // 1-100
    endurance: number; // 1-100
    focus: number; // 1-100
  };
  abilities: string[];
  description: string;
  flavor: string; // Flavor text
  series: string;
  edition: string; // e.g., "First Edition", "Limited", "Holographic"
  serialNumber?: string; // e.g., "001/100"
  unlocked: boolean;
  quantity: number;
  dateObtained?: Date;
}

// Card type configurations
const CARD_TYPES = {
  character: { name: 'Character', icon: '👤', color: 'from-blue-400 to-blue-600' },
  skill: { name: 'Skill', icon: '⚡', color: 'from-purple-400 to-purple-600' },
  achievement: { name: 'Achievement', icon: '🏆', color: 'from-yellow-400 to-yellow-600' },
  pet: { name: 'Pet', icon: '🐾', color: 'from-pink-400 to-pink-600' },
  special: { name: 'Special', icon: '✨', color: 'from-indigo-400 to-indigo-600' },
} as const;

// Rarity configurations
const CARD_RARITIES = {
  common: { name: 'Common', color: 'from-gray-400 to-gray-600', glow: 'shadow-gray-400', sparkle: '⚪', foil: false },
  uncommon: { name: 'Uncommon', color: 'from-green-400 to-green-600', glow: 'shadow-green-400', sparkle: '🟢', foil: false },
  rare: { name: 'Rare', color: 'from-blue-400 to-blue-600', glow: 'shadow-blue-400', sparkle: '🔵', foil: true },
  epic: { name: 'Epic', color: 'from-purple-400 to-purple-600', glow: 'shadow-purple-400', sparkle: '🟣', foil: true },
  legendary: { name: 'Legendary', color: 'from-yellow-400 to-orange-600', glow: 'shadow-yellow-400', sparkle: '🟡', foil: true },
  mythic: { name: 'Mythic', color: 'from-pink-400 to-red-600', glow: 'shadow-pink-400', sparkle: '🔴', foil: true },
} as const;

// Default card collection
const DEFAULT_CARDS: TradingCard[] = [
  {
    id: 'speed_master',
    name: 'Speed Master',
    title: 'Lightning Typist',
    emoji: '⚡',
    type: 'character',
    rarity: 'legendary',
    level: 10,
    power: 95,
    stats: { speed: 100, accuracy: 85, endurance: 75, focus: 90 },
    abilities: ['Lightning Fingers', 'Speed Burst', 'Rapid Fire'],
    description: 'Master of speed typing with unmatched velocity',
    flavor: '"My fingers are faster than lightning!"',
    series: 'Typing Legends',
    edition: 'First Edition',
    serialNumber: '001/100',
    unlocked: false,
    quantity: 0,
  },
  {
    id: 'perfect_accuracy',
    name: 'Accuracy Ace',
    title: 'Precision Expert',
    emoji: '🎯',
    type: 'skill',
    rarity: 'epic',
    level: 8,
    power: 88,
    stats: { speed: 70, accuracy: 100, endurance: 80, focus: 95 },
    abilities: ['Perfect Shot', 'Zero Errors', 'Flawless Execution'],
    description: 'Never misses a keystroke',
    flavor: '"Perfection is my only standard."',
    series: 'Typing Legends',
    edition: 'Holographic',
    unlocked: false,
    quantity: 0,
  },
  {
    id: 'endurance_champion',
    name: 'Marathon Typist',
    title: 'Endurance Champion',
    emoji: '💪',
    type: 'character',
    rarity: 'rare',
    level: 6,
    power: 75,
    stats: { speed: 65, accuracy: 70, endurance: 100, focus: 85 },
    abilities: ['Stamina Boost', 'Never Tire', 'Long Distance'],
    description: 'Can type for hours without fatigue',
    flavor: '"I could do this all day!"',
    series: 'Typing Legends',
    edition: 'Limited',
    serialNumber: '045/500',
    unlocked: false,
    quantity: 0,
  },
  {
    id: 'focus_master',
    name: 'Focus Master',
    title: 'Concentration King',
    emoji: '🧘',
    type: 'skill',
    rarity: 'epic',
    level: 9,
    power: 90,
    stats: { speed: 75, accuracy: 90, endurance: 85, focus: 100 },
    abilities: ['Laser Focus', 'Mental Clarity', 'Zone State'],
    description: 'Unbreakable concentration',
    flavor: '"Nothing can break my focus."',
    series: 'Typing Legends',
    edition: 'Holographic',
    unlocked: false,
    quantity: 0,
  },
  {
    id: 'combo_king',
    name: 'Combo King',
    title: 'Chain Master',
    emoji: '🔥',
    type: 'achievement',
    rarity: 'legendary',
    level: 10,
    power: 98,
    stats: { speed: 95, accuracy: 95, endurance: 80, focus: 100 },
    abilities: ['Infinite Combo', 'Chain Lightning', 'Streak Saver'],
    description: 'Never breaks a combo',
    flavor: '"My streak is unbreakable!"',
    series: 'Typing Legends',
    edition: 'First Edition',
    serialNumber: '007/100',
    unlocked: false,
    quantity: 0,
  },
  {
    id: 'pet_dragon',
    name: 'Typing Dragon',
    title: 'Mythical Companion',
    emoji: '🐉',
    type: 'pet',
    rarity: 'mythic',
    level: 15,
    power: 100,
    stats: { speed: 90, accuracy: 90, endurance: 95, focus: 95 },
    abilities: ['Dragon Fire', 'Ancient Wisdom', 'Mythic Boost'],
    description: 'Legendary pet that enhances all abilities',
    flavor: '"Together, we are unstoppable!"',
    series: 'Pet Collection',
    edition: 'Ultra Rare',
    serialNumber: '001/10',
    unlocked: false,
    quantity: 0,
  },
];

// Custom hook for trading cards
export function useTradingCards() {
  const [cards, setCards] = useState<TradingCard[]>(DEFAULT_CARDS);
  const [selectedCard, setSelectedCard] = useState<TradingCard | null>(null);
  const [filterType, setFilterType] = useState<TradingCard['type'] | 'all'>('all');
  const [filterRarity, setFilterRarity] = useState<TradingCard['rarity'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<'power' | 'level' | 'rarity' | 'name'>('power');

  const unlockCard = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return null;

    const updatedCard: TradingCard = {
      ...card,
      unlocked: true,
      quantity: card.quantity + 1,
      dateObtained: card.dateObtained || new Date(),
    };

    setCards((prev) => prev.map((c) => (c.id === cardId ? updatedCard : c)));
    return updatedCard;
  };

  const getFilteredCards = () => {
    let filtered = cards;

    if (filterType !== 'all') {
      filtered = filtered.filter((c) => c.type === filterType);
    }

    if (filterRarity !== 'all') {
      filtered = filtered.filter((c) => c.rarity === filterRarity);
    }

    // Sort cards
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'power':
          return b.power - a.power;
        case 'level':
          return b.level - a.level;
        case 'rarity': {
          const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
          return rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity);
        }
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  };

  const getCollectionStats = () => {
    const unlocked = cards.filter((c) => c.unlocked).length;
    const total = cards.length;
    const totalPower = cards
      .filter((c) => c.unlocked)
      .reduce((sum, c) => sum + c.power, 0);

    return {
      unlocked,
      total,
      percentage: Math.round((unlocked / total) * 100),
      totalPower,
      averagePower: unlocked > 0 ? Math.round(totalPower / unlocked) : 0,
    };
  };

  return {
    cards,
    selectedCard,
    setSelectedCard,
    unlockCard,
    getFilteredCards,
    filterType,
    setFilterType,
    filterRarity,
    setFilterRarity,
    sortBy,
    setSortBy,
    getCollectionStats,
  };
}

// Main trading cards component
export default function TradingCards() {
  const {
    selectedCard,
    setSelectedCard,
    unlockCard,
    getFilteredCards,
    filterType,
    setFilterType,
    filterRarity,
    setFilterRarity,
    sortBy,
    setSortBy,
    getCollectionStats,
  } = useTradingCards();

  const { settings } = useSettingsStore();
  const filteredCards = getFilteredCards();
  const stats = getCollectionStats();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🎴 Trading Cards
      </h2>

      {/* Collection stats */}
      <div className="mb-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl p-6 text-white">
        <h3 className="text-2xl font-bold mb-4">Collection Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-3xl font-bold">{stats.unlocked}/{stats.total}</div>
            <div className="text-sm opacity-90">Cards Owned</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-3xl font-bold">{stats.percentage}%</div>
            <div className="text-sm opacity-90">Complete</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-3xl font-bold">{stats.totalPower}</div>
            <div className="text-sm opacity-90">Total Power</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-3xl font-bold">{stats.averagePower}</div>
            <div className="text-sm opacity-90">Avg Power</div>
          </div>
        </div>
      </div>

      {/* Filters and sorting */}
      <div className="mb-6 bg-gray-50 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Type filter */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as typeof filterType)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg font-bold"
            >
              <option value="all">All Types</option>
              {Object.entries(CARD_TYPES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.icon} {value.name}
                </option>
              ))}
            </select>
          </div>

          {/* Rarity filter */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Rarity
            </label>
            <select
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value as typeof filterRarity)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg font-bold"
            >
              <option value="all">All Rarities</option>
              {Object.entries(CARD_RARITIES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.sparkle} {value.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg font-bold"
            >
              <option value="power">Power (High to Low)</option>
              <option value="level">Level (High to Low)</option>
              <option value="rarity">Rarity (Rare First)</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Card grid */}
      <div className="mb-8">
        <div className="text-lg font-bold text-gray-900 mb-4">
          {filteredCards.length} Cards
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card, index) => (
            <TradingCardDisplay
              key={card.id}
              card={card}
              index={index}
              onClick={() => setSelectedCard(card)}
              reducedMotion={settings.reducedMotion}
            />
          ))}
        </div>
      </div>

      {/* Test unlock buttons */}
      <div className="bg-green-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-green-900 mb-3">
          Test Unlock (Development Only)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {filteredCards.slice(0, 6).map((card) => (
            <button
              key={card.id}
              onClick={() => unlockCard(card.id)}
              className="py-2 px-3 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600 transition-colors"
            >
              {card.emoji} {card.name}
            </button>
          ))}
        </div>
      </div>

      {/* Card detail modal */}
      <AnimatePresence>
        {selectedCard && (
          <CardDetailModal
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Trading card display component
function TradingCardDisplay({
  card,
  index,
  onClick,
  reducedMotion,
}: {
  card: TradingCard;
  index: number;
  onClick: () => void;
  reducedMotion: boolean;
}) {
  const rarityInfo = CARD_RARITIES[card.rarity];
  const typeInfo = CARD_TYPES[card.type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: reducedMotion ? 0 : index * 0.05 }}
      whileHover={reducedMotion ? {} : { scale: 1.05, rotate: 2 }}
      onClick={onClick}
      className="cursor-pointer"
    >
      <div
        className={`
          relative rounded-2xl overflow-hidden shadow-2xl
          ${card.unlocked
            ? `bg-gradient-to-br ${rarityInfo.color}`
            : 'bg-gray-300'
          }
        `}
      >
        {/* Holographic effect for rare cards */}
        {card.unlocked && rarityInfo.foil && (
          <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-purple-500 opacity-30 animate-pulse" />
        )}

        {/* Card content */}
        <div className="relative p-6 text-white">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm font-bold opacity-90">{typeInfo.name}</div>
              <div className="text-2xl font-bold">{card.name}</div>
              <div className="text-sm opacity-80">{card.title}</div>
            </div>
            <div className="text-5xl">{card.unlocked ? card.emoji : '🔒'}</div>
          </div>

          {/* Power and level */}
          {card.unlocked && (
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 bg-white bg-opacity-20 rounded-lg p-2 text-center">
                <div className="text-xs opacity-90">Level</div>
                <div className="text-2xl font-bold">{card.level}</div>
              </div>
              <div className="flex-1 bg-white bg-opacity-20 rounded-lg p-2 text-center">
                <div className="text-xs opacity-90">Power</div>
                <div className="text-2xl font-bold">{card.power}</div>
              </div>
            </div>
          )}

          {/* Stats */}
          {card.unlocked ? (
            <div className="space-y-2 mb-4">
              {Object.entries(card.stats).map(([stat, value]) => (
                <div key={stat}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="capitalize">{stat}</span>
                    <span>{value}</span>
                  </div>
                  <div className="h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-600">
              <div className="text-lg font-bold">Locked</div>
              <div className="text-sm">Click to view unlock condition</div>
            </div>
          )}

          {/* Rarity and edition */}
          <div className="flex items-center justify-between text-xs">
            <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
              {rarityInfo.sparkle} {rarityInfo.name}
            </div>
            {card.unlocked && card.serialNumber && (
              <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
                #{card.serialNumber}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Card detail modal
function CardDetailModal({
  card,
  onClose,
}: {
  card: TradingCard;
  onClose: () => void;
}) {
  const rarityInfo = CARD_RARITIES[card.rarity];
  const typeInfo = CARD_TYPES[card.type];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, rotateY: -180 }}
        animate={{ scale: 1, rotateY: 0 }}
        exit={{ scale: 0.5, rotateY: 180 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className={`
          bg-gradient-to-br ${rarityInfo.color}
          rounded-3xl p-8 max-w-2xl w-full text-white shadow-2xl
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-8xl mb-4">{card.unlocked ? card.emoji : '🔒'}</div>
          <div className="text-4xl font-bold mb-2">{card.name}</div>
          <div className="text-2xl opacity-90 mb-2">{card.title}</div>
          <div className="text-xl opacity-80">
            {typeInfo.icon} {typeInfo.name} • {rarityInfo.sparkle} {rarityInfo.name}
          </div>
        </div>

        {card.unlocked ? (
          <>
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white bg-opacity-20 rounded-xl p-4">
                <div className="text-sm opacity-90 mb-1">Level</div>
                <div className="text-4xl font-bold">{card.level}</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl p-4">
                <div className="text-sm opacity-90 mb-1">Power</div>
                <div className="text-4xl font-bold">{card.power}</div>
              </div>
            </div>

            {/* Detailed stats */}
            <div className="bg-white bg-opacity-20 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">Stats</h3>
              <div className="space-y-3">
                {Object.entries(card.stats).map(([stat, value]) => (
                  <div key={stat}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="capitalize font-bold">{stat}</span>
                      <span className="text-xl font-bold">{value}</span>
                    </div>
                    <div className="h-3 bg-white bg-opacity-30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="h-full bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Abilities */}
            <div className="bg-white bg-opacity-20 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold mb-3">Abilities</h3>
              <div className="space-y-2">
                {card.abilities.map((ability, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <span className="font-bold">{ability}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description and flavor */}
            <div className="bg-white bg-opacity-20 rounded-xl p-6 mb-6">
              <p className="text-lg mb-3">{card.description}</p>
              <p className="italic opacity-90">"{card.flavor}"</p>
            </div>

            {/* Edition info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <div className="text-sm opacity-90">Series</div>
                <div className="font-bold">{card.series}</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <div className="text-sm opacity-90">Edition</div>
                <div className="font-bold">{card.edition}</div>
              </div>
              {card.serialNumber && (
                <div className="col-span-2 bg-white bg-opacity-20 rounded-lg p-3 text-center">
                  <div className="text-sm opacity-90">Serial Number</div>
                  <div className="text-2xl font-bold">#{card.serialNumber}</div>
                </div>
              )}
              {card.dateObtained && (
                <div className="col-span-2 bg-white bg-opacity-20 rounded-lg p-3 text-center">
                  <div className="text-sm opacity-90">Obtained</div>
                  <div className="font-bold">
                    {card.dateObtained.toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white bg-opacity-20 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <div className="text-2xl font-bold mb-4">Card Locked</div>
            <p className="text-lg">
              Complete challenges and achievements to unlock this card!
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full py-4 bg-white text-gray-900 rounded-xl font-bold text-xl hover:bg-gray-100 transition-colors"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}
