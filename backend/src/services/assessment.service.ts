import { prisma } from '../utils/prisma';
import { AssessmentStatus } from '@prisma/client';
import { calculateGCTCoherence } from '../utils/gct-scoring';
import { GCT_INITIAL_ASSESSMENT, GCT_QUICK_CHECKIN } from '../data/gct-assessment-questions';

// Assessment question types
export interface AssessmentQuestion {
  id: string;
  dimension: string;
  text: string;
  type: 'scale' | 'multiple_choice' | 'text' | 'frequency';
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
  psi: 'Internal Consistency (Ψ)',
  rho: 'Accumulated Wisdom (ρ)',
  q: 'Moral Activation',
  f: 'Social Belonging',
};


export class AssessmentService {
  static async createAssessment(
    clientId: string,
    type: 'initial' | 'quick_checkin' | 'deep_dive'
  ): Promise<{ assessmentId: string; questions: AssessmentQuestion[] }> {
    // Get questions based on type - now using proper GCT questions
    let questions: AssessmentQuestion[];
    switch (type) {
      case 'initial':
        questions = GCT_INITIAL_ASSESSMENT.map(q => ({
          id: q.id,
          dimension: q.dimension,
          text: q.text,
          type: q.type,
          options: q.options?.map(opt => opt.label),
          minValue: q.type === 'scale' ? 1 : undefined,
          maxValue: q.type === 'scale' ? 10 : undefined,
          weight: q.weight,
        }));
        break;
      case 'quick_checkin':
        questions = GCT_QUICK_CHECKIN.map(q => ({
          id: q.id,
          dimension: q.dimension,
          text: q.text,
          type: q.type,
          options: q.options?.map(opt => opt.label),
          minValue: q.type === 'scale' ? 1 : undefined,
          maxValue: q.type === 'scale' ? 10 : undefined,
          weight: q.weight,
        }));
        break;
      case 'deep_dive':
        // For deep dive, use all initial assessment questions
        questions = GCT_INITIAL_ASSESSMENT.map(q => ({
          id: q.id,
          dimension: q.dimension,
          text: q.text,
          type: q.type,
          options: q.options?.map(opt => opt.label),
          minValue: q.type === 'scale' ? 1 : undefined,
          maxValue: q.type === 'scale' ? 10 : undefined,
          weight: q.weight,
        }));
        break;
      default:
        questions = GCT_QUICK_CHECKIN.map(q => ({
          id: q.id,
          dimension: q.dimension,
          text: q.text,
          type: q.type,
          options: q.options?.map(opt => opt.label),
          minValue: q.type === 'scale' ? 1 : undefined,
          maxValue: q.type === 'scale' ? 10 : undefined,
          weight: q.weight,
        }));
    }

    // Create assessment record
    const assessment = await prisma.assessment.create({
      data: {
        clientId,
        type,
        status: AssessmentStatus.DRAFT,
        questions: questions as any,
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
      assessment.questions as any as AssessmentQuestion[],
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
    // Convert responses to format expected by GCT scoring
    const gctResponses = responses.map(response => {
      const question = questions.find(q => q.id === response.questionId);
      
      // Handle multiple choice responses
      let value = response.value;
      if (question?.type === 'multiple_choice' && question.options) {
        // Find the score for this option from either assessment type
        const gctQuestion = GCT_INITIAL_ASSESSMENT.find(q => q.id === response.questionId) || 
                           GCT_QUICK_CHECKIN.find(q => q.id === response.questionId);
        const selectedOption = gctQuestion?.options?.find(opt => opt.label === response.value);
        value = selectedOption?.score || 0.5;
      }
      
      return {
        questionId: response.questionId,
        value: typeof value === 'number' ? value : parseFloat(String(value)),
        dimension: question?.dimension || 'psi',
        questionType: question?.type,
        weight: question?.weight,
      };
    });

    // Get previous scores for derivative calculation
    // For now, we'll skip derivative calculation in this method
    const result = calculateGCTCoherence(gctResponses);

    return {
      coherenceScore: result.percentage,
      dimensionScores: {
        psi: result.dimensions.psi,
        rho: result.dimensions.rho,
        q: result.dimensions.q,
        f: result.dimensions.f,
      },
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

    if (previousRecords.length < 1) {
      return 0; // Not enough data for derivative
    }

    // Convert to format expected by GCT scoring
    const previousScores = previousRecords.map(record => ({
      score: record.score,
      timestamp: record.timestamp,
    }));

    // Add current score to the list
    previousScores.unshift({
      score: currentScore,
      timestamp: new Date(),
    });

    // Use GCT scoring's derivative calculation
    const result = calculateGCTCoherence([], previousScores);
    
    return result.derivative || 0;
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