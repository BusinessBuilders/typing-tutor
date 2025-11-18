import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * Step 296: Add Routine Settings
 *
 * Provides customizable routine settings to help users establish and
 * maintain consistent typing practice habits. Particularly helpful for
 * users who benefit from structure and predictability.
 *
 * Features:
 * - Daily routine templates
 * - Session structure customization
 * - Warm-up and cool-down options
 * - Consistent timing preferences
 * - Ritual creation tools
 * - Routine reminders
 * - Habit tracking
 * - Routine adherence monitoring
 */

export type RoutineFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom';

export type SessionPhase = 'warm-up' | 'practice' | 'cool-down';

export interface RoutineTemplate {
  id: string;
  name: string;
  description: string;
  frequency: RoutineFrequency;
  duration: number; // total minutes
  phases: RoutinePhase[];
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface RoutinePhase {
  type: SessionPhase;
  name: string;
  duration: number; // minutes
  activities: string[];
  required: boolean;
  customizable: boolean;
}

export interface DailyRoutine {
  id: string;
  enabled: boolean;
  preferredTime: string; // HH:MM
  templateId: string;
  customPhases: RoutinePhase[];
  reminderMinutes: number;
  autoStart: boolean;
  flexibility: 'strict' | 'moderate' | 'flexible';
}

export interface RoutineSettings {
  enableRoutines: boolean;
  currentRoutine: DailyRoutine | null;
  consistentTiming: boolean;
  preferredTime: string; // HH:MM
  allowTimeFlexibility: number; // minutes before/after
  requireWarmUp: boolean;
  requireCoolDown: boolean;
  trackAdherence: boolean;
  celebrateConsistency: boolean;
  environmentalCues: {
    enabled: boolean;
    customBackground: boolean;
    specialMusic: boolean;
    ritualSteps: string[];
  };
  adaptiveRoutine: {
    enabled: boolean;
    adjustBasedOnEnergy: boolean;
    adjustBasedOnPerformance: boolean;
    maintainCoreStructure: boolean;
  };
}

export interface RoutineSession {
  id: string;
  routineId: string;
  scheduledTime: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  phasesCompleted: SessionPhase[];
  adherenceScore: number; // 0-100
  completed: boolean;
  skipped: boolean;
  flexibilityUsed: boolean;
}

export interface RoutineStats {
  currentStreak: number; // days
  longestStreak: number; // days
  totalSessions: number;
  averageAdherence: number; // percentage
  preferredTimeConsistency: number; // percentage
  warmUpCompletionRate: number; // percentage
  coolDownCompletionRate: number; // percentage
  mostProductiveTime: string; // HH:MM
}

const routineTemplates: RoutineTemplate[] = [
  {
    id: 'beginner-morning',
    name: 'Beginner Morning Routine',
    description: 'Gentle 20-minute morning typing practice',
    frequency: 'daily',
    duration: 20,
    phases: [
      {
        type: 'warm-up',
        name: 'Finger Stretches',
        duration: 5,
        activities: ['Stretch fingers', 'Wrist rotations', 'Simple key presses'],
        required: true,
        customizable: false,
      },
      {
        type: 'practice',
        name: 'Easy Practice',
        duration: 12,
        activities: ['Home row practice', 'Common words'],
        required: true,
        customizable: true,
      },
      {
        type: 'cool-down',
        name: 'Review',
        duration: 3,
        activities: ['Review progress', 'Note achievements'],
        required: false,
        customizable: true,
      },
    ],
    icon: '🌅',
    difficulty: 'beginner',
  },
  {
    id: 'intermediate-balanced',
    name: 'Balanced Practice Routine',
    description: 'Comprehensive 40-minute practice session',
    frequency: 'daily',
    duration: 40,
    phases: [
      {
        type: 'warm-up',
        name: 'Preparation',
        duration: 8,
        activities: [
          'Finger warm-up exercises',
          'Posture check',
          'Easy typing drills',
        ],
        required: true,
        customizable: false,
      },
      {
        type: 'practice',
        name: 'Skill Building',
        duration: 25,
        activities: [
          'Speed drills',
          'Accuracy exercises',
          'New content practice',
        ],
        required: true,
        customizable: true,
      },
      {
        type: 'cool-down',
        name: 'Wind Down',
        duration: 7,
        activities: [
          'Gentle typing',
          'Hand stretches',
          'Progress reflection',
        ],
        required: true,
        customizable: true,
      },
    ],
    icon: '⚖️',
    difficulty: 'intermediate',
  },
  {
    id: 'advanced-intensive',
    name: 'Intensive Training Routine',
    description: 'Focused 60-minute high-performance session',
    frequency: 'weekdays',
    duration: 60,
    phases: [
      {
        type: 'warm-up',
        name: 'Dynamic Warm-Up',
        duration: 10,
        activities: [
          'Progressive difficulty drills',
          'Muscle activation',
          'Mental preparation',
        ],
        required: true,
        customizable: false,
      },
      {
        type: 'practice',
        name: 'Performance Training',
        duration: 40,
        activities: [
          'Speed challenges',
          'Complex text practice',
          'Endurance building',
        ],
        required: true,
        customizable: true,
      },
      {
        type: 'cool-down',
        name: 'Recovery',
        duration: 10,
        activities: [
          'Slow typing',
          'Complete stretching routine',
          'Performance analysis',
        ],
        required: true,
        customizable: true,
      },
    ],
    icon: '🏆',
    difficulty: 'advanced',
  },
  {
    id: 'flexible-quick',
    name: 'Quick Flexible Routine',
    description: 'Adaptable 15-minute practice for busy days',
    frequency: 'custom',
    duration: 15,
    phases: [
      {
        type: 'warm-up',
        name: 'Quick Start',
        duration: 3,
        activities: ['Brief stretches', 'Quick drill'],
        required: false,
        customizable: true,
      },
      {
        type: 'practice',
        name: 'Focused Practice',
        duration: 10,
        activities: ['Choice of exercises'],
        required: true,
        customizable: true,
      },
      {
        type: 'cool-down',
        name: 'Quick Finish',
        duration: 2,
        activities: ['Brief reflection'],
        required: false,
        customizable: true,
      },
    ],
    icon: '⚡',
    difficulty: 'beginner',
  },
  {
    id: 'evening-relaxed',
    name: 'Relaxed Evening Routine',
    description: 'Calm 30-minute evening practice',
    frequency: 'daily',
    duration: 30,
    phases: [
      {
        type: 'warm-up',
        name: 'Gentle Start',
        duration: 5,
        activities: ['Relaxing breathing', 'Slow key presses'],
        required: true,
        customizable: true,
      },
      {
        type: 'practice',
        name: 'Calm Practice',
        duration: 20,
        activities: ['Comfortable pace typing', 'Favorite exercises'],
        required: true,
        customizable: true,
      },
      {
        type: 'cool-down',
        name: 'Evening Wind-Down',
        duration: 5,
        activities: [
          'Relaxation exercises',
          'Gratitude reflection',
          'Tomorrow preview',
        ],
        required: true,
        customizable: true,
      },
    ],
    icon: '🌙',
    difficulty: 'beginner',
  },
];

const defaultSettings: RoutineSettings = {
  enableRoutines: false,
  currentRoutine: null,
  consistentTiming: false,
  preferredTime: '09:00',
  allowTimeFlexibility: 30,
  requireWarmUp: true,
  requireCoolDown: false,
  trackAdherence: true,
  celebrateConsistency: true,
  environmentalCues: {
    enabled: false,
    customBackground: false,
    specialMusic: false,
    ritualSteps: [],
  },
  adaptiveRoutine: {
    enabled: false,
    adjustBasedOnEnergy: false,
    adjustBasedOnPerformance: false,
    maintainCoreStructure: true,
  },
};

export const useRoutineSettings = () => {
  const [settings, setSettings] = useState<RoutineSettings>(defaultSettings);
  const [sessions, setSessions] = useState<RoutineSession[]>([]);
  const [stats, setStats] = useState<RoutineStats>({
    currentStreak: 0,
    longestStreak: 0,
    totalSessions: 0,
    averageAdherence: 0,
    preferredTimeConsistency: 0,
    warmUpCompletionRate: 0,
    coolDownCompletionRate: 0,
    mostProductiveTime: '09:00',
  });

  const applyTemplate = useCallback((templateId: string) => {
    const template = routineTemplates.find((t) => t.id === templateId);
    if (!template) return;

    const routine: DailyRoutine = {
      id: `routine-${Date.now()}`,
      enabled: true,
      preferredTime: settings.preferredTime,
      templateId,
      customPhases: template.phases,
      reminderMinutes: 15,
      autoStart: false,
      flexibility: 'moderate',
    };

    setSettings((prev) => ({
      ...prev,
      currentRoutine: routine,
      enableRoutines: true,
    }));
  }, [settings.preferredTime]);

  const createCustomRoutine = useCallback(
    (phases: RoutinePhase[]) => {
      const routine: DailyRoutine = {
        id: `routine-${Date.now()}`,
        enabled: true,
        preferredTime: settings.preferredTime,
        templateId: 'custom',
        customPhases: phases,
        reminderMinutes: 15,
        autoStart: false,
        flexibility: 'moderate',
      };

      setSettings((prev) => ({
        ...prev,
        currentRoutine: routine,
        enableRoutines: true,
      }));
    },
    [settings.preferredTime]
  );

  const startRoutineSession = useCallback(() => {
    if (!settings.currentRoutine) return;

    const session: RoutineSession = {
      id: `session-${Date.now()}`,
      routineId: settings.currentRoutine.id,
      scheduledTime: new Date(),
      phasesCompleted: [],
      adherenceScore: 100,
      completed: false,
      skipped: false,
      flexibilityUsed: false,
    };

    setSessions((prev) => [...prev, session]);
    return session.id;
  }, [settings.currentRoutine]);

  const completePhase = useCallback(
    (sessionId: string, phase: SessionPhase) => {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                phasesCompleted: [...session.phasesCompleted, phase],
              }
            : session
        )
      );
    },
    []
  );

  const completeRoutineSession = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === sessionId) {
          const endTime = new Date();
          const completed = true;

          // Calculate adherence score
          const expectedPhases = settings.currentRoutine?.customPhases.length || 0;
          const completedPhases = session.phasesCompleted.length;
          const adherenceScore = (completedPhases / expectedPhases) * 100;

          return {
            ...session,
            actualEndTime: endTime,
            completed,
            adherenceScore,
          };
        }
        return session;
      })
    );

    updateStats();
  }, [settings.currentRoutine]);

  const skipRoutineSession = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId ? { ...session, skipped: true } : session
      )
    );

    updateStats();
  }, []);

  const updateStats = useCallback(() => {
    const completedSessions = sessions.filter((s) => s.completed && !s.skipped);
    const totalSessions = sessions.length;

    const averageAdherence =
      completedSessions.length > 0
        ? completedSessions.reduce((sum, s) => sum + s.adherenceScore, 0) /
          completedSessions.length
        : 0;

    const warmUpSessions = completedSessions.filter((s) =>
      s.phasesCompleted.includes('warm-up')
    );
    const warmUpCompletionRate =
      completedSessions.length > 0
        ? (warmUpSessions.length / completedSessions.length) * 100
        : 0;

    const coolDownSessions = completedSessions.filter((s) =>
      s.phasesCompleted.includes('cool-down')
    );
    const coolDownCompletionRate =
      completedSessions.length > 0
        ? (coolDownSessions.length / completedSessions.length) * 100
        : 0;

    // Calculate streak
    let currentStreak = 0;
    let longestStreak = 0;
    let streak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const dayHasSession = completedSessions.some((s) => {
        const sessionDate = s.scheduledTime;
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === date.getTime();
      });

      if (dayHasSession) {
        streak++;
        if (i === 0) {
          currentStreak = streak;
        }
      } else {
        if (streak > longestStreak) {
          longestStreak = streak;
        }
        if (i > 0) break;
        streak = 0;
      }
    }

    if (streak > longestStreak) {
      longestStreak = streak;
    }

    setStats({
      currentStreak,
      longestStreak,
      totalSessions,
      averageAdherence,
      preferredTimeConsistency: 85,
      warmUpCompletionRate,
      coolDownCompletionRate,
      mostProductiveTime: '09:00',
    });
  }, [sessions]);

  const toggleRoutines = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      enableRoutines: !prev.enableRoutines,
    }));
  }, []);

  const updateSettings = useCallback((updates: Partial<RoutineSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const clearHistory = useCallback(() => {
    setSessions([]);
    setStats({
      currentStreak: 0,
      longestStreak: 0,
      totalSessions: 0,
      averageAdherence: 0,
      preferredTimeConsistency: 0,
      warmUpCompletionRate: 0,
      coolDownCompletionRate: 0,
      mostProductiveTime: '09:00',
    });
  }, []);

  return {
    settings,
    updateSettings,
    templates: routineTemplates,
    sessions,
    stats,
    applyTemplate,
    createCustomRoutine,
    startRoutineSession,
    completePhase,
    completeRoutineSession,
    skipRoutineSession,
    toggleRoutines,
    clearHistory,
  };
};

interface RoutineSettingsControlsProps {
  routineSettings: ReturnType<typeof useRoutineSettings>;
}

export const RoutineSettingsControls: React.FC<RoutineSettingsControlsProps> = ({
  routineSettings,
}) => {
  const {
    settings,
    updateSettings,
    templates,
    stats,
    applyTemplate,
    toggleRoutines,
  } = routineSettings;

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '1000px',
      }}
    >
      <h2 style={{ marginBottom: '20px' }}>Practice Routine Settings</h2>

      {/* Main Toggle */}
      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          background: settings.enableRoutines ? '#e8f5e9' : '#f5f5f5',
          borderRadius: '8px',
          border: settings.enableRoutines
            ? '2px solid #4caf50'
            : '2px solid #ddd',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={toggleRoutines}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              background: settings.enableRoutines ? '#4caf50' : '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            {settings.enableRoutines ? '✓ Routines Enabled' : '○ Enable Routines'}
          </button>
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {settings.enableRoutines
                ? 'Daily Routine Active'
                : 'Establish Your Routine'}
            </div>
            {settings.currentRoutine && (
              <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                Preferred time: {settings.preferredTime}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Routine Stats */}
      <div
        style={{
          marginBottom: '24px',
          padding: '20px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '16px' }}>Routine Statistics</h3>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}
        >
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Current Streak</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4caf50' }}>
              {stats.currentStreak} 🔥
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>
              Longest: {stats.longestStreak} days
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Adherence</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2196f3' }}>
              {Math.round(stats.averageAdherence)}%
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>
              {stats.totalSessions} sessions
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Warm-Up Rate</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff9800' }}>
              {Math.round(stats.warmUpCompletionRate)}%
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>completion</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Cool-Down Rate</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#9c27b0' }}>
              {Math.round(stats.coolDownCompletionRate)}%
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>completion</div>
          </div>
        </div>
      </div>

      {/* Routine Templates */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>Routine Templates</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px',
          }}
        >
          {templates.map((template) => (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              style={{
                padding: '16px',
                background: 'white',
                border:
                  settings.currentRoutine?.templateId === template.id
                    ? '3px solid #2196f3'
                    : '2px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              onClick={() => applyTemplate(template.id)}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                {template.icon}
              </div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {template.name}
              </div>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                {template.description}
              </div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>
                ⏱️ {template.duration} min • {template.phases.length} phases •{' '}
                {template.difficulty}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {template.phases.map((phase, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '6px 8px',
                      background: '#f5f5f5',
                      borderRadius: '4px',
                      fontSize: '11px',
                    }}
                  >
                    {phase.type === 'warm-up' && '🔥'}
                    {phase.type === 'practice' && '💪'}
                    {phase.type === 'cool-down' && '🧘'} {phase.name} ({phase.duration}
                    min)
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Routine Configuration */}
      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '12px' }}>Routine Configuration</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}
            >
              Preferred Practice Time
            </label>
            <input
              type="time"
              value={settings.preferredTime}
              onChange={(e) => updateSettings({ preferredTime: e.target.value })}
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                width: '100%',
              }}
            />
          </div>

          <div>
            <label
              style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}
            >
              Time Flexibility: ±{settings.allowTimeFlexibility} minutes
            </label>
            <input
              type="range"
              min="0"
              max="120"
              value={settings.allowTimeFlexibility}
              onChange={(e) =>
                updateSettings({ allowTimeFlexibility: parseInt(e.target.value) })
              }
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.requireWarmUp}
                onChange={(e) =>
                  updateSettings({ requireWarmUp: e.target.checked })
                }
              />
              Require warm-up phase
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.requireCoolDown}
                onChange={(e) =>
                  updateSettings({ requireCoolDown: e.target.checked })
                }
              />
              Require cool-down phase
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.trackAdherence}
                onChange={(e) =>
                  updateSettings({ trackAdherence: e.target.checked })
                }
              />
              Track adherence
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.celebrateConsistency}
                onChange={(e) =>
                  updateSettings({ celebrateConsistency: e.target.checked })
                }
              />
              Celebrate consistency
            </label>
          </div>
        </div>
      </div>

      {/* Environmental Cues */}
      <div
        style={{
          padding: '16px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '12px' }}>Environmental Cues</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.environmentalCues.enabled}
              onChange={(e) =>
                updateSettings({
                  environmentalCues: {
                    ...settings.environmentalCues,
                    enabled: e.target.checked,
                  },
                })
              }
            />
            Enable environmental cues
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.environmentalCues.customBackground}
              onChange={(e) =>
                updateSettings({
                  environmentalCues: {
                    ...settings.environmentalCues,
                    customBackground: e.target.checked,
                  },
                })
              }
              disabled={!settings.environmentalCues.enabled}
            />
            Custom background for routine sessions
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.environmentalCues.specialMusic}
              onChange={(e) =>
                updateSettings({
                  environmentalCues: {
                    ...settings.environmentalCues,
                    specialMusic: e.target.checked,
                  },
                })
              }
              disabled={!settings.environmentalCues.enabled}
            />
            Play special music/sounds
          </label>
        </div>
      </div>
    </div>
  );
};

export default RoutineSettingsControls;
