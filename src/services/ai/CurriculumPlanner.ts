/**
 * AI Curriculum Planner
 * Intelligent lesson planning based on child's progress, skills, and learning goals
 */

import { AIServiceFactory, AIProviderType } from './AIServiceFactory';
import { dbQuery, dbExecute } from '../database/databaseService';

export interface LearningGoal {
  id: string;
  userId: string;
  goal: string; // "learn touch typing", "improve speed", "homework help"
  targetSkills: string[]; // ["typing", "spelling", "reading comprehension"]
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
}

export interface SkillLevel {
  typing: number; // 1-10
  reading: number; // 1-10
  vocabulary: number; // 1-10
  focus: number; // 1-10
}

export interface CurriculumLesson {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'typing' | 'reading' | 'vocabulary' | 'homework' | 'fun';
  difficulty: number; // 1-10
  skillsTargeted: string[];
  estimatedMinutes: number;
  prerequisites: string[]; // lesson IDs that should be completed first
  content: LessonContent[];
  homeworkTasks?: HomeworkTask[];
  createdAt: Date;
  aiGenerated: boolean;
}

export interface LessonContent {
  type: 'instruction' | 'practice' | 'story' | 'exercise';
  title: string;
  content: string;
  imageQuery?: string;
}

export interface HomeworkTask {
  id: string;
  title: string;
  description: string;
  type: 'typing' | 'reading' | 'writing';
  content: string;
  targetAccuracy?: number;
  targetWPM?: number;
  completed: boolean;
}

export interface CompletedLesson {
  id: string;
  userId: string;
  lessonId: string;
  completedAt: Date;
  accuracy: number;
  timeSpent: number; // minutes
  enjoymentRating?: number; // 1-5
  struggledWith?: string[];
}

export interface CurriculumPlan {
  userId: string;
  learningGoals: LearningGoal[];
  currentSkillLevel: SkillLevel;
  recommendedLessons: CurriculumLesson[];
  nextLesson: CurriculumLesson;
  completedLessons: CompletedLesson[];
  homeworkTasks: HomeworkTask[];
  progressPercentage: number;
}

/**
 * AI Curriculum Planner Service
 */
export class CurriculumPlannerService {
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
      console.error('Failed to initialize CurriculumPlanner:', error);
      return false;
    }
  }

  /**
   * Assess child's current skill level using AI
   */
  async assessSkillLevel(userId: string, age: number): Promise<SkillLevel> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Get completed sessions to analyze performance
    const sessions = await this.getRecentSessions(userId);
    const completedLessons = await this.getCompletedLessons(userId);

    const aiService = AIServiceFactory.getProvider(this.aiProvider);

    const prompt = `Analyze this child's typing tutor performance and assess their skill levels.

Child Age: ${age} years old
Total Sessions Completed: ${sessions.length}
Total Lessons Completed: ${completedLessons.length}

Recent Performance:
${sessions.slice(0, 5).map((s: any) =>
  `- Accuracy: ${s.accuracy}%, WPM: ${s.words_per_minute || 0}, Level: ${s.level}`
).join('\n')}

Assess skill levels (1-10 scale) for:
1. Typing skill (accuracy, speed, consistency)
2. Reading comprehension (based on lesson completion)
3. Vocabulary (complexity of words they can handle)
4. Focus/Attention (session completion, time on task)

Respond in JSON format:
{
  "typing": <number 1-10>,
  "reading": <number 1-10>,
  "vocabulary": <number 1-10>,
  "focus": <number 1-10>,
  "reasoning": "<brief explanation>"
}`;

    try {
      const response = await aiService.generateSentence({
        type: 'sentence-generation',
        level: 'sentences',
        topic: 'skill assessment',
        context: prompt,
        userAge: age,
      });

      // Parse JSON response
      const match = response.content.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        return {
          typing: Math.min(10, Math.max(1, parsed.typing || 3)),
          reading: Math.min(10, Math.max(1, parsed.reading || 3)),
          vocabulary: Math.min(10, Math.max(1, parsed.vocabulary || 3)),
          focus: Math.min(10, Math.max(1, parsed.focus || 3)),
        };
      }
    } catch (error) {
      console.error('Skill assessment error:', error);
    }

    // Fallback: calculate based on data
    const avgAccuracy = sessions.length > 0
      ? sessions.reduce((sum: number, s: any) => sum + (s.accuracy || 0), 0) / sessions.length
      : 50;

    const typingSkill = Math.ceil((avgAccuracy / 100) * 10);

    return {
      typing: Math.max(1, Math.min(10, typingSkill)),
      reading: Math.max(1, Math.min(10, Math.ceil(age / 2))),
      vocabulary: Math.max(1, Math.min(10, Math.ceil(age / 2))),
      focus: Math.max(1, Math.min(10, sessions.length > 5 ? 7 : 4)),
    };
  }

  /**
   * Generate personalized curriculum based on goals and skill level
   */
  async generateCurriculum(
    userId: string,
    age: number,
    goals: string[],
    currentSkills: SkillLevel
  ): Promise<CurriculumLesson[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const completedLessons = await this.getCompletedLessons(userId);
    const completedTopics = completedLessons.map((l: any) => l.title || l.lesson_title);

    const aiService = AIServiceFactory.getProvider(this.aiProvider);

    const prompt = `You are an expert educational curriculum designer for children with autism.

Create a personalized typing curriculum for:
- Age: ${age} years old
- Current Skills: Typing ${currentSkills.typing}/10, Reading ${currentSkills.reading}/10, Vocabulary ${currentSkills.vocabulary}/10, Focus ${currentSkills.focus}/10
- Learning Goals: ${goals.join(', ')}
- Already Completed: ${completedTopics.length > 0 ? completedTopics.join(', ') : 'None yet (first time user)'}

Design 5-7 progressive lessons that:
1. Build on their current skill level
2. Address their specific learning goals
3. Are autism-friendly (clear, structured, visual, engaging)
4. Progress from easier to more challenging
5. DON'T repeat topics they've already mastered
6. Include variety (stories, facts, practical skills, fun topics)
7. Each lesson should take 10-20 minutes

For EACH lesson, provide:
- Title (engaging, clear)
- Description (what they'll learn and why it's useful)
- Category (typing/reading/vocabulary/homework/fun)
- Difficulty (1-10, based on their current level)
- Skills Targeted (specific skills this develops)
- Main Topic/Content Focus

Respond in this JSON array format:
[
  {
    "title": "Lesson Title",
    "description": "What they'll learn",
    "category": "typing",
    "difficulty": 4,
    "skillsTargeted": ["typing speed", "accuracy"],
    "topicFocus": "animals",
    "estimatedMinutes": 15
  }
]

Make it exciting and personalized for THIS specific child!`;

    try {
      const response = await aiService.generateSentence({
        type: 'sentence-generation',
        level: 'sentences',
        topic: 'curriculum planning',
        context: prompt,
        userAge: age,
      });

      // Parse JSON response
      const match = response.content.match(/\[[\s\S]*\]/);
      if (match) {
        const lessons = JSON.parse(match[0]);

        return lessons.map((lesson: any, index: number) => ({
          id: `lesson_${userId}_${Date.now()}_${index}`,
          userId,
          title: lesson.title,
          description: lesson.description,
          category: lesson.category || 'typing',
          difficulty: lesson.difficulty || currentSkills.typing,
          skillsTargeted: lesson.skillsTargeted || [],
          estimatedMinutes: lesson.estimatedMinutes || 15,
          prerequisites: index > 0 ? [`lesson_${userId}_${Date.now()}_${index - 1}`] : [],
          content: [], // Will be generated when lesson starts
          aiGenerated: true,
          createdAt: new Date(),
        }));
      }
    } catch (error) {
      console.error('Curriculum generation error:', error);
    }

    // Fallback curriculum
    return this.createFallbackCurriculum(userId, age, currentSkills);
  }

  /**
   * Generate detailed lesson content for a specific lesson
   */
  async generateLessonContent(
    lesson: CurriculumLesson,
    previousSessions: string[]
  ): Promise<LessonContent[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const aiService = AIServiceFactory.getProvider(this.aiProvider);

    const prompt = `Create detailed lesson content for this typing lesson:

Lesson: ${lesson.title}
Description: ${lesson.description}
Category: ${lesson.category}
Difficulty: ${lesson.difficulty}/10
Skills: ${lesson.skillsTargeted.join(', ')}
Duration: ${lesson.estimatedMinutes} minutes

${previousSessions.length > 0 ? `Previous content from this lesson:\n${previousSessions.join('\n\n')}` : 'This is the first session.'}

Create the NEXT part of this lesson with 3-4 sections:

1. INSTRUCTION (1-2 sentences explaining what to do)
2. PRACTICE CONTENT (4-6 simple sentences for them to type)
3. FUN FACT or STORY ELEMENT (keep them engaged)

Make content:
- Autism-friendly (clear, literal, predictable)
- Age-appropriate and engaging
- Progressive (builds on previous parts)
- All lowercase, simple words
- Related to the lesson topic

Respond in JSON format:
[
  {
    "type": "instruction",
    "title": "Let's Learn",
    "content": "instruction text here"
  },
  {
    "type": "practice",
    "title": "Type This",
    "content": "sentence 1\\nsentence 2\\nsentence 3"
  }
]`;

    try {
      const response = await aiService.generateSentence({
        type: 'sentence-generation',
        level: 'sentences',
        topic: lesson.title,
        context: prompt,
        userAge: 8,
      });

      const match = response.content.match(/\[[\s\S]*\]/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch (error) {
      console.error('Lesson content generation error:', error);
    }

    // Fallback content
    return [
      {
        type: 'instruction',
        title: "Let's Practice",
        content: 'Type the sentences below carefully and accurately.',
      },
      {
        type: 'practice',
        title: 'Practice Sentences',
        content: 'the sun shines bright.\nbirds fly in the sky.\nflowers bloom in spring.',
      },
    ];
  }

  /**
   * Generate homework tasks based on lesson
   */
  async generateHomework(
    lesson: CurriculumLesson,
    skillLevel: SkillLevel
  ): Promise<HomeworkTask[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const aiService = AIServiceFactory.getProvider(this.aiProvider);

    const prompt = `Create 2-3 homework tasks for this lesson:

Lesson: ${lesson.title}
Skills: ${lesson.skillsTargeted.join(', ')}
Student Level: Typing ${skillLevel.typing}/10, Reading ${skillLevel.reading}/10

Create simple, achievable homework tasks that:
- Reinforce what they learned
- Can be completed in 5-10 minutes each
- Are specific and clear
- Match their skill level

Respond in JSON format:
[
  {
    "title": "Task Name",
    "description": "What to do",
    "type": "typing",
    "content": "practice content here",
    "targetAccuracy": 80
  }
]`;

    try {
      const response = await aiService.generateSentence({
        type: 'sentence-generation',
        level: 'sentences',
        topic: 'homework',
        context: prompt,
        userAge: 8,
      });

      const match = response.content.match(/\[[\s\S]*\]/);
      if (match) {
        const tasks = JSON.parse(match[0]);
        return tasks.map((task: any, index: number) => ({
          id: `hw_${lesson.id}_${index}`,
          title: task.title,
          description: task.description,
          type: task.type || 'typing',
          content: task.content,
          targetAccuracy: task.targetAccuracy || 80,
          targetWPM: task.targetWPM,
          completed: false,
        }));
      }
    } catch (error) {
      console.error('Homework generation error:', error);
    }

    return [];
  }

  /**
   * Get or create complete curriculum plan for user
   */
  async getCurriculumPlan(userId: string, age: number, goals: string[]): Promise<CurriculumPlan> {
    const skillLevel = await this.assessSkillLevel(userId, age);
    const completedLessons = await this.getCompletedLessons(userId);
    const recommended = await this.generateCurriculum(userId, age, goals, skillLevel);

    // Filter out completed lessons
    const completedIds = new Set(completedLessons.map((l: any) => l.lesson_id));
    const remainingLessons = recommended.filter(l => !completedIds.has(l.id));

    // Get next lesson (first uncompleted)
    const nextLesson = remainingLessons[0] || recommended[0];

    return {
      userId,
      learningGoals: goals.map((g, i) => ({
        id: `goal_${i}`,
        userId,
        goal: g,
        targetSkills: [],
        priority: 'high',
        createdAt: new Date(),
      })),
      currentSkillLevel: skillLevel,
      recommendedLessons: remainingLessons,
      nextLesson,
      completedLessons: completedLessons.map((l: any) => ({
        id: l.id,
        userId: l.user_id,
        lessonId: l.lesson_id,
        completedAt: new Date(l.completed_at),
        accuracy: l.accuracy || 0,
        timeSpent: l.time_spent || 0,
        enjoymentRating: l.enjoyment_rating,
        struggledWith: l.struggled_with ? JSON.parse(l.struggled_with) : [],
      })),
      homeworkTasks: [],
      progressPercentage: (completedLessons.length / recommended.length) * 100,
    };
  }

  // Helper methods
  private async getRecentSessions(userId: string): Promise<any[]> {
    try {
      return await dbQuery(
        'SELECT * FROM sessions WHERE user_id = ? ORDER BY start_time DESC LIMIT 10',
        [userId]
      );
    } catch {
      return [];
    }
  }

  private async getCompletedLessons(userId: string): Promise<any[]> {
    try {
      return await dbQuery(
        'SELECT * FROM completed_lessons WHERE user_id = ? ORDER BY completed_at DESC',
        [userId]
      );
    } catch {
      return [];
    }
  }

  private createFallbackCurriculum(userId: string, age: number, skills: SkillLevel): CurriculumLesson[] {
    const baseId = `lesson_${userId}_${Date.now()}`;

    return [
      {
        id: `${baseId}_1`,
        userId,
        title: 'Letters and Sounds',
        description: 'Learn to type letters with fun sounds and images',
        category: 'typing',
        difficulty: Math.max(1, skills.typing - 1),
        skillsTargeted: ['typing', 'letter recognition'],
        estimatedMinutes: 10,
        prerequisites: [],
        content: [],
        aiGenerated: false,
        createdAt: new Date(),
      },
      {
        id: `${baseId}_2`,
        userId,
        title: 'Simple Words',
        description: 'Practice typing common, easy words',
        category: 'vocabulary',
        difficulty: skills.typing,
        skillsTargeted: ['typing', 'spelling'],
        estimatedMinutes: 15,
        prerequisites: [`${baseId}_1`],
        content: [],
        aiGenerated: false,
        createdAt: new Date(),
      },
      {
        id: `${baseId}_3`,
        userId,
        title: 'Animal Adventure Story',
        description: 'Type an exciting story about amazing animals',
        category: 'fun',
        difficulty: skills.typing + 1,
        skillsTargeted: ['typing', 'reading', 'focus'],
        estimatedMinutes: 20,
        prerequisites: [`${baseId}_2`],
        content: [],
        aiGenerated: false,
        createdAt: new Date(),
      },
    ];
  }
}

export default CurriculumPlannerService;
