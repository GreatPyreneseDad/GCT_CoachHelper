'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Target,
  Heart,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const steps = [
  { id: 'welcome', title: 'Welcome', icon: Heart },
  { id: 'goals', title: 'Your Goals', icon: Target },
  { id: 'availability', title: 'Availability', icon: Calendar },
  { id: 'assessment', title: 'Initial Assessment', icon: MessageSquare },
];

export default function ClientOnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const coachCode = searchParams.get('coach');
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    primaryGoal: '',
    challenges: '',
    commitmentLevel: '',
    preferredSessionTime: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  // Mock coach info - in production, fetch based on coachCode
  const coachInfo = {
    name: 'Sarah Johnson',
    businessName: 'Transform Life Coaching',
    welcomeMessage: 'I\'m excited to support you on your journey to transformation!',
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      // TODO: Save onboarding data and redirect to initial assessment
      toast({
        title: 'Welcome to your coaching journey!',
        description: 'Let\'s start with your initial assessment.',
      });
      router.push('/portal/assessment/initial');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete onboarding. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container max-w-2xl mx-auto p-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`flex items-center ${
                    index !== steps.length - 1 ? 'flex-1' : ''
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      index <= currentStep
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  {index !== steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        index < currentStep ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold">
                    {coachInfo.businessName.charAt(0)}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    Welcome to {coachInfo.businessName}
                  </h2>
                  <p className="text-muted-foreground">
                    Coach {coachInfo.name} says:
                  </p>
                  <p className="text-lg mt-2 italic">
                    "{coachInfo.welcomeMessage}"
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">What to expect:</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Weekly coaching sessions tailored to your needs</li>
                    <li>• Regular progress assessments using GCT framework</li>
                    <li>• Evidence-based interventions and exercises</li>
                    <li>• Ongoing support between sessions</li>
                  </ul>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <CardDescription>
                  Help us understand what brings you to coaching
                </CardDescription>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="primaryGoal">
                      What's your primary goal for coaching?
                    </Label>
                    <Textarea
                      id="primaryGoal"
                      value={formData.primaryGoal}
                      onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
                      placeholder="I want to..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="challenges">
                      What challenges are you currently facing?
                    </Label>
                    <Textarea
                      id="challenges"
                      value={formData.challenges}
                      onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
                      placeholder="I'm struggling with..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>How committed are you to making changes?</Label>
                    <RadioGroup
                      value={formData.commitmentLevel}
                      onValueChange={(value) => setFormData({ ...formData, commitmentLevel: value })}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="exploring" id="exploring" />
                        <Label htmlFor="exploring">Just exploring options</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ready" id="ready" />
                        <Label htmlFor="ready">Ready to start making changes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="committed" id="committed" />
                        <Label htmlFor="committed">Fully committed to transformation</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <CardDescription>
                  Let's find the best times for your coaching sessions
                </CardDescription>
                <div className="space-y-4">
                  <div>
                    <Label>What time of day works best for you?</Label>
                    <RadioGroup
                      value={formData.preferredSessionTime}
                      onValueChange={(value) => setFormData({ ...formData, preferredSessionTime: value })}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="morning" id="morning" />
                        <Label htmlFor="morning">Morning (8am - 12pm)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="afternoon" id="afternoon" />
                        <Label htmlFor="afternoon">Afternoon (12pm - 5pm)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="evening" id="evening" />
                        <Label htmlFor="evening">Evening (5pm - 8pm)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Your timezone</Label>
                    <Input
                      id="timezone"
                      value={formData.timezone}
                      readOnly
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Detected automatically. Your coach will see available times in your timezone.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <h3 className="text-lg font-semibold mb-2">
                    Ready for Your Initial Assessment
                  </h3>
                  <p className="text-muted-foreground">
                    Next, you'll complete a comprehensive assessment that helps us understand 
                    your current state across four key dimensions of human coherence.
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">The assessment will measure:</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• <strong>Ψ (Psi)</strong> - Your internal consistency and alignment</li>
                    <li>• <strong>ρ (Rho)</strong> - Your accumulated wisdom and learning</li>
                    <li>• <strong>q</strong> - Your moral activation and courage</li>
                    <li>• <strong>f</strong> - Your social belonging and connections</li>
                  </ul>
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  This takes about 15-20 minutes and provides a baseline for tracking your progress
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {currentStep === steps.length - 1 ? (
            <Button onClick={handleComplete}>
              Start Assessment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}