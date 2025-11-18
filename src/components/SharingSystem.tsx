/**
 * Sharing System Component
 * Step 237 - Create sharing system for collections and achievements
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Share types
export type ShareType =
  | 'collection'
  | 'achievement'
  | 'room'
  | 'progress'
  | 'sticker'
  | 'card';

// Share interface
export interface ShareData {
  id: string;
  type: ShareType;
  title: string;
  description: string;
  data: any; // The actual data being shared
  shareUrl: string;
  shareCode: string;
  createdAt: Date;
  views: number;
  likes: number;
}

// Share template
export interface ShareTemplate {
  id: string;
  type: ShareType;
  name: string;
  icon: string;
  description: string;
  backgroundColor: string;
  layout: 'card' | 'grid' | 'showcase';
}

// Share templates
const SHARE_TEMPLATES: ShareTemplate[] = [
  {
    id: 'collection_grid',
    type: 'collection',
    name: 'Collection Grid',
    icon: '📱',
    description: 'Show your collection in a clean grid',
    backgroundColor: 'from-purple-400 to-pink-500',
    layout: 'grid',
  },
  {
    id: 'achievement_card',
    type: 'achievement',
    name: 'Achievement Card',
    icon: '🏆',
    description: 'Highlight your latest achievement',
    backgroundColor: 'from-yellow-400 to-orange-500',
    layout: 'card',
  },
  {
    id: 'room_showcase',
    type: 'room',
    name: 'Room Showcase',
    icon: '🎨',
    description: 'Share your decorated room',
    backgroundColor: 'from-blue-400 to-cyan-500',
    layout: 'showcase',
  },
  {
    id: 'progress_stats',
    type: 'progress',
    name: 'Progress Stats',
    icon: '📊',
    description: 'Show your typing progress',
    backgroundColor: 'from-green-400 to-teal-500',
    layout: 'card',
  },
  {
    id: 'sticker_highlight',
    type: 'sticker',
    name: 'Sticker Highlight',
    icon: '⭐',
    description: 'Highlight a special sticker',
    backgroundColor: 'from-pink-400 to-red-500',
    layout: 'showcase',
  },
  {
    id: 'card_display',
    type: 'card',
    name: 'Trading Card',
    icon: '🎴',
    description: 'Display your trading card',
    backgroundColor: 'from-indigo-400 to-purple-500',
    layout: 'card',
  },
];

// Custom hook for sharing
export function useSharingSystem() {
  const [shares, setShares] = useState<ShareData[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [currentShare, setCurrentShare] = useState<ShareData | null>(null);

  const createShare = (type: ShareType, title: string, description: string, data: any) => {
    const shareCode = generateShareCode();
    const shareUrl = `https://typing-tutor.app/share/${shareCode}`;

    const newShare: ShareData = {
      id: Date.now().toString(),
      type,
      title,
      description,
      data,
      shareUrl,
      shareCode,
      createdAt: new Date(),
      views: 0,
      likes: 0,
    };

    setShares((prev) => [newShare, ...prev]);
    setCurrentShare(newShare);
    return newShare;
  };

  const deleteShare = (shareId: string) => {
    setShares((prev) => prev.filter((s) => s.id !== shareId));
    if (currentShare?.id === shareId) {
      setCurrentShare(null);
    }
  };

  const copyShareUrl = (share: ShareData) => {
    navigator.clipboard.writeText(share.shareUrl);
    return true;
  };

  const copyShareCode = (share: ShareData) => {
    navigator.clipboard.writeText(share.shareCode);
    return true;
  };

  return {
    shares,
    isCreating,
    setIsCreating,
    currentShare,
    setCurrentShare,
    createShare,
    deleteShare,
    copyShareUrl,
    copyShareCode,
  };
}

// Generate random share code
function generateShareCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Main sharing system component
export default function SharingSystem() {
  const {
    shares,
    isCreating,
    setIsCreating,
    currentShare,
    setCurrentShare,
    createShare,
    deleteShare,
    copyShareUrl,
    copyShareCode,
  } = useSharingSystem();

  const { settings } = useSettingsStore();
  const [selectedTemplate, setSelectedTemplate] = useState<ShareTemplate | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyUrl = (share: ShareData) => {
    copyShareUrl(share);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyCode = (share: ShareData) => {
    copyShareCode(share);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCreateShare = () => {
    if (!selectedTemplate) return;

    // Mock data based on template type
    const mockData = {
      collection: { stickers: 24, rarity: 'epic' },
      achievement: { name: 'Speed Master', level: 10 },
      room: { theme: 'Space', stickers: 15 },
      progress: { wpm: 85, accuracy: 96, level: 42 },
      sticker: { name: 'Rainbow Star', emoji: '🌟', rarity: 'legendary' },
      card: { name: 'Typing Dragon', power: 100 },
    };

    createShare(
      selectedTemplate.type,
      `My ${selectedTemplate.name}`,
      'Check out my progress!',
      mockData[selectedTemplate.type]
    );

    setSelectedTemplate(null);
    setIsCreating(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        📤 Share Your Progress
      </h2>

      {/* Create share button */}
      <div className="mb-8 text-center">
        <button
          onClick={() => setIsCreating(true)}
          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl font-bold rounded-2xl hover:scale-105 transition-transform shadow-xl"
        >
          ✨ Create Share
        </button>
      </div>

      {/* Your shares */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Your Shares</h3>
        {shares.length > 0 ? (
          <div className="space-y-4">
            {shares.map((share, index) => (
              <motion.div
                key={share.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-lg font-bold text-gray-900 mb-1">
                      {share.title}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {share.description}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>👁️ {share.views} views</span>
                      <span>❤️ {share.likes} likes</span>
                      <span>📅 {share.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteShare(share.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors"
                  >
                    🗑️
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={share.shareUrl}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm"
                    />
                    <button
                      onClick={() => handleCopyUrl(share)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-colors"
                    >
                      {copiedUrl ? '✓' : '📋'}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={`Code: ${share.shareCode}`}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-mono"
                    />
                    <button
                      onClick={() => handleCopyCode(share)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors"
                    >
                      {copiedCode ? '✓' : '🔗'}
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setCurrentShare(share)}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600 transition-colors"
                  >
                    👁️ Preview
                  </button>
                  <button className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-colors">
                    📊 View Stats
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl text-gray-500">
            <div className="text-6xl mb-4">📤</div>
            <div className="text-xl font-bold">No Shares Yet</div>
            <div>Create your first share to get started!</div>
          </div>
        )}
      </div>

      {/* Social sharing options */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          Share Features
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Generate unique share links and codes</li>
          <li>• Track views and likes on your shares</li>
          <li>• Multiple share templates for different content</li>
          <li>• Easy copy-paste sharing</li>
          <li>• Preview before sharing</li>
        </ul>
      </div>

      {/* Template selection modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsCreating(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Choose Share Template
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {SHARE_TEMPLATES.map((template, index) => (
                  <motion.button
                    key={template.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
                    onClick={() => setSelectedTemplate(template)}
                    className={`
                      p-6 rounded-2xl text-white transition-all
                      bg-gradient-to-br ${template.backgroundColor}
                      ${selectedTemplate?.id === template.id
                        ? 'ring-4 ring-white ring-offset-4 scale-105'
                        : 'hover:scale-105'
                      }
                    `}
                  >
                    <div className="text-6xl mb-3">{template.icon}</div>
                    <div className="text-xl font-bold mb-2">{template.name}</div>
                    <div className="text-sm opacity-90">{template.description}</div>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleCreateShare}
                  disabled={!selectedTemplate}
                  className={`
                    flex-1 py-4 rounded-xl font-bold text-xl transition-colors
                    ${selectedTemplate
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  ✨ Create Share
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setSelectedTemplate(null);
                  }}
                  className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview modal */}
      <AnimatePresence>
        {currentShare && (
          <SharePreviewModal
            share={currentShare}
            onClose={() => setCurrentShare(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Share preview modal
function SharePreviewModal({
  share,
  onClose,
}: {
  share: ShareData;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, rotateY: -180 }}
        animate={{ scale: 1, rotateY: 0 }}
        exit={{ scale: 0.5, rotateY: 180 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Share Preview
        </h3>

        {/* Mock share card */}
        <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-8 mb-6">
          <div className="text-center">
            <div className="text-6xl mb-4">
              {share.type === 'collection' && '📚'}
              {share.type === 'achievement' && '🏆'}
              {share.type === 'room' && '🎨'}
              {share.type === 'progress' && '📊'}
              {share.type === 'sticker' && '⭐'}
              {share.type === 'card' && '🎴'}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {share.title}
            </div>
            <div className="text-lg text-gray-600 mb-6">
              {share.description}
            </div>

            {/* Mock data display */}
            <div className="bg-white bg-opacity-50 rounded-xl p-6">
              <pre className="text-sm text-gray-800">
                {JSON.stringify(share.data, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Share info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-sm text-gray-600 mb-1">Views</div>
            <div className="text-2xl font-bold text-blue-600">
              👁️ {share.views}
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="text-sm text-gray-600 mb-1">Likes</div>
            <div className="text-2xl font-bold text-red-600">
              ❤️ {share.likes}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-xl hover:scale-105 transition-transform"
        >
          Close Preview
        </button>
      </motion.div>
    </motion.div>
  );
}
