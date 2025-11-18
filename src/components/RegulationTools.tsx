import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * RegulationTools Component
 *
 * Comprehensive emotional and sensory regulation toolkit for autism typing tutor.
 * Provides tools to help users manage emotions, energy levels, and sensory needs
 * during typing practice.
 *
 * Features:
 * - Emotion check-ins and tracking
 * - Energy level monitoring
 * - Sensory regulation tools
 * - Arousal level management (calm/alert spectrum)
 * - Coping strategies library
 * - Visual supports (emotion wheels, energy meters)
 * - Regulation history and patterns
 * - Personalized tool recommendations
 * - Quick access regulation interventions
 * - Emergency calm-down protocols
 */

// Types for regulation tools
export type EmotionType =
  | 'happy'
  | 'calm'
  | 'excited'
  | 'anxious'
  | 'frustrated'
  | 'overwhelmed'
  | 'tired'
  | 'focused'
  | 'confused'
  | 'proud';

export type EnergyLevel = 'very-low' | 'low' | 'moderate' | 'high' | 'very-high';
export type ArousalLevel = 'under-aroused' | 'optimal' | 'over-aroused';
export type ToolCategory = 'breathing' | 'movement' | 'sensory' | 'cognitive' | 'social' | 'environmental';

export interface EmotionCheckIn {
  id: string;
  timestamp: Date;
  emotions: EmotionType[];
  intensity: number; // 1-10
  energyLevel: EnergyLevel;
  arousalLevel: ArousalLevel;
  triggers?: string[];
  notes?: string;
}

export interface RegulationTool {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  instructions: string[];
  duration: number; // seconds
  icon: string;
  bestFor: {
    emotions: EmotionType[];
    arousalLevels: ArousalLevel[];
    energyLevels: EnergyLevel[];
  };
  difficulty: 'easy' | 'moderate' | 'advanced';
  equipmentNeeded?: string[];
  visualSupport?: string;
}

export interface RegulationSession {
  id: string;
  toolUsed: RegulationTool;
  startedAt: Date;
  completedAt?: Date;
  beforeCheckIn: EmotionCheckIn;
  afterCheckIn?: EmotionCheckIn;
  effectiveness: number; // 1-10
  wouldUseAgain: boolean;
  notes?: string;
}

export interface RegulationSettings {
  enabled: boolean;
  regularCheckIns: boolean;
  checkInInterval: number; // minutes
  showEmotionWheel: boolean;
  showEnergyMeter: boolean;
  autoSuggestTools: boolean;
  trackPatterns: boolean;
  quickAccessTools: string[]; // tool IDs
  emergencyProtocol: boolean;
}

export interface RegulationPatterns {
  mostUsedTools: string[];
  mostEffectiveTools: string[];
  commonEmotions: EmotionType[];
  commonTriggers: string[];
  optimalArousalTime: number; // percentage of time in optimal arousal
  regulationFrequency: number; // average uses per session
}

// Custom hook for regulation tools
export function useRegulationTools(initialSettings?: Partial<RegulationSettings>) {
  const [settings, setSettings] = useState<RegulationSettings>({
    enabled: true,
    regularCheckIns: true,
    checkInInterval: 15,
    showEmotionWheel: true,
    showEnergyMeter: true,
    autoSuggestTools: true,
    trackPatterns: true,
    quickAccessTools: ['box-breathing', 'finger-tapping', 'grounding-5-4-3-2-1'],
    emergencyProtocol: true,
    ...initialSettings,
  });

  const [checkIns, setCheckIns] = useState<EmotionCheckIn[]>([]);
  const [currentCheckIn, setCurrentCheckIn] = useState<EmotionCheckIn | null>(null);
  const [sessions, setSessions] = useState<RegulationSession[]>([]);
  const [currentSession, setCurrentSession] = useState<RegulationSession | null>(null);
  const [patterns, setPatterns] = useState<RegulationPatterns>({
    mostUsedTools: [],
    mostEffectiveTools: [],
    commonEmotions: [],
    commonTriggers: [],
    optimalArousalTime: 0,
    regulationFrequency: 0,
  });
  const [timeSinceLastCheckIn, setTimeSinceLastCheckIn] = useState(0);

  const updateSettings = useCallback((newSettings: Partial<RegulationSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const createCheckIn = useCallback(
    (
      emotions: EmotionType[],
      intensity: number,
      energyLevel: EnergyLevel,
      arousalLevel: ArousalLevel,
      triggers?: string[],
      notes?: string
    ) => {
      const checkIn: EmotionCheckIn = {
        id: `checkin-${Date.now()}`,
        timestamp: new Date(),
        emotions,
        intensity,
        energyLevel,
        arousalLevel,
        triggers,
        notes,
      };

      setCheckIns((prev) => [...prev, checkIn]);
      setCurrentCheckIn(checkIn);
      setTimeSinceLastCheckIn(0);

      return checkIn;
    },
    []
  );

  const startRegulationSession = useCallback(
    (tool: RegulationTool, beforeCheckIn: EmotionCheckIn) => {
      const session: RegulationSession = {
        id: `session-${Date.now()}`,
        toolUsed: tool,
        startedAt: new Date(),
        beforeCheckIn,
        effectiveness: 0,
        wouldUseAgain: false,
      };

      setSessions((prev) => [...prev, session]);
      setCurrentSession(session);

      return session.id;
    },
    []
  );

  const completeRegulationSession = useCallback(
    (
      sessionId: string,
      afterCheckIn: EmotionCheckIn,
      effectiveness: number,
      wouldUseAgain: boolean,
      notes?: string
    ) => {
      const completedSession = sessions.find((s) => s.id === sessionId);
      if (!completedSession) return;

      const updatedSession: RegulationSession = {
        ...completedSession,
        completedAt: new Date(),
        afterCheckIn,
        effectiveness,
        wouldUseAgain,
        notes,
      };

      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? updatedSession : s))
      );

      setCurrentSession(null);

      if (settings.trackPatterns) {
        updatePatterns();
      }
    },
    [sessions, settings.trackPatterns]
  );

  const updatePatterns = useCallback(() => {
    setPatterns((prev) => {
      // Update most used tools
      const toolCounts = sessions.reduce((acc, s) => {
        const toolId = s.toolUsed.id;
        acc[toolId] = (acc[toolId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostUsed = Object.entries(toolCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map((entry) => entry[0]);

      // Update most effective tools
      const effectiveTools = sessions
        .filter((s) => s.effectiveness >= 7 && s.wouldUseAgain)
        .map((s) => s.toolUsed.id);

      // Update common emotions
      const emotionCounts = checkIns.reduce((acc, ci) => {
        ci.emotions.forEach((emotion) => {
          acc[emotion] = (acc[emotion] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);

      const commonEmotions = Object.entries(emotionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map((entry) => entry[0] as EmotionType);

      // Calculate optimal arousal time
      const optimalCount = checkIns.filter(
        (ci) => ci.arousalLevel === 'optimal'
      ).length;
      const optimalPercentage =
        checkIns.length > 0 ? (optimalCount / checkIns.length) * 100 : 0;

      return {
        ...prev,
        mostUsedTools: mostUsed,
        mostEffectiveTools: effectiveTools,
        commonEmotions,
        optimalArousalTime: optimalPercentage,
        regulationFrequency: sessions.length,
      };
    });
  }, [sessions, checkIns]);

  const getRecommendedTools = useCallback(
    (checkIn: EmotionCheckIn): RegulationTool[] => {
      return regulationTools.filter((tool) => {
        const emotionMatch = tool.bestFor.emotions.some((e) =>
          checkIn.emotions.includes(e)
        );
        const arousalMatch = tool.bestFor.arousalLevels.includes(
          checkIn.arousalLevel
        );
        const energyMatch = tool.bestFor.energyLevels.includes(
          checkIn.energyLevel
        );

        return emotionMatch || arousalMatch || energyMatch;
      });
    },
    []
  );

  // Check-in timer effect
  useEffect(() => {
    if (!settings.enabled || !settings.regularCheckIns) return;

    const interval = setInterval(() => {
      setTimeSinceLastCheckIn((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [settings.enabled, settings.regularCheckIns]);

  return {
    settings,
    updateSettings,
    checkIns,
    currentCheckIn,
    sessions,
    currentSession,
    patterns,
    timeSinceLastCheckIn,
    createCheckIn,
    startRegulationSession,
    completeRegulationSession,
    getRecommendedTools,
  };
}

// Regulation tools library
const regulationTools: RegulationTool[] = [
  {
    id: 'box-breathing',
    name: 'Box Breathing',
    category: 'breathing',
    description: 'Calm your nervous system with 4-4-4-4 breathing',
    instructions: [
      'Breathe in for 4 counts',
      'Hold for 4 counts',
      'Breathe out for 4 counts',
      'Hold for 4 counts',
      'Repeat 4-6 times',
    ],
    duration: 120,
    icon: '🌬️',
    bestFor: {
      emotions: ['anxious', 'overwhelmed', 'frustrated'],
      arousalLevels: ['over-aroused'],
      energyLevels: ['high', 'very-high'],
    },
    difficulty: 'easy',
  },
  {
    id: 'finger-tapping',
    name: 'Bilateral Finger Tapping',
    category: 'movement',
    description: 'Alternating finger taps to calm and focus',
    instructions: [
      'Sit comfortably',
      'Tap left fingers on left leg',
      'Then tap right fingers on right leg',
      'Alternate slowly and rhythmically',
      'Continue for 2-3 minutes',
    ],
    duration: 180,
    icon: '👆',
    bestFor: {
      emotions: ['anxious', 'overwhelmed', 'confused'],
      arousalLevels: ['over-aroused'],
      energyLevels: ['moderate', 'high'],
    },
    difficulty: 'easy',
  },
  {
    id: 'grounding-5-4-3-2-1',
    name: '5-4-3-2-1 Grounding',
    category: 'sensory',
    description: 'Use your senses to ground yourself in the present',
    instructions: [
      'Name 5 things you can see',
      'Name 4 things you can touch',
      'Name 3 things you can hear',
      'Name 2 things you can smell',
      'Name 1 thing you can taste',
    ],
    duration: 180,
    icon: '👁️',
    bestFor: {
      emotions: ['overwhelmed', 'anxious', 'confused'],
      arousalLevels: ['over-aroused'],
      energyLevels: ['moderate', 'high', 'very-high'],
    },
    difficulty: 'easy',
  },
  {
    id: 'progressive-muscle',
    name: 'Progressive Muscle Relaxation',
    category: 'movement',
    description: 'Tense and relax muscle groups to release tension',
    instructions: [
      'Start with your feet - tense for 5 seconds',
      'Release and notice the relaxation',
      'Move up to calves, thighs, abdomen',
      'Continue through arms, shoulders, face',
      'Notice the difference between tense and relaxed',
    ],
    duration: 300,
    icon: '💪',
    bestFor: {
      emotions: ['anxious', 'frustrated', 'overwhelmed'],
      arousalLevels: ['over-aroused'],
      energyLevels: ['high', 'very-high'],
    },
    difficulty: 'moderate',
  },
  {
    id: 'energy-boost',
    name: 'Quick Energy Boost',
    category: 'movement',
    description: 'Movement activities to increase alertness',
    instructions: [
      'Stand up and stretch tall',
      'Do 10 jumping jacks or arm circles',
      'Take 5 deep, energizing breaths',
      'Shake out your arms and legs',
      'Drink some water',
    ],
    duration: 120,
    icon: '⚡',
    bestFor: {
      emotions: ['tired'],
      arousalLevels: ['under-aroused'],
      energyLevels: ['very-low', 'low'],
    },
    difficulty: 'easy',
  },
  {
    id: 'thought-sorting',
    name: 'Thought Sorting',
    category: 'cognitive',
    description: 'Organize overwhelming thoughts',
    instructions: [
      'Name what you\'re thinking about',
      'Sort thoughts into: helpful vs. unhelpful',
      'For helpful thoughts, what action can you take?',
      'For unhelpful thoughts, can you let them go?',
      'Focus on one helpful thought to act on',
    ],
    duration: 240,
    icon: '🧠',
    bestFor: {
      emotions: ['confused', 'overwhelmed', 'anxious'],
      arousalLevels: ['over-aroused'],
      energyLevels: ['moderate', 'high'],
    },
    difficulty: 'moderate',
  },
  {
    id: 'safe-place-visualization',
    name: 'Safe Place Visualization',
    category: 'cognitive',
    description: 'Imagine a calming, safe place',
    instructions: [
      'Close your eyes if comfortable',
      'Think of a place where you feel safe and calm',
      'Notice what you see there',
      'Notice what sounds you hear',
      'Notice how your body feels in this safe place',
      'Stay there for a few minutes',
    ],
    duration: 300,
    icon: '🏝️',
    bestFor: {
      emotions: ['anxious', 'overwhelmed', 'frustrated'],
      arousalLevels: ['over-aroused'],
      energyLevels: ['moderate', 'high', 'very-high'],
    },
    difficulty: 'moderate',
  },
  {
    id: 'sensory-toolkit',
    name: 'Sensory Toolkit Use',
    category: 'sensory',
    description: 'Use sensory items for regulation',
    instructions: [
      'Choose a sensory item (fidget, texture, etc.)',
      'Focus on how it feels',
      'Notice the texture, temperature, weight',
      'Use it in a way that feels regulating',
      'Continue until you feel more regulated',
    ],
    duration: 180,
    icon: '🎨',
    bestFor: {
      emotions: ['anxious', 'overwhelmed', 'frustrated', 'focused'],
      arousalLevels: ['over-aroused', 'under-aroused'],
      energyLevels: ['very-low', 'low', 'moderate', 'high', 'very-high'],
    },
    difficulty: 'easy',
    equipmentNeeded: ['Sensory items (fidgets, textures, etc.)'],
  },
  {
    id: 'movement-break',
    name: 'Movement Break',
    category: 'movement',
    description: 'Take a short movement break',
    instructions: [
      'Stand up from your workspace',
      'Walk around for 2-3 minutes',
      'Do some gentle stretches',
      'Roll your shoulders and neck',
      'Return when ready',
    ],
    duration: 180,
    icon: '🚶',
    bestFor: {
      emotions: ['tired', 'frustrated', 'overwhelmed'],
      arousalLevels: ['under-aroused', 'over-aroused'],
      energyLevels: ['very-low', 'low', 'very-high'],
    },
    difficulty: 'easy',
  },
  {
    id: 'environmental-adjust',
    name: 'Environmental Adjustment',
    category: 'environmental',
    description: 'Modify your environment for better regulation',
    instructions: [
      'Check lighting - adjust if needed',
      'Check noise levels - reduce if needed',
      'Check temperature - adjust if needed',
      'Check seating comfort - adjust position',
      'Remove visual distractions if needed',
    ],
    duration: 120,
    icon: '🏠',
    bestFor: {
      emotions: ['overwhelmed', 'frustrated', 'confused'],
      arousalLevels: ['over-aroused'],
      energyLevels: ['moderate', 'high', 'very-high'],
    },
    difficulty: 'easy',
  },
];

// Main component
interface RegulationToolsProps {
  onRegulationStart?: () => void;
  onRegulationEnd?: () => void;
  initialSettings?: Partial<RegulationSettings>;
}

const RegulationTools: React.FC<RegulationToolsProps> = ({
  onRegulationStart,
  onRegulationEnd,
  initialSettings,
}) => {
  const rt = useRegulationTools(initialSettings);

  const [showCheckIn, setShowCheckIn] = useState(false);
  const [selectedEmotions, setSelectedEmotions] = useState<EmotionType[]>([]);
  const [intensity, setIntensity] = useState(5);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('moderate');
  const [arousalLevel, setArousalLevel] = useState<ArousalLevel>('optimal');
  const [showTools, setShowTools] = useState(false);
  const [recommendedTools, setRecommendedTools] = useState<RegulationTool[]>([]);

  const handleCheckIn = useCallback(() => {
    const checkIn = rt.createCheckIn(
      selectedEmotions,
      intensity,
      energyLevel,
      arousalLevel
    );

    if (rt.settings.autoSuggestTools) {
      const tools = rt.getRecommendedTools(checkIn);
      setRecommendedTools(tools);
      setShowTools(true);
    }

    setShowCheckIn(false);
    setSelectedEmotions([]);
    setIntensity(5);
  }, [rt, selectedEmotions, intensity, energyLevel, arousalLevel]);

  const handleStartTool = useCallback(
    (tool: RegulationTool) => {
      if (!rt.currentCheckIn) return;

      rt.startRegulationSession(tool, rt.currentCheckIn);
      onRegulationStart?.();
    },
    [rt, onRegulationStart]
  );

  const handleCompleteTool = useCallback(
    (effectiveness: number, wouldUseAgain: boolean) => {
      if (!rt.currentSession) return;

      const afterCheckIn = rt.createCheckIn(
        selectedEmotions,
        intensity,
        energyLevel,
        arousalLevel
      );

      rt.completeRegulationSession(
        rt.currentSession.id,
        afterCheckIn,
        effectiveness,
        wouldUseAgain
      );

      onRegulationEnd?.();
      setShowTools(false);
    },
    [rt, selectedEmotions, intensity, energyLevel, arousalLevel, onRegulationEnd]
  );

  const emotions: Array<{
    type: EmotionType;
    label: string;
    icon: string;
    color: string;
  }> = [
    { type: 'happy', label: 'Happy', icon: '😊', color: '#FFD700' },
    { type: 'calm', label: 'Calm', icon: '😌', color: '#87CEEB' },
    { type: 'excited', label: 'Excited', icon: '🤗', color: '#FF69B4' },
    { type: 'anxious', label: 'Anxious', icon: '😰', color: '#FFA500' },
    { type: 'frustrated', label: 'Frustrated', icon: '😤', color: '#FF4500' },
    { type: 'overwhelmed', label: 'Overwhelmed', icon: '😵', color: '#8B0000' },
    { type: 'tired', label: 'Tired', icon: '😴', color: '#708090' },
    { type: 'focused', label: 'Focused', icon: '🎯', color: '#32CD32' },
    { type: 'confused', label: 'Confused', icon: '😕', color: '#DDA0DD' },
    { type: 'proud', label: 'Proud', icon: '🌟', color: '#FFD700' },
  ];

  const shouldPromptCheckIn =
    rt.settings.regularCheckIns &&
    rt.timeSinceLastCheckIn >= rt.settings.checkInInterval * 60;

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Check-in Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowCheckIn(!showCheckIn)}
        style={{
          padding: '15px 30px',
          fontSize: '18px',
          backgroundColor: shouldPromptCheckIn ? '#FF6B6B' : '#4A90E2',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '20px',
          width: '100%',
        }}
      >
        {shouldPromptCheckIn ? '⏰ ' : ''}Check In - How Are You Feeling?
      </motion.button>

      {/* Check-in Form */}
      <AnimatePresence>
        {showCheckIn && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginBottom: '20px',
              padding: '25px',
              backgroundColor: '#f5f5f5',
              borderRadius: '12px',
            }}
          >
            <h3 style={{ marginTop: 0 }}>How are you feeling right now?</h3>

            {/* Emotion Wheel */}
            <div style={{ marginBottom: '20px' }}>
              <h4>Select your emotions (choose all that apply):</h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: '10px',
                }}
              >
                {emotions.map((emotion) => (
                  <motion.button
                    key={emotion.type}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedEmotions((prev) =>
                        prev.includes(emotion.type)
                          ? prev.filter((e) => e !== emotion.type)
                          : [...prev, emotion.type]
                      );
                    }}
                    style={{
                      padding: '15px',
                      backgroundColor: selectedEmotions.includes(emotion.type)
                        ? emotion.color
                        : 'white',
                      color: selectedEmotions.includes(emotion.type)
                        ? 'white'
                        : '#333',
                      border: `2px solid ${emotion.color}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: selectedEmotions.includes(emotion.type)
                        ? 'bold'
                        : 'normal',
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '5px' }}>
                      {emotion.icon}
                    </div>
                    {emotion.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Intensity Slider */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px' }}>
                <strong>Intensity:</strong> {intensity}/10
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            {/* Energy Level */}
            <div style={{ marginBottom: '20px' }}>
              <h4>Energy Level:</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {(['very-low', 'low', 'moderate', 'high', 'very-high'] as EnergyLevel[]).map(
                  (level) => (
                    <button
                      key={level}
                      onClick={() => setEnergyLevel(level)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor:
                          energyLevel === level ? '#4CAF50' : 'white',
                        color: energyLevel === level ? 'white' : '#333',
                        border: '2px solid #4CAF50',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      {level}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Arousal Level */}
            <div style={{ marginBottom: '20px' }}>
              <h4>Arousal Level:</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {(['under-aroused', 'optimal', 'over-aroused'] as ArousalLevel[]).map(
                  (level) => (
                    <button
                      key={level}
                      onClick={() => setArousalLevel(level)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor:
                          arousalLevel === level ? '#9C27B0' : 'white',
                        color: arousalLevel === level ? 'white' : '#333',
                        border: '2px solid #9C27B0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      {level}
                    </button>
                  )
                )}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCheckIn}
              disabled={selectedEmotions.length === 0}
              style={{
                padding: '15px 30px',
                fontSize: '16px',
                backgroundColor:
                  selectedEmotions.length === 0 ? '#ccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: selectedEmotions.length === 0 ? 'not-allowed' : 'pointer',
                width: '100%',
              }}
            >
              Submit Check-in
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommended Tools */}
      <AnimatePresence>
        {showTools && recommendedTools.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              marginBottom: '20px',
              padding: '25px',
              backgroundColor: '#E8F5E9',
              borderRadius: '12px',
            }}
          >
            <h3 style={{ marginTop: 0 }}>Recommended Regulation Tools</h3>
            <p>Based on how you're feeling, these tools might help:</p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '15px',
              }}
            >
              {recommendedTools.slice(0, 6).map((tool) => (
                <motion.div
                  key={tool.id}
                  whileHover={{ scale: 1.02 }}
                  style={{
                    padding: '20px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '2px solid #4CAF50',
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>
                    {tool.icon}
                  </div>
                  <h4 style={{ marginTop: 0, marginBottom: '10px' }}>
                    {tool.name}
                  </h4>
                  <p style={{ fontSize: '14px', marginBottom: '15px' }}>
                    {tool.description}
                  </p>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
                    Duration: {Math.floor(tool.duration / 60)} min
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStartTool(tool)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      width: '100%',
                    }}
                  >
                    Start Tool
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Session */}
      <AnimatePresence>
        {rt.currentSession && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              padding: '30px',
              backgroundColor: '#E3F2FD',
              borderRadius: '12px',
              marginBottom: '20px',
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              {rt.currentSession.toolUsed.icon} {rt.currentSession.toolUsed.name}
            </h2>
            <p style={{ fontSize: '16px' }}>
              {rt.currentSession.toolUsed.description}
            </p>

            <div
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px',
              }}
            >
              <h4 style={{ marginTop: 0 }}>Instructions:</h4>
              <ol>
                {rt.currentSession.toolUsed.instructions.map((instruction, idx) => (
                  <li key={idx} style={{ marginBottom: '10px' }}>
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Duration: {Math.floor(rt.currentSession.toolUsed.duration / 60)}{' '}
                minutes
              </div>
            </div>

            <div>
              <h4>How effective was this tool?</h4>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleCompleteTool(rating, rating >= 7)}
                    style={{
                      padding: '10px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      flex: 1,
                    }}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Access Tools */}
      {rt.settings.quickAccessTools.length > 0 && !rt.currentSession && (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Quick Access Tools</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {regulationTools
              .filter((tool) => rt.settings.quickAccessTools.includes(tool.id))
              .map((tool) => (
                <motion.button
                  key={tool.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleStartTool(tool)}
                  style={{
                    padding: '15px 20px',
                    backgroundColor: '#4A90E2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  {tool.icon} {tool.name}
                </motion.button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegulationTools;
