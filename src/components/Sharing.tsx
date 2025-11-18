import { useState } from 'react';
import { motion } from 'framer-motion';

// Types
export type ShareType =
  | 'achievement'
  | 'progress'
  | 'score'
  | 'streak'
  | 'level'
  | 'certificate';

export type SharePlatform =
  | 'copy-link'
  | 'twitter'
  | 'facebook'
  | 'email'
  | 'download'
  | 'print';

export interface ShareContent {
  id: string;
  type: ShareType;
  title: string;
  description: string;
  stats?: {
    label: string;
    value: string | number;
    unit?: string;
  }[];
  image?: string;
  url?: string;
  timestamp: Date;
}

export interface ShareTemplate {
  id: string;
  type: ShareType;
  name: string;
  template: string;
  hashtags?: string[];
  includeStats: boolean;
  includeImage: boolean;
}

export interface ShareSettings {
  defaultPlatforms: SharePlatform[];
  includeStats: boolean;
  includeTimestamp: boolean;
  autoGenerateImage: boolean;
  watermark: boolean;
  privacy: 'public' | 'friends' | 'private';
}

export interface ShareHistory {
  shares: ShareContent[];
  totalShares: number;
  byType: Record<ShareType, number>;
  byPlatform: Record<SharePlatform, number>;
  mostShared?: ShareContent;
}

// Mock data generators
function generateShareTemplates(): ShareTemplate[] {
  return [
    {
      id: 'tpl-1',
      type: 'achievement',
      name: 'Achievement Unlocked',
      template: '🎉 I just unlocked the "{title}" achievement! {description} #TypingTutor #Achievement',
      hashtags: ['TypingTutor', 'Achievement'],
      includeStats: true,
      includeImage: true,
    },
    {
      id: 'tpl-2',
      type: 'progress',
      name: 'Progress Update',
      template: '📈 My typing progress: {stats}! Keep improving every day. #TypingProgress',
      hashtags: ['TypingProgress', 'Learning'],
      includeStats: true,
      includeImage: false,
    },
    {
      id: 'tpl-3',
      type: 'score',
      name: 'High Score',
      template: '🎯 New personal best: {stats}! #TypingMaster',
      hashtags: ['TypingMaster', 'PersonalBest'],
      includeStats: true,
      includeImage: true,
    },
    {
      id: 'tpl-4',
      type: 'streak',
      name: 'Streak Milestone',
      template: '🔥 {stats} day streak! Consistency is key! #DailyPractice',
      hashtags: ['DailyPractice', 'Dedication'],
      includeStats: true,
      includeImage: false,
    },
    {
      id: 'tpl-5',
      type: 'level',
      name: 'Level Up',
      template: '⭐ Leveled up to {title}! The journey continues! #LevelUp',
      hashtags: ['LevelUp', 'Progress'],
      includeStats: true,
      includeImage: true,
    },
  ];
}

function generateShareContent(): ShareContent[] {
  return [
    {
      id: 'share-1',
      type: 'achievement',
      title: 'Speed Demon',
      description: 'Reached 50 WPM typing speed',
      stats: [
        { label: 'Speed', value: 50, unit: 'WPM' },
        { label: 'Accuracy', value: 95, unit: '%' },
      ],
      timestamp: new Date(),
    },
    {
      id: 'share-2',
      type: 'streak',
      title: '10 Day Streak',
      description: 'Practiced for 10 consecutive days',
      stats: [
        { label: 'Current Streak', value: 10, unit: 'days' },
        { label: 'Longest Streak', value: 14, unit: 'days' },
      ],
      timestamp: new Date(Date.now() - 86400000),
    },
    {
      id: 'share-3',
      type: 'level',
      title: 'Level 6 Achieved',
      description: 'Skilled Typist level unlocked',
      stats: [
        { label: 'Current Level', value: 6 },
        { label: 'Total XP', value: 2350, unit: 'XP' },
      ],
      timestamp: new Date(Date.now() - 172800000),
    },
    {
      id: 'share-4',
      type: 'score',
      title: 'Perfect Score',
      description: '100% accuracy on advanced lesson',
      stats: [
        { label: 'Accuracy', value: 100, unit: '%' },
        { label: 'Speed', value: 45, unit: 'WPM' },
      ],
      timestamp: new Date(Date.now() - 259200000),
    },
  ];
}

function generateShareHistory(): ShareHistory {
  const shares = generateShareContent();

  return {
    shares,
    totalShares: 23,
    byType: {
      achievement: 8,
      progress: 5,
      score: 4,
      streak: 3,
      level: 2,
      certificate: 1,
    },
    byPlatform: {
      'copy-link': 10,
      twitter: 6,
      facebook: 3,
      email: 2,
      download: 1,
      print: 1,
    },
    mostShared: shares[0],
  };
}

// Custom hook
function useSharing() {
  const [templates] = useState<ShareTemplate[]>(generateShareTemplates());
  const [shareContent] = useState<ShareContent[]>(generateShareContent());
  const [history, setHistory] = useState<ShareHistory>(generateShareHistory());
  const [settings, setSettings] = useState<ShareSettings>({
    defaultPlatforms: ['copy-link', 'twitter', 'facebook'],
    includeStats: true,
    includeTimestamp: false,
    autoGenerateImage: true,
    watermark: true,
    privacy: 'public',
  });
  const [selectedContent, setSelectedContent] = useState<ShareContent | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const generateShareText = (content: ShareContent, template?: ShareTemplate) => {
    const tpl = template || templates.find((t) => t.type === content.type);
    if (!tpl) return `${content.title}: ${content.description}`;

    let text = tpl.template;
    text = text.replace('{title}', content.title);
    text = text.replace('{description}', content.description);

    if (tpl.includeStats && content.stats) {
      const statsText = content.stats
        .map((s) => `${s.label}: ${s.value}${s.unit || ''}`)
        .join(', ');
      text = text.replace('{stats}', statsText);
    }

    return text;
  };

  const share = (content: ShareContent, platform: SharePlatform) => {
    const text = generateShareText(content);

    switch (platform) {
      case 'copy-link':
        navigator.clipboard.writeText(text);
        setCopiedToClipboard(true);
        setTimeout(() => setCopiedToClipboard(false), 3000);
        break;

      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
          '_blank'
        );
        break;

      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            content.url || window.location.href
          )}`,
          '_blank'
        );
        break;

      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(
          content.title
        )}&body=${encodeURIComponent(text)}`;
        break;

      case 'download':
        downloadAsImage(content);
        break;

      case 'print':
        window.print();
        break;
    }

    // Update history
    setHistory((prev) => ({
      ...prev,
      totalShares: prev.totalShares + 1,
      byType: {
        ...prev.byType,
        [content.type]: (prev.byType[content.type] || 0) + 1,
      },
      byPlatform: {
        ...prev.byPlatform,
        [platform]: (prev.byPlatform[platform] || 0) + 1,
      },
    }));
  };

  const downloadAsImage = (content: ShareContent) => {
    // This would generate an image from the content
    // For now, just log it
    console.log('Downloading image for:', content);
  };

  const openShareModal = (content: ShareContent) => {
    setSelectedContent(content);
    setShowShareModal(true);
  };

  const closeShareModal = () => {
    setSelectedContent(null);
    setShowShareModal(false);
  };

  const updateSettings = (newSettings: Partial<ShareSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return {
    templates,
    shareContent,
    history,
    settings,
    selectedContent,
    showShareModal,
    copiedToClipboard,
    generateShareText,
    share,
    openShareModal,
    closeShareModal,
    updateSettings,
  };
}

// Share button component
function ShareButton({
  platform,
  onClick,
}: {
  platform: SharePlatform;
  onClick: () => void;
}) {
  const platformInfo: Record<
    SharePlatform,
    { icon: string; label: string; color: string }
  > = {
    'copy-link': { icon: '🔗', label: 'Copy Link', color: 'gray' },
    twitter: { icon: '🐦', label: 'Twitter', color: 'blue' },
    facebook: { icon: '📘', label: 'Facebook', color: 'indigo' },
    email: { icon: '✉️', label: 'Email', color: 'red' },
    download: { icon: '⬇️', label: 'Download', color: 'green' },
    print: { icon: '🖨️', label: 'Print', color: 'purple' },
  };

  const info = platformInfo[platform];

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 bg-${info.color}-50 hover:bg-${info.color}-100 text-${info.color}-700 rounded-lg transition-colors`}
      style={{
        backgroundColor: `var(--${info.color}-50, #f3f4f6)`,
      }}
    >
      <span className="text-2xl">{info.icon}</span>
      <span className="font-medium">{info.label}</span>
    </button>
  );
}

// Share modal component
function ShareModal({
  content,
  onClose,
  onShare,
}: {
  content: ShareContent;
  onClose: () => void;
  onShare: (platform: SharePlatform) => void;
}) {
  const platforms: SharePlatform[] = [
    'copy-link',
    'twitter',
    'facebook',
    'email',
    'download',
    'print',
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl p-8 max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold">Share Your Achievement</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content preview */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl mb-6">
          <div className="text-center">
            <div className="text-5xl mb-4">
              {content.type === 'achievement' && '🎉'}
              {content.type === 'streak' && '🔥'}
              {content.type === 'level' && '⭐'}
              {content.type === 'score' && '🎯'}
              {content.type === 'progress' && '📈'}
              {content.type === 'certificate' && '🏆'}
            </div>
            <h3 className="text-2xl font-bold mb-2">{content.title}</h3>
            <p className="text-gray-700 mb-4">{content.description}</p>

            {content.stats && content.stats.length > 0 && (
              <div className="flex justify-center gap-4">
                {content.stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white px-4 py-2 rounded-lg shadow-sm"
                  >
                    <div className="text-2xl font-bold text-purple-600">
                      {stat.value}
                      {stat.unit && <span className="text-sm ml-1">{stat.unit}</span>}
                    </div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {platforms.map((platform) => (
            <ShareButton
              key={platform}
              platform={platform}
              onClick={() => {
                onShare(platform);
                if (platform !== 'copy-link') {
                  onClose();
                }
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Main component
export default function Sharing() {
  const {
    shareContent,
    history,
    settings,
    selectedContent,
    showShareModal,
    copiedToClipboard,
    generateShareText,
    share,
    openShareModal,
    closeShareModal,
    updateSettings,
  } = useSharing();

  const [activeTab, setActiveTab] = useState<'share' | 'history' | 'settings'>('share');

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Share Your Progress</h1>
        <p className="text-gray-600">
          Share your achievements and milestones with others
        </p>
      </div>

      {/* Copied notification */}
      {copiedToClipboard && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
        >
          ✓ Copied to clipboard!
        </motion.div>
      )}

      {/* Share modal */}
      {showShareModal && selectedContent && (
        <ShareModal
          content={selectedContent}
          onClose={closeShareModal}
          onShare={(platform) => share(selectedContent, platform)}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {history.totalShares}
          </div>
          <div className="text-sm text-gray-600">Total Shares</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {(() => {
              let maxType: string = 'achievement';
              let maxCount = 0;
              Object.entries(history.byType).forEach(([type, count]) => {
                if (count > maxCount) {
                  maxCount = count;
                  maxType = type;
                }
              });
              return maxType;
            })()}
          </div>
          <div className="text-sm text-gray-600">Most Shared Type</div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="text-3xl font-bold text-green-600 mb-1">
            {(() => {
              let maxPlatform: string = 'copy-link';
              let maxCount = 0;
              Object.entries(history.byPlatform).forEach(([platform, count]) => {
                if (count > maxCount) {
                  maxCount = count;
                  maxPlatform = platform;
                }
              });
              return maxPlatform.replace('-', ' ');
            })()}
          </div>
          <div className="text-sm text-gray-600">Favorite Platform</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {(['share', 'history', 'settings'] as const).map((tab) => (
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

      {/* Share Tab */}
      {activeTab === 'share' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shareContent.map((content) => (
            <div key={content.id} className="bg-white p-6 rounded-lg border">
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold">{content.title}</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {content.type}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{content.description}</p>

                {content.stats && content.stats.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {content.stats.map((stat, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 px-3 py-2 rounded text-center"
                      >
                        <div className="font-bold text-lg">
                          {stat.value}
                          {stat.unit && <span className="text-sm ml-1">{stat.unit}</span>}
                        </div>
                        <div className="text-xs text-gray-600">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openShareModal(content)}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                >
                  Share
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateShareText(content));
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  📋
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* By type breakdown */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Shares by Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(history.byType).map(([type, count]) => (
                <div key={type} className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">{type}</div>
                </div>
              ))}
            </div>
          </div>

          {/* By platform breakdown */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Shares by Platform</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(history.byPlatform).map(([platform, count]) => (
                <div key={platform} className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{count}</div>
                  <div className="text-sm text-gray-600 capitalize">
                    {platform.replace('-', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-lg border space-y-6">
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.includeStats}
                onChange={(e) => updateSettings({ includeStats: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <div className="font-medium">Include Statistics</div>
                <div className="text-sm text-gray-600">
                  Show stats when sharing achievements
                </div>
              </div>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.includeTimestamp}
                onChange={(e) => updateSettings({ includeTimestamp: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <div className="font-medium">Include Timestamp</div>
                <div className="text-sm text-gray-600">
                  Add date and time to shared content
                </div>
              </div>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoGenerateImage}
                onChange={(e) =>
                  updateSettings({ autoGenerateImage: e.target.checked })
                }
                className="w-5 h-5"
              />
              <div>
                <div className="font-medium">Auto-generate Images</div>
                <div className="text-sm text-gray-600">
                  Create shareable images automatically
                </div>
              </div>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.watermark}
                onChange={(e) => updateSettings({ watermark: e.target.checked })}
                className="w-5 h-5"
              />
              <div>
                <div className="font-medium">Add Watermark</div>
                <div className="text-sm text-gray-600">
                  Include app branding on shared images
                </div>
              </div>
            </label>
          </div>

          <div>
            <label className="block mb-2 font-medium">Privacy</label>
            <select
              value={settings.privacy}
              onChange={(e) =>
                updateSettings({ privacy: e.target.value as 'public' | 'friends' | 'private' })
              }
              className="border rounded px-3 py-2 w-full max-w-xs"
            >
              <option value="public">Public - Anyone can see</option>
              <option value="friends">Friends - Only friends can see</option>
              <option value="private">Private - Only me</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
