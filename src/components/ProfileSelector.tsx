/**
 * Profile Selector Component
 * Step 94 - User profile creation and selection
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore, createUserProfile } from '../store/useUserStore';
import { useAppStore } from '../store/useAppStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { UserDB } from '../services/database/databaseService';

const AVATAR_OPTIONS = ['👦', '👧', '🧒', '👶', '🐱', '🐶', '🐼', '🦁', '🐯', '🐸', '🦄', '🌟'];

export default function ProfileSelector() {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { setUser } = useUserStore();
  const { setScreen, showNotification } = useAppStore();
  const { settings } = useSettingsStore();

  // Load profiles on mount
  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    try {
      const allProfiles = await UserDB.getAll();
      setProfiles(allProfiles);
    } catch (error) {
      console.error('Failed to load profiles:', error);
    }
  }

  async function handleCreateProfile() {
    console.log('=== CREATE PROFILE CLICKED ===');
    console.log('Name:', name);
    console.log('Age:', age);

    if (!name.trim()) {
      console.log('Name is empty, showing warning');
      alert('Please enter a name');
      return;
    }

    console.log('Creating profile...');
    setLoading(true);
    try {
      const newProfile = createUserProfile(
        name.trim(),
        age ? parseInt(age) : undefined
      );
      newProfile.avatar = selectedAvatar;

      console.log('New profile object:', newProfile);

      await UserDB.create(newProfile);
      console.log('Profile saved to database');

      setUser(newProfile);
      console.log('User set in store');

      alert(`Welcome, ${newProfile.name}! 🎉`);

      console.log('Navigating to home...');
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to create profile:', error);
      alert('Failed to create profile: ' + error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectProfile(profile: any) {
    setUser(profile);
    showNotification(`Welcome back, ${profile.name}! 👋`, 'success');
    setScreen('home');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="text-6xl mb-4">👋</div>
        <h1 className="text-4xl font-bold mb-2 text-gray-800">
          {isCreating ? 'Create Your Profile' : 'Who\'s Learning Today?'}
        </h1>
        <p className="text-gray-600">
          {isCreating
            ? 'Tell us a bit about yourself'
            : 'Select a profile or create a new one'}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!isCreating ? (
          /* Profile Selection View */
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Existing Profiles */}
            {profiles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {profiles.map((profile) => (
                  <motion.button
                    key={profile.id}
                    whileHover={{ scale: settings.reducedMotion ? 1 : 1.05 }}
                    whileTap={{ scale: settings.reducedMotion ? 1 : 0.95 }}
                    onClick={() => handleSelectProfile(profile)}
                    className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all border-2 border-transparent hover:border-primary-400"
                  >
                    <div className="text-6xl mb-3">{profile.avatar || '👤'}</div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {profile.name}
                    </h3>
                    {profile.age && (
                      <p className="text-sm text-gray-600">{profile.age} years old</p>
                    )}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Create New Profile Button */}
            <motion.button
              whileHover={{ scale: settings.reducedMotion ? 1 : 1.02 }}
              whileTap={{ scale: settings.reducedMotion ? 1 : 0.98 }}
              onClick={() => setIsCreating(true)}
              className="w-full max-w-md mx-auto flex items-center justify-center space-x-3 bg-primary-600 text-white py-4 px-6 rounded-xl hover:bg-primary-700 transition-colors shadow-lg"
            >
              <span className="text-3xl">➕</span>
              <span className="text-lg font-medium">Create New Profile</span>
            </motion.button>
          </motion.div>
        ) : (
          /* Profile Creation Form */
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Avatar Selection */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Choose Your Avatar
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <motion.button
                      key={avatar}
                      whileHover={{ scale: settings.reducedMotion ? 1 : 1.1 }}
                      whileTap={{ scale: settings.reducedMotion ? 1 : 0.9 }}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`text-4xl p-3 rounded-lg transition-all ${
                        selectedAvatar === avatar
                          ? 'bg-primary-100 ring-4 ring-primary-500'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {avatar}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Name Input */}
              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="block text-lg font-medium text-gray-700 mb-2"
                >
                  What's Your Name? *
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                  autoFocus
                />
              </div>

              {/* Age Input */}
              <div className="mb-8">
                <label
                  htmlFor="age"
                  className="block text-lg font-medium text-gray-700 mb-2"
                >
                  How Old Are You? (Optional)
                </label>
                <input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter your age"
                  min="1"
                  max="120"
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: settings.reducedMotion ? 1 : 1.02 }}
                  whileTap={{ scale: settings.reducedMotion ? 1 : 0.98 }}
                  onClick={() => setIsCreating(false)}
                  disabled={loading}
                  className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileHover={{ scale: settings.reducedMotion ? 1 : 1.02 }}
                  whileTap={{ scale: settings.reducedMotion ? 1 : 0.98 }}
                  onClick={handleCreateProfile}
                  disabled={loading || !name.trim()}
                  className="flex-1 py-3 px-6 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span>✓</span>
                      <span>Create Profile</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
