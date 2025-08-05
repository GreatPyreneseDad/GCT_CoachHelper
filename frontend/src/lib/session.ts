import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type SessionUser = {
  id: string;
  email: string;
  name?: string;
  role: 'coach' | 'client';
  tenantId: string;
  category?: string;
};

export type SessionData = {
  user?: SessionUser;
  registrationIntent?: {
    category: string;
    role: 'coach' | 'client';
    coachCode?: string;
    timestamp: number;
  };
  isLoggedIn: boolean;
};

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'gct_session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  },
};

// Get session (server-side only)
export async function getSession() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  
  // Initialize session data if empty
  if (!session.isLoggedIn) {
    session.isLoggedIn = false;
  }
  
  return session;
}

// Get user from session
export async function getUser(): Promise<SessionUser | null> {
  const session = await getSession();
  return session.user || null;
}

// Require user (for protected routes)
export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  
  if (!session.user || !session.isLoggedIn) {
    redirect('/auth/signin');
  }
  
  return session.user;
}

// Require specific role
export async function requireRole(role: 'coach' | 'client'): Promise<SessionUser> {
  const user = await requireUser();
  
  if (user.role !== role) {
    redirect('/unauthorized');
  }
  
  return user;
}

// Create user session
export async function createUserSession(user: SessionUser) {
  const session = await getSession();
  
  session.user = user;
  session.isLoggedIn = true;
  
  await session.save();
}

// Store registration intent
export async function storeRegistrationIntent(data: {
  category?: string;
  role: 'coach' | 'client';
  coachCode?: string;
}) {
  const session = await getSession();
  
  session.registrationIntent = {
    ...data,
    timestamp: Date.now(),
  };
  
  await session.save();
}

// Get registration intent
export async function getRegistrationIntent() {
  const session = await getSession();
  return session.registrationIntent;
}

// Clear registration intent
export async function clearRegistrationIntent() {
  const session = await getSession();
  delete session.registrationIntent;
  await session.save();
}

// Logout
export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect('/auth/signin');
}