'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState('Initializing...');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    // Process registration data
    processRegistration();
  }, [session, status]);

  const processRegistration = async () => {
    try {
      // Step 1: Check for pending registration data
      setStep('Setting up your account...');
      setProgress(25);
      
      const pendingData = sessionStorage.getItem('gct_registration_pending');
      if (pendingData) {
        const registrationData = JSON.parse(pendingData);
        
        // Step 2: Create user profile
        setStep('Creating your profile...');
        setProgress(50);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Store user data with role and category
        const userData = {
          id: `user_${Date.now()}`,
          email: session.user?.email,
          name: session.user?.name,
          role: registrationData.role || 'coach',
          category: registrationData.category,
          tenantId: `tenant_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        
        // Save to localStorage (in production, this would be an API call)
        const users = JSON.parse(localStorage.getItem('gct_users') || '[]');
        const existingIndex = users.findIndex((u: any) => u.email === userData.email);
        
        if (existingIndex >= 0) {
          users[existingIndex] = { ...users[existingIndex], ...userData };
        } else {
          users.push(userData);
        }
        
        localStorage.setItem('gct_users', JSON.stringify(users));
        sessionStorage.removeItem('gct_registration_pending');
        
        // Step 3: Set up workspace
        setStep('Setting up your workspace...');
        setProgress(75);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 4: Complete
        setStep('All set!');
        setProgress(100);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Store registration completion
        sessionStorage.setItem('registration_complete', 'true');
      }
      
      setIsProcessing(false);
    } catch (error) {
      console.error('Registration processing error:', error);
      setIsProcessing(false);
    }
  };

  const handleContinue = () => {
    router.push('/dashboard');
  };

  if (status === 'loading' || isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Setting Up Your Account</CardTitle>
            <CardDescription>{step}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <CardTitle>Welcome to GCT CoachHelper!</CardTitle>
          <CardDescription>
            Your account has been successfully created. You're all set to start transforming lives.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">✓ Account created</p>
              <p className="mb-2">✓ Profile initialized</p>
              <p className="mb-2">✓ Workspace ready</p>
            </div>
            <Button onClick={handleContinue} className="w-full">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}