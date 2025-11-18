import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Types
export type TouchTargetSize = 'minimal' | 'standard' | 'comfortable' | 'large' | 'maximum';

export interface TouchTargetSettings {
  targetSize: TouchTargetSize;
  enableHitboxExpansion: boolean;
  showTargetOutlines: boolean;
  increaseSpacing: boolean;
  preventAccidentalTaps: boolean;
  hapticFeedback: boolean;
}

export interface TouchTargetPreset {
  size: TouchTargetSize;
  name: string;
  description: string;
  minSize: number; // minimum width/height in pixels
  spacing: number; // minimum spacing between targets in pixels
  hitboxExpansion: number; // additional invisible hit area in pixels
  wcagLevel: 'A' | 'AA' | 'AAA' | 'Not Compliant';
  recommended: string;
}

export interface TouchTargetStats {
  totalTargets: number;
  compliantTargets: number;
  averageSize: number;
  averageSpacing: number;
}

// Touch target presets
const touchTargetPresets: TouchTargetPreset[] = [
  {
    size: 'minimal',
    name: 'Minimal (36px)',
    description: 'Below WCAG requirements - use with caution',
    minSize: 36,
    spacing: 8,
    hitboxExpansion: 0,
    wcagLevel: 'Not Compliant',
    recommended: 'Only for precise pointing devices (mouse, stylus)',
  },
  {
    size: 'standard',
    name: 'Standard (40px)',
    description: 'Minimum for desktop interfaces',
    minSize: 40,
    spacing: 8,
    hitboxExpansion: 4,
    wcagLevel: 'A',
    recommended: 'Desktop with mouse or trackpad',
  },
  {
    size: 'comfortable',
    name: 'Comfortable (44px)',
    description: 'WCAG AA compliant for mobile',
    minSize: 44,
    spacing: 12,
    hitboxExpansion: 6,
    wcagLevel: 'AA',
    recommended: 'Mobile devices and tablets (WCAG AA)',
  },
  {
    size: 'large',
    name: 'Large (56px)',
    description: 'Enhanced accessibility for motor difficulties',
    minSize: 56,
    spacing: 16,
    hitboxExpansion: 8,
    wcagLevel: 'AAA',
    recommended: 'Users with motor impairments or large touchscreens',
  },
  {
    size: 'maximum',
    name: 'Maximum (72px)',
    description: 'Maximum size for severe accessibility needs',
    minSize: 72,
    spacing: 24,
    hitboxExpansion: 12,
    wcagLevel: 'AAA',
    recommended: 'Severe motor impairments or kiosk interfaces',
  },
];

// Custom hook
function useTouchTargets() {
  const [settings, setSettings] = useState<TouchTargetSettings>({
    targetSize: 'comfortable',
    enableHitboxExpansion: true,
    showTargetOutlines: false,
    increaseSpacing: true,
    preventAccidentalTaps: true,
    hapticFeedback: false,
  });

  const [currentPreset, setCurrentPreset] = useState<TouchTargetPreset>(
    touchTargetPresets[2] // Comfortable
  );

  const [stats] = useState<TouchTargetStats>({
    totalTargets: 24,
    compliantTargets: 20,
    averageSize: 44,
    averageSpacing: 12,
  });

  useEffect(() => {
    const preset = touchTargetPresets.find((p) => p.size === settings.targetSize);
    if (preset) {
      setCurrentPreset(preset);
      applySettings(preset);
    }
  }, [settings]);

  const applySettings = (preset: TouchTargetPreset) => {
    const root = document.documentElement;

    // Target size
    root.style.setProperty('--touch-target-min', `${preset.minSize}px`);

    // Spacing
    if (settings.increaseSpacing) {
      root.style.setProperty('--touch-target-spacing', `${preset.spacing}px`);
    }

    // Hitbox expansion
    if (settings.enableHitboxExpansion) {
      root.style.setProperty('--touch-target-expansion', `${preset.hitboxExpansion}px`);
    }

    // Visual outlines for testing
    if (settings.showTargetOutlines) {
      root.style.setProperty('--touch-target-outline', '2px dashed rgba(59, 130, 246, 0.5)');
    } else {
      root.style.setProperty('--touch-target-outline', 'none');
    }
  };

  const setTargetSize = (size: TouchTargetSize) => {
    setSettings((prev) => ({ ...prev, targetSize: size }));
  };

  const updateSettings = (newSettings: Partial<TouchTargetSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetToDefault = () => {
    setSettings({
      targetSize: 'comfortable',
      enableHitboxExpansion: true,
      showTargetOutlines: false,
      increaseSpacing: true,
      preventAccidentalTaps: true,
      hapticFeedback: false,
    });
  };

  return {
    settings,
    currentPreset,
    presets: touchTargetPresets,
    stats,
    setTargetSize,
    updateSettings,
    resetToDefault,
  };
}

// Preset preview component
function PresetPreview({ preset, isActive }: { preset: TouchTargetPreset; isActive: boolean }) {
  const getWCAGColor = (level: string) => {
    switch (level) {
      case 'AAA':
        return 'bg-green-100 text-green-700';
      case 'AA':
        return 'bg-blue-100 text-blue-700';
      case 'A':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div
      className={`p-6 rounded-lg border-2 transition-all ${
        isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold">{preset.name}</h3>
          <span className={`px-2 py-1 text-xs font-medium rounded ${getWCAGColor(preset.wcagLevel)}`}>
            {preset.wcagLevel}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">{preset.description}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 bg-gray-100 rounded">
            {preset.minSize}x{preset.minSize}px
          </span>
          <span className="px-2 py-1 bg-gray-100 rounded">{preset.spacing}px spacing</span>
        </div>
      </div>

      {/* Visual representation */}
      <div className="flex justify-center items-center py-4">
        <div
          className="bg-blue-500 rounded flex items-center justify-center text-white font-medium cursor-pointer hover:bg-blue-600 transition-colors"
          style={{
            width: `${preset.minSize}px`,
            height: `${preset.minSize}px`,
          }}
        >
          <span className="text-xs">Tap</span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        {preset.recommended}
      </p>
    </div>
  );
}

// Main component
export default function TouchTargets() {
  const {
    settings,
    currentPreset,
    presets,
    stats,
    setTargetSize,
    updateSettings,
    resetToDefault,
  } = useTouchTargets();

  const [activeTab, setActiveTab] = useState<'presets' | 'settings' | 'test' | 'analyzer'>(
    'presets'
  );

  const compliancePercentage = (stats.compliantTargets / stats.totalTargets) * 100;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Touch Targets</h1>
        <p className="text-gray-600">
          Optimize touch target sizes for touchscreen accessibility
        </p>
      </div>

      {/* Current setting indicator */}
      <div className="bg-white p-6 rounded-lg border mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">
              Current Size: {currentPreset.name}
            </h3>
            <p className="text-sm text-gray-600">
              {currentPreset.minSize}x{currentPreset.minSize}px minimum
              <span className="ml-2">• {currentPreset.wcagLevel} compliance</span>
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
            {currentPreset.minSize}px
          </div>
          <div className="text-sm text-gray-600">Minimum Target Size</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {currentPreset.spacing}px
          </div>
          <div className="text-sm text-gray-600">Target Spacing</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {currentPreset.wcagLevel}
          </div>
          <div className="text-sm text-gray-600">WCAG Level</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {compliancePercentage.toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600">Compliance Rate</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b overflow-x-auto">
        {(['presets', 'settings', 'test', 'analyzer'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
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
              key={preset.size}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
              onClick={() => setTargetSize(preset.size)}
            >
              <PresetPreview
                preset={preset}
                isActive={settings.targetSize === preset.size}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-lg border space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Touch Target Settings</h3>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableHitboxExpansion}
                  onChange={(e) =>
                    updateSettings({ enableHitboxExpansion: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Enable Hitbox Expansion</div>
                  <div className="text-sm text-gray-600">
                    Expand invisible clickable area around targets
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showTargetOutlines}
                  onChange={(e) =>
                    updateSettings({ showTargetOutlines: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Show Target Outlines</div>
                  <div className="text-sm text-gray-600">
                    Display visual boundaries for testing (development only)
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.increaseSpacing}
                  onChange={(e) =>
                    updateSettings({ increaseSpacing: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Increase Spacing</div>
                  <div className="text-sm text-gray-600">
                    Add more space between interactive elements
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.preventAccidentalTaps}
                  onChange={(e) =>
                    updateSettings({ preventAccidentalTaps: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Prevent Accidental Taps</div>
                  <div className="text-sm text-gray-600">
                    Require confirmation for destructive actions
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.hapticFeedback}
                  onChange={(e) =>
                    updateSettings({ hapticFeedback: e.target.checked })
                  }
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Haptic Feedback</div>
                  <div className="text-sm text-gray-600">
                    Vibrate on tap (when supported by device)
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">WCAG 2.1 Guidelines</h3>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm space-y-3 text-blue-900">
                <p className="font-medium">Success Criterion 2.5.5 - Target Size (Level AAA):</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>
                    <strong>Minimum 44x44 CSS pixels</strong> for touch targets (Level AA)
                  </li>
                  <li>
                    Except when the target is in a sentence or text block
                  </li>
                  <li>
                    Essential targets (like inline links) may be exempt if alternatives exist
                  </li>
                  <li>
                    Targets determined by user agent (browser defaults) are exempt
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Best Practices</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
                <span className="text-green-600">✓</span>
                <div>
                  <div className="font-medium text-green-900">Minimum 44x44px</div>
                  <div className="text-green-800">
                    Ensures accessibility for users with motor impairments
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
                <span className="text-green-600">✓</span>
                <div>
                  <div className="font-medium text-green-900">Adequate spacing</div>
                  <div className="text-green-800">
                    At least 8px between targets to prevent mis-taps
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
                <span className="text-green-600">✓</span>
                <div>
                  <div className="font-medium text-green-900">Expand hitboxes</div>
                  <div className="text-green-800">
                    Make the tappable area larger than the visual element
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Tab */}
      {activeTab === 'test' && (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-lg border">
            <h3 className="text-xl font-bold mb-6">Touch Target Test Area</h3>

            {/* Grid of targets */}
            <div className="mb-8">
              <h4 className="font-semibold mb-3">Tap Accuracy Test</h4>
              <p className="text-sm text-gray-600 mb-4">
                Try tapping each button quickly. If you frequently miss or tap the wrong
                button, the targets may be too small or too close together.
              </p>
              <div
                className="inline-grid grid-cols-3 gap-3"
                style={{ gap: `${currentPreset.spacing}px` }}
              >
                {Array.from({ length: 9 }).map((_, i) => (
                  <button
                    key={i}
                    className="bg-blue-500 text-white rounded font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
                    style={{
                      width: `${currentPreset.minSize}px`,
                      height: `${currentPreset.minSize}px`,
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Edge targets test */}
            <div className="mb-8">
              <h4 className="font-semibold mb-3">Edge Targets</h4>
              <p className="text-sm text-gray-600 mb-4">
                Targets near screen edges or corners require extra attention.
              </p>
              <div className="border-2 border-gray-300 rounded-lg p-4 relative h-64">
                {/* Corner buttons */}
                <button
                  className="absolute top-2 left-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  style={{
                    width: `${currentPreset.minSize}px`,
                    height: `${currentPreset.minSize}px`,
                  }}
                >
                  TL
                </button>
                <button
                  className="absolute top-2 right-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  style={{
                    width: `${currentPreset.minSize}px`,
                    height: `${currentPreset.minSize}px`,
                  }}
                >
                  TR
                </button>
                <button
                  className="absolute bottom-2 left-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  style={{
                    width: `${currentPreset.minSize}px`,
                    height: `${currentPreset.minSize}px`,
                  }}
                >
                  BL
                </button>
                <button
                  className="absolute bottom-2 right-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  style={{
                    width: `${currentPreset.minSize}px`,
                    height: `${currentPreset.minSize}px`,
                  }}
                >
                  BR
                </button>
              </div>
            </div>

            {/* Adjacent targets */}
            <div>
              <h4 className="font-semibold mb-3">Adjacent Targets</h4>
              <p className="text-sm text-gray-600 mb-4">
                Test tapping between closely spaced targets.
              </p>
              <div
                className="flex gap-1"
                style={{ gap: `${currentPreset.spacing}px` }}
              >
                <button
                  className="bg-purple-500 text-white rounded font-medium hover:bg-purple-600 transition-colors"
                  style={{
                    width: `${currentPreset.minSize}px`,
                    height: `${currentPreset.minSize}px`,
                  }}
                >
                  A
                </button>
                <button
                  className="bg-purple-500 text-white rounded font-medium hover:bg-purple-600 transition-colors"
                  style={{
                    width: `${currentPreset.minSize}px`,
                    height: `${currentPreset.minSize}px`,
                  }}
                >
                  B
                </button>
                <button
                  className="bg-purple-500 text-white rounded font-medium hover:bg-purple-600 transition-colors"
                  style={{
                    width: `${currentPreset.minSize}px`,
                    height: `${currentPreset.minSize}px`,
                  }}
                >
                  C
                </button>
              </div>
            </div>
          </div>

          {/* Test instructions */}
          <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📱</div>
              <div>
                <h4 className="font-semibold text-orange-900 mb-1">
                  Mobile Testing Tip
                </h4>
                <p className="text-sm text-orange-800">
                  For the most accurate results, test on an actual mobile device. Desktop
                  testing with a mouse doesn't fully replicate the challenges of touch
                  input, especially for users with motor impairments.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analyzer Tab */}
      {activeTab === 'analyzer' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-xl font-bold mb-6">Touch Target Analysis</h3>

            {/* Compliance overview */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Overall Compliance</span>
                <span className="font-bold text-lg">{compliancePercentage.toFixed(1)}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${compliancePercentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full ${
                    compliancePercentage >= 90
                      ? 'bg-green-500'
                      : compliancePercentage >= 70
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  }`}
                />
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-blue-600">{stats.totalTargets}</div>
                <div className="text-xs text-gray-600">Total Targets</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-green-600">
                  {stats.compliantTargets}
                </div>
                <div className="text-xs text-gray-600">Compliant</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.averageSize}px
                </div>
                <div className="text-xs text-gray-600">Avg Size</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.averageSpacing}px
                </div>
                <div className="text-xs text-gray-600">Avg Spacing</div>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-semibold mb-3">Recommendations</h4>
              <div className="space-y-2">
                {compliancePercentage < 100 && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                    <span className="text-yellow-600">⚠</span>
                    <div>
                      <div className="font-medium text-yellow-900">
                        {stats.totalTargets - stats.compliantTargets} targets need attention
                      </div>
                      <div className="text-sm text-yellow-800">
                        Consider increasing to at least 44x44px for WCAG AA compliance
                      </div>
                    </div>
                  </div>
                )}
                {stats.averageSpacing < 8 && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded border border-yellow-200">
                    <span className="text-yellow-600">⚠</span>
                    <div>
                      <div className="font-medium text-yellow-900">
                        Spacing below recommended minimum
                      </div>
                      <div className="text-sm text-yellow-800">
                        Add at least 8px spacing between targets to prevent mis-taps
                      </div>
                    </div>
                  </div>
                )}
                {compliancePercentage === 100 && stats.averageSpacing >= 8 && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded border border-green-200">
                    <span className="text-green-600">✓</span>
                    <div>
                      <div className="font-medium text-green-900">
                        All targets meet accessibility guidelines
                      </div>
                      <div className="text-sm text-green-800">
                        Your interface is optimized for touch accessibility
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
