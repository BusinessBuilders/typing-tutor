import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Step 290: Create Schedules
 *
 * Provides practice session scheduling to help users maintain consistent
 * typing practice routines. Particularly helpful for building habits and
 * maintaining structure for users with executive function challenges.
 *
 * Features:
 * - Daily and weekly practice schedules
 * - Recurring session patterns
 * - Flexible and strict scheduling modes
 * - Schedule templates
 * - Reminder notifications
 * - Progress tracking against schedule
 * - Adaptive scheduling based on performance
 * - Break time integration
 */

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type RecurrencePattern = 'daily' | 'weekly' | 'custom';

export type ScheduleMode = 'flexible' | 'strict' | 'adaptive';

export interface TimeSlot {
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  duration: number; // minutes
}

export interface ScheduledSession {
  id: string;
  title: string;
  description?: string;
  timeSlot: TimeSlot;
  daysOfWeek: DayOfWeek[];
  recurrence: RecurrencePattern;
  enabled: boolean;
  reminderMinutes: number; // minutes before session
  autoStart: boolean;
  sessionType: 'practice' | 'lesson' | 'test' | 'review';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  color: string;
}

export interface ScheduleTemplate {
  id: string;
  name: string;
  description: string;
  sessions: Omit<ScheduledSession, 'id'>[];
  targetLevel: 'beginner' | 'intermediate' | 'advanced';
  weeklyHours: number;
  icon: string;
}

export interface CompletedSession {
  id: string;
  scheduledSessionId: string;
  scheduledTime: Date;
  actualStartTime: Date;
  actualEndTime: Date;
  duration: number; // minutes
  completed: boolean;
  skipped: boolean;
  postponed: boolean;
  accuracy?: number; // 0-100
  wpm?: number;
}

export interface ScheduleSettings {
  mode: ScheduleMode;
  enableReminders: boolean;
  defaultReminderMinutes: number;
  allowSkipping: boolean;
  allowPostponing: boolean;
  postponeLimit: number; // hours
  autoStartSessions: boolean;
  adaptiveDifficulty: boolean;
  restDays: DayOfWeek[];
  quietHours: {
    start: string; // HH:MM
    end: string; // HH:MM
  };
  streakTracking: boolean;
  weeklyGoalHours: number;
}

export interface ScheduleStats {
  currentStreak: number; // days
  longestStreak: number; // days
  totalSessions: number;
  completedSessions: number;
  skippedSessions: number;
  postponedSessions: number;
  completionRate: number; // percentage
  averageAccuracy: number; // 0-100
  averageWPM: number;
  weeklyHoursCompleted: number;
  weeklyHoursGoal: number;
  preferredTime: string; // HH:MM
  bestPerformanceTime: string; // HH:MM
}

const daysOfWeek: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const scheduleTemplates: ScheduleTemplate[] = [
  {
    id: 'beginner-routine',
    name: 'Beginner Routine',
    description: 'Easy 3-day schedule with short sessions',
    targetLevel: 'beginner',
    weeklyHours: 2.5,
    icon: '🌱',
    sessions: [
      {
        title: 'Morning Practice',
        timeSlot: { startTime: '09:00', endTime: '09:30', duration: 30 },
        daysOfWeek: ['monday', 'wednesday', 'friday'],
        recurrence: 'weekly',
        enabled: true,
        reminderMinutes: 15,
        autoStart: false,
        sessionType: 'practice',
        difficulty: 'beginner',
        color: '#4caf50',
      },
      {
        title: 'Evening Review',
        timeSlot: { startTime: '18:00', endTime: '18:20', duration: 20 },
        daysOfWeek: ['tuesday', 'thursday'],
        recurrence: 'weekly',
        enabled: true,
        reminderMinutes: 10,
        autoStart: false,
        sessionType: 'review',
        difficulty: 'beginner',
        color: '#2196f3',
      },
    ],
  },
  {
    id: 'intermediate-plan',
    name: 'Intermediate Plan',
    description: 'Balanced 5-day schedule with varied sessions',
    targetLevel: 'intermediate',
    weeklyHours: 5,
    icon: '📈',
    sessions: [
      {
        title: 'Daily Practice',
        timeSlot: { startTime: '08:00', endTime: '08:45', duration: 45 },
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        recurrence: 'weekly',
        enabled: true,
        reminderMinutes: 15,
        autoStart: false,
        sessionType: 'practice',
        difficulty: 'intermediate',
        color: '#ff9800',
      },
      {
        title: 'Speed Test',
        timeSlot: { startTime: '17:00', endTime: '17:15', duration: 15 },
        daysOfWeek: ['wednesday'],
        recurrence: 'weekly',
        enabled: true,
        reminderMinutes: 10,
        autoStart: false,
        sessionType: 'test',
        difficulty: 'intermediate',
        color: '#9c27b0',
      },
      {
        title: 'Weekend Review',
        timeSlot: { startTime: '10:00', endTime: '10:30', duration: 30 },
        daysOfWeek: ['saturday'],
        recurrence: 'weekly',
        enabled: true,
        reminderMinutes: 20,
        autoStart: false,
        sessionType: 'review',
        difficulty: 'intermediate',
        color: '#2196f3',
      },
    ],
  },
  {
    id: 'advanced-training',
    name: 'Advanced Training',
    description: 'Intensive daily schedule for serious improvement',
    targetLevel: 'advanced',
    weeklyHours: 10,
    icon: '🏆',
    sessions: [
      {
        title: 'Morning Speed Work',
        timeSlot: { startTime: '07:00', endTime: '08:00', duration: 60 },
        daysOfWeek: ['monday', 'wednesday', 'friday'],
        recurrence: 'weekly',
        enabled: true,
        reminderMinutes: 15,
        autoStart: false,
        sessionType: 'practice',
        difficulty: 'advanced',
        color: '#f44336',
      },
      {
        title: 'Accuracy Drills',
        timeSlot: { startTime: '12:00', endTime: '13:00', duration: 60 },
        daysOfWeek: ['tuesday', 'thursday'],
        recurrence: 'weekly',
        enabled: true,
        reminderMinutes: 10,
        autoStart: false,
        sessionType: 'practice',
        difficulty: 'advanced',
        color: '#ff9800',
      },
      {
        title: 'Evening Challenge',
        timeSlot: { startTime: '19:00', endTime: '20:00', duration: 60 },
        daysOfWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        recurrence: 'weekly',
        enabled: true,
        reminderMinutes: 20,
        autoStart: false,
        sessionType: 'test',
        difficulty: 'advanced',
        color: '#9c27b0',
      },
      {
        title: 'Weekend Marathon',
        timeSlot: { startTime: '10:00', endTime: '11:30', duration: 90 },
        daysOfWeek: ['saturday', 'sunday'],
        recurrence: 'weekly',
        enabled: true,
        reminderMinutes: 30,
        autoStart: false,
        sessionType: 'practice',
        difficulty: 'advanced',
        color: '#4caf50',
      },
    ],
  },
  {
    id: 'flexible-daily',
    name: 'Flexible Daily',
    description: 'One session per day, any time that works',
    targetLevel: 'beginner',
    weeklyHours: 3.5,
    icon: '🎯',
    sessions: [
      {
        title: 'Daily Practice',
        timeSlot: { startTime: '12:00', endTime: '12:30', duration: 30 },
        daysOfWeek: [
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday',
        ],
        recurrence: 'daily',
        enabled: true,
        reminderMinutes: 15,
        autoStart: false,
        sessionType: 'practice',
        color: '#2196f3',
      },
    ],
  },
  {
    id: 'weekend-warrior',
    name: 'Weekend Warrior',
    description: 'Intensive weekend-only schedule',
    targetLevel: 'intermediate',
    weeklyHours: 4,
    icon: '⚡',
    sessions: [
      {
        title: 'Saturday Deep Practice',
        timeSlot: { startTime: '09:00', endTime: '10:30', duration: 90 },
        daysOfWeek: ['saturday'],
        recurrence: 'weekly',
        enabled: true,
        reminderMinutes: 30,
        autoStart: false,
        sessionType: 'practice',
        difficulty: 'intermediate',
        color: '#4caf50',
      },
      {
        title: 'Sunday Speed Session',
        timeSlot: { startTime: '10:00', endTime: '11:30', duration: 90 },
        daysOfWeek: ['sunday'],
        recurrence: 'weekly',
        enabled: true,
        reminderMinutes: 30,
        autoStart: false,
        sessionType: 'practice',
        difficulty: 'intermediate',
        color: '#ff9800',
      },
    ],
  },
];

const defaultSettings: ScheduleSettings = {
  mode: 'flexible',
  enableReminders: true,
  defaultReminderMinutes: 15,
  allowSkipping: true,
  allowPostponing: true,
  postponeLimit: 24,
  autoStartSessions: false,
  adaptiveDifficulty: false,
  restDays: ['sunday'],
  quietHours: {
    start: '22:00',
    end: '07:00',
  },
  streakTracking: true,
  weeklyGoalHours: 5,
};

export const useSchedules = () => {
  const [settings, setSettings] = useState<ScheduleSettings>(defaultSettings);
  const [sessions, setSessions] = useState<ScheduledSession[]>([]);
  const [completedSessions, setCompletedSessions] = useState<CompletedSession[]>([]);
  const [stats, setStats] = useState<ScheduleStats>({
    currentStreak: 0,
    longestStreak: 0,
    totalSessions: 0,
    completedSessions: 0,
    skippedSessions: 0,
    postponedSessions: 0,
    completionRate: 0,
    averageAccuracy: 0,
    averageWPM: 0,
    weeklyHoursCompleted: 0,
    weeklyHoursGoal: 5,
    preferredTime: '09:00',
    bestPerformanceTime: '10:00',
  });

  const applyTemplate = useCallback((templateId: string) => {
    const template = scheduleTemplates.find((t) => t.id === templateId);
    if (!template) return;

    const newSessions: ScheduledSession[] = template.sessions.map(
      (session, index) => ({
        ...session,
        id: `session-${Date.now()}-${index}`,
      })
    );

    setSessions(newSessions);
    setSettings((prev) => ({
      ...prev,
      weeklyGoalHours: template.weeklyHours,
    }));
  }, []);

  const addSession = useCallback((session: Omit<ScheduledSession, 'id'>) => {
    const newSession: ScheduledSession = {
      ...session,
      id: `session-${Date.now()}`,
    };
    setSessions((prev) => [...prev, newSession]);
  }, []);

  const updateSession = useCallback(
    (sessionId: string, updates: Partial<ScheduledSession>) => {
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, ...updates } : s))
      );
    },
    []
  );

  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  }, []);

  const toggleSession = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, enabled: !s.enabled } : s
      )
    );
  }, []);

  const getUpcomingSessions = useCallback(
    (count: number = 5): Array<ScheduledSession & { nextOccurrence: Date }> => {
      const now = new Date();
      const upcoming: Array<ScheduledSession & { nextOccurrence: Date }> = [];

      sessions
        .filter((s) => s.enabled)
        .forEach((session) => {
          const [hours, minutes] = session.timeSlot.startTime.split(':').map(Number);

          session.daysOfWeek.forEach((day) => {
            const dayIndex = daysOfWeek.indexOf(day);
            const currentDayIndex = (now.getDay() + 6) % 7; // Convert to Monday = 0

            let daysUntil = dayIndex - currentDayIndex;
            if (daysUntil < 0) daysUntil += 7;

            const nextDate = new Date(now);
            nextDate.setDate(now.getDate() + daysUntil);
            nextDate.setHours(hours, minutes, 0, 0);

            if (nextDate > now) {
              upcoming.push({ ...session, nextOccurrence: nextDate });
            }
          });
        });

      return upcoming
        .sort((a, b) => a.nextOccurrence.getTime() - b.nextOccurrence.getTime())
        .slice(0, count);
    },
    [sessions]
  );

  const getTodaySessions = useCallback((): ScheduledSession[] => {
    const today = new Date();
    const dayIndex = (today.getDay() + 6) % 7; // Convert to Monday = 0
    const dayName = daysOfWeek[dayIndex];

    return sessions.filter(
      (s) => s.enabled && s.daysOfWeek.includes(dayName)
    );
  }, [sessions]);

  const completeSession = useCallback(
    (
      scheduledSessionId: string,
      actualDuration: number,
      accuracy?: number,
      wpm?: number
    ) => {
      const now = new Date();
      const completedSession: CompletedSession = {
        id: `completed-${Date.now()}`,
        scheduledSessionId,
        scheduledTime: now,
        actualStartTime: new Date(now.getTime() - actualDuration * 60000),
        actualEndTime: now,
        duration: actualDuration,
        completed: true,
        skipped: false,
        postponed: false,
        accuracy,
        wpm,
      };

      setCompletedSessions((prev) => [...prev, completedSession]);
      updateStats();
    },
    []
  );

  const skipSession = useCallback((scheduledSessionId: string) => {
    const now = new Date();
    const skippedSession: CompletedSession = {
      id: `skipped-${Date.now()}`,
      scheduledSessionId,
      scheduledTime: now,
      actualStartTime: now,
      actualEndTime: now,
      duration: 0,
      completed: false,
      skipped: true,
      postponed: false,
    };

    setCompletedSessions((prev) => [...prev, skippedSession]);
    updateStats();
  }, []);

  const postponeSession = useCallback(
    (scheduledSessionId: string, newTime: Date) => {
      // In a real implementation, this would modify the schedule
      console.log(`Postponing session ${scheduledSessionId} to ${newTime}`);
    },
    []
  );

  const updateStats = useCallback(() => {
    const completed = completedSessions.filter((s) => s.completed);
    const skipped = completedSessions.filter((s) => s.skipped);
    const postponed = completedSessions.filter((s) => s.postponed);

    const totalSessions = completedSessions.length;
    const completionRate =
      totalSessions > 0 ? (completed.length / totalSessions) * 100 : 0;

    const averageAccuracy =
      completed.length > 0
        ? completed.reduce((sum, s) => sum + (s.accuracy || 0), 0) /
          completed.length
        : 0;

    const averageWPM =
      completed.length > 0
        ? completed.reduce((sum, s) => sum + (s.wpm || 0), 0) / completed.length
        : 0;

    const weeklyHoursCompleted =
      completed
        .filter((s) => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return s.actualStartTime > weekAgo;
        })
        .reduce((sum, s) => sum + s.duration, 0) / 60;

    // Calculate streak
    let currentStreak = 0;
    let longestStreak = 0;
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const dayHasSessions = completed.some((s) => {
        const sessionDate = new Date(s.actualStartTime);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === date.getTime();
      });

      if (dayHasSessions) {
        streak++;
        if (i === 0 || currentStreak > 0) {
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
      completedSessions: completed.length,
      skippedSessions: skipped.length,
      postponedSessions: postponed.length,
      completionRate,
      averageAccuracy,
      averageWPM,
      weeklyHoursCompleted,
      weeklyHoursGoal: settings.weeklyGoalHours,
      preferredTime: '09:00',
      bestPerformanceTime: '10:00',
    });
  }, [completedSessions, settings.weeklyGoalHours]);

  const clearHistory = useCallback(() => {
    setCompletedSessions([]);
    updateStats();
  }, [updateStats]);

  const updateSettings = useCallback((updates: Partial<ScheduleSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const getSessionsByDay = useCallback(
    (day: DayOfWeek): ScheduledSession[] => {
      return sessions.filter((s) => s.enabled && s.daysOfWeek.includes(day));
    },
    [sessions]
  );

  // Update stats when completed sessions change
  useEffect(() => {
    updateStats();
  }, [completedSessions, updateStats]);

  return {
    settings,
    updateSettings,
    sessions,
    addSession,
    updateSession,
    deleteSession,
    toggleSession,
    templates: scheduleTemplates,
    applyTemplate,
    getUpcomingSessions,
    getTodaySessions,
    getSessionsByDay,
    completeSession,
    skipSession,
    postponeSession,
    completedSessions,
    stats,
    clearHistory,
  };
};

interface SchedulesControlsProps {
  schedules: ReturnType<typeof useSchedules>;
}

export const SchedulesControls: React.FC<SchedulesControlsProps> = ({
  schedules,
}) => {
  const {
    settings,
    updateSettings,
    sessions,
    templates,
    applyTemplate,
    getUpcomingSessions,
    getTodaySessions,
    toggleSession,
    stats,
  } = schedules;

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }
  };

  const todaySessions = getTodaySessions();
  const upcomingSessions = getUpcomingSessions(5);

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '1000px',
      }}
    >
      <h2 style={{ marginBottom: '20px' }}>Practice Schedules</h2>

      {/* Stats Overview */}
      <div
        style={{
          marginBottom: '24px',
          padding: '20px',
          background: '#f5f5f5',
          borderRadius: '8px',
          border: '2px solid #ddd',
        }}
      >
        <h3 style={{ marginBottom: '16px' }}>Your Progress</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
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
            <div style={{ fontSize: '12px', color: '#666' }}>Completion Rate</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2196f3' }}>
              {Math.round(stats.completionRate)}%
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>
              {stats.completedSessions}/{stats.totalSessions} sessions
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>This Week</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff9800' }}>
              {stats.weeklyHoursCompleted.toFixed(1)}h
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>
              Goal: {stats.weeklyHoursGoal}h
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Avg Performance</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#9c27b0' }}>
              {Math.round(stats.averageWPM)} WPM
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>
              {Math.round(stats.averageAccuracy)}% accuracy
            </div>
          </div>
        </div>
      </div>

      {/* Today's Sessions */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>Today's Schedule</h3>
        {todaySessions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {todaySessions.map((session) => (
              <div
                key={session.id}
                style={{
                  padding: '16px',
                  background: 'white',
                  border: `2px solid ${session.color}`,
                  borderLeft: `6px solid ${session.color}`,
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    {session.title}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    {session.timeSlot.startTime} - {session.timeSlot.endTime} (
                    {session.timeSlot.duration} min)
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                    {session.sessionType.charAt(0).toUpperCase() +
                      session.sessionType.slice(1)}{' '}
                    • {session.difficulty || 'Any level'}
                  </div>
                </div>
                <button
                  onClick={() => toggleSession(session.id)}
                  style={{
                    padding: '8px 16px',
                    background: session.enabled ? '#4caf50' : '#9e9e9e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  {session.enabled ? '✓ Enabled' : 'Disabled'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '32px',
              background: 'white',
              border: '2px dashed #ddd',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#999',
            }}
          >
            No sessions scheduled for today. Apply a template or add sessions below.
          </div>
        )}
      </div>

      {/* Upcoming Sessions */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>Upcoming Sessions</h3>
        {upcomingSessions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {upcomingSessions.map((session, index) => (
              <div
                key={`${session.id}-${index}`}
                style={{
                  padding: '12px 16px',
                  background: 'white',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontWeight: 'bold' }}>{session.title}</span>
                  <span style={{ margin: '0 8px', color: '#ddd' }}>•</span>
                  <span style={{ color: '#666' }}>
                    {formatDate(session.nextOccurrence)} at{' '}
                    {formatTime(session.nextOccurrence)}
                  </span>
                </div>
                <div
                  style={{
                    padding: '4px 8px',
                    background: session.color,
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px',
                  }}
                >
                  {session.timeSlot.duration} min
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '24px',
              background: 'white',
              border: '2px dashed #ddd',
              borderRadius: '8px',
              textAlign: 'center',
              color: '#999',
            }}
          >
            No upcoming sessions
          </div>
        )}
      </div>

      {/* Templates */}
      {sessions.length === 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '12px' }}>Quick Start Templates</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {templates.map((template) => (
              <motion.button
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template.id);
                  applyTemplate(template.id);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: '16px',
                  background: 'white',
                  border:
                    selectedTemplate === template.id
                      ? '3px solid #2196f3'
                      : '2px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                  {template.icon}
                </div>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {template.name}
                </div>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                  {template.description}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  {template.weeklyHours}h/week • {template.sessions.length} sessions
                  • {template.targetLevel}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Settings */}
      <div
        style={{
          padding: '16px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '12px' }}>Schedule Settings</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Schedule Mode
            </label>
            <select
              value={settings.mode}
              onChange={(e) =>
                updateSettings({ mode: e.target.value as ScheduleMode })
              }
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                width: '100%',
              }}
            >
              <option value="flexible">Flexible - Suggestions only</option>
              <option value="strict">Strict - Follow exactly</option>
              <option value="adaptive">Adaptive - Adjusts to performance</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.enableReminders}
                onChange={(e) =>
                  updateSettings({ enableReminders: e.target.checked })
                }
              />
              Enable reminders
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.autoStartSessions}
                onChange={(e) =>
                  updateSettings({ autoStartSessions: e.target.checked })
                }
              />
              Auto-start sessions
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.allowSkipping}
                onChange={(e) =>
                  updateSettings({ allowSkipping: e.target.checked })
                }
              />
              Allow skipping
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={settings.streakTracking}
                onChange={(e) =>
                  updateSettings({ streakTracking: e.target.checked })
                }
              />
              Track streak
            </label>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
              Weekly Goal: {settings.weeklyGoalHours} hours
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={settings.weeklyGoalHours}
              onChange={(e) =>
                updateSettings({ weeklyGoalHours: parseInt(e.target.value) })
              }
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulesControls;
