import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, requireCoach } from '../middleware/auth.middleware';
import { validateWebhookSource, preventWebhookReplay } from '../middleware/webhook-security.middleware';
import { StripeService, PRICING_PLANS } from '../services/stripe.service';
import asyncHandler from 'express-async-handler';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for payment endpoints
const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 checkout attempts per 15 minutes
  message: 'Too many checkout attempts, please try again later',
  skipSuccessfulRequests: false,
});

// Validation schemas
const createCheckoutSchema = z.object({
  planId: z.string(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

// Get pricing plans
router.get('/plans', (req, res) => {
  res.json({
    plans: PRICING_PLANS.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      features: plan.features,
    })),
  });
});

// Create checkout session
router.post('/create-checkout-session', checkoutLimiter, authenticate, requireCoach, asyncHandler(async (req: any, res) => {
  const { planId, successUrl, cancelUrl } = createCheckoutSchema.parse(req.body);

  const plan = PRICING_PLANS.find(p => p.id === planId);
  if (!plan) {
    res.status(400).json({ error: 'Invalid plan' });
    return;
  }

  const defaultSuccessUrl = `${process.env.FRONTEND_URL}/dashboard?subscription=success`;
  const defaultCancelUrl = `${process.env.FRONTEND_URL}/settings/billing?subscription=cancelled`;

  const checkoutUrl = await StripeService.createCheckoutSession(
    req.user.userId,
    plan.stripePriceId,
    successUrl || defaultSuccessUrl,
    cancelUrl || defaultCancelUrl
  );

  res.json({ url: checkoutUrl });
}));

// Create billing portal session
router.post('/create-portal-session', authenticate, requireCoach, asyncHandler(async (req: any, res) => {
  const returnUrl = req.body.returnUrl || `${process.env.FRONTEND_URL}/settings/billing`;

  const portalUrl = await StripeService.createBillingPortalSession(
    req.user.userId,
    returnUrl
  );

  res.json({ url: portalUrl });
}));

// Get subscription status
router.get('/subscription-status', authenticate, requireCoach, asyncHandler(async (req: any, res) => {
  const status = await StripeService.getSubscriptionStatus(req.user.userId);
  res.json(status);
}));

// Webhook endpoint (no auth required)
router.post('/webhook', validateWebhookSource, preventWebhookReplay, asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    res.status(400).json({ error: 'No stripe signature' });
    return;
  }

  // Use raw body for webhook verification
  const result = await StripeService.handleWebhook(
    req.body,
    signature
  );

  res.json(result);
}));

// Cancel subscription
router.post('/cancel-subscription', authenticate, requireCoach, asyncHandler(async (req: any, res) => {
  // This would redirect to Stripe billing portal where they can cancel
  const returnUrl = `${process.env.FRONTEND_URL}/settings/billing`;
  const portalUrl = await StripeService.createBillingPortalSession(
    req.user.userId,
    returnUrl
  );

  res.json({ 
    message: 'Redirecting to billing portal to manage subscription',
    url: portalUrl 
  });
}));

export default router;