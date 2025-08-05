'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Apple, AlertCircle, Loader2 } from 'lucide-react';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const error = searchParams.get('error');
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleOAuthSignIn = async (provider: 'apple' | 'google', isCoach: boolean) => {
    setIsLoading(provider);
    try {
      await signIn(provider, {
        callbackUrl: isCoach ? '/dashboard' : '/portal',
        redirect: true,
      });
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary/5 to-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4">
            <h1 className="text-2xl font-bold">GCT CoachHelper</h1>
          </div>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            Sign in to access your coaching platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error === 'OAuthSignin' && 'There was an error signing in. Please try again.'}
                {error === 'OAuthCallback' && 'There was an error with the authentication provider.'}
                {error === 'OAuthCreateAccount' && 'Could not create your account. Please try again.'}
                {error === 'Callback' && 'There was an error during the sign in process.'}
                {error === 'Default' && 'An unexpected error occurred. Please try again.'}
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="coach" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="coach">Coach Login</TabsTrigger>
              <TabsTrigger value="client">Client Login</TabsTrigger>
            </TabsList>

            <TabsContent value="coach" className="space-y-4">
              <div className="space-y-3">
                <Button
                  onClick={() => handleOAuthSignIn('apple', true)}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading !== null}
                >
                  {isLoading === 'apple' ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Apple className="mr-2 h-5 w-5" />
                  )}
                  Continue with Apple
                </Button>

                <Button
                  onClick={() => handleOAuthSignIn('google', true)}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading !== null}
                >
                  {isLoading === 'google' ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <GoogleIcon className="mr-2 h-5 w-5" />
                  )}
                  Continue with Google
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Don't have a coach account?{' '}
                  <Link href="/signup" className="text-primary hover:underline">
                    Start free trial
                  </Link>
                </p>
              </div>
            </TabsContent>

            <TabsContent value="client" className="space-y-4">
              <div className="space-y-3">
                <Button
                  onClick={() => handleOAuthSignIn('apple', false)}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading !== null}
                >
                  {isLoading === 'apple' ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Apple className="mr-2 h-5 w-5" />
                  )}
                  Continue with Apple
                </Button>

                <Button
                  onClick={() => handleOAuthSignIn('google', false)}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading !== null}
                >
                  {isLoading === 'google' ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <GoogleIcon className="mr-2 h-5 w-5" />
                  )}
                  Continue with Google
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  New client?{' '}
                  <Link href="/client/register" className="text-primary hover:underline">
                    Register with coach code
                  </Link>
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}