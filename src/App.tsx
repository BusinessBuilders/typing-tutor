/**
 * Main App Container
 * Root component - Step 91
 */

import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useUserStore } from './store/useUserStore';
import { useSettingsStore } from './store/useSettingsStore';
import { MusicPlayer } from './components/BackgroundMusic';

function App() {
  const { currentUser } = useUserStore();
  const { settings } = useSettingsStore();
  const navigate = useNavigate();

  // Apply settings to DOM
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', settings.theme || 'light');
    root.setAttribute('data-font-size', settings.fontSize || 'medium');
    root.setAttribute('data-reduced-motion', settings.reducedMotion ? 'true' : 'false');
  }, [settings]);

  // Redirect to profile select if no user
  useEffect(() => {
    if (!currentUser) {
      navigate('/profile-select');
    }
  }, [currentUser, navigate]);

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
        <Outlet />
      </main>

      <footer className="bg-gray-50 mt-auto py-6">
        <p className="text-center text-gray-600 text-sm">
          AI-Powered Autism Typing Tutor - Building confidence, one keystroke at a time ❤️
        </p>
      </footer>

      {/* Background Music Player - Fixed bottom right */}
      {settings.musicEnabled && (
        <div className="fixed bottom-6 right-6 z-40">
          <MusicPlayer />
        </div>
      )}
    </div>
  );
}

export default App;
