import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LESSON_TEMPLATES, LessonTemplate, LessonPlanService } from '../services/ai/LessonPlanService';
import { useUserStore } from '../store/useUserStore';

/**
 * Lesson Selection Screen
 * Allows users to choose from AI-generated lesson plans
 */
const LessonSelectionScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useUserStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSelectLesson = (template: LessonTemplate) => {
    // Navigate to AI lesson screen
    navigate(`/ai-lesson?template=${template.type}&title=${encodeURIComponent(template.title)}`);
  };

  const handleGenerateCustomLesson = async () => {
    setIsGenerating(true);
    try {
      const lessonService = new LessonPlanService('openai');
      await lessonService.initialize();

      // Have AI suggest a custom lesson topic
      const customTemplate: LessonTemplate = {
        type: 'custom',
        title: 'AI-Generated Custom Lesson',
        description: 'Personalized lesson created just for you based on your learning progress',
        icon: '🤖',
        suggestedSessions: 5,
        ageRange: [currentUser?.age || 8, (currentUser?.age || 8) + 2],
      };

      handleSelectLesson(customTemplate);
    } catch (error) {
      console.error('Failed to generate custom lesson:', error);
      alert('Could not generate custom lesson. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const isAgeAppropriate = (template: LessonTemplate): boolean => {
    if (!currentUser?.age) return true;
    const [minAge, maxAge] = template.ageRange;
    return currentUser.age >= minAge && currentUser.age <= maxAge;
  };

  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      story: 'from-purple-400 to-pink-500',
      education: 'from-blue-400 to-cyan-500',
      creative: 'from-orange-400 to-red-500',
      adventure: 'from-green-400 to-emerald-500',
    };
    return colors[type] || 'from-gray-400 to-gray-500';
  };

  return (
    <div className="lesson-selection-screen min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="mb-4 text-purple-600 hover:text-purple-700 flex items-center gap-2 text-lg"
          >
            ← Back to Home
          </button>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Choose Your Learning Adventure
            </h1>
            <p className="text-2xl text-gray-700">
              AI will create personalized lessons just for you!
            </p>
          </motion.div>
        </div>

        {/* AI Custom Lesson Generator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 p-1 rounded-2xl">
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">🤖✨</div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">
                      AI Custom Lesson Generator
                    </h3>
                    <p className="text-gray-600">
                      Let AI analyze your progress and create a perfect lesson just for you!
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleGenerateCustomLesson}
                  disabled={isGenerating}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Generating...
                    </span>
                  ) : (
                    'Generate Custom Lesson'
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lesson Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LESSON_TEMPLATES.map((template, index) => {
            const appropriate = isAgeAppropriate(template);

            return (
              <motion.button
                key={template.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: appropriate ? 1.05 : 1, y: appropriate ? -5 : 0 }}
                whileTap={{ scale: appropriate ? 0.95 : 1 }}
                onClick={() => appropriate && handleSelectLesson(template)}
                disabled={!appropriate}
                className={`lesson-card p-6 rounded-2xl shadow-lg text-left relative overflow-hidden ${
                  appropriate
                    ? 'bg-white hover:shadow-xl cursor-pointer'
                    : 'bg-gray-100 opacity-60 cursor-not-allowed'
                }`}
              >
                {/* Background gradient */}
                <div
                  className={`absolute top-0 right-0 w-32 h-32 opacity-10 bg-gradient-to-br ${getTypeColor(template.type)} rounded-bl-full`}
                />

                {/* Icon */}
                <div className="text-6xl mb-4">{template.icon}</div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {template.title}
                  </h3>

                  <p className="text-gray-600 mb-4">{template.description}</p>

                  {/* Meta info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <span>📚</span>
                      {template.suggestedSessions} sessions
                    </span>
                    <span className="flex items-center gap-1">
                      <span>🎯</span>
                      Ages {template.ageRange[0]}-{template.ageRange[1]}
                    </span>
                  </div>

                  {/* Type badge */}
                  <div className="mt-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r ${getTypeColor(template.type)}`}
                    >
                      {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
                    </span>
                  </div>

                  {!appropriate && (
                    <div className="mt-4 text-orange-600 font-medium">
                      Recommended for ages {template.ageRange[0]}-{template.ageRange[1]}
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-white rounded-2xl shadow-lg p-8 text-center max-w-3xl mx-auto"
        >
          <div className="text-5xl mb-4">✨</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            AI-Powered Learning
          </h3>
          <p className="text-lg text-gray-600 mb-4">
            Each lesson is personalized by AI to match your interests and learning pace.
            The lessons build on each other, creating a complete learning journey!
          </p>
          <div className="flex items-center justify-center gap-8 text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              <span>Creative & Fun</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📖</span>
              <span>Educational</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💪</span>
              <span>Builds Skills</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LessonSelectionScreen;
