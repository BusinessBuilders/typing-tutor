/**
 * AI Model Configurations and Selection
 * Defines available models for each provider and selection logic
 */

import { AIModel, AIProviderType } from './types';

// Available OpenRouter models
export const OPENROUTER_MODELS: AIModel[] = [
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'openrouter',
    maxTokens: 8192,
    costPer1kTokens: 0.003,
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku (Fast & Cheap)',
    provider: 'openrouter',
    maxTokens: 4096,
    costPer1kTokens: 0.00025,
  },
  {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openrouter',
    maxTokens: 4096,
    costPer1kTokens: 0.01,
  },
  {
    id: 'openai/gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo (Fast & Cheap)',
    provider: 'openrouter',
    maxTokens: 4096,
    costPer1kTokens: 0.0005,
  },
  {
    id: 'google/gemini-pro',
    name: 'Google Gemini Pro',
    provider: 'openrouter',
    maxTokens: 2048,
    costPer1kTokens: 0.000125,
  },
  {
    id: 'meta-llama/llama-3-70b-instruct',
    name: 'Llama 3 70B',
    provider: 'openrouter',
    maxTokens: 8192,
    costPer1kTokens: 0.00081,
  },
];

// Available OpenAI models
export const OPENAI_MODELS: AIModel[] = [
  {
    id: 'gpt-4-turbo-preview',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    maxTokens: 4096,
    costPer1kTokens: 0.01,
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    maxTokens: 8192,
    costPer1kTokens: 0.03,
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    maxTokens: 4096,
    costPer1kTokens: 0.0005,
  },
  {
    id: 'gpt-3.5-turbo-16k',
    name: 'GPT-3.5 Turbo 16K',
    provider: 'openai',
    maxTokens: 16384,
    costPer1kTokens: 0.003,
  },
];

// Available Claude models
export const CLAUDE_MODELS: AIModel[] = [
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'claude',
    maxTokens: 8192,
    costPer1kTokens: 0.003,
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'claude',
    maxTokens: 4096,
    costPer1kTokens: 0.015,
  },
  {
    id: 'claude-3-sonnet-20240229',
    name: 'Claude 3 Sonnet',
    provider: 'claude',
    maxTokens: 4096,
    costPer1kTokens: 0.003,
  },
  {
    id: 'claude-3-haiku-20240307',
    name: 'Claude 3 Haiku',
    provider: 'claude',
    maxTokens: 4096,
    costPer1kTokens: 0.00025,
  },
];

// All available models
export const ALL_MODELS: AIModel[] = [
  ...OPENROUTER_MODELS,
  ...OPENAI_MODELS,
  ...CLAUDE_MODELS,
];

/**
 * Get models for a specific provider
 */
export function getModelsByProvider(provider: AIProviderType): AIModel[] {
  switch (provider) {
    case 'openrouter':
      return OPENROUTER_MODELS;
    case 'openai':
      return OPENAI_MODELS;
    case 'claude':
      return CLAUDE_MODELS;
    default:
      return [];
  }
}

/**
 * Get a specific model by ID
 */
export function getModelById(modelId: string): AIModel | undefined {
  return ALL_MODELS.find((model) => model.id === modelId);
}

/**
 * Get default model for a provider
 */
export function getDefaultModel(provider: AIProviderType): AIModel {
  const models = getModelsByProvider(provider);
  return models[0]; // Return first model as default
}

/**
 * Get recommended model based on use case
 */
export function getRecommendedModel(
  provider: AIProviderType,
  useCase: 'speed' | 'quality' | 'cost'
): AIModel {
  const models = getModelsByProvider(provider);

  switch (useCase) {
    case 'speed':
      // Return fastest/cheapest model
      return (
        models.find((m) => m.name.toLowerCase().includes('haiku')) ||
        models.find((m) => m.name.toLowerCase().includes('3.5')) ||
        models[0]
      );

    case 'quality':
      // Return highest quality model
      return (
        models.find((m) => m.name.toLowerCase().includes('opus')) ||
        models.find((m) => m.name.toLowerCase().includes('gpt-4')) ||
        models.find((m) => m.name.toLowerCase().includes('sonnet')) ||
        models[0]
      );

    case 'cost':
      // Return most cost-effective model
      const sortedByCost = [...models].sort(
        (a, b) => (a.costPer1kTokens || 0) - (b.costPer1kTokens || 0)
      );
      return sortedByCost[0] || models[0];

    default:
      return models[0];
  }
}

/**
 * Calculate estimated cost for a request
 */
export function estimateCost(modelId: string, estimatedTokens: number): number {
  const model = getModelById(modelId);
  if (!model || !model.costPer1kTokens) return 0;

  return (estimatedTokens / 1000) * model.costPer1kTokens;
}

/**
 * Model selection helper
 */
export class ModelSelector {
  private provider: AIProviderType;

  constructor(provider: AIProviderType) {
    this.provider = provider;
  }

  /**
   * Get all available models for this provider
   */
  getAvailableModels(): AIModel[] {
    return getModelsByProvider(this.provider);
  }

  /**
   * Select model by name or ID
   */
  selectModel(identifier: string): AIModel | undefined {
    const models = this.getAvailableModels();
    return (
      models.find((m) => m.id === identifier) ||
      models.find((m) => m.name.toLowerCase().includes(identifier.toLowerCase()))
    );
  }

  /**
   * Get model for specific task
   */
  selectForTask(task: 'word' | 'sentence' | 'scene' | 'evaluation'): AIModel {
    // For simple tasks like word generation, use faster/cheaper models
    if (task === 'word') {
      return getRecommendedModel(this.provider, 'cost');
    }

    // For complex tasks like scene generation, use higher quality models
    if (task === 'scene' || task === 'evaluation') {
      return getRecommendedModel(this.provider, 'quality');
    }

    // For sentences, use balanced model
    return getDefaultModel(this.provider);
  }

  /**
   * Get cheapest model
   */
  getCheapestModel(): AIModel {
    return getRecommendedModel(this.provider, 'cost');
  }

  /**
   * Get fastest model
   */
  getFastestModel(): AIModel {
    return getRecommendedModel(this.provider, 'speed');
  }

  /**
   * Get highest quality model
   */
  getBestQualityModel(): AIModel {
    return getRecommendedModel(this.provider, 'quality');
  }
}

/**
 * Create model selector for provider
 */
export function createModelSelector(provider: AIProviderType): ModelSelector {
  return new ModelSelector(provider);
}

export default {
  OPENROUTER_MODELS,
  OPENAI_MODELS,
  CLAUDE_MODELS,
  ALL_MODELS,
  getModelsByProvider,
  getModelById,
  getDefaultModel,
  getRecommendedModel,
  estimateCost,
  ModelSelector,
  createModelSelector,
};
