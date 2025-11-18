import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type BreakType = 'micro' | 'short' | 'medium' | 'long';

export type ReminderStyle = 'subtle' | 'standard' | 'prominent' | 'persistent';

export interface BreakConfig {
  type: BreakType;
  name: string;
  description: string;
  duration: number; // minutes
  interval: number; // minutes
  activities: string[];
  icon: string;
}

export interface BreakReminderSettings {
  enabled: boolean;
  autoStart: boolean;
  reminderStyle: ReminderStyle;
  playSound: boolean;
  pauseOnBreak: boolean;
  trackBreaks: boolean;
  microBreaks: boolean;
  shortBreaks: boolean;
  mediumBreaks: boolean;
  longBreaks: boolean;
  customIntervals: {
    micro: number;
    short: number;
    medium: number;
    long: number;
  };
  customDurations: {
    micro: number;
    short: number;
    medium: number;
    long: number;
  };
}

export interface BreakSession {
  id: string;
  type: BreakType;
  startTime: Date;
  endTime?: Date;
  duration: number;
  completed: boolean;
  skipped: boolean;
}

export interface BreakReminderStats {
  totalBreaks: number;
  completedBreaks: number;
  skippedBreaks: number;
  totalBreakTime: number; // minutes
  averageBreakDuration: number;
  breaksByType: Record<BreakType, number>;
  longestStreak: number;
  currentStreak: number;
}

// ============================================================================
// Break Configurations
// ============================================================================

const breakConfigs: BreakConfig[] = [
  {
    type: 'micro',
    name: 'Micro Break',
    description: 'Quick 20-second eye rest (20-20-20 rule)',
    duration: 0.33, // 20 seconds
    interval: 20,
    activities: [
      'Look 20 feet away for 20 seconds',
      'Blink rapidly 10 times',
      'Close eyes and breathe deeply',
      'Roll shoulders back 3 times',
    ],
    icon: '👀',
  },
  {
    type: 'short',
    name: 'Short Break',
    description: 'Brief 2-minute movement break',
    duration: 2,
    interval: 25,
    activities: [
      'Stand up and stretch',
      'Walk around the room',
      'Do 10 jumping jacks',
      'Drink some water',
      'Shake out your hands',
    ],
    icon: '🚶',
  },
  {
    type: 'medium',
    name: 'Medium Break',
    description: 'Standard 5-minute rest period',
    duration: 5,
    interval: 50,
    activities: [
      'Take a walk outside',
      'Do stretching exercises',
      'Get a healthy snack',
      'Chat with someone',
      'Listen to calming music',
    ],
    icon: '☕',
  },
  {
    type: 'long',
    name: 'Long Break',
    description: 'Extended 15-minute rest and recharge',
    duration: 15,
    interval: 120,
    activities: [
      'Eat a meal',
      'Take a walk outdoors',
      'Do relaxation exercises',
      'Practice mindfulness',
      'Engage in a hobby',
    ],
    icon: '🌳',
  },
];

// ============================================================================
// Custom Hook
// ============================================================================

export const useBreakReminders = (initialSettings?: Partial<BreakReminderSettings>) => {
  const [settings, setSettings] = useState<BreakReminderSettings>({
    enabled: true,
    autoStart: true,
    reminderStyle: 'standard',
    playSound: true,
    pauseOnBreak: true,
    trackBreaks: true,
    microBreaks: true,
    shortBreaks: true,
    mediumBreaks: true,
    longBreaks: false,
    customIntervals: {
      micro: 20,
      short: 25,
      medium: 50,
      long: 120,
    },
    customDurations: {
      micro: 0.33,
      short: 2,
      medium: 5,
      long: 15,
    },
    ...initialSettings,
  });

  const [sessions, setSessions] = useState<BreakSession[]>([]);
  const [stats, setStats] = useState<BreakReminderStats>({
    totalBreaks: 0,
    completedBreaks: 0,
    skippedBreaks: 0,
    totalBreakTime: 0,
    averageBreakDuration: 0,
    breaksByType: {
      micro: 0,
      short: 0,
      medium: 0,
      long: 0,
    },
    longestStreak: 0,
    currentStreak: 0,
  });

  const [activeBreak, setActiveBreak] = useState<BreakSession | null>(null);
  const [nextBreakType, setNextBreakType] = useState<BreakType | null>(null);
  const [isReminderVisible, setIsReminderVisible] = useState(false);

  const timersRef = useRef<Map<BreakType, NodeJS.Timeout>>(new Map());

  // Start break
  const startBreak = useCallback(
    (type: BreakType) => {
      const config = breakConfigs.find((c) => c.type === type);
      if (!config) return;

      const session: BreakSession = {
        id: `break-${Date.now()}-${Math.random()}`,
        type,
        startTime: new Date(),
        duration: settings.customDurations[type],
        completed: false,
        skipped: false,
      };

      setActiveBreak(session);
      setIsReminderVisible(false);

      if (settings.playSound) {
        // Play notification sound (placeholder)
        console.log('🔔 Break reminder sound');
      }
    },
    [settings.customDurations, settings.playSound]
  );

  // Complete break
  const completeBreak = useCallback(() => {
    if (!activeBreak) return;

    const completedSession: BreakSession = {
      ...activeBreak,
      endTime: new Date(),
      completed: true,
    };

    setSessions((prev) => [completedSession, ...prev].slice(0, 50));
    setActiveBreak(null);
  }, [activeBreak]);

  // Skip break
  const skipBreak = useCallback(() => {
    if (!activeBreak) return;

    const skippedSession: BreakSession = {
      ...activeBreak,
      endTime: new Date(),
      skipped: true,
    };

    setSessions((prev) => [skippedSession, ...prev].slice(0, 50));
    setActiveBreak(null);
    setIsReminderVisible(false);
  }, [activeBreak]);

  // Show reminder
  const showReminder = useCallback((type: BreakType) => {
    setNextBreakType(type);
    setIsReminderVisible(true);
  }, []);

  // Dismiss reminder
  const dismissReminder = useCallback(() => {
    setIsReminderVisible(false);
    setNextBreakType(null);
  }, []);

  // Update settings
  const updateSettings = useCallback((updates: Partial<BreakReminderSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // Setup timers
  useEffect(() => {
    if (!settings.enabled || !settings.autoStart) {
      // Clear all timers
      timersRef.current.forEach((timer) => clearInterval(timer));
      timersRef.current.clear();
      return;
    }

    // Clear existing timers
    timersRef.current.forEach((timer) => clearInterval(timer));
    timersRef.current.clear();

    // Set up timers for each enabled break type
    const breakTypes: BreakType[] = ['micro', 'short', 'medium', 'long'];

    breakTypes.forEach((type) => {
      const settingKey = `${type}Breaks` as keyof BreakReminderSettings;
      if (settings[settingKey]) {
        const interval = settings.customIntervals[type] * 60 * 1000; // Convert to ms

        const timer = setInterval(() => {
          showReminder(type);
        }, interval);

        timersRef.current.set(type, timer);
      }
    });

    return () => {
      timersRef.current.forEach((timer) => clearInterval(timer));
      timersRef.current.clear();
    };
  }, [settings, showReminder]);

  // Calculate stats
  useEffect(() => {
    const totalBreaks = sessions.length;
    const completedBreaks = sessions.filter((s) => s.completed).length;
    const skippedBreaks = sessions.filter((s) => s.skipped).length;

    const totalBreakTime = sessions
      .filter((s) => s.completed)
      .reduce((sum, s) => sum + s.duration, 0);

    const averageBreakDuration =
      completedBreaks > 0 ? totalBreakTime / completedBreaks : 0;

    const breaksByType: Record<BreakType, number> = {
      micro: sessions.filter((s) => s.type === 'micro' && s.completed).length,
      short: sessions.filter((s) => s.type === 'short' && s.completed).length,
      medium: sessions.filter((s) => s.type === 'medium' && s.completed).length,
      long: sessions.filter((s) => s.type === 'long' && s.completed).length,
    };

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    sessions.forEach((session, index) => {
      if (session.completed) {
        tempStreak++;
        if (index === 0) currentStreak = tempStreak;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else if (session.skipped) {
        tempStreak = 0;
      }
    });

    setStats({
      totalBreaks,
      completedBreaks,
      skippedBreaks,
      totalBreakTime,
      averageBreakDuration,
      breaksByType,
      longestStreak,
      currentStreak,
    });
  }, [sessions]);

  return {
    settings,
    sessions,
    stats,
    configs: breakConfigs,
    activeBreak,
    nextBreakType,
    isReminderVisible,
    startBreak,
    completeBreak,
    skipBreak,
    showReminder,
    dismissReminder,
    updateSettings,
  };
};

// ============================================================================
// Component
// ============================================================================

export const BreakReminders: React.FC = () => {
  const {
    settings,
    sessions,
    stats,
    configs,
    activeBreak,
    nextBreakType,
    isReminderVisible,
    startBreak,
    completeBreak,
    skipBreak,
    dismissReminder,
    updateSettings,
  } = useBreakReminders();

  const [activeTab, setActiveTab] = useState<'overview' | 'breaks' | 'history' | 'settings'>(
    'overview'
  );

  // Get config for break type
  const getConfig = (type: BreakType) => {
    return configs.find((c) => c.type === type);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem' }}
      >
        <h1 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '2rem' }}>
          Break Reminders
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '1rem' }}>
          Take regular breaks to prevent fatigue and maintain focus
        </p>
      </motion.div>

      {/* Active Break */}
      {activeBreak && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          style={{
            background: '#10b981',
            color: 'white',
            padding: '2rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
              {getConfig(activeBreak.type)?.icon}
            </div>
            <h2 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '2rem' }}>
              {getConfig(activeBreak.type)?.name}
            </h2>
            <p style={{ margin: 0, marginBottom: '1.5rem', fontSize: '1.125rem' }}>
              Take a {activeBreak.duration.toFixed(0)}-minute break
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, marginBottom: '0.75rem', fontSize: '1.125rem' }}>
                Suggested Activities:
              </h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', lineHeight: 2 }}>
                {getConfig(activeBreak.type)?.activities.map((activity, i) => (
                  <li key={i}>• {activity}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={completeBreak}
              style={{
                padding: '1rem 2rem',
                background: 'white',
                color: '#10b981',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1.125rem',
                fontWeight: 'bold',
                marginRight: '1rem',
              }}
            >
              Complete Break
            </button>
            <button
              onClick={skipBreak}
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
              Skip
            </button>
          </div>
        </motion.div>
      )}

      {/* Break Reminder */}
      {isReminderVisible && nextBreakType && !activeBreak && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            background: '#eff6ff',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '2rem',
            border: '2px solid #3b82f6',
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
              <div style={{ fontSize: '2rem' }}>{getConfig(nextBreakType)?.icon}</div>
              <div>
                <h3 style={{ margin: 0, marginBottom: '0.25rem', fontSize: '1.125rem' }}>
                  Time for a {getConfig(nextBreakType)?.name}!
                </h3>
                <p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>
                  {getConfig(nextBreakType)?.description}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => startBreak(nextBreakType)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                }}
              >
                Start Break
              </button>
              <button
                onClick={dismissReminder}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Settings Quick Toggle */}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.25rem' }}>
              Break Reminders {settings.enabled ? 'Enabled' : 'Disabled'}
            </h2>
            <p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>
              {settings.enabled
                ? 'You will receive break reminders based on your schedule'
                : 'Enable break reminders to maintain healthy work habits'}
            </p>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 'bold' }}>Enabled</span>
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => updateSettings({ enabled: e.target.checked })}
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
          </label>
        </div>
      </motion.div>

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
            Total Breaks
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {stats.totalBreaks}
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
            Completed
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
            {stats.completedBreaks}
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
            Current Streak
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
            {stats.currentStreak} 🔥
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
            Total Break Time
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {Math.round(stats.totalBreakTime)}m
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
          { id: 'breaks', label: 'Break Types' },
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
                Regular breaks are essential for maintaining focus, preventing eye strain, reducing
                fatigue, and promoting overall well-being. This system helps you establish healthy
                break habits with automated reminders.
              </p>

              <h3 style={{ margin: '2rem 0 1rem 0' }}>Why Breaks Matter</h3>
              <ul style={{ lineHeight: 1.8 }}>
                <li>Prevents eye strain and digital fatigue</li>
                <li>Reduces risk of repetitive strain injuries</li>
                <li>Improves focus and concentration</li>
                <li>Boosts productivity and creativity</li>
                <li>Supports mental health and reduces stress</li>
                <li>Helps maintain energy levels throughout the day</li>
              </ul>

              <h3 style={{ margin: '2rem 0 1rem 0' }}>20-20-20 Rule</h3>
              <div
                style={{
                  padding: '1.5rem',
                  background: '#eff6ff',
                  borderRadius: '8px',
                  border: '1px solid #3b82f6',
                }}
              >
                <p style={{ margin: 0, lineHeight: 1.6 }}>
                  Every <strong>20 minutes</strong>, look at something <strong>20 feet away</strong>{' '}
                  for at least <strong>20 seconds</strong>. This helps reduce eye strain from screen
                  use.
                </p>
              </div>

              <h3 style={{ margin: '2rem 0 1rem 0' }}>Break Statistics</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(stats.breaksByType).map(([type, count]) => {
                  const config = getConfig(type as BreakType);
                  return (
                    <div
                      key={type}
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
                            width: `${stats.completedBreaks > 0 ? (count / stats.completedBreaks) * 100 : 0}%`,
                            height: '100%',
                            background: '#3b82f6',
                            transition: 'width 0.3s',
                          }}
                        />
                      </div>
                      <div style={{ width: '80px', textAlign: 'right' }}>
                        {count} breaks
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'breaks' && (
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Break Types</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {configs.map((config) => (
                  <div
                    key={config.type}
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
                        onClick={() => startBreak(config.type)}
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
                        Start Now
                      </button>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#666' }}>Duration</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                          {config.duration < 1
                            ? `${Math.round(config.duration * 60)} seconds`
                            : `${config.duration} minutes`}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', color: '#666' }}>Interval</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                          Every {config.interval} minutes
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        Suggested Activities:
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: 1.8 }}>
                        {config.activities.map((activity, i) => (
                          <li key={i} style={{ fontSize: '0.875rem' }}>
                            {activity}
                          </li>
                        ))}
                      </ul>
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
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Break History</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sessions.map((session) => {
                  const config = getConfig(session.type);
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
                            <div style={{ fontWeight: 'bold' }}>{config?.name}</div>
                            <div style={{ fontSize: '0.875rem', color: '#666' }}>
                              {session.startTime.toLocaleTimeString()}
                              {session.endTime && ` - ${session.endTime.toLocaleTimeString()}`}
                            </div>
                          </div>
                        </div>
                        <div>
                          <span
                            style={{
                              fontSize: '0.875rem',
                              padding: '0.25rem 0.75rem',
                              background: session.completed ? '#10b981' : session.skipped ? '#ef4444' : '#f59e0b',
                              color: 'white',
                              borderRadius: '4px',
                            }}
                          >
                            {session.completed ? 'Completed' : session.skipped ? 'Skipped' : 'In Progress'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {sessions.length === 0 && (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                    No break history yet. Start taking breaks to see them here!
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
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Break Settings</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h3 style={{ margin: 0, marginBottom: '1rem', fontSize: '1.125rem' }}>
                    General Settings
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={settings.autoStart}
                        onChange={(e) => updateSettings({ autoStart: e.target.checked })}
                      />
                      <span>Auto-start break timers</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={settings.playSound}
                        onChange={(e) => updateSettings({ playSound: e.target.checked })}
                      />
                      <span>Play sound for reminders</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={settings.pauseOnBreak}
                        onChange={(e) => updateSettings({ pauseOnBreak: e.target.checked })}
                      />
                      <span>Pause work during breaks</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={settings.trackBreaks}
                        onChange={(e) => updateSettings({ trackBreaks: e.target.checked })}
                      />
                      <span>Track break history</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 style={{ margin: 0, marginBottom: '1rem', fontSize: '1.125rem' }}>
                    Enabled Break Types
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {configs.map((config) => (
                      <label
                        key={config.type}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '1rem',
                          background: '#f9fafb',
                          borderRadius: '8px',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={settings[`${config.type}Breaks` as keyof BreakReminderSettings] as boolean}
                          onChange={(e) =>
                            updateSettings({
                              [`${config.type}Breaks`]: e.target.checked,
                            } as Partial<BreakReminderSettings>)
                          }
                          style={{ width: '20px', height: '20px' }}
                        />
                        <div style={{ fontSize: '1.5rem' }}>{config.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 'bold' }}>{config.name}</div>
                          <div style={{ fontSize: '0.875rem', color: '#666' }}>
                            {config.description}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#666' }}>
                          Every {settings.customIntervals[config.type]}m
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default BreakReminders;
