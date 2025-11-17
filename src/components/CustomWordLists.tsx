/**
 * Custom Word Lists Component
 * Step 170 - Support for custom word lists
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export interface CustomWordList {
  id: string;
  name: string;
  words: string[];
  description?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  createdAt: Date;
}

export interface CustomWordListsProps {
  lists?: CustomWordList[];
  onSelectList?: (list: CustomWordList) => void;
  onCreateList?: (list: Omit<CustomWordList, 'id' | 'createdAt'>) => void;
}

export default function CustomWordLists({
  lists = [],
  onSelectList,
  onCreateList,
}: CustomWordListsProps) {
  const { settings } = useSettingsStore();
  const [showCreateForm, setShowCreateForm] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          My Word Lists
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-colors"
        >
          + New List
        </button>
      </div>

      {/* Word lists */}
      {lists.length > 0 ? (
        <div className="space-y-4">
          {lists.map((list, index) => (
            <motion.button
              key={list.id}
              onClick={() => onSelectList?.(list)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: settings.reducedMotion ? 0 : index * 0.1,
              }}
              whileHover={{ scale: settings.reducedMotion ? 1 : 1.02 }}
              className="w-full bg-gray-50 hover:bg-primary-50 rounded-xl p-6 text-left transition-colors border-2 border-transparent hover:border-primary-500"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {list.name}
                  </h3>
                  {list.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {list.description}
                    </p>
                  )}
                  <div className="flex gap-2 text-xs text-gray-500">
                    <span>{list.words.length} words</span>
                    {list.difficulty && (
                      <span className={`px-2 py-0.5 rounded ${
                        list.difficulty === 'easy'
                          ? 'bg-green-100 text-green-700'
                          : list.difficulty === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {list.difficulty}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-primary-600 text-2xl">→</div>
              </div>
            </motion.button>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">📝</div>
          <p>No custom word lists yet.</p>
          <p className="text-sm">Create one to get started!</p>
        </div>
      )}

      {/* Create form modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Create New Word List
              </h3>
              <CreateWordListForm
                onSubmit={(list) => {
                  onCreateList?.(list);
                  setShowCreateForm(false);
                }}
                onCancel={() => setShowCreateForm(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Create word list form
function CreateWordListForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (list: Omit<CustomWordList, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [wordsInput, setWordsInput] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const words = wordsInput
      .split(/[,\n]/)
      .map(w => w.trim())
      .filter(w => w.length > 0);

    if (name && words.length > 0) {
      onSubmit({
        name,
        description: description || undefined,
        words,
        difficulty,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          List Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Word List"
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Description (optional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this list for?"
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Difficulty
        </label>
        <div className="flex gap-2">
          {(['easy', 'medium', 'hard'] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setDifficulty(level)}
              className={`flex-1 py-2 rounded-lg font-bold capitalize ${
                difficulty === level
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Words (comma or newline separated)
        </label>
        <textarea
          value={wordsInput}
          onChange={(e) => setWordsInput(e.target.value)}
          placeholder="cat, dog, bird&#10;or one per line"
          rows={6}
          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none font-mono"
          required
        />
        <div className="text-xs text-gray-500 mt-1">
          {wordsInput.split(/[,\n]/).filter(w => w.trim()).length} words
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-3 bg-primary-500 text-white rounded-lg font-bold hover:bg-primary-600 transition-colors"
        >
          Create List
        </button>
      </div>
    </form>
  );
}

// Practice with custom list
export function CustomListPractice({ list }: { list: CustomWordList }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [correct, setCorrect] = useState(0);

  const currentWord = list.words[currentIndex];

  // TODO: Connect to keyboard input
  // @ts-expect-error - Function will be used when keyboard input is implemented
  const handleKeyPress = (key: string) => {
    if (key === 'Backspace') {
      setTyped(typed.slice(0, -1));
      return;
    }

    const newTyped = typed + key.toLowerCase();

    if (newTyped === currentWord.toLowerCase()) {
      setCorrect(correct + 1);
      setTyped('');

      if (currentIndex < list.words.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    } else if (currentWord.toLowerCase().startsWith(newTyped)) {
      setTyped(newTyped);
    }
  };

  const progress = ((currentIndex + 1) / list.words.length) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
        {list.name}
      </h2>
      {list.description && (
        <p className="text-gray-600 text-center mb-6">{list.description}</p>
      )}

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{currentIndex + 1} / {list.words.length}</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            className="h-full bg-primary-500"
          />
        </div>
      </div>

      {/* Current word */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 mb-6 text-center"
        >
          <div className="text-6xl font-bold text-white">
            {currentWord}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Typing area */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="text-4xl font-mono text-center min-h-[60px]">
          {typed.split('').map((char, index) => (
            <span
              key={index}
              className={char === currentWord[index]?.toLowerCase() ? 'text-success-600' : 'text-red-600'}
            >
              {char}
            </span>
          ))}
          <span className="animate-pulse">|</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-success-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-success-700">{correct}</div>
          <div className="text-sm text-gray-600">Correct</div>
        </div>
        <div className="bg-primary-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-primary-700">
            {Math.round((correct / (currentIndex + 1)) * 100)}%
          </div>
          <div className="text-sm text-gray-600">Accuracy</div>
        </div>
      </div>
    </div>
  );
}

// Import/Export word lists
export function ImportExportLists({
  onImport,
  lists = [],
}: {
  onImport?: (lists: CustomWordList[]) => void;
  lists?: CustomWordList[];
}) {
  const handleExport = () => {
    const dataStr = JSON.stringify(lists, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'word-lists.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        onImport?.(imported);
      } catch (error) {
        alert('Error importing file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Import / Export Lists
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block w-full">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <div className="py-6 bg-blue-100 text-blue-900 rounded-xl font-bold text-center cursor-pointer hover:bg-blue-200 transition-colors">
              📥 Import Word Lists
            </div>
          </label>
        </div>

        <button
          onClick={handleExport}
          disabled={lists.length === 0}
          className="w-full py-6 bg-green-100 text-green-900 rounded-xl font-bold hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📤 Export Word Lists ({lists.length})
        </button>
      </div>
    </div>
  );
}
