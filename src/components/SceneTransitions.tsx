import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * SceneTransitions Component
 *
 * Smooth transition system between typing practice scenes.
 * Handles scene changes with various transition effects while
 * maintaining accessibility and sensory-friendly options.
 *
 * Features:
 * - Multiple transition effects (fade, slide, zoom, blur, wipe)
 * - Directional transitions (left, right, up, down)
 * - Transition duration control
 * - Loading states during transitions
 * - Transition history tracking
 * - Customizable easing functions
 * - Reduced motion support
 * - Preload next scene option
 * - Transition callbacks
 * - Cross-fade transitions
 */

// Types for transitions
export type TransitionType = 'fade' | 'slide' | 'zoom' | 'blur' | 'wipe' | 'crossfade' | 'none';
export type TransitionDirection = 'left' | 'right' | 'up' | 'down';
export type TransitionSpeed = 'instant' | 'fast' | 'normal' | 'slow';
export type EasingFunction = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'spring';

export interface TransitionConfig {
  type: TransitionType;
  direction: TransitionDirection;
  speed: TransitionSpeed;
  easing: EasingFunction;
  reducedMotion: boolean;
  showLoadingIndicator: boolean;
  preloadNext: boolean;
  maintainScrollPosition: boolean;
}

export interface TransitionState {
  isTransitioning: boolean;
  fromScene: string | null;
  toScene: string | null;
  progress: number; // 0-100
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface TransitionHistory {
  id: string;
  fromScene: string;
  toScene: string;
  type: TransitionType;
  duration: number;
  timestamp: Date;
}

export interface TransitionCallbacks {
  onTransitionStart?: (from: string, to: string) => void;
  onTransitionProgress?: (progress: number) => void;
  onTransitionComplete?: (to: string) => void;
  onTransitionCancel?: (reason: string) => void;
}

// Transition duration mappings (in seconds)
const SPEED_DURATIONS: Record<TransitionSpeed, number> = {
  instant: 0,
  fast: 0.3,
  normal: 0.5,
  slow: 0.8,
};

// Custom hook for scene transitions
export function useSceneTransitions(
  initialConfig?: Partial<TransitionConfig>,
  callbacks?: TransitionCallbacks
) {
  const [config, setConfig] = useState<TransitionConfig>({
    type: 'fade',
    direction: 'right',
    speed: 'normal',
    easing: 'easeInOut',
    reducedMotion: false,
    showLoadingIndicator: true,
    preloadNext: false,
    maintainScrollPosition: false,
    ...initialConfig,
  });

  const [state, setState] = useState<TransitionState>({
    isTransitioning: false,
    fromScene: null,
    toScene: null,
    progress: 0,
    startedAt: null,
    completedAt: null,
  });

  const [history, setHistory] = useState<TransitionHistory[]>([]);
  const [currentScene, setCurrentScene] = useState<string>('');
  const [nextScenePreloaded, setNextScenePreloaded] = useState(false);

  const updateConfig = useCallback((newConfig: Partial<TransitionConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  const getDuration = useCallback(() => {
    if (config.reducedMotion) return 0;
    return SPEED_DURATIONS[config.speed];
  }, [config.speed, config.reducedMotion]);

  const getEasing = useCallback((): [number, number, number, number] => {
    const easings: Record<EasingFunction, [number, number, number, number]> = {
      linear: [0, 0, 1, 1],
      easeIn: [0.4, 0, 1, 1],
      easeOut: [0, 0, 0.2, 1],
      easeInOut: [0.4, 0, 0.2, 1],
      spring: [0.5, 1, 0.89, 1],
    };
    return easings[config.easing];
  }, [config.easing]);

  const startTransition = useCallback(
    async (fromScene: string, toScene: string): Promise<void> => {
      // Don't transition if already transitioning
      if (state.isTransitioning) {
        callbacks?.onTransitionCancel?.('Already transitioning');
        return;
      }

      const startTime = new Date();

      setState({
        isTransitioning: true,
        fromScene,
        toScene,
        progress: 0,
        startedAt: startTime,
        completedAt: null,
      });

      callbacks?.onTransitionStart?.(fromScene, toScene);

      // Simulate transition progress
      const duration = getDuration();
      const steps = 20;
      const stepDuration = (duration * 1000) / steps;

      for (let i = 0; i <= steps; i++) {
        await new Promise((resolve) => setTimeout(resolve, stepDuration));
        const progress = (i / steps) * 100;

        setState((prev) => ({ ...prev, progress }));
        callbacks?.onTransitionProgress?.(progress);
      }

      const completedTime = new Date();

      setState({
        isTransitioning: false,
        fromScene,
        toScene,
        progress: 100,
        startedAt: startTime,
        completedAt: completedTime,
      });

      // Add to history
      const historyEntry: TransitionHistory = {
        id: `transition-${Date.now()}`,
        fromScene,
        toScene,
        type: config.type,
        duration: duration * 1000,
        timestamp: completedTime,
      };

      setHistory((prev) => [...prev, historyEntry].slice(-50)); // Keep last 50

      setCurrentScene(toScene);
      callbacks?.onTransitionComplete?.(toScene);
    },
    [state.isTransitioning, config.type, getDuration, callbacks]
  );

  const cancelTransition = useCallback(
    (reason: string) => {
      if (!state.isTransitioning) return;

      setState({
        isTransitioning: false,
        fromScene: null,
        toScene: null,
        progress: 0,
        startedAt: null,
        completedAt: null,
      });

      callbacks?.onTransitionCancel?.(reason);
    },
    [state.isTransitioning, callbacks]
  );

  const preloadNextScene = useCallback(async (_sceneId: string) => {
    if (!config.preloadNext) return;

    // Simulate preloading
    await new Promise((resolve) => setTimeout(resolve, 100));
    setNextScenePreloaded(true);
  }, [config.preloadNext]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    config,
    updateConfig,
    state,
    history,
    currentScene,
    nextScenePreloaded,
    startTransition,
    cancelTransition,
    preloadNextScene,
    clearHistory,
    getDuration,
    getEasing,
  };
}

// Transition variant generators
function getFadeVariants(duration: number, easing: [number, number, number, number]) {
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration, ease: easing } },
    exit: { opacity: 0, transition: { duration, ease: easing } },
  };
}

function getSlideVariants(
  direction: TransitionDirection,
  duration: number,
  easing: [number, number, number, number]
) {
  const directions = {
    left: { x: '100%' },
    right: { x: '-100%' },
    up: { y: '100%' },
    down: { y: '-100%' },
  };

  const initial = directions[direction];

  return {
    initial,
    animate: { x: 0, y: 0, transition: { duration, ease: easing } },
    exit: {
      x: direction === 'left' ? '-100%' : direction === 'right' ? '100%' : 0,
      y: direction === 'up' ? '-100%' : direction === 'down' ? '100%' : 0,
      transition: { duration, ease: easing },
    },
  };
}

function getZoomVariants(duration: number, easing: [number, number, number, number]) {
  return {
    initial: { opacity: 0, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration, ease: easing },
    },
    exit: {
      opacity: 0,
      scale: 1.2,
      transition: { duration, ease: easing },
    },
  };
}

function getBlurVariants(duration: number, easing: [number, number, number, number]) {
  return {
    initial: { opacity: 0, filter: 'blur(10px)' },
    animate: {
      opacity: 1,
      filter: 'blur(0px)',
      transition: { duration, ease: easing },
    },
    exit: {
      opacity: 0,
      filter: 'blur(10px)',
      transition: { duration, ease: easing },
    },
  };
}

function getWipeVariants(
  direction: TransitionDirection,
  duration: number,
  easing: [number, number, number, number]
) {
  const clips = {
    left: {
      initial: 'inset(0 100% 0 0)',
      animate: 'inset(0 0% 0 0)',
      exit: 'inset(0 0 0 100%)',
    },
    right: {
      initial: 'inset(0 0 0 100%)',
      animate: 'inset(0 0% 0 0)',
      exit: 'inset(0 100% 0 0)',
    },
    up: {
      initial: 'inset(100% 0 0 0)',
      animate: 'inset(0% 0 0 0)',
      exit: 'inset(0 0 100% 0)',
    },
    down: {
      initial: 'inset(0 0 100% 0)',
      animate: 'inset(0% 0 0 0)',
      exit: 'inset(100% 0 0 0)',
    },
  };

  const clip = clips[direction];

  return {
    initial: { clipPath: clip.initial },
    animate: {
      clipPath: clip.animate,
      transition: { duration, ease: easing },
    },
    exit: {
      clipPath: clip.exit,
      transition: { duration, ease: easing },
    },
  };
}

// Main component
interface SceneTransitionsProps {
  children: React.ReactNode;
  sceneId: string;
  initialConfig?: Partial<TransitionConfig>;
  callbacks?: TransitionCallbacks;
}

const SceneTransitions: React.FC<SceneTransitionsProps> = ({
  children,
  sceneId,
  initialConfig,
  callbacks,
}) => {
  const st = useSceneTransitions(initialConfig, callbacks);
  const [showSettings, setShowSettings] = useState(false);
  const [previousSceneId, setPreviousSceneId] = useState(sceneId);

  // Detect scene change and trigger transition
  useEffect(() => {
    if (sceneId !== previousSceneId && previousSceneId) {
      st.startTransition(previousSceneId, sceneId);
      setPreviousSceneId(sceneId);
    } else if (!previousSceneId) {
      setPreviousSceneId(sceneId);
    }
  }, [sceneId, previousSceneId, st]);

  // Get transition variants based on config
  const getVariants = useCallback(() => {
    const duration = st.getDuration();
    const easing = st.getEasing();

    if (st.config.reducedMotion) {
      return getFadeVariants(0, easing);
    }

    switch (st.config.type) {
      case 'fade':
        return getFadeVariants(duration, easing);
      case 'slide':
        return getSlideVariants(st.config.direction, duration, easing);
      case 'zoom':
        return getZoomVariants(duration, easing);
      case 'blur':
        return getBlurVariants(duration, easing);
      case 'wipe':
        return getWipeVariants(st.config.direction, duration, easing);
      case 'crossfade':
        return getFadeVariants(duration, easing);
      case 'none':
        return getFadeVariants(0, easing);
      default:
        return getFadeVariants(duration, easing);
    }
  }, [st]);

  const variants = getVariants();

  const transitionTypes: Array<{
    type: TransitionType;
    label: string;
    icon: string;
  }> = [
    { type: 'fade', label: 'Fade', icon: '🌫️' },
    { type: 'slide', label: 'Slide', icon: '➡️' },
    { type: 'zoom', label: 'Zoom', icon: '🔍' },
    { type: 'blur', label: 'Blur', icon: '🌀' },
    { type: 'wipe', label: 'Wipe', icon: '🧹' },
    { type: 'crossfade', label: 'Crossfade', icon: '✨' },
    { type: 'none', label: 'None', icon: '🚫' },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100px' }}>
      {/* Settings Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowSettings(!showSettings)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '60px',
          padding: '10px',
          backgroundColor: '#9C27B0',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          width: '40px',
          height: '40px',
          zIndex: 100,
        }}
      >
        🔄
      </motion.button>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            style={{
              position: 'absolute',
              top: '60px',
              right: '10px',
              width: '320px',
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 100,
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <h3 style={{ marginTop: 0 }}>Transition Settings</h3>

            {/* Transition Type */}
            <div style={{ marginBottom: '20px' }}>
              <h4>Transition Type:</h4>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                }}
              >
                {transitionTypes.map((t) => (
                  <motion.button
                    key={t.type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => st.updateConfig({ type: t.type })}
                    style={{
                      padding: '10px',
                      backgroundColor:
                        st.config.type === t.type ? '#9C27B0' : '#f5f5f5',
                      color: st.config.type === t.type ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    {t.icon} {t.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Direction (for slide/wipe) */}
            {(st.config.type === 'slide' || st.config.type === 'wipe') && (
              <div style={{ marginBottom: '20px' }}>
                <h4>Direction:</h4>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(['left', 'right', 'up', 'down'] as TransitionDirection[]).map(
                    (dir) => (
                      <button
                        key={dir}
                        onClick={() => st.updateConfig({ direction: dir })}
                        style={{
                          padding: '8px 16px',
                          backgroundColor:
                            st.config.direction === dir ? '#9C27B0' : '#f5f5f5',
                          color: st.config.direction === dir ? 'white' : '#333',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        {dir}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Speed */}
            <div style={{ marginBottom: '20px' }}>
              <h4>Speed:</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['instant', 'fast', 'normal', 'slow'] as TransitionSpeed[]).map(
                  (speed) => (
                    <button
                      key={speed}
                      onClick={() => st.updateConfig({ speed })}
                      style={{
                        flex: 1,
                        padding: '8px',
                        backgroundColor:
                          st.config.speed === speed ? '#9C27B0' : '#f5f5f5',
                        color: st.config.speed === speed ? 'white' : '#333',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      {speed}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Easing */}
            <div style={{ marginBottom: '20px' }}>
              <h4>Easing:</h4>
              <select
                value={st.config.easing}
                onChange={(e) =>
                  st.updateConfig({ easing: e.target.value as EasingFunction })
                }
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px',
                }}
              >
                <option value="linear">Linear</option>
                <option value="easeIn">Ease In</option>
                <option value="easeOut">Ease Out</option>
                <option value="easeInOut">Ease In Out</option>
                <option value="spring">Spring</option>
              </select>
            </div>

            {/* Options */}
            <div style={{ marginBottom: '20px' }}>
              <h4>Options:</h4>

              <label style={{ display: 'block', marginBottom: '10px' }}>
                <input
                  type="checkbox"
                  checked={st.config.reducedMotion}
                  onChange={(e) =>
                    st.updateConfig({ reducedMotion: e.target.checked })
                  }
                  style={{ marginRight: '10px' }}
                />
                Reduced Motion
              </label>

              <label style={{ display: 'block', marginBottom: '10px' }}>
                <input
                  type="checkbox"
                  checked={st.config.showLoadingIndicator}
                  onChange={(e) =>
                    st.updateConfig({ showLoadingIndicator: e.target.checked })
                  }
                  style={{ marginRight: '10px' }}
                />
                Show Loading Indicator
              </label>

              <label style={{ display: 'block', marginBottom: '10px' }}>
                <input
                  type="checkbox"
                  checked={st.config.preloadNext}
                  onChange={(e) =>
                    st.updateConfig({ preloadNext: e.target.checked })
                  }
                  style={{ marginRight: '10px' }}
                />
                Preload Next Scene
              </label>
            </div>

            {/* Transition Stats */}
            {st.history.length > 0 && (
              <div
                style={{
                  marginTop: '20px',
                  paddingTop: '20px',
                  borderTop: '1px solid #ddd',
                }}
              >
                <h4>Statistics:</h4>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  <div>Total Transitions: {st.history.length}</div>
                  <div>
                    Average Duration:{' '}
                    {Math.round(
                      st.history.reduce((sum, h) => sum + h.duration, 0) /
                        st.history.length
                    )}
                    ms
                  </div>
                </div>
                <button
                  onClick={() => st.clearHistory()}
                  style={{
                    marginTop: '10px',
                    padding: '8px 16px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Clear History
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Indicator */}
      {st.state.isTransitioning && st.config.showLoadingIndicator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '20px 40px',
            borderRadius: '12px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
          <div>Transitioning...</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            {Math.round(st.state.progress)}%
          </div>
        </motion.div>
      )}

      {/* Transition Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={sceneId}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ width: '100%' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SceneTransitions;
