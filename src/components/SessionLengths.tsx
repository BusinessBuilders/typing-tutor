import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type SessionPreset = 'pomodoro' | 'short' | 'medium' | 'long' | 'marathon' | 'custom';

export interface SessionConfig {
  preset: SessionPreset;
  name: string;
  description: string;
  duration: number; // minutes
  breakAfter: number; // minutes
  autoBreak: boolean;
  recommended: string;
  icon: string;
}

export interface SessionLengthSettings {
  enabled: boolean;
  currentPreset: SessionPreset;
  customDuration: number;
  customBreak: number;
  enforceSessionLimit: boolean;
  showTimeRemaining: boolean;
  notifyBeforeEnd: boolean;
  notificationMinutes: number;
  autoEndSession: boolean;
  trackSessions: boolean;
  pauseOnBreak: boolean;
}

export interface SessionRecord {
  id: string;
  preset: SessionPreset;
  duration: number;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  interrupted: boolean;
  wordsTyped?: number;
  accuracy?: number;
}

export interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  totalTime: number; // minutes
  averageSessionLength: number;
  longestSession: number;
  sessionsByPreset: Record<SessionPreset, number>;
  completionRate: number;
}

// ============================================================================
// Session Configurations
// ============================================================================

const sessionConfigs: SessionConfig[] = [
  {
    preset: 'pomodoro',
    name: 'Pomodoro',
    description: '25-minute focused work session with 5-minute break',
    duration: 25,
    breakAfter: 5,
    autoBreak: true,
    recommended: 'Great for maintaining focus and preventing burnout',
    icon: '🍅',
  },
  {
    preset: 'short',
    name: 'Short Session',
    description: '15-minute quick practice session',
    duration: 15,
    breakAfter: 3,
    autoBreak: false,
    recommended: 'Perfect for quick practice or warm-up',
    icon: '⚡',
  },
  {
    preset: 'medium',
    name: 'Medium Session',
    description: '45-minute standard practice session',
    duration: 45,
    breakAfter: 10,
    autoBreak: true,
    recommended: 'Balanced session length for most learners',
    icon: '📚',
  },
  {
    preset: 'long',
    name: 'Long Session',
    description: '90-minute extended practice session',
    duration: 90,
    breakAfter: 15,
    autoBreak: true,
    recommended: 'For dedicated practice and skill development',
    icon: '🎯',
  },
  {
    preset: 'marathon',
    name: 'Marathon',
    description: '120-minute intensive practice session',
    duration: 120,
    breakAfter: 20,
    autoBreak: true,
    recommended: 'For experienced users with high focus capacity',
    icon: '🏃',
  },
  {
    preset: 'custom',
    name: 'Custom',
    description: 'Set your own session duration',
    duration: 30,
    breakAfter: 5,
    autoBreak: false,
    recommended: 'Customize to match your personal needs',
    icon: '⚙️',
  },
];

// ============================================================================
// Custom Hook
// ============================================================================

export const useSessionLengths = (initialSettings?: Partial<SessionLengthSettings>) => {
  const [settings, setSettings] = useState<SessionLengthSettings>({
    enabled: true,
    currentPreset: 'pomodoro',
    customDuration: 30,
    customBreak: 5,
    enforceSessionLimit: true,
    showTimeRemaining: true,
    notifyBeforeEnd: true,
    notificationMinutes: 5,
    autoEndSession: false,
    trackSessions: true,
    pauseOnBreak: true,
    ...initialSettings,
  });

  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [stats, setStats] = useState<SessionStats>({
    totalSessions: 0,
    completedSessions: 0,
    totalTime: 0,
    averageSessionLength: 0,
    longestSession: 0,
    sessionsByPreset: {
      pomodoro: 0,
      short: 0,
      medium: 0,
      long: 0,
      marathon: 0,
      custom: 0,
    },
    completionRate: 0,
  });

  const [activeSession, setActiveSession] = useState<SessionRecord | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Get current config
  const getCurrentConfig = useCallback((): SessionConfig => {
    const config = sessionConfigs.find((c) => c.preset === settings.currentPreset);
    if (config && config.preset === 'custom') {
      return {
        ...config,
        duration: settings.customDuration,
        breakAfter: settings.customBreak,
      };
    }
    return config || sessionConfigs[0];
  }, [settings.currentPreset, settings.customDuration, settings.customBreak]);

  // Start session
  const startSession = useCallback(
    (preset?: SessionPreset) => {
      const selectedPreset = preset || settings.currentPreset;
      const config = sessionConfigs.find((c) => c.preset === selectedPreset) || sessionConfigs[0];

      const duration =
        selectedPreset === 'custom' ? settings.customDuration : config.duration;

      const session: SessionRecord = {
        id: `session-${Date.now()}-${Math.random()}`,
        preset: selectedPreset,
        duration,
        startTime: new Date(),
        completed: false,
        interrupted: false,
      };

      setActiveSession(session);
      setTimeRemaining(duration * 60); // Convert to seconds
      setIsPaused(false);
    },
    [settings.currentPreset, settings.customDuration]
  );

  // End session
  const endSession = useCallback(
    (completed: boolean = true) => {
      if (!activeSession) return;

      const endedSession: SessionRecord = {
        ...activeSession,
        endTime: new Date(),
        completed,
        interrupted: !completed,
      };

      if (settings.trackSessions) {
        setSessions((prev) => [endedSession, ...prev].slice(0, 50));
      }

      setActiveSession(null);
      setTimeRemaining(0);
      setIsPaused(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    },
    [activeSession, settings.trackSessions]
  );

  // Pause session
  const pauseSession = useCallback(() => {
    setIsPaused(true);
  }, []);

  // Resume session
  const resumeSession = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Update settings
  const updateSettings = useCallback((updates: Partial<SessionLengthSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // Update timer
  useEffect(() => {
    if (!activeSession || isPaused) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;

        // Notify before end
        if (
          settings.notifyBeforeEnd &&
          newTime === settings.notificationMinutes * 60
        ) {
          console.log(`⏰ ${settings.notificationMinutes} minutes remaining!`);
        }

        // Auto-end session
        if (newTime <= 0) {
          if (settings.autoEndSession) {
            endSession(true);
          }
          return 0;
        }

        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    activeSession,
    isPaused,
    settings.notifyBeforeEnd,
    settings.notificationMinutes,
    settings.autoEndSession,
    endSession,
  ]);

  // Calculate stats
  useEffect(() => {
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter((s) => s.completed).length;

    const totalTime = sessions
      .filter((s) => s.completed && s.endTime)
      .reduce((sum, s) => {
        const duration = (s.endTime!.getTime() - s.startTime.getTime()) / 60000;
        return sum + duration;
      }, 0);

    const averageSessionLength =
      completedSessions > 0 ? totalTime / completedSessions : 0;

    const longestSession = sessions
      .filter((s) => s.completed && s.endTime)
      .reduce((max, s) => {
        const duration = (s.endTime!.getTime() - s.startTime.getTime()) / 60000;
        return Math.max(max, duration);
      }, 0);

    const sessionsByPreset: Record<SessionPreset, number> = {
      pomodoro: sessions.filter((s) => s.preset === 'pomodoro' && s.completed).length,
      short: sessions.filter((s) => s.preset === 'short' && s.completed).length,
      medium: sessions.filter((s) => s.preset === 'medium' && s.completed).length,
      long: sessions.filter((s) => s.preset === 'long' && s.completed).length,
      marathon: sessions.filter((s) => s.preset === 'marathon' && s.completed).length,
      custom: sessions.filter((s) => s.preset === 'custom' && s.completed).length,
    };

    const completionRate =
      totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    setStats({
      totalSessions,
      completedSessions,
      totalTime,
      averageSessionLength,
      longestSession,
      sessionsByPreset,
      completionRate,
    });
  }, [sessions]);

  // Format time
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    settings,
    sessions,
    stats,
    configs: sessionConfigs,
    currentConfig: getCurrentConfig(),
    activeSession,
    timeRemaining,
    isPaused,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    updateSettings,
    formatTime,
  };
};

// ============================================================================
// Component
// ============================================================================

export const SessionLengths: React.FC = () => {
  const {
    settings,
    sessions,
    stats,
    configs,
    currentConfig,
    activeSession,
    timeRemaining,
    isPaused,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
    updateSettings,
    formatTime,
  } = useSessionLengths();

  const [activeTab, setActiveTab] = useState<'overview' | 'presets' | 'history' | 'settings'>(
    'overview'
  );

  // Calculate progress percentage
  const progressPercentage = activeSession
    ? ((currentConfig.duration * 60 - timeRemaining) / (currentConfig.duration * 60)) * 100
    : 0;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem' }}
      >
        <h1 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '2rem' }}>
          Session Lengths
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '1rem' }}>
          Manage practice session durations for optimal learning
        </p>
      </motion.div>

      {/* Active Session */}
      {activeSession && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: isPaused ? '#f59e0b' : '#10b981',
            color: 'white',
            padding: '2rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
              {currentConfig.icon}
            </div>
            <h2 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '2rem' }}>
              {currentConfig.name}
            </h2>
            <div style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              {formatTime(timeRemaining)}
            </div>

            {/* Progress bar */}
            <div
              style={{
                width: '100%',
                height: '12px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '6px',
                overflow: 'hidden',
                marginBottom: '2rem',
              }}
            >
              <div
                style={{
                  width: `${progressPercentage}%`,
                  height: '100%',
                  background: 'white',
                  transition: 'width 1s linear',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {!isPaused ? (
                <button
                  onClick={pauseSession}
                  style={{
                    padding: '1rem 2rem',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: '2px solid white',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                  }}
                >
                  ⏸ Pause
                </button>
              ) : (
                <button
                  onClick={resumeSession}
                  style={{
                    padding: '1rem 2rem',
                    background: 'white',
                    color: '#10b981',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1.125rem',
                    fontWeight: 'bold',
                  }}
                >
                  ▶ Resume
                </button>
              )}

              <button
                onClick={() => endSession(true)}
                style={{
                  padding: '1rem 2rem',
                  background: 'white',
                  color: '#10b981',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                }}
              >
                ✓ Complete
              </button>

              <button
                onClick={() => endSession(false)}
                style={{
                  padding: '1rem 2rem',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '2px solid white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                }}
              >
                ✕ End
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Start */}
      {!activeSession && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ margin: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>
            Start a Session
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
            }}
          >
            {configs.slice(0, 5).map((config) => (
              <button
                key={config.preset}
                onClick={() => startSession(config.preset)}
                style={{
                  padding: '1rem',
                  background: settings.currentPreset === config.preset ? '#3b82f6' : '#f9fafb',
                  color: settings.currentPreset === config.preset ? 'white' : '#1f2937',
                  border: '2px solid',
                  borderColor: settings.currentPreset === config.preset ? '#3b82f6' : '#e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{config.icon}</div>
                <div>{config.name}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 'normal', marginTop: '0.25rem' }}>
                  {config.duration}m
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Total Sessions
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {stats.totalSessions}
          </div>
        </div>

        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Completion Rate
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
            {Math.round(stats.completionRate)}%
          </div>
        </div>

        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Total Time
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
            {Math.round(stats.totalTime)}m
          </div>
        </div>

        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Avg Session
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {Math.round(stats.averageSessionLength)}m
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
          borderBottom: '2px solid #e5e7eb',
        }}
      >
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'presets', label: 'Session Presets' },
          { id: 'history', label: `History (${sessions.length})` },
          { id: 'settings', label: 'Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === tab.id ? '#3b82f6' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#666',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Overview</h2>
              <p style={{ margin: 0, marginBottom: '1rem', lineHeight: 1.6 }}>
                Setting appropriate session lengths helps maintain focus, prevent fatigue, and
                establish sustainable learning habits. Choose session durations that match your
                attention span and energy levels.
              </p>

              <h3 style={{ margin: '2rem 0 1rem 0' }}>Benefits of Session Management</h3>
              <ul style={{ lineHeight: 1.8 }}>
                <li>Maintains consistent practice habits</li>
                <li>Prevents mental fatigue and burnout</li>
                <li>Improves focus and retention</li>
                <li>Tracks learning progress over time</li>
                <li>Builds sustainable practice routines</li>
              </ul>

              <h3 style={{ margin: '2rem 0 1rem 0' }}>Pomodoro Technique</h3>
              <div
                style={{
                  padding: '1.5rem',
                  background: '#fef2f2',
                  borderRadius: '8px',
                  border: '1px solid #fca5a5',
                }}
              >
                <p style={{ margin: 0, lineHeight: 1.6 }}>
                  The Pomodoro Technique uses 25-minute focused work sessions followed by
                  5-minute breaks. This method is scientifically proven to improve concentration
                  and productivity while preventing burnout.
                </p>
              </div>

              <h3 style={{ margin: '2rem 0 1rem 0' }}>Session Distribution</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(stats.sessionsByPreset).map(([preset, count]) => {
                  const config = configs.find((c) => c.preset === preset);
                  return (
                    <div
                      key={preset}
                      style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                    >
                      <div style={{ fontSize: '1.5rem' }}>{config?.icon}</div>
                      <div style={{ width: '120px', fontWeight: 'bold' }}>
                        {config?.name}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          height: '24px',
                          background: '#f3f4f6',
                          borderRadius: '4px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${stats.completedSessions > 0 ? (count / stats.completedSessions) * 100 : 0}%`,
                            height: '100%',
                            background: '#3b82f6',
                            transition: 'width 0.3s',
                          }}
                        />
                      </div>
                      <div style={{ width: '80px', textAlign: 'right' }}>
                        {count} sessions
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'presets' && (
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Session Presets</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {configs.map((config) => (
                  <div
                    key={config.preset}
                    style={{
                      padding: '1.5rem',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '1rem',
                        alignItems: 'start',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ fontSize: '3rem' }}>{config.icon}</div>
                        <div>
                          <h3 style={{ margin: 0, marginBottom: '0.25rem', fontSize: '1.25rem' }}>
                            {config.name}
                          </h3>
                          <p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>
                            {config.description}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          updateSettings({ currentPreset: config.preset });
                          if (!activeSession) {
                            startSession(config.preset);
                          }
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {activeSession ? 'Set Default' : 'Start'}
                      </button>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '1rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#666' }}>Duration</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                          {config.duration} minutes
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#666' }}>Break After</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                          {config.breakAfter} minutes
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#666' }}>Auto Break</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                          {config.autoBreak ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '1rem',
                        background: '#eff6ff',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                      }}
                    >
                      <strong>Recommended for:</strong> {config.recommended}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Session History</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sessions.map((session) => {
                  const config = configs.find((c) => c.preset === session.preset);
                  const duration = session.endTime
                    ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / 60000)
                    : session.duration;

                  return (
                    <div
                      key={session.id}
                      style={{
                        padding: '1rem',
                        background: session.completed ? '#f0fdf4' : '#fef2f2',
                        borderRadius: '8px',
                        border: `1px solid ${session.completed ? '#86efac' : '#fca5a5'}`,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ fontSize: '1.5rem' }}>{config?.icon}</div>
                          <div>
                            <div style={{ fontWeight: 'bold' }}>
                              {config?.name} - {duration} minutes
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#666' }}>
                              {session.startTime.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: '0.875rem',
                            padding: '0.25rem 0.75rem',
                            background: session.completed ? '#10b981' : '#ef4444',
                            color: 'white',
                            borderRadius: '4px',
                          }}
                        >
                          {session.completed ? 'Completed' : 'Interrupted'}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {sessions.length === 0 && (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                    No session history yet. Start a session to track your progress!
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Session Settings</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.enforceSessionLimit}
                    onChange={(e) => updateSettings({ enforceSessionLimit: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      Enforce Session Limits
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      Prevent starting new exercises when session time expires
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.showTimeRemaining}
                    onChange={(e) => updateSettings({ showTimeRemaining: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      Show Time Remaining
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      Display countdown timer during sessions
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.notifyBeforeEnd}
                    onChange={(e) => updateSettings({ notifyBeforeEnd: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      Notify Before Session Ends
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      Show notification {settings.notificationMinutes} minutes before end
                    </div>
                  </div>
                  {settings.notifyBeforeEnd && (
                    <input
                      type="number"
                      value={settings.notificationMinutes}
                      onChange={(e) =>
                        updateSettings({ notificationMinutes: parseInt(e.target.value) })
                      }
                      min={1}
                      max={30}
                      style={{
                        width: '80px',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                      }}
                    />
                  )}
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.autoEndSession}
                    onChange={(e) => updateSettings({ autoEndSession: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      Auto-End Sessions
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      Automatically end sessions when time expires
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.trackSessions}
                    onChange={(e) => updateSettings({ trackSessions: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      Track Session History
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      Keep history of all practice sessions
                    </div>
                  </div>
                </label>

                {settings.currentPreset === 'custom' && (
                  <div style={{ padding: '1.5rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <h3 style={{ margin: 0, marginBottom: '1rem', fontSize: '1.125rem' }}>
                      Custom Session Settings
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 'bold' }}>Duration (minutes)</span>
                        <input
                          type="number"
                          value={settings.customDuration}
                          onChange={(e) =>
                            updateSettings({ customDuration: parseInt(e.target.value) })
                          }
                          min={5}
                          max={180}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                          }}
                        />
                      </label>

                      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 'bold' }}>Break After (minutes)</span>
                        <input
                          type="number"
                          value={settings.customBreak}
                          onChange={(e) =>
                            updateSettings({ customBreak: parseInt(e.target.value) })
                          }
                          min={1}
                          max={30}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                          }}
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SessionLengths;
