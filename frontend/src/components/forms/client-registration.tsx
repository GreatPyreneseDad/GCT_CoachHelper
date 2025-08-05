'use client';

import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, CheckCircle, Info, Loader2 } from 'lucide-react';
import { AccessibleRadioGroup, AccessibleCheckboxGroup } from './accessible-patterns';
import { verifyCoachCode, createClientProfile } from '@/app/actions/client-auth';
import type { VerifyCoachState, ClientProfileState } from '@/app/actions/client-auth';

const goals = [
  { value: 'personal-growth', label: 'Personal Growth', description: 'Develop self-awareness and reach your potential' },
  { value: 'career', label: 'Career Development', description: 'Advance your professional life' },
  { value: 'relationships', label: 'Better Relationships', description: 'Improve personal and professional connections' },
  { value: 'health', label: 'Health & Wellness', description: 'Physical and mental wellbeing' },
  { value: 'life-balance', label: 'Work-Life Balance', description: 'Find harmony in all areas of life' },
];

const sessionTimes = [
  { value: 'morning', label: 'Morning', description: '6 AM - 12 PM' },
  { value: 'afternoon', label: 'Afternoon', description: '12 PM - 6 PM' },
  { value: 'evening', label: 'Evening', description: '6 PM - 10 PM' },
  { value: 'flexible', label: 'Flexible', description: 'I can adapt to coach availability' },
];

const timezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
];

function SubmitButton({ text, loadingText }: { text: string; loadingText: string }) {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {text}
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}

export function ClientRegistrationForm() {
  const [step, setStep] = useState<'verify' | 'profile' | 'complete'>('verify');
  const [verifyState, verifyAction] = useFormState(verifyCoachCode, {});
  const [profileState, profileAction] = useFormState(createClientProfile, {});
  const router = useRouter();

  // Handle step transitions
  useEffect(() => {
    if (verifyState.success && step === 'verify') {
      setStep('profile');
    }
  }, [verifyState.success, step]);

  useEffect(() => {
    if (profileState.success && step === 'profile') {
      setStep('complete');
      // Redirect to OAuth after a brief delay
      setTimeout(() => {
        router.push('/api/auth/signin/google');
      }, 2000);
    }
  }, [profileState.success, step, router]);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Join Your Coach</CardTitle>
        <CardDescription>
          {step === 'verify' && 'Enter the invitation code from your coach'}
          {step === 'profile' && 'Tell us about yourself'}
          {step === 'complete' && 'Registration complete!'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Step 1: Verify Coach Code */}
        {step === 'verify' && (
          <form action={verifyAction} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="coachCode">
                Coach Invitation Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="coachCode"
                name="coachCode"
                defaultValue={verifyState.values?.coachCode}
                placeholder="ABC-123-XYZ"
                className="uppercase text-center text-lg font-mono"
                maxLength={11}
                aria-describedby={verifyState.errors?.coachCode ? 'code-error' : 'code-help'}
                aria-invalid={verifyState.errors?.coachCode ? 'true' : 'false'}
                pattern="[A-Z]{3}-[A-Z0-9]{3}-[A-Z0-9]{3}"
                title="Format: XXX-XXX-XXX"
              />
              {!verifyState.errors?.coachCode && (
                <p id="code-help" className="text-sm text-muted-foreground mt-1">
                  Your coach should have provided you with this code
                </p>
              )}
              {verifyState.errors?.coachCode && (
                <p id="code-error" className="text-sm text-destructive mt-1" role="alert">
                  {verifyState.errors.coachCode[0]}
                </p>
              )}
            </div>

            {verifyState.errors?._form && (
              <Alert variant="destructive">
                <AlertDescription>{verifyState.errors._form[0]}</AlertDescription>
              </Alert>
            )}

            <SubmitButton text="Verify Code" loadingText="Verifying..." />
          </form>
        )}

        {/* Step 2: Create Profile */}
        {step === 'profile' && verifyState.coach && (
          <form action={profileAction} className="space-y-6" noValidate>
            {/* Coach confirmation */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                You're joining <strong>{verifyState.coach.businessName}</strong> 
                with coach <strong>{verifyState.coach.name}</strong>
              </AlertDescription>
            </Alert>

            {/* Full Name */}
            <div>
              <Label htmlFor="fullName">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={profileState.values?.fullName}
                aria-describedby={profileState.errors?.fullName ? 'name-error' : undefined}
                aria-invalid={profileState.errors?.fullName ? 'true' : 'false'}
                required
              />
              {profileState.errors?.fullName && (
                <p id="name-error" className="text-sm text-destructive mt-1" role="alert">
                  {profileState.errors.fullName[0]}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone Number (optional)</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={profileState.values?.phone}
                placeholder="+1 (555) 123-4567"
                aria-describedby={profileState.errors?.phone ? 'phone-error' : undefined}
              />
              {profileState.errors?.phone && (
                <p id="phone-error" className="text-sm text-destructive mt-1" role="alert">
                  {profileState.errors.phone[0]}
                </p>
              )}
            </div>

            {/* Timezone */}
            <div>
              <Label htmlFor="timezone">
                Timezone <span className="text-destructive">*</span>
              </Label>
              <select
                id="timezone"
                name="timezone"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                defaultValue={profileState.values?.timezone}
                aria-describedby={profileState.errors?.timezone ? 'timezone-error' : undefined}
                required
              >
                <option value="">Select your timezone</option>
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              {profileState.errors?.timezone && (
                <p id="timezone-error" className="text-sm text-destructive mt-1" role="alert">
                  {profileState.errors.timezone[0]}
                </p>
              )}
            </div>

            {/* Goals */}
            <AccessibleCheckboxGroup
              name="goals"
              label="What are your coaching goals?"
              options={goals}
              defaultValues={profileState.values?.goals || []}
              error={profileState.errors?.goals?.[0]}
              required
              minSelection={1}
            />

            {/* Preferred Session Time */}
            <AccessibleRadioGroup
              name="preferredSessionTime"
              label="Preferred session time"
              options={sessionTimes}
              defaultValue={profileState.values?.preferredSessionTime}
              error={profileState.errors?.preferredSessionTime?.[0]}
              required
            />

            {/* Consent */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consentToRecording"
                  name="consentToRecording"
                  className="mt-1"
                  aria-describedby={profileState.errors?.consentToRecording ? 'consent-error' : 'consent-desc'}
                  required
                />
                <div className="flex-1">
                  <Label htmlFor="consentToRecording" className="font-normal">
                    I consent to recording of coaching sessions
                  </Label>
                  <p id="consent-desc" className="text-sm text-muted-foreground mt-1">
                    Sessions may be recorded for quality assurance and your review. 
                    Recordings are stored securely and never shared without your permission.
                  </p>
                  {profileState.errors?.consentToRecording && (
                    <p id="consent-error" className="text-sm text-destructive mt-1" role="alert">
                      {profileState.errors.consentToRecording[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {profileState.errors?._form && (
              <Alert variant="destructive">
                <AlertDescription>{profileState.errors._form[0]}</AlertDescription>
              </Alert>
            )}

            <SubmitButton text="Complete Registration" loadingText="Creating your profile..." />
          </form>
        )}

        {/* Step 3: Success */}
        {step === 'complete' && (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Registration Complete!</h3>
            <p className="text-muted-foreground mb-4">
              Redirecting you to complete your account setup...
            </p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}