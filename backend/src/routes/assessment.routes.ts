import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireClient, requireCoach } from '../middleware/auth.middleware';
import { AssessmentService } from '../services/assessment.service';
import asyncHandler from 'express-async-handler';
import { prisma } from '../utils/prisma';

const router = Router();

// Validation schemas
const createAssessmentSchema = z.object({
  type: z.enum(['initial', 'quick_checkin', 'deep_dive']),
});

const submitResponsesSchema = z.object({
  assessmentId: z.string(),
  responses: z.array(z.object({
    questionId: z.string(),
    value: z.union([z.string(), z.number()]),
  })),
});

// Create new assessment (for clients)
router.post('/create', authenticate, requireClient, asyncHandler(async (req: any, res) => {
  const { type } = createAssessmentSchema.parse(req.body);
  
  // Get client profile
  const client = await prisma.client.findUnique({
    where: { userId: req.user.userId },
  });

  if (!client) {
    res.status(404).json({ error: 'Client profile not found' });
    return;
  }

  const { assessmentId, questions } = await AssessmentService.createAssessment(
    client.id,
    type
  );

  res.json({
    assessmentId,
    questions,
    type,
  });
}));

// Submit assessment responses (for clients)
router.post('/submit', authenticate, requireClient, asyncHandler(async (req: any, res) => {
  const { assessmentId, responses } = submitResponsesSchema.parse(req.body);
  
  // Verify the assessment belongs to the client
  const client = await prisma.client.findUnique({
    where: { userId: req.user.userId },
  });

  if (!client) {
    res.status(404).json({ error: 'Client profile not found' });
    return;
  }

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
  });

  if (!assessment || assessment.clientId !== client.id) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const result = await AssessmentService.submitResponses(assessmentId, responses);

  res.json({
    success: true,
    ...result,
  });
}));

// Get assessment history (for clients)
router.get('/history', authenticate, requireClient, asyncHandler(async (req: any, res) => {
  const client = await prisma.client.findUnique({
    where: { userId: req.user.userId },
  });

  if (!client) {
    res.status(404).json({ error: 'Client profile not found' });
    return;
  }

  const history = await AssessmentService.getAssessmentHistory(client.id);

  res.json({ assessments: history });
}));

// Get specific assessment details (for both clients and coaches)
router.get('/:assessmentId', authenticate, asyncHandler(async (req: any, res) => {
  const { assessmentId } = req.params;
  
  const assessment = await AssessmentService.getAssessmentDetails(assessmentId);

  // Check access permissions
  if (req.user.role === 'CLIENT') {
    const client = await prisma.client.findUnique({
      where: { userId: req.user.userId },
    });

    if (!client || assessment.clientId !== client.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
  } else if (req.user.role === 'COACH') {
    const coach = await prisma.coach.findUnique({
      where: { userId: req.user.userId },
    });

    if (!coach || assessment.client.coachId !== coach.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
  }

  res.json(assessment);
}));

// Get client assessments (for coaches)
router.get('/client/:clientId', authenticate, requireCoach, asyncHandler(async (req: any, res) => {
  const { clientId } = req.params;
  
  // Verify the client belongs to the coach
  const coach = await prisma.coach.findUnique({
    where: { userId: req.user.userId },
  });

  if (!coach) {
    res.status(404).json({ error: 'Coach profile not found' });
    return;
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
  });

  if (!client || client.coachId !== coach.id) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const assessments = await AssessmentService.getAssessmentHistory(clientId);

  res.json({ assessments });
}));

// Get available assessment types
router.get('/types/available', authenticate, (req, res) => {
  res.json({
    types: [
      {
        id: 'initial',
        name: 'GCT Initial Assessment',
        description: 'Comprehensive assessment measuring baseline across all four GCT dimensions (Ψ, ρ, Q, F)',
        duration: '30-45 minutes',
        questionCount: 48,
      },
      {
        id: 'quick_checkin',
        name: 'GCT Quick Check-in',
        description: 'Brief assessment to track progress and current coherence state',
        duration: '5-10 minutes',
        questionCount: 10,
      },
      {
        id: 'deep_dive',
        name: 'GCT Deep Dive Assessment',
        description: 'Extended assessment for detailed analysis of specific dimensions',
        duration: '45-60 minutes',
        questionCount: 48,
      },
    ],
  });
});

export default router;