import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/**
 * ProfileSelectScreen Component - Step 94
 *
 * Multi-user profile selection interface.
 * Allows multiple children to use the same app with separate progress.
 *
 * Features:
 * - Create new profiles
 * - Select existing profiles
 * - Visual profile avatars
 * - Profile customization
 * - Quick access to recent profiles
 */

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  color: string;
  lastUsed: Date;
  age?: number;
  level: number;
}

const ProfileSelectScreen: React.FC = () => {
  const navigate = useNavigate();

  const [profiles] = useState<UserProfile[]>([
    {
      id: '1',
      name: 'Alex',
      avatar: '😊',
      color: 'from-blue-400 to-cyan-500',
      lastUsed: new Date(),
      age: 8,
      level: 5,
    },
    {
      id: '2',
      name: 'Sam',
      avatar: '🌟',
      color: 'from-purple-400 to-pink-500',
      lastUsed: new Date(Date.now() - 86400000),
      age: 10,
      level: 8,
    },
  ]);

  const handleSelectProfile = (profile: UserProfile) => {
    // In real app, set active profile in global state
    console.log('Selected profile:', profile.name);
    navigate('/');
  };

  const handleCreateProfile = () => {
    // In real app, open profile creation modal
    alert('Create Profile feature coming soon!');
  };

  return (
    <div className="profile-select-screen min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Who's Practicing Today?
          </h1>
          <p className="text-2xl text-gray-700">Choose your profile to get started!</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {profiles.map((profile, index) => (
            <motion.button
              key={profile.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectProfile(profile)}
              className={`profile-card bg-gradient-to-br ${profile.color} p-8 rounded-3xl shadow-xl text-white text-left`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-7xl">{profile.avatar}</div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-1">{profile.name}</h2>
                  <p className="opacity-90">Level {profile.level}</p>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-xl p-3">
                <p className="text-sm">Last practice: {profile.lastUsed.toLocaleDateString()}</p>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCreateProfile}
          className="w-full p-8 bg-white rounded-3xl shadow-lg border-4 border-dashed border-purple-300 hover:border-purple-500 transition-all"
        >
          <div className="text-6xl mb-3">➕</div>
          <h3 className="text-2xl font-bold text-gray-800">Create New Profile</h3>
          <p className="text-gray-600">Add another user</p>
        </motion.button>
      </div>
    </div>
  );
};

export default ProfileSelectScreen;
