import { NextAuthOptions } from 'next-auth';
import AppleProvider from 'next-auth/providers/apple';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'name email',
          response_mode: 'form_post',
          response_type: 'code',
        },
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope: 'openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.send',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
      }
      
      if (user) {
        token.userId = user.id;
        token.userRole = user.role;
        token.tenantId = user.tenantId;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.userRole as string;
        session.user.tenantId = token.tenantId as string;
      }
      session.accessToken = token.accessToken as string;
      session.provider = token.provider as string;
      return session;
    },
    async signIn({ user, account, profile }) {
      // Check if user is signing up as coach or client
      const isCoachSignup = profile?.isCoachSignup;
      
      if (isCoachSignup) {
        // Create tenant for new coach
        const tenant = await prisma.tenant.create({
          data: {
            name: profile?.name || 'New Coach',
            slug: generateSlug(profile?.name),
            tier: 'starter',
            clientLimit: 10,
          },
        });
        
        // Associate user with tenant
        await prisma.user.update({
          where: { id: user.id },
          data: {
            tenantId: tenant.id,
            role: 'coach',
          },
        });
      }
      
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    newUser: '/onboarding',
  },
  session: {
    strategy: 'jwt',
  },
};

function generateSlug(name?: string | null): string {
  if (!name) return `coach-${Date.now()}`;
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}