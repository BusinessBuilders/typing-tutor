import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Step 287: Create Distraction-Free Mode
 *
 * Provides a focused environment by minimizing visual clutter and distractions.
 * Helps users with attention difficulties, autism, or ADHD concentrate on typing.
 *
 * Features:
 * - Multiple intensity levels for progressive decluttering
 * - Customizable element visibility controls
 * - Fullscreen mode support
 * - Keyboard shortcuts for quick toggling
 * - Focus session tracking
 * - Temporary vs persistent mode
 */

export type DistractionFreeLevel = 'minimal' | 'moderate' | 'maximum' | 'zen';

export type UIElement =
  | 'header'
  | 'navigation'
  | 'sidebar'
  | 'footer'
  | 'statistics'
  | 'progress'
  | 'timer'
  | 'notifications'
  | 'achievements'
  | 'leaderboard'
  | 'chat'
  | 'help'
  | 'settings'
  | 'background';

export interface DistractionFreeProfile {
  level: DistractionFreeLevel;
  name: string;
  description: string;
  hiddenElements: UIElement[];
  features: {
    fullscreen: boolean;
    dimBackground: boolean;
    hideNonEssential: boolean;
    muteNotifications: boolean;
    simplifiedUI: boolean;
    focusHighlight: boolean;
    minimalColors: boolean;
    hideCursor: boolean;
  };
  intensity: number; // 0-100
}

export interface DistractionFreeSettings {
  enabled: boolean;
  currentLevel: DistractionFreeLevel;
  customHiddenElements: UIElement[];
  fullscreenEnabled: boolean;
  autoEnableFullscreen: boolean;
  dimBackgroundOpacity: number; // 0-1
  allowEscapeKey: boolean;
  showExitHint: boolean;
  sessionBased: boolean; // Auto-disable after session ends
  keyboardShortcuts: {
    toggle: string;
    increaseLevel: string;
    decreaseLevel: string;
    exitFullscreen: string;
  };
  focusMode: {
    highlightCurrentLine: boolean;
    hideCompletedText: boolean;
    showOnlyCurrentWord: boolean;
    dimSurroundingText: boolean;
  };
}

export interface FocusSession {
  id: string;
  level: DistractionFreeLevel;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  elementsHidden: UIElement[];
  wasFullscreen: boolean;
  completed: boolean;
}

export interface DistractionFreeStats {
  totalSessions: number;
  totalFocusTime: number; // minutes
  averageSessionLength: number; // minutes
  longestSession: number; // minutes
  preferredLevel: DistractionFreeLevel;
  fullscreenUsage: number; // percentage
  sessionsByLevel: Record<DistractionFreeLevel, number>;
}

const distractionFreeProfiles: DistractionFreeProfile[] = [
  {
    level: 'minimal',
    name: 'Minimal',
    description: 'Hide minor distractions while keeping key information visible',
    hiddenElements: ['chat', 'leaderboard', 'achievements'],
    features: {
      fullscreen: false,
      dimBackground: false,
      hideNonEssential: true,
      muteNotifications: false,
      simplifiedUI: false,
      focusHighlight: false,
      minimalColors: false,
      hideCursor: false,
    },
    intensity: 25,
  },
  {
    level: 'moderate',
    name: 'Moderate',
    description: 'Hide most UI elements except essential typing interface',
    hiddenElements: [
      'chat',
      'leaderboard',
      'achievements',
      'sidebar',
      'footer',
      'notifications',
    ],
    features: {
      fullscreen: false,
      dimBackground: true,
      hideNonEssential: true,
      muteNotifications: true,
      simplifiedUI: true,
      focusHighlight: true,
      minimalColors: false,
      hideCursor: false,
    },
    intensity: 50,
  },
  {
    level: 'maximum',
    name: 'Maximum',
    description: 'Show only the typing area with minimal visual elements',
    hiddenElements: [
      'header',
      'navigation',
      'sidebar',
      'footer',
      'statistics',
      'notifications',
      'achievements',
      'leaderboard',
      'chat',
      'help',
      'background',
    ],
    features: {
      fullscreen: true,
      dimBackground: true,
      hideNonEssential: true,
      muteNotifications: true,
      simplifiedUI: true,
      focusHighlight: true,
      minimalColors: true,
      hideCursor: false,
    },
    intensity: 75,
  },
  {
    level: 'zen',
    name: 'Zen Mode',
    description: 'Ultimate focus with only text and cursor visible',
    hiddenElements: [
      'header',
      'navigation',
      'sidebar',
      'footer',
      'statistics',
      'progress',
      'timer',
      'notifications',
      'achievements',
      'leaderboard',
      'chat',
      'help',
      'settings',
      'background',
    ],
    features: {
      fullscreen: true,
      dimBackground: true,
      hideNonEssential: true,
      muteNotifications: true,
      simplifiedUI: true,
      focusHighlight: true,
      minimalColors: true,
      hideCursor: true,
    },
    intensity: 100,
  },
];

const defaultSettings: DistractionFreeSettings = {
  enabled: false,
  currentLevel: 'moderate',
  customHiddenElements: [],
  fullscreenEnabled: false,
  autoEnableFullscreen: false,
  dimBackgroundOpacity: 0.3,
  allowEscapeKey: true,
  showExitHint: true,
  sessionBased: true,
  keyboardShortcuts: {
    toggle: 'Ctrl+Shift+F',
    increaseLevel: 'Ctrl+Shift+]',
    decreaseLevel: 'Ctrl+Shift+[',
    exitFullscreen: 'Escape',
  },
  focusMode: {
    highlightCurrentLine: true,
    hideCompletedText: false,
    showOnlyCurrentWord: false,
    dimSurroundingText: true,
  },
};

export const useDistractionFree = () => {
  const [settings, setSettings] = useState<DistractionFreeSettings>(defaultSettings);
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<FocusSession[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Monitor fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { toggle, increaseLevel, decreaseLevel } =
        settings.keyboardShortcuts;

      const matchesShortcut = (shortcut: string, event: KeyboardEvent) => {
        const parts = shortcut.split('+');
        const key = parts[parts.length - 1];
        const needsCtrl = parts.includes('Ctrl');
        const needsShift = parts.includes('Shift');
        const needsAlt = parts.includes('Alt');

        return (
          event.key === key &&
          event.ctrlKey === needsCtrl &&
          event.shiftKey === needsShift &&
          event.altKey === needsAlt
        );
      };

      if (matchesShortcut(toggle, event)) {
        event.preventDefault();
        toggleDistractionFree();
      } else if (matchesShortcut(increaseLevel, event)) {
        event.preventDefault();
        adjustLevel('increase');
      } else if (matchesShortcut(decreaseLevel, event)) {
        event.preventDefault();
        adjustLevel('decrease');
      } else if (
        event.key === 'Escape' &&
        settings.allowEscapeKey &&
        (settings.enabled || isFullscreen)
      ) {
        event.preventDefault();
        if (isFullscreen) {
          exitFullscreenMode();
        } else {
          disableDistractionFree();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [settings, isFullscreen]);

  const getCurrentProfile = useCallback((): DistractionFreeProfile => {
    return (
      distractionFreeProfiles.find((p) => p.level === settings.currentLevel) ||
      distractionFreeProfiles[1]
    );
  }, [settings.currentLevel]);

  const isElementHidden = useCallback(
    (element: UIElement): boolean => {
      if (!settings.enabled) return false;

      const profile = getCurrentProfile();
      return (
        profile.hiddenElements.includes(element) ||
        settings.customHiddenElements.includes(element)
      );
    },
    [settings, getCurrentProfile]
  );

  const startFocusSession = useCallback(
    (level?: DistractionFreeLevel) => {
      const selectedLevel = level || settings.currentLevel;
      const profile =
        distractionFreeProfiles.find((p) => p.level === selectedLevel) ||
        distractionFreeProfiles[1];

      const session: FocusSession = {
        id: `focus-${Date.now()}`,
        level: selectedLevel,
        startTime: new Date(),
        duration: 0,
        elementsHidden: [
          ...profile.hiddenElements,
          ...settings.customHiddenElements,
        ],
        wasFullscreen: settings.fullscreenEnabled,
        completed: false,
      };

      setActiveSession(session);

      // Auto-enable fullscreen if configured
      if (settings.autoEnableFullscreen && profile.features.fullscreen) {
        enterFullscreenMode();
      }
    },
    [settings]
  );

  const endFocusSession = useCallback(() => {
    if (!activeSession) return;

    const endTime = new Date();
    const duration = (endTime.getTime() - activeSession.startTime.getTime()) / 60000;

    const completedSession: FocusSession = {
      ...activeSession,
      endTime,
      duration,
      completed: true,
    };

    setSessionHistory((prev) => [...prev, completedSession]);
    setActiveSession(null);

    // Exit fullscreen if it was auto-enabled
    if (isFullscreen && settings.autoEnableFullscreen) {
      exitFullscreenMode();
    }
  }, [activeSession, isFullscreen, settings.autoEnableFullscreen]);

  const toggleDistractionFree = useCallback(() => {
    if (settings.enabled) {
      disableDistractionFree();
    } else {
      enableDistractionFree();
    }
  }, [settings.enabled]);

  const enableDistractionFree = useCallback(
    (level?: DistractionFreeLevel) => {
      const selectedLevel = level || settings.currentLevel;
      setSettings((prev) => ({
        ...prev,
        enabled: true,
        currentLevel: selectedLevel,
      }));
      startFocusSession(selectedLevel);
    },
    [settings.currentLevel, startFocusSession]
  );

  const disableDistractionFree = useCallback(() => {
    setSettings((prev) => ({ ...prev, enabled: false }));
    if (activeSession) {
      endFocusSession();
    }
    if (isFullscreen) {
      exitFullscreenMode();
    }
  }, [activeSession, endFocusSession, isFullscreen]);

  const setLevel = useCallback(
    (level: DistractionFreeLevel) => {
      setSettings((prev) => ({ ...prev, currentLevel: level }));
      if (settings.enabled) {
        // Restart session with new level
        if (activeSession) {
          endFocusSession();
        }
        startFocusSession(level);
      }
    },
    [settings.enabled, activeSession, endFocusSession, startFocusSession]
  );

  const adjustLevel = useCallback(
    (direction: 'increase' | 'decrease') => {
      const levels: DistractionFreeLevel[] = ['minimal', 'moderate', 'maximum', 'zen'];
      const currentIndex = levels.indexOf(settings.currentLevel);

      let newIndex: number;
      if (direction === 'increase') {
        newIndex = Math.min(currentIndex + 1, levels.length - 1);
      } else {
        newIndex = Math.max(currentIndex - 1, 0);
      }

      if (newIndex !== currentIndex) {
        setLevel(levels[newIndex]);
      }
    },
    [settings.currentLevel, setLevel]
  );

  const enterFullscreenMode = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setSettings((prev) => ({ ...prev, fullscreenEnabled: true }));
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
    }
  }, []);

  const exitFullscreenMode = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setSettings((prev) => ({ ...prev, fullscreenEnabled: false }));
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreenMode();
    } else {
      enterFullscreenMode();
    }
  }, [isFullscreen, enterFullscreenMode, exitFullscreenMode]);

  const hideElement = useCallback((element: UIElement) => {
    setSettings((prev) => ({
      ...prev,
      customHiddenElements: [...new Set([...prev.customHiddenElements, element])],
    }));
  }, []);

  const showElement = useCallback((element: UIElement) => {
    setSettings((prev) => ({
      ...prev,
      customHiddenElements: prev.customHiddenElements.filter((e) => e !== element),
    }));
  }, []);

  const toggleElement = useCallback(
    (element: UIElement) => {
      if (settings.customHiddenElements.includes(element)) {
        showElement(element);
      } else {
        hideElement(element);
      }
    },
    [settings.customHiddenElements, showElement, hideElement]
  );

  const updateSettings = useCallback(
    (updates: Partial<DistractionFreeSettings>) => {
      setSettings((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const getStats = useCallback((): DistractionFreeStats => {
    const completedSessions = sessionHistory.filter((s) => s.completed);
    const totalFocusTime = completedSessions.reduce((sum, s) => sum + s.duration, 0);
    const sessionsByLevel = completedSessions.reduce(
      (acc, session) => {
        acc[session.level] = (acc[session.level] || 0) + 1;
        return acc;
      },
      {} as Record<DistractionFreeLevel, number>
    );

    const preferredLevel =
      (Object.entries(sessionsByLevel).sort((a, b) => b[1] - a[1])[0]?.[0] as
        | DistractionFreeLevel
        | undefined) || 'moderate';

    const fullscreenSessions = completedSessions.filter((s) => s.wasFullscreen).length;
    const fullscreenUsage =
      completedSessions.length > 0
        ? (fullscreenSessions / completedSessions.length) * 100
        : 0;

    const longestSession = Math.max(
      ...completedSessions.map((s) => s.duration),
      0
    );

    return {
      totalSessions: completedSessions.length,
      totalFocusTime,
      averageSessionLength:
        completedSessions.length > 0 ? totalFocusTime / completedSessions.length : 0,
      longestSession,
      preferredLevel,
      fullscreenUsage,
      sessionsByLevel,
    };
  }, [sessionHistory]);

  const clearHistory = useCallback(() => {
    setSessionHistory([]);
  }, []);

  return {
    settings,
    updateSettings,
    enabled: settings.enabled,
    currentLevel: settings.currentLevel,
    currentProfile: getCurrentProfile(),
    isElementHidden,
    toggleDistractionFree,
    enableDistractionFree,
    disableDistractionFree,
    setLevel,
    adjustLevel,
    isFullscreen,
    toggleFullscreen,
    enterFullscreenMode,
    exitFullscreenMode,
    hideElement,
    showElement,
    toggleElement,
    activeSession,
    sessionHistory,
    stats: getStats(),
    clearHistory,
  };
};

interface DistractionFreeControlsProps {
  distractionFree: ReturnType<typeof useDistractionFree>;
}

export const DistractionFreeControls: React.FC<DistractionFreeControlsProps> = ({
  distractionFree,
}) => {
  const {
    enabled,
    currentLevel,
    currentProfile,
    toggleDistractionFree,
    setLevel,
    isFullscreen,
    toggleFullscreen,
    settings,
    updateSettings,
    stats,
  } = distractionFree;

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '800px',
      }}
    >
      <h2 style={{ marginBottom: '20px' }}>Distraction-Free Mode</h2>

      {/* Main Toggle */}
      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          background: enabled ? '#e8f5e9' : '#f5f5f5',
          borderRadius: '8px',
          border: enabled ? '2px solid #4caf50' : '2px solid #ddd',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={toggleDistractionFree}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              background: enabled ? '#4caf50' : '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            {enabled ? '⏸️ Exit Focus Mode' : '🎯 Enter Focus Mode'}
          </button>
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {enabled ? '✓ Focus Mode Active' : 'Focus Mode Inactive'}
            </div>
            {enabled && (
              <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                Level: {currentProfile.name} ({currentProfile.intensity}% intensity)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Level Selection */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>Focus Level</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {distractionFreeProfiles.map((profile) => (
            <motion.button
              key={profile.level}
              onClick={() => setLevel(profile.level)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '16px',
                background:
                  currentLevel === profile.level ? '#2196f3' : 'white',
                color: currentLevel === profile.level ? 'white' : '#333',
                border: '2px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {profile.name}
              </div>
              <div style={{ fontSize: '13px', opacity: 0.9 }}>
                {profile.description}
              </div>
              <div
                style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  opacity: 0.8,
                }}
              >
                Intensity: {profile.intensity}%
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Fullscreen Toggle */}
      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '12px' }}>Fullscreen Mode</h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={toggleFullscreen}
            style={{
              padding: '10px 20px',
              background: isFullscreen ? '#ff9800' : '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            {isFullscreen ? '⬛ Exit Fullscreen' : '⬜ Enter Fullscreen'}
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.autoEnableFullscreen}
              onChange={(e) =>
                updateSettings({ autoEnableFullscreen: e.target.checked })
              }
            />
            Auto-enable with focus mode
          </label>
        </div>
      </div>

      {/* Focus Mode Settings */}
      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '12px' }}>Focus Mode Settings</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.focusMode.highlightCurrentLine}
              onChange={(e) =>
                updateSettings({
                  focusMode: {
                    ...settings.focusMode,
                    highlightCurrentLine: e.target.checked,
                  },
                })
              }
            />
            Highlight current line
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.focusMode.dimSurroundingText}
              onChange={(e) =>
                updateSettings({
                  focusMode: {
                    ...settings.focusMode,
                    dimSurroundingText: e.target.checked,
                  },
                })
              }
            />
            Dim surrounding text
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.focusMode.hideCompletedText}
              onChange={(e) =>
                updateSettings({
                  focusMode: {
                    ...settings.focusMode,
                    hideCompletedText: e.target.checked,
                  },
                })
              }
            />
            Hide completed text
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.focusMode.showOnlyCurrentWord}
              onChange={(e) =>
                updateSettings({
                  focusMode: {
                    ...settings.focusMode,
                    showOnlyCurrentWord: e.target.checked,
                  },
                })
              }
            />
            Show only current word
          </label>
        </div>
      </div>

      {/* Statistics */}
      <div
        style={{
          padding: '16px',
          background: '#f5f5f5',
          borderRadius: '8px',
          border: '2px solid #ddd',
        }}
      >
        <h3 style={{ marginBottom: '12px' }}>Focus Statistics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Sessions</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {stats.totalSessions}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Focus Time</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {Math.round(stats.totalFocusTime)} min
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Average Session</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {Math.round(stats.averageSessionLength)} min
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Longest Session</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {Math.round(stats.longestSession)} min
            </div>
          </div>
        </div>
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            Preferred Level
          </div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
            {stats.preferredLevel.charAt(0).toUpperCase() +
              stats.preferredLevel.slice(1)}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div style={{ marginTop: '24px', fontSize: '13px', color: '#666' }}>
        <h4 style={{ marginBottom: '8px' }}>Keyboard Shortcuts</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div>
            <kbd style={{ padding: '2px 6px', background: '#f0f0f0', borderRadius: '3px' }}>
              {settings.keyboardShortcuts.toggle}
            </kbd>{' '}
            - Toggle focus mode
          </div>
          <div>
            <kbd style={{ padding: '2px 6px', background: '#f0f0f0', borderRadius: '3px' }}>
              {settings.keyboardShortcuts.increaseLevel}
            </kbd>{' '}
            - Increase level
          </div>
          <div>
            <kbd style={{ padding: '2px 6px', background: '#f0f0f0', borderRadius: '3px' }}>
              {settings.keyboardShortcuts.decreaseLevel}
            </kbd>{' '}
            - Decrease level
          </div>
          <div>
            <kbd style={{ padding: '2px 6px', background: '#f0f0f0', borderRadius: '3px' }}>
              Escape
            </kbd>{' '}
            - Exit focus mode / fullscreen
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate mock focus sessions
export const generateMockFocusSessions = (count: number): FocusSession[] => {
  const levels: DistractionFreeLevel[] = ['minimal', 'moderate', 'maximum', 'zen'];
  const sessions: FocusSession[] = [];

  for (let i = 0; i < count; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)];
    const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const duration = 10 + Math.random() * 50; // 10-60 minutes
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    const profile = distractionFreeProfiles.find((p) => p.level === level)!;

    sessions.push({
      id: `focus-${i}`,
      level,
      startTime,
      endTime,
      duration,
      elementsHidden: profile.hiddenElements,
      wasFullscreen: Math.random() > 0.5,
      completed: true,
    });
  }

  return sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
};

export default DistractionFreeControls;
