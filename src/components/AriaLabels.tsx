import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type AriaLabelType = 'label' | 'labelledby' | 'describedby' | 'controls' | 'owns';

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
  | 'document'
  | 'feed'
  | 'figure'
  | 'form'
  | 'grid'
  | 'gridcell'
  | 'group'
  | 'heading'
  | 'img'
  | 'link'
  | 'list'
  | 'listbox'
  | 'listitem'
  | 'main'
  | 'menu'
  | 'menubar'
  | 'menuitem'
  | 'navigation'
  | 'none'
  | 'note'
  | 'option'
  | 'presentation'
  | 'progressbar'
  | 'radio'
  | 'radiogroup'
  | 'region'
  | 'row'
  | 'rowgroup'
  | 'search'
  | 'searchbox'
  | 'separator'
  | 'slider'
  | 'spinbutton'
  | 'status'
  | 'switch'
  | 'tab'
  | 'tablist'
  | 'tabpanel'
  | 'textbox'
  | 'timer'
  | 'toolbar'
  | 'tooltip'
  | 'tree'
  | 'treegrid'
  | 'treeitem';

export type AriaState =
  | 'aria-atomic'
  | 'aria-busy'
  | 'aria-checked'
  | 'aria-current'
  | 'aria-disabled'
  | 'aria-expanded'
  | 'aria-grabbed'
  | 'aria-haspopup'
  | 'aria-hidden'
  | 'aria-invalid'
  | 'aria-level'
  | 'aria-live'
  | 'aria-modal'
  | 'aria-multiline'
  | 'aria-multiselectable'
  | 'aria-orientation'
  | 'aria-placeholder'
  | 'aria-pressed'
  | 'aria-readonly'
  | 'aria-required'
  | 'aria-selected'
  | 'aria-sort'
  | 'aria-valuemax'
  | 'aria-valuemin'
  | 'aria-valuenow'
  | 'aria-valuetext';

export interface AriaLabel {
  id: string;
  elementId: string;
  elementType: string;
  type: AriaLabelType;
  value: string;
  role?: AriaRole;
  states?: Partial<Record<AriaState, string | boolean | number>>;
  description?: string;
  required?: boolean;
  validated: boolean;
  issues: string[];
  wcagCriteria: string[];
}

export interface AriaLabelSettings {
  enabled: boolean;
  autoValidate: boolean;
  enforceRoles: boolean;
  requireLabels: boolean;
  showWarnings: boolean;
  validateStates: boolean;
  checkRedundancy: boolean;
  suggestImprovements: boolean;
}

export interface AriaLabelStats {
  totalLabels: number;
  byType: Record<AriaLabelType, number>;
  byRole: Record<string, number>;
  withIssues: number;
  validated: number;
  missingLabels: number;
}

export interface AriaGuideline {
  role: AriaRole;
  name: string;
  description: string;
  requiredAttributes: string[];
  optionalAttributes: string[];
  examples: {
    good: string;
    bad?: string;
  };
  wcagCriteria: string;
}

// ============================================================================
// Mock Data Generators
// ============================================================================

const generateMockAriaLabels = (): AriaLabel[] => {
  return [
    {
      id: 'aria-1',
      elementId: 'main-nav',
      elementType: 'nav',
      type: 'label',
      value: 'Main navigation',
      role: 'navigation',
      description: 'Primary site navigation with links to main sections',
      required: false,
      validated: true,
      issues: [],
      wcagCriteria: ['WCAG 2.1 - 4.1.2 Name, Role, Value'],
    },
    {
      id: 'aria-2',
      elementId: 'search-input',
      elementType: 'input',
      type: 'label',
      value: 'Search typing exercises',
      role: 'searchbox',
      states: {
        'aria-required': false,
        'aria-invalid': false,
      },
      description: 'Search field for finding typing exercises',
      required: true,
      validated: true,
      issues: [],
      wcagCriteria: ['WCAG 2.1 - 1.3.1 Info and Relationships', 'WCAG 2.1 - 4.1.2 Name, Role, Value'],
    },
    {
      id: 'aria-3',
      elementId: 'start-btn',
      elementType: 'button',
      type: 'label',
      value: 'Start',
      role: 'button',
      states: {
        'aria-pressed': false,
        'aria-disabled': false,
      },
      required: true,
      validated: false,
      issues: ['Label too generic - should describe the action more specifically'],
      wcagCriteria: ['WCAG 2.1 - 2.4.4 Link Purpose (In Context)'],
    },
    {
      id: 'aria-4',
      elementId: 'progress-bar',
      elementType: 'div',
      type: 'label',
      value: 'Exercise completion progress',
      role: 'progressbar',
      states: {
        'aria-valuemin': 0,
        'aria-valuemax': 100,
        'aria-valuenow': 65,
        'aria-valuetext': '65% complete',
      },
      description: 'Shows your progress through the current exercise',
      required: true,
      validated: true,
      issues: [],
      wcagCriteria: ['WCAG 2.1 - 4.1.2 Name, Role, Value'],
    },
    {
      id: 'aria-5',
      elementId: 'settings-panel',
      elementType: 'div',
      type: 'labelledby',
      value: 'settings-heading',
      role: 'region',
      states: {
        'aria-expanded': true,
      },
      description: 'Application settings panel',
      required: true,
      validated: true,
      issues: [],
      wcagCriteria: ['WCAG 2.1 - 1.3.1 Info and Relationships'],
    },
    {
      id: 'aria-6',
      elementId: 'error-message',
      elementType: 'div',
      type: 'describedby',
      value: 'email-error',
      role: 'alert',
      states: {
        'aria-live': 'assertive',
        'aria-atomic': true,
      },
      description: 'Error message for invalid email',
      required: true,
      validated: false,
      issues: ['Alert role should be used sparingly - consider using polite live region'],
      wcagCriteria: ['WCAG 2.1 - 3.3.1 Error Identification'],
    },
  ];
};

const ariaGuidelines: AriaGuideline[] = [
  {
    role: 'button',
    name: 'Button',
    description: 'An input that allows for user-triggered actions',
    requiredAttributes: ['aria-label or text content'],
    optionalAttributes: ['aria-pressed', 'aria-expanded', 'aria-disabled'],
    examples: {
      good: '<button aria-label="Close dialog">×</button>',
      bad: '<button>×</button>',
    },
    wcagCriteria: 'WCAG 2.1 - 4.1.2 Name, Role, Value',
  },
  {
    role: 'navigation',
    name: 'Navigation',
    description: 'A collection of navigational elements',
    requiredAttributes: ['aria-label or aria-labelledby'],
    optionalAttributes: ['aria-describedby'],
    examples: {
      good: '<nav aria-label="Main navigation">...</nav>',
      bad: '<nav>...</nav>',
    },
    wcagCriteria: 'WCAG 2.1 - 2.4.1 Bypass Blocks',
  },
  {
    role: 'dialog',
    name: 'Dialog',
    description: 'A modal or non-modal window',
    requiredAttributes: ['aria-label or aria-labelledby', 'aria-modal'],
    optionalAttributes: ['aria-describedby'],
    examples: {
      good: '<div role="dialog" aria-labelledby="dialog-title" aria-modal="true">...</div>',
    },
    wcagCriteria: 'WCAG 2.1 - 4.1.2 Name, Role, Value',
  },
  {
    role: 'progressbar',
    name: 'Progress Bar',
    description: 'An element that displays progress status',
    requiredAttributes: ['aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
    optionalAttributes: ['aria-valuetext', 'aria-label'],
    examples: {
      good: '<div role="progressbar" aria-valuenow="65" aria-valuemin="0" aria-valuemax="100" aria-label="Upload progress">65%</div>',
    },
    wcagCriteria: 'WCAG 2.1 - 4.1.2 Name, Role, Value',
  },
  {
    role: 'alert',
    name: 'Alert',
    description: 'A type of live region with important, time-sensitive information',
    requiredAttributes: ['text content or aria-label'],
    optionalAttributes: ['aria-live', 'aria-atomic'],
    examples: {
      good: '<div role="alert">Your session will expire in 5 minutes</div>',
    },
    wcagCriteria: 'WCAG 2.1 - 4.1.3 Status Messages',
  },
  {
    role: 'tablist',
    name: 'Tab List',
    description: 'A list of tab elements',
    requiredAttributes: ['aria-label or aria-labelledby'],
    optionalAttributes: ['aria-orientation'],
    examples: {
      good: '<div role="tablist" aria-label="Settings tabs">...</div>',
    },
    wcagCriteria: 'WCAG 2.1 - 4.1.2 Name, Role, Value',
  },
  {
    role: 'searchbox',
    name: 'Search Box',
    description: 'A text input for search queries',
    requiredAttributes: ['aria-label or associated label'],
    optionalAttributes: ['aria-controls', 'aria-expanded'],
    examples: {
      good: '<input type="text" role="searchbox" aria-label="Search exercises" />',
    },
    wcagCriteria: 'WCAG 2.1 - 1.3.1 Info and Relationships',
  },
  {
    role: 'status',
    name: 'Status',
    description: 'A live region containing advisory information',
    requiredAttributes: ['text content or aria-label'],
    optionalAttributes: ['aria-live', 'aria-atomic'],
    examples: {
      good: '<div role="status" aria-live="polite">5 results found</div>',
    },
    wcagCriteria: 'WCAG 2.1 - 4.1.3 Status Messages',
  },
];

// ============================================================================
// Validation Functions
// ============================================================================

const validateAriaLabel = (label: AriaLabel, settings: AriaLabelSettings): { validated: boolean; issues: string[] } => {
  const issues: string[] = [];

  if (!settings.enabled) {
    return { validated: true, issues: [] };
  }

  // Check if label value is empty
  if (!label.value || label.value.trim() === '') {
    issues.push('Label value is empty');
  }

  // Check for generic labels
  if (settings.suggestImprovements) {
    const genericLabels = ['button', 'link', 'image', 'click here', 'read more', 'submit'];
    if (genericLabels.includes(label.value.toLowerCase())) {
      issues.push(`Generic label "${label.value}" - provide more descriptive text`);
    }
  }

  // Check for redundancy
  if (settings.checkRedundancy && label.role) {
    const lowerValue = label.value.toLowerCase();
    if (lowerValue.includes(label.role.toLowerCase()) && label.role !== 'button') {
      issues.push(`Redundant role name in label - "${label.role}" already conveyed by role`);
    }
  }

  // Check required attributes for specific roles
  if (settings.enforceRoles && label.role) {
    switch (label.role) {
      case 'progressbar':
        if (!label.states?.['aria-valuenow'] || !label.states?.['aria-valuemin'] || !label.states?.['aria-valuemax']) {
          issues.push('Progressbar requires aria-valuenow, aria-valuemin, and aria-valuemax');
        }
        break;
      case 'button':
        if (label.states?.['aria-pressed'] !== undefined && typeof label.states['aria-pressed'] !== 'boolean') {
          issues.push('aria-pressed must be a boolean value');
        }
        break;
      case 'dialog':
        if (!label.states?.['aria-modal']) {
          issues.push('Dialog should include aria-modal attribute');
        }
        break;
    }
  }

  // Validate states
  if (settings.validateStates && label.states) {
    Object.entries(label.states).forEach(([state, value]) => {
      if (state === 'aria-live' && !['off', 'polite', 'assertive'].includes(value as string)) {
        issues.push(`Invalid aria-live value: ${value}`);
      }
      if (state === 'aria-current' && !['page', 'step', 'location', 'date', 'time', 'true', 'false'].includes(value as string)) {
        issues.push(`Invalid aria-current value: ${value}`);
      }
    });
  }

  return {
    validated: issues.length === 0,
    issues,
  };
};

// ============================================================================
// Custom Hook
// ============================================================================

export const useAriaLabels = (initialSettings?: Partial<AriaLabelSettings>) => {
  const [settings, setSettings] = useState<AriaLabelSettings>({
    enabled: true,
    autoValidate: true,
    enforceRoles: true,
    requireLabels: true,
    showWarnings: true,
    validateStates: true,
    checkRedundancy: true,
    suggestImprovements: true,
    ...initialSettings,
  });

  const [labels, setLabels] = useState<AriaLabel[]>(generateMockAriaLabels());
  const [stats, setStats] = useState<AriaLabelStats>({
    totalLabels: 0,
    byType: {
      label: 0,
      labelledby: 0,
      describedby: 0,
      controls: 0,
      owns: 0,
    },
    byRole: {},
    withIssues: 0,
    validated: 0,
    missingLabels: 0,
  });

  // Add label
  const addLabel = useCallback((label: Omit<AriaLabel, 'id' | 'validated' | 'issues'>) => {
    const validation = validateAriaLabel({ ...label, id: '', validated: false, issues: [] } as AriaLabel, settings);

    const newLabel: AriaLabel = {
      ...label,
      id: `aria-${Date.now()}-${Math.random()}`,
      validated: validation.validated,
      issues: validation.issues,
    };

    setLabels((prev) => [...prev, newLabel]);
  }, [settings]);

  // Update label
  const updateLabel = useCallback((id: string, updates: Partial<AriaLabel>) => {
    setLabels((prev) =>
      prev.map((label) => {
        if (label.id !== id) return label;

        const updated = { ...label, ...updates };
        const validation = validateAriaLabel(updated, settings);

        return {
          ...updated,
          validated: validation.validated,
          issues: validation.issues,
        };
      })
    );
  }, [settings]);

  // Remove label
  const removeLabel = useCallback((id: string) => {
    setLabels((prev) => prev.filter((label) => label.id !== id));
  }, []);

  // Validate all labels
  const validateAll = useCallback(() => {
    setLabels((prev) =>
      prev.map((label) => {
        const validation = validateAriaLabel(label, settings);
        return {
          ...label,
          validated: validation.validated,
          issues: validation.issues,
        };
      })
    );
  }, [settings]);

  // Get attributes for element
  const getAriaAttributes = useCallback((elementId: string): Record<string, string | boolean | number> => {
    const label = labels.find((l) => l.elementId === elementId);
    if (!label || !settings.enabled) return {};

    const attributes: Record<string, string | boolean | number> = {};

    // Add role
    if (label.role) {
      attributes.role = label.role;
    }

    // Add label/labelledby/describedby
    switch (label.type) {
      case 'label':
        attributes['aria-label'] = label.value;
        break;
      case 'labelledby':
        attributes['aria-labelledby'] = label.value;
        break;
      case 'describedby':
        attributes['aria-describedby'] = label.value;
        break;
      case 'controls':
        attributes['aria-controls'] = label.value;
        break;
      case 'owns':
        attributes['aria-owns'] = label.value;
        break;
    }

    // Add states
    if (label.states) {
      Object.entries(label.states).forEach(([key, value]) => {
        attributes[key] = value;
      });
    }

    // Add required
    if (label.required) {
      attributes['aria-required'] = true;
    }

    return attributes;
  }, [labels, settings.enabled]);

  // Update settings
  const updateSettings = useCallback((updates: Partial<AriaLabelSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  // Calculate stats
  useEffect(() => {
    const totalLabels = labels.length;

    const byType: Record<AriaLabelType, number> = {
      label: labels.filter((l) => l.type === 'label').length,
      labelledby: labels.filter((l) => l.type === 'labelledby').length,
      describedby: labels.filter((l) => l.type === 'describedby').length,
      controls: labels.filter((l) => l.type === 'controls').length,
      owns: labels.filter((l) => l.type === 'owns').length,
    };

    const byRole: Record<string, number> = {};
    labels.forEach((label) => {
      if (label.role) {
        byRole[label.role] = (byRole[label.role] || 0) + 1;
      }
    });

    const withIssues = labels.filter((l) => l.issues.length > 0).length;
    const validated = labels.filter((l) => l.validated).length;
    const missingLabels = labels.filter((l) => !l.value || l.value.trim() === '').length;

    setStats({
      totalLabels,
      byType,
      byRole,
      withIssues,
      validated,
      missingLabels,
    });
  }, [labels]);

  // Auto-validate when settings change
  useEffect(() => {
    if (settings.autoValidate) {
      validateAll();
    }
  }, [settings, validateAll]);

  return {
    settings,
    labels,
    stats,
    guidelines: ariaGuidelines,
    addLabel,
    updateLabel,
    removeLabel,
    validateAll,
    getAriaAttributes,
    updateSettings,
  };
};

// ============================================================================
// Component
// ============================================================================

export const AriaLabels: React.FC = () => {
  const {
    settings,
    labels,
    stats,
    guidelines,
    updateLabel,
    removeLabel,
    validateAll,
    updateSettings,
  } = useAriaLabels();

  const [activeTab, setActiveTab] = useState<'overview' | 'labels' | 'guidelines' | 'test'>(
    'overview'
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Start editing
  const startEditing = (label: AriaLabel) => {
    setEditingId(label.id);
    setEditValue(label.value);
  };

  // Save edit
  const saveEdit = (id: string) => {
    updateLabel(id, { value: editValue });
    setEditingId(null);
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
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
          ARIA Labels
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '1rem' }}>
          Manage Accessible Rich Internet Applications (ARIA) labels for enhanced accessibility
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => updateSettings({ enabled: e.target.checked })}
            />
            <span>Enable ARIA Labels</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.autoValidate}
              onChange={(e) => updateSettings({ autoValidate: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Auto Validate</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.enforceRoles}
              onChange={(e) => updateSettings({ enforceRoles: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Enforce Roles</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.requireLabels}
              onChange={(e) => updateSettings({ requireLabels: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Require Labels</span>
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
              checked={settings.validateStates}
              onChange={(e) => updateSettings({ validateStates: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Validate States</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.checkRedundancy}
              onChange={(e) => updateSettings({ checkRedundancy: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Check Redundancy</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={settings.suggestImprovements}
              onChange={(e) => updateSettings({ suggestImprovements: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span>Suggest Improvements</span>
          </label>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <button
            onClick={validateAll}
            disabled={!settings.enabled}
            style={{
              padding: '0.5rem 1rem',
              background: settings.enabled ? '#3b82f6' : '#e5e7eb',
              color: settings.enabled ? 'white' : '#9ca3af',
              border: 'none',
              borderRadius: '6px',
              cursor: settings.enabled ? 'pointer' : 'not-allowed',
            }}
          >
            Validate All Labels
          </button>
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
            Total Labels
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {stats.totalLabels}
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
            Validated
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
            {stats.validated}
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
            With Issues
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
            {stats.withIssues}
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
            Missing Labels
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {stats.missingLabels}
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
          { id: 'labels', label: `Labels (${labels.length})` },
          { id: 'guidelines', label: 'Guidelines' },
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
                ARIA (Accessible Rich Internet Applications) labels provide essential information to
                assistive technologies, enabling users with disabilities to understand and interact
                with dynamic web content.
              </p>

              <h3 style={{ margin: '2rem 0 1rem 0' }}>Key Concepts</h3>
              <ul style={{ lineHeight: 1.8 }}>
                <li><strong>aria-label:</strong> Provides a text label for elements</li>
                <li><strong>aria-labelledby:</strong> References another element's text as the label</li>
                <li><strong>aria-describedby:</strong> References additional descriptive text</li>
                <li><strong>role:</strong> Defines the element's purpose (button, navigation, etc.)</li>
                <li><strong>States:</strong> Communicate dynamic properties (expanded, selected, etc.)</li>
              </ul>

              <h3 style={{ margin: '2rem 0 1rem 0' }}>Label Types Distribution</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(stats.byType).map(([type, count]) => (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '120px', textTransform: 'capitalize', fontWeight: 'bold' }}>
                      {type}
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
                          width: `${stats.totalLabels > 0 ? (count / stats.totalLabels) * 100 : 0}%`,
                          height: '100%',
                          background: '#3b82f6',
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                    <div style={{ width: '60px', textAlign: 'right' }}>
                      {count} ({stats.totalLabels > 0 ? Math.round((count / stats.totalLabels) * 100) : 0}%)
                    </div>
                  </div>
                ))}
              </div>

              <h3 style={{ margin: '2rem 0 1rem 0' }}>WCAG Compliance</h3>
              <p style={{ margin: 0, lineHeight: 1.6 }}>
                This implementation follows WCAG 2.1 Level A and AA guidelines, including Success
                Criteria 1.3.1 (Info and Relationships), 4.1.2 (Name, Role, Value), and 4.1.3
                (Status Messages).
              </p>
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
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>ARIA Labels ({labels.length})</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {labels.map((label) => (
                  <div
                    key={label.id}
                    style={{
                      padding: '1.5rem',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      border: `2px solid ${label.validated ? '#10b981' : '#ef4444'}`,
                    }}
                  >
                    {editingId === label.id ? (
                      // Edit mode
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            Label Value
                          </label>
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '0.5rem',
                              borderRadius: '6px',
                              border: '1px solid #ddd',
                              fontSize: '1rem',
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => saveEdit(label.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                            }}
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#6b7280',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <>
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
                              #{label.elementId}
                            </h3>
                            <div style={{ fontSize: '0.875rem', color: '#666' }}>
                              Type: <strong>{label.elementType}</strong> | ARIA Type: <strong>{label.type}</strong>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {label.role && (
                              <span
                                style={{
                                  fontSize: '0.875rem',
                                  padding: '0.25rem 0.75rem',
                                  background: '#8b5cf6',
                                  color: 'white',
                                  borderRadius: '4px',
                                }}
                              >
                                role: {label.role}
                              </span>
                            )}
                            <span
                              style={{
                                fontSize: '0.875rem',
                                padding: '0.25rem 0.75rem',
                                background: label.validated ? '#10b981' : '#ef4444',
                                color: 'white',
                                borderRadius: '4px',
                              }}
                            >
                              {label.validated ? 'Valid' : 'Issues'}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            padding: '1rem',
                            background: 'white',
                            borderRadius: '6px',
                            marginBottom: '1rem',
                          }}
                        >
                          <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                            {label.type === 'label' && 'aria-label:'}
                            {label.type === 'labelledby' && 'aria-labelledby:'}
                            {label.type === 'describedby' && 'aria-describedby:'}
                            {label.type === 'controls' && 'aria-controls:'}
                            {label.type === 'owns' && 'aria-owns:'}
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                            {label.value || <em style={{ color: '#dc2626' }}>(empty)</em>}
                          </div>
                        </div>

                        {label.description && (
                          <div
                            style={{
                              padding: '0.75rem',
                              background: '#eff6ff',
                              borderRadius: '6px',
                              marginBottom: '1rem',
                              fontSize: '0.875rem',
                            }}
                          >
                            <strong>Description:</strong> {label.description}
                          </div>
                        )}

                        {label.states && Object.keys(label.states).length > 0 && (
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                              States:
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {Object.entries(label.states).map(([key, value]) => (
                                <span
                                  key={key}
                                  style={{
                                    fontSize: '0.75rem',
                                    padding: '0.25rem 0.5rem',
                                    background: '#e5e7eb',
                                    borderRadius: '4px',
                                    fontFamily: 'monospace',
                                  }}
                                >
                                  {key}={String(value)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {label.issues.length > 0 && (
                          <div style={{ marginBottom: '1rem' }}>
                            <div
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: 'bold',
                                color: '#dc2626',
                                marginBottom: '0.5rem',
                              }}
                            >
                              Issues:
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                              {label.issues.map((issue, i) => (
                                <li key={i} style={{ fontSize: '0.875rem', color: '#dc2626' }}>
                                  {issue}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {label.wcagCriteria.length > 0 && (
                          <div
                            style={{
                              padding: '0.75rem',
                              background: '#f0fdf4',
                              borderRadius: '6px',
                              marginBottom: '1rem',
                              fontSize: '0.75rem',
                            }}
                          >
                            <strong>WCAG:</strong> {label.wcagCriteria.join(', ')}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => startEditing(label)}
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
                            Edit
                          </button>
                          <button
                            onClick={() => removeLabel(label.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
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
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>ARIA Guidelines</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {guidelines.map((guideline) => (
                  <div
                    key={guideline.role}
                    style={{
                      padding: '1.5rem',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <h3 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '1.25rem' }}>
                      {guideline.name} <code style={{ fontSize: '0.875rem', color: '#8b5cf6' }}>role="{guideline.role}"</code>
                    </h3>
                    <p style={{ margin: 0, marginBottom: '1rem', color: '#666' }}>
                      {guideline.description}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '0.875rem', color: '#dc2626' }}>
                          Required Attributes:
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                          {guideline.requiredAttributes.map((attr, i) => (
                            <li key={i} style={{ fontSize: '0.875rem' }}>
                              {attr}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '0.875rem', color: '#3b82f6' }}>
                          Optional Attributes:
                        </h4>
                        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                          {guideline.optionalAttributes.map((attr, i) => (
                            <li key={i} style={{ fontSize: '0.875rem' }}>
                              {attr}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '1rem',
                        background: '#f0fdf4',
                        borderRadius: '6px',
                        marginBottom: '1rem',
                      }}
                    >
                      <h4 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '0.875rem', color: '#059669' }}>
                        ✓ Good Example:
                      </h4>
                      <code
                        style={{
                          display: 'block',
                          padding: '0.5rem',
                          background: 'white',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          fontFamily: 'monospace',
                          overflowX: 'auto',
                        }}
                      >
                        {guideline.examples.good}
                      </code>
                    </div>

                    {guideline.examples.bad && (
                      <div
                        style={{
                          padding: '1rem',
                          background: '#fef2f2',
                          borderRadius: '6px',
                          marginBottom: '1rem',
                        }}
                      >
                        <h4 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '0.875rem', color: '#dc2626' }}>
                          ✗ Bad Example:
                        </h4>
                        <code
                          style={{
                            display: 'block',
                            padding: '0.5rem',
                            background: 'white',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                            fontFamily: 'monospace',
                            overflowX: 'auto',
                          }}
                        >
                          {guideline.examples.bad}
                        </code>
                      </div>
                    )}

                    <div
                      style={{
                        padding: '0.75rem',
                        background: '#eff6ff',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                      }}
                    >
                      <strong>WCAG:</strong> {guideline.wcagCriteria}
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
              <h2 style={{ margin: 0, marginBottom: '1rem' }}>Test ARIA Labels</h2>

              <p style={{ margin: 0, marginBottom: '1.5rem', color: '#666' }}>
                Use the Labels tab to edit and test ARIA label validation. The system automatically
                checks for common issues and validates required attributes for specific roles.
              </p>

              <div
                style={{
                  padding: '1.5rem',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  marginBottom: '1.5rem',
                }}
              >
                <h3 style={{ margin: 0, marginBottom: '1rem' }}>Common Validation Checks</h3>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: 1.8 }}>
                  <li>Empty label values</li>
                  <li>Generic labels (button, link, click here)</li>
                  <li>Redundant role names in labels</li>
                  <li>Missing required attributes for specific roles</li>
                  <li>Invalid aria-live values</li>
                  <li>Invalid aria-current values</li>
                  <li>Missing aria-modal for dialogs</li>
                  <li>Incomplete progressbar attributes</li>
                </ul>
              </div>

              <div
                style={{
                  padding: '1.5rem',
                  background: '#eff6ff',
                  borderRadius: '8px',
                  border: '1px solid #3b82f6',
                }}
              >
                <h4 style={{ margin: 0, marginBottom: '0.5rem', color: '#1e40af' }}>
                  Best Practices
                </h4>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: 1.8, fontSize: '0.875rem' }}>
                  <li>Use semantic HTML elements when possible before adding ARIA</li>
                  <li>Don't use ARIA if native HTML semantics exist</li>
                  <li>All interactive elements must have accessible names</li>
                  <li>Keep labels concise but descriptive</li>
                  <li>Test with actual screen readers when possible</li>
                  <li>Validate dynamically added ARIA attributes</li>
                </ul>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AriaLabels;
