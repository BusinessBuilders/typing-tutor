/**
 * Main App Container
 * Root component - Step 91
 */

import { useEffect } from 'react';
import { useUserStore } from './store/useUserStore';
import { useSettingsStore } from './store/useSettingsStore';
import { useAppStore } from './store/useAppStore';

function App() {
  const { currentUser } = useUserStore();
  const { settings } = useSettingsStore();
  const { currentScreen } = useAppStore();

  // Apply settings to DOM
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', settings.theme || 'light');
    root.setAttribute('data-font-size', settings.fontSize || 'medium');
    root.setAttribute('data-reduced-motion', settings.reducedMotion ? 'true' : 'false');
  }, [settings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary-600">
              🎯 Autism Typing Tutor
            </h1>
            {currentUser && (
              <span className="text-gray-600">Welcome, {currentUser.name}!</span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentScreen === 'home' && (
          <div className="text-center py-20">
            <div className="text-8xl mb-8">✨</div>
            <h2 className="text-4xl font-bold mb-4">Welcome to Typing Tutor!</h2>
            <p className="text-xl text-gray-600 mb-8">
              Learn to type at your own pace with AI-powered assistance
            </p>
            <button className="px-8 py-4 bg-primary-600 text-white text-lg rounded-lg hover:bg-primary-700 transition-colors">
              {currentUser ? 'Start Practicing' : 'Create Profile'}
            </button>
          </div>
        )}
      </main>

      <footer className="bg-gray-50 mt-auto py-6">
        <p className="text-center text-gray-600 text-sm">
          AI-Powered Autism Typing Tutor - Building confidence, one keystroke at a time ❤️
        </p>
      </footer>
    </div>
  );
}

export default App;
