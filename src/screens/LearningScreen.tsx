import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { UnsplashService } from '../services/images/unsplashService';
import { usePetStore } from '../store/usePetStore';
import { PetDisplay } from '../components/PetSystem';
import { speak, initializeTTS, isSupported as isTTSSupported } from '../services/audio/textToSpeechService';
import VirtualKeyboard from '../components/VirtualKeyboard';
import { useSettingsStore } from '../store/useSettingsStore';
import { TherapeuticContentGenerator } from '../services/ai/TherapeuticContentGenerator';
import { useBadgeSystem } from '../components/BadgeSystem';
import { AchievementUnlock, ConfettiExplosion, StarBurst } from '../components/Celebrations';
import { useSuccessSounds } from '../components/SuccessSounds';
import { SkillAssessmentService, TypingMistake, SessionPerformance } from '../services/ai/SkillAssessmentService';
import { LevelSystem } from '../services/curriculum/LevelSystem';
import { ReadingComprehensionService, EnhancedWord, ComprehensionQuestion } from '../services/ai/ReadingComprehensionService';
import { useWordMasteryStore } from '../store/useWordMasteryStore';

/**
 * LearningScreen Component - Step 95
 *
 * Main learning interface where typing practice happens.
 * Adapts to different modes: letters, words, sentences, stories.
 *
 * Features:
 * - Mode-based learning (letters/words/sentences/stories)
 * - Visual prompts and images
 * - Real-time typing feedback
 * - Progress tracking
 * - Gentle error correction
 * - Celebration animations
 * - Pet companion encouragement
 */

export type LearningMode = 'letters' | 'words' | 'sentences' | 'stories';

interface LearningContent {
  mode: LearningMode;
  currentItem: string;
  image?: string;
  description?: string;
  difficulty: number;
}

const LearningScreen: React.FC = () => {
  const navigate = useNavigate();
  const { level } = useParams<{ level?: string }>();
  const [mode, setMode] = useState<LearningMode>((level as LearningMode) || 'letters');
  const { pet, addXP } = usePetStore();
  const { settings } = useSettingsStore();
  const { recordTypingResult, recordComprehensionResult } = useWordMasteryStore();
  const [currentInput, setCurrentInput] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [currentContent, setCurrentContent] = useState<LearningContent>({
    mode: 'letters',
    currentItem: 'A',
    description: 'Type the letter A',
    difficulty: 1,
  });
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [taskIndex, setTaskIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [hasTypingError, setHasTypingError] = useState(false);
  const [typingMistakes, setTypingMistakes] = useState<TypingMistake[]>([]); // Track detailed mistakes for AI

  // Progressive Learning System
  const [skillAssessment] = useState(() => new SkillAssessmentService());
  const [levelSystem] = useState(() => new LevelSystem());
  const [currentLevel, setCurrentLevel] = useState(() => levelSystem.getCurrentLevel());
  const [sessionStartTime] = useState(Date.now());
  const [wordsTypedInSession, setWordsTypedInSession] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpMessage, setLevelUpMessage] = useState('');

  // Reading Comprehension System
  const [comprehensionService] = useState(() => new ReadingComprehensionService());
  const [currentEnhancedWord, setCurrentEnhancedWord] = useState<EnhancedWord | null>(null);
  const [showComprehensionQuestion, setShowComprehensionQuestion] = useState(false);
  const [comprehensionQuestion, setComprehensionQuestion] = useState<ComprehensionQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showComprehensionResult, setShowComprehensionResult] = useState(false);

  // Track recently used words to avoid repetition
  const [recentWords, setRecentWords] = useState<string[]>([]);

  // Picture-based comprehension images
  const [comprehensionImages, setComprehensionImages] = useState<{
    correct: string | null;
    wrong: string | null;
    randomizeRight: boolean; // true = correct on right, false = correct on left
  }>({ correct: null, wrong: null, randomizeRight: false });
  const [loadingComprehensionImages, setLoadingComprehensionImages] = useState(false);

  // Fetch images for picture-based comprehension
  const fetchComprehensionImages = async (question: ComprehensionQuestion) => {
    if (!question.usePictures || !question.correctPictureKeywords || !question.wrongPictureKeywords) {
      return;
    }

    setLoadingComprehensionImages(true);
    try {
      // Fetch correct answer image
      const correctKeywords = question.correctPictureKeywords.join(' ');
      const correctImages = await unsplashService.searchImages({
        query: correctKeywords,
        count: 1,
        orientation: 'landscape',
        contentFilter: 'high',
      });

      // Fetch wrong answer image (first wrong answer keywords)
      const wrongKeywords = question.wrongPictureKeywords[0].join(' ');
      const wrongImages = await unsplashService.searchImages({
        query: wrongKeywords,
        count: 1,
        orientation: 'landscape',
        contentFilter: 'high',
      });

      // Randomize position (50/50 chance correct is on right or left)
      const randomizeRight = Math.random() > 0.5;

      setComprehensionImages({
        correct: correctImages && correctImages.length > 0 ? correctImages[0].url : null,
        wrong: wrongImages && wrongImages.length > 0 ? wrongImages[0].url : null,
        randomizeRight,
      });

      console.log('🖼️ Comprehension images loaded:', {
        correctKeywords,
        wrongKeywords,
        correctOnRight: randomizeRight,
      });
    } catch (error) {
      console.error('Failed to fetch comprehension images:', error);
      setComprehensionImages({ correct: null, wrong: null, randomizeRight: false });
    } finally {
      setLoadingComprehensionImages(false);
    }
  };

  // AI Analysis: Log common mistakes and patterns
  useEffect(() => {
    if (typingMistakes.length > 0 && typingMistakes.length % 5 === 0) {
      console.log('📊 AI TYPING ANALYSIS:', {
        totalMistakes: typingMistakes.length,
        recentMistakes: typingMistakes.slice(-5),
        suggestion: 'Consider slowing down or practicing difficult letters separately',
      });
    }
  }, [typingMistakes]);

  const unsplashService = new UnsplashService();
  const [ttsEnabled] = useState(isTTSSupported());
  const [contentGenerator] = useState(() => new TherapeuticContentGenerator());
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Badge and celebration systems
  const { unlockBadge, recentlyUnlocked } = useBadgeSystem();
  const { playSuccessSequence } = useSuccessSounds();
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showStarBurst, setShowStarBurst] = useState(false);

  // Initialize TTS, skill assessment, and reading comprehension on mount
  useEffect(() => {
    if (ttsEnabled) {
      initializeTTS();
    }

    // Initialize services
    Promise.all([
      skillAssessment.initialize(),
      comprehensionService.initialize(),
    ]).then(() => {
      console.log('✅ All AI services initialized');
    });
  }, [ttsEnabled]);

  // Extract meaningful word for image search (skip common words)
  const extractMeaningfulWord = (text: string): string => {
    const skipWords = ['i', 'the', 'a', 'an', 'is', 'am', 'are', 'was', 'were', 'can', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'to', 'in', 'on', 'at', 'for'];
    const words = text.toLowerCase().split(' ');

    // Find first meaningful word (not in skip list)
    const meaningfulWord = words.find(word => !skipWords.includes(word.trim()));
    return meaningfulWord || words[0] || 'nature';
  };

  // Get AI-generated therapeutic content (adaptive to level)
  const getContentForMode = async (learningMode: LearningMode): Promise<LearningContent> => {
    setIsLoadingContent(true);

    try {
      let item: string;

      // Get recommended difficulty from level system
      const recommendedDifficulty = levelSystem.getRecommendedDifficulty();

      // Check if this content type is unlocked
      const contentTypeMap: Record<LearningMode, 'words' | 'sentences' | 'stories'> = {
        letters: 'words',
        words: 'words',
        sentences: 'sentences',
        stories: 'stories',
      };
      const isUnlocked = levelSystem.isContentTypeUnlocked(contentTypeMap[learningMode]);

      if (!isUnlocked && learningMode !== 'letters') {
        console.log(`⚠️ ${learningMode} not unlocked yet, falling back to words`);
        learningMode = 'words';
      }

      // Get skill metrics to inform content generation
      const metrics = skillAssessment.calculateMetrics();
      const focusAreas = currentLevel.contentFocus.focusAreas;

      console.log('🎯 Generating adaptive content:', {
        mode: learningMode,
        level: currentLevel.name,
        difficulty: recommendedDifficulty,
        focusAreas: focusAreas.join(', '),
        weakLetters: metrics.weakLetters.slice(0, 3).join(', ') || 'none',
      });

      switch (learningMode) {
        case 'letters':
          item = contentGenerator.getRandomLetter();
          setCurrentEnhancedWord(null); // No enhanced word for letters
          break;
        case 'words':
          // Generate enhanced words with definitions and better pictures
          try {
            const enhancedWord = await comprehensionService.generateEnhancedWord(
              recommendedDifficulty,
              undefined, // Let AI choose category (varies automatically)
              recentWords // Avoid recently used words
            );
            setCurrentEnhancedWord(enhancedWord);
            item = enhancedWord.word;

            // Add to recent words list (keep last 20 words)
            setRecentWords(prev => {
              const updated = [...prev, enhancedWord.word];
              return updated.slice(-20); // Keep last 20 to avoid repetition
            });

            console.log('📚 Enhanced word loaded:', {
              word: enhancedWord.word,
              definition: enhancedWord.definition,
              category: enhancedWord.category,
              avoiding: recentWords.length > 0 ? `${recentWords.length} recent words` : 'none',
            });
          } catch (error) {
            console.error('Failed to generate enhanced word, falling back:', error);
            item = await contentGenerator.generateWord();
            setCurrentEnhancedWord(null);
          }
          break;
        case 'sentences':
          item = await contentGenerator.generateSentence();
          setCurrentEnhancedWord(null);
          break;
        case 'stories':
          item = await contentGenerator.generateStory();
          setCurrentEnhancedWord(null);
          break;
        default:
          item = 'a';
          setCurrentEnhancedWord(null);
      }

      return {
        mode: learningMode,
        currentItem: item,
        description: learningMode === 'letters' ? `Type the letter ${item}` : `Type: ${item}`,
        difficulty: { letters: 1, words: 2, sentences: 3, stories: 4 }[learningMode],
      };
    } catch (error) {
      console.error('Failed to generate content:', error);
      // Fallback
      return {
        mode: learningMode,
        currentItem: 'a',
        description: 'Type: a',
        difficulty: 1,
      };
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Fetch image for current content
  const fetchImage = async (searchTerm: string) => {
    setLoadingImage(true);
    try {
      const images = await unsplashService.searchImages({
        query: searchTerm,
        count: 1,
        orientation: 'landscape',
        contentFilter: 'high',
      });

      if (images && images.length > 0) {
        setImageUrl(images[0].url);
      } else {
        setImageUrl(null);
      }
    } catch (error) {
      console.error('Failed to fetch image:', error);
      setImageUrl(null);
    } finally {
      setLoadingImage(false);
    }
  };

  // Load new content when mode or task changes
  useEffect(() => {
    const loadContent = async () => {
      const content = await getContentForMode(mode);
      setCurrentContent(content);

      // AUTO-READ: Speak the content immediately when loaded
      if (ttsEnabled && content.currentItem) {
        speak(content.currentItem);
      }

      // Fetch image for words, sentences, and stories (not letters)
      if (mode !== 'letters') {
        let searchTerm: string;

        // Use enhanced word's better image keywords if available
        if (mode === 'words' && currentEnhancedWord && currentEnhancedWord.imageKeywords.length > 0) {
          searchTerm = currentEnhancedWord.imageKeywords[0]; // Use first keyword
          console.log('🖼️ Using enhanced image keyword:', searchTerm);
        } else {
          searchTerm = extractMeaningfulWord(content.currentItem);
        }

        fetchImage(searchTerm);
      } else {
        setImageUrl(null);
      }
    };

    loadContent();
  }, [mode, taskIndex]);

  useEffect(() => {
    if (level) {
      setMode(level as LearningMode);
      setTaskIndex(0); // Reset to first task when changing modes
    }
  }, [level]);

  const loadNextTask = () => {
    setTaskIndex((prev) => prev + 1);
    setCurrentInput('');
    setIsCorrect(null);
    setShowComprehensionQuestion(false);
    setComprehensionQuestion(null);
    setSelectedAnswer(null);
    setShowComprehensionResult(false);
    // Clear old image immediately
    setImageUrl(null);
    setCurrentEnhancedWord(null);
  };

  const handleComprehensionAnswer = (answer: string) => {
    if (!comprehensionQuestion) return;

    setSelectedAnswer(answer);
    setShowComprehensionResult(true);

    const isCorrect = answer === comprehensionQuestion.correctAnswer;

    // Record comprehension mastery
    if (currentEnhancedWord) {
      recordComprehensionResult(currentEnhancedWord.word, isCorrect);
    }

    if (isCorrect) {
      console.log('✅ Comprehension question answered correctly!');
      playSuccessSequence('wordComplete');
      setShowStarBurst(true);
      setTimeout(() => setShowStarBurst(false), 1000);

      // Audio feedback for correct answer
      if (ttsEnabled) {
        setTimeout(() => {
          speak("That's correct! Great job!");
        }, 500);
      }
    } else {
      console.log('❌ Comprehension question answered incorrectly');

      // Audio feedback for incorrect answer - gentle guidance
      if (ttsEnabled) {
        setTimeout(() => {
          speak("Try the other one!");
        }, 500);
      }
    }

    // Move to next task after showing result
    setTimeout(() => {
      loadNextTask();
    }, 3000);
  };

  // Helper function to normalize text (case-insensitive, ignore punctuation)
  const normalizeText = (text: string): string => {
    return text.toLowerCase().replace(/[.,!?;:'"]/g, '').trim();
  };

  // Check and unlock achievements
  const checkAchievements = () => {
    // First Word Badge
    if (score === 10 && mode === 'words') {
      const badge = unlockBadge('first_word');
      if (badge) {
        setUnlockedBadge(badge);
        setShowBadgeUnlock(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }

    // Combo King - 50 streak
    if (streak === 50) {
      const badge = unlockBadge('combo_king');
      if (badge) {
        setUnlockedBadge(badge);
        setShowBadgeUnlock(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }

    // Week Warrior - 7 streak (treating as 7 in a row for now)
    if (streak === 7) {
      const badge = unlockBadge('week_streak');
      if (badge) {
        setUnlockedBadge(badge);
        setShowBadgeUnlock(true);
        setShowStarBurst(true);
        setTimeout(() => setShowStarBurst(false), 2000);
      }
    }

    // Rising Star - level 10 (when score reaches 100)
    if (score === 100) {
      const badge = unlockBadge('level_10');
      if (badge) {
        setUnlockedBadge(badge);
        setShowBadgeUnlock(true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }

    // Early Bird / Night Owl - time-based
    const hour = new Date().getHours();
    if (hour < 8 && score === 10) {
      const badge = unlockBadge('early_bird');
      if (badge) {
        setUnlockedBadge(badge);
        setShowBadgeUnlock(true);
      }
    } else if (hour >= 22 && score === 10) {
      const badge = unlockBadge('night_owl');
      if (badge) {
        setUnlockedBadge(badge);
        setShowBadgeUnlock(true);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentInput(value);

    // Normalize both input and target for comparison
    const normalizedInput = normalizeText(value);
    const normalizedTarget = normalizeText(currentContent.currentItem);

    // Character-by-character validation for real-time feedback
    const targetChars = normalizedTarget.split('');
    const inputChars = normalizedInput.split('');

    // Check if there's a typing error (wrong character)
    let hasError = false;
    for (let i = 0; i < inputChars.length; i++) {
      if (inputChars[i] !== targetChars[i]) {
        hasError = true;
        // Track the mistake for AI analysis
        const mistake: TypingMistake = {
          expected: targetChars[i] || '',
          typed: inputChars[i] || '',
          position: i,
          timestamp: Date.now(),
          context: currentContent.currentItem,
        };
        setTypingMistakes(prev => [...prev.slice(-20), mistake]); // Keep last 20 mistakes
        break;
      }
    }
    setHasTypingError(hasError);

    // Check if input matches target (case-insensitive, no punctuation)
    if (normalizedInput === normalizedTarget) {
      setIsCorrect(true);
      setHasTypingError(false);
      setScore((prev) => prev + 10);
      setStreak((prev) => prev + 1);

      // Record word mastery - typing was successful
      if (mode === 'words' && currentEnhancedWord) {
        recordTypingResult(currentEnhancedWord.word, currentEnhancedWord.category, true);
      }

      // Track words typed for session
      const wordsInItem = currentContent.currentItem.split(' ').length;
      setWordsTypedInSession(prev => prev + wordsInItem);

      // Calculate accuracy for this item
      const accuracy = typingMistakes.length === 0 ? 100 : Math.max(0, 100 - (typingMistakes.length * 10));

      // Record session performance for AI analysis
      const timeSpent = (Date.now() - sessionStartTime) / 1000; // seconds
      const performance: SessionPerformance = {
        timestamp: Date.now(),
        accuracy,
        speed: wordsInItem / (timeSpent / 60), // WPM
        wordsTyped: wordsInItem,
        mistakes: typingMistakes,
        contentType: mode === 'letters' ? 'words' : mode === 'words' ? 'words' : mode === 'sentences' ? 'sentences' : 'stories',
        difficulty: mode === 'letters' || mode === 'words' ? 'easy' : mode === 'sentences' ? 'medium' : 'hard',
      };
      skillAssessment.recordSession(performance);

      // Calculate and award XP
      const xp = levelSystem.calculateExperiencePoints({
        accuracy,
        wordsTyped: wordsInItem,
        mistakeCount: typingMistakes.length,
      });
      levelSystem.addExperience(xp);
      console.log(`🎯 Earned ${xp} XP!`);

      // Check for level advancement
      const metrics = skillAssessment.calculateMetrics();
      const { canAdvance, missingRequirements } = levelSystem.checkLevelAdvancement(metrics);

      if (canAdvance) {
        const result = levelSystem.advanceLevel();
        if (result.success && result.newLevel) {
          setCurrentLevel(result.newLevel);
          setLevelUpMessage(result.message);
          setShowLevelUp(true);
          setShowConfetti(true);
          setTimeout(() => {
            setShowLevelUp(false);
            setShowConfetti(false);
          }, 5000);
          console.log('🎉 LEVEL UP!', result.newLevel.name);
        }
      } else if (missingRequirements.length > 0) {
        console.log('📈 Progress to next level:', missingRequirements.slice(0, 2).join(', '));
      }

      // Play success sound based on mode
      const soundType = mode === 'letters' ? 'wordComplete' :
                       mode === 'words' ? 'wordComplete' :
                       mode === 'sentences' ? 'sentenceComplete' : 'levelComplete';
      playSuccessSequence(soundType);

      // Show star burst celebration
      setShowStarBurst(true);
      setTimeout(() => setShowStarBurst(false), 1500);

      // Reward pet with XP
      if (addXP) {
        addXP(10); // Give 10 XP for each completed task
      }

      // Check for achievements
      setTimeout(() => {
        checkAchievements();
      }, 100);

      // Clear mistakes for next item
      setTypingMistakes([]);

      // Show comprehension question for words mode
      if (mode === 'words' && currentEnhancedWord) {
        setTimeout(async () => {
          try {
            const questions = await comprehensionService.generateComprehensionQuestions(
              currentEnhancedWord.word,
              'word',
              currentEnhancedWord
            );

            if (questions.length > 0) {
              const question = questions[0];
              setComprehensionQuestion(question);

              // Fetch images for picture-based comprehension
              if (question.usePictures) {
                await fetchComprehensionImages(question);
              }

              // Read the question aloud (but not the answer options)
              if (ttsEnabled) {
                speak(question.question);
              }

              setShowComprehensionQuestion(true);
              setSelectedAnswer(null);
              setShowComprehensionResult(false);
            } else {
              loadNextTask();
            }
          } catch (error) {
            console.error('Failed to generate comprehension question:', error);
            loadNextTask();
          }
        }, 1500);
      } else {
        // Move to next after a delay for other modes
        setTimeout(() => {
          loadNextTask();
        }, 1500);
      }
    } else if (normalizedTarget.startsWith(normalizedInput) && normalizedInput.length > 0) {
      // Partially correct - typing in progress
      setIsCorrect(null);
    } else if (normalizedInput.length > 0) {
      // Incorrect
      setIsCorrect(false);
      setStreak(0);
    }
  };

  const modeInfo = {
    letters: {
      title: 'Letter Practice',
      icon: '🔤',
      color: 'from-green-400 to-emerald-500',
      description: 'Learn one letter at a time',
    },
    words: {
      title: 'Word Building',
      icon: '📝',
      color: 'from-blue-400 to-cyan-500',
      description: 'Practice typing simple words',
    },
    sentences: {
      title: 'Sentence Practice',
      icon: '✍️',
      color: 'from-purple-400 to-pink-500',
      description: 'Type complete sentences',
    },
    stories: {
      title: 'Story Mode',
      icon: '📖',
      color: 'from-orange-400 to-red-500',
      description: 'Interactive story typing',
    },
  };

  return (
    <div className="learning-screen min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
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
          onClick={() => navigate('/')}
          className="mb-4 text-purple-600 hover:text-purple-700 flex items-center gap-2 text-lg"
        >
          ← Back to Home
        </button>

        <div className={`p-6 rounded-2xl bg-gradient-to-r ${modeInfo[mode].color} text-white shadow-lg`}>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{modeInfo[mode].icon}</span>
            <div>
              <h1 className="text-4xl font-bold mb-2">{modeInfo[mode].title}</h1>
              <p className="text-xl opacity-90">{modeInfo[mode].description}</p>
            </div>
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
          <div className={`bg-gradient-to-br ${currentLevel.color} p-4 rounded-xl shadow-md text-center`}>
            <div className="text-3xl font-bold text-white flex items-center justify-center gap-2">
              {currentLevel.icon}
              <span>{currentLevel.id}</span>
            </div>
            <div className="text-sm text-white font-medium">{currentLevel.name}</div>
          </div>
        </div>
      </div>

      {/* Main Learning Area */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* Visual Prompt Area */}
          <div className="visual-prompt-area mb-8">
            <motion.div
              key={taskIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl overflow-hidden"
            >
              {imageUrl && mode !== 'letters' ? (
                <>
                  <img
                    src={imageUrl}
                    alt={currentContent.currentItem}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <p className="text-2xl text-white font-bold text-center">
                      {currentContent.description}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex justify-center items-center h-full">
                  {loadingImage ? (
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-xl text-gray-600">Loading image...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-9xl mb-4">
                        {currentContent.currentItem.toUpperCase()}
                      </div>
                      <p className="text-2xl text-gray-700">{currentContent.description}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Enhanced Word Information - Definition and Example */}
            {mode === 'words' && currentEnhancedWord && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-200"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">💡</span>
                  <div>
                    <p className="text-lg font-bold text-gray-800 mb-1">
                      What is a {currentEnhancedWord.word}?
                    </p>
                    <p className="text-xl text-gray-700 mb-3">
                      {currentEnhancedWord.definition}
                    </p>
                    <div className="flex items-start gap-2">
                      <span className="text-xl">📝</span>
                      <p className="text-md text-gray-600 italic">
                        Example: "{currentEnhancedWord.exampleSentence}"
                      </p>
                    </div>
                    {currentEnhancedWord.soundsLike && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-lg">🔊</span>
                        <p className="text-sm text-gray-500">
                          Sounds like: <span className="font-mono font-bold">{currentEnhancedWord.soundsLike}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Target Text Display with Character-by-Character Feedback */}
          <div className="target-text mb-6">
            <div className="bg-gray-50 p-8 rounded-xl text-center">
              <motion.div
                key={currentContent.currentItem}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-bold tracking-wider flex justify-center gap-1 flex-wrap"
              >
                {currentContent.currentItem.split('').map((char, index) => {
                  const normalizedTarget = normalizeText(currentContent.currentItem);
                  const normalizedInput = normalizeText(currentInput);
                  const targetChar = normalizedTarget[index];
                  const inputChar = normalizedInput[index];

                  let color = 'text-gray-400'; // Not typed yet
                  if (index < normalizedInput.length) {
                    if (inputChar === targetChar) {
                      color = 'text-green-600'; // Correct
                    } else {
                      color = 'text-red-600 animate-pulse'; // Wrong - red and pulse
                    }
                  } else if (index === normalizedInput.length) {
                    color = 'text-blue-600 underline decoration-4'; // Current letter to type
                  }

                  return (
                    <span key={index} className={`${color} transition-all duration-200`}>
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  );
                })}
              </motion.div>
            </div>
            {/* Error Feedback & Backspace Prompt */}
            {hasTypingError && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-4 p-4 bg-red-100 border-2 border-red-400 rounded-xl"
              >
                <div className="flex items-center justify-center gap-3 text-lg">
                  <span className="text-3xl">⬅️</span>
                  <div>
                    <p className="text-red-700 font-bold">Oops! Wrong letter!</p>
                    <p className="text-red-600 text-sm">Press Backspace to fix it 🔙</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Read Aloud Button */}
            {ttsEnabled && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => speak(currentContent.currentItem)}
                  className="px-6 py-3 bg-blue-500 text-white rounded-full font-bold hover:bg-blue-600 transition-colors shadow-lg flex items-center gap-2 mx-auto"
                >
                  🔊 Read Aloud
                </button>
              </div>
            )}
          </div>

          {/* Typing Input */}
          <div className="typing-input-area mb-6">
            <input
              type="text"
              value={currentInput}
              onChange={handleInputChange}
              placeholder="Start typing here..."
              autoFocus
              className={`w-full p-6 text-3xl text-center rounded-xl border-4 transition-all ${
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
                    handleInputChange({ target: { value: currentInput.slice(0, -1) } } as any);
                  } else if (key === ' ') {
                    handleInputChange({ target: { value: currentInput + ' ' } } as any);
                  } else if (key.length === 1) {
                    handleInputChange({ target: { value: currentInput + key.toLowerCase() } } as any);
                  }
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
                <span className="font-bold">Perfect!</span>
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
                <span className="font-bold">Try again - you've got this!</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Pet Companion */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-white rounded-2xl shadow-md p-6 text-center"
        >
          <div className="text-6xl mb-3">🐱</div>
          <p className="text-lg text-gray-700 font-medium">
            {streak > 5 ? "You're on fire! Keep it up! 🔥" : streak > 0 ? 'Great job! 🌟' : 'You can do it! 💪'}
          </p>
        </motion.div>
      </div>

      {/* Mode Switcher (Footer) */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Switch Practice Mode
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.keys(modeInfo) as LearningMode[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setCurrentInput('');
                  setIsCorrect(null);
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  mode === m
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-purple-300'
                }`}
              >
                <div className="text-3xl mb-2">{modeInfo[m].icon}</div>
                <div className="font-medium text-sm">{modeInfo[m].title}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Celebrations and Badge Unlocks */}
      <ConfettiExplosion show={showConfetti} />
      <StarBurst show={showStarBurst} />

      {unlockedBadge && (
        <AchievementUnlock
          show={showBadgeUnlock}
          title={unlockedBadge.name}
          description={unlockedBadge.description}
          icon={unlockedBadge.icon}
          onClose={() => {
            setShowBadgeUnlock(false);
            setUnlockedBadge(null);
          }}
        />
      )}

      {/* Level Up Celebration */}
      {showLevelUp && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
        >
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className={`bg-gradient-to-br ${currentLevel.color} p-12 rounded-3xl shadow-2xl max-w-2xl mx-auto text-center`}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="text-9xl mb-6"
            >
              {currentLevel.icon}
            </motion.div>
            <h2 className="text-6xl font-bold text-white mb-4">
              🎉 LEVEL UP! 🎉
            </h2>
            <div className="text-3xl font-bold text-white mb-4">
              {currentLevel.title}
            </div>
            <p className="text-2xl text-white/90 mb-6">
              {levelUpMessage}
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-6">
              <p className="text-xl text-white font-medium">
                {currentLevel.description}
              </p>
            </div>
            {currentLevel.rewards.unlocks && currentLevel.rewards.unlocks.length > 0 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <p className="text-lg text-white font-bold mb-2">🔓 Unlocked:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {currentLevel.rewards.unlocks.map((unlock, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white/30 rounded-full text-white text-sm font-medium">
                      {unlock}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Reading Comprehension Question Modal - PICTURE BASED */}
      {showComprehensionQuestion && comprehensionQuestion && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full p-6 md:p-8"
          >
            {/* Question Header */}
            <div className="text-center mb-6">
              <div className="text-5xl md:text-6xl mb-4">🤔</div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                {comprehensionQuestion.question}
              </h3>
              <p className="text-base md:text-lg text-gray-600">
                Tap the correct picture!
              </p>
            </div>

            {/* Picture Options - Side by Side (Left/Right) */}
            {comprehensionQuestion.usePictures && comprehensionImages.correct && comprehensionImages.wrong ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Left Picture */}
                <motion.button
                  whileHover={{ scale: showComprehensionResult ? 1 : 1.03 }}
                  whileTap={{ scale: showComprehensionResult ? 1 : 0.97 }}
                  onClick={() => {
                    if (!showComprehensionResult) {
                      const isLeftCorrect = !comprehensionImages.randomizeRight;
                      const answer = isLeftCorrect
                        ? comprehensionQuestion.correctAnswer
                        : comprehensionQuestion.wrongAnswers[0];
                      handleComprehensionAnswer(answer);
                      console.log('🖱️ Selected LEFT picture');
                    }
                  }}
                  disabled={showComprehensionResult}
                  className={`relative group rounded-2xl overflow-hidden border-4 transition-all ${
                    selectedAnswer === (comprehensionImages.randomizeRight ? comprehensionQuestion.wrongAnswers[0] : comprehensionQuestion.correctAnswer) && showComprehensionResult
                      ? !comprehensionImages.randomizeRight
                        ? 'border-green-500 ring-8 ring-green-300'
                        : 'border-red-500 ring-8 ring-red-300'
                      : 'border-purple-300 hover:border-purple-500'
                  } ${showComprehensionResult ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {/* Picture */}
                  <div className="aspect-[4/3] bg-gray-100">
                    {loadingComprehensionImages ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
                      </div>
                    ) : (
                      <img
                        src={comprehensionImages.randomizeRight ? comprehensionImages.wrong : comprehensionImages.correct}
                        alt="Option"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  {/* Result Indicator */}
                  {selectedAnswer === (comprehensionImages.randomizeRight ? comprehensionQuestion.wrongAnswers[0] : comprehensionQuestion.correctAnswer) && showComprehensionResult && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute inset-0 flex items-center justify-center ${
                        !comprehensionImages.randomizeRight ? 'bg-green-500/80' : 'bg-red-500/80'
                      }`}
                    >
                      <div className="text-8xl">
                        {!comprehensionImages.randomizeRight ? '✅' : '❌'}
                      </div>
                    </motion.div>
                  )}
                  {/* Hover Effect */}
                  {!showComprehensionResult && (
                    <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 transition-all"></div>
                  )}
                </motion.button>

                {/* Right Picture */}
                <motion.button
                  whileHover={{ scale: showComprehensionResult ? 1 : 1.03 }}
                  whileTap={{ scale: showComprehensionResult ? 1 : 0.97 }}
                  onClick={() => {
                    if (!showComprehensionResult) {
                      const isRightCorrect = comprehensionImages.randomizeRight;
                      const answer = isRightCorrect
                        ? comprehensionQuestion.correctAnswer
                        : comprehensionQuestion.wrongAnswers[0];
                      handleComprehensionAnswer(answer);
                      console.log('🖱️ Selected RIGHT picture');
                    }
                  }}
                  disabled={showComprehensionResult}
                  className={`relative group rounded-2xl overflow-hidden border-4 transition-all ${
                    selectedAnswer === (comprehensionImages.randomizeRight ? comprehensionQuestion.correctAnswer : comprehensionQuestion.wrongAnswers[0]) && showComprehensionResult
                      ? comprehensionImages.randomizeRight
                        ? 'border-green-500 ring-8 ring-green-300'
                        : 'border-red-500 ring-8 ring-red-300'
                      : 'border-purple-300 hover:border-purple-500'
                  } ${showComprehensionResult ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {/* Picture */}
                  <div className="aspect-[4/3] bg-gray-100">
                    {loadingComprehensionImages ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
                      </div>
                    ) : (
                      <img
                        src={comprehensionImages.randomizeRight ? comprehensionImages.correct : comprehensionImages.wrong}
                        alt="Option"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  {/* Result Indicator */}
                  {selectedAnswer === (comprehensionImages.randomizeRight ? comprehensionQuestion.correctAnswer : comprehensionQuestion.wrongAnswers[0]) && showComprehensionResult && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute inset-0 flex items-center justify-center ${
                        comprehensionImages.randomizeRight ? 'bg-green-500/80' : 'bg-red-500/80'
                      }`}
                    >
                      <div className="text-8xl">
                        {comprehensionImages.randomizeRight ? '✅' : '❌'}
                      </div>
                    </motion.div>
                  )}
                  {/* Hover Effect */}
                  {!showComprehensionResult && (
                    <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/10 transition-all"></div>
                  )}
                </motion.button>
              </div>
            ) : (
              // Fallback to text-based if pictures not available
              <div className="space-y-4 mb-6">
                {[comprehensionQuestion.correctAnswer, ...comprehensionQuestion.wrongAnswers]
                  .sort(() => Math.random() - 0.5)
                  .map((answer, idx) => {
                    const isSelected = selectedAnswer === answer;
                    const isCorrect = answer === comprehensionQuestion.correctAnswer;
                    const showResult = showComprehensionResult && isSelected;

                    return (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: showComprehensionResult ? 1 : 1.02 }}
                        whileTap={{ scale: showComprehensionResult ? 1 : 0.98 }}
                        onClick={() => !showComprehensionResult && handleComprehensionAnswer(answer)}
                        disabled={showComprehensionResult}
                        className={`w-full p-6 rounded-xl text-left text-xl font-medium transition-all ${
                          showResult && isCorrect
                            ? 'bg-green-100 border-4 border-green-500 text-green-800'
                            : showResult && !isCorrect
                            ? 'bg-red-100 border-4 border-red-500 text-red-800'
                            : isSelected
                            ? 'bg-purple-100 border-4 border-purple-500'
                            : 'bg-gray-50 border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                        } ${showComprehensionResult ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">
                            {showResult && isCorrect ? '✅' : showResult && !isCorrect ? '❌' : String.fromCharCode(65 + idx)}
                          </span>
                          <span>{answer}</span>
                        </div>
                      </motion.button>
                    );
                  })}
              </div>
            )}

            {/* Explanation (shown after answer) */}
            {showComprehensionResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 rounded-xl ${
                  selectedAnswer === comprehensionQuestion.correctAnswer
                    ? 'bg-green-50 border-2 border-green-300'
                    : 'bg-blue-50 border-2 border-blue-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl md:text-4xl">
                    {selectedAnswer === comprehensionQuestion.correctAnswer ? '🎉' : '💡'}
                  </span>
                  <div>
                    <p className="text-lg md:text-xl font-bold text-gray-800 mb-2">
                      {selectedAnswer === comprehensionQuestion.correctAnswer ? 'Great job!' : 'Good try!'}
                    </p>
                    <p className="text-base md:text-lg text-gray-700">
                      {comprehensionQuestion.explanation}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default LearningScreen;
