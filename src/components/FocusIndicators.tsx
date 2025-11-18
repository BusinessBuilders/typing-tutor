import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Types
export type FocusStyle = 'subtle' | 'standard' | 'enhanced' | 'high-contrast' | 'animated';

export interface FocusIndicatorSettings {
  style: FocusStyle;
  enabled: boolean;
  thickness: number; // in pixels
  offset: number; // in pixels
  color: string;
  showSkipLinks: boolean;
  highlightCurrentSection: boolean;
  persistOnClick: boolean;
  animateTransitions: boolean;
}

export interface FocusStylePreset {
  style: FocusStyle;
  name: string;
  description: string;
  thickness: number;
  offset: number;
  color: string;
  opacity: number;
  borderRadius: number;
  animation: boolean;
  wcagCompliant: boolean;
  recommended: string;
}

// Focus style presets
const focusStylePresets: FocusStylePreset[] = [
  {
    style: 'subtle',
    name: 'Subtle',
    description: 'Minimal focus indicators',
    thickness: 1,
    offset: 0,
    color: '#3b82f6',
    opacity: 0.5,
    borderRadius: 4,
    animation: false,
    wcagCompliant: false,
    recommended: 'Users familiar with keyboard navigation',
  },
  {
    style: 'standard',
    name: 'Standard',
    description: 'Default browser-style focus ring',
    thickness: 2,
    offset: 2,
    color: '#3b82f6',
    opacity: 0.8,
    borderRadius: 4,
    animation: false,
    wcagCompliant: true,
    recommended: 'General keyboard navigation (WCAG compliant)',
  },
  {
    style: 'enhanced',
    name: 'Enhanced',
    description: 'Thicker, more visible focus indicators',
    thickness: 3,
    offset: 3,
    color: '#2563eb',
    opacity: 1,
    borderRadius: 6,
    animation: false,
    wcagCompliant: true,
    recommended: 'Users who rely heavily on keyboard navigation',
  },
  {
    style: 'high-contrast',
    name: 'High Contrast',
    description: 'Maximum visibility for low vision',
    thickness: 4,
    offset: 4,
    color: '#000000',
    opacity: 1,
    borderRadius: 8,
    animation: false,
    wcagCompliant: true,
    recommended: 'Users with low vision or in bright environments',
  },
  {
    style: 'animated',
    name: 'Animated',
    description: 'Animated focus with pulse effect',
    thickness: 3,
    offset: 3,
    color: '#3b82f6',
    opacity: 1,
    borderRadius: 6,
    animation: true,
    wcagCompliant: true,
    recommended: 'Users who benefit from motion cues',
  },
];

// Custom hook
function useFocusIndicators() {
  const [settings, setSettings] = useState<FocusIndicatorSettings>({
    style: 'standard',
    enabled: true,
    thickness: 2,
    offset: 2,
    color: '#3b82f6',
    showSkipLinks: true,
    highlightCurrentSection: true,
    persistOnClick: false,
    animateTransitions: false,
  });

  const [currentPreset, setCurrentPreset] = useState<FocusStylePreset>(
    focusStylePresets[1] // Standard
  );

  const [focusedElement, setFocusedElement] = useState<string | null>(null);

  useEffect(() => {
    const preset = focusStylePresets.find((p) => p.style === settings.style);
    if (preset) {
      setCurrentPreset(preset);
      applyFocusStyle(preset);
    }
  }, [settings]);

  useEffect(() => {
    if (!settings.enabled) return;

    // Track focus changes
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      setFocusedElement(target.tagName);
    };

    const handleBlur = () => {
      if (!settings.persistOnClick) {
        setFocusedElement(null);
      }
    };

    document.addEventListener('focus', handleFocus, true);
    document.addEventListener('blur', handleBlur, true);

    return () => {
      document.removeEventListener('focus', handleFocus, true);
      document.removeEventListener('blur', handleBlur, true);
    };
  }, [settings.enabled, settings.persistOnClick]);

  const applyFocusStyle = (preset: FocusStylePreset) => {
    const root = document.documentElement;

    if (settings.enabled) {
      // Focus ring properties
      root.style.setProperty('--focus-thickness', `${preset.thickness}px`);
      root.style.setProperty('--focus-offset', `${preset.offset}px`);
      root.style.setProperty('--focus-color', preset.color);
      root.style.setProperty('--focus-opacity', preset.opacity.toString());
      root.style.setProperty('--focus-radius', `${preset.borderRadius}px`);

      // Apply global focus styles
      const styleId = 'focus-indicator-styles';
      let styleElement = document.getElementById(styleId) as HTMLStyleElement;

      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }

      const animation = preset.animation
        ? `
        @keyframes focusPulse {
          0%, 100% { opacity: ${preset.opacity}; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        `
        : '';

      styleElement.textContent = `
        ${animation}

        *:focus {
          outline: ${preset.thickness}px solid ${preset.color} !important;
          outline-offset: ${preset.offset}px !important;
          border-radius: ${preset.borderRadius}px;
          ${preset.animation ? 'animation: focusPulse 2s ease-in-out infinite;' : ''}
        }

        *:focus:not(:focus-visible) {
          outline: none;
        }

        *:focus-visible {
          outline: ${preset.thickness}px solid ${preset.color} !important;
          outline-offset: ${preset.offset}px !important;
          border-radius: ${preset.borderRadius}px;
          ${preset.animation ? 'animation: focusPulse 2s ease-in-out infinite;' : ''}
        }
      `;
    } else {
      const styleElement = document.getElementById('focus-indicator-styles');
      if (styleElement) {
        styleElement.remove();
      }
    }
  };

  const setStyle = (style: FocusStyle) => {
    setSettings((prev) => ({ ...prev, style }));
  };

  const updateSettings = (newSettings: Partial<FocusIndicatorSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetToDefault = () => {
    setSettings({
      style: 'standard',
      enabled: true,
      thickness: 2,
      offset: 2,
      color: '#3b82f6',
      showSkipLinks: true,
      highlightCurrentSection: true,
      persistOnClick: false,
      animateTransitions: false,
    });
  };

  return {
    settings,
    currentPreset,
    presets: focusStylePresets,
    focusedElement,
    setStyle,
    updateSettings,
    resetToDefault,
  };
}

// Preset preview component
function PresetPreview({ preset, isActive }: { preset: FocusStylePreset; isActive: boolean }) {
  return (
    <div
      className={`p-6 rounded-lg border-2 transition-all ${
        isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold">{preset.name}</h3>
          {preset.wcagCompliant && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
              WCAG ✓
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-2">{preset.description}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 bg-gray-100 rounded">{preset.thickness}px thick</span>
          <span className="px-2 py-1 bg-gray-100 rounded">{preset.offset}px offset</span>
          {preset.animation && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">Animated</span>
          )}
        </div>
      </div>

      {/* Sample focus indicator */}
      <div className="flex justify-center">
        <div className="relative inline-block">
          <button
            className="px-6 py-3 bg-blue-500 text-white rounded font-medium"
            tabIndex={-1}
          >
            Sample Button
          </button>
          <div
            className="absolute inset-0 pointer-events-none rounded"
            style={{
              outline: `${preset.thickness}px solid ${preset.color}`,
              outlineOffset: `${preset.offset}px`,
              opacity: preset.opacity,
              borderRadius: `${preset.borderRadius}px`,
            }}
          />
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        {preset.recommended}
      </p>
    </div>
  );
}

// Skip link component
function SkipLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:font-medium focus:shadow-lg"
    >
      {children}
    </a>
  );
}

// Main component
export default function FocusIndicators() {
  const {
    settings,
    currentPreset,
    presets,
    focusedElement,
    setStyle,
    updateSettings,
    resetToDefault,
  } = useFocusIndicators();

  const [activeTab, setActiveTab] = useState<'presets' | 'settings' | 'test'>('presets');

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Skip links */}
      {settings.showSkipLinks && (
        <>
          <SkipLink href="#main-content">Skip to main content</SkipLink>
          <SkipLink href="#navigation">Skip to navigation</SkipLink>
        </>
      )}

      <div id="main-content" className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Focus Indicators</h1>
        <p className="text-gray-600">
          Enhance keyboard navigation with visible focus indicators
        </p>
      </div>

      {/* Current style indicator */}
      <div className="bg-white p-6 rounded-lg border mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">
              Current Style: {currentPreset.name}
            </h3>
            <p className="text-sm text-gray-600">
              {currentPreset.thickness}px thickness, {currentPreset.offset}px offset
              {currentPreset.wcagCompliant && (
                <span className="ml-2 text-green-600">• WCAG Compliant</span>
              )}
            </p>
          </div>
          <button
            onClick={resetToDefault}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            Reset to Default
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {currentPreset.thickness}px
          </div>
          <div className="text-sm text-gray-600">Focus Ring Thickness</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {currentPreset.offset}px
          </div>
          <div className="text-sm text-gray-600">Outline Offset</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {settings.enabled ? 'On' : 'Off'}
          </div>
          <div className="text-sm text-gray-600">Status</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {focusedElement || 'None'}
          </div>
          <div className="text-sm text-gray-600">Current Focus</div>
        </div>
      </div>

      {/* Tabs */}
      <div id="navigation" className="flex gap-2 mb-6 border-b">
        {(['presets', 'settings', 'test'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Presets Tab */}
      {activeTab === 'presets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presets.map((preset) => (
            <motion.div
              key={preset.style}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
              onClick={() => setStyle(preset.style)}
            >
              <PresetPreview
                preset={preset}
                isActive={settings.style === preset.style}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-lg border space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Focus Indicator Settings</h3>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => updateSettings({ enabled: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Enable Focus Indicators</div>
                  <div className="text-sm text-gray-600">
                    Show visual indicators for keyboard focus
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showSkipLinks}
                  onChange={(e) => updateSettings({ showSkipLinks: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Show Skip Links</div>
                  <div className="text-sm text-gray-600">
                    Display skip navigation links (visible on focus)
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.highlightCurrentSection}
                  onChange={(e) =>
                    updateSettings({ highlightCurrentSection: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Highlight Current Section</div>
                  <div className="text-sm text-gray-600">
                    Visually indicate the current page section
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.persistOnClick}
                  onChange={(e) => updateSettings({ persistOnClick: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Persist Focus on Click</div>
                  <div className="text-sm text-gray-600">
                    Keep focus visible after clicking
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.animateTransitions}
                  onChange={(e) =>
                    updateSettings({ animateTransitions: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Animate Focus Transitions</div>
                  <div className="text-sm text-gray-600">
                    Smooth transitions when focus changes
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">WCAG Guidelines</h3>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm space-y-3 text-blue-900">
                <p className="font-medium">Success Criterion 2.4.7 - Focus Visible (Level AA):</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>
                    Keyboard focus indicator must be <strong>visible</strong>
                  </li>
                  <li>
                    Must have sufficient contrast against the background (minimum 3:1)
                  </li>
                  <li>
                    Should be at least 2 CSS pixels thick around the perimeter
                  </li>
                  <li>
                    Must not be obscured by author-created content
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Keyboard Navigation Tips</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span>Move focus forward</span>
                <kbd className="px-2 py-1 bg-white border rounded font-mono text-xs">Tab</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span>Move focus backward</span>
                <kbd className="px-2 py-1 bg-white border rounded font-mono text-xs">
                  Shift + Tab
                </kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span>Activate focused element</span>
                <kbd className="px-2 py-1 bg-white border rounded font-mono text-xs">
                  Enter / Space
                </kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span>Navigate within component</span>
                <kbd className="px-2 py-1 bg-white border rounded font-mono text-xs">
                  Arrow Keys
                </kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Tab */}
      {activeTab === 'test' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-lg border">
            <h3 className="text-xl font-bold mb-6">Keyboard Navigation Test</h3>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⌨️</div>
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-1">
                    Instructions
                  </h4>
                  <p className="text-sm text-yellow-800">
                    Press <kbd className="px-2 py-1 bg-white border rounded text-xs">Tab</kbd> to
                    navigate through the interactive elements below. The focus indicator should
                    be clearly visible on each element.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive elements */}
            <div className="space-y-8">
              {/* Buttons */}
              <div>
                <h4 className="font-semibold mb-3">Buttons</h4>
                <div className="flex gap-3 flex-wrap">
                  <button className="px-6 py-3 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 transition-colors">
                    Primary Button
                  </button>
                  <button className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 transition-colors">
                    Secondary Button
                  </button>
                  <button className="px-6 py-3 bg-green-500 text-white rounded font-medium hover:bg-green-600 transition-colors">
                    Success Button
                  </button>
                </div>
              </div>

              {/* Links */}
              <div>
                <h4 className="font-semibold mb-3">Links</h4>
                <div className="space-y-2">
                  <p>
                    This is a paragraph with{' '}
                    <a href="#" className="text-blue-600 hover:underline">
                      an inline link
                    </a>{' '}
                    in the middle of the text.
                  </p>
                  <div className="flex gap-4">
                    <a href="#" className="text-blue-600 hover:underline">
                      Standalone Link 1
                    </a>
                    <a href="#" className="text-blue-600 hover:underline">
                      Standalone Link 2
                    </a>
                    <a href="#" className="text-blue-600 hover:underline">
                      Standalone Link 3
                    </a>
                  </div>
                </div>
              </div>

              {/* Form inputs */}
              <div>
                <h4 className="font-semibold mb-3">Form Inputs</h4>
                <div className="space-y-3 max-w-md">
                  <input
                    type="text"
                    placeholder="Text input"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded"
                  />
                  <select className="w-full px-4 py-2 border-2 border-gray-300 rounded">
                    <option>Select an option</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
                  </select>
                  <textarea
                    placeholder="Textarea"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded"
                    rows={3}
                  />
                </div>
              </div>

              {/* Checkboxes and radios */}
              <div>
                <h4 className="font-semibold mb-3">Checkboxes & Radio Buttons</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5" />
                    <span>Checkbox option 1</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5" />
                    <span>Checkbox option 2</span>
                  </label>
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="test-radio" className="w-5 h-5" />
                      <span>Radio option 1</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="test-radio" className="w-5 h-5" />
                      <span>Radio option 2</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Custom components */}
              <div>
                <h4 className="font-semibold mb-3">Custom Components</h4>
                <div className="flex gap-3">
                  <div
                    role="button"
                    tabIndex={0}
                    className="px-6 py-3 bg-purple-500 text-white rounded font-medium cursor-pointer hover:bg-purple-600 transition-colors"
                  >
                    Custom Button (div)
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    className="px-6 py-3 bg-orange-500 text-white rounded font-medium cursor-pointer hover:bg-orange-600 transition-colors"
                  >
                    Another Custom Element
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Best practices */}
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-start gap-3">
              <div className="text-2xl">✓</div>
              <div>
                <h4 className="font-semibold text-green-900 mb-1">
                  Focus Indicator Best Practices
                </h4>
                <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
                  <li>Never remove focus indicators with CSS (outline: none)</li>
                  <li>Ensure focus indicators have sufficient contrast (3:1 minimum)</li>
                  <li>Make focus indicators at least 2px thick</li>
                  <li>Provide skip links for keyboard users</li>
                  <li>Maintain logical tab order (left to right, top to bottom)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
