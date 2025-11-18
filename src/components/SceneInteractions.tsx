import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SceneInteractions Component
 *
 * Interactive elements system for typing practice scenes.
 * Handles user interactions, scene controls, clickable elements,
 * tooltips, hints, and interactive feedback.
 *
 * Features:
 * - Clickable interactive elements
 * - Hover tooltips and hints
 * - Scene pause/resume controls
 * - Skip/repeat functionality
 * - Interactive character dialogues
 * - Choice selections in scenes
 * - Progress indicators
 * - Keyboard shortcuts
 * - Touch/click interaction tracking
 * - Accessibility controls (focus management)
 */

// Types for interactions
export type InteractionType =
  | 'click'
  | 'hover'
  | 'keyboard'
  | 'choice'
  | 'dialogue'
  | 'control'
  | 'hint';

export type InteractionState = 'idle' | 'hover' | 'active' | 'disabled' | 'completed';

export interface InteractiveElement {
  id: string;
  type: InteractionType;
  label: string;
  description?: string;
  position: { x: number; y: number };
  state: InteractionState;
  enabled: boolean;
  icon?: string;
  tooltip?: string;
  action: () => void;
  hotkey?: string;
}

export interface Choice {
  id: string;
  text: string;
  description?: string;
  icon?: string;
  consequence?: string;
  enabled: boolean;
}

export interface Dialogue {
  id: string;
  speaker: string;
  text: string;
  emotion?: 'happy' | 'neutral' | 'thinking' | 'excited' | 'concerned';
  timestamp: Date;
  choices?: Choice[];
}

export interface SceneControls {
  canPause: boolean;
  canResume: boolean;
  canSkip: boolean;
  canRepeat: boolean;
  canRewind: boolean;
  canFastForward: boolean;
}

export interface InteractionHistory {
  id: string;
  type: InteractionType;
  elementId: string;
  timestamp: Date;
  data?: any;
}

export interface InteractionSettings {
  enabled: boolean;
  showTooltips: boolean;
  tooltipDelay: number; // milliseconds
  showHotkeys: boolean;
  hapticFeedback: boolean;
  soundFeedback: boolean;
  trackInteractions: boolean;
  keyboardNavigation: boolean;
  touchEnabled: boolean;
}

// Custom hook for scene interactions
export function useSceneInteractions(initialSettings?: Partial<InteractionSettings>) {
  const [settings, setSettings] = useState<InteractionSettings>({
    enabled: true,
    showTooltips: true,
    tooltipDelay: 500,
    showHotkeys: true,
    hapticFeedback: false,
    soundFeedback: false,
    trackInteractions: true,
    keyboardNavigation: true,
    touchEnabled: true,
    ...initialSettings,
  });

  const [elements, setElements] = useState<InteractiveElement[]>([]);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [history, setHistory] = useState<InteractionHistory[]>([]);
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [currentDialogue, setCurrentDialogue] = useState<Dialogue | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [controls, setControls] = useState<SceneControls>({
    canPause: true,
    canResume: true,
    canSkip: true,
    canRepeat: true,
    canRewind: false,
    canFastForward: false,
  });

  const updateSettings = useCallback((newSettings: Partial<InteractionSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const registerElement = useCallback((element: InteractiveElement) => {
    setElements((prev) => {
      const exists = prev.find((e) => e.id === element.id);
      if (exists) {
        return prev.map((e) => (e.id === element.id ? element : e));
      }
      return [...prev, element];
    });
  }, []);

  const unregisterElement = useCallback((elementId: string) => {
    setElements((prev) => prev.filter((e) => e.id !== elementId));
  }, []);

  const handleInteraction = useCallback(
    (elementId: string, type: InteractionType, data?: any) => {
      if (!settings.enabled) return;

      const element = elements.find((e) => e.id === elementId);
      if (!element || !element.enabled) return;

      // Execute action
      element.action();

      // Track interaction
      if (settings.trackInteractions) {
        const interaction: InteractionHistory = {
          id: `interaction-${Date.now()}`,
          type,
          elementId,
          timestamp: new Date(),
          data,
        };
        setHistory((prev) => [...prev, interaction]);
      }

      // Provide feedback
      if (settings.hapticFeedback && navigator.vibrate) {
        navigator.vibrate(10);
      }

      setActiveElement(elementId);
      setTimeout(() => setActiveElement(null), 200);
    },
    [settings, elements]
  );

  const handleHover = useCallback(
    (elementId: string | null) => {
      if (!settings.enabled || !settings.showTooltips) return;
      setHoveredElement(elementId);
    },
    [settings]
  );

  const addDialogue = useCallback((dialogue: Dialogue) => {
    setDialogues((prev) => [...prev, dialogue]);
    setCurrentDialogue(dialogue);
  }, []);

  const clearDialogue = useCallback(() => {
    setCurrentDialogue(null);
  }, []);

  const handleChoice = useCallback(
    (choiceId: string) => {
      if (!currentDialogue) return;

      const choice = currentDialogue.choices?.find((c) => c.id === choiceId);
      if (!choice || !choice.enabled) return;

      handleInteraction(choiceId, 'choice', { dialogueId: currentDialogue.id, choice });

      // Clear dialogue after choice
      setTimeout(() => {
        clearDialogue();
      }, 500);
    },
    [currentDialogue, handleInteraction, clearDialogue]
  );

  const pause = useCallback(() => {
    if (controls.canPause) {
      setIsPaused(true);
    }
  }, [controls.canPause]);

  const resume = useCallback(() => {
    if (controls.canResume) {
      setIsPaused(false);
    }
  }, [controls.canResume]);

  const skip = useCallback(() => {
    if (controls.canSkip) {
      handleInteraction('skip', 'control');
    }
  }, [controls.canSkip, handleInteraction]);

  const repeat = useCallback(() => {
    if (controls.canRepeat) {
      handleInteraction('repeat', 'control');
    }
  }, [controls.canRepeat, handleInteraction]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!settings.enabled || !settings.keyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Space: pause/resume
      if (e.code === 'Space' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (isPaused) {
          resume();
        } else {
          pause();
        }
      }

      // Escape: skip
      if (e.code === 'Escape') {
        skip();
      }

      // R: repeat
      if (e.code === 'KeyR' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        repeat();
      }

      // Number keys for choices
      if (currentDialogue?.choices && /^Digit[1-9]$/.test(e.code)) {
        const index = parseInt(e.code.replace('Digit', '')) - 1;
        const choice = currentDialogue.choices[index];
        if (choice) {
          handleChoice(choice.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    settings,
    isPaused,
    currentDialogue,
    pause,
    resume,
    skip,
    repeat,
    handleChoice,
  ]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    settings,
    updateSettings,
    elements,
    hoveredElement,
    activeElement,
    history,
    dialogues,
    currentDialogue,
    isPaused,
    controls,
    setControls,
    registerElement,
    unregisterElement,
    handleInteraction,
    handleHover,
    addDialogue,
    clearDialogue,
    handleChoice,
    pause,
    resume,
    skip,
    repeat,
    clearHistory,
  };
}

// Main component
interface SceneInteractionsProps {
  children?: React.ReactNode;
  onPause?: () => void;
  onResume?: () => void;
  onSkip?: () => void;
  onRepeat?: () => void;
  initialSettings?: Partial<InteractionSettings>;
}

const SceneInteractions: React.FC<SceneInteractionsProps> = ({
  children,
  onPause,
  onResume,
  onSkip,
  onRepeat,
  initialSettings,
}) => {
  const si = useSceneInteractions(initialSettings);
  const containerRef = useRef<HTMLDivElement>(null);

  // Example interactive elements
  useEffect(() => {
    si.registerElement({
      id: 'pause-btn',
      type: 'control',
      label: 'Pause',
      position: { x: 10, y: 10 },
      state: 'idle',
      enabled: si.controls.canPause && !si.isPaused,
      icon: '⏸️',
      tooltip: 'Pause scene (Space)',
      hotkey: 'Space',
      action: () => {
        si.pause();
        onPause?.();
      },
    });

    si.registerElement({
      id: 'resume-btn',
      type: 'control',
      label: 'Resume',
      position: { x: 10, y: 10 },
      state: 'idle',
      enabled: si.controls.canResume && si.isPaused,
      icon: '▶️',
      tooltip: 'Resume scene (Space)',
      hotkey: 'Space',
      action: () => {
        si.resume();
        onResume?.();
      },
    });

    si.registerElement({
      id: 'skip-btn',
      type: 'control',
      label: 'Skip',
      position: { x: 60, y: 10 },
      state: 'idle',
      enabled: si.controls.canSkip,
      icon: '⏭️',
      tooltip: 'Skip scene (Esc)',
      hotkey: 'Esc',
      action: () => {
        si.skip();
        onSkip?.();
      },
    });

    si.registerElement({
      id: 'repeat-btn',
      type: 'control',
      label: 'Repeat',
      position: { x: 110, y: 10 },
      state: 'idle',
      enabled: si.controls.canRepeat,
      icon: '🔄',
      tooltip: 'Repeat scene (Ctrl+R)',
      hotkey: 'Ctrl+R',
      action: () => {
        si.repeat();
        onRepeat?.();
      },
    });
  }, [si, onPause, onResume, onSkip, onRepeat]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '400px',
      }}
    >
      {/* Control Buttons */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          display: 'flex',
          gap: '10px',
          zIndex: 50,
        }}
      >
        {si.elements
          .filter((e) => e.type === 'control' && e.enabled)
          .map((element) => (
            <motion.button
              key={element.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => si.handleInteraction(element.id, element.type)}
              onMouseEnter={() => si.handleHover(element.id)}
              onMouseLeave={() => si.handleHover(null)}
              style={{
                padding: '10px 16px',
                backgroundColor:
                  si.activeElement === element.id
                    ? '#1976D2'
                    : si.hoveredElement === element.id
                    ? '#2196F3'
                    : '#42A5F5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              {element.icon && <span>{element.icon}</span>}
              <span>{element.label}</span>
            </motion.button>
          ))}
      </div>

      {/* Tooltips */}
      <AnimatePresence>
        {si.hoveredElement && si.settings.showTooltips && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: si.settings.tooltipDelay / 1000 }}
            style={{
              position: 'absolute',
              top: '60px',
              left: '10px',
              backgroundColor: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              zIndex: 100,
              pointerEvents: 'none',
              maxWidth: '200px',
            }}
          >
            {si.elements.find((e) => e.id === si.hoveredElement)?.tooltip}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialogue Box */}
      <AnimatePresence>
        {si.currentDialogue && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '90%',
              maxWidth: '600px',
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              zIndex: 50,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '12px',
              }}
            >
              <div style={{ fontSize: '32px', marginRight: '12px' }}>
                {si.currentDialogue.emotion === 'happy' && '😊'}
                {si.currentDialogue.emotion === 'neutral' && '😐'}
                {si.currentDialogue.emotion === 'thinking' && '🤔'}
                {si.currentDialogue.emotion === 'excited' && '🤩'}
                {si.currentDialogue.emotion === 'concerned' && '😟'}
                {!si.currentDialogue.emotion && '💬'}
              </div>
              <div>
                <strong style={{ fontSize: '16px' }}>
                  {si.currentDialogue.speaker}
                </strong>
              </div>
            </div>

            <div style={{ marginBottom: '16px', fontSize: '14px', lineHeight: '1.6' }}>
              {si.currentDialogue.text}
            </div>

            {/* Choices */}
            {si.currentDialogue.choices && si.currentDialogue.choices.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {si.currentDialogue.choices.map((choice, index) => (
                  <motion.button
                    key={choice.id}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => si.handleChoice(choice.id)}
                    disabled={!choice.enabled}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: choice.enabled ? '#E3F2FD' : '#f5f5f5',
                      border: '2px solid #2196F3',
                      borderRadius: '8px',
                      cursor: choice.enabled ? 'pointer' : 'not-allowed',
                      textAlign: 'left',
                      fontSize: '14px',
                      opacity: choice.enabled ? 1 : 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    {si.settings.showHotkeys && (
                      <span
                        style={{
                          backgroundColor: '#2196F3',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                        }}
                      >
                        {index + 1}
                      </span>
                    )}
                    {choice.icon && <span style={{ fontSize: '18px' }}>{choice.icon}</span>}
                    <div style={{ flex: 1 }}>
                      <div>{choice.text}</div>
                      {choice.description && (
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#666',
                            marginTop: '4px',
                          }}
                        >
                          {choice.description}
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause Overlay */}
      <AnimatePresence>
        {si.isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 40,
            }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏸️</div>
              <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Paused</h2>
              <button
                onClick={() => {
                  si.resume();
                  onResume?.();
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                Resume
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>

      {/* Interaction Stats */}
      {si.history.length > 0 && si.settings.trackInteractions && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            backgroundColor: 'rgba(255,255,255,0.9)',
            padding: '10px',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#666',
            zIndex: 50,
          }}
        >
          Interactions: {si.history.length}
        </div>
      )}
    </div>
  );
};

export default SceneInteractions;
