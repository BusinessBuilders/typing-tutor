/**
 * Character Validator
 * Step 122 - Validate and normalize typed characters
 */

export interface ValidationOptions {
  caseSensitive?: boolean;
  allowSpaces?: boolean;
  allowPunctuation?: boolean;
  allowNumbers?: boolean;
  allowSpecialChars?: boolean;
  customAllowedChars?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  normalizedChar: string;
  reason?: string;
}

/**
 * Validate a single character against rules
 */
export function validateCharacter(
  char: string,
  options: ValidationOptions = {}
): ValidationResult {
  const {
    caseSensitive = false,
    allowSpaces = true,
    allowPunctuation = true,
    allowNumbers = true,
    allowSpecialChars = false,
    customAllowedChars = [],
  } = options;

  // Empty character
  if (!char || char.length === 0) {
    return {
      isValid: false,
      normalizedChar: '',
      reason: 'Empty character',
    };
  }

  // Multi-character strings (only first char is used)
  const singleChar = char[0];
  const normalizedChar = caseSensitive ? singleChar : singleChar.toLowerCase();

  // Check custom allowed characters first
  if (customAllowedChars.length > 0) {
    const isInCustomList = customAllowedChars.some((allowed) =>
      caseSensitive ? allowed === singleChar : allowed.toLowerCase() === normalizedChar
    );

    return {
      isValid: isInCustomList,
      normalizedChar,
      reason: isInCustomList ? undefined : 'Character not in allowed list',
    };
  }

  // Space validation
  if (singleChar === ' ') {
    return {
      isValid: allowSpaces,
      normalizedChar,
      reason: allowSpaces ? undefined : 'Spaces not allowed',
    };
  }

  // Letter validation (a-z, A-Z)
  if (/[a-zA-Z]/.test(singleChar)) {
    return {
      isValid: true,
      normalizedChar,
    };
  }

  // Number validation (0-9)
  if (/[0-9]/.test(singleChar)) {
    return {
      isValid: allowNumbers,
      normalizedChar,
      reason: allowNumbers ? undefined : 'Numbers not allowed',
    };
  }

  // Punctuation validation (.,!?;:)
  if (/[.,!?;:]/.test(singleChar)) {
    return {
      isValid: allowPunctuation,
      normalizedChar,
      reason: allowPunctuation ? undefined : 'Punctuation not allowed',
    };
  }

  // Special characters validation
  return {
    isValid: allowSpecialChars,
    normalizedChar,
    reason: allowSpecialChars ? undefined : 'Special characters not allowed',
  };
}

/**
 * Compare two characters for equality
 */
export function compareCharacters(
  input: string,
  expected: string,
  caseSensitive = false
): boolean {
  if (!input || !expected) return false;

  const normalizedInput = caseSensitive ? input : input.toLowerCase();
  const normalizedExpected = caseSensitive ? expected : expected.toLowerCase();

  return normalizedInput === normalizedExpected;
}

/**
 * Validate an entire string against target
 */
export function validateString(
  input: string,
  target: string,
  options: ValidationOptions = {}
): {
  isValid: boolean;
  errors: Array<{ position: number; expected: string; received: string }>;
  accuracy: number;
} {
  const { caseSensitive = false } = options;
  const errors: Array<{ position: number; expected: string; received: string }> = [];

  const maxLength = Math.max(input.length, target.length);

  for (let i = 0; i < maxLength; i++) {
    const inputChar = input[i] || '';
    const targetChar = target[i] || '';

    if (inputChar && targetChar) {
      const match = compareCharacters(inputChar, targetChar, caseSensitive);
      if (!match) {
        errors.push({
          position: i,
          expected: targetChar,
          received: inputChar,
        });
      }
    } else if (inputChar && !targetChar) {
      // Extra characters
      errors.push({
        position: i,
        expected: '',
        received: inputChar,
      });
    } else if (!inputChar && targetChar) {
      // Missing characters
      errors.push({
        position: i,
        expected: targetChar,
        received: '',
      });
    }
  }

  const accuracy = maxLength > 0 ? ((maxLength - errors.length) / maxLength) * 100 : 100;

  return {
    isValid: errors.length === 0,
    errors,
    accuracy,
  };
}

/**
 * Sanitize input text (remove invalid characters)
 */
export function sanitizeInput(
  input: string,
  options: ValidationOptions = {}
): string {
  return input
    .split('')
    .filter((char) => validateCharacter(char, options).isValid)
    .join('');
}

/**
 * Check if character is a control character (Enter, Tab, etc.)
 */
export function isControlCharacter(key: string): boolean {
  const controlChars = [
    'Enter',
    'Tab',
    'Escape',
    'Backspace',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
    'PageUp',
    'PageDown',
    'Shift',
    'Control',
    'Alt',
    'Meta',
    'CapsLock',
  ];

  return controlChars.includes(key) || key.startsWith('F'); // F1-F12
}

/**
 * Get character category
 */
export function getCharacterCategory(char: string):
  | 'letter'
  | 'number'
  | 'space'
  | 'punctuation'
  | 'special'
  | 'control'
  | 'unknown' {
  if (!char || char.length === 0) return 'unknown';

  const singleChar = char[0];

  if (isControlCharacter(char)) return 'control';
  if (singleChar === ' ') return 'space';
  if (/[a-zA-Z]/.test(singleChar)) return 'letter';
  if (/[0-9]/.test(singleChar)) return 'number';
  if (/[.,!?;:'"-]/.test(singleChar)) return 'punctuation';

  return 'special';
}

/**
 * Common character sets for different difficulty levels
 */
export const CHARACTER_SETS = {
  beginner: {
    letters: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '',
    punctuation: '',
    special: '',
  },
  intermediate: {
    letters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    punctuation: '.,!?',
    special: '',
  },
  advanced: {
    letters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    punctuation: '.,!?;:\'"()-',
    special: '@#$%&*',
  },
};

/**
 * Get allowed characters for difficulty level
 */
export function getAllowedCharacters(
  level: 'beginner' | 'intermediate' | 'advanced'
): string[] {
  const set = CHARACTER_SETS[level];
  return [
    ...set.letters.split(''),
    ...set.numbers.split(''),
    ...set.punctuation.split(''),
    ...set.special.split(''),
    ' ', // Always allow spaces
  ];
}

/**
 * Normalize text for comparison
 */
export function normalizeText(
  text: string,
  options: { caseSensitive?: boolean; trimSpaces?: boolean } = {}
): string {
  const { caseSensitive = false, trimSpaces = false } = options;

  let normalized = text;

  if (!caseSensitive) {
    normalized = normalized.toLowerCase();
  }

  if (trimSpaces) {
    normalized = normalized.trim().replace(/\s+/g, ' ');
  }

  return normalized;
}

/**
 * Check if input matches target at current position
 */
export function isCharacterMatch(
  input: string,
  target: string,
  position: number,
  caseSensitive = false
): boolean {
  const inputChar = input[position];
  const targetChar = target[position];

  if (!inputChar || !targetChar) return false;

  return compareCharacters(inputChar, targetChar, caseSensitive);
}

/**
 * Get similarity score between two strings (0-100)
 */
export function getSimilarityScore(str1: string, str2: string): number {
  if (str1 === str2) return 100;
  if (!str1 || !str2) return 0;

  const maxLength = Math.max(str1.length, str2.length);
  let matches = 0;

  for (let i = 0; i < maxLength; i++) {
    if (str1[i] && str2[i] && str1[i].toLowerCase() === str2[i].toLowerCase()) {
      matches++;
    }
  }

  return (matches / maxLength) * 100;
}
