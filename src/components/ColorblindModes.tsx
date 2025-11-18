import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Types
export type ColorblindType =
  | 'none'
  | 'protanopia' // Red-blind
  | 'deuteranopia' // Green-blind
  | 'tritanopia' // Blue-blind
  | 'protanomaly' // Red-weak
  | 'deuteranomaly' // Green-weak
  | 'tritanomaly' // Blue-weak
  | 'achromatopsia' // Complete color blindness
  | 'achromatomaly'; // Partial color blindness

export interface ColorblindPalette {
  type: ColorblindType;
  name: string;
  description: string;
  prevalence: string;
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    text: string;
  };
  patterns: {
    usePatterns: boolean; // Use patterns in addition to colors
    useShapes: boolean; // Use different shapes for different states
    useLabels: boolean; // Always show text labels
  };
}

export interface ColorblindSettings {
  type: ColorblindType;
  enabled: boolean;
  showSimulation: boolean;
  usePatterns: boolean;
  useShapes: boolean;
  increaseSaturation: boolean;
  addTextLabels: boolean;
}

// Colorblind palettes
const colorblindPalettes: ColorblindPalette[] = [
  {
    type: 'none',
    name: 'No Color Blindness',
    description: 'Standard color palette',
    prevalence: 'N/A',
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      background: '#ffffff',
      text: '#1f2937',
    },
    patterns: {
      usePatterns: false,
      useShapes: false,
      useLabels: false,
    },
  },
  {
    type: 'protanopia',
    name: 'Protanopia (Red-Blind)',
    description: 'Cannot distinguish red from green',
    prevalence: '1% of males',
    colors: {
      primary: '#0080ff', // Blue
      secondary: '#808080', // Gray
      success: '#0080ff', // Blue instead of green
      warning: '#ff8800', // Orange
      error: '#000080', // Dark blue instead of red
      info: '#00bfff', // Light blue
      background: '#ffffff',
      text: '#000000',
    },
    patterns: {
      usePatterns: true,
      useShapes: true,
      useLabels: true,
    },
  },
  {
    type: 'deuteranopia',
    name: 'Deuteranopia (Green-Blind)',
    description: 'Cannot distinguish red from green',
    prevalence: '1% of males',
    colors: {
      primary: '#0066cc', // Blue
      secondary: '#999999', // Gray
      success: '#0066cc', // Blue instead of green
      warning: '#ffaa00', // Orange/Yellow
      error: '#6600cc', // Purple instead of red
      info: '#00aaff', // Cyan
      background: '#ffffff',
      text: '#000000',
    },
    patterns: {
      usePatterns: true,
      useShapes: true,
      useLabels: true,
    },
  },
  {
    type: 'tritanopia',
    name: 'Tritanopia (Blue-Blind)',
    description: 'Cannot distinguish blue from yellow',
    prevalence: '0.01% of population',
    colors: {
      primary: '#ff0066', // Pink/Red
      secondary: '#808080', // Gray
      success: '#00cc66', // Green
      warning: '#ff0066', // Red/Pink instead of orange
      error: '#cc0000', // Red
      info: '#00cc66', // Green instead of blue
      background: '#ffffff',
      text: '#000000',
    },
    patterns: {
      usePatterns: true,
      useShapes: true,
      useLabels: true,
    },
  },
  {
    type: 'protanomaly',
    name: 'Protanomaly (Red-Weak)',
    description: 'Reduced sensitivity to red',
    prevalence: '1% of males',
    colors: {
      primary: '#4488ff', // Blue-shifted
      secondary: '#888888', // Gray
      success: '#00aa88', // Cyan-green
      warning: '#ffaa00', // Orange
      error: '#8800ff', // Purple
      info: '#00bbff', // Cyan
      background: '#ffffff',
      text: '#000000',
    },
    patterns: {
      usePatterns: true,
      useShapes: false,
      useLabels: true,
    },
  },
  {
    type: 'deuteranomaly',
    name: 'Deuteranomaly (Green-Weak)',
    description: 'Reduced sensitivity to green (most common)',
    prevalence: '5% of males',
    colors: {
      primary: '#0077dd', // Blue
      secondary: '#999999', // Gray
      success: '#0099cc', // Cyan
      warning: '#ff9900', // Orange
      error: '#bb00bb', // Magenta
      info: '#0099ff', // Bright blue
      background: '#ffffff',
      text: '#000000',
    },
    patterns: {
      usePatterns: true,
      useShapes: false,
      useLabels: true,
    },
  },
  {
    type: 'tritanomaly',
    name: 'Tritanomaly (Blue-Weak)',
    description: 'Reduced sensitivity to blue',
    prevalence: 'Very rare',
    colors: {
      primary: '#ff3366', // Red/Pink
      secondary: '#888888', // Gray
      success: '#00bb55', // Green
      warning: '#ff6633', // Red-orange
      error: '#dd0000', // Red
      info: '#00aa66', // Teal
      background: '#ffffff',
      text: '#000000',
    },
    patterns: {
      usePatterns: true,
      useShapes: true,
      useLabels: true,
    },
  },
  {
    type: 'achromatopsia',
    name: 'Achromatopsia (Complete Color Blindness)',
    description: 'Cannot see any colors (monochrome)',
    prevalence: '0.003% of population',
    colors: {
      primary: '#333333', // Dark gray
      secondary: '#999999', // Medium gray
      success: '#000000', // Black
      warning: '#666666', // Medium-dark gray
      error: '#444444', // Darker gray
      info: '#555555', // Gray
      background: '#ffffff',
      text: '#000000',
    },
    patterns: {
      usePatterns: true,
      useShapes: true,
      useLabels: true,
    },
  },
  {
    type: 'achromatomaly',
    name: 'Achromatomaly (Partial Color Blindness)',
    description: 'Limited color perception',
    prevalence: 'Very rare',
    colors: {
      primary: '#4477aa', // Muted blue
      secondary: '#888888', // Gray
      success: '#448877', // Muted cyan
      warning: '#aa7744', // Muted orange
      error: '#aa4444', // Muted red
      info: '#5588aa', // Muted light blue
      background: '#f8f8f8',
      text: '#222222',
    },
    patterns: {
      usePatterns: true,
      useShapes: true,
      useLabels: true,
    },
  },
];

// Custom hook
function useColorblindModes() {
  const [settings, setSettings] = useState<ColorblindSettings>({
    type: 'none',
    enabled: false,
    showSimulation: false,
    usePatterns: false,
    useShapes: false,
    increaseSaturation: false,
    addTextLabels: true,
  });

  const [currentPalette, setCurrentPalette] = useState<ColorblindPalette>(
    colorblindPalettes[0]
  );

  useEffect(() => {
    const palette = colorblindPalettes.find((p) => p.type === settings.type);
    if (palette) {
      setCurrentPalette(palette);
      if (settings.enabled) {
        applyPalette(palette);
      }
    }
  }, [settings.type, settings.enabled]);

  const applyPalette = (palette: ColorblindPalette) => {
    const root = document.documentElement;
    root.style.setProperty('--cb-primary', palette.colors.primary);
    root.style.setProperty('--cb-secondary', palette.colors.secondary);
    root.style.setProperty('--cb-success', palette.colors.success);
    root.style.setProperty('--cb-warning', palette.colors.warning);
    root.style.setProperty('--cb-error', palette.colors.error);
    root.style.setProperty('--cb-info', palette.colors.info);
    root.style.setProperty('--cb-bg', palette.colors.background);
    root.style.setProperty('--cb-text', palette.colors.text);
  };

  const setType = (type: ColorblindType) => {
    setSettings((prev) => ({ ...prev, type }));
  };

  const updateSettings = (newSettings: Partial<ColorblindSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetToDefault = () => {
    setSettings({
      type: 'none',
      enabled: false,
      showSimulation: false,
      usePatterns: false,
      useShapes: false,
      increaseSaturation: false,
      addTextLabels: true,
    });
  };

  return {
    settings,
    currentPalette,
    palettes: colorblindPalettes,
    setType,
    updateSettings,
    resetToDefault,
  };
}

// Palette preview component
function PalettePreview({ palette }: { palette: ColorblindPalette }) {
  return (
    <div className="p-6 rounded-lg border bg-white">
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-1">{palette.name}</h3>
        <p className="text-sm text-gray-600 mb-1">{palette.description}</p>
        <p className="text-xs text-gray-500">Prevalence: {palette.prevalence}</p>
      </div>

      {/* Color swatches */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <div
            className="h-16 rounded mb-1"
            style={{ backgroundColor: palette.colors.primary }}
          />
          <div className="text-xs">Primary</div>
        </div>
        <div className="text-center">
          <div
            className="h-16 rounded mb-1"
            style={{ backgroundColor: palette.colors.success }}
          />
          <div className="text-xs">Success</div>
        </div>
        <div className="text-center">
          <div
            className="h-16 rounded mb-1"
            style={{ backgroundColor: palette.colors.warning }}
          />
          <div className="text-xs">Warning</div>
        </div>
        <div className="text-center">
          <div
            className="h-16 rounded mb-1"
            style={{ backgroundColor: palette.colors.error }}
          />
          <div className="text-xs">Error</div>
        </div>
        <div className="text-center">
          <div
            className="h-16 rounded mb-1"
            style={{ backgroundColor: palette.colors.info }}
          />
          <div className="text-xs">Info</div>
        </div>
        <div className="text-center">
          <div
            className="h-16 rounded mb-1 border"
            style={{ backgroundColor: palette.colors.secondary }}
          />
          <div className="text-xs">Secondary</div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-4 text-xs space-y-1">
        {palette.patterns.usePatterns && (
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>Patterns recommended</span>
          </div>
        )}
        {palette.patterns.useShapes && (
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>Shapes recommended</span>
          </div>
        )}
        {palette.patterns.useLabels && (
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>Labels recommended</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Main component
export default function ColorblindModes() {
  const {
    settings,
    currentPalette,
    palettes,
    setType,
    updateSettings,
    resetToDefault,
  } = useColorblindModes();

  const [activeTab, setActiveTab] = useState<'modes' | 'settings' | 'test'>('modes');

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Colorblind Modes</h1>
        <p className="text-gray-600">
          Optimize colors for various types of color vision deficiency
        </p>
      </div>

      {/* Current mode indicator */}
      <div className="bg-white p-6 rounded-lg border mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">
              Current Mode: {currentPalette.name}
            </h3>
            <p className="text-sm text-gray-600">{currentPalette.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                settings.enabled
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {settings.enabled ? 'Enabled' : 'Disabled'}
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
            {palettes.length}
          </div>
          <div className="text-sm text-gray-600">Available Modes</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {palettes.filter((p) => p.patterns.usePatterns).length}
          </div>
          <div className="text-sm text-gray-600">With Pattern Support</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-purple-600 mb-1">8%</div>
          <div className="text-sm text-gray-600">Population Affected</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {(['modes', 'settings', 'test'] as const).map((tab) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {palettes.map((palette) => (
            <motion.div
              key={palette.type}
              whileHover={{ scale: 1.02 }}
              className={`cursor-pointer ${
                settings.type === palette.type ? 'ring-4 ring-blue-500 rounded-lg' : ''
              }`}
              onClick={() => setType(palette.type)}
            >
              <PalettePreview palette={palette} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-lg border space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Colorblind Mode Settings</h3>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => updateSettings({ enabled: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Enable Colorblind Mode</div>
                  <div className="text-sm text-gray-600">
                    Apply colorblind-friendly palette
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.usePatterns}
                  onChange={(e) => updateSettings({ usePatterns: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Use Patterns</div>
                  <div className="text-sm text-gray-600">
                    Add patterns to colors for better distinction
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.useShapes}
                  onChange={(e) => updateSettings({ useShapes: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Use Different Shapes</div>
                  <div className="text-sm text-gray-600">
                    Use different shapes for different states
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.addTextLabels}
                  onChange={(e) => updateSettings({ addTextLabels: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Always Show Text Labels</div>
                  <div className="text-sm text-gray-600">
                    Include text labels on all color-coded elements
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.increaseSaturation}
                  onChange={(e) =>
                    updateSettings({ increaseSaturation: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Increase Saturation</div>
                  <div className="text-sm text-gray-600">
                    Make colors more vibrant for better visibility
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showSimulation}
                  onChange={(e) => updateSettings({ showSimulation: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Show Simulation</div>
                  <div className="text-sm text-gray-600">
                    See how colors appear with color blindness (for testing)
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">About Color Blindness</h3>
            <div className="space-y-3 text-sm">
              <p>
                Color blindness affects approximately 8% of males and 0.5% of females.
                The most common type is deuteranomaly (green-weak), affecting about 5%
                of males.
              </p>
              <p>
                Using colorblind-friendly palettes, patterns, shapes, and labels ensures
                everyone can use your application effectively.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="font-medium text-blue-900 mb-1">Best Practices:</div>
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                  <li>Never rely on color alone to convey information</li>
                  <li>Use patterns, shapes, and text labels</li>
                  <li>Ensure sufficient contrast between colors</li>
                  <li>Test with colorblind simulation tools</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Tab */}
      {activeTab === 'test' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-lg border">
            <h3 className="text-xl font-bold mb-6">Color Perception Test</h3>

            {/* Status indicators */}
            <div className="mb-8">
              <h4 className="font-semibold mb-3">Status Indicators</h4>
              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: currentPalette.colors.success }}
                  />
                  {settings.addTextLabels && (
                    <span className="text-sm">Success</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: currentPalette.colors.warning }}
                  />
                  {settings.addTextLabels && (
                    <span className="text-sm">Warning</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: currentPalette.colors.error }}
                  />
                  {settings.addTextLabels && <span className="text-sm">Error</span>}
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded"
                    style={{ backgroundColor: currentPalette.colors.info }}
                  />
                  {settings.addTextLabels && <span className="text-sm">Info</span>}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mb-8">
              <h4 className="font-semibold mb-3">Button Examples</h4>
              <div className="flex gap-3 flex-wrap">
                <button
                  className="px-6 py-3 rounded-lg text-white font-medium"
                  style={{ backgroundColor: currentPalette.colors.primary }}
                >
                  {settings.addTextLabels ? 'Primary Action' : 'Action'}
                </button>
                <button
                  className="px-6 py-3 rounded-lg text-white font-medium"
                  style={{ backgroundColor: currentPalette.colors.success }}
                >
                  {settings.addTextLabels ? '✓ Success' : '✓'}
                </button>
                <button
                  className="px-6 py-3 rounded-lg text-white font-medium"
                  style={{ backgroundColor: currentPalette.colors.warning }}
                >
                  {settings.addTextLabels ? '⚠ Warning' : '⚠'}
                </button>
                <button
                  className="px-6 py-3 rounded-lg text-white font-medium"
                  style={{ backgroundColor: currentPalette.colors.error }}
                >
                  {settings.addTextLabels ? '✗ Error' : '✗'}
                </button>
              </div>
            </div>

            {/* Charts */}
            <div>
              <h4 className="font-semibold mb-3">Chart Colors</h4>
              <div className="grid grid-cols-5 gap-2 h-48">
                {[
                  currentPalette.colors.primary,
                  currentPalette.colors.success,
                  currentPalette.colors.warning,
                  currentPalette.colors.error,
                  currentPalette.colors.info,
                ].map((color, i) => (
                  <div
                    key={i}
                    className="rounded"
                    style={{
                      backgroundColor: color,
                      height: `${(i + 1) * 20}%`,
                      alignSelf: 'flex-end',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Accessibility note */}
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">
                  Testing Tip
                </h4>
                <p className="text-sm text-yellow-800">
                  Try different colorblind modes to see how your content appears to
                  users with color vision deficiencies. If you can't distinguish
                  important information, consider enabling text labels or patterns.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
