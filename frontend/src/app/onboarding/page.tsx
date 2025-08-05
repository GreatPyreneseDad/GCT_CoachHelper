'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Users,
  Target,
  CreditCard
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const steps = [
  { id: 'welcome', title: 'Welcome', icon: Sparkles },
  { id: 'category', title: 'Your Specialty', icon: Target },
  { id: 'profile', title: 'Your Profile', icon: Users },
  { id: 'plan', title: 'Choose Plan', icon: CreditCard },
];

const coachingCategories = [
  { id: 'life', name: 'Life Coaching', description: 'Personal development and life goals' },
  { id: 'executive', name: 'Executive Coaching', description: 'Leadership and professional growth' },
  { id: 'health', name: 'Health & Wellness', description: 'Physical and mental wellbeing' },
  { id: 'business', name: 'Business Coaching', description: 'Entrepreneurship and strategy' },
  { id: 'relationship', name: 'Relationship Coaching', description: 'Personal and professional relationships' },
  { id: 'rehabilitation', name: 'Rehabilitation Coaching', description: 'Recovery and rebuilding' },
];

const subscriptionPlans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$49/month',
    features: ['Up to 10 clients', 'Basic coherence tracking', 'Email support'],
    recommended: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$149/month',
    features: ['Up to 50 clients', 'Advanced analytics', 'Custom domain', 'Priority support'],
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$499/month',
    features: ['Unlimited clients', 'White-label branding', 'API access', 'Dedicated support'],
    recommended: false,
  },
];

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    category: '',
    businessName: '',
    bio: '',
    experience: '',
    plan: 'professional',
  });

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
      // TODO: Save onboarding data to API
      toast({
        title: 'Welcome aboard!',
        description: 'Your coaching platform is ready.',
      });
      router.push('/dashboard');
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
      <div className="container max-w-4xl mx-auto p-6">
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
                <div className="text-center py-8">
                  <h2 className="text-3xl font-bold mb-4">
                    Welcome to GCT CoachHelper, {session?.user?.name}!
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Let's set up your coaching platform in just a few minutes.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
                    <div className="space-y-2">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Target className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold">Track Progress</h3>
                      <p className="text-sm text-muted-foreground">
                        Scientific coherence measurement for real transformation
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold">Manage Clients</h3>
                      <p className="text-sm text-muted-foreground">
                        Real-time monitoring with color-coded triage system
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold">Your Brand</h3>
                      <p className="text-sm text-muted-foreground">
                        White-label platform with your colors and domain
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <CardDescription>
                  Select your primary coaching specialty. This helps us customize your platform.
                </CardDescription>
                <RadioGroup
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <div className="grid gap-4">
                    {coachingCategories.map((category) => (
                      <label
                        key={category.id}
                        htmlFor={category.id}
                        className="flex items-start space-x-3 cursor-pointer rounded-lg border p-4 hover:bg-muted"
                      >
                        <RadioGroupItem value={category.id} id={category.id} />
                        <div className="space-y-1">
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <CardDescription>
                  Tell us about your coaching practice
                </CardDescription>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      placeholder="Your Coaching Business"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell potential clients about your approach and philosophy..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      placeholder="e.g., 5 years"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <CardDescription>
                  Choose the plan that fits your coaching practice
                </CardDescription>
                <RadioGroup
                  value={formData.plan}
                  onValueChange={(value) => setFormData({ ...formData, plan: value })}
                >
                  <div className="grid gap-4">
                    {subscriptionPlans.map((plan) => (
                      <label
                        key={plan.id}
                        htmlFor={plan.id}
                        className={`relative flex cursor-pointer rounded-lg border p-4 hover:bg-muted ${
                          plan.recommended ? 'border-primary' : ''
                        }`}
                      >
                        {plan.recommended && (
                          <div className="absolute -top-3 left-4 bg-primary px-2 py-1 text-xs text-primary-foreground rounded">
                            Recommended
                          </div>
                        )}
                        <RadioGroupItem value={plan.id} id={plan.id} className="mt-1" />
                        <div className="ml-3 flex-1">
                          <div className="flex items-baseline justify-between">
                            <h3 className="font-semibold">{plan.name}</h3>
                            <p className="font-bold text-lg">{plan.price}</p>
                          </div>
                          <ul className="mt-2 space-y-1">
                            {plan.features.map((feature) => (
                              <li key={feature} className="text-sm text-muted-foreground">
                                • {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
                <p className="text-sm text-center text-muted-foreground">
                  Start with a 14-day free trial. Cancel anytime.
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
              Complete Setup
              <CheckCircle className="ml-2 h-4 w-4" />
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