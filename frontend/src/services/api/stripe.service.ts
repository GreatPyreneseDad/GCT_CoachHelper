import { apiClient } from '@/lib/api-client';

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}

export interface SubscriptionStatus {
  isActive: boolean;
  status?: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'TRIALING';
  endDate?: string;
  plan?: string;
}

export const stripeService = {
  async getPricingPlans(): Promise<{ plans: PricingPlan[] }> {
    return apiClient.get('/stripe/plans');
  },

  async createCheckoutSession(planId: string): Promise<{ url: string }> {
    const token = await this.getAuthToken();
    
    return apiClient.post('/stripe/create-checkout-session', 
      { planId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  async createBillingPortalSession(): Promise<{ url: string }> {
    const token = await this.getAuthToken();
    
    return apiClient.post('/stripe/create-portal-session', 
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const token = await this.getAuthToken();
    
    return apiClient.get('/stripe/subscription-status', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  async cancelSubscription(): Promise<{ message: string; url: string }> {
    const token = await this.getAuthToken();
    
    return apiClient.post('/stripe/cancel-subscription', 
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  // Helper to get auth token from session/storage
  async getAuthToken(): Promise<string> {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
      if (token) return token;
    }
    
    throw new Error('No authentication token found');
  },
};