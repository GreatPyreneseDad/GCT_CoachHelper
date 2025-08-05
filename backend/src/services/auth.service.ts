import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { User, Role } from '@prisma/client';
import crypto from 'crypto';

interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
  tenantId: string;
}

interface RegisterData {
  email: string;
  password?: string;
  name: string;
  role: Role;
  category?: string;
  provider?: string;
  providerId?: string;
}

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET!;
  private static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
  private static readonly ACCESS_TOKEN_EXPIRY = '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = '30d';

  static async register(data: RegisterData): Promise<{ user: User; tokens: { accessToken: string; refreshToken: string } }> {
    const { email, password, name, role, category, provider, providerId } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Generate tenant ID for coaches
    const tenantId = role === 'COACH' ? this.generateTenantId(email) : '';

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        role,
        tenantId,
        category,
        hashedPassword: password ? await bcrypt.hash(password, 10) : null,
        emailVerified: provider ? new Date() : null, // Auto-verify OAuth users
      },
    });

    // Create OAuth provider record if applicable
    if (provider && providerId) {
      await prisma.oAuthProvider.create({
        data: {
          userId: user.id,
          provider,
          providerAccountId: providerId,
        },
      });
    }

    // Create role-specific profile
    if (role === 'COACH') {
      await prisma.coach.create({
        data: {
          userId: user.id,
          specializations: category ? [category] : [],
        },
      });
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  static async login(email: string, password: string): Promise<{ user: User; tokens: { accessToken: string; refreshToken: string } }> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.hashedPassword) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  static async loginWithOAuth(provider: string, profile: any): Promise<{ user: User; tokens: { accessToken: string; refreshToken: string } }> {
    const { id: providerId, email, name } = profile;

    // Check if OAuth account exists
    let oauthAccount = await prisma.oAuthProvider.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId: providerId,
        },
      },
      include: { user: true },
    });

    let user: User;

    if (oauthAccount) {
      // Existing OAuth user
      user = oauthAccount.user;
      
      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    } else {
      // Check if user exists with this email
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Link OAuth to existing user
        await prisma.oAuthProvider.create({
          data: {
            userId: existingUser.id,
            provider,
            providerAccountId: providerId,
          },
        });
        user = existingUser;
      } else {
        // Create new user with OAuth
        const registerData: RegisterData = {
          email,
          name: name || email.split('@')[0],
          role: 'COACH', // Default role, should be determined from registration flow
          provider,
          providerId,
        };
        
        const result = await this.register(registerData);
        user = result.user;
      }
    }

    const tokens = await this.generateTokens(user);

    return { user, tokens };
  }

  static async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as TokenPayload & { type: string };

      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Check if refresh token exists in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new Error('Invalid or expired refresh token');
      }

      // Delete old refresh token
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });

      // Generate new tokens
      const tokens = await this.generateTokens(storedToken.user);

      return tokens;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async logout(userId: string, refreshToken?: string): Promise<void> {
    // Delete specific refresh token or all user's refresh tokens
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: {
          userId,
          token: refreshToken,
        },
      });
    } else {
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });
    }
  }

  static async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as TokenPayload & { type: string };

      if (payload.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return payload;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  private static async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const accessToken = jwt.sign(
      { ...payload, type: 'access' },
      this.JWT_SECRET,
      { expiresIn: this.ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' },
      this.JWT_REFRESH_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private static generateTenantId(email: string): string {
    const slug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    return `${slug}-${randomSuffix}`;
  }
}