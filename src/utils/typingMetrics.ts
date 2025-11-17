/**
 * Typing Metrics Calculator
 * Step 127 - Calculate typing speed (WPM, CPM, etc.)
 */

export interface TypingMetrics {
  wpm: number; // Words per minute
  cpm: number; // Characters per minute
  rawWPM: number; // WPM without accuracy adjustment
  netWPM: number; // WPM with accuracy adjustment
  accuracy: number; // Percentage (0-100)
  totalTime: number; // Milliseconds
  totalCharacters: number;
  correctCharacters: number;
  incorrectCharacters: number;
  totalKeystrokes: number;
}

/**
 * Calculate Words Per Minute (WPM)
 * Standard: 5 characters = 1 word
 */
export function calculateWPM(
  characters: number,
  timeMs: number
): number {
  if (timeMs === 0) return 0;

  const minutes = timeMs / 1000 / 60;
  const words = characters / 5; // Standard word length
  const wpm = words / minutes;

  return Math.round(wpm);
}

/**
 * Calculate Characters Per Minute (CPM)
 */
export function calculateCPM(
  characters: number,
  timeMs: number
): number {
  if (timeMs === 0) return 0;

  const minutes = timeMs / 1000 / 60;
  const cpm = characters / minutes;

  return Math.round(cpm);
}

/**
 * Calculate Raw WPM (including errors)
 */
export function calculateRawWPM(
  totalKeystrokes: number,
  timeMs: number
): number {
  return calculateWPM(totalKeystrokes, timeMs);
}

/**
 * Calculate Net WPM (adjusted for errors)
 * Net WPM = (Total Typed / 5 - Errors) / Minutes
 */
export function calculateNetWPM(
  totalCharacters: number,
  errors: number,
  timeMs: number
): number {
  if (timeMs === 0) return 0;

  const minutes = timeMs / 1000 / 60;
  const grossWords = totalCharacters / 5;
  const errorWords = errors / 5;
  const netWords = Math.max(0, grossWords - errorWords);
  const netWPM = netWords / minutes;

  return Math.round(netWPM);
}

/**
 * Calculate typing accuracy
 */
export function calculateAccuracy(
  correctCharacters: number,
  totalCharacters: number
): number {
  if (totalCharacters === 0) return 100;

  const accuracy = (correctCharacters / totalCharacters) * 100;
  return Math.round(accuracy * 10) / 10; // Round to 1 decimal place
}

/**
 * Calculate comprehensive typing metrics
 */
export function calculateTypingMetrics(
  input: {
    totalCharacters: number;
    correctCharacters: number;
    totalKeystrokes: number; // Includes backspaces
    startTime: number;
    endTime: number;
  }
): TypingMetrics {
  const {
    totalCharacters,
    correctCharacters,
    totalKeystrokes,
    startTime,
    endTime,
  } = input;

  const totalTime = endTime - startTime;
  const incorrectCharacters = totalCharacters - correctCharacters;

  const wpm = calculateWPM(correctCharacters, totalTime);
  const cpm = calculateCPM(correctCharacters, totalTime);
  const rawWPM = calculateRawWPM(totalKeystrokes, totalTime);
  const netWPM = calculateNetWPM(totalCharacters, incorrectCharacters, totalTime);
  const accuracy = calculateAccuracy(correctCharacters, totalCharacters);

  return {
    wpm,
    cpm,
    rawWPM,
    netWPM,
    accuracy,
    totalTime,
    totalCharacters,
    correctCharacters,
    incorrectCharacters,
    totalKeystrokes,
  };
}

/**
 * Get typing speed level classification
 */
export function getSpeedLevel(wpm: number): {
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';
  label: string;
  emoji: string;
  color: string;
} {
  if (wpm >= 80) {
    return {
      level: 'master',
      label: 'Master Typist',
      emoji: '🏆',
      color: 'text-purple-600',
    };
  }
  if (wpm >= 60) {
    return {
      level: 'expert',
      label: 'Expert',
      emoji: '⭐',
      color: 'text-yellow-600',
    };
  }
  if (wpm >= 40) {
    return {
      level: 'advanced',
      label: 'Advanced',
      emoji: '🚀',
      color: 'text-blue-600',
    };
  }
  if (wpm >= 20) {
    return {
      level: 'intermediate',
      label: 'Intermediate',
      emoji: '💪',
      color: 'text-green-600',
    };
  }
  return {
    level: 'beginner',
    label: 'Beginner',
    emoji: '🌱',
    color: 'text-gray-600',
  };
}

/**
 * Get accuracy level classification
 */
export function getAccuracyLevel(accuracy: number): {
  level: 'poor' | 'fair' | 'good' | 'excellent' | 'perfect';
  label: string;
  emoji: string;
  color: string;
} {
  if (accuracy >= 99) {
    return {
      level: 'perfect',
      label: 'Perfect!',
      emoji: '💯',
      color: 'text-purple-600',
    };
  }
  if (accuracy >= 95) {
    return {
      level: 'excellent',
      label: 'Excellent',
      emoji: '🎯',
      color: 'text-success-600',
    };
  }
  if (accuracy >= 85) {
    return {
      level: 'good',
      label: 'Good',
      emoji: '👍',
      color: 'text-blue-600',
    };
  }
  if (accuracy >= 70) {
    return {
      level: 'fair',
      label: 'Fair',
      emoji: '📈',
      color: 'text-yellow-600',
    };
  }
  return {
    level: 'poor',
    label: 'Keep Practicing',
    emoji: '💙',
    color: 'text-gray-600',
  };
}

/**
 * Calculate consistency score (lower is better)
 * Measures variation in typing speed
 */
export function calculateConsistency(
  charTimes: number[] // Time for each character
): {
  consistencyScore: number; // 0-100 (100 = perfectly consistent)
  variance: number;
  standardDeviation: number;
} {
  if (charTimes.length < 2) {
    return { consistencyScore: 100, variance: 0, standardDeviation: 0 };
  }

  // Calculate mean
  const mean = charTimes.reduce((sum, time) => sum + time, 0) / charTimes.length;

  // Calculate variance
  const squaredDiffs = charTimes.map((time) => Math.pow(time - mean, 2));
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / charTimes.length;

  // Calculate standard deviation
  const standardDeviation = Math.sqrt(variance);

  // Calculate consistency score (inverse of coefficient of variation)
  const coefficientOfVariation = (standardDeviation / mean) * 100;
  const consistencyScore = Math.max(0, 100 - coefficientOfVariation);

  return {
    consistencyScore: Math.round(consistencyScore),
    variance,
    standardDeviation,
  };
}

/**
 * Calculate estimated time to complete text
 */
export function estimateCompletionTime(
  remainingCharacters: number,
  currentWPM: number
): number {
  if (currentWPM === 0) return 0;

  const remainingWords = remainingCharacters / 5;
  const estimatedMinutes = remainingWords / currentWPM;
  const estimatedMs = estimatedMinutes * 60 * 1000;

  return Math.round(estimatedMs);
}

/**
 * Format time duration in human-readable format
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${seconds}s`;
}

/**
 * Calculate typing burst speed (peak WPM during session)
 */
export function calculateBurstSpeed(
  charTimes: number[], // Timestamp for each character
  windowSize = 10 // Number of characters to consider for burst
): number {
  if (charTimes.length < windowSize) return 0;

  let maxWPM = 0;

  for (let i = 0; i <= charTimes.length - windowSize; i++) {
    const windowStart = charTimes[i];
    const windowEnd = charTimes[i + windowSize - 1];
    const windowTime = windowEnd - windowStart;

    if (windowTime > 0) {
      const wpm = calculateWPM(windowSize, windowTime);
      maxWPM = Math.max(maxWPM, wpm);
    }
  }

  return maxWPM;
}

/**
 * Generate performance summary
 */
export function generatePerformanceSummary(metrics: TypingMetrics): {
  overall: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
} {
  const speedLevel = getSpeedLevel(metrics.wpm);
  const accuracyLevel = getAccuracyLevel(metrics.accuracy);

  const strengths: string[] = [];
  const improvements: string[] = [];
  const recommendations: string[] = [];

  // Speed analysis
  if (metrics.wpm >= 60) {
    strengths.push(`Excellent typing speed (${metrics.wpm} WPM)`);
  } else if (metrics.wpm >= 40) {
    strengths.push(`Good typing speed (${metrics.wpm} WPM)`);
  } else if (metrics.wpm < 20) {
    improvements.push('Typing speed could be improved');
    recommendations.push('Practice regularly to build muscle memory');
  }

  // Accuracy analysis
  if (metrics.accuracy >= 95) {
    strengths.push(`Outstanding accuracy (${metrics.accuracy}%)`);
  } else if (metrics.accuracy >= 85) {
    strengths.push(`Good accuracy (${metrics.accuracy}%)`);
  } else if (metrics.accuracy < 80) {
    improvements.push('Accuracy needs improvement');
    recommendations.push('Slow down and focus on precision');
  }

  // Balance analysis
  if (metrics.wpm > 50 && metrics.accuracy < 85) {
    improvements.push('Speed is good but accuracy suffers');
    recommendations.push('Try typing slower to improve accuracy');
  } else if (metrics.accuracy > 95 && metrics.wpm < 30) {
    improvements.push('Accuracy is excellent, can increase speed');
    recommendations.push('Try typing a bit faster while maintaining accuracy');
  }

  const overall =
    strengths.length > improvements.length
      ? `${speedLevel.emoji} Great job! You're a ${speedLevel.label}!`
      : `${accuracyLevel.emoji} Keep practicing! You're making progress!`;

  return {
    overall,
    strengths,
    improvements,
    recommendations,
  };
}
