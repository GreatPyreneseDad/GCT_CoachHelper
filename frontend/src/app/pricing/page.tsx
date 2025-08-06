'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, X, Loader2, AlertCircle } from 'lucide-react';
import { stripeService } from '@/services/api/stripe.service';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

function PricingCardSkeleton() {
  return (
    <Card className="relative">
      <CardHeader>
        <Skeleton className="h-6 w-24 mb-2" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-48 mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

export default function PricingPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['pricing-plans'],
    queryFn: () => stripeService.getPricingPlans(),
  });

  const { data: subscriptionStatus } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: () => stripeService.getSubscriptionStatus(),
    enabled: !!session?.user,
  });

  const handleSelectPlan = async (planId: string) => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/pricing');
      return;
    }

    setLoadingPlan(planId);
    try {
      const { url } = await stripeService.createCheckoutSession(planId);
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      const { url } = await stripeService.createBillingPortalSession();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      alert('Failed to open billing portal. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground">
            Select the perfect plan for your coaching practice
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[...Array(3)].map((_, i) => (
            <PricingCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load pricing plans. Please refresh and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const plans = data?.plans || [];
  const currentPlan = subscriptionStatus?.plan?.toLowerCase();

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground">
          Select the perfect plan for your coaching practice
        </p>
        {subscriptionStatus?.isActive && (
          <Badge className="mt-4" variant="default">
            Current Plan: {subscriptionStatus.plan}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const isProfessional = plan.id === 'professional';

          return (
            <Card 
              key={plan.id} 
              className={`relative ${isProfessional ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {isProfessional && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="default">
                  Most Popular
                </Badge>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </div>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {isCurrentPlan ? (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={handleManageBilling}
                  >
                    Manage Billing
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    variant={isProfessional ? 'default' : 'outline'}
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loadingPlan !== null}
                  >
                    {loadingPlan === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Get Started'
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 text-center text-muted-foreground">
        <p>All plans include a 14-day free trial. No credit card required to start.</p>
        <p className="mt-2">Questions? Contact us at support@gctcoachhelper.com</p>
      </div>
    </div>
  );
}