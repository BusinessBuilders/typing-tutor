/**
 * AI Lesson Plan Service
 * Creates structured, educational typing lessons that teach concepts
 * while building typing skills progressively
 */

import { AIServiceFactory } from './AIServiceFactory';
import { AIProviderType } from './types';

export interface LessonSession {
  sessionNumber: number;
  content: string;
  learningObjective: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedMinutes: number;
}

export interface LessonPlan {
  id: string;
  title: string;
  description: string;
  topic: string;
  totalSessions: number;
  currentSession: number;
  sessions: LessonSession[];
  childAge?: number;
  interests?: string[];
  createdAt: Date;
  lastAccessed: Date;
}

export interface LessonTemplate {
  type: 'story' | 'education' | 'creative' | 'adventure';
  title: string;
  description: string;
  icon: string;
  suggestedSessions: number;
  ageRange: [number, number];
}

/**
 * Available lesson templates
 */
export const LESSON_TEMPLATES: LessonTemplate[] = [
  {
    type: 'story',
    title: "Let's Make a Story",
    description: 'Create an adventure story together, one chapter at a time',
    icon: '📖',
    suggestedSessions: 5,
    ageRange: [5, 12],
  },
  {
    type: 'education',
    title: 'Learn About Space',
    description: 'Discover planets, stars, and the solar system while typing',
    icon: '🚀',
    suggestedSessions: 6,
    ageRange: [6, 12],
  },
  {
    type: 'education',
    title: 'Animal Adventures',
    description: 'Learn about different animals and their habitats',
    icon: '🦁',
    suggestedSessions: 5,
    ageRange: [4, 10],
  },
  {
    type: 'creative',
    title: 'Build Your Own World',
    description: 'Create your own imaginary world with characters and places',
    icon: '🏰',
    suggestedSessions: 7,
    ageRange: [7, 14],
  },
  {
    type: 'education',
    title: 'Ocean Exploration',
    description: 'Dive deep and learn about sea creatures',
    icon: '🐋',
    suggestedSessions: 5,
    ageRange: [5, 11],
  },
  {
    type: 'adventure',
    title: 'Dinosaur Discovery',
    description: 'Travel back in time to learn about dinosaurs',
    icon: '🦕',
    suggestedSessions: 6,
    ageRange: [5, 12],
  },
  {
    type: 'creative',
    title: 'Invent Something Amazing',
    description: 'Imagine and describe your own inventions',
    icon: '💡',
    suggestedSessions: 4,
    ageRange: [7, 14],
  },
];

/**
 * Lesson Plan Service
 */
export class LessonPlanService {
  private aiProvider: AIProviderType;
  private initialized: boolean = false;

  constructor(aiProvider: AIProviderType = 'openai') {
    this.aiProvider = aiProvider;
  }

  /**
   * Initialize the AI service
   */
  async initialize(): Promise<boolean> {
    try {
      const provider = AIServiceFactory.initializeFromEnv(this.aiProvider);
      if (provider) {
        this.initialized = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize LessonPlanService:', error);
      return false;
    }
  }

  /**
   * Generate a complete lesson plan
   */
  async generateLessonPlan(
    template: LessonTemplate,
    childAge: number,
    interests?: string[]
  ): Promise<LessonPlan> {
    if (!this.initialized) {
      await this.initialize();
    }

    const aiService = AIServiceFactory.getProvider(this.aiProvider);

    // Build prompt for AI to create structured lesson plan
    const prompt = this.buildLessonPlanPrompt(template, childAge, interests);

    try {
      // Use generateScene for creating lesson plans
      const response = await aiService.generateScene({
        type: 'scene-generation',
        level: 'sentences',
        topic: template.title,
        context: prompt,
        userAge: childAge,
      });

      // Parse AI response into lesson plan structure
      const lessonPlan = this.parseLessonPlanResponse(response.content, template, childAge, interests);

      return lessonPlan;
    } catch (error) {
      console.error('Failed to generate lesson plan:', error);
      // Return fallback lesson plan
      return this.createFallbackLessonPlan(template, childAge);
    }
  }

  /**
   * Generate next session content based on progress
   */
  async generateNextSession(
    lessonPlan: LessonPlan,
    previousContent?: string
  ): Promise<LessonSession> {
    if (!this.initialized) {
      await this.initialize();
    }

    const aiService = AIServiceFactory.getProvider(this.aiProvider);
    const sessionNumber = lessonPlan.currentSession + 1;

    const prompt = `
You are a creative children's writer creating an engaging, progressive story for a ${lessonPlan.childAge}-year-old child with autism.

🎯 TOPIC: ${lessonPlan.title.toUpperCase()}
⚠️ YOU MUST WRITE ABOUT: ${lessonPlan.title.toUpperCase()}
📚 THIS LESSON IS ABOUT: ${lessonPlan.title.toUpperCase()}

Session ${sessionNumber} of ${lessonPlan.totalSessions}

${previousContent ? `THE STORY SO FAR:\n${previousContent}\n` : 'This is the BEGINNING of the story.'}

CRITICAL RULES - DO NOT REPEAT:
❌ DO NOT use the same words or phrases from previous parts
❌ DO NOT repeat sentence structures
❌ DO NOT start multiple sentences the same way
✅ MOVE THE STORY FORWARD with NEW events
✅ Add NEW details, NEW actions, or NEW discoveries
✅ Build on what happened before, don't retell it

STORY STRUCTURE FOR SESSION ${sessionNumber}:
${this.getStoryGuidelines(lessonPlan.title, sessionNumber, lessonPlan.totalSessions)}

WHAT SHOULD HAPPEN NOW:
${this.getSessionAction(sessionNumber, lessonPlan.totalSessions, lessonPlan.title)}

FORMATTING RULES:
- Use lowercase letters only
- Simple, clear sentences (6-12 words each)
- NO punctuation except periods
- Write exactly 4-5 sentences
- Make it exciting and different from previous parts
- Child-friendly vocabulary
- MUST be about: ${lessonPlan.title.toUpperCase()}

${previousContent ? '⚠️ IMPORTANT: Continue with something NEW about ' + lessonPlan.title.toUpperCase() + '. Do not repeat what already happened. Move forward!' : 'Start with an exciting opening about ' + lessonPlan.title.toUpperCase() + '.'}

⚠️ REMINDER: Every sentence MUST be about ${lessonPlan.title.toUpperCase()}. Do NOT write about unrelated topics like stars, space, or anything else!

Format: Provide ONLY the 4-5 new sentences about ${lessonPlan.title.toUpperCase()}, one per line. No commentary, no labels.
`;

    try {
      const response = await aiService.generateSentence({
        type: 'sentence-generation',
        level: 'sentences',
        topic: lessonPlan.topic,
        context: prompt,
        userAge: lessonPlan.childAge,
      });

      const content = response.content.trim();
      const sentences = content.split('\n').filter((s: string) => s.trim().length > 0);

      return {
        sessionNumber,
        content: sentences.join('\n'),
        learningObjective: `Session ${sessionNumber}: Continue ${lessonPlan.topic} exploration`,
        difficulty: this.calculateDifficulty(content),
        estimatedMinutes: Math.ceil(content.length / 50), // Rough estimate
      };
    } catch (error) {
      console.error('Failed to generate session:', error);
      return this.createFallbackSession(sessionNumber, lessonPlan);
    }
  }

  /**
   * Build AI prompt for lesson plan generation
   */
  private buildLessonPlanPrompt(
    template: LessonTemplate,
    childAge: number,
    interests?: string[]
  ): string {
    const interestsText = interests && interests.length > 0
      ? `The child is interested in: ${interests.join(', ')}`
      : '';

    return `
Create a ${template.suggestedSessions}-session typing lesson plan for a ${childAge}-year-old child with autism.

Theme: ${template.title}
Description: ${template.description}
Type: ${template.type}
${interestsText}

Create a structured lesson plan where each session:
1. Builds on the previous session
2. Teaches something educational
3. Uses simple, clear language (autism-friendly)
4. Has easy-to-type content (lowercase, short sentences)
5. Is encouraging and positive

For a "${template.type}" lesson:
${this.getTypeGuidance(template.type)}

Provide a brief outline of what each session will cover.
Format: List sessions 1-${template.suggestedSessions} with a one-line description of each.
`;
  }

  /**
   * Get guidance text based on lesson type
   */
  private getTypeGuidance(type: string): string {
    const guidance: Record<string, string> = {
      story: 'Build a progressive story with character introduction, setting, adventure, challenges, and resolution',
      education: 'Teach factual information progressively, starting with basics and building to more details',
      creative: 'Encourage imagination and creativity, building on their ideas each session',
      adventure: 'Create an exciting journey with discoveries and learning at each step',
    };
    return guidance[type] || 'Create engaging, progressive content';
  }

  /**
   * Get specific action for this session
   */
  private getSessionAction(sessionNumber: number, totalSessions: number, title: string): string {
    const titleLower = title.toLowerCase();

    if (titleLower.includes('story')) {
      const actions = [
        'The character wakes up and discovers something surprising or makes a plan.',
        'The character goes somewhere new or meets someone interesting.',
        'Something unexpected happens that creates a fun challenge.',
        'The character works on solving the problem in a creative way.',
        'The character succeeds and learns something valuable.',
        'The character celebrates and reflects on their adventure.',
      ];
      const index = Math.min(sessionNumber - 1, actions.length - 1);
      return actions[index];
    }

    else if (titleLower.includes('animal')) {
      const actions = [
        'Introduce a specific animal and where it lives. Example: "lions are big cats that live in africa"',
        'Describe what this animal looks like and what makes it special.',
        'Explain what this animal eats and how it finds food.',
        'Describe how this animal moves, communicates, or protects itself.',
        'Share how baby animals are born and cared for.',
        'Explain why this animal is important and how we can help protect it.',
      ];
      const index = Math.min(sessionNumber - 1, actions.length - 1);
      return actions[index];
    }

    else if (titleLower.includes('ocean') || titleLower.includes('sea')) {
      const actions = [
        'Introduce an ocean creature and where in the ocean it lives.',
        'Describe what makes this creature unique or amazing.',
        'Explain how it survives underwater (breathing, swimming, etc).',
        'Describe what it eats and how it hunts or finds food.',
        'Share a fascinating behavior or ability this creature has.',
        'Explain why ocean creatures matter and how we protect them.',
      ];
      const index = Math.min(sessionNumber - 1, actions.length - 1);
      return actions[index];
    }

    else if (titleLower.includes('space')) {
      const actions = [
        'Introduce an exciting planet or space object.',
        'Describe what makes this place special or different.',
        'Explain something fascinating about how it works.',
        'Compare it to Earth or explain why scientists study it.',
        'Share an amazing fact or recent discovery.',
        'Summarize what we learned and why it matters.',
      ];
      const index = Math.min(sessionNumber - 1, actions.length - 1);
      return actions[index];
    }

    else if (titleLower.includes('dinosaur')) {
      const actions = [
        'Introduce a specific dinosaur and when it lived.',
        'Describe what this dinosaur looked like and its size.',
        'Explain what this dinosaur ate (plant-eater or meat-eater).',
        'Describe how this dinosaur moved and any special features.',
        'Share how scientists discovered fossils of this dinosaur.',
        'Explain what happened to the dinosaurs and what we learned.',
      ];
      const index = Math.min(sessionNumber - 1, actions.length - 1);
      return actions[index];
    }

    else if (titleLower.includes('invent') || titleLower.includes('world') || titleLower.includes('creative')) {
      const actions = [
        'Imagine and describe your creation (what is it?).',
        'Explain what your creation does or how it works.',
        'Describe what makes your creation special or unique.',
        'Explain who would use it and how it helps people.',
        'Add more cool features or abilities to your creation.',
        'Summarize your invention and why it would be amazing.',
      ];
      const index = Math.min(sessionNumber - 1, actions.length - 1);
      return actions[index];
    }

    else {
      return `Create educational content specifically about: ${title}. Stay focused on this topic!`;
    }
  }

  /**
   * Get detailed story guidelines based on session progress
   */
  private getStoryGuidelines(title: string, sessionNumber: number, totalSessions: number): string {
    const progress = sessionNumber / totalSessions;

    if (title.toLowerCase().includes('story')) {
      if (sessionNumber === 1) {
        return `- Introduce a main character (give them a name and personality)
- Set the scene (where are they?)
- Start with something interesting happening
- Make the character likeable and relatable
Example: "lily the dragon loved to bake cookies. she lived in a cozy cave by the mountains. one morning she woke up with a great idea."`;
      } else if (progress < 0.5) {
        return `- Develop the story naturally
- Show the character doing something or discovering something
- Add one new element or challenge
- Keep it positive and encouraging`;
      } else if (progress < 0.8) {
        return `- Build toward a climax or exciting moment
- Show the character overcoming challenges
- Keep the energy and excitement building
- Maintain continuity with earlier parts`;
      } else {
        return `- Bring the story to a satisfying conclusion
- Show how things worked out
- End on a positive, uplifting note
- Tie back to earlier parts of the story`;
      }
    } else if (title.toLowerCase().includes('space') || title.toLowerCase().includes('ocean') || title.toLowerCase().includes('animal')) {
      if (sessionNumber === 1) {
        return `- Start with an exciting fact or discovery
- Use vivid, descriptive language
- Make it feel like an adventure
Example: "mars is called the red planet. it has huge mountains and deep canyons. robots drive on mars and take pictures."`;
      } else {
        return `- Build on previous facts
- Add new interesting information
- Make connections to what we already learned
- Keep it educational but exciting`;
      }
    } else {
      return `- Create engaging, imaginative content
- Build naturally on previous sessions
- Keep the child interested and motivated
- Use positive, encouraging language`;
    }
  }

  /**
   * Parse AI response into lesson plan structure
   */
  private parseLessonPlanResponse(
    _response: string,
    template: LessonTemplate,
    childAge?: number,
    interests?: string[]
  ): LessonPlan {
    // For now, create a structured plan based on the template
    // In a full implementation, we'd parse the AI response more thoroughly

    return {
      id: crypto.randomUUID(),
      title: template.title,
      description: template.description,
      topic: template.title.toLowerCase(),
      totalSessions: template.suggestedSessions,
      currentSession: 0,
      sessions: [],
      childAge,
      interests,
      createdAt: new Date(),
      lastAccessed: new Date(),
    };
  }

  /**
   * Calculate difficulty based on content
   */
  private calculateDifficulty(content: string): 'easy' | 'medium' | 'hard' {
    const avgWordLength = content.split(' ').reduce((sum, word) => sum + word.length, 0) / content.split(' ').length;

    if (avgWordLength < 4) return 'easy';
    if (avgWordLength < 6) return 'medium';
    return 'hard';
  }

  /**
   * Create fallback lesson plan if AI fails
   */
  private createFallbackLessonPlan(template: LessonTemplate, childAge?: number): LessonPlan {
    return {
      id: crypto.randomUUID(),
      title: template.title,
      description: template.description,
      topic: template.title.toLowerCase(),
      totalSessions: template.suggestedSessions,
      currentSession: 0,
      sessions: [],
      childAge,
      createdAt: new Date(),
      lastAccessed: new Date(),
    };
  }

  /**
   * Create fallback session if AI fails
   */
  private createFallbackSession(sessionNumber: number, lessonPlan: LessonPlan): LessonSession {
    const fallbackContent: Record<string, string[]> = {
      'story': [
        'once there was a brave hero',
        'the hero went on a journey',
        'they met new friends',
        'together they had adventures',
      ],
      'space': [
        'the sun is a star',
        'earth is our home planet',
        'the moon orbits earth',
        'there are eight planets',
      ],
      'animals': [
        'lions live in africa',
        'elephants are very big',
        'dolphins swim in the ocean',
        'birds can fly in the sky',
      ],
      'ocean': [
        'whales are the biggest animals',
        'dolphins are very smart',
        'fish have gills to breathe',
        'coral reefs are colorful',
      ],
      'dinosaurs': [
        'dinosaurs lived long ago',
        'the t-rex was very big',
        'some dinosaurs ate plants',
        'dinosaurs left fossils behind',
      ],
    };

    // Determine appropriate key based on lesson title
    const titleLower = lessonPlan.title.toLowerCase();
    let key = 'story'; // default

    if (titleLower.includes('animal')) {
      key = 'animals';
    } else if (titleLower.includes('space')) {
      key = 'space';
    } else if (titleLower.includes('ocean') || titleLower.includes('sea')) {
      key = 'ocean';
    } else if (titleLower.includes('dinosaur')) {
      key = 'dinosaurs';
    } else if (titleLower.includes('story')) {
      key = 'story';
    }

    const sentences = fallbackContent[key];

    return {
      sessionNumber,
      content: sentences[sessionNumber % sentences.length],
      learningObjective: `Session ${sessionNumber}`,
      difficulty: 'easy',
      estimatedMinutes: 5,
    };
  }
}

export default LessonPlanService;
