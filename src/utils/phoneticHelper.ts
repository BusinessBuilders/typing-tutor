/**
 * Phonetic Helper Utility
 * Step 136 - Convert text to phonetic representations for pronunciation hints
 */

/**
 * Simplified phonetic representation (not IPA, but easier to read)
 */
export interface PhoneticRepresentation {
  word: string;
  phonetic: string;
  syllables: string[];
  phoneticSyllables: string[];
  stress?: number[]; // Index of stressed syllables
}

/**
 * Common phonetic patterns for simplified phonetics
 * Using a simplified system that's easier for learners
 */
const PHONETIC_PATTERNS: Record<string, string> = {
  // Vowel patterns
  'tion': 'shun',
  'sion': 'shun',
  'ough': 'uff',
  'augh': 'awf',
  'eigh': 'ay',
  'igh': 'eye',
  'ight': 'ite',
  'ea': 'ee',
  'ee': 'ee',
  'oo': 'oo',
  'ou': 'ow',
  'ow': 'ow',
  'ai': 'ay',
  'ay': 'ay',
  'oi': 'oy',
  'oy': 'oy',
  'au': 'aw',
  'aw': 'aw',
  'ie': 'ee',
  'ei': 'ee',

  // Consonant patterns
  'ch': 'ch',
  'sh': 'sh',
  'th': 'th',
  'ph': 'f',
  'gh': 'f',
  'wh': 'w',
  'ck': 'k',
  'qu': 'kw',
  'ng': 'ng',

  // Silent letters
  'kn': 'n',
  'gn': 'n',
  'wr': 'r',
  'mb': 'm',
};

/**
 * Common word phonetics dictionary
 */
export const PHONETIC_DICTIONARY: Record<string, string> = {
  // Common words with tricky pronunciations
  'the': 'thuh',
  'a': 'uh',
  'an': 'an',
  'and': 'and',
  'or': 'or',
  'but': 'but',
  'you': 'yoo',
  'your': 'yor',
  'are': 'ar',
  'were': 'wur',
  'was': 'wuhz',
  'is': 'iz',
  'be': 'bee',
  'been': 'bin',
  'have': 'hav',
  'has': 'haz',
  'had': 'had',
  'do': 'doo',
  'does': 'duz',
  'did': 'did',
  'will': 'wil',
  'would': 'wood',
  'could': 'kood',
  'should': 'shood',
  'can': 'kan',
  'cannot': 'kan-not',
  'said': 'sed',
  'says': 'sez',
  'one': 'wun',
  'two': 'too',
  'four': 'for',
  'eight': 'ate',
  'people': 'pee-pul',
  'where': 'wair',
  'there': 'thair',
  'their': 'thair',
  'through': 'throo',
  'though': 'thoh',
  'thought': 'thawt',
  'enough': 'ee-nuf',
  'cough': 'kawf',
  'laugh': 'laf',
  'right': 'rite',
  'write': 'rite',
  'know': 'noh',
  'knew': 'noo',
  'knight': 'nite',
  'answer': 'an-ser',
  'listen': 'lis-en',
  'often': 'off-en',
  'hour': 'ow-er',
  'honest': 'on-est',
};

/**
 * Convert word to simplified phonetic representation
 */
export function wordToPhonetic(word: string): string {
  const lowerWord = word.toLowerCase();

  // Check dictionary first
  if (PHONETIC_DICTIONARY[lowerWord]) {
    return PHONETIC_DICTIONARY[lowerWord];
  }

  let phonetic = lowerWord;

  // Apply phonetic patterns
  for (const [pattern, replacement] of Object.entries(PHONETIC_PATTERNS)) {
    const regex = new RegExp(pattern, 'gi');
    phonetic = phonetic.replace(regex, replacement);
  }

  // Handle silent 'e' at end
  if (phonetic.endsWith('e') && phonetic.length > 3) {
    phonetic = phonetic.slice(0, -1);
  }

  return phonetic;
}

/**
 * Get full phonetic representation with syllables
 */
export function getPhoneticRepresentation(
  word: string,
  syllables: string[]
): PhoneticRepresentation {
  const phonetic = wordToPhonetic(word);

  // Create phonetic syllables
  const phoneticSyllables = syllables.map((syllable) => wordToPhonetic(syllable));

  // Identify stressed syllables (simplified heuristic)
  const stress = identifyStress(syllables);

  return {
    word,
    phonetic,
    syllables,
    phoneticSyllables,
    stress,
  };
}

/**
 * Identify stressed syllables (simplified algorithm)
 * Returns array of syllable indices that should be stressed
 */
function identifyStress(syllables: string[]): number[] {
  if (syllables.length === 1) return [0];
  if (syllables.length === 2) return [0]; // First syllable usually stressed in 2-syllable words

  // For 3+ syllables, typically stress the second-to-last or first
  const stressIndex = syllables.length === 3 ? 1 : 0;
  return [stressIndex];
}

/**
 * Convert text to phonetic with word breaks
 */
export function textToPhonetic(text: string): string {
  return text
    .split(/\s+/)
    .map((word) => {
      // Preserve punctuation
      const match = word.match(/^([^a-zA-Z]*)([a-zA-Z]+)([^a-zA-Z]*)$/);
      if (match) {
        const [, prefix, letters, suffix] = match;
        return prefix + wordToPhonetic(letters) + suffix;
      }
      return wordToPhonetic(word);
    })
    .join(' ');
}

/**
 * Get pronunciation difficulty level
 */
export function getPronunciationDifficulty(word: string): {
  level: 'easy' | 'medium' | 'hard' | 'very-hard';
  reasons: string[];
  tips: string[];
} {
  const lowerWord = word.toLowerCase();
  const reasons: string[] = [];
  const tips: string[] = [];

  // Check for silent letters
  if (/^(kn|gn|wr|ps)/.test(lowerWord)) {
    reasons.push('Silent letter at start');
    tips.push('The first letter is silent');
  }

  if (/mb$/.test(lowerWord)) {
    reasons.push('Silent letter at end');
    tips.push('The "b" is silent');
  }

  // Check for complex vowel combinations
  if (/(ough|augh|eigh)/.test(lowerWord)) {
    reasons.push('Complex vowel pattern');
    tips.push('Listen carefully to the vowel sound');
  }

  // Check for uncommon letter combinations
  if (/(ph|gh|th|ch|sh)/.test(lowerWord)) {
    reasons.push('Special letter combination');
    tips.push('These letters make a unique sound together');
  }

  // Determine difficulty level
  let level: 'easy' | 'medium' | 'hard' | 'very-hard' = 'easy';

  if (reasons.length === 0) {
    level = 'easy';
  } else if (reasons.length === 1) {
    level = 'medium';
  } else if (reasons.length === 2) {
    level = 'hard';
  } else {
    level = 'very-hard';
  }

  // Add length-based difficulty
  if (word.length > 10) {
    level = level === 'easy' ? 'medium' : level === 'medium' ? 'hard' : 'very-hard';
    reasons.push('Long word');
    tips.push('Break it down into smaller parts');
  }

  return { level, reasons, tips };
}

/**
 * Get similar sounding words for comparison
 */
export function getSimilarSoundingWords(word: string): string[] {
  const phonetic = wordToPhonetic(word);
  const similar: string[] = [];

  // This is a simplified implementation
  // In a real app, you'd have a larger phonetic database
  const commonWords = Object.keys(PHONETIC_DICTIONARY);

  for (const testWord of commonWords) {
    if (testWord !== word.toLowerCase() && wordToPhonetic(testWord) === phonetic) {
      similar.push(testWord);
    }
  }

  return similar.slice(0, 3); // Return max 3 similar words
}

/**
 * Generate phonetic breakdown for teaching
 */
export function generatePhoneticBreakdown(word: string, syllables: string[]): {
  word: string;
  breakdown: Array<{
    syllable: string;
    phonetic: string;
    sounds: string[];
    tips: string;
  }>;
} {
  const breakdown = syllables.map((syllable) => {
    const phonetic = wordToPhonetic(syllable);
    const sounds = phonetic.split('').filter((c) => /[a-z]/.test(c));

    let tips = '';

    // Provide specific tips for tricky sounds
    if (syllable.includes('th')) {
      tips = 'Place tongue between teeth';
    } else if (syllable.includes('ch')) {
      tips = 'Make a "tch" sound';
    } else if (syllable.includes('sh')) {
      tips = 'Make a soft "shh" sound';
    } else if (syllable.includes('ph')) {
      tips = 'Sounds like "f"';
    } else if (syllable.includes('gh')) {
      tips = 'Usually silent or sounds like "f"';
    }

    return {
      syllable,
      phonetic,
      sounds,
      tips,
    };
  });

  return { word, breakdown };
}

/**
 * Get rhyming words (simplified)
 */
export function getRhymingWords(word: string): string[] {
  const lowerWord = word.toLowerCase();
  const ending = lowerWord.slice(-3);

  const rhymes: string[] = [];
  const commonWords = Object.keys(PHONETIC_DICTIONARY);

  for (const testWord of commonWords) {
    if (testWord !== lowerWord && testWord.endsWith(ending)) {
      rhymes.push(testWord);
    }
  }

  return rhymes.slice(0, 5);
}

/**
 * Format phonetic text with stress marks
 */
export function formatPhoneticWithStress(
  representation: PhoneticRepresentation
): string {
  return representation.phoneticSyllables
    .map((syllable, index) => {
      const isStressed = representation.stress?.includes(index);
      return isStressed ? syllable.toUpperCase() : syllable;
    })
    .join('-');
}
