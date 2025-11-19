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

    // Extract forbidden words/phrases from previous content to force variety
    const forbiddenPhrases = new Set<string>();
    if (previousContent) {
      const words = previousContent.toLowerCase().split(/\s+/);
      // Get 2-3 word phrases
      for (let i = 0; i < words.length - 2; i++) {
        forbiddenPhrases.add(`${words[i]} ${words[i+1]}`);
        forbiddenPhrases.add(`${words[i]} ${words[i+1]} ${words[i+2]}`);
      }
    }

    const forbiddenList = Array.from(forbiddenPhrases).slice(0, 20).join(', ');

    const prompt = `
You are creating part ${sessionNumber} of ${lessonPlan.totalSessions} for a ${lessonPlan.childAge}-year-old.

TOPIC: ${lessonPlan.title}

${previousContent ? `PREVIOUS PARTS:\n${previousContent}\n\n🚫 FORBIDDEN PHRASES (DO NOT USE ANY OF THESE):\n${forbiddenList}\n\nYou MUST write something COMPLETELY DIFFERENT from what came before!` : 'This is part 1 - create an exciting opening!'}

WHAT TO WRITE NOW:
${this.getSessionAction(sessionNumber, lessonPlan.totalSessions, lessonPlan.title)}

STRICT REQUIREMENTS:
${previousContent ? `
❌ DO NOT use any of the forbidden phrases listed above
❌ DO NOT use similar sentence patterns to previous parts
❌ DO NOT repeat the same verbs, nouns, or adjectives
✅ Use BRAND NEW words and descriptions
✅ Create FRESH, ORIGINAL sentences
✅ Show something that HASN'T been mentioned yet
✅ Take the story in a NEW direction
` : `
✅ Create a captivating opening
✅ Introduce the main idea clearly
✅ Use vivid, sensory words
✅ Make them curious about what happens next
`}

STORY GUIDELINES:
${this.getStoryGuidelines(lessonPlan.title, sessionNumber, lessonPlan.totalSessions)}

FORMAT:
- lowercase only
- 5-6 sentences
- each sentence 8-15 words
- periods only, no other punctuation
- simple, clear language
- each sentence must be UNIQUE and NEW

${sessionNumber > 1 ? `⚠️ CRITICAL: Look at what you've already written above. Your new sentences must use DIFFERENT words, DIFFERENT ideas, and DIFFERENT descriptions. NO REPETITION!` : ''}

Write ONLY the ${sessionNumber > 1 ? 'new' : ''} sentences. One per line. Nothing else.
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
    const titleLower = title.toLowerCase();

    if (titleLower.includes('story') || titleLower.includes('world') || titleLower.includes('invent')) {
      // Classic story arc structure
      if (sessionNumber === 1) {
        return `OPENING - Set the magical scene:
- Introduce a memorable character with personality (name, traits, what makes them special)
- Paint a vivid picture of where they are (sights, sounds, feelings)
- Hook the reader with something intriguing or exciting
- Create a warm, inviting atmosphere
Example tone: "ruby the robot woke up in her treehouse workshop. bright sunlight streamed through the windows. today felt different somehow. she had an amazing idea bubbling in her mind."`;
      } else if (progress <= 0.4) {
        return `DEVELOPMENT - The adventure begins:
- Show the character taking action on their idea or discovering something new
- Add sensory details that bring the scene to life
- Introduce a small challenge or something unexpected
- Build curiosity about what happens next
- Keep the tone positive and adventurous`;
      } else if (progress <= 0.7) {
        return `RISING ACTION - Things get exciting:
- The challenge becomes more interesting (but not scary)
- Show the character being creative or brave
- Add surprising discoveries or helpers
- Build emotional connection - how does the character feel?
- Increase the sense of wonder and possibility`;
      } else if (sessionNumber < totalSessions) {
        return `CLIMAX - The most exciting moment:
- The character puts their plan into action
- Show them using what they learned earlier
- Make it thrilling but achievable
- Include sensory details of the big moment
- Build to a satisfying peak of excitement`;
      } else {
        return `CONCLUSION - A heartwarming ending:
- Show the positive outcome of the character's efforts
- Reveal what they learned or how they grew
- Tie back to the beginning - show how far they've come
- End with joy, pride, or peaceful contentment
- Leave the reader feeling inspired and happy`;
      }
    } else if (titleLower.includes('space') || titleLower.includes('ocean') || titleLower.includes('animal') || titleLower.includes('dinosaur')) {
      // Educational narrative structure
      if (sessionNumber === 1) {
        return `INTRODUCTION - Spark wonder and curiosity:
- Open with a fascinating fact that captures attention
- Use vivid imagery to help visualize the subject
- Make it feel like discovering a secret or treasure
- Build excitement about learning more
Example tone: "deep in the dark ocean lives a creature that glows like magic. the jellyfish floats gracefully through the water. its body shimmers with beautiful colors. watching it is like seeing a underwater light show."`;
      } else if (progress <= 0.5) {
        return `EXPLORATION - Discover amazing details:
- Reveal fascinating facts that build on what we know
- Use comparisons to familiar things to help understanding
- Include sensory details (what it looks/sounds/feels like)
- Show why this is amazing or special
- Maintain a sense of discovery and wonder`;
      } else if (sessionNumber < totalSessions) {
        return `DEEP DIVE - The most amazing parts:
- Share the most incredible fact or ability
- Explain how/why in simple but engaging terms
- Create "wow" moments of understanding
- Connect to the bigger picture
- Build appreciation and respect for the subject`;
      } else {
        return `CONCLUSION - Why it matters:
- Summarize the incredible journey of learning
- Explain why this subject is important or special
- Connect to how we can help or appreciate it
- Leave them with lasting wonder
- End with an inspiring thought or call to care`;
      }
    } else {
      return `CREATIVE NARRATIVE - Let imagination soar:
- Use vivid sensory details (sights, sounds, textures)
- Build naturally on everything that came before
- Add surprising twists or delightful discoveries
- Create emotional moments (joy, excitement, wonder)
- Make every sentence count toward the journey`;
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
