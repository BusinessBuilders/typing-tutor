/**
 * PDF Export Component
 * Step 253 - Add PDF export functionality for reports
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Export format
export type ExportFormat = 'pdf' | 'csv' | 'json' | 'html';

// Export template
export type ExportTemplate = 'standard' | 'detailed' | 'summary' | 'custom';

// Export options
export interface ExportOptions {
  format: ExportFormat;
  template: ExportTemplate;
  includeCharts: boolean;
  includeStats: boolean;
  includeAchievements: boolean;
  includeTimeline: boolean;
  includeRecommendations: boolean;
  dateRange: {
    start: Date;
    end: Date;
  };
  watermark: boolean;
  colorMode: 'color' | 'grayscale';
  pageSize: 'letter' | 'a4' | 'legal';
  orientation: 'portrait' | 'landscape';
}

// Export section
export interface ExportSection {
  id: string;
  name: string;
  description: string;
  icon: string;
  included: boolean;
  required: boolean;
}

// PDF preview data
export interface PDFPreviewData {
  title: string;
  subtitle: string;
  generatedDate: string;
  pageCount: number;
  sections: string[];
}

// Mock export sections
const generateMockSections = (): ExportSection[] => {
  return [
    {
      id: 'header',
      name: 'Report Header',
      description: 'Title, date, and user information',
      icon: '📋',
      included: true,
      required: true,
    },
    {
      id: 'summary',
      name: 'Executive Summary',
      description: 'Quick overview of key metrics',
      icon: '📊',
      included: true,
      required: false,
    },
    {
      id: 'stats',
      name: 'Detailed Statistics',
      description: 'Comprehensive performance metrics',
      icon: '📈',
      included: true,
      required: false,
    },
    {
      id: 'charts',
      name: 'Visual Charts',
      description: 'Graphs and visualizations',
      icon: '📉',
      included: true,
      required: false,
    },
    {
      id: 'achievements',
      name: 'Achievements',
      description: 'Earned badges and milestones',
      icon: '🏆',
      included: true,
      required: false,
    },
    {
      id: 'timeline',
      name: 'Progress Timeline',
      description: 'Chronological progress events',
      icon: '📅',
      included: false,
      required: false,
    },
    {
      id: 'recommendations',
      name: 'Recommendations',
      description: 'Personalized improvement suggestions',
      icon: '💡',
      included: true,
      required: false,
    },
    {
      id: 'footer',
      name: 'Report Footer',
      description: 'Page numbers and generation info',
      icon: '📄',
      included: true,
      required: true,
    },
  ];
};

// Mock preview data
const generateMockPreview = (sections: ExportSection[]): PDFPreviewData => {
  const includedSections = sections.filter((s) => s.included);

  return {
    title: 'Typing Progress Report',
    subtitle: 'Weekly Performance Summary',
    generatedDate: new Date().toLocaleDateString(),
    pageCount: Math.ceil(includedSections.length / 2) + 1,
    sections: includedSections.map((s) => s.name),
  };
};

// Custom hook for PDF export
export function usePDFExport() {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    template: 'standard',
    includeCharts: true,
    includeStats: true,
    includeAchievements: true,
    includeTimeline: false,
    includeRecommendations: true,
    dateRange: {
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date(),
    },
    watermark: false,
    colorMode: 'color',
    pageSize: 'letter',
    orientation: 'portrait',
  });

  const [sections, setSections] = useState<ExportSection[]>(generateMockSections());
  const [isExporting, setIsExporting] = useState(false);

  const updateOption = <K extends keyof ExportOptions>(key: K, value: ExportOptions[K]) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSection = (sectionId: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId && !section.required
          ? { ...section, included: !section.included }
          : section
      )
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsExporting(false);
    return true;
  };

  const getPreviewData = () => generateMockPreview(sections);

  return {
    options,
    updateOption,
    sections,
    toggleSection,
    isExporting,
    handleExport,
    previewData: getPreviewData(),
  };
}

// Main PDF export component
export default function PDFExport() {
  const {
    options,
    updateOption,
    sections,
    toggleSection,
    isExporting,
    handleExport,
    previewData,
  } = usePDFExport();

  const { settings } = useSettingsStore();

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        📄 Export to PDF
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column - Options */}
        <div className="space-y-6">
          {/* Format selection */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Export Format</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { format: 'pdf' as const, label: 'PDF Document', icon: '📄' },
                { format: 'csv' as const, label: 'CSV Data', icon: '📊' },
                { format: 'json' as const, label: 'JSON Data', icon: '📋' },
                { format: 'html' as const, label: 'HTML Page', icon: '🌐' },
              ].map(({ format, label, icon }) => (
                <button
                  key={format}
                  onClick={() => updateOption('format', format)}
                  className={`px-4 py-3 rounded-lg font-bold transition-colors ${
                    options.format === format
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Template selection */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Report Template</h3>
            <div className="space-y-2">
              {[
                { template: 'standard' as const, label: 'Standard Report', desc: 'Balanced overview with key metrics' },
                { template: 'detailed' as const, label: 'Detailed Analysis', desc: 'Comprehensive data and charts' },
                { template: 'summary' as const, label: 'Executive Summary', desc: 'High-level overview only' },
                { template: 'custom' as const, label: 'Custom Selection', desc: 'Choose specific sections' },
              ].map(({ template, label, desc }) => (
                <motion.button
                  key={template}
                  whileHover={{ scale: settings.reducedMotion ? 1 : 1.02 }}
                  onClick={() => updateOption('template', template)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    options.template === template
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="font-bold">{label}</div>
                  <div className={`text-sm ${options.template === template ? 'opacity-90' : 'opacity-70'}`}>
                    {desc}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* PDF-specific options */}
          {options.format === 'pdf' && (
            <>
              {/* Page settings */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Page Settings</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-bold text-gray-700 mb-2">Page Size</div>
                    <div className="flex gap-2">
                      {[
                        { size: 'letter' as const, label: 'Letter' },
                        { size: 'a4' as const, label: 'A4' },
                        { size: 'legal' as const, label: 'Legal' },
                      ].map(({ size, label }) => (
                        <button
                          key={size}
                          onClick={() => updateOption('pageSize', size)}
                          className={`flex-1 px-3 py-2 rounded-lg font-bold transition-colors ${
                            options.pageSize === size
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-bold text-gray-700 mb-2">Orientation</div>
                    <div className="flex gap-2">
                      {[
                        { orientation: 'portrait' as const, label: 'Portrait', icon: '📄' },
                        { orientation: 'landscape' as const, label: 'Landscape', icon: '📃' },
                      ].map(({ orientation, label, icon }) => (
                        <button
                          key={orientation}
                          onClick={() => updateOption('orientation', orientation)}
                          className={`flex-1 px-3 py-2 rounded-lg font-bold transition-colors ${
                            options.orientation === orientation
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {icon} {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-bold text-gray-700 mb-2">Color Mode</div>
                    <div className="flex gap-2">
                      {[
                        { mode: 'color' as const, label: 'Color', icon: '🎨' },
                        { mode: 'grayscale' as const, label: 'Grayscale', icon: '⚫' },
                      ].map(({ mode, label, icon }) => (
                        <button
                          key={mode}
                          onClick={() => updateOption('colorMode', mode)}
                          className={`flex-1 px-3 py-2 rounded-lg font-bold transition-colors ${
                            options.colorMode === mode
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {icon} {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sections to include */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Include Sections</h3>
                <div className="space-y-2">
                  {sections.map((section) => (
                    <div
                      key={section.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        section.included ? 'bg-green-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{section.icon}</div>
                        <div>
                          <div className="font-bold text-gray-900">{section.name}</div>
                          <div className="text-sm text-gray-600">{section.description}</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={section.included}
                          disabled={section.required}
                          onChange={() => toggleSection(section.id)}
                        />
                        <div className={`w-11 h-6 rounded-full peer ${
                          section.required ? 'bg-gray-400' : 'bg-gray-200'
                        } peer-checked:bg-green-500 peer-focus:ring-2 peer-focus:ring-green-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full`} />
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional options */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Additional Options</h3>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                    <span className="font-bold text-gray-900">Add Watermark</span>
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500"
                      checked={options.watermark}
                      onChange={(e) => updateOption('watermark', e.target.checked)}
                    />
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right column - Preview */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Preview</h3>
            <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
              <div className="bg-white shadow-xl rounded-lg p-8 mb-4">
                <div className="text-center mb-6">
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {previewData.title}
                  </div>
                  <div className="text-lg text-gray-600 mb-1">
                    {previewData.subtitle}
                  </div>
                  <div className="text-sm text-gray-500">
                    Generated: {previewData.generatedDate}
                  </div>
                </div>

                <div className="space-y-4">
                  {previewData.sections.map((section, index) => (
                    <motion.div
                      key={section}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <div className="font-bold text-gray-900">{section}</div>
                      <div className="h-2 bg-gray-200 rounded mt-2" />
                      <div className="h-2 bg-gray-200 rounded mt-1 w-3/4" />
                    </motion.div>
                  ))}
                </div>

                <div className="text-center mt-6 text-sm text-gray-500">
                  Page 1 of {previewData.pageCount}
                </div>
              </div>

              <div className="text-sm text-gray-600 text-center">
                Format: {options.format.toUpperCase()} •
                {options.format === 'pdf' && ` ${options.pageSize.toUpperCase()} ${options.orientation} •`}
                {' '}{previewData.sections.length} sections
              </div>
            </div>
          </div>

          {/* Export button */}
          <div>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className={`w-full px-6 py-4 rounded-xl font-bold text-white text-lg transition-all ${
                isExporting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
              }`}
            >
              {isExporting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  Generating {options.format.toUpperCase()}...
                </span>
              ) : (
                `Export as ${options.format.toUpperCase()}`
              )}
            </button>
          </div>

          {/* Info box */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <div className="font-bold text-blue-900 mb-1">Export Tips</div>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• PDF exports include all selected sections and charts</li>
                  <li>• Use landscape orientation for wider charts</li>
                  <li>• Grayscale mode is better for printing</li>
                  <li>• Required sections cannot be deselected</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
