'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Loader2 } from 'lucide-react';
import type { CoachSignupState } from '@/app/actions/auth';

const coachingCategories = [
  { id: 'life', name: 'Life Coaching', description: 'Personal development and goal achievement' },
  { id: 'executive', name: 'Executive Coaching', description: 'Leadership and professional growth' },
  { id: 'health', name: 'Health & Wellness', description: 'Physical and mental wellbeing' },
  { id: 'business', name: 'Business Coaching', description: 'Entrepreneurship and business strategy' },
  { id: 'relationship', name: 'Relationship Coaching', description: 'Personal and professional relationships' },
  { id: 'rehabilitation', name: 'Rehabilitation Coaching', description: 'Recovery and rebuilding support' },
];

const tiers = [
  { id: 'starter', name: 'Starter', price: '$49/mo', features: ['Up to 10 clients', 'Basic branding'] },
  { id: 'professional', name: 'Professional', price: '$99/mo', features: ['Up to 50 clients', 'Custom domain'] },
  { id: 'enterprise', name: 'Enterprise', price: '$249/mo', features: ['Unlimited clients', 'White label'] },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Setting up your account...
        </>
      ) : (
        <>
          <Mail className="mr-2 h-5 w-5" />
          Continue with Google
        </>
      )}
    </Button>
  );
}

export function CoachSignupForm({ 
  action 
}: { 
  action: (prevState: CoachSignupState, formData: FormData) => Promise<CoachSignupState> 
}) {
  const [state, formAction] = useFormState(action, {});
  const router = useRouter();

  // Handle successful submission
  useEffect(() => {
    if (state.success) {
      // Redirect to OAuth after successful validation
      router.push('/api/auth/signin/google');
    }
  }, [state.success, router]);

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="text-3xl">Start Your Coaching Journey</CardTitle>
        <CardDescription className="text-lg">
          Set up your coaching practice in minutes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6" noValidate>
          {/* Form-level errors */}
          {state.errors?._form && (
            <Alert variant="destructive">
              <AlertDescription>{state.errors._form[0]}</AlertDescription>
            </Alert>
          )}

          {/* Category Selection */}
          <fieldset>
            <legend className="text-base font-semibold mb-4">
              Select Your Coaching Specialty <span className="text-destructive">*</span>
            </legend>
            <div className="grid gap-3" role="radiogroup" aria-required="true">
              {coachingCategories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    type="radio"
                    name="category"
                    value={category.id}
                    defaultChecked={state.values?.category === category.id}
                    aria-describedby={state.errors?.category ? 'category-error' : undefined}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {category.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {state.errors?.category && (
              <p id="category-error" className="text-sm text-destructive mt-2" role="alert">
                {state.errors.category[0]}
              </p>
            )}
          </fieldset>

          {/* Tier Selection */}
          <fieldset>
            <legend className="text-base font-semibold mb-4">
              Choose Your Plan
            </legend>
            <div className="grid md:grid-cols-3 gap-4">
              {tiers.map((tier) => (
                <label
                  key={tier.id}
                  className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    type="radio"
                    name="tier"
                    value={tier.id}
                    defaultChecked={state.values?.tier === tier.id || tier.id === 'starter'}
                    className="sr-only"
                  />
                  <div>
                    <div className="font-medium">{tier.name}</div>
                    <div className="text-2xl font-bold mt-1">{tier.price}</div>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      {tier.features.map((feature, i) => (
                        <li key={i}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Business Name */}
          <div>
            <Label htmlFor="businessName">
              Business Name (optional)
            </Label>
            <Input
              id="businessName"
              name="businessName"
              type="text"
              defaultValue={state.values?.businessName}
              aria-describedby={state.errors?.businessName ? 'businessName-error' : undefined}
              placeholder="Your Coaching Business"
              className="mt-1"
            />
            {state.errors?.businessName && (
              <p id="businessName-error" className="text-sm text-destructive mt-1" role="alert">
                {state.errors.businessName[0]}
              </p>
            )}
          </div>

          {/* Terms acceptance */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="acceptTerms"
              name="acceptTerms"
              aria-describedby={state.errors?.acceptTerms ? 'terms-error' : undefined}
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor="acceptTerms" className="text-sm font-normal">
                I agree to the Terms of Service and Privacy Policy
              </Label>
              {state.errors?.acceptTerms && (
                <p id="terms-error" className="text-sm text-destructive mt-1" role="alert">
                  {state.errors.acceptTerms[0]}
                </p>
              )}
            </div>
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}