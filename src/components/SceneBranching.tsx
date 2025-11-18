import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SceneBranching Component
 *
 * Branching narrative system for typing practice scenes.
 * Allows scenes to branch based on user choices, performance,
 * and other conditions, creating dynamic learning paths.
 *
 * Features:
 * - Choice-based branching
 * - Performance-based branching
 * - Conditional branching
 * - Multiple endings
 * - Branch history tracking
 * - Decision points visualization
 * - Consequence system
 * - Branch previews
 * - Save/load branch states
 * - Branch analytics
 */

// Types for scene branching
export type BranchConditionType =
  | 'choice'
  | 'performance'
  | 'time'
  | 'score'
  | 'accuracy'
  | 'random'
  | 'custom';

export type BranchOutcome = 'success' | 'failure' | 'neutral' | 'special';

export interface BranchCondition {
  type: BranchConditionType;
  operator?: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value?: any;
  customCheck?: () => boolean;
}

export interface BranchChoice {
  id: string;
  text: string;
  description?: string;
  icon?: string;
  consequences?: string[];
  leadsTo: string; // scene ID
  requiresCondition?: BranchCondition;
  enabled: boolean;
  locked?: boolean;
  lockedReason?: string;
}

export interface DecisionPoint {
  id: string;
  sceneId: string;
  title: string;
  description: string;
  choices: BranchChoice[];
  timestamp: Date;
  timeLimit?: number; // seconds
  autoSelect?: string; // choice ID for timeout
}

export interface Branch {
  id: string;
  fromSceneId: string;
  toSceneId: string;
  conditionMet: boolean;
  condition?: BranchCondition;
  choiceId?: string;
  outcome?: BranchOutcome;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface BranchPath {
  id: string;
  name: string;
  description: string;
  scenes: string[];
  branches: Branch[];
  startSceneId: string;
  currentSceneId: string;
  completed: boolean;
  outcome?: BranchOutcome;
}

export interface BranchHistory {
  paths: BranchPath[];
  currentPath: BranchPath | null;
  decisions: DecisionPoint[];
  totalBranches: number;
  uniqueScenes: Set<string>;
}

export interface BranchingSettings {
  enabled: boolean;
  showConsequences: boolean;
  allowBacktracking: boolean;
  saveHistory: boolean;
  showBranchPreview: boolean;
  highlightOptimalPath: boolean;
  trackAnalytics: boolean;
  maxHistorySize: number;
}

export interface BranchAnalytics {
  mostTakenPath: string;
  averageDecisionTime: number;
  branchingRate: number; // branches per scene
  popularChoices: Map<string, number>;
  outcomeDistribution: Record<BranchOutcome, number>;
}

// Custom hook for scene branching
export function useSceneBranching(initialSettings?: Partial<BranchingSettings>) {
  const [settings, setSettings] = useState<BranchingSettings>({
    enabled: true,
    showConsequences: true,
    allowBacktracking: true,
    saveHistory: true,
    showBranchPreview: true,
    highlightOptimalPath: false,
    trackAnalytics: true,
    maxHistorySize: 100,
    ...initialSettings,
  });

  const [history, setHistory] = useState<BranchHistory>({
    paths: [],
    currentPath: null,
    decisions: [],
    totalBranches: 0,
    uniqueScenes: new Set(),
  });

  const [currentDecision, setCurrentDecision] = useState<DecisionPoint | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [analytics, setAnalytics] = useState<BranchAnalytics>({
    mostTakenPath: '',
    averageDecisionTime: 0,
    branchingRate: 0,
    popularChoices: new Map(),
    outcomeDistribution: {
      success: 0,
      failure: 0,
      neutral: 0,
      special: 0,
    },
  });

  const updateSettings = useCallback((newSettings: Partial<BranchingSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const createDecisionPoint = useCallback(
    (
      sceneId: string,
      title: string,
      description: string,
      choices: BranchChoice[],
      timeLimit?: number
    ): DecisionPoint => {
      const decision: DecisionPoint = {
        id: `decision-${Date.now()}`,
        sceneId,
        title,
        description,
        choices,
        timestamp: new Date(),
        timeLimit,
      };

      setCurrentDecision(decision);

      if (settings.saveHistory) {
        setHistory((prev) => ({
          ...prev,
          decisions: [...prev.decisions, decision].slice(-settings.maxHistorySize),
        }));
      }

      return decision;
    },
    [settings.saveHistory, settings.maxHistorySize]
  );

  const makeChoice = useCallback(
    (choiceId: string) => {
      if (!currentDecision) return null;

      const choice = currentDecision.choices.find((c) => c.id === choiceId);
      if (!choice || !choice.enabled) return null;

      const branch: Branch = {
        id: `branch-${Date.now()}`,
        fromSceneId: currentDecision.sceneId,
        toSceneId: choice.leadsTo,
        conditionMet: true,
        choiceId,
        timestamp: new Date(),
      };

      setBranches((prev) => [...prev, branch]);

      // Update current path
      if (history.currentPath) {
        setHistory((prev) => {
          const updatedPath: BranchPath = {
            ...prev.currentPath!,
            scenes: [...prev.currentPath!.scenes, choice.leadsTo],
            branches: [...prev.currentPath!.branches, branch],
            currentSceneId: choice.leadsTo,
          };

          return {
            ...prev,
            currentPath: updatedPath,
            totalBranches: prev.totalBranches + 1,
            uniqueScenes: new Set([...prev.uniqueScenes, choice.leadsTo]),
          };
        });
      }

      // Update analytics
      if (settings.trackAnalytics) {
        updateAnalytics(choiceId);
      }

      setCurrentDecision(null);
      return branch;
    },
    [currentDecision, history.currentPath, settings.trackAnalytics]
  );

  const checkCondition = useCallback((condition: BranchCondition, context?: any): boolean => {
    if (condition.customCheck) {
      return condition.customCheck();
    }

    if (!context || condition.value === undefined) return true;

    const contextValue = context[condition.type];
    if (contextValue === undefined) return false;

    switch (condition.operator) {
      case 'gt':
        return contextValue > condition.value;
      case 'lt':
        return contextValue < condition.value;
      case 'eq':
        return contextValue === condition.value;
      case 'gte':
        return contextValue >= condition.value;
      case 'lte':
        return contextValue <= condition.value;
      default:
        return true;
    }
  }, []);

  const evaluateChoices = useCallback(
    (choices: BranchChoice[], context?: any): BranchChoice[] => {
      return choices.map((choice) => {
        if (!choice.requiresCondition) {
          return { ...choice, enabled: true };
        }

        const conditionMet = checkCondition(choice.requiresCondition, context);
        return {
          ...choice,
          enabled: conditionMet,
          locked: !conditionMet,
        };
      });
    },
    [checkCondition]
  );

  const startNewPath = useCallback(
    (name: string, description: string, startSceneId: string) => {
      const newPath: BranchPath = {
        id: `path-${Date.now()}`,
        name,
        description,
        scenes: [startSceneId],
        branches: [],
        startSceneId,
        currentSceneId: startSceneId,
        completed: false,
      };

      setHistory((prev) => ({
        ...prev,
        paths: [...prev.paths, newPath],
        currentPath: newPath,
        uniqueScenes: new Set([...prev.uniqueScenes, startSceneId]),
      }));

      return newPath;
    },
    []
  );

  const completePath = useCallback((outcome: BranchOutcome) => {
    if (!history.currentPath) return;

    setHistory((prev) => ({
      ...prev,
      currentPath: {
        ...prev.currentPath!,
        completed: true,
        outcome,
      },
    }));

    // Update analytics
    setAnalytics((prev) => ({
      ...prev,
      outcomeDistribution: {
        ...prev.outcomeDistribution,
        [outcome]: prev.outcomeDistribution[outcome] + 1,
      },
    }));
  }, [history.currentPath]);

  const goBackToPreviousBranch = useCallback(() => {
    if (!settings.allowBacktracking || !history.currentPath) return null;

    const currentPath = history.currentPath;
    if (currentPath.branches.length === 0) return null;

    // Remove last branch
    const previousBranch = currentPath.branches[currentPath.branches.length - 1];
    const updatedBranches = currentPath.branches.slice(0, -1);
    const updatedScenes = currentPath.scenes.slice(0, -1);

    const updatedPath: BranchPath = {
      ...currentPath,
      branches: updatedBranches,
      scenes: updatedScenes,
      currentSceneId: previousBranch.fromSceneId,
    };

    setHistory((prev) => ({
      ...prev,
      currentPath: updatedPath,
    }));

    return previousBranch;
  }, [settings.allowBacktracking, history.currentPath]);

  const updateAnalytics = useCallback((choiceId: string) => {
    setAnalytics((prev) => {
      const popularChoices = new Map(prev.popularChoices);
      popularChoices.set(choiceId, (popularChoices.get(choiceId) || 0) + 1);

      return {
        ...prev,
        popularChoices,
      };
    });
  }, []);

  const getBranchPreview = useCallback((choiceId: string): string | null => {
    if (!settings.showBranchPreview || !currentDecision) return null;

    const choice = currentDecision.choices.find((c) => c.id === choiceId);
    if (!choice) return null;

    return choice.consequences?.join(', ') || 'Continue your journey...';
  }, [settings.showBranchPreview, currentDecision]);

  const clearHistory = useCallback(() => {
    setHistory({
      paths: [],
      currentPath: null,
      decisions: [],
      totalBranches: 0,
      uniqueScenes: new Set(),
    });
    setBranches([]);
  }, []);

  return {
    settings,
    updateSettings,
    history,
    currentDecision,
    branches,
    analytics,
    createDecisionPoint,
    makeChoice,
    checkCondition,
    evaluateChoices,
    startNewPath,
    completePath,
    goBackToPreviousBranch,
    getBranchPreview,
    clearHistory,
  };
}

// Main component
interface SceneBranchingProps {
  onBranchTaken?: (branch: Branch) => void;
  onPathComplete?: (path: BranchPath) => void;
  initialSettings?: Partial<BranchingSettings>;
}

const SceneBranching: React.FC<SceneBranchingProps> = ({
  onBranchTaken,
  onPathComplete: _onPathComplete,
  initialSettings,
}) => {
  const sb = useSceneBranching(initialSettings);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Example: Start a new path on mount
  useEffect(() => {
    if (!sb.history.currentPath) {
      sb.startNewPath('Main Story', 'Your typing adventure begins', 'scene-start');
    }
  }, []);

  // Handle decision point timer
  useEffect(() => {
    if (!sb.currentDecision?.timeLimit) {
      setTimeRemaining(null);
      return;
    }

    setTimeRemaining(sb.currentDecision.timeLimit);

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(interval);
          // Auto-select if time runs out
          if (sb.currentDecision?.autoSelect) {
            sb.makeChoice(sb.currentDecision.autoSelect);
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sb.currentDecision, sb]);

  const handleChoice = useCallback(
    (choiceId: string) => {
      const branch = sb.makeChoice(choiceId);
      if (branch) {
        onBranchTaken?.(branch);
      }
    },
    [sb, onBranchTaken]
  );

  // Example decision point
  useEffect(() => {
    // Create a sample decision after 2 seconds
    const timer = setTimeout(() => {
      if (!sb.currentDecision) {
        const choices: BranchChoice[] = [
          {
            id: 'choice-fast',
            text: 'Focus on Speed',
            description: 'Practice typing faster',
            icon: '⚡',
            consequences: ['Increase speed', 'May sacrifice accuracy'],
            leadsTo: 'scene-speed',
            enabled: true,
          },
          {
            id: 'choice-accurate',
            text: 'Focus on Accuracy',
            description: 'Practice typing accurately',
            icon: '🎯',
            consequences: ['Increase accuracy', 'Build solid foundation'],
            leadsTo: 'scene-accuracy',
            enabled: true,
          },
          {
            id: 'choice-balanced',
            text: 'Balanced Approach',
            description: 'Balance speed and accuracy',
            icon: '⚖️',
            consequences: ['Steady progress', 'Well-rounded skills'],
            leadsTo: 'scene-balanced',
            enabled: true,
          },
        ];

        sb.createDecisionPoint(
          'scene-start',
          'Choose Your Path',
          'How would you like to improve your typing?',
          choices
        );
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [sb]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Path Progress */}
      {sb.history.currentPath && (
        <div
          style={{
            padding: '15px',
            backgroundColor: '#E3F2FD',
            borderRadius: '8px',
            marginBottom: '20px',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '10px' }}>
            {sb.history.currentPath.name}
          </h3>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
            {sb.history.currentPath.description}
          </div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            Progress: {sb.history.currentPath.scenes.length} scenes •{' '}
            {sb.history.currentPath.branches.length} decisions
          </div>
        </div>
      )}

      {/* Decision Point */}
      <AnimatePresence>
        {sb.currentDecision && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              padding: '30px',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '2px solid #2196F3',
              marginBottom: '20px',
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '15px' }}>
              {sb.currentDecision.title}
            </h2>
            <p style={{ fontSize: '16px', marginBottom: '25px' }}>
              {sb.currentDecision.description}
            </p>

            {/* Timer */}
            {timeRemaining !== null && (
              <div
                style={{
                  padding: '10px',
                  backgroundColor: '#FFF3CD',
                  borderRadius: '6px',
                  marginBottom: '20px',
                  textAlign: 'center',
                  border: '1px solid #FFC107',
                }}
              >
                ⏱️ Time remaining: {timeRemaining}s
              </div>
            )}

            {/* Choices */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sb.currentDecision.choices.map((choice) => (
                <motion.button
                  key={choice.id}
                  whileHover={choice.enabled ? { scale: 1.02, x: 5 } : {}}
                  whileTap={choice.enabled ? { scale: 0.98 } : {}}
                  onClick={() => choice.enabled && handleChoice(choice.id)}
                  disabled={!choice.enabled}
                  style={{
                    padding: '20px',
                    backgroundColor: choice.enabled ? '#F5F5F5' : '#E0E0E0',
                    border: `2px solid ${choice.enabled ? '#2196F3' : '#BDBDBD'}`,
                    borderRadius: '8px',
                    cursor: choice.enabled ? 'pointer' : 'not-allowed',
                    textAlign: 'left',
                    opacity: choice.enabled ? 1 : 0.5,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                    {choice.icon && (
                      <div style={{ fontSize: '32px' }}>{choice.icon}</div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          marginBottom: '8px',
                          color: '#333',
                        }}
                      >
                        {choice.text}
                      </div>
                      {choice.description && (
                        <div
                          style={{
                            fontSize: '14px',
                            color: '#666',
                            marginBottom: '10px',
                          }}
                        >
                          {choice.description}
                        </div>
                      )}
                      {sb.settings.showConsequences && choice.consequences && (
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          <strong>Consequences:</strong>{' '}
                          {choice.consequences.join(', ')}
                        </div>
                      )}
                      {choice.locked && choice.lockedReason && (
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#F44336',
                            marginTop: '8px',
                          }}
                        >
                          🔒 {choice.lockedReason}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backtrack Button */}
      {sb.settings.allowBacktracking &&
        sb.history.currentPath &&
        sb.history.currentPath.branches.length > 0 &&
        !sb.currentDecision && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sb.goBackToPreviousBranch()}
            style={{
              padding: '12px 24px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '20px',
            }}
          >
            ↩️ Go Back to Previous Decision
          </motion.button>
        )}

      {/* Branch History */}
      {sb.history.currentPath && sb.history.currentPath.branches.length > 0 && (
        <div
          style={{
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '2px solid #e0e0e0',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Your Journey</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sb.history.currentPath.branches.map((branch, index) => (
              <div
                key={branch.id}
                style={{
                  padding: '12px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '6px',
                  borderLeft: '4px solid #4CAF50',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  Decision {index + 1}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {branch.fromSceneId} → {branch.toSceneId}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics */}
      {sb.settings.trackAnalytics && sb.history.totalBranches > 0 && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
          }}
        >
          <h4 style={{ marginTop: 0 }}>Statistics</h4>
          <div style={{ fontSize: '14px', color: '#666' }}>
            <div>Total Branches: {sb.history.totalBranches}</div>
            <div>Unique Scenes: {sb.history.uniqueScenes.size}</div>
            <div>Paths Completed: {sb.history.paths.filter((p) => p.completed).length}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SceneBranching;
