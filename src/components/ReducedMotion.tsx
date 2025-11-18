import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type MotionPreference = 'no-preference' | 'reduce' | 'custom';

export type AnimationType =
  | 'fade'
  | 'slide'
  | 'scale'
  | 'rotate'
  | 'bounce'
  | 'spring'
  | 'parallax'
  | 'morph';

export interface ReducedMotionSettings {
  enabled: boolean;
  respectSystemPreference: boolean;
  preference: MotionPreference;
  customSettings: {
    disableFade: boolean;
    disableSlide: boolean;
    disableScale: boolean;
    disableRotate: boolean;
    disableBounce: boolean;
    disableSpring: boolean;
    disableParallax: boolean;
    disableMorph: boolean;
  };
  animationDuration: number;
  transitionSpeed: number;
  allowEssentialMotion: boolean;
  allowHoverEffects: boolean;
  allowFocusIndicators: boolean;
}

export interface AnimationConfig {
  type: AnimationType;
  name: string;
  description: string;
  essential: boolean;
  defaultDuration: number;
  reducedDuration: number;
  canDisable: boolean;
  examples: string[];
}

export interface ReducedMotionStats {
  systemPreference: MotionPreference;
  animationsDisabled: number;
  animationsEnabled: number;
  lastUpdated: Date | null;
}

// ============================================================================
// Mock Data & Configurations
// ============================================================================

const animationConfigs: AnimationConfig[] = [
  {
    type: 'fade',
    name: 'Fade',
    description: 'Opacity transitions for appearing/disappearing elements',
    essential: false,
    defaultDuration: 300,
    reducedDuration: 0,
    canDisable: true,
    examples: ['Modal fade in', 'Tooltip appear', 'Message dismiss'],
  },
  {
    type: 'slide',
    name: 'Slide',
    description: 'Position-based transitions for moving elements',
    essential: false,
    defaultDuration: 400,
    reducedDuration: 0,
    canDisable: true,
    examples: ['Drawer open/close', 'Menu slide', 'Panel transitions'],
  },
  {
    type: 'scale',
    name: 'Scale',
    description: 'Size-based transitions for growing/shrinking elements',
    essential: false,
    defaultDuration: 300,
    reducedDuration: 0,
    canDisable: true,
    examples: ['Button press', 'Card hover', 'Image zoom'],
  },
  {
    type: 'rotate',
    name: 'Rotate',
    description: 'Rotation-based transitions',
    essential: false,
    defaultDuration: 300,
    reducedDuration: 0,
    canDisable: true,
    examples: ['Loading spinner', 'Icon animation', 'Flip card'],
  },
  {
    type: 'bounce',
    name: 'Bounce',
    description: 'Spring-based bouncing effects',
    essential: false,
    defaultDuration: 600,
    reducedDuration: 0,
    canDisable: true,
    examples: ['Notification appear', 'Button feedback', 'Alert bounce'],
  },
  {
    type: 'spring',
    name: 'Spring',
    description: 'Physics-based spring animations',
    essential: false,
    defaultDuration: 500,
    reducedDuration: 100,
    canDisable: true,
    examples: ['Interactive drag', 'Modal spring', 'Smooth transitions'],
  },
  {
    type: 'parallax',
    name: 'Parallax',
    description: 'Depth-based scrolling effects',
    essential: false,
    defaultDuration: 0,
    reducedDuration: 0,
    canDisable: true,
    examples: ['Background scroll', 'Hero effects', 'Layer movement'],
  },
  {
    type: 'morph',
    name: 'Morph',
    description: 'Shape and path transitions',
    essential: false,
    defaultDuration: 400,
    reducedDuration: 0,
    canDisable: true,
    examples: ['Icon morph', 'Shape transitions', 'SVG animations'],
  },
];

// ============================================================================
// Utility Functions
// ============================================================================

const detectSystemPreference = (): MotionPreference => {
  if (typeof window === 'undefined') return 'no-preference';

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches ? 'reduce' : 'no-preference';
};

// ============================================================================
// Custom Hook
// ============================================================================

export const useReducedMotion = (initialSettings?: Partial<ReducedMotionSettings>) => {
  const [systemPreference, setSystemPreference] = useState<MotionPreference>(
    detectSystemPreference()
  );

  const [settings, setSettings] = useState<ReducedMotionSettings>({
    enabled: true,
    respectSystemPreference: true,
    preference: 'no-preference',
    customSettings: {
      disableFade: false,
      disableSlide: false,
      disableScale: false,
      disableRotate: false,
      disableBounce: false,
      disableSpring: false,
      disableParallax: false,
      disableMorph: false,
    },
    animationDuration: 300,
    transitionSpeed: 1.0,
    allowEssentialMotion: true,
    allowHoverEffects: true,
    allowFocusIndicators: true,
    ...initialSettings,
  });

  const [stats, setStats] = useState<ReducedMotionStats>({
    systemPreference: detectSystemPreference(),
    animationsDisabled: 0,
    animationsEnabled: 0,
    lastUpdated: null,
  });

  // Determine if motion should be reduced
  const shouldReduceMotion = useCallback((): boolean => {
    if (!settings.enabled) return false;

    if (settings.respectSystemPreference && systemPreference === 'reduce') {
      return true;
    }

    return settings.preference === 'reduce';
  }, [settings.enabled, settings.respectSystemPreference, settings.preference, systemPreference]);

  // Check if specific animation type is allowed
  const isAnimationAllowed = useCallback(
    (type: AnimationType, isEssential: boolean = false): boolean => {
      if (!settings.enabled) return true;

      // Always allow essential motion if configured
      if (isEssential && settings.allowEssentialMotion) {
        return true;
      }

      // Check if motion should be reduced
      if (shouldReduceMotion()) {
        // Check custom settings
        switch (type) {
          case 'fade':
            return !settings.customSettings.disableFade;
          case 'slide':
            return !settings.customSettings.disableSlide;
          case 'scale':
            return !settings.customSettings.disableScale;
          case 'rotate':
            return !settings.customSettings.disableRotate;
          case 'bounce':
            return !settings.customSettings.disableBounce;
          case 'spring':
            return !settings.customSettings.disableSpring;
          case 'parallax':
            return !settings.customSettings.disableParallax;
          case 'morph':
            return !settings.customSettings.disableMorph;
          default:
            return false;
        }
      }

      return true;
    },
    [settings, shouldReduceMotion]
  );

  // Get animation duration
  const getAnimationDuration = useCallback(
    (defaultDuration: number, isEssential: boolean = false): number => {
      if (!settings.enabled) return defaultDuration;

      // Essential animations get reduced duration, not removed
      if (isEssential && shouldReduceMotion()) {
        return defaultDuration * 0.3;
      }

      // Non-essential animations get removed when motion is reduced
      if (shouldReduceMotion()) {
        return 0;
      }

      // Apply custom speed multiplier
      return defaultDuration * settings.transitionSpeed;
    },
    [settings.enabled, settings.transitionSpeed, shouldReduceMotion]
  );

  // Get Framer Motion variants
  const getMotionVariants = useCallback(
    (type: AnimationType, isEssential: boolean = false) => {
      const allowed = isAnimationAllowed(type, isEssential);
      const duration = getAnimationDuration(settings.animationDuration, isEssential) / 1000;

      if (!allowed || duration === 0) {
        return {
          initial: {},
          animate: {},
          exit: {},
        };
      }

      switch (type) {
        case 'fade':
          return {
            initial: { opacity: 0 },
            animate: { opacity: 1, transition: { duration } },
            exit: { opacity: 0, transition: { duration } },
          };
        case 'slide':
          return {
            initial: { x: -20, opacity: 0 },
            animate: { x: 0, opacity: 1, transition: { duration } },
            exit: { x: 20, opacity: 0, transition: { duration } },
          };
        case 'scale':
          return {
            initial: { scale: 0.9, opacity: 0 },
            animate: { scale: 1, opacity: 1, transition: { duration } },
            exit: { scale: 0.9, opacity: 0, transition: { duration } },
          };
        case 'rotate':
          return {
            initial: { rotate: -10, opacity: 0 },
            animate: { rotate: 0, opacity: 1, transition: { duration } },
            exit: { rotate: 10, opacity: 0, transition: { duration } },
          };
        default:
          return {
            initial: {},
            animate: {},
            exit: {},
          };
      }
    },
    [isAnimationAllowed, getAnimationDuration, settings.animationDuration]
  );

  // Update settings
  const updateSettings = useCallback((updates: Partial<ReducedMotionSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    setStats((prev) => ({ ...prev, lastUpdated: new Date() }));
  }, []);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;

    if (settings.enabled && shouldReduceMotion()) {
      root.style.setProperty('--animation-duration', `${getAnimationDuration(300)}ms`);
      root.style.setProperty('--transition-speed', `${settings.transitionSpeed}`);
      root.setAttribute('data-reduced-motion', 'true');
    } else {
      root.style.setProperty('--animation-duration', '300ms');
      root.style.setProperty('--transition-speed', '1');
      root.removeAttribute('data-reduced-motion');
    }
  }, [settings, shouldReduceMotion, getAnimationDuration]);

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent) => {
      const newPreference = e.matches ? 'reduce' : 'no-preference';
      setSystemPreference(newPreference);
      setStats((prev) => ({
        ...prev,
        systemPreference: newPreference,
        lastUpdated: new Date(),
      }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Calculate stats
  useEffect(() => {
    let animationsDisabled = 0;
    let animationsEnabled = 0;

    animationConfigs.forEach((config) => {
      if (isAnimationAllowed(config.type, config.essential)) {
        animationsEnabled++;
      } else {
        animationsDisabled++;
      }
    });

    setStats((prev) => ({
      ...prev,
      animationsDisabled,
      animationsEnabled,
    }));
  }, [settings, isAnimationAllowed]);

  return {
    settings,
    systemPreference,
    stats,
    configs: animationConfigs,
    shouldReduceMotion: shouldReduceMotion(),
    isAnimationAllowed,
    getAnimationDuration,
    getMotionVariants,
    updateSettings,
  };
};

// ============================================================================
// Component
// ============================================================================

export const ReducedMotion: React.FC = () => {
  const {
    settings,
    systemPreference,
    stats,
    configs,
    shouldReduceMotion,
    isAnimationAllowed,
    getAnimationDuration,
    getMotionVariants,
    updateSettings,
  } = useReducedMotion();

  const [activeTab, setActiveTab] = useState<'overview' | 'animations' | 'settings' | 'test'>(
    'overview'
  );
  const [testAnimation, setTestAnimation] = useState<AnimationType>('fade');
  const [showTestElement, setShowTestElement] = useState(false);

  // Run test animation
  const runTestAnimation = () => {
    setShowTestElement(false);
    setTimeout(() => {
      setShowTestElement(true);
    }, 100);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem' }}
      >
        <h1 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '2rem' }}>
          Reduced Motion
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '1rem' }}>
          Respect user preferences for reduced motion to prevent discomfort and accessibility issues
        </p>
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ margin: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>Settings</h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => updateSettings({ enabled: e.target.checked })}
            />
            <span>Enable Reduced Motion</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.respectSystemPreference}
              onChange={(e) => updateSettings({ respectSystemPreference: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Respect System Preference</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.allowEssentialMotion}
              onChange={(e) => updateSettings({ allowEssentialMotion: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Allow Essential Motion</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.allowHoverEffects}
              onChange={(e) => updateSettings({ allowHoverEffects: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Allow Hover Effects</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.allowFocusIndicators}
              onChange={(e) => updateSettings({ allowFocusIndicators: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Allow Focus Indicators</span>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span>Motion Preference</span>
            <select
              value={settings.preference}
              onChange={(e) =>
                updateSettings({ preference: e.target.value as MotionPreference })
              }
              disabled={!settings.enabled || settings.respectSystemPreference}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '1rem',
              }}
            >
              <option value="no-preference">No Preference</option>
              <option value="reduce">Reduce Motion</option>
              <option value="custom">Custom</option>
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span>Animation Duration (ms)</span>
            <input
              type="number"
              value={settings.animationDuration}
              onChange={(e) => updateSettings({ animationDuration: parseInt(e.target.value) })}
              disabled={!settings.enabled}
              min={0}
              max={1000}
              step={50}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '1rem',
              }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span>Transition Speed</span>
            <input
              type="number"
              value={settings.transitionSpeed}
              onChange={(e) => updateSettings({ transitionSpeed: parseFloat(e.target.value) })}
              disabled={!settings.enabled}
              min={0.1}
              max={2.0}
              step={0.1}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '1rem',
              }}
            />
          </label>
        </div>

        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            background: shouldReduceMotion ? '#fef2f2' : '#f0fdf4',
            borderRadius: '8px',
            border: `1px solid ${shouldReduceMotion ? '#fca5a5' : '#86efac'}`,
          }}
        >
          <strong>System Preference:</strong> {systemPreference} |{' '}
          <strong>Current Mode:</strong> {shouldReduceMotion ? 'Reduced Motion' : 'Full Motion'}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Animations Enabled
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
            {stats.animationsEnabled}
          </div>
        </div>

        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Animations Disabled
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
            {stats.animationsDisabled}
          </div>
        </div>

        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            System Preference
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {systemPreference}
          </div>
        </div>

        <div
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
            Last Updated
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#8b5cf6' }}>
            {stats.lastUpdated ? stats.lastUpdated.toLocaleTimeString() : 'Never'}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
          borderBottom: '2px solid #e5e7eb',
        }}
      >
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'animations', label: 'Animations' },
          { id: 'settings', label: 'Custom Settings' },
          { id: 'test', label: 'Test' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === tab.id ? '#3b82f6' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#666',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              transition: 'all 0.2s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          {...getMotionVariants('fade')}
        >
          {activeTab === 'overview' && (
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Overview</h2>
              <p style={{ margin: 0, marginBottom: '1rem', lineHeight: 1.6 }}>
                Reduced motion settings help users who experience discomfort, nausea, or seizures
                from animations and motion effects. Respecting the prefers-reduced-motion media
                query is essential for accessibility.
              </p>

              <h3 style={{ margin: '2rem 0 1rem 0' }}>Why Reduced Motion Matters</h3>
              <ul style={{ lineHeight: 1.8 }}>
                <li>Prevents vestibular disorders and motion sickness</li>
                <li>Reduces cognitive load for users with attention disorders</li>
                <li>Improves performance on low-powered devices</li>
                <li>Saves battery life on mobile devices</li>
                <li>Required for WCAG 2.1 Level AAA compliance</li>
              </ul>

              <h3 style={{ margin: '2rem 0 1rem 0' }}>Best Practices</h3>
              <ul style={{ lineHeight: 1.8 }}>
                <li>Respect the prefers-reduced-motion media query</li>
                <li>Provide manual controls to disable animations</li>
                <li>Keep essential animations brief and subtle</li>
                <li>Avoid parallax scrolling effects</li>
                <li>Don't auto-play videos or animations</li>
                <li>Provide alternatives to motion-based interactions</li>
              </ul>

              <h3 style={{ margin: '2rem 0 1rem 0' }}>WCAG Compliance</h3>
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                This implementation follows WCAG 2.1 Success Criterion 2.3.3 (Animation from
                Interactions - Level AAA), which requires that motion animation triggered by
                interaction can be disabled unless essential to functionality.
              </p>
            </div>
          )}

          {activeTab === 'animations' && (
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Animation Types</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {configs.map((config) => {
                  const allowed = isAnimationAllowed(config.type, config.essential);
                  const duration = getAnimationDuration(config.defaultDuration, config.essential);

                  return (
                    <div
                      key={config.type}
                      style={{
                        padding: '1.5rem',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        border: `2px solid ${allowed ? '#10b981' : '#ef4444'}`,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '1rem',
                          alignItems: 'start',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <h3 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.125rem' }}>
                            {config.name}
                          </h3>
                          <p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>
                            {config.description}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {config.essential && (
                            <span
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.25rem 0.5rem',
                                background: '#fbbf24',
                                color: 'white',
                                borderRadius: '4px',
                              }}
                            >
                              Essential
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              background: allowed ? '#10b981' : '#ef4444',
                              color: 'white',
                              borderRadius: '4px',
                            }}
                          >
                            {allowed ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 1fr',
                          gap: '1rem',
                          marginBottom: '1rem',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#666' }}>Default Duration</div>
                          <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                            {config.defaultDuration}ms
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#666' }}>Current Duration</div>
                          <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                            {duration}ms
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#666' }}>Can Disable</div>
                          <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                            {config.canDisable ? 'Yes' : 'No'}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                          Examples:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {config.examples.map((example, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.25rem 0.5rem',
                                background: '#e5e7eb',
                                borderRadius: '4px',
                              }}
                            >
                              {example}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Custom Animation Settings</h2>
              <p style={{ margin: 0, marginBottom: '1.5rem', color: '#666' }}>
                Fine-tune which animation types to disable individually.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1rem',
                }}
              >
                {Object.entries(settings.customSettings).map(([key, value]) => {
                  const animationType = key.replace('disable', '').toLowerCase() as AnimationType;
                  const config = configs.find((c) => c.type === animationType);

                  return (
                    <label
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '1rem',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) =>
                          updateSettings({
                            customSettings: {
                              ...settings.customSettings,
                              [key]: e.target.checked,
                            },
                          })
                        }
                        disabled={!settings.enabled}
                      />
                      <div>
                        <div style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                          Disable {animationType}
                        </div>
                        {config && (
                          <div style={{ fontSize: '0.75rem', color: '#666' }}>
                            {config.description}
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'test' && (
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Test Animations</h2>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 'bold' }}>Select Animation Type</span>
                  <select
                    value={testAnimation}
                    onChange={(e) => setTestAnimation(e.target.value as AnimationType)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      fontSize: '1rem',
                    }}
                  >
                    {configs.map((config) => (
                      <option key={config.type} value={config.type}>
                        {config.name}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  onClick={runTestAnimation}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                  }}
                >
                  Run Test Animation
                </button>
              </div>

              <div
                style={{
                  minHeight: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '2px dashed #e5e7eb',
                }}
              >
                <AnimatePresence mode="wait">
                  {showTestElement && (
                    <motion.div
                      key={testAnimation}
                      {...getMotionVariants(testAnimation)}
                      style={{
                        padding: '2rem 3rem',
                        background: '#3b82f6',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {testAnimation.charAt(0).toUpperCase() + testAnimation.slice(1)} Animation
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div
                style={{
                  marginTop: '1.5rem',
                  padding: '1.5rem',
                  background: '#eff6ff',
                  borderRadius: '8px',
                  border: '1px solid #3b82f6',
                }}
              >
                <h4 style={{ margin: 0, marginBottom: '0.5rem', color: '#1e40af' }}>
                  Current Settings
                </h4>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: 1.8, fontSize: '0.875rem' }}>
                  <li>Motion should be reduced: {shouldReduceMotion ? 'Yes' : 'No'}</li>
                  <li>Animation allowed: {isAnimationAllowed(testAnimation) ? 'Yes' : 'No'}</li>
                  <li>
                    Duration: {getAnimationDuration(configs.find((c) => c.type === testAnimation)?.defaultDuration || 300)}ms
                  </li>
                  <li>Transition speed: {settings.transitionSpeed}x</li>
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ReducedMotion;
