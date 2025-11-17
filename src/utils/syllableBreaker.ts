/**
 * Syllable Breaker Utility
 * Step 135 - Break words into syllables for easier reading
 */

/**
 * Simple syllable breaking algorithm
 * Based on common English patterns
 */
export function breakIntoSyllables(word: string): string[] {
  if (!word || word.length === 0) return [];

  const lowerWord = word.toLowerCase();

  // Handle common prefixes
  const prefixes = ['un', 're', 'in', 'dis', 'en', 'non', 'pre', 'mis', 'over', 'de'];
  for (const prefix of prefixes) {
    if (lowerWord.startsWith(prefix) && lowerWord.length > prefix.length + 2) {
      const rest = breakIntoSyllables(word.slice(prefix.length));
      return [word.slice(0, prefix.length), ...rest];
    }
  }

  // Handle common suffixes
  const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 'tion', 'sion', 'ness', 'ment', 'ful'];
  for (const suffix of suffixes) {
    if (lowerWord.endsWith(suffix) && lowerWord.length > suffix.length + 2) {
      const rest = breakIntoSyllables(word.slice(0, -suffix.length));
      return [...rest, word.slice(-suffix.length)];
    }
  }

  // Vowel patterns
  const vowels = 'aeiouy';
  const syllables: string[] = [];
  let currentSyllable = '';

  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    const isVowel = vowels.includes(char.toLowerCase());
    const nextChar = word[i + 1];
    const nextIsVowel = nextChar && vowels.includes(nextChar.toLowerCase());

    currentSyllable += char;

    // Split on consonant-vowel boundaries
    if (!isVowel && nextIsVowel && currentSyllable.length > 1) {
      syllables.push(currentSyllable);
      currentSyllable = '';
    }
    // Split on double consonants
    else if (
      !isVowel &&
      nextChar &&
      !nextIsVowel &&
      char.toLowerCase() !== nextChar.toLowerCase() &&
      currentSyllable.length > 1
    ) {
      syllables.push(currentSyllable);
      currentSyllable = '';
    }
  }

  if (currentSyllable) {
    syllables.push(currentSyllable);
  }

  return syllables.length > 0 ? syllables : [word];
}

/**
 * Break a sentence into syllable-separated words
 */
export function breakSentenceIntoSyllables(sentence: string): Array<{
  word: string;
  syllables: string[];
}> {
  const words = sentence.split(/\s+/);
  return words.map((word) => ({
    word,
    syllables: breakIntoSyllables(word),
  }));
}

/**
 * Count syllables in a word
 */
export function countSyllables(word: string): number {
  return breakIntoSyllables(word).length;
}

/**
 * Get syllable breakdown with indices
 */
export function getSyllableIndices(word: string): Array<{
  syllable: string;
  start: number;
  end: number;
}> {
  const syllables = breakIntoSyllables(word);
  let currentIndex = 0;

  return syllables.map((syllable) => {
    const start = currentIndex;
    const end = start + syllable.length;
    currentIndex = end;

    return { syllable, start, end };
  });
}

/**
 * Common word syllable dictionary (for accuracy)
 */
export const SYLLABLE_DICTIONARY: Record<string, string[]> = {
  // Common words
  the: ['the'],
  and: ['and'],
  for: ['for'],
  are: ['are'],
  but: ['but'],
  not: ['not'],
  you: ['you'],
  all: ['all'],
  can: ['can'],
  had: ['had'],
  her: ['her'],
  was: ['was'],
  one: ['one'],
  our: ['our'],
  out: ['out'],

  // Two syllable words
  water: ['wa', 'ter'],
  happy: ['hap', 'py'],
  table: ['ta', 'ble'],
  people: ['peo', 'ple'],
  mother: ['moth', 'er'],
  father: ['fa', 'ther'],
  sister: ['sis', 'ter'],
  brother: ['broth', 'er'],
  family: ['fam', 'i', 'ly'],
  animal: ['an', 'i', 'mal'],
  computer: ['com', 'put', 'er'],
  elephant: ['el', 'e', 'phant'],
  butterfly: ['but', 'ter', 'fly'],

  // Common typing words
  typing: ['typ', 'ing'],
  keyboard: ['key', 'board'],
  practice: ['prac', 'tice'],
  exercise: ['ex', 'er', 'cise'],
  learning: ['learn', 'ing'],
};

/**
 * Get syllables from dictionary or fallback to algorithm
 */
export function getSyllables(word: string): string[] {
  const lowerWord = word.toLowerCase();

  // Check dictionary first
  if (SYLLABLE_DICTIONARY[lowerWord]) {
    return SYLLABLE_DICTIONARY[lowerWord];
  }

  // Fallback to algorithm
  return breakIntoSyllables(word);
}
