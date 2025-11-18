import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation, Variants } from 'framer-motion';

/**
 * SceneAnimations Component
 *
 * Animation system for typing practice scenes in autism typing tutor.
 * Provides engaging visual feedback, character animations, environment effects,
 * and typing progress animations while maintaining sensory-friendly options.
 *
 * Features:
 * - Character entrance/exit animations
 * - Typing progress animations
 * - Environmental effects (particles, weather, etc.)
 * - Success celebration animations
 * - Error feedback animations
 * - Word appearance animations
 * - Scene transition effects
 * - Reduced motion support
 * - Customizable animation speeds
 * - Animation presets
 */

// Types for animations
export type AnimationType =
  | 'entrance'
  | 'exit'
  | 'typing'
  | 'success'
  | 'error'
  | 'celebration'
  | 'transition'
  | 'idle';

export type AnimationSpeed = 'slow' | 'normal' | 'fast';
export type AnimationIntensity = 'subtle' | 'moderate' | 'energetic';
export type ParticleType = 'stars' | 'confetti' | 'sparkles' | 'bubbles' | 'leaves' | 'snow';

export interface AnimationConfig {
  enabled: boolean;
  speed: AnimationSpeed;
  intensity: AnimationIntensity;
  reducedMotion: boolean;
  soundEffects: boolean;
  particleEffects: boolean;
  characterAnimations: boolean;
  environmentalEffects: boolean;
  feedbackAnimations: boolean;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  velocityX: number;
  velocityY: number;
  type: ParticleType;
}

export interface AnimationPreset {
  name: string;
  description: string;
  config: AnimationConfig;
  theme: string;
}

export interface CharacterAnimation {
  name: string;
  state: 'idle' | 'active' | 'happy' | 'thinking' | 'celebrating';
  position: { x: number; y: number };
  scale: number;
}

// Animation variants
const entranceVariants: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const exitVariants: Variants = {
  exit: {
    opacity: 0,
    y: -50,
    scale: 0.8,
    transition: {
      duration: 0.4,
      ease: 'easeIn',
    },
  },
};

const typingVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
    },
  },
  correct: {
    color: '#4CAF50',
    scale: 1.05,
    transition: {
      duration: 0.2,
    },
  },
  incorrect: {
    color: '#F44336',
    x: [0, -5, 5, -5, 5, 0],
    transition: {
      duration: 0.4,
    },
  },
};

const celebrationVariants: Variants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: [0, 1.2, 1],
    rotate: [- 180, 0],
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const pulseVariants: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Custom hook for scene animations
export function useSceneAnimations(initialConfig?: Partial<AnimationConfig>) {
  const [config, setConfig] = useState<AnimationConfig>({
    enabled: true,
    speed: 'normal',
    intensity: 'moderate',
    reducedMotion: false,
    soundEffects: false,
    particleEffects: true,
    characterAnimations: true,
    environmentalEffects: true,
    feedbackAnimations: true,
    ...initialConfig,
  });

  const [particles, setParticles] = useState<Particle[]>([]);
  const [characterState, setCharacterState] = useState<CharacterAnimation>({
    name: 'Guide',
    state: 'idle',
    position: { x: 50, y: 50 },
    scale: 1,
  });

  const controls = useAnimation();

  const updateConfig = useCallback((newConfig: Partial<AnimationConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  const getSpeedMultiplier = useCallback(() => {
    switch (config.speed) {
      case 'slow':
        return 1.5;
      case 'fast':
        return 0.5;
      default:
        return 1;
    }
  }, [config.speed]);

  const createParticles = useCallback(
    (type: ParticleType, count: number, position?: { x: number; y: number }) => {
      if (!config.particleEffects || config.reducedMotion) return;

      const newParticles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const particle: Particle = {
          id: `particle-${Date.now()}-${i}`,
          x: position?.x || Math.random() * 100,
          y: position?.y || Math.random() * 100,
          size: Math.random() * 10 + 5,
          color: getParticleColor(type),
          rotation: Math.random() * 360,
          velocityX: (Math.random() - 0.5) * 2,
          velocityY: Math.random() * -2 - 1,
          type,
        };

        newParticles.push(particle);
      }

      setParticles((prev) => [...prev, ...newParticles]);

      // Remove particles after animation
      setTimeout(() => {
        setParticles((prev) =>
          prev.filter((p) => !newParticles.find((np) => np.id === p.id))
        );
      }, 3000);
    },
    [config.particleEffects, config.reducedMotion]
  );

  const playEntranceAnimation = useCallback(async () => {
    if (!config.enabled || config.reducedMotion) return;

    await controls.start('visible');
  }, [config.enabled, config.reducedMotion, controls]);

  const playExitAnimation = useCallback(async () => {
    if (!config.enabled || config.reducedMotion) return;

    await controls.start('exit');
  }, [config.enabled, config.reducedMotion, controls]);

  const playSuccessAnimation = useCallback(() => {
    if (!config.feedbackAnimations || config.reducedMotion) return;

    if (config.particleEffects) {
      createParticles('stars', config.intensity === 'subtle' ? 5 : config.intensity === 'moderate' ? 10 : 20);
    }

    setCharacterState((prev) => ({ ...prev, state: 'celebrating' }));

    setTimeout(() => {
      setCharacterState((prev) => ({ ...prev, state: 'happy' }));
    }, 1000);
  }, [config, createParticles]);

  const playErrorAnimation = useCallback(() => {
    if (!config.feedbackAnimations) return;

    setCharacterState((prev) => ({ ...prev, state: 'thinking' }));

    setTimeout(() => {
      setCharacterState((prev) => ({ ...prev, state: 'idle' }));
    }, 800);
  }, [config.feedbackAnimations]);

  const playCelebrationAnimation = useCallback(() => {
    if (!config.enabled || config.reducedMotion) return;

    if (config.particleEffects) {
      createParticles('confetti', config.intensity === 'subtle' ? 10 : config.intensity === 'moderate' ? 20 : 40);
    }

    setCharacterState((prev) => ({ ...prev, state: 'celebrating' }));

    setTimeout(() => {
      setCharacterState((prev) => ({ ...prev, state: 'happy' }));
    }, 2000);
  }, [config, createParticles]);

  const setCharacterActive = useCallback(() => {
    if (!config.characterAnimations) return;

    setCharacterState((prev) => ({ ...prev, state: 'active' }));
  }, [config.characterAnimations]);

  const setCharacterIdle = useCallback(() => {
    if (!config.characterAnimations) return;

    setCharacterState((prev) => ({ ...prev, state: 'idle' }));
  }, [config.characterAnimations]);

  return {
    config,
    updateConfig,
    particles,
    characterState,
    controls,
    getSpeedMultiplier,
    createParticles,
    playEntranceAnimation,
    playExitAnimation,
    playSuccessAnimation,
    playErrorAnimation,
    playCelebrationAnimation,
    setCharacterActive,
    setCharacterIdle,
  };
}

// Helper function to get particle color
function getParticleColor(type: ParticleType): string {
  const colors: Record<ParticleType, string[]> = {
    stars: ['#FFD700', '#FFA500', '#FFFF00'],
    confetti: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
    sparkles: ['#E0BBE4', '#957DAD', '#D291BC', '#FEC8D8'],
    bubbles: ['#87CEEB', '#4682B4', '#5F9EA0', '#ADD8E6'],
    leaves: ['#90EE90', '#32CD32', '#228B22', '#9ACD32'],
    snow: ['#FFFFFF', '#F0F8FF', '#E6E6FA', '#FFFAFA'],
  };

  const colorArray = colors[type];
  return colorArray[Math.floor(Math.random() * colorArray.length)];
}

// Animation presets
const animationPresets: AnimationPreset[] = [
  {
    name: 'Calm & Gentle',
    description: 'Minimal animations, perfect for sensitivity to motion',
    config: {
      enabled: true,
      speed: 'slow',
      intensity: 'subtle',
      reducedMotion: true,
      soundEffects: false,
      particleEffects: false,
      characterAnimations: true,
      environmentalEffects: false,
      feedbackAnimations: true,
    },
    theme: 'calm',
  },
  {
    name: 'Balanced',
    description: 'Moderate animations for most users',
    config: {
      enabled: true,
      speed: 'normal',
      intensity: 'moderate',
      reducedMotion: false,
      soundEffects: false,
      particleEffects: true,
      characterAnimations: true,
      environmentalEffects: true,
      feedbackAnimations: true,
    },
    theme: 'balanced',
  },
  {
    name: 'Energetic',
    description: 'Full animations for engaging experience',
    config: {
      enabled: true,
      speed: 'fast',
      intensity: 'energetic',
      reducedMotion: false,
      soundEffects: true,
      particleEffects: true,
      characterAnimations: true,
      environmentalEffects: true,
      feedbackAnimations: true,
    },
    theme: 'energetic',
  },
  {
    name: 'No Motion',
    description: 'All animations disabled',
    config: {
      enabled: false,
      speed: 'normal',
      intensity: 'subtle',
      reducedMotion: true,
      soundEffects: false,
      particleEffects: false,
      characterAnimations: false,
      environmentalEffects: false,
      feedbackAnimations: false,
    },
    theme: 'static',
  },
];

// Main component
interface SceneAnimationsProps {
  children?: React.ReactNode;
  showCharacter?: boolean;
  showParticles?: boolean;
  initialConfig?: Partial<AnimationConfig>;
}

const SceneAnimations: React.FC<SceneAnimationsProps> = ({
  children,
  showCharacter = true,
  showParticles = true,
  initialConfig,
}) => {
  const sa = useSceneAnimations(initialConfig);

  const [selectedPreset, setSelectedPreset] = useState<AnimationPreset>(animationPresets[1]);
  const [showSettings, setShowSettings] = useState(false);

  const applyPreset = useCallback(
    (preset: AnimationPreset) => {
      setSelectedPreset(preset);
      sa.updateConfig(preset.config);
    },
    [sa]
  );

  useEffect(() => {
    sa.playEntranceAnimation();
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '400px' }}>
      {/* Settings Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowSettings(!showSettings)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '10px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          width: '40px',
          height: '40px',
          zIndex: 100,
        }}
      >
        ⚙️
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
              width: '300px',
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 100,
            }}
          >
            <h3 style={{ marginTop: 0 }}>Animation Settings</h3>

            {/* Presets */}
            <div style={{ marginBottom: '20px' }}>
              <h4>Presets:</h4>
              {animationPresets.map((preset) => (
                <motion.button
                  key={preset.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => applyPreset(preset)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px',
                    marginBottom: '8px',
                    backgroundColor:
                      selectedPreset.name === preset.name ? '#4CAF50' : '#f5f5f5',
                    color: selectedPreset.name === preset.name ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <strong>{preset.name}</strong>
                  <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.9 }}>
                    {preset.description}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Custom Settings */}
            <div>
              <h4>Custom Settings:</h4>

              <label style={{ display: 'block', marginBottom: '10px' }}>
                <input
                  type="checkbox"
                  checked={sa.config.particleEffects}
                  onChange={(e) =>
                    sa.updateConfig({ particleEffects: e.target.checked })
                  }
                  style={{ marginRight: '10px' }}
                />
                Particle Effects
              </label>

              <label style={{ display: 'block', marginBottom: '10px' }}>
                <input
                  type="checkbox"
                  checked={sa.config.characterAnimations}
                  onChange={(e) =>
                    sa.updateConfig({ characterAnimations: e.target.checked })
                  }
                  style={{ marginRight: '10px' }}
                />
                Character Animations
              </label>

              <label style={{ display: 'block', marginBottom: '10px' }}>
                <input
                  type="checkbox"
                  checked={sa.config.feedbackAnimations}
                  onChange={(e) =>
                    sa.updateConfig({ feedbackAnimations: e.target.checked })
                  }
                  style={{ marginRight: '10px' }}
                />
                Feedback Animations
              </label>

              <label style={{ display: 'block', marginBottom: '10px' }}>
                <input
                  type="checkbox"
                  checked={sa.config.reducedMotion}
                  onChange={(e) =>
                    sa.updateConfig({ reducedMotion: e.target.checked })
                  }
                  style={{ marginRight: '10px' }}
                />
                Reduced Motion
              </label>

              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  Animation Speed:
                </label>
                <select
                  value={sa.config.speed}
                  onChange={(e) =>
                    sa.updateConfig({ speed: e.target.value as AnimationSpeed })
                  }
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                  }}
                >
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
              </div>

              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  Animation Intensity:
                </label>
                <select
                  value={sa.config.intensity}
                  onChange={(e) =>
                    sa.updateConfig({ intensity: e.target.value as AnimationIntensity })
                  }
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '2px solid #ddd',
                    borderRadius: '6px',
                  }}
                >
                  <option value="subtle">Subtle</option>
                  <option value="moderate">Moderate</option>
                  <option value="energetic">Energetic</option>
                </select>
              </div>
            </div>

            {/* Test Buttons */}
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #ddd' }}>
              <h4>Test Animations:</h4>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => sa.playSuccessAnimation()}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Success
                </button>
                <button
                  onClick={() => sa.playErrorAnimation()}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#F44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Error
                </button>
                <button
                  onClick={() => sa.playCelebrationAnimation()}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#FF9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Celebrate
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particles Layer */}
      {showParticles && sa.config.particleEffects && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          <AnimatePresence>
            {sa.particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{
                  x: `${particle.x}%`,
                  y: `${particle.y}%`,
                  opacity: 1,
                  scale: 1,
                  rotate: particle.rotation,
                }}
                animate={{
                  x: `${particle.x + particle.velocityX * 50}%`,
                  y: `${particle.y + particle.velocityY * 50}%`,
                  opacity: 0,
                  scale: 0.5,
                  rotate: particle.rotation + 360,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  backgroundColor: particle.color,
                  borderRadius:
                    particle.type === 'bubbles' || particle.type === 'sparkles'
                      ? '50%'
                      : '0%',
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Character Layer */}
      {showCharacter && sa.config.characterAnimations && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: sa.characterState.scale,
          }}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            fontSize: '48px',
            zIndex: 10,
          }}
        >
          {sa.characterState.state === 'idle' && '😊'}
          {sa.characterState.state === 'active' && '🤔'}
          {sa.characterState.state === 'happy' && '😄'}
          {sa.characterState.state === 'thinking' && '🧐'}
          {sa.characterState.state === 'celebrating' && (
            <motion.span
              variants={celebrationVariants}
              initial="initial"
              animate="animate"
            >
              🎉
            </motion.span>
          )}
        </motion.div>
      )}

      {/* Content Layer */}
      <motion.div
        variants={{ ...entranceVariants, ...exitVariants }}
        initial="hidden"
        animate={sa.controls}
        exit="exit"
        style={{
          position: 'relative',
          zIndex: 1,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SceneAnimations;
export { entranceVariants, exitVariants, typingVariants, celebrationVariants, pulseVariants };
