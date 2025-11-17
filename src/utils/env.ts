/**
 * Environment variable utilities
 * Provides type-safe access to environment variables
 */

interface EnvConfig {
  // AI API Keys
  openaiApiKey: string;
  claudeApiKey: string;
  openrouterApiKey: string;

  // Default AI Provider
  defaultAIProvider: 'openai' | 'claude' | 'openrouter';

  // Image API
  unsplashApiKey: string;

  // API URLs
  openaiApiUrl: string;
  claudeApiUrl: string;
  openrouterApiUrl: string;

  // Environment
  env: 'development' | 'production';

  // Feature Flags
  enableAnalytics: boolean;
  enableDebugMode: boolean;
}

/**
 * Get environment variable value
 */
function getEnvVar(key: string, defaultValue: string = ''): string {
  return import.meta.env[key] || defaultValue;
}

/**
 * Get boolean environment variable
 */
function getBooleanEnvVar(key: string, defaultValue: boolean = false): boolean {
  const value = import.meta.env[key];
  if (value === undefined || value === '') return defaultValue;
  return value === 'true' || value === '1';
}

/**
 * Environment configuration object
 */
export const env: EnvConfig = {
  // AI API Keys
  openaiApiKey: getEnvVar('VITE_OPENAI_API_KEY'),
  claudeApiKey: getEnvVar('VITE_CLAUDE_API_KEY'),
  openrouterApiKey: getEnvVar('VITE_OPENROUTER_API_KEY'),

  // Default AI Provider
  defaultAIProvider: getEnvVar('VITE_DEFAULT_AI_PROVIDER', 'openai') as EnvConfig['defaultAIProvider'],

  // Image API
  unsplashApiKey: getEnvVar('VITE_UNSPLASH_API_KEY'),

  // API URLs
  openaiApiUrl: getEnvVar('VITE_OPENAI_API_URL', 'https://api.openai.com/v1'),
  claudeApiUrl: getEnvVar('VITE_CLAUDE_API_URL', 'https://api.anthropic.com'),
  openrouterApiUrl: getEnvVar('VITE_OPENROUTER_API_URL', 'https://openrouter.ai/api/v1'),

  // Environment
  env: getEnvVar('VITE_ENV', 'development') as EnvConfig['env'],

  // Feature Flags
  enableAnalytics: getBooleanEnvVar('VITE_ENABLE_ANALYTICS', false),
  enableDebugMode: getBooleanEnvVar('VITE_ENABLE_DEBUG_MODE', true),
};

/**
 * Check if an API key is configured
 */
export function hasApiKey(provider: 'openai' | 'claude' | 'openrouter'): boolean {
  switch (provider) {
    case 'openai':
      return !!env.openaiApiKey && env.openaiApiKey.length > 0;
    case 'claude':
      return !!env.claudeApiKey && env.claudeApiKey.length > 0;
    case 'openrouter':
      return !!env.openrouterApiKey && env.openrouterApiKey.length > 0;
    default:
      return false;
  }
}

/**
 * Get API key for a specific provider
 */
export function getApiKey(provider: 'openai' | 'claude' | 'openrouter'): string | null {
  switch (provider) {
    case 'openai':
      return env.openaiApiKey || null;
    case 'claude':
      return env.claudeApiKey || null;
    case 'openrouter':
      return env.openrouterApiKey || null;
    default:
      return null;
  }
}

/**
 * Check if we're in development mode
 */
export function isDevelopment(): boolean {
  return env.env === 'development';
}

/**
 * Check if we're in production mode
 */
export function isProduction(): boolean {
  return env.env === 'production';
}

export default env;
