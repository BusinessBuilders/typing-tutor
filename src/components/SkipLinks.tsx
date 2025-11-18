import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type SkipLinkPosition = 'top-left' | 'top-center' | 'top-right';

export type SkipLinkStyle = 'minimal' | 'standard' | 'prominent' | 'floating';

export interface SkipLinkTarget {
  id: string;
  label: string;
  targetId: string;
  description?: string;
  icon?: string;
  shortcut?: string;
  priority: number;
  category: 'navigation' | 'content' | 'action' | 'utility';
}

export interface SkipLinkSettings {
  enabled: boolean;
  visibleOnFocus: boolean;
  alwaysVisible: boolean;
  position: SkipLinkPosition;
  style: SkipLinkStyle;
  showShortcuts: boolean;
  showIcons: boolean;
  autoHide: boolean;
  autoHideDelay: number;
  highlightTarget: boolean;
  smoothScroll: boolean;
  announceNavigation: boolean;
}

export interface SkipLinkStats {
  totalLinks: number;
  totalUsage: number;
  usageByLink: Record<string, number>;
  mostUsedLink: string | null;
  averageUsagePerSession: number;
  lastUsed: Date | null;
}

export interface SkipLinkTheme {
  style: SkipLinkStyle;
  name: string;
  description: string;
  colors: {
    background: string;
    text: string;
    border: string;
    hover: string;
    focus: string;
  };
  dimensions: {
    padding: string;
    fontSize: string;
    borderRadius: string;
    borderWidth: string;
  };
}

// ============================================================================
// Mock Data Generators
// ============================================================================

const generateSkipLinks = (): SkipLinkTarget[] => {
  return [
    {
      id: 'skip-main',
      label: 'Skip to main content',
      targetId: 'main-content',
      description: 'Jump directly to the main page content',
      icon: '📄',
      shortcut: 'Alt+M',
      priority: 1,
      category: 'content',
    },
    {
      id: 'skip-nav',
      label: 'Skip to navigation',
      targetId: 'main-navigation',
      description: 'Jump to the main navigation menu',
      icon: '🧭',
      shortcut: 'Alt+N',
      priority: 2,
      category: 'navigation',
    },
    {
      id: 'skip-search',
      label: 'Skip to search',
      targetId: 'search-bar',
      description: 'Jump to the search functionality',
      icon: '🔍',
      shortcut: 'Alt+S',
      priority: 3,
      category: 'utility',
    },
    {
      id: 'skip-footer',
      label: 'Skip to footer',
      targetId: 'page-footer',
      description: 'Jump to the page footer',
      icon: '⬇️',
      shortcut: 'Alt+F',
      priority: 4,
      category: 'navigation',
    },
    {
      id: 'skip-exercises',
      label: 'Skip to exercises',
      targetId: 'exercises-section',
      description: 'Jump to the typing exercises section',
      icon: '⌨️',
      shortcut: 'Alt+E',
      priority: 5,
      category: 'content',
    },
    {
      id: 'skip-profile',
      label: 'Skip to profile',
      targetId: 'user-profile',
      description: 'Jump to your user profile',
      icon: '👤',
      shortcut: 'Alt+P',
      priority: 6,
      category: 'navigation',
    },
    {
      id: 'skip-settings',
      label: 'Skip to settings',
      targetId: 'settings-panel',
      description: 'Jump to application settings',
      icon: '⚙️',
      shortcut: 'Alt+T',
      priority: 7,
      category: 'utility',
    },
    {
      id: 'skip-help',
      label: 'Skip to help',
      targetId: 'help-section',
      description: 'Jump to help and documentation',
      icon: '❓',
      shortcut: 'Alt+H',
      priority: 8,
      category: 'utility',
    },
  ];
};

const skipLinkThemes: SkipLinkTheme[] = [
  {
    style: 'minimal',
    name: 'Minimal',
    description: 'Subtle skip links that appear only on focus',
    colors: {
      background: '#ffffff',
      text: '#1f2937',
      border: '#e5e7eb',
      hover: '#f3f4f6',
      focus: '#3b82f6',
    },
    dimensions: {
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      borderRadius: '4px',
      borderWidth: '1px',
    },
  },
  {
    style: 'standard',
    name: 'Standard',
    description: 'Clear and visible skip links with good contrast',
    colors: {
      background: '#3b82f6',
      text: '#ffffff',
      border: '#2563eb',
      hover: '#2563eb',
      focus: '#1d4ed8',
    },
    dimensions: {
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      borderRadius: '6px',
      borderWidth: '2px',
    },
  },
  {
    style: 'prominent',
    name: 'Prominent',
    description: 'High visibility skip links with strong visual presence',
    colors: {
      background: '#1f2937',
      text: '#ffffff',
      border: '#fbbf24',
      hover: '#374151',
      focus: '#fbbf24',
    },
    dimensions: {
      padding: '1rem 2rem',
      fontSize: '1.125rem',
      borderRadius: '8px',
      borderWidth: '3px',
    },
  },
  {
    style: 'floating',
    name: 'Floating',
    description: 'Floating skip links with shadow and elevation',
    colors: {
      background: '#ffffff',
      text: '#1f2937',
      border: '#3b82f6',
      hover: '#eff6ff',
      focus: '#3b82f6',
    },
    dimensions: {
      padding: '0.875rem 1.75rem',
      fontSize: '1rem',
      borderRadius: '50px',
      borderWidth: '2px',
    },
  },
];

// ============================================================================
// Custom Hook
// ============================================================================

export const useSkipLinks = (initialSettings?: Partial<SkipLinkSettings>) => {
  const [settings, setSettings] = useState<SkipLinkSettings>({
    enabled: true,
    visibleOnFocus: true,
    alwaysVisible: false,
    position: 'top-left',
    style: 'standard',
    showShortcuts: true,
    showIcons: false,
    autoHide: false,
    autoHideDelay: 3000,
    highlightTarget: true,
    smoothScroll: true,
    announceNavigation: true,
    ...initialSettings,
  });

  const [links, setLinks] = useState<SkipLinkTarget[]>(generateSkipLinks());
  const [stats, setStats] = useState<SkipLinkStats>({
    totalLinks: 0,
    totalUsage: 0,
    usageByLink: {},
    mostUsedLink: null,
    averageUsagePerSession: 0,
    lastUsed: null,
  });
  const [isVisible, setIsVisible] = useState(false);
  const [focusedLinkId, setFocusedLinkId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Navigate to target
  const navigateToTarget = useCallback(
    (target: SkipLinkTarget) => {
      const element = document.getElementById(target.targetId);

      if (element) {
        // Scroll to element
        if (settings.smoothScroll) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          element.scrollIntoView({ block: 'start' });
        }

        // Set focus
        if (!element.hasAttribute('tabindex')) {
          element.setAttribute('tabindex', '-1');
        }
        element.focus();

        // Highlight target
        if (settings.highlightTarget) {
          element.style.outline = '3px solid #3b82f6';
          element.style.outlineOffset = '4px';

          setTimeout(() => {
            element.style.outline = '';
            element.style.outlineOffset = '';
          }, 2000);
        }

        // Announce navigation
        if (settings.announceNavigation) {
          const announcement = document.createElement('div');
          announcement.setAttribute('role', 'status');
          announcement.setAttribute('aria-live', 'polite');
          announcement.style.position = 'absolute';
          announcement.style.left = '-10000px';
          announcement.textContent = `Navigated to ${target.label}`;
          document.body.appendChild(announcement);

          setTimeout(() => {
            document.body.removeChild(announcement);
          }, 1000);
        }

        // Update stats
        setStats((prev) => ({
          ...prev,
          totalUsage: prev.totalUsage + 1,
          usageByLink: {
            ...prev.usageByLink,
            [target.id]: (prev.usageByLink[target.id] || 0) + 1,
          },
          lastUsed: new Date(),
        }));
      }
    },
    [settings.smoothScroll, settings.highlightTarget, settings.announceNavigation]
  );

  // Add skip link
  const addSkipLink = useCallback((link: SkipLinkTarget) => {
    setLinks((prev) => [...prev, link].sort((a, b) => a.priority - b.priority));
  }, []);

  // Remove skip link
  const removeSkipLink = useCallback((id: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== id));
  }, []);

  // Update skip link
  const updateSkipLink = useCallback((id: string, updates: Partial<SkipLinkTarget>) => {
    setLinks((prev) =>
      prev
        .map((link) => (link.id === id ? { ...link, ...updates } : link))
        .sort((a, b) => a.priority - b.priority)
    );
  }, []);

  // Update settings
  const updateSettings = useCallback((updates: Partial<SkipLinkSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // Show skip links
  const show = useCallback(() => {
    setIsVisible(true);
  }, []);

  // Hide skip links
  const hide = useCallback(() => {
    setIsVisible(false);
  }, []);

  // Toggle visibility
  const toggle = useCallback(() => {
    setIsVisible((prev) => !prev);
  }, []);

  // Calculate stats
  useEffect(() => {
    const totalLinks = links.length;
    const usageByLink = stats.usageByLink;
    const totalUsage = Object.values(usageByLink).reduce((sum, count) => sum + count, 0);

    let mostUsedLink: string | null = null;
    let maxUsage = 0;

    Object.entries(usageByLink).forEach(([linkId, count]) => {
      if (count > maxUsage) {
        maxUsage = count;
        mostUsedLink = linkId;
      }
    });

    setStats((prev) => ({
      ...prev,
      totalLinks,
      totalUsage,
      mostUsedLink,
      averageUsagePerSession: totalLinks > 0 ? totalUsage / totalLinks : 0,
    }));
  }, [links, stats.usageByLink]);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!settings.enabled || !settings.showShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        links.forEach((link) => {
          if (link.shortcut) {
            const key = link.shortcut.split('+').pop()?.toLowerCase();
            if (key === e.key.toLowerCase()) {
              e.preventDefault();
              navigateToTarget(link);
            }
          }
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.enabled, settings.showShortcuts, links, navigateToTarget]);

  // Auto-hide functionality
  useEffect(() => {
    if (!settings.autoHide || !isVisible) return;

    const timer = setTimeout(() => {
      hide();
    }, settings.autoHideDelay);

    return () => clearTimeout(timer);
  }, [settings.autoHide, settings.autoHideDelay, isVisible, hide]);

  return {
    settings,
    links,
    stats,
    themes: skipLinkThemes,
    isVisible,
    focusedLinkId,
    navigateToTarget,
    addSkipLink,
    removeSkipLink,
    updateSkipLink,
    updateSettings,
    show,
    hide,
    toggle,
    setFocusedLinkId,
    containerRef,
  };
};

// ============================================================================
// Component
// ============================================================================

export const SkipLinks: React.FC = () => {
  const {
    settings,
    links,
    stats,
    themes,
    updateSettings,
  } = useSkipLinks();

  const [activeTab, setActiveTab] = useState<'overview' | 'links' | 'settings' | 'test'>(
    'overview'
  );

  // Get current theme
  const currentTheme = themes.find((t) => t.style === settings.style) || themes[1];

  // Get position styles
  const getPositionStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    };

    switch (settings.position) {
      case 'top-left':
        return { ...base, top: '1rem', left: '1rem' };
      case 'top-center':
        return { ...base, top: '1rem', left: '50%', transform: 'translateX(-50%)' };
      case 'top-right':
        return { ...base, top: '1rem', right: '1rem' };
      default:
        return { ...base, top: '1rem', left: '1rem' };
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '2rem' }}
      >
        <h1 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '2rem' }}>Skip Links</h1>
        <p style={{ margin: 0, color: '#666', fontSize: '1rem' }}>
          Enable keyboard users to quickly navigate to important page sections
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => updateSettings({ enabled: e.target.checked })}
            />
            <span>Enable Skip Links</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.visibleOnFocus}
              onChange={(e) => updateSettings({ visibleOnFocus: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Visible on Focus</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.alwaysVisible}
              onChange={(e) => updateSettings({ alwaysVisible: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Always Visible</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.showShortcuts}
              onChange={(e) => updateSettings({ showShortcuts: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Show Shortcuts</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.showIcons}
              onChange={(e) => updateSettings({ showIcons: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Show Icons</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.highlightTarget}
              onChange={(e) => updateSettings({ highlightTarget: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Highlight Target</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.smoothScroll}
              onChange={(e) => updateSettings({ smoothScroll: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Smooth Scroll</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.announceNavigation}
              onChange={(e) => updateSettings({ announceNavigation: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Announce Navigation</span>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span>Position</span>
            <select
              value={settings.position}
              onChange={(e) =>
                updateSettings({ position: e.target.value as SkipLinkPosition })
              }
              disabled={!settings.enabled}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '1rem',
              }}
            >
              <option value="top-left">Top Left</option>
              <option value="top-center">Top Center</option>
              <option value="top-right">Top Right</option>
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span>Style</span>
            <select
              value={settings.style}
              onChange={(e) => updateSettings({ style: e.target.value as SkipLinkStyle })}
              disabled={!settings.enabled}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '1rem',
              }}
            >
              {themes.map((theme) => (
                <option key={theme.style} value={theme.style}>
                  {theme.name}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span>Auto Hide Delay (ms)</span>
            <input
              type="number"
              value={settings.autoHideDelay}
              onChange={(e) => updateSettings({ autoHideDelay: parseInt(e.target.value) })}
              disabled={!settings.enabled || !settings.autoHide}
              min={1000}
              max={10000}
              step={500}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '1rem',
              }}
            />
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
            Total Links
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {stats.totalLinks}
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
            Total Usage
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
            {stats.totalUsage}
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
            Most Used
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#8b5cf6' }}>
            {stats.mostUsedLink
              ? links.find((l) => l.id === stats.mostUsedLink)?.label || 'N/A'
              : 'N/A'}
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
            Last Used
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {stats.lastUsed ? stats.lastUsed.toLocaleString() : 'Never'}
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
          { id: 'links', label: `Links (${links.length})` },
          { id: 'settings', label: 'Theme Settings' },
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
                Skip links are navigation aids that allow keyboard users to bypass repetitive
                content and jump directly to important sections of the page. They are essential for
                accessibility and user experience.
              </p>

              <h3 style={{ margin: '2rem 0 1rem 0' }}>Benefits</h3>
              <ul style={{ lineHeight: 1.8 }}>
                <li>Saves time for keyboard and screen reader users</li>
                <li>Improves navigation efficiency</li>
                <li>Reduces repetitive navigation through menus</li>
                <li>Required for WCAG 2.1 Level A compliance</li>
                <li>Enhances overall user experience</li>
              </ul>

              <h3 style={{ margin: '2rem 0 1rem 0' }}>Best Practices</h3>
              <ul style={{ lineHeight: 1.8 }}>
                <li>Place skip links at the beginning of the page</li>
                <li>Make them visible when focused</li>
                <li>Use clear, descriptive labels</li>
                <li>Ensure high contrast and readability</li>
                <li>Include keyboard shortcuts for power users</li>
              </ul>

              <h3 style={{ margin: '2rem 0 1rem 0' }}>WCAG Compliance</h3>
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                This implementation follows WCAG 2.1 Level A - Success Criterion 2.4.1 (Bypass
                Blocks), which requires a mechanism to bypass blocks of content that are repeated on
                multiple pages.
              </p>
            </div>
          )}

          {activeTab === 'links' && (
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Skip Links ({links.length})</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {links.map((link) => (
                  <div
                    key={link.id}
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
                        alignItems: 'start',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.125rem' }}>
                          {settings.showIcons && link.icon && `${link.icon} `}
                          {link.label}
                        </h3>
                        {link.description && (
                          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                            {link.description}
                          </div>
                        )}
                        <div style={{ fontSize: '0.875rem', color: '#666' }}>
                          Target: <code style={{ background: '#e5e7eb', padding: '0.125rem 0.375rem', borderRadius: '3px' }}>#{link.targetId}</code>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column', alignItems: 'flex-end' }}>
                        {link.shortcut && settings.showShortcuts && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              background: '#3b82f6',
                              color: 'white',
                              borderRadius: '4px',
                              fontFamily: 'monospace',
                            }}
                          >
                            {link.shortcut}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            background: '#10b981',
                            color: 'white',
                            borderRadius: '4px',
                            textTransform: 'capitalize',
                          }}
                        >
                          {link.category}
                        </span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            background: '#6b7280',
                            color: 'white',
                            borderRadius: '4px',
                          }}
                        >
                          Priority: {link.priority}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '0.75rem',
                        background: '#eff6ff',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                      }}
                    >
                      <strong>Usage:</strong> {stats.usageByLink[link.id] || 0} times
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
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Theme Settings</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {themes.map((theme) => (
                  <div
                    key={theme.style}
                    style={{
                      padding: '1.5rem',
                      background: settings.style === theme.style ? '#eff6ff' : '#f9fafb',
                      borderRadius: '8px',
                      border: `2px solid ${settings.style === theme.style ? '#3b82f6' : '#e5e7eb'}`,
                    }}
                  >
                    <h3 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.125rem' }}>
                      {theme.name}
                    </h3>
                    <p style={{ margin: 0, marginBottom: '1rem', color: '#666', fontSize: '0.875rem' }}>
                      {theme.description}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <h4 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                          Colors
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
                          {Object.entries(theme.colors).map(([key, value]) => (
                            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  background: value,
                                  border: '1px solid #ddd',
                                  borderRadius: '4px',
                                }}
                              />
                              <span style={{ textTransform: 'capitalize' }}>{key}:</span>
                              <code style={{ background: '#e5e7eb', padding: '0.125rem 0.25rem', borderRadius: '3px' }}>
                                {value}
                              </code>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                          Dimensions
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.75rem' }}>
                          {Object.entries(theme.dimensions).map(([key, value]) => (
                            <div key={key}>
                              <span style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}:</span>{' '}
                              <code style={{ background: '#e5e7eb', padding: '0.125rem 0.25rem', borderRadius: '3px' }}>
                                {value}
                              </code>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => updateSettings({ style: theme.style })}
                      style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        background: settings.style === theme.style ? '#10b981' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      {settings.style === theme.style ? 'Current Theme' : 'Use This Theme'}
                    </button>
                  </div>
                ))}
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
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Test Skip Links</h2>

              <p style={{ margin: 0, marginBottom: '1rem', color: '#666' }}>
                Press Tab to focus on the skip links below, or use the keyboard shortcuts listed
                with each link.
              </p>

              {/* Preview */}
              <div
                style={{
                  padding: '2rem',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  marginBottom: '2rem',
                  position: 'relative',
                  minHeight: '200px',
                }}
              >
                <h3 style={{ margin: 0, marginBottom: '1rem' }}>Skip Links Preview</h3>

                {settings.enabled && (
                  <div style={getPositionStyles()}>
                    {links.slice(0, 3).map((link) => (
                      <a
                        key={link.id}
                        href={`#${link.targetId}`}
                        style={{
                          padding: currentTheme.dimensions.padding,
                          fontSize: currentTheme.dimensions.fontSize,
                          background: currentTheme.colors.background,
                          color: currentTheme.colors.text,
                          border: `${currentTheme.dimensions.borderWidth} solid ${currentTheme.colors.border}`,
                          borderRadius: currentTheme.dimensions.borderRadius,
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          display: settings.alwaysVisible ? 'block' : 'none',
                          boxShadow: settings.style === 'floating' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.display = 'block';
                        }}
                        onBlur={(e) => {
                          if (!settings.alwaysVisible) {
                            e.currentTarget.style.display = 'none';
                          }
                        }}
                      >
                        {settings.showIcons && link.icon && `${link.icon} `}
                        {link.label}
                        {settings.showShortcuts && link.shortcut && ` (${link.shortcut})`}
                      </a>
                    ))}
                  </div>
                )}

                {/* Demo sections */}
                <div id="main-content" style={{ marginTop: '2rem', padding: '1rem', background: 'white', borderRadius: '6px' }}>
                  <h4 style={{ margin: 0 }}>Main Content Section</h4>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#666' }}>
                    This is where your main content would appear.
                  </p>
                </div>

                <div id="main-navigation" style={{ marginTop: '1rem', padding: '1rem', background: 'white', borderRadius: '6px' }}>
                  <h4 style={{ margin: 0 }}>Navigation Section</h4>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#666' }}>
                    This is where your navigation would appear.
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div
                style={{
                  padding: '1.5rem',
                  background: '#eff6ff',
                  borderRadius: '8px',
                  border: '1px solid #3b82f6',
                }}
              >
                <h4 style={{ margin: 0, marginBottom: '0.5rem', color: '#1e40af' }}>
                  Testing Instructions
                </h4>
                <ol style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: 1.8, fontSize: '0.875rem' }}>
                  <li>Press Tab to move focus to the first skip link</li>
                  <li>Use arrow keys or Tab to navigate between skip links</li>
                  <li>Press Enter to activate a skip link</li>
                  <li>Try the keyboard shortcuts (Alt + letter key)</li>
                  <li>Observe the smooth scrolling and target highlighting</li>
                </ol>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Hidden sections for skip link targets */}
      <div style={{ display: 'none' }}>
        <div id="exercises-section" tabIndex={-1}>Exercises Section</div>
        <div id="user-profile" tabIndex={-1}>User Profile</div>
        <div id="settings-panel" tabIndex={-1}>Settings Panel</div>
        <div id="help-section" tabIndex={-1}>Help Section</div>
        <div id="search-bar" tabIndex={-1}>Search Bar</div>
        <div id="page-footer" tabIndex={-1}>Page Footer</div>
      </div>
    </div>
  );
};

export default SkipLinks;
