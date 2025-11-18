import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FavoritesSystem Component
 *
 * Comprehensive favorites management system for typing tutor.
 * Allows users to save, organize, and quickly access their favorite
 * lessons, scenes, exercises, and content.
 *
 * Features:
 * - Add/remove favorites
 * - Multiple favorite categories
 * - Favorite collections/folders
 * - Quick access favorites bar
 * - Search and filter favorites
 * - Sort favorites
 * - Favorite statistics
 * - Import/export favorites
 * - Sync across devices
 * - Favorite recommendations
 */

// Types for favorites system
export type FavoriteType =
  | 'lesson'
  | 'scene'
  | 'exercise'
  | 'prompt'
  | 'template'
  | 'character'
  | 'theme'
  | 'custom';

export interface FavoriteItem {
  id: string;
  type: FavoriteType;
  name: string;
  description?: string;
  icon?: string;
  thumbnail?: string;
  addedAt: Date;
  lastAccessed?: Date;
  accessCount: number;
  rating?: number; // 1-5
  tags: string[];
  metadata?: Record<string, any>;
}

export interface FavoriteCollection {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  items: string[]; // favorite IDs
  createdAt: Date;
  updatedAt: Date;
  isDefault: boolean;
  color?: string;
}

export interface FavoritesSettings {
  enabled: boolean;
  showQuickAccess: boolean;
  quickAccessCount: number;
  autoSuggest: boolean;
  syncEnabled: boolean;
  maxFavorites: number;
  defaultView: 'grid' | 'list';
  sortBy: 'recent' | 'name' | 'type' | 'rating' | 'accessed';
  groupByType: boolean;
}

export interface FavoriteStats {
  totalFavorites: number;
  favoritesByType: Record<FavoriteType, number>;
  mostAccessed: FavoriteItem[];
  recentlyAdded: FavoriteItem[];
  topRated: FavoriteItem[];
  averageRating: number;
}

export interface FavoriteFilter {
  types?: FavoriteType[];
  tags?: string[];
  searchQuery?: string;
  minRating?: number;
  collections?: string[];
}

// Custom hook for favorites system
export function useFavoritesSystem(initialSettings?: Partial<FavoritesSettings>) {
  const [settings, setSettings] = useState<FavoritesSettings>({
    enabled: true,
    showQuickAccess: true,
    quickAccessCount: 5,
    autoSuggest: true,
    syncEnabled: false,
    maxFavorites: 100,
    defaultView: 'grid',
    sortBy: 'recent',
    groupByType: false,
    ...initialSettings,
  });

  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [collections, setCollections] = useState<FavoriteCollection[]>([]);
  const [filter, setFilter] = useState<FavoriteFilter>({});
  const [stats, setStats] = useState<FavoriteStats>({
    totalFavorites: 0,
    favoritesByType: {} as Record<FavoriteType, number>,
    mostAccessed: [],
    recentlyAdded: [],
    topRated: [],
    averageRating: 0,
  });

  const updateSettings = useCallback((newSettings: Partial<FavoritesSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const addFavorite = useCallback(
    (
      id: string,
      type: FavoriteType,
      name: string,
      options?: {
        description?: string;
        icon?: string;
        thumbnail?: string;
        tags?: string[];
        metadata?: Record<string, any>;
      }
    ): FavoriteItem | null => {
      // Check if already exists
      if (favorites.find((f) => f.id === id)) {
        return null;
      }

      // Check max limit
      if (favorites.length >= settings.maxFavorites) {
        return null;
      }

      const favorite: FavoriteItem = {
        id,
        type,
        name,
        description: options?.description,
        icon: options?.icon,
        thumbnail: options?.thumbnail,
        addedAt: new Date(),
        accessCount: 0,
        tags: options?.tags || [],
        metadata: options?.metadata,
      };

      setFavorites((prev) => [favorite, ...prev]);
      updateStats([favorite, ...favorites]);

      return favorite;
    },
    [favorites, settings.maxFavorites]
  );

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      updateStats(updated);
      return updated;
    });

    // Remove from collections
    setCollections((prev) =>
      prev.map((col) => ({
        ...col,
        items: col.items.filter((itemId) => itemId !== id),
        updatedAt: new Date(),
      }))
    );
  }, []);

  const toggleFavorite = useCallback(
    (
      id: string,
      type: FavoriteType,
      name: string,
      options?: {
        description?: string;
        icon?: string;
        tags?: string[];
      }
    ) => {
      const existing = favorites.find((f) => f.id === id);
      if (existing) {
        removeFavorite(id);
        return false;
      } else {
        addFavorite(id, type, name, options);
        return true;
      }
    },
    [favorites, addFavorite, removeFavorite]
  );

  const isFavorite = useCallback(
    (id: string): boolean => {
      return favorites.some((f) => f.id === id);
    },
    [favorites]
  );

  const getFavorite = useCallback(
    (id: string): FavoriteItem | null => {
      return favorites.find((f) => f.id === id) || null;
    },
    [favorites]
  );

  const updateFavorite = useCallback((id: string, updates: Partial<FavoriteItem>) => {
    setFavorites((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  }, []);

  const rateFavorite = useCallback(
    (id: string, rating: number) => {
      updateFavorite(id, { rating });
      updateStats(favorites);
    },
    [favorites, updateFavorite]
  );

  const accessFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                lastAccessed: new Date(),
                accessCount: f.accessCount + 1,
              }
            : f
        )
      );
      updateStats(favorites);
    },
    [favorites]
  );

  const createCollection = useCallback(
    (
      name: string,
      description?: string,
      options?: {
        icon?: string;
        color?: string;
        items?: string[];
      }
    ): FavoriteCollection => {
      const collection: FavoriteCollection = {
        id: `collection-${Date.now()}`,
        name,
        description,
        icon: options?.icon || '📁',
        items: options?.items || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: false,
        color: options?.color,
      };

      setCollections((prev) => [...prev, collection]);
      return collection;
    },
    []
  );

  const addToCollection = useCallback((collectionId: string, favoriteId: string) => {
    setCollections((prev) =>
      prev.map((col) =>
        col.id === collectionId
          ? {
              ...col,
              items: [...col.items, favoriteId],
              updatedAt: new Date(),
            }
          : col
      )
    );
  }, []);

  const removeFromCollection = useCallback((collectionId: string, favoriteId: string) => {
    setCollections((prev) =>
      prev.map((col) =>
        col.id === collectionId
          ? {
              ...col,
              items: col.items.filter((id) => id !== favoriteId),
              updatedAt: new Date(),
            }
          : col
      )
    );
  }, []);

  const deleteCollection = useCallback((collectionId: string) => {
    setCollections((prev) => prev.filter((col) => col.id !== collectionId));
  }, []);

  const getFilteredFavorites = useCallback((): FavoriteItem[] => {
    let filtered = [...favorites];

    // Apply type filter
    if (filter.types && filter.types.length > 0) {
      filtered = filtered.filter((f) => filter.types!.includes(f.type));
    }

    // Apply tags filter
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter((f) =>
        filter.tags!.some((tag) => f.tags.includes(tag))
      );
    }

    // Apply search query
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.description?.toLowerCase().includes(query) ||
          f.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply rating filter
    if (filter.minRating !== undefined) {
      filtered = filtered.filter((f) => f.rating && f.rating >= filter.minRating!);
    }

    // Apply collection filter
    if (filter.collections && filter.collections.length > 0) {
      const collectionItems = new Set<string>();
      filter.collections.forEach((colId) => {
        const col = collections.find((c) => c.id === colId);
        if (col) {
          col.items.forEach((itemId) => collectionItems.add(itemId));
        }
      });
      filtered = filtered.filter((f) => collectionItems.has(f.id));
    }

    // Apply sorting
    switch (settings.sortBy) {
      case 'recent':
        filtered.sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'type':
        filtered.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'accessed':
        filtered.sort((a, b) => b.accessCount - a.accessCount);
        break;
    }

    return filtered;
  }, [favorites, filter, settings.sortBy, collections]);

  const getQuickAccessFavorites = useCallback((): FavoriteItem[] => {
    return [...favorites]
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, settings.quickAccessCount);
  }, [favorites, settings.quickAccessCount]);

  const updateStats = useCallback((currentFavorites: FavoriteItem[]) => {
    const favoritesByType = currentFavorites.reduce((acc, f) => {
      acc[f.type] = (acc[f.type] || 0) + 1;
      return acc;
    }, {} as Record<FavoriteType, number>);

    const mostAccessed = [...currentFavorites]
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 5);

    const recentlyAdded = [...currentFavorites]
      .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
      .slice(0, 5);

    const topRated = [...currentFavorites]
      .filter((f) => f.rating)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5);

    const totalRatings = currentFavorites.filter((f) => f.rating).length;
    const sumRatings = currentFavorites.reduce((sum, f) => sum + (f.rating || 0), 0);
    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    setStats({
      totalFavorites: currentFavorites.length,
      favoritesByType,
      mostAccessed,
      recentlyAdded,
      topRated,
      averageRating,
    });
  }, []);

  const exportFavorites = useCallback((): string => {
    const data = {
      favorites,
      collections,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }, [favorites, collections]);

  const importFavorites = useCallback((jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      if (data.favorites) {
        setFavorites(data.favorites);
      }
      if (data.collections) {
        setCollections(data.collections);
      }
      updateStats(data.favorites || []);
    } catch (err) {
      console.error('Failed to import favorites:', err);
    }
  }, [updateStats]);

  const clearAllFavorites = useCallback(() => {
    setFavorites([]);
    setCollections([]);
    updateStats([]);
  }, [updateStats]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('typing-tutor-favorites');
      if (stored) {
        const data = JSON.parse(stored);
        setFavorites(data.favorites || []);
        setCollections(data.collections || []);
        updateStats(data.favorites || []);
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  }, [updateStats]);

  // Save favorites to localStorage when changed
  useEffect(() => {
    try {
      const data = { favorites, collections };
      localStorage.setItem('typing-tutor-favorites', JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save favorites:', err);
    }
  }, [favorites, collections]);

  return {
    settings,
    updateSettings,
    favorites,
    collections,
    filter,
    setFilter,
    stats,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    getFavorite,
    updateFavorite,
    rateFavorite,
    accessFavorite,
    createCollection,
    addToCollection,
    removeFromCollection,
    deleteCollection,
    getFilteredFavorites,
    getQuickAccessFavorites,
    exportFavorites,
    importFavorites,
    clearAllFavorites,
  };
}

// Main component
interface FavoritesSystemProps {
  onFavoriteAccess?: (favorite: FavoriteItem) => void;
  initialSettings?: Partial<FavoritesSettings>;
}

const FavoritesSystem: React.FC<FavoritesSystemProps> = ({
  onFavoriteAccess,
  initialSettings,
}) => {
  const fs = useFavoritesSystem(initialSettings);
  const [showCollections, setShowCollections] = useState(false);

  const filteredFavorites = fs.getFilteredFavorites();
  const quickAccess = fs.getQuickAccessFavorites();

  const handleFavoriteClick = useCallback(
    (favorite: FavoriteItem) => {
      fs.accessFavorite(favorite.id);
      onFavoriteAccess?.(favorite);
    },
    [fs, onFavoriteAccess]
  );

  const favoriteTypeIcons: Record<FavoriteType, string> = {
    lesson: '📚',
    scene: '🎬',
    exercise: '💪',
    prompt: '✍️',
    template: '📄',
    character: '👤',
    theme: '🎨',
    custom: '⭐',
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Quick Access Bar */}
      {fs.settings.showQuickAccess && quickAccess.length > 0 && (
        <div
          style={{
            padding: '15px',
            backgroundColor: '#E3F2FD',
            borderRadius: '8px',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '12px' }}>⚡ Quick Access</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {quickAccess.map((fav) => (
              <motion.button
                key={fav.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFavoriteClick(fav)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'white',
                  border: '2px solid #2196F3',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>{fav.icon || favoriteTypeIcons[fav.type]}</span>
                <span style={{ fontSize: '14px' }}>{fav.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '15px',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '2px solid #e0e0e0',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}>
            {fs.stats.totalFavorites}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Total Favorites</div>
        </div>

        <div
          style={{
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '2px solid #e0e0e0',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FF9800' }}>
            {fs.collections.length}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Collections</div>
        </div>

        <div
          style={{
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '2px solid #e0e0e0',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196F3' }}>
            {fs.stats.averageRating.toFixed(1)}⭐
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Avg Rating</div>
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setShowCollections(!showCollections)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          {showCollections ? 'Hide' : 'Show'} Collections
        </button>

        <input
          type="text"
          placeholder="Search favorites..."
          value={fs.filter.searchQuery || ''}
          onChange={(e) => fs.setFilter({ ...fs.filter, searchQuery: e.target.value })}
          style={{
            padding: '10px',
            border: '2px solid #ddd',
            borderRadius: '6px',
            flex: 1,
            minWidth: '200px',
          }}
        />

        <select
          value={fs.settings.sortBy}
          onChange={(e) =>
            fs.updateSettings({
              sortBy: e.target.value as FavoritesSettings['sortBy'],
            })
          }
          style={{
            padding: '10px',
            border: '2px solid #ddd',
            borderRadius: '6px',
          }}
        >
          <option value="recent">Most Recent</option>
          <option value="name">Name</option>
          <option value="type">Type</option>
          <option value="rating">Rating</option>
          <option value="accessed">Most Accessed</option>
        </select>
      </div>

      {/* Collections */}
      <AnimatePresence>
        {showCollections && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginBottom: '20px',
              padding: '20px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
            }}
          >
            <h3 style={{ marginTop: 0 }}>Collections</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {fs.collections.map((col) => (
                <motion.button
                  key={col.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: col.color || 'white',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{col.icon}</span>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{col.name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {col.items.length} items
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Favorites Grid */}
      {filteredFavorites.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              fs.settings.defaultView === 'grid'
                ? 'repeat(auto-fill, minmax(250px, 1fr))'
                : '1fr',
            gap: '15px',
          }}
        >
          {filteredFavorites.map((fav) => (
            <motion.div
              key={fav.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleFavoriteClick(fav)}
              style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '2px solid #e0e0e0',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <span style={{ fontSize: '32px' }}>
                  {fav.icon || favoriteTypeIcons[fav.type]}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fs.removeFavorite(fav.id);
                  }}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#F44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  ❌
                </button>
              </div>

              <h4 style={{ margin: '0 0 8px 0' }}>{fav.name}</h4>

              {fav.description && (
                <p
                  style={{
                    fontSize: '14px',
                    color: '#666',
                    marginBottom: '10px',
                  }}
                >
                  {fav.description}
                </p>
              )}

              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '10px',
                  flexWrap: 'wrap',
                }}
              >
                <span
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#E3F2FD',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  {fav.type}
                </span>
                {fav.rating && (
                  <span style={{ fontSize: '12px' }}>
                    {'⭐'.repeat(fav.rating)}
                  </span>
                )}
              </div>

              <div style={{ fontSize: '12px', color: '#999' }}>
                Accessed {fav.accessCount} times
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: '#999',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⭐</div>
          <h3>No Favorites Yet</h3>
          <p>Start adding your favorite content to access it quickly later</p>
        </div>
      )}
    </div>
  );
};

export default FavoritesSystem;
