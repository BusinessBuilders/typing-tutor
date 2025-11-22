/**
 * Skill Progress Screen
 * Displays comprehensive skill assessment, level progress, and AI recommendations
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SkillAssessmentService, SkillAssessment } from '../services/ai/SkillAssessmentService';
import { LevelSystem, Level } from '../services/curriculum/LevelSystem';

const SkillProgressScreen: React.FC = () => {
  const navigate = useNavigate();
  const [levelSystem] = useState(() => new LevelSystem());
  const [skillService] = useState(() => new SkillAssessmentService());
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [nextLevel, setNextLevel] = useState<Level | null>(null);
  const [assessment, setAssessment] = useState<SkillAssessment | null>(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    setIsLoading(true);

    try {
      // Initialize skill service
      await skillService.initialize();

      // Get current level
      const level = levelSystem.getCurrentLevel();
      const next = levelSystem.getNextLevel();
      setCurrentLevel(level);
      setNextLevel(next);

      // Calculate metrics
      const metrics = skillService.calculateMetrics();

      // Get progress percentage
      const progress = levelSystem.getProgressPercentage(metrics);
      setProgressPercentage(progress);

      // Generate AI assessment
      setIsGeneratingAI(true);
      const aiAssessment = await skillService.generateAssessment(level.id, level.name);
      setAssessment(aiAssessment);
      setIsGeneratingAI(false);
    } catch (error) {
      console.error('Failed to load progress:', error);
      setIsGeneratingAI(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAssessment = () => {
    loadProgress();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!currentLevel || !assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="mb-4 text-purple-600 hover:text-purple-700 flex items-center gap-2 text-lg"
          >
            ← Back to Home
          </button>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-xl text-gray-600">No progress data available yet. Start practicing to track your skills!</p>
          </div>
        </div>
      </div>
    );
  }

  const metrics = assessment.metrics;

  return (
    <div className="skill-progress-screen min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate('/')}
          className="mb-4 text-purple-600 hover:text-purple-700 flex items-center gap-2 text-lg"
        >
          ← Back to Home
        </button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Your Learning Journey
          </h1>
          <p className="text-2xl text-gray-700">AI-Powered Skill Analysis & Progress Tracking</p>
        </motion.div>

        {/* Current Level Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`bg-gradient-to-br ${currentLevel.color} rounded-3xl shadow-2xl p-8 mb-8 text-white`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className="text-8xl">{currentLevel.icon}</span>
              <div>
                <h2 className="text-4xl font-bold mb-2">{currentLevel.title}</h2>
                <p className="text-xl opacity-90">{currentLevel.description}</p>
              </div>
            </div>
            <button
              onClick={refreshAssessment}
              disabled={isGeneratingAI}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {isGeneratingAI ? '🔄 Analyzing...' : '🔄 Refresh'}
            </button>
          </div>

          {/* Progress Bar to Next Level */}
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold">Progress to Next Level</span>
              <span className="font-bold">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="bg-white h-4 rounded-full shadow-lg"
              />
            </div>
            {nextLevel && (
              <p className="text-sm mt-2 opacity-90">
                Next: {nextLevel.icon} {nextLevel.name}
              </p>
            )}
            <p className="text-sm mt-1 opacity-75">
              Estimated time: {assessment.estimatedTimeToNextLevel}
            </p>
          </div>

          {/* Focus Areas */}
          <div className="flex flex-wrap gap-2">
            {currentLevel.contentFocus.focusAreas.map((area, idx) => (
              <span key={idx} className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                {area}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Overall Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🎯</span>
              <h3 className="text-2xl font-bold text-gray-800">Performance</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-600">Accuracy</span>
                  <span className="text-2xl font-bold text-green-600">{metrics.averageAccuracy.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${metrics.averageAccuracy}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-600">Speed</span>
                  <span className="text-2xl font-bold text-blue-600">{metrics.averageSpeed.toFixed(1)} WPM</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-600">Consistency</span>
                  <span className="text-2xl font-bold text-purple-600">{metrics.consistencyScore}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${metrics.consistencyScore}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Milestones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">🏆</span>
              <h3 className="text-2xl font-bold text-gray-800">Milestones</h3>
            </div>
            <div className="space-y-4">
              <div className="text-center p-3 bg-purple-50 rounded-xl">
                <div className="text-3xl font-bold text-purple-600">{metrics.totalWordsTyped}</div>
                <div className="text-sm text-gray-600">Total Words</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <div className="text-3xl font-bold text-blue-600">{metrics.totalSentencesTyped}</div>
                <div className="text-sm text-gray-600">Sentences</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <div className="text-3xl font-bold text-green-600">{metrics.sessionsCompleted}</div>
                <div className="text-sm text-gray-600">Sessions</div>
              </div>
            </div>
          </motion.div>

          {/* Improvement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">📈</span>
              <h3 className="text-2xl font-bold text-gray-800">Growth</h3>
            </div>
            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                <div className="text-4xl font-bold text-orange-600">
                  {metrics.improvementRate > 0 ? '+' : ''}{metrics.improvementRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 mt-1">Improvement Rate</div>
              </div>
              {metrics.readyForNextLevel && (
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-300">
                  <div className="text-2xl font-bold text-green-600">🎉 Ready!</div>
                  <div className="text-sm text-gray-600">Ready for next level</div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* AI Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-5xl">🤖</span>
            <h3 className="text-3xl font-bold text-gray-800">AI Analysis</h3>
          </div>
          <p className="text-xl text-gray-700 leading-relaxed mb-6 p-4 bg-purple-50 rounded-xl">
            {assessment.aiAnalysis}
          </p>

          {/* Strengths and Areas to Improve */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-xl font-bold text-green-600 mb-3 flex items-center gap-2">
                <span>💪</span> Strengths
              </h4>
              <ul className="space-y-2">
                {assessment.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-bold text-orange-600 mb-3 flex items-center gap-2">
                <span>🎯</span> Areas to Improve
              </h4>
              <ul className="space-y-2">
                {assessment.areasToImprove.map((area, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700">
                    <span className="text-orange-500 mt-1">→</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="text-xl font-bold text-purple-600 mb-3 flex items-center gap-2">
              <span>💡</span> AI Recommendations
            </h4>
            <div className="space-y-3">
              {assessment.recommendations.map((rec, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-l-4 border-purple-500">
                  <p className="text-gray-700 font-medium">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Skills Breakdown */}
        {(metrics.weakLetters.length > 0 || metrics.strongLetters.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="text-5xl">📊</span>
              <h3 className="text-3xl font-bold text-gray-800">Letter Analysis</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {metrics.strongLetters.length > 0 && (
                <div>
                  <h4 className="text-xl font-bold text-green-600 mb-3">Strong Letters</h4>
                  <div className="flex flex-wrap gap-2">
                    {metrics.strongLetters.map((letter, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold text-xl"
                      >
                        {letter}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {metrics.weakLetters.length > 0 && (
                <div>
                  <h4 className="text-xl font-bold text-orange-600 mb-3">Focus on These Letters</h4>
                  <div className="flex flex-wrap gap-2">
                    {metrics.weakLetters.map((letter, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-bold text-xl"
                      >
                        {letter}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Common Mistakes */}
            {metrics.commonMistakes.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xl font-bold text-red-600 mb-3">Common Typing Patterns</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {metrics.commonMistakes.slice(0, 6).map((mistake, idx) => (
                    <div key={idx} className="p-3 bg-red-50 rounded-lg text-center">
                      <span className="text-lg font-mono">
                        <span className="text-gray-500">{mistake.from}</span>
                        {' → '}
                        <span className="text-red-600 font-bold">{mistake.to}</span>
                      </span>
                      <span className="text-sm text-gray-600 block mt-1">
                        {mistake.count} {mistake.count === 1 ? 'time' : 'times'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* All Levels Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="text-5xl">🗺️</span>
            <h3 className="text-3xl font-bold text-gray-800">Learning Path</h3>
          </div>

          <div className="space-y-4">
            {levelSystem.getAllLevels().map((level) => {
              const isCurrent = level.id === currentLevel.id;
              const isCompleted = levelSystem.getProgress().levelsCompleted.includes(level.id);
              const isLocked = level.id > currentLevel.id && !isCompleted;

              return (
                <div
                  key={level.id}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    isCurrent
                      ? `border-purple-500 bg-gradient-to-r ${level.color} text-white shadow-lg scale-105`
                      : isCompleted
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">{level.icon}</span>
                      <div>
                        <h4 className={`text-2xl font-bold ${isCurrent ? 'text-white' : 'text-gray-800'}`}>
                          {level.name}
                        </h4>
                        <p className={`${isCurrent ? 'text-white/90' : 'text-gray-600'}`}>
                          {level.description}
                        </p>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-bold">
                        Current
                      </span>
                    )}
                    {isCompleted && !isCurrent && (
                      <span className="text-3xl">✓</span>
                    )}
                    {isLocked && (
                      <span className="text-3xl">🔒</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SkillProgressScreen;
