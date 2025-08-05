import { NextAuthOptions } from 'next-auth';
import AppleProvider from 'next-auth/providers/apple';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: getAppleSecret(),
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
    async signIn({ user, account, profile, credentials }) {
      // Handle sign in logic
      if (account?.provider === 'apple' || account?.provider === 'google') {
        // Check if this is a new user registration or existing sign in
        const isNewUser = !(await checkUserExists(user.email));
        
        if (isNewUser) {
          // Store registration metadata in session for later processing
          // This will be used in the jwt callback to set proper role and tenant
          global.registrationMetadata = global.registrationMetadata || {};
          global.registrationMetadata[user.email!] = {
            timestamp: Date.now(),
            provider: account.provider,
          };
        }
        
        return true;
      }
      return false;
    },
    async jwt({ token, account, user, profile, trigger }) {
      // Initial sign in
      if (account && user) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
        token.providerAccountId = account.providerAccountId;
        token.userId = user.id;
        token.email = user.email;
        token.name = user.name;
        
        // Check if this is a new registration
        const registrationData = global.registrationMetadata?.[user.email!];
        if (registrationData) {
          // Get role from session storage or URL params
          const sessionData = await getRegistrationSession(user.email!);
          token.role = sessionData?.role || 'coach';
          token.category = sessionData?.category;
          token.coachCode = sessionData?.coachCode;
          token.tenantId = sessionData?.role === 'coach' 
            ? generateTenantId(user.email) 
            : sessionData?.tenantId;
          
          // Clean up registration metadata
          delete global.registrationMetadata[user.email!];
        } else {
          // Existing user - fetch their role from database
          const userData = await getUserData(user.email!);
          token.role = userData?.role || 'coach';
          token.tenantId = userData?.tenantId || generateTenantId(user.email);
        }
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.expiresAt as number)) {
        return token;
      }

      // Access token has expired, try to update it
      if (token.provider === 'google') {
        return refreshGoogleAccessToken(token);
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as 'coach' | 'client';
        session.user.tenantId = token.tenantId as string;
      }
      session.accessToken = token.accessToken as string;
      session.provider = token.provider as string;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle OAuth callbacks
      if (url.includes('/api/auth/callback')) {
        // Check if this is a registration callback
        if (url.includes('register-callback')) {
          return `${baseUrl}/onboarding`;
        }
        // Default redirect for sign-in
        return `${baseUrl}/dashboard`;
      }
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    newUser: '/onboarding',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Helper function to generate Apple client secret
function getAppleSecret() {
  if (process.env.APPLE_CLIENT_SECRET) {
    return process.env.APPLE_CLIENT_SECRET;
  }

  // For production, generate the secret using the private key
  const privateKey = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!privateKey) {
    throw new Error('Apple private key not configured');
  }

  // In production, you would generate a JWT here
  // For now, return a placeholder
  return 'apple-secret-placeholder';
}

// Helper function to generate tenant ID
function generateTenantId(email?: string | null): string {
  if (!email) return `tenant-${Date.now()}`;
  const slug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `${slug}-${Date.now()}`;
}

// Helper function to refresh Google access token
async function refreshGoogleAccessToken(token: any) {
  try {
    const url = 'https://oauth2.googleapis.com/token';
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expiresAt: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error('Error refreshing access token', error);
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

// Helper function to check if user exists (mock implementation)
async function checkUserExists(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  // In production, this would check your database
  // For now, check localStorage for demo
  if (typeof window !== 'undefined') {
    const users = JSON.parse(localStorage.getItem('gct_users') || '[]');
    return users.some((u: any) => u.email === email);
  }
  return false;
}

// Helper function to get registration session data
async function getRegistrationSession(email: string): Promise<any> {
  // In production, this would fetch from your session store
  // For now, check sessionStorage for demo
  if (typeof window !== 'undefined') {
    const sessionKey = `registration_${email}`;
    const data = sessionStorage.getItem(sessionKey);
    if (data) {
      sessionStorage.removeItem(sessionKey);
      return JSON.parse(data);
    }
  }
  return null;
}

// Helper function to get user data (mock implementation)
async function getUserData(email: string): Promise<any> {
  // In production, this would fetch from your database
  // For now, check localStorage for demo
  if (typeof window !== 'undefined') {
    const users = JSON.parse(localStorage.getItem('gct_users') || '[]');
    return users.find((u: any) => u.email === email);
  }
  return null;
}

// Declare global type for registration metadata
declare global {
  var registrationMetadata: Record<string, any>;
}