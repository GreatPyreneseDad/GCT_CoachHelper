import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireCoach } from '../middleware/auth.middleware';
import { prisma } from '../utils/prisma';
import asyncHandler from 'express-async-handler';

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

// Get single client details
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
  const coach = await prisma.coach.findUnique({
    where: { userId: req.user.userId },
  });

  if (!coach) {
    res.status(404).json({ error: 'Coach profile not found' });
    return;
  }

  // Generate unique invite code
  const inviteCode = generateInviteCode();

  res.json({
    inviteCode,
    inviteUrl: `${process.env.FRONTEND_URL}/client/register?code=${inviteCode}`,
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

export default router;