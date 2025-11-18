import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

/**
 * Step 297: Build Choice Making System
 *
 * Provides users with meaningful choices and control over their typing
 * practice experience. Empowers autonomy and reduces anxiety from lack
 * of control. Particularly important for neurodivergent users.
 *
 * Features:
 * - Practice content selection
 * - Difficulty level choices
 * - Session length options
 * - Learning path flexibility
 * - Feature toggle control
 * - Customization freedom
 * - Decision support tools
 * - Preference saving
 */

export type ChoiceCategory =
  | 'content'
  | 'difficulty'
  | 'duration'
  | 'features'
  | 'environment'
  | 'goals';

export type ContentType =
  | 'lessons'
  | 'exercises'
  | 'games'
  | 'tests'
  | 'practice'
  | 'custom';

export type DifficultyChoice = 'auto' | 'easy' | 'medium' | 'hard' | 'custom';

export type DurationChoice = 'quick' | 'short' | 'medium' | 'long' | 'unlimited';

export interface Choice {
  id: string;
  category: ChoiceCategory;
  title: string;
  description: string;
  options: ChoiceOption[];
  currentSelection?: string;
  allowMultiple: boolean;
  required: boolean;
}

export interface ChoiceOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  recommended?: boolean;
  benefits: string[];
  preview?: string;
}

export interface ChoiceSettings {
  enableChoices: boolean;
  showRecommendations: boolean;
  explainOptions: boolean;
  allowChangeAnytime: boolean;
  savePreferences: boolean;
  providePreview: boolean;
  highlightDifferences: boolean;
  offerUndo: boolean;
}

export interface UserPreferences {
  favoriteContent: ContentType[];
  preferredDifficulty: DifficultyChoice;
  typicalDuration: DurationChoice;
  enabledFeatures: string[];
  customizations: Record<string, any>;
  savedChoices: Record<string, string[]>;
}

export interface ChoiceHistory {
  id: string;
  choiceId: string;
  selectedOptions: string[];
  timestamp: Date;
  satisfaction?: number; // 1-5
  reverted: boolean;
}

const contentChoices: Choice = {
  id: 'content-type',
  category: 'content',
  title: 'What would you like to practice?',
  description: 'Choose the type of content that fits your needs',
  options: [
    {
      id: 'lessons',
      label: 'Structured Lessons',
      description: 'Step-by-step guided learning',
      icon: '📚',
      recommended: true,
      benefits: ['Progressive difficulty', 'Clear goals', 'Comprehensive coverage'],
      preview: 'Learn typing systematically from basics to advanced',
    },
    {
      id: 'exercises',
      label: 'Skill Exercises',
      description: 'Focused practice on specific skills',
      icon: '💪',
      benefits: ['Targeted improvement', 'Quick sessions', 'Flexible'],
      preview: 'Practice specific skills like speed, accuracy, or special keys',
    },
    {
      id: 'games',
      label: 'Typing Games',
      description: 'Fun and engaging practice',
      icon: '🎮',
      benefits: ['Enjoyable', 'Motivating', 'Less pressure'],
      preview: 'Make typing practice fun with interactive games',
    },
    {
      id: 'tests',
      label: 'Typing Tests',
      description: 'Measure your progress',
      icon: '📊',
      benefits: ['Track improvement', 'Set benchmarks', 'Official metrics'],
      preview: 'Test your typing speed and accuracy with timed assessments',
    },
    {
      id: 'practice',
      label: 'Free Practice',
      description: 'Type any content you want',
      icon: '✍️',
      benefits: ['Complete freedom', 'Own content', 'No structure'],
      preview: 'Type whatever you want at your own pace',
    },
    {
      id: 'custom',
      label: 'Custom Session',
      description: 'Build your own practice mix',
      icon: '⚙️',
      benefits: ['Fully customizable', 'Mix activities', 'Your way'],
      preview: 'Create a personalized practice session',
    },
  ],
  allowMultiple: false,
  required: true,
};

const difficultyChoices: Choice = {
  id: 'difficulty-level',
  category: 'difficulty',
  title: 'Choose your difficulty level',
  description: 'Select the challenge level that feels right',
  options: [
    {
      id: 'auto',
      label: 'Automatic',
      description: 'Let us adjust difficulty for you',
      icon: '🤖',
      recommended: true,
      benefits: ['Always appropriate', 'No guesswork', 'Adaptive'],
      preview: 'Difficulty adjusts based on your performance',
    },
    {
      id: 'easy',
      label: 'Easy',
      description: 'Gentle pace, simple content',
      icon: '🌱',
      benefits: ['Low stress', 'Build confidence', 'Learn basics'],
      preview: 'Simple words and short sentences, plenty of time',
    },
    {
      id: 'medium',
      label: 'Medium',
      description: 'Balanced challenge',
      icon: '⚖️',
      benefits: ['Good progression', 'Engaging', 'Sustainable'],
      preview: 'Mix of simple and complex content, moderate pace',
    },
    {
      id: 'hard',
      label: 'Hard',
      description: 'Push your limits',
      icon: '🔥',
      benefits: ['Fast improvement', 'High engagement', 'Master level'],
      preview: 'Complex content, fast pace, minimal assistance',
    },
    {
      id: 'custom',
      label: 'Custom',
      description: 'Set your own parameters',
      icon: '🎯',
      benefits: ['Full control', 'Precise tuning', 'Your preferences'],
      preview: 'Customize every aspect of difficulty',
    },
  ],
  allowMultiple: false,
  required: true,
};

const durationChoices: Choice = {
  id: 'session-duration',
  category: 'duration',
  title: 'How long would you like to practice?',
  description: 'Choose a session length that works for you',
  options: [
    {
      id: 'quick',
      label: 'Quick (5 min)',
      description: 'Brief focused practice',
      icon: '⚡',
      benefits: ['Easy to fit in', 'Low commitment', 'Maintain habit'],
      preview: '5 minutes of concentrated practice',
    },
    {
      id: 'short',
      label: 'Short (15 min)',
      description: 'Standard practice session',
      icon: '⏱️',
      recommended: true,
      benefits: ['Balanced', 'Effective', 'Not overwhelming'],
      preview: '15 minutes with warm-up and practice',
    },
    {
      id: 'medium',
      label: 'Medium (30 min)',
      description: 'Comprehensive session',
      icon: '📖',
      benefits: ['Deep practice', 'Multiple activities', 'Solid improvement'],
      preview: '30 minutes with variety and depth',
    },
    {
      id: 'long',
      label: 'Long (60 min)',
      description: 'Extended practice',
      icon: '🎯',
      benefits: ['Intensive', 'Major progress', 'Full routine'],
      preview: '60 minutes for serious skill development',
    },
    {
      id: 'unlimited',
      label: 'Unlimited',
      description: 'Practice as long as you want',
      icon: '♾️',
      benefits: ['No pressure', 'Your pace', 'Complete freedom'],
      preview: 'No time limits, stop whenever you want',
    },
  ],
  allowMultiple: false,
  required: true,
};

const featureChoices: Choice = {
  id: 'session-features',
  category: 'features',
  title: 'Which features would you like enabled?',
  description: 'Select the features that help you learn best',
  options: [
    {
      id: 'error-prevention',
      label: 'Error Prevention',
      description: 'Block incorrect key presses',
      icon: '🛡️',
      benefits: ['Build confidence', 'Prevent bad habits', 'Success-focused'],
    },
    {
      id: 'hints',
      label: 'Helpful Hints',
      description: 'Show guidance and tips',
      icon: '💡',
      benefits: ['Learn faster', 'Reduce confusion', 'Supportive'],
    },
    {
      id: 'statistics',
      label: 'Live Statistics',
      description: 'See real-time metrics',
      icon: '📊',
      benefits: ['Track progress', 'Set goals', 'Measure improvement'],
    },
    {
      id: 'sounds',
      label: 'Sound Effects',
      description: 'Audio feedback for actions',
      icon: '🔊',
      benefits: ['Engaging', 'Confirmation', 'Motivating'],
    },
    {
      id: 'background-music',
      label: 'Background Music',
      description: 'Calm ambient sounds',
      icon: '🎵',
      benefits: ['Focus', 'Relaxation', 'Pleasant environment'],
    },
    {
      id: 'achievements',
      label: 'Achievements',
      description: 'Earn badges and rewards',
      icon: '🏆',
      benefits: ['Motivation', 'Recognition', 'Fun goals'],
    },
  ],
  allowMultiple: true,
  required: false,
};

const defaultSettings: ChoiceSettings = {
  enableChoices: true,
  showRecommendations: true,
  explainOptions: true,
  allowChangeAnytime: true,
  savePreferences: true,
  providePreview: true,
  highlightDifferences: true,
  offerUndo: true,
};

const defaultPreferences: UserPreferences = {
  favoriteContent: [],
  preferredDifficulty: 'auto',
  typicalDuration: 'short',
  enabledFeatures: [],
  customizations: {},
  savedChoices: {},
};

export const useChoiceMaking = () => {
  const [settings, setSettings] = useState<ChoiceSettings>(defaultSettings);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [history, setHistory] = useState<ChoiceHistory[]>([]);
  const [activeChoices, setActiveChoices] = useState<Choice[]>([
    contentChoices,
    difficultyChoices,
    durationChoices,
    featureChoices,
  ]);

  const makeChoice = useCallback(
    (choiceId: string, selectedOptions: string[]) => {
      // Update the choice
      setActiveChoices((prev) =>
        prev.map((choice) =>
          choice.id === choiceId
            ? { ...choice, currentSelection: selectedOptions[0] }
            : choice
        )
      );

      // Record in history
      const historyEntry: ChoiceHistory = {
        id: `history-${Date.now()}`,
        choiceId,
        selectedOptions,
        timestamp: new Date(),
        reverted: false,
      };

      setHistory((prev) => [...prev, historyEntry]);

      // Save to preferences if enabled
      if (settings.savePreferences) {
        setPreferences((prev) => ({
          ...prev,
          savedChoices: {
            ...prev.savedChoices,
            [choiceId]: selectedOptions,
          },
        }));
      }
    },
    [settings.savePreferences]
  );

  const undoChoice = useCallback((historyId: string) => {
    setHistory((prev) =>
      prev.map((entry) =>
        entry.id === historyId ? { ...entry, reverted: true } : entry
      )
    );

    // Find the previous non-reverted choice
    const entry = history.find((h) => h.id === historyId);
    if (entry) {
      const previousEntries = history
        .filter((h) => h.choiceId === entry.choiceId && !h.reverted)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      if (previousEntries.length > 1) {
        const previousChoice = previousEntries[1];
        makeChoice(entry.choiceId, previousChoice.selectedOptions);
      }
    }
  }, [history, makeChoice]);

  const getChoice = useCallback(
    (choiceId: string): Choice | undefined => {
      return activeChoices.find((c) => c.id === choiceId);
    },
    [activeChoices]
  );

  const getSelectedOptions = useCallback(
    (choiceId: string): string[] => {
      const choice = getChoice(choiceId);
      if (!choice) return [];

      if (choice.currentSelection) {
        return [choice.currentSelection];
      }

      // Check preferences
      return preferences.savedChoices[choiceId] || [];
    },
    [getChoice, preferences]
  );

  const addCustomChoice = useCallback((choice: Choice) => {
    setActiveChoices((prev) => [...prev, choice]);
  }, []);

  const removeChoice = useCallback((choiceId: string) => {
    setActiveChoices((prev) => prev.filter((c) => c.id !== choiceId));
  }, []);

  const resetChoices = useCallback(() => {
    setActiveChoices([
      contentChoices,
      difficultyChoices,
      durationChoices,
      featureChoices,
    ]);
    setHistory([]);
  }, []);

  const updateSettings = useCallback((updates: Partial<ChoiceSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const updatePreferences = useCallback(
    (updates: Partial<UserPreferences>) => {
      setPreferences((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    settings,
    updateSettings,
    preferences,
    updatePreferences,
    activeChoices,
    history,
    makeChoice,
    undoChoice,
    getChoice,
    getSelectedOptions,
    addCustomChoice,
    removeChoice,
    resetChoices,
    clearHistory,
  };
};

interface ChoiceMakingControlsProps {
  choiceMaking: ReturnType<typeof useChoiceMaking>;
}

export const ChoiceMakingControls: React.FC<ChoiceMakingControlsProps> = ({
  choiceMaking,
}) => {
  const {
    settings,
    updateSettings,
    activeChoices,
    makeChoice,
    getSelectedOptions,
  } = choiceMaking;

  const [expandedChoice, setExpandedChoice] = useState<string | null>(null);

  const handleOptionSelect = (choiceId: string, optionId: string) => {
    const choice = activeChoices.find((c) => c.id === choiceId);
    if (!choice) return;

    if (choice.allowMultiple) {
      const currentSelections = getSelectedOptions(choiceId);
      const newSelections = currentSelections.includes(optionId)
        ? currentSelections.filter((id) => id !== optionId)
        : [...currentSelections, optionId];
      makeChoice(choiceId, newSelections);
    } else {
      makeChoice(choiceId, [optionId]);
    }
  };

  const isOptionSelected = (choiceId: string, optionId: string): boolean => {
    return getSelectedOptions(choiceId).includes(optionId);
  };

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '1000px',
      }}
    >
      <h2 style={{ marginBottom: '20px' }}>Your Practice Choices</h2>

      {/* Settings Toggle */}
      <div
        style={{
          marginBottom: '24px',
          padding: '16px',
          background: '#e3f2fd',
          border: '2px solid #2196f3',
          borderRadius: '8px',
        }}
      >
        <div style={{ marginBottom: '12px' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 'bold',
            }}
          >
            <input
              type="checkbox"
              checked={settings.showRecommendations}
              onChange={(e) =>
                updateSettings({ showRecommendations: e.target.checked })
              }
            />
            Show recommendations to help me decide
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.explainOptions}
              onChange={(e) =>
                updateSettings({ explainOptions: e.target.checked })
              }
            />
            Explain each option
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.providePreview}
              onChange={(e) =>
                updateSettings({ providePreview: e.target.checked })
              }
            />
            Show previews
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.allowChangeAnytime}
              onChange={(e) =>
                updateSettings({ allowChangeAnytime: e.target.checked })
              }
            />
            Allow changes anytime
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={settings.offerUndo}
              onChange={(e) => updateSettings({ offerUndo: e.target.checked })}
            />
            Offer undo option
          </label>
        </div>
      </div>

      {/* Choices */}
      {activeChoices.map((choice) => {
        const selectedOptions = getSelectedOptions(choice.id);
        const isExpanded = expandedChoice === choice.id;

        return (
          <div
            key={choice.id}
            style={{
              marginBottom: '24px',
              padding: '20px',
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
                <h3 style={{ margin: 0, marginBottom: '4px' }}>
                  {choice.title}
                  {choice.required && (
                    <span style={{ color: '#f44336', marginLeft: '4px' }}>*</span>
                  )}
                </h3>
                {settings.explainOptions && (
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                    {choice.description}
                  </p>
                )}
              </div>
              <button
                onClick={() =>
                  setExpandedChoice(isExpanded ? null : choice.id)
                }
                style={{
                  padding: '8px 16px',
                  background: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                {isExpanded ? '▼ Collapse' : '▶ Expand'}
              </button>
            </div>

            {selectedOptions.length > 0 && (
              <div
                style={{
                  padding: '8px 12px',
                  background: '#e8f5e9',
                  borderRadius: '6px',
                  marginBottom: '12px',
                  fontSize: '14px',
                }}
              >
                <strong>Selected:</strong>{' '}
                {selectedOptions
                  .map(
                    (id) =>
                      choice.options.find((opt) => opt.id === id)?.label
                  )
                  .join(', ')}
              </div>
            )}

            {(isExpanded || selectedOptions.length === 0) && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: choice.allowMultiple
                    ? 'repeat(auto-fill, minmax(200px, 1fr))'
                    : 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '12px',
                }}
              >
                {choice.options.map((option) => {
                  const isSelected = isOptionSelected(choice.id, option.id);

                  return (
                    <motion.div
                      key={option.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleOptionSelect(choice.id, option.id)}
                      style={{
                        padding: '16px',
                        background: isSelected ? '#e3f2fd' : 'white',
                        border: isSelected
                          ? '3px solid #2196f3'
                          : '2px solid #ddd',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                    >
                      {option.recommended &&
                        settings.showRecommendations && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              padding: '2px 8px',
                              background: '#4caf50',
                              color: 'white',
                              borderRadius: '12px',
                              fontSize: '10px',
                              fontWeight: 'bold',
                            }}
                          >
                            RECOMMENDED
                          </div>
                        )}

                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                        {option.icon}
                      </div>
                      <div
                        style={{
                          fontWeight: 'bold',
                          marginBottom: '4px',
                          fontSize: '16px',
                        }}
                      >
                        {option.label}
                      </div>

                      {settings.explainOptions && (
                        <div
                          style={{
                            fontSize: '13px',
                            color: '#666',
                            marginBottom: '8px',
                          }}
                        >
                          {option.description}
                        </div>
                      )}

                      {settings.providePreview && option.preview && (
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#888',
                            fontStyle: 'italic',
                            marginBottom: '8px',
                          }}
                        >
                          "{option.preview}"
                        </div>
                      )}

                      {option.benefits && option.benefits.length > 0 && (
                        <div style={{ fontSize: '11px', color: '#888' }}>
                          ✓ {option.benefits.slice(0, 2).join(' • ')}
                        </div>
                      )}

                      {isSelected && (
                        <div
                          style={{
                            marginTop: '12px',
                            padding: '8px',
                            background: '#2196f3',
                            color: 'white',
                            borderRadius: '4px',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: '12px',
                          }}
                        >
                          ✓ SELECTED
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Summary */}
      <div
        style={{
          padding: '20px',
          background: '#f5f5f5',
          border: '2px solid #ddd',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ marginBottom: '12px' }}>Your Choices Summary</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {activeChoices.map((choice) => {
            const selectedOptions = getSelectedOptions(choice.id);
            if (selectedOptions.length === 0) return null;

            return (
              <div
                key={choice.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px',
                  background: 'white',
                  borderRadius: '4px',
                }}
              >
                <span style={{ fontWeight: '500' }}>{choice.title}:</span>
                <span style={{ color: '#2196f3' }}>
                  {selectedOptions
                    .map(
                      (id) =>
                        choice.options.find((opt) => opt.id === id)?.label
                    )
                    .join(', ')}
                </span>
              </div>
            );
          })}
        </div>

        {settings.allowChangeAnytime && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              background: '#fff3e0',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#e65100',
            }}
          >
            💡 You can change any of these choices at any time during your
            practice session.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChoiceMakingControls;
