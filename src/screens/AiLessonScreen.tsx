import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LessonPlanService, LESSON_TEMPLATES, LessonPlan, LessonSession } from '../services/ai/LessonPlanService';
import { useUserStore } from '../store/useUserStore';
import { UnsplashService } from '../services/images/unsplashService';
import { usePetStore } from '../store/usePetStore';
import { PetDisplay } from '../components/PetSystem';
import { speak, initializeTTS, isSupported as isTTSSupported } from '../services/audio/textToSpeechService';
import { VirtualKeyboard } from '../components/VirtualKeyboard';
import { useSettingsStore } from '../store/useSettingsStore';

/**
 * AI Lesson Screen
 * Displays AI-generated lesson content with progressive learning
 */
const AiLessonScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useUserStore();

  const templateType = searchParams.get('template');
  const lessonTitle = searchParams.get('title');

  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [currentSession, setCurrentSession] = useState<LessonSession | null>(null);
  const [currentInput, setCurrentInput] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const { pet, addXP } = usePetStore();
  const { settings } = useSettingsStore();
  const [showKeyboard, setShowKeyboard] = useState(false);

  const lessonService = new LessonPlanService('openai');
  const unsplashService = new UnsplashService();
  const [ttsEnabled] = useState(isTTSSupported());

  // Initialize TTS
  useEffect(() => {
    if (ttsEnabled) {
      initializeTTS();
    }
  }, [ttsEnabled]);

  // Extract meaningful word for image search
  const extractMeaningfulWord = (text: string): string => {
    const skipWords = ['i', 'the', 'a', 'an', 'is', 'am', 'are', 'was', 'were', 'can', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'to', 'in', 'on', 'at', 'for', 'and', 'but', 'or'];
    const words = text.toLowerCase().split(' ');
    const meaningfulWord = words.find(word => !skipWords.includes(word.trim()));
    return meaningfulWord || lessonTitle || 'nature';
  };

  // Fetch image for current content
  const fetchImage = async (searchTerm: string) => {
    try {
      const images = await unsplashService.searchImages({
        query: searchTerm,
        count: 1,
        orientation: 'landscape',
        contentFilter: 'high',
      });
      if (images && images.length > 0) {
        setImageUrl(images[0].url);
      }
    } catch (error) {
      console.error('Failed to fetch image:', error);
      setImageUrl(null);
    }
  };

  // Initialize lesson plan
  useEffect(() => {
    const initializeLesson = async () => {
      setLoading(true);

      // Find the template
      const template = LESSON_TEMPLATES.find(t => t.type === templateType);
      if (!template) {
        console.error('Template not found:', templateType);
        navigate('/lessons');
        return;
      }

      try {
        // Generate lesson plan
        const plan = await lessonService.generateLessonPlan(
          template,
          currentUser?.age || 8,
          [] // interests - can be added later if UserProfile has this field
        );
        setLessonPlan(plan);

        // Generate first session
        const session = await lessonService.generateNextSession(plan);
        setCurrentSession(session);

        // Fetch image for first session
        const searchTerm = extractMeaningfulWord(session.content);
        fetchImage(searchTerm);

        // Update plan with new session
        plan.sessions.push(session);
        plan.currentSession = 1;
        setLessonPlan({ ...plan });

      } catch (error) {
        console.error('Failed to initialize lesson:', error);
      } finally {
        setLoading(false);
      }
    };

    if (templateType) {
      initializeLesson();
    }
  }, [templateType]);

  // Load next session
  const loadNextSession = async () => {
    if (!lessonPlan) return;

    // Check if lesson is complete
    if (lessonPlan.currentSession >= lessonPlan.totalSessions) {
      setIsComplete(true);
      return;
    }

    setLoading(true);
    setCurrentInput('');
    setIsCorrect(null);

    try {
      // Get ALL previous session content (not just the last one)
      const allPreviousContent = lessonPlan.sessions
        .map((s, idx) => `Part ${idx + 1}: ${s.content}`)
        .join('\n\n');

      // Generate next session
      const session = await lessonService.generateNextSession(lessonPlan, allPreviousContent);
      setCurrentSession(session);

      // Fetch image for new session
      const searchTerm = extractMeaningfulWord(session.content);
      fetchImage(searchTerm);

      // Update lesson plan
      lessonPlan.sessions.push(session);
      lessonPlan.currentSession++;
      setLessonPlan({ ...lessonPlan });

    } catch (error) {
      console.error('Failed to load next session:', error);
    } finally {
      setLoading(false);
    }
  };

  // Normalize text for comparison
  const normalizeText = (text: string): string => {
    return text.toLowerCase().replace(/[.,!?;:'"]/g, '').trim();
  };

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCurrentInput(value);

    if (!currentSession) return;

    const normalizedInput = normalizeText(value);
    const normalizedTarget = normalizeText(currentSession.content);

    if (normalizedInput === normalizedTarget) {
      setIsCorrect(true);
      setScore(prev => prev + 20);
      setStreak(prev => prev + 1);

      // Reward pet with XP
      if (addXP) {
        addXP(20); // Give 20 XP for completing AI lesson sessions
      }

      // Auto-advance after delay
      setTimeout(() => {
        loadNextSession();
      }, 2000);
    } else if (normalizedTarget.startsWith(normalizedInput) && normalizedInput.length > 0) {
      setIsCorrect(null);
    } else if (normalizedInput.length > 0) {
      setIsCorrect(false);
      setStreak(0);
    }
  };

  // Completion screen
  if (isComplete && lessonPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 10, 0] }}
            transition={{ duration: 0.5, repeat: 3 }}
            className="text-9xl mb-6"
          >
            🎉
          </motion.div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Amazing Work!
          </h1>

          <p className="text-2xl text-gray-700 mb-8">
            You completed the entire lesson: <strong>{lessonTitle}</strong>!
          </p>

          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Story</h2>
            <div className="text-left space-y-4 max-h-96 overflow-y-auto">
              {lessonPlan.sessions.map((session, index) => (
                <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm font-semibold text-purple-600 mb-2">Part {session.sessionNumber}</p>
                  <p className="text-gray-700 leading-relaxed">{session.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-purple-50 rounded-xl p-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">{score}</div>
              <div className="text-sm text-gray-600">Total Score</div>
            </div>
            <div className="bg-orange-50 rounded-xl p-6">
              <div className="text-4xl font-bold text-orange-600 mb-2">{lessonPlan.sessions.length}</div>
              <div className="text-sm text-gray-600">Sessions Completed</div>
            </div>
            <div className="bg-green-50 rounded-xl p-6">
              <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-sm text-gray-600">Complete!</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/lessons')}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-lg"
            >
              Choose Another Lesson
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold text-lg hover:bg-gray-300 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading && !currentSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-purple-600 mx-auto mb-8"></div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            AI is creating your personalized lesson...
          </h2>
          <p className="text-xl text-gray-600">This may take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-lesson-screen min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      {/* Pet Companion Display */}
      {pet && (
        <motion.div
          className="fixed top-4 right-4 z-50"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <PetDisplay pet={pet} />
        </motion.div>
      )}

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <button
          onClick={() => navigate('/lessons')}
          className="mb-4 text-purple-600 hover:text-purple-700 flex items-center gap-2 text-lg"
        >
          ← Back to Lessons
        </button>

        <div className="p-6 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{lessonTitle || 'AI Lesson'}</h1>
              <p className="text-xl opacity-90">
                Session {lessonPlan?.currentSession || 1} of {lessonPlan?.totalSessions || '?'}
              </p>
            </div>
            <div className="text-6xl">✨</div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <div className="text-3xl font-bold text-purple-600">{score}</div>
            <div className="text-sm text-gray-600">Score</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <div className="text-3xl font-bold text-orange-600">{streak}</div>
            <div className="text-sm text-gray-600">Streak</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-md text-center">
            <div className="text-3xl font-bold text-green-600">
              {lessonPlan?.currentSession || 1}/{lessonPlan?.totalSessions || '?'}
            </div>
            <div className="text-sm text-gray-600">Progress</div>
          </div>
        </div>
      </div>

      {/* Main Learning Area */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
              <p className="text-xl text-gray-600">Generating next part...</p>
            </div>
          ) : (
            <>
              {/* Image Display */}
              {imageUrl && (
                <div className="mb-8 relative h-80 rounded-xl overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={lessonTitle || 'lesson image'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-white text-lg font-medium">
                      Session {lessonPlan?.currentSession} of {lessonPlan?.totalSessions}
                    </p>
                  </div>
                </div>
              )}

              {/* Learning Objective */}
              <div className="mb-8 p-4 bg-blue-50 rounded-xl">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  Learning Goal:
                </h3>
                <p className="text-blue-700">
                  {currentSession?.learningObjective || 'Practice typing skills'}
                </p>
              </div>

              {/* Target Text Display */}
              <div className="target-text mb-6">
                <div className="bg-gray-50 p-8 rounded-xl">
                  <motion.div
                    key={currentSession?.sessionNumber}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl leading-relaxed text-gray-800 whitespace-pre-wrap"
                  >
                    {currentSession?.content}
                  </motion.div>
                </div>
                {/* Read Aloud Button */}
                {ttsEnabled && currentSession && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => speak(currentSession.content)}
                      className="px-6 py-3 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition-colors shadow-lg flex items-center gap-2 mx-auto"
                    >
                      🔊 Read Aloud
                    </button>
                  </div>
                )}
              </div>

              {/* Typing Input */}
              <div className="typing-input-area mb-6">
                <label className="block text-lg font-semibold text-gray-700 mb-3">
                  Type the text above:
                </label>
                <textarea
                  value={currentInput}
                  onChange={handleInputChange}
                  placeholder="Start typing here..."
                  autoFocus
                  rows={6}
                  className={`w-full p-6 text-xl rounded-xl border-4 transition-all resize-none ${
                    isCorrect === true
                      ? 'border-green-500 bg-green-50'
                      : isCorrect === false
                      ? 'border-red-500 bg-red-50'
                      : 'border-purple-300 focus:border-purple-500'
                  } focus:outline-none`}
                />
                <div className="mt-3 text-center">
                  <button
                    onClick={() => setShowKeyboard(!showKeyboard)}
                    className="text-sm text-purple-600 hover:text-purple-700 underline"
                  >
                    {showKeyboard ? '🔼 Hide Keyboard' : '⌨️ Show Keyboard'}
                  </button>
                </div>
              </div>

              {/* Virtual Keyboard */}
              {showKeyboard && (
                <div className="mb-6">
                  <VirtualKeyboard
                    layout="qwerty"
                    onKeyPress={(key) => {
                      if (key === 'Backspace') {
                        setCurrentInput(currentInput.slice(0, -1));
                      } else if (key === ' ' || key.length === 1) {
                        setCurrentInput(currentInput + key.toLowerCase());
                      }
                      // Trigger validation
                      setTimeout(() => {
                        handleInputChange({ target: { value: currentInput + (key.length === 1 ? key.toLowerCase() : key === ' ' ? ' ' : '') } } as any);
                      }, 10);
                    }}
                    size={settings.fontSize === 'large' ? 'large' : 'medium'}
                  />
                </div>
              )}

              {/* Feedback */}
              <div className="feedback-area h-20 flex items-center justify-center">
                {isCorrect === true && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-4xl text-green-600 flex items-center gap-3"
                  >
                    <span>✨</span>
                    <span className="font-bold">Excellent! Moving on...</span>
                    <span>🎉</span>
                  </motion.div>
                )}
                {isCorrect === false && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-2xl text-orange-600 flex items-center gap-3"
                  >
                    <span>💪</span>
                    <span className="font-bold">Keep trying - you can do it!</span>
                  </motion.div>
                )}
              </div>

              {/* Session Info */}
              <div className="mt-8 p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center justify-between text-sm text-purple-700">
                  <span>
                    Difficulty: <span className="font-semibold capitalize">{currentSession?.difficulty}</span>
                  </span>
                  <span>
                    Estimated time: <span className="font-semibold">{currentSession?.estimatedMinutes} min</span>
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Pet Companion */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-white rounded-2xl shadow-md p-6 text-center"
        >
          <div className="text-6xl mb-3">🐱</div>
          <p className="text-lg text-gray-700 font-medium">
            {streak > 5
              ? "You're amazing! Keep going! 🔥"
              : streak > 0
              ? 'Great progress! 🌟'
              : 'Take your time - no rush! 💪'}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AiLessonScreen;
