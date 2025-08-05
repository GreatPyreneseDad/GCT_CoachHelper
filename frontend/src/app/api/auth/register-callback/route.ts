import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL('/auth/signin', req.url));
    }
    
    // Check if we have pending registration data
    const searchParams = req.nextUrl.searchParams;
    const error = searchParams.get('error');
    
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(new URL('/auth/error', req.url));
    }
    
    // Create user record in our mock database
    const users = JSON.parse(
      globalThis.localStorage?.getItem('gct_users') || '[]'
    );
    
    const existingUser = users.find((u: any) => u.email === session.user.email);
    
    if (!existingUser) {
      // New user - create their record
      const newUser = {
        id: `user_${Date.now()}`,
        email: session.user.email,
        name: session.user.name,
        role: 'coach', // This should come from registration data
        tenantId: `tenant_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      
      users.push(newUser);
      
      // In a real app, this would be saved to a database
      if (typeof globalThis.localStorage !== 'undefined') {
        globalThis.localStorage.setItem('gct_users', JSON.stringify(users));
      }
    }
    
    // Redirect based on user role
    const userRole = existingUser?.role || 'coach';
    const redirectUrl = userRole === 'coach' ? '/onboarding' : '/portal/onboarding';
    
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  } catch (error) {
    console.error('Register callback error:', error);
    return NextResponse.redirect(new URL('/auth/error', req.url));
  }
}