import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * Step 295: Create Anxiety Features
 *
 * Provides specialized features to help users manage typing-related anxiety,
 * performance pressure, and stress. Particularly helpful for users with
 * anxiety disorders, perfectionism, or test anxiety.
 *
 * Features:
 * - Anxiety reduction techniques
 * - Pressure-free practice modes
 * - Calming interventions
 * - Progress hiding options
 * - Comparison elimination
 * - Self-paced learning
 * - Stress monitoring
 * - Relaxation prompts
 */

export type AnxietyLevel = 'none' | 'low' | 'moderate' | 'high' | 'severe';

export type AnxietyTrigger =
  | 'timer'
  | 'errors'
  | 'speed-pressure'
  | 'accuracy-pressure'
  | 'comparison'
  | 'performance-tracking'
  | 'test-mode'
  | 'leaderboards';

export type CalmingTechnique =
  | 'breathing'
  | 'affirmations'
  | 'progressive-relaxation'
  | 'grounding'
  | 'mindfulness'
  | 'visualization';

export interface AnxietySettings {
  enabled: boolean;
  currentLevel: AnxietyLevel;
  identifiedTriggers: AnxietyTrigger[];
  hideMetrics: {
    speed: boolean;
    accuracy: boolean;
    errors: boolean;
    timer: boolean;
    progress: boolean;
  };
  pressureFree: {
    enabled: boolean;
    noTimeLimits: boolean;
    noGoals: boolean;
    noComparisons: boolean;
    noLeaderboards: boolean;
    hideAllStats: boolean;
  };
  calmingInterventions: {
    enabled: boolean;
    frequency: 'low' | 'medium' | 'high';
    techniques: CalmingTechnique[];
    autoTrigger: boolean;
    triggerThreshold: AnxietyLevel;
  };
  safeMode: {
    enabled: boolean;
    gentleLanguage: boolean;
    removeNegativeWords: boolean;
    emphasizeEffort: boolean;
    hideFailureMessages: boolean;
  };
  selfPaced: {
    enabled: boolean;
    pauseAnytime: boolean;
    skipAnytime: boolean;
    noDeadlines: boolean;
    flexibleGoals: boolean;
  };
}

export interface AnxietyProfile {
  triggers: AnxietyTrigger[];
  averageLevel: AnxietyLevel;
  peakLevel: AnxietyLevel;
  managementStrategies: CalmingTechnique[];
  successfulTechniques: CalmingTechnique[];
  avoidancePatterns: string[];
  progressNotes: string[];
}

export interface CalmingExercise {
  id: string;
  technique: CalmingTechnique;
  title: string;
  description: string;
  duration: number; // seconds
  steps: string[];
  benefits: string[];
  icon: string;
}

export interface AnxietySession {
  id: string;
  startTime: Date;
  endTime?: Date;
  startLevel: AnxietyLevel;
  endLevel: AnxietyLevel;
  triggersEncountered: AnxietyTrigger[];
  interventionsUsed: CalmingTechnique[];
  completed: boolean;
  improvementScore: number; // -100 to 100
}

const calmingExercises: CalmingExercise[] = [
  {
    id: 'box-breathing',
    technique: 'breathing',
    title: 'Box Breathing',
    description: 'Simple 4-4-4-4 breathing pattern to calm your nervous system',
    duration: 60,
    steps: [
      'Breathe in for 4 counts',
      'Hold for 4 counts',
      'Breathe out for 4 counts',
      'Hold for 4 counts',
      'Repeat 3-5 times',
    ],
    benefits: ['Reduces stress', 'Lowers heart rate', 'Increases focus'],
    icon: '🌬️',
  },
  {
    id: 'positive-affirmations',
    technique: 'affirmations',
    title: 'Positive Affirmations',
    description: 'Remind yourself of your capabilities and worth',
    duration: 30,
    steps: [
      'I am capable of learning',
      'Mistakes are part of growth',
      'I am doing my best',
      'Progress, not perfection',
      'I am enough as I am',
    ],
    benefits: ['Builds confidence', 'Reduces negative self-talk', 'Improves mood'],
    icon: '💙',
  },
  {
    id: '5-4-3-2-1-grounding',
    technique: 'grounding',
    title: '5-4-3-2-1 Grounding',
    description: 'Ground yourself in the present moment using your senses',
    duration: 90,
    steps: [
      'Notice 5 things you can see',
      'Notice 4 things you can touch',
      'Notice 3 things you can hear',
      'Notice 2 things you can smell',
      'Notice 1 thing you can taste',
    ],
    benefits: ['Reduces anxiety', 'Brings you to present', 'Calms racing thoughts'],
    icon: '🌍',
  },
  {
    id: 'progressive-muscle-relaxation',
    technique: 'progressive-relaxation',
    title: 'Progressive Muscle Relaxation',
    description: 'Release physical tension through systematic muscle relaxation',
    duration: 120,
    steps: [
      'Tense your hands, then release',
      'Tense your arms, then release',
      'Tense your shoulders, then release',
      'Tense your neck, then release',
      'Notice the difference between tension and relaxation',
    ],
    benefits: ['Releases muscle tension', 'Reduces physical anxiety', 'Improves body awareness'],
    icon: '🧘',
  },
  {
    id: 'mindful-observation',
    technique: 'mindfulness',
    title: 'Mindful Observation',
    description: 'Practice non-judgmental awareness of the present',
    duration: 60,
    steps: [
      'Notice your breath without changing it',
      'Observe thoughts without judgment',
      'Feel your body in the chair',
      'Notice sounds without labeling',
      'Return gently when mind wanders',
    ],
    benefits: ['Increases calm', 'Reduces rumination', 'Improves focus'],
    icon: '🧠',
  },
  {
    id: 'safe-place-visualization',
    technique: 'visualization',
    title: 'Safe Place Visualization',
    description: 'Imagine a peaceful, safe environment',
    duration: 90,
    steps: [
      'Close your eyes',
      'Picture your safe, calm place',
      'Notice the details - colors, sounds, feelings',
      'Feel the safety and peace',
      'Stay here as long as you need',
    ],
    benefits: ['Creates sense of safety', 'Reduces fear', 'Provides mental escape'],
    icon: '🏝️',
  },
];

const defaultSettings: AnxietySettings = {
  enabled: true,
  currentLevel: 'low',
  identifiedTriggers: [],
  hideMetrics: {
    speed: false,
    accuracy: false,
    errors: false,
    timer: false,
    progress: false,
  },
  pressureFree: {
    enabled: false,
    noTimeLimits: false,
    noGoals: false,
    noComparisons: true,
    noLeaderboards: true,
    hideAllStats: false,
  },
  calmingInterventions: {
    enabled: true,
    frequency: 'medium',
    techniques: ['breathing', 'affirmations'],
    autoTrigger: true,
    triggerThreshold: 'moderate',
  },
  safeMode: {
    enabled: true,
    gentleLanguage: true,
    removeNegativeWords: true,
    emphasizeEffort: true,
    hideFailureMessages: true,
  },
  selfPaced: {
    enabled: true,
    pauseAnytime: true,
    skipAnytime: true,
    noDeadlines: true,
    flexibleGoals: true,
  },
};

export const useAnxietyFeatures = () => {
  const [settings, setSettings] = useState<AnxietySettings>(defaultSettings);
  const [sessions, setSessions] = useState<AnxietySession[]>([]);
  const [profile, setProfile] = useState<AnxietyProfile>({
    triggers: [],
    averageLevel: 'low',
    peakLevel: 'moderate',
    managementStrategies: ['breathing'],
    successfulTechniques: ['breathing', 'affirmations'],
    avoidancePatterns: [],
    progressNotes: [],
  });
  const [activeCalmingExercise, setActiveCalmingExercise] = useState<CalmingExercise | null>(null);

  const assessAnxietyLevel = useCallback((): AnxietyLevel => {
    // In a real implementation, this might use heart rate, typing patterns, etc.
    return settings.currentLevel;
  }, [settings.currentLevel]);

  const shouldTriggerIntervention = useCallback(
    (currentLevel: AnxietyLevel): boolean => {
      if (!settings.calmingInterventions.enabled) return false;
      if (!settings.calmingInterventions.autoTrigger) return false;

      const levels: AnxietyLevel[] = ['none', 'low', 'moderate', 'high', 'severe'];
      const currentIndex = levels.indexOf(currentLevel);
      const thresholdIndex = levels.indexOf(settings.calmingInterventions.triggerThreshold);

      return currentIndex >= thresholdIndex;
    },
    [settings.calmingInterventions]
  );

  const startCalmingExercise = useCallback((technique?: CalmingTechnique) => {
    const availableExercises = technique
      ? calmingExercises.filter((ex) => ex.technique === technique)
      : calmingExercises.filter((ex) =>
          settings.calmingInterventions.techniques.includes(ex.technique)
        );

    if (availableExercises.length > 0) {
      const exercise =
        availableExercises[Math.floor(Math.random() * availableExercises.length)];
      setActiveCalmingExercise(exercise);
    }
  }, [settings.calmingInterventions.techniques]);

  const completeCalmingExercise = useCallback(() => {
    setActiveCalmingExercise(null);
    // In a real implementation, might reassess anxiety level
  }, []);

  const recordTrigger = useCallback((trigger: AnxietyTrigger) => {
    setSettings((prev) => {
      const triggers = new Set([...prev.identifiedTriggers, trigger]);
      return {
        ...prev,
        identifiedTriggers: Array.from(triggers),
      };
    });
  }, []);

  const enablePressureFreeMod = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      pressureFree: {
        enabled: true,
        noTimeLimits: true,
        noGoals: true,
        noComparisons: true,
        noLeaderboards: true,
        hideAllStats: true,
      },
      hideMetrics: {
        speed: true,
        accuracy: true,
        errors: true,
        timer: true,
        progress: true,
      },
    }));
  }, []);

  const disablePressureFreeMode = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      pressureFree: {
        ...prev.pressureFree,
        enabled: false,
      },
    }));
  }, []);

  const toggleSafeMode = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      safeMode: {
        ...prev.safeMode,
        enabled: !prev.safeMode.enabled,
      },
    }));
  }, []);

  const updateAnxietyLevel = useCallback((level: AnxietyLevel) => {
    setSettings((prev) => ({ ...prev, currentLevel: level }));

    // Check if intervention should trigger
    if (shouldTriggerIntervention(level)) {
      startCalmingExercise();
    }
  }, [shouldTriggerIntervention, startCalmingExercise]);

  const hideMetric = useCallback((metric: keyof AnxietySettings['hideMetrics']) => {
    setSettings((prev) => ({
      ...prev,
      hideMetrics: {
        ...prev.hideMetrics,
        [metric]: true,
      },
    }));
  }, []);

  const showMetric = useCallback((metric: keyof AnxietySettings['hideMetrics']) => {
    setSettings((prev) => ({
      ...prev,
      hideMetrics: {
        ...prev.hideMetrics,
        [metric]: false,
      },
    }));
  }, []);

  const updateSettings = useCallback((updates: Partial<AnxietySettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const getRecommendedExercises = useCallback((): CalmingExercise[] => {
    // Return exercises using successful techniques
    return calmingExercises.filter((ex) =>
      profile.successfulTechniques.includes(ex.technique)
    );
  }, [profile.successfulTechniques]);

  const resetProfile = useCallback(() => {
    setProfile({
      triggers: [],
      averageLevel: 'low',
      peakLevel: 'moderate',
      managementStrategies: ['breathing'],
      successfulTechniques: ['breathing', 'affirmations'],
      avoidancePatterns: [],
      progressNotes: [],
    });
    setSessions([]);
  }, []);

  return {
    settings,
    updateSettings,
    profile,
    sessions,
    activeCalmingExercise,
    exercises: calmingExercises,
    assessAnxietyLevel,
    updateAnxietyLevel,
    recordTrigger,
    startCalmingExercise,
    completeCalmingExercise,
    enablePressureFreeMod,
    disablePressureFreeMode,
    toggleSafeMode,
    hideMetric,
    showMetric,
    getRecommendedExercises,
    resetProfile,
  };
};

interface AnxietyFeaturesControlsProps {
  anxietyFeatures: ReturnType<typeof useAnxietyFeatures>;
}

export const AnxietyFeaturesControls: React.FC<AnxietyFeaturesControlsProps> = ({
  anxietyFeatures,
}) => {
  const {
    settings,
    updateSettings,
    profile,
    activeCalmingExercise,
    exercises,
    updateAnxietyLevel,
    startCalmingExercise,
    completeCalmingExercise,
    enablePressureFreeMod,
    toggleSafeMode,
  } = anxietyFeatures;

  const getAnxietyLevelColor = (level: AnxietyLevel): string => {
    switch (level) {
      case 'none':
        return '#4caf50';
      case 'low':
        return '#8bc34a';
      case 'moderate':
        return '#ff9800';
      case 'high':
        return '#ff5722';
      case 'severe':
        return '#f44336';
    }
  };

  const anxietyLevels: AnxietyLevel[] = ['none', 'low', 'moderate', 'high', 'severe'];

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '900px',
      }}
    >
      <h2 style={{ marginBottom: '20px' }}>Anxiety Management Features</h2>

      {/* Active Calming Exercise */}
      {activeCalmingExercise && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: '24px',
            padding: '24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: '12px',
          }}
        >
          <div style={{ fontSize: '32px', textAlign: 'center', marginBottom: '12px' }}>
            {activeCalmingExercise.icon}
          </div>
          <h3 style={{ textAlign: 'center', marginBottom: '8px' }}>
            {activeCalmingExercise.title}
          </h3>
          <p style={{ textAlign: 'center', marginBottom: '16px', opacity: 0.9 }}>
            {activeCalmingExercise.description}
          </p>
          <div style={{ marginBottom: '16px' }}>
            {activeCalmingExercise.steps.map((step, index) => (
              <div
                key={index}
                style={{
                  padding: '8px',
                  marginBottom: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '6px',
                }}
              >
                {index + 1}. {step}
              </div>
            ))}
          </div>
          <button
            onClick={completeCalmingExercise}
            style={{
              width: '100%',
              padding: '12px',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            I Feel Calmer Now
          </button>
        </motion.div>
      )}

      {/* Anxiety Level Indicator */}
      <div
        style={{
          marginBottom: '24px',
          padding: '20px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '12px' }}>Current Anxiety Level</h3>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '16px',
            alignItems: 'center',
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                height: '40px',
                background: '#e0e0e0',
                borderRadius: '20px',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    (anxietyLevels.indexOf(settings.currentLevel) / 4) * 100
                  }%`,
                }}
                style={{
                  height: '100%',
                  background: getAnxietyLevelColor(settings.currentLevel),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                {settings.currentLevel.toUpperCase()}
              </motion.div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {anxietyLevels.map((level) => (
            <button
              key={level}
              onClick={() => updateAnxietyLevel(level)}
              style={{
                flex: 1,
                padding: '8px',
                background:
                  settings.currentLevel === level
                    ? getAnxietyLevelColor(level)
                    : '#f5f5f5',
                color: settings.currentLevel === level ? 'white' : '#666',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          background: '#e3f2fd',
          border: '2px solid #2196f3',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '12px' }}>Quick Anxiety Relief</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => startCalmingExercise('breathing')}
            style={{
              padding: '10px 16px',
              background: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            🌬️ Breathing Exercise
          </button>
          <button
            onClick={() => startCalmingExercise('grounding')}
            style={{
              padding: '10px 16px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            🌍 Grounding
          </button>
          <button
            onClick={enablePressureFreeMod}
            style={{
              padding: '10px 16px',
              background: '#9c27b0',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            💙 Pressure-Free Mode
          </button>
          <button
            onClick={toggleSafeMode}
            style={{
              padding: '10px 16px',
              background: settings.safeMode.enabled ? '#ff9800' : '#757575',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            {settings.safeMode.enabled ? '✓' : '○'} Safe Mode
          </button>
        </div>
      </div>

      {/* Calming Exercises Library */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>Calming Exercises</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '12px',
          }}
        >
          {exercises.map((exercise) => (
            <motion.div
              key={exercise.id}
              whileHover={{ scale: 1.02 }}
              style={{
                padding: '16px',
                background: 'white',
                border: '2px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              onClick={() => startCalmingExercise(exercise.technique)}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                {exercise.icon}
              </div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                {exercise.title}
              </div>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                {exercise.description}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>
                ⏱️ {exercise.duration} seconds
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Pressure-Free Settings */}
      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '12px' }}>Pressure-Free Options</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.pressureFree.noTimeLimits}
              onChange={(e) =>
                updateSettings({
                  pressureFree: {
                    ...settings.pressureFree,
                    noTimeLimits: e.target.checked,
                  },
                })
              }
            />
            No time limits
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.pressureFree.noGoals}
              onChange={(e) =>
                updateSettings({
                  pressureFree: {
                    ...settings.pressureFree,
                    noGoals: e.target.checked,
                  },
                })
              }
            />
            No goals or targets
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.pressureFree.noComparisons}
              onChange={(e) =>
                updateSettings({
                  pressureFree: {
                    ...settings.pressureFree,
                    noComparisons: e.target.checked,
                  },
                })
              }
            />
            No comparisons
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.pressureFree.hideAllStats}
              onChange={(e) =>
                updateSettings({
                  pressureFree: {
                    ...settings.pressureFree,
                    hideAllStats: e.target.checked,
                  },
                })
              }
            />
            Hide all statistics
          </label>
        </div>
      </div>

      {/* Metric Hiding */}
      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          background: 'white',
          border: '2px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '12px' }}>Hide Anxiety Triggers</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.hideMetrics.timer}
              onChange={(e) =>
                updateSettings({
                  hideMetrics: {
                    ...settings.hideMetrics,
                    timer: e.target.checked,
                  },
                })
              }
            />
            Hide timer
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.hideMetrics.speed}
              onChange={(e) =>
                updateSettings({
                  hideMetrics: {
                    ...settings.hideMetrics,
                    speed: e.target.checked,
                  },
                })
              }
            />
            Hide speed (WPM)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.hideMetrics.accuracy}
              onChange={(e) =>
                updateSettings({
                  hideMetrics: {
                    ...settings.hideMetrics,
                    accuracy: e.target.checked,
                  },
                })
              }
            />
            Hide accuracy
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.hideMetrics.errors}
              onChange={(e) =>
                updateSettings({
                  hideMetrics: {
                    ...settings.hideMetrics,
                    errors: e.target.checked,
                  },
                })
              }
            />
            Hide error count
          </label>
        </div>
      </div>

      {/* Profile Summary */}
      <div
        style={{
          padding: '16px',
          background: '#f5f5f5',
          border: '2px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '12px' }}>Your Anxiety Profile</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Average Level</div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: getAnxietyLevelColor(profile.averageLevel),
              }}
            >
              {profile.averageLevel.toUpperCase()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#666' }}>Successful Techniques</div>
            <div style={{ fontSize: '14px' }}>
              {profile.successfulTechniques.join(', ')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnxietyFeaturesControls;
