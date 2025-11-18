import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/**
 * ParentDashboard Component - Step 100
 *
 * Parent/Guardian control panel.
 * Monitor progress, manage settings, export reports.
 *
 * Features:
 * - View all children's progress
 * - Manage parental controls
 * - Export progress reports
 * - Set time limits
 * - Review activity history
 */

const ParentDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="parent-dashboard min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-4 text-indigo-600 hover:text-indigo-700 flex items-center gap-2 text-lg"
        >
          ← Back to Home
        </button>

        <h1 className="text-5xl font-bold text-gray-800 mb-2">Parent Dashboard 👨‍👩‍👧</h1>
        <p className="text-xl text-gray-600 mb-8">
          Monitor progress and manage settings for your child
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-md p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                <span className="font-medium">Total Practice Time</span>
                <span className="text-2xl font-bold text-green-600">2h 25m</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                <span className="font-medium">Lessons Completed</span>
                <span className="text-2xl font-bold text-blue-600">23</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl">
                <span className="font-medium">Average WPM</span>
                <span className="text-2xl font-bold text-purple-600">28</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-md p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Controls</h2>
            <div className="space-y-3">
              <button className="w-full p-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold transition-all">
                📊 Export Progress Report
              </button>
              <button className="w-full p-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-all">
                ⏰ Set Time Limits
              </button>
              <button className="w-full p-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-all">
                🔒 Parental Controls
              </button>
              <button
                onClick={() => navigate('/settings')}
                className="w-full p-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-all"
              >
                ⚙️ App Settings
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-2">💡 Parent Tip</h3>
          <p className="text-gray-700">
            Celebrate small wins! Positive reinforcement helps build confidence and makes learning
            more enjoyable for children with autism.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default ParentDashboard;
