/**
 * Collection Album Component
 * Step 232 - Build collection album for organizing and displaying stickers
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import type { Sticker } from './StickerSystem';
import { STICKER_CATEGORIES, RARITY_LEVELS } from './StickerSystem';

// Album page interface
export interface AlbumPage {
  id: string;
  name: string;
  category?: Sticker['category'];
  slots: number; // Number of sticker slots per page
  layout: 'grid' | 'list' | 'showcase';
}

// Album configuration
const ALBUM_PAGES: AlbumPage[] = [
  { id: 'all', name: 'All Stickers', slots: 24, layout: 'grid' },
  { id: 'achievement', name: 'Achievements', category: 'achievement', slots: 12, layout: 'grid' },
  { id: 'milestone', name: 'Milestones', category: 'milestone', slots: 12, layout: 'grid' },
  { id: 'special', name: 'Special Events', category: 'special', slots: 12, layout: 'grid' },
  { id: 'seasonal', name: 'Seasonal', category: 'seasonal', slots: 12, layout: 'grid' },
  { id: 'pet', name: 'Pet Collection', category: 'pet', slots: 12, layout: 'grid' },
  { id: 'theme', name: 'Themes', category: 'theme', slots: 12, layout: 'grid' },
  { id: 'favorites', name: 'Favorites', slots: 16, layout: 'showcase' },
  { id: 'recent', name: 'Recently Unlocked', slots: 16, layout: 'list' },
];

// Custom hook for album management
export function useCollectionAlbum(stickers: Sticker[]) {
  const [currentPage, setCurrentPage] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'album' | 'stats'>('album');

  const getCurrentPageData = () => ALBUM_PAGES[currentPage];

  const getPageStickers = (page: AlbumPage) => {
    if (page.id === 'favorites') {
      return stickers.filter((s) => favorites.includes(s.id));
    }

    if (page.id === 'recent') {
      return stickers
        .filter((s) => s.unlocked)
        .sort((a, b) => {
          if (!a.unlockedAt || !b.unlockedAt) return 0;
          return b.unlockedAt.getTime() - a.unlockedAt.getTime();
        })
        .slice(0, page.slots);
    }

    if (page.category) {
      return stickers.filter((s) => s.category === page.category);
    }

    return stickers;
  };

  const toggleFavorite = (stickerId: string) => {
    setFavorites((prev) =>
      prev.includes(stickerId)
        ? prev.filter((id) => id !== stickerId)
        : [...prev, stickerId]
    );
  };

  const isFavorite = (stickerId: string) => favorites.includes(stickerId);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % ALBUM_PAGES.length);
  };

  const previousPage = () => {
    setCurrentPage((prev) => (prev - 1 + ALBUM_PAGES.length) % ALBUM_PAGES.length);
  };

  const goToPage = (pageIndex: number) => {
    setCurrentPage(pageIndex);
  };

  const getCompletionStats = () => {
    return ALBUM_PAGES.map((page) => {
      const pageStickers = getPageStickers(page);
      const unlocked = pageStickers.filter((s) => s.unlocked).length;
      const total = pageStickers.length;
      return {
        page: page.name,
        unlocked,
        total,
        percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
      };
    });
  };

  return {
    currentPage,
    setCurrentPage,
    getCurrentPageData,
    getPageStickers,
    nextPage,
    previousPage,
    goToPage,
    favorites,
    toggleFavorite,
    isFavorite,
    viewMode,
    setViewMode,
    getCompletionStats,
  };
}

// Main collection album component
export default function CollectionAlbum({ stickers }: { stickers: Sticker[] }) {
  const {
    currentPage,
    getCurrentPageData,
    getPageStickers,
    nextPage,
    previousPage,
    goToPage,
    favorites,
    toggleFavorite,
    isFavorite,
    viewMode,
    setViewMode,
    getCompletionStats,
  } = useCollectionAlbum(stickers);

  const { settings } = useSettingsStore();
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);

  const pageData = getCurrentPageData();
  const pageStickers = getPageStickers(pageData);
  const completionStats = getCompletionStats();

  const getRarityInfo = (rarity: Sticker['rarity']) => {
    return RARITY_LEVELS.find((r) => r.level === rarity);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        📖 Collection Album
      </h2>

      {/* View mode toggle */}
      <div className="mb-6 flex justify-center gap-2">
        <button
          onClick={() => setViewMode('album')}
          className={`px-6 py-2 rounded-lg font-bold transition-colors ${
            viewMode === 'album'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📖 Album
        </button>
        <button
          onClick={() => setViewMode('stats')}
          className={`px-6 py-2 rounded-lg font-bold transition-colors ${
            viewMode === 'stats'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📊 Statistics
        </button>
      </div>

      {viewMode === 'album' ? (
        <>
          {/* Page navigation tabs */}
          <div className="mb-6 flex overflow-x-auto gap-2 pb-2">
            {ALBUM_PAGES.map((page, index) => {
              const pageStats = completionStats[index];
              return (
                <button
                  key={page.id}
                  onClick={() => goToPage(index)}
                  className={`
                    flex-shrink-0 px-4 py-2 rounded-lg font-bold transition-all
                    ${currentPage === index
                      ? 'bg-purple-500 text-white scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <div>{page.name}</div>
                  <div className="text-xs opacity-90">
                    {pageStats.unlocked}/{pageStats.total}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Album page */}
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="mb-6"
          >
            {/* Page header */}
            <div className="mb-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">{pageData.name}</h3>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-bold">
                    {pageStickers.filter((s) => s.unlocked).length}
                  </span>
                  <span className="text-xl opacity-90">
                    /{pageStickers.length} collected
                  </span>
                </div>
                <div className="text-3xl font-bold">
                  {Math.round(
                    (pageStickers.filter((s) => s.unlocked).length /
                      pageStickers.length) *
                      100
                  )}%
                </div>
              </div>
            </div>

            {/* Stickers display */}
            {pageData.layout === 'grid' && (
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {pageStickers.map((sticker, index) => (
                  <StickerCard
                    key={sticker.id}
                    sticker={sticker}
                    index={index}
                    onClick={() => setSelectedSticker(sticker)}
                    onToggleFavorite={() => toggleFavorite(sticker.id)}
                    isFavorite={isFavorite(sticker.id)}
                    reducedMotion={settings.reducedMotion}
                  />
                ))}
              </div>
            )}

            {pageData.layout === 'list' && (
              <div className="space-y-3">
                {pageStickers.map((sticker, index) => (
                  <motion.div
                    key={sticker.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all
                      ${sticker.unlocked
                        ? 'bg-gradient-to-r ' + getRarityInfo(sticker.rarity)?.color + ' text-white hover:scale-102'
                        : 'bg-gray-100 hover:bg-gray-200'
                      }
                    `}
                    onClick={() => setSelectedSticker(sticker)}
                  >
                    <div className="text-5xl">
                      {sticker.unlocked ? sticker.emoji : '🔒'}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg">{sticker.name}</div>
                      <div className={`text-sm ${sticker.unlocked ? 'opacity-90' : 'text-gray-600'}`}>
                        {sticker.unlocked ? sticker.description : 'Locked'}
                      </div>
                    </div>
                    {sticker.unlocked && (
                      <>
                        <div className="text-center">
                          <div className="text-2xl font-bold">{sticker.quantity}</div>
                          <div className="text-xs opacity-90">Owned</div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(sticker.id);
                          }}
                          className={`text-2xl transition-transform hover:scale-125 ${
                            isFavorite(sticker.id) ? '' : 'opacity-30'
                          }`}
                        >
                          {isFavorite(sticker.id) ? '⭐' : '☆'}
                        </button>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {pageData.layout === 'showcase' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {pageStickers.map((sticker, index) => (
                  <motion.div
                    key={sticker.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
                    className={`
                      relative p-6 rounded-2xl cursor-pointer transition-all
                      bg-gradient-to-br ${getRarityInfo(sticker.rarity)?.color}
                      text-white hover:scale-105 shadow-xl
                    `}
                    onClick={() => setSelectedSticker(sticker)}
                  >
                    <div className="text-center">
                      <div className="text-7xl mb-3">{sticker.emoji}</div>
                      <div className="font-bold text-lg mb-1">{sticker.name}</div>
                      <div className="text-sm opacity-90">
                        {getRarityInfo(sticker.rarity)?.name}
                      </div>
                      {sticker.quantity > 1 && (
                        <div className="mt-2 bg-white bg-opacity-30 rounded-full px-3 py-1 text-sm font-bold">
                          ×{sticker.quantity}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(sticker.id);
                      }}
                      className="absolute top-2 right-2 text-2xl transition-transform hover:scale-125"
                    >
                      {isFavorite(sticker.id) ? '⭐' : '☆'}
                    </button>
                  </motion.div>
                ))}
              </div>
            )}

            {pageStickers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📭</div>
                <div className="text-xl font-bold">No stickers yet</div>
                <div>Start collecting to fill this page!</div>
              </div>
            )}
          </motion.div>

          {/* Page navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={previousPage}
              className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-colors"
            >
              ← Previous
            </button>
            <div className="text-gray-600">
              Page {currentPage + 1} of {ALBUM_PAGES.length}
            </div>
            <button
              onClick={nextPage}
              className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-colors"
            >
              Next →
            </button>
          </div>
        </>
      ) : (
        /* Statistics view */
        <div className="space-y-6">
          {/* Overall progress */}
          <div className="bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl p-6 text-white">
            <h3 className="text-2xl font-bold mb-4">Overall Collection</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-3xl font-bold">
                  {stickers.filter((s) => s.unlocked).length}
                </div>
                <div className="text-sm opacity-90">Total Unlocked</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-3xl font-bold">{stickers.length}</div>
                <div className="text-sm opacity-90">Total Stickers</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-3xl font-bold">{favorites.length}</div>
                <div className="text-sm opacity-90">Favorites</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-3xl font-bold">
                  {Math.round(
                    (stickers.filter((s) => s.unlocked).length / stickers.length) *
                      100
                  )}%
                </div>
                <div className="text-sm opacity-90">Completion</div>
              </div>
            </div>
          </div>

          {/* Page completion */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Page Completion
            </h3>
            <div className="space-y-3">
              {completionStats.map((stat, index) => (
                <motion.div
                  key={stat.page}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900">{stat.page}</span>
                    <span className="text-sm text-gray-600">
                      {stat.unlocked}/{stat.total} ({stat.percentage}%)
                    </span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: `${stat.percentage}%` }}
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-500"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Category Breakdown
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {STICKER_CATEGORIES.map((category) => {
                const categoryStickers = stickers.filter(
                  (s) => s.category === category.id
                );
                const unlocked = categoryStickers.filter((s) => s.unlocked).length;
                return (
                  <div
                    key={category.id}
                    className={`bg-gradient-to-r ${category.color} rounded-xl p-4 text-white`}
                  >
                    <div className="text-3xl mb-2">{category.icon}</div>
                    <div className="font-bold">{category.name}</div>
                    <div className="text-2xl font-bold mt-2">
                      {unlocked}/{categoryStickers.length}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rarity breakdown */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Rarity Breakdown
            </h3>
            <div className="space-y-3">
              {RARITY_LEVELS.map((rarity) => {
                const rarityStickers = stickers.filter(
                  (s) => s.rarity === rarity.level
                );
                const unlocked = rarityStickers.filter((s) => s.unlocked).length;
                const percentage =
                  rarityStickers.length > 0
                    ? Math.round((unlocked / rarityStickers.length) * 100)
                    : 0;

                return (
                  <div key={rarity.level}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{rarity.sparkle}</span>
                        <span className="font-bold text-gray-900">{rarity.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {unlocked}/{rarityStickers.length} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        animate={{ width: `${percentage}%` }}
                        className={`h-full bg-gradient-to-r ${rarity.color}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sticker detail modal */}
      <AnimatePresence>
        {selectedSticker && (
          <StickerDetailModal
            sticker={selectedSticker}
            onClose={() => setSelectedSticker(null)}
            onToggleFavorite={() => toggleFavorite(selectedSticker.id)}
            isFavorite={isFavorite(selectedSticker.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Sticker card component
function StickerCard({
  sticker,
  index,
  onClick,
  onToggleFavorite,
  isFavorite,
  reducedMotion,
}: {
  sticker: Sticker;
  index: number;
  onClick: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
  reducedMotion: boolean;
}) {
  const rarityInfo = RARITY_LEVELS.find((r) => r.level === sticker.rarity);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: reducedMotion ? 0 : index * 0.02 }}
      className="relative group"
    >
      <div
        onClick={onClick}
        className={`
          aspect-square rounded-xl cursor-pointer transition-all
          ${sticker.unlocked
            ? `bg-gradient-to-br ${rarityInfo?.color} hover:scale-110 shadow-lg`
            : 'bg-gray-200 hover:bg-gray-300'
          }
          flex items-center justify-center
        `}
      >
        <div className="text-4xl">{sticker.unlocked ? sticker.emoji : '🔒'}</div>
        {sticker.unlocked && sticker.quantity > 1 && (
          <div className="absolute top-1 right-1 bg-white bg-opacity-90 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {sticker.quantity}
          </div>
        )}
      </div>
      {sticker.unlocked && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`
            absolute -top-2 -right-2 text-xl transition-all
            ${isFavorite ? 'scale-125' : 'scale-100 opacity-0 group-hover:opacity-100'}
          `}
        >
          {isFavorite ? '⭐' : '☆'}
        </button>
      )}
    </motion.div>
  );
}

// Sticker detail modal component
function StickerDetailModal({
  sticker,
  onClose,
  onToggleFavorite,
  isFavorite,
}: {
  sticker: Sticker;
  onClose: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
}) {
  const rarityInfo = RARITY_LEVELS.find((r) => r.level === sticker.rarity);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className={`
          bg-gradient-to-br ${rarityInfo?.color}
          rounded-2xl p-8 max-w-md w-full text-white shadow-2xl
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-8xl mb-4">
            {sticker.unlocked ? sticker.emoji : '🔒'}
          </div>
          <div className="text-3xl font-bold mb-2">{sticker.name}</div>
          <div className="text-xl mb-4 opacity-90">{rarityInfo?.name}</div>

          <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-4">
            <p className="text-lg">{sticker.description}</p>
          </div>

          {!sticker.unlocked ? (
            <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-4">
              <div className="text-sm font-bold mb-1">How to unlock:</div>
              <div className="text-base">{sticker.unlockCondition}</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <div className="text-sm">Quantity</div>
                <div className="text-2xl font-bold">{sticker.quantity}</div>
              </div>
              {sticker.unlockedAt && (
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="text-sm">Unlocked</div>
                  <div className="font-bold">
                    {sticker.unlockedAt.toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            {sticker.unlocked && (
              <button
                onClick={onToggleFavorite}
                className="flex-1 py-3 bg-yellow-400 text-yellow-900 rounded-xl font-bold hover:bg-yellow-300 transition-colors"
              >
                {isFavorite ? '⭐ Unfavorite' : '☆ Favorite'}
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
