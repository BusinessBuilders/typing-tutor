/**
 * Collection Gallery Component
 * Step 240 - Create comprehensive gallery for viewing all collections
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import type { Sticker } from './StickerSystem';
import { RARITY_LEVELS } from './StickerSystem';
import type { TradingCard } from './TradingCards';

// Gallery view modes
export type ViewMode = 'grid' | 'list' | 'showcase' | 'timeline' | 'mosaic';

// Gallery filter options
export interface GalleryFilter {
  rarity: 'all' | Sticker['rarity'];
  category: 'all' | Sticker['category'];
  unlocked: 'all' | 'unlocked' | 'locked';
  sortBy: 'name' | 'rarity' | 'date' | 'quantity';
  sortOrder: 'asc' | 'desc';
}

// Gallery item interface (unified for stickers and cards)
export interface GalleryItem {
  id: string;
  type: 'sticker' | 'card';
  name: string;
  emoji: string;
  rarity: string;
  category: string;
  unlocked: boolean;
  quantity: number;
  dateObtained?: Date;
  data: Sticker | TradingCard;
}

// Custom hook for gallery
export function useCollectionGallery(items: GalleryItem[]) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState<GalleryFilter>({
    rarity: 'all',
    category: 'all',
    unlocked: 'all',
    sortBy: 'rarity',
    sortOrder: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const getFilteredItems = () => {
    let filtered = items;

    // Apply filters
    if (filter.rarity !== 'all') {
      filtered = filtered.filter((item) => item.rarity === filter.rarity);
    }
    if (filter.category !== 'all') {
      filtered = filtered.filter((item) => item.category === filter.category);
    }
    if (filter.unlocked === 'unlocked') {
      filtered = filtered.filter((item) => item.unlocked);
    } else if (filter.unlocked === 'locked') {
      filtered = filtered.filter((item) => !item.unlocked);
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filter.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'rarity': {
          const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
          comparison = rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
          break;
        }
        case 'date':
          if (a.dateObtained && b.dateObtained) {
            comparison = a.dateObtained.getTime() - b.dateObtained.getTime();
          }
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
      }

      return filter.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  };

  const getStats = () => {
    const unlocked = items.filter((i) => i.unlocked).length;
    const total = items.length;
    const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

    const rarityBreakdown = RARITY_LEVELS.map((rarity) => {
      const rarityItems = items.filter((i) => i.rarity === rarity.level);
      const unlockedCount = rarityItems.filter((i) => i.unlocked).length;
      return {
        rarity: rarity.level,
        name: rarity.name,
        unlocked: unlockedCount,
        total: rarityItems.length,
        percentage: rarityItems.length > 0 ? Math.round((unlockedCount / rarityItems.length) * 100) : 0,
      };
    });

    return {
      unlocked,
      total,
      percentage: Math.round((unlocked / total) * 100),
      totalQuantity,
      rarityBreakdown,
    };
  };

  return {
    viewMode,
    setViewMode,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    selectedItem,
    setSelectedItem,
    getFilteredItems,
    getStats,
  };
}

// Main gallery component
export default function CollectionGallery({ items }: { items: GalleryItem[] }) {
  const {
    viewMode,
    setViewMode,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    selectedItem,
    setSelectedItem,
    getFilteredItems,
    getStats,
  } = useCollectionGallery(items);

  const { settings } = useSettingsStore();
  const filteredItems = getFilteredItems();
  const stats = getStats();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🖼️ Collection Gallery
      </h2>

      {/* Stats overview */}
      <div className="mb-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl p-6 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold">{stats.unlocked}/{stats.total}</div>
            <div className="text-sm opacity-90">Items Unlocked</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{stats.percentage}%</div>
            <div className="text-sm opacity-90">Complete</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{stats.totalQuantity}</div>
            <div className="text-sm opacity-90">Total Collected</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold">{filteredItems.length}</div>
            <div className="text-sm opacity-90">Showing</div>
          </div>
        </div>
      </div>

      {/* View mode selector */}
      <div className="mb-6 flex justify-center gap-2">
        {[
          { mode: 'grid', icon: '▦', label: 'Grid' },
          { mode: 'list', icon: '☰', label: 'List' },
          { mode: 'showcase', icon: '⭐', label: 'Showcase' },
          { mode: 'timeline', icon: '📅', label: 'Timeline' },
          { mode: 'mosaic', icon: '🎨', label: 'Mosaic' },
        ].map((view) => (
          <button
            key={view.mode}
            onClick={() => setViewMode(view.mode as ViewMode)}
            className={`px-6 py-2 rounded-lg font-bold transition-colors ${
              viewMode === view.mode
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {view.icon} {view.label}
          </button>
        ))}
      </div>

      {/* Filters and search */}
      <div className="mb-6 bg-gray-50 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name..."
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
            />
          </div>

          {/* Unlocked filter */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
            <select
              value={filter.unlocked}
              onChange={(e) => setFilter({ ...filter, unlocked: e.target.value as GalleryFilter['unlocked'] })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
            >
              <option value="all">All Items</option>
              <option value="unlocked">Unlocked Only</option>
              <option value="locked">Locked Only</option>
            </select>
          </div>

          {/* Sort by */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Sort By</label>
            <select
              value={filter.sortBy}
              onChange={(e) => setFilter({ ...filter, sortBy: e.target.value as GalleryFilter['sortBy'] })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
            >
              <option value="rarity">Rarity</option>
              <option value="name">Name</option>
              <option value="date">Date Obtained</option>
              <option value="quantity">Quantity</option>
            </select>
          </div>

          {/* Sort order */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Order</label>
            <select
              value={filter.sortOrder}
              onChange={(e) => setFilter({ ...filter, sortOrder: e.target.value as 'asc' | 'desc' })}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Rarity filter chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter({ ...filter, rarity: 'all' })}
            className={`px-4 py-1 rounded-full text-sm font-bold ${
              filter.rarity === 'all'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Rarities
          </button>
          {RARITY_LEVELS.map((rarity) => (
            <button
              key={rarity.level}
              onClick={() => setFilter({ ...filter, rarity: rarity.level })}
              className={`px-4 py-1 rounded-full text-sm font-bold ${
                filter.rarity === rarity.level
                  ? `bg-gradient-to-r ${rarity.color} text-white`
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {rarity.sparkle} {rarity.name}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery display */}
      <div className="mb-6">
        {filteredItems.length > 0 ? (
          <>
            {viewMode === 'grid' && (
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {filteredItems.map((item, index) => (
                  <GalleryItemCard
                    key={item.id}
                    item={item}
                    index={index}
                    onClick={() => setSelectedItem(item)}
                    reducedMotion={settings.reducedMotion}
                  />
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-3">
                {filteredItems.map((item, index) => (
                  <GalleryItemList
                    key={item.id}
                    item={item}
                    index={index}
                    onClick={() => setSelectedItem(item)}
                    reducedMotion={settings.reducedMotion}
                  />
                ))}
              </div>
            )}

            {viewMode === 'showcase' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item, index) => (
                  <GalleryItemShowcase
                    key={item.id}
                    item={item}
                    index={index}
                    onClick={() => setSelectedItem(item)}
                    reducedMotion={settings.reducedMotion}
                  />
                ))}
              </div>
            )}

            {viewMode === 'timeline' && (
              <div className="space-y-4">
                {filteredItems
                  .filter((item) => item.dateObtained)
                  .map((item, index) => (
                    <GalleryItemTimeline
                      key={item.id}
                      item={item}
                      index={index}
                      onClick={() => setSelectedItem(item)}
                      reducedMotion={settings.reducedMotion}
                    />
                  ))}
              </div>
            )}

            {viewMode === 'mosaic' && (
              <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
                {filteredItems.map((item, index) => (
                  <div key={item.id} className="break-inside-avoid mb-4">
                    <GalleryItemShowcase
                      item={item}
                      index={index}
                      onClick={() => setSelectedItem(item)}
                      reducedMotion={settings.reducedMotion}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🔍</div>
            <div className="text-xl font-bold">No Items Found</div>
            <div>Try adjusting your filters</div>
          </div>
        )}
      </div>

      {/* Rarity breakdown */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Rarity Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.rarityBreakdown.map((breakdown) => {
            const rarityInfo = RARITY_LEVELS.find((r) => r.level === breakdown.rarity);
            return (
              <div
                key={breakdown.rarity}
                className={`bg-gradient-to-br ${rarityInfo?.color} rounded-xl p-4 text-white text-center`}
              >
                <div className="text-3xl mb-2">{rarityInfo?.sparkle}</div>
                <div className="font-bold">{breakdown.name}</div>
                <div className="text-2xl font-bold mt-2">
                  {breakdown.unlocked}/{breakdown.total}
                </div>
                <div className="text-sm opacity-90">{breakdown.percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Item detail modal */}
      <AnimatePresence>
        {selectedItem && (
          <ItemDetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Gallery item card (grid view)
function GalleryItemCard({
  item,
  index,
  onClick,
  reducedMotion,
}: {
  item: GalleryItem;
  index: number;
  onClick: () => void;
  reducedMotion: boolean;
}) {
  const rarityInfo = RARITY_LEVELS.find((r) => r.level === item.rarity);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: reducedMotion ? 0 : index * 0.01 }}
      onClick={onClick}
      className={`
        relative aspect-square rounded-xl cursor-pointer transition-all
        ${item.unlocked
          ? `bg-gradient-to-br ${rarityInfo?.color} hover:scale-110 shadow-lg`
          : 'bg-gray-200 hover:bg-gray-300'
        }
        flex items-center justify-center
      `}
    >
      <div className="text-4xl">{item.unlocked ? item.emoji : '🔒'}</div>
      {item.unlocked && item.quantity > 1 && (
        <div className="absolute top-1 right-1 bg-white bg-opacity-90 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
          {item.quantity}
        </div>
      )}
    </motion.div>
  );
}

// Gallery item list view
function GalleryItemList({
  item,
  index,
  onClick,
  reducedMotion,
}: {
  item: GalleryItem;
  index: number;
  onClick: () => void;
  reducedMotion: boolean;
}) {
  const rarityInfo = RARITY_LEVELS.find((r) => r.level === item.rarity);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: reducedMotion ? 0 : index * 0.02 }}
      onClick={onClick}
      className={`
        flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all
        ${item.unlocked
          ? `bg-gradient-to-r ${rarityInfo?.color} text-white hover:scale-102`
          : 'bg-gray-100 hover:bg-gray-200'
        }
      `}
    >
      <div className="text-5xl">{item.unlocked ? item.emoji : '🔒'}</div>
      <div className="flex-1">
        <div className="font-bold text-lg">{item.unlocked ? item.name : '???'}</div>
        <div className={`text-sm ${item.unlocked ? 'opacity-90' : 'text-gray-600'}`}>
          {rarityInfo?.sparkle} {rarityInfo?.name}
        </div>
      </div>
      {item.unlocked && (
        <div className="text-center">
          <div className="text-2xl font-bold">{item.quantity}</div>
          <div className="text-xs opacity-90">Owned</div>
        </div>
      )}
    </motion.div>
  );
}

// Gallery item showcase view
function GalleryItemShowcase({
  item,
  index,
  onClick,
  reducedMotion,
}: {
  item: GalleryItem;
  index: number;
  onClick: () => void;
  reducedMotion: boolean;
}) {
  const rarityInfo = RARITY_LEVELS.find((r) => r.level === item.rarity);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: reducedMotion ? 0 : index * 0.05 }}
      onClick={onClick}
      className={`
        relative p-6 rounded-2xl cursor-pointer transition-all
        ${item.unlocked
          ? `bg-gradient-to-br ${rarityInfo?.color} text-white hover:scale-105 shadow-xl`
          : 'bg-gray-200 hover:bg-gray-300'
        }
      `}
    >
      <div className="text-center">
        <div className="text-7xl mb-3">{item.unlocked ? item.emoji : '🔒'}</div>
        <div className="font-bold text-lg mb-1">{item.unlocked ? item.name : '???'}</div>
        <div className={`text-sm ${item.unlocked ? 'opacity-90' : 'text-gray-600'}`}>
          {rarityInfo?.sparkle} {rarityInfo?.name}
        </div>
        {item.unlocked && item.quantity > 1 && (
          <div className="mt-2 bg-white bg-opacity-30 rounded-full px-3 py-1 text-sm font-bold inline-block">
            ×{item.quantity}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Gallery item timeline view
function GalleryItemTimeline({
  item,
  index,
  onClick,
  reducedMotion,
}: {
  item: GalleryItem;
  index: number;
  onClick: () => void;
  reducedMotion: boolean;
}) {
  const rarityInfo = RARITY_LEVELS.find((r) => r.level === item.rarity);

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: reducedMotion ? 0 : index * 0.05 }}
      onClick={onClick}
      className="flex items-center gap-6 cursor-pointer"
    >
      <div className="flex-shrink-0 w-32 text-sm text-gray-600 text-right">
        {item.dateObtained?.toLocaleDateString()}
      </div>
      <div className="flex-shrink-0 w-1 h-16 bg-gray-300 relative">
        <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-5 h-5 bg-purple-500 rounded-full" />
      </div>
      <div
        className={`flex-1 p-4 rounded-xl bg-gradient-to-r ${rarityInfo?.color} text-white hover:scale-102 transition-all`}
      >
        <div className="flex items-center gap-4">
          <div className="text-5xl">{item.emoji}</div>
          <div>
            <div className="font-bold text-lg">{item.name}</div>
            <div className="text-sm opacity-90">
              {rarityInfo?.sparkle} {rarityInfo?.name} • ×{item.quantity}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Item detail modal
function ItemDetailModal({
  item,
  onClose,
}: {
  item: GalleryItem;
  onClose: () => void;
}) {
  const rarityInfo = RARITY_LEVELS.find((r) => r.level === item.rarity);

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
          bg-gradient-to-br ${rarityInfo?.color}
          rounded-3xl p-8 max-w-2xl w-full text-white shadow-2xl
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-9xl mb-4">{item.unlocked ? item.emoji : '🔒'}</div>
          <div className="text-4xl font-bold mb-2">
            {item.unlocked ? item.name : 'Locked Item'}
          </div>
          <div className="text-2xl mb-6 opacity-90">
            {rarityInfo?.sparkle} {rarityInfo?.name}
          </div>

          {item.unlocked ? (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white bg-opacity-20 rounded-xl p-4">
                <div className="text-sm opacity-90">Quantity</div>
                <div className="text-4xl font-bold">{item.quantity}</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl p-4">
                <div className="text-sm opacity-90">Type</div>
                <div className="text-2xl font-bold capitalize">{item.type}</div>
              </div>
              {item.dateObtained && (
                <div className="col-span-2 bg-white bg-opacity-20 rounded-xl p-4">
                  <div className="text-sm opacity-90">Obtained</div>
                  <div className="text-xl font-bold">
                    {item.dateObtained.toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white bg-opacity-20 rounded-xl p-8 mb-6">
              <div className="text-6xl mb-4">🔒</div>
              <div className="text-xl">This item is locked</div>
              <div className="text-sm opacity-90 mt-2">
                Complete challenges to unlock!
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-4 bg-white text-gray-900 rounded-xl font-bold text-xl hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
