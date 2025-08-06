import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireCoach, requireClient } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';
import asyncHandler from 'express-async-handler';
import { EmailService } from '../services/email.service';

const router = Router();

// Get all clients for a coach (dashboard data)
router.get('/dashboard', authenticate, requireCoach, asyncHandler(async (req: any, res) => {
  const coach = await prisma.coach.findUnique({
    where: { userId: req.user.userId },
  });

  if (!coach) {
    res.status(404).json({ error: 'Coach profile not found' });
    return;
  }

  // Get all clients with their latest coherence data
  const clients = await prisma.client.findMany({
    where: { coachId: coach.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImageUrl: true,
        },
      },
      assessments: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      coherenceRecords: {
        orderBy: { timestamp: 'desc' },
        take: 10, // Get last 10 records to calculate derivative
      },
      appointments: {
        where: {
          scheduledAt: {
            gte: new Date(),
          },
          status: 'scheduled',
        },
        orderBy: { scheduledAt: 'asc' },
        take: 1,
      },
    },
  });

  // Calculate stats
  const totalClients = clients.length;
  const activeClients = clients.filter(c => {
    const lastAssessment = c.assessments[0];
    if (!lastAssessment) return false;
    const daysSinceAssessment = (Date.now() - lastAssessment.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceAssessment < 30; // Active if assessed in last 30 days
  }).length;

  // Get upcoming sessions count
  const upcomingSessions = await prisma.appointment.count({
    where: {
      coachId: coach.id,
      scheduledAt: {
        gte: new Date(),
        lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
      },
      status: 'scheduled',
    },
  });

  // Calculate average coherence
  const coherenceScores = clients
    .map(c => c.currentCoherence)
    .filter(score => score !== null);
  const averageCoherence = coherenceScores.length > 0
    ? Math.round(coherenceScores.reduce((a, b) => a + b, 0) / coherenceScores.length)
    : 0;

  // Format client data
  const formattedClients = clients.map(client => {
    // Calculate derivative from recent records
    let derivative = 0;
    if (client.coherenceRecords.length >= 2) {
      const recent = client.coherenceRecords[0];
      const previous = client.coherenceRecords[client.coherenceRecords.length - 1];
      const timeDiff = (recent.timestamp.getTime() - previous.timestamp.getTime()) / (1000 * 60 * 60 * 24 * 7); // Weeks
      if (timeDiff > 0) {
        derivative = (recent.score - previous.score) / timeDiff / 100; // Convert to decimal per week
      }
    }

    // Determine status based on coherence and derivative
    const status = getClientStatus(client.currentCoherence, derivative);

    return {
      id: client.id,
      name: client.user.name || 'Unknown',
      email: client.user.email,
      profileImageUrl: client.user.profileImageUrl,
      coherenceScore: Math.round(client.currentCoherence),
      coherenceDerivative: parseFloat(derivative.toFixed(3)),
      lastSession: client.assessments[0]?.createdAt || null,
      nextAppointment: client.appointments[0]?.scheduledAt || null,
      status,
      goals: client.goals,
    };
  });

  res.json({
    clients: formattedClients,
    stats: {
      totalClients,
      activeClients,
      upcomingSessions,
      averageCoherence,
    },
  });
}));

// Get current client's coherence data (for client portal)
router.get('/me/coherence', authenticate, requireClient, asyncHandler(async (req: any, res) => {
  const client = await prisma.client.findUnique({
    where: { userId: req.user.userId },
    include: {
      coherenceRecords: {
        orderBy: { timestamp: 'desc' },
        take: 1,
      },
      assessments: {
        where: { status: 'COMPLETED' },
        orderBy: { completedAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!client) {
    res.status(404).json({ error: 'Client profile not found' });
    return;
  }

  // Get dimension scores from latest assessment
  let dimensions = {};
  if (client.assessments[0]?.scores) {
    dimensions = client.assessments[0].scores;
  }

  // Calculate derivative
  let derivative = 0;
  if (client.coherenceRecords.length > 0) {
    const recent = client.coherenceRecords[0];
    derivative = recent.derivative;
  }

  res.json({
    overall: client.currentCoherence,
    dimensions,
    derivative,
    lastAssessment: client.lastAssessmentAt,
    status: getClientStatus(client.currentCoherence, derivative),
  });
}));

// Get client's progress data
router.get('/me/progress', authenticate, requireClient, asyncHandler(async (req: any, res) => {
  const { period = '30d' } = req.query;
  
  const client = await prisma.client.findUnique({
    where: { userId: req.user.userId },
  });

  if (!client) {
    res.status(404).json({ error: 'Client profile not found' });
    return;
  }

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30);
  }

  // Get coherence records for the period
  const records = await prisma.coherenceRecord.findMany({
    where: {
      clientId: client.id,
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { timestamp: 'asc' },
  });

  // Format for charting
  const dataPoints = records.map(record => ({
    date: record.timestamp,
    score: record.score,
    dimensions: record.dimensions,
  }));

  // Calculate summary statistics
  const scores = records.map(r => r.score);
  const summary = {
    current: client.currentCoherence,
    average: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
    min: scores.length > 0 ? Math.min(...scores) : 0,
    max: scores.length > 0 ? Math.max(...scores) : 0,
    trend: calculateTrend(dataPoints),
  };

  res.json({
    dataPoints,
    summary,
    period,
  });
}));

// Get single client details (for coaches)
router.get('/:clientId', authenticate, requireCoach, asyncHandler(async (req: any, res) => {
  const { clientId } = req.params;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      user: true,
      assessments: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      coherenceRecords: {
        orderBy: { timestamp: 'desc' },
        take: 100,
      },
      appointments: {
        orderBy: { scheduledAt: 'desc' },
        take: 10,
      },
      interventions: {
        include: {
          intervention: true,
        },
        orderBy: { assignedAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!client) {
    res.status(404).json({ error: 'Client not found' });
    return;
  }

  // Verify the coach has access to this client
  const coach = await prisma.coach.findUnique({
    where: { userId: req.user.userId },
  });

  if (!coach || client.coachId !== coach.id) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  res.json(client);
}));

// Create invite code for new client
router.post('/invite', authenticate, requireCoach, asyncHandler(async (req: any, res) => {
  const { email, name } = req.body;
  
  const coach = await prisma.coach.findUnique({
    where: { userId: req.user.userId },
    include: { user: true },
  });

  if (!coach) {
    res.status(404).json({ error: 'Coach profile not found' });
    return;
  }

  // Generate unique invite code
  const inviteCode = `${coach.user.name.substring(0, 3).toUpperCase()}-${generateInviteCode()}`;
  
  // Create pending client record
  const pendingClient = await prisma.client.create({
    data: {
      coachId: coach.id,
      inviteCode,
      status: 'INVITED',
      currentCoherence: 50, // Default starting coherence
      goals: [],
      // User will be linked when they accept the invite
    },
  });

  // Send invite email if email provided
  if (email && name) {
    await EmailService.sendClientInvite(email, name, coach.user.name || 'Your coach', inviteCode);
  }

  res.json({
    inviteCode,
    inviteUrl: `${process.env.FRONTEND_URL}/client/join?code=${inviteCode}`,
    message: email ? 'Invite sent successfully' : 'Invite created successfully',
  });
}));

// Validate invite code
router.get('/validate-invite', asyncHandler(async (req, res) => {
  const { code } = req.query;

  if (!code) {
    res.status(400).json({ valid: false, error: 'Invite code required' });
    return;
  }

  const client = await prisma.client.findFirst({
    where: { 
      inviteCode: code as string,
      status: 'INVITED',
    },
    include: {
      coach: {
        include: { user: true },
      },
    },
  });

  if (!client) {
    res.json({ valid: false });
    return;
  }

  res.json({
    valid: true,
    coachName: client.coach.user.name || 'Your coach',
    coachEmail: client.coach.user.email,
  });
}));

// Helper functions
function getClientStatus(coherenceScore: number, derivative: number): string {
  if (coherenceScore < 40 || derivative < -0.05) return 'critical';
  if (coherenceScore < 60 || derivative < -0.01) return 'warning';
  if (coherenceScore > 80 && derivative > 0.02) return 'thriving';
  if (coherenceScore > 90 && derivative > 0.05) return 'breakthrough';
  return 'stable';
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function calculateTrend(dataPoints: any[]): 'up' | 'down' | 'stable' {
  if (dataPoints.length < 2) return 'stable';
  
  const firstHalf = dataPoints.slice(0, Math.floor(dataPoints.length / 2));
  const secondHalf = dataPoints.slice(Math.floor(dataPoints.length / 2));
  
  const firstAvg = firstHalf.reduce((sum, p) => sum + p.score, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, p) => sum + p.score, 0) / secondHalf.length;
  
  const difference = secondAvg - firstAvg;
  
  if (difference > 5) return 'up';
  if (difference < -5) return 'down';
  return 'stable';
}

export default router;