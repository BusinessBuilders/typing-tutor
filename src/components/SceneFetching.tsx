import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GeneratedScene, SceneTheme, SceneDifficulty } from './AISceneGeneration';

/**
 * SceneFetching Component
 *
 * Scene fetching and management system for autism typing tutor.
 * Handles retrieving, caching, and managing typing practice scenes
 * from various sources (local storage, API, database).
 *
 * Features:
 * - Scene fetching from multiple sources
 * - Local scene caching
 * - Scene search and filtering
 * - Scene categorization
 * - Popular and recommended scenes
 * - Offline support
 * - Scene synchronization
 * - Loading states and error handling
 * - Scene preloading
 * - Scene collections and playlists
 */

// Types for scene fetching
export type FetchSource = 'local' | 'cache' | 'api' | 'database' | 'custom';
export type FetchStatus = 'idle' | 'loading' | 'success' | 'error';
export type SortBy = 'recent' | 'popular' | 'difficulty' | 'theme' | 'favorites' | 'length';

export interface SceneFilter {
  themes?: SceneTheme[];
  difficulties?: SceneDifficulty[];
  minWordCount?: number;
  maxWordCount?: number;
  favoritesOnly?: boolean;
  searchQuery?: string;
  tags?: string[];
}

export interface SceneCollection {
  id: string;
  name: string;
  description: string;
  sceneIds: string[];
  theme?: SceneTheme;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  author?: string;
}

export interface FetchOptions {
  source: FetchSource;
  useCache: boolean;
  offline: boolean;
  preload: boolean;
  batchSize: number;
  timeout: number; // milliseconds
}

export interface FetchResult {
  scenes: GeneratedScene[];
  total: number;
  hasMore: boolean;
  source: FetchSource;
  fetchedAt: Date;
  cached: boolean;
}

export interface FetchSettings {
  enabled: boolean;
  defaultSource: FetchSource;
  cacheEnabled: boolean;
  cacheDuration: number; // seconds
  offlineMode: boolean;
  autoPreload: boolean;
  preloadCount: number;
  syncEnabled: boolean;
  syncInterval: number; // seconds
}

export interface CacheEntry {
  key: string;
  scenes: GeneratedScene[];
  timestamp: Date;
  expiresAt: Date;
  source: FetchSource;
}

// Custom hook for scene fetching
export function useSceneFetching(initialSettings?: Partial<FetchSettings>) {
  const [settings, setSettings] = useState<FetchSettings>({
    enabled: true,
    defaultSource: 'local',
    cacheEnabled: true,
    cacheDuration: 3600, // 1 hour
    offlineMode: false,
    autoPreload: true,
    preloadCount: 5,
    syncEnabled: false,
    syncInterval: 300, // 5 minutes
    ...initialSettings,
  });

  const [scenes, setScenes] = useState<GeneratedScene[]>([]);
  const [collections, setCollections] = useState<SceneCollection[]>([]);
  const [cache, setCache] = useState<CacheEntry[]>([]);
  const [status, setStatus] = useState<FetchStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<SceneFilter>({});
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalScenes, setTotalScenes] = useState(0);

  const updateSettings = useCallback((newSettings: Partial<FetchSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Fetch scenes from source
  const fetchScenes = useCallback(
    async (options?: Partial<FetchOptions>): Promise<FetchResult> => {
      const fetchOptions: FetchOptions = {
        source: settings.defaultSource,
        useCache: settings.cacheEnabled,
        offline: settings.offlineMode,
        preload: settings.autoPreload,
        batchSize: 20,
        timeout: 5000,
        ...options,
      };

      setStatus('loading');
      setError(null);

      try {
        // Check cache first if enabled
        if (fetchOptions.useCache && settings.cacheEnabled) {
          const cacheKey = generateCacheKey(filter, sortBy);
          const cached = getCachedScenes(cache, cacheKey);

          if (cached) {
            setScenes(cached.scenes);
            setTotalScenes(cached.scenes.length);
            setStatus('success');

            return {
              scenes: cached.scenes,
              total: cached.scenes.length,
              hasMore: false,
              source: cached.source,
              fetchedAt: cached.timestamp,
              cached: true,
            };
          }
        }

        // Simulate fetch delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Fetch from source
        let fetchedScenes: GeneratedScene[] = [];

        switch (fetchOptions.source) {
          case 'local':
            fetchedScenes = await fetchFromLocalStorage();
            break;
          case 'api':
            fetchedScenes = await fetchFromAPI(filter);
            break;
          case 'database':
            fetchedScenes = await fetchFromDatabase(filter);
            break;
          case 'custom':
            fetchedScenes = await fetchFromCustomSource();
            break;
          default:
            fetchedScenes = [];
        }

        // Apply filters and sorting
        const filteredScenes = applyFilter(fetchedScenes, filter);
        const sortedScenes = applySorting(filteredScenes, sortBy);

        setScenes(sortedScenes);
        setTotalScenes(sortedScenes.length);
        setStatus('success');

        // Cache results if enabled
        if (settings.cacheEnabled) {
          const cacheKey = generateCacheKey(filter, sortBy);
          addToCache(cache, setCache, cacheKey, sortedScenes, fetchOptions.source, settings.cacheDuration);
        }

        return {
          scenes: sortedScenes,
          total: sortedScenes.length,
          hasMore: false,
          source: fetchOptions.source,
          fetchedAt: new Date(),
          cached: false,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch scenes';
        setError(errorMessage);
        setStatus('error');

        throw new Error(errorMessage);
      }
    },
    [settings, filter, sortBy, cache]
  );

  // Fetch specific scene by ID
  const fetchSceneById = useCallback(
    async (sceneId: string): Promise<GeneratedScene | null> => {
      // Check current scenes first
      const existingScene = scenes.find((s) => s.id === sceneId);
      if (existingScene) return existingScene;

      // Try to fetch from storage
      try {
        const allScenes = await fetchFromLocalStorage();
        return allScenes.find((s) => s.id === sceneId) || null;
      } catch {
        return null;
      }
    },
    [scenes]
  );

  // Search scenes
  const searchScenes = useCallback(
    async (query: string): Promise<GeneratedScene[]> => {
      const searchFilter: SceneFilter = {
        ...filter,
        searchQuery: query,
      };

      setFilter(searchFilter);
      const result = await fetchScenes();
      return result.scenes;
    },
    [filter, fetchScenes]
  );

  // Get popular scenes
  const getPopularScenes = useCallback(
    async (count: number = 10): Promise<GeneratedScene[]> => {
      const allScenes = await fetchScenes();
      return allScenes.scenes.slice(0, count);
    },
    [fetchScenes]
  );

  // Get recommended scenes
  const getRecommendedScenes = useCallback(
    async (userThemes: SceneTheme[], count: number = 5): Promise<GeneratedScene[]> => {
      const recommendedFilter: SceneFilter = {
        themes: userThemes,
      };

      setFilter(recommendedFilter);
      const result = await fetchScenes();
      return result.scenes.slice(0, count);
    },
    [fetchScenes]
  );

  // Create scene collection
  const createCollection = useCallback(
    (name: string, description: string, sceneIds: string[]): SceneCollection => {
      const collection: SceneCollection = {
        id: `collection-${Date.now()}`,
        name,
        description,
        sceneIds,
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: false,
      };

      setCollections((prev) => [...prev, collection]);
      saveCollectionsToStorage([...collections, collection]);

      return collection;
    },
    [collections]
  );

  // Add scene to collection
  const addToCollection = useCallback(
    (collectionId: string, sceneId: string) => {
      setCollections((prev) =>
        prev.map((col) =>
          col.id === collectionId
            ? {
                ...col,
                sceneIds: [...col.sceneIds, sceneId],
                updatedAt: new Date(),
              }
            : col
        )
      );

      saveCollectionsToStorage(collections);
    },
    [collections]
  );

  // Remove scene from collection
  const removeFromCollection = useCallback(
    (collectionId: string, sceneId: string) => {
      setCollections((prev) =>
        prev.map((col) =>
          col.id === collectionId
            ? {
                ...col,
                sceneIds: col.sceneIds.filter((id) => id !== sceneId),
                updatedAt: new Date(),
              }
            : col
        )
      );

      saveCollectionsToStorage(collections);
    },
    [collections]
  );

  // Clear cache
  const clearCache = useCallback(() => {
    setCache([]);
  }, []);

  // Refresh scenes
  const refreshScenes = useCallback(async () => {
    clearCache();
    return fetchScenes({ useCache: false });
  }, [clearCache, fetchScenes]);

  // Auto-sync effect
  useEffect(() => {
    if (!settings.enabled || !settings.syncEnabled) return;

    const interval = setInterval(() => {
      fetchScenes({ useCache: false });
    }, settings.syncInterval * 1000);

    return () => clearInterval(interval);
  }, [settings.enabled, settings.syncEnabled, settings.syncInterval, fetchScenes]);

  // Load collections from storage on mount
  useEffect(() => {
    const loadCollections = async () => {
      const stored = await loadCollectionsFromStorage();
      setCollections(stored);
    };

    loadCollections();
  }, []);

  return {
    settings,
    updateSettings,
    scenes,
    collections,
    status,
    error,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    totalScenes,
    fetchScenes,
    fetchSceneById,
    searchScenes,
    getPopularScenes,
    getRecommendedScenes,
    createCollection,
    addToCollection,
    removeFromCollection,
    clearCache,
    refreshScenes,
  };
}

// Helper functions

function generateCacheKey(filter: SceneFilter, sortBy: SortBy): string {
  return `${JSON.stringify(filter)}-${sortBy}`;
}

function getCachedScenes(cache: CacheEntry[], key: string): CacheEntry | null {
  const entry = cache.find((c) => c.key === key);

  if (!entry) return null;

  // Check if expired
  if (new Date() > entry.expiresAt) {
    return null;
  }

  return entry;
}

function addToCache(
  _cache: CacheEntry[],
  setCache: React.Dispatch<React.SetStateAction<CacheEntry[]>>,
  key: string,
  scenes: GeneratedScene[],
  source: FetchSource,
  duration: number
) {
  const now = new Date();
  const entry: CacheEntry = {
    key,
    scenes,
    timestamp: now,
    expiresAt: new Date(now.getTime() + duration * 1000),
    source,
  };

  setCache((prev) => {
    // Remove old entry with same key
    const filtered = prev.filter((c) => c.key !== key);
    return [...filtered, entry];
  });
}

async function fetchFromLocalStorage(): Promise<GeneratedScene[]> {
  try {
    const stored = localStorage.getItem('typing-tutor-scenes');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

async function fetchFromAPI(_filter: SceneFilter): Promise<GeneratedScene[]> {
  // Simulate API call
  // In production, this would be an actual API endpoint
  return fetchFromLocalStorage();
}

async function fetchFromDatabase(_filter: SceneFilter): Promise<GeneratedScene[]> {
  // Simulate database query
  // In production, this would connect to a database
  return fetchFromLocalStorage();
}

async function fetchFromCustomSource(): Promise<GeneratedScene[]> {
  // Custom source implementation
  return [];
}

function applyFilter(scenes: GeneratedScene[], filter: SceneFilter): GeneratedScene[] {
  let filtered = scenes;

  if (filter.themes && filter.themes.length > 0) {
    filtered = filtered.filter((s) => filter.themes!.includes(s.theme));
  }

  if (filter.difficulties && filter.difficulties.length > 0) {
    filtered = filtered.filter((s) => filter.difficulties!.includes(s.difficulty));
  }

  if (filter.minWordCount !== undefined) {
    filtered = filtered.filter((s) => s.wordCount >= filter.minWordCount!);
  }

  if (filter.maxWordCount !== undefined) {
    filtered = filtered.filter((s) => s.wordCount <= filter.maxWordCount!);
  }

  if (filter.favoritesOnly) {
    filtered = filtered.filter((s) => s.favorite);
  }

  if (filter.searchQuery) {
    const query = filter.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.title.toLowerCase().includes(query) ||
        s.typingContent.toLowerCase().includes(query) ||
        s.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }

  if (filter.tags && filter.tags.length > 0) {
    filtered = filtered.filter((s) => filter.tags!.some((tag) => s.tags.includes(tag)));
  }

  return filtered;
}

function applySorting(scenes: GeneratedScene[], sortBy: SortBy): GeneratedScene[] {
  const sorted = [...scenes];

  switch (sortBy) {
    case 'recent':
      return sorted.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
    case 'popular':
      return sorted.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));
    case 'difficulty':
      const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
      return sorted.sort(
        (a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
      );
    case 'theme':
      return sorted.sort((a, b) => a.theme.localeCompare(b.theme));
    case 'favorites':
      return sorted.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));
    case 'length':
      return sorted.sort((a, b) => a.wordCount - b.wordCount);
    default:
      return sorted;
  }
}

async function saveCollectionsToStorage(collections: SceneCollection[]): Promise<void> {
  try {
    localStorage.setItem('typing-tutor-collections', JSON.stringify(collections));
  } catch (err) {
    console.error('Failed to save collections:', err);
  }
}

async function loadCollectionsFromStorage(): Promise<SceneCollection[]> {
  try {
    const stored = localStorage.getItem('typing-tutor-collections');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Main component
interface SceneFetchingProps {
  onSceneSelect?: (scene: GeneratedScene) => void;
  initialSettings?: Partial<FetchSettings>;
}

const SceneFetching: React.FC<SceneFetchingProps> = ({
  onSceneSelect,
  initialSettings,
}) => {
  const sf = useSceneFetching(initialSettings);

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (query.trim()) {
        await sf.searchScenes(query);
      } else {
        await sf.fetchScenes();
      }
    },
    [sf]
  );

  const handleFilterChange = useCallback(
    async (newFilter: Partial<SceneFilter>) => {
      sf.setFilter((prev) => ({ ...prev, ...newFilter }));
      await sf.fetchScenes();
    },
    [sf]
  );

  useEffect(() => {
    sf.fetchScenes();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search scenes..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '16px',
            border: '2px solid #ddd',
            borderRadius: '8px',
          }}
        />
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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilters(!showFilters)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => sf.refreshScenes()}
          disabled={sf.status === 'loading'}
          style={{
            padding: '10px 20px',
            backgroundColor: sf.status === 'loading' ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: sf.status === 'loading' ? 'wait' : 'pointer',
          }}
        >
          {sf.status === 'loading' ? '⏳ Loading...' : '🔄 Refresh'}
        </motion.button>

        <select
          value={sf.sortBy}
          onChange={(e) => sf.setSortBy(e.target.value as SortBy)}
          style={{
            padding: '10px 15px',
            fontSize: '14px',
            border: '2px solid #ddd',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          <option value="recent">Most Recent</option>
          <option value="popular">Most Popular</option>
          <option value="difficulty">By Difficulty</option>
          <option value="theme">By Theme</option>
          <option value="favorites">Favorites</option>
          <option value="length">By Length</option>
        </select>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
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
            <h4 style={{ marginTop: 0 }}>Filters</h4>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                <input
                  type="checkbox"
                  checked={sf.filter.favoritesOnly || false}
                  onChange={(e) =>
                    handleFilterChange({ favoritesOnly: e.target.checked })
                  }
                  style={{ marginRight: '10px' }}
                />
                Favorites Only
              </label>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '10px' }}>
                Word Count Range:
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={sf.filter.minWordCount || ''}
                  onChange={(e) =>
                    handleFilterChange({
                      minWordCount: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  style={{
                    padding: '8px',
                    width: '100px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                  }}
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={sf.filter.maxWordCount || ''}
                  onChange={(e) =>
                    handleFilterChange({
                      maxWordCount: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  style={{
                    padding: '8px',
                    width: '100px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Messages */}
      {sf.status === 'error' && (
        <div
          style={{
            padding: '15px',
            backgroundColor: '#FFEBEE',
            color: '#C62828',
            borderRadius: '8px',
            marginBottom: '20px',
          }}
        >
          Error: {sf.error}
        </div>
      )}

      {/* Scene Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
        }}
      >
        {sf.scenes.map((scene) => (
          <motion.div
            key={scene.id}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSceneSelect?.(scene)}
            style={{
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '2px solid #ddd',
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
              <h3 style={{ margin: 0 }}>{scene.title}</h3>
              {scene.favorite && <span style={{ fontSize: '20px' }}>⭐</span>}
            </div>

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
                {scene.theme}
              </span>
              <span
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#FFF3E0',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                {scene.difficulty}
              </span>
              <span
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#F3E5F5',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                {scene.wordCount} words
              </span>
            </div>

            <p
              style={{
                fontSize: '14px',
                color: '#666',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {scene.typingContent}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {sf.status === 'success' && sf.scenes.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#999',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📭</div>
          <h3>No scenes found</h3>
          <p>Try adjusting your filters or search query</p>
        </div>
      )}

      {/* Collections Section */}
      {sf.collections.length > 0 && (
        <div
          style={{
            marginTop: '40px',
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Your Collections</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '15px',
            }}
          >
            {sf.collections.map((collection) => (
              <div
                key={collection.id}
                style={{
                  padding: '15px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  border: '2px solid #ddd',
                }}
              >
                <h4 style={{ margin: '0 0 10px 0' }}>{collection.name}</h4>
                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 10px 0' }}>
                  {collection.description}
                </p>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  {collection.sceneIds.length} scenes
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SceneFetching;
