import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Types
export type ButtonSize = 'compact' | 'standard' | 'comfortable' | 'large' | 'extra-large';

export interface ButtonSizeSettings {
  size: ButtonSize;
  applyToButtons: boolean;
  applyToInputs: boolean;
  applyToIcons: boolean;
  increasePadding: boolean;
  increaseSpacing: boolean;
}

export interface ButtonSizePreset {
  size: ButtonSize;
  name: string;
  description: string;
  minHeight: number; // in pixels
  minWidth: number; // in pixels
  padding: {
    x: number; // horizontal padding in pixels
    y: number; // vertical padding in pixels
  };
  fontSize: number; // in pixels
  iconSize: number; // in pixels
  spacing: number; // gap between elements in pixels
  borderRadius: number; // in pixels
  recommended: string;
  wcagCompliant: boolean;
}

// Button size presets
const buttonSizePresets: ButtonSizePreset[] = [
  {
    size: 'compact',
    name: 'Compact',
    description: 'Minimal size for dense interfaces',
    minHeight: 32,
    minWidth: 64,
    padding: { x: 12, y: 6 },
    fontSize: 14,
    iconSize: 16,
    spacing: 8,
    borderRadius: 6,
    recommended: 'Desktop users with precise pointing devices',
    wcagCompliant: false,
  },
  {
    size: 'standard',
    name: 'Standard',
    description: 'Default size for general use',
    minHeight: 40,
    minWidth: 80,
    padding: { x: 16, y: 10 },
    fontSize: 16,
    iconSize: 20,
    spacing: 12,
    borderRadius: 8,
    recommended: 'General desktop and mobile use',
    wcagCompliant: false,
  },
  {
    size: 'comfortable',
    name: 'Comfortable',
    description: 'Easier to tap on touchscreens (WCAG AA)',
    minHeight: 44,
    minWidth: 88,
    padding: { x: 20, y: 12 },
    fontSize: 16,
    iconSize: 22,
    spacing: 16,
    borderRadius: 8,
    recommended: 'Mobile devices and tablets',
    wcagCompliant: true,
  },
  {
    size: 'large',
    name: 'Large',
    description: 'Large targets for better accessibility',
    minHeight: 56,
    minWidth: 112,
    padding: { x: 24, y: 16 },
    fontSize: 18,
    iconSize: 24,
    spacing: 20,
    borderRadius: 12,
    recommended: 'Users with motor difficulties or on large touchscreens',
    wcagCompliant: true,
  },
  {
    size: 'extra-large',
    name: 'Extra Large',
    description: 'Maximum size for severe motor impairments',
    minHeight: 72,
    minWidth: 144,
    padding: { x: 32, y: 20 },
    fontSize: 20,
    iconSize: 28,
    spacing: 24,
    borderRadius: 16,
    recommended: 'Users with severe motor impairments',
    wcagCompliant: true,
  },
];

// Custom hook
function useButtonSizing() {
  const [settings, setSettings] = useState<ButtonSizeSettings>({
    size: 'standard',
    applyToButtons: true,
    applyToInputs: true,
    applyToIcons: true,
    increasePadding: true,
    increaseSpacing: true,
  });

  const [currentPreset, setCurrentPreset] = useState<ButtonSizePreset>(
    buttonSizePresets[1] // Standard
  );

  useEffect(() => {
    const preset = buttonSizePresets.find((p) => p.size === settings.size);
    if (preset) {
      setCurrentPreset(preset);
      applySizing(preset);
    }
  }, [settings]);

  const applySizing = (preset: ButtonSizePreset) => {
    const root = document.documentElement;

    // Button dimensions
    root.style.setProperty('--btn-min-height', `${preset.minHeight}px`);
    root.style.setProperty('--btn-min-width', `${preset.minWidth}px`);
    root.style.setProperty('--btn-font-size', `${preset.fontSize}px`);
    root.style.setProperty('--btn-border-radius', `${preset.borderRadius}px`);

    // Padding
    if (settings.increasePadding) {
      root.style.setProperty('--btn-padding-x', `${preset.padding.x}px`);
      root.style.setProperty('--btn-padding-y', `${preset.padding.y}px`);
    }

    // Icon size
    if (settings.applyToIcons) {
      root.style.setProperty('--btn-icon-size', `${preset.iconSize}px`);
    }

    // Spacing
    if (settings.increaseSpacing) {
      root.style.setProperty('--btn-spacing', `${preset.spacing}px`);
    }

    // Input fields
    if (settings.applyToInputs) {
      root.style.setProperty('--input-height', `${preset.minHeight}px`);
      root.style.setProperty('--input-padding-x', `${preset.padding.x}px`);
      root.style.setProperty('--input-padding-y', `${preset.padding.y}px`);
      root.style.setProperty('--input-font-size', `${preset.fontSize}px`);
    }
  };

  const setSize = (size: ButtonSize) => {
    setSettings((prev) => ({ ...prev, size }));
  };

  const updateSettings = (newSettings: Partial<ButtonSizeSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetToDefault = () => {
    setSettings({
      size: 'standard',
      applyToButtons: true,
      applyToInputs: true,
      applyToIcons: true,
      increasePadding: true,
      increaseSpacing: true,
    });
  };

  return {
    settings,
    currentPreset,
    presets: buttonSizePresets,
    setSize,
    updateSettings,
    resetToDefault,
  };
}

// Preset preview component
function PresetPreview({ preset, isActive }: { preset: ButtonSizePreset; isActive: boolean }) {
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
          <span className="px-2 py-1 bg-gray-100 rounded">{preset.minHeight}px min</span>
          <span className="px-2 py-1 bg-gray-100 rounded">{preset.fontSize}px text</span>
        </div>
      </div>

      {/* Sample button */}
      <div className="flex justify-center">
        <button
          className="bg-blue-500 text-white rounded font-medium hover:bg-blue-600 transition-colors"
          style={{
            minHeight: `${preset.minHeight}px`,
            minWidth: `${preset.minWidth}px`,
            padding: `${preset.padding.y}px ${preset.padding.x}px`,
            fontSize: `${preset.fontSize}px`,
            borderRadius: `${preset.borderRadius}px`,
          }}
        >
          Sample Button
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        {preset.recommended}
      </p>
    </div>
  );
}

// Main component
export default function ButtonSizing() {
  const {
    settings,
    currentPreset,
    presets,
    setSize,
    updateSettings,
    resetToDefault,
  } = useButtonSizing();

  const [activeTab, setActiveTab] = useState<'presets' | 'settings' | 'test'>('presets');

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Button Sizing</h1>
        <p className="text-gray-600">
          Adjust interactive element sizes for better accessibility
        </p>
      </div>

      {/* Current size indicator */}
      <div className="bg-white p-6 rounded-lg border mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">
              Current Size: {currentPreset.name}
            </h3>
            <p className="text-sm text-gray-600">
              {currentPreset.minHeight}px minimum height
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
            {currentPreset.minHeight}px
          </div>
          <div className="text-sm text-gray-600">Minimum Height</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {currentPreset.padding.x}px
          </div>
          <div className="text-sm text-gray-600">Horizontal Padding</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {currentPreset.fontSize}px
          </div>
          <div className="text-sm text-gray-600">Font Size</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {presets.filter((p) => p.wcagCompliant).length}
          </div>
          <div className="text-sm text-gray-600">WCAG Compliant</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
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
              key={preset.size}
              whileHover={{ scale: 1.02 }}
              className="cursor-pointer"
              onClick={() => setSize(preset.size)}
            >
              <PresetPreview
                preset={preset}
                isActive={settings.size === preset.size}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-lg border space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Button Sizing Settings</h3>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.applyToButtons}
                  onChange={(e) => updateSettings({ applyToButtons: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Apply to Buttons</div>
                  <div className="text-sm text-gray-600">
                    Adjust size of all button elements
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.applyToInputs}
                  onChange={(e) => updateSettings({ applyToInputs: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Apply to Input Fields</div>
                  <div className="text-sm text-gray-600">
                    Adjust size of text inputs and form controls
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.applyToIcons}
                  onChange={(e) => updateSettings({ applyToIcons: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Apply to Icons</div>
                  <div className="text-sm text-gray-600">
                    Scale icons within buttons
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.increasePadding}
                  onChange={(e) => updateSettings({ increasePadding: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Increase Padding</div>
                  <div className="text-sm text-gray-600">
                    Add more space inside buttons
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.increaseSpacing}
                  onChange={(e) => updateSettings({ increaseSpacing: e.target.checked })}
                  className="w-5 h-5"
                />
                <div>
                  <div className="font-medium">Increase Spacing</div>
                  <div className="text-sm text-gray-600">
                    Add more space between elements
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">WCAG Guidelines</h3>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm space-y-3 text-blue-900">
                <p className="font-medium">Touch Target Size (WCAG 2.1 Level AA):</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>
                    <strong>Minimum 44x44 pixels</strong> for touch targets on mobile devices
                  </li>
                  <li>
                    Essential for users with motor impairments or those using touchscreens
                  </li>
                  <li>
                    Larger targets (56px+) recommended for users with severe motor difficulties
                  </li>
                  <li>
                    Adequate spacing between targets prevents accidental activation
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
                  <div className="font-medium text-green-900">Use WCAG-compliant sizes</div>
                  <div className="text-green-800">
                    44x44px minimum ensures accessibility for most users
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
                <span className="text-green-600">✓</span>
                <div>
                  <div className="font-medium text-green-900">Provide adequate spacing</div>
                  <div className="text-green-800">
                    Prevents accidental clicks on adjacent buttons
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
                <span className="text-green-600">✓</span>
                <div>
                  <div className="font-medium text-green-900">Test on actual devices</div>
                  <div className="text-green-800">
                    Verify sizes work well on phones, tablets, and desktops
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
            <h3 className="text-xl font-bold mb-6">Interactive Elements Test</h3>

            {/* Primary buttons */}
            <div className="mb-8">
              <h4 className="font-semibold mb-3">Primary Actions</h4>
              <div
                className="flex flex-wrap gap-3"
                style={{ gap: `${currentPreset.spacing}px` }}
              >
                <button
                  className="bg-blue-500 text-white rounded font-medium hover:bg-blue-600 transition-colors"
                  style={{
                    minHeight: `${currentPreset.minHeight}px`,
                    minWidth: `${currentPreset.minWidth}px`,
                    padding: `${currentPreset.padding.y}px ${currentPreset.padding.x}px`,
                    fontSize: `${currentPreset.fontSize}px`,
                    borderRadius: `${currentPreset.borderRadius}px`,
                  }}
                >
                  Save
                </button>
                <button
                  className="bg-green-500 text-white rounded font-medium hover:bg-green-600 transition-colors"
                  style={{
                    minHeight: `${currentPreset.minHeight}px`,
                    minWidth: `${currentPreset.minWidth}px`,
                    padding: `${currentPreset.padding.y}px ${currentPreset.padding.x}px`,
                    fontSize: `${currentPreset.fontSize}px`,
                    borderRadius: `${currentPreset.borderRadius}px`,
                  }}
                >
                  Submit
                </button>
                <button
                  className="bg-red-500 text-white rounded font-medium hover:bg-red-600 transition-colors"
                  style={{
                    minHeight: `${currentPreset.minHeight}px`,
                    minWidth: `${currentPreset.minWidth}px`,
                    padding: `${currentPreset.padding.y}px ${currentPreset.padding.x}px`,
                    fontSize: `${currentPreset.fontSize}px`,
                    borderRadius: `${currentPreset.borderRadius}px`,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Secondary buttons */}
            <div className="mb-8">
              <h4 className="font-semibold mb-3">Secondary Actions</h4>
              <div
                className="flex flex-wrap gap-3"
                style={{ gap: `${currentPreset.spacing}px` }}
              >
                <button
                  className="bg-white border-2 border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 transition-colors"
                  style={{
                    minHeight: `${currentPreset.minHeight}px`,
                    minWidth: `${currentPreset.minWidth}px`,
                    padding: `${currentPreset.padding.y}px ${currentPreset.padding.x}px`,
                    fontSize: `${currentPreset.fontSize}px`,
                    borderRadius: `${currentPreset.borderRadius}px`,
                  }}
                >
                  Cancel
                </button>
                <button
                  className="bg-white border-2 border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 transition-colors"
                  style={{
                    minHeight: `${currentPreset.minHeight}px`,
                    minWidth: `${currentPreset.minWidth}px`,
                    padding: `${currentPreset.padding.y}px ${currentPreset.padding.x}px`,
                    fontSize: `${currentPreset.fontSize}px`,
                    borderRadius: `${currentPreset.borderRadius}px`,
                  }}
                >
                  Back
                </button>
              </div>
            </div>

            {/* Icon buttons */}
            <div className="mb-8">
              <h4 className="font-semibold mb-3">Icon Buttons</h4>
              <div
                className="flex flex-wrap gap-3"
                style={{ gap: `${currentPreset.spacing}px` }}
              >
                <button
                  className="bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center justify-center"
                  style={{
                    minHeight: `${currentPreset.minHeight}px`,
                    minWidth: `${currentPreset.minHeight}px`,
                    borderRadius: `${currentPreset.borderRadius}px`,
                  }}
                  title="Settings"
                >
                  <span style={{ fontSize: `${currentPreset.iconSize}px` }}>⚙️</span>
                </button>
                <button
                  className="bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center justify-center"
                  style={{
                    minHeight: `${currentPreset.minHeight}px`,
                    minWidth: `${currentPreset.minHeight}px`,
                    borderRadius: `${currentPreset.borderRadius}px`,
                  }}
                  title="Edit"
                >
                  <span style={{ fontSize: `${currentPreset.iconSize}px` }}>✏️</span>
                </button>
                <button
                  className="bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center justify-center"
                  style={{
                    minHeight: `${currentPreset.minHeight}px`,
                    minWidth: `${currentPreset.minHeight}px`,
                    borderRadius: `${currentPreset.borderRadius}px`,
                  }}
                  title="Delete"
                >
                  <span style={{ fontSize: `${currentPreset.iconSize}px` }}>🗑️</span>
                </button>
              </div>
            </div>

            {/* Form inputs */}
            <div>
              <h4 className="font-semibold mb-3">Form Inputs</h4>
              <div className="space-y-3 max-w-md">
                <input
                  type="text"
                  placeholder="Text input"
                  className="w-full border-2 border-gray-300 rounded px-3"
                  style={{
                    height: `${currentPreset.minHeight}px`,
                    fontSize: `${currentPreset.fontSize}px`,
                    borderRadius: `${currentPreset.borderRadius}px`,
                  }}
                />
                <select
                  className="w-full border-2 border-gray-300 rounded px-3"
                  style={{
                    height: `${currentPreset.minHeight}px`,
                    fontSize: `${currentPreset.fontSize}px`,
                    borderRadius: `${currentPreset.borderRadius}px`,
                  }}
                >
                  <option>Select option</option>
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
              </div>
            </div>
          </div>

          {/* Accessibility tip */}
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <div className="flex items-start gap-3">
              <div className="text-2xl">👆</div>
              <div>
                <h4 className="font-semibold text-purple-900 mb-1">
                  Touch Target Test
                </h4>
                <p className="text-sm text-purple-800">
                  Try tapping the buttons above on a touchscreen device. If you find it
                  difficult to hit the intended target, consider increasing the button size.
                  The WCAG-compliant sizes (Comfortable and larger) are designed to prevent
                  accidental taps.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
