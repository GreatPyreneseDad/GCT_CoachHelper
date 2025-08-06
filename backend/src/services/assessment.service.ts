import { prisma } from '../utils/prisma';
import { AssessmentStatus } from '@prisma/client';
import { z } from 'zod';

// Assessment question types
export interface AssessmentQuestion {
  id: string;
  dimension: string;
  text: string;
  type: 'scale' | 'multiple_choice' | 'text';
  options?: string[];
  minValue?: number;
  maxValue?: number;
  weight?: number;
}

// Assessment response
export interface AssessmentResponse {
  questionId: string;
  value: string | number;
}

// Coherence dimensions based on GCT theory
export const COHERENCE_DIMENSIONS = {
  physical: 'Physical Coherence',
  emotional: 'Emotional Coherence',
  mental: 'Mental Coherence',
  social: 'Social Coherence',
  spiritual: 'Spiritual Coherence',
};

// Initial assessment questions
export const INITIAL_ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // Physical Coherence
  {
    id: 'phys_1',
    dimension: 'physical',
    text: 'How would you rate your overall energy levels throughout the day?',
    type: 'scale',
    minValue: 1,
    maxValue: 10,
    weight: 1.0,
  },
  {
    id: 'phys_2',
    dimension: 'physical',
    text: 'How consistent is your sleep schedule?',
    type: 'scale',
    minValue: 1,
    maxValue: 10,
    weight: 0.8,
  },
  {
    id: 'phys_3',
    dimension: 'physical',
    text: 'How satisfied are you with your physical health?',
    type: 'scale',
    minValue: 1,
    maxValue: 10,
    weight: 0.9,
  },

  // Emotional Coherence
  {
    id: 'emot_1',
    dimension: 'emotional',
    text: 'How well do you manage stress in your daily life?',
    type: 'scale',
    minValue: 1,
    maxValue: 10,
    weight: 1.0,
  },
  {
    id: 'emot_2',
    dimension: 'emotional',
    text: 'How often do you experience emotional balance?',
    type: 'scale',
    minValue: 1,
    maxValue: 10,
    weight: 0.9,
  },
  {
    id: 'emot_3',
    dimension: 'emotional',
    text: 'How connected do you feel to your emotions?',
    type: 'scale',
    minValue: 1,
    maxValue: 10,
    weight: 0.8,
  },

  // Mental Coherence
  {
    id: 'ment_1',
    dimension: 'mental',
    text: 'How clear and focused is your thinking?',
    type: 'scale',
    minValue: 1,
    maxValue: 10,
    weight: 1.0,
  },
  {
    id: 'ment_2',
    dimension: 'mental',
    text: 'How well do you handle complex problems?',
    type: 'scale',
    minValue: 1,
    maxValue: 10,
    weight: 0.9,
  },
  {
    id: 'ment_3',
    dimension: 'mental',
    text: 'How satisfied are you with your decision-making abilities?',
    type: 'scale',
    minValue: 1,
    maxValue: 10,
    weight: 0.8,
  },

  // Social Coherence
  {
    id: 'soc_1',
    dimension: 'social',
    text: 'How satisfied are you with your relationships?',
    type: 'scale',
    minValue: 1,
    maxValue: 10,
    weight: 1.0,
  },
  {
    id: 'soc_2',
    dimension: 'social',
    text: 'How well do you communicate with others?',
    type: 'scale',
    minValue: 1,
    maxValue: 10,
    weight: 0.9,
  },
  {
    id: 'soc_3',
    dimension: 'social',
    text: 'How supported do you feel by your community?',
    type: 'scale',
    minValue: 1,
    maxValue: 10,
    weight: 0.8,
  },

  // Spiritual Coherence
  {
    id: 'spir_1',
    dimension: 'spiritual',
    text: 'How aligned do you feel with your life purpose?',
    type: 'scale',
    minValue: 1,
    maxValue: 10,
    weight: 1.0,
  },
  {
    id: 'spir_2',
    dimension: 'spiritual',
    text: 'How connected do you feel to something greater than yourself?',
    type: 'scale',
    minValue: 1,
    maxValue: 10,
    weight: 0.9,
  },
  {
    id: 'spir_3',
    dimension: 'spiritual',
    text: 'How much meaning do you find in your daily activities?',
    type: 'scale',
    minValue: 1,
    maxValue: 10,
    weight: 0.8,
  },
];

// Quick check-in questions (subset)
export const QUICK_CHECKIN_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'quick_1',
    dimension: 'overall',
    text: 'How coherent do you feel overall today?',
    type: 'scale',
    minValue: 1,
    maxValue: 10,
    weight: 1.0,
  },
  {
    id: 'quick_2',
    dimension: 'energy',
    text: 'What is your energy level right now?',
    type: 'scale',
    minValue: 1,
    maxValue: 10,
    weight: 1.0,
  },
  {
    id: 'quick_3',
    dimension: 'focus',
    text: 'How clear is your mental focus?',
    type: 'scale',
    minValue: 1,
    maxValue: 10,
    weight: 1.0,
  },
  {
    id: 'quick_4',
    dimension: 'emotion',
    text: 'How balanced do you feel emotionally?',
    type: 'scale',
    minValue: 1,
    maxValue: 10,
    weight: 1.0,
  },
];

export class AssessmentService {
  static async createAssessment(
    clientId: string,
    type: 'initial' | 'quick_checkin' | 'deep_dive'
  ): Promise<{ assessmentId: string; questions: AssessmentQuestion[] }> {
    // Get questions based on type
    let questions: AssessmentQuestion[];
    switch (type) {
      case 'initial':
        questions = INITIAL_ASSESSMENT_QUESTIONS;
        break;
      case 'quick_checkin':
        questions = QUICK_CHECKIN_QUESTIONS;
        break;
      case 'deep_dive':
        // For deep dive, we'd load more comprehensive questions
        questions = [...INITIAL_ASSESSMENT_QUESTIONS];
        break;
      default:
        questions = QUICK_CHECKIN_QUESTIONS;
    }

    // Create assessment record
    const assessment = await prisma.assessment.create({
      data: {
        clientId,
        type,
        status: AssessmentStatus.DRAFT,
        questions: questions,
        scores: {},
      },
    });

    return {
      assessmentId: assessment.id,
      questions,
    };
  }

  static async submitResponses(
    assessmentId: string,
    responses: AssessmentResponse[]
  ): Promise<{
    coherenceScore: number;
    dimensionScores: Record<string, number>;
    derivative: number;
  }> {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { client: true },
    });

    if (!assessment) {
      throw new Error('Assessment not found');
    }

    if (assessment.status === AssessmentStatus.COMPLETED) {
      throw new Error('Assessment already completed');
    }

    // Calculate scores
    const { coherenceScore, dimensionScores } = this.calculateCoherence(
      assessment.questions as AssessmentQuestion[],
      responses
    );

    // Calculate derivative (rate of change)
    const derivative = await this.calculateDerivative(
      assessment.clientId,
      coherenceScore
    );

    // Update assessment
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        status: AssessmentStatus.COMPLETED,
        completedAt: new Date(),
        scores: dimensionScores,
        overallCoherence: coherenceScore,
        derivative,
      },
    });

    // Update client's current coherence
    await prisma.client.update({
      where: { id: assessment.clientId },
      data: {
        currentCoherence: coherenceScore,
        lastAssessmentAt: new Date(),
      },
    });

    // Create coherence record
    await prisma.coherenceRecord.create({
      data: {
        clientId: assessment.clientId,
        score: coherenceScore,
        derivative,
        dimensions: dimensionScores,
        triggerType: 'assessment',
        triggerId: assessmentId,
      },
    });

    return {
      coherenceScore,
      dimensionScores,
      derivative,
    };
  }

  private static calculateCoherence(
    questions: AssessmentQuestion[],
    responses: AssessmentResponse[]
  ): {
    coherenceScore: number;
    dimensionScores: Record<string, number>;
  } {
    const dimensionScores: Record<string, number> = {};
    const dimensionWeights: Record<string, number> = {};

    // Group responses by dimension
    for (const response of responses) {
      const question = questions.find(q => q.id === response.questionId);
      if (!question || question.type !== 'scale') continue;

      const dimension = question.dimension;
      const normalizedScore = (Number(response.value) - 1) / 9 * 100; // Convert 1-10 to 0-100
      const weight = question.weight || 1.0;

      if (!dimensionScores[dimension]) {
        dimensionScores[dimension] = 0;
        dimensionWeights[dimension] = 0;
      }

      dimensionScores[dimension] += normalizedScore * weight;
      dimensionWeights[dimension] += weight;
    }

    // Calculate weighted average for each dimension
    for (const dimension in dimensionScores) {
      if (dimensionWeights[dimension] > 0) {
        dimensionScores[dimension] /= dimensionWeights[dimension];
      }
    }

    // Calculate overall coherence score (average of all dimensions)
    const dimensionValues = Object.values(dimensionScores);
    const coherenceScore = dimensionValues.length > 0
      ? dimensionValues.reduce((sum, score) => sum + score, 0) / dimensionValues.length
      : 50; // Default to 50 if no valid responses

    return {
      coherenceScore: Math.round(coherenceScore),
      dimensionScores: Object.fromEntries(
        Object.entries(dimensionScores).map(([k, v]) => [k, Math.round(v)])
      ),
    };
  }

  private static async calculateDerivative(
    clientId: string,
    currentScore: number
  ): Promise<number> {
    // Get previous coherence records
    const previousRecords = await prisma.coherenceRecord.findMany({
      where: { clientId },
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    if (previousRecords.length < 2) {
      return 0; // Not enough data for derivative
    }

    // Calculate rate of change over the last week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recentRecords = previousRecords.filter(
      record => record.timestamp >= oneWeekAgo
    );

    if (recentRecords.length < 2) {
      // Use all available records if less than a week of data
      const oldest = previousRecords[previousRecords.length - 1];
      const timeDiffWeeks = (Date.now() - oldest.timestamp.getTime()) / (1000 * 60 * 60 * 24 * 7);
      return (currentScore - oldest.score) / timeDiffWeeks / 100; // Convert to decimal per week
    }

    // Linear regression to find trend
    const points = recentRecords.map(record => ({
      x: (Date.now() - record.timestamp.getTime()) / (1000 * 60 * 60 * 24), // Days ago
      y: record.score,
    }));

    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    // Convert daily slope to weekly percentage
    return slope * 7 / 100;
  }

  static async getAssessmentHistory(
    clientId: string,
    limit: number = 10
  ): Promise<any[]> {
    return prisma.assessment.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        type: true,
        status: true,
        overallCoherence: true,
        derivative: true,
        completedAt: true,
        createdAt: true,
      },
    });
  }

  static async getAssessmentDetails(assessmentId: string): Promise<any> {
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        client: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!assessment) {
      throw new Error('Assessment not found');
    }

    return assessment;
  }
}