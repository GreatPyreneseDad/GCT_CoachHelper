import Stripe from 'stripe';
import { prisma } from '../utils/prisma';
import { SubscriptionStatus } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
}

// Define pricing plans
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for new coaches',
    price: 49,
    currency: 'usd',
    interval: 'month',
    features: [
      'Up to 5 clients',
      'Basic coherence tracking',
      'Email support',
      'Assessment tools',
    ],
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For established coaches',
    price: 99,
    currency: 'usd',
    interval: 'month',
    features: [
      'Up to 25 clients',
      'Advanced coherence analytics',
      'Priority support',
      'Custom interventions',
      'Calendar integration',
      'Real-time monitoring',
    ],
    stripePriceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For coaching organizations',
    price: 299,
    currency: 'usd',
    interval: 'month',
    features: [
      'Unlimited clients',
      'Team collaboration',
      'API access',
      'White-label options',
      'Dedicated support',
      'Custom integrations',
    ],
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
  },
];

export class StripeService {
  static async createCustomer(userId: string, email: string, name?: string): Promise<string> {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    });

    // Update coach profile with Stripe customer ID
    await prisma.coach.update({
      where: { userId },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  }

  static async createCheckoutSession(
    userId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { coachProfile: true },
    });

    if (!user || !user.coachProfile) {
      throw new Error('User or coach profile not found');
    }

    let customerId = user.coachProfile.stripeCustomerId;

    // Create customer if doesn't exist
    if (!customerId) {
      customerId = await this.createCustomer(userId, user.email, user.name || undefined);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
      },
      subscription_data: {
        trial_period_days: 14, // 14-day free trial
        metadata: {
          userId,
        },
      },
    });

    return session.url!;
  }

  static async createBillingPortalSession(userId: string, returnUrl: string): Promise<string> {
    const coach = await prisma.coach.findUnique({
      where: { userId },
    });

    if (!coach || !coach.stripeCustomerId) {
      throw new Error('No Stripe customer found');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: coach.stripeCustomerId,
      return_url: returnUrl,
    });

    return session.url;
  }

  static async handleWebhook(
    rawBody: string | Buffer,
    signature: string
  ): Promise<{ received: boolean }> {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      throw new Error('Invalid webhook signature');
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }

  private static async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    if (!userId) return;

    // Session completed, subscription will be created separately
    console.log(`Checkout completed for user ${userId}`);
  }

  private static async handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    // Validate user exists
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: { coachProfile: true }
    });
    
    if (!user || !user.coachProfile) {
      console.error(`Invalid userId in subscription webhook: ${userId}`);
      return;
    }

    const status = this.mapStripeStatus(subscription.status);
    const endDate = new Date(subscription.current_period_end * 1000);

    await prisma.coach.update({
      where: { userId },
      data: {
        subscriptionId: subscription.id,
        subscriptionStatus: status,
        subscriptionEndDate: endDate,
      },
    });
  }

  private static async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = subscription.metadata?.userId;
    if (!userId) return;

    await prisma.coach.update({
      where: { userId },
      data: {
        subscriptionStatus: SubscriptionStatus.CANCELED,
        subscriptionEndDate: new Date(),
      },
    });
  }

  private static async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
    console.log(`Payment succeeded for invoice ${invoice.id}`);
    // Could send receipt email here
  }

  private static async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
    const customerId = invoice.customer as string;
    
    // Find coach by Stripe customer ID
    const coach = await prisma.coach.findUnique({
      where: { stripeCustomerId: customerId },
      include: { user: true },
    });

    if (coach) {
      console.log(`Payment failed for user ${coach.user.email}`);
      // Send payment failed email
      // Update subscription status to PAST_DUE
      await prisma.coach.update({
        where: { id: coach.id },
        data: { subscriptionStatus: SubscriptionStatus.PAST_DUE },
      });
    }
  }

  private static mapStripeStatus(stripeStatus: Stripe.Subscription.Status): SubscriptionStatus {
    switch (stripeStatus) {
      case 'active':
        return SubscriptionStatus.ACTIVE;
      case 'past_due':
        return SubscriptionStatus.PAST_DUE;
      case 'canceled':
      case 'unpaid':
        return SubscriptionStatus.CANCELED;
      case 'trialing':
        return SubscriptionStatus.TRIALING;
      default:
        return SubscriptionStatus.CANCELED;
    }
  }

  static async getSubscriptionStatus(userId: string): Promise<{
    isActive: boolean;
    status?: SubscriptionStatus;
    endDate?: Date;
    plan?: string;
  }> {
    const coach = await prisma.coach.findUnique({
      where: { userId },
    });

    if (!coach || !coach.subscriptionId) {
      return { isActive: false };
    }

    const isActive = coach.subscriptionStatus === SubscriptionStatus.ACTIVE || 
                    coach.subscriptionStatus === SubscriptionStatus.TRIALING;

    // Get current plan details from Stripe if needed
    let plan: string | undefined;
    if (coach.subscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(coach.subscriptionId);
        const priceId = subscription.items.data[0]?.price.id;
        plan = PRICING_PLANS.find(p => p.stripePriceId === priceId)?.name;
      } catch (error) {
        console.error('Error fetching subscription from Stripe:', error);
      }
    }

    return {
      isActive,
      status: coach.subscriptionStatus || undefined,
      endDate: coach.subscriptionEndDate || undefined,
      plan,
    };
  }
}