import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Types
export type ContrastMode = 'standard' | 'high' | 'extra-high' | 'inverse';

export interface ContrastTheme {
  mode: ContrastMode;
  name: string;
  description: string;
  colors: {
    background: string;
    text: string;
    primary: string;
    secondary: string;
    accent: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  accessibility: {
    textContrast: number; // WCAG ratio
    largeTextContrast: number;
    graphicsContrast: number;
  };
}

export interface ContrastSettings {
  mode: ContrastMode;
  autoDetect: boolean;
  applyToUI: boolean;
  applyToContent: boolean;
  boldText: boolean;
  underlineLinks: boolean;
  increaseBorderWidth: boolean;
}

// Contrast themes
const contrastThemes: ContrastTheme[] = [
  {
    mode: 'standard',
    name: 'Standard Contrast',
    description: 'Default color scheme with standard contrast ratios',
    colors: {
      background: '#ffffff',
      text: '#1f2937',
      primary: '#3b82f6',
      secondary: '#6b7280',
      accent: '#8b5cf6',
      border: '#d1d5db',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    accessibility: {
      textContrast: 4.5,
      largeTextContrast: 3.0,
      graphicsContrast: 3.0,
    },
  },
  {
    mode: 'high',
    name: 'High Contrast',
    description: 'Enhanced contrast for better readability',
    colors: {
      background: '#ffffff',
      text: '#000000',
      primary: '#0000ff',
      secondary: '#404040',
      accent: '#6b21a8',
      border: '#000000',
      success: '#006400',
      warning: '#ff8c00',
      error: '#dc143c',
      info: '#00008b',
    },
    accessibility: {
      textContrast: 7.0,
      largeTextContrast: 4.5,
      graphicsContrast: 4.5,
    },
  },
  {
    mode: 'extra-high',
    name: 'Extra High Contrast',
    description: 'Maximum contrast for severe visual impairments',
    colors: {
      background: '#ffffff',
      text: '#000000',
      primary: '#0000ff',
      secondary: '#000000',
      accent: '#4b0082',
      border: '#000000',
      success: '#008000',
      warning: '#ff6600',
      error: '#ff0000',
      info: '#0000cd',
    },
    accessibility: {
      textContrast: 10.0,
      largeTextContrast: 7.0,
      graphicsContrast: 7.0,
    },
  },
  {
    mode: 'inverse',
    name: 'Inverse (Dark) High Contrast',
    description: 'High contrast dark mode for light sensitivity',
    colors: {
      background: '#000000',
      text: '#ffffff',
      primary: '#00bfff',
      secondary: '#c0c0c0',
      accent: '#da70d6',
      border: '#ffffff',
      success: '#00ff00',
      warning: '#ffa500',
      error: '#ff4444',
      info: '#87ceeb',
    },
    accessibility: {
      textContrast: 15.0,
      largeTextContrast: 10.0,
      graphicsContrast: 10.0,
    },
  },
];

// Custom hook
function useHighContrast() {
  const [settings, setSettings] = useState<ContrastSettings>({
    mode: 'standard',
    autoDetect: true,
    applyToUI: true,
    applyToContent: true,
    boldText: false,
    underlineLinks: true,
    increaseBorderWidth: false,
  });

  const [currentTheme, setCurrentTheme] = useState<ContrastTheme>(
    contrastThemes[0]
  );

  useEffect(() => {
    // Auto-detect high contrast preference
    if (settings.autoDetect && window.matchMedia) {
      const highContrastQuery = window.matchMedia('(prefers-contrast: more)');

      if (highContrastQuery.matches) {
        setMode('high');
      }

      const handleChange = (e: MediaQueryListEvent) => {
        if (e.matches) {
          setMode('high');
        } else {
          setMode('standard');
        }
      };

      highContrastQuery.addEventListener('change', handleChange);
      return () => highContrastQuery.removeEventListener('change', handleChange);
    }
  }, [settings.autoDetect]);

  useEffect(() => {
    const theme = contrastThemes.find((t) => t.mode === settings.mode);
    if (theme) {
      setCurrentTheme(theme);
      applyTheme(theme);
    }
  }, [settings.mode]);

  const setMode = (mode: ContrastMode) => {
    setSettings((prev) => ({ ...prev, mode }));
  };

  const applyTheme = (theme: ContrastTheme) => {
    if (!settings.applyToUI) return;

    // Apply CSS variables
    const root = document.documentElement;
    root.style.setProperty('--contrast-bg', theme.colors.background);
    root.style.setProperty('--contrast-text', theme.colors.text);
    root.style.setProperty('--contrast-primary', theme.colors.primary);
    root.style.setProperty('--contrast-secondary', theme.colors.secondary);
    root.style.setProperty('--contrast-accent', theme.colors.accent);
    root.style.setProperty('--contrast-border', theme.colors.border);
    root.style.setProperty('--contrast-success', theme.colors.success);
    root.style.setProperty('--contrast-warning', theme.colors.warning);
    root.style.setProperty('--contrast-error', theme.colors.error);
    root.style.setProperty('--contrast-info', theme.colors.info);

    // Apply additional settings
    if (settings.boldText) {
      root.style.setProperty('--contrast-font-weight', 'bold');
    } else {
      root.style.setProperty('--contrast-font-weight', 'normal');
    }

    if (settings.increaseBorderWidth) {
      root.style.setProperty('--contrast-border-width', '3px');
    } else {
      root.style.setProperty('--contrast-border-width', '1px');
    }
  };

  const updateSettings = (newSettings: Partial<ContrastSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetToDefault = () => {
    setSettings({
      mode: 'standard',
      autoDetect: true,
      applyToUI: true,
      applyToContent: true,
      boldText: false,
      underlineLinks: true,
      increaseBorderWidth: false,
    });
  };

  return {
    settings,
    currentTheme,
    themes: contrastThemes,
    setMode,
    updateSettings,
    resetToDefault,
  };
}

// Preview component
function ThemePreview({ theme }: { theme: ContrastTheme }) {
  return (
    <div
      className="p-6 rounded-lg border-2 h-full"
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        borderColor: theme.colors.border,
      }}
    >
      <h3
        className="text-lg font-bold mb-3"
        style={{ color: theme.colors.text }}
      >
        {theme.name}
      </h3>
      <p className="text-sm mb-4" style={{ color: theme.colors.text }}>
        {theme.description}
      </p>

      {/* Color samples */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div
          className="p-2 rounded text-white text-xs text-center font-medium"
          style={{ backgroundColor: theme.colors.primary }}
        >
          Primary
        </div>
        <div
          className="p-2 rounded text-white text-xs text-center font-medium"
          style={{ backgroundColor: theme.colors.accent }}
        >
          Accent
        </div>
        <div
          className="p-2 rounded text-white text-xs text-center font-medium"
          style={{ backgroundColor: theme.colors.success }}
        >
          Success
        </div>
        <div
          className="p-2 rounded text-white text-xs text-center font-medium"
          style={{ backgroundColor: theme.colors.error }}
        >
          Error
        </div>
      </div>

      {/* Contrast ratios */}
      <div className="text-xs space-y-1">
        <div className="flex justify-between">
          <span>Text Contrast:</span>
          <span className="font-bold">{theme.accessibility.textContrast}:1</span>
        </div>
        <div className="flex justify-between">
          <span>Large Text:</span>
          <span className="font-bold">{theme.accessibility.largeTextContrast}:1</span>
        </div>
        <div className="flex justify-between">
          <span>Graphics:</span>
          <span className="font-bold">{theme.accessibility.graphicsContrast}:1</span>
        </div>
      </div>
    </div>
  );
}

// Main component
export default function HighContrast() {
  const {
    settings,
    currentTheme,
    themes,
    setMode,
    updateSettings,
    resetToDefault,
  } = useHighContrast();

  const [activeTab, setActiveTab] = useState<'modes' | 'settings' | 'preview'>(
    'modes'
  );

  const getWCAGLevel = (ratio: number): string => {
    if (ratio >= 7.0) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    if (ratio >= 3.0) return 'A';
    return 'Fail';
  };

  const getWCAGColor = (ratio: number): string => {
    if (ratio >= 7.0) return 'text-green-600 bg-green-100';
    if (ratio >= 4.5) return 'text-blue-600 bg-blue-100';
    if (ratio >= 3.0) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">High Contrast Mode</h1>
        <p className="text-gray-600">
          Enhance visibility with high contrast color schemes
        </p>
      </div>

      {/* Current mode indicator */}
      <div className="bg-white p-6 rounded-lg border mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">
              Current Mode: {currentTheme.name}
            </h3>
            <p className="text-sm text-gray-600">{currentTheme.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getWCAGColor(
                currentTheme.accessibility.textContrast
              )}`}
            >
              WCAG {getWCAGLevel(currentTheme.accessibility.textContrast)}
            </span>
            <button
              onClick={resetToDefault}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Reset to Default
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {currentTheme.accessibility.textContrast}:1
          </div>
          <div className="text-sm text-gray-600">Text Contrast Ratio</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {getWCAGLevel(currentTheme.accessibility.textContrast)}
          </div>
          <div className="text-sm text-gray-600">WCAG Compliance</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {themes.length}
          </div>
          <div className="text-sm text-gray-600">Available Modes</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {(['modes', 'settings', 'preview'] as const).map((tab) => (
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

      {/* Modes Tab */}
      {activeTab === 'modes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {themes.map((theme) => (
            <motion.div
              key={theme.mode}
              whileHover={{ scale: 1.02 }}
              className={`cursor-pointer ${
                settings.mode === theme.mode ? 'ring-4 ring-blue-500 rounded-lg' : ''
              }`}
              onClick={() => setMode(theme.mode)}
            >
              <ThemePreview theme={theme} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-lg border space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Contrast Settings</h3>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoDetect}
                  onChange={(e) => updateSettings({ autoDetect: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Auto-detect High Contrast</div>
                  <div className="text-sm text-gray-600">
                    Automatically use high contrast if system preference is detected
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.applyToUI}
                  onChange={(e) => updateSettings({ applyToUI: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Apply to User Interface</div>
                  <div className="text-sm text-gray-600">
                    Use high contrast colors for all UI elements
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.applyToContent}
                  onChange={(e) => updateSettings({ applyToContent: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Apply to Content</div>
                  <div className="text-sm text-gray-600">
                    Use high contrast colors for content areas
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.boldText}
                  onChange={(e) => updateSettings({ boldText: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Bold Text</div>
                  <div className="text-sm text-gray-600">
                    Make all text bold for better visibility
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.underlineLinks}
                  onChange={(e) => updateSettings({ underlineLinks: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Underline Links</div>
                  <div className="text-sm text-gray-600">
                    Always underline links for better identification
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.increaseBorderWidth}
                  onChange={(e) =>
                    updateSettings({ increaseBorderWidth: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Increase Border Width</div>
                  <div className="text-sm text-gray-600">
                    Make borders thicker for better visibility
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">WCAG Guidelines</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
                  AAA
                </span>
                <div>
                  <div className="font-medium">Enhanced (7:1)</div>
                  <div className="text-gray-600">
                    Best for users with vision impairments
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                  AA
                </span>
                <div>
                  <div className="font-medium">Minimum (4.5:1)</div>
                  <div className="text-gray-600">
                    Standard for accessible web content
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded font-medium">
                  A
                </span>
                <div>
                  <div className="font-medium">Large Text (3:1)</div>
                  <div className="text-gray-600">
                    Acceptable for large text only
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <div
          className="p-8 rounded-lg border-4"
          style={{
            backgroundColor: currentTheme.colors.background,
            borderColor: currentTheme.colors.border,
            borderWidth: settings.increaseBorderWidth ? '4px' : '2px',
          }}
        >
          <h2
            className="text-3xl mb-6"
            style={{
              color: currentTheme.colors.text,
              fontWeight: settings.boldText ? 'bold' : 'normal',
            }}
          >
            Preview: {currentTheme.name}
          </h2>

          <div className="space-y-6">
            {/* Text samples */}
            <div>
              <h3
                className="text-xl mb-3"
                style={{
                  color: currentTheme.colors.text,
                  fontWeight: settings.boldText ? 'bold' : 'normal',
                }}
              >
                Text Samples
              </h3>
              <p
                className="mb-2"
                style={{
                  color: currentTheme.colors.text,
                  fontWeight: settings.boldText ? 'bold' : 'normal',
                }}
              >
                This is regular body text in the {currentTheme.name} mode. It should be
                easy to read with proper contrast.
              </p>
              <a
                href="#"
                style={{
                  color: currentTheme.colors.primary,
                  textDecoration: settings.underlineLinks ? 'underline' : 'none',
                  fontWeight: settings.boldText ? 'bold' : 'normal',
                }}
              >
                This is a link
              </a>
            </div>

            {/* Buttons */}
            <div>
              <h3
                className="text-xl mb-3"
                style={{
                  color: currentTheme.colors.text,
                  fontWeight: settings.boldText ? 'bold' : 'normal',
                }}
              >
                Buttons
              </h3>
              <div className="flex gap-3 flex-wrap">
                <button
                  className="px-6 py-3 rounded-lg text-white"
                  style={{
                    backgroundColor: currentTheme.colors.primary,
                    fontWeight: settings.boldText ? 'bold' : 'normal',
                  }}
                >
                  Primary Button
                </button>
                <button
                  className="px-6 py-3 rounded-lg text-white"
                  style={{
                    backgroundColor: currentTheme.colors.success,
                    fontWeight: settings.boldText ? 'bold' : 'normal',
                  }}
                >
                  Success
                </button>
                <button
                  className="px-6 py-3 rounded-lg text-white"
                  style={{
                    backgroundColor: currentTheme.colors.warning,
                    fontWeight: settings.boldText ? 'bold' : 'normal',
                  }}
                >
                  Warning
                </button>
                <button
                  className="px-6 py-3 rounded-lg text-white"
                  style={{
                    backgroundColor: currentTheme.colors.error,
                    fontWeight: settings.boldText ? 'bold' : 'normal',
                  }}
                >
                  Error
                </button>
              </div>
            </div>

            {/* Cards */}
            <div>
              <h3
                className="text-xl mb-3"
                style={{
                  color: currentTheme.colors.text,
                  fontWeight: settings.boldText ? 'bold' : 'normal',
                }}
              >
                Card Example
              </h3>
              <div
                className="p-6 rounded-lg"
                style={{
                  backgroundColor: currentTheme.colors.background,
                  borderWidth: settings.increaseBorderWidth ? '3px' : '1px',
                  borderStyle: 'solid',
                  borderColor: currentTheme.colors.border,
                }}
              >
                <h4
                  className="text-lg mb-2"
                  style={{
                    color: currentTheme.colors.text,
                    fontWeight: settings.boldText ? 'bold' : 'normal',
                  }}
                >
                  Card Title
                </h4>
                <p
                  style={{
                    color: currentTheme.colors.text,
                    fontWeight: settings.boldText ? 'bold' : 'normal',
                  }}
                >
                  This is content within a card component.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
