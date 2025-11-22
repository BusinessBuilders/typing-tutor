/**
 * AI Service Factory
 * Creates and manages AI provider instances using factory pattern
 */

import { IAIProvider, AIConfig, AIProviderType, AIProviderError } from './types';
import OpenRouterService from './OpenRouterService';
import OpenAIService from './OpenAIService';
import ClaudeService from './ClaudeService';
import { getApiKey, hasApiKey } from '../../utils/env';

// Re-export for convenience
export type { AIProviderType };

/**
 * AI Service Factory Class
 * Implements singleton pattern for provider instances
 */
export class AIServiceFactory {
  private static instances: Map<AIProviderType, IAIProvider> = new Map();
  private static currentProvider: AIProviderType | null = null;

  /**
   * Create an AI provider instance
   */
  static createProvider(provider: AIProviderType, config?: AIConfig): IAIProvider {
    let instance: IAIProvider;

    switch (provider) {
      case 'openrouter':
        instance = new OpenRouterService();
        break;

      case 'openai':
        instance = new OpenAIService();
        break;

      case 'claude':
        instance = new ClaudeService();
        break;

      default:
        throw new AIProviderError(`Unknown provider: ${provider}`, provider);
    }

    // Initialize if config provided
    if (config) {
      instance.initialize(config);
    }

    return instance;
  }

  /**
   * Get or create a provider instance (singleton)
   */
  static getProvider(provider: AIProviderType, config?: AIConfig): IAIProvider {
    // Check if instance exists
    if (this.instances.has(provider)) {
      const instance = this.instances.get(provider)!;

      // Re-initialize if new config provided
      if (config) {
        instance.initialize(config);
      }

      return instance;
    }

    // Create new instance
    const instance = this.createProvider(provider, config);
    this.instances.set(provider, instance);

    return instance;
  }

  /**
   * Initialize provider with API key from environment
   */
  static initializeFromEnv(provider: AIProviderType): IAIProvider | null {
    console.log('🔑 Loading API key for provider:', provider);
    const apiKey = getApiKey(provider);

    if (!apiKey) {
      console.error(`❌ No API key found for provider: ${provider}`);
      console.log('💡 Make sure your .env file has VITE_OPENAI_API_KEY set');
      return null;
    }

    console.log('✅ API key found, length:', apiKey.length);

    const config: AIConfig = {
      provider,
      apiKey,
    };

    return this.getProvider(provider, config);
  }

  /**
   * Get the first available configured provider
   */
  static getAvailableProvider(): IAIProvider | null {
    // Try providers in order of preference
    const providers: AIProviderType[] = ['openrouter', 'claude', 'openai'];

    for (const provider of providers) {
      if (hasApiKey(provider)) {
        const instance = this.initializeFromEnv(provider);
        if (instance && instance.isConfigured()) {
          this.currentProvider = provider;
          return instance;
        }
      }
    }

    return null;
  }

  /**
   * Get current provider instance
   */
  static getCurrentProvider(): IAIProvider | null {
    if (!this.currentProvider) {
      return this.getAvailableProvider();
    }

    return this.instances.get(this.currentProvider) || null;
  }

  /**
   * Set current provider
   */
  static setCurrentProvider(provider: AIProviderType, config?: AIConfig): IAIProvider {
    const instance = this.getProvider(provider, config);
    this.currentProvider = provider;
    return instance;
  }

  /**
   * Check if a provider is available and configured
   */
  static isProviderAvailable(provider: AIProviderType): boolean {
    return hasApiKey(provider);
  }

  /**
   * Get list of available providers
   */
  static getAvailableProviders(): AIProviderType[] {
    const providers: AIProviderType[] = ['openrouter', 'claude', 'openai'];
    return providers.filter((p) => this.isProviderAvailable(p));
  }

  /**
   * Validate all configured providers
   */
  static async validateAllProviders(): Promise<Map<AIProviderType, boolean>> {
    const results = new Map<AIProviderType, boolean>();
    const providers = this.getAvailableProviders();

    for (const provider of providers) {
      try {
        const instance = this.initializeFromEnv(provider);
        if (instance) {
          const isValid = await instance.validateApiKey();
          results.set(provider, isValid);
        } else {
          results.set(provider, false);
        }
      } catch (error) {
        console.error(`Error validating ${provider}:`, error);
        results.set(provider, false);
      }
    }

    return results;
  }

  /**
   * Clear all provider instances
   */
  static clearAll(): void {
    this.instances.clear();
    this.currentProvider = null;
  }

  /**
   * Clear specific provider instance
   */
  static clearProvider(provider: AIProviderType): void {
    this.instances.delete(provider);

    if (this.currentProvider === provider) {
      this.currentProvider = null;
    }
  }
}

/**
 * Convenience function to get current AI provider
 */
export function getAIProvider(): IAIProvider | null {
  return AIServiceFactory.getCurrentProvider();
}

/**
 * Convenience function to initialize AI provider
 */
export function initializeAIProvider(
  provider: AIProviderType,
  config?: AIConfig
): IAIProvider {
  return AIServiceFactory.setCurrentProvider(provider, config);
}

/**
 * Convenience function to check if AI is available
 */
export function isAIAvailable(): boolean {
  const provider = AIServiceFactory.getCurrentProvider();
  return provider !== null && provider.isConfigured();
}

/**
 * Get available providers
 */
export function getAvailableAIProviders(): AIProviderType[] {
  return AIServiceFactory.getAvailableProviders();
}

export default AIServiceFactory;
