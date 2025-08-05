'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Apple, Mail } from 'lucide-react';

const coachingCategories = [
  { id: 'life', name: 'Life Coaching', description: 'Personal development and goal achievement' },
  { id: 'executive', name: 'Executive Coaching', description: 'Leadership and professional growth' },
  { id: 'health', name: 'Health & Wellness', description: 'Physical and mental wellbeing' },
  { id: 'business', name: 'Business Coaching', description: 'Entrepreneurship and business strategy' },
  { id: 'relationship', name: 'Relationship Coaching', description: 'Personal and professional relationships' },
  { id: 'rehabilitation', name: 'Rehabilitation Coaching', description: 'Recovery and rebuilding support' },
];

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState<'category' | 'account'>('category');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleOAuthSignUp = async (provider: 'apple' | 'google') => {
    setIsLoading(true);
    try {
      await signIn(provider, {
        callbackUrl: '/onboarding',
        category: selectedCategory,
        isCoachSignup: true,
      });
    } catch (error) {
      console.error('Sign up error:', error);
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement email signup
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create Your Coaching Platform</CardTitle>
          <CardDescription>
            {step === 'category' 
              ? 'Select your coaching specialty to customize your platform'
              : 'Choose how you want to create your account'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'category' ? (
            <div className="space-y-6">
              <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory}>
                <div className="grid gap-4">
                  {coachingCategories.map((category) => (
                    <div key={category.id} className="flex items-start space-x-3">
                      <RadioGroupItem value={category.id} id={category.id} />
                      <Label htmlFor={category.id} className="cursor-pointer flex-1">
                        <div className="font-semibold">{category.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {category.description}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
              <Button 
                onClick={() => setStep('account')} 
                disabled={!selectedCategory}
                className="w-full"
              >
                Continue
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
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
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
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
                  Continue with Google
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="coach@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <Mail className="mr-2 h-5 w-5" />
                  Continue with Email
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                By creating an account, you agree to our{' '}
                <a href="/terms" className="underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}