'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

export default function ClientJoinPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inviteCode = searchParams.get('code');
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [coachName, setCoachName] = useState('');
  
  useEffect(() => {
    if (inviteCode) {
      validateInviteCode(inviteCode);
    } else {
      setIsValidating(false);
    }
  }, [inviteCode]);
  
  const validateInviteCode = async (code: string) => {
    try {
      const response = await apiClient.get<{
        valid: boolean;
        coachName?: string;
        coachEmail?: string;
      }>(`/clients/validate-invite?code=${code}`);
      
      if (response.valid) {
        setIsValid(true);
        setCoachName(response.coachName || 'Your coach');
      }
    } catch (error) {
      console.error('Invalid invite code');
    } finally {
      setIsValidating(false);
    }
  };
  
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="mt-4 text-muted-foreground">Validating invite code...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!inviteCode || !isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
              <h3 className="mt-4 text-lg font-semibold">Invalid Invite Code</h3>
              <p className="mt-2 text-muted-foreground">
                This invite code is invalid or has expired. Please contact your coach for a new invite.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push('/')}
              >
                Go to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join {coachName}'s Coaching Program</CardTitle>
          <CardDescription>
            Track your transformation journey with scientific precision
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">What you'll get:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Personal coherence tracking dashboard
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Weekly progress assessments
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Scientific measurement of your growth
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Direct connection with your coach
                </li>
              </ul>
            </div>
            
            <Button 
              onClick={() => router.push(`/auth/signup?type=client&code=${inviteCode}`)}
              className="w-full"
              size="lg"
            >
              Create Your Account
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <a href={`/auth/signin?code=${inviteCode}`} className="text-primary hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}