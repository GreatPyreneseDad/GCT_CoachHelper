'use client';

import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { stripeService } from '@/services/api/stripe.service';
import { useState } from 'react';
import { Loader2, Sparkles, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function SubscriptionBanner() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  
  const { data: status } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: stripeService.getSubscriptionStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const { url } = await stripeService.createCheckoutSession('professional');
      window.location.href = url;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start checkout. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  // Don't show if user already has active subscription or dismissed
  if (status?.isActive || isDismissed) return null;
  
  // Don't show while checking status
  if (status === undefined) return null;
  
  return (
    <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-lg shadow-lg">
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-2 right-2 text-white/80 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-6 w-6 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-lg">Upgrade to Professional</h3>
            <p className="text-sm opacity-90">
              Track unlimited clients, unlock advanced analytics, and get priority support
            </p>
          </div>
        </div>
        
        <Button 
          onClick={handleUpgrade}
          disabled={isLoading}
          className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-6"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              Upgrade Now - $99/mo
            </>
          )}
        </Button>
      </div>
      
      <div className="mt-3 text-xs opacity-75">
        14-day free trial • Cancel anytime • Secure payment via Stripe
      </div>
    </div>
  );
}