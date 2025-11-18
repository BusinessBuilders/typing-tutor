/**
 * Custom Messages Component
 * Step 210 - Build custom message system with voice playback
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useTextToSpeech } from './TextToSpeech';
import { useSettingsStore } from '../store/useSettingsStore';

// Message interface
interface CustomMessage {
  id: string;
  text: string;
  category: 'motivation' | 'instruction' | 'celebration' | 'reminder' | 'tip';
  isFavorite: boolean;
  createdAt: Date;
}

// Predefined message templates
const MESSAGE_TEMPLATES: Record<CustomMessage['category'], string[]> = {
  motivation: [
    'You can do this!',
    'Keep up the great work!',
    'Every practice makes you better!',
    'I believe in you!',
    'You\'re doing amazing!',
  ],
  instruction: [
    'Remember to place your fingers on the home row.',
    'Take your time, there\'s no rush.',
    'Look at the screen, not your keyboard.',
    'Use the correct finger for each key.',
    'Take a break if you need one.',
  ],
  celebration: [
    'Fantastic job!',
    'You did it! Well done!',
    'Amazing work today!',
    'I\'m so proud of you!',
    'What great progress!',
  ],
  reminder: [
    'Remember to sit up straight.',
    'Don\'t forget to take breaks.',
    'Keep your wrists relaxed.',
    'Breathe and stay calm.',
    'You\'re improving every day!',
  ],
  tip: [
    'Practice a little bit each day.',
    'Focus on accuracy before speed.',
    'It\'s okay to make mistakes.',
    'Everyone learns at their own pace.',
    'Celebrate small victories!',
  ],
};

// Custom hook for custom messages
export function useCustomMessages() {
  const [messages, setMessages] = useState<CustomMessage[]>([]);
  const { speak } = useTextToSpeech();

  const addMessage = (text: string, category: CustomMessage['category']) => {
    const message: CustomMessage = {
      id: Date.now().toString(),
      text,
      category,
      isFavorite: false,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const deleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const toggleFavorite = (id: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, isFavorite: !m.isFavorite } : m
      )
    );
  };

  const playMessage = (text: string) => {
    speak(text);
  };

  return {
    messages,
    addMessage,
    deleteMessage,
    toggleFavorite,
    playMessage,
  };
}

// Main custom messages component
export default function CustomMessages() {
  const {
    messages,
    addMessage,
    deleteMessage,
    toggleFavorite,
    playMessage,
  } = useCustomMessages();

  const { settings } = useSettingsStore();
  const [newMessage, setNewMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CustomMessage['category']>('motivation');
  const [showTemplates, setShowTemplates] = useState(false);

  const categories: Array<{
    value: CustomMessage['category'];
    label: string;
    icon: string;
    color: string;
  }> = [
    { value: 'motivation', label: 'Motivation', icon: '💪', color: 'bg-blue-100 text-blue-700' },
    { value: 'instruction', label: 'Instruction', icon: '📚', color: 'bg-purple-100 text-purple-700' },
    { value: 'celebration', label: 'Celebration', icon: '🎉', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'reminder', label: 'Reminder', icon: '⏰', color: 'bg-green-100 text-green-700' },
    { value: 'tip', label: 'Tip', icon: '💡', color: 'bg-orange-100 text-orange-700' },
  ];

  const handleAddMessage = () => {
    if (newMessage.trim()) {
      addMessage(newMessage.trim(), selectedCategory);
      setNewMessage('');
    }
  };

  const handleUseTemplate = (template: string) => {
    setNewMessage(template);
    setShowTemplates(false);
  };

  const favorites = messages.filter((m) => m.isFavorite);
  const byCategory = (category: CustomMessage['category']) =>
    messages.filter((m) => m.category === category);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Custom Messages
      </h2>

      {/* Create new message */}
      <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Create New Message
        </h3>

        <div className="mb-4">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none resize-none"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Category:
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map(({ value, label, icon, color }) => (
              <button
                key={value}
                onClick={() => setSelectedCategory(value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === value
                    ? 'bg-primary-500 text-white'
                    : `${color} hover:opacity-80`
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAddMessage}
            disabled={!newMessage.trim()}
            className="flex-1 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            💾 Save Message
          </button>

          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
          >
            📝 Templates
          </button>
        </div>

        {/* Templates */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-white rounded-lg p-4"
            >
              <h4 className="font-bold text-gray-900 mb-3">
                {categories.find((c) => c.value === selectedCategory)?.icon}{' '}
                {categories.find((c) => c.value === selectedCategory)?.label} Templates:
              </h4>
              <div className="space-y-2">
                {MESSAGE_TEMPLATES[selectedCategory].map((template, index) => (
                  <button
                    key={index}
                    onClick={() => handleUseTemplate(template)}
                    className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            ⭐ Favorites ({favorites.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {favorites.map((message, index) => (
              <MessageCard
                key={message.id}
                message={message}
                index={index}
                onPlay={playMessage}
                onToggleFavorite={toggleFavorite}
                onDelete={deleteMessage}
                settings={settings}
              />
            ))}
          </div>
        </div>
      )}

      {/* Messages by category */}
      {messages.length > 0 ? (
        <div>
          {categories.map(({ value, label, icon }) => {
            const categoryMessages = byCategory(value);
            if (categoryMessages.length === 0) return null;

            return (
              <div key={value} className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {icon} {label} ({categoryMessages.length})
                </h3>
                <div className="space-y-2">
                  {categoryMessages.map((message, index) => (
                    <MessageCard
                      key={message.id}
                      message={message}
                      index={index}
                      onPlay={playMessage}
                      onToggleFavorite={toggleFavorite}
                      onDelete={deleteMessage}
                      settings={settings}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">
          No custom messages yet. Create your first one above!
        </div>
      )}

      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">
          Message Ideas
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Create personalized encouragement for your child</li>
          <li>• Add specific instructions for difficult keys</li>
          <li>• Make celebration messages for achievements</li>
          <li>• Set up reminders for good typing posture</li>
          <li>• Share helpful tips and strategies</li>
        </ul>
      </div>
    </div>
  );
}

// Message card component
function MessageCard({
  message,
  index,
  onPlay,
  onToggleFavorite,
  onDelete,
  settings,
}: {
  message: CustomMessage;
  index: number;
  onPlay: (text: string) => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  settings: any;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: settings.reducedMotion ? 0 : index * 0.05 }}
      className="bg-gray-50 rounded-lg p-4 flex items-center justify-between gap-3"
    >
      <div className="flex-1">
        <p className="text-gray-900">{message.text}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onPlay(message.text)}
          className="px-3 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors"
          title="Play message"
        >
          🔊
        </button>

        <button
          onClick={() => onToggleFavorite(message.id)}
          className={`px-3 py-2 rounded-lg font-bold transition-colors ${
            message.isFavorite
              ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
          title={message.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {message.isFavorite ? '⭐' : '☆'}
        </button>

        <button
          onClick={() => {
            if (confirm('Delete this message?')) {
              onDelete(message.id);
            }
          }}
          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-colors"
          title="Delete message"
        >
          🗑️
        </button>
      </div>
    </motion.div>
  );
}
