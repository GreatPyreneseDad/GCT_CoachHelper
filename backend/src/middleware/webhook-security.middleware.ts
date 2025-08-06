import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';

// Stripe IP ranges (should be kept updated)
// https://stripe.com/docs/ips
const STRIPE_IP_RANGES = [
  '3.18.12.63/32',
  '3.130.192.231/32', 
  '13.235.14.237/32',
  '13.235.122.149/32',
  '18.211.135.69/32',
  '35.154.171.200/32',
  '52.15.183.38/32',
  '54.88.130.119/32',
  '54.88.130.237/32',
  '54.187.174.169/32',
  '54.187.205.235/32',
  '54.187.216.72/32'
];

// Helper to check if IP is in CIDR range
function isIpInRange(ip: string, cidr: string): boolean {
  const [range, bits] = cidr.split('/');
  const mask = ~(2 ** (32 - parseInt(bits)) - 1);
  
  const ipNum = ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
  const rangeNum = range.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
  
  return (ipNum & mask) === (rangeNum & mask);
}

// Middleware to validate webhook requests
export const validateWebhookSource = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Skip in development
  if (process.env.NODE_ENV === 'development') {
    next();
    return;
  }

  // Get client IP
  const clientIp = req.ip || req.socket.remoteAddress || '';
  
  // Check if IP is from Stripe
  const isStripeIp = STRIPE_IP_RANGES.some(range => isIpInRange(clientIp, range));
  
  if (!isStripeIp) {
    console.warn(`Webhook request from unauthorized IP: ${clientIp}`);
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  next();
};

// Middleware to prevent webhook replay attacks
export const preventWebhookReplay = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const eventId = req.headers['stripe-event-id'] as string;
  
  if (!eventId) {
    next();
    return;
  }

  try {
    // Check if we've already processed this event
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { stripeEventId: eventId },
    });

    if (existingEvent) {
      console.log(`Duplicate webhook event detected: ${eventId}`);
      res.status(200).json({ received: true, duplicate: true });
      return;
    }

    // Store the event ID to prevent future replays
    await prisma.webhookEvent.create({
      data: {
        stripeEventId: eventId,
        processedAt: new Date(),
      },
    });

    next();
  } catch (error) {
    console.error('Error in webhook replay prevention:', error);
    next(); // Continue processing even if replay check fails
  }
};