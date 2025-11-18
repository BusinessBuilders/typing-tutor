import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * Step 292: Create Correction Options
 *
 * Provides flexible error correction options to accommodate different
 * learning styles and needs. Helps users develop proper error correction
 * habits while maintaining flow and confidence.
 *
 * Features:
 * - Multiple correction modes (auto, assisted, manual)
 * - Backspace behavior customization
 * - Error highlighting and marking
 * - Correction delay settings
 * - Visual and audio feedback
 * - Correction statistics tracking
 * - Smart suggestions for common errors
 * - Muscle memory reinforcement
 */

export type CorrectionMode =
  | 'auto'
  | 'assisted'
  | 'manual'
  | 'strict'
  | 'lenient';

export type BackspaceMode =
  | 'normal'
  | 'disabled'
  | 'limited'
  | 'word-only'
  | 'line-only';

export type ErrorHighlightStyle =
  | 'underline'
  | 'background'
  | 'border'
  | 'strikethrough'
  | 'none';

export interface CorrectionSettings {
  mode: CorrectionMode;
  backspaceMode: BackspaceMode;
  backspaceLimit: number; // Max backspaces per session, -1 for unlimited
  allowSkipErrors: boolean;
  requireCorrection: boolean;
  correctionDelay: number; // milliseconds before correction allowed
  errorHighlight: {
    enabled: boolean;
    style: ErrorHighlightStyle;
    color: string;
    duration: number; // milliseconds
    persistUntilCorrected: boolean;
  };
  audioFeedback: {
    enabled: boolean;
    errorSound: boolean;
    correctionSound: boolean;
    volume: number; // 0-100
  };
  visualFeedback: {
    shake: boolean;
    pulse: boolean;
    colorChange: boolean;
    cursorChange: boolean;
  };
  smartSuggestions: {
    enabled: boolean;
    showOnError: boolean;
    showAfterDelay: number; // milliseconds
    commonErrorDatabase: boolean;
  };
  muscleMemory: {
    enabled: boolean;
    requireRepeatedCorrection: boolean;
    repetitionCount: number;
    trackPatterns: boolean;
  };
}

export interface CorrectionProfile {
  mode: CorrectionMode;
  name: string;
  description: string;
  settings: Partial<CorrectionSettings>;
  benefits: string[];
  bestFor: string[];
}

export interface ErrorCorrection {
  id: string;
  timestamp: Date;
  position: number;
  expectedChar: string;
  typedChar: string;
  corrected: boolean;
  correctionTime?: number; // milliseconds to correct
  backspacesUsed: number;
  attempts: number;
}

export interface CorrectionStats {
  totalErrors: number;
  correctedErrors: number;
  skippedErrors: number;
  averageCorrectionTime: number; // milliseconds
  totalBackspaces: number;
  backspaceEfficiency: number; // percentage
  commonErrors: Array<{
    from: string;
    to: string;
    count: number;
  }>;
  correctionRate: number; // percentage
  fastestCorrection: number; // milliseconds
  slowestCorrection: number; // milliseconds
}

const correctionProfiles: CorrectionProfile[] = [
  {
    mode: 'auto',
    name: 'Auto-Correction',
    description: 'Automatically corrects errors with gentle guidance',
    settings: {
      mode: 'auto',
      backspaceMode: 'normal',
      requireCorrection: false,
      allowSkipErrors: true,
      correctionDelay: 0,
    },
    benefits: [
      'Maintains flow',
      'Reduces frustration',
      'Focuses on speed',
      'Builds confidence',
    ],
    bestFor: ['Beginners', 'Confidence building', 'Speed practice'],
  },
  {
    mode: 'assisted',
    name: 'Assisted Correction',
    description: 'Provides hints and suggestions for corrections',
    settings: {
      mode: 'assisted',
      backspaceMode: 'normal',
      requireCorrection: true,
      allowSkipErrors: false,
      correctionDelay: 500,
    },
    benefits: [
      'Teaches correction habits',
      'Provides guidance',
      'Encourages accuracy',
      'Builds awareness',
    ],
    bestFor: ['Learning', 'Accuracy improvement', 'Habit formation'],
  },
  {
    mode: 'manual',
    name: 'Manual Correction',
    description: 'User corrects all errors independently',
    settings: {
      mode: 'manual',
      backspaceMode: 'normal',
      requireCorrection: true,
      allowSkipErrors: false,
      correctionDelay: 0,
    },
    benefits: [
      'Develops independence',
      'Natural practice',
      'Real-world simulation',
      'Full control',
    ],
    bestFor: ['Experienced users', 'Real-world practice', 'Full mastery'],
  },
  {
    mode: 'strict',
    name: 'Strict Mode',
    description: 'Must correct every error before continuing',
    settings: {
      mode: 'strict',
      backspaceMode: 'limited',
      backspaceLimit: 50,
      requireCorrection: true,
      allowSkipErrors: false,
      correctionDelay: 0,
    },
    benefits: [
      'Perfection focus',
      'Error prevention',
      'Careful typing',
      'High accuracy',
    ],
    bestFor: ['Accuracy drills', 'Professional training', 'Perfectionism'],
  },
  {
    mode: 'lenient',
    name: 'Lenient Mode',
    description: 'Optional correction, focus on continuous typing',
    settings: {
      mode: 'lenient',
      backspaceMode: 'normal',
      requireCorrection: false,
      allowSkipErrors: true,
      correctionDelay: 0,
    },
    benefits: [
      'Stress-free',
      'Maintains momentum',
      'Encourages flow',
      'Reduces anxiety',
    ],
    bestFor: ['Stress reduction', 'Flow state', 'Speed building'],
  },
];

const defaultSettings: CorrectionSettings = {
  mode: 'assisted',
  backspaceMode: 'normal',
  backspaceLimit: -1,
  allowSkipErrors: false,
  requireCorrection: true,
  correctionDelay: 500,
  errorHighlight: {
    enabled: true,
    style: 'underline',
    color: '#f44336',
    duration: 2000,
    persistUntilCorrected: true,
  },
  audioFeedback: {
    enabled: true,
    errorSound: true,
    correctionSound: true,
    volume: 50,
  },
  visualFeedback: {
    shake: true,
    pulse: false,
    colorChange: true,
    cursorChange: true,
  },
  smartSuggestions: {
    enabled: true,
    showOnError: false,
    showAfterDelay: 1000,
    commonErrorDatabase: true,
  },
  muscleMemory: {
    enabled: true,
    requireRepeatedCorrection: false,
    repetitionCount: 3,
    trackPatterns: true,
  },
};

export const useCorrectionOptions = () => {
  const [settings, setSettings] = useState<CorrectionSettings>(defaultSettings);
  const [corrections, setCorrections] = useState<ErrorCorrection[]>([]);
  const [stats, setStats] = useState<CorrectionStats>({
    totalErrors: 0,
    correctedErrors: 0,
    skippedErrors: 0,
    averageCorrectionTime: 0,
    totalBackspaces: 0,
    backspaceEfficiency: 100,
    commonErrors: [],
    correctionRate: 0,
    fastestCorrection: 0,
    slowestCorrection: 0,
  });
  const [backspaceCount, setBackspaceCount] = useState<number>(0);

  const getCurrentProfile = useCallback((): CorrectionProfile => {
    return (
      correctionProfiles.find((p) => p.mode === settings.mode) ||
      correctionProfiles[1]
    );
  }, [settings.mode]);

  const recordError = useCallback(
    (position: number, expectedChar: string, typedChar: string) => {
      const error: ErrorCorrection = {
        id: `error-${Date.now()}`,
        timestamp: new Date(),
        position,
        expectedChar,
        typedChar,
        corrected: false,
        backspacesUsed: 0,
        attempts: 1,
      };

      setCorrections((prev) => [...prev, error]);

      // Play error sound
      if (settings.audioFeedback.enabled && settings.audioFeedback.errorSound) {
        playSound('error');
      }

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalErrors: prev.totalErrors + 1,
      }));
    },
    [settings]
  );

  const recordCorrection = useCallback(
    (errorId: string, backspacesUsed: number) => {
      setCorrections((prev) =>
        prev.map((c) => {
          if (c.id === errorId) {
            const correctionTime = new Date().getTime() - c.timestamp.getTime();
            return {
              ...c,
              corrected: true,
              correctionTime,
              backspacesUsed,
            };
          }
          return c;
        })
      );

      // Play correction sound
      if (
        settings.audioFeedback.enabled &&
        settings.audioFeedback.correctionSound
      ) {
        playSound('correction');
      }

      // Update stats
      updateStats();
    },
    [settings]
  );

  const recordSkippedError = useCallback((errorId: string) => {
    setCorrections((prev) =>
      prev.map((c) => (c.id === errorId ? { ...c, corrected: false } : c))
    );

    setStats((prev) => ({
      ...prev,
      skippedErrors: prev.skippedErrors + 1,
    }));
  }, []);

  const recordBackspace = useCallback(() => {
    setBackspaceCount((prev) => prev + 1);
    setStats((prev) => ({
      ...prev,
      totalBackspaces: prev.totalBackspaces + 1,
    }));
  }, []);

  const canUseBackspace = useCallback((): boolean => {
    if (settings.backspaceMode === 'disabled') return false;
    if (settings.backspaceMode === 'limited' && settings.backspaceLimit > 0) {
      return backspaceCount < settings.backspaceLimit;
    }
    return true;
  }, [settings, backspaceCount]);

  const updateStats = useCallback(() => {
    const correctedErrors = corrections.filter((c) => c.corrected);
    const correctionTimes = correctedErrors
      .map((c) => c.correctionTime)
      .filter((t): t is number => t !== undefined);

    const averageCorrectionTime =
      correctionTimes.length > 0
        ? correctionTimes.reduce((sum, t) => sum + t, 0) / correctionTimes.length
        : 0;

    const fastestCorrection =
      correctionTimes.length > 0 ? Math.min(...correctionTimes) : 0;
    const slowestCorrection =
      correctionTimes.length > 0 ? Math.max(...correctionTimes) : 0;

    const correctionRate =
      corrections.length > 0
        ? (correctedErrors.length / corrections.length) * 100
        : 0;

    const totalBackspacesUsed = correctedErrors.reduce(
      (sum, c) => sum + c.backspacesUsed,
      0
    );
    const idealBackspaces = correctedErrors.length;
    const backspaceEfficiency =
      idealBackspaces > 0
        ? (idealBackspaces / Math.max(totalBackspacesUsed, 1)) * 100
        : 100;

    // Calculate common errors
    const errorMap = new Map<string, number>();
    corrections.forEach((c) => {
      const key = `${c.typedChar}->${c.expectedChar}`;
      errorMap.set(key, (errorMap.get(key) || 0) + 1);
    });

    const commonErrors = Array.from(errorMap.entries())
      .map(([key, count]) => {
        const [from, to] = key.split('->');
        return { from, to, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setStats({
      totalErrors: corrections.length,
      correctedErrors: correctedErrors.length,
      skippedErrors: corrections.length - correctedErrors.length,
      averageCorrectionTime,
      totalBackspaces: stats.totalBackspaces,
      backspaceEfficiency,
      commonErrors,
      correctionRate,
      fastestCorrection,
      slowestCorrection,
    });
  }, [corrections, stats.totalBackspaces]);

  const playSound = (type: 'error' | 'correction') => {
    // In a real implementation, this would play actual sounds
    console.log(`Playing ${type} sound at ${settings.audioFeedback.volume}% volume`);
  };

  const setMode = useCallback((mode: CorrectionMode) => {
    const profile = correctionProfiles.find((p) => p.mode === mode);
    if (profile) {
      setSettings((prev) => ({
        ...prev,
        ...profile.settings,
        mode,
      }));
    }
  }, []);

  const updateSettings = useCallback((updates: Partial<CorrectionSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetStats = useCallback(() => {
    setCorrections([]);
    setBackspaceCount(0);
    setStats({
      totalErrors: 0,
      correctedErrors: 0,
      skippedErrors: 0,
      averageCorrectionTime: 0,
      totalBackspaces: 0,
      backspaceEfficiency: 100,
      commonErrors: [],
      correctionRate: 0,
      fastestCorrection: 0,
      slowestCorrection: 0,
    });
  }, []);

  const clearHistory = useCallback(() => {
    setCorrections([]);
  }, []);

  return {
    settings,
    updateSettings,
    currentMode: settings.mode,
    currentProfile: getCurrentProfile(),
    profiles: correctionProfiles,
    setMode,
    recordError,
    recordCorrection,
    recordSkippedError,
    recordBackspace,
    canUseBackspace,
    backspaceCount,
    backspaceRemaining:
      settings.backspaceLimit > 0
        ? settings.backspaceLimit - backspaceCount
        : -1,
    corrections,
    stats,
    resetStats,
    clearHistory,
  };
};

interface CorrectionOptionsControlsProps {
  correctionOptions: ReturnType<typeof useCorrectionOptions>;
}

export const CorrectionOptionsControls: React.FC<
  CorrectionOptionsControlsProps
> = ({ correctionOptions }) => {
  const {
    settings,
    updateSettings,
    currentMode,
    currentProfile,
    profiles,
    setMode,
    backspaceCount,
    backspaceRemaining,
    stats,
  } = correctionOptions;

  const getCorrectionRateColor = (rate: number): string => {
    if (rate >= 90) return '#4caf50';
    if (rate >= 70) return '#8bc34a';
    if (rate >= 50) return '#ff9800';
    return '#f44336';
  };

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '900px',
      }}
    >
      <h2 style={{ marginBottom: '20px' }}>Correction Options</h2>

      {/* Current Mode */}
      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          background: '#e3f2fd',
          borderRadius: '8px',
          border: '2px solid #2196f3',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
          Current Mode: {currentProfile.name}
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          {currentProfile.description}
        </div>
      </div>

      {/* Statistics */}
      <div
        style={{
          marginBottom: '24px',
          padding: '20px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '16px' }}>Correction Statistics</h3>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}
        >
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Correction Rate</div>
            <div
              style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: getCorrectionRateColor(stats.correctionRate),
              }}
            >
              {Math.round(stats.correctionRate)}%
            </div>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
              {stats.correctedErrors}/{stats.totalErrors} errors
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Avg Correction Time</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2196f3' }}>
              {(stats.averageCorrectionTime / 1000).toFixed(1)}s
            </div>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
              Fastest: {(stats.fastestCorrection / 1000).toFixed(1)}s
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Backspace Usage</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff9800' }}>
              {backspaceCount}
            </div>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
              {settings.backspaceLimit > 0
                ? `${backspaceRemaining} remaining`
                : 'Unlimited'}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Efficiency</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#9c27b0' }}>
              {Math.round(stats.backspaceEfficiency)}%
            </div>
            <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
              Skipped: {stats.skippedErrors}
            </div>
          </div>
        </div>

        {/* Common Errors */}
        {stats.commonErrors.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ marginBottom: '8px', fontSize: '14px' }}>
              Most Common Errors
            </h4>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              {stats.commonErrors.slice(0, 5).map((error, index) => (
                <div
                  key={index}
                  style={{
                    padding: '6px 12px',
                    background: '#f5f5f5',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {error.from}
                  </span>{' '}
                  →{' '}
                  <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {error.to}
                  </span>{' '}
                  <span style={{ color: '#666' }}>({error.count}x)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mode Selection */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>Correction Mode</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {profiles.map((profile) => (
            <motion.button
              key={profile.mode}
              onClick={() => setMode(profile.mode)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                padding: '16px',
                background: currentMode === profile.mode ? '#2196f3' : 'white',
                color: currentMode === profile.mode ? 'white' : '#333',
                border: '2px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {profile.name}
              </div>
              <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px' }}>
                {profile.description}
              </div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>
                Best for: {profile.bestFor.join(', ')}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Backspace Settings */}
      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '12px' }}>Backspace Settings</h3>
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}
          >
            Backspace Mode
          </label>
          <select
            value={settings.backspaceMode}
            onChange={(e) =>
              updateSettings({ backspaceMode: e.target.value as BackspaceMode })
            }
            style={{
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '100%',
            }}
          >
            <option value="normal">Normal - Unrestricted</option>
            <option value="limited">Limited - Set maximum</option>
            <option value="word-only">Word Only - Can't cross words</option>
            <option value="line-only">Line Only - Can't cross lines</option>
            <option value="disabled">Disabled - No backspace</option>
          </select>
        </div>

        {settings.backspaceMode === 'limited' && (
          <div>
            <label
              style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}
            >
              Backspace Limit: {settings.backspaceLimit}
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={settings.backspaceLimit}
              onChange={(e) =>
                updateSettings({ backspaceLimit: parseInt(e.target.value) })
              }
              style={{ width: '100%' }}
            />
          </div>
        )}
      </div>

      {/* Error Highlight Settings */}
      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '12px' }}>Error Highlighting</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.errorHighlight.enabled}
              onChange={(e) =>
                updateSettings({
                  errorHighlight: {
                    ...settings.errorHighlight,
                    enabled: e.target.checked,
                  },
                })
              }
            />
            Enable error highlighting
          </label>

          {settings.errorHighlight.enabled && (
            <>
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: '500',
                  }}
                >
                  Highlight Style
                </label>
                <select
                  value={settings.errorHighlight.style}
                  onChange={(e) =>
                    updateSettings({
                      errorHighlight: {
                        ...settings.errorHighlight,
                        style: e.target.value as ErrorHighlightStyle,
                      },
                    })
                  }
                  style={{
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    width: '100%',
                  }}
                >
                  <option value="underline">Underline</option>
                  <option value="background">Background</option>
                  <option value="border">Border</option>
                  <option value="strikethrough">Strikethrough</option>
                  <option value="none">None</option>
                </select>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={settings.errorHighlight.persistUntilCorrected}
                  onChange={(e) =>
                    updateSettings({
                      errorHighlight: {
                        ...settings.errorHighlight,
                        persistUntilCorrected: e.target.checked,
                      },
                    })
                  }
                />
                Keep highlighted until corrected
              </label>
            </>
          )}
        </div>
      </div>

      {/* Feedback Settings */}
      <div
        style={{
          padding: '16px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '12px' }}>Feedback Options</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.audioFeedback.enabled}
              onChange={(e) =>
                updateSettings({
                  audioFeedback: {
                    ...settings.audioFeedback,
                    enabled: e.target.checked,
                  },
                })
              }
            />
            Audio feedback
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.visualFeedback.shake}
              onChange={(e) =>
                updateSettings({
                  visualFeedback: {
                    ...settings.visualFeedback,
                    shake: e.target.checked,
                  },
                })
              }
            />
            Shake on error
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.smartSuggestions.enabled}
              onChange={(e) =>
                updateSettings({
                  smartSuggestions: {
                    ...settings.smartSuggestions,
                    enabled: e.target.checked,
                  },
                })
              }
            />
            Smart suggestions
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.muscleMemory.enabled}
              onChange={(e) =>
                updateSettings({
                  muscleMemory: {
                    ...settings.muscleMemory,
                    enabled: e.target.checked,
                  },
                })
              }
            />
            Muscle memory training
          </label>
        </div>
      </div>
    </div>
  );
};

export default CorrectionOptionsControls;
