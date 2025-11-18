import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * Step 298: Create Self-Pacing System
 *
 * Empowers users to control the pace of their learning journey without
 * external pressure or rigid timelines. Particularly important for
 * neurodivergent learners who need flexible, personalized pacing.
 *
 * Features:
 * - User-controlled progression speed
 * - No forced advancement
 * - Flexible completion timelines
 * - Pause/resume capabilities
 * - Mastery-based progression
 * - Custom speed settings
 * - Readiness indicators
 * - Self-assessment tools
 */

export type PacingMode =
  | 'self-directed'
  | 'mastery-based'
  | 'time-flexible'
  | 'milestone-based'
  | 'custom';

export type ProgressionStyle =
  | 'when-ready'
  | 'automatic-suggest'
  | 'manual-only'
  | 'hybrid';

export type ReadinessLevel = 'not-ready' | 'practicing' | 'ready' | 'mastered';

export interface SelfPacingSettings {
  mode: PacingMode;
  progressionStyle: ProgressionStyle;
  allowUnlimitedRepetition: boolean;
  noDeadlines: boolean;
  pauseAnytime: boolean;
  skipOption: boolean;
  backtrackAllowed: boolean;
  showReadinessIndicator: boolean;
  selfAssessmentEnabled: boolean;
  requireMasteryToAdvance: boolean;
  masteryThreshold: number; // 0-100
  suggestProgressionAfter: number; // sessions
  respectUserDecision: boolean;
}

export interface LessonProgress {
  lessonId: string;
  lessonName: string;
  attemptsCount: number;
  bestScore: number; // 0-100
  averageScore: number; // 0-100
  timeSpent: number; // minutes
  lastAttempt: Date;
  readiness: ReadinessLevel;
  userAssessment?: ReadinessLevel;
  unlocked: boolean;
}

export interface PacingSession {
  id: string;
  lessonId: string;
  startTime: Date;
  endTime?: Date;
  completed: boolean;
  userPaced: boolean;
  pauseCount: number;
  score: number;
  selfAssessedReadiness?: ReadinessLevel;
}

export interface PacingStats {
  totalLessons: number;
  completedLessons: number;
  masteredLessons: number;
  averageAttemptsPerLesson: number;
  currentPace: 'slow' | 'moderate' | 'fast';
  totalPauseTime: number; // minutes
  selfDirectedDecisions: number;
  progressionSuggestionAcceptance: number; // percentage
}

const pacingModes: Array<{
  mode: PacingMode;
  name: string;
  description: string;
  benefits: string[];
}> = [
  {
    mode: 'self-directed',
    name: 'Self-Directed',
    description: 'You decide when to move forward, completely at your own pace',
    benefits: [
      'Complete autonomy',
      'No external pressure',
      'Learn at your speed',
      'Full control',
    ],
  },
  {
    mode: 'mastery-based',
    name: 'Mastery-Based',
    description: 'Progress when you achieve mastery, ensure solid foundation',
    benefits: [
      'Strong fundamentals',
      'Confidence building',
      'Quality learning',
      'No gaps',
    ],
  },
  {
    mode: 'time-flexible',
    name: 'Time-Flexible',
    description: 'No time limits or deadlines, take as long as you need',
    benefits: [
      'Zero pressure',
      'Accommodate life',
      'Prevent burnout',
      'Sustainable',
    ],
  },
  {
    mode: 'milestone-based',
    name: 'Milestone-Based',
    description: 'Set your own milestones and celebrate each achievement',
    benefits: [
      'Clear goals',
      'Motivation',
      'Sense of progress',
      'Personal targets',
    ],
  },
  {
    mode: 'custom',
    name: 'Custom Pacing',
    description: 'Design your own pacing strategy that works for you',
    benefits: [
      'Fully customizable',
      'Adapt to needs',
      'Experiment',
      'Find what works',
    ],
  },
];

const defaultSettings: SelfPacingSettings = {
  mode: 'self-directed',
  progressionStyle: 'when-ready',
  allowUnlimitedRepetition: true,
  noDeadlines: true,
  pauseAnytime: true,
  skipOption: false,
  backtrackAllowed: true,
  showReadinessIndicator: true,
  selfAssessmentEnabled: true,
  requireMasteryToAdvance: false,
  masteryThreshold: 80,
  suggestProgressionAfter: 3,
  respectUserDecision: true,
};

export const useSelfPacing = () => {
  const [settings, setSettings] = useState<SelfPacingSettings>(defaultSettings);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [sessions, setSessions] = useState<PacingSession[]>([]);
  const [stats, setStats] = useState<PacingStats>({
    totalLessons: 0,
    completedLessons: 0,
    masteredLessons: 0,
    averageAttemptsPerLesson: 0,
    currentPace: 'moderate',
    totalPauseTime: 0,
    selfDirectedDecisions: 0,
    progressionSuggestionAcceptance: 0,
  });
  const [currentSession, setCurrentSession] = useState<PacingSession | null>(null);

  const startLesson = useCallback((lessonId: string) => {
    const session: PacingSession = {
      id: `session-${Date.now()}`,
      lessonId,
      startTime: new Date(),
      completed: false,
      userPaced: true,
      pauseCount: 0,
      score: 0,
    };

    setCurrentSession(session);
    setSessions((prev) => [...prev, session]);
  }, []);

  const pauseLesson = useCallback(() => {
    if (!currentSession) return;

    setCurrentSession((prev) =>
      prev ? { ...prev, pauseCount: prev.pauseCount + 1 } : null
    );
  }, [currentSession]);

  const resumeLesson = useCallback(() => {
    // Session continues automatically
  }, []);

  const completeLesson = useCallback(
    (score: number, selfAssessment?: ReadinessLevel) => {
      if (!currentSession) return;

      const endTime = new Date();
      const completedSession: PacingSession = {
        ...currentSession,
        endTime,
        completed: true,
        score,
        selfAssessedReadiness: selfAssessment,
      };

      setSessions((prev) =>
        prev.map((s) => (s.id === currentSession.id ? completedSession : s))
      );

      // Update lesson progress
      updateLessonProgress(currentSession.lessonId, score, selfAssessment);

      setCurrentSession(null);
    },
    [currentSession]
  );

  const updateLessonProgress = useCallback(
    (lessonId: string, score: number, userAssessment?: ReadinessLevel) => {
      setLessonProgress((prev) => {
        const existing = prev.find((p) => p.lessonId === lessonId);

        if (existing) {
          const newAttempts = existing.attemptsCount + 1;
          const newAverage =
            (existing.averageScore * existing.attemptsCount + score) /
            newAttempts;
          const newBest = Math.max(existing.bestScore, score);

          // Determine readiness
          let readiness: ReadinessLevel = 'practicing';
          if (newBest >= settings.masteryThreshold) {
            readiness = 'mastered';
          } else if (newBest >= settings.masteryThreshold * 0.8) {
            readiness = 'ready';
          } else if (newAttempts < 2) {
            readiness = 'practicing';
          }

          return prev.map((p) =>
            p.lessonId === lessonId
              ? {
                  ...p,
                  attemptsCount: newAttempts,
                  averageScore: newAverage,
                  bestScore: newBest,
                  lastAttempt: new Date(),
                  readiness,
                  userAssessment,
                }
              : p
          );
        } else {
          return [
            ...prev,
            {
              lessonId,
              lessonName: `Lesson ${lessonId}`,
              attemptsCount: 1,
              bestScore: score,
              averageScore: score,
              timeSpent: 0,
              lastAttempt: new Date(),
              readiness: score >= settings.masteryThreshold ? 'mastered' : 'practicing',
              userAssessment,
              unlocked: true,
            },
          ];
        }
      });
    },
    [settings.masteryThreshold]
  );

  const assessOwnReadiness = useCallback(
    (lessonId: string, assessment: ReadinessLevel) => {
      setLessonProgress((prev) =>
        prev.map((p) =>
          p.lessonId === lessonId ? { ...p, userAssessment: assessment } : p
        )
      );

      // Track self-directed decision
      setStats((prev) => ({
        ...prev,
        selfDirectedDecisions: prev.selfDirectedDecisions + 1,
      }));
    },
    []
  );

  const repeatLesson = useCallback((lessonId: string) => {
    if (!settings.allowUnlimitedRepetition) return;
    startLesson(lessonId);
  }, [settings.allowUnlimitedRepetition, startLesson]);

  const moveToNextLesson = useCallback(() => {
    // In a real implementation, this would unlock and move to the next lesson
    console.log('Moving to next lesson');
  }, []);

  const backtrackToLesson = useCallback((lessonId: string) => {
    if (!settings.backtrackAllowed) return;
    startLesson(lessonId);
  }, [settings.backtrackAllowed, startLesson]);

  const shouldSuggestProgression = useCallback(
    (lessonId: string): boolean => {
      const progress = lessonProgress.find((p) => p.lessonId === lessonId);
      if (!progress) return false;

      return (
        progress.attemptsCount >= settings.suggestProgressionAfter &&
        progress.readiness === 'ready'
      );
    },
    [lessonProgress, settings.suggestProgressionAfter]
  );

  const canProgressToNext = useCallback(
    (lessonId: string): boolean => {
      if (!settings.requireMasteryToAdvance) return true;

      const progress = lessonProgress.find((p) => p.lessonId === lessonId);
      if (!progress) return false;

      return progress.readiness === 'mastered';
    },
    [lessonProgress, settings.requireMasteryToAdvance]
  );

  const updateSettings = useCallback((updates: Partial<SelfPacingSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetProgress = useCallback(() => {
    setLessonProgress([]);
    setSessions([]);
    setStats({
      totalLessons: 0,
      completedLessons: 0,
      masteredLessons: 0,
      averageAttemptsPerLesson: 0,
      currentPace: 'moderate',
      totalPauseTime: 0,
      selfDirectedDecisions: 0,
      progressionSuggestionAcceptance: 0,
    });
  }, []);

  return {
    settings,
    updateSettings,
    lessonProgress,
    sessions,
    currentSession,
    stats,
    startLesson,
    pauseLesson,
    resumeLesson,
    completeLesson,
    assessOwnReadiness,
    repeatLesson,
    moveToNextLesson,
    backtrackToLesson,
    shouldSuggestProgression,
    canProgressToNext,
    resetProgress,
  };
};

interface SelfPacingControlsProps {
  selfPacing: ReturnType<typeof useSelfPacing>;
}

export const SelfPacingControls: React.FC<SelfPacingControlsProps> = ({
  selfPacing,
}) => {
  const {
    settings,
    updateSettings,
    lessonProgress,
    currentSession,
    stats,
    pauseLesson,
    completeLesson,
    assessOwnReadiness,
    repeatLesson,
  } = selfPacing;

  const [selectedMode, setSelectedMode] = useState<PacingMode>(settings.mode);

  const getReadinessColor = (readiness: ReadinessLevel): string => {
    switch (readiness) {
      case 'mastered':
        return '#4caf50';
      case 'ready':
        return '#8bc34a';
      case 'practicing':
        return '#ff9800';
      case 'not-ready':
        return '#f44336';
    }
  };

  const getReadinessIcon = (readiness: ReadinessLevel): string => {
    switch (readiness) {
      case 'mastered':
        return '✓';
      case 'ready':
        return '→';
      case 'practicing':
        return '○';
      case 'not-ready':
        return '...';
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
      <h2 style={{ marginBottom: '20px' }}>Self-Paced Learning</h2>

      {/* Current Session */}
      {currentSession && (
        <div
          style={{
            marginBottom: '24px',
            padding: '20px',
            background: '#e3f2fd',
            border: '2px solid #2196f3',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ marginBottom: '12px' }}>Current Session</h3>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Lesson: {currentSession.lessonId}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Pauses: {currentSession.pauseCount}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {settings.pauseAnytime && (
              <button
                onClick={pauseLesson}
                style={{
                  padding: '10px 20px',
                  background: '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                ⏸️ Pause
              </button>
            )}
            <button
              onClick={() => completeLesson(85, 'ready')}
              style={{
                padding: '10px 20px',
                background: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              ✓ Complete
            </button>
          </div>
        </div>
      )}

      {/* Pacing Mode Selection */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>Pacing Mode</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '12px',
          }}
        >
          {pacingModes.map((modeInfo) => (
            <motion.div
              key={modeInfo.mode}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setSelectedMode(modeInfo.mode);
                updateSettings({ mode: modeInfo.mode });
              }}
              style={{
                padding: '16px',
                background:
                  selectedMode === modeInfo.mode ? '#e3f2fd' : 'white',
                border:
                  selectedMode === modeInfo.mode
                    ? '3px solid #2196f3'
                    : '2px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {modeInfo.name}
              </div>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                {modeInfo.description}
              </div>
              <div style={{ fontSize: '11px', color: '#888' }}>
                ✓ {modeInfo.benefits.join(' • ')}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lesson Progress */}
      {lessonProgress.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '12px' }}>Your Progress</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {lessonProgress.map((progress) => (
              <div
                key={progress.lessonId}
                style={{
                  padding: '16px',
                  background: 'white',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {progress.lessonName}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      {progress.attemptsCount} attempts • Best: {progress.bestScore}
                      % • Avg: {Math.round(progress.averageScore)}%
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '8px 16px',
                      background: getReadinessColor(progress.readiness),
                      color: 'white',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      fontSize: '14px',
                    }}
                  >
                    {getReadinessIcon(progress.readiness)} {progress.readiness}
                  </div>
                </div>

                {settings.selfAssessmentEnabled && (
                  <div style={{ marginBottom: '12px' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        marginBottom: '8px',
                        fontWeight: '500',
                      }}
                    >
                      How ready do you feel?
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {(['not-ready', 'practicing', 'ready', 'mastered'] as ReadinessLevel[]).map(
                        (level) => (
                          <button
                            key={level}
                            onClick={() =>
                              assessOwnReadiness(progress.lessonId, level)
                            }
                            style={{
                              padding: '6px 12px',
                              background:
                                progress.userAssessment === level
                                  ? getReadinessColor(level)
                                  : '#f5f5f5',
                              color:
                                progress.userAssessment === level
                                  ? 'white'
                                  : '#666',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            {level}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {settings.allowUnlimitedRepetition && (
                  <button
                    onClick={() => repeatLesson(progress.lessonId)}
                    style={{
                      padding: '8px 16px',
                      background: '#2196f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    🔄 Practice Again
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
        <h3 style={{ marginBottom: '16px' }}>Your Pacing Statistics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Completed</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#4caf50' }}>
              {stats.completedLessons}
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>
              {stats.masteredLessons} mastered
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Your Pace</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2196f3' }}>
              {stats.currentPace}
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>learning speed</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Self-Directed</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff9800' }}>
              {stats.selfDirectedDecisions}
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>your choices</div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div
        style={{
          padding: '16px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '12px' }}>Pacing Settings</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.allowUnlimitedRepetition}
              onChange={(e) =>
                updateSettings({ allowUnlimitedRepetition: e.target.checked })
              }
            />
            Unlimited repetition
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.noDeadlines}
              onChange={(e) => updateSettings({ noDeadlines: e.target.checked })}
            />
            No deadlines
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.pauseAnytime}
              onChange={(e) => updateSettings({ pauseAnytime: e.target.checked })}
            />
            Pause anytime
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.backtrackAllowed}
              onChange={(e) =>
                updateSettings({ backtrackAllowed: e.target.checked })
              }
            />
            Allow backtracking
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.selfAssessmentEnabled}
              onChange={(e) =>
                updateSettings({ selfAssessmentEnabled: e.target.checked })
              }
            />
            Self-assessment
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.showReadinessIndicator}
              onChange={(e) =>
                updateSettings({ showReadinessIndicator: e.target.checked })
              }
            />
            Show readiness
          </label>
        </div>

        <div style={{ marginTop: '16px' }}>
          <label
            style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}
          >
            Mastery Threshold: {settings.masteryThreshold}%
          </label>
          <input
            type="range"
            min="60"
            max="100"
            value={settings.masteryThreshold}
            onChange={(e) =>
              updateSettings({ masteryThreshold: parseInt(e.target.value) })
            }
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default SelfPacingControls;
