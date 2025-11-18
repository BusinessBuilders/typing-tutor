import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type AnnouncementPriority = 'polite' | 'assertive' | 'off';

export type AriaRole =
  | 'alert'
  | 'alertdialog'
  | 'application'
  | 'article'
  | 'banner'
  | 'button'
  | 'checkbox'
  | 'complementary'
  | 'contentinfo'
  | 'dialog'
  | 'form'
  | 'main'
  | 'navigation'
  | 'region'
  | 'search'
  | 'status'
  | 'timer';

export interface ScreenReaderAnnouncement {
  id: string;
  message: string;
  priority: AnnouncementPriority;
  timestamp: Date;
  read: boolean;
  category: 'navigation' | 'action' | 'error' | 'success' | 'info' | 'warning';
}

export interface LiveRegion {
  id: string;
  priority: AnnouncementPriority;
  atomic: boolean;
  relevant: 'additions' | 'removals' | 'text' | 'all';
  busy: boolean;
}

export interface AriaLabel {
  element: string;
  label: string;
  description?: string;
  role?: AriaRole;
  required?: boolean;
  expanded?: boolean;
  selected?: boolean;
  pressed?: boolean;
}

export interface ScreenReaderSettings {
  enabled: boolean;
  verbosity: 'minimal' | 'standard' | 'verbose';
  announcements: boolean;
  liveRegions: boolean;
  keyboardShortcuts: boolean;
  skipLinks: boolean;
  landmarks: boolean;
  describedBy: boolean;
  labelledBy: boolean;
  roles: boolean;
}

export interface ScreenReaderStats {
  totalAnnouncements: number;
  announcementsByCategory: Record<string, number>;
  averageAnnouncementsPerMinute: number;
  mostCommonCategory: string;
  lastAnnouncement: Date | null;
}

// ============================================================================
// Mock Data Generators
// ============================================================================

const generateMockAnnouncements = (): ScreenReaderAnnouncement[] => {
  const categories: ScreenReaderAnnouncement['category'][] = [
    'navigation',
    'action',
    'error',
    'success',
    'info',
    'warning',
  ];

  const messages: Record<ScreenReaderAnnouncement['category'], string[]> = {
    navigation: [
      'Navigated to home page',
      'Moved to settings section',
      'Entered typing exercise',
      'Opened profile menu',
    ],
    action: [
      'Button clicked: Start Exercise',
      'Checkbox toggled: Enable sound',
      'Slider adjusted: Speed set to 75%',
      'Form submitted successfully',
    ],
    error: [
      'Error: Invalid input detected',
      'Network connection failed',
      'File upload unsuccessful',
      'Authentication required',
    ],
    success: [
      'Exercise completed successfully',
      'Settings saved',
      'Profile updated',
      'Achievement unlocked',
    ],
    info: [
      'Loading content',
      'Processing request',
      'Data synchronized',
      'New notification received',
    ],
    warning: [
      'Warning: Session about to expire',
      'Low battery detected',
      'Unsaved changes present',
      'Connection unstable',
    ],
  };

  return Array.from({ length: 10 }, (_, i) => {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const messageList = messages[category];
    const message = messageList[Math.floor(Math.random() * messageList.length)];
    const priorities: AnnouncementPriority[] = ['polite', 'assertive', 'off'];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];

    return {
      id: `announcement-${i + 1}`,
      message,
      priority,
      timestamp: new Date(Date.now() - Math.random() * 3600000),
      read: Math.random() > 0.5,
      category,
    };
  });
};

const generateAriaLabels = (): AriaLabel[] => {
  return [
    {
      element: 'navigation',
      label: 'Main navigation',
      description: 'Primary navigation menu with links to main sections',
      role: 'navigation',
    },
    {
      element: 'search-input',
      label: 'Search exercises',
      description: 'Enter keywords to search typing exercises',
      role: 'search',
      required: false,
    },
    {
      element: 'start-button',
      label: 'Start typing exercise',
      description: 'Begin the current typing exercise',
      role: 'button',
      pressed: false,
    },
    {
      element: 'settings-toggle',
      label: 'Settings menu',
      description: 'Open or close settings panel',
      role: 'button',
      expanded: false,
    },
    {
      element: 'progress-indicator',
      label: 'Exercise progress',
      description: 'Current progress through the typing exercise',
      role: 'status',
    },
  ];
};

// ============================================================================
// Custom Hook
// ============================================================================

export const useScreenReaderSupport = (initialSettings?: Partial<ScreenReaderSettings>) => {
  const [settings, setSettings] = useState<ScreenReaderSettings>({
    enabled: true,
    verbosity: 'standard',
    announcements: true,
    liveRegions: true,
    keyboardShortcuts: true,
    skipLinks: true,
    landmarks: true,
    describedBy: true,
    labelledBy: true,
    roles: true,
    ...initialSettings,
  });

  const [announcements, setAnnouncements] = useState<ScreenReaderAnnouncement[]>(
    generateMockAnnouncements()
  );
  const [liveRegions, setLiveRegions] = useState<LiveRegion[]>([]);
  const [ariaLabels, setAriaLabels] = useState<AriaLabel[]>(generateAriaLabels());
  const [stats, setStats] = useState<ScreenReaderStats>({
    totalAnnouncements: 0,
    announcementsByCategory: {},
    averageAnnouncementsPerMinute: 0,
    mostCommonCategory: 'info',
    lastAnnouncement: null,
  });

  const announcementQueueRef = useRef<ScreenReaderAnnouncement[]>([]);

  // Announce message to screen reader
  const announce = useCallback(
    (
      message: string,
      priority: AnnouncementPriority = 'polite',
      category: ScreenReaderAnnouncement['category'] = 'info'
    ) => {
      if (!settings.enabled || !settings.announcements) return;

      const announcement: ScreenReaderAnnouncement = {
        id: `announcement-${Date.now()}-${Math.random()}`,
        message,
        priority,
        timestamp: new Date(),
        read: false,
        category,
      };

      setAnnouncements((prev) => [announcement, ...prev].slice(0, 50));
      announcementQueueRef.current.push(announcement);

      // Update stats
      setStats((prev) => ({
        totalAnnouncements: prev.totalAnnouncements + 1,
        announcementsByCategory: {
          ...prev.announcementsByCategory,
          [category]: (prev.announcementsByCategory[category] || 0) + 1,
        },
        averageAnnouncementsPerMinute: prev.averageAnnouncementsPerMinute,
        mostCommonCategory: category,
        lastAnnouncement: announcement.timestamp,
      }));
    },
    [settings.enabled, settings.announcements]
  );

  // Create live region
  const createLiveRegion = useCallback(
    (
      id: string,
      priority: AnnouncementPriority = 'polite',
      atomic: boolean = false,
      relevant: LiveRegion['relevant'] = 'additions'
    ) => {
      if (!settings.enabled || !settings.liveRegions) return;

      const region: LiveRegion = {
        id,
        priority,
        atomic,
        relevant,
        busy: false,
      };

      setLiveRegions((prev) => [...prev, region]);
    },
    [settings.enabled, settings.liveRegions]
  );

  // Remove live region
  const removeLiveRegion = useCallback((id: string) => {
    setLiveRegions((prev) => prev.filter((region) => region.id !== id));
  }, []);

  // Update live region
  const updateLiveRegion = useCallback((id: string, updates: Partial<LiveRegion>) => {
    setLiveRegions((prev) =>
      prev.map((region) => (region.id === id ? { ...region, ...updates } : region))
    );
  }, []);

  // Add ARIA label
  const addAriaLabel = useCallback(
    (label: AriaLabel) => {
      if (!settings.enabled) return;
      setAriaLabels((prev) => [...prev, label]);
    },
    [settings.enabled]
  );

  // Update ARIA label
  const updateAriaLabel = useCallback((element: string, updates: Partial<AriaLabel>) => {
    setAriaLabels((prev) =>
      prev.map((label) => (label.element === element ? { ...label, ...updates } : label))
    );
  }, []);

  // Get ARIA attributes for element
  const getAriaAttributes = useCallback(
    (element: string) => {
      const label = ariaLabels.find((l) => l.element === element);
      if (!label || !settings.enabled) return {};

      const attributes: Record<string, string | boolean> = {};

      if (settings.labelledBy && label.label) {
        attributes['aria-label'] = label.label;
      }

      if (settings.describedBy && label.description) {
        attributes['aria-describedby'] = `${element}-description`;
      }

      if (settings.roles && label.role) {
        attributes.role = label.role;
      }

      if (label.required !== undefined) {
        attributes['aria-required'] = label.required;
      }

      if (label.expanded !== undefined) {
        attributes['aria-expanded'] = label.expanded;
      }

      if (label.selected !== undefined) {
        attributes['aria-selected'] = label.selected;
      }

      if (label.pressed !== undefined) {
        attributes['aria-pressed'] = label.pressed;
      }

      return attributes;
    },
    [ariaLabels, settings]
  );

  // Mark announcement as read
  const markAsRead = useCallback((id: string) => {
    setAnnouncements((prev) =>
      prev.map((announcement) =>
        announcement.id === id ? { ...announcement, read: true } : announcement
      )
    );
  }, []);

  // Clear announcements
  const clearAnnouncements = useCallback(() => {
    setAnnouncements([]);
  }, []);

  // Update settings
  const updateSettings = useCallback((updates: Partial<ScreenReaderSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;

    if (settings.enabled) {
      root.setAttribute('data-screen-reader-enabled', 'true');
      root.setAttribute('data-screen-reader-verbosity', settings.verbosity);
    } else {
      root.removeAttribute('data-screen-reader-enabled');
      root.removeAttribute('data-screen-reader-verbosity');
    }
  }, [settings]);

  return {
    settings,
    announcements,
    liveRegions,
    ariaLabels,
    stats,
    announce,
    createLiveRegion,
    removeLiveRegion,
    updateLiveRegion,
    addAriaLabel,
    updateAriaLabel,
    getAriaAttributes,
    markAsRead,
    clearAnnouncements,
    updateSettings,
  };
};

// ============================================================================
// Component
// ============================================================================

export const ScreenReaderSupport: React.FC = () => {
  const {
    settings,
    announcements,
    liveRegions,
    ariaLabels,
    stats,
    announce,
    createLiveRegion,
    removeLiveRegion,
    getAriaAttributes,
    markAsRead,
    clearAnnouncements,
    updateSettings,
  } = useScreenReaderSupport();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'announcements' | 'labels' | 'regions' | 'test'
  >('overview');

  // Test announcement
  const handleTestAnnouncement = (
    priority: AnnouncementPriority,
    category: ScreenReaderAnnouncement['category']
  ) => {
    const messages: Record<ScreenReaderAnnouncement['category'], string> = {
      navigation: `Test navigation announcement (${priority})`,
      action: `Test action announcement (${priority})`,
      error: `Test error announcement (${priority})`,
      success: `Test success announcement (${priority})`,
      info: `Test info announcement (${priority})`,
      warning: `Test warning announcement (${priority})`,
    };

    announce(messages[category], priority, category);
  };

  // Test live region
  const handleTestLiveRegion = () => {
    const regionId = `test-region-${Date.now()}`;
    createLiveRegion(regionId, 'polite', false, 'additions');

    // Remove after 5 seconds
    setTimeout(() => {
      removeLiveRegion(regionId);
    }, 5000);
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
          Screen Reader Support
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '1rem' }}>
          Comprehensive screen reader accessibility with ARIA labels, live regions, and announcements
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => updateSettings({ enabled: e.target.checked })}
            />
            <span>Enable Screen Reader Support</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.announcements}
              onChange={(e) => updateSettings({ announcements: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Announcements</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.liveRegions}
              onChange={(e) => updateSettings({ liveRegions: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Live Regions</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.landmarks}
              onChange={(e) => updateSettings({ landmarks: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Landmarks</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.roles}
              onChange={(e) => updateSettings({ roles: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>ARIA Roles</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.skipLinks}
              onChange={(e) => updateSettings({ skipLinks: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Skip Links</span>
          </label>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span>Verbosity Level</span>
            <select
              value={settings.verbosity}
              onChange={(e) =>
                updateSettings({ verbosity: e.target.value as ScreenReaderSettings['verbosity'] })
              }
              disabled={!settings.enabled}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '1rem',
              }}
            >
              <option value="minimal">Minimal</option>
              <option value="standard">Standard</option>
              <option value="verbose">Verbose</option>
            </select>
          </label>
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
            Total Announcements
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {stats.totalAnnouncements}
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
            Live Regions
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
            {liveRegions.length}
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
            ARIA Labels
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
            {ariaLabels.length}
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
            Most Common
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {stats.mostCommonCategory}
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
          { id: 'announcements', label: 'Announcements' },
          { id: 'labels', label: 'ARIA Labels' },
          { id: 'regions', label: 'Live Regions' },
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
                Screen reader support ensures your application is accessible to users who rely on
                assistive technologies. This includes proper ARIA labels, live regions for dynamic
                content, and semantic HTML structure.
              </p>

              <h3 style={{ margin: '2rem 0 1rem 0' }}>Key Features</h3>
              <ul style={{ lineHeight: 1.8 }}>
                <li>
                  <strong>ARIA Labels:</strong> Descriptive labels for all interactive elements
                </li>
                <li>
                  <strong>Live Regions:</strong> Announce dynamic content changes to screen readers
                </li>
                <li>
                  <strong>Announcements:</strong> Polite and assertive announcements for user actions
                </li>
                <li>
                  <strong>Landmarks:</strong> Semantic HTML landmarks for easy navigation
                </li>
                <li>
                  <strong>Roles:</strong> ARIA roles for custom components
                </li>
                <li>
                  <strong>Skip Links:</strong> Quick navigation to main content areas
                </li>
              </ul>

              <h3 style={{ margin: '2rem 0 1rem 0' }}>WCAG Compliance</h3>
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                This implementation follows WCAG 2.1 Level AA guidelines for screen reader
                accessibility, including proper labeling, semantic structure, and dynamic content
                announcements.
              </p>
            </div>
          )}

          {activeTab === 'announcements' && (
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <h2 style={{ margin: 0 }}>Announcements ({announcements.length})</h2>
                <button
                  onClick={clearAnnouncements}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Clear All
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    style={{
                      padding: '1rem',
                      background: announcement.read ? '#f9fafb' : '#eff6ff',
                      borderRadius: '8px',
                      borderLeft: `4px solid ${
                        announcement.priority === 'assertive'
                          ? '#ef4444'
                          : announcement.priority === 'polite'
                          ? '#3b82f6'
                          : '#9ca3af'
                      }`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.875rem',
                          color: '#666',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                        }}
                      >
                        {announcement.category}
                      </span>
                      <span style={{ fontSize: '0.875rem', color: '#666' }}>
                        {announcement.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>{announcement.message}</div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          background: '#e5e7eb',
                          borderRadius: '4px',
                        }}
                      >
                        {announcement.priority}
                      </span>
                      {!announcement.read && (
                        <button
                          onClick={() => markAsRead(announcement.id)}
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'labels' && (
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>ARIA Labels ({ariaLabels.length})</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {ariaLabels.map((label) => (
                  <div
                    key={label.element}
                    style={{
                      padding: '1.5rem',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '1rem',
                      }}
                    >
                      <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{label.element}</h3>
                      {label.role && (
                        <span
                          style={{
                            fontSize: '0.875rem',
                            padding: '0.25rem 0.75rem',
                            background: '#3b82f6',
                            color: 'white',
                            borderRadius: '4px',
                          }}
                        >
                          role: {label.role}
                        </span>
                      )}
                    </div>

                    <div style={{ marginBottom: '0.75rem' }}>
                      <strong>Label:</strong> {label.label}
                    </div>

                    {label.description && (
                      <div style={{ marginBottom: '0.75rem', color: '#666' }}>
                        <strong>Description:</strong> {label.description}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {label.required !== undefined && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            background: label.required ? '#fbbf24' : '#e5e7eb',
                            borderRadius: '4px',
                          }}
                        >
                          required: {label.required.toString()}
                        </span>
                      )}
                      {label.expanded !== undefined && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            background: '#e5e7eb',
                            borderRadius: '4px',
                          }}
                        >
                          expanded: {label.expanded.toString()}
                        </span>
                      )}
                      {label.selected !== undefined && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            background: '#e5e7eb',
                            borderRadius: '4px',
                          }}
                        >
                          selected: {label.selected.toString()}
                        </span>
                      )}
                      {label.pressed !== undefined && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            background: '#e5e7eb',
                            borderRadius: '4px',
                          }}
                        >
                          pressed: {label.pressed.toString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'regions' && (
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>
                Live Regions ({liveRegions.length})
              </h2>

              <p style={{ margin: 0, marginBottom: '1rem', color: '#666' }}>
                Live regions announce dynamic content changes to screen readers without moving focus.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {liveRegions.map((region) => (
                  <div
                    key={region.id}
                    style={{
                      padding: '1.5rem',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <h3 style={{ margin: 0, marginBottom: '1rem', fontSize: '1.125rem' }}>
                      {region.id}
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <strong>Priority:</strong> {region.priority}
                      </div>
                      <div>
                        <strong>Atomic:</strong> {region.atomic.toString()}
                      </div>
                      <div>
                        <strong>Relevant:</strong> {region.relevant}
                      </div>
                      <div>
                        <strong>Busy:</strong> {region.busy.toString()}
                      </div>
                    </div>
                  </div>
                ))}

                {liveRegions.length === 0 && (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                    No active live regions. Create one in the test tab.
                  </div>
                )}
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
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Test Screen Reader Features</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Test Announcements */}
                <div>
                  <h3 style={{ margin: 0, marginBottom: '1rem' }}>Test Announcements</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {(['polite', 'assertive'] as AnnouncementPriority[]).map((priority) => (
                      <div key={priority} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <h4 style={{ margin: 0, fontSize: '0.875rem', textTransform: 'capitalize' }}>
                          {priority}
                        </h4>
                        {(['info', 'success', 'warning', 'error'] as const).map((category) => (
                          <button
                            key={category}
                            onClick={() => handleTestAnnouncement(priority, category)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                            }}
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Test Live Regions */}
                <div>
                  <h3 style={{ margin: 0, marginBottom: '1rem' }}>Test Live Regions</h3>
                  <button
                    onClick={handleTestLiveRegion}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                    }}
                  >
                    Create Test Live Region (5s duration)
                  </button>
                </div>

                {/* ARIA Attributes Example */}
                <div>
                  <h3 style={{ margin: 0, marginBottom: '1rem' }}>ARIA Attributes Example</h3>
                  <div
                    {...getAriaAttributes('start-button')}
                    style={{
                      padding: '1rem',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <pre style={{ margin: 0, fontSize: '0.875rem', overflow: 'auto' }}>
                      {JSON.stringify(getAriaAttributes('start-button'), null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Live Region Elements (hidden, for screen readers only) */}
      {settings.enabled && settings.liveRegions && (
        <div
          style={{
            position: 'absolute',
            left: '-10000px',
            width: '1px',
            height: '1px',
            overflow: 'hidden',
          }}
        >
          {liveRegions.map((region) => (
            <div
              key={region.id}
              id={region.id}
              aria-live={region.priority}
              aria-atomic={region.atomic}
              aria-relevant={region.relevant}
              aria-busy={region.busy}
            />
          ))}

          {/* Recent announcements */}
          {announcements.slice(0, 3).map((announcement) => (
            <div
              key={announcement.id}
              aria-live={announcement.priority}
              aria-atomic="true"
            >
              {announcement.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScreenReaderSupport;
