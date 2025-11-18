import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * Step 291: Build Errorless Mode
 *
 * Provides an errorless learning environment where incorrect key presses
 * are prevented or guided, rather than penalized. Helps build confidence
 * and muscle memory without anxiety from mistakes.
 *
 * Features:
 * - Prevent incorrect key presses
 * - Visual and audio guidance to correct keys
 * - Highlight next correct key
 * - No error penalties or negative feedback
 * - Success-only environment
 * - Gradual transition modes
 * - Confidence building metrics
 * - Adaptive difficulty adjustment
 */

export type ErrorlessLevel =
  | 'full-guide'
  | 'assisted'
  | 'gentle'
  | 'minimal'
  | 'off';

export type GuidanceType = 'visual' | 'audio' | 'haptic' | 'combined';

export interface ErrorlessSettings {
  enabled: boolean;
  level: ErrorlessLevel;
  guidanceTypes: GuidanceType[];
  preventIncorrectKeys: boolean;
  highlightNextKey: boolean;
  showKeyboardOverlay: boolean;
  playGuidanceSounds: boolean;
  vibrationFeedback: boolean;
  slowTypingWarning: boolean;
  pauseOnHesitation: boolean;
  hesitationThreshold: number; // seconds
  successCelebration: boolean;
  confidenceTracking: boolean;
  adaptiveTransition: boolean;
  transitionThreshold: number; // confidence score 0-100
}

export interface ErrorlessProfile {
  level: ErrorlessLevel;
  name: string;
  description: string;
  features: {
    preventErrors: boolean;
    keyHighlight: boolean;
    audioGuide: boolean;
    keyboardOverlay: boolean;
    pauseOnError: boolean;
    showHints: boolean;
  };
  intensity: number; // 0-100, how much guidance
  confidenceBoost: number; // Expected confidence gain
}

export interface TypingSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  level: ErrorlessLevel;
  totalKeystrokes: number;
  correctKeystrokes: number;
  preventedErrors: number;
  hesitations: number;
  averageKeyTime: number; // milliseconds
  confidenceScore: number; // 0-100
  completed: boolean;
}

export interface ConfidenceMetrics {
  currentScore: number; // 0-100
  trend: 'increasing' | 'stable' | 'decreasing';
  sessionsCount: number;
  errorPreventionRate: number; // percentage
  hesitationRate: number; // per minute
  typingFluency: number; // 0-100
  readyForTransition: boolean;
  recommendedLevel: ErrorlessLevel;
}

const errorlessProfiles: ErrorlessProfile[] = [
  {
    level: 'full-guide',
    name: 'Full Guidance',
    description: 'Maximum support - only correct keys work, full visual and audio guidance',
    features: {
      preventErrors: true,
      keyHighlight: true,
      audioGuide: true,
      keyboardOverlay: true,
      pauseOnError: true,
      showHints: true,
    },
    intensity: 100,
    confidenceBoost: 95,
  },
  {
    level: 'assisted',
    name: 'Assisted Learning',
    description: 'High support - prevents errors, highlights keys, gentle guidance',
    features: {
      preventErrors: true,
      keyHighlight: true,
      audioGuide: true,
      keyboardOverlay: true,
      pauseOnError: false,
      showHints: true,
    },
    intensity: 80,
    confidenceBoost: 80,
  },
  {
    level: 'gentle',
    name: 'Gentle Guidance',
    description: 'Moderate support - hints and highlights, allows minor errors',
    features: {
      preventErrors: false,
      keyHighlight: true,
      audioGuide: false,
      keyboardOverlay: true,
      pauseOnError: false,
      showHints: true,
    },
    intensity: 50,
    confidenceBoost: 60,
  },
  {
    level: 'minimal',
    name: 'Minimal Support',
    description: 'Light support - basic hints only, building independence',
    features: {
      preventErrors: false,
      keyHighlight: false,
      audioGuide: false,
      keyboardOverlay: false,
      pauseOnError: false,
      showHints: true,
    },
    intensity: 25,
    confidenceBoost: 40,
  },
  {
    level: 'off',
    name: 'Standard Mode',
    description: 'No errorless features - regular typing practice',
    features: {
      preventErrors: false,
      keyHighlight: false,
      audioGuide: false,
      keyboardOverlay: false,
      pauseOnError: false,
      showHints: false,
    },
    intensity: 0,
    confidenceBoost: 0,
  },
];

const defaultSettings: ErrorlessSettings = {
  enabled: true,
  level: 'assisted',
  guidanceTypes: ['visual', 'audio'],
  preventIncorrectKeys: true,
  highlightNextKey: true,
  showKeyboardOverlay: true,
  playGuidanceSounds: true,
  vibrationFeedback: false,
  slowTypingWarning: false,
  pauseOnHesitation: false,
  hesitationThreshold: 3,
  successCelebration: true,
  confidenceTracking: true,
  adaptiveTransition: true,
  transitionThreshold: 80,
};

export const useErrorlessMode = () => {
  const [settings, setSettings] = useState<ErrorlessSettings>(defaultSettings);
  const [sessionHistory, setSessionHistory] = useState<TypingSession[]>([]);
  const [currentSession, setCurrentSession] = useState<TypingSession | null>(null);
  const [confidenceMetrics, setConfidenceMetrics] = useState<ConfidenceMetrics>({
    currentScore: 50,
    trend: 'stable',
    sessionsCount: 0,
    errorPreventionRate: 0,
    hesitationRate: 0,
    typingFluency: 50,
    readyForTransition: false,
    recommendedLevel: 'assisted',
  });

  const getCurrentProfile = useCallback((): ErrorlessProfile => {
    return (
      errorlessProfiles.find((p) => p.level === settings.level) ||
      errorlessProfiles[1]
    );
  }, [settings.level]);

  const startSession = useCallback(
    (level?: ErrorlessLevel) => {
      const selectedLevel = level || settings.level;

      const session: TypingSession = {
        id: `session-${Date.now()}`,
        startTime: new Date(),
        level: selectedLevel,
        totalKeystrokes: 0,
        correctKeystrokes: 0,
        preventedErrors: 0,
        hesitations: 0,
        averageKeyTime: 0,
        confidenceScore: confidenceMetrics.currentScore,
        completed: false,
      };

      setCurrentSession(session);
    },
    [settings.level, confidenceMetrics.currentScore]
  );

  const endSession = useCallback(() => {
    if (!currentSession) return;

    const endTime = new Date();
    const completedSession: TypingSession = {
      ...currentSession,
      endTime,
      completed: true,
    };

    setSessionHistory((prev) => [...prev, completedSession]);
    updateConfidenceMetrics(completedSession);
    setCurrentSession(null);
  }, [currentSession]);

  const recordKeystroke = useCallback(
    (correct: boolean, prevented: boolean = false) => {
      if (!currentSession) return;

      setCurrentSession((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          totalKeystrokes: prev.totalKeystrokes + 1,
          correctKeystrokes: correct ? prev.correctKeystrokes + 1 : prev.correctKeystrokes,
          preventedErrors: prevented ? prev.preventedErrors + 1 : prev.preventedErrors,
        };
      });
    },
    [currentSession]
  );

  const recordHesitation = useCallback(() => {
    if (!currentSession) return;

    setCurrentSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        hesitations: prev.hesitations + 1,
      };
    });
  }, [currentSession]);

  const updateConfidenceMetrics = useCallback(
    (session: TypingSession) => {
      const allSessions = [...sessionHistory, session];
      const completedSessions = allSessions.filter((s) => s.completed);

      if (completedSessions.length === 0) return;

      // Calculate error prevention rate
      const totalPrevented = completedSessions.reduce(
        (sum, s) => sum + s.preventedErrors,
        0
      );
      const totalKeystrokes = completedSessions.reduce(
        (sum, s) => sum + s.totalKeystrokes,
        0
      );
      const errorPreventionRate =
        totalKeystrokes > 0 ? (totalPrevented / totalKeystrokes) * 100 : 0;

      // Calculate hesitation rate
      const totalHesitations = completedSessions.reduce(
        (sum, s) => sum + s.hesitations,
        0
      );
      const totalDuration = completedSessions.reduce((sum, s) => {
        if (!s.endTime) return sum;
        return sum + (s.endTime.getTime() - s.startTime.getTime()) / 60000;
      }, 0);
      const hesitationRate =
        totalDuration > 0 ? totalHesitations / totalDuration : 0;

      // Calculate typing fluency
      const accuracy =
        totalKeystrokes > 0
          ? (completedSessions.reduce((sum, s) => sum + s.correctKeystrokes, 0) /
              totalKeystrokes) *
            100
          : 0;
      const typingFluency = Math.max(0, Math.min(100, accuracy - hesitationRate * 5));

      // Calculate confidence score
      const preventionBonus = Math.min(20, errorPreventionRate);
      const fluencyScore = typingFluency;
      const progressBonus = Math.min(20, completedSessions.length * 2);
      const currentScore = Math.min(
        100,
        (fluencyScore * 0.6 + preventionBonus + progressBonus) * 0.9
      );

      // Determine trend
      let trend: 'increasing' | 'stable' | 'decreasing' = 'stable';
      if (completedSessions.length >= 3) {
        const recentScores = completedSessions
          .slice(-3)
          .map((s) => s.confidenceScore);
        const avgRecent =
          recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length;
        const prevScores = completedSessions
          .slice(-6, -3)
          .map((s) => s.confidenceScore);
        if (prevScores.length > 0) {
          const avgPrev = prevScores.reduce((sum, s) => sum + s, 0) / prevScores.length;
          if (avgRecent > avgPrev + 5) trend = 'increasing';
          else if (avgRecent < avgPrev - 5) trend = 'decreasing';
        }
      }

      // Determine recommended level
      let recommendedLevel: ErrorlessLevel = settings.level;
      if (settings.adaptiveTransition && currentScore >= settings.transitionThreshold) {
        const currentIndex = errorlessProfiles.findIndex(
          (p) => p.level === settings.level
        );
        if (currentIndex < errorlessProfiles.length - 1) {
          recommendedLevel = errorlessProfiles[currentIndex + 1].level;
        }
      }

      const readyForTransition =
        settings.adaptiveTransition &&
        currentScore >= settings.transitionThreshold &&
        trend === 'increasing';

      setConfidenceMetrics({
        currentScore,
        trend,
        sessionsCount: completedSessions.length,
        errorPreventionRate,
        hesitationRate,
        typingFluency,
        readyForTransition,
        recommendedLevel,
      });
    },
    [sessionHistory, settings]
  );

  const setLevel = useCallback((level: ErrorlessLevel) => {
    setSettings((prev) => ({ ...prev, level }));
  }, []);

  const enableErrorlessMode = useCallback(
    (level?: ErrorlessLevel) => {
      setSettings((prev) => ({
        ...prev,
        enabled: true,
        level: level || prev.level,
      }));
    },
    []
  );

  const disableErrorlessMode = useCallback(() => {
    setSettings((prev) => ({ ...prev, enabled: false }));
  }, []);

  const toggleErrorlessMode = useCallback(() => {
    setSettings((prev) => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  const updateSettings = useCallback((updates: Partial<ErrorlessSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearHistory = useCallback(() => {
    setSessionHistory([]);
    setConfidenceMetrics({
      currentScore: 50,
      trend: 'stable',
      sessionsCount: 0,
      errorPreventionRate: 0,
      hesitationRate: 0,
      typingFluency: 50,
      readyForTransition: false,
      recommendedLevel: 'assisted',
    });
  }, []);

  const shouldPreventKey = useCallback(
    (isCorrect: boolean): boolean => {
      if (!settings.enabled) return false;
      const profile = getCurrentProfile();
      return profile.features.preventErrors && !isCorrect;
    },
    [settings.enabled, getCurrentProfile]
  );

  const shouldHighlightKey = useCallback((): boolean => {
    if (!settings.enabled) return false;
    const profile = getCurrentProfile();
    return profile.features.keyHighlight && settings.highlightNextKey;
  }, [settings, getCurrentProfile]);

  const shouldShowKeyboard = useCallback((): boolean => {
    if (!settings.enabled) return false;
    const profile = getCurrentProfile();
    return profile.features.keyboardOverlay && settings.showKeyboardOverlay;
  }, [settings]);

  const shouldPlaySound = useCallback((): boolean => {
    if (!settings.enabled) return false;
    const profile = getCurrentProfile();
    return profile.features.audioGuide && settings.playGuidanceSounds;
  }, [settings]);

  return {
    settings,
    updateSettings,
    enabled: settings.enabled,
    currentLevel: settings.level,
    currentProfile: getCurrentProfile(),
    profiles: errorlessProfiles,
    setLevel,
    enableErrorlessMode,
    disableErrorlessMode,
    toggleErrorlessMode,
    startSession,
    endSession,
    recordKeystroke,
    recordHesitation,
    currentSession,
    sessionHistory,
    confidenceMetrics,
    clearHistory,
    shouldPreventKey,
    shouldHighlightKey,
    shouldShowKeyboard,
    shouldPlaySound,
  };
};

interface ErrorlessModeControlsProps {
  errorlessMode: ReturnType<typeof useErrorlessMode>;
}

export const ErrorlessModeControls: React.FC<ErrorlessModeControlsProps> = ({
  errorlessMode,
}) => {
  const {
    settings,
    updateSettings,
    enabled,
    currentLevel,
    currentProfile,
    profiles,
    setLevel,
    toggleErrorlessMode,
    confidenceMetrics,
  } = errorlessMode;

  const getConfidenceColor = (score: number): string => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#8bc34a';
    if (score >= 40) return '#ff9800';
    return '#f44336';
  };

  const getTrendIcon = (trend: string): string => {
    switch (trend) {
      case 'increasing':
        return '📈';
      case 'decreasing':
        return '📉';
      default:
        return '➡️';
    }
  };

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '900px',
      }}
    >
      <h2 style={{ marginBottom: '20px' }}>Errorless Learning Mode</h2>

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
            onClick={toggleErrorlessMode}
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
            {enabled ? '✓ Errorless Mode Active' : '🎯 Enable Errorless Mode'}
          </button>
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {enabled ? currentProfile.name : 'Disabled'}
            </div>
            {enabled && (
              <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                {currentProfile.description}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confidence Metrics */}
      <div
        style={{
          marginBottom: '24px',
          padding: '20px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '16px' }}>Your Confidence Progress</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Confidence Score</div>
            <div
              style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: getConfidenceColor(confidenceMetrics.currentScore),
              }}
            >
              {Math.round(confidenceMetrics.currentScore)}
            </div>
            <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
              {getTrendIcon(confidenceMetrics.trend)} {confidenceMetrics.trend}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Typing Fluency</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196f3' }}>
              {Math.round(confidenceMetrics.typingFluency)}%
            </div>
            <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
              {confidenceMetrics.sessionsCount} sessions
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Error Prevention</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff9800' }}>
              {Math.round(confidenceMetrics.errorPreventionRate)}%
            </div>
            <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
              Hesitations: {confidenceMetrics.hesitationRate.toFixed(1)}/min
            </div>
          </div>
        </div>

        {/* Transition Recommendation */}
        {confidenceMetrics.readyForTransition && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              background: '#e3f2fd',
              border: '2px solid #2196f3',
              borderRadius: '6px',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              🎉 Ready for Next Level!
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Your confidence has reached {Math.round(confidenceMetrics.currentScore)}
              %. Consider transitioning to{' '}
              {profiles.find((p) => p.level === confidenceMetrics.recommendedLevel)
                ?.name}
              .
            </div>
          </div>
        )}
      </div>

      {/* Level Selection */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>Support Level</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {profiles.slice(0, 4).map((profile) => (
            <motion.button
              key={profile.level}
              onClick={() => setLevel(profile.level)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!enabled}
              style={{
                padding: '16px',
                background:
                  currentLevel === profile.level && enabled
                    ? '#2196f3'
                    : 'white',
                color:
                  currentLevel === profile.level && enabled ? 'white' : '#333',
                border: '2px solid #ddd',
                borderRadius: '8px',
                cursor: enabled ? 'pointer' : 'not-allowed',
                textAlign: 'left',
                opacity: enabled ? 1 : 0.5,
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {profile.name}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  opacity: 0.9,
                  marginBottom: '8px',
                }}
              >
                {profile.description}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                Guidance: {profile.intensity}% • Confidence Boost: +
                {profile.confidenceBoost}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Feature Settings */}
      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '12px' }}>Guidance Features</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.preventIncorrectKeys}
              onChange={(e) =>
                updateSettings({ preventIncorrectKeys: e.target.checked })
              }
              disabled={!enabled}
            />
            Prevent incorrect key presses
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.highlightNextKey}
              onChange={(e) =>
                updateSettings({ highlightNextKey: e.target.checked })
              }
              disabled={!enabled}
            />
            Highlight next correct key
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.showKeyboardOverlay}
              onChange={(e) =>
                updateSettings({ showKeyboardOverlay: e.target.checked })
              }
              disabled={!enabled}
            />
            Show virtual keyboard overlay
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.playGuidanceSounds}
              onChange={(e) =>
                updateSettings({ playGuidanceSounds: e.target.checked })
              }
              disabled={!enabled}
            />
            Play guidance sounds
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.successCelebration}
              onChange={(e) =>
                updateSettings({ successCelebration: e.target.checked })
              }
              disabled={!enabled}
            />
            Celebrate successes
          </label>
        </div>
      </div>

      {/* Adaptive Settings */}
      <div
        style={{
          padding: '16px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '12px' }}>Adaptive Learning</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.adaptiveTransition}
              onChange={(e) =>
                updateSettings({ adaptiveTransition: e.target.checked })
              }
            />
            Automatically suggest level transitions
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.confidenceTracking}
              onChange={(e) =>
                updateSettings({ confidenceTracking: e.target.checked })
              }
            />
            Track confidence progress
          </label>
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '4px',
                fontWeight: '500',
              }}
            >
              Transition threshold: {settings.transitionThreshold}% confidence
            </label>
            <input
              type="range"
              min="50"
              max="95"
              value={settings.transitionThreshold}
              onChange={(e) =>
                updateSettings({ transitionThreshold: parseInt(e.target.value) })
              }
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorlessModeControls;
