import { Router } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { authenticate } from '../middleware/auth.middleware';
import asyncHandler from 'express-async-handler';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(['COACH', 'CLIENT']),
  category: z.string().optional(),
  inviteCode: z.string().optional(), // For clients joining coaches
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const oauthLoginSchema = z.object({
  provider: z.enum(['google', 'apple']),
  idToken: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().optional(),
  }),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

// Register endpoint
router.post('/register', asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);
  
  // If client, verify invite code
  if (data.role === 'CLIENT' && data.inviteCode) {
    const client = await prisma.client.findUnique({
      where: { inviteCode: data.inviteCode },
    });
    
    if (!client) {
      res.status(400).json({ error: 'Invalid invite code' });
      return;
    }
  }

  const { user, tokens } = await AuthService.register(data);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
    },
    tokens,
  });
}));

// Login endpoint
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  
  const { user, tokens } = await AuthService.login(email, password);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
    },
    tokens,
  });
}));

// OAuth login endpoint
router.post('/oauth', asyncHandler(async (req, res) => {
  const { provider, user: profile } = oauthLoginSchema.parse(req.body);
  
  const { user, tokens } = await AuthService.loginWithOAuth(provider, profile);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
    },
    tokens,
  });
}));

// Refresh token endpoint
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = refreshSchema.parse(req.body);
  
  const tokens = await AuthService.refreshTokens(refreshToken);

  res.json(tokens);
}));

// Logout endpoint
router.post('/logout', authenticate, asyncHandler(async (req: any, res) => {
  const { refreshToken } = req.body;
  
  await AuthService.logout(req.user.userId, refreshToken);

  res.json({ message: 'Logged out successfully' });
}));

// Get current user
router.get('/me', authenticate, asyncHandler(async (req: any, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      tenantId: true,
      category: true,
      profileImageUrl: true,
      coachProfile: {
        select: {
          bio: true,
          specializations: true,
          yearsExperience: true,
          hourlyRate: true,
          isAvailable: true,
        },
      },
      clientProfile: {
        select: {
          currentCoherence: true,
          goals: true,
          coach: {
            select: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json(user);
}));

// Import required at the top of the file
import { prisma } from '../utils/prisma';

export default router;