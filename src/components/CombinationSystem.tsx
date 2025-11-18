/**
 * Combination System Component
 * Step 239 - Add combination mechanics for creating special items
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Combination recipe interface
export interface CombinationRecipe {
  id: string;
  name: string;
  description: string;
  ingredients: {
    stickerId: string;
    stickerName: string;
    emoji: string;
    quantity: number;
  }[];
  result: {
    stickerId: string;
    stickerName: string;
    emoji: string;
    rarity: string;
    quantity: number;
  };
  category: 'evolution' | 'fusion' | 'craft' | 'special';
  discovered: boolean;
  timesCompleted: number;
  unlockCondition?: string;
}

// Combination categories
const COMBINATION_CATEGORIES = [
  { id: 'evolution', name: 'Evolution', icon: '🦋', color: 'from-green-400 to-teal-500' },
  { id: 'fusion', name: 'Fusion', icon: '⚡', color: 'from-purple-400 to-pink-500' },
  { id: 'craft', name: 'Crafting', icon: '🔨', color: 'from-blue-400 to-cyan-500' },
  { id: 'special', name: 'Special', icon: '✨', color: 'from-yellow-400 to-orange-500' },
] as const;

// Sample combination recipes
const DEFAULT_RECIPES: CombinationRecipe[] = [
  {
    id: 'rainbow_creation',
    name: 'Rainbow Creation',
    description: 'Combine all color stickers to create a rainbow!',
    ingredients: [
      { stickerId: 'red_heart', stickerName: 'Red Heart', emoji: '❤️', quantity: 1 },
      { stickerId: 'orange_fire', stickerName: 'Orange Fire', emoji: '🔥', quantity: 1 },
      { stickerId: 'yellow_star', stickerName: 'Yellow Star', emoji: '⭐', quantity: 1 },
      { stickerId: 'green_leaf', stickerName: 'Green Leaf', emoji: '🍃', quantity: 1 },
      { stickerId: 'blue_water', stickerName: 'Blue Water', emoji: '💧', quantity: 1 },
      { stickerId: 'purple_grape', stickerName: 'Purple Grape', emoji: '🍇', quantity: 1 },
    ],
    result: {
      stickerId: 'rainbow',
      stickerName: 'Rainbow',
      emoji: '🌈',
      rarity: 'legendary',
      quantity: 1,
    },
    category: 'fusion',
    discovered: false,
    timesCompleted: 0,
  },
  {
    id: 'speed_evolution',
    name: 'Speed Evolution',
    description: 'Evolve lightning into thunder!',
    ingredients: [
      { stickerId: 'lightning', stickerName: 'Lightning', emoji: '⚡', quantity: 3 },
      { stickerId: 'storm', stickerName: 'Storm', emoji: '⛈️', quantity: 2 },
    ],
    result: {
      stickerId: 'thunder', stickerName: 'Thunder Master', emoji: '🌩️', rarity: 'epic', quantity: 1,
    },
    category: 'evolution',
    discovered: false,
    timesCompleted: 0,
  },
  {
    id: 'crown_craft',
    name: 'Royal Crown',
    description: 'Craft a crown fit for a king!',
    ingredients: [
      { stickerId: 'gold_coin', stickerName: 'Gold Coin', emoji: '🪙', quantity: 10 },
      { stickerId: 'gem', stickerName: 'Precious Gem', emoji: '💎', quantity: 5 },
    ],
    result: {
      stickerId: 'crown', stickerName: 'Royal Crown', emoji: '👑', rarity: 'legendary', quantity: 1,
    },
    category: 'craft',
    discovered: false,
    timesCompleted: 0,
  },
  {
    id: 'dragon_summon',
    name: 'Dragon Summoning',
    description: 'Summon a mighty dragon!',
    ingredients: [
      { stickerId: 'fire', stickerName: 'Fire', emoji: '🔥', quantity: 5 },
      { stickerId: 'magic', stickerName: 'Magic', emoji: '✨', quantity: 3 },
      { stickerId: 'crystal', stickerName: 'Crystal', emoji: '🔮', quantity: 2 },
    ],
    result: {
      stickerId: 'dragon', stickerName: 'Dragon', emoji: '🐉', rarity: 'mythic', quantity: 1,
    },
    category: 'special',
    discovered: false,
    timesCompleted: 0,
    unlockCondition: 'Reach level 50',
  },
  {
    id: 'space_explorer',
    name: 'Space Explorer',
    description: 'Build a rocket to explore space!',
    ingredients: [
      { stickerId: 'rocket', stickerName: 'Rocket', emoji: '🚀', quantity: 1 },
      { stickerId: 'star', stickerName: 'Star', emoji: '⭐', quantity: 5 },
      { stickerId: 'moon', stickerName: 'Moon', emoji: '🌙', quantity: 2 },
    ],
    result: {
      stickerId: 'astronaut', stickerName: 'Astronaut', emoji: '👨‍🚀', rarity: 'epic', quantity: 1,
    },
    category: 'craft',
    discovered: false,
    timesCompleted: 0,
  },
  {
    id: 'love_fusion',
    name: 'Love Fusion',
    description: 'Combine hearts to create ultimate love!',
    ingredients: [
      { stickerId: 'heart_red', stickerName: 'Red Heart', emoji: '❤️', quantity: 2 },
      { stickerId: 'heart_pink', stickerName: 'Pink Heart', emoji: '💗', quantity: 2 },
    ],
    result: {
      stickerId: 'love', stickerName: 'True Love', emoji: '💞', rarity: 'rare', quantity: 1,
    },
    category: 'fusion',
    discovered: false,
    timesCompleted: 0,
  },
  {
    id: 'master_evolution',
    name: 'Master Evolution',
    description: 'Evolve to become the ultimate typing master!',
    ingredients: [
      { stickerId: 'trophy_gold', stickerName: 'Gold Trophy', emoji: '🏆', quantity: 1 },
      { stickerId: 'medal', stickerName: 'Medal', emoji: '🏅', quantity: 3 },
      { stickerId: 'ribbon', stickerName: 'Ribbon', emoji: '🎗️', quantity: 5 },
    ],
    result: {
      stickerId: 'master', stickerName: 'Typing Master', emoji: '🎖️', rarity: 'legendary', quantity: 1,
    },
    category: 'evolution',
    discovered: false,
    timesCompleted: 0,
  },
];

// Custom hook for combination system
export function useCombinationSystem() {
  const [recipes, setRecipes] = useState<CombinationRecipe[]>(DEFAULT_RECIPES);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [craftingInProgress, setCraftingInProgress] = useState(false);
  const [lastResult, setLastResult] = useState<CombinationRecipe | null>(null);

  const addToSlot = (stickerId: string) => {
    setSelectedSlots((prev) => [...prev, stickerId]);
  };

  const removeFromSlot = (index: number) => {
    setSelectedSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const clearSlots = () => {
    setSelectedSlots([]);
  };

  const checkRecipeMatch = (): CombinationRecipe | null => {
    for (const recipe of recipes) {
      // Check if all ingredients match
      const requiredIds = recipe.ingredients.flatMap((ing) =>
        Array(ing.quantity).fill(ing.stickerId)
      );

      if (requiredIds.length !== selectedSlots.length) continue;

      const sortedRequired = [...requiredIds].sort();
      const sortedSelected = [...selectedSlots].sort();

      const matches = sortedRequired.every((id, i) => id === sortedSelected[i]);
      if (matches) return recipe;
    }

    return null;
  };

  const craft = async () => {
    const matchedRecipe = checkRecipeMatch();
    if (!matchedRecipe) return null;

    setCraftingInProgress(true);

    // Simulate crafting delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update recipe stats
    setRecipes((prev) =>
      prev.map((r) =>
        r.id === matchedRecipe.id
          ? { ...r, discovered: true, timesCompleted: r.timesCompleted + 1 }
          : r
      )
    );

    setLastResult(matchedRecipe);
    setCraftingInProgress(false);
    clearSlots();

    return matchedRecipe;
  };

  const discoverRecipe = (recipeId: string) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === recipeId ? { ...r, discovered: true } : r))
    );
  };

  const getRecipesByCategory = (category: CombinationRecipe['category']) => {
    return recipes.filter((r) => r.category === category);
  };

  const getDiscoveredRecipes = () => {
    return recipes.filter((r) => r.discovered);
  };

  const getStats = () => {
    const discovered = recipes.filter((r) => r.discovered).length;
    const total = recipes.length;
    const totalCrafts = recipes.reduce((sum, r) => sum + r.timesCompleted, 0);

    return {
      discovered,
      total,
      percentage: Math.round((discovered / total) * 100),
      totalCrafts,
    };
  };

  return {
    recipes,
    selectedSlots,
    addToSlot,
    removeFromSlot,
    clearSlots,
    checkRecipeMatch,
    craft,
    craftingInProgress,
    lastResult,
    setLastResult,
    discoverRecipe,
    getRecipesByCategory,
    getDiscoveredRecipes,
    getStats,
  };
}

// Main combination system component
export default function CombinationSystem() {
  const {
    recipes,
    selectedSlots,
    addToSlot,
    removeFromSlot,
    clearSlots,
    checkRecipeMatch,
    craft,
    craftingInProgress,
    lastResult,
    setLastResult,
    getStats,
  } = useCombinationSystem();

  const { settings } = useSettingsStore();
  const [selectedCategory, setSelectedCategory] = useState<'all' | CombinationRecipe['category']>('all');
  const [showRecipeBook, setShowRecipeBook] = useState(false);

  const stats = getStats();
  const matchedRecipe = checkRecipeMatch();

  const filteredRecipes =
    selectedCategory === 'all'
      ? recipes
      : recipes.filter((r) => r.category === selectedCategory);

  // Mock available stickers for demo
  const mockStickers = DEFAULT_RECIPES.flatMap((r) => r.ingredients);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🧪 Combination Lab
      </h2>

      {/* Stats */}
      <div className="mb-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl p-6 text-white">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold">{stats.discovered}/{stats.total}</div>
            <div className="text-sm opacity-90">Recipes Discovered</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{stats.percentage}%</div>
            <div className="text-sm opacity-90">Completion</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{stats.totalCrafts}</div>
            <div className="text-sm opacity-90">Total Crafts</div>
          </div>
        </div>
      </div>

      {/* Crafting slots */}
      <div className="mb-8 bg-gray-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Crafting Slots</h3>

        <div className="grid grid-cols-6 gap-4 mb-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`
                aspect-square rounded-xl flex items-center justify-center text-5xl
                ${selectedSlots[i]
                  ? 'bg-gradient-to-br from-purple-100 to-pink-100 cursor-pointer hover:from-purple-200 hover:to-pink-200'
                  : 'bg-gray-200 border-2 border-dashed border-gray-400'
                }
              `}
              onClick={() => selectedSlots[i] && removeFromSlot(i)}
            >
              {selectedSlots[i] ? (
                mockStickers.find((s) => s.stickerId === selectedSlots[i])?.emoji
              ) : (
                <span className="text-gray-400 text-2xl">+</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={clearSlots}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
          >
            🗑️ Clear All
          </button>
          <button
            onClick={() => craft()}
            disabled={!matchedRecipe || craftingInProgress}
            className={`
              flex-1 py-3 rounded-xl font-bold text-lg transition-all
              ${matchedRecipe && !craftingInProgress
                ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {craftingInProgress ? '⚗️ Crafting...' : matchedRecipe ? '✨ Craft!' : '❌ No Match'}
          </button>
        </div>

        {matchedRecipe && !craftingInProgress && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-green-50 border-2 border-green-500 rounded-xl p-4 text-center"
          >
            <div className="text-green-900 font-bold mb-2">Recipe Matched!</div>
            <div className="text-4xl mb-2">{matchedRecipe.result.emoji}</div>
            <div className="text-lg font-bold text-green-900">
              {matchedRecipe.name}
            </div>
          </motion.div>
        )}
      </div>

      {/* Available ingredients */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Available Ingredients</h3>
        <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
          {mockStickers.map((sticker, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: settings.reducedMotion ? 0 : index * 0.02 }}
              onClick={() => addToSlot(sticker.stickerId)}
              className="aspect-square rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 flex items-center justify-center text-4xl transition-all hover:scale-110"
            >
              {sticker.emoji}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recipe book button */}
      <div className="text-center">
        <button
          onClick={() => setShowRecipeBook(true)}
          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xl font-bold rounded-2xl hover:scale-105 transition-transform shadow-xl"
        >
          📚 Recipe Book
        </button>
      </div>

      {/* Recipe book modal */}
      <AnimatePresence>
        {showRecipeBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowRecipeBook(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Recipe Book</h3>

              {/* Category filter */}
              <div className="flex gap-2 mb-6 overflow-x-auto">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Recipes
                </button>
                {COMBINATION_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as CombinationRecipe['category'])}
                    className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                      selectedCategory === cat.id
                        ? `bg-gradient-to-r ${cat.color} text-white`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>

              {/* Recipe list */}
              <div className="space-y-4">
                {filteredRecipes.map((recipe, index) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    index={index}
                    reducedMotion={settings.reducedMotion}
                  />
                ))}
              </div>

              <button
                onClick={() => setShowRecipeBook(false)}
                className="mt-6 w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result animation */}
      <AnimatePresence>
        {lastResult && (
          <CraftResultModal
            recipe={lastResult}
            onClose={() => setLastResult(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Recipe card component
function RecipeCard({
  recipe,
  index,
  reducedMotion,
}: {
  recipe: CombinationRecipe;
  index: number;
  reducedMotion: boolean;
}) {
  const category = COMBINATION_CATEGORIES.find((c) => c.id === recipe.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reducedMotion ? 0 : index * 0.05 }}
      className={`
        rounded-xl p-6
        ${recipe.discovered
          ? 'bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-500'
          : 'bg-gray-100'
        }
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {recipe.discovered ? recipe.name : '???'}
          </div>
          <div className={`text-sm ${recipe.discovered ? 'text-gray-600' : 'text-gray-400'}`}>
            {recipe.discovered ? recipe.description : 'Recipe not yet discovered'}
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${category?.color} text-white`}>
          {category?.icon} {category?.name}
        </div>
      </div>

      {recipe.discovered ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Ingredients */}
          <div className="md:col-span-2 bg-white rounded-lg p-4">
            <div className="text-sm font-bold text-gray-700 mb-2">Ingredients:</div>
            <div className="flex flex-wrap gap-2">
              {recipe.ingredients.map((ing, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 bg-blue-100 rounded-lg px-3 py-1"
                >
                  <span className="text-2xl">{ing.emoji}</span>
                  <span className="text-sm font-bold">×{ing.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Result */}
          <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg p-4 text-center">
            <div className="text-sm font-bold text-gray-700 mb-2">Result:</div>
            <div className="text-5xl mb-2">{recipe.result.emoji}</div>
            <div className="font-bold text-gray-900">{recipe.result.stickerName}</div>
            <div className="text-xs text-gray-600 capitalize">{recipe.result.rarity}</div>
            {recipe.timesCompleted > 0 && (
              <div className="mt-2 text-xs text-gray-600">
                Crafted {recipe.timesCompleted}× times
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-400">
          <div className="text-6xl mb-2">🔒</div>
          <div>Discover this recipe by experimenting!</div>
          {recipe.unlockCondition && (
            <div className="text-sm mt-2">Unlock: {recipe.unlockCondition}</div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Craft result modal
function CraftResultModal({
  recipe,
  onClose,
}: {
  recipe: CombinationRecipe;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="text-9xl mb-6"
        >
          {recipe.result.emoji}
        </motion.div>

        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 text-white mb-6">
          <div className="text-5xl font-bold mb-2">Success!</div>
          <div className="text-3xl mb-4">{recipe.name}</div>
          <div className="text-xl opacity-90">
            You created: {recipe.result.stickerName}!
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-12 py-4 bg-white text-gray-900 rounded-2xl font-bold text-xl hover:scale-105 transition-transform"
        >
          Amazing! ✨
        </button>
      </motion.div>
    </motion.div>
  );
}
