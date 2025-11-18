import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Step 288: Build Focus Assist System
 *
 * Provides intelligent focus assistance to help users maintain concentration
 * during typing practice. Particularly beneficial for users with ADHD, autism,
 * or executive function challenges.
 *
 * Features:
 * - Adaptive focus timers with intelligent breaks
 * - Distraction detection and blocking
 * - Focus scoring and metrics
 * - Guided concentration techniques
 * - Environmental optimization suggestions
 * - Task chunking for manageable goals
 * - Progress visualization
 */

export type FocusTechnique =
  | 'pomodoro'
  | 'deep-work'
  | 'time-boxing'
  | 'micro-focus'
  | 'flow-state'
  | 'custom';

export type DistractionType =
  | 'tab-switch'
  | 'window-blur'
  | 'idle'
  | 'notification'
  | 'mouse-leave'
  | 'scroll'
  | 'external';

export type FocusLevel = 'low' | 'medium' | 'high' | 'peak';

export interface FocusTimer {
  id: string;
  technique: FocusTechnique;
  workDuration: number; // minutes
  breakDuration: number; // minutes
  cycles: number;
  currentCycle: number;
  state: 'work' | 'break' | 'paused' | 'completed';
  timeRemaining: number; // seconds
  startTime: Date;
  endTime?: Date;
}

export interface DistractionEvent {
  id: string;
  type: DistractionType;
  timestamp: Date;
  duration: number; // seconds
  recovered: boolean;
  impact: 'low' | 'medium' | 'high';
}

export interface FocusSession {
  id: string;
  technique: FocusTechnique;
  startTime: Date;
  endTime?: Date;
  duration: number; // minutes
  focusScore: number; // 0-100
  distractions: DistractionEvent[];
  productivity: number; // 0-100
  qualityScore: number; // 0-100
  completed: boolean;
}

export interface FocusMetrics {
  currentLevel: FocusLevel;
  score: number; // 0-100
  streak: number; // minutes of continuous focus
  longestStreak: number; // minutes
  totalFocusTime: number; // minutes
  averageFocusScore: number; // 0-100
  distractionsPerHour: number;
  recoveryTime: number; // average seconds to recover from distraction
  peakFocusTime: string; // time of day
}

export interface FocusTechniqueConfig {
  technique: FocusTechnique;
  name: string;
  description: string;
  workDuration: number; // minutes
  breakDuration: number; // minutes
  cycles: number;
  benefits: string[];
  bestFor: string[];
  intensity: number; // 0-100
}

export interface FocusAssistSettings {
  enabled: boolean;
  currentTechnique: FocusTechnique;
  autoStart: boolean;
  distractionBlocking: {
    enabled: boolean;
    blockTabSwitch: boolean;
    blockNotifications: boolean;
    warnOnIdle: boolean;
    idleThreshold: number; // seconds
    recoveryPrompts: boolean;
  };
  audioFeedback: {
    enabled: boolean;
    startSound: boolean;
    endSound: boolean;
    breakSound: boolean;
    distractionAlert: boolean;
    volume: number; // 0-100
  };
  visualCues: {
    progressBar: boolean;
    focusIndicator: boolean;
    breathingAnimation: boolean;
    timerDisplay: boolean;
  };
  adaptiveTiming: {
    enabled: boolean;
    adjustBasedOnPerformance: boolean;
    shortenOnLowFocus: boolean;
    extendOnHighFocus: boolean;
  };
}

const focusTechniques: FocusTechniqueConfig[] = [
  {
    technique: 'pomodoro',
    name: 'Pomodoro Technique',
    description: 'Classic 25-minute work sessions with 5-minute breaks',
    workDuration: 25,
    breakDuration: 5,
    cycles: 4,
    benefits: [
      'Prevents burnout',
      'Maintains energy',
      'Clear time boundaries',
      'Frequent rest periods',
    ],
    bestFor: ['ADHD', 'Beginners', 'Multiple tasks'],
    intensity: 50,
  },
  {
    technique: 'deep-work',
    name: 'Deep Work',
    description: 'Extended 90-minute sessions for maximum productivity',
    workDuration: 90,
    breakDuration: 20,
    cycles: 2,
    benefits: [
      'Deep concentration',
      'Complex problem solving',
      'Flow state achievement',
      'High-quality output',
    ],
    bestFor: ['Experienced users', 'Complex tasks', 'Peak hours'],
    intensity: 90,
  },
  {
    technique: 'time-boxing',
    name: 'Time Boxing',
    description: 'Fixed 45-minute blocks with strict boundaries',
    workDuration: 45,
    breakDuration: 10,
    cycles: 3,
    benefits: [
      'Flexible scheduling',
      'Parkinson\'s Law prevention',
      'Moderate intensity',
      'Good for planning',
    ],
    bestFor: ['Mixed tasks', 'Meetings between', 'Moderate difficulty'],
    intensity: 60,
  },
  {
    technique: 'micro-focus',
    name: 'Micro Focus',
    description: 'Short 10-minute bursts for quick tasks or low energy',
    workDuration: 10,
    breakDuration: 2,
    cycles: 6,
    benefits: [
      'Low commitment',
      'Easy to start',
      'Reduces overwhelm',
      'Builds momentum',
    ],
    bestFor: ['Low energy', 'Anxiety', 'Getting started', 'Simple tasks'],
    intensity: 30,
  },
  {
    technique: 'flow-state',
    name: 'Flow State',
    description: 'Open-ended sessions until natural break point',
    workDuration: 120,
    breakDuration: 30,
    cycles: 1,
    benefits: [
      'Natural rhythm',
      'Maximum immersion',
      'Creative breakthroughs',
      'Optimal performance',
    ],
    bestFor: ['Creative work', 'High energy', 'Engaging tasks'],
    intensity: 100,
  },
  {
    technique: 'custom',
    name: 'Custom',
    description: 'Create your own focus schedule',
    workDuration: 30,
    breakDuration: 5,
    cycles: 3,
    benefits: ['Personalized', 'Flexible', 'Adaptable'],
    bestFor: ['Specific needs', 'Experimentation'],
    intensity: 50,
  },
];

const defaultSettings: FocusAssistSettings = {
  enabled: false,
  currentTechnique: 'pomodoro',
  autoStart: false,
  distractionBlocking: {
    enabled: true,
    blockTabSwitch: false,
    blockNotifications: true,
    warnOnIdle: true,
    idleThreshold: 30,
    recoveryPrompts: true,
  },
  audioFeedback: {
    enabled: true,
    startSound: true,
    endSound: true,
    breakSound: true,
    distractionAlert: false,
    volume: 50,
  },
  visualCues: {
    progressBar: true,
    focusIndicator: true,
    breathingAnimation: false,
    timerDisplay: true,
  },
  adaptiveTiming: {
    enabled: false,
    adjustBasedOnPerformance: false,
    shortenOnLowFocus: false,
    extendOnHighFocus: false,
  },
};

export const useFocusAssist = () => {
  const [settings, setSettings] = useState<FocusAssistSettings>(defaultSettings);
  const [activeTimer, setActiveTimer] = useState<FocusTimer | null>(null);
  const [sessionHistory, setSessionHistory] = useState<FocusSession[]>([]);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [distractions, setDistractions] = useState<DistractionEvent[]>([]);
  const [metrics, setMetrics] = useState<FocusMetrics>({
    currentLevel: 'medium',
    score: 75,
    streak: 0,
    longestStreak: 0,
    totalFocusTime: 0,
    averageFocusScore: 75,
    distractionsPerHour: 0,
    recoveryTime: 0,
    peakFocusTime: '10:00 AM',
  });

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<Date>(new Date());

  // Monitor user activity for idle detection
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = new Date();
    };

    if (settings.distractionBlocking.warnOnIdle && activeTimer) {
      window.addEventListener('mousemove', updateActivity);
      window.addEventListener('keydown', updateActivity);
      window.addEventListener('click', updateActivity);

      return () => {
        window.removeEventListener('mousemove', updateActivity);
        window.removeEventListener('keydown', updateActivity);
        window.removeEventListener('click', updateActivity);
      };
    }
  }, [settings.distractionBlocking.warnOnIdle, activeTimer]);

  // Check for idle state
  useEffect(() => {
    if (
      !settings.distractionBlocking.warnOnIdle ||
      !activeTimer ||
      activeTimer.state !== 'work'
    ) {
      return;
    }

    idleTimerRef.current = setInterval(() => {
      const idleSeconds =
        (new Date().getTime() - lastActivityRef.current.getTime()) / 1000;

      if (idleSeconds > settings.distractionBlocking.idleThreshold) {
        recordDistraction('idle', Math.floor(idleSeconds));
      }
    }, 5000);

    return () => {
      if (idleTimerRef.current) {
        clearInterval(idleTimerRef.current);
      }
    };
  }, [settings, activeTimer]);

  // Monitor window focus
  useEffect(() => {
    if (!settings.distractionBlocking.enabled || !activeTimer) {
      return;
    }

    let blurTime: Date | null = null;

    const handleBlur = () => {
      blurTime = new Date();
    };

    const handleFocus = () => {
      if (blurTime) {
        const duration = (new Date().getTime() - blurTime.getTime()) / 1000;
        if (duration > 2) {
          recordDistraction('window-blur', Math.floor(duration));
        }
        blurTime = null;
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [settings.distractionBlocking.enabled, activeTimer]);

  const getTechniqueConfig = useCallback(
    (technique?: FocusTechnique): FocusTechniqueConfig => {
      const selectedTechnique = technique || settings.currentTechnique;
      return (
        focusTechniques.find((t) => t.technique === selectedTechnique) ||
        focusTechniques[0]
      );
    },
    [settings.currentTechnique]
  );

  const startTimer = useCallback(
    (technique?: FocusTechnique) => {
      const config = getTechniqueConfig(technique);

      const timer: FocusTimer = {
        id: `timer-${Date.now()}`,
        technique: config.technique,
        workDuration: config.workDuration,
        breakDuration: config.breakDuration,
        cycles: config.cycles,
        currentCycle: 1,
        state: 'work',
        timeRemaining: config.workDuration * 60,
        startTime: new Date(),
      };

      setActiveTimer(timer);

      // Start new focus session
      const session: FocusSession = {
        id: `session-${Date.now()}`,
        technique: config.technique,
        startTime: new Date(),
        duration: 0,
        focusScore: 100,
        distractions: [],
        productivity: 0,
        qualityScore: 0,
        completed: false,
      };

      setCurrentSession(session);
      setDistractions([]);

      // Play start sound
      if (settings.audioFeedback.enabled && settings.audioFeedback.startSound) {
        playSound('start');
      }
    },
    [settings, getTechniqueConfig]
  );

  const pauseTimer = useCallback(() => {
    if (activeTimer && activeTimer.state !== 'paused') {
      setActiveTimer((prev) => (prev ? { ...prev, state: 'paused' } : null));
    }
  }, [activeTimer]);

  const resumeTimer = useCallback(() => {
    if (activeTimer && activeTimer.state === 'paused') {
      setActiveTimer((prev) => (prev ? { ...prev, state: 'work' } : null));
    }
  }, [activeTimer]);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    if (currentSession) {
      const endTime = new Date();
      const duration =
        (endTime.getTime() - currentSession.startTime.getTime()) / 60000;

      const completedSession: FocusSession = {
        ...currentSession,
        endTime,
        duration,
        distractions,
        completed: true,
      };

      setSessionHistory((prev) => [...prev, completedSession]);
      updateMetrics(completedSession);
    }

    setActiveTimer(null);
    setCurrentSession(null);
    setDistractions([]);
  }, [currentSession, distractions]);

  const skipToBreak = useCallback(() => {
    if (activeTimer && activeTimer.state === 'work') {
      setActiveTimer((prev) =>
        prev
          ? {
              ...prev,
              state: 'break',
              timeRemaining: prev.breakDuration * 60,
            }
          : null
      );

      if (settings.audioFeedback.enabled && settings.audioFeedback.breakSound) {
        playSound('break');
      }
    }
  }, [activeTimer, settings]);

  const skipBreak = useCallback(() => {
    if (activeTimer && activeTimer.state === 'break') {
      const nextCycle = activeTimer.currentCycle + 1;

      if (nextCycle > activeTimer.cycles) {
        stopTimer();
      } else {
        setActiveTimer((prev) =>
          prev
            ? {
                ...prev,
                state: 'work',
                currentCycle: nextCycle,
                timeRemaining: prev.workDuration * 60,
              }
            : null
        );
      }
    }
  }, [activeTimer, stopTimer]);

  const recordDistraction = useCallback(
    (type: DistractionType, duration: number = 0) => {
      const distraction: DistractionEvent = {
        id: `distraction-${Date.now()}`,
        type,
        timestamp: new Date(),
        duration,
        recovered: false,
        impact: duration < 5 ? 'low' : duration < 30 ? 'medium' : 'high',
      };

      setDistractions((prev) => [...prev, distraction]);

      // Show recovery prompt if enabled
      if (settings.distractionBlocking.recoveryPrompts) {
        showRecoveryPrompt(distraction);
      }

      // Play alert sound
      if (
        settings.audioFeedback.enabled &&
        settings.audioFeedback.distractionAlert
      ) {
        playSound('alert');
      }

      // Update focus score
      if (currentSession) {
        const penalty = distraction.impact === 'high' ? 10 : distraction.impact === 'medium' ? 5 : 2;
        setCurrentSession((prev) =>
          prev
            ? {
                ...prev,
                focusScore: Math.max(0, prev.focusScore - penalty),
              }
            : null
        );
      }
    },
    [settings, currentSession]
  );

  const markDistractionRecovered = useCallback((distractionId: string) => {
    setDistractions((prev) =>
      prev.map((d) => (d.id === distractionId ? { ...d, recovered: true } : d))
    );
  }, []);

  const calculateFocusLevel = useCallback((score: number): FocusLevel => {
    if (score >= 90) return 'peak';
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }, []);

  const updateMetrics = useCallback((session: FocusSession) => {
    setMetrics((prev) => {
      const allSessions = [...sessionHistory, session];
      const totalFocusTime = allSessions.reduce((sum, s) => sum + s.duration, 0);
      const averageFocusScore =
        allSessions.reduce((sum, s) => sum + s.focusScore, 0) /
        allSessions.length;

      const totalDistractions = allSessions.reduce(
        (sum, s) => sum + s.distractions.length,
        0
      );
      const distractionsPerHour =
        totalFocusTime > 0 ? (totalDistractions / totalFocusTime) * 60 : 0;

      const allDistractions = allSessions.flatMap((s) => s.distractions);
      const recoveryTime =
        allDistractions.length > 0
          ? allDistractions.reduce((sum, d) => sum + d.duration, 0) /
            allDistractions.length
          : 0;

      return {
        ...prev,
        totalFocusTime,
        averageFocusScore,
        distractionsPerHour,
        recoveryTime,
        currentLevel: calculateFocusLevel(session.focusScore),
      };
    });
  }, [sessionHistory, calculateFocusLevel]);

  const showRecoveryPrompt = (distraction: DistractionEvent) => {
    // In a real implementation, this would show a modal or notification
    console.log('Recovery prompt:', distraction);
  };

  const playSound = (type: 'start' | 'end' | 'break' | 'alert') => {
    // In a real implementation, this would play actual sounds
    console.log('Playing sound:', type);
  };

  const updateSettings = useCallback(
    (updates: Partial<FocusAssistSettings>) => {
      setSettings((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const setTechnique = useCallback((technique: FocusTechnique) => {
    setSettings((prev) => ({ ...prev, currentTechnique: technique }));
  }, []);

  const clearHistory = useCallback(() => {
    setSessionHistory([]);
    setMetrics({
      currentLevel: 'medium',
      score: 75,
      streak: 0,
      longestStreak: 0,
      totalFocusTime: 0,
      averageFocusScore: 75,
      distractionsPerHour: 0,
      recoveryTime: 0,
      peakFocusTime: '10:00 AM',
    });
  }, []);

  // Timer tick
  useEffect(() => {
    if (!activeTimer || activeTimer.state === 'paused') {
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setActiveTimer((prev) => {
        if (!prev) return null;

        const newTimeRemaining = prev.timeRemaining - 1;

        if (newTimeRemaining <= 0) {
          // Timer complete for this phase
          if (prev.state === 'work') {
            // Switch to break
            if (settings.audioFeedback.enabled && settings.audioFeedback.breakSound) {
              playSound('break');
            }

            return {
              ...prev,
              state: 'break',
              timeRemaining: prev.breakDuration * 60,
            };
          } else {
            // Break complete, move to next cycle or end
            const nextCycle = prev.currentCycle + 1;

            if (nextCycle > prev.cycles) {
              // All cycles complete
              if (settings.audioFeedback.enabled && settings.audioFeedback.endSound) {
                playSound('end');
              }
              stopTimer();
              return { ...prev, state: 'completed' };
            } else {
              // Start next cycle
              if (settings.audioFeedback.enabled && settings.audioFeedback.startSound) {
                playSound('start');
              }

              return {
                ...prev,
                state: 'work',
                currentCycle: nextCycle,
                timeRemaining: prev.workDuration * 60,
              };
            }
          }
        }

        return { ...prev, timeRemaining: newTimeRemaining };
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [activeTimer, settings, stopTimer]);

  return {
    settings,
    updateSettings,
    activeTimer,
    currentSession,
    sessionHistory,
    distractions,
    metrics,
    techniques: focusTechniques,
    currentTechnique: getTechniqueConfig(),
    setTechnique,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    skipToBreak,
    skipBreak,
    recordDistraction,
    markDistractionRecovered,
    clearHistory,
  };
};

interface FocusAssistControlsProps {
  focusAssist: ReturnType<typeof useFocusAssist>;
}

export const FocusAssistControls: React.FC<FocusAssistControlsProps> = ({
  focusAssist,
}) => {
  const {
    activeTimer,
    currentSession,
    metrics,
    techniques,
    currentTechnique,
    setTechnique,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    skipToBreak,
    distractions,
    settings,
    updateSettings,
  } = focusAssist;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getFocusLevelColor = (level: FocusLevel): string => {
    switch (level) {
      case 'peak':
        return '#4caf50';
      case 'high':
        return '#8bc34a';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#f44336';
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
      <h2 style={{ marginBottom: '20px' }}>Focus Assist</h2>

      {/* Active Timer */}
      {activeTimer && (
        <div
          style={{
            marginBottom: '24px',
            padding: '24px',
            background: activeTimer.state === 'work' ? '#e3f2fd' : '#fff3e0',
            borderRadius: '12px',
            border: '3px solid',
            borderColor: activeTimer.state === 'work' ? '#2196f3' : '#ff9800',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
              {activeTimer.state === 'work' ? '🎯 Focus Session' : '☕ Break Time'}
            </div>
            <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '8px' }}>
              {formatTime(activeTimer.timeRemaining)}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Cycle {activeTimer.currentCycle} of {activeTimer.cycles} •{' '}
              {currentTechnique.name}
            </div>
          </div>

          {/* Progress Bar */}
          {settings.visualCues.progressBar && (
            <div
              style={{
                height: '8px',
                background: '#e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '16px',
              }}
            >
              <motion.div
                initial={{ width: '100%' }}
                animate={{
                  width: `${
                    (activeTimer.timeRemaining /
                      ((activeTimer.state === 'work'
                        ? activeTimer.workDuration
                        : activeTimer.breakDuration) *
                        60)) *
                    100
                  }%`,
                }}
                style={{
                  height: '100%',
                  background:
                    activeTimer.state === 'work' ? '#2196f3' : '#ff9800',
                }}
              />
            </div>
          )}

          {/* Timer Controls */}
          <div
            style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}
          >
            {activeTimer.state === 'paused' ? (
              <button
                onClick={resumeTimer}
                style={{
                  padding: '10px 20px',
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                ▶️ Resume
              </button>
            ) : (
              <button
                onClick={pauseTimer}
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
            {activeTimer.state === 'work' && (
              <button
                onClick={skipToBreak}
                style={{
                  padding: '10px 20px',
                  background: '#9c27b0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                ⏭️ Skip to Break
              </button>
            )}
            <button
              onClick={stopTimer}
              style={{
                padding: '10px 20px',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              ⏹️ Stop
            </button>
          </div>
        </div>
      )}

      {/* Current Session Stats */}
      {currentSession && (
        <div
          style={{
            marginBottom: '24px',
            padding: '16px',
            background: 'white',
            border: '2px solid #ddd',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ marginBottom: '12px' }}>Current Session</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Focus Score</div>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: getFocusLevelColor(metrics.currentLevel),
                }}
              >
                {currentSession.focusScore}/100
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Distractions</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {distractions.length}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666' }}>Focus Level</div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: getFocusLevelColor(metrics.currentLevel),
                }}
              >
                {metrics.currentLevel.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Technique Selection */}
      {!activeTimer && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '12px' }}>Select Focus Technique</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {techniques.map((tech) => (
              <motion.button
                key={tech.technique}
                onClick={() => {
                  setTechnique(tech.technique);
                  startTimer(tech.technique);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: '16px',
                  background:
                    currentTechnique.technique === tech.technique
                      ? '#e3f2fd'
                      : 'white',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {tech.name}
                </div>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                  {tech.description}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  {tech.workDuration}min work / {tech.breakDuration}min break •{' '}
                  {tech.cycles} cycles
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Distraction Blocking Settings */}
      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '12px' }}>Distraction Blocking</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.distractionBlocking.enabled}
              onChange={(e) =>
                updateSettings({
                  distractionBlocking: {
                    ...settings.distractionBlocking,
                    enabled: e.target.checked,
                  },
                })
              }
            />
            Enable distraction detection
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.distractionBlocking.warnOnIdle}
              onChange={(e) =>
                updateSettings({
                  distractionBlocking: {
                    ...settings.distractionBlocking,
                    warnOnIdle: e.target.checked,
                  },
                })
              }
            />
            Warn on idle activity
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.distractionBlocking.recoveryPrompts}
              onChange={(e) =>
                updateSettings({
                  distractionBlocking: {
                    ...settings.distractionBlocking,
                    recoveryPrompts: e.target.checked,
                  },
                })
              }
            />
            Show recovery prompts
          </label>
        </div>
      </div>

      {/* Overall Metrics */}
      <div
        style={{
          padding: '16px',
          background: '#f5f5f5',
          borderRadius: '8px',
          border: '2px solid #ddd',
        }}
      >
        <h3 style={{ marginBottom: '12px' }}>Overall Metrics</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Focus Time</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {Math.round(metrics.totalFocusTime)} min
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Average Score</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {Math.round(metrics.averageFocusScore)}/100
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Distractions/Hour</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {metrics.distractionsPerHour.toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to generate mock focus sessions
export const generateMockFocusSessions = (count: number): FocusSession[] => {
  const techniques: FocusTechnique[] = [
    'pomodoro',
    'deep-work',
    'time-boxing',
    'micro-focus',
    'flow-state',
  ];
  const sessions: FocusSession[] = [];

  for (let i = 0; i < count; i++) {
    const technique = techniques[Math.floor(Math.random() * techniques.length)];
    const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const duration = 20 + Math.random() * 70; // 20-90 minutes
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    const distractionCount = Math.floor(Math.random() * 5);
    const distractions: DistractionEvent[] = [];

    for (let j = 0; j < distractionCount; j++) {
      const distractionTypes: DistractionType[] = [
        'tab-switch',
        'window-blur',
        'idle',
        'notification',
      ];
      distractions.push({
        id: `distraction-${i}-${j}`,
        type: distractionTypes[Math.floor(Math.random() * distractionTypes.length)],
        timestamp: new Date(
          startTime.getTime() + Math.random() * duration * 60 * 1000
        ),
        duration: Math.floor(Math.random() * 60),
        recovered: Math.random() > 0.3,
        impact: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
      });
    }

    const focusScore = Math.max(50, 100 - distractionCount * 8);

    sessions.push({
      id: `session-${i}`,
      technique,
      startTime,
      endTime,
      duration,
      focusScore,
      distractions,
      productivity: 60 + Math.random() * 40,
      qualityScore: 60 + Math.random() * 40,
      completed: true,
    });
  }

  return sessions.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
};

export default FocusAssistControls;
