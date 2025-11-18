import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * BreakRequests Component
 *
 * Comprehensive break request system for autism typing tutor.
 * Allows users to request breaks when needed, provides break suggestions,
 * and tracks break patterns for better self-regulation.
 *
 * Features:
 * - Immediate break requests
 * - Scheduled break suggestions
 * - Break type selection (rest, stretch, sensory, walk, snack, bathroom)
 * - Break duration tracking
 * - Auto-pause on break request
 * - Break reminders based on activity duration
 * - Break history and patterns
 * - Customizable break intervals
 * - Visual and audio break notifications
 * - Break activity suggestions
 */

// Types for break requests
export type BreakType = 'rest' | 'stretch' | 'sensory' | 'walk' | 'snack' | 'bathroom';
export type BreakStatus = 'requested' | 'active' | 'completed' | 'skipped';
export type ReminderFrequency = 'never' | 'gentle' | 'moderate' | 'frequent';

export interface BreakRequest {
  id: string;
  type: BreakType;
  requestedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  duration: number; // in seconds
  status: BreakStatus;
  reason?: string;
  activitySuggestions: string[];
  userNotes?: string;
}

export interface BreakSettings {
  enabled: boolean;
  autoSuggest: boolean;
  suggestInterval: number; // minutes of activity before suggesting break
  minBreakDuration: number; // seconds
  maxBreakDuration: number; // seconds
  defaultDuration: number; // seconds
  reminderFrequency: ReminderFrequency;
  pauseActivityOnBreak: boolean;
  trackBreakPatterns: boolean;
  showBreakActivities: boolean;
  playBreakSound: boolean;
  allowCustomBreaks: boolean;
}

export interface BreakPattern {
  averageFrequency: number; // minutes between breaks
  mostCommonType: BreakType;
  averageDuration: number; // seconds
  totalBreaksTaken: number;
  breaksByType: Record<BreakType, number>;
  breaksByTimeOfDay: {
    morning: number;
    afternoon: number;
    evening: number;
  };
  optimalBreakInterval?: number;
}

export interface BreakTimer {
  timeSinceLastBreak: number; // seconds
  activityDuration: number; // seconds
  breakSuggested: boolean;
  nextSuggestedBreak?: Date;
}

// Custom hook for break requests
export function useBreakRequests(initialSettings?: Partial<BreakSettings>) {
  const [settings, setSettings] = useState<BreakSettings>({
    enabled: true,
    autoSuggest: true,
    suggestInterval: 20,
    minBreakDuration: 30,
    maxBreakDuration: 600,
    defaultDuration: 180,
    reminderFrequency: 'moderate',
    pauseActivityOnBreak: true,
    trackBreakPatterns: true,
    showBreakActivities: true,
    playBreakSound: true,
    allowCustomBreaks: true,
    ...initialSettings,
  });

  const [breaks, setBreaks] = useState<BreakRequest[]>([]);
  const [currentBreak, setCurrentBreak] = useState<BreakRequest | null>(null);
  const [timer, setTimer] = useState<BreakTimer>({
    timeSinceLastBreak: 0,
    activityDuration: 0,
    breakSuggested: false,
  });
  const [patterns, setPatterns] = useState<BreakPattern>({
    averageFrequency: 0,
    mostCommonType: 'rest',
    averageDuration: 0,
    totalBreaksTaken: 0,
    breaksByType: {
      rest: 0,
      stretch: 0,
      sensory: 0,
      walk: 0,
      snack: 0,
      bathroom: 0,
    },
    breaksByTimeOfDay: {
      morning: 0,
      afternoon: 0,
      evening: 0,
    },
  });

  const updateSettings = useCallback((newSettings: Partial<BreakSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const requestBreak = useCallback(
    (type: BreakType, duration?: number, reason?: string) => {
      const breakRequest: BreakRequest = {
        id: `break-${Date.now()}`,
        type,
        requestedAt: new Date(),
        duration: duration || settings.defaultDuration,
        status: 'requested',
        reason,
        activitySuggestions: getBreakActivities(type),
      };

      setBreaks((prev) => [...prev, breakRequest]);
      setCurrentBreak(breakRequest);
      setTimer((prev) => ({ ...prev, breakSuggested: false }));

      return breakRequest.id;
    },
    [settings.defaultDuration]
  );

  const startBreak = useCallback((breakId: string) => {
    setBreaks((prev) =>
      prev.map((b) =>
        b.id === breakId
          ? { ...b, status: 'active', startedAt: new Date() }
          : b
      )
    );

    const activeBreak = breaks.find((b) => b.id === breakId);
    if (activeBreak) {
      setCurrentBreak({ ...activeBreak, status: 'active', startedAt: new Date() });
    }

    if (settings.pauseActivityOnBreak) {
      // Emit pause event or call pause callback
    }
  }, [breaks, settings.pauseActivityOnBreak]);

  const completeBreak = useCallback(
    (breakId: string, userNotes?: string) => {
      const completedBreak = breaks.find((b) => b.id === breakId);
      if (!completedBreak) return;

      const updatedBreak: BreakRequest = {
        ...completedBreak,
        status: 'completed',
        completedAt: new Date(),
        userNotes,
      };

      setBreaks((prev) =>
        prev.map((b) => (b.id === breakId ? updatedBreak : b))
      );

      setCurrentBreak(null);
      setTimer((prev) => ({
        ...prev,
        timeSinceLastBreak: 0,
      }));

      if (settings.trackBreakPatterns) {
        updateBreakPatterns(updatedBreak);
      }
    },
    [breaks, settings.trackBreakPatterns]
  );

  const skipBreak = useCallback((breakId: string) => {
    setBreaks((prev) =>
      prev.map((b) =>
        b.id === breakId
          ? { ...b, status: 'skipped', completedAt: new Date() }
          : b
      )
    );

    setCurrentBreak(null);
    setTimer((prev) => ({ ...prev, breakSuggested: false }));
  }, []);

  const updateBreakPatterns = useCallback((completedBreak: BreakRequest) => {
    setPatterns((prev) => {
      const newTotal = prev.totalBreaksTaken + 1;
      const newTypeCount = {
        ...prev.breaksByType,
        [completedBreak.type]: prev.breaksByType[completedBreak.type] + 1,
      };

      const hour = completedBreak.completedAt?.getHours() || 12;
      let timeOfDay: 'morning' | 'afternoon' | 'evening' = 'afternoon';
      if (hour < 12) timeOfDay = 'morning';
      else if (hour >= 18) timeOfDay = 'evening';

      const newTimeOfDayCount = {
        ...prev.breaksByTimeOfDay,
        [timeOfDay]: prev.breaksByTimeOfDay[timeOfDay] + 1,
      };

      const mostCommonType = Object.entries(newTypeCount).reduce((a, b) =>
        b[1] > a[1] ? b : a
      )[0] as BreakType;

      const totalDuration = prev.averageDuration * prev.totalBreaksTaken + completedBreak.duration;
      const newAverageDuration = totalDuration / newTotal;

      return {
        ...prev,
        totalBreaksTaken: newTotal,
        breaksByType: newTypeCount,
        breaksByTimeOfDay: newTimeOfDayCount,
        mostCommonType,
        averageDuration: newAverageDuration,
      };
    });
  }, []);

  const suggestBreak = useCallback(() => {
    if (!settings.autoSuggest) return;

    setTimer((prev) => ({
      ...prev,
      breakSuggested: true,
      nextSuggestedBreak: new Date(Date.now() + settings.suggestInterval * 60 * 1000),
    }));
  }, [settings.autoSuggest, settings.suggestInterval]);

  // Timer effect for tracking activity duration
  useEffect(() => {
    if (!settings.enabled) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        const newActivityDuration = prev.activityDuration + 1;
        const newTimeSinceLastBreak = prev.timeSinceLastBreak + 1;

        // Check if we should suggest a break
        if (
          settings.autoSuggest &&
          !prev.breakSuggested &&
          !currentBreak &&
          newTimeSinceLastBreak >= settings.suggestInterval * 60
        ) {
          suggestBreak();
        }

        return {
          ...prev,
          activityDuration: newActivityDuration,
          timeSinceLastBreak: newTimeSinceLastBreak,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.enabled, settings.autoSuggest, settings.suggestInterval, currentBreak, suggestBreak]);

  return {
    settings,
    updateSettings,
    breaks,
    currentBreak,
    timer,
    patterns,
    requestBreak,
    startBreak,
    completeBreak,
    skipBreak,
  };
}

// Helper function to get break activity suggestions
function getBreakActivities(type: BreakType): string[] {
  const activities: Record<BreakType, string[]> = {
    rest: [
      'Close your eyes and relax',
      'Listen to calming music',
      'Practice deep breathing',
      'Sit comfortably without screens',
      'Do a short meditation',
    ],
    stretch: [
      'Stretch your arms above your head',
      'Roll your shoulders',
      'Stretch your wrists and fingers',
      'Do neck rotations gently',
      'Stand and touch your toes',
    ],
    sensory: [
      'Use a fidget toy',
      'Listen to nature sounds',
      'Look at something calming',
      'Feel different textures',
      'Use a weighted blanket',
    ],
    walk: [
      'Walk around your room',
      'Go outside for fresh air',
      'Walk to get water',
      'Take a short stroll',
      'Do gentle pacing',
    ],
    snack: [
      'Drink water',
      'Have a healthy snack',
      'Eat some fruit',
      'Have a cup of tea',
      'Chew gum',
    ],
    bathroom: [
      'Use the restroom',
      'Wash your hands',
      'Splash water on your face',
      'Take a moment for yourself',
    ],
  };

  return activities[type];
}

// Main component
interface BreakRequestsProps {
  onBreakStart?: () => void;
  onBreakEnd?: () => void;
  initialSettings?: Partial<BreakSettings>;
}

const BreakRequests: React.FC<BreakRequestsProps> = ({
  onBreakStart,
  onBreakEnd,
  initialSettings,
}) => {
  const br = useBreakRequests(initialSettings);

  const [showBreakMenu, setShowBreakMenu] = useState(false);
  const [customDuration, setCustomDuration] = useState(br.settings.defaultDuration);

  const handleRequestBreak = useCallback(
    (type: BreakType) => {
      const breakId = br.requestBreak(type, customDuration);
      br.startBreak(breakId);
      setShowBreakMenu(false);
      onBreakStart?.();
    },
    [br, customDuration, onBreakStart]
  );

  const handleCompleteBreak = useCallback(
    (breakId: string) => {
      br.completeBreak(breakId);
      onBreakEnd?.();
    },
    [br, onBreakEnd]
  );

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const breakTypes: Array<{
    type: BreakType;
    label: string;
    description: string;
    icon: string;
    color: string;
  }> = [
    {
      type: 'rest',
      label: 'Rest Break',
      description: 'Take a moment to relax your mind',
      icon: '😌',
      color: '#4A90E2',
    },
    {
      type: 'stretch',
      label: 'Stretch Break',
      description: 'Stretch your body and muscles',
      icon: '🤸',
      color: '#7B68EE',
    },
    {
      type: 'sensory',
      label: 'Sensory Break',
      description: 'Engage your senses for regulation',
      icon: '🎨',
      color: '#50C878',
    },
    {
      type: 'walk',
      label: 'Walking Break',
      description: 'Move around and get fresh air',
      icon: '🚶',
      color: '#FFA500',
    },
    {
      type: 'snack',
      label: 'Snack Break',
      description: 'Have something to eat or drink',
      icon: '🍎',
      color: '#FF6B6B',
    },
    {
      type: 'bathroom',
      label: 'Bathroom Break',
      description: 'Take care of personal needs',
      icon: '🚻',
      color: '#9B59B6',
    },
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Break Request Button */}
      {!br.currentBreak && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowBreakMenu(!showBreakMenu)}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '20px',
            width: '100%',
          }}
        >
          🛑 Request a Break
        </motion.button>
      )}

      {/* Break Type Menu */}
      <AnimatePresence>
        {showBreakMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginBottom: '20px',
              padding: '20px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
            }}
          >
            <h3 style={{ marginTop: 0 }}>Choose Break Type</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '10px',
              }}
            >
              {breakTypes.map((bt) => (
                <motion.button
                  key={bt.type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    handleRequestBreak(bt.type);
                  }}
                  style={{
                    padding: '15px',
                    backgroundColor: bt.color,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '5px' }}>
                    {bt.icon}
                  </div>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {bt.label}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>
                    {bt.description}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Custom Duration */}
            {br.settings.allowCustomBreaks && (
              <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px' }}>
                  Break Duration: {formatTime(customDuration)}
                </label>
                <input
                  type="range"
                  min={br.settings.minBreakDuration}
                  max={br.settings.maxBreakDuration}
                  step={30}
                  value={customDuration}
                  onChange={(e) => setCustomDuration(Number(e.target.value))}
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Break Display */}
      <AnimatePresence>
        {br.currentBreak && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              padding: '30px',
              backgroundColor: '#E3F2FD',
              borderRadius: '12px',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              {breakTypes.find((bt) => bt.type === br.currentBreak?.type)?.icon}{' '}
              Break Time!
            </h2>
            <p style={{ fontSize: '18px', marginBottom: '20px' }}>
              Take your{' '}
              {breakTypes.find((bt) => bt.type === br.currentBreak?.type)?.label}
            </p>

            {/* Break Activities */}
            {br.settings.showBreakActivities && (
              <div
                style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  textAlign: 'left',
                }}
              >
                <h4 style={{ marginTop: 0 }}>Try these activities:</h4>
                <ul>
                  {br.currentBreak.activitySuggestions.map((activity, idx) => (
                    <li key={idx} style={{ marginBottom: '8px' }}>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Break Timer */}
            <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '20px' }}>
              {formatTime(br.currentBreak.duration)}
            </div>

            {/* Complete Break Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCompleteBreak(br.currentBreak!.id)}
              style={{
                padding: '15px 40px',
                fontSize: '18px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              ✓ I'm Ready to Continue
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Break Suggestion */}
      <AnimatePresence>
        {br.timer.breakSuggested && !br.currentBreak && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              padding: '20px',
              backgroundColor: '#FFF3CD',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '2px solid #FFC107',
            }}
          >
            <h3 style={{ marginTop: 0 }}>💡 Break Suggestion</h3>
            <p>
              You've been practicing for {Math.floor(br.timer.timeSinceLastBreak / 60)}{' '}
              minutes. Consider taking a break!
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowBreakMenu(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Take a Break
              </button>
              <button
                onClick={() => br.skipBreak('suggested')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#757575',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Continue Practicing
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistics */}
      {br.settings.trackBreakPatterns && br.patterns.totalBreaksTaken > 0 && (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Break Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <strong>Total Breaks:</strong> {br.patterns.totalBreaksTaken}
            </div>
            <div>
              <strong>Average Duration:</strong> {formatTime(Math.round(br.patterns.averageDuration))}
            </div>
            <div>
              <strong>Most Common:</strong>{' '}
              {breakTypes.find((bt) => bt.type === br.patterns.mostCommonType)?.label}
            </div>
            <div>
              <strong>Time Since Last:</strong> {formatTime(br.timer.timeSinceLastBreak)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreakRequests;
