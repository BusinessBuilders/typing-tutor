import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type AnimationCategory = 'page' | 'component' | 'interaction' | 'notification' | 'feedback';

export interface AnimationToggle {
  id: string;
  name: string;
  description: string;
  category: AnimationCategory;
  enabled: boolean;
  canDisable: boolean;
  essential: boolean;
  examples: string[];
}

export interface AnimationTogglesSettings {
  globalEnabled: boolean;
  pageTransitions: boolean;
  componentAnimations: boolean;
  interactionFeedback: boolean;
  notifications: boolean;
  feedbackEffects: boolean;
  respectReducedMotion: boolean;
  smoothScrolling: boolean;
  autoPlay: boolean;
}

export interface AnimationTogglesStats {
  totalToggles: number;
  enabledToggles: number;
  disabledToggles: number;
  essentialToggles: number;
  byCategory: Record<AnimationCategory, number>;
  lastUpdated: Date | null;
}

// ============================================================================
// Mock Data Generators
// ============================================================================

const generateAnimationToggles = (): AnimationToggle[] => {
  return [
    {
      id: 'page-transitions',
      name: 'Page Transitions',
      description: 'Smooth transitions when navigating between pages',
      category: 'page',
      enabled: true,
      canDisable: true,
      essential: false,
      examples: ['Page fade in/out', 'Route changes', 'View switching'],
    },
    {
      id: 'modal-animations',
      name: 'Modal Animations',
      description: 'Animations for dialogs and modals appearing/disappearing',
      category: 'component',
      enabled: true,
      canDisable: true,
      essential: false,
      examples: ['Dialog fade in', 'Modal slide up', 'Overlay transitions'],
    },
    {
      id: 'dropdown-animations',
      name: 'Dropdown Animations',
      description: 'Animations for dropdown menus and select inputs',
      category: 'component',
      enabled: true,
      canDisable: true,
      essential: false,
      examples: ['Menu slide down', 'Dropdown expand', 'Tooltip appear'],
    },
    {
      id: 'button-hover',
      name: 'Button Hover Effects',
      description: 'Visual feedback when hovering over buttons',
      category: 'interaction',
      enabled: true,
      canDisable: true,
      essential: false,
      examples: ['Button scale', 'Color transition', 'Shadow effects'],
    },
    {
      id: 'button-press',
      name: 'Button Press Effects',
      description: 'Visual feedback when clicking buttons',
      category: 'interaction',
      enabled: true,
      canDisable: false,
      essential: true,
      examples: ['Button press animation', 'Click ripple', 'Active state'],
    },
    {
      id: 'loading-spinners',
      name: 'Loading Spinners',
      description: 'Animated loading indicators',
      category: 'feedback',
      enabled: true,
      canDisable: true,
      essential: false,
      examples: ['Spinner rotation', 'Progress bar animation', 'Skeleton screens'],
    },
    {
      id: 'toast-notifications',
      name: 'Toast Notifications',
      description: 'Animated toast messages and alerts',
      category: 'notification',
      enabled: true,
      canDisable: true,
      essential: false,
      examples: ['Toast slide in', 'Alert fade in', 'Notification bounce'],
    },
    {
      id: 'form-validation',
      name: 'Form Validation Feedback',
      description: 'Visual feedback for form validation',
      category: 'feedback',
      enabled: true,
      canDisable: false,
      essential: true,
      examples: ['Error shake', 'Success checkmark', 'Field highlighting'],
    },
    {
      id: 'card-hover',
      name: 'Card Hover Effects',
      description: 'Animations when hovering over cards',
      category: 'interaction',
      enabled: true,
      canDisable: true,
      essential: false,
      examples: ['Card lift', 'Shadow grow', 'Border glow'],
    },
    {
      id: 'list-animations',
      name: 'List Item Animations',
      description: 'Staggered animations for list items',
      category: 'component',
      enabled: true,
      canDisable: true,
      essential: false,
      examples: ['Staggered fade in', 'List item slide', 'Sequential appearance'],
    },
    {
      id: 'scroll-animations',
      name: 'Scroll Animations',
      description: 'Elements that animate when scrolling into view',
      category: 'page',
      enabled: true,
      canDisable: true,
      essential: false,
      examples: ['Scroll fade in', 'Parallax effects', 'Reveal on scroll'],
    },
    {
      id: 'typing-indicators',
      name: 'Typing Indicators',
      description: 'Animated indicators showing typing progress',
      category: 'feedback',
      enabled: true,
      canDisable: false,
      essential: true,
      examples: ['WPM counter animation', 'Progress bar', 'Real-time feedback'],
    },
  ];
};

// ============================================================================
// Custom Hook
// ============================================================================

export const useAnimationToggles = (initialSettings?: Partial<AnimationTogglesSettings>) => {
  const [settings, setSettings] = useState<AnimationTogglesSettings>({
    globalEnabled: true,
    pageTransitions: true,
    componentAnimations: true,
    interactionFeedback: true,
    notifications: true,
    feedbackEffects: true,
    respectReducedMotion: true,
    smoothScrolling: true,
    autoPlay: false,
    ...initialSettings,
  });

  const [toggles, setToggles] = useState<AnimationToggle[]>(generateAnimationToggles());
  const [stats, setStats] = useState<AnimationTogglesStats>({
    totalToggles: 0,
    enabledToggles: 0,
    disabledToggles: 0,
    essentialToggles: 0,
    byCategory: {
      page: 0,
      component: 0,
      interaction: 0,
      notification: 0,
      feedback: 0,
    },
    lastUpdated: null,
  });

  // Toggle animation
  const toggleAnimation = useCallback((id: string) => {
    setToggles((prev) =>
      prev.map((toggle) =>
        toggle.id === id && toggle.canDisable
          ? { ...toggle, enabled: !toggle.enabled }
          : toggle
      )
    );
    setStats((prev) => ({ ...prev, lastUpdated: new Date() }));
  }, []);

  // Enable all animations
  const enableAll = useCallback(() => {
    setToggles((prev) => prev.map((toggle) => ({ ...toggle, enabled: true })));
    setSettings((prev) => ({
      ...prev,
      globalEnabled: true,
      pageTransitions: true,
      componentAnimations: true,
      interactionFeedback: true,
      notifications: true,
      feedbackEffects: true,
    }));
    setStats((prev) => ({ ...prev, lastUpdated: new Date() }));
  }, []);

  // Disable all non-essential animations
  const disableAll = useCallback(() => {
    setToggles((prev) =>
      prev.map((toggle) => ({
        ...toggle,
        enabled: toggle.essential || !toggle.canDisable,
      }))
    );
    setSettings((prev) => ({
      ...prev,
      globalEnabled: false,
      pageTransitions: false,
      componentAnimations: false,
      interactionFeedback: false,
      notifications: false,
      feedbackEffects: false,
    }));
    setStats((prev) => ({ ...prev, lastUpdated: new Date() }));
  }, []);

  // Enable category
  const enableCategory = useCallback((category: AnimationCategory) => {
    setToggles((prev) =>
      prev.map((toggle) =>
        toggle.category === category ? { ...toggle, enabled: true } : toggle
      )
    );
    setStats((prev) => ({ ...prev, lastUpdated: new Date() }));
  }, []);

  // Disable category
  const disableCategory = useCallback((category: AnimationCategory) => {
    setToggles((prev) =>
      prev.map((toggle) =>
        toggle.category === category && toggle.canDisable
          ? { ...toggle, enabled: false }
          : toggle
      )
    );
    setStats((prev) => ({ ...prev, lastUpdated: new Date() }));
  }, []);

  // Update settings
  const updateSettings = useCallback((updates: Partial<AnimationTogglesSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    setStats((prev) => ({ ...prev, lastUpdated: new Date() }));
  }, []);

  // Check if animation type is enabled
  const isAnimationEnabled = useCallback(
    (id: string): boolean => {
      if (!settings.globalEnabled) return false;

      const toggle = toggles.find((t) => t.id === id);
      if (!toggle) return true;

      return toggle.enabled;
    },
    [settings.globalEnabled, toggles]
  );

  // Calculate stats
  useEffect(() => {
    const totalToggles = toggles.length;
    const enabledToggles = toggles.filter((t) => t.enabled).length;
    const disabledToggles = totalToggles - enabledToggles;
    const essentialToggles = toggles.filter((t) => t.essential).length;

    const byCategory: Record<AnimationCategory, number> = {
      page: toggles.filter((t) => t.category === 'page' && t.enabled).length,
      component: toggles.filter((t) => t.category === 'component' && t.enabled).length,
      interaction: toggles.filter((t) => t.category === 'interaction' && t.enabled).length,
      notification: toggles.filter((t) => t.category === 'notification' && t.enabled).length,
      feedback: toggles.filter((t) => t.category === 'feedback' && t.enabled).length,
    };

    setStats((prev) => ({
      ...prev,
      totalToggles,
      enabledToggles,
      disabledToggles,
      essentialToggles,
      byCategory,
    }));
  }, [toggles]);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;

    root.setAttribute('data-animations-enabled', settings.globalEnabled.toString());
    root.setAttribute('data-smooth-scrolling', settings.smoothScrolling.toString());

    if (settings.smoothScrolling) {
      root.style.scrollBehavior = 'smooth';
    } else {
      root.style.scrollBehavior = 'auto';
    }
  }, [settings]);

  // Listen for reduced motion preference
  useEffect(() => {
    if (!settings.respectReducedMotion || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        disableAll();
      }
    };

    // Check initial preference
    if (mediaQuery.matches) {
      disableAll();
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.respectReducedMotion, disableAll]);

  return {
    settings,
    toggles,
    stats,
    toggleAnimation,
    enableAll,
    disableAll,
    enableCategory,
    disableCategory,
    updateSettings,
    isAnimationEnabled,
  };
};

// ============================================================================
// Component
// ============================================================================

export const AnimationToggles: React.FC = () => {
  const {
    settings,
    toggles,
    stats,
    toggleAnimation,
    enableAll,
    disableAll,
    enableCategory,
    disableCategory,
    updateSettings,
  } = useAnimationToggles();

  const [activeTab, setActiveTab] = useState<'overview' | 'toggles' | 'categories' | 'settings'>(
    'overview'
  );

  // Get category name
  const getCategoryName = (category: AnimationCategory): string => {
    const names: Record<AnimationCategory, string> = {
      page: 'Page',
      component: 'Component',
      interaction: 'Interaction',
      notification: 'Notification',
      feedback: 'Feedback',
    };
    return names[category];
  };

  // Get category color
  const getCategoryColor = (category: AnimationCategory): string => {
    const colors: Record<AnimationCategory, string> = {
      page: '#3b82f6',
      component: '#10b981',
      interaction: '#8b5cf6',
      notification: '#f59e0b',
      feedback: '#ef4444',
    };
    return colors[category];
  };

  // Group toggles by category
  const togglesByCategory = toggles.reduce((acc, toggle) => {
    if (!acc[toggle.category]) {
      acc[toggle.category] = [];
    }
    acc[toggle.category].push(toggle);
    return acc;
  }, {} as Record<AnimationCategory, AnimationToggle[]>);

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem' }}
      >
        <h1 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '2rem' }}>
          Animation Toggles
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '1rem' }}>
          Fine-tune animation settings with granular control over individual animation types
        </p>
      </motion.div>

      {/* Quick Actions */}
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
        <h2 style={{ margin: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>Quick Actions</h2>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={enableAll}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
            }}
          >
            Enable All Animations
          </button>

          <button
            onClick={disableAll}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
            }}
          >
            Disable All (Keep Essential)
          </button>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#f9fafb', borderRadius: '6px' }}>
            <input
              type="checkbox"
              checked={settings.globalEnabled}
              onChange={(e) => updateSettings({ globalEnabled: e.target.checked })}
            />
            <span>Global Animation Control</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: '#f9fafb', borderRadius: '6px' }}>
            <input
              type="checkbox"
              checked={settings.respectReducedMotion}
              onChange={(e) => updateSettings({ respectReducedMotion: e.target.checked })}
            />
            <span>Respect Reduced Motion</span>
          </label>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
            Total Toggles
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {stats.totalToggles}
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
            Enabled
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
            {stats.enabledToggles}
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
            Disabled
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
            {stats.disabledToggles}
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
            Essential
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {stats.essentialToggles}
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
          { id: 'toggles', label: `All Toggles (${toggles.length})` },
          { id: 'categories', label: 'By Category' },
          { id: 'settings', label: 'Settings' },
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
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
                Animation toggles provide granular control over different types of animations in
                the application. Users can disable specific animation types while keeping others
                enabled, allowing for a customized experience.
              </p>

              <h3 style={{ margin: '2rem 0 1rem 0' }}>Benefits</h3>
              <ul style={{ lineHeight: 1.8 }}>
                <li>Fine-grained control over animation preferences</li>
                <li>Ability to keep essential animations while disabling decorative ones</li>
                <li>Improved performance by disabling resource-intensive animations</li>
                <li>Better accessibility for users sensitive to motion</li>
                <li>Customizable experience based on user needs</li>
              </ul>

              <h3 style={{ margin: '2rem 0 1rem 0' }}>Category Distribution</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(stats.byCategory).map(([category, count]) => {
                  const totalInCategory = toggles.filter((t) => t.category === category).length;
                  return (
                    <div key={category} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '120px', fontWeight: 'bold' }}>
                        {getCategoryName(category as AnimationCategory)}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          height: '24px',
                          background: '#f3f4f6',
                          borderRadius: '4px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${totalInCategory > 0 ? (count / totalInCategory) * 100 : 0}%`,
                            height: '100%',
                            background: getCategoryColor(category as AnimationCategory),
                            transition: 'width 0.3s',
                          }}
                        />
                      </div>
                      <div style={{ width: '100px', textAlign: 'right' }}>
                        {count} / {totalInCategory} enabled
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'toggles' && (
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>All Animation Toggles</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {toggles.map((toggle) => (
                  <div
                    key={toggle.id}
                    style={{
                      padding: '1.5rem',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      border: `2px solid ${toggle.enabled ? '#10b981' : '#e5e7eb'}`,
                      opacity: toggle.canDisable ? 1 : 0.7,
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
                          {toggle.name}
                        </h3>
                        <p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>
                          {toggle.description}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            background: getCategoryColor(toggle.category),
                            color: 'white',
                            borderRadius: '4px',
                            textTransform: 'capitalize',
                          }}
                        >
                          {toggle.category}
                        </span>
                        {toggle.essential && (
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
                        {!toggle.canDisable && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              background: '#6b7280',
                              color: 'white',
                              borderRadius: '4px',
                            }}
                          >
                            Required
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        Examples:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {toggle.examples.map((example, i) => (
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

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        cursor: toggle.canDisable ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={toggle.enabled}
                        onChange={() => toggleAnimation(toggle.id)}
                        disabled={!toggle.canDisable || !settings.globalEnabled}
                        style={{ cursor: toggle.canDisable ? 'pointer' : 'not-allowed' }}
                      />
                      <span style={{ fontWeight: 'bold' }}>
                        {toggle.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Animations by Category</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {Object.entries(togglesByCategory).map(([category, categoryToggles]) => (
                  <div key={category}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem',
                        padding: '1rem',
                        background: getCategoryColor(category as AnimationCategory),
                        color: 'white',
                        borderRadius: '8px',
                      }}
                    >
                      <h3 style={{ margin: 0, fontSize: '1.25rem' }}>
                        {getCategoryName(category as AnimationCategory)} Animations
                      </h3>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => enableCategory(category as AnimationCategory)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: 'white',
                            color: getCategoryColor(category as AnimationCategory),
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                          }}
                        >
                          Enable All
                        </button>
                        <button
                          onClick={() => disableCategory(category as AnimationCategory)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            border: '1px solid white',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                          }}
                        >
                          Disable All
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {categoryToggles.map((toggle) => (
                        <label
                          key={toggle.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem',
                            background: '#f9fafb',
                            borderRadius: '6px',
                            border: `1px solid ${toggle.enabled ? getCategoryColor(category as AnimationCategory) : '#e5e7eb'}`,
                            cursor: toggle.canDisable ? 'pointer' : 'not-allowed',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={toggle.enabled}
                            onChange={() => toggleAnimation(toggle.id)}
                            disabled={!toggle.canDisable || !settings.globalEnabled}
                            style={{ cursor: toggle.canDisable ? 'pointer' : 'not-allowed' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                              {toggle.name}
                            </div>
                            <div style={{ fontSize: '0.875rem', color: '#666' }}>
                              {toggle.description}
                            </div>
                          </div>
                          {toggle.essential && (
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
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
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
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Global Settings</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.5rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.globalEnabled}
                    onChange={(e) => updateSettings({ globalEnabled: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                      Global Animation Control
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      Master switch to enable/disable all animations
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.5rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.respectReducedMotion}
                    onChange={(e) => updateSettings({ respectReducedMotion: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                      Respect Reduced Motion Preference
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      Automatically disable animations when system prefers reduced motion
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.5rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.smoothScrolling}
                    onChange={(e) => updateSettings({ smoothScrolling: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                      Smooth Scrolling
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      Enable smooth scrolling behavior for anchor links
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.5rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.autoPlay}
                    onChange={(e) => updateSettings({ autoPlay: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.25rem' }}>
                      Auto-Play Animations
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      Automatically play animations without user interaction
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnimationToggles;
