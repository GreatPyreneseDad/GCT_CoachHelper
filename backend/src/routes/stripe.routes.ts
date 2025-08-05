import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Stripe payment routes will be implemented here
router.post('/create-checkout-session', authenticate, (req, res) => {
  res.json({ message: 'Stripe checkout endpoint' });
});

export default router;