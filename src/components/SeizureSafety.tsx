import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type FlashRisk = 'safe' | 'caution' | 'danger';

export interface SeizureSafetySettings {
  enabled: boolean;
  blockFlashingContent: boolean;
  blockRapidAnimations: boolean;
  blockStrobeEffects: boolean;
  reduceContrast: boolean;
  maxFlashRate: number; // flashes per second
  maxContrastRatio: number;
  showWarnings: boolean;
  pauseOnWarning: boolean;
}

export interface FlashDetection {
  id: string;
  timestamp: Date;
  flashRate: number;
  duration: number;
  risk: FlashRisk;
  location: string;
  blocked: boolean;
}

export interface SeizureSafetyStats {
  totalDetections: number;
  blockedFlashes: number;
  warnings: number;
  lastDetection: Date | null;
  averageFlashRate: number;
  highRiskEvents: number;
}

export interface SafetyGuideline {
  id: string;
  title: string;
  description: string;
  wcagCriteria: string;
  threshold: string;
  recommendation: string;
}

// ============================================================================
// Constants & Guidelines
// ============================================================================

const WCAG_FLASH_THRESHOLD = 3; // Maximum 3 flashes per second (WCAG 2.3.1)
const SAFE_CONTRAST_RATIO = 2.5; // Maximum contrast ratio for transitions
const SAFE_ANIMATION_DURATION = 300; // Minimum duration in ms

const safetyGuidelines: SafetyGuideline[] = [
  {
    id: 'flash-rate',
    title: 'Flash Rate Limit',
    description: 'Content should not flash more than 3 times per second',
    wcagCriteria: 'WCAG 2.1 - 2.3.1 Three Flashes or Below Threshold (Level A)',
    threshold: '3 flashes per second',
    recommendation: 'Avoid flashing content entirely when possible. If necessary, keep below 3Hz.',
  },
  {
    id: 'large-area',
    title: 'Small Safe Area',
    description: 'Flashing area should be below the small safe area threshold',
    wcagCriteria: 'WCAG 2.1 - 2.3.1 Three Flashes or Below Threshold (Level A)',
    threshold: 'Below 25% of 10 degrees of visual field',
    recommendation: 'Keep flashing elements small and contained.',
  },
  {
    id: 'red-flash',
    title: 'Red Flash Limit',
    description: 'Avoid transitions involving saturated red',
    wcagCriteria: 'WCAG 2.1 - 2.3.2 Three Flashes (Level AAA)',
    threshold: 'No red flashes regardless of size',
    recommendation: 'Never use flashing saturated red content.',
  },
  {
    id: 'contrast',
    title: 'Contrast Transitions',
    description: 'Rapid contrast changes should be minimized',
    wcagCriteria: 'Best Practice',
    threshold: 'Contrast ratio < 2.5:1 for rapid transitions',
    recommendation: 'Use gradual transitions between high-contrast states.',
  },
  {
    id: 'parallax',
    title: 'Parallax Scrolling',
    description: 'Limit use of parallax effects which can trigger discomfort',
    wcagCriteria: 'WCAG 2.1 - 2.3.3 Animation from Interactions (Level AAA)',
    threshold: 'Provide option to disable',
    recommendation: 'Always provide controls to disable parallax effects.',
  },
];

// ============================================================================
// Mock Data Generators
// ============================================================================

const generateMockDetections = (): FlashDetection[] => {
  return [
    {
      id: 'detect-1',
      timestamp: new Date(Date.now() - 120000),
      flashRate: 2.5,
      duration: 500,
      risk: 'safe',
      location: 'Notification banner',
      blocked: false,
    },
    {
      id: 'detect-2',
      timestamp: new Date(Date.now() - 60000),
      flashRate: 4.2,
      duration: 1000,
      risk: 'danger',
      location: 'Loading spinner',
      blocked: true,
    },
    {
      id: 'detect-3',
      timestamp: new Date(Date.now() - 30000),
      flashRate: 3.1,
      duration: 750,
      risk: 'caution',
      location: 'Alert message',
      blocked: false,
    },
  ];
};

// ============================================================================
// Custom Hook
// ============================================================================

export const useSeizureSafety = (initialSettings?: Partial<SeizureSafetySettings>) => {
  const [settings, setSettings] = useState<SeizureSafetySettings>({
    enabled: true,
    blockFlashingContent: true,
    blockRapidAnimations: true,
    blockStrobeEffects: true,
    reduceContrast: true,
    maxFlashRate: WCAG_FLASH_THRESHOLD,
    maxContrastRatio: SAFE_CONTRAST_RATIO,
    showWarnings: true,
    pauseOnWarning: true,
    ...initialSettings,
  });

  const [detections, setDetections] = useState<FlashDetection[]>(generateMockDetections());
  const [stats, setStats] = useState<SeizureSafetyStats>({
    totalDetections: 0,
    blockedFlashes: 0,
    warnings: 0,
    lastDetection: null,
    averageFlashRate: 0,
    highRiskEvents: 0,
  });

  const flashCounterRef = useRef<Map<string, number[]>>(new Map());

  // Check if flash rate is safe
  const isFlashRateSafe = useCallback(
    (flashRate: number): boolean => {
      if (!settings.enabled) return true;
      return flashRate <= settings.maxFlashRate;
    },
    [settings.enabled, settings.maxFlashRate]
  );

  // Detect flash risk level
  const detectFlashRisk = useCallback(
    (flashRate: number): FlashRisk => {
      if (flashRate <= settings.maxFlashRate) return 'safe';
      if (flashRate <= settings.maxFlashRate * 1.5) return 'caution';
      return 'danger';
    },
    [settings.maxFlashRate]
  );

  // Record flash event
  const recordFlash = useCallback(
    (location: string) => {
      const now = Date.now();
      const flashes = flashCounterRef.current.get(location) || [];

      // Remove flashes older than 1 second
      const recentFlashes = flashes.filter((time) => now - time < 1000);
      recentFlashes.push(now);

      flashCounterRef.current.set(location, recentFlashes);

      // Calculate flash rate
      const flashRate = recentFlashes.length;
      const risk = detectFlashRisk(flashRate);
      const blocked =
        settings.blockFlashingContent && risk !== 'safe';

      // Create detection record
      const detection: FlashDetection = {
        id: `detect-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
        flashRate,
        duration: 1000,
        risk,
        location,
        blocked,
      };

      setDetections((prev) => [detection, ...prev].slice(0, 50));

      return {
        allowed: !blocked,
        risk,
        flashRate,
      };
    },
    [settings.blockFlashingContent, detectFlashRisk]
  );

  // Check if animation is safe
  const isAnimationSafe = useCallback(
    (duration: number, type: string): boolean => {
      if (!settings.enabled) return true;

      if (settings.blockRapidAnimations) {
        if (duration < SAFE_ANIMATION_DURATION && type !== 'essential') {
          return false;
        }
      }

      if (settings.blockStrobeEffects) {
        if (type === 'strobe' || type === 'flash' || type === 'blink') {
          return false;
        }
      }

      return true;
    },
    [settings.enabled, settings.blockRapidAnimations, settings.blockStrobeEffects]
  );

  // Get safe animation props
  const getSafeAnimationProps = useCallback(
    (defaultDuration: number = 300) => {
      if (!settings.enabled) {
        return { duration: defaultDuration / 1000 };
      }

      const safeDuration = Math.max(defaultDuration, SAFE_ANIMATION_DURATION);

      return {
        duration: safeDuration / 1000,
        ease: 'easeInOut',
      };
    },
    [settings.enabled]
  );

  // Update settings
  const updateSettings = useCallback((updates: Partial<SeizureSafetySettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // Clear detections
  const clearDetections = useCallback(() => {
    setDetections([]);
    flashCounterRef.current.clear();
  }, []);

  // Calculate stats
  useEffect(() => {
    const totalDetections = detections.length;
    const blockedFlashes = detections.filter((d) => d.blocked).length;
    const warnings = detections.filter((d) => d.risk !== 'safe').length;
    const highRiskEvents = detections.filter((d) => d.risk === 'danger').length;

    const totalFlashRate = detections.reduce((sum, d) => sum + d.flashRate, 0);
    const averageFlashRate =
      totalDetections > 0 ? totalFlashRate / totalDetections : 0;

    const lastDetection = detections.length > 0 ? detections[0].timestamp : null;

    setStats({
      totalDetections,
      blockedFlashes,
      warnings,
      lastDetection,
      averageFlashRate,
      highRiskEvents,
    });
  }, [detections]);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;

    if (settings.enabled) {
      root.setAttribute('data-seizure-safety', 'true');
      root.style.setProperty('--safe-animation-duration', `${SAFE_ANIMATION_DURATION}ms`);

      if (settings.reduceContrast) {
        root.style.setProperty('--max-contrast-ratio', settings.maxContrastRatio.toString());
      }
    } else {
      root.removeAttribute('data-seizure-safety');
      root.style.removeProperty('--safe-animation-duration');
      root.style.removeProperty('--max-contrast-ratio');
    }
  }, [settings]);

  return {
    settings,
    detections,
    stats,
    guidelines: safetyGuidelines,
    isFlashRateSafe,
    detectFlashRisk,
    recordFlash,
    isAnimationSafe,
    getSafeAnimationProps,
    updateSettings,
    clearDetections,
  };
};

// ============================================================================
// Component
// ============================================================================

export const SeizureSafety: React.FC = () => {
  const {
    settings,
    detections,
    stats,
    guidelines,
    recordFlash,
    updateSettings,
    clearDetections,
  } = useSeizureSafety();

  const [activeTab, setActiveTab] = useState<'overview' | 'detections' | 'guidelines' | 'test'>(
    'overview'
  );
  const [testLocation, setTestLocation] = useState('Test element');
  const [testResult, setTestResult] = useState<{
    allowed: boolean;
    risk: FlashRisk;
    flashRate: number;
  } | null>(null);

  // Run flash test
  const runFlashTest = () => {
    const result = recordFlash(testLocation);
    setTestResult(result);
  };

  // Get risk color
  const getRiskColor = (risk: FlashRisk): string => {
    switch (risk) {
      case 'safe':
        return '#10b981';
      case 'caution':
        return '#f59e0b';
      case 'danger':
        return '#ef4444';
      default:
        return '#9ca3af';
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
        <h1 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '2rem' }}>
          Seizure Safety
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '1rem' }}>
          Protect users from photosensitive seizures by preventing dangerous flashing content
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
        <h2 style={{ margin: 0, marginBottom: '1rem', fontSize: '1.25rem' }}>Safety Settings</h2>

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
            <span>Enable Seizure Safety</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.blockFlashingContent}
              onChange={(e) => updateSettings({ blockFlashingContent: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Block Flashing Content</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.blockRapidAnimations}
              onChange={(e) => updateSettings({ blockRapidAnimations: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Block Rapid Animations</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.blockStrobeEffects}
              onChange={(e) => updateSettings({ blockStrobeEffects: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Block Strobe Effects</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.reduceContrast}
              onChange={(e) => updateSettings({ reduceContrast: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Reduce Contrast</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.showWarnings}
              onChange={(e) => updateSettings({ showWarnings: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Show Warnings</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.pauseOnWarning}
              onChange={(e) => updateSettings({ pauseOnWarning: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Pause on Warning</span>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span>Maximum Flash Rate (flashes/second)</span>
            <input
              type="number"
              value={settings.maxFlashRate}
              onChange={(e) => updateSettings({ maxFlashRate: parseFloat(e.target.value) })}
              disabled={!settings.enabled}
              min={0}
              max={10}
              step={0.1}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '1rem',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: '#666' }}>
              WCAG 2.1 recommends maximum 3 flashes/second
            </span>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span>Maximum Contrast Ratio</span>
            <input
              type="number"
              value={settings.maxContrastRatio}
              onChange={(e) => updateSettings({ maxContrastRatio: parseFloat(e.target.value) })}
              disabled={!settings.enabled}
              min={1}
              max={10}
              step={0.1}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '1rem',
              }}
            />
            <span style={{ fontSize: '0.75rem', color: '#666' }}>
              Lower values are safer for rapid transitions
            </span>
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
            Total Detections
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {stats.totalDetections}
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
            Blocked Flashes
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
            {stats.blockedFlashes}
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
            High Risk Events
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {stats.highRiskEvents}
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
            Avg Flash Rate
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
            {stats.averageFlashRate.toFixed(1)}/s
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
          { id: 'detections', label: `Detections (${detections.length})` },
          { id: 'guidelines', label: 'WCAG Guidelines' },
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
                Photosensitive seizures can be triggered by flashing lights, rapid transitions, and
                certain visual patterns. This system helps prevent seizures by detecting and
                blocking dangerous content.
              </p>

              <h3 style={{ margin: '2rem 0 1rem 0' }}>Why Seizure Safety Matters</h3>
              <ul style={{ lineHeight: 1.8 }}>
                <li>Protects users with photosensitive epilepsy</li>
                <li>Prevents harm from flashing content and rapid animations</li>
                <li>Required for WCAG 2.1 Level A compliance</li>
                <li>Demonstrates duty of care for user safety</li>
                <li>Reduces liability risks from unsafe content</li>
              </ul>

              <h3 style={{ margin: '2rem 0 1rem 0' }}>Key Safety Measures</h3>
              <ul style={{ lineHeight: 1.8 }}>
                <li><strong>Flash Rate Monitoring:</strong> Detects content flashing more than 3 times per second</li>
                <li><strong>Automatic Blocking:</strong> Prevents dangerous content from displaying</li>
                <li><strong>Contrast Control:</strong> Limits rapid high-contrast transitions</li>
                <li><strong>Animation Safety:</strong> Ensures animations meet minimum duration requirements</li>
                <li><strong>User Warnings:</strong> Alerts users to potentially unsafe content</li>
              </ul>

              <div
                style={{
                  marginTop: '2rem',
                  padding: '1.5rem',
                  background: '#fef2f2',
                  borderRadius: '8px',
                  border: '2px solid #ef4444',
                }}
              >
                <h4 style={{ margin: 0, marginBottom: '0.5rem', color: '#dc2626' }}>
                  ⚠️ Critical Safety Information
                </h4>
                <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.6 }}>
                  Content that flashes more than 3 times per second can trigger photosensitive
                  seizures. Never disable seizure safety features unless you are certain all
                  content is safe. When in doubt, keep protections enabled.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'detections' && (
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
                <h2 style={{ margin: 0 }}>Flash Detections ({detections.length})</h2>
                <button
                  onClick={clearDetections}
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
                {detections.map((detection) => (
                  <div
                    key={detection.id}
                    style={{
                      padding: '1rem',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      border: `2px solid ${getRiskColor(detection.risk)}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <div>
                        <strong>{detection.location}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            padding: '0.25rem 0.5rem',
                            background: getRiskColor(detection.risk),
                            color: 'white',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                          }}
                        >
                          {detection.risk}
                        </span>
                        {detection.blocked && (
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              background: '#dc2626',
                              color: 'white',
                              borderRadius: '4px',
                            }}
                          >
                            Blocked
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '1rem',
                        fontSize: '0.875rem',
                        color: '#666',
                      }}
                    >
                      <div>
                        <strong>Flash Rate:</strong> {detection.flashRate.toFixed(1)}/s
                      </div>
                      <div>
                        <strong>Duration:</strong> {detection.duration}ms
                      </div>
                      <div>
                        <strong>Time:</strong> {detection.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}

                {detections.length === 0 && (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                    No flash detections recorded. Use the Test tab to simulate flash events.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'guidelines' && (
            <div
              style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>WCAG Guidelines</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {guidelines.map((guideline) => (
                  <div
                    key={guideline.id}
                    style={{
                      padding: '1.5rem',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <h3 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.125rem' }}>
                      {guideline.title}
                    </h3>
                    <p style={{ margin: 0, marginBottom: '1rem', color: '#666' }}>
                      {guideline.description}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                          Threshold:
                        </div>
                        <div style={{ fontSize: '0.875rem' }}>{guideline.threshold}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                          WCAG:
                        </div>
                        <div style={{ fontSize: '0.875rem' }}>{guideline.wcagCriteria}</div>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        background: '#eff6ff',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                      }}
                    >
                      <strong>Recommendation:</strong> {guideline.recommendation}
                    </div>
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
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Test Flash Detection</h2>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 'bold' }}>Test Location</span>
                  <input
                    type="text"
                    value={testLocation}
                    onChange={(e) => setTestLocation(e.target.value)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      fontSize: '1rem',
                    }}
                  />
                </label>

                <button
                  onClick={runFlashTest}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                  }}
                >
                  Simulate Flash Event
                </button>
              </div>

              {testResult && (
                <div
                  style={{
                    padding: '1.5rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    border: `2px solid ${getRiskColor(testResult.risk)}`,
                    marginBottom: '1.5rem',
                  }}
                >
                  <h3 style={{ margin: 0, marginBottom: '1rem' }}>Test Result</h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#666' }}>Flash Rate</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {testResult.flashRate}/s
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#666' }}>Risk Level</div>
                      <div
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          color: getRiskColor(testResult.risk),
                          textTransform: 'uppercase',
                        }}
                      >
                        {testResult.risk}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#666' }}>Status</div>
                      <div
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          color: testResult.allowed ? '#10b981' : '#ef4444',
                        }}
                      >
                        {testResult.allowed ? 'Allowed' : 'Blocked'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div
                style={{
                  padding: '1.5rem',
                  background: '#fef2f2',
                  borderRadius: '8px',
                  border: '1px solid #fca5a5',
                }}
              >
                <h4 style={{ margin: 0, marginBottom: '0.5rem', color: '#dc2626' }}>
                  Testing Instructions
                </h4>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: 1.8, fontSize: '0.875rem' }}>
                  <li>Click the button multiple times rapidly to simulate flashing</li>
                  <li>Flash rate is measured over a 1-second window</li>
                  <li>Content flashing &gt; {settings.maxFlashRate}/s will be blocked</li>
                  <li>Safe flash rate: ≤ {settings.maxFlashRate}/s</li>
                  <li>Check the Detections tab to see all recorded events</li>
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SeizureSafety;
