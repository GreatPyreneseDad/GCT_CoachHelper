'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Apple, ArrowRight, CheckCircle, Info, Loader2 } from 'lucide-react';

export default function ClientRegisterPage() {
  const [step, setStep] = useState<'code' | 'verify' | 'account'>('code');
  const [coachCode, setCoachCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [coachInfo, setCoachInfo] = useState<{
    name: string;
    businessName: string;
    photo?: string;
  } | null>(null);

  const verifyCoachCode = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // TODO: Call API to verify coach code
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock coach data
      setCoachInfo({
        name: 'Sarah Johnson',
        businessName: 'Transform Life Coaching',
        photo: '/coaches/sarah.jpg'
      });
      setStep('verify');
    } catch (err) {
      setError('Invalid coach code. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: 'apple' | 'google') => {
    setIsLoading(true);
    try {
      // Include coach code in the sign-in process
      await signIn(provider, {
        callbackUrl: `/client/onboarding?coach=${coachCode}`,
        redirect: true,
      });
    } catch (error) {
      console.error('Sign up error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary/5 to-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join Your Coach</CardTitle>
          <CardDescription>
            {step === 'code' && 'Enter the invitation code from your coach'}
            {step === 'verify' && 'Confirm your coach details'}
            {step === 'account' && 'Create your account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'code' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="coachCode">Coach Invitation Code</Label>
                <Input
                  id="coachCode"
                  value={coachCode}
                  onChange={(e) => setCoachCode(e.target.value.toUpperCase())}
                  placeholder="ABC-123-XYZ"
                  className="uppercase text-center text-lg font-mono"
                  maxLength={11}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Your coach should have provided you with this code
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={verifyCoachCode} 
                className="w-full"
                disabled={coachCode.length < 3 || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="mr-2 h-4 w-4" />
                )}
                Continue
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <p>
                  Already have an account?{' '}
                  <Link href="/auth/signin" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          )}

          {step === 'verify' && coachInfo && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
                  {coachInfo.businessName.charAt(0)}
                </div>
                <h3 className="text-lg font-semibold">{coachInfo.businessName}</h3>
                <p className="text-sm text-muted-foreground">Coach: {coachInfo.name}</p>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You're about to join {coachInfo.name}'s coaching program. 
                  They will have access to your progress and assessment data.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('code')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={() => setStep('account')}
                  className="flex-1"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm
                </Button>
              </div>
            </div>
          )}

          {step === 'account' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <Button
                  onClick={() => handleOAuthSignUp('apple')}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  <Apple className="mr-2 h-5 w-5" />
                  Continue with Apple
                </Button>

                <Button
                  onClick={() => handleOAuthSignUp('google')}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  <GoogleIcon className="mr-2 h-5 w-5" />
                  Continue with Google
                </Button>
              </div>

              <p className="text-xs text-center text-muted-foreground">
                By creating an account, you agree to share your coaching progress 
                with {coachInfo?.name} and accept our{' '}
                <Link href="/terms" className="underline">Terms of Service</Link> and{' '}
                <Link href="/privacy" className="underline">Privacy Policy</Link>
              </p>
            </div>
          )}
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