import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type CalmLevel = 'minimal' | 'moderate' | 'maximum';

export interface CalmModeSettings {
  enabled: boolean;
  level: CalmLevel;
  reducedColors: boolean;
  simplifiedUI: boolean;
  hideNonEssential: boolean;
  muteNotifications: boolean;
  disableAnimations: boolean;
  largerSpacing: boolean;
  calmPalette: boolean;
  focusMode: boolean;
  autoEnable: boolean;
  autoEnableDuration: number; // minutes
}

export interface CalmModeProfile {
  level: CalmLevel;
  name: string;
  description: string;
  features: {
    reducedColors: boolean;
    simplifiedUI: boolean;
    hideNonEssential: boolean;
    muteNotifications: boolean;
    disableAnimations: boolean;
    largerSpacing: boolean;
    calmPalette: boolean;
    focusMode: boolean;
  };
  colors: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
  };
}

export interface CalmModeStats {
  totalActivations: number;
  totalDuration: number; // minutes
  currentSession: number; // minutes
  lastActivated: Date | null;
  averageSessionDuration: number;
  preferredLevel: CalmLevel;
}

// ============================================================================
// Calm Mode Profiles
// ============================================================================

const calmModeProfiles: CalmModeProfile[] = [
  {
    level: 'minimal',
    name: 'Minimal Calm',
    description: 'Subtle calming adjustments without major UI changes',
    features: {
      reducedColors: true,
      simplifiedUI: false,
      hideNonEssential: false,
      muteNotifications: true,
      disableAnimations: true,
      largerSpacing: false,
      calmPalette: true,
      focusMode: false,
    },
    colors: {
      background: '#f8f9fa',
      text: '#495057',
      primary: '#6c757d',
      secondary: '#adb5bd',
    },
  },
  {
    level: 'moderate',
    name: 'Moderate Calm',
    description: 'Balanced calming with simplified interface',
    features: {
      reducedColors: true,
      simplifiedUI: true,
      hideNonEssential: true,
      muteNotifications: true,
      disableAnimations: true,
      largerSpacing: true,
      calmPalette: true,
      focusMode: false,
    },
    colors: {
      background: '#e9ecef',
      text: '#343a40',
      primary: '#6c757d',
      secondary: '#adb5bd',
    },
  },
  {
    level: 'maximum',
    name: 'Maximum Calm',
    description: 'Complete sensory reduction for maximum focus',
    features: {
      reducedColors: true,
      simplifiedUI: true,
      hideNonEssential: true,
      muteNotifications: true,
      disableAnimations: true,
      largerSpacing: true,
      calmPalette: true,
      focusMode: true,
    },
    colors: {
      background: '#ffffff',
      text: '#212529',
      primary: '#495057',
      secondary: '#6c757d',
    },
  },
];

// ============================================================================
// Custom Hook
// ============================================================================

export const useCalmMode = (initialSettings?: Partial<CalmModeSettings>) => {
  const [settings, setSettings] = useState<CalmModeSettings>({
    enabled: false,
    level: 'moderate',
    reducedColors: true,
    simplifiedUI: true,
    hideNonEssential: true,
    muteNotifications: true,
    disableAnimations: true,
    largerSpacing: true,
    calmPalette: true,
    focusMode: false,
    autoEnable: false,
    autoEnableDuration: 30,
    ...initialSettings,
  });

  const [stats, setStats] = useState<CalmModeStats>({
    totalActivations: 0,
    totalDuration: 0,
    currentSession: 0,
    lastActivated: null,
    averageSessionDuration: 0,
    preferredLevel: 'moderate',
  });

  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);

  // Get current profile
  const getCurrentProfile = useCallback((): CalmModeProfile => {
    return calmModeProfiles.find((p) => p.level === settings.level) || calmModeProfiles[1];
  }, [settings.level]);

  // Enable calm mode
  const enable = useCallback((level?: CalmLevel) => {
    const newLevel = level || settings.level;
    const profile = calmModeProfiles.find((p) => p.level === newLevel) || calmModeProfiles[1];

    setSettings((prev) => ({
      ...prev,
      enabled: true,
      level: newLevel,
      ...profile.features,
    }));

    setSessionStartTime(new Date());
    setStats((prev) => ({
      ...prev,
      totalActivations: prev.totalActivations + 1,
      lastActivated: new Date(),
      preferredLevel: newLevel,
    }));
  }, [settings.level]);

  // Disable calm mode
  const disable = useCallback(() => {
    setSettings((prev) => ({ ...prev, enabled: false }));

    if (sessionStartTime) {
      const duration = Math.round((Date.now() - sessionStartTime.getTime()) / 60000);
      setStats((prev) => ({
        ...prev,
        totalDuration: prev.totalDuration + duration,
        currentSession: 0,
        averageSessionDuration:
          prev.totalActivations > 0
            ? (prev.totalDuration + duration) / (prev.totalActivations + 1)
            : 0,
      }));
      setSessionStartTime(null);
    }
  }, [sessionStartTime]);

  // Toggle calm mode
  const toggle = useCallback(() => {
    if (settings.enabled) {
      disable();
    } else {
      enable();
    }
  }, [settings.enabled, enable, disable]);

  // Apply profile
  const applyProfile = useCallback((level: CalmLevel) => {
    const profile = calmModeProfiles.find((p) => p.level === level) || calmModeProfiles[1];

    setSettings((prev) => ({
      ...prev,
      level,
      ...profile.features,
    }));
  }, []);

  // Update settings
  const updateSettings = useCallback((updates: Partial<CalmModeSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // Update session duration
  useEffect(() => {
    if (!settings.enabled || !sessionStartTime) return;

    const interval = setInterval(() => {
      const duration = Math.round((Date.now() - sessionStartTime.getTime()) / 60000);
      setStats((prev) => ({ ...prev, currentSession: duration }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [settings.enabled, sessionStartTime]);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    const profile = getCurrentProfile();

    if (settings.enabled) {
      root.setAttribute('data-calm-mode', 'true');
      root.setAttribute('data-calm-level', settings.level);

      // Apply calm palette
      if (settings.calmPalette) {
        root.style.setProperty('--calm-bg', profile.colors.background);
        root.style.setProperty('--calm-text', profile.colors.text);
        root.style.setProperty('--calm-primary', profile.colors.primary);
        root.style.setProperty('--calm-secondary', profile.colors.secondary);
      }

      // Apply spacing
      if (settings.largerSpacing) {
        root.style.setProperty('--spacing-multiplier', '1.5');
      } else {
        root.style.setProperty('--spacing-multiplier', '1');
      }

      // Apply animations
      if (settings.disableAnimations) {
        root.style.setProperty('--animation-duration', '0ms');
      } else {
        root.style.setProperty('--animation-duration', '300ms');
      }
    } else {
      root.removeAttribute('data-calm-mode');
      root.removeAttribute('data-calm-level');
      root.style.removeProperty('--calm-bg');
      root.style.removeProperty('--calm-text');
      root.style.removeProperty('--calm-primary');
      root.style.removeProperty('--calm-secondary');
      root.style.removeProperty('--spacing-multiplier');
      root.style.removeProperty('--animation-duration');
    }
  }, [settings, getCurrentProfile]);

  // Auto-enable timer
  useEffect(() => {
    if (!settings.autoEnable) return;

    const timer = setTimeout(() => {
      if (!settings.enabled) {
        enable();
      }
    }, settings.autoEnableDuration * 60000);

    return () => clearTimeout(timer);
  }, [settings.autoEnable, settings.autoEnableDuration, settings.enabled, enable]);

  return {
    settings,
    stats,
    profiles: calmModeProfiles,
    currentProfile: getCurrentProfile(),
    enable,
    disable,
    toggle,
    applyProfile,
    updateSettings,
  };
};

// ============================================================================
// Component
// ============================================================================

export const CalmMode: React.FC = () => {
  const {
    settings,
    stats,
    profiles,
    currentProfile,
    enable,
    disable,
    toggle,
    applyProfile,
    updateSettings,
  } = useCalmMode();

  const [activeTab, setActiveTab] = useState<'overview' | 'profiles' | 'settings' | 'stats'>(
    'overview'
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem' }}
      >
        <h1 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '2rem' }}>
          Calm Mode
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '1rem' }}>
          Reduce sensory overload with a calming, simplified interface
        </p>
      </motion.div>

      {/* Quick Toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: settings.enabled ? currentProfile.colors.background : 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: settings.enabled ? `3px solid ${currentProfile.colors.primary}` : 'none',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h2 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.25rem' }}>
              Calm Mode {settings.enabled ? 'Active' : 'Inactive'}
            </h2>
            {settings.enabled && (
              <p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>
                {currentProfile.name} - Session: {stats.currentSession} minutes
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={toggle}
              style={{
                padding: '0.75rem 1.5rem',
                background: settings.enabled ? '#ef4444' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
              }}
            >
              {settings.enabled ? 'Disable Calm Mode' : 'Enable Calm Mode'}
            </button>

            {!settings.enabled && (
              <select
                value={settings.level}
                onChange={(e) => {
                  applyProfile(e.target.value as CalmLevel);
                  enable(e.target.value as CalmLevel);
                }}
                style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
              >
                <option value="minimal">Minimal</option>
                <option value="moderate">Moderate</option>
                <option value="maximum">Maximum</option>
              </select>
            )}
          </div>
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
            Total Activations
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {stats.totalActivations}
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
            Total Time
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
            {stats.totalDuration}m
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
            Current Session
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
            {stats.currentSession}m
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
            Avg Session
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {Math.round(stats.averageSessionDuration)}m
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
          { id: 'profiles', label: 'Profiles' },
          { id: 'settings', label: 'Custom Settings' },
          { id: 'stats', label: 'Statistics' },
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
                Calm Mode reduces sensory overload by simplifying the interface, muting
                distracting elements, and creating a peaceful environment for focused work. This
                is especially helpful for users with autism, ADHD, anxiety, or sensory processing
                difficulties.
              </p>

              <h3 style={{ margin: '2rem 0 1rem 0' }}>Benefits</h3>
              <ul style={{ lineHeight: 1.8 }}>
                <li>Reduces cognitive load and mental fatigue</li>
                <li>Minimizes sensory distractions and overwhelm</li>
                <li>Improves focus and concentration</li>
                <li>Creates a more comfortable learning environment</li>
                <li>Helps manage anxiety and stress</li>
                <li>Supports neurodivergent users' needs</li>
              </ul>

              <h3 style={{ margin: '2rem 0 1rem 0' }}>Features</h3>
              <ul style={{ lineHeight: 1.8 }}>
                <li><strong>Reduced Colors:</strong> Muted, calming color palette</li>
                <li><strong>Simplified UI:</strong> Removes decorative elements</li>
                <li><strong>Hide Non-Essential:</strong> Hides optional UI components</li>
                <li><strong>Mute Notifications:</strong> Silences non-critical alerts</li>
                <li><strong>Disable Animations:</strong> Removes motion and transitions</li>
                <li><strong>Larger Spacing:</strong> Increases whitespace for clarity</li>
                <li><strong>Focus Mode:</strong> Isolates essential content only</li>
              </ul>

              <div
                style={{
                  marginTop: '2rem',
                  padding: '1.5rem',
                  background: '#f0fdf4',
                  borderRadius: '8px',
                  border: '1px solid #86efac',
                }}
              >
                <h4 style={{ margin: 0, marginBottom: '0.5rem', color: '#059669' }}>
                  💡 Tip
                </h4>
                <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.6 }}>
                  Try different calm levels to find what works best for you. Start with Moderate
                  and adjust based on your comfort and focus needs.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'profiles' && (
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Calm Mode Profiles</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {profiles.map((profile) => (
                  <div
                    key={profile.level}
                    style={{
                      padding: '1.5rem',
                      background: profile.colors.background,
                      borderRadius: '8px',
                      border: `3px solid ${
                        settings.level === profile.level ? profile.colors.primary : '#e5e7eb'
                      }`,
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
                      <div>
                        <h3 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.25rem' }}>
                          {profile.name}
                        </h3>
                        <p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>
                          {profile.description}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          applyProfile(profile.level);
                          if (settings.enabled) {
                            disable();
                            setTimeout(() => enable(profile.level), 100);
                          } else {
                            enable(profile.level);
                          }
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background:
                            settings.level === profile.level && settings.enabled
                              ? '#10b981'
                              : '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {settings.level === profile.level && settings.enabled
                          ? 'Active'
                          : 'Activate'}
                      </button>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        Enabled Features:
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {Object.entries(profile.features).map(
                          ([key, value]) =>
                            value && (
                              <span
                                key={key}
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '0.25rem 0.5rem',
                                  background: profile.colors.primary,
                                  color: 'white',
                                  borderRadius: '4px',
                                }}
                              >
                                {key
                                  .replace(/([A-Z])/g, ' $1')
                                  .trim()
                                  .split(' ')
                                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                  .join(' ')}
                              </span>
                            )
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        Color Palette:
                      </h4>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {Object.entries(profile.colors).map(([key, value]) => (
                          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <div
                              style={{
                                width: '24px',
                                height: '24px',
                                background: value,
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                              }}
                            />
                            <span style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>
                              {key}
                            </span>
                          </div>
                        ))}
                      </div>
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
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Custom Settings</h2>
              <p style={{ margin: 0, marginBottom: '1.5rem', color: '#666' }}>
                Customize individual calm mode features to match your preferences.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.reducedColors}
                    onChange={(e) => updateSettings({ reducedColors: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      Reduced Colors
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      Use muted, calming color palette
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.simplifiedUI}
                    onChange={(e) => updateSettings({ simplifiedUI: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      Simplified UI
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      Remove decorative elements and simplify interface
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.hideNonEssential}
                    onChange={(e) => updateSettings({ hideNonEssential: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      Hide Non-Essential Elements
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      Hide optional UI components and features
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.muteNotifications}
                    onChange={(e) => updateSettings({ muteNotifications: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      Mute Notifications
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      Silence non-critical notifications and alerts
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.disableAnimations}
                    onChange={(e) => updateSettings({ disableAnimations: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      Disable Animations
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      Remove all animations and transitions
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.largerSpacing}
                    onChange={(e) => updateSettings({ largerSpacing: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      Larger Spacing
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      Increase whitespace between elements
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.focusMode}
                    onChange={(e) => updateSettings({ focusMode: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      Focus Mode
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      Show only essential content for maximum focus
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.autoEnable}
                    onChange={(e) => updateSettings({ autoEnable: e.target.checked })}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      Auto-Enable Calm Mode
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666' }}>
                      Automatically enable after {settings.autoEnableDuration} minutes of use
                    </div>
                  </div>
                  {settings.autoEnable && (
                    <input
                      type="number"
                      value={settings.autoEnableDuration}
                      onChange={(e) =>
                        updateSettings({ autoEnableDuration: parseInt(e.target.value) })
                      }
                      min={5}
                      max={120}
                      style={{
                        width: '80px',
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                      }}
                    />
                  )}
                </label>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Usage Statistics</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div
                  style={{
                    padding: '1.5rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                    Total Activations
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                    {stats.totalActivations}
                  </div>
                </div>

                <div
                  style={{
                    padding: '1.5rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                    Total Time in Calm Mode
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>
                    {stats.totalDuration} minutes
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                    {Math.floor(stats.totalDuration / 60)} hours {stats.totalDuration % 60} minutes
                  </div>
                </div>

                <div
                  style={{
                    padding: '1.5rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                    Average Session Duration
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                    {Math.round(stats.averageSessionDuration)} minutes
                  </div>
                </div>

                <div
                  style={{
                    padding: '1.5rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                    Preferred Level
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b', textTransform: 'capitalize' }}>
                    {stats.preferredLevel}
                  </div>
                </div>

                {stats.lastActivated && (
                  <div
                    style={{
                      padding: '1.5rem',
                      background: '#f9fafb',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                      Last Activated
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                      {stats.lastActivated.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default CalmMode;
