import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

// Types
export type SaveDataType =
  | 'full-game' // Complete game state
  | 'narrative-progress' // Just narrative progress
  | 'user-profile' // User settings and stats
  | 'typing-stats' // Typing statistics only
  | 'achievements' // Achievements and unlocks
  | 'custom'; // User-defined saves

export type SaveFormat = 'json' | 'compressed' | 'encrypted';

export type StorageLocation = 'localStorage' | 'sessionStorage' | 'indexedDB' | 'file';

export interface SaveSlot {
  id: string;
  name: string;
  description?: string;
  dataType: SaveDataType;
  createdAt: Date;
  lastModified: Date;
  gameVersion: string;
  playTime: number; // Total play time in seconds
  completionPercentage: number;
  thumbnail?: string; // Base64 encoded image or emoji
  autosave: boolean;
  tags: string[];
  metadata: {
    narrativeId?: string;
    currentLevel?: number;
    achievements?: number;
    totalTypedWords?: number;
    averageWPM?: number;
    averageAccuracy?: number;
  };
}

export interface SaveData {
  version: string;
  timestamp: Date;
  dataType: SaveDataType;
  data: {
    // User profile
    userProfile?: {
      name: string;
      level: number;
      xp: number;
      preferences: Record<string, any>;
    };

    // Narrative progress
    narrativeProgress?: {
      currentNarrativeId?: string;
      currentSectionId?: string;
      visitedSections: string[];
      choicesMade: { sectionId: string; choiceId: string }[];
      unlockedNarratives: string[];
    };

    // Typing statistics
    typingStats?: {
      totalWords: number;
      totalTime: number;
      sessionsCompleted: number;
      averageWPM: number;
      averageAccuracy: number;
      bestWPM: number;
      bestAccuracy: number;
      totalMistakes: number;
    };

    // Achievements
    achievements?: {
      unlockedAchievements: string[];
      achievementProgress: Record<string, number>;
    };

    // Settings
    settings?: Record<string, any>;

    // Custom data
    custom?: Record<string, any>;
  };
}

export interface SaveLoadSettings {
  enableAutosave: boolean;
  autosaveInterval: number; // milliseconds
  maxSaveSlots: number;
  maxAutosaves: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  defaultStorageLocation: StorageLocation;
  saveFormat: SaveFormat;
  confirmBeforeOverwrite: boolean;
  showSaveThumbnails: boolean;
  cloudSyncEnabled: boolean; // For future implementation
}

export interface SaveOperation {
  id: string;
  type: 'save' | 'load' | 'delete' | 'export' | 'import';
  slotId: string;
  timestamp: Date;
  success: boolean;
  error?: string;
}

interface SaveLoadSystemProps {
  gameVersion: string;
  onSave?: (slot: SaveSlot) => void;
  onLoad?: (slot: SaveSlot, data: SaveData) => void;
  onDelete?: (slotId: string) => void;
  onError?: (operation: SaveOperation, error: Error) => void;
  settings?: Partial<SaveLoadSettings>;
}

const defaultSettings: SaveLoadSettings = {
  enableAutosave: true,
  autosaveInterval: 60000, // 1 minute
  maxSaveSlots: 10,
  maxAutosaves: 3,
  compressionEnabled: false,
  encryptionEnabled: false,
  defaultStorageLocation: 'localStorage',
  saveFormat: 'json',
  confirmBeforeOverwrite: true,
  showSaveThumbnails: true,
  cloudSyncEnabled: false,
};

export const useSaveLoadSystem = (props: SaveLoadSystemProps) => {
  const { gameVersion } = props;
  const settings = { ...defaultSettings, ...props.settings };

  // State
  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([]);
  const [currentSaveData, setCurrentSaveData] = useState<SaveData | null>(null);
  const [operationHistory, setOperationHistory] = useState<SaveOperation[]>([]);
  const [lastAutosave, setLastAutosave] = useState<Date | null>(null);
  const [savingInProgress, setSavingInProgress] = useState(false);

  // Load save slots from storage
  useEffect(() => {
    loadSaveSlots();
  }, []);

  // Autosave timer
  useEffect(() => {
    if (!settings.enableAutosave || !currentSaveData) return;

    const autosaveTimer = setInterval(() => {
      performAutosave();
    }, settings.autosaveInterval);

    return () => clearInterval(autosaveTimer);
  }, [settings.enableAutosave, settings.autosaveInterval, currentSaveData]);

  // Load save slots from localStorage
  const loadSaveSlots = useCallback(() => {
    try {
      const saved = localStorage.getItem('typing-tutor-save-slots');
      if (saved) {
        const slots = JSON.parse(saved) as SaveSlot[];
        setSaveSlots(slots);
      }
    } catch (err) {
      console.error('Failed to load save slots:', err);
    }
  }, []);

  // Persist save slots to localStorage
  const persistSaveSlots = useCallback((slots: SaveSlot[]) => {
    try {
      localStorage.setItem('typing-tutor-save-slots', JSON.stringify(slots));
    } catch (err) {
      console.error('Failed to persist save slots:', err);
    }
  }, []);

  // Create a new save
  const createSave = useCallback(
    (
      name: string,
      dataType: SaveDataType,
      data: SaveData['data'],
      options?: {
        description?: string;
        thumbnail?: string;
        tags?: string[];
        metadata?: SaveSlot['metadata'];
      }
    ): string | null => {
      if (saveSlots.length >= settings.maxSaveSlots && !saveSlots.some((s) => s.autosave)) {
        console.warn('Maximum save slots reached');
        return null;
      }

      setSavingInProgress(true);

      try {
        const saveId = `save-${Date.now()}`;

        const saveData: SaveData = {
          version: gameVersion,
          timestamp: new Date(),
          dataType,
          data,
        };

        // Store the actual save data
        const storageKey = `typing-tutor-save-${saveId}`;
        localStorage.setItem(storageKey, JSON.stringify(saveData));

        // Calculate metadata
        const playTime = data.typingStats?.totalTime || 0;
        const completionPercentage = calculateCompletionPercentage(data);

        const saveSlot: SaveSlot = {
          id: saveId,
          name,
          description: options?.description,
          dataType,
          createdAt: new Date(),
          lastModified: new Date(),
          gameVersion,
          playTime,
          completionPercentage,
          thumbnail: options?.thumbnail || '💾',
          autosave: false,
          tags: options?.tags || [],
          metadata: options?.metadata || {},
        };

        setSaveSlots((prev) => {
          const updated = [...prev, saveSlot];
          persistSaveSlots(updated);
          return updated;
        });

        const operation: SaveOperation = {
          id: `op-${Date.now()}`,
          type: 'save',
          slotId: saveId,
          timestamp: new Date(),
          success: true,
        };
        setOperationHistory((prev) => [...prev, operation]);

        props.onSave?.(saveSlot);
        setSavingInProgress(false);

        return saveId;
      } catch (err) {
        console.error('Failed to create save:', err);
        setSavingInProgress(false);

        const operation: SaveOperation = {
          id: `op-${Date.now()}`,
          type: 'save',
          slotId: '',
          timestamp: new Date(),
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        };
        setOperationHistory((prev) => [...prev, operation]);
        props.onError?.(operation, err instanceof Error ? err : new Error('Unknown error'));

        return null;
      }
    },
    [saveSlots, settings.maxSaveSlots, gameVersion, persistSaveSlots, props]
  );

  // Calculate completion percentage from save data
  const calculateCompletionPercentage = useCallback((data: SaveData['data']): number => {
    let completion = 0;

    if (data.narrativeProgress) {
      const visited = data.narrativeProgress.visitedSections.length;
      const unlocked = data.narrativeProgress.unlockedNarratives.length;
      completion += (visited / 50) * 30; // Max 30% for narrative progress
      completion += (unlocked / 10) * 20; // Max 20% for unlocks
    }

    if (data.achievements) {
      const achieved = data.achievements.unlockedAchievements.length;
      completion += (achieved / 50) * 30; // Max 30% for achievements
    }

    if (data.typingStats) {
      const sessions = data.typingStats.sessionsCompleted;
      completion += Math.min((sessions / 100) * 20, 20); // Max 20% for sessions
    }

    return Math.min(Math.round(completion), 100);
  }, []);

  // Load a save
  const loadSave = useCallback(
    (slotId: string): SaveData | null => {
      try {
        const storageKey = `typing-tutor-save-${slotId}`;
        const saved = localStorage.getItem(storageKey);

        if (!saved) {
          throw new Error('Save data not found');
        }

        const saveData = JSON.parse(saved) as SaveData;

        // Version check
        if (saveData.version !== gameVersion) {
          console.warn(`Save version mismatch: ${saveData.version} vs ${gameVersion}`);
          // Could implement migration logic here
        }

        setCurrentSaveData(saveData);

        const slot = saveSlots.find((s) => s.id === slotId);
        if (slot) {
          props.onLoad?.(slot, saveData);
        }

        const operation: SaveOperation = {
          id: `op-${Date.now()}`,
          type: 'load',
          slotId,
          timestamp: new Date(),
          success: true,
        };
        setOperationHistory((prev) => [...prev, operation]);

        return saveData;
      } catch (err) {
        console.error('Failed to load save:', err);

        const operation: SaveOperation = {
          id: `op-${Date.now()}`,
          type: 'load',
          slotId,
          timestamp: new Date(),
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        };
        setOperationHistory((prev) => [...prev, operation]);
        props.onError?.(operation, err instanceof Error ? err : new Error('Unknown error'));

        return null;
      }
    },
    [saveSlots, gameVersion, props]
  );

  // Delete a save
  const deleteSave = useCallback(
    (slotId: string): boolean => {
      try {
        const storageKey = `typing-tutor-save-${slotId}`;
        localStorage.removeItem(storageKey);

        setSaveSlots((prev) => {
          const updated = prev.filter((s) => s.id !== slotId);
          persistSaveSlots(updated);
          return updated;
        });

        const operation: SaveOperation = {
          id: `op-${Date.now()}`,
          type: 'delete',
          slotId,
          timestamp: new Date(),
          success: true,
        };
        setOperationHistory((prev) => [...prev, operation]);

        props.onDelete?.(slotId);

        return true;
      } catch (err) {
        console.error('Failed to delete save:', err);

        const operation: SaveOperation = {
          id: `op-${Date.now()}`,
          type: 'delete',
          slotId,
          timestamp: new Date(),
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        };
        setOperationHistory((prev) => [...prev, operation]);
        props.onError?.(operation, err instanceof Error ? err : new Error('Unknown error'));

        return false;
      }
    },
    [persistSaveSlots, props]
  );

  // Update existing save
  const updateSave = useCallback(
    (slotId: string, data: SaveData['data']): boolean => {
      try {
        const slot = saveSlots.find((s) => s.id === slotId);
        if (!slot) {
          throw new Error('Save slot not found');
        }

        const saveData: SaveData = {
          version: gameVersion,
          timestamp: new Date(),
          dataType: slot.dataType,
          data,
        };

        const storageKey = `typing-tutor-save-${slotId}`;
        localStorage.setItem(storageKey, JSON.stringify(saveData));

        // Update slot metadata
        const updatedSlot: SaveSlot = {
          ...slot,
          lastModified: new Date(),
          playTime: data.typingStats?.totalTime || slot.playTime,
          completionPercentage: calculateCompletionPercentage(data),
        };

        setSaveSlots((prev) => {
          const updated = prev.map((s) => (s.id === slotId ? updatedSlot : s));
          persistSaveSlots(updated);
          return updated;
        });

        return true;
      } catch (err) {
        console.error('Failed to update save:', err);
        return false;
      }
    },
    [saveSlots, gameVersion, calculateCompletionPercentage, persistSaveSlots]
  );

  // Perform autosave
  const performAutosave = useCallback(() => {
    if (!currentSaveData) return;

    try {
      // Find or create autosave slot
      let autosaveSlot = saveSlots.find((s) => s.autosave);

      if (!autosaveSlot) {
        // Create new autosave
        const saveId = `autosave-${Date.now()}`;

        const slot: SaveSlot = {
          id: saveId,
          name: 'Autosave',
          dataType: 'full-game',
          createdAt: new Date(),
          lastModified: new Date(),
          gameVersion,
          playTime: currentSaveData.data.typingStats?.totalTime || 0,
          completionPercentage: calculateCompletionPercentage(currentSaveData.data),
          thumbnail: '🔄',
          autosave: true,
          tags: ['autosave'],
          metadata: {},
        };

        const storageKey = `typing-tutor-save-${saveId}`;
        localStorage.setItem(storageKey, JSON.stringify(currentSaveData));

        setSaveSlots((prev) => {
          const updated = [...prev, slot];
          persistSaveSlots(updated);
          return updated;
        });

        autosaveSlot = slot;
      } else {
        // Update existing autosave
        updateSave(autosaveSlot.id, currentSaveData.data);
      }

      setLastAutosave(new Date());
    } catch (err) {
      console.error('Autosave failed:', err);
    }
  }, [currentSaveData, saveSlots, gameVersion, calculateCompletionPercentage, persistSaveSlots, updateSave]);

  // Export save to file
  const exportSave = useCallback(
    (slotId: string): string | null => {
      try {
        const saveData = loadSave(slotId);
        if (!saveData) return null;

        const slot = saveSlots.find((s) => s.id === slotId);
        const exportData = {
          slot,
          data: saveData,
        };

        const json = JSON.stringify(exportData, null, 2);

        const operation: SaveOperation = {
          id: `op-${Date.now()}`,
          type: 'export',
          slotId,
          timestamp: new Date(),
          success: true,
        };
        setOperationHistory((prev) => [...prev, operation]);

        return json;
      } catch (err) {
        console.error('Failed to export save:', err);

        const operation: SaveOperation = {
          id: `op-${Date.now()}`,
          type: 'export',
          slotId,
          timestamp: new Date(),
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        };
        setOperationHistory((prev) => [...prev, operation]);

        return null;
      }
    },
    [saveSlots, loadSave]
  );

  // Import save from JSON
  const importSave = useCallback(
    (jsonData: string): string | null => {
      try {
        const imported = JSON.parse(jsonData);
        const slot = imported.slot as SaveSlot;
        const data = imported.data as SaveData;

        if (!slot || !data) {
          throw new Error('Invalid save file format');
        }

        // Create new save with imported data
        const newSlotId = createSave(
          `${slot.name} (Imported)`,
          slot.dataType,
          data.data,
          {
            description: slot.description,
            thumbnail: slot.thumbnail,
            tags: [...slot.tags, 'imported'],
            metadata: slot.metadata,
          }
        );

        if (newSlotId) {
          const operation: SaveOperation = {
            id: `op-${Date.now()}`,
            type: 'import',
            slotId: newSlotId,
            timestamp: new Date(),
            success: true,
          };
          setOperationHistory((prev) => [...prev, operation]);
        }

        return newSlotId;
      } catch (err) {
        console.error('Failed to import save:', err);

        const operation: SaveOperation = {
          id: `op-${Date.now()}`,
          type: 'import',
          slotId: '',
          timestamp: new Date(),
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        };
        setOperationHistory((prev) => [...prev, operation]);

        return null;
      }
    },
    [createSave]
  );

  // Get save statistics
  const getSaveStatistics = useCallback(() => {
    return {
      totalSaves: saveSlots.length,
      autosaves: saveSlots.filter((s) => s.autosave).length,
      manualSaves: saveSlots.filter((s) => !s.autosave).length,
      totalPlayTime: saveSlots.reduce((sum, s) => sum + s.playTime, 0),
      averageCompletion: saveSlots.reduce((sum, s) => sum + s.completionPercentage, 0) / saveSlots.length || 0,
      mostRecentSave: saveSlots.reduce((latest, s) =>
        s.lastModified > latest.lastModified ? s : latest
      , saveSlots[0]),
      oldestSave: saveSlots.reduce((oldest, s) =>
        s.createdAt < oldest.createdAt ? s : oldest
      , saveSlots[0]),
      lastAutosaveTime: lastAutosave,
      successfulOperations: operationHistory.filter((op) => op.success).length,
      failedOperations: operationHistory.filter((op) => !op.success).length,
    };
  }, [saveSlots, lastAutosave, operationHistory]);

  return {
    // State
    saveSlots,
    currentSaveData,
    operationHistory,
    lastAutosave,
    savingInProgress,
    settings,

    // Actions
    createSave,
    loadSave,
    deleteSave,
    updateSave,
    setCurrentSaveData,
    exportSave,
    importSave,
    getSaveStatistics,
  };
};

// Example component
export const SaveLoadSystemComponent: React.FC<SaveLoadSystemProps> = (props) => {
  const {
    saveSlots,
    lastAutosave,
    savingInProgress,
    loadSave,
    deleteSave,
    exportSave,
    settings,
  } = useSaveLoadSystem(props);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleExport = useCallback(
    (slotId: string) => {
      const json = exportSave(slotId);
      if (json) {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `typing-tutor-save-${slotId}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    },
    [exportSave]
  );

  return (
    <div className="save-load-system">
      <div className="save-header">
        <h2>Save Slots</h2>
        {settings.enableAutosave && lastAutosave && (
          <p className="autosave-status">
            Last autosave: {lastAutosave.toLocaleTimeString()}
          </p>
        )}
        {savingInProgress && <p className="saving-indicator">Saving...</p>}
      </div>

      <div className="save-slots-list">
        {saveSlots.length === 0 ? (
          <p className="no-saves">No save files found</p>
        ) : (
          saveSlots.map((slot) => (
            <motion.div
              key={slot.id}
              className={`save-slot ${slot.autosave ? 'autosave' : ''}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {settings.showSaveThumbnails && (
                <div className="save-thumbnail">{slot.thumbnail}</div>
              )}

              <div className="save-info">
                <h3>{slot.name}</h3>
                {slot.description && <p className="description">{slot.description}</p>}

                <div className="save-meta">
                  <span className="date">
                    {new Date(slot.lastModified).toLocaleDateString()}
                  </span>
                  <span className="time">
                    {Math.floor(slot.playTime / 60)}m played
                  </span>
                  <span className="completion">{slot.completionPercentage}% complete</span>
                </div>

                {slot.tags.length > 0 && (
                  <div className="save-tags">
                    {slot.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="save-actions">
                <button onClick={() => loadSave(slot.id)} className="load-btn">
                  Load
                </button>
                <button onClick={() => handleExport(slot.id)} className="export-btn">
                  Export
                </button>
                {!slot.autosave && (
                  <button
                    onClick={() => setShowDeleteConfirm(slot.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                )}
              </div>

              {showDeleteConfirm === slot.id && (
                <div className="delete-confirm">
                  <p>Delete this save?</p>
                  <button
                    onClick={() => {
                      deleteSave(slot.id);
                      setShowDeleteConfirm(null);
                    }}
                    className="confirm-btn"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="cancel-btn"
                  >
                    No
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default SaveLoadSystemComponent;
